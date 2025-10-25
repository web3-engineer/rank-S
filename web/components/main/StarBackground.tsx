"use client";

import React, { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
// @ts-ignore
import * as random from "maath/random";

// Drei's <Instances> expects a ref whose instanceColor is non-null.
type InstancedMeshWithColors = THREE.InstancedMesh & {
  instanceMatrix: THREE.InstancedBufferAttribute;
  instanceColor: THREE.InstancedBufferAttribute;
};

/**
 * Minimal, sleek Bitcoin network backdrop
 * - Fewer nodes, thinner links, smaller packets
 * - Desaturated cyan/orange palette
 * - Gentle camera drift
 * - No HUD/hex rain/bolts — pure, clean ambience
 */

type Vec3 = [number, number, number];
type Edge = { a: number; b: number; len: number };

const PALETTE = {
  node: "#7ff7ee",          // soft cyan
  nodeAccent: "#ffd199",    // soft orange
  link: "rgba(127, 247, 238, 0.20)",
  linkGlow: "rgba(127, 247, 238, 0.38)",
  tx: "rgba(255, 176, 230, 0.85)", // soft magenta for motion
};

const CONFIG = {
  nodeCount: 48,
  neighbors: 2,      // lighter mesh
  txCount: 60,       // fewer moving dots
  radius: 1.12,
  zJitter: 0.05,
  cameraFov: 52,
  txSpeed: [0.12, 0.22], // min/max
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function buildNetwork() {
  const { nodeCount, neighbors, radius, zJitter } = CONFIG;

  const base = random.inCircle(new Float32Array(nodeCount * 2), { radius: 1.0 });
  const nodes: Vec3[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const x = (base[i * 2] as number) * radius;
    const y = (base[i * 2 + 1] as number) * (radius * 0.58);
    const z = (Math.random() - 0.5) * zJitter;
    nodes.push([x, y, z]);
  }

  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < nodeCount; j++) {
      if (i === j) continue;
      const [ax, ay, az] = nodes[i];
      const [bx, by, bz] = nodes[j];
      const dx = ax - bx, dy = ay - by, dz = az - bz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      dists.push({ j, d });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < neighbors; k++) {
      const j = dists[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ a: i, b: j, len: dists[k].d });
      }
    }
  }
  return { nodes, edges };
}

const NetworkBackground: React.FC = () => {
  const { nodes, edges } = useMemo(buildNetwork, []);
  const txRef = useRef<InstancedMeshWithColors>(null!);

  // edge endpoints for motion
  const edgePoints = useMemo(
      () =>
          edges.map((e) => {
            const A = nodes[e.a];
            const B = nodes[e.b];
            return { A, B };
          }),
      [edges, nodes]
  );

  // transactions (tiny, fewer, slower)
  const txState = useMemo(() => {
    const [minS, maxS] = CONFIG.txSpeed;
    return new Array(CONFIG.txCount).fill(0).map(() => {
      const edgeIndex = Math.floor(Math.random() * edgePoints.length);
      const speed = minS + Math.random() * (maxS - minS);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const t = Math.random();
      return { edgeIndex, speed, dir, t };
    });
  }, [edgePoints.length]);

  useFrame((_, delta) => {
    if (!txRef.current) return;
    const m = new THREE.Matrix4();
    const s = new THREE.Vector3(1, 1, 1);
    const q = new THREE.Quaternion();
    for (let i = 0; i < txState.length; i++) {
      const tx = txState[i];
      tx.t += delta * tx.speed * 0.28 * tx.dir;
      if (tx.t > 1 || tx.t < 0) {
        tx.t = (tx.t + 1) % 1;
        tx.edgeIndex = Math.floor(Math.random() * edgePoints.length);
        tx.dir = Math.random() < 0.5 ? 1 : -1;
      }
      const { A, B } = edgePoints[tx.edgeIndex];
      const x = lerp(A[0], B[0], tx.t);
      const y = lerp(A[1], B[1], tx.t);
      const z = lerp(A[2], B[2], tx.t);
      // very subtle size easing
      const scale = 0.8 + Math.sin(tx.t * Math.PI) * 0.25;
      s.setScalar(scale);
      m.compose(new THREE.Vector3(x, y, z), q, s);
      txRef.current.setMatrixAt(i, m);
    }
    txRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
      <group>
        {/* links */}
        {edges.map((e, idx) => {
          const A = nodes[e.a];
          const B = nodes[e.b];
          return (
              <group key={idx}>
                <Line points={[A, B]} color={PALETTE.link} lineWidth={0.6} transparent />
                <Line points={[A, B]} color={PALETTE.linkGlow} lineWidth={0.35} transparent />
              </group>
          );
        })}

        {/* nodes (smaller + occasional accent) */}
        <Instances limit={nodes.length} position={[0, 0, 0]}>
          <sphereGeometry args={[0.008, 10, 10]} />
          <meshBasicMaterial color={PALETTE.node} />
          {nodes.map((p, i) => (
              <Instance key={i} position={p} scale={i % 12 === 0 ? 1.35 : 1} />
          ))}
        </Instances>

        {/* moving packets */}
        <Instances ref={txRef} limit={CONFIG.txCount} position={[0, 0, 0]}>
          <sphereGeometry args={[0.0045, 10, 10]} />
          <meshBasicMaterial color={PALETTE.tx} />
          {new Array(CONFIG.txCount).fill(0).map((_, i) => (
              <Instance key={i} position={[0, 0, 0]} />
          ))}
        </Instances>
      </group>
  );
};

const CameraDrift: React.FC = () => {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.12;
    camera.position.x = Math.sin(t) * 0.05;
    camera.position.y = Math.cos(t * 0.9) * 0.035;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const BitcoinWebCanvas = () => {
  return (
      <div className="fixed inset-0 -z-10 pointer-events-none select-none">
        {/* ultra-soft vignette */}
        <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                  "radial-gradient(900px 700px at 70% 35%, rgba(127,247,238,0.10), rgba(0,0,0,0) 55%), linear-gradient(180deg, #06070a 0%, #040508 100%)",
            }}
        />
        <Canvas camera={{ position: [0, 0, 1.42], fov: CONFIG.cameraFov }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            <CameraDrift />
            <NetworkBackground />
          </Suspense>
        </Canvas>
      </div>
  );
};

export default BitcoinWebCanvas;
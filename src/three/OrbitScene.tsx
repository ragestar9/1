import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "../lib/motion";

export interface SceneChannel {
  /** 0..1 progress of the hosting section through the viewport */
  progress: number;
}

/**
 * Second scene: a wireframe torus-knot "engine" with three satellite
 * octahedra. Local scroll progress spins the rig; global scroll velocity
 * agitates the satellites.
 */
export default function OrbitScene({ channel }: { channel: SceneChannel }) {
  const rig = useRef<THREE.Group>(null!);
  const knot = useRef<THREE.Mesh>(null!);
  const sats = useRef<(THREE.Mesh | null)[]>([]);

  const knotGeo = useMemo(() => new THREE.TorusKnotGeometry(1.05, 0.34, 220, 26), []);
  const satGeo = useMemo(() => new THREE.OctahedronGeometry(0.14, 0), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const p = channel.progress;
    const v = Math.min(Math.abs(motion.velocity) / 5000, 1);

    rig.current.rotation.y += dt * (0.08 + v * 0.5);
    rig.current.rotation.x += ((p * Math.PI + motion.spy * 0.3) - rig.current.rotation.x) * 0.07;
    rig.current.rotation.z += ((motion.spx * 0.25) - rig.current.rotation.z) * 0.06;

    knot.current.rotation.x = t * 0.16;
    const mat = knot.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 + p * 0.45 + v * 0.2;

    for (let i = 0; i < 3; i++) {
      const s = sats.current[i];
      if (!s) continue;
      const a = t * (0.35 + i * 0.17) + p * Math.PI * 2 + (i * Math.PI * 2) / 3;
      const r = 2.1 + i * 0.36;
      s.position.set(
        Math.cos(a) * r,
        Math.sin(a * 1.3) * (0.5 + v * 0.9),
        Math.sin(a) * r
      );
      s.rotation.x = a * 1.4;
      s.rotation.y = a;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#08080a", 6, 12]} />
      <group ref={rig}>
        <mesh ref={knot} geometry={knotGeo}>
          <meshBasicMaterial color="#c8ff2e" wireframe transparent opacity={0.6} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={satGeo} ref={(el) => { sats.current[i] = el; }}>
            <meshBasicMaterial color="#e6e6ea" wireframe transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </>
  );
}

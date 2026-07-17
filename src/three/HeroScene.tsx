import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "../lib/motion";

/**
 * Wireframe icosahedron whose vertices are displaced by scroll velocity,
 * wrapped in a drifting particle shell and two slow orbit rings.
 * Reads only from the mutable motion store — zero React re-renders.
 */

const tmp = new THREE.Vector3();

function DisplacedCore() {
  const mesh = useRef<THREE.Mesh>(null!);
  const pts = useRef<THREE.Points>(null!);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.72, 3), []);
  const base = useMemo(
    () => Float32Array.from(geo.attributes.position.array as Float32Array),
    [geo]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const v = Math.min(Math.abs(motion.velocity) / 5200, 1);
    const amp = 0.055 + v * 0.42;
    const f1 = 1.35;
    const f2 = 3.1;
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const n =
        Math.sin(bx * f1 + t * 1.15) *
          Math.sin(by * f1 * 1.25 + t * 0.9) *
          Math.sin(bz * f1 * 0.85 + t * 0.7) +
        0.5 * Math.sin(bx * f2 - t * 1.6) * Math.sin(by * f2 + t * 1.2);
      const s = 1 + amp * n;
      pos.setXYZ(i, bx * s, by * s, bz * s);
    }
    pos.needsUpdate = true;

    const breathe = 1 + Math.sin(t * 0.8) * 0.015 + v * 0.05;
    mesh.current.scale.setScalar(breathe);
    pts.current.scale.setScalar(breathe);
    mesh.current.rotation.z = t * 0.04;
    pts.current.rotation.z = t * 0.04;

    const mat = mesh.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.55 + v * 0.45;
  });

  return (
    <>
      <mesh ref={mesh} geometry={geo}>
        <meshBasicMaterial color="#c8ff2e" wireframe transparent opacity={0.62} />
      </mesh>
      <points ref={pts} geometry={geo}>
        <pointsMaterial
          color="#e6e6ea"
          size={0.028}
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
      {/* inner occluder for depth */}
      <mesh geometry={geo} scale={0.985}>
        <meshBasicMaterial color="#08080a" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </>
  );
}

function ParticleShell({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // hollow shell distribution
      tmp
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(2.6 + Math.random() * 3.4);
      arr[i * 3] = tmp.x;
      arr[i * 3 + 1] = tmp.y;
      arr[i * 3 + 2] = tmp.z;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.02 + motion.docProgress * 0.9;
    ref.current.rotation.x = Math.sin(t * 0.06) * 0.12 + motion.spy * 0.15;
    ref.current.rotation.z += dt * Math.min(Math.abs(motion.velocity) / 24000, 0.12);
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#c8ff2e"
        size={0.02}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function OrbitRing({ radius, tilt, speed, opacity }: { radius: number; tilt: number; speed: number; opacity: number }) {
  const ref = useRef<THREE.LineLoop>(null!);
  const geo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame(({ clock }) => {
    ref.current.rotation.z = clock.elapsedTime * speed;
    ref.current.rotation.x = tilt + motion.spy * 0.1;
  });

  return (
    <lineLoop ref={ref} geometry={geo}>
      <lineBasicMaterial color="#3a3a44" transparent opacity={opacity} />
    </lineLoop>
  );
}

export default function HeroScene() {
  const group = useRef<THREE.Group>(null!);
  const light = motion.touch ? 420 : 900;

  useFrame((_, dt) => {
    const g = group.current;
    const v = Math.min(Math.abs(motion.velocity) / 6000, 1);
    g.rotation.y += dt * (0.05 + v * 0.6);
    g.rotation.x += ((motion.spy * 0.42 + motion.docProgress * 0.6) - g.rotation.x) * 0.06;
    g.position.x += (motion.spx * 0.35 - g.position.x) * 0.05;
  });

  return (
    <>
      <fog attach="fog" args={["#08080a", 7, 13]} />
      <group ref={group}>
        <DisplacedCore />
        <ParticleShell count={light} />
        <OrbitRing radius={2.65} tilt={1.12} speed={0.05} opacity={0.9} />
        <OrbitRing radius={3.35} tilt={1.45} speed={-0.035} opacity={0.5} />
      </group>
    </>
  );
}

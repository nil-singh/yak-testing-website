import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 300;

export default function Particles({ nightMode }) {
  const ref = useRef();

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities[i * 3] = (Math.random() - 0.5) * 0.3;
      velocities[i * 3 + 1] = nightMode ? -Math.random() * 0.5 - 0.2 : (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      sizes[i] = Math.random() * 0.06 + 0.02;
    }
    return { positions, velocities, sizes };
  }, [nightMode]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      pos.array[i * 3] += velocities[i * 3] * dt;
      pos.array[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      pos.array[i * 3 + 2] += velocities[i * 3 + 2] * dt;

      // Wrap around
      if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = 8;
      if (pos.array[i * 3 + 1] > 9) pos.array[i * 3 + 1] = 0.5;
      if (Math.abs(pos.array[i * 3]) > 12) pos.array[i * 3] *= -0.5;
      if (Math.abs(pos.array[i * 3 + 2]) > 12) pos.array[i * 3 + 2] *= -0.5;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={nightMode ? 0.06 : 0.04}
        color={nightMode ? "#c8d8f0" : "#ffe066"}
        transparent opacity={nightMode ? 0.6 : 0.8}
        sizeAttenuation depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

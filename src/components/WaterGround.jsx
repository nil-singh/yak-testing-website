import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";

export default function WaterGround({ nightMode }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current?.material) {
      ref.current.material.roughness = 0.15 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={nightMode ? 60 : 35}
        roughness={0.2}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={nightMode ? "#050510" : "#0c1a1a"}
        metalness={0.5}
        mirror={0.6}
      />
    </mesh>
  );
}

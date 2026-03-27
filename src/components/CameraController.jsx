import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function CameraController({ focusTarget, onFocusComplete }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const targetPos = useRef(new THREE.Vector3(5, 3, 7));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    if (focusTarget) {
      const pos = focusTarget.position || [0, 0, 0];
      targetLook.current.set(pos[0], pos[1] + 0.5, pos[2]);
      targetPos.current.set(pos[0] + 3, pos[1] + 2, pos[2] + 4);
      isAnimating.current = true;
    }
  }, [focusTarget]);

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return;

    camera.position.lerp(targetPos.current, 0.04);
    controlsRef.current.target.lerp(targetLook.current, 0.04);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      isAnimating.current = false;
      onFocusComplete?.();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan enableZoom enableRotate
      minDistance={1.5} maxDistance={25}
      minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.05}
      dampingFactor={0.06} enableDamping
      target={[0, 0.5, 0]}
    />
  );
}

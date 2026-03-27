import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Html, DragControls } from "@react-three/drei";
import * as THREE from "three";

export default function GLBModel({ config, selected, onSelect, dragEnabled }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(config.url);
  const { actions, mixer } = useAnimations(animations, groupRef);
  const [hovered, setHovered] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  useEffect(() => {
    if (config.autoAnimate && actions) {
      const names = Object.keys(actions);
      if (names.length > 0) {
        actions[names[0]]?.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      }
    }
    scene.traverse((c) => {
      if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
    });
  }, [actions, scene, config.autoAnimate]);

  useEffect(() => {
    if (selected) {
      const timer = setTimeout(() => setShowAnnotation(true), 600);
      return () => clearTimeout(timer);
    }
    setShowAnnotation(false);
  }, [selected]);

  useFrame((_, dt) => {
    if (mixer) mixer.update(dt);
    if (!groupRef.current) return;

    const targetY = config.position[1] + (hovered && !selected ? 0.12 : 0);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y, targetY, 0.08
    );
  });

  const inner = (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <primitive object={scene} scale={config.scale} />

      {/* Glow ring on select */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.6, 0.85, 64]} />
          <meshBasicMaterial color="#4de8cc" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover outline ring */}
      {hovered && !selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.7, 0.75, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Annotation */}
      {showAnnotation && (
        <Html position={[0, 2.2, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(16,16,28,0.9)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(12px)",
            minWidth: 140, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4de8cc", fontFamily: "Outfit" }}>
              {config.label}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a72", fontFamily: "IBM Plex Mono", marginTop: 3 }}>
              {config.tag}
            </div>
          </div>
        </Html>
      )}
    </group>
  );

  if (dragEnabled) {
    return <DragControls autoTransform>{inner}</DragControls>;
  }
  return inner;
}

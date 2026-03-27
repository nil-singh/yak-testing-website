import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Stars, Cloud, Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import GLBModel from "./GLBModel";
import WaterGround from "./WaterGround";
import Particles from "./Particles";
import CameraController from "./CameraController";
import PostFX from "./PostFX";
import { MODELS } from "../models";

export default function Scene({ selectedId, onSelect, nightMode, dragEnabled, focusModel }) {
  const sunRef = useRef();
  const fillRef = useRef();

  // Animate lighting transition
  useFrame((_, dt) => {
    if (sunRef.current) {
      const targetIntensity = nightMode ? 0.3 : 2.2;
      const targetColor = nightMode ? new THREE.Color("#2244aa") : new THREE.Color("#fff5e6");
      const targetPos = nightMode ? [2, 4, 3] : [8, 12, 6];
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, targetIntensity, 0.03);
      sunRef.current.color.lerp(targetColor, 0.03);
      sunRef.current.position.lerp(new THREE.Vector3(...targetPos), 0.03);
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(
        fillRef.current.intensity, nightMode ? 0.15 : 0.4, 0.03
      );
    }
  });

  return (
    <>
      {/* Env map */}
      <Environment preset={nightMode ? "night" : "city"} background={false} />

      {/* Stars — visible more at night */}
      <Stars
        radius={60} depth={50} count={nightMode ? 3000 : 800}
        factor={nightMode ? 5 : 2} saturation={0.3} fade speed={0.3}
      />

      {/* Clouds */}
      <Cloud
        position={[0, 10, -8]} speed={0.15} width={20} depth={3}
        segments={20} opacity={nightMode ? 0.08 : 0.2}
        color={nightMode ? "#1a1a3a" : "#ccddee"}
      />
      <Cloud
        position={[8, 12, -12]} speed={0.1} width={15} depth={2}
        segments={15} opacity={nightMode ? 0.06 : 0.15}
        color={nightMode ? "#1a1a3a" : "#bbccdd"}
      />

      {/* Lighting */}
      <directionalLight
        ref={sunRef}
        position={[8, 12, 6]} intensity={2.2} color="#fff5e6"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30} shadow-camera-left={-10}
        shadow-camera-right={10} shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#4466aa" />
      <pointLight position={[0, 5, -5]} intensity={nightMode ? 1.5 : 0.6} color="#4de8cc" distance={20} />
      <ambientLight ref={fillRef} intensity={0.4} />

      {/* Accent light for night */}
      {nightMode && (
        <pointLight position={[-4, 2, 4]} intensity={0.8} color="#e86c4d" distance={12} />
      )}

      {/* Ground */}
      <WaterGround nightMode={nightMode} />

      <Grid
        position={[0, 0.005, 0]} args={[40, 40]}
        cellSize={0.5} cellThickness={0.4} cellColor={nightMode ? "#0e0e1e" : "#1a2a2a"}
        sectionSize={2} sectionThickness={0.8} sectionColor={nightMode ? "#1a1a30" : "#2a3a3a"}
        fadeDistance={20} fadeStrength={1} followCamera={false} infiniteGrid
      />

      <ContactShadows
        position={[0, 0.01, 0]} opacity={nightMode ? 0.3 : 0.5}
        scale={20} blur={2.5} color="#000"
      />

      {/* Particles */}
      <Particles nightMode={nightMode} />

      {/* Models */}
      {MODELS.map((m) => (
        <Suspense key={m.id} fallback={null}>
          <GLBModel
            config={m}
            selected={selectedId === m.id}
            onSelect={() => onSelect(m.id)}
            dragEnabled={dragEnabled}
          />
        </Suspense>
      ))}

      {/* Camera */}
      <CameraController focusTarget={focusModel} />

      {/* Post-processing */}
      <PostFX nightMode={nightMode} />

      {/* Fog */}
      <fog attach="fog" args={[nightMode ? "#040410" : "#0a1210", 12, nightMode ? 28 : 35]} />
    </>
  );
}

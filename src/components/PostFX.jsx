import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";

export default function PostFX({ nightMode }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={nightMode ? 1.2 : 0.5}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={0.01}
        focalLength={0.08}
        bokehScale={nightMode ? 3 : 1.5}
      />
      <Vignette eskil={false} offset={0.1} darkness={nightMode ? 0.8 : 0.4} />
    </EffectComposer>
  );
}

import { useRef } from "react";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { MODELS } from "../models";

export default function Minimap() {
  const miniCamRef = useRef();
  const { gl, scene } = useThree();
  const renderTarget = useRef(
    new THREE.WebGLRenderTarget(280, 280, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })
  );
  const canvasRef = useRef(null);

  useFrame(() => {
    if (!miniCamRef.current) return;
    const rt = renderTarget.current;
    gl.setRenderTarget(rt);
    gl.render(scene, miniCamRef.current);
    gl.setRenderTarget(null);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const pixels = new Uint8Array(rt.width * rt.height * 4);
      gl.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, pixels);

      const imageData = ctx.createImageData(rt.width, rt.height);
      // Flip Y
      for (let y = 0; y < rt.height; y++) {
        for (let x = 0; x < rt.width; x++) {
          const srcIdx = ((rt.height - 1 - y) * rt.width + x) * 4;
          const dstIdx = (y * rt.width + x) * 4;
          imageData.data[dstIdx] = pixels[srcIdx];
          imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
          imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
          imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  });

  return (
    <>
      {/* Orthographic camera looking down */}
      <OrthographicCamera
        ref={miniCamRef}
        makeDefault={false}
        position={[0, 15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        zoom={12}
        near={0.1}
        far={50}
      />

      {/* HTML canvas for minimap display */}
      <htmlContent>
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          style={{ width: "100%", height: "100%", borderRadius: 12 }}
        />
      </htmlContent>
    </>
  );
}

/* Simpler minimap using dots */
export function MinimapOverlay({ models }) {
  return (
    <div className="minimap">
      <svg viewBox="-10 -10 20 20" style={{ width: "100%", height: "100%", background: "rgba(6,6,12,0.95)" }}>
        {/* Grid */}
        <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />

        {/* Model dots */}
        {models.map((m) => (
          <g key={m.id}>
            <circle
              cx={m.position[0]}
              cy={-m.position[2]}
              r={0.5}
              fill="#4de8cc"
              opacity={0.7}
            />
            <text
              x={m.position[0]}
              y={-m.position[2] + 1.3}
              textAnchor="middle"
              fill="#5a5a72"
              fontSize="0.9"
              fontFamily="IBM Plex Mono"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* Center marker */}
        <circle cx="0" cy="0" r="0.2" fill="#e86c4d" opacity={0.8} />
      </svg>
    </div>
  );
}

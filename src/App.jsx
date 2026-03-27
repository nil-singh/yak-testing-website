import { useState, useCallback, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import { MinimapOverlay } from "./components/Minimap";
import { MODELS } from "./models";

function LoadingOverlay({ visible }) {
  return (
    <div className={`loading-overlay ${visible ? "" : "hidden"}`}>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-text">Loading scene...</div>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const canvasRef = useRef();

  const selectedModel = MODELS.find((m) => m.id === selectedId);

  // Camera fly-to on select
  const focusModel = selectedModel || null;

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <>
      <LoadingOverlay visible={!loaded} />
      {flashVisible && <div className="screenshot-flash" />}

      {/* ── Info card ── */}
      {selectedModel && (
        <div className="info-card" key={selectedModel.id}>
          <h3>{selectedModel.label}</h3>
          <p>{selectedModel.description}</p>
          <span className="info-tag">{selectedModel.tag}</span>
        </div>
      )}

      {/* ── Minimap ── */}
      <MinimapOverlay models={MODELS} />

      {/* ── Bottom model bar ── */}
      <div className="model-bar">
        {MODELS.map((m) => (
          <button
            key={m.id}
            className={`model-btn ${selectedId === m.id ? "active" : ""}`}
            onClick={() => handleSelect(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="hint">
        Drag to orbit · Scroll to zoom · Click model to focus
        {dragEnabled && " · Drag models to move"}
      </div>

      {/* ── 3D Canvas ── */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 3, 7], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        style={{ position: "fixed", inset: 0 }}
        onCreated={() => setTimeout(() => setLoaded(true), 2000)}
      >
        <color attach="background" args={[nightMode ? "#040410" : "#06080c"]} />
        <Suspense fallback={null}>
          <Scene
            selectedId={selectedId}
            onSelect={handleSelect}
            nightMode={nightMode}
            dragEnabled={dragEnabled}
            focusModel={focusModel}
          />
        </Suspense>
      </Canvas>
    </>
  );
}

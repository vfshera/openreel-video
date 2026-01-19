import { useEngineStore } from "../engine-store";

type EngineStoreState = ReturnType<typeof useEngineStore.getState>;

type EngineType<K extends keyof EngineStoreState> =
  EngineStoreState[K] extends () => infer T ? NonNullable<T> : never;

export function withEngine<T, R>(
  getEngine: () => T | null,
  engineName: string,
  operation: (engine: T) => R,
): R | null {
  const engine = getEngine();
  if (!engine) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`${engineName} not initialized`);
    }
    return null;
  }
  return operation(engine);
}

export function withTitleEngine<R>(
  operation: (engine: EngineType<"getTitleEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getTitleEngine,
    "TitleEngine",
    operation,
  );
}

export function withGraphicsEngine<R>(
  operation: (engine: EngineType<"getGraphicsEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getGraphicsEngine,
    "GraphicsEngine",
    operation,
  );
}

export function withSubtitleEngine<R>(
  operation: (engine: EngineType<"getSubtitleEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getSubtitleEngine,
    "SubtitleEngine",
    operation,
  );
}

export function withVideoEngine<R>(
  operation: (engine: EngineType<"getVideoEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getVideoEngine,
    "VideoEngine",
    operation,
  );
}

export function withAudioEngine<R>(
  operation: (engine: EngineType<"getAudioEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getAudioEngine,
    "AudioEngine",
    operation,
  );
}

export function withPhotoEngine<R>(
  operation: (engine: EngineType<"getPhotoEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getPhotoEngine,
    "PhotoEngine",
    operation,
  );
}

export function withExportEngine<R>(
  operation: (engine: EngineType<"getExportEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getExportEngine,
    "ExportEngine",
    operation,
  );
}

export function withMaskEngine<R>(
  operation: (engine: EngineType<"getMaskEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getMaskEngine,
    "MaskEngine",
    operation,
  );
}

export function withChromaKeyEngine<R>(
  operation: (engine: EngineType<"getChromaKeyEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getChromaKeyEngine,
    "ChromaKeyEngine",
    operation,
  );
}

export function withMultiCamEngine<R>(
  operation: (engine: EngineType<"getMultiCamEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getMultiCamEngine,
    "MultiCamEngine",
    operation,
  );
}

export function withTemplateEngine<R>(
  operation: (engine: EngineType<"getTemplateEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getTemplateEngine,
    "TemplateEngine",
    operation,
  );
}

export function withSoundLibraryEngine<R>(
  operation: (engine: EngineType<"getSoundLibraryEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getSoundLibraryEngine,
    "SoundLibraryEngine",
    operation,
  );
}

export function withSpeechToTextEngine<R>(
  operation: (engine: EngineType<"getSpeechToTextEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getSpeechToTextEngine,
    "SpeechToTextEngine",
    operation,
  );
}

export function withNestedSequenceEngine<R>(
  operation: (engine: EngineType<"getNestedSequenceEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getNestedSequenceEngine,
    "NestedSequenceEngine",
    operation,
  );
}

export function withAdjustmentLayerEngine<R>(
  operation: (engine: EngineType<"getAdjustmentLayerEngine">) => R,
): R | null {
  return withEngine(
    useEngineStore.getState().getAdjustmentLayerEngine,
    "AdjustmentLayerEngine",
    operation,
  );
}

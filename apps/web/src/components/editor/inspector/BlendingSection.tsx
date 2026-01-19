import React, { useCallback, useMemo } from "react";
import { Layers } from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";
import {
  getAvailableBlendModes,
  getBlendModeName,
  type BlendMode,
} from "@openreel/core";

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "%" }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-secondary">{label}</span>
        <span className="text-[10px] font-mono text-text-primary">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-background-tertiary rounded-full relative overflow-hidden">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute top-0 left-0 h-full bg-text-secondary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm pointer-events-none transition-all"
          style={{ left: `calc(${percentage}% - 5px)` }}
        />
      </div>
    </div>
  );
};

interface BlendingSectionProps {
  clipId: string;
}

export const BlendingSection: React.FC<BlendingSectionProps> = ({ clipId }) => {
  const {
    getClip,
    getTextClip,
    getShapeClip,
    getSVGClip,
    getStickerClip,
    updateClipBlendMode,
    updateClipBlendOpacity,
    project,
  } = useProjectStore();

  const clip = useMemo(() => {
    const regularClip = getClip(clipId);
    if (regularClip) return regularClip;
    const textClip = getTextClip(clipId);
    if (textClip) return textClip;
    const shapeClip = getShapeClip(clipId);
    if (shapeClip) return shapeClip;
    const svgClip = getSVGClip(clipId);
    if (svgClip) return svgClip;
    const stickerClip = getStickerClip(clipId);
    if (stickerClip) return stickerClip;
    return null;
  }, [
    clipId,
    getClip,
    getTextClip,
    getShapeClip,
    getSVGClip,
    getStickerClip,
    project.modifiedAt,
  ]);

  const blendMode = clip?.blendMode || "normal";
  const blendOpacity = clip?.blendOpacity ?? 100;

  const availableBlendModes = useMemo(() => getAvailableBlendModes(), []);

  const handleBlendModeChange = useCallback(
    (mode: BlendMode) => {
      updateClipBlendMode(clipId, mode);
    },
    [clipId, updateClipBlendMode],
  );

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      updateClipBlendOpacity(clipId, opacity);
    },
    [clipId, updateClipBlendOpacity],
  );

  if (!clip) {
    return (
      <div className="text-center py-8 text-text-muted text-xs">
        No clip selected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <Layers size={12} />
        <span className="text-[10px] font-medium">Layer Blending</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-text-secondary">Blend Mode</span>
          <select
            value={blendMode}
            onChange={(e) => handleBlendModeChange(e.target.value as BlendMode)}
            className="w-full px-3 py-2 text-sm text-text-primary bg-background-tertiary border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
          >
            {availableBlendModes.map((mode) => (
              <option key={mode} value={mode}>
                {getBlendModeName(mode)}
              </option>
            ))}
          </select>
          <p className="text-[9px] text-text-muted">
            {blendMode === "normal" && "Default blending, no special effect"}
            {blendMode === "multiply" && "Darkens by multiplying colors"}
            {blendMode === "screen" && "Lightens by screening colors"}
            {blendMode === "overlay" && "Combines multiply and screen"}
            {blendMode === "darken" && "Keeps darker pixels"}
            {blendMode === "lighten" && "Keeps lighter pixels"}
            {blendMode === "color-dodge" && "Brightens base color"}
            {blendMode === "color-burn" && "Darkens base color"}
            {blendMode === "hard-light" && "Strong contrast effect"}
            {blendMode === "soft-light" && "Subtle contrast effect"}
            {blendMode === "difference" && "Subtracts colors"}
            {blendMode === "exclusion" && "Similar to difference but softer"}
          </p>
        </div>

        <Slider
          label="Opacity"
          value={blendOpacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          step={1}
          unit="%"
        />
      </div>

      {blendMode !== "normal" && (
        <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-[9px] text-text-muted">
            <span className="text-primary font-medium">Tip:</span> Blend modes
            affect how this layer combines with layers below it. Experiment with
            different modes for creative effects.
          </p>
        </div>
      )}
    </div>
  );
};

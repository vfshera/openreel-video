import React, { useCallback, useMemo } from "react";
import { Image, Palette } from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";
import type { GraphicAnimation, GraphicAnimationType } from "@openreel/core";
import { SVG_ANIMATION_PRESETS } from "@openreel/core";

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] text-text-secondary">{label}</span>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-border cursor-pointer"
      />
      <span className="text-[10px] font-mono text-text-muted uppercase">
        {value}
      </span>
    </div>
  </div>
);

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min = 0, max = 1, step = 0.1 }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-secondary">{label}</span>
        <span className="text-[10px] font-mono text-text-primary">
          {value.toFixed(step < 1 ? 1 : 0)}
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

const ANIMATION_PRESETS = SVG_ANIMATION_PRESETS.map((preset) => ({
  value: preset.id,
  label: preset.name,
  description: preset.description,
}));

interface SVGSectionProps {
  clipId: string;
}

export const SVGSection: React.FC<SVGSectionProps> = ({ clipId }) => {
  const { getSVGClipById, updateSVGClip, project } = useProjectStore();

  const svgClip = useMemo(
    () => getSVGClipById(clipId),
    [clipId, getSVGClipById, project.modifiedAt],
  );

  const colorStyle = svgClip?.colorStyle || {
    colorMode: "none" as const,
    tintColor: "#ffffff",
    tintOpacity: 1,
  };

  const entryAnimation = svgClip?.entryAnimation;
  const exitAnimation = svgClip?.exitAnimation;

  const handleColorModeChange = useCallback(
    (mode: "none" | "tint" | "replace") => {
      if (!svgClip) {
        console.warn(`[SVGSection] No SVG clip found for ${clipId}`);
        return;
      }
      const newColorStyle = {
        ...colorStyle,
        colorMode: mode,
      };
      updateSVGClip(clipId, {
        colorStyle: newColorStyle,
      });
    },
    [clipId, svgClip, colorStyle, updateSVGClip],
  );

  const handleTintColorChange = useCallback(
    (color: string) => {
      if (!svgClip) return;
      updateSVGClip(clipId, {
        colorStyle: {
          ...colorStyle,
          tintColor: color,
        },
      });
    },
    [clipId, svgClip, colorStyle, updateSVGClip],
  );

  const handleTintOpacityChange = useCallback(
    (opacity: number) => {
      if (!svgClip) return;
      updateSVGClip(clipId, {
        colorStyle: {
          ...colorStyle,
          tintOpacity: opacity,
        },
      });
    },
    [clipId, svgClip, colorStyle, updateSVGClip],
  );

  const handleEntryAnimationChange = useCallback(
    (type: GraphicAnimationType) => {
      if (!svgClip) {
        console.warn(`[SVGSection] No SVG clip found for ${clipId}`);
        return;
      }
      const animation: GraphicAnimation = {
        type,
        duration: entryAnimation?.duration || 0.5,
        easing: entryAnimation?.easing || "ease-out",
      };
      updateSVGClip(clipId, { entryAnimation: animation });
    },
    [clipId, svgClip, entryAnimation, updateSVGClip],
  );

  const handleExitAnimationChange = useCallback(
    (type: GraphicAnimationType) => {
      if (!svgClip) return;
      const animation: GraphicAnimation = {
        type,
        duration: exitAnimation?.duration || 0.5,
        easing: exitAnimation?.easing || "ease-out",
      };
      updateSVGClip(clipId, { exitAnimation: animation });
    },
    [clipId, svgClip, exitAnimation, updateSVGClip],
  );

  const handleEntryDurationChange = useCallback(
    (duration: number) => {
      if (!svgClip || !entryAnimation) return;
      updateSVGClip(clipId, {
        entryAnimation: { ...entryAnimation, duration },
      });
    },
    [clipId, svgClip, entryAnimation, updateSVGClip],
  );

  const handleExitDurationChange = useCallback(
    (duration: number) => {
      if (!svgClip || !exitAnimation) return;
      updateSVGClip(clipId, {
        exitAnimation: { ...exitAnimation, duration },
      });
    },
    [clipId, svgClip, exitAnimation, updateSVGClip],
  );

  if (!svgClip) {
    return (
      <div className="text-center py-8 text-text-muted text-xs">
        No SVG clip selected
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-2 bg-background-tertiary rounded-lg">
        <div className="p-1.5 bg-background-secondary rounded">
          <Image size={16} />
        </div>
        <div>
          <span className="text-[10px] font-medium text-text-primary">SVG</span>
          <p className="text-[9px] text-text-muted">Vector graphic</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <Palette size={12} />
          <span className="text-[10px] font-medium">Color Style</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-secondary">Mode</span>
            <div className="flex gap-1">
              {(["none", "tint", "replace"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleColorModeChange(mode)}
                  className={`px-2 py-1 text-[9px] rounded capitalize transition-colors ${
                    colorStyle.colorMode === mode
                      ? "bg-primary text-black"
                      : "bg-background-tertiary border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {colorStyle.colorMode !== "none" && (
            <>
              <ColorPicker
                label="Color"
                value={colorStyle.tintColor || "#ffffff"}
                onChange={handleTintColorChange}
              />
              <Slider
                label="Opacity"
                value={colorStyle.tintOpacity || 1}
                onChange={handleTintOpacityChange}
                min={0}
                max={1}
                step={0.1}
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-[10px] font-medium text-text-secondary">
          Entry Animation
        </span>
        <select
          value={entryAnimation?.type || "none"}
          onChange={(e) =>
            handleEntryAnimationChange(e.target.value as GraphicAnimationType)
          }
          className="w-full px-3 py-2 text-sm text-text-primary bg-background-tertiary border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
        >
          {ANIMATION_PRESETS.map((preset) => (
            <option
              key={preset.value}
              value={preset.value}
              title={preset.description}
            >
              {preset.label}
            </option>
          ))}
        </select>

        {entryAnimation && entryAnimation.type !== "none" && (
          <Slider
            label="Duration"
            value={entryAnimation.duration}
            onChange={handleEntryDurationChange}
            min={0.1}
            max={3}
            step={0.1}
          />
        )}
      </div>

      <div className="space-y-4">
        <span className="text-[10px] font-medium text-text-secondary">
          Exit Animation
        </span>
        <select
          value={exitAnimation?.type || "none"}
          onChange={(e) =>
            handleExitAnimationChange(e.target.value as GraphicAnimationType)
          }
          className="w-full px-3 py-2 text-sm text-text-primary bg-background-tertiary border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
        >
          {ANIMATION_PRESETS.map((preset) => (
            <option
              key={preset.value}
              value={preset.value}
              title={preset.description}
            >
              {preset.label}
            </option>
          ))}
        </select>

        {exitAnimation && exitAnimation.type !== "none" && (
          <Slider
            label="Duration"
            value={exitAnimation.duration}
            onChange={handleExitDurationChange}
            min={0.1}
            max={3}
            step={0.1}
          />
        )}
      </div>
    </div>
  );
};

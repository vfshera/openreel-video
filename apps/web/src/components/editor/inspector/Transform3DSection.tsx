import React, { useCallback, useMemo } from "react";
import { Box } from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }) => {
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

interface Transform3DSectionProps {
  clipId: string;
}

export const Transform3DSection: React.FC<Transform3DSectionProps> = ({
  clipId,
}) => {
  const {
    getClip,
    getTextClip,
    getShapeClip,
    getSVGClip,
    getStickerClip,
    updateClipRotate3D,
    updateClipPerspective,
    updateClipTransformStyle,
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

  const rotate3d = clip?.transform.rotate3d ?? { x: 0, y: 0, z: 0 };
  const perspective = clip?.transform.perspective ?? 1000;
  const transformStyle = clip?.transform.transformStyle ?? "flat";

  const handleRotateXChange = useCallback(
    (x: number) => {
      updateClipRotate3D(clipId, { ...rotate3d, x });
    },
    [clipId, rotate3d, updateClipRotate3D],
  );

  const handleRotateYChange = useCallback(
    (y: number) => {
      updateClipRotate3D(clipId, { ...rotate3d, y });
    },
    [clipId, rotate3d, updateClipRotate3D],
  );

  const handleRotateZChange = useCallback(
    (z: number) => {
      updateClipRotate3D(clipId, { ...rotate3d, z });
    },
    [clipId, rotate3d, updateClipRotate3D],
  );

  const handlePerspectiveChange = useCallback(
    (value: number) => {
      updateClipPerspective(clipId, value);
    },
    [clipId, updateClipPerspective],
  );

  const handleTransformStyleChange = useCallback(
    (style: "flat" | "preserve-3d") => {
      updateClipTransformStyle(clipId, style);
    },
    [clipId, updateClipTransformStyle],
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
        <Box size={12} />
        <span className="text-[10px] font-medium">3D Transforms</span>
      </div>

      <div className="space-y-3">
        <Slider
          label="Rotation X"
          value={rotate3d.x}
          onChange={handleRotateXChange}
          min={-360}
          max={360}
          step={1}
          unit="°"
        />

        <Slider
          label="Rotation Y"
          value={rotate3d.y}
          onChange={handleRotateYChange}
          min={-360}
          max={360}
          step={1}
          unit="°"
        />

        <Slider
          label="Rotation Z"
          value={rotate3d.z}
          onChange={handleRotateZChange}
          min={-360}
          max={360}
          step={1}
          unit="°"
        />

        <Slider
          label="Perspective"
          value={perspective}
          onChange={handlePerspectiveChange}
          min={100}
          max={2000}
          step={10}
          unit="px"
        />

        <div className="space-y-1">
          <span className="text-[10px] text-text-secondary">
            Transform Style
          </span>
          <select
            value={transformStyle}
            onChange={(e) =>
              handleTransformStyleChange(
                e.target.value as "flat" | "preserve-3d",
              )
            }
            className="w-full px-3 py-2 text-sm text-text-primary bg-background-tertiary border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
          >
            <option value="flat">Flat</option>
            <option value="preserve-3d">Preserve 3D</option>
          </select>
          <p className="text-[9px] text-text-muted">
            {transformStyle === "flat" &&
              "Flattens children into the plane of this element"}
            {transformStyle === "preserve-3d" &&
              "Children positioned in 3D space"}
          </p>
        </div>
      </div>

      {(rotate3d.x !== 0 || rotate3d.y !== 0 || rotate3d.z !== 0) && (
        <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-[9px] text-text-muted">
            <span className="text-primary font-medium">Tip:</span> 3D rotations
            allow you to rotate layers along X, Y, and Z axes for depth effects.
            Adjust perspective to control the 3D depth perception.
          </p>
        </div>
      )}
    </div>
  );
};

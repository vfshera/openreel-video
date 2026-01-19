import React from "react";
import { Crop, RotateCcw } from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";
import { useUIStore } from "../../../stores/ui-store";
import type { Clip } from "@openreel/core";

interface CropSectionProps {
  clip: Clip;
}

export const CropSection: React.FC<CropSectionProps> = ({ clip }) => {
  const updateClipTransform = useProjectStore(
    (state) => state.updateClipTransform,
  );
  const setCropMode = useUIStore((state) => state.setCropMode);

  const crop = clip.transform.crop || { x: 0, y: 0, width: 1, height: 1 };
  const isCropped =
    crop.x !== 0 || crop.y !== 0 || crop.width !== 1 || crop.height !== 1;

  const handleReset = () => {
    updateClipTransform(clip.id, { crop: undefined });
  };

  const handleEnableCropMode = () => {
    setCropMode(true, clip.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop size={14} className="text-text-secondary" />
          <span className="text-xs font-medium text-text-primary">Crop</span>
        </div>
        {isCropped && (
          <button
            onClick={handleReset}
            className="p-1 hover:bg-background-secondary rounded transition-colors"
            title="Reset crop"
          >
            <RotateCcw size={12} className="text-text-muted" />
          </button>
        )}
      </div>

      <button
        onClick={handleEnableCropMode}
        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-black rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Crop size={14} />
        {isCropped ? "Adjust Crop" : "Crop Video"}
      </button>

      {isCropped && (
        <div className="text-[9px] text-text-muted space-y-0.5 p-2 bg-background-tertiary rounded border border-border">
          <div className="flex justify-between">
            <span>Crop Region:</span>
            <span>
              {Math.round(crop.width * 100)}% × {Math.round(crop.height * 100)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Position:</span>
            <span>
              ({Math.round(crop.x * 100)}%, {Math.round(crop.y * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

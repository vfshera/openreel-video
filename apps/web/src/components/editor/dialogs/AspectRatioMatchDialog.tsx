import React from "react";
import { Maximize2, X } from "lucide-react";

interface AspectRatioMatchDialogProps {
  videoWidth: number;
  videoHeight: number;
  currentWidth: number;
  currentHeight: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AspectRatioMatchDialog: React.FC<AspectRatioMatchDialogProps> = ({
  videoWidth,
  videoHeight,
  currentWidth,
  currentHeight,
  onConfirm,
  onCancel,
}) => {
  const videoAspect = (videoWidth / videoHeight).toFixed(2);
  const currentAspect = (currentWidth / currentHeight).toFixed(2);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background-secondary border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Maximize2 size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Match Video Dimensions?
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            The video you're adding has different dimensions than your current
            project settings.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary">
              <div>
                <div className="text-xs text-text-tertiary mb-1">
                  Video Dimensions
                </div>
                <div className="text-sm font-medium text-text-primary">
                  {videoWidth} × {videoHeight}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  Aspect Ratio: {videoAspect}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary/50 border border-border/50">
              <div>
                <div className="text-xs text-text-tertiary mb-1">
                  Current Project
                </div>
                <div className="text-sm font-medium text-text-primary">
                  {currentWidth} × {currentHeight}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  Aspect Ratio: {currentAspect}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-tertiary">
            Updating the project dimensions will provide the best editing
            experience and prevent cropping during export.
          </p>
        </div>

        <div className="flex gap-3 p-4 border-t border-border bg-background-tertiary/30">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-background-secondary border border-border hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            Keep Current
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors text-sm font-medium shadow-lg shadow-primary/20"
          >
            Match Video
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from "react";
import {
  Smartphone,
  Monitor,
  Square,
  ChevronRight,
  Check,
  Info,
} from "lucide-react";
import { useProjectStore } from "../../stores/project-store";
import {
  SOCIAL_MEDIA_PRESETS,
  SOCIAL_MEDIA_CATEGORY_INFO,
  createProjectSettingsFromPreset,
  type SocialMediaCategory,
} from "@openreel/core";

interface StartFromScratchProps {
  onProjectCreated?: () => void;
}

interface PresetGroup {
  platform: string;
  presets: SocialMediaCategory[];
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    platform: "Vertical (9:16)",
    presets: [
      "tiktok",
      "instagram-reels",
      "instagram-stories",
      "youtube-shorts",
    ],
  },
  {
    platform: "Square (1:1)",
    presets: ["instagram-post", "facebook"],
  },
  {
    platform: "Horizontal (16:9)",
    presets: ["youtube-video", "twitter", "linkedin"],
  },
  {
    platform: "Other",
    presets: ["pinterest", "custom"],
  },
];

const PRESET_ICONS: Record<string, React.ElementType> = {
  "Vertical (9:16)": Smartphone,
  "Square (1:1)": Square,
  "Horizontal (16:9)": Monitor,
  Other: Square,
};

export const StartFromScratch: React.FC<StartFromScratchProps> = ({
  onProjectCreated,
}) => {
  const createNewProject = useProjectStore((state) => state.createNewProject);
  const updateSettings = useProjectStore((state) => state.updateSettings);
  const [selectedPreset, setSelectedPreset] =
    useState<SocialMediaCategory>("youtube-video");
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const preset = SOCIAL_MEDIA_PRESETS[selectedPreset];
  const info = SOCIAL_MEDIA_CATEGORY_INFO.find((c) => c.id === selectedPreset);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);

    const settings = createProjectSettingsFromPreset(preset);
    createNewProject(projectName.trim() || `${info?.name || "New"} Project`);
    await updateSettings(settings);

    setTimeout(() => {
      setIsCreating(false);
      onProjectCreated?.();
    }, 100);
  }, [
    createNewProject,
    updateSettings,
    preset,
    projectName,
    info,
    onProjectCreated,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-2">
          Project Name
        </h3>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My Awesome Video"
          className="w-full max-w-md px-4 py-2.5 text-sm bg-background-tertiary border border-border rounded-lg focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted transition-all"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-primary mb-4">
          Select Format
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {PRESET_GROUPS.map((group) => {
            const GroupIcon = PRESET_ICONS[group.platform] || Square;

            return (
              <div key={group.platform} className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                  <GroupIcon size={14} />
                  <span>{group.platform}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {group.presets.map((presetId) => {
                    const presetInfo = SOCIAL_MEDIA_CATEGORY_INFO.find(
                      (c) => c.id === presetId,
                    );
                    const presetData = SOCIAL_MEDIA_PRESETS[presetId];
                    const isSelected = selectedPreset === presetId;

                    return (
                      <button
                        key={presetId}
                        onClick={() => setSelectedPreset(presetId)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-border-hover hover:bg-background-tertiary"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} className="text-black" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {presetInfo?.name || presetId}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {presetData.width}×{presetData.height}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-background-tertiary rounded-xl border border-border">
        <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-text-primary">
            {info?.name || selectedPreset} Format
          </p>
          <p className="text-xs text-text-muted mt-1">
            {preset.width}×{preset.height}px • {preset.frameRate || 30}fps
            {preset.maxDuration && ` • Max ${preset.maxDuration}s`}
            {preset.recommendedDuration &&
              ` • Recommended ${preset.recommendedDuration}s`}
          </p>
          {preset.safeZone && (
            <p className="text-xs text-text-muted mt-0.5">
              Safe zone: {preset.safeZone.top}px top, {preset.safeZone.bottom}px
              bottom
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="px-6 py-2.5 bg-primary text-black text-sm font-medium rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Project
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StartFromScratch;

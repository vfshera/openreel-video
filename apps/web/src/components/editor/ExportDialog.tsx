import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Settings,
  Monitor,
  Archive,
  Globe,
  Music,
  Star,
  Play,
  Clock,
  HardDrive,
  Video,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  exportPresetsManager,
  type PlatformExportPreset,
} from "../../services/export-presets";
import type { VideoExportSettings, UpscaleQuality } from "@openreel/core";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: VideoExportSettings) => void;
  duration?: number;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  YouTube: <Video size={16} />,
  Instagram: <Share2 size={16} />,
  Twitter: <Share2 size={16} />,
  TikTok: <Music size={16} />,
  Facebook: <Share2 size={16} />,
  LinkedIn: <Share2 size={16} />,
  Broadcast: <Monitor size={16} />,
  Web: <Globe size={16} />,
  Archive: <Archive size={16} />,
  Audio: <Music size={16} />,
  Custom: <Settings size={16} />,
};

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  duration = 0,
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] =
    useState<PlatformExportPreset | null>(null);
  const [presets, setPresets] = useState<PlatformExportPreset[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const [customSettings, setCustomSettings] = useState<VideoExportSettings>({
    format: "mp4",
    codec: "h264",
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 15000,
    bitrateMode: "vbr",
    quality: 90,
    keyframeInterval: 60,
    audioSettings: {
      format: "aac",
      sampleRate: 48000,
      bitDepth: 16,
      bitrate: 256,
      channels: 2,
    },
    upscaling: {
      enabled: false,
      quality: "balanced",
      sharpening: 0.3,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setPresets(exportPresetsManager.getAllPresets());
      setPlatforms(exportPresetsManager.getPlatforms());
    }
  }, [isOpen]);

  const filteredPresets = selectedPlatform
    ? presets.filter((p) => p.platform === selectedPlatform)
    : exportPresetsManager.getRecommendedPresets();

  const handleExport = useCallback(() => {
    const settings =
      activeTab === "presets" && selectedPreset
        ? (selectedPreset.settings as VideoExportSettings)
        : customSettings;
    onExport(settings);
    onClose();
  }, [activeTab, selectedPreset, customSettings, onExport, onClose]);

  const formatFileSize = (bitrate: number, durationSec: number): string => {
    const bytes = (bitrate * 1000 * durationSec) / 8;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[85vh] bg-background-secondary rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-tertiary">
          <div className="flex items-center gap-3">
            <Download size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">
              Export Video
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
              activeTab === "presets"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Star size={16} />
            Presets
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
              activeTab === "custom"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Settings size={16} />
            Custom
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {activeTab === "presets" ? (
            <>
              <div className="w-48 border-r border-border overflow-y-auto">
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className={`w-full flex items-center gap-2 p-3 text-sm transition-colors ${
                    selectedPlatform === null
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-text-secondary hover:bg-background-tertiary"
                  }`}
                >
                  <Star size={14} />
                  Recommended
                </button>
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`w-full flex items-center gap-2 p-3 text-sm transition-colors ${
                      selectedPlatform === platform
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-text-secondary hover:bg-background-tertiary"
                    }`}
                  >
                    {PLATFORM_ICONS[platform] || <Globe size={14} />}
                    {platform}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedPreset?.id === preset.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {PLATFORM_ICONS[preset.platform]}
                          <span className="font-medium text-text-primary">
                            {preset.name}
                          </span>
                        </div>
                        {preset.recommended && (
                          <Star
                            size={12}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted mb-2">
                        {preset.description}
                      </p>
                      {"width" in preset.settings && (
                        <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                          <span>
                            {(preset.settings as VideoExportSettings).width}x
                            {(preset.settings as VideoExportSettings).height}
                          </span>
                          <span>
                            {(preset.settings as VideoExportSettings).frameRate}
                            fps
                          </span>
                          <span>{preset.aspectRatio}</span>
                        </div>
                      )}
                      {preset.maxDuration && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-yellow-500">
                          <Clock size={10} />
                          Max {preset.maxDuration}s
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Format
                  </label>
                  <select
                    value={customSettings.format}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        format: e.target.value as "mp4" | "webm" | "mov",
                      })
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="mov">MOV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Codec
                  </label>
                  <select
                    value={customSettings.codec}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        codec: e.target.value as VideoExportSettings["codec"],
                      })
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                  >
                    <option value="h264">H.264</option>
                    <option value="h265">H.265 (HEVC)</option>
                    <option value="prores">ProRes</option>
                    <option value="vp9">VP9</option>
                    <option value="av1">AV1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Resolution
                  </label>
                  <select
                    value={`${customSettings.width}x${customSettings.height}`}
                    onChange={(e) => {
                      const [w, h] = e.target.value.split("x").map(Number);
                      setCustomSettings({
                        ...customSettings,
                        width: w,
                        height: h,
                      });
                    }}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                  >
                    <option value="3840x2160">4K (3840x2160)</option>
                    <option value="2560x1440">2K (2560x1440)</option>
                    <option value="1920x1080">1080p (1920x1080)</option>
                    <option value="1280x720">720p (1280x720)</option>
                    <option value="854x480">480p (854x480)</option>
                    <option value="1080x1920">Vertical 1080p</option>
                    <option value="1080x1080">Square 1080</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Frame Rate
                  </label>
                  <select
                    value={customSettings.frameRate}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        frameRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                  >
                    <option value={24}>24 fps</option>
                    <option value={25}>25 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={50}>50 fps</option>
                    <option value={60}>60 fps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Bitrate (kbps)
                  </label>
                  <input
                    type="number"
                    value={customSettings.bitrate}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        bitrate: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                    min={1000}
                    max={150000}
                    step={1000}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Quality
                  </label>
                  <input
                    type="range"
                    value={customSettings.quality}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        quality: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min={50}
                    max={100}
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Smaller</span>
                    <span>{customSettings.quality}%</span>
                    <span>Better</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Audio Settings
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={customSettings.audioSettings.format}
                      onChange={(e) =>
                        setCustomSettings({
                          ...customSettings,
                          audioSettings: {
                            ...customSettings.audioSettings,
                            format: e.target.value as
                              | "mp3"
                              | "wav"
                              | "aac"
                              | "flac"
                              | "ogg",
                          },
                        })
                      }
                      className="px-2 py-1.5 bg-background-tertiary border border-border rounded text-xs text-text-primary"
                    >
                      <option value="aac">AAC</option>
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                    </select>
                    <select
                      value={customSettings.audioSettings.sampleRate}
                      onChange={(e) =>
                        setCustomSettings({
                          ...customSettings,
                          audioSettings: {
                            ...customSettings.audioSettings,
                            sampleRate: Number(e.target.value) as
                              | 44100
                              | 48000
                              | 96000,
                          },
                        })
                      }
                      className="px-2 py-1.5 bg-background-tertiary border border-border rounded text-xs text-text-primary"
                    >
                      <option value={44100}>44.1 kHz</option>
                      <option value={48000}>48 kHz</option>
                      <option value={96000}>96 kHz</option>
                    </select>
                    <select
                      value={customSettings.audioSettings.bitrate}
                      onChange={(e) =>
                        setCustomSettings({
                          ...customSettings,
                          audioSettings: {
                            ...customSettings.audioSettings,
                            bitrate: Number(e.target.value),
                          },
                        })
                      }
                      className="px-2 py-1.5 bg-background-tertiary border border-border rounded text-xs text-text-primary"
                    >
                      <option value={128}>128 kbps</option>
                      <option value={192}>192 kbps</option>
                      <option value={256}>256 kbps</option>
                      <option value={320}>320 kbps</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2 border-t border-border pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" />
                      <label className="text-xs font-medium text-text-secondary">
                        Enhance Quality (Upscaling)
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomSettings({
                          ...customSettings,
                          upscaling: {
                            ...customSettings.upscaling!,
                            enabled: !customSettings.upscaling?.enabled,
                          },
                        })
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        customSettings.upscaling?.enabled
                          ? "bg-primary"
                          : "bg-background-tertiary border border-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          customSettings.upscaling?.enabled
                            ? "translate-x-5"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {customSettings.upscaling?.enabled && (
                    <div className="space-y-3 pl-6">
                      <div>
                        <label className="block text-[10px] text-text-muted mb-1.5">
                          Quality Mode
                        </label>
                        <div className="flex gap-2">
                          {(["fast", "balanced", "quality"] as const).map(
                            (mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  setCustomSettings({
                                    ...customSettings,
                                    upscaling: {
                                      ...customSettings.upscaling!,
                                      quality: mode as UpscaleQuality,
                                    },
                                  })
                                }
                                className={`flex-1 px-2 py-1.5 text-[10px] rounded border transition-colors ${
                                  customSettings.upscaling?.quality === mode
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-text-secondary hover:border-primary/50"
                                }`}
                              >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-text-muted mb-1.5">
                          Sharpening
                        </label>
                        <input
                          type="range"
                          value={Math.round(
                            (customSettings.upscaling?.sharpening ?? 0.3) * 100,
                          )}
                          onChange={(e) =>
                            setCustomSettings({
                              ...customSettings,
                              upscaling: {
                                ...customSettings.upscaling!,
                                sharpening: Number(e.target.value) / 100,
                              },
                            })
                          }
                          className="w-full"
                          min={0}
                          max={100}
                        />
                        <div className="flex justify-between text-[10px] text-text-muted">
                          <span>None</span>
                          <span>
                            {Math.round(
                              (customSettings.upscaling?.sharpening ?? 0.3) *
                                100,
                            )}
                            %
                          </span>
                          <span>Max</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-text-muted">
                        Enhance quality when exporting to higher resolutions
                        than source. Uses edge-directed interpolation for
                        sharper details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border bg-background-tertiary">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            {duration > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDuration(duration)}
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive size={12} />~
                  {formatFileSize(
                    activeTab === "presets" && selectedPreset
                      ? (selectedPreset.settings as VideoExportSettings)
                          .bitrate || 8000
                      : customSettings.bitrate,
                    duration,
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={activeTab === "presets" && !selectedPreset}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              Start Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

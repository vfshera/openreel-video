import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Volume2, Lock, Trash2 } from "lucide-react";
import type { Track } from "@openreel/core";
import { useProjectStore } from "../../../stores/project-store";
import { getTrackInfo } from "./utils";

interface TrackHeaderProps {
  track: Track;
  index: number;
  onDragStart: (e: React.DragEvent, trackId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetTrackId: string) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { lockTrack, hideTrack, muteTrack, removeTrack } = useProjectStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const trackInfo = getTrackInfo(track, index);
  const TrackIcon = trackInfo.icon;
  const isVisual =
    track.type === "video" ||
    track.type === "image" ||
    track.type === "text" ||
    track.type === "graphics";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleRemoveTrack = async () => {
    setShowContextMenu(false);
    await removeTrack(track.id);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, track.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, track.id)}
        onContextMenu={handleContextMenu}
        className={`h-20 border-b border-border flex items-center px-3 justify-between relative group transition-colors cursor-grab active:cursor-grabbing ${
          track.hidden ? "opacity-50" : ""
        } ${
          track.locked ? "bg-background-secondary/50" : "bg-background-tertiary"
        }`}
      >
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-bold ${trackInfo.textColor}`}>
            {track.name || trackInfo.label}
          </span>
          <div className="flex gap-1 text-text-muted">
            <TrackIcon size={10} />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          {isVisual && (
            <button
              onClick={() => hideTrack(track.id, !track.hidden)}
              className={`p-1 rounded hover:bg-background-elevated ${
                track.hidden ? "text-yellow-500" : ""
              }`}
              title={track.hidden ? "Show track" : "Hide track"}
            >
              {track.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          )}
          <button
            onClick={() => muteTrack(track.id, !track.muted)}
            className={`p-1 rounded hover:bg-background-elevated ${
              track.muted ? "text-red-500" : ""
            }`}
            title={track.muted ? "Unmute" : "Mute"}
          >
            <Volume2 size={12} />
          </button>
          <button
            onClick={() => lockTrack(track.id, !track.locked)}
            className={`p-1 rounded hover:bg-background-elevated ${
              track.locked ? "text-yellow-500" : ""
            }`}
            title={track.locked ? "Unlock" : "Lock"}
          >
            <Lock size={12} />
          </button>
          <button
            onClick={handleRemoveTrack}
            className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-red-400"
            title="Delete track"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div
          className={`absolute left-0 w-1 h-full ${trackInfo.color} opacity-50 group-hover:opacity-100 transition-opacity`}
        />
      </div>

      {showContextMenu && (
        <div
          className="fixed z-50 bg-background-secondary border border-border rounded-lg shadow-xl py-1 min-w-[150px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            onClick={handleRemoveTrack}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-background-elevated flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete Track
          </button>
        </div>
      )}
    </>
  );
};

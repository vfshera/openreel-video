import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { formatTimecode } from "./utils";
import {
  getBeatSyncBridge,
  type BeatSyncState,
} from "../../../bridges/beat-sync-bridge";

interface TimeRulerProps {
  duration: number;
  pixelsPerSecond: number;
  scrollX: number;
  viewportWidth: number;
  onSeek: (time: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
}

export const TimeRuler: React.FC<TimeRulerProps> = ({
  pixelsPerSecond,
  scrollX,
  viewportWidth,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [beatState, setBeatState] = useState<BeatSyncState>(() =>
    getBeatSyncBridge().getState(),
  );

  useEffect(() => {
    const bridge = getBeatSyncBridge();
    const unsubscribe = bridge.subscribe(setBeatState);
    return unsubscribe;
  }, []);

  const visibleStart = scrollX / pixelsPerSecond;
  const visibleEnd = (scrollX + viewportWidth) / pixelsPerSecond;

  const visibleBeatMarkers = useMemo(() => {
    if (beatState.beatMarkers.length === 0) return [];
    const buffer = 1;
    return beatState.beatMarkers.filter(
      (marker) =>
        marker.time >= visibleStart - buffer &&
        marker.time <= visibleEnd + buffer,
    );
  }, [beatState.beatMarkers, visibleStart, visibleEnd]);

  const getTickInterval = () => {
    if (pixelsPerSecond > 200) return 0.1;
    if (pixelsPerSecond > 100) return 0.5;
    if (pixelsPerSecond > 50) return 1;
    if (pixelsPerSecond > 20) return 5;
    return 10;
  };

  const tickInterval = getTickInterval();
  const startTick = Math.floor(visibleStart / tickInterval) * tickInterval;
  const ticks: number[] = [];

  for (let t = startTick; t <= visibleEnd + tickInterval; t += tickInterval) {
    ticks.push(t);
  }

  const scrollXRef = useRef(scrollX);
  scrollXRef.current = scrollX;

  const getTimeFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const grandparent = rulerRef.current?.parentElement?.parentElement;
      if (!grandparent) return 0;
      const rect = grandparent.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollXRef.current;
      return Math.max(0, x / pixelsPerSecond);
    },
    [pixelsPerSecond],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      onScrubStart?.();
      const time = getTimeFromEvent(e);
      onSeek(time);
    },
    [getTimeFromEvent, onSeek, onScrubStart],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const time = getTimeFromEvent(e);
      onSeek(time);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onScrubEnd?.();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, getTimeFromEvent, onSeek, onScrubEnd]);

  return (
    <div
      ref={rulerRef}
      className={`h-8 border-b border-border flex items-end relative bg-background-secondary select-none ${
        isDragging ? "cursor-grabbing" : "cursor-pointer"
      }`}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
    >
      {ticks.map((time) => (
        <div
          key={time}
          className="absolute border-l border-border h-3 text-[9px] font-mono text-text-muted pl-1 pointer-events-none"
          style={{ left: `${time * pixelsPerSecond}px` }}
        >
          {formatTimecode(time).slice(3)}
        </div>
      ))}

      {visibleBeatMarkers.map((marker) => (
        <div
          key={`beat-ruler-${marker.index}`}
          className={`absolute bottom-0 pointer-events-none ${
            marker.isDownbeat
              ? "w-[2px] h-5 bg-orange-500"
              : "w-px h-3 bg-orange-400/50"
          }`}
          style={{ left: `${marker.time * pixelsPerSecond}px` }}
        />
      ))}

      {beatState.beatAnalysis && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-orange-500/20 px-2 py-0.5 rounded text-[9px] text-orange-400 font-medium pointer-events-none">
          <span className="opacity-70">♪</span>
          <span>{beatState.beatAnalysis.bpm} BPM</span>
        </div>
      )}
    </div>
  );
};

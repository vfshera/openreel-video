import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Clipboard, Trash2, Scissors } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Clip } from "@openreel/core";
import { useProjectStore } from "../../../stores/project-store";
import { useTimelineStore } from "../../../stores/timeline-store";

interface ClipContextMenuProps {
  clip: Clip;
  x: number;
  y: number;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export const ClipContextMenu: React.FC<ClipContextMenuProps> = ({
  clip,
  x,
  y,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { copyClips, duplicateClip, removeClip, rippleDeleteClip, splitClip } =
    useProjectStore();
  const { playheadPosition } = useTimelineStore();

  const isPlayheadOnClip =
    playheadPosition >= clip.startTime &&
    playheadPosition <= clip.startTime + clip.duration;

  const handleCopy = () => {
    copyClips([clip.id]);
    onClose();
  };

  const handleDuplicate = async () => {
    await duplicateClip(clip.id);
    onClose();
  };

  const handleDelete = async () => {
    await removeClip(clip.id);
    onClose();
  };

  const handleRippleDelete = async () => {
    await rippleDeleteClip(clip.id);
    onClose();
  };

  const handleSplit = async () => {
    if (isPlayheadOnClip) {
      await splitClip(clip.id, playheadPosition);
    }
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      id: "copy",
      label: "Copy",
      icon: Copy,
      shortcut: "⌘C",
      onClick: handleCopy,
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: Clipboard,
      shortcut: "⌘D",
      onClick: handleDuplicate,
    },
    {
      id: "ripple-delete",
      label: "Ripple Delete",
      icon: Trash2,
      shortcut: "⌫",
      onClick: handleRippleDelete,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
    },
    {
      id: "separator-1",
      label: "",
      onClick: () => {},
      separator: true,
    },
    {
      id: "split",
      label: "Split at Playhead",
      icon: Scissors,
      shortcut: "S",
      onClick: handleSplit,
      disabled: !isPlayheadOnClip,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded-lg bg-background-secondary border border-border shadow-lg py-1 pointer-events-auto"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item) => {
        if (item.separator) {
          return <div key={item.id} className="h-px bg-border my-1" />;
        }

        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-background-tertiary transition-colors ${
              item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {Icon && <Icon size={16} className="text-text-secondary" />}
            <span className="flex-1 text-left text-text-primary">
              {item.label}
            </span>
            {item.shortcut && (
              <span className="text-xs text-text-tertiary">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return createPortal(menu, document.body);
};

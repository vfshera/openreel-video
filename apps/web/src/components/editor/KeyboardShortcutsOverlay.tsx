import React, { useState, useEffect, useCallback } from "react";
import { X, Keyboard, Search, RotateCcw, ChevronDown } from "lucide-react";
import {
  keyboardShortcuts,
  formatKeyComboDisplay,
  type ShortcutCategory,
  type ShortcutDefinition,
} from "../../services/keyboard-shortcuts";

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsOverlay: React.FC<
  KeyboardShortcutsOverlayProps
> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ShortcutCategory | "all"
  >("all");
  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [activePreset, setActivePreset] = useState(
    keyboardShortcuts.getActivePreset(),
  );

  useEffect(() => {
    setShortcuts(keyboardShortcuts.getAllShortcuts());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (editingId) {
          setEditingId(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, editingId]);

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    const matchesCategory =
      activeCategory === "all" || shortcut.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedShortcuts = filteredShortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<ShortcutCategory, ShortcutDefinition[]>,
  );

  const handleShortcutCapture = useCallback(
    (e: React.KeyboardEvent, shortcutId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setEditingId(null);
        return;
      }

      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
        return;
      }

      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("cmd");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());

      const newKey = parts.join("+");
      const conflict = keyboardShortcuts.findConflict(newKey, shortcutId);

      if (conflict) {
        alert(
          `This shortcut conflicts with "${conflict.name}". Choose a different key.`,
        );
        return;
      }

      keyboardShortcuts.setShortcut(shortcutId, newKey);
      setShortcuts(keyboardShortcuts.getAllShortcuts());
      setEditingId(null);
    },
    [],
  );

  const handleResetShortcut = (id: string) => {
    keyboardShortcuts.resetShortcut(id);
    setShortcuts(keyboardShortcuts.getAllShortcuts());
  };

  const handleResetAll = () => {
    if (confirm("Reset all shortcuts to defaults?")) {
      keyboardShortcuts.resetAllShortcuts();
      setShortcuts(keyboardShortcuts.getAllShortcuts());
    }
  };

  const handleApplyPreset = (presetId: string) => {
    keyboardShortcuts.applyPreset(presetId);
    setShortcuts(keyboardShortcuts.getAllShortcuts());
    setActivePreset(presetId);
    setShowPresets(false);
  };

  const categories = keyboardShortcuts.getCategories();
  const presets = keyboardShortcuts.getPresets();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] bg-background-secondary rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-tertiary">
          <div className="flex items-center gap-3">
            <Keyboard size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-9 pr-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-2 px-3 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <span>
                {presets.find((p) => p.id === activePreset)?.name || "Preset"}
              </span>
              <ChevronDown size={14} />
            </button>
            {showPresets && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-background-secondary border border-border rounded-lg shadow-lg z-10">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      activePreset === preset.id
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-[10px] text-text-muted">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <RotateCcw size={14} />
            Reset All
          </button>
        </div>

        <div className="flex gap-2 px-4 py-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-black"
                : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-primary text-black"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
              }`}
            >
              {keyboardShortcuts.getCategoryName(category)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedShortcuts).map(
            ([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  {keyboardShortcuts.getCategoryName(
                    category as ShortcutCategory,
                  )}
                </h3>
                <div className="space-y-1">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-background-tertiary group"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-text-primary">
                          {shortcut.name}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {shortcut.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === shortcut.id ? (
                          <input
                            autoFocus
                            onKeyDown={(e) =>
                              handleShortcutCapture(e, shortcut.id)
                            }
                            placeholder="Press keys..."
                            className="w-32 px-2 py-1 bg-primary/20 border border-primary rounded text-sm text-center text-text-primary focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingId(shortcut.id)}
                            className="min-w-[80px] px-3 py-1.5 bg-background-tertiary border border-border rounded text-sm font-mono text-text-primary hover:border-primary transition-colors"
                          >
                            {formatKeyComboDisplay(shortcut.currentKey)}
                          </button>
                        )}
                        {shortcut.currentKey !== shortcut.defaultKey && (
                          <button
                            onClick={() => handleResetShortcut(shortcut.id)}
                            className="p-1 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Reset to default"
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Keyboard size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No shortcuts found</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-background-tertiary text-center">
          <p className="text-[10px] text-text-muted">
            Click a shortcut key to customize • Press{" "}
            <kbd className="px-1.5 py-0.5 bg-background-secondary border border-border rounded text-[10px]">
              ?
            </kbd>{" "}
            to toggle this overlay
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsOverlay;

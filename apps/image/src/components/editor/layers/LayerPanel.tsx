import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine, Clipboard, ClipboardCopy, Scissors, Paintbrush } from 'lucide-react';
import { useProjectStore } from '../../../stores/project-store';
import type { Layer } from '../../../types/project';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuCheckboxItem,
} from '@openreel/ui';

export function LayerPanel() {
  const {
    project,
    selectedLayerIds,
    selectedArtboardId,
    copiedStyle,
    selectLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    moveLayerToTop,
    moveLayerToBottom,
    copyLayers,
    cutLayers,
    pasteLayers,
    copyLayerStyle,
    pasteLayerStyle,
  } = useProjectStore();

  const artboard = project?.artboards.find((a) => a.id === selectedArtboardId);
  const layers = artboard?.layerIds.map((id) => project?.layers[id]).filter(Boolean) as Layer[] ?? [];

  const handleToggleVisibility = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const handleToggleLock = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const handleDelete = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeLayer(layerId);
  };

  const handleDuplicate = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateLayer(layerId);
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'text':
        return 'T';
      case 'shape':
        return '◆';
      case 'group':
        return '📁';
      default:
        return '•';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-xs font-medium text-foreground">Layers</h3>
        <span className="text-[10px] text-muted-foreground">
          {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-xs text-muted-foreground">No layers yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Add text, shapes, or images
            </p>
          </div>
        ) : (
          <div className="py-1">
            {layers.map((layer) => {
              const isSelected = selectedLayerIds.includes(layer.id);

              return (
                <ContextMenu key={layer.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      onClick={() => selectLayer(layer.id)}
                      className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/20 border-l-2 border-primary'
                          : 'hover:bg-accent border-l-2 border-transparent'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-xs rounded ${
                          layer.type === 'text' ? 'font-bold' : ''
                        }`}
                      >
                        {getLayerIcon(layer.type)}
                      </span>

                      <span
                        className={`flex-1 text-xs truncate ${
                          layer.visible ? 'text-foreground' : 'text-muted-foreground'
                        } ${layer.locked ? 'italic' : ''}`}
                      >
                        {layer.name}
                      </span>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleToggleVisibility(layer, e)}
                          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                          title={layer.visible ? 'Hide' : 'Show'}
                        >
                          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>

                        <button
                          onClick={(e) => handleToggleLock(layer, e)}
                          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                          title={layer.locked ? 'Unlock' : 'Lock'}
                        >
                          {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>

                        <button
                          onClick={(e) => handleDuplicate(layer.id, e)}
                          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>

                        <button
                          onClick={(e) => handleDelete(layer.id, e)}
                          className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => { selectLayer(layer.id); copyLayers(); }}>
                      <ClipboardCopy size={14} className="mr-2" />
                      Copy
                      <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => { selectLayer(layer.id); cutLayers(); }}>
                      <Scissors size={14} className="mr-2" />
                      Cut
                      <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={pasteLayers}>
                      <Clipboard size={14} className="mr-2" />
                      Paste
                      <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => duplicateLayer(layer.id)}>
                      <Copy size={14} className="mr-2" />
                      Duplicate
                      <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => { selectLayer(layer.id); copyLayerStyle(); }}>
                      <Paintbrush size={14} className="mr-2" />
                      Copy Style
                    </ContextMenuItem>
                    <ContextMenuItem onClick={pasteLayerStyle} disabled={!copiedStyle}>
                      <Paintbrush size={14} className="mr-2" />
                      Paste Style
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => moveLayerToTop(layer.id)}>
                      <ArrowUpToLine size={14} className="mr-2" />
                      Bring to Front
                      <ContextMenuShortcut>⌘⇧]</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => moveLayerUp(layer.id)}>
                      <ArrowUp size={14} className="mr-2" />
                      Bring Forward
                      <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => moveLayerDown(layer.id)}>
                      <ArrowDown size={14} className="mr-2" />
                      Send Backward
                      <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => moveLayerToBottom(layer.id)}>
                      <ArrowDownToLine size={14} className="mr-2" />
                      Send to Back
                      <ContextMenuShortcut>⌘⇧[</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuCheckboxItem
                      checked={layer.visible}
                      onCheckedChange={() => updateLayer(layer.id, { visible: !layer.visible })}
                    >
                      {layer.visible ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                      Visible
                    </ContextMenuCheckboxItem>
                    <ContextMenuCheckboxItem
                      checked={layer.locked}
                      onCheckedChange={() => updateLayer(layer.id, { locked: !layer.locked })}
                    >
                      {layer.locked ? <Lock size={14} className="mr-2" /> : <Unlock size={14} className="mr-2" />}
                      Locked
                    </ContextMenuCheckboxItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => removeLayer(layer.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                      <ContextMenuShortcut>⌫</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        )}
      </div>

      {selectedLayerIds.length === 1 && (
        <div className="flex items-center justify-center gap-1 p-2 border-t border-border">
          <button
            onClick={() => moveLayerUp(selectedLayerIds[0])}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Move up (Cmd+])"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => moveLayerDown(selectedLayerIds[0])}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Move down (Cmd+[)"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

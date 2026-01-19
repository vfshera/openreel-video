import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Trash2,
  ChevronRight,
  Film,
  Calendar,
  HardDrive,
} from "lucide-react";

interface RecentProject {
  id: string;
  name: string;
  lastModified: number;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface RecentProjectsProps {
  onProjectSelected?: () => void;
}

const STORAGE_KEY = "openreel-recent-projects";

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  onProjectSelected,
}) => {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const projects = JSON.parse(stored) as RecentProject[];
        setRecentProjects(projects.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to load recent projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectProject = useCallback(
    (_project: RecentProject) => {
      onProjectSelected?.();
    },
    [onProjectSelected],
  );

  const handleRemoveProject = useCallback(
    (projectId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const updated = recentProjects.filter((p) => p.id !== projectId);
      setRecentProjects(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [recentProjects],
  );

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-secondary">
          Loading recent projects...
        </p>
      </div>
    );
  }

  if (recentProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-background-tertiary flex items-center justify-center mb-4">
          <Clock size={24} className="text-text-muted" />
        </div>
        <h3 className="text-base font-medium text-text-primary mb-2">
          No Recent Projects
        </h3>
        <p className="text-sm text-text-muted text-center max-w-md">
          Your recently opened projects will appear here. Start a new project or
          use a template to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">
          Recent Projects ({recentProjects.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {recentProjects.map((project) => (
          <button
            key={project.id}
            onClick={() => handleSelectProject(project)}
            className="group flex items-center gap-4 p-4 bg-background-tertiary rounded-xl border border-border hover:border-border-hover hover:bg-background-elevated transition-all text-left"
          >
            <div className="w-20 h-12 bg-background rounded-lg overflow-hidden flex-shrink-0 border border-border">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={18} className="text-text-muted" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                {project.name}
              </h4>
              <div className="flex items-center gap-4 mt-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <Calendar size={11} />
                  <span>{formatDate(project.lastModified)}</span>
                </div>
                {project.duration && (
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Clock size={11} />
                    <span>{formatDuration(project.duration)}</span>
                  </div>
                )}
                {project.width && project.height && (
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <HardDrive size={11} />
                    <span>
                      {project.width}×{project.height}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleRemoveProject(project.id, e)}
                className="p-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                title="Remove from recent"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight
                size={16}
                className="text-text-muted group-hover:text-primary transition-colors"
              />
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-text-muted text-center pt-4">
        Recent projects are stored locally in your browser
      </p>
    </div>
  );
};

export default RecentProjects;

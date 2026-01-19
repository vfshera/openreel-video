import React, { useState, useCallback, useMemo } from "react";
import {
  X,
  Copy,
  Download,
  FileCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useProjectStore } from "../../stores/project-store";
import { createProjectSerializer, createStorageEngine } from "@openreel/core";
import type { ValidationResult } from "@openreel/core/storage/schema-types";

SyntaxHighlighter.registerLanguage("json", json);

interface ScriptViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "view" | "import";

export const ScriptViewDialog: React.FC<ScriptViewDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { project } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabType>("view");
  const [importJson, setImportJson] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const storage = useMemo(() => createStorageEngine(), []);
  const serializer = useMemo(() => createProjectSerializer(storage), [storage]);

  const exportedJson = useMemo(() => {
    if (!project) return "";
    return serializer.exportToJsonWithMetadata(
      project,
      `Exported from ${project.name}`,
    );
  }, [project, serializer]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [exportedJson]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "project"}-script.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportedJson, project?.name]);

  const handleValidate = useCallback(() => {
    setIsValidating(true);
    try {
      const result = serializer.validateProjectJson(importJson);
      setValidation(result);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  }, [importJson, serializer]);

  const handleImport = useCallback(() => {
    if (!validation?.valid) return;

    try {
      const { project: importedProject } =
        serializer.importFromJsonWithValidation(importJson);
      if (importedProject) {
        useProjectStore.getState().loadProject(importedProject);
        onClose();
      }
    } catch (error) {
      setValidation({
        valid: false,
        errors: [
          `Import error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings: [],
      });
    }
  }, [importJson, validation, serializer, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-background-secondary border border-border rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <FileCode size={20} className="text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Script View
              </h2>
              <p className="text-xs text-text-muted">
                View and import project JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-border">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "view"
                ? "bg-background-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
            }`}
          >
            View & Export
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "import"
                ? "bg-background-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
            }`}
          >
            Import
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "view" && (
            <div className="h-full flex flex-col">
              {/* Actions */}
              <div className="flex gap-2 p-3 border-b border-border">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 bg-background-tertiary hover:bg-background-elevated text-text-primary rounded-lg text-sm transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-background-tertiary hover:bg-background-elevated text-text-primary rounded-lg text-sm transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                <div className="flex-1" />
                <a
                  href="/llm.txt"
                  download="openreel-llm-documentation.txt"
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                >
                  <FileCode size={16} />
                  Download LLM.txt
                </a>
              </div>

              {/* JSON Display */}
              <div className="flex-1 overflow-auto custom-scrollbar p-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter
                    language="json"
                    style={vs2015}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "#1e1e1e",
                      fontSize: "12px",
                    }}
                  >
                    {exportedJson}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="h-full flex flex-col gap-4 p-4">
              {/* Textarea */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  Paste JSON
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste project JSON here..."
                  className="flex-1 p-3 bg-background-tertiary border border-border rounded-lg text-text-primary font-mono text-xs resize-none focus:outline-none focus:border-primary"
                />
              </div>

              {/* Validation Button */}
              <button
                onClick={handleValidate}
                disabled={!importJson || isValidating}
                className="px-4 py-2 bg-background-tertiary hover:bg-background-elevated text-text-primary rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? "Validating..." : "Validate"}
              </button>

              {/* Validation Results */}
              {validation && (
                <div className="space-y-2">
                  {validation.valid && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <CheckCircle2 size={16} className="text-primary" />
                      <span className="text-sm text-primary">
                        Valid JSON - Ready to import
                      </span>
                    </div>
                  )}

                  {validation.errors.length > 0 && (
                    <div className="p-3 bg-error/10 border border-error/30 rounded-lg space-y-1">
                      <div className="flex items-center gap-2 text-error font-medium text-sm">
                        <AlertCircle size={16} />
                        Errors
                      </div>
                      <ul className="list-disc list-inside text-xs text-error/80 space-y-0.5">
                        {validation.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg space-y-1">
                      <div className="flex items-center gap-2 text-warning font-medium text-sm">
                        <AlertTriangle size={16} />
                        Warnings
                      </div>
                      <ul className="list-disc list-inside text-xs text-warning/80 space-y-0.5">
                        {validation.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.missingAssets &&
                    validation.missingAssets.length > 0 && (
                      <div className="p-3 bg-background-tertiary border border-border rounded-lg space-y-1">
                        <div className="text-sm font-medium text-text-secondary">
                          Missing Assets ({validation.missingAssets.length})
                        </div>
                        <p className="text-xs text-text-muted">
                          These assets will be imported as placeholders and can
                          be replaced later.
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!validation?.valid}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={16} className="inline mr-2" />
                Import Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from "react";
import {
  X,
  Upload,
  Link,
  Check,
  Clock,
  Copy,
  Twitter,
  Linkedin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  uploadForSharing,
  getSharePageUrl,
  formatExpiresIn,
  type ShareResult,
} from "../../services/share-service";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoBlob: Blob | null;
  filename: string;
}

type ShareStatus = "idle" | "uploading" | "success" | "error";

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  videoBlob,
  filename,
}) => {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!videoBlob) return;

    setStatus("uploading");
    setProgress(0);
    setError(null);

    try {
      const result = await uploadForSharing(videoBlob, filename, (p) =>
        setProgress(p),
      );
      setShareResult(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }, [videoBlob, filename]);

  const shareUrl = shareResult ? getSharePageUrl(shareResult.shareId) : "";

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleTwitterShare = useCallback(() => {
    const text = "Check out my video!";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  }, [shareUrl]);

  const handleLinkedInShare = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  }, [shareUrl]);

  const handleClose = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setShareResult(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background-secondary rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-tertiary">
          <div className="flex items-center gap-3">
            <Upload size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Share Video</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {status === "idle" && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Link size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-primary font-medium">
                    Create a shareable link
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Link expires in 24 hours
                  </p>
                </div>
              </div>

              <div className="p-3 bg-background-tertiary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary truncate">
                    {filename}
                  </span>
                  <span className="text-xs text-text-muted">
                    {videoBlob
                      ? `${(videoBlob.size / (1024 * 1024)).toFixed(1)} MB`
                      : ""}
                  </span>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!videoBlob}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Share Link
              </button>
            </>
          )}

          {status === "uploading" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
              <div>
                <p className="text-sm text-text-primary font-medium">
                  Uploading video...
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>
              <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "success" && shareResult && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Check size={28} className="text-primary" />
                </div>
                <p className="text-sm text-text-primary font-medium">
                  Link created!
                </p>
              </div>

              <div className="p-3 bg-background-tertiary rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-text-primary outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-background-secondary hover:bg-background-elevated rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <Copy size={16} className="text-text-muted" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <Clock size={14} />
                <span>{formatExpiresIn(shareResult.expiresAt)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTwitterShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors"
                >
                  <Twitter size={16} />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={handleLinkedInShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-lg transition-colors"
                >
                  <Linkedin size={16} />
                  <span className="text-sm">LinkedIn</span>
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-error/10 rounded-full flex items-center justify-center">
                  <AlertCircle size={28} className="text-error" />
                </div>
                <p className="text-sm text-error font-medium">Upload failed</p>
                <p className="text-xs text-text-muted">{error}</p>
              </div>

              <button
                onClick={handleUpload}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {status === "success" && (
          <div className="px-6 py-4 border-t border-border bg-background-tertiary">
            <button
              onClick={handleClose}
              className="w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

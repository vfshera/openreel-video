import type { ExportProgress } from "./types";
type FFmpegInstance = {
  load(options?: {
    coreURL?: string;
    wasmURL?: string;
    workerURL?: string;
  }): Promise<void>;
  writeFile(name: string, data: Uint8Array | string): Promise<void>;
  readFile(name: string): Promise<Uint8Array>;
  deleteFile(name: string): Promise<void>;
  listDir(path: string): Promise<{ name: string; isDir: boolean }[]>;
  exec(args: string[]): Promise<number>;
  on(
    event: string,
    callback: (data: { progress: number; time?: number }) => void,
  ): void;
  off(
    event: string,
    callback?: (data: { progress: number; time?: number }) => void,
  ): void;
  terminate(): void;
};

export interface ProxySettings {
  scale: number;
  preset: "ultrafast" | "fast" | "medium";
  crf: number;
  audioBitrate: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const PROXY_PRESETS: Record<"low" | "medium" | "high", ProxySettings> = {
  low: {
    scale: 0.25,
    preset: "ultrafast",
    crf: 32,
    audioBitrate: 96,
    maxWidth: 960,
    maxHeight: 540,
  },
  medium: {
    scale: 0.5,
    preset: "fast",
    crf: 28,
    audioBitrate: 128,
    maxWidth: 1280,
    maxHeight: 720,
  },
  high: {
    scale: 0.75,
    preset: "medium",
    crf: 23,
    audioBitrate: 192,
    maxWidth: 1920,
    maxHeight: 1080,
  },
};

export const PROXY_THRESHOLDS = {
  /** Minimum pixel count to trigger proxy (4K = 3840 * 2160) */
  minPixelCount: 3840 * 2160,
  minDuration: 600,
  minFileSize: 500 * 1024 * 1024,
};

export interface TranscodeOptions {
  format?: "webm" | "mp4";
  videoCodec?: "libvpx-vp9" | "libx264";
  audioCodec?: "libopus" | "aac";
  videoBitrate?: string;
  audioBitrate?: string;
  enableRowMt?: boolean;
}

const DEFAULT_TRANSCODE_OPTIONS: Required<TranscodeOptions> = {
  format: "webm",
  videoCodec: "libvpx-vp9",
  audioCodec: "libopus",
  videoBitrate: "2M",
  audioBitrate: "128k",
  enableRowMt: true,
};

export class FFmpegFallback {
  private ffmpeg: FFmpegInstance | null = null;
  private loaded = false;
  private loading: Promise<void> | null = null;
  private progressCallback:
    | ((data: { progress: number; time?: number }) => void)
    | null = null;

  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loading) return this.loading;

    this.loading = this.doLoad();
    await this.loading;
  }

  private async doLoad(): Promise<void> {
    try {
      // Dynamic import to support lazy loading
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      this.ffmpeg = new FFmpeg() as unknown as FFmpegInstance;
      // These files need to be served from the public directory
      await this.ffmpeg.load({
        coreURL: "/ffmpeg-core.js",
        wasmURL: "/ffmpeg-core.wasm",
        workerURL: "/ffmpeg-core.worker.js",
      });

      this.loaded = true;
    } catch (error) {
      this.loading = null;
      throw new Error(
        `Failed to load FFmpeg.wasm: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  isLoaded(): boolean {
    return this.loaded && this.ffmpeg !== null;
  }

  private ensureLoaded(): void {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error("FFmpeg not loaded. Call load() first.");
    }
  }

  private async fileToUint8Array(file: File | Blob): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  private async cleanupFiles(filenames: string[]): Promise<void> {
    if (!this.ffmpeg) return;

    for (const filename of filenames) {
      try {
        await this.ffmpeg.deleteFile(filename);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private setupProgressTracking(
    onProgress?: (progress: ExportProgress) => void,
    totalDuration?: number,
  ): void {
    if (!this.ffmpeg || !onProgress) return;
    if (this.progressCallback) {
      this.ffmpeg.off("progress", this.progressCallback);
    }

    this.progressCallback = ({ progress, time }) => {
      let estimatedTimeRemaining = 0;
      if (totalDuration && time && progress > 0) {
        const elapsedTime = time / 1000000;
        const rate = elapsedTime / progress;
        estimatedTimeRemaining = (1 - progress) * rate;
      }

      onProgress({
        phase: progress < 1 ? "encoding" : "complete",
        progress: Math.min(progress, 1),
        currentFrame: 0,
        totalFrames: 0,
        estimatedTimeRemaining,
      });
    };

    this.ffmpeg.on("progress", this.progressCallback);
  }

  private removeProgressTracking(): void {
    if (!this.ffmpeg || !this.progressCallback) return;
    this.ffmpeg.off("progress", this.progressCallback);
    this.progressCallback = null;
  }

  async transcodeToCompatible(
    file: File | Blob,
    onProgress?: (progress: ExportProgress) => void,
    options: TranscodeOptions = {},
  ): Promise<Blob> {
    await this.load();
    this.ensureLoaded();

    const opts = { ...DEFAULT_TRANSCODE_OPTIONS, ...options };
    const inputFilename = "input";
    const outputFilename = `output.${opts.format}`;

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);
      this.setupProgressTracking(onProgress);
      const args = ["-i", inputFilename];

      // Video codec settings
      args.push("-c:v", opts.videoCodec);
      args.push("-b:v", opts.videoBitrate);

      // Enable row-based multi-threading for VP9
      if (opts.videoCodec === "libvpx-vp9" && opts.enableRowMt) {
        args.push("-row-mt", "1");
      }

      // Audio codec settings
      args.push("-c:a", opts.audioCodec);
      args.push("-b:a", opts.audioBitrate);

      // Output file
      args.push(outputFilename);

      await this.ffmpeg!.exec(args);

      const data = await this.ffmpeg!.readFile(outputFilename);
      const mimeType = opts.format === "webm" ? "video/webm" : "video/mp4";

      return new Blob([data.buffer as ArrayBuffer], { type: mimeType });
    } finally {
      this.removeProgressTracking();
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  async transcodeToMp4(
    file: File | Blob,
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    return this.transcodeToCompatible(file, onProgress, {
      format: "mp4",
      videoCodec: "libx264",
      audioCodec: "aac",
      videoBitrate: "5M",
      audioBitrate: "192k",
    });
  }

  async extractAudioAsWav(file: File | Blob): Promise<Blob> {
    await this.load();
    this.ensureLoaded();

    const inputFilename = "input";
    const outputFilename = "output.wav";

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);

      await this.ffmpeg!.exec([
        "-i",
        inputFilename,
        "-vn", // No video
        "-acodec",
        "pcm_f32le", // 32-bit float PCM
        "-ar",
        "48000", // 48kHz sample rate
        "-ac",
        "2", // Stereo
        outputFilename,
      ]);

      const data = await this.ffmpeg!.readFile(outputFilename);
      return new Blob([data.buffer as ArrayBuffer], { type: "audio/wav" });
    } finally {
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  async generateProxy(
    file: File | Blob,
    settings: Partial<ProxySettings> = {},
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    await this.load();
    this.ensureLoaded();
    const opts: ProxySettings = { ...PROXY_PRESETS.medium, ...settings };
    const inputFilename = "input";
    const outputFilename = "proxy.mp4";

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);
      this.setupProgressTracking(onProgress);
      let scaleFilter: string;
      if (opts.maxWidth && opts.maxHeight) {
        // Scale to fit within max dimensions while maintaining aspect ratio
        scaleFilter = `scale='min(${opts.maxWidth},iw*${opts.scale})':'min(${opts.maxHeight},ih*${opts.scale})':force_original_aspect_ratio=decrease`;
      } else {
        scaleFilter = `scale=iw*${opts.scale}:ih*${opts.scale}`;
      }
      scaleFilter += ",pad=ceil(iw/2)*2:ceil(ih/2)*2";

      await this.ffmpeg!.exec([
        "-i",
        inputFilename,
        "-vf",
        scaleFilter,
        "-c:v",
        "libx264",
        "-preset",
        opts.preset,
        "-crf",
        opts.crf.toString(),
        "-c:a",
        "aac",
        "-b:a",
        `${opts.audioBitrate}k`,
        // Fast start for web playback
        "-movflags",
        "+faststart",
        outputFilename,
      ]);

      const data = await this.ffmpeg!.readFile(outputFilename);
      return new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
    } finally {
      this.removeProgressTracking();
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  async generateProxyWithPreset(
    file: File | Blob,
    preset: "low" | "medium" | "high",
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    return this.generateProxy(file, PROXY_PRESETS[preset], onProgress);
  }

  async extractRange(
    file: File | Blob,
    startTime: number,
    endTime: number,
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    await this.load();
    this.ensureLoaded();

    const inputFilename = "input";
    const outputFilename = "output.mp4";
    const duration = endTime - startTime;

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);

      this.setupProgressTracking(onProgress, duration);

      await this.ffmpeg!.exec([
        "-ss",
        startTime.toString(),
        "-i",
        inputFilename,
        "-t",
        duration.toString(),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        outputFilename,
      ]);

      const data = await this.ffmpeg!.readFile(outputFilename);
      return new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
    } finally {
      this.removeProgressTracking();
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  async getMetadata(file: File | Blob): Promise<{
    duration: number;
    width: number;
    height: number;
    hasVideo: boolean;
    hasAudio: boolean;
  }> {
    await this.load();
    this.ensureLoaded();

    const inputFilename = "input";

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);

      // FFmpeg.wasm doesn't expose ffprobe, so metadata extraction
      // is limited. Use MediaBunny for comprehensive metadata.
      try {
        await this.ffmpeg!.exec(["-i", inputFilename, "-f", "null", "-"]);
      } catch {
        // FFmpeg outputs info to stderr during probe
      }
      return {
        duration: 0,
        width: 0,
        height: 0,
        hasVideo: true,
        hasAudio: true,
      };
    } finally {
      await this.cleanupFiles([inputFilename]);
    }
  }

  shouldUseProxy(metadata: {
    width: number;
    height: number;
    duration: number;
    fileSize?: number;
  }): boolean {
    const pixelCount = metadata.width * metadata.height;
    if (pixelCount >= PROXY_THRESHOLDS.minPixelCount) {
      return true;
    }
    if (metadata.duration >= PROXY_THRESHOLDS.minDuration) {
      return true;
    }
    if (
      metadata.fileSize !== undefined &&
      metadata.fileSize >= PROXY_THRESHOLDS.minFileSize
    ) {
      return true;
    }

    return false;
  }

  getRecommendedProxyPreset(metadata: {
    width: number;
    height: number;
  }): "low" | "medium" | "high" {
    const pixelCount = metadata.width * metadata.height;

    // 8K or higher -> low quality proxy
    if (pixelCount >= 7680 * 4320) {
      return "low";
    }

    // 4K -> medium quality proxy
    if (pixelCount >= 3840 * 2160) {
      return "medium";
    }

    // Lower resolutions -> high quality proxy
    return "high";
  }

  async convertAudio(
    file: File | Blob,
    format: "mp3" | "wav" | "aac" | "ogg",
    options: {
      bitrate?: string;
      sampleRate?: number;
      channels?: number;
    } = {},
  ): Promise<Blob> {
    await this.load();
    this.ensureLoaded();

    const inputFilename = "input";
    const outputFilename = `output.${format}`;

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);

      const args = ["-i", inputFilename, "-vn"]; // No video
      switch (format) {
        case "mp3":
          args.push("-c:a", "libmp3lame");
          break;
        case "wav":
          args.push("-c:a", "pcm_s16le");
          break;
        case "aac":
          args.push("-c:a", "aac");
          break;
        case "ogg":
          args.push("-c:a", "libvorbis");
          break;
      }
      if (options.bitrate) {
        args.push("-b:a", options.bitrate);
      }
      if (options.sampleRate) {
        args.push("-ar", options.sampleRate.toString());
      }
      if (options.channels) {
        args.push("-ac", options.channels.toString());
      }

      args.push(outputFilename);

      await this.ffmpeg!.exec(args);

      const data = await this.ffmpeg!.readFile(outputFilename);
      const mimeTypes: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        aac: "audio/aac",
        ogg: "audio/ogg",
      };

      return new Blob([data.buffer as ArrayBuffer], {
        type: mimeTypes[format],
      });
    } finally {
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  async extractFrame(
    file: File | Blob,
    timestamp: number,
    format: "jpg" | "png" = "jpg",
  ): Promise<Blob> {
    await this.load();
    this.ensureLoaded();

    const inputFilename = "input";
    const outputFilename = `frame.${format}`;

    try {
      const inputData = await this.fileToUint8Array(file);
      await this.ffmpeg!.writeFile(inputFilename, inputData);

      await this.ffmpeg!.exec([
        "-ss",
        timestamp.toString(),
        "-i",
        inputFilename,
        "-vframes",
        "1",
        "-q:v",
        "2", // High quality
        outputFilename,
      ]);

      const data = await this.ffmpeg!.readFile(outputFilename);
      const mimeType = format === "png" ? "image/png" : "image/jpeg";

      return new Blob([data.buffer as ArrayBuffer], { type: mimeType });
    } finally {
      await this.cleanupFiles([inputFilename, outputFilename]);
    }
  }

  terminate(): void {
    if (this.ffmpeg) {
      this.removeProgressTracking();
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.loaded = false;
      this.loading = null;
    }
  }
}
let ffmpegInstance: FFmpegFallback | null = null;

export function getFFmpegFallback(): FFmpegFallback {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpegFallback();
  }
  return ffmpegInstance;
}

export function shouldUseProxy(metadata: {
  width: number;
  height: number;
  duration: number;
  fileSize?: number;
}): boolean {
  return getFFmpegFallback().shouldUseProxy(metadata);
}

export function getRecommendedProxyPreset(metadata: {
  width: number;
  height: number;
}): "low" | "medium" | "high" {
  return getFFmpegFallback().getRecommendedProxyPreset(metadata);
}

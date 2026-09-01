import React, { useEffect, useRef, useState, useMemo } from "react";
import { Play, AlertCircle } from "lucide-react";

export type VideoSourceType = "uploaded" | "youtube" | "vimeo" | "external" | "hls";

interface VideoPlayerProps {
  url: string;
  sourceType?: VideoSourceType;
  title?: string;
  poster?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  initialTime?: number;
  autoPlay?: boolean;
  className?: string;
}

export function detectVideoSource(url: string): {
  type: VideoSourceType;
  embedUrl?: string;
  videoId?: string;
} {
  if (!url || typeof url !== "string") {
    return { type: "external" };
  }

  const cleanUrl = url.trim();

  // 1. YouTube detection
  const ytMatch =
    cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
    };
  }

  // 2. Vimeo detection
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i);
  const vimeoId = vimeoMatch ? vimeoMatch[1] || vimeoMatch[2] : null;
  if (vimeoId) {
    return {
      type: "vimeo",
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // 3. HLS (.m3u8)
  if (cleanUrl.includes(".m3u8")) {
    return { type: "hls" };
  }

  // 4. Cloudinary or uploaded video
  if (cleanUrl.includes("cloudinary.com") || cleanUrl.includes("res.cloudinary.com")) {
    return { type: "uploaded" };
  }

  // 5. Standard MP4 / WebM / Direct link
  return { type: "external" };
}

export function VideoPlayer({
  url,
  sourceType,
  title,
  poster,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  initialTime,
  autoPlay = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const detected = useMemo(() => {
    return detectVideoSource(url);
  }, [url]);

  const effectiveType = sourceType || detected.type;

  // Reset error when URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
  }, [url]);

  // Set initial seek time if provided
  useEffect(() => {
    if (initialTime && initialTime > 0 && videoRef.current) {
      try {
        videoRef.current.currentTime = initialTime;
      } catch {
        // Ignore seek errors on unready elements
      }
    }
  }, [initialTime, url]);

  const handleNativeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration || 0);
    }
  };

  const handleNativeError = () => {
    setHasError(true);
    setErrorMessage("Unable to play video file. Please check the video URL or network connectivity.");
  };

  if (!url || !url.trim()) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-900 text-slate-400 p-6 text-center ${className}`}>
        <div className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
            <Play size={24} />
          </div>
          <p className="text-xs font-semibold">No video URL provided for this lesson.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-900 text-rose-400 p-6 text-center ${className}`}>
        <div className="space-y-2 max-w-md">
          <AlertCircle size={28} className="mx-auto text-rose-500" />
          <h4 className="text-sm font-bold text-white">Playback Error</h4>
          <p className="text-xs text-slate-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // ── 1. YouTube Player (Responsive Embed) ──
  if (effectiveType === "youtube" && detected.embedUrl) {
    return (
      <div className={`relative h-full w-full bg-black overflow-hidden flex items-center justify-center ${className}`}>
        <iframe
          src={detected.embedUrl}
          title={title || "YouTube Video Player"}
          className="h-full w-full border-0 aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // ── 2. Vimeo Player (Responsive Embed) ──
  if (effectiveType === "vimeo" && detected.embedUrl) {
    return (
      <div className={`relative h-full w-full bg-black overflow-hidden flex items-center justify-center ${className}`}>
        <iframe
          src={detected.embedUrl}
          title={title || "Vimeo Video Player"}
          className="h-full w-full border-0 aspect-video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // ── 3. HTML5 Video Player (Uploaded MP4 / Direct CDN / WebM) ──
  return (
    <div className={`relative h-full w-full bg-black flex items-center justify-center ${className}`}>
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        controls
        playsInline
        autoPlay={autoPlay}
        onTimeUpdate={handleNativeTimeUpdate}
        onEnded={onEnded}
        onPlay={onPlay}
        onPause={onPause}
        onError={handleNativeError}
        className="h-full w-full object-contain"
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
}

export default VideoPlayer;

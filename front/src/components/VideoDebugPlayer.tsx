import { useEffect, useRef, useState } from "react";

type VideoDebugProps = {
  src: string;
  label: string;
};

type DebugState = {
  muted: boolean;
  defaultMuted: boolean;
  volume: number;
  currentTime: number;
  paused: boolean;
  readyState: number;
  networkState: number;
  audioTrackCount: number;
  lastEvent: string;
  errorMessage?: string;
};

const initialState: DebugState = {
  muted: false,
  defaultMuted: false,
  volume: 1,
  currentTime: 0,
  paused: true,
  readyState: 0,
  networkState: 0,
  audioTrackCount: 0,
  lastEvent: 'initialized',
};

export function VideoDebugPlayer({ src, label }: VideoDebugProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [debugState, setDebugState] = useState<DebugState>(initialState);

  const refreshState = () => {
    const video = videoRef.current;
    if (!video) return;

    const audioTracks = (video as any).audioTracks;
    setDebugState((prev) => ({
      ...prev,
      muted: video.muted,
      defaultMuted: video.defaultMuted,
      volume: video.volume,
      currentTime: video.currentTime,
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      audioTrackCount: Array.isArray(audioTracks)
        ? audioTracks.length
        : audioTracks?.length ?? 0,
    }));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const logState = (eventName: string, error?: string) => {
      const audioTracks = (video as any).audioTracks;
      const payload = {
        muted: video.muted,
        defaultMuted: video.defaultMuted,
        volume: video.volume,
        currentTime: video.currentTime,
        paused: video.paused,
        readyState: video.readyState,
        networkState: video.networkState,
        audioTrackCount: Array.isArray(audioTracks)
          ? audioTracks.length
          : audioTracks?.length ?? 0,
        error,
      };
      console.log("[BLOG VIDEO AUDIO DEBUG]", label, eventName, payload);
      setDebugState((prev) => ({
        ...prev,
        ...payload,
        lastEvent: eventName,
        errorMessage: error,
      }));
    };

    const handleLoadedMetadata = () => logState("loadedmetadata");
    const handleCanPlay = () => logState("canplay");
    const handlePlay = () => logState("play");
    const handlePlaying = () => logState("playing");
    const handleVolumeChange = () => logState("volumechange");
    const handleTimeUpdate = () => refreshState();
    const handleError = () => {
      const error = video.error;
      const message = error ? `${error.code}:${error.message}` : "unknown";
      logState("error", message);
    };

    logState("initialized");

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
    };
  }, [src, label]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-4 text-sm text-foreground">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium">Video Debug Panel</span>
          <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-muted p-2">muted: {String(debugState.muted)}</div>
          <div className="rounded-xl bg-muted p-2">defaultMuted: {String(debugState.defaultMuted)}</div>
          <div className="rounded-xl bg-muted p-2">volume: {debugState.volume.toFixed(2)}</div>
          <div className="rounded-xl bg-muted p-2">currentTime: {debugState.currentTime.toFixed(2)}</div>
          <div className="rounded-xl bg-muted p-2">paused: {String(debugState.paused)}</div>
          <div className="rounded-xl bg-muted p-2">readyState: {debugState.readyState}</div>
          <div className="rounded-xl bg-muted p-2">networkState: {debugState.networkState}</div>
          <div className="rounded-xl bg-muted p-2">audioTracks: {debugState.audioTrackCount}</div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">last event: {debugState.lastEvent}{debugState.errorMessage ? ` · error: ${debugState.errorMessage}` : ''}</div>
      </div>

      <div className="mx-auto overflow-hidden rounded-3xl max-w-[1000px] max-h-[600px]">
        <div className="w-full aspect-[16/9] bg-black">
          <video
            ref={videoRef}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full"
            style={{ objectFit: "contain" }}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { API_CONFIG } from "@/lib/api";
import { VideoDebugPlayer } from "@/components/VideoDebugPlayer";

export const Route = createFileRoute("/video-test")({
  head: () => ({
    meta: [
      { title: "Video Test — IQNAAX" },
      { name: "description", content: "Compare local uploaded MP4 playback with a public MP4 audio test." },
    ],
  }),
  component: VideoTest,
});

function VideoTest() {
  const localVideoUrl = `${API_CONFIG.BASE_URL}/uploads/blogs/1779523355_WhatsApp_Video_2026-05-15_at_11.15.30_AM.mp4`;
  const publicVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-semibold">Video Test</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Compare a local uploaded MP4 against a public MP4 with known audio. Both use the same video element wrapper.
          </p>
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-foreground">
            <p className="font-semibold">Instructions</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>1. Press play on both videos.</li>
              <li>2. Check the browser console for <code>[BLOG VIDEO AUDIO DEBUG]</code> logs.</li>
              <li>3. Confirm the local video and the public video behave differently or the same.</li>
            </ul>
          </div>
          <div className="space-y-16">
            <div>
              <h2 className="text-2xl font-semibold">A. Local uploaded MP4</h2>
              <p className="text-sm text-muted-foreground">URL: {localVideoUrl}</p>
              <VideoDebugPlayer src={localVideoUrl} label="Local uploaded MP4" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">B. Public MP4 with audio</h2>
              <p className="text-sm text-muted-foreground">URL: {publicVideoUrl}</p>
              <VideoDebugPlayer src={publicVideoUrl} label="Public test MP4" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

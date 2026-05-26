import { createFileRoute } from "@tanstack/react-router";
import { apiCall, API_CONFIG } from "@/lib/api";
import { useEffect, useState } from "react";
import { VideoDebugPlayer } from "@/components/VideoDebugPlayer";
type BlogBlock =
  | { type: 'hero-image'; image_url?: string; image_path?: string; caption?: string }
  | { type: 'text'; heading?: string; subheading?: string; paragraph?: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'video'; url?: string; source?: string; caption?: string }
  | { type: 'image-gallery'; images: Array<{ image_url?: string; image_path?: string; alt?: string }> }
  | { type: 'heading'; text: string; level?: 'h1' | 'h2' | 'h3' }
  | { type: 'paragraph'; text: string }
  | { type: 'two-column'; image_url?: string; image_path?: string; title?: string; text?: string; image_position?: 'left' | 'right' }
  | { type: 'divider' };

export const Route = createFileRoute("/blog/$id")({
  head: () => ({
    meta: [
      { title: "Blog — IQNAAX" },
    ],
  }),
  component: BlogDetail,
});

function BlogDetail() {
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryIndexes, setGalleryIndexes] = useState<Record<number, number>>({});

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiCall(API_CONFIG.ENDPOINTS.BLOG_BY_ID(id!), { method: 'GET' });
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, []);

  const getRemoteUrl = (value?: string) => {
    if (!value) return undefined;
    return value.startsWith('/') ? `${API_CONFIG.BASE_URL}${value}` : value;
  };

  const renderBlock = (block: BlogBlock, index: number) => {
    switch (block.type) {
      case 'hero-image': {
        const imageUrl = getRemoteUrl(block.image_path) || block.image_url || '/assets/placeholder-3d.png';
        return (
          <section key={index} className="mb-14 rounded-3xl overflow-hidden bg-muted/10">
            <div className="relative h-[520px] w-full overflow-hidden bg-black">
              <img src={imageUrl} alt={block.caption || 'Hero image'} className="h-full w-full object-cover" />
              {block.caption ? (
                <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-background/80 p-4 text-sm text-muted-foreground backdrop-blur">
                  {block.caption}
                </div>
              ) : null}
            </div>
          </section>
        );
      }
      case 'heading':
        return (
          <section key={index} className="mb-10">
            {block.level === 'h3' ? (
              <h3 className="text-2xl font-semibold text-foreground">{block.text}</h3>
            ) : block.level === 'h2' ? (
              <h2 className="text-3xl font-semibold text-foreground">{block.text}</h2>
            ) : (
              <h1 className="text-4xl font-semibold text-foreground">{block.text}</h1>
            )}
          </section>
        );
      case 'text':
        return (
          <section key={index} className="mb-10 space-y-4">
            {block.heading ? <h2 className="text-3xl font-semibold text-foreground">{block.heading}</h2> : null}
            {block.subheading ? <p className="text-lg text-muted-foreground">{block.subheading}</p> : null}
            {block.paragraph ? <p className="text-base leading-8 text-muted-foreground">{block.paragraph}</p> : null}
          </section>
        );
      case 'paragraph':
        return (
          <section key={index} className="mb-10">
            <p className="text-base leading-8 text-muted-foreground">{block.text}</p>
          </section>
        );
      case 'quote':
        return (
          <section key={index} className="mb-10 rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
            <p className="text-xl italic text-foreground">“{block.text}”</p>
            {block.author ? <p className="mt-4 text-sm uppercase tracking-[0.24em] text-muted-foreground">{block.author}</p> : null}
          </section>
        );
      case 'video': {
        const url = block.url;
        if (!url) return null;
        const embedUrl = getEmbeddedVideoUrl(url);
        return (
          <section key={index} className="mb-14">
            <iframe
              src={embedUrl}
              width="100%"
              height="550"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Video player"
            />
            {block.caption ? <p className="mt-4 text-sm text-muted-foreground">{block.caption}</p> : null}
          </section>
        );
      }
      case 'image-gallery': {
        const images = block.images || [];
        if (!images.length) return null;
        const selectedIndex = galleryIndexes[index] ?? 0;
        const selectedImage = images[selectedIndex];
        const imageUrl = getRemoteUrl(selectedImage?.image_path) || selectedImage?.image_url || '/assets/placeholder-3d.png';
        return (
          <section key={index} className="mb-14">
            <div className="overflow-hidden rounded-3xl border border-border bg-black">
              <img src={imageUrl} alt={selectedImage?.alt || 'Gallery image'} className="h-[520px] w-full object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((image, imageIndex) => {
                const thumbUrl = getRemoteUrl(image.image_path) || image.image_url || '/assets/placeholder-3d.png';
                return (
                  <button
                    key={imageIndex}
                    type="button"
                    onClick={() => setGalleryIndexes((current) => ({ ...current, [index]: imageIndex }))}
                    className={`overflow-hidden rounded-2xl border ${selectedIndex === imageIndex ? 'border-foreground' : 'border-border'} bg-muted`}
                  >
                    <img src={thumbUrl} alt={image.alt || `Gallery ${imageIndex + 1}`} className="h-24 w-full object-cover" />
                  </button>
                );
              })}
            </div>
          </section>
        );
      }
      case 'two-column': {
        const imageUrl = getRemoteUrl(block.image_path) || block.image_url || '/assets/placeholder-3d.png';
        const textSide = block.image_position === 'left' ? 'lg:order-2' : '';
        return (
          <section key={index} className="mb-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className={`overflow-hidden rounded-3xl bg-muted ${block.image_position === 'right' ? 'lg:order-2' : ''}`}>
              <img src={imageUrl} alt={block.title || 'Section image'} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4">
              {block.title ? <h2 className="text-3xl font-semibold text-foreground">{block.title}</h2> : null}
              {block.text ? <p className="text-base leading-8 text-muted-foreground">{block.text}</p> : null}
            </div>
          </section>
        );
      }
      case 'divider':
        return (
          <section key={index} className="mb-14">
            <div className="mx-auto h-px w-24 rounded-full bg-border" />
          </section>
        );
      default:
        return null;
    }
  };

  const contentBlocks = Array.isArray(blog?.content) ? blog.content : [];

  return (
    <section className="pt-40 pb-24 bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : blog ? (
          <article className="space-y-10">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-primary">{blog.category || 'Blog'}</p>
                    <h1 className="mt-3 text-5xl font-display font-semibold tracking-tight text-foreground">{blog.title}</h1>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {blog.author ? <div>{blog.author}</div> : null}
                    <div>{blog.publish_date ? new Date(blog.publish_date).toLocaleDateString() : blog.created_at?.split(' ')[0]}</div>
                  </div>
                </div>
                {blog.description ? <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{blog.description}</p> : null}
              </div>
            </div>

            <div className="space-y-10">
              {contentBlocks.length > 0 ? (
                contentBlocks.map((block, index) => renderBlock(block as BlogBlock, index))
              ) : (
                <div className="rounded-3xl border border-border bg-card p-8 prose max-w-none text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: blog.content || blog.description || '<p>No content available.</p>' }} />
                </div>
              )}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

function isYouTubeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

function isVimeoUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.includes('vimeo.com');
  } catch {
    return false;
  }
}

function isMp4Url(url: string) {
  return typeof url === 'string' && url.toLowerCase().endsWith('.mp4');
}

function getEmbeddedVideoUrl(url: string) {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    const pathname = u.pathname;

    if (host.includes('youtu.be') || host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      let videoId: string | null = null;

      if (host.includes('youtu.be')) {
        videoId = pathname.replace(/^\//, '');
      } else if (pathname.startsWith('/shorts/')) {
        videoId = pathname.split('/')[2] || null;
      } else if (pathname.startsWith('/watch')) {
        videoId = u.searchParams.get('v');
      } else {
        const embedMatch = pathname.match(/\/embed\/([^/\?]+)/i);
        if (embedMatch && embedMatch[1]) {
          videoId = embedMatch[1];
        }
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }
    }
  } catch {
    const loose = String(url).match(/(?:youtu\.be\/|v=|embed\/)([\w-_-]{6,})/i);
    if (loose && loose[1]) return `https://www.youtube.com/embed/${loose[1]}`;
  }
  return url;
}

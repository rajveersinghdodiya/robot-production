import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { apiCall, API_CONFIG } from "@/lib/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — IQNAAX" },
      { name: "description", content: "Latest robotics and AI articles from IQNAAX." },
    ],
  }),
  component: BlogList,
});

type BlogBlock = {
  type: 'hero-image' | 'image-gallery' | 'two-column' | 'video' | 'heading' | 'paragraph' | 'text' | 'quote' | 'divider';
  image_url?: string;
  image_path?: string;
  images?: Array<{ image_url?: string; image_path?: string }>;
  url?: string;
  source?: string;
};

type Blog = {
  id: number;
  title: string;
  description?: string;
  image_path?: string | null;
  image_url?: string | null;
  image_full_url?: string | null;
  video_url?: string | null;
  category?: string | null;
  created_at?: string;
  content?: BlogBlock[];
};

function isYouTubeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

function getVideoThumbnail(url: string) {
  const id = getYouTubeVideoId(url);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

function hasImageInBlocks(blocks?: BlogBlock[]): boolean {
  if (!blocks || blocks.length === 0) return false;
  
  return blocks.some(block => {
    if (block.type === 'hero-image' && (block.image_url || block.image_path)) {
      return true;
    }
    if (block.type === 'image-gallery' && block.images && block.images.length > 0) {
      return block.images.some(img => img.image_url || img.image_path);
    }
    if (block.type === 'two-column' && (block.image_url || block.image_path)) {
      return true;
    }
    if (block.type === 'video' && block.url && isYouTubeUrl(block.url)) {
      return !!getVideoThumbnail(block.url);
    }
    return false;
  });
}

function BlogPlaceholder({ title }: { title: string }) {
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
          {initials || '📄'}
        </div>
        <span className="text-xs font-medium text-muted-foreground">Text Article</span>
      </div>
    </div>
  );
}

function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogDetailMatch = useMatch({ from: "/blog/$id", shouldThrow: false });
  const showBlogList = !blogDetailMatch;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiCall<Blog[]>(API_CONFIG.ENDPOINTS.BLOGS, { method: 'GET' });
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const getImage = (b: Blog) => {
    if (b.image_full_url) return b.image_full_url;
    if (b.image_url) return b.image_url;
    const thumbnail = b.video_url ? getVideoThumbnail(b.video_url) : null;
    if (thumbnail) return thumbnail;
    return null; // Return null instead of placeholder
  };

  return (
    <Layout>
      {showBlogList ? (
        <>
          <section className="pt-40 pb-16 container mx-auto px-6">
            <h1 className="text-4xl font-display font-semibold">IQNAAX Blog</h1>
            <p className="mt-3 text-sm text-muted-foreground">Insights, news and technical articles on robotics and AI.</p>
          </section>

          <section className="container mx-auto px-6 pb-24">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading blogs...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : blogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blog posts yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((b) => {
                  const hasImage = getImage(b) || hasImageInBlocks(b.content);
                  return (
                    <article key={b.id} className="group rounded-2xl border border-border overflow-hidden bg-card hover-lift">
                      <div className="aspect-[16/9] overflow-hidden bg-muted/10">
                        {hasImage ? (
                          <img src={getImage(b) || '/assets/placeholder-3d.png'} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <BlogPlaceholder title={b.title} />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">{b.category} • {b.created_at?.split(' ')[0]}</div>
                          <Link to={`/blog/${b.id}`} className="text-sm font-medium text-foreground">Read More →</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}

      <Outlet />
    </Layout>
  );
}

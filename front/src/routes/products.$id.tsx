import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { apiCall, API_CONFIG, resolveRemoteUrl } from "@/lib/api";
import { Country, formatPrice, getStoredCountry } from "@/lib/currency";
import { TouchEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

type ProductImage = {
  id?: number;
  image_path?: string;
  image_url?: string;
  image_full_url?: string;
  sort_order?: number;
};

type NormalizedProductImage = ProductImage & {
  url: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image_path?: string;
  video_url?: string;
  created_at?: string;
  images?: ProductImage[];
};

function getEmbeddedVideoUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const str = url.trim();
    if (/youtube\.com\/embed\//i.test(str)) return str;

    const u = new URL(str);
    const host = u.hostname.toLowerCase();
    const pathname = u.pathname;

    if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      let videoId: string | null = null;

      if (host === "youtu.be") {
        videoId = pathname.replace(/^\//, "");
      } else if (pathname.startsWith("/shorts/")) {
        videoId = pathname.split("/")[2] || null;
      } else if (pathname.startsWith("/watch")) {
        videoId = u.searchParams.get("v");
      } else {
        const embedMatch = pathname.match(/\/embed\/([^/\?]+)/i);
        if (embedMatch && embedMatch[1]) {
          videoId = embedMatch[1];
        }
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (e) {
    const loose = String(url).match(/(?:youtu\.be\/|v=|embed\/)([\w-_-]{6,})/i);
    if (loose && loose[1]) return `https://www.youtube.com/embed/${loose[1]}`;
    return null;
  }

  return null;
}

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [{ title: "Product Details — IQNAAX" }],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [country, setCountry] = useState<Country>(() => getStoredCountry());

  useEffect(() => {
    const id = window.location.pathname.split("/").pop();
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiCall<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id || ""), {
          method: "GET",
        });
        setProduct(data);
        setActiveIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const onCountryChange = (event: Event) => {
      const next = (event as CustomEvent<Country>).detail as Country | undefined;
      if (next) setCountry(next);
    };

    window.addEventListener("iqnaax-country-change", onCountryChange);
    return () => window.removeEventListener("iqnaax-country-change", onCountryChange);
  }, []);

  const images = useMemo<NormalizedProductImage[]>(() => {
    if (!product) return [];

    const normalized = (product.images ?? [])
      .map((image) => ({
        ...image,
        url: resolveRemoteUrl(image.image_full_url || image.image_url || image.image_path) || "",
      }))
      .filter((image): image is NormalizedProductImage => Boolean(image.url))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    if (normalized.length > 0) {
      return normalized;
    }

    const fallbackUrl = resolveRemoteUrl(product.image_url || product.image_path);
    return fallbackUrl ? [{ image_full_url: product.image_url, url: fallbackUrl }] : [];
  }, [product]);

  const currentImage = images[activeIndex] || images[0];

  const embedUrl = getEmbeddedVideoUrl(product?.video_url ?? null);

  const goPrev = () => {
    if (!images?.length) return;
    setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const goNext = () => {
    if (!images?.length) return;
    setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const diff = event.changedTouches[0].clientX - touchStartX;
    if (diff > 50) {
      goPrev();
    } else if (diff < -50) {
      goNext();
    }
    setTouchStartX(null);
  };

  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading product…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : product ? (
          <article className="space-y-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex-1">
                <div
                  className="relative overflow-hidden rounded-3xl border border-border bg-card"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="flex min-h-[320px] max-h-[68vh] items-center justify-center bg-muted/10 p-4">
                    {currentImage?.url ? (
                      <img
                        src={currentImage.url}
                        alt={product.name}
                        className="max-h-[64vh] max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image available</div>
                    )}
                  </div>
                  {images.length > 1 ? (
                    <>
                      <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                        {activeIndex + 1}/{images.length}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          goPrev();
                        }}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-foreground shadow-lg backdrop-blur hover:bg-background"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          goNext();
                        }}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-foreground shadow-lg backdrop-blur hover:bg-background"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  ) : null}
                </div>

                {images.length > 1 ? (
                  <>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-2.5 w-2.5 rounded-full ${
                            idx === activeIndex ? "bg-foreground" : "bg-muted-foreground/60"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {images.map((image, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveIndex(idx);
                          }}
                          aria-label={`Select image ${idx + 1} of ${images.length}`}
                          className={`overflow-hidden rounded-2xl border p-1 transition-all ${
                            idx === activeIndex ? "border-foreground" : "border-border bg-card"
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            className="h-20 w-full object-contain bg-muted/10"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Link to="/products" className="inline-flex items-center gap-2 text-primary hover:text-white transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back to catalog
                  </Link>
                  <span>•</span>
                  <span>Product ID #{product.id}</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-display font-semibold tracking-tight text-foreground">{product.name}</h1>
                  <p className="text-xl font-semibold text-foreground">{formatPrice(product.price, country)}</p>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.video_url ? (
                    <a
                      href={embedUrl ?? product.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-primary transition-all"
                    >
                      Watch Video
                    </a>
                  ) : null}
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-card border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-background transition-all"
                  >
                    Request Wholesale Quote
                  </Link>
                </div>
              </div>
            </div>
            {embedUrl ? (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground">Product Video</h2>
                <div className="mt-4 aspect-video overflow-hidden rounded-3xl bg-black">
                  <iframe
                    src={embedUrl}
                    title={`Product video for ${product.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : null}
          </article>
        ) : null}
      </section>
    </Layout>
  );
}

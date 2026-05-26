import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { apiCall, API_CONFIG, resolveRemoteUrl } from "@/lib/api";
import { Country, formatPrice, getStoredCountry } from "@/lib/currency";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Wholesale Robotics Catalog | IQNAAX" },
      {
        name: "description",
        content:
          "Browse IQNAAX's wholesale catalog: humanoid robots, collaborative arms, quadrupeds, educational robots and 3D printers from Nuwa, Elephant Robotics, Unitree and more.",
      },
      { property: "og:title", content: "Products — IQNAAX Wholesale Robotics" },
      {
        property: "og:description",
        content: "Humanoids, cobots, quadrupeds, 3D printers — available in wholesale quantities.",
      },
    ],
  }),
  component: ProductsPage,
});

type ProductImage = {
  id?: number;
  image_url?: string;
  image_path?: string;
  image_full_url?: string;
  sort_order?: number;
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

function ProductsPage() {
  const productDetailMatch = useMatch({ from: "/products/$id", shouldThrow: false });
  const showProductList = !productDetailMatch;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [country, setCountry] = useState<Country>(() => getStoredCountry());

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiCall<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS, {
          method: "GET",
        });
        setProducts(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const onCountryChange = (event: Event) => {
      const next = (event as CustomEvent<Country>).detail as Country | undefined;
      if (next) setCountry(next);
    };

    window.addEventListener("iqnaax-country-change", onCountryChange);
    return () => window.removeEventListener("iqnaax-country-change", onCountryChange);
  }, []);

  return (
    <Layout>
      {showProductList ? (
        <>
          <section className="pt-40 pb-16 container mx-auto px-6">
            <span className="text-sm uppercase tracking-widest text-primary font-medium">Catalog</span>
            <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
              Robotics, ready for <span className="italic font-light">scale.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Every unit in our catalog is available in wholesale volumes with distributor pricing,
              warranty support and onboarding documentation.
            </p>
          </section>

          <section className="container mx-auto px-6 pb-24">
            {loading ? (
              <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading products…</p>
              </div>
            ) : error ? (
              <div className="mt-16 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-16 rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No products available.
              </div>
            ) : (
              <div className="grid justify-center gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} country={country} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <Outlet />

      {activeVideo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl bg-card shadow-2xl ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold">Product Video Preview</h2>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={getEmbeddedVideoUrl(activeVideo)}
                title="Product Video Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}

function ProductCard({ product, index, country }: { product: Product; index: number; country: Country }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    const normalized = (product.images ?? [])
      .map((image) => ({
        ...image,
        url: resolveRemoteUrl(image.image_full_url || image.image_url || image.image_path),
      }))
      .filter((image) => image.url)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    if (normalized.length > 0) {
      return normalized;
    }

    const fallbackUrl = resolveRemoteUrl(product.image_url || product.image_path);
    return fallbackUrl ? [{ image_full_url: product.image_url, url: fallbackUrl }] : [];
  }, [product.images, product.image_url, product.image_path]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const hasGallery = images.length > 1;
  const currentImage = images[activeIndex] || images[0];

  const goPrev = () => {
    if (!images.length) return;
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goNext = () => {
    if (!images.length) return;
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <article
      className="group relative max-w-[260px] w-full rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-t-3xl bg-muted/10">
        <div className="aspect-[4/3] bg-muted/10">
          {currentImage?.url ? (
            <img
              src={currentImage.url}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {hasGallery ? (
          <>
            <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm">
              {images.length} images
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm">
              {activeIndex + 1}/{images.length}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-md backdrop-blur hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-md backdrop-blur hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2.5 w-2.5 rounded-full ${
                    idx === activeIndex ? "bg-foreground" : "bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}

        <Link
          to={`/products/${product.id}`}
          className="absolute inset-0 z-0"
          aria-label={`View details for ${product.name}`}
        />
      </div>

      <div className="p-2 flex min-h-[170px] flex-col gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
          <p className="mt-2 text-sm leading-snug text-muted-foreground max-h-16 overflow-hidden">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Price</span>
              <span>{formatPrice(product.price, country)}</span>
            </div>
            <div className="grid gap-2">
              <Link
                to={`/products/${product.id}`}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-primary"
              >
                View
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
              >
                Request quote
              </Link>
            </div>
        </div>
      </div>
    </article>
  );
}

function getEmbeddedVideoUrl(url: string) {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    const pathname = u.pathname;

    if (host.includes("youtu.be") || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      let videoId: string | null = null;

      if (host.includes("youtu.be")) {
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
  } catch {
    const loose = String(url).match(/(?:youtu\.be\/|v=|embed\/)([\w-_-]{6,})/i);
    if (loose && loose[1]) return `https://www.youtube.com/embed/${loose[1]}`;
  }
  return url;
}

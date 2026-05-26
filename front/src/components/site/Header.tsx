import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { COUNTRY_OPTIONS, Country, getStoredCountry, setStoredCountry } from "@/lib/currency";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/lab-setup", label: "Lab Setup" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function CountryMenu({
  country,
  onChange,
}: {
  country: Country;
  onChange: (country: Country) => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  const selected = COUNTRY_OPTIONS.find((option) => option.value === country) ?? COUNTRY_OPTIONS[0];

  return (
    <div ref={menuRef} className="relative inline-flex rounded-full border border-border bg-[#0b1220] text-white shadow-sm">
      <button
        type="button"
        className="inline-flex min-w-[8rem] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <img
          src={selected.flagImage}
          alt={`${selected.label} flag`}
          className="h-4 w-5 rounded-sm object-cover"
        />
        <span className="whitespace-nowrap">{selected.label}</span>
        <span className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
      </button>

      {menuOpen ? (
        <div className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-border bg-[#0b1220] shadow-2xl">
          {COUNTRY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${
                option.value === country
                  ? "bg-cyan-500/15 text-white"
                  : "text-white hover:bg-cyan-500/10"
              }`}
            >
              <img
                src={option.flagImage}
                alt={`${option.label} flag`}
                className="h-4 w-5 rounded-sm object-cover"
              />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<Country>(getStoredCountry());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCountryChange = (next: Country) => {
    setCountry(next);
    setStoredCountry(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-xl logo-mark flex items-center justify-center text-background font-display font-bold text-[15px] tracking-tight shadow-lg group-hover:scale-110 transition-transform">
            <span className="relative z-10">IQ</span>
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">IQNAAX</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              activeProps={{ className: "text-foreground after:w-full" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <CountryMenu country={country} onChange={handleCountryChange} />
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary transition-all hover:scale-105"
          >
            Get a Quote
          </Link>
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-foreground transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-base font-medium py-2"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="container mx-auto px-6 pb-6">
            <CountryMenu country={country} onChange={handleCountryChange} />
          </div>
        </div>
      )}
    </header>
  );
}

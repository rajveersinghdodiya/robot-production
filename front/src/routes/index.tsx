import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ArrowRight, Boxes, GraduationCap, Cpu, Sparkles, Glasses, Bot, MonitorPlay } from "lucide-react";
import techMahindra from "@/assets/clients/tech-mahindra-color.png";
import wipro from "@/assets/clients/wipro-color.png";
import pgi from "@/assets/clients/pgi-color.png";
import harvard from "@/assets/clients/harvard-color.png";
import mit from "@/assets/clients/mit-color.gif";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IQNAAX — Wholesale Robotics & Lab Setup Solutions" },
      {
        name: "description",
        content:
          "IQNAAX distributes next-generation humanoids, cobots, and quadrupeds at wholesale, and builds custom AI & robotics labs for schools and colleges.",
      },
      { property: "og:title", content: "IQNAAX — Wholesale Robotics & Lab Setup" },
      {
        property: "og:description",
        content:
          "Distributors of humanoids, cobots & quadrupeds. Custom AI & robotics labs for institutions.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <Pillars />
      <OurClients />
      <LabCTA />
    </Layout>
  );
}

function Hero() {
  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        src="https://deep-website.oss-cn-hangzhou.aliyuncs.com/file/lynx/head.m4v"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disableRemotePlayback
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-6 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium tracking-wider uppercase">
              Authorized Wholesale Distributor
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight animate-fade-up delay-100">
            The future of
            <br />
            <span className="italic font-light">intelligent</span> machines.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed animate-fade-up delay-200">
            IQNAAX brings world-class humanoids, cobots and quadrupeds to enterprises,
            integrators and institutions — with end-to-end lab build-outs for schools
            and colleges.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-300">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-black font-medium hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Explore Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/lab-setup"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              Build a Lab
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden md:flex items-center gap-3 text-xs uppercase tracking-widest text-white/60">
        <div className="w-12 h-px bg-white/40" />
        Scroll
      </div>
    </section>
  );
}

function Marquee() {
  const brands = [
    "AIR-LAB ROBOTS",
    "CUSTOMIZED HARDWARE SOLUTIONS",
    "AR/VR CONTENT SOLUTIONS",
    "LMS PROVIDER",
    "NEXT-GEN ROBOTICS PROVIDER",
  ];
  const Track = () => (
    <div className="flex gap-16 pr-16 shrink-0 whitespace-nowrap">
      {brands.map((b, i) => (
        <span key={i} className="text-2xl md:text-3xl font-display font-bold text-foreground/30 tracking-tight">
          {b} <span className="text-primary">●</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="border-y border-border py-8 overflow-hidden bg-background">
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        <Track />
        <Track />
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      icon: Bot,
      title: "AIR-Lab Robots",
      points: [
        "AI Research & Innovation Laboratories",
        "Engineering & Technical Institutions",
        "STEM & Robotics Education",
        "Research, Testing & Development",
        "Labs, Universities & Training Centers",
      ],
    },
    {
      icon: GraduationCap,
      title: "Digital Learning & LMS Solutions",
      points: [
        "Enterprise LMS Platforms",
        "Centralized Course Management",
        "AI Learning Systems",
        "Workforce Training Solutions",
        "Custom LMS Integration",
      ],
    },
    {
      icon: Boxes,
      title: "Curated Catalog",
      points: [
        "Robotics, AI & Automation Products",
        "Education, Industry & Research",
        "Smart Labs & Innovation Centers",
        "Diverse Applications",
        "Customized Product Recommendations based on Client Needs",
      ],
    },
    {
      icon: Glasses,
      title: "AR/VR Content Solutions",
      points: [
        "Healthcare & Medical Training",
        "Education & Smart Learning Labs",
        "Industrial & Manufacturing Simulation",
        "Real Estate Virtual Tours",
        "Corporate & Automotive Training",
      ],
    },
    {
      icon: MonitorPlay,
      title: "Delivery & Service Robots",
      points: [
        "Hospitals, Hotels & Restaurants",
        "Retail Stores & Shopping Malls",
        "Healthcare & Corporate Spaces",
        "Customer Service & Reception",
        "Warehouses & Smart Campuses",
      ],
    },
    {
      icon: Cpu,
      title: "Customized Hardware Solutions",
      points: [
        "Robotics, AI & Automation Projects",
        "Industrial & Smart Devices",
        "Monitoring & Control Applications",
        "Custom Requirements",
        "Education, Research & Enterprises",
      ],
    },
  ];
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background dancing robot video */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        src="/mini-robot-dance.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <span className="text-sm uppercase tracking-widest text-primary font-medium">What we do</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight md:whitespace-nowrap">
            Custom Robotics & AI Systems
            <span className="block text-foreground/40 italic font-light">— built for every industry.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative p-8 rounded-2xl border border-border bg-card/70 backdrop-blur-md hover-lift overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:text-primary transition-all">
                <it.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-4">{it.title}</h3>
              <ul className="space-y-2">
                {it.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurClients() {
  const clients = [
    { name: "Tech Mahindra", logo: techMahindra },
    { name: "Wipro", logo: wipro },
    { name: "PGI", logo: pgi },
    { name: "Harvard", logo: harvard },
    { name: "MIT", logo: mit },
  ];
  const Track = () => (
    <div className="flex items-center gap-16 pr-16 shrink-0 whitespace-nowrap">
      {clients.map((c, i) => (
        <div
          key={i}
          className="shrink-0 flex items-center gap-5 h-24 px-6 rounded-2xl bg-white/95 border border-gold/20 shadow-lg hover:shadow-[0_0_30px_-5px_var(--gold)] transition-all"
        >
          <img
            src={c.logo}
            alt={c.name}
            loading="lazy"
            className="h-16 w-auto object-contain"
          />
          <span className="font-display font-bold text-xl text-neutral-800 tracking-tight">
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/40 to-transparent" />
      <div className="container mx-auto px-6 mb-16 text-center relative">
        <span className="text-sm uppercase tracking-widest text-primary font-medium">Trusted by</span>
        <h2 className="mt-3 font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
          Our Clients.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Industry leaders and world-class institutions trust IQNAAX to power their robotics journey.
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-[clientmarquee_40s_linear_infinite]">
          <Track />
          <Track />
        </div>
        <style>{`@keyframes clientmarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>
    </section>
  );
}

function LabCTA() {
  return (
    <section className="container mx-auto px-6 py-32">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground p-12 md:p-20">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Build the lab your students deserve.
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
            From AI &amp; Robotics labs to maker-spaces and IoT studios — we design, supply
            and commission complete kits tailored to your curriculum and budget.
          </p>
          <Link
            to="/lab-setup"
            className="mt-10 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-background text-foreground font-medium hover:scale-105 transition-transform"
          >
            Discover lab setups <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
      </div>
    </section>
  );
}

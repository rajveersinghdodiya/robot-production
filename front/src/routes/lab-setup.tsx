import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

import cobot from "@/assets/robot-cobot.jpg";
import { Check } from "lucide-react";

export const Route = createFileRoute("/lab-setup")({
  head: () => ({
    meta: [
      { title: "Custom Lab Setup for Schools & Colleges | IQNAAX" },
      {
        name: "description",
        content:
          "IQNAAX designs and commissions custom AI, Robotics and IoT labs for schools, colleges and universities — tailored to your curriculum and budget.",
      },
      { property: "og:title", content: "Custom Robotics Lab Setup | IQNAAX" },
      {
        property: "og:description",
        content: "Turnkey AI & Robotics labs for institutions. Designed, supplied and commissioned.",
      },
      { property: "og:image", content: "/lab-overview.jpg" },
    ],
  }),
  component: LabSetup,
});

const packages = [
  {
    name: "AIR-LabRobots",
    audience: "Flagship AI & Robotics",
    items: [
      "Humanoid + dual-arm cobot stations",
      "Quadruped robot fleet",
      "AI vision + edge-compute kits",
      "Custom curriculum & teacher training",
      "On-site commissioning",
    ],
  },
  {
    name: "Foundation Lab",
    audience: "Schools (K–12)",
    items: [
      "6× Kebbi Air social robots",
      "4× myCobot 280 with vision kit",
      "2× FDM 3D printers",
      "Curriculum + teacher training",
      "1-year on-site support",
    ],
  },
  {
    name: "Innovation Lab",
    audience: "Colleges & Polytechnics",
    items: [
      "8× myCobot dual-arm workstations",
      "2× Unitree quadrupeds",
      "Multi-tool 3D fabrication suite",
      "Vision + IoT development boards",
      "Project-based syllabus",
    ],
    featured: true,
  },
  {
    name: "Research Lab",
    audience: "Universities & R&D",
    items: [
      "Full-size humanoid platform",
      "Industrial dual-extruder printers",
      "Open-SDK quadruped fleet",
      "Custom integration & APIs",
      "Dedicated solutions architect",
    ],
  },
  {
    name: "Nvidia Isaac Sim Lab",
    audience: "Simulation & AI Research",
    items: [
      "Nvidia Isaac Sim workstations",
      "RTX-class GPU compute nodes",
      "Omniverse collaboration setup",
      "Synthetic data generation pipeline",
      "Sim-to-real workflow training",
    ],
  },
];

function LabSetup() {
  return (
    <Layout>
      <section className="pt-40 pb-20 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm uppercase tracking-widest text-primary font-medium">
              Lab Setup
            </span>
            <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Turnkey labs, <span className="italic font-light">tailored</span> to your curriculum.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              We design, supply and commission complete AI &amp; Robotics labs — from
              floorplan and furniture to robots, software and teacher training. One partner.
              One invoice. Zero compromise.
            </p>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-foreground text-background font-medium hover:bg-primary transition-all"
            >
              Plan your lab
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-card relative group">
            <iframe
              src="https://realsee.ai/ByNN97w7"
              title="IQNAAX Roboti VR Lab Tour"
              className="w-full h-full"
              allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; vr"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-xs font-medium border border-border pointer-events-none">
              Live VR Tour · Roboti Lab
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Lab packages, fully customizable.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl">
          Start with a baseline and we'll re-spec every component to your space, students and goals.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-16 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="p-8 rounded-2xl border hover-lift bg-card border-border flex flex-col h-full"
            >
              <div className="flex-grow">
                <div className="text-xs uppercase tracking-widest text-primary">
                  {pkg.audience}
                </div>
                <h3 className="font-display text-2xl font-bold mt-2">{pkg.name}</h3>
                <ul className="mt-6 space-y-3">
                  {pkg.items.map((it) => (
                    <li key={it} className="flex gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/contact"
                className="mt-8 inline-flex w-full items-center justify-center px-5 py-3 rounded-full text-sm font-medium transition-all bg-foreground text-background hover:bg-primary"
              >
                Customize this lab
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-24 border-y border-border bg-card/30">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden media-contain border border-border order-2 md:order-1">
            <img src={cobot} alt="Cobot workstation" className="w-full h-full" />
          </div>
          <div className="order-1 md:order-2">
            <span className="text-sm uppercase tracking-widest text-primary-glow font-medium">Process</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
              From blueprint to first class — in weeks.
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                ["01", "Discovery", "We map curriculum goals, student count, and space."],
                ["02", "Design", "You receive a 3D layout, BOM and project timeline."],
                ["03", "Deploy", "We ship, install, integrate, train teachers, hand over."],
                ["04", "Support", "Annual maintenance, updates, and curriculum refreshes."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-6">
                  <div className="font-display text-2xl text-primary-glow shrink-0">{n}</div>
                  <div>
                    <div className="font-semibold">{t}</div>
                    <div className="text-muted-foreground text-sm mt-1">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </Layout>
  );
}

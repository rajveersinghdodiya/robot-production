import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import labOverview from "@/assets/lab-overview.jpg";
import aboutTeam from "@/assets/about-team.jpg";
import aboutMission from "@/assets/about-mission.jpg";
import aboutClassroom from "@/assets/about-classroom.jpg";
import { ArrowRight, Cpu, Users, Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About IQNAAX — Robotics Distribution & Lab Builders" },
      {
        name: "description",
        content:
          "IQNAAX is a wholesale robotics distributor and turnkey AI & Robotics lab builder partnering with the world's leading robot manufacturers.",
      },
      { property: "og:title", content: "About IQNAAX" },
      {
        property: "og:description",
        content: "Wholesale robotics distribution and turnkey institutional labs.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Cpu,
    title: "Vetted in our AIR lab",
    body: "Every robot in our catalog is unboxed, tested and documented by our own engineers before it ever ships.",
  },
  {
    icon: Users,
    title: "Built for educators",
    body: "We co-design curriculum and teacher training with our institutional partners — so the hardware is actually used.",
  },
  {
    icon: Globe,
    title: "Global supply, local support",
    body: "Direct relationships with OEMs across Asia, Europe and the US — backed by an India-based service team.",
  },
  {
    icon: ShieldCheck,
    title: "Distributor pricing & warranty",
    body: "Authorized wholesale margins, OEM warranty pass-through and AMC contracts on every unit we ship.",
  },
];

function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-40 pb-20 container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <span className="text-sm uppercase tracking-widest text-primary font-medium">About IQNAAX</span>
            <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
              We put intelligent <span className="italic font-light text-gradient">machines</span> into the hands that need them.
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg text-muted-foreground leading-relaxed">
              IQNAAX is a wholesale distributor of next-generation robotics and a builder of
              institutional AI &amp; Robotics labs. We bridge the gap between the world's most
              advanced robot manufacturers and the integrators, enterprises and educators
              shaping the next decade of automation.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary transition-all"
            >
              Talk to our team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hero image — smaller than before */}
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden border border-border shadow-2xl">
          <img
            src={labOverview}
            alt="IQNAAX AI & Robotics Lab"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border">
            <img
              src={aboutMission}
              alt="Robotic arm in IQNAAX showroom"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <span className="text-sm uppercase tracking-widest text-primary-glow font-medium">Our Mission</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Make advanced robotics <span className="italic font-light">accessible</span> — at scale.
            </h2>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed text-lg">
              <p>
                We started IQNAAX with one belief: the next generation of engineers, doctors,
                logistics teams and innovators will need real, working robots — not slide decks.
              </p>
              <p>
                As an authorized wholesale distributor, we move premium humanoids, cobots,
                quadrupeds, mobile manipulators and 3D fabrication systems from world-class
                OEMs into Indian enterprises and institutions — with distributor pricing,
                full warranty and dedicated post-sales support.
              </p>
              <p>
                And as a turnkey lab builder, we design, supply and commission complete
                AI &amp; Robotics labs for schools, colleges and universities — from the
                floorplan and furniture to the curriculum and teacher training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-6 py-20 grid md:grid-cols-4 gap-12">
          {[
            ["20+", "Robotics SKUs in catalog"],
            ["6", "Global OEM partners"],
            ["100%", "Pre-tested in our AIR lab"],
            ["50+", "Institutional deployments"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-5xl md:text-6xl font-bold tracking-tight text-gradient">{n}</div>
              <div className="mt-3 text-muted-foreground text-sm uppercase tracking-wider">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mb-16">
          <span className="text-sm uppercase tracking-widest text-primary font-medium">Why IQNAAX</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            What we bring to every deployment.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="p-7 rounded-2xl border border-border bg-card hover-lift">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5">
                <v.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team / classroom split */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border">
            <img src={aboutTeam} alt="IQNAAX engineering team" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border">
            <img src={aboutClassroom} alt="Students in an IQNAAX-built lab" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Partners CTA */}
      <section className="bg-card/40 border-y border-border py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Our partners.</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              We work hand-in-hand with Nuwa Robotics, Elephant Robotics, Unitree, Zmorph,
              AgileX and a growing roster of specialist OEMs to bring vetted, supported
              hardware to the Indian market.
            </p>
            <p>
              Every product we distribute lives in our own AIR (AI &amp; Robotics) lab first —
              where our engineers test, document and certify it before it ever ships to a
              customer.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary transition-all"
            >
              View the catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

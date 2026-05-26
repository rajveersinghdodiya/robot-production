import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ArrowRight, Cpu, GraduationCap, Headset, Bot, Wrench, Truck } from "lucide-react";
import airLab from "@/assets/services/air-lab.jpg";
import customHardware from "@/assets/services/custom-hardware.jpg";
import arVr from "@/assets/services/ar-vr.jpg";
import lms from "@/assets/services/lms.jpg";
import nextGen from "@/assets/services/next-gen.jpg";
import delivery from "@/assets/services/delivery.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Robotics, Labs, AR/VR & LMS | IQNAAX" },
      {
        name: "description",
        content:
          "Explore IQNAAX services: AIR-Lab Robots, Customized Hardware Solutions, AR/VR Content, LMS for institutions, Next-Gen Robotics distribution and turnkey delivery.",
      },
      { property: "og:title", content: "Services — IQNAAX" },
      {
        property: "og:description",
        content:
          "AIR-Lab Robots, Custom Hardware, AR/VR, LMS and Next-Gen Robotics — end-to-end services for enterprises and institutions.",
      },
      { property: "og:image", content: airLab },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Bot,
    title: "AIR-Lab Robots",
    image: airLab,
    summary:
      "End-to-end AI & Robotics lab packages — humanoids, cobots, quadrupeds and mobile platforms, fully tested in our in-house AIR Lab before shipping to your campus.",
    points: [
      "Curriculum-aligned robot kits (K-12, Engineering, Research)",
      "Humanoids, cobots, quadrupeds, mobile manipulators",
      "Pre-loaded SDKs, ROS / ROS2 ready",
      "Hands-on training & faculty onboarding",
    ],
  },
  {
    icon: Wrench,
    title: "Customized Hardware Solutions",
    image: customHardware,
    summary:
      "Bespoke robotics hardware — from sensor stacks to custom end-effectors and integrated mobile manipulators — engineered to your application and budget.",
    points: [
      "Custom end-effectors, grippers & sensor mounts",
      "Embedded control boards & PCB design",
      "Mobile base + arm integration",
      "Prototyping and small-batch manufacturing",
    ],
  },
  {
    icon: Headset,
    title: "AR/VR Content Solutions",
    image: arVr,
    summary:
      "Immersive learning content for robotics & STEM — virtual labs, AR product manuals, and VR simulators that pair perfectly with our hardware.",
    points: [
      "VR robotics simulators (URDF / digital twin)",
      "AR step-by-step assembly & maintenance",
      "Custom interactive 3D content",
      "Headset-ready (Meta Quest, Pico, HTC)",
    ],
  },
  {
    icon: GraduationCap,
    title: "LMS Provider",
    image: lms,
    summary:
      "A modern Learning Management System purpose-built for AI & robotics programs — courses, assessments, lab analytics, and gamified progress tracking.",
    points: [
      "Pre-built robotics & AI courseware",
      "Live lab session tracking & analytics",
      "SSO, SCORM and institutional integrations",
      "Teacher dashboards & student gradebooks",
    ],
  },
  {
    icon: Cpu,
    title: "Next-Gen Robotics Provider",
    image: nextGen,
    summary:
      "Authorized wholesale distribution of next-generation humanoids, cobots and quadrupeds from world-leading brands — Elephant Robotics, Unitree, AgileX, Deep Robotics and more.",
    points: [
      "Bulk distributor pricing for partners",
      "OEM & ODM tie-ups",
      "Warranty & spare-part support",
      "Single-window procurement",
    ],
  },
  {
    icon: Truck,
    title: "Delivery & Service Robots",
    image: delivery,
    summary:
      "Autonomous delivery, hospitality and inspection robots for hotels, hospitals, campuses and warehouses — deployed, integrated and supported by IQNAAX.",
    points: [
      "Indoor delivery & hospitality robots",
      "AMRs for warehouse intralogistics",
      "Site survey, deployment & SLA support",
      "Fleet management & analytics",
    ],
  },
];

function ServicesPage() {
  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        <span className="text-sm uppercase tracking-widest text-primary font-medium">Services</span>
        <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
          Complete robotics services, <span className="italic font-light">end to end.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          From hardware and labs to AR/VR content and learning platforms — IQNAAX delivers
          everything institutions and enterprises need to launch their robotics programs.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-32 space-y-32">
        {services.map((s, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={s.title}
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center animate-fade-up ${
                reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border relative group">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/0 border border-primary/20 flex items-center justify-center text-primary mb-6">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-widest text-primary-glow font-medium">
                  Service {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight">
                  {s.title}
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed text-lg">{s.summary}</p>
                <ul className="mt-6 space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground/80">{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary-glow hover:text-primary transition-colors"
                >
                  Talk to our team <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <section className="container mx-auto px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground p-12 md:p-20">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Let's design your robotics stack.
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
              Tell us about your campus, factory, or fleet — we'll architect the right mix of
              hardware, content and software.
            </p>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-background text-foreground font-medium hover:scale-105 transition-transform"
            >
              Request a consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    </Layout>
  );
}

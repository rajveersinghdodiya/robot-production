import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram, Facebook, Linkedin, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999"; // replace with real number
const EMAIL = "sales@iqnaax.com";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border bg-[oklch(0.06_0.02_260)] text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/6 to-transparent pointer-events-none" />
      <div className="relative container mx-auto px-6 py-12">
        {/* absolute logo for larger screens */}
        <div className="hidden md:flex md:absolute md:top-6 md:left-6 md:items-center md:gap-3">
          <div className="w-12 h-12 rounded-xl logo-mark flex items-center justify-center text-background font-display font-bold text-[15px]">
            IQ
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">IQNAAX</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col gap-4 animate-fade-up lg:col-span-2 md:pl-20 md:pt-6">
            <div className="md:hidden flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl logo-mark flex items-center justify-center text-background font-display font-bold text-[15px] relative z-10">
                  IQ
                </div>
                <span className="absolute -inset-1 -z-10 rounded-xl blur-xl opacity-30 bg-gradient-to-r from-cyan-500/30 via-sky-400/20 to-indigo-600/10" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">IQNAAX</span>
            </div>

            <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm md:text-base" style={{lineHeight: 1.7}}>
              IQNAAX delivers advanced AI robotics solutions, custom automation systems, and smart lab setups for University, Industries, and Research organizations. We specialize in customized robots, bulk robotics supply, intelligent engineering solutions, and future-ready technology designed around real customer requirements.
            </p>
          </div>

          {/* Explore */}
          <div className="flex flex-col animate-fade-up">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-primary">Explore</h4>
            <ul className="flex flex-col gap-3">
              {[
                { to: "/products", label: "Products" },
                { to: "/services", label: "Services" },
                { to: "/lab-setup", label: "Lab Setup" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="transition-transform transform group-hover:translate-x-1">{label}</span>
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col items-center animate-fade-up lg:col-span-1">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-primary text-center">Follow Us</h4>
            <div className="flex flex-col items-center gap-4">
              {[
                { Icon: Instagram, href: "https://instagram.com/iqnaax", label: "Instagram" },
                { Icon: Facebook, href: "https://facebook.com/iqnaax", label: "Facebook" },
                { Icon: Linkedin, href: "https://linkedin.com/company/iqnaax", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="relative group w-11 h-11 rounded-full flex items-center justify-center"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/10 to-sky-400/6 opacity-0 group-hover:opacity-100 transform group-hover:scale-105 transition-all" />
                  <span className="absolute w-7 h-7 rounded-full bg-background/60 blur-sm opacity-0 group-hover:opacity-30 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-muted-foreground group-hover:text-background group-hover:bg-primary transition-all">
                    <Icon className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col animate-fade-up lg:col-span-1">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-primary">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <a href={`mailto:${EMAIL}`} className="hover:text-foreground transition-colors">{EMAIL}</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">WhatsApp Business</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border" />
        <div className="mt-6 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="order-2 md:order-1">© {new Date().getFullYear()} IQNAAX. All rights reserved.</p>
          <p className="order-1 md:order-2 text-center md:text-right">Authorized distributor — Nuwa Robotics, Elephant Robotics, Unitree, Zmorph &amp; more.</p>
        </div>
      </div>
    </footer>
  );
}

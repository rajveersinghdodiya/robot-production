import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { apiCall, API_CONFIG } from "@/lib/api";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact IQNAAX — Wholesale Quotes & Lab Consults" },
      {
        name: "description",
        content: "Talk to IQNAAX about wholesale robotics orders or a custom lab build for your institution.",
      },
      { property: "og:title", content: "Contact IQNAAX" },
      { property: "og:description", content: "Wholesale quotes and custom lab consultations." },
    ],
  }),
  component: Contact,
});

type Step = "form" | "otp" | "verifying" | "done";

type ContactFormValues = {
  name: string;
  org: string;
  email: string;
  phone: string;
  type: string;
};

function Contact() {
  const [step, setStep] = useState<Step>("form");
  const [formValues, setFormValues] = useState<ContactFormValues>({
    name: "",
    org: "",
    email: "",
    phone: "",
    type: "Wholesale order",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifiedEmail = localStorage.getItem("iqnaax_verified_email");
    if (verifiedEmail && verifiedEmail === formValues.email) {
      setSuccessMessage("Email verified successfully.");
    }
  }, [formValues.email]);

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const emailValue = formValues.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formValues.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!formValues.phone.trim()) {
      setError("Phone is required.");
      return;
    }

    setLoading(true);
    try {
      await apiCall<{ message: string }>(`${API_CONFIG.ENDPOINTS.CONTACT}/send-otp`, {
        method: "POST",
        body: JSON.stringify({ email: emailValue }),
      });
      setStep("otp");
      setSuccessMessage("OTP sent to your email.");
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear prior state and enter verifying
    setError(null);
    setSuccessMessage(null);
    setStep("verifying");
    setLoading(true);

    const verifyPayload = {
      email: formValues.email.trim(),
      otp: otp.trim(),
    };

    console.log("VERIFY EMAIL:", verifyPayload.email);
    console.log("VERIFY OTP:", verifyPayload.otp);
    console.log("VERIFY PAYLOAD:", verifyPayload);

    try {
      const verifyResponse = await apiCall<{ message: string; success: boolean }>(`${API_CONFIG.ENDPOINTS.CONTACT}/verify-otp`, {
        method: "POST",
        body: JSON.stringify(verifyPayload),
      });

      console.log("VERIFY RESPONSE:", verifyResponse);

      // Clear any lingering errors from previous attempts
      setError(null);

      // Only mark verified after contact submission succeeds
      await apiCall<{ message: string }>(API_CONFIG.ENDPOINTS.CONTACT, {
        method: "POST",
        body: JSON.stringify({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim(),
          organization: formValues.org.trim(),
          inquiry_type: formValues.type,
          message: `Inquiry type: ${formValues.type}; Organization: ${formValues.org.trim() || "N/A"}`,
        }),
      });

      localStorage.setItem("iqnaax_verified_email", formValues.email.trim());
      setSuccessMessage("Email verified successfully.");
      setStep("done");
    } catch (fetchError) {
      // On any failure, clear success and show the error
      setSuccessMessage(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to verify OTP or send inquiry. Please try again."
      );
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        <span className="text-sm uppercase tracking-widest text-primary font-medium">Contact</span>
        <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight max-w-3xl leading-[1.05]">
          Let's build something <span className="italic font-light">intelligent.</span>
        </h1>
      </section>

      <section className="container mx-auto px-6 pb-24 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {[
            { icon: Mail, label: "Email", value: "sales@iqnaax.com" },
            { icon: Phone, label: "Phone", value: "+91 00000 00000" },
            { icon: MapPin, label: "Address", value: "AIR Lab, India" },
          ].map((c) => (
            <div key={c.label} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                <div className="text-lg font-medium mt-1">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 p-8 md:p-10 rounded-3xl border border-border bg-card">
          {step === "form" && (
            <form className="space-y-5" onSubmit={handleRequestOtp}>
              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label="Name"
                  name="name"
                  required
                  value={formValues.name}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Field
                  label="Organization"
                  name="org"
                  value={formValues.org}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, org: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  required
                  value={formValues.phone}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Inquiry</label>
                <select
                  name="type"
                  value={formValues.type}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                >
                  <option>Wholesale order</option>
                  <option>Lab setup consultation</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 rounded-full bg-foreground text-background font-medium hover:bg-primary transition-all disabled:opacity-60"
              >
                {loading ? "Sending OTP…" : "Send OTP to email"}
              </button>
            </form>
          )}

          {(step === "otp" || step === "verifying") && (
            <form className="space-y-5" onSubmit={handleVerify}>
              <div>
                <h3 className="font-display text-2xl font-semibold">Verify your email</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  We've sent a 6-digit OTP to <span className="text-foreground font-medium">{formValues.email}</span>.
                  Enter it below to confirm your inquiry.
                </p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">One-Time Password</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-background tracking-[0.5em] text-center text-xl font-display focus:outline-none focus:border-primary"
                  placeholder="••••••"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMessage && <p className="text-sm text-foreground">{successMessage}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setOtp(""); setError(null); setSuccessMessage(null); }}
                  className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-card transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={step === "verifying" || otp.length !== 6 || loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary transition-all disabled:opacity-60"
                >
                  {step === "verifying" || loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & submit"}
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold">Message verified &amp; sent</h3>
              <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                Thanks — our team will reach out to <span className="text-foreground font-medium">{formValues.email}</span> within one business day.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
      />
    </div>
  );
}

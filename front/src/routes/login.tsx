import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { FormEvent, useEffect, useState } from "react";
import { API_CONFIG } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — IQNAAX Robotics" },
      { name: "description", content: "Admin login for IQNAAX Robotics." },
      { property: "og:title", content: "Admin Login — IQNAAX Robotics" },
    ],
  }),
  component: Login,
});

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("iqnaax_token")) {
      window.location.href = "/admin";
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Invalid login credentials.");
        return;
      }

      if (!data.success) {
        setError(data?.error || "Invalid login credentials.");
        return;
      }

      localStorage.setItem("iqnaax_token", data.token);
      localStorage.setItem("iqnaax_admin_username", data.admin?.username ?? trimmedUsername);
      if (data.admin?.role) {
        localStorage.setItem('iqnaax_admin_role', data.admin.role);
      }
      window.location.href = "/admin";
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to login at this time. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        <span className="text-sm uppercase tracking-widest text-primary font-medium">Admin</span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-full leading-[1.05] lg:whitespace-nowrap">
          Sign in to your <span className="italic font-light whitespace-nowrap">IQNAAX admin panel.</span>
        </h1>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-xl mx-auto p-8 md:p-10 rounded-3xl border border-border bg-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 rounded-full bg-foreground text-background font-medium hover:bg-primary transition-all disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

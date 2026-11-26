"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Wordmark } from "@/components/wordmark";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      ...(mode === "register" ? { displayName: String(form.get("displayName") ?? "") } : {}),
    };

    try {
      await apiRequest(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) });
      router.replace("/app");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-back" href="/" aria-label="Back to LazyBond home"><ArrowLeft size={17} /> Back to home</a>
      <section className="auth-card">
        <Link href="/" className="auth-brand" aria-label="LazyBond home"><Wordmark /></Link>
        <p className="eyebrow"><span className="eyebrow-dot" /> GOOD PLANS START HERE</p>
        <h1>{mode === "login" ? "Welcome back." : "Let’s make plans."}</h1>
        <p className="auth-description">{mode === "login" ? "Pick up where your next good story left off." : "Create an account to find your people and join a plan."}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <label>Your name<input name="displayName" autoComplete="name" minLength={2} maxLength={50} required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 12 : 1} maxLength={128} required /><small>{mode === "register" ? "Use at least 12 characters." : ""}</small></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin" /> : null}{mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New around here?" : "Already have an account?"} <Link href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link></p>
        <p className="auth-notice">Account email verification is not available in this preview.</p>
      </section>
    </main>
  );
}

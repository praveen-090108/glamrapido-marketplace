import { CalendarDays, Gift, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthLayout({ title, children, mode }: { title: string; children: React.ReactNode; mode: "login" | "signup" }) {
  const benefits = mode === "login"
    ? [["Top Rated Salons", "Handpicked & verified salons near you."], ["Convenient Booking", "Book anytime, anywhere with ease."], ["Exclusive Benefits", "Get access to special offers and discounts."], ["24/7 Support", "We're here to help you anytime, anywhere."]]
    : [["Trusted Salons", "Handpicked & verified salons near you."], ["Easy & Convenient", "Book appointments in just a few clicks."], ["Exclusive Benefits", "Enjoy special offers and member-only deals."], ["24/7 Support", "We're here to help you anytime, anywhere."]];

  return (
    <div className="min-h-screen bg-[#fffbfc] text-ink">
      <header className="border-b border-pink-100 bg-white">
        <div className="app-container flex items-center justify-between py-6">
          <Link to="/" className="brand-link"><img className="brand-logo auth-brand-logo" src="/brand/glamrapido_logo_header.svg" alt="Glam Rápido" /></Link>
          <div className="flex items-center gap-5">
            <span className="hidden font-semibold md:inline">{mode === "login" ? "New to Glam Rápido?" : "Already have an account?"}</span>
            <Link className="btn-outline" to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create Account" : "Login"}</Link>
          </div>
        </div>
      </header>
      <main className="app-container grid gap-10 py-12 lg:grid-cols-[1fr_680px]">
        <section className="auth-hero">
          <h1 className="text-5xl font-black leading-tight">{title.split(" ").slice(0, -2).join(" ")}<br /><span className="text-brand-500">{title.split(" ").slice(-2).join(" ")}</span></h1>
          <p className="mt-6 max-w-md text-xl leading-8 text-slate-700">{mode === "login" ? "Book appointments with top salons and artists near you. Because you deserve the best!" : "Create your account and discover the best salons, artists and exclusive offers near you."}</p>
          <div className="mt-8 space-y-6">{[[CalendarDays, "Easy Booking"], [UserRound, "Expert Professionals"], [Gift, "Exclusive Offers"], [ShieldCheck, "Secure & Safe"]].map(([Icon, text]) => <p className="flex items-center gap-4 font-bold" key={String(text)}><span className="feature-icon"><Icon /></span>{String(text)}</p>)}</div>
          <img className="auth-photo" src="/images/auth-beauty.jpg" alt="Beauty salon" />
        </section>
        <section className="auth-card card p-10">{children}</section>
      </main>
      <footer className="app-container pb-8">
        <section className="auth-benefits">
          {benefits.map(([heading, copy], index) => {
            const icons = [ShieldCheck, CalendarDays, Gift, UserRound];
            const Icon = icons[index];
            return <div key={heading} className="auth-benefit"><span className="feature-icon"><Icon /></span><strong>{heading}</strong><p>{copy}</p></div>;
          })}
        </section>
        <p className="mt-7 text-center text-sm text-muted">© 2024 Glam Rápido. All rights reserved.</p>
      </footer>
    </div>
  );
}

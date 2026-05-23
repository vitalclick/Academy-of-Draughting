import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Sign in — Academy of Advanced Draughting" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; sent?: string } }) {
  return (
    <section className="bg-paper">
      <div className="container-page py-20">
        <div className="mx-auto max-w-md rounded-xl border border-paper-3 bg-white p-8">
          <span className="eyebrow">SIGN IN</span>
          <h1 className="mt-3 text-2xl font-medium">Track your application</h1>
          <p className="mt-2 text-sm text-ink-3">
            Enter your email — we'll send a magic link. No password needed.
          </p>
          <LoginForm next={searchParams.next} initialSent={searchParams.sent === "1"} />
        </div>
      </div>
    </section>
  );
}

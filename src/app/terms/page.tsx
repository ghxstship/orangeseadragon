export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">
        By using ATLVS, you agree to platform usage, security, and compliance requirements.
      </p>
      <section className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          You are responsible for account security and lawful use of operational data.
        </p>
        <p>
          Service availability and features may evolve as part of ongoing product improvements.
        </p>
      </section>
    </main>
  );
}

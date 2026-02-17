export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">
        ATLVS processes personal data only for platform operations, security, and legal compliance.
      </p>
      <section className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          We collect account, session, and operational telemetry required to provide the service.
        </p>
        <p>
          Data export and deletion requests can be managed from the in-app privacy controls.
        </p>
      </section>
    </main>
  );
}

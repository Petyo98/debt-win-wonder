import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DebtFree" },
      { name: "description", content: "How DebtFree collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back
        </Link>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mt-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last Updated: June 2026</p>

        <div className="prose prose-sm mt-8 space-y-6 text-foreground">
          <p>Welcome to DebtFree. We respect your privacy and are committed to protecting your personal information.</p>

          <section>
            <h2 className="font-display font-bold text-xl">Information We Collect</h2>
            <p className="mt-2">When you join the DebtFree waitlist, we may collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email address</li>
              <li>Information voluntarily provided by you</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">How We Use Your Information</h2>
            <p className="mt-2">We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide early access to DebtFree</li>
              <li>Send product updates and announcements</li>
              <li>Respond to inquiries</li>
              <li>Improve our services</li>
            </ul>
            <p className="mt-2">We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Legal Basis for Processing</h2>
            <p className="mt-2">Where applicable, we process personal information based on your consent.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Data Retention</h2>
            <p className="mt-2">We retain your information until:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You request deletion</li>
              <li>You unsubscribe</li>
              <li>The information is no longer required for the purposes described above</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Your Rights</h2>
            <p className="mt-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion</li>
              <li>Withdraw consent</li>
              <li>Request data portability</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us using the email below.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Security</h2>
            <p className="mt-2">
              We take reasonable measures to protect your information from unauthorized access, disclosure, or misuse.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

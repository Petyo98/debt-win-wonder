import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — DebtFree" },
      { name: "description", content: "Terms of Service governing use of the DebtFree platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back
        </Link>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mt-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last Updated: June 2026</p>

        <div className="prose prose-sm mt-8 space-y-6 text-foreground">
          <p>
            DebtFree provides educational tools, calculators, planning features, and informational content designed to
            assist users with debt repayment planning.
          </p>

          <section>
            <h2 className="font-display font-bold text-xl">No Financial Advice</h2>
            <p className="mt-2">
              DebtFree is not a bank, lender, financial advisor, investment advisor, tax advisor, legal advisor, credit
              counseling agency, or credit repair organization.
            </p>
            <p className="mt-2">
              Any information provided by DebtFree is for informational and educational purposes only and should not be
              relied upon as professional advice.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">No Guarantees</h2>
            <p className="mt-2">DebtFree does not guarantee:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Debt reduction</li>
              <li>Interest savings</li>
              <li>Credit score improvement</li>
              <li>Financial outcomes</li>
              <li>Specific repayment timelines</li>
            </ul>
            <p className="mt-2">Results vary based on each user's circumstances.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">User Responsibility</h2>
            <p className="mt-2">Users remain solely responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Financial decisions</li>
              <li>Loan repayments</li>
              <li>Agreements with lenders</li>
              <li>Verification of information entered into the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Limitation of Liability</h2>
            <p className="mt-2">
              DebtFree shall not be liable for any losses, damages, or financial decisions resulting from the use of the
              platform.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Changes</h2>
            <p className="mt-2">
              We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the
              updated Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

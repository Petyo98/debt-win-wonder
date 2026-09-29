import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — DebtFree" },
      { name: "description", content: "Terms of Service governing use of the DebtFree platform." },
      { property: "og:title", content: "Terms of Service — DebtFree" },
      { property: "og:description", content: "Terms of Service governing use of the DebtFree platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        <p className="text-sm text-muted-foreground mt-2">Last Updated: September 29, 2026</p>

        <div className="prose prose-sm mt-8 space-y-6 text-foreground">
          <p>
            DebtFree provides educational tools, calculators, planning features, and informational content designed to
            assist users with debt repayment planning.
          </p>

          <section>
            <h2 className="font-display font-bold text-xl">Using DebtFree</h2>
            <p className="mt-2">
              These Terms apply to the DebtFree website, installable web app, accounts, and related services
              (the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms.
              If you do not agree, please do not use the Service. Our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> explains
              how we handle your information.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">No Financial Advice</h2>
            <p className="mt-2">
              DebtFree is not a bank, lender, financial advisor, investment advisor, tax advisor, legal advisor, credit
              counseling agency, or credit repair organization.
            </p>
            <p className="mt-2">
              Any information provided by DebtFree is for informational and educational purposes only and should not be
              relied upon as professional financial, legal, or tax advice. Calculations are estimates, not promises;
              check your lender&apos;s statements and seek qualified advice where needed before making decisions.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">How Payoff Estimates Are Calculated</h2>
            <p className="mt-2">
              The forecast starts with the balances, annual interest rates (APR), and monthly minimum payments you
              enter for active debts. It assumes each APR stays fixed and adds interest once per month at balance ×
              APR ÷ 12 before that month&apos;s payment. It then pays each debt&apos;s entered minimum, up to the
              amount owed, and puts the remaining monthly budget toward debts in snowball order (smallest balance
              first) or avalanche order (highest APR first). When a debt is paid, any unused amount in the same
              monthly budget is redirected to the next debt. Extra monthly amounts shown in the planner are assumed
              to be paid every month; moving a slider is a hypothetical scenario, not a payment to a lender.
            </p>
            <p className="mt-2">
              Calculations use unrounded values internally; displayed currency amounts are rounded for presentation
              (usually to whole dollars). The estimated payoff month is measured from the current month and the
              simulation stops after 600 months; if a balance remains, no payoff date is projected. The model does
              not include lender-specific compounding, daily accrual, fees, variable rates, changing minimums,
              payment due dates, missed payments, taxes, or any term not entered into the app. Actual lender
              calculations and statements may differ, including their cent-rounding rules. The app does not check
              your figures with your lender or move money on your behalf.
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
            <h2 className="font-display font-bold text-xl">Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old to create an account or use DebtFree. By using the platform, you confirm
              that you are 18 or older. Provide accurate account information and keep your sign-in details secure.
              Let us know promptly at debtfree2626@outlook.com if you suspect unauthorized access to your account.
            </p>
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
            <p className="mt-2">
              You may enter only information you have the right to provide. You retain your rights in the information
              you enter; you permit us to process it only as needed to provide and protect the Service, as described
              in our Privacy Policy. Do not enter someone else&apos;s sensitive financial or login information.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Availability and Accuracy</h2>
            <p className="mt-2">
              Payoff dates, interest estimates, and suggested actions depend on the information you enter and may not
              reflect lender fees, rate changes, or payment timing. Check figures with your lender before making a
              decision. We work to keep DebtFree available and accurate, but interruptions, errors, or changes can
              occur. No feature is a guarantee of a particular outcome or uninterrupted access.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Future Paid Subscriptions</h2>
            <p className="mt-2">
              DebtFree does not currently offer a paid subscription or collect subscription payments. If we introduce
              paid features, you will see the price, currency, billing interval, included features, taxes where
              applicable, renewal terms, and any trial terms before you choose to subscribe. Simply using the free
              Service will not enroll you in a paid plan.
            </p>
            <p className="mt-2">
              If you choose a recurring plan, payment will be due at the interval shown at checkout and the plan may
              renew automatically until cancelled, as clearly disclosed before purchase. We will explain how to
              cancel and when access ends before you subscribe. Cancelling will stop future renewals, subject to the
              terms shown at checkout; it will not automatically refund charges already made. We will give notice of
              price changes before they take effect and explain your cancellation options.
            </p>
            <p className="mt-2">
              Payment processing may be handled by a third-party provider under its own terms. Refunds, withdrawal
              rights, and taxes will be described at checkout and governed by applicable law; these Terms do not limit
              any mandatory consumer rights. We will update these Terms and the Privacy Policy before launching paid
              subscriptions with the actual provider and payment practices.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Account Closure</h2>
            <p className="mt-2">
              You can request account deletion by emailing debtfree2626@outlook.com. We may restrict or suspend access
              if necessary to address misuse, security risks, or a material breach of these Terms, subject to applicable
              law. See the Privacy Policy for what happens to your data after an account is closed. If paid plans are
              introduced, we will explain how account closure affects an active subscription before you buy.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Third-Party Links</h2>
            <p className="mt-2">
              The Service may link to websites or services we do not control. Their content and privacy practices are
              governed by their own terms and policies; please review those before using them.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Limitation of Liability</h2>
            <p className="mt-2">
              To the extent permitted by applicable law, DebtFree is not responsible for losses caused by inaccurate
              information you enter, differences between estimates and a lender&apos;s actual terms, or decisions
              made without verifying those terms. We do not guarantee uninterrupted availability or a particular
              financial result. Nothing in these Terms excludes or limits liability that cannot legally be excluded,
              including liability for fraud, intentional misconduct, or other non-excludable obligations, or limits
              your mandatory consumer rights.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Changes</h2>
            <p className="mt-2">
              We may update these Terms as the Service or applicable law changes. We will post the revised date and
              provide additional notice for material changes where required. If you do not agree with updated Terms,
              stop using the Service and contact us about closing your account.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Contact Us</h2>
            <p className="mt-2">
              For questions about these Terms or the Service, contact: <strong>debtfree2626@outlook.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

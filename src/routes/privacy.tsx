import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DebtFree" },
      { name: "description", content: "How DebtFree collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — DebtFree" },
      { property: "og:description", content: "How DebtFree collects, uses, and protects your personal information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        <p className="text-sm text-muted-foreground mt-2">Effective and Last Updated: September 20, 2026</p>

        <div className="prose prose-sm mt-8 space-y-6 text-foreground">
          <p>
            Welcome to DebtFree. We respect your privacy and are committed to protecting your personal information.
            This Privacy Policy explains what information we collect, why we use it, when it may be shared, how long
            it is kept, and the choices and rights available to you.
          </p>

          <p>
            This Policy applies to the DebtFree website, installable web application, accounts, and related services
            (together, the &quot;Service&quot;). It does not apply to third-party websites or services that have their own
            privacy policies.
          </p>

          <section>
            <h2 className="font-display font-bold text-xl">Who Is Responsible for Your Data</h2>
            <p className="mt-2">
              DebtFree is the controller responsible for personal data processed through the Service. DebtFree is
              based in Bulgaria and applies the EU General Data Protection Regulation (&quot;GDPR&quot;) and applicable
              Bulgarian data-protection law where they apply.
            </p>
            <p className="mt-2">
              Privacy contact: <strong>emailexample</strong>. This is a temporary contact placeholder and will be
              replaced with the official privacy email before the Service&apos;s wider public launch.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Information We Collect</h2>
            <p className="mt-2">Depending on how you use DebtFree, we may collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Account information:</strong> email address, password-related authentication data, display
                name, account identifiers, and sign-in details.
              </li>
              <li>
                <strong>Financial planning information:</strong> debt names, balances, interest rates, minimum and
                extra payment amounts, remaining months, payment records, notes, payoff strategy, and projected
                payoff dates. This information is entered by you and is not obtained directly from a bank.
              </li>
              <li>
                <strong>Progress and preference information:</strong> daily check-ins, actions marked complete,
                amounts reported as saved, goals, preferred payoff strategy, and onboarding answers.
              </li>
              <li>
                <strong>Waitlist or contact information:</strong> name, email address, source, and information you
                voluntarily provide when contacting us or expressing interest in the Service.
              </li>
              <li>
                <strong>Technical information:</strong> IP address, browser and device type, operating system,
                timestamps, referring pages, security logs, and basic request information that may be processed by
                our hosting and infrastructure providers.
              </li>
              <li>
                <strong>Local device information:</strong> onboarding answers, session details, authentication tokens,
                and preferences stored through browser local storage, session storage, or similar essential
                technologies.
              </li>
            </ul>
            <p className="mt-2">
              DebtFree does not currently connect to bank accounts and does not ask for or store bank-login
              credentials, full payment-card numbers, or government identification numbers. Please do not enter such
              information in debt names, payment notes, or other free-text fields.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">How We Use Your Information</h2>
            <p className="mt-2">We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create and secure your account and authenticate sign-ins</li>
              <li>Provide debt-payoff calculations, projections, progress tracking, and daily actions</li>
              <li>Save and synchronize the information you choose to enter</li>
              <li>Provide early access and send requested product updates or announcements</li>
              <li>Respond to inquiries, requests, complaints, and support messages</li>
              <li>Maintain, troubleshoot, secure, and improve the Service</li>
              <li>Detect misuse, fraud, security incidents, or violations of our Terms</li>
              <li>Comply with legal obligations and establish, exercise, or defend legal claims</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information or financial planning information. We do not use your debt
              information for third-party advertising, lending decisions, credit scoring, or determining eligibility
              for financial products.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Legal Basis for Processing</h2>
            <p className="mt-2">Where the GDPR or similar law applies, we process personal data because:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>it is necessary to provide the Service or take steps you request before creating an account;</li>
              <li>you have given consent, including for optional communications where consent is required;</li>
              <li>
                we have a legitimate interest in operating, securing, supporting, and improving the Service, provided
                those interests are not overridden by your rights; or
              </li>
              <li>processing is necessary to comply with law or protect legal rights.</li>
            </ul>
            <p className="mt-2">
              You may withdraw consent at any time. Withdrawal does not affect processing already carried out and may
              not apply where another lawful basis permits continued processing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Calculations and Automated Features</h2>
            <p className="mt-2">
              DebtFree uses the values you enter to generate mathematical estimates, payoff schedules, suggested
              actions, and motivational messages. These tools do not make legal or similarly significant decisions
              about you. Results are estimates, may be incomplete or inaccurate, and are provided for informational
              and educational purposes only. They are not financial, credit, tax, legal, or investment advice.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Sign-In Providers and Service Providers</h2>
            <p className="mt-2">
              We use carefully selected providers to operate the Service. They may process personal data only as
              needed to provide their services to us, subject to their contracts and applicable law. Current
              categories include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>cloud database, authentication, and application hosting providers;</li>
              <li>Google, when you choose &quot;Continue with Google,&quot; under Google&apos;s own privacy terms;</li>
              <li>authentication infrastructure used to complete the Google sign-in process;</li>
              <li>Google Fonts, which may receive technical request data such as your IP address when fonts load; and</li>
              <li>professional advisers or authorities where disclosure is legally necessary.</li>
            </ul>
            <p className="mt-2">
              Choosing Google sign-in may provide us with your email address, name, profile image, provider account
              identifier, and authentication tokens, depending on your Google settings and permissions. We do not
              receive your Google password.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Cookies and Local Storage</h2>
            <p className="mt-2">
              DebtFree uses essential browser storage and similar technologies to keep you signed in, protect account
              sessions, remember onboarding information, and preserve essential preferences. Blocking these
              technologies may prevent parts of the Service from working correctly.
            </p>
            <p className="mt-2">
              DebtFree does not currently use third-party advertising cookies or an in-app advertising network. If we
              later add non-essential analytics or advertising technologies, we will update this Policy and obtain
              consent where required before using them.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">When We May Disclose Information</h2>
            <p className="mt-2">We may disclose personal data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>to service providers acting on our instructions;</li>
              <li>when you request or authorize the disclosure;</li>
              <li>to comply with a valid legal obligation, court order, or lawful request;</li>
              <li>to protect users, the public, DebtFree, or the integrity and security of the Service; or</li>
              <li>
                as part of a merger, financing, reorganization, acquisition, or sale of assets, subject to appropriate
                confidentiality and notice requirements.
              </li>
            </ul>
            <p className="mt-2">
              We do not disclose personal information to data brokers and do not permit providers to use your debt
              information for their own marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">International Data Transfers</h2>
            <p className="mt-2">
              The Service is available globally, and providers may process information outside Bulgaria or the
              European Economic Area. Where required, we rely on an adequacy decision, the European Commission&apos;s
              Standard Contractual Clauses, or another legally recognized safeguard. You may request information about
              the safeguards relevant to your data using the contact listed below.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Data Retention</h2>
            <p className="mt-2">
              We keep account and financial planning information while your account is active and as needed to provide
              the Service. After account deletion, we delete or anonymize personal data within a reasonable period,
              except where limited retention is required for security, fraud prevention, dispute resolution, backup
              rotation, or legal compliance.
            </p>
            <p className="mt-2">We retain other information until:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You request deletion</li>
              <li>You unsubscribe</li>
              <li>The information is no longer required for the purposes described above</li>
            </ul>
            <p className="mt-2">
              Retention periods depend on the nature of the information, why it was collected, security needs, and
              applicable legal requirements. Residual copies may remain temporarily in protected backups until they
              are overwritten through the normal backup cycle.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Your Rights</h2>
            <p className="mt-2">
              Depending on your jurisdiction, including under the GDPR, UK GDPR, and certain U.S. state privacy laws,
              you may have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>know whether we process your data and access or receive a copy of it;</li>
              <li>correct inaccurate or incomplete information;</li>
              <li>request deletion of your personal data;</li>
              <li>restrict or object to certain processing;</li>
              <li>withdraw consent at any time;</li>
              <li>receive certain data in a portable format;</li>
              <li>opt out of sale, sharing, or targeted advertising where applicable; and</li>
              <li>not be discriminated against for exercising a privacy right.</li>
            </ul>
            <p className="mt-2">
              We do not currently sell personal data, share it for cross-context behavioral advertising, or use it for
              targeted advertising. To exercise a right, contact <strong>emailexample</strong>. We may need to verify
              your identity before completing a request. Authorized agents may submit requests where local law
              permits. We will respond within the period required by applicable law.
            </p>
            <p className="mt-2">
              If you are in the EEA, you may also lodge a complaint with your local supervisory authority. In Bulgaria,
              this is the Commission for Personal Data Protection. We encourage you to contact us first so we can try
              to resolve your concern.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Security</h2>
            <p className="mt-2">
              We use reasonable technical and organizational safeguards designed to protect information from
              unauthorized access, alteration, disclosure, loss, or misuse. These include authenticated accounts,
              access controls, encrypted network connections, and provider security controls.
            </p>
            <p className="mt-2">
              No internet transmission or storage system is completely secure. You are responsible for choosing a
              strong, unique password, protecting access to your device and account, and notifying us promptly if you
              suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Data Breaches</h2>
            <p className="mt-2">
              If a personal-data breach creates a risk to individuals, we will investigate, take appropriate remedial
              steps, notify the competent authority where required, and notify affected users when required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Children&apos;s Privacy</h2>
            <p className="mt-2">
              DebtFree is intended for adults and is not directed to children under 16. We do not knowingly collect
              personal data from anyone under 16. If you believe a child has provided us with personal data, contact us
              so we can investigate and delete it where appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Third-Party Links</h2>
            <p className="mt-2">
              The Service may link to third-party websites or services. Their privacy practices are governed by their
              own policies, and DebtFree is not responsible for their content or handling of personal information.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Policy as the Service, our providers, or applicable laws change. The revised version
              will show a new &quot;Last Updated&quot; date. If a change materially affects your rights or how we use personal
              data, we will provide additional notice through the Service, by email, or by another appropriate method
              before the change takes effect where required.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl">Contact Us</h2>
            <p className="mt-2">
              For privacy questions, complaints, or requests to access, correct, export, or delete your information,
              contact: <strong>emailexample</strong>.
            </p>
            <p className="mt-2 text-muted-foreground">
              Important: this placeholder must be replaced with a monitored email address before wider public launch.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";

export function ProjectionDisclaimer() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Estimates only, not financial, legal or tax advice. Results are not guaranteed; your lender&apos;s terms may differ.{" "}
      <Link to="/terms" className="text-primary underline underline-offset-2">How estimates work</Link>
    </p>
  );
}
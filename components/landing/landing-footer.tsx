import { Logo } from "@/components/ui/logo";

export function LandingFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo size="sm" />
        <div className="flex gap-5 text-xs text-muted"><a href="https://github.com/AgrimTawani/oss-manager" target="_blank" rel="noreferrer" className="hover:text-primary">GitHub</a><a href="/api/health" className="hover:text-primary">Status</a><span>MIT licensed</span></div>
      </div>
    </footer>
  );
}

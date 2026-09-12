import { SignInCard } from "./sign-in-card";

const MOCK_ISSUES = [
  { repo: "vercel/next.js", number: "#69842", title: "Improve error message for invalid route groups", author: "maintainer", tone: "text-blue-300" },
  { repo: "prisma/prisma", number: "#25718", title: "Document migration path for relation mode", author: "member", tone: "text-purple-300" },
  { repo: "tailwindlabs/tailwindcss", number: "#14505", title: "Add example for container query units", author: "contributor", tone: "text-amber-300" },
];

export function HeroSplit() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-accent">A focused inbox for open source</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl sm:leading-[1.08]">Find contribution opportunities worth your time.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-secondary">Track the projects you care about. OSS Manager filters new issues down to the ones opened by maintainers and established contributors, so you can spend less time watching tabs and more time shipping.</p>
          <div className="mt-8"><SignInCard /></div>
        </div>

        <div className="border border-border bg-panel shadow-2xl shadow-black/25">
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold text-primary">Issue inbox</span>
            <span className="text-xs text-muted">3 new</span>
          </div>
          <ul>
            {MOCK_ISSUES.map((issue) => (
              <li key={issue.title} className="flex gap-3 border-b border-border px-4 py-4 last:border-b-0">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <p className="text-xs text-muted"><span className="font-medium text-secondary">{issue.repo}</span> · {issue.number}</p>
                  <p className="mt-1.5 text-sm font-medium leading-5 text-primary">{issue.title}</p>
                  <p className={`mt-2 text-[11px] ${issue.tone}`}>Opened by {issue.author}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

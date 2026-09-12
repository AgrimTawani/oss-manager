const STEPS = [
  ["01", "Add repositories", "Paste an owner/repository pair for every project you want to contribute to."],
  ["02", "Let the inbox filter", "Every 15 minutes, new issues are checked against the author's relationship to the project."],
  ["03", "Pick your next issue", "Search, filter by repository, and open promising issues directly on GitHub."],
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">How it works</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">A quieter way to follow active projects.</h2></div>
        <ol className="mt-12 grid border-l border-t border-border sm:grid-cols-3">
          {STEPS.map(([number, title, description]) => (
            <li key={number} className="border-b border-r border-border p-6 sm:min-h-56">
              <span className="font-mono text-xs text-accent">{number}</span>
              <h3 className="mt-8 text-base font-semibold text-primary">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

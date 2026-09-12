const FEATURES = [
  ["Less noise", "Issues from first-time and unrelated reporters stay out of your inbox."],
  ["One place to scan", "Review opportunities across all of your tracked repositories in a single compact feed."],
  ["Private repo support", "Your GitHub session can read repositories your account already has access to."],
  ["No webhook setup", "A scheduled check keeps the inbox current without configuring every repository."],
];

export function FeaturesBento() {
  return (
    <section className="border-b border-border bg-sidebar">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-primary">Designed for contributors managing more than a handful of projects.</h2>
        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
          {FEATURES.map(([title, description]) => <div key={title} className="bg-sidebar p-6"><h3 className="text-sm font-semibold text-primary">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p></div>)}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Subtle brand glow accent */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[580px] h-[320px] bg-gradient-to-r from-primary/10 via-primary-blue/10 to-primary-purple/10 blur-[110px] rounded-full"
      />

      <div className="text-center max-w-2xl relative z-10 flex flex-col items-center">
        {/* Brand Logo & Avatar */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4 p-1 rounded-2xl bg-surface border border-border shadow-lg glow-ai-cyan">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/devis.png"
              alt="DeVis.AI Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-gradient-ai">
            DeVis.ai
          </h1>
          <p className="text-xl text-text-secondary mt-3">
            Your personal voice &amp; computer AI agent
          </p>
        </div>

        {/* Description */}
        <p className="text-text-secondary mb-8 leading-relaxed max-w-xl">
          Say <span className="text-primary font-semibold">"Hey Devis"</span> and let your AI agent
          browse the web, manage emails, automate tasks — all with your approval.
        </p>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="btn-primary px-8 py-3 rounded-lg font-semibold"
          >
            Get Started
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-8 py-3 rounded-lg font-semibold"
          >
            View on GitHub
          </a>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {[
            {
              icon: '🎙️',
              title: 'Wake Word',
              desc: 'Say "Hey Devis" — your agent responds instantly with voice confirmation.',
            },
            {
              icon: '🤖',
              title: 'AI Planning',
              desc: 'Multi-step task planning powered by Gemini or GPT-4o.',
            },
            {
              icon: '🔒',
              title: 'Safe by Design',
              desc: 'Every sensitive action requires your explicit approval.',
            },
          ].map((f) => (
            <div 
              key={f.title} 
              className="card-brand p-5 rounded-xl hover:border-primary/40 transition-all duration-150 group"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

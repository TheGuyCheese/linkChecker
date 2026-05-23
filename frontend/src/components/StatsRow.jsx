export default function StatsRow({ total, online, offline }) {
  return (
    <div className="w-full max-w-[860px] grid grid-cols-3 gap-md">
      <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col items-center justify-center gap-xs">
        <span className="font-mono text-headline-lg text-app-purple">{total}</span>
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">total checked</span>
      </div>
      <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col items-center justify-center gap-xs">
        <span className="font-mono text-headline-lg text-app-green">{online}</span>
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">online</span>
      </div>
      <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col items-center justify-center gap-xs">
        <span className="font-mono text-headline-lg text-app-red">{offline}</span>
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">offline</span>
      </div>
    </div>
  )
}

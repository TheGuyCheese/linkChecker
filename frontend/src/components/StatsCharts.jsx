import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
} from 'recharts'

const GREEN  = '#3ecf8e'
const RED    = '#f87171'
const PURPLE = '#7c5cbf'
const MUTED  = '#494551'

// Response time buckets
const BUCKETS = [
  { label: '<100ms',    min: 0,    max: 100,   color: '#3ecf8e' },
  { label: '100–300ms', min: 100,  max: 300,   color: '#5ba4e8' },
  { label: '300–600ms', min: 300,  max: 600,   color: '#eac25a' },
  { label: '600–1s',    min: 600,  max: 1000,  color: '#f09d4e' },
  { label: '>1s',       min: 1000, max: Infinity, color: '#f87171' },
]

function buildHistogram(results) {
  const counts = BUCKETS.map(b => ({ ...b, count: 0 }))
  for (const r of results) {
    if (r.responseTime == null) continue
    const bucket = counts.find(b => r.responseTime >= b.min && r.responseTime < b.max)
    if (bucket) bucket.count++
  }
  return counts
}

function computeStats(results) {
  const times = results.map(r => r.responseTime).filter(t => t != null && t > 0)
  if (!times.length) return { avg: null, min: null, max: null }
  return {
    avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    min: Math.min(...times),
    max: Math.max(...times),
  }
}

// Custom donut label in center
function DonutCenter({ cx, cy, online, total }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill={GREEN} fontSize={26} fontFamily="JetBrains Mono" fontWeight="600">
        {pct}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#958e9d" fontSize={11} fontFamily="JetBrains Mono">
        online
      </text>
    </g>
  )
}

function MetricCard({ label, value, unit = 'ms', color = '#cbc3d3' }) {
  return (
    <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col items-center justify-center gap-xs flex-1">
      <span className="font-mono text-[22px] font-semibold" style={{ color }}>
        {value != null ? value : '—'}
        {value != null && <span className="text-[13px] ml-1 text-on-surface-variant">{unit}</span>}
      </span>
      <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest text-center">
        {label}
      </span>
    </div>
  )
}

export default function StatsCharts({ results }) {
  const online  = results.filter(r => r.exists).length
  const offline = results.filter(r => !r.exists).length
  const donutData = [
    { name: 'Online',  value: online  },
    { name: 'Offline', value: offline },
  ]

  const histogram = buildHistogram(results)
  const { avg, min, max } = computeStats(results)
  const successRate = results.length > 0 ? Math.round((online / results.length) * 100) : 0

  return (
    <div className="w-full max-w-[860px] flex flex-col gap-md">

      {/* ── Row 1: donut + histogram ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-md">

        {/* Donut */}
        <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-3">
            Online / Offline
          </span>
          <div className="flex-1 flex items-center justify-center" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell key="online"  fill={GREEN} />
                  <Cell key="offline" fill={RED}   />
                </Pie>
                <DonutCenter cx={0} cy={0} online={online} total={results.length} />
                <ReTooltip
                  contentStyle={{ background: '#10101c', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#e1e1ef' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-lg mt-1">
            <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: GREEN }} />
              Online {online}
            </span>
            <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: RED }} />
              Offline {offline}
            </span>
          </div>
        </div>

        {/* Response time histogram */}
        <div className="bg-app-card border border-app-border rounded-lg p-md flex flex-col">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-3">
            Response time distribution
          </span>
          <div className="flex-1" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={histogram} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid vertical={false} stroke="#1e1e2e" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#958e9d', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#958e9d', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <BarTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#10101c', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#e1e1ef' }}
                  formatter={(v) => [`${v} URLs`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {histogram.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: metric cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <MetricCard label="Avg response" value={avg}         color={PURPLE} />
        <MetricCard label="Fastest"      value={min}         color={GREEN}  />
        <MetricCard label="Slowest"      value={max}         color={RED}    />
        <MetricCard label="Success rate" value={successRate} unit="%" color={successRate >= 80 ? GREEN : successRate >= 50 ? '#eac25a' : RED} />
      </div>

    </div>
  )
}

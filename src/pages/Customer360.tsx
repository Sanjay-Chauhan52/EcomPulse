import React, { useEffect, useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search, ShoppingCart, TrendingDown, TrendingUp, Star, AlertTriangle,
  CheckCircle2, Info, XCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  customer_id: string
  segment: string
  health_score: number
  health_bucket: string
  hesitation_score: number
  hesitation_bucket: string
  net_value: number
  gross_value: number
  orders: number
  ltv: number
  return_rate: number
  discount_pct: number
  discount_tier: string
  matrix_segment: string
  sentiment: number
  recent_rating: number | null
  diagnoses: string[]
  hist_orders_mo: number
  rec_orders_mo: number
  hist_sess_mo: number
  rec_sess_mo: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 0) {
  return n?.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) ?? "—"
}
function fmtUsd(n: number) { return "$" + fmt(n, 2) }

function healthColor(bucket: string) {
  if (bucket === "Healthy") return "#16a34a"
  if (bucket === "Declining") return "#f59e0b"
  if (bucket === "At Risk") return "#dc2626"
  return "#6b7280"
}

function healthBg(bucket: string) {
  if (bucket === "Healthy") return "bg-green-50 border-green-200"
  if (bucket === "Declining") return "bg-amber-50 border-amber-200"
  if (bucket === "At Risk") return "bg-red-50 border-red-200"
  return "bg-slate-50 border-slate-200"
}

function sentimentLabel(s: number) {
  if (s >= 0.3) return { label: "Positive", cls: "text-green-600" }
  if (s <= -0.3) return { label: "Negative", cls: "text-red-600" }
  return { label: "Neutral", cls: "text-slate-500" }
}

// ─── Health gauge component ───────────────────────────────────────────────────
function HealthGauge({ score, bucket }: { score: number; bucket: string }) {
  const color = healthColor(bucket)
  const pct = Math.min(score, 100)
  const r = 60
  const cx = 80
  const cy = 75
  const circumference = Math.PI * r          // half-circle arc length
  const strokeDash = (pct / 100) * circumference
  const rotate = -180                         // start at left

  return (
    <div className="flex flex-col items-center py-2">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
        />
        {/* Label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{score.toFixed(1)}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#6b7280">/ 100</text>
      </svg>
      <Badge
        variant="outline"
        style={{ borderColor: color, color }}
        className="text-xs font-semibold mt-1"
      >
        {bucket}
      </Badge>
    </div>
  )
}

// ─── Diagnosis banner ─────────────────────────────────────────────────────────
function DiagnosisBadge({ label }: { label: string }) {
  const silent = label === "Silent Dissatisfaction"
  const retPar = label === "Return Paradox"
  const highHes = label === "High Hesitation"
  const lost = label === "Lost Health"
  const atRisk = label === "At Risk Health"
  const healthy = label === "Healthy Loyal"
  const vocal = label === "Vocal Loyalist"

  let cls = "bg-slate-100 text-slate-700 border-slate-200"
  let Icon = Info
  if (silent || retPar || lost) { cls = "bg-red-50 text-red-700 border-red-200"; Icon = XCircle }
  else if (highHes || atRisk) { cls = "bg-amber-50 text-amber-700 border-amber-200"; Icon = AlertTriangle }
  else if (healthy) { cls = "bg-green-50 text-green-700 border-green-200"; Icon = CheckCircle2 }
  else if (vocal) { cls = "bg-blue-50 text-blue-700 border-blue-200"; Icon = Info }

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${cls}`}>
      <Icon size={13} />
      {label}
    </div>
  )
}

// ─── Mini velocity bar chart ──────────────────────────────────────────────────
function VelocityChart({ hist, rec, label, unit }: { hist: number; rec: number; label: string; unit: string }) {
  const improved = rec >= hist
  const data = [
    { name: "Historical", value: hist, fill: "#94a3b8" },
    { name: "Recent 60d", value: rec, fill: improved ? "#16a34a" : "#dc2626" },
  ]
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={32} />
          <Tooltip formatter={(v: any) => [`${(v as number).toFixed(2)} ${unit}`, ""]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
          <ReferenceLine y={hist} stroke="#94a3b8" strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Historical: <b>{hist.toFixed(2)}</b></span>
        <span className={improved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
          Recent: {rec.toFixed(2)} {improved ? "▲" : "▼"}
        </span>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold leading-tight ${highlight ?? ""}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Preset config ─────────────────────────────────────────────────────────────
const PRESETS = [
  { id: "C06465", label: "Silent Dissatisfaction" },
  { id: "C00003", label: "Return Paradox" },
  { id: "C07040", label: "Declining Velocity" },
  { id: "C00525", label: "Healthy & Loyal" },
  { id: "C00001", label: "Continued Buyer" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Customer360() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState("C06465")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetch("/data/customers.json")
      .then(r => r.json())
      .then((j: Customer[]) => { setCustomers(j); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    search.length >= 2
      ? customers.filter(c => c.customer_id.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
      : [],
    [customers, search]
  )

  const cust = useMemo(() => customers.find(c => c.customer_id === selectedId) ?? null, [customers, selectedId])

  function selectCustomer(id: string) {
    setSelectedId(id)
    setSearch("")
    setDropdownOpen(false)
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">Customer 360</h1>
          <Badge variant="outline" className="text-xs font-medium">CRM Layer</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Single-Customer Intelligence Profile &amp; Velocity Diagnostic View</p>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Case Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => selectCustomer(p.id)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${selectedId === p.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
                }`}
            >
              <div className="flex items-center gap-2">
                <span>{p.label}</span>
                <span className="font-mono opacity-70">({p.id})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Customer */}
      {selectedId && (
        <div className="rounded-xl border bg-muted/30 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Selected Customer
          </p>

          <p className="text-3xl font-bold font-mono tracking-tight">
            {selectedId}
          </p>
        </div>
      )}
      {/* Customer Dropdown */}
      <div className="relative max-w-xs">
        <select
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            selectCustomer(e.target.value);
          }}
        >
          <option value="">Select Customer</option>

          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.customer_id} - {c.segment} - {c.health_bucket}
            </option>
          ))}
        </select>
      </div>

      {/* Profile Panel */}
      {cust ? (
        <div className="space-y-6">
          {/* Diagnosis strip */}
          {cust.diagnoses.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Automated Diagnosis</p>
              <div className="flex flex-wrap gap-2">
                {cust.diagnoses.map(d => <DiagnosisBadge key={d} label={d} />)}
              </div>
            </div>
          )}

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT: Health + Hesitation + Profile */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-semibold">Relationship Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <HealthGauge score={cust.health_score} bucket={cust.health_bucket} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-muted-foreground">⏳ Purchase Hesitation</span>
                      <span className="font-semibold">{cust.hesitation_score.toFixed(1)} / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(cust.hesitation_score, 100)}%`,
                          backgroundColor: cust.hesitation_bucket === "High" ? "#dc2626" : cust.hesitation_bucket === "Moderate" ? "#f59e0b" : "#16a34a",
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Tier: <b>{cust.hesitation_bucket}</b></p>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="text-xs space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between"><span>Segment</span><Badge variant="secondary" className="text-[11px]">{cust.segment}</Badge></div>
                    <div className="flex justify-between"><span>Matrix</span><span className="font-medium text-foreground">{cust.matrix_segment}</span></div>
                    <div className="flex justify-between"><span>Discount Tier</span><span className="font-medium text-foreground">{cust.discount_tier}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Metrics + Trends + Sentiment */}
            <div className="lg:col-span-2 space-y-4">
              {/* Commercial Metrics */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Commercial &amp; Behavioral Metrics</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Net Spending" value={fmtUsd(cust.net_value)} highlight="text-blue-600" />
                  <StatCard label="Gross GMV" value={fmtUsd(cust.gross_value)} />
                  <StatCard label="Total Orders" value={fmt(cust.orders)} />
                  <StatCard label="Lifetime Value" value={fmtUsd(cust.ltv)} highlight="text-indigo-600" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <StatCard
                    label="Return Rate"
                    value={`${cust.return_rate.toFixed(1)}%`}
                    highlight={cust.return_rate > 20 ? "text-red-600" : cust.return_rate > 10 ? "text-amber-600" : "text-green-600"}
                  />
                  <StatCard
                    label="Discount Dep."
                    value={`${cust.discount_pct.toFixed(1)}%`}
                    sub={cust.discount_tier}
                    highlight={cust.discount_pct > 30 ? "text-amber-600" : ""}
                  />
                  <StatCard label="VADER Sentiment" value={cust.sentiment >= 0 ? `+${cust.sentiment.toFixed(3)}` : cust.sentiment.toFixed(3)} highlight={sentimentLabel(cust.sentiment).cls} />
                  <StatCard label="Recent Rating" value={cust.recent_rating != null ? `${cust.recent_rating} / 5` : "No reviews"} />
                </div>
              </div>

              {/* Velocity Trends */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Change-Over-Time Dynamics (Historical vs Last 60 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <VelocityChart hist={cust.hist_orders_mo} rec={cust.rec_orders_mo} label="Purchase Frequency (orders/mo)" unit="/mo" />
                    <VelocityChart hist={cust.hist_sess_mo} rec={cust.rec_sess_mo} label="Session Activity (sessions/mo)" unit="/mo" />
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment summary */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Review Behavior &amp; Sentiment Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        {cust.recent_rating != null ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < cust.recent_rating! ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No review on file</span>
                        )}
                      </div>
                      {cust.recent_rating != null && <p className="text-xs text-muted-foreground">Most recent: {cust.recent_rating} / 5</p>}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">VADER Sentiment Score</p>
                      <p className={`text-lg font-bold font-mono ${sentimentLabel(cust.sentiment).cls}`}>
                        {cust.sentiment >= 0 ? "+" : ""}{cust.sentiment.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">{sentimentLabel(cust.sentiment).label} polarity</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Detected Patterns</p>
                      <div className="flex flex-wrap gap-1">
                        {cust.diagnoses.length > 0
                          ? cust.diagnoses.map(d => (
                            <span key={d} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{d}</span>
                          ))
                          : <span className="text-xs text-muted-foreground italic">Standard profile — no anomalies</span>
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No customer selected</p>
            <p className="text-sm">Use the search above or click a preset to load a profile.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
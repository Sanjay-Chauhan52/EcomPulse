import React, { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, TrendingDown, DollarSign, RefreshCw, Tag, UserX, RotateCcw, AlertTriangle, VolumeX, Clock, AlertCircle } from "lucide-react"

interface OverviewData {
  kpis: {
    total_customers: number; active_customers: number; active_customers_pct: number
    at_risk_customers: number; at_risk_customers_pct: number
    lost_customers: number; lost_customers_pct: number
    total_net_value: number; avg_net_value: number
    repeat_rate: number; return_rate: number
    avg_discount_pct: number; deal_dependent_cnt: number; deal_dependent_pct: number
  }
  top_issues: {
    silent_dissatisfaction: { count: number; pct: number; title: string; description: string }
    high_hesitation: { count: number; pct: number; title: string; description: string }
    return_paradox: { count: number; pct: number; title: string; description: string }
    contradictions_total: { count: number; pct: number; title: string; description: string }
  }
  distributions: {
    relationship_health: { bucket: string; count: number }[]
    discount_matrix: { segment: string; count: number }[]
    crm_segments: { segment: string; count: number }[]
    purchase_hesitation: { tier: string; count: number }[]
  }
}

function fmt(n: number) { return n?.toLocaleString("en-US") ?? "—" }

function KpiCard({ icon, label, value, sub, valueClass = "" }: {
  icon: React.ReactNode; label: string; value: string; sub: string; valueClass?: string
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <span className="text-muted-foreground/60">{icon}</span>
        </div>
        <p className={`text-2xl font-bold leading-none mb-1 ${valueClass}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

const ISSUE_STYLE: Record<string, { border: string; bg: string; badge: string; icon: React.ReactNode; severity: string }> = {
  silent_dissatisfaction: { border: "border-l-4 border-red-500", bg: "bg-red-50/50", badge: "bg-red-100 text-red-700", icon: <VolumeX className="h-5 w-5 text-red-600" />, severity: "Critical" },
  high_hesitation:        { border: "border-l-4 border-amber-500", bg: "bg-amber-50/50", badge: "bg-amber-100 text-amber-700", icon: <Clock className="h-5 w-5 text-amber-600" />, severity: "High" },
  return_paradox:         { border: "border-l-4 border-red-500", bg: "bg-red-50/50", badge: "bg-red-100 text-red-700", icon: <RotateCcw className="h-5 w-5 text-red-600" />, severity: "Critical" },
  contradictions_total:   { border: "border-l-4 border-blue-400", bg: "bg-blue-50/50", badge: "bg-blue-100 text-blue-700", icon: <AlertCircle className="h-5 w-5 text-blue-500" />, severity: "Monitor" },
}

const HEALTH_COLORS: Record<string, string> = { Healthy: "#16a34a", Declining: "#f59e0b", "At Risk": "#dc2626", Lost: "#6b7280" }
const MATRIX_COLORS: Record<string, string> = { "Loyal Valuable": "#16a34a", "Deal-dependent Valuable": "#3b82f6", Normal: "#a3a3a3", "Potentially Unprofitable": "#dc2626" }
const SEG_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#e9d5ff"]
const HES_COLORS: Record<string, string> = { Low: "#16a34a", Moderate: "#f59e0b", High: "#dc2626" }

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{label ?? payload[0].name}</p>
      <p className="text-muted-foreground">{fmt(payload[0].value)} customers</p>
    </div>
  )
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/data/overview.json").then(r => r.json()).then(j => { setData(j); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!data) return <p className="text-destructive">Failed to load overview data.</p>

  const k = data.kpis
  const issues = data.top_issues

  return (
    <div className="space-y-8 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Commercial Overview</h1>
          <Badge variant="outline" className="text-xs font-medium">CRM Layer</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Macro Customer Health, Revenue Dynamics &amp; Top Operational Issues</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Commercial Key Performance Indicators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={<Users size={16} />} label="Total Customers" value={fmt(k.total_customers)} sub={`${fmt(k.active_customers)} with recorded orders`} />
          <KpiCard icon={<UserCheck size={16} />} label="Active Customers" value={fmt(k.active_customers)} sub={`${k.active_customers_pct.toFixed(1)}% of total portfolio`} valueClass="text-green-600" />
          <KpiCard icon={<AlertTriangle size={16} />} label="At-Risk Customers" value={fmt(k.at_risk_customers)} sub={`${k.at_risk_customers_pct.toFixed(1)}% health decline`} valueClass="text-amber-600" />
          <KpiCard icon={<DollarSign size={16} />} label="Net Customer Value (GMV)" value={`$${(k.total_net_value / 1e6).toFixed(2)}M`} sub={`$${k.avg_net_value.toFixed(2)} avg / customer`} valueClass="text-blue-600" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <KpiCard icon={<RefreshCw size={16} />} label="Repeat Purchase Rate" value={`${k.repeat_rate.toFixed(1)}%`} sub="2+ orders per active customer" valueClass="text-green-600" />
          <KpiCard icon={<RotateCcw size={16} />} label="Overall Return Rate" value={`${k.return_rate.toFixed(2)}%`} sub="Erosion of Gross GMV" valueClass="text-red-600" />
          <KpiCard icon={<Tag size={16} />} label="Discount Dependency" value={`${k.deal_dependent_pct.toFixed(1)}%`} sub={`${k.avg_discount_pct.toFixed(1)}% avg discount usage`} valueClass="text-amber-600" />
          <KpiCard icon={<UserX size={16} />} label="Lost Accounts" value={fmt(k.lost_customers)} sub={`${k.lost_customers_pct.toFixed(1)}% near-zero activity`} valueClass="text-slate-500" />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Top Commercial Issues &amp; Behavioral Friction</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {(["silent_dissatisfaction","high_hesitation","return_paradox","contradictions_total"] as const).map(key => {
            const issue = issues[key]
            const s = ISSUE_STYLE[key]
            return (
              <div key={key} className={`rounded-xl p-5 ${s.bg} ${s.border} shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge}`}>{s.severity}</span>
                </div>
                <p className="text-sm font-semibold leading-tight mb-1">{issue.title}</p>
                <p className="text-2xl font-bold mb-1">{fmt(issue.count)}</p>
                <p className="text-xs font-medium text-muted-foreground mb-3">{issue.pct.toFixed(1)}% of all accounts</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Strategic Portfolio Distributions</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Relationship Health Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.distributions.relationship_health} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.distributions.relationship_health.map(d => <Cell key={d.bucket} fill={HEALTH_COLORS[d.bucket] ?? "#94a3b8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">2×2 Discount Dependency &amp; Value Matrix</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart layout="vertical" data={data.distributions.discount_matrix} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="segment" type="category" tick={{ fontSize: 11 }} width={155} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.distributions.discount_matrix.map(d => <Cell key={d.segment} fill={MATRIX_COLORS[d.segment] ?? "#94a3b8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Customer Value Segments (CRM)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.distributions.crm_segments} dataKey="count" nameKey="segment" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {data.distributions.crm_segments.map((_, i) => <Cell key={i} fill={SEG_COLORS[i % SEG_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: any) => [fmt(v as number), "Customers"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Purchase Hesitation Tiers</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.distributions.purchase_hesitation} dataKey="count" nameKey="tier" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {data.distributions.purchase_hesitation.map(d => <Cell key={d.tier} fill={HES_COLORS[d.tier] ?? "#94a3b8"} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: any) => [fmt(v as number), "Customers"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
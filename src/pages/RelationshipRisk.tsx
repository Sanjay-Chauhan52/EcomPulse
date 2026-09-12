import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Users, Award, VolumeX, MessageSquare, AlertOctagon, Star } from "lucide-react"

interface QuadrantSummary {
  name: string; emoji: string; color: string
  sentiment: string; velocity: string; description: string
  count: number; pct: number
}
interface DrillEntry {
  customer_id: string; segment: string; health_score: number; health_bucket: string
  recent_rating: number | null; sentiment_score: number; contradiction_flag: string | null
  net_spending: number; total_orders: number; refund_ratio: number
}
interface RiskData {
  summary: {
    total_accounts: number
    quadrants: {
      champions: QuadrantSummary
      silent_churn: QuadrantSummary
      vocal_loyalists: QuadrantSummary
      detractors: QuadrantSummary
    }
  }
  drill_down: {
    champions: DrillEntry[]
    silent_churn: DrillEntry[]
    vocal_loyalists: DrillEntry[]
    detractors: DrillEntry[]
  }
}

function fmt(n: number, d = 0) { return n?.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) ?? "—" }

type QuadKey = "champions" | "silent_churn" | "vocal_loyalists" | "detractors"

const QUAD_ICONS: Record<QuadKey, React.ReactNode> = {
  champions: <Award className="h-6 w-6 text-green-600" />,
  silent_churn: <VolumeX className="h-6 w-6 text-amber-600" />,
  vocal_loyalists: <MessageSquare className="h-6 w-6 text-blue-600" />,
  detractors: <AlertOctagon className="h-6 w-6 text-red-600" />,
}

const QUAD_LAYOUT: { key: QuadKey; pos: string }[] = [
  { key: "vocal_loyalists", pos: "col-start-1 row-start-1" },
  { key: "champions", pos: "col-start-2 row-start-1" },
  { key: "detractors", pos: "col-start-1 row-start-2" },
  { key: "silent_churn", pos: "col-start-2 row-start-2" },
]

function healthColor(bucket: string) {
  if (bucket === "Healthy") return "text-green-600"
  if (bucket === "Declining") return "text-amber-600"
  if (bucket === "At Risk") return "text-red-600"
  return "text-slate-500"
}

export default function RelationshipRisk() {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<QuadKey | null>(null)
  const [expandPage, setExpandPage] = useState(0)
  const PAGE = 25

  useEffect(() => {
    fetch("/data/relationship_matrix.json").then(r => r.json()).then(j => { setData(j); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function toggle(key: QuadKey) {
    if (expanded === key) { setExpanded(null) } else { setExpanded(key); setExpandPage(0) }
  }

  const drillRows = useMemo(() => {
    if (!data || !expanded) return []
    return data.drill_down[expanded] ?? []
  }, [data, expanded])

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!data) return <p className="text-destructive">Failed to load relationship matrix data.</p>

  const q = data.summary.quadrants

  return (
    <div className="space-y-8 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">Relationship Risk</h1>
          <Badge variant="outline" className="text-xs font-medium">CRM Layer</Badge>
        </div>
        <p className="text-muted-foreground text-sm">2×2 Sentiment × Behaviour Matrix — {fmt(data.summary.total_accounts)} accounts classified</p>
      </div>

      {/* Axis labels + 2x2 grid */}
      <section>
        <div className="relative">

          <div className="ml-4">
            {/* X-axis header */}
            <div className="grid grid-cols-2 mb-2 gap-4 px-2">
              <div className="text-center text-xs font-semibold text-red-500 uppercase tracking-wider">Negative Sentiment</div>
              <div className="text-center text-xs font-semibold text-green-600 uppercase tracking-wider">Positive Sentiment</div>
            </div>

            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {QUAD_LAYOUT.map(({ key, pos }) => {
                const qd = q[key]
                const isExpanded = expanded === key
                return (
                  <div key={key} className={`${pos} rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer hover:shadow-md`}
                    style={{ borderColor: qd.color + "66", backgroundColor: qd.color + "0d" }}
                    onClick={() => toggle(key)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-1.5 rounded-lg bg-background/80 shadow-xs border">{QUAD_ICONS[key]}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: qd.color }}>
                          {qd.pct.toFixed(1)}%
                        </span>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>
                    <h3 className="text-base font-bold leading-tight mb-1" style={{ color: qd.color }}>{qd.name}</h3>
                    <p className="text-3xl font-bold mb-2">{fmt(qd.count)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{qd.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-[10px] border rounded-full px-2 py-0.5 font-medium" style={{ borderColor: qd.color + "66", color: qd.color }}>
                        Sentiment: {qd.sentiment}
                      </span>
                      <span className="text-[10px] border rounded-full px-2 py-0.5 font-medium" style={{ borderColor: qd.color + "66", color: qd.color }}>
                        Velocity: {qd.velocity}
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-3 flex items-center gap-1 text-muted-foreground">
                      <Users size={11} /> Click to {isExpanded ? "collapse" : "expand"} sample customers
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Legend strip */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["champions", "silent_churn", "vocal_loyalists", "detractors"] as QuadKey[]).map(key => {
            const qd = q[key]
            return (
              <div key={key} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <span className="text-lg">{qd.emoji}</span>
                <div>
                  <p className="text-xs font-semibold">{qd.name}</p>
                  <p className="text-xl font-bold" style={{ color: qd.color }}>{fmt(qd.count)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Expanded drill-down table */}
      {expanded && drillRows.length > 0 && (
        <section>
          <div className="h-px bg-border mb-6" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{q[expanded].emoji}</span>
            <h2 className="text-sm font-semibold">{q[expanded].name} — Sample Accounts</h2>
            <Badge variant="secondary">{fmt(drillRows.length)} shown</Badge>
          </div>
          <Card className="shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">Customer ID</th>
                    <th className="px-4 py-3 text-left">Segment</th>
                    <th className="px-4 py-3 text-left">Health</th>
                    <th className="px-4 py-3 text-right">Rating</th>
                    <th className="px-4 py-3 text-right">Sentiment</th>
                    <th className="px-4 py-3 text-right">Net Spend</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                    <th className="px-4 py-3 text-right">Refund %</th>
                    <th className="px-4 py-3 text-left">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {drillRows.slice(expandPage * PAGE, (expandPage + 1) * PAGE).map((row, i) => (
                    <tr key={row.customer_id} className={`border-b hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-2 font-mono font-semibold text-xs text-primary">{row.customer_id}</td>
                      <td className="px-4 py-2 text-xs">{row.segment}</td>
                      <td className="px-4 py-2 text-xs">
                        <span className={`font-semibold ${healthColor(row.health_bucket)}`}>{row.health_bucket}</span>
                        <span className="text-muted-foreground ml-1">({row.health_score.toFixed(0)})</span>
                      </td>
                      <td className="px-4 py-2 text-right text-xs">
                        {row.recent_rating != null ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {row.recent_rating}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-xs font-mono">{row.sentiment_score >= 0 ? "+" : ""}{row.sentiment_score.toFixed(3)}</td>
                      <td className="px-4 py-2 text-right text-xs">${fmt(row.net_spending, 2)}</td>
                      <td className="px-4 py-2 text-right text-xs">{row.total_orders}</td>
                      <td className="px-4 py-2 text-right text-xs">{(row.refund_ratio * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 text-xs">
                        {row.contradiction_flag ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.contradiction_flag === "PSNB" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {row.contradiction_flag}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {drillRows.length > PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
                <span>Showing {expandPage * PAGE + 1}–{Math.min((expandPage + 1) * PAGE, drillRows.length)} of {drillRows.length}</span>
                <div className="flex gap-2">
                  <button disabled={expandPage === 0} onClick={() => setExpandPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted">← Prev</button>
                  <button disabled={(expandPage + 1) * PAGE >= drillRows.length} onClick={() => setExpandPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted">Next →</button>
                </div>
              </div>
            )}
          </Card>
        </section>
      )}
    </div>
  )
}
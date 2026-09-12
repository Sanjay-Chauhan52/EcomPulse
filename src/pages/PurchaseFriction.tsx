import React, { useEffect, useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUpDown, ShoppingCart, Eye, CreditCard, TrendingDown } from "lucide-react"

interface CategoryRow {
  rank: number
  category_code: string
  tier: string
  friction_score: number
  views: number
  cart_adds: number
  purchases: number
  cart_rate_pct: number
  conversion_rate_pct: number
  dropoff_rate_pct: number
}
interface FrictionData {
  funnel: {
    views: number; cart_adds: number; purchases: number
    view_to_cart_pct: number; cart_to_purchase_pct: number; overall_conversion_pct: number
  }
  top_high_friction: CategoryRow[]
  top_low_friction: CategoryRow[]
  categories: CategoryRow[]
}

function fmt(n: number) { return n?.toLocaleString("en-US") ?? "—" }

type SortKey = "rank" | "friction_score" | "views" | "conversion_rate_pct" | "dropoff_rate_pct"

function tierStyle(tier: string): string {
  if (tier.includes("High")) return "bg-red-100 text-red-700 border-red-200"
  if (tier.includes("Medium")) return "bg-amber-100 text-amber-700 border-amber-200"
  return "bg-green-100 text-green-700 border-green-200"
}

function FunnelStep({ label, value, pct, icon, color }: {
  label: string; value: number; pct?: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="rounded-xl p-4 w-full text-center shadow-sm border" style={{ backgroundColor: color + "18", borderColor: color + "44" }}>
        <div className="flex justify-center mb-2" style={{ color }}>{icon}</div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold" style={{ color }}>{fmt(value)}</p>
        {pct && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
            <span>{pct}% drop-off</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default function PurchaseFriction() {
  const [data, setData] = useState<FrictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortAsc, setSortAsc] = useState(true)
  const [filterTier, setFilterTier] = useState<string>("All")
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    fetch("/data/friction.json").then(r => r.json()).then(j => { setData(j); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const sorted = useMemo(() => {
    if (!data) return []
    let rows = [...data.categories]
    if (filterTier !== "All") rows = rows.filter(r => r.tier.includes(filterTier))
    rows.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return rows
  }, [data, sortKey, sortAsc, filterTier])

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
    setPage(0)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!data) return <p className="text-destructive">Failed to load friction data.</p>

  const f = data.funnel
  const dropoffViewToCart = (100 - f.view_to_cart_pct).toFixed(2)
  const dropoffCartToPurchase = (100 - f.cart_to_purchase_pct).toFixed(2)

  const funnelBarData = [
    { stage: "Page Views", value: f.views, fill: "#6366f1" },
    { stage: "Cart Adds", value: f.cart_adds, fill: "#f59e0b" },
    { stage: "Purchases", value: f.purchases, fill: "#16a34a" },
  ]

  const tiers = ["All", "High", "Medium", "Low"]

  function SortHeader({ k, label }: { k: SortKey; label: string }) {
    return (
      <button
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        <ArrowUpDown size={11} className={sortKey === k ? "text-primary" : "text-muted-foreground/50"} />
      </button>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Friction</h1>
          <Badge variant="outline" className="text-xs font-medium">Behavioural Layer</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Session Funnel Drop-Off Analysis &amp; Category-Level Purchase Friction</p>
      </div>

      {/* Funnel KPI row */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Overall Conversion Funnel</h2>
        <div className="flex items-stretch gap-3">
          <FunnelStep label="Page Views" value={f.views} icon={<Eye size={20} />} color="#6366f1" />
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <ArrowDown size={16} className="text-red-400" />
            <span className="text-[10px] font-bold text-red-500">{dropoffViewToCart}% lost</span>
            <p className="text-[10px] text-muted-foreground">{f.view_to_cart_pct}% added</p>
          </div>
          <FunnelStep label="Cart Adds" value={f.cart_adds} pct={dropoffViewToCart} icon={<ShoppingCart size={20} />} color="#f59e0b" />
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <ArrowDown size={16} className="text-red-400" />
            <span className="text-[10px] font-bold text-red-500">{dropoffCartToPurchase}% lost</span>
            <p className="text-[10px] text-muted-foreground">{f.cart_to_purchase_pct}% converted</p>
          </div>
          <FunnelStep label="Purchases" value={f.purchases} pct={dropoffCartToPurchase} icon={<CreditCard size={20} />} color="#16a34a" />
        </div>

        <div className="mt-4 rounded-xl border bg-amber-50 border-amber-200 px-5 py-3 flex items-center gap-3">
          <TrendingDown size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-amber-700">Overall Conversion Rate: {f.overall_conversion_pct}%</span>
            <span className="text-muted-foreground ml-2">— only {fmt(f.purchases)} purchases from {fmt(f.views)} page views. The view-to-cart step is the largest bottleneck ({dropoffViewToCart}% drop).</span>
          </p>
        </div>
      </section>

      {/* Funnel bar chart */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Funnel Volume by Stage</h2>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelBarData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11 }} width={48} />
                <Tooltip formatter={(v: any) => [fmt(v as number), "Events"]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {funnelBarData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" formatter={(v: any) => fmt(v as number)} style={{ fontSize: 11, fill: "#6b7280" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <div className="h-px bg-border" />

      {/* Category Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category-Level Friction Analysis</h2>
          <div className="flex gap-2">
            {tiers.map(t => (
              <button
                key={t}
                onClick={() => { setFilterTier(t); setPage(0) }}
                className={`text-xs px-3 py-1 rounded-full border transition-colors inline-flex items-center gap-1.5 ${filterTier === t ? "bg-primary text-primary-foreground border-primary font-medium" : "border-border hover:bg-muted text-muted-foreground"}`}
              >
                {t === "High" && <span className="h-2 w-2 rounded-full bg-red-500" />}
                {t === "Medium" && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                {t === "Low" && <span className="h-2 w-2 rounded-full bg-green-500" />}
                {t === "All" ? "All Tiers" : t === "High" ? "High Friction" : t === "Medium" ? "Medium Friction" : "Low Friction"}
              </button>
            ))}
          </div>
        </div>

        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left"><SortHeader k="rank" label="Rank" /></th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Tier</th>
                  <th className="px-4 py-3 text-right"><SortHeader k="friction_score" label="Friction Score" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader k="views" label="Views" /></th>
                  <th className="px-4 py-3 text-right">Cart Adds</th>
                  <th className="px-4 py-3 text-right">Purchases</th>
                  <th className="px-4 py-3 text-right"><SortHeader k="conversion_rate_pct" label="Conv. %" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader k="dropoff_rate_pct" label="Drop-off %" /></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.category_code} className={`border-b hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">#{row.rank}</td>
                    <td className="px-4 py-2.5 font-medium text-xs font-mono">{row.category_code}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierStyle(row.tier)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${row.tier.includes("High") ? "bg-red-500" : row.tier.includes("Medium") ? "bg-amber-500" : "bg-green-500"}`} />
                        {row.tier}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      <span className={row.friction_score >= 75 ? "text-red-600" : row.friction_score >= 40 ? "text-amber-600" : "text-green-600"}>
                        {row.friction_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmt(row.views)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmt(row.cart_adds)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmt(row.purchases)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-green-700">{row.conversion_rate_pct.toFixed(2)}%</td>
                    <td className="px-4 py-2.5 text-right font-medium text-red-600">{row.dropoff_rate_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} categories</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted transition-colors">← Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-muted transition-colors">Next →</button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
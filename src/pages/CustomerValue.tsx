import React, { useEffect, useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Percent, TrendingDown, TrendingUp, Info, AlertTriangle } from "lucide-react"

interface WaterfallStep {
  label: string
  value: number
  measure: "absolute" | "relative" | "total"
  formatted: string
}

interface ScatterPoint {
  customer_id: string
  segment: string
  health_score: number
  health_bucket: string
  net_spending: number
  gross_value: number
  total_orders: number
  refund_ratio: number
  discount_dep_pct: number
  matrix_segment: string
  return_paradox_flag: string
}

interface CustomerValueData {
  waterfall: {
    gross_catalog: number
    discounts: number
    refunds: number
    cancellations: number
    pending: number
    net_realized: number
    total_deductions: number
    realization_efficiency_pct: number
    steps: WaterfallStep[]
  }
  benchmarks: {
    median_net_spending: number
    health_neutral_threshold: number
    return_paradox_count: number
    return_paradox_pct: number
  }
  scatter_points: ScatterPoint[]
}

const HEALTH_COLORS: Record<string, string> = {
  Healthy: "#16a34a",
  Declining: "#f59e0b",
  "At Risk": "#dc2626",
  Lost: "#6b7280",
}

export default function CustomerValue() {
  const [data, setData] = useState<CustomerValueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [colorBy, setColorBy] = useState<"health_bucket" | "segment" | "return_paradox_flag">("health_bucket")
  const [segmentFilter, setSegmentFilter] = useState<string>("All")

  useEffect(() => {
    fetch("/data/customer_value.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load customer value data:", err)
        setLoading(false)
      })
  }, [])

  // Process waterfall chart data into floating bars
  const waterfallChartData = useMemo(() => {
    if (!data?.waterfall?.steps) return []

    let currentRunningTotal = 0
    return data.waterfall.steps.map((step) => {
      if (step.measure === "absolute") {
        currentRunningTotal = step.value
        return {
          name: step.label,
          base: 0,
          delta: step.value,
          displayValue: step.value,
          formatted: step.formatted,
          color: "#2563eb", // blue
        }
      } else if (step.measure === "total") {
        return {
          name: step.label,
          base: 0,
          delta: step.value,
          displayValue: step.value,
          formatted: step.formatted,
          color: "#16a34a", // emerald
        }
      } else {
        // relative deduction (negative)
        const previousTotal = currentRunningTotal
        currentRunningTotal += step.value
        const base = Math.min(previousTotal, currentRunningTotal)
        const delta = Math.abs(step.value)
        return {
          name: step.label,
          base,
          delta,
          displayValue: step.value,
          formatted: step.formatted,
          color: "#dc2626", // red
        }
      }
    })
  }, [data])

  // Filter and downsample scatter points for smooth rendering
  const filteredScatterPoints = useMemo(() => {
    if (!data?.scatter_points) return []
    let list = data.scatter_points
    if (segmentFilter !== "All") {
      list = list.filter((p) => p.segment === segmentFilter)
    }

    // Stratified step downsampling to preserve uniform distribution up to 1500 points
    const MAX_POINTS = 1500
    if (list.length > MAX_POINTS) {
      const step = Math.ceil(list.length / MAX_POINTS)
      const sampled: ScatterPoint[] = []
      for (let i = 0; i < list.length && sampled.length < MAX_POINTS; i += step) {
        sampled.push(list[i])
      }
      return sampled
    }
    return list
  }, [data, segmentFilter])

  // Group scatter points by the selected color category for Recharts <Scatter />
  const scatterGroups = useMemo(() => {
    const groups: Record<string, ScatterPoint[]> = {}

    filteredScatterPoints.forEach((point) => {
      let key = "Other"
      if (colorBy === "health_bucket") {
        key = point.health_bucket || "Unknown"
      } else if (colorBy === "segment") {
        key = point.segment || "Unknown"
      } else if (colorBy === "return_paradox_flag") {
        key = point.return_paradox_flag || "Standard"
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(point)
    })

    return groups
  }, [filteredScatterPoints, colorBy])

  const colorPalette: Record<string, string> = {
    // Health buckets
    Healthy: "#16a34a",
    Declining: "#f59e0b",
    "At Risk": "#dc2626",
    Lost: "#6b7280",

    // CRM Segments
    Premium: "#8b5cf6",
    Regular: "#3b82f6",
    "Budget Shopper": "#10b981",
    "Occasional Visitor": "#f97316",
    Inactive: "#94a3b8",

    // Return Paradox
    "Return Paradox": "#ef4444",
    "Normal High-Value": "#3b82f6",
    Standard: "#94a3b8",
  }

  const allSegments = useMemo(() => {
    if (!data?.scatter_points) return []
    return Array.from(new Set(data.scatter_points.map((p) => p.segment))).sort()
  }, [data])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load customer value dataset.
      </div>
    )
  }

  const wf = data.waterfall
  const benchmarks = data.benchmarks

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Customer Value & Realization</h1>
          <Badge variant="outline">CRM Layer</Badge>
        </div>
        <p className="text-muted-foreground">
          Financial Waterfall Decomposition & Value vs Health Scatter Analysis (Reads from{" "}
          <code>/data/customer_value.json</code>)
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross List Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${(wf.gross_catalog / 1e6).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">Catalog invoice basis (10,000 accts)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Margin Deductions</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -${(wf.total_deductions / 1e6).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">Discounts, refunds & cancellations</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Realized Net Retained</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${(wf.net_realized / 1e6).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">Retained cash flow</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Realization Efficiency</CardTitle>
            <Percent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {wf.realization_efficiency_pct}%
            </div>
            <p className="text-xs text-muted-foreground">Realized Net / Gross Catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Waterfall Chart Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Revenue Realization Waterfall</CardTitle>
              <CardDescription>
                Step-by-step margin erosion from Gross Catalog Sales down to Realized Retained Cash
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              46.3% Margin Erosion
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallChartData}
                margin={{ top: 25, right: 30, left: 40, bottom: 25 }}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(_value: any, name: any, item: any) => {
                    if (name === "base") return null
                    const p = item.payload
                    return [
                      `${p.displayValue < 0 ? "-" : ""}$${(Math.abs(p.displayValue) / 1e6).toFixed(2)}M (${p.formatted})`,
                      p.name,
                    ]
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                {/* Transparent base bar to position the floating delta bar */}
                <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
                {/* Visible floating bar with color according to increase/decrease/total */}
                <Bar dataKey="delta" stackId="waterfall" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="formatted"
                    position="top"
                    style={{ fontSize: "11px", fontWeight: 600, fill: "#475569" }}
                  />
                  {waterfallChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs text-muted-foreground border-t pt-4">
            <div>
              <span className="font-semibold text-foreground">Gross List:</span> $10.13M
            </div>
            <div>
              <span className="font-semibold text-red-600">Discounts:</span> -$0.72M
            </div>
            <div>
              <span className="font-semibold text-red-600">Refunds:</span> -$1.31M
            </div>
            <div>
              <span className="font-semibold text-red-600">Cancels:</span> -$1.34M
            </div>
            <div>
              <span className="font-semibold text-red-600">Pending:</span> -$1.32M
            </div>
            <div>
              <span className="font-semibold text-emerald-600">Realized:</span> $5.44M
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scatter Plot Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Customer Value vs Relationship Health Score</CardTitle>
              <CardDescription>
                Cross-plotting Net Spending against Dynamic Change-Over-Time Health Score
              </CardDescription>
            </div>

            {/* Filter and Color Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Color by:</span>
                <Select
                  value={colorBy}
                  onValueChange={(val: any) => setColorBy(val)}
                >
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_bucket">Health Risk Bucket</SelectItem>
                    <SelectItem value="segment">CRM Segment</SelectItem>
                    <SelectItem value="return_paradox_flag">Return Paradox Flag</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Segment:</span>
                <Select
                  value={segmentFilter}
                  onValueChange={(val) => setSegmentFilter(val)}
                >
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Segments</SelectItem>
                    {allSegments.map((seg) => (
                      <SelectItem key={seg} value={seg}>
                        {seg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
              >
                <XAxis
                  type="number"
                  dataKey="health_score"
                  name="Health Score"
                  domain={[0, 100]}
                  unit=""
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{
                    value: "Relationship Health Score (0 - 100)",
                    position: "insideBottom",
                    offset: -10,
                    style: { fontSize: 12, fill: "#64748b" },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="net_spending"
                  name="Net Spending"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                  label={{
                    value: "Net Retained Spending ($)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: { fontSize: 12, fill: "#64748b" },
                  }}
                />
                <ZAxis range={[25, 25]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null
                    const p: ScatterPoint = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
                        <div className="font-bold text-sm text-foreground flex items-center justify-between gap-2">
                          <span>{p.customer_id}</span>
                          <Badge variant="outline" style={{ borderColor: colorPalette[p.health_bucket] || "#94a3b8" }}>
                            {p.health_bucket}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">{p.segment} • {p.matrix_segment}</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t text-muted-foreground">
                          <div>Health Score: <span className="font-semibold text-foreground">{p.health_score.toFixed(1)}</span></div>
                          <div>Net Spending: <span className="font-semibold text-emerald-600">${p.net_spending.toFixed(2)}</span></div>
                          <div>Total Orders: <span className="font-semibold text-foreground">{p.total_orders}</span></div>
                          <div>Gross Value: <span className="font-semibold text-foreground">${p.gross_value.toFixed(2)}</span></div>
                          <div>Refund Ratio: <span className="font-semibold text-foreground">{(p.refund_ratio * 100).toFixed(1)}%</span></div>
                          <div>Discount Dep: <span className="font-semibold text-foreground">{p.discount_dep_pct.toFixed(1)}%</span></div>
                        </div>
                        {p.return_paradox_flag === "Return Paradox" && (
                          <div className="mt-1 font-semibold text-red-600 bg-red-50 p-1 rounded">
                            <span className="inline-flex items-center gap-1 font-semibold text-red-700"><AlertTriangle className="h-3.5 w-3.5 text-red-600" /> High-Value Return Paradox Account</span>
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                {/* Reference lines */}
                <ReferenceLine
                  x={benchmarks.health_neutral_threshold}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: "Health Neutral (50)",
                    position: "top",
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />
                <ReferenceLine
                  y={benchmarks.median_net_spending}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Median ($${benchmarks.median_net_spending.toFixed(0)})`,
                    position: "right",
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />
                {Object.entries(scatterGroups).map(([groupKey, points]) => (
                  <Scatter
                    key={groupKey}
                    name={groupKey}
                    data={points}
                    fill={colorPalette[groupKey] || "#6366f1"}
                    opacity={0.65}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend & Point Count */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-foreground">Legend ({colorBy.replace("_", " ")}):</span>
              {Object.keys(scatterGroups).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: colorPalette[key] || "#6366f1" }}
                  />
                  <span>
                    {key} ({scatterGroups[key]?.length})
                  </span>
                </div>
              ))}
            </div>
            <div>
              Showing {filteredScatterPoints.length.toLocaleString()} points (benchmarked vs median $
              {benchmarks.median_net_spending})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quadrant Commercial Action Guidelines */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">
              Top Right: Core Champions
            </CardTitle>
            <CardDescription className="text-xs">High Health (&gt;50) &bull; High Value (&gt;$408)</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Core commercial champions. Protect with dedicated VIP account managers and early preview access.
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-700">
              Top Left: Critical Risk Accounts
            </CardTitle>
            <CardDescription className="text-xs">Low Health (&lt;50) &bull; High Value (&gt;$408)</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            High historical spenders whose recent velocity is collapsing. High risk of silent defection.
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">
              Bottom Right: Emerging Accelerators
            </CardTitle>
            <CardDescription className="text-xs">High Health (&gt;50) &bull; Modest Value (&lt;$408)</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Emerging accounts with accelerating purchase frequency and positive feedback. Prime candidates for upselling.
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Bottom Left: Low-Touch Base
            </CardTitle>
            <CardDescription className="text-xs">Low Health (&lt;50) &bull; Modest Value (&lt;$408)</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Inactive or low-engagement accounts. Re-engage with automated low-touch drip campaigns.
          </CardContent>
        </Card>
      </div>

      {/* Return Paradox Banner */}
      <Card className="bg-amber-50/60 border-amber-200">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Return Paradox Alert:</span> Found{" "}
            <strong>{benchmarks.return_paradox_count} accounts ({benchmarks.return_paradox_pct}%)</strong> with high
            historical spending but severe return ratios (&gt;30%). While commercially valuable on paper, return processing
            logistics erode true contribution margin.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
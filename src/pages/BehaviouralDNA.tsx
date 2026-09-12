import React, { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Search,
  ShoppingCart,
  Zap,
  Target,
  Compass,
  PauseCircle,
  CheckCircle2,
  Dna,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react"

interface Archetype {
  name: string
  emoji: string
  color: string
  count: number
  pct: number
  description: string
  thresholds: string
  crm_strategy: string
  intent_mix: Record<string, number>
  signature: Record<string, number>
}

interface IntentItem {
  emoji: string
  color: string
  count: number
  pct: number
  description: string
}

interface BehaviouralDNAData {
  total_users: number
  archetypes: Record<string, Archetype>
  global_medians: Record<string, number>
  intent_distribution: Record<string, IntentItem>
  cross_tabulation?: Record<string, Record<string, number>>
}

const ARCHETYPE_ICONS: Record<string, React.ReactNode> = {
  "Window Shopper": <Eye className="h-4 w-4 text-blue-500" />,
  "Researcher": <Search className="h-4 w-4 text-indigo-500" />,
  "Cart Abandoner": <ShoppingCart className="h-4 w-4 text-amber-500" />,
  "Impulse Buyer": <Zap className="h-4 w-4 text-emerald-500" />,
  "Decisive Buyer": <Target className="h-4 w-4 text-purple-500" />,
}

const INTENT_ICONS: Record<string, React.ReactNode> = {
  "Casual Browsing": <Compass className="h-3.5 w-3.5 text-blue-500" />,
  "Purchase Hesitation": <PauseCircle className="h-3.5 w-3.5 text-amber-500" />,
  "Successful Conversion": <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  "Impulse Purchase": <Zap className="h-3.5 w-3.5 text-purple-500" />,
}

const FEATURE_LABELS: Record<string, { label: string; unit: string; isPct?: boolean }> = {
  view_count: { label: "Product Views", unit: "" },
  cart_count: { label: "Cart Additions", unit: "" },
  unique_products_viewed: { label: "Unique Products Viewed", unit: "" },
  session_count: { label: "Sessions", unit: "" },
  conversion_rate: { label: "Conversion Rate", unit: "%", isPct: true },
  cart_abandonment_rate: { label: "Cart Abandonment", unit: "%", isPct: true },
}

export default function BehaviouralDNA() {
  const [data, setData] = useState<BehaviouralDNAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string>("Window Shopper")

  useEffect(() => {
    fetch("/data/behavioural_dna.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load behavioural DNA data:", err)
        setLoading(false)
      })
  }, [])

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
        Failed to load behavioural DNA dataset.
      </div>
    )
  }

  const archetypesList = Object.values(data.archetypes)
  const selectedArchetype = data.archetypes[selectedKey] || archetypesList[0]

  // Bar chart data for DNA Archetypes
  const archetypeBarData = archetypesList.map((a) => ({
    name: a.name,
    rawName: a.name,
    count: a.count,
    pct: a.pct,
    color: a.color,
  }))

  // Donut chart data for Intent Distribution
  const intentPieData = Object.entries(data.intent_distribution).map(([intentName, info]) => ({
    name: intentName,
    value: info.count,
    pct: info.pct,
    color: info.color,
  }))

  // Intent mix for selected archetype
  const intentMixEntries = Object.entries(selectedArchetype.intent_mix || {}).map(([name, pct]) => {
    const meta = data.intent_distribution[name]
    return {
      name,
      pct,
      color: meta?.color || "#6366f1",
    }
  })

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Behavioural DNA Profiler</h1>
          <Badge variant="outline">Behavioral Layer (Mkechinov)</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Rule-Based Archetypal Segmentation of {data.total_users.toLocaleString()} Behavioral Profiles (Reads from{" "}
          <code>/data/behavioural_dna.json</code>)
        </p>
      </div>

      {/* Top 5 Archetype Cards (Clickable) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {archetypesList.map((arch) => {
          const isSelected = arch.name === selectedArchetype.name
          return (
            <Card
              key={arch.name}
              onClick={() => setSelectedKey(arch.name)}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected
                  ? "ring-2 ring-primary shadow-md border-transparent bg-primary/5"
                  : "hover:border-primary/40 shadow-sm"
                }`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-background border shadow-xs">
                    {ARCHETYPE_ICONS[arch.name] || <Dna className="h-4 w-4 text-primary" />}
                  </div>
                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className="text-[10px] font-mono px-1.5 py-0"
                  >
                    {arch.pct}%
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-1 truncate">{arch.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-foreground">
                  {arch.count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">users classified</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Distribution Charts: DNA Archetypes & Purchase Intent */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Horizontal Bar Chart of Archetypes */}
        <Card className="lg:col-span-7 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">DNA Archetype Distribution</CardTitle>
                <CardDescription>
                  Volume and population share across behavioral segments (click bar to inspect)
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {archetypesList.length} Archetypes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={archetypeBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tick={{ fontSize: 12 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => [
                      `${Number(val).toLocaleString()} users (${item.payload.pct}%)`,
                      item.payload.rawName,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(entry: any) => setSelectedKey(entry.rawName)}
                  >
                    <LabelList
                      dataKey="pct"
                      position="right"
                      formatter={(val: any) => `${val}%`}
                      style={{ fontSize: "11px", fontWeight: 600, fill: "#475569" }}
                    />
                    {archetypeBarData.map((entry) => (
                      <Cell
                        key={entry.rawName}
                        fill={entry.color}
                        opacity={entry.rawName === selectedArchetype.name ? 1 : 0.65}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Intent Donut Chart */}
        <Card className="lg:col-span-5 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Purchase Intent Distribution</CardTitle>
                <CardDescription>
                  Outcome classification across the entire behavioral funnel
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Funnel Outcomes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {intentPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${Number(value).toLocaleString()} (${item.payload.pct}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
              {intentPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-muted-foreground flex items-center gap-1">
                    {INTENT_ICONS[item.name]}
                    <span>{item.name}:</span>
                    <strong className="text-foreground">{item.pct}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Archetype Intelligence Detail Panel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-1 rounded-md bg-background border shadow-xs">
                {ARCHETYPE_ICONS[selectedArchetype.name]}
              </div>
              <span>{selectedArchetype.name} &bull; Intelligence Dossier</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Deep-dive behavioural profile, classification boundaries, and recommended commercial strategy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Switch archetype:</span>
            <div className="flex flex-wrap gap-1">
              {archetypesList.map((a) => (
                <Button
                  key={a.name}
                  variant={a.name === selectedArchetype.name ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5 inline-flex items-center gap-1.5"
                  onClick={() => setSelectedKey(a.name)}
                >
                  {ARCHETYPE_ICONS[a.name]}
                  <span>{a.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Metrics & Intent Mix */}
          <div className="space-y-4 md:col-span-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Segment Population
                  </CardTitle>
                  <Badge
                    style={{ backgroundColor: selectedArchetype.color, color: "#fff" }}
                    className="text-xs"
                  >
                    {selectedArchetype.pct}% of total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-extrabold text-foreground">
                    {selectedArchetype.count.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">users matching this rule definition</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Purchase Intent Mix
                  </div>
                  <div className="space-y-2">
                    {intentMixEntries.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {INTENT_ICONS[item.name]}
                            <span>{item.name}</span>
                          </span>
                          <span className="font-semibold text-foreground">{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threshold Box */}
            <Card className="shadow-sm bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> Rule-Based Classification Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block rounded bg-background p-2.5 font-mono text-xs border text-slate-800 leading-relaxed break-words">
                  {selectedArchetype.thresholds}
                </code>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Description & Strategy */}
          <div className="space-y-4 md:col-span-7">
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-blue-500" /> Archetype Profile & Behavioral Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedArchetype.description}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                  <Lightbulb className="h-4 w-4 text-emerald-600" /> Recommended CRM & Merchandising Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-950 leading-relaxed">
                  {selectedArchetype.crm_strategy}
                </p>
              </CardContent>
            </Card>

            {/* Feature Signature Metrics (Archetype Median vs Global Population) */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Dna className="h-4 w-4 text-primary" /> Feature Signature (Segment Median vs Global Population)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {Object.entries(FEATURE_LABELS).map(([featKey, featConf]) => {
                    const segVal = selectedArchetype.signature?.[featKey] ?? 0
                    const globalVal = data.global_medians?.[featKey] ?? 0
                    const formattedSeg = featConf.isPct ? `${(segVal * 100).toFixed(1)}%` : segVal.toFixed(1)
                    const formattedGlobal = featConf.isPct ? `${(globalVal * 100).toFixed(1)}%` : globalVal.toFixed(1)
                    const isHigher = segVal > globalVal
                    const isLower = segVal < globalVal

                    return (
                      <div key={featKey} className="rounded-lg border bg-background p-2.5 text-xs">
                        <div className="text-muted-foreground truncate">{featConf.label}</div>
                        <div className="text-base font-bold text-foreground mt-0.5">{formattedSeg}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span>Pop: {formattedGlobal}</span>
                          {isHigher && <span className="text-emerald-600 font-semibold">&uarr; High</span>}
                          {isLower && <span className="text-amber-600 font-semibold">&darr; Low</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
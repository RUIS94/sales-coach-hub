import { useState } from "react";
import { PageHeader } from "@/components/sam/PageHeader";
import { FilterStrip } from "@/components/sam/FilterStrip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockAEReps, formatCurrency } from "@/data/mock";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const accuracyData = [
  { month: 'Oct', accuracy: 65 },
  { month: 'Nov', accuracy: 68 },
  { month: 'Dec', accuracy: 62 },
  { month: 'Jan', accuracy: 71 },
  { month: 'Feb', accuracy: 73 },
  { month: 'Mar', accuracy: 76 },
];

const slipData = [
  { month: 'Oct', rate: 28 },
  { month: 'Nov', rate: 24 },
  { month: 'Dec', rate: 32 },
  { month: 'Jan', rate: 22 },
  { month: 'Feb', rate: 18 },
  { month: 'Mar', rate: 15 },
];

const closeDateMovement = [
  { bucket: '0 days', count: 12 },
  { bucket: '1-7 days', count: 8 },
  { bucket: '8-14 days', count: 5 },
  { bucket: '15-30 days', count: 3 },
  { bucket: '30+ days', count: 2 },
];

export default function Insights() {
  const [timeRange, setTimeRange] = useState("This quarter");

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Insights" subtitle="Trends and analytics" />
      <FilterStrip timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="forecast" className="w-full">
          <div className="px-4 sm:px-6 pt-4">
            <TabsList className="bg-muted h-9 p-0.5">
              <TabsTrigger value="forecast" className="text-xs data-[state=active]:bg-card">Forecast Integrity</TabsTrigger>
              <TabsTrigger value="pipeline" className="text-xs data-[state=active]:bg-card">Pipeline Quality</TabsTrigger>
              <TabsTrigger value="coaching" className="text-xs data-[state=active]:bg-card">Coaching ROI</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="forecast" className="px-4 sm:px-6 pb-6 space-y-4 mt-4">
            {/* Two charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Forecast Accuracy Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={accuracyData}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[50, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" fill="url(#colorAccuracy)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Commit Slip Rate</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={slipData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--status-red))" strokeWidth={2} dot={{ fill: 'hsl(var(--status-red))', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wide chart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Close Date Movement Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={closeDateMovement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Drilldown table */}
            <div className="rounded-lg border border-border bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">By AE Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-[640px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">AE</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Commit</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Accuracy</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Slip Rate</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Hygiene</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAEReps.map((rep) => (
                        <tr key={rep.user_id} className="border-b border-border last:border-0 hover:bg-primary/10 active:bg-primary/15">
                          <td className="px-4 py-2.5 font-medium text-foreground">{rep.name}</td>
                          <td className="text-right px-3 py-2.5">{formatCurrency(rep.commit_amount)}</td>
                          <td className="text-right px-3 py-2.5">{65 + Math.floor(Math.random() * 20)}%</td>
                          <td className="text-right px-3 py-2.5">{5 + Math.floor(Math.random() * 25)}%</td>
                          <td className="text-right px-3 py-2.5">
                            <span className={rep.hygiene_score < 70 ? 'text-status-amber' : ''}>{rep.hygiene_score}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="px-4 sm:px-6 pb-6 mt-4">
            <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">Pipeline quality analysis coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="coaching" className="px-4 sm:px-6 pb-6 mt-4">
            <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">Coaching ROI metrics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CardsTrendPoint = {
  date: string;
  fullDate: string;
  count: number;
};

type CategoryBreakdownPoint = {
  id: string;
  name: string;
  color: string;
  count: number;
};

type DashboardChartsProps = {
  cardsTrend: CardsTrendPoint[];
  categoryBreakdown: CategoryBreakdownPoint[];
};

export function DashboardCharts({
  cardsTrend,
  categoryBreakdown,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <Card className="border-border/60 shadow-sm xl:col-span-3">
        <CardHeader>
          <CardTitle>Cards added</CardTitle>
          <CardDescription>Last 7 days activity trend</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cardsTrend}>
              <defs>
                <linearGradient id="cardsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.45 0.18 264)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.45 0.18 264)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.922 0 0 / 35%)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid oklch(0.922 0 0 / 60%)",
                  background: "var(--card)",
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullDate ?? ""
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="oklch(0.45 0.18 264)"
                fill="url(#cardsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle>By category</CardTitle>
          <CardDescription>Distribution across your library</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No category data yet
            </div>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid oklch(0.922 0 0 / 60%)",
                      background: "var(--card)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-2 space-y-2">
            {categoryBreakdown.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm xl:col-span-5">
        <CardHeader>
          <CardTitle>Weekly comparison</CardTitle>
          <CardDescription>Category volume overview</CardDescription>
        </CardHeader>
        <CardContent className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.922 0 0 / 35%)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid oklch(0.922 0 0 / 60%)",
                  background: "var(--card)",
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {categoryBreakdown.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

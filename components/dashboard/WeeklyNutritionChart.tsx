"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WeeklyCaloriesItem {
  date: string;
  day: string;
  calories: number;
  protein: number;
}

export default function WeeklyNutritionChart({
  data,
}: {
  data: WeeklyCaloriesItem[];
}) {
  return (
    <div className="h-60 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.15}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              borderColor: "var(--chart-tooltip-border)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="calories"
            fill="hsl(152, 58%, 42%)"
            radius={[6, 6, 0, 0]}
            name="Calories (kcal)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

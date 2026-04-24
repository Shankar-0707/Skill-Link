import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/shared/utils/cn';

export const analyticsPalette = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export const AnalyticsChartCard = ({
  title,
  description,
  children,
  className,
}: ChartCardProps) => (
  <section
    className={cn(
      'rounded-2xl border border-border bg-background p-5 shadow-sm shadow-slate-950/5',
      className,
    )}
  >
    <div className="mb-4">
      <h3 className="text-lg font-headline font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm font-body text-muted-foreground">{description}</p>
    </div>
    <div className="h-[280px] w-full">{children}</div>
  </section>
);

type LineSeries = {
  dataKey: string;
  name: string;
  color: string;
};

type SharedChartProps<T> = {
  data: T[];
  xKey: keyof T & string;
};

export const AnalyticsLineChart = <T extends Record<string, string | number>>({
  data,
  xKey,
  lines,
}: SharedChartProps<T> & { lines: LineSeries[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
      <XAxis
        dataKey={xKey as unknown as string}
        tickLine={false}
        axisLine={false}
        tickMargin={10}
      />
      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
      <Tooltip />
      <Legend />
      {lines.map((line) => (
        <Line
          key={line.dataKey}
          type="monotone"
          dataKey={line.dataKey}
          name={line.name}
          stroke={line.color}
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

export const AnalyticsBarChart = <T extends Record<string, string | number>>({
  data,
  xKey,
  bars,
  stacked = false,
  horizontal = false,
}: SharedChartProps<T> & {
  bars: LineSeries[];
  stacked?: boolean;
  horizontal?: boolean;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={data}
      layout={horizontal ? 'vertical' : 'horizontal'}
      margin={{ top: 8, right: 12, left: horizontal ? 16 : -12, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={!horizontal} horizontal={horizontal} />
      {horizontal ? (
        <>
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey={xKey as unknown as string}
            tickLine={false}
            axisLine={false}
            width={90}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey={xKey as unknown as string}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
        </>
      )}
      <Tooltip />
      <Legend />
      {bars.map((bar) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          name={bar.name}
          fill={bar.color}
          radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
          stackId={stacked ? 'stack' : undefined}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export const AnalyticsPieChart = <T extends Record<string, string | number>>({
  data,
  dataKey,
  nameKey,
}: {
  data: T[];
  dataKey: keyof T & string;
  nameKey: keyof T & string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={52}
        outerRadius={88}
        paddingAngle={3}
      >
        {data.map((entry, index) => (
          <Cell
            key={`${String(entry[nameKey])}-${index}`}
            fill={analyticsPalette[index % analyticsPalette.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

type LeaderboardColumn<T> = {
  key: keyof T & string;
  label: string;
  align?: 'left' | 'right';
};

export const AnalyticsLeaderboardCard = <T extends { name: string }>({
  title,
  description,
  rows,
  columns,
}: {
  title: string;
  description: string;
  rows: T[];
  columns: LeaderboardColumn<T>[];
}) => (
  <section className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-slate-950/5">
    <div className="mb-4">
      <h3 className="text-lg font-headline font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm font-body text-muted-foreground">{description}</p>
    </div>
    {rows.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm font-body text-muted-foreground">
        No analytics records yet.
      </div>
    ) : (
      <div className="overflow-hidden rounded-xl border border-border">
        <div
          className="grid gap-3 border-b border-border bg-surface-container/50 px-4 py-3 text-[11px] font-label uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <span
              key={column.key}
              className={column.align === 'right' ? 'text-right' : undefined}
            >
              {column.label}
            </span>
          ))}
        </div>
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.name}
              className="grid gap-3 px-4 py-4 text-sm font-body text-foreground"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={cn(
                    column.key === 'name' && 'font-label font-semibold',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {String(row[column.key])}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);

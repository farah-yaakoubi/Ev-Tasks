import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ActivityTrendPoint {
  label: string;
  tasks: number;
  projects: number;
}

export default function ActivityTrendChart({ data }: { data: ActivityTrendPoint[] }) {
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
      <defs>
        <linearGradient id="activityTasksFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20a45a" stopOpacity={.2}/>
          <stop offset="95%" stopColor="#20a45a" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="activityProjectsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d9ad" stopOpacity={.23}/>
          <stop offset="95%" stopColor="#a8d9ad" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke="var(--ui-separator)"/>
      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--ui-muted)' }} interval="preserveStartEnd"/>
      <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ui-muted)' }}/>
      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--ui-separator)', background: 'var(--ui-surface)', color: 'var(--ui-text)', boxShadow: '0 8px 24px #14281c18' }}/>
      <Area type="monotone" dataKey="projects" name="Projets" stroke="#a8d9ad" strokeWidth={2} fill="url(#activityProjectsFill)" activeDot={{ r: 4 }}/>
      <Area type="monotone" dataKey="tasks" name="Tâches" stroke="#15934f" strokeWidth={2.5} fill="url(#activityTasksFill)" activeDot={{ r: 4 }}/>
    </AreaChart>
  </ResponsiveContainer>;
}

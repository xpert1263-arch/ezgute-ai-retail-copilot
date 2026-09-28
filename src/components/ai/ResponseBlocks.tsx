import { AlertTriangle, Lightbulb, Package } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AIBlock } from '../../services/localAI'
import { formatCompactSum } from '../../lib/format'

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  const value = unit === 'percent' ? `${payload[0].value}%` : formatCompactSum(payload[0].value)
  return (
    <div className="rounded-lg border border-base-border bg-base-panel-deep px-2.5 py-1.5 text-xs text-text-primary">
      <p className="text-text-muted">{label}</p>
      <p className="tabular-nums font-medium">{value}</p>
    </div>
  )
}

export function ResponseBlocks({ blocks }: { blocks: AIBlock[] }) {
  if (blocks.length === 0) return null

  return (
    <div className="mt-3 space-y-2.5">
      {blocks.map((block, i) => {
        if (block.type === 'kpi') {
          return (
            <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {block.items.map((item) => (
                <div key={item.label} className="rounded-lg border border-base-border bg-base-panel-deep px-3 py-2.5">
                  <p className="text-[11px] text-text-muted">{item.label}</p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          )
        }

        if (block.type === 'chart') {
          return (
            <div key={i} className="h-40 rounded-lg border border-base-border bg-base-panel-deep p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={block.data} margin={{ left: -20, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b212c" vertical={false} />
                  <XAxis dataKey="label" stroke="#8a93a3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#8a93a3"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v) => (block.unit === 'percent' ? `${v}%` : formatCompactSum(v))}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTooltip unit={block.unit} />} />
                  <Bar dataKey="value" fill="#3e7bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        }

        if (block.type === 'productList') {
          return (
            <div key={i} className="space-y-1.5">
              {block.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-base-border bg-base-panel-deep px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-text-muted" size={14} />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{item.name}</p>
                      {item.branch && <p className="text-[11px] text-text-muted">{item.branch}</p>}
                    </div>
                  </div>
                  {item.stock !== undefined ? (
                    <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                      {item.stock} dona
                    </span>
                  ) : item.extra ? (
                    <span className="text-[11px] text-text-muted">{item.extra}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )
        }

        if (block.type === 'branchComparison') {
          const max = Math.max(...block.items.map((b) => b.revenue), 1)
          return (
            <div key={i} className="space-y-2 rounded-lg border border-base-border bg-base-panel-deep p-3">
              {block.items.map((b) => (
                <div key={b.branch}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-text-primary">{b.branch}</span>
                    <span className="tabular-nums text-text-muted">
                      {formatCompactSum(b.revenue)} · {b.sales} ta · {b.conversion}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-accent-blue"
                      style={{ width: `${(b.revenue / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        }

        if (block.type === 'warning') {
          return (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" size={14} />
              <p className="text-xs text-amber-200/90">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'recommendation') {
          return (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-accent-blue/20 bg-accent-blue/[0.06] px-3 py-2.5">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" size={14} />
              <p className="text-xs text-blue-100/90">{block.text}</p>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

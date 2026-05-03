import { timeAgo } from '../../utils/timeAgo'

const TYPE_META = {
  package:  { icon: 'inventory_2',  color: '#6366F1', label: 'Package' },
  guest:    { icon: 'person',        color: '#10B981', label: 'Guest'   },
  delivery: { icon: 'local_shipping',color: '#F59E0B', label: 'Delivery'},
  vehicle:  { icon: 'directions_car',color: '#14B8A6', label: 'Vehicle' },
}

export function GateItem({ type = 'package', description, unit, createdAt, status = 'Arrived' }) {
  const meta = TYPE_META[type] ?? TYPE_META.package

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: meta.color + '1A' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: meta.color }}>
          {meta.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-tp font-medium truncate">{description}</p>
        <p className="text-xs text-tm mt-0.5">Unit {unit} · {timeAgo(createdAt)}</p>
      </div>
      <span className="text-xs text-ok font-medium flex-shrink-0">{status}</span>
    </div>
  )
}

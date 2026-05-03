const RULES = [
  {
    pattern: /\b(water|pipe|leak|flood|plumb|drain|toilet|faucet|sink|tap|shower)\b/i,
    category: 'Plumbing',   icon: 'plumbing',      color: '#6366F1', priority: 'High',
  },
  {
    pattern: /\b(electric|power|light|outlet|breaker|wiring|voltage|spark|socket|fuse)\b/i,
    category: 'Electrical', icon: 'bolt',          color: '#F59E0B', priority: 'High',
  },
  {
    pattern: /\b(noise|loud|music|party|sound|dog|bark|shout|neighbor|bang)\b/i,
    category: 'Noise',      icon: 'volume_up',     color: '#EF4444', priority: 'Medium',
  },
  {
    pattern: /\b(elevator|lift|stuck)\b/i,
    category: 'Elevator',   icon: 'elevator',      color: '#8B5CF6', priority: 'High',
  },
  {
    pattern: /\b(security|lock|door|key|access|camera|guard|break|theft|stolen|unsafe|intruder)\b/i,
    category: 'Security',   icon: 'security',      color: '#EF4444', priority: 'High',
  },
  {
    pattern: /\b(park|car|vehicle|garage|spot|blocked|permit)\b/i,
    category: 'Parking',    icon: 'local_parking', color: '#14B8A6', priority: 'Medium',
  },
  {
    pattern: /\b(gym|pool|amenity|lounge|common|lobby|facility|equipment)\b/i,
    category: 'Facilities', icon: 'fitness_center', color: '#10B981', priority: 'Low',
  },
]

const DEFAULT = { category: 'General', icon: 'report_problem', color: '#94A3B8', priority: 'Medium' }

export function classify(text = '') {
  const hit = RULES.find(r => r.pattern.test(text))
  return hit ? { category: hit.category, icon: hit.icon, color: hit.color, priority: hit.priority } : DEFAULT
}

const now = Date.now()
const m = (mins) => new Date(now - mins * 60000).toISOString()

export const GATE_LOG = [
  { id: 'g1',  type: 'package',  description: 'Amazon package — 2 items',       unit: '4B', createdAt: m(15),  status: 'Arrived',   note: 'Left at front desk' },
  { id: 'g2',  type: 'guest',    description: 'Guest: Sarah Mitchell',           unit: '5C', createdAt: m(52),  status: 'Signed in', note: '' },
  { id: 'g3',  type: 'delivery', description: 'FedEx — signature required',      unit: '2A', createdAt: m(80),  status: 'Picked up', note: '' },
  { id: 'g4',  type: 'package',  description: 'USPS package',                   unit: '7C', createdAt: m(130), status: 'Arrived',   note: '' },
  { id: 'g5',  type: 'vehicle',  description: 'Visitor vehicle — BMW 330i',      unit: '3A', createdAt: m(200), status: 'Logged',    note: 'Spot B-12' },
  { id: 'g6',  type: 'guest',    description: 'Guest: Robert Chen',              unit: '1B', createdAt: m(240), status: 'Signed out',note: '' },
  { id: 'g7',  type: 'delivery', description: 'DoorDash order',                  unit: '6A', createdAt: m(300), status: 'Picked up', note: '' },
  { id: 'g8',  type: 'package',  description: 'UPS package — fragile',           unit: '8D', createdAt: m(420), status: 'Arrived',   note: 'Held at desk' },
  { id: 'g9',  type: 'guest',    description: 'Guest: Anita Patel',              unit: '3C', createdAt: m(600), status: 'Signed in', note: '' },
  { id: 'g10', type: 'vehicle',  description: 'Contractor vehicle — white van',  unit: 'MGMT', createdAt: m(720), status: 'Logged',  note: 'Maintenance crew' },
  { id: 'g11', type: 'package',  description: 'Amazon — large box',              unit: '2C', createdAt: m(900), status: 'Arrived',   note: '' },
  { id: 'g12', type: 'delivery', description: 'Uber Eats',                       unit: '5A', createdAt: m(960), status: 'Picked up', note: '' },
]

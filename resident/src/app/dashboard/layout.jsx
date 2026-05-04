import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar, MobileHeader } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*, societies(name)')
    .eq('id', authUser.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (!profile.onboarded) redirect('/onboarding')

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar user={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader user={profile} />
        <main className="flex-1 overflow-y-auto pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}

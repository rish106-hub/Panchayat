import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = {
  title: 'Spoke Admin — Board Portal',
  description: 'HOA board management portal. Manage complaints, residents, maintenance, and gate activity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_balance_wallet,add,arrow_back,arrow_forward,auto_awesome,autorenew,bolt,build,campaign,cancel,check,check_circle,chevron_right,close,dashboard,deck,delete,description,directions_car,door_front,download,edit,elevator,error,expand_more,filter_list,fitness_center,gavel,group,home,inbox,info,inventory_2,keyboard_voice,local_parking,local_shipping,lock,logout,mark_email_read,menu,menu_book,mic,open_in_new,payments,pending,pending_actions,person,pets,plumbing,pool,receipt_long,refresh,report_problem,search,search_off,security,send,settings,spatial_audio,stop_circle,trending_down,trending_up,upload_file,visibility,visibility_off,volume_up,warning,wifi_off" rel="stylesheet" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

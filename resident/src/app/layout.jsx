import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Spoke — Your Community App',
  description: 'Submit complaints, track dues, and stay connected with your housing society.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_balance_wallet,add,apartment,arrow_back,arrow_forward,check,check_circle,close,description,error,expand_less,expand_more,home,inventory_2,local_shipping,login,logout,menu,menu_book,open_in_new,pending_actions,person,picture_as_pdf,receipt_long,report_problem,search,send,warning"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_balance_wallet,add,apartment,arrow_back,arrow_forward,check,check_circle,close,description,error,expand_less,expand_more,home,inventory_2,local_shipping,login,logout,menu,menu_book,open_in_new,pending_actions,person,picture_as_pdf,receipt_long,report_problem,search,send,warning"
        />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

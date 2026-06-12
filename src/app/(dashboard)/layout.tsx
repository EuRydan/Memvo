import { ReactNode } from 'react'

export default function DashboardGroupRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="dashboard-theme-root flex-1 flex flex-col bg-canvas text-ink transition-colors duration-200">
      {children}
    </div>
  )
}

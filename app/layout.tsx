import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './lib/auth'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Python Auto Grader',
  description: 'Modern assignment auto-grading system for Python courses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgb(var(--surface-secondary))',
                color: 'rgb(var(--text-primary))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

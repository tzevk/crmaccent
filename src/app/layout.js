import './globals.css'

export const metadata = {
  title: 'CRM Accent - Customer Relationship Management',
  description: 'A modern CRM system built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
  title: 'Pablo Molina - Space Portfolio',
  description: 'Interactive 3D portfolio showcasing my journey through technology and space exploration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

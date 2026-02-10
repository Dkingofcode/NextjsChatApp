import './globals.css'

export const metadata = {
  title: 'FluxChat - Real-time Chat',
  description: 'Production-grade real-time chat application',
}

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
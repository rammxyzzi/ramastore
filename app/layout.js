export const metadata = {
  title: 'Neptune Store - Top Up Game',
  description: 'Website Top Up Game & Jual Akun Terpercaya',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}

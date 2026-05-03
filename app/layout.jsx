import "./globals.css"

export const metadata = {
  title: "Learning Games",
  description: "Warm, playful learning games for kids.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

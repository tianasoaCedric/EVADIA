// app/(dark)/layout.tsx
import Header from "../components/molecules/Header"

export default function DarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
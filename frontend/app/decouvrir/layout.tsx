import Header from '@/app/components/molecules/Header'

export default function DarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      <Header/>
      {children}
    </main>
  )
}

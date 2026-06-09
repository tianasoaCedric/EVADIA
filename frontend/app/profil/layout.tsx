import SetHeaderTheme from '@/app/components/ui/SetHeaderTheme'

export default function DarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SetHeaderTheme theme="dark" />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}

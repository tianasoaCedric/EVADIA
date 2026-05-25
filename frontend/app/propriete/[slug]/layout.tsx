import HideHeader from '@/app/components/ui/HideHeader'

export default function ProprieteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideHeader />
      {children}
    </>
  )
}

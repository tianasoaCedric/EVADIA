import HideHeader from '@/app/components/ui/HideHeader'

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideHeader />
      {children}
    </>
  )
}

import HideHeader from '@/app/components/ui/HideHeader'

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideHeader />
      {children}
    </>
  )
}

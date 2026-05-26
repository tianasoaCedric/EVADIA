import HideHeader from '@/app/components/ui/HideHeader'
import Header from '@/app/components/molecules/Header'

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header theme="dark"/>
      {children}
    </>
  )
}

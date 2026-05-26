import HideHeader from '@/app/components/ui/HideHeader'
import Header from '../../components/molecules/Header'

export default function ProprieteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
      theme='dark'
      />
      {/* <HideHeader /> */}
      {children}
    </>
  )
}

import Header from '@/app/components/molecules/Header'

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header theme="dark" />
      {children}
    </>
  )
}

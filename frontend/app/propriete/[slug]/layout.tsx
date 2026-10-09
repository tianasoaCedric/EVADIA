import Header from '../../components/molecules/Header'

export default function ProprieteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header theme='dark' />
      {children}
    </>
  )
}

import HideHeader from '@/app/components/ui/HideHeader'

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideHeader />
      {children}
    </>
  )
}

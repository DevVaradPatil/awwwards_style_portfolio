import Header from '@/components/layout/Header.jsx'
import Footer from '@/components/layout/Footer.jsx'
import AppRouter from '@/router/AppRouter.jsx'
import SmoothScrollProvider from '@/components/system/SmoothScrollProvider.jsx'
import CustomCursor from '@/components/system/CustomCursor.jsx'

export default function App() {
  return (
    <SmoothScrollProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <CustomCursor />
      <Header />
      <main id="main" tabIndex={-1} className="min-h-[80vh] focus:outline-none">
        <AppRouter />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}

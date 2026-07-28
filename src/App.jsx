import { useState } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { CursorFollower } from './components/cursor/CursorFollower'
import { Preloader } from './components/common/Preloader'
import { Hero } from './components/hero/Hero'
import { Craft } from './components/sections/Craft'
import { ThreePaths } from './components/sections/ThreePaths'
import { OurWork } from './components/sections/OurWork'
import { IdeaJourney } from './components/sections/IdeaJourney'
import { Precision } from './components/sections/Precision'
import { DevelopersBehind } from './components/sections/DevelopersBehind'
import { Technology } from './components/sections/Technology'
import { Testimonials } from './components/sections/Testimonials'
import { Statistics } from './components/sections/Statistics'
import { FinalCTA } from './components/sections/FinalCTA'
import { useSimplifiedMotion } from './hooks/useSimplifiedMotion'
import { useLenis } from './hooks/useLenis'
import './App.css'

function App() {
  const simplified = useSimplifiedMotion()
  const [introDone, setIntroDone] = useState(false)
  useLenis(!simplified)

  return (
    <>
      {!introDone && <Preloader onComplete={() => setIntroDone(true)} />}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      {!simplified && <CursorFollower />}
      <main id="main">
        <Hero introDone={introDone} />
        <Craft />
        <ThreePaths />
        <OurWork />
        <IdeaJourney />
        <Precision />
        <DevelopersBehind />
        <Technology />
        <Testimonials />
        <Statistics />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

export default App

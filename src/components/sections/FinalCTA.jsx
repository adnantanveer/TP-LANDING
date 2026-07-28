import { SplitHeading } from '../common/SplitHeading'
import { Button } from '../common/Button'
import { VideoBlock } from '../common/VideoBlock'
import './FinalCTA.css'

export function FinalCTA() {
  return (
    <section id="final-cta" className="final-cta" aria-label="Get in touch">
      <div className="final-cta__media" aria-hidden="true">
        <VideoBlock tone="dark" label="Studio reel" />
        <div className="final-cta__scrim" />
      </div>

      <div className="container final-cta__content">
        <SplitHeading as="h2" className="final-cta__title">
          Let&rsquo;s build something remarkable together.
        </SplitHeading>
        <div className="final-cta__ctas">
          <Button href="#contact" variant="primary on-dark">
            Book Discovery Call
          </Button>
          <Button href="mailto:[Your Contact Email]" variant="secondary on-dark">
            Start Your Project
          </Button>
        </div>
      </div>
    </section>
  )
}

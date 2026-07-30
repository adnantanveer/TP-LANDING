import { SplitHeading } from '../common/SplitHeading'
import { VideoBlock } from '../common/VideoBlock'
import craftDesk from '../../assets/craft-desk.jpg'
import './Craft.css'

export function Craft() {
  return (
    <section id="craft" className="craft" aria-label="Our philosophy">
      <div className="craft__media" aria-hidden="true">
        <VideoBlock tone="dark" image={craftDesk} label="Studio at work" />
        <div className="craft__scrim" />
      </div>

      <div className="container craft__content">
        <p className="eyebrow">Philosophy</p>
        <SplitHeading as="h2" className="craft__title">
          Craft.
        </SplitHeading>
        <p className="craft__copy lead">
          Every product we ship carries the same intention as a piece of design work —
          considered, deliberate, felt before it&rsquo;s understood.
        </p>
      </div>
    </section>
  )
}

import { stats } from '../../data/stats'
import { useCountUp } from '../../hooks/useCountUp'
import './Statistics.css'

function StatItem({ stat }) {
  const [ref, value] = useCountUp(stat.value)
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-item__value">
        {value}
        {stat.suffix}
      </span>
      <span className="stat-item__label">{stat.label}</span>
    </div>
  )
}

export function Statistics() {
  return (
    <section className="statistics" aria-label="Our track record">
      <div className="container statistics__row">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  )
}

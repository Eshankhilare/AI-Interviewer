import './TractionOrbit.css'

const POSITIONS = [
  { left: '50%', top: '4%' },
  { left: '88%', top: '36%' },
  { left: '74%', top: '83%' },
  { left: '26%', top: '83%' },
  { left: '12%', top: '36%' },
]

const TractionOrbit = ({ title = 'Traction', subtitle = '', items = [] }) => (
  <div className="traction-orbit">
    <span className="to-ring to-ring-a" aria-hidden="true" />
    <span className="to-ring to-ring-b" aria-hidden="true" />

    <div className="to-center">
      <span>{title}</span>
      {subtitle ? <small>{subtitle}</small> : null}
    </div>

    {items.slice(0, 5).map(({ label, value, icon: Icon, hint }, index) => (
      <div
        className="to-node"
        key={label}
        style={{ left: POSITIONS[index].left, top: POSITIONS[index].top, '--to-delay': `${index * 0.45}s` }}
      >
        <span className="to-bubble">
          {Icon ? <Icon size={22} className="to-icon" aria-hidden="true" /> : null}
        </span>
        <span className="to-copy">
          <strong>{value}</strong>
          <span>{label}</span>
          {hint ? <em>{hint}</em> : null}
        </span>
      </div>
    ))}
  </div>
)

export default TractionOrbit

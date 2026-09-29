import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react'

export function StageHeading({ title, description, actions }) {
  return (
    <div className="stage-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  )
}

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}

export function Confidence({ value }) {
  const tone = value.includes('高') ? 'high' : value === '中' ? 'medium' : 'medium'
  return <span className={`confidence confidence-${tone}`}>{value}</span>
}

export function Status({ children, tone = 'neutral' }) {
  return <span className={`status status-${tone}`}>{children}</span>
}

export function ProgressBar({ value, label, accent = false }) {
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar-track"><span className={accent ? 'bar-accent' : ''} style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function EmptyAction({ title, description, action, onClick }) {
  return (
    <div className="empty-action">
      <Sparkles size={22} />
      <strong>{title}</strong>
      <p>{description}</p>
      <Button onClick={onClick} icon={Sparkles}>{action}</Button>
    </div>
  )
}

export function EvidenceLink({ children, onClick }) {
  return (
    <button className="text-action" onClick={onClick}>
      {children}<ChevronRight size={14} />
    </button>
  )
}

export function SearchInput({ value, onChange, placeholder = '搜索' }) {
  return (
    <div className="search-input">
      <Search size={16} />
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

export function ConfirmBar({ done, label, note, onConfirm, secondary, disabled = false }) {
  return (
    <div className="confirm-bar">
      <div className="confirm-summary">
        <span className={done ? 'confirm-icon done' : 'confirm-icon'}>
          {done ? <Check size={16} /> : <CircleAlert size={16} />}
        </span>
        <div>
          <strong>{done ? '本阶段已确认' : '等待确认'}</strong>
          <p>{note}</p>
        </div>
      </div>
      <div className="confirm-actions">
        {secondary}
        <Button onClick={onConfirm} icon={done ? ArrowRight : Check} disabled={disabled}>{done ? '继续下一步' : label}</Button>
      </div>
    </div>
  )
}

export function SourceDrawer({ item, onClose }) {
  if (!item) return null
  return (
    <div className="drawer-backdrop" onMouseDown={onClose} role="presentation">
      <aside className="source-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label="证据详情">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">{item.id}</span>
            <h2>证据详情</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="drawer-section">
          <h3>关键发现</h3>
          <p className="drawer-finding">{item.finding}</p>
        </div>
        <dl className="definition-list">
          <div><dt>来源</dt><dd>{item.source}</dd></div>
          <div><dt>数据时间</dt><dd>{item.date}</dd></div>
          <div><dt>样本/口径</dt><dd>{item.sample}</dd></div>
          <div><dt>适用范围</dt><dd>{item.scope}</dd></div>
          <div><dt>可信度</dt><dd><Confidence value={item.confidence} /></dd></div>
        </dl>
        <div className="drawer-section note-box">
          <h3>使用边界</h3>
          <p>{item.note}</p>
        </div>
        <Button variant="secondary" icon={ExternalLink} className="full-width" onClick={() => window.alert('原始报告查看功能将在接入真实文件后启用。')}>查看原始报告</Button>
      </aside>
    </div>
  )
}

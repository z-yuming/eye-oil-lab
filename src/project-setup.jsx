import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  FlaskConical,
  Layers3,
  Package,
  SearchCheck,
  SlidersHorizontal,
} from 'lucide-react'
import {
  developmentBlueprint,
  getCategoryTemplate,
  getMarketOpportunity,
  marketOpportunities,
} from './data'
import { Button, Field, Panel, StageHeading, Status } from './ui'

function LayerHeading({ index, icon: Icon, title, description }) {
  return (
    <div className="layer-heading">
      <span>{index}</span>
      <Icon size={17} />
      <div><strong>{title}</strong><small>{description}</small></div>
    </div>
  )
}

function ProjectField({ label, value, onChange, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function ProjectSetup({ state, updateState, startFromOpportunity, enterDevelopment }) {
  const activeOpportunity = getMarketOpportunity(state.selectedOpportunityId)
  const activeTemplate = getCategoryTemplate(activeOpportunity.templateId)
  const [pendingOpportunityId, setPendingOpportunityId] = useState(activeOpportunity.id)
  const project = { ...activeTemplate.project, ...(state.project || {}) }
  const pendingOpportunity = getMarketOpportunity(pendingOpportunityId)
  const pendingTemplate = getCategoryTemplate(pendingOpportunity.templateId)
  const updateProject = (key, value) => updateState({ project: { ...project, [key]: value } })

  useEffect(() => {
    setPendingOpportunityId(activeOpportunity.id)
  }, [activeOpportunity.id])

  return (
    <div className="project-setup" data-testid="project-setup">
      <StageHeading
        title="机会建项"
        description="产品不是先被拍脑袋选出来的。先确认此前市场研究发现的机会，再由机会匹配品类方法论并建立本次开发项目。"
        actions={<Button icon={ArrowRight} onClick={enterDevelopment}>进入产品开发</Button>}
      />

      <section className="opportunity-origin" aria-label="市场机会如何驱动项目">
        <SearchCheck size={18} />
        <div><strong>前置输入：市场机会</strong><span>市场资料、消费者反馈、竞品与渠道信号已经汇聚为可被选择的机会。选中机会后，系统才推荐适配的产品方法论。</span></div>
        <Status tone="success">机会驱动</Status>
      </section>

      <section className="layer-chain" aria-label="产品开发三层执行关系">
        <div className="layer-chain-item">
          <LayerHeading index="01" icon={Layers3} title="通用开发流程" description="所有产品共用八个决策阶段" />
          <p>在市场阶段发现机会，保证从机会到结果都有可追溯的交接。</p>
        </div>
        <ArrowRight className="layer-chain-arrow" size={19} />
        <div className="layer-chain-item active">
          <LayerHeading index="02" icon={SlidersHorizontal} title="品类方法论" description={activeTemplate.category} />
          <p>由市场机会推荐，决定每一步看什么、验证什么和交付什么。</p>
        </div>
        <ArrowRight className="layer-chain-arrow" size={19} />
        <div className="layer-chain-item">
          <LayerHeading index="03" icon={Package} title="当前项目实例" description={project.name} />
          <p>承载本次产品的规格、价格、渠道、资料和阶段性决策。</p>
        </div>
      </section>

      <Panel title="1. 从市场发现中选择机会" subtitle="这是建项的起点。每个机会保留它来自什么信号、基于哪些资料、下一步要验证什么。" className="setup-panel">
        <div className="opportunity-grid" role="list" aria-label="市场机会">
          {marketOpportunities.map((opportunity) => {
            const template = getCategoryTemplate(opportunity.templateId)
            const active = opportunity.id === activeOpportunity.id
            const pending = opportunity.id === pendingOpportunity.id && !active
            return (
              <button
                className={`opportunity-card ${active ? 'selected' : ''} ${pending ? 'pending' : ''}`}
                key={opportunity.id}
                onClick={() => setPendingOpportunityId(opportunity.id)}
                aria-pressed={active || pending}
              >
                <div className="opportunity-card-top"><span>{opportunity.confidence}</span>{active && <Check size={16} />}</div>
                <strong>{opportunity.title}</strong>
                <p>{opportunity.summary}</p>
                <dl>
                  <div><dt>市场信号</dt><dd>{opportunity.signal}</dd></div>
                  <div><dt>建议方法论</dt><dd>{template.name}</dd></div>
                </dl>
              </button>
            )
          })}
        </div>
        <div className="opportunity-apply-note">
          <Check size={15} />
          <span>{pendingOpportunity.id === activeOpportunity.id
            ? `当前项目由「${activeOpportunity.title}」触发，并保留“${activeOpportunity.evidence}”作为证据基线。`
            : `已选择「${pendingOpportunity.title}」。系统将以「${pendingTemplate.name}」方法论建立新的项目状态，当前项目不会提前变更。`}</span>
          {pendingOpportunity.id !== activeOpportunity.id && <Button variant="secondary" icon={ArrowRight} onClick={() => startFromOpportunity(pendingOpportunity.id)}>根据此机会创建项目</Button>}
        </div>
      </Panel>

      <Panel title="2. 由机会匹配的品类方法论" subtitle="品类不是第一步，而是为把机会做成产品选择的一套工作规则。" className="setup-panel">
        <div className="opportunity-recommendation">
          <div><span>当前机会</span><strong>{activeOpportunity.title}</strong><small>{activeOpportunity.signal}</small></div>
          <div><span>推荐方法论</span><strong>{activeTemplate.name}</strong><small>{activeOpportunity.fitReason}</small></div>
          <div><span>本轮先验证</span><strong>{activeOpportunity.decision}</strong><small>{activeOpportunity.evidence}</small></div>
        </div>
      </Panel>

      <Panel title="3. 通用产品开发流程" subtitle="这层不因品类改变。它定义每一步的输入、决策和交付物。" className="setup-panel">
        <div className="blueprint-grid">
          {developmentBlueprint.map((stage, index) => (
            <div className="blueprint-step" key={stage.id}>
              <span className="blueprint-number">{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{stage.label}</strong><p>{stage.role}</p></div>
              <dl><div><dt>输入</dt><dd>{stage.universalInput}</dd></div><div><dt>交付</dt><dd>{stage.universalOutput}</dd></div></dl>
            </div>
          ))}
        </div>
      </Panel>

      <div className="setup-grid">
        <Panel title="4. 当前开发项目实例" subtitle="由市场机会建立后，这些字段进入项目标题、阶段上下文、AI顾问和导出文件。" className="setup-panel">
          <div className="project-form-grid">
            <ProjectField label="项目名称" value={project.name} onChange={(value) => updateProject('name', value)} hint={`${project.name.length}/40`} />
            <ProjectField label="产品形态" value={project.form} onChange={(value) => updateProject('form', value)} />
            <ProjectField label="结构 / 规格" value={project.structure} onChange={(value) => updateProject('structure', value)} />
            <ProjectField label="首发渠道" value={project.channel} onChange={(value) => updateProject('channel', value)} />
            <ProjectField label="目标价格带" value={project.priceBand} onChange={(value) => updateProject('priceBand', value)} />
            <ProjectField label="目标上市时间" value={project.launch} onChange={(value) => updateProject('launch', value)} />
          </div>
          <div className="project-instance-meta">
            <div><SearchCheck size={16} /><span><strong>已关联机会</strong>{activeOpportunity.title}</span></div>
            <div><FileText size={16} /><span><strong>{project.sourceCount}份</strong>{project.sourceLabel}</span></div>
            <div><ClipboardList size={16} /><span><strong>{developmentBlueprint.length}个</strong>阶段已装载品类规则</span></div>
          </div>
        </Panel>

        <aside className="setup-aside">
          <Panel title="当前驱动关系" subtitle="市场机会决定做什么，方法论决定怎么做。" className="sticky-panel">
            <div className="project-binding">
              <div><SearchCheck size={16} /><span>市场机会</span><strong>{activeOpportunity.title}</strong></div>
              <div><SlidersHorizontal size={16} /><span>品类方法论</span><strong>{activeTemplate.name}</strong></div>
              <div><Package size={16} /><span>项目实例</span><strong>{project.name}</strong></div>
            </div>
            <div className="side-note"><FlaskConical size={16} /><span>这里允许同一条机会被重新定义为不同项目，但每次变化都应回到市场信号和证据，而不是从产品名称倒推需求。</span></div>
          </Panel>
        </aside>
      </div>

      <Panel title="机会如何影响后续八步" subtitle={`「${activeOpportunity.title}」通过「${activeTemplate.name}」把市场判断变成每一步的工作重点。`} className="setup-panel">
        <div className="table-wrap setup-matrix">
          <table>
            <thead><tr><th>阶段</th><th>本品类重点</th><th>关键决策</th><th>本阶段交付</th></tr></thead>
            <tbody>
              {developmentBlueprint.map((stage, index) => {
                const profile = activeTemplate.stageProfiles[stage.id]
                return <tr key={stage.id}><td><span className="stage-index">{index + 1}</span><span className="cell-strong">{stage.label}</span></td><td>{profile.focus}</td><td>{profile.decision}</td><td><Status tone="success">{profile.output}</Status></td></tr>
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

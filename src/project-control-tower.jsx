import {
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
  Factory,
  FileCheck2,
  FlaskConical,
  Gauge,
  Package,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { getMarketOpportunity, getProductDirection, stages, supplierSourceStats } from './data'
import { Button, Panel, StageHeading, Status } from './ui'

const workstreamIcons = [SearchCheck, Users, Target, Sparkles, Gauge, Package, Factory, FileCheck2]
const workstreamDescriptions = [
  '市场需求、趋势与原始证据',
  '目标用户、场景与未满足任务',
  '竞品结构、价格与可切入空档',
  '功效、成分、技术与体验方案',
  '人群、价格与一句话卖点',
  '纸盒、内料与视觉打样',
  '包材、内料、代加工与报价匹配',
  '样品效果、验证结论与上市准备',
]

function stageStatus(index, state) {
  if (state.completed?.includes(index)) return { label: '已完成', tone: 'success', className: 'done' }
  if (state.activeStage === index) return { label: '当前关注', tone: 'warning', className: 'active' }
  return { label: '可直接进入', tone: 'neutral', className: '' }
}

function Metric({ label, value, note }) {
  return <div className="control-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
}

export function ProjectControlTower({ state, project, onOpenStage, onOpenOpportunity, onExportProject }) {
  const opportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
  const direction = getProductDirection(opportunity, state.selectedDirectionId)
  const completedCount = state.completed?.length || 0
  const supplierCount = state.supplierLibraryOverride?.length || supplierSourceStats.libraryRecords
  const evidenceCount = (opportunity.evidenceItems || []).length + (state.opportunityWorkspace?.customEvidence || []).filter((item) => item.opportunityId === opportunity.id).length
  const currentStage = stages[state.activeStage] || stages[0]
  const nextStage = stages.find((stage, index) => index > state.activeStage && !state.completed?.includes(index)) || null

  return (
    <div className="project-control-tower">
      <StageHeading
        title="项目执行总览"
        description="把长期产品开发拆成可并行推进的工作流，团队按当前约束进入对应环节，不必等待前一阶段全部结束。"
        actions={<><Button variant="secondary" icon={SearchCheck} onClick={onOpenOpportunity}>回到机会快跑</Button><Button icon={ClipboardList} onClick={onExportProject}>导出项目</Button></>}
      />

      <div className="control-hero">
        <div className="control-hero-copy">
          <span className="control-eyebrow">当前项目 · {project.category || '眼部护理'}</span>
          <h2>{project.name}</h2>
          <p>来自「{opportunity.title}」的「{direction?.name || '待选产品路径'}」正在执行。机会证据作为项目基线保留，后续改动会回到这里检查影响。</p>
          <div className="control-hero-actions"><Button icon={ArrowRight} onClick={() => onOpenStage(state.activeStage)}>继续{currentStage.label}</Button><button className="control-text-button" onClick={onOpenOpportunity}>查看机会与路径判断 <ArrowRight size={14} /></button></div>
        </div>
        <div className="control-metric-grid">
          <Metric label="阶段完成" value={`${completedCount}/${stages.length}`} note="可从任意工作流进入" />
          <Metric label="机会证据" value={`${evidenceCount} 条`} note="可追溯市场信号" />
          <Metric label="供应商库" value={`${supplierCount}`} note="已接入匹配池" />
        </div>
      </div>

      <div className="control-layout">
        <div className="control-main-column">
          <Panel title="并行工作流" subtitle="阶段是工作流，不是必须排队的长链路。每张卡片都保留独立产出、风险和进入入口。" className="workstream-panel">
            <div className="workstream-grid">
              {stages.map((stage, index) => {
                const Icon = workstreamIcons[index]
                const status = stageStatus(index, state)
                return <button key={stage.id} className={`workstream-card ${status.className}`} onClick={() => onOpenStage(index)}>
                  <div className="workstream-card-top"><span className="workstream-index">{String(index + 1).padStart(2, '0')}</span><Icon size={17} /><Status tone={status.tone}>{status.label}</Status></div>
                  <strong>{stage.label}</strong>
                  <p>{workstreamDescriptions[index]}</p>
                  <span className="workstream-enter">进入工作流 <ArrowRight size={13} /></span>
                </button>
              })}
            </div>
          </Panel>

          <Panel title="项目决策基线" subtitle="从机会快跑带入的判断，作为V1.0的约束，不会被后续阶段的临时想法悄悄覆盖。" className="project-baseline-panel">
            <div className="baseline-grid">
              <div><span>为什么做</span><strong>{opportunity.unmetNeed || opportunity.summary}</strong><small>{evidenceCount} 条机会证据已关联</small></div>
              <div><span>做什么</span><strong>{direction?.name || '尚未选定产品路径'}</strong><small>{direction?.premise || '回到机会快跑完成路径选择'}</small></div>
              <div><span>先验证什么</span><strong>{direction?.risk || '补齐产品路径、成本与供应商约束'}</strong><small>任何关键变更都应留下决策记录</small></div>
            </div>
          </Panel>
        </div>

        <aside className="control-side-column">
          <Panel title="当前协同门" subtitle="决定团队下一步优先打开哪张卡片。" className="control-gate-panel">
            <div className="control-gate-head"><div><span>当前关注</span><strong>{currentStage.label}</strong></div><Status tone="warning">进行中</Status></div>
            <p className="control-gate-copy">{currentStage.output || workstreamDescriptions[state.activeStage]}</p>
            <div className="control-gate-next"><span>建议下一步</span><strong>{nextStage ? nextStage.label : '回看项目整体结果'}</strong><small>{nextStage ? workstreamDescriptions[stages.indexOf(nextStage)] : '检查产品效果、成本和上市条件是否仍满足。'}</small></div>
            <Button variant="secondary" icon={ArrowRight} onClick={() => onOpenStage(state.activeStage)}>继续当前工作流</Button>
          </Panel>

          <Panel title="项目约束提醒" subtitle="这些内容会影响跨工作流决策。" className="control-risk-panel">
            <div className="control-alert-list">
              <div><ShieldCheck size={16} /><span><strong>证据要回溯</strong><small>市场与竞品结论必须能回到原始资料。</small></span></div>
              <div><CircleAlert size={16} /><span><strong>供应商要匹配</strong><small>包材、内料、包装与代加工分别确认，不把“有供应商”当成已落地。</small></span></div>
              <div><FlaskConical size={16} /><span><strong>效果要验证</strong><small>产品卖点、样品体验与最终表达保持同一条证据链。</small></span></div>
            </div>
          </Panel>

          <div className="control-completion-note"><Check size={16} /><span>项目数据自动保存，当前选择可随时回到机会快跑重新比较。</span></div>
        </aside>
      </div>
    </div>
  )
}

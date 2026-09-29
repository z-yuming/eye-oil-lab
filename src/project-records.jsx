import { ArrowRight, CalendarDays, Check, Clock3, FolderKanban, Plus, SearchCheck } from 'lucide-react'
import { Button, Panel, StageHeading, Status } from './ui'

function statusTone(status) {
  if (status === '已完成') return 'success'
  if (status === '已暂停') return 'neutral'
  return 'warning'
}

function ProjectMetrics({ records, currentId }) {
  const activeCount = records.filter((record) => record.status === '开发中').length
  const completedCount = records.filter((record) => record.status === '已完成').length
  return <div className="project-record-metrics">
    <div><span>项目总数</span><strong>{records.length}</strong><small>每个机会立项后独立记录</small></div>
    <div><span>开发中</span><strong>{activeCount}</strong><small>可随时切换继续推进</small></div>
    <div><span>已完成</span><strong>{completedCount}</strong><small>保留阶段与决策结果</small></div>
    <div><span>当前项目</span><strong>{records.findIndex((record) => record.id === currentId) + 1 || '-'}</strong><small>当前工作上下文</small></div>
  </div>
}

export function ProjectRecords({ state, onOpenProject, onReturnWorkspace, onOpenOpportunity }) {
  const records = [...(state.projectRecords || [])].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
  return <div className="project-records-page">
    <StageHeading
      title="项目记录"
      description="每次确认产品 Demo 后形成一条独立记录，保存机会来源、产品方向、设计版本、交付方案和关键决策。"
      actions={<><Button variant="secondary" icon={SearchCheck} onClick={onReturnWorkspace}>返回产品工作台</Button><Button icon={Plus} onClick={onOpenOpportunity}>接收新机会</Button></>}
    />
    <ProjectMetrics records={records} currentId={state.projectId} />
    <Panel title="项目列表" subtitle="切换项目后，对应的产品设计和交付方案会一起恢复。">
      <div className="project-record-list">
        {records.map((record) => {
          const current = record.id === state.projectId
          return <article className={`project-record-row ${current ? 'current' : ''}`} key={record.id}>
            <div className="project-record-main">
              <div className="project-record-title"><span className="project-record-code">{record.code}</span><Status tone={statusTone(record.status)}>{current ? '当前项目' : record.status}</Status></div>
              <h2>{record.name}</h2>
              <p>{record.directionName || '待选产品路径'} · 来源机会：{record.opportunityTitle || '未关联机会'}</p>
            </div>
            <div className="project-record-progress"><span>研发进度</span><strong>{record.progress}/{record.totalStages}</strong><div><i style={{ width: `${record.progressPercent}%` }} /></div><small>当前：{record.stageLabel}</small></div>
            <dl className="project-record-meta"><div><dt><CalendarDays size={13} />建立</dt><dd>{record.createdAt}</dd></div><div><dt><Clock3 size={13} />更新</dt><dd>{record.updatedAt}</dd></div><div><dt><FolderKanban size={13} />方案进度</dt><dd>{record.progress}/{record.totalStages} 模块</dd></div><div><dt><FolderKanban size={13} />决策</dt><dd>{record.decisionCount} 条</dd></div></dl>
            <div className="project-record-action">{current ? <Button variant="secondary" icon={Check} disabled>当前项目</Button> : <Button variant="secondary" icon={ArrowRight} onClick={() => onOpenProject(record.id)}>打开项目</Button>}</div>
          </article>
        })}
      </div>
    </Panel>
  </div>
}

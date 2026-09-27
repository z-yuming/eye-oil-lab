import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FilePlus2,
  FileText,
  FlaskConical,
  FolderOpen,
  History,
  Layers3,
  Plus,
  SearchCheck,
  ShieldCheck,
  Target,
} from 'lucide-react'
import {
  categoryTemplates,
  createOpportunityWorkspace,
  getCategoryTemplate,
  getMarketOpportunities,
  getProductDirection,
  opportunityStatusOptions,
} from './data'
import { Button, Confidence, Field, Panel, ProgressBar, SearchInput, StageHeading, Status } from './ui'

const scoreLabels = {
  demand: '需求强度',
  differentiation: '差异空间',
  margin: '利润空间',
  feasibility: '落地可行',
  evidence: '证据充分',
}

function averageScore(values) {
  const numbers = Object.values(values || {})
  return numbers.length ? Math.round(numbers.reduce((total, value) => total + value, 0) / numbers.length) : 0
}

function routeScore(direction) {
  return averageScore(direction?.scores)
}

function statusFor(workspace, opportunity) {
  return workspace.statusByOpportunity?.[opportunity.id] || opportunity.stage || 'capture'
}

function statusMeta(statusId) {
  return opportunityStatusOptions.find((item) => item.id === statusId) || opportunityStatusOptions[0]
}

function timestamp() {
  return '当前会话'
}

function decision(id, type, title, detail) {
  return { id: `${id}-${Date.now()}`, type, title, detail, createdAt: timestamp() }
}

function OpportunityList({ opportunities, selectedId, workspace, onSelect }) {
  const [query, setQuery] = useState('')
  const visible = opportunities.filter((item) => `${item.title}${item.summary}${item.signal}`.includes(query.trim()))
  return (
    <Panel title="机会池" subtitle={`${visible.length}/${opportunities.length} 条机会`} className="opportunity-library-panel">
      <div className="opportunity-library-tools"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索机会、场景或信号" /></div>
      <div className="opportunity-list" role="list" aria-label="市场机会池">
        {visible.map((opportunity) => {
          const selected = opportunity.id === selectedId
          const status = statusMeta(statusFor(workspace, opportunity))
          return (
            <button className={`opportunity-list-row ${selected ? 'selected' : ''}`} key={opportunity.id} onClick={() => onSelect(opportunity.id)} aria-pressed={selected}>
              <span className="opportunity-list-index">{String(opportunities.indexOf(opportunity) + 1).padStart(2, '0')}</span>
              <span className="opportunity-list-copy"><strong>{opportunity.title}</strong><small>{opportunity.signal}</small></span>
              <span className="opportunity-list-score"><b>{averageScore(opportunity.scoreBreakdown)}</b><Status tone={status.tone}>{status.label}</Status></span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}

function ScoreBoard({ opportunity, evidenceCount }) {
  const score = averageScore(opportunity.scoreBreakdown)
  return (
    <Panel title="机会评分" subtitle="先用于排序和讨论，不替代真实验证。" className="opportunity-score-panel">
      <div className="opportunity-score-head"><div><strong>{score}</strong><span>/100</span></div><p>证据条目 {evidenceCount} 条</p></div>
      <div className="opportunity-score-list">
        {Object.entries(opportunity.scoreBreakdown).map(([key, value]) => <ProgressBar key={key} label={scoreLabels[key]} value={value} accent={value < 65} />)}
      </div>
    </Panel>
  )
}

function GateBoard({ opportunity, workspace, selectedDirection, evidenceCount, onStatusChange, onStartProject }) {
  const status = statusMeta(statusFor(workspace, opportunity))
  const checks = [
    { label: '市场证据已归档', done: evidenceCount >= 2, note: evidenceCount >= 2 ? `${evidenceCount} 条证据可追溯` : '至少需要两条可追溯证据' },
    { label: '已选首发产品路径', done: Boolean(selectedDirection), note: selectedDirection?.name || '尚未选择路径' },
    { label: '路径具备方法论', done: Boolean(selectedDirection?.buildable), note: selectedDirection?.buildable ? `已匹配${getCategoryTemplate(selectedDirection.templateId).name}` : '需要补齐该方向的方法论' },
    { label: '机会已通过建项评审', done: status.id === 'ready', note: status.id === 'ready' ? '可建立开发项目' : '状态尚未切换为“可建项”' },
  ]
  const canStart = checks.every((item) => item.done)
  return (
    <Panel title="建项评审门" subtitle="不是有一个好点子就立项，而是让证据、路径和约束一起过门。" className="opportunity-gate-panel">
      <div className="opportunity-status-control">
        <label htmlFor={`opportunity-status-${opportunity.id}`}>当前状态</label>
        <select id={`opportunity-status-${opportunity.id}`} value={status.id} onChange={(event) => onStatusChange(event.target.value)}>
          {opportunityStatusOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <small>{status.description}</small>
      </div>
      <div className="opportunity-gate-checks">
        {checks.map((item) => <div key={item.label} className={item.done ? 'done' : ''}>{item.done ? <Check size={15} /> : <CircleAlert size={15} />}<span><strong>{item.label}</strong><small>{item.note}</small></span></div>)}
      </div>
      <Button icon={ArrowRight} disabled={!canStart} onClick={onStartProject}>按选定路径正式立项</Button>
      {!canStart && <p className="opportunity-gate-note">完成未通过的评审项后，才能把这个机会写入产品开发流程。</p>}
    </Panel>
  )
}

function Overview({ opportunities, workspace, selectedOpportunity, selectedDirection, evidenceEntries, onSelect, onStatusChange, onStartProject }) {
  const template = getCategoryTemplate(selectedDirection?.templateId || selectedOpportunity.templateId)
  const status = statusMeta(statusFor(workspace, selectedOpportunity))
  return (
    <div className="opportunity-overview">
      <OpportunityList opportunities={opportunities} selectedId={selectedOpportunity.id} workspace={workspace} onSelect={onSelect} />
      <div className="opportunity-focus-column">
        <Panel title="机会判断" subtitle="先把市场发现说清楚，再讨论做成什么产品。" className="opportunity-judgement-panel">
          <div className="opportunity-title-row"><div><Status tone={status.tone}>{status.label}</Status><h2>{selectedOpportunity.title}</h2><p>{selectedOpportunity.summary}</p></div><div className="opportunity-template-mark"><Layers3 size={18} /><span>推荐方法论</span><strong>{template.name}</strong></div></div>
          <div className="opportunity-facts">
            <div><span>核心人群</span><strong>{selectedOpportunity.targetUser}</strong></div>
            <div><span>未被满足的任务</span><strong>{selectedOpportunity.unmetNeed}</strong></div>
            <div className="warning"><span>反证与边界</span><strong>{selectedOpportunity.counterEvidence}</strong></div>
          </div>
        </Panel>
        <Panel title="当前建议" subtitle="这是一条待验证的路径，不是已经成立的产品结论。" className="opportunity-next-panel">
          <div className="opportunity-next-content"><Target size={19} /><div><strong>{selectedDirection?.name || '尚未选择产品路径'}</strong><p>{selectedDirection?.premise || '请前往“产品路径”选择一个可比较的方向。'}</p></div><ChevronRight size={17} /></div>
          <div className="opportunity-next-meta"><span>路径综合分 <b>{routeScore(selectedDirection)}</b></span><span>资料基线 <b>{evidenceEntries.length} 条</b></span><span>下一步 <b>{selectedOpportunity.decision}</b></span></div>
        </Panel>
      </div>
      <aside className="opportunity-overview-aside"><ScoreBoard opportunity={selectedOpportunity} evidenceCount={evidenceEntries.length} /><GateBoard opportunity={selectedOpportunity} workspace={workspace} selectedDirection={selectedDirection} evidenceCount={evidenceEntries.length} onStatusChange={onStatusChange} onStartProject={onStartProject} /></aside>
    </div>
  )
}

function EvidenceWorkspace({ opportunity, workspace, entries, onWorkspaceUpdate, openEvidence }) {
  const fileInput = useRef(null)
  const [form, setForm] = useState({ finding: '', source: '', confidence: '中', note: '' })
  const imported = workspace.importedSources?.filter((item) => item.opportunityId === opportunity.id) || []
  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const additions = await Promise.all(files.map(async (file, index) => {
      let excerpt = ''
      const readable = /\.(md|txt|csv|json)$/i.test(file.name) || file.type.startsWith('text/') || file.type === 'application/json'
      if (readable) {
        try {
          excerpt = (await file.text()).replace(/\s+/g, ' ').trim().slice(0, 220)
        } catch {
          excerpt = ''
        }
      }
      const sourceId = `source-${Date.now()}-${index}`
      return {
        source: { id: sourceId, opportunityId: opportunity.id, name: file.name, size: file.size, type: file.type || '未知类型', excerpt, addedAt: timestamp() },
        evidence: { id: `evidence-${sourceId}`, opportunityId: opportunity.id, finding: excerpt || `已归档「${file.name}」，等待提炼出可复核的市场结论。`, source: file.name, date: timestamp(), sample: `${Math.max(1, Math.round(file.size / 1024))} KB 文件`, confidence: '待评估', scope: '用户导入资料', note: readable ? '系统已保留文本前段，仍需人工确认它能支持的结论。' : '该格式已归档；请补充摘录或用 AI 顾问提炼后再作为证据使用。' },
      }
    }))
    onWorkspaceUpdate((current) => ({
      ...current,
      importedSources: [...(current.importedSources || []), ...additions.map((item) => item.source)],
      customEvidence: [...(current.customEvidence || []), ...additions.map((item) => item.evidence)],
      decisionLog: [decision(opportunity.id, '资料归档', `归档 ${additions.length} 份市场资料`, additions.map((item) => item.source.name).join('、')), ...(current.decisionLog || [])],
    }))
    event.target.value = ''
  }
  const addEvidence = () => {
    if (!form.finding.trim() || !form.source.trim()) return
    onWorkspaceUpdate((current) => ({
      ...current,
      customEvidence: [{ id: `manual-${Date.now()}`, opportunityId: opportunity.id, finding: form.finding.trim(), source: form.source.trim(), date: timestamp(), sample: '人工提炼', confidence: form.confidence, scope: '项目团队归档', note: form.note.trim() || '等待后续验证或反证补充。' }, ...(current.customEvidence || [])],
      decisionLog: [decision(opportunity.id, '证据提炼', '新增一条机会证据', form.finding.trim()), ...(current.decisionLog || [])],
    }))
    setForm({ finding: '', source: '', confidence: '中', note: '' })
  }
  return (
    <div className="opportunity-evidence-view">
      <div className="opportunity-evidence-summary"><div><FileText size={18} /><span><strong>{entries.length}</strong>条证据</span></div><div><Archive size={18} /><span><strong>{imported.length}</strong>份已归档资料</span></div><div><ShieldCheck size={18} /><span><strong>{entries.filter((item) => item.confidence.includes('高')).length}</strong>条高可信证据</span></div></div>
      <div className="opportunity-evidence-grid">
        <Panel title="资料归档" subtitle="支持保留 Markdown、TXT、CSV、JSON 的文本前段；其他文件也会先登记来源。">
          <div className="source-dropzone"><FolderOpen size={23} /><div><strong>把市场资料加入当前机会</strong><p>文件不会被当作指令执行，只作为需要提炼和复核的资料来源保存。</p></div><input ref={fileInput} className="visually-hidden" type="file" accept=".md,.txt,.csv,.json,.pdf,.doc,.docx,.xlsx,.xls" multiple onChange={handleFiles} /><Button variant="secondary" icon={FilePlus2} onClick={() => fileInput.current?.click()}>归档资料</Button></div>
          {imported.length > 0 && <div className="imported-source-list">{imported.map((item) => <div key={item.id}><FileText size={15} /><span><strong>{item.name}</strong><small>{item.addedAt} · {Math.max(1, Math.round(item.size / 1024))} KB</small></span><Status tone="neutral">已归档</Status></div>)}</div>}
        </Panel>
        <Panel title="人工提炼证据" subtitle="把资料中的结论、口径和使用边界拆开写，避免用一句感受替代证据。">
          <div className="evidence-form">
            <Field label="关键发现"><textarea value={form.finding} maxLength={240} placeholder="例如：用户在出差场景中更在意便携与不漏液。" onChange={(event) => setForm((current) => ({ ...current, finding: event.target.value }))} /></Field>
            <Field label="来源"><input value={form.source} placeholder="报告、访谈、渠道数据或评价批次" onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} /></Field>
            <Field label="可信度"><select value={form.confidence} onChange={(event) => setForm((current) => ({ ...current, confidence: event.target.value }))}><option>高</option><option>中高</option><option>中</option><option>待评估</option></select></Field>
            <Field label="使用边界"><input value={form.note} placeholder="它能支持什么，不能推导什么" onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></Field>
            <Button icon={Check} onClick={addEvidence}>写入证据链</Button>
          </div>
        </Panel>
      </div>
      <Panel title="证据链" subtitle="点击任意结论可以查看来源、口径、可信度和使用边界。">
        <div className="table-wrap"><table><thead><tr><th>关键发现</th><th>来源</th><th>口径</th><th>可信度</th><th>适用范围</th></tr></thead><tbody>{entries.map((item) => <tr key={item.id} className="clickable-row" onClick={() => openEvidence(item)}><td className="cell-strong">{item.finding}</td><td>{item.source}</td><td>{item.sample}</td><td><Confidence value={item.confidence === '待评估' ? '中' : item.confidence} /></td><td>{item.scope}</td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  )
}

function RouteWorkspace({ opportunity, workspace, selectedDirection, onSelectDirection, onStartProject }) {
  const status = statusMeta(statusFor(workspace, opportunity))
  return (
    <div className="opportunity-routes-view">
      <Panel title="产品路径对比" subtitle="每一条路径都从同一个市场机会出发，比较它是否更值得投入，而不是先选品再找理由。">
        <div className="table-wrap"><table className="route-table"><thead><tr><th>路径</th><th>用户匹配</th><th>差异空间</th><th>利润空间</th><th>落地可行</th><th>综合</th><th>状态</th></tr></thead><tbody>{opportunity.directions.map((direction) => {
          const selected = direction.id === selectedDirection?.id
          return <tr key={direction.id} className={`clickable-row ${selected ? 'selected-route' : ''}`} onClick={() => onSelectDirection(direction.id)}><td><label className="route-choice"><input type="radio" checked={selected} onChange={() => onSelectDirection(direction.id)} /><span className="custom-radio" /><span><strong>{direction.name}</strong><small>{direction.premise}</small></span></label></td><td>{direction.scores.userFit}</td><td>{direction.scores.differentiation}</td><td>{direction.scores.margin}</td><td>{direction.scores.feasibility}</td><td><b className="route-score">{routeScore(direction)}</b></td><td><Status tone={direction.buildable ? 'success' : 'neutral'}>{direction.buildable ? '可建项' : '待补方法论'}</Status></td></tr>
        })}</tbody></table></div>
      </Panel>
      <div className="route-decision-grid">
        <Panel title="选定路径" subtitle="选择不等于通过建项门，仍需证据和状态一起满足。">
          <div className="route-decision-copy"><Target size={20} /><div><strong>{selectedDirection?.name}</strong><p>{selectedDirection?.premise}</p></div><span className="route-score-large">{routeScore(selectedDirection)}</span></div>
          <dl className="definition-list compact"><div><dt>匹配方法论</dt><dd>{selectedDirection ? getCategoryTemplate(selectedDirection.templateId).name : '未选择'}</dd></div><div><dt>主要风险</dt><dd>{selectedDirection?.risk}</dd></div><div><dt>当前评审</dt><dd><Status tone={status.tone}>{status.label}</Status></dd></div></dl>
        </Panel>
        <Panel title="为什么不是其他方向" subtitle="把放弃原因留下来，后续出现新证据时可重新打开比较。">
          <div className="route-decision-reasons">{opportunity.directions.filter((direction) => direction.id !== selectedDirection?.id).map((direction) => <div key={direction.id}><CircleAlert size={15} /><span><strong>{direction.name}</strong><small>{direction.risk}</small></span></div>)}</div>
        </Panel>
      </div>
      {!selectedDirection?.buildable && <div className="route-methodology-warning"><CircleAlert size={16} /><span>当前选中的路径尚未配置独立方法论。它可以保留在策略比较中，但不能伪装成已经具备可执行开发流程。</span></div>}
      <div className="route-action"><span>通过评审后，将把“{selectedDirection?.name}”连同机会和路径记录写入产品开发项目。</span><Button icon={ArrowRight} disabled={!selectedDirection?.buildable || status.id !== 'ready'} onClick={onStartProject}>按此路径正式立项</Button></div>
    </div>
  )
}

function DecisionWorkspace({ workspace, opportunity, selectedDirection, onWorkspaceUpdate }) {
  const [note, setNote] = useState('')
  const logs = workspace.decisionLog || []
  const addDecision = () => {
    if (!note.trim()) return
    onWorkspaceUpdate((current) => ({ ...current, decisionLog: [decision(opportunity.id, '评审记录', `记录「${opportunity.title}」的判断`, note.trim()), ...(current.decisionLog || [])] }))
    setNote('')
  }
  return (
    <div className="opportunity-decisions-view">
      <Panel title="写入评审判断" subtitle="记录为什么做、为什么不做，以及什么条件下应该重新打开这条机会。">
        <div className="decision-entry"><textarea value={note} maxLength={360} placeholder={`例如：先以「${selectedDirection?.name || '当前路径'}」进入验证；若油感测试未达标，则回到路径对比。`} onChange={(event) => setNote(event.target.value)} /><Button icon={ClipboardCheck} onClick={addDecision}>写入记录</Button></div>
      </Panel>
      <Panel title="决策记录" subtitle="按最新发生时间排序，随机会工作台自动保存。">
        <div className="decision-log">{logs.map((item) => <div key={item.id}><span className="decision-log-icon"><History size={15} /></span><div><span>{item.type} · {item.createdAt}</span><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div>
      </Panel>
    </div>
  )
}

export function OpportunityWorkbench({ state, updateWorkspace, startFromOpportunity, enterDevelopment, openEvidence }) {
  const workspace = state.opportunityWorkspace || createOpportunityWorkspace()
  const opportunities = useMemo(() => getMarketOpportunities(workspace.customOpportunities || []), [workspace.customOpportunities])
  const [activeTab, setActiveTab] = useState('overview')
  const [createOpen, setCreateOpen] = useState(false)
  const [newOpportunity, setNewOpportunity] = useState({ title: '', user: '', summary: '', signal: '', evidence: '', direction: '', templateId: 'eye-oil' })
  const selectedOpportunityId = workspace.selectedOpportunityId || state.selectedOpportunityId || opportunities[0].id
  const selectedOpportunity = opportunities.find((item) => item.id === selectedOpportunityId) || opportunities[0]
  const selectedDirectionId = workspace.selectedDirectionByOpportunity?.[selectedOpportunity.id] || state.selectedDirectionId
  const selectedDirection = getProductDirection(selectedOpportunity, selectedDirectionId)
  const evidenceEntries = [...selectedOpportunity.evidenceItems, ...(workspace.customEvidence || []).filter((item) => item.opportunityId === selectedOpportunity.id)]

  const selectOpportunity = (opportunityId) => updateWorkspace((current) => ({ ...current, selectedOpportunityId: opportunityId }))
  const selectDirection = (directionId) => updateWorkspace((current) => ({
    ...current,
    selectedDirectionByOpportunity: { ...(current.selectedDirectionByOpportunity || {}), [selectedOpportunity.id]: directionId },
    decisionLog: [decision(selectedOpportunity.id, '路径选择', `选择「${getProductDirection(selectedOpportunity, directionId)?.name}」作为当前对比路径`, '路径仍需通过证据和建项评审门。'), ...(current.decisionLog || [])],
  }))
  const updateStatus = (statusId) => {
    const status = statusMeta(statusId)
    updateWorkspace((current) => ({
      ...current,
      statusByOpportunity: { ...(current.statusByOpportunity || {}), [selectedOpportunity.id]: statusId },
      decisionLog: [decision(selectedOpportunity.id, '评审状态', `将「${selectedOpportunity.title}」更新为${status.label}`, status.description), ...(current.decisionLog || [])],
    }))
  }
  const beginProject = () => startFromOpportunity(selectedOpportunity.id, selectedDirection?.id)
  const createNewOpportunity = () => {
    if (!newOpportunity.title.trim() || !newOpportunity.signal.trim() || !newOpportunity.direction.trim()) return
    const template = getCategoryTemplate(newOpportunity.templateId)
    const id = `custom-${Date.now()}`
    const directionId = `${id}-path`
    const evidenceItems = newOpportunity.evidence.trim() ? [{
      id: `${id}-evidence`,
      finding: newOpportunity.evidence.trim(),
      source: '项目团队初始归档',
      date: timestamp(),
      sample: '待补充口径',
      confidence: '待评估',
      scope: '新建机会基线',
      note: '该结论已进入机会池，仍需补充原始来源和反证。',
    }] : []
    const opportunity = {
      id,
      title: newOpportunity.title.trim(),
      summary: newOpportunity.summary.trim() || '已创建市场机会，等待继续补充用户任务、证据和产品路径。',
      signal: newOpportunity.signal.trim(),
      evidence: evidenceItems.length ? '1条初始证据，待补充' : '尚未添加证据',
      confidence: '待整理',
      decision: '先补齐资料、反证和首发路径，再进入评审。',
      fitReason: `暂以${template.name}作为首发路径的工作方法。`,
      templateId: template.id,
      stage: 'capture',
      targetUser: newOpportunity.user.trim() || '待补充目标用户与使用场景。',
      unmetNeed: '待从真实用户任务和现有替代方案中提炼。',
      counterEvidence: '尚未记录反证；不能仅凭单条市场信号建立项目。',
      scoreBreakdown: { demand: 55, differentiation: 50, margin: 50, feasibility: 50, evidence: evidenceItems.length ? 35 : 15 },
      evidenceItems,
      directions: [{
        id: directionId,
        name: newOpportunity.direction.trim(),
        premise: `基于“${newOpportunity.signal.trim()}”形成的暂定首发路径。`,
        templateId: template.id,
        buildable: true,
        recommended: true,
        scores: { userFit: 55, differentiation: 50, margin: 50, feasibility: 50 },
        risk: '新建路径尚未完成竞品、成本、供应链和真实用户验证。',
        project: { ...template.project, name: newOpportunity.direction.trim() },
      }],
    }
    updateWorkspace((current) => ({
      ...current,
      customOpportunities: [...(current.customOpportunities || []), opportunity],
      selectedOpportunityId: id,
      selectedDirectionByOpportunity: { ...(current.selectedDirectionByOpportunity || {}), [id]: directionId },
      statusByOpportunity: { ...(current.statusByOpportunity || {}), [id]: 'capture' },
      decisionLog: [decision(id, '新建机会', `建立「${opportunity.title}」`, `暂定首发路径：${opportunity.directions[0].name}。`), ...(current.decisionLog || [])],
    }))
    setNewOpportunity({ title: '', user: '', summary: '', signal: '', evidence: '', direction: '', templateId: 'eye-oil' })
    setCreateOpen(false)
    setActiveTab('overview')
  }

  const tabs = [
    { id: 'overview', label: '机会总览', icon: SearchCheck },
    { id: 'evidence', label: '资料与证据', icon: FileText },
    { id: 'routes', label: '产品路径', icon: Target },
    { id: 'decisions', label: '决策记录', icon: History },
  ]

  return (
    <div className="opportunity-workbench" data-testid="opportunity-workbench">
      <StageHeading title="产品机会快跑" description="把市场与竞品信号快速收敛成三条可比较的产品路径，再用证据、成本和供应链约束决定是否正式立项。" actions={<><Button variant="secondary" icon={Plus} onClick={() => setCreateOpen((value) => !value)}>新建机会</Button><Button variant="secondary" icon={FlaskConical} onClick={enterDevelopment}>查看当前项目</Button><Button icon={ArrowRight} onClick={() => setActiveTab('routes')}>进入路径评审</Button></>} />
      <div className="opportunity-tabs" role="tablist" aria-label="市场机会工作台视图">{tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={16} /><span>{label}</span></button>)}</div>
      {createOpen && <Panel title="新建市场机会" subtitle="先把你看到的市场现象和用户信号记录进来；产品路径只是暂定方案，不能跳过后续证据和评审。" className="new-opportunity-panel">
        <div className="new-opportunity-form">
          <Field label="机会名称"><input value={newOpportunity.title} maxLength={48} placeholder="例如：敏感肌夜间修护的低负担空档" onChange={(event) => setNewOpportunity((current) => ({ ...current, title: event.target.value }))} /></Field>
          <Field label="目标用户与场景"><input value={newOpportunity.user} maxLength={90} placeholder="谁在什么场景下遇到问题" onChange={(event) => setNewOpportunity((current) => ({ ...current, user: event.target.value }))} /></Field>
          <Field label="市场信号"><textarea value={newOpportunity.signal} maxLength={180} placeholder="评论、渠道、竞品或访谈中反复出现的现象" onChange={(event) => setNewOpportunity((current) => ({ ...current, signal: event.target.value }))} /></Field>
          <Field label="机会判断"><textarea value={newOpportunity.summary} maxLength={180} placeholder="这个信号可能指向什么未满足的需求" onChange={(event) => setNewOpportunity((current) => ({ ...current, summary: event.target.value }))} /></Field>
          <Field label="第一条证据"><textarea value={newOpportunity.evidence} maxLength={180} placeholder="先写下原始资料中最可复核的一条发现" onChange={(event) => setNewOpportunity((current) => ({ ...current, evidence: event.target.value }))} /></Field>
          <Field label="暂定产品路径"><input value={newOpportunity.direction} maxLength={48} placeholder="例如：轻润滚珠眼部精华油" onChange={(event) => setNewOpportunity((current) => ({ ...current, direction: event.target.value }))} /></Field>
          <Field label="匹配方法论"><select value={newOpportunity.templateId} onChange={(event) => setNewOpportunity((current) => ({ ...current, templateId: event.target.value }))}>{categoryTemplates.map((template) => <option key={template.id} value={template.id}>{template.category} · {template.name}</option>)}</select></Field>
          <div className="new-opportunity-actions"><span>创建后状态为“待整理”，不会直接变成可建项目。</span><Button icon={Check} onClick={createNewOpportunity}>写入机会池</Button></div>
        </div>
      </Panel>}
      {activeTab === 'overview' && <Overview opportunities={opportunities} workspace={workspace} selectedOpportunity={selectedOpportunity} selectedDirection={selectedDirection} evidenceEntries={evidenceEntries} onSelect={selectOpportunity} onStatusChange={updateStatus} onStartProject={beginProject} />}
      {activeTab === 'evidence' && <EvidenceWorkspace opportunity={selectedOpportunity} workspace={workspace} entries={evidenceEntries} onWorkspaceUpdate={updateWorkspace} openEvidence={openEvidence} />}
      {activeTab === 'routes' && <RouteWorkspace opportunity={selectedOpportunity} workspace={workspace} selectedDirection={selectedDirection} onSelectDirection={selectDirection} onStartProject={beginProject} />}
      {activeTab === 'decisions' && <DecisionWorkspace workspace={workspace} opportunity={selectedOpportunity} selectedDirection={selectedDirection} onWorkspaceUpdate={updateWorkspace} />}
    </div>
  )
}

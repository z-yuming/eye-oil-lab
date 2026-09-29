import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  Eye,
  FileClock,
  FlaskConical,
  Menu,
  PackageCheck,
  PlayCircle,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import {
  createOpportunityWorkspace,
  createProjectState,
  getCategoryTemplate,
  getMarketOpportunity,
  getProductDirection,
} from './data'
import { AiAdvisor } from './ai'
import { PackagingStage } from './stages'
import { ProjectRecords } from './project-records'
import { ProductDelivery, ProductDemo, SolutionObservation } from './workflow'

const STORAGE_KEY = 'ai-product-development-platform-v3'
const LEGACY_STORAGE_KEYS = ['eye-oil-experiment-lab-v2']

const workflowSteps = [
  { id: 'observation', label: '机会确认', description: '接收与判断', icon: Eye },
  { id: 'demo', label: '产品方案', description: '生成与选择', icon: PlayCircle },
  { id: 'design', label: '产品设计', description: '2D、细修与按需3D', icon: Boxes },
  { id: 'delivery', label: '产品交付', description: '汇总与输出', icon: PackageCheck },
]

function dateLabel() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function createProjectCode() {
  return `PD-${dateLabel().replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function withoutProjectRecords(state) {
  const { projectRecords, ...snapshot } = state
  return snapshot
}

function progressFor(state) {
  const step = state.workflowStep || (state.packagingDesign?.confirmed2D ? 'delivery' : 'design')
  const progressMap = { observation: 1, demo: 2, design: 3, delivery: 4, records: 4 }
  const labelMap = { observation: '方案观察', demo: '产品 Demo', design: '产品设计仓', delivery: '产品交付', records: '产品交付' }
  return { progress: progressMap[step] || 3, stageLabel: labelMap[step] || '产品设计仓' }
}

function buildProjectRecord(state, previous = {}) {
  const opportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
  const direction = getProductDirection(opportunity, state.selectedDirectionId)
  const { progress, stageLabel } = progressFor(state)
  const totalStages = workflowSteps.length
  const projectId = state.projectId || previous.id || `project-${Date.now()}`
  return {
    id: projectId,
    code: previous.code || createProjectCode(),
    name: state.project?.name || '未命名项目',
    status: progress >= totalStages ? '已完成' : '开发中',
    progress,
    totalStages,
    progressPercent: Math.round((progress / totalStages) * 100),
    stageLabel,
    opportunityTitle: opportunity?.title || '未命名市场机会',
    directionName: direction?.name || '待选产品方向',
    decisionCount: state.opportunityWorkspace?.decisionLog?.length || 0,
    supplierCount: 0,
    supplierTotal: 0,
    createdAt: previous.createdAt || dateLabel(),
    updatedAt: dateLabel(),
    snapshot: withoutProjectRecords({ ...state, projectId }),
  }
}

function syncProjectRecords(state) {
  const records = Array.isArray(state.projectRecords) ? state.projectRecords : []
  const currentId = state.projectId || records[0]?.id || `project-${Date.now()}`
  const previous = records.find((record) => record.id === currentId) || {}
  const currentRecord = buildProjectRecord({ ...state, projectId: currentId }, previous)
  const hasCurrent = records.some((record) => record.id === currentId)
  const nextRecords = hasCurrent ? records.map((record) => record.id === currentId ? currentRecord : record) : [currentRecord, ...records]
  return { ...state, projectId: currentId, projectRecords: nextRecords }
}

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
      || LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean)
    if (!stored) return syncProjectRecords({ ...createProjectState(), workflowStep: 'design' })
    const saved = JSON.parse(stored)
    const initialState = createProjectState(saved.templateId, saved.selectedOpportunityId, saved.selectedDirectionId, saved.opportunityWorkspace?.customOpportunities || [])
    return syncProjectRecords({
      ...initialState,
      ...saved,
      projectId: saved.projectId || initialState.projectId,
      projectRecords: Array.isArray(saved.projectRecords) ? saved.projectRecords : [],
      templateId: initialState.templateId,
      selectedOpportunityId: initialState.selectedOpportunityId,
      project: { ...initialState.project, ...(saved.project || {}) },
      assumptions: { ...initialState.assumptions, ...(saved.assumptions || {}) },
      stageNotes: { ...initialState.stageNotes, ...(saved.stageNotes || {}) },
      conceptWeights: { ...initialState.conceptWeights, ...(saved.conceptWeights || {}) },
      conceptVersions: Array.isArray(saved.conceptVersions) ? saved.conceptVersions : initialState.conceptVersions,
      conceptBrief: saved.conceptBrief || initialState.conceptBrief,
      supplierSelections: { ...initialState.supplierSelections, ...(saved.supplierSelections || {}) },
      supplierLibraryOverride: Array.isArray(saved.supplierLibraryOverride) ? saved.supplierLibraryOverride : initialState.supplierLibraryOverride,
      supplierLibraryMeta: saved.supplierLibraryMeta || initialState.supplierLibraryMeta,
      supplierLibraryHistory: Array.isArray(saved.supplierLibraryHistory) ? saved.supplierLibraryHistory : initialState.supplierLibraryHistory,
      supplierWorkbench: {
        ...initialState.supplierWorkbench,
        ...(saved.supplierWorkbench || {}),
        shortlist: { ...initialState.supplierWorkbench.shortlist, ...(saved.supplierWorkbench?.shortlist || {}) },
        backups: { ...initialState.supplierWorkbench.backups, ...(saved.supplierWorkbench?.backups || {}) },
        statuses: { ...initialState.supplierWorkbench.statuses, ...(saved.supplierWorkbench?.statuses || {}) },
        notes: { ...initialState.supplierWorkbench.notes, ...(saved.supplierWorkbench?.notes || {}) },
        quoteAdjustments: { ...initialState.supplierWorkbench.quoteAdjustments, ...(saved.supplierWorkbench?.quoteAdjustments || {}) },
        costModel: { ...initialState.supplierWorkbench.costModel, ...(saved.supplierWorkbench?.costModel || {}) },
      },
      packagingDesign: {
        ...initialState.packagingDesign,
        ...(saved.packagingDesign || {}),
        partSettings: { ...initialState.packagingDesign.partSettings, ...(saved.packagingDesign?.partSettings || {}) },
      },
      opportunityWorkspace: {
        ...initialState.opportunityWorkspace,
        ...(saved.opportunityWorkspace || {}),
        selectedDirectionByOpportunity: { ...initialState.opportunityWorkspace.selectedDirectionByOpportunity, ...(saved.opportunityWorkspace?.selectedDirectionByOpportunity || {}) },
        statusByOpportunity: { ...initialState.opportunityWorkspace.statusByOpportunity, ...(saved.opportunityWorkspace?.statusByOpportunity || {}) },
        importedSources: saved.opportunityWorkspace?.importedSources || initialState.opportunityWorkspace.importedSources,
        customEvidence: saved.opportunityWorkspace?.customEvidence || initialState.opportunityWorkspace.customEvidence,
        decisionLog: saved.opportunityWorkspace?.decisionLog || initialState.opportunityWorkspace.decisionLog,
        customOpportunities: saved.opportunityWorkspace?.customOpportunities || initialState.opportunityWorkspace.customOpportunities,
      },
    })
  } catch {
    return syncProjectRecords({ ...createProjectState(), workflowStep: 'design' })
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const inferredWorkflowView = state.packagingDesign?.confirmed2D || state.completed?.includes(5)
    ? 'delivery'
    : state.selectedDirectionId ? 'design' : state.selectedOpportunityId ? 'demo' : 'observation'
  const initialWorkflowView = workflowSteps.some((step) => step.id === state.lastWorkspaceView)
    ? state.lastWorkspaceView
    : workflowSteps.some((step) => step.id === state.workflowStep) ? state.workflowStep : inferredWorkflowView
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [generatingDeliveryReport, setGeneratingDeliveryReport] = useState(false)
  const [appView, setAppView] = useState(initialWorkflowView)
  const [lastWorkflowView, setLastWorkflowView] = useState(initialWorkflowView)
  const toastTimer = useRef(null)
  const projectMenuRef = useRef(null)
  const activeTemplate = getCategoryTemplate(state.templateId)
  const project = { ...activeTemplate.project, ...(state.project || {}) }

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.title = `AI 产品研发台 - ${project.name || '产品开发'}`
  }, [project.name])

  useEffect(() => {
    const closeProjectMenu = (event) => {
      if (!projectMenuRef.current?.contains(event.target)) setProjectMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeProjectMenu)
    return () => document.removeEventListener('pointerdown', closeProjectMenu)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const notify = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const navigate = (view) => {
    setAppView(view)
    if (workflowSteps.some((step) => step.id === view)) {
      setLastWorkflowView(view)
      setState((current) => ({ ...current, lastWorkspaceView: view }))
    }
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateState = (patch) => setState((current) => {
    const change = typeof patch === 'function' ? patch(current) : patch
    return syncProjectRecords({ ...current, ...change })
  })

  const updateOpportunityWorkspace = (change) => setState((current) => {
    const workspace = current.opportunityWorkspace || createOpportunityWorkspace()
    const nextWorkspace = typeof change === 'function' ? change(workspace) : { ...workspace, ...change }
    return syncProjectRecords({ ...current, opportunityWorkspace: nextWorkspace })
  })

  const generateDeliveryReport = async () => {
    if (generatingDeliveryReport) return
    setGeneratingDeliveryReport(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 50_000)
    try {
      const workspace = state.opportunityWorkspace || createOpportunityWorkspace()
      const opportunity = getMarketOpportunity(workspace.selectedOpportunityId || state.selectedOpportunityId, workspace.customOpportunities || [])
      const selectedDirection = getProductDirection(opportunity, state.selectedDirectionId || workspace.selectedDirectionByOpportunity?.[opportunity?.id])
      const template = getCategoryTemplate(state.templateId)
      const design = state.packagingDesign || {}
      const response = await fetch('/api/ai/product-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          context: {
            category: template.category,
            project: state.project,
            assumptions: state.assumptions,
            opportunity,
            direction: selectedDirection,
            packaging: {
              brandName: design.brandName,
              productName: design.productName,
              style: design.style,
              description: design.description,
              finishes: design.finishes,
              supportingConstraints: design.supportingConstraints,
              confirmed2D: design.confirmed2D,
              generatedConceptCount: Array.isArray(design.generatedConcepts) ? design.generatedConcepts.length : 0,
            },
            selections: {
              audience: state.selectedAudience,
              concept: state.selectedConcept,
              packaging: state.selectedPackaging,
            },
          },
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'AI交付报告生成失败，请稍后重试。')
      if (!payload.report) throw new Error('AI没有返回可用的交付报告。')
      setState((current) => syncProjectRecords({
        ...current,
        deliveryReport: {
          ...payload.report,
          model: payload.model,
          provider: payload.provider,
          generatedAt: payload.generatedAt || new Date().toISOString(),
        },
      }))
      notify(`AI已生成交付报告${payload.model ? ` · ${payload.model}` : ''}`)
    } catch (error) {
      notify(error.name === 'AbortError' ? 'AI交付报告等待超时，已保留当前兜底报告。' : error.message || 'AI交付报告生成失败，请检查模型配置。')
    } finally {
      window.clearTimeout(timeoutId)
      setGeneratingDeliveryReport(false)
    }
  }

  const executeAgentTool = async ({ tool, instruction = '' }) => {
    if (tool === 'generate-packaging') {
      const design = state.packagingDesign || {}
      const workspace = state.opportunityWorkspace || createOpportunityWorkspace()
      const opportunity = getMarketOpportunity(workspace.selectedOpportunityId || state.selectedOpportunityId, workspace.customOpportunities || [])
      const selectedDirection = getProductDirection(opportunity, state.selectedDirectionId || workspace.selectedDirectionByOpportunity?.[opportunity?.id])
      const template = getCategoryTemplate(state.templateId)
      const response = await fetch('/api/ai/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: design.brandName,
          productName: design.productName,
          category: template.category,
          productType: state.project?.form || template.category,
          productForm: state.project?.form,
          imageComposition: `完整展示${state.project?.structure || '产品本体和零售包装'}，结构清楚、比例可信`,
          structure: state.project?.structure || state.project?.form || '零售包装',
          style: design.style,
          palette: design.palette,
          finishes: design.finishes,
          description: [design.description, instruction.trim()].filter(Boolean).join('；'),
          audience: state.assumptions?.user,
          price: state.assumptions?.price,
          constraints: design.supportingConstraints || [],
          marketContext: {
            opportunity: opportunity?.title || '',
            opportunitySignal: opportunity?.summary || opportunity?.signal || opportunity?.evidence || '',
            direction: selectedDirection?.name || state.project?.name || '',
            directionPremise: selectedDirection?.premise || '',
          },
          referenceImages: (design.referenceImages || []).map((item) => item.dataUrl),
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '包装效果图生成失败，请稍后重试。')
      const concepts = Array.isArray(payload.concepts) ? payload.concepts : []
      if (!concepts.length) throw new Error('智能体没有返回可用效果图，请重试。')
      setState((current) => {
        const currentDesign = current.packagingDesign || {}
        const generatedConcepts = concepts.map((item, index) => ({
          ...item,
          name: `AI方案${(currentDesign.generatedConcepts || []).length + index + 1}`,
          direction: currentDesign.style,
          palette: currentDesign.palette,
          mode: 'ai',
          createdAt: new Date().toISOString(),
        }))
        const workspace = current.opportunityWorkspace || createOpportunityWorkspace()
        const nextWorkspace = {
          ...workspace,
          decisionLog: [{
            id: `agent-packaging-${Date.now()}`,
            type: '智能体生成包装效果图',
            title: `已生成 ${generatedConcepts.length} 张 2D 包装效果图`,
            detail: instruction.trim() ? `按要求生成：${instruction.trim()}` : '基于当前包装设计需求生成。',
            createdAt: '当前会话',
          }, ...(workspace.decisionLog || [])],
        }
        return syncProjectRecords({
          ...current,
          completed: current.completed.filter((index) => index !== 5),
          opportunityWorkspace: nextWorkspace,
          packagingDesign: {
            ...currentDesign,
            generatedConcepts: [...(currentDesign.generatedConcepts || []), ...generatedConcepts],
            selectedConceptId: generatedConcepts[0].id,
            confirmed2D: false,
            confirmedConceptId: '',
            show3D: false,
            viewMode: '2d',
          },
        })
      })
      notify(`智能体已用 ${payload.model} 生成 ${concepts.length} 张 2D 包装效果图`)
      return { nextView: 'design' }
    }

    if (tool !== 'generate-directions') throw new Error('这个智能体动作暂未接入。')
    const workspace = state.opportunityWorkspace || createOpportunityWorkspace()
    const opportunity = getMarketOpportunity(workspace.selectedOpportunityId || state.selectedOpportunityId, workspace.customOpportunities || [])
    if (!opportunity?.id) throw new Error('请先从机会确认中选择一条市场机会。')
    const selectedDirectionId = workspace.selectedDirectionByOpportunity?.[opportunity.id]
    const selectedDirection = getProductDirection(opportunity, selectedDirectionId)
    const response = await fetch('/api/ai/product-directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: opportunity.templateId,
        category: getCategoryTemplate(opportunity.templateId).category || '新产品',
        opportunity,
        customRequest: instruction.trim(),
        selectedDirection: selectedDirection ? {
          name: selectedDirection.name,
          premise: selectedDirection.premise,
          form: selectedDirection.project?.form,
          structure: selectedDirection.project?.structure,
          priceBand: selectedDirection.project?.priceBand,
        } : null,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.message || '产品方案生成失败，请稍后重试。')
    const directions = Array.isArray(payload.directions) ? payload.directions : []
    if (!directions.length) throw new Error('智能体没有返回可用产品方案，请重试。')
    const recommended = directions.find((item) => item.recommended) || directions[0]
    setState((current) => {
      const currentWorkspace = current.opportunityWorkspace || createOpportunityWorkspace()
      const currentOpportunity = getMarketOpportunity(currentWorkspace.selectedOpportunityId || current.selectedOpportunityId, currentWorkspace.customOpportunities || [])
      const nextWorkspace = {
        ...currentWorkspace,
        selectedOpportunityId: currentOpportunity.id,
        customOpportunities: [
          ...(currentWorkspace.customOpportunities || []).filter((item) => item.id !== currentOpportunity.id),
          { ...currentOpportunity, directions, aiGeneratedAt: payload.generatedAt, aiModel: payload.model, generationBrief: instruction.trim() },
        ],
        selectedDirectionByOpportunity: { ...(currentWorkspace.selectedDirectionByOpportunity || {}), [currentOpportunity.id]: recommended.id },
        decisionLog: [{
          id: `agent-directions-${Date.now()}`,
          type: '智能体生成产品方案',
          title: `已生成 ${directions.length} 个产品方向`,
          detail: instruction.trim() ? `按要求生成：${instruction.trim()}` : `基于机会「${currentOpportunity.title || '未命名机会'}」生成。`,
          createdAt: '当前会话',
        }, ...(currentWorkspace.decisionLog || [])],
      }
      return syncProjectRecords({ ...current, opportunityWorkspace: nextWorkspace })
    })
    notify(`智能体已生成 ${directions.length} 个产品方案`)
    return { nextView: 'demo' }
  }

  const openDemo = (opportunityId) => {
    updateOpportunityWorkspace((workspace) => ({ ...workspace, selectedOpportunityId: opportunityId }))
    navigate('demo')
  }

  const startFromOpportunity = (opportunityId, directionId) => {
    const opportunity = getMarketOpportunity(opportunityId, state.opportunityWorkspace?.customOpportunities || [])
    const direction = getProductDirection(opportunity, directionId)
    if (!direction) {
      notify('请先选择一个产品 Demo')
      return
    }
    const template = getCategoryTemplate(direction.templateId || opportunity.templateId)
    setState((current) => {
      const workspace = current.opportunityWorkspace || createOpportunityWorkspace()
      const nextWorkspace = {
        ...workspace,
        selectedOpportunityId: opportunity.id,
        selectedDirectionByOpportunity: { ...(workspace.selectedDirectionByOpportunity || {}), [opportunity.id]: direction.id },
        decisionLog: [{
          id: `project-${Date.now()}`,
          type: '确认产品 Demo',
          title: `以「${direction.name}」建立产品项目`,
          detail: `来源机会：${opportunity.title || '未命名机会'}；进入产品设计仓。`,
          createdAt: '当前会话',
        }, ...(workspace.decisionLog || [])],
      }
      const nextState = createProjectState(template.id, opportunity.id, direction.id, workspace.customOpportunities || [])
      return syncProjectRecords({ ...nextState, workflowStep: 'design', lastWorkspaceView: 'design', opportunityWorkspace: nextWorkspace, projectRecords: [...(current.projectRecords || [])] })
    })
    navigate('design')
    notify(`已确认「${direction.name}」，现在进入产品设计仓`)
  }

  const confirmDesign = () => {
    setState((current) => {
      const completed = current.completed.includes(5) ? current.completed : [...current.completed, 5]
      return syncProjectRecords({ ...current, completed, workflowStep: 'delivery', lastWorkspaceView: 'delivery' })
    })
    navigate('delivery')
    notify('2D包装方案已确认，产品交付页已更新')
  }

  const openProjectRecord = (projectId) => {
    const record = (state.projectRecords || []).find((item) => item.id === projectId)
    if (!record?.snapshot) {
      notify('这个项目只有历史摘要，暂时没有完整快照')
      return
    }
    setState(syncProjectRecords({ ...record.snapshot, workflowStep: record.snapshot.workflowStep || 'delivery', projectRecords: state.projectRecords }))
    setProjectMenuOpen(false)
    navigate('delivery')
  }

  const renderView = () => {
    if (appView === 'observation') return <SolutionObservation state={state} updateWorkspace={updateOpportunityWorkspace} onOpenDemo={openDemo} />
    if (appView === 'demo') return <ProductDemo state={state} updateWorkspace={updateOpportunityWorkspace} onConfirm={startFromOpportunity} />
    if (appView === 'design') return <div className="design-warehouse-page"><PackagingStage state={state} updateState={updateState} confirmStage={confirmDesign} notify={notify} openAiSettings={() => setAiOpen(true)} /></div>
    if (appView === 'delivery') return <ProductDelivery state={state} project={project} onOpenDesign={() => navigate('design')} onOpenRecords={() => navigate('records')} onGenerateReport={generateDeliveryReport} generatingReport={generatingDeliveryReport} notify={notify} />
    return <ProjectRecords state={state} onOpenProject={openProjectRecord} onReturnWorkspace={() => navigate(lastWorkflowView)} onOpenOpportunity={() => navigate('observation')} />
  }

  return <div className="app-shell five-module-shell">
    <header className="app-header">
      <button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="打开导航">{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button>
      <div className="brand-mark"><FlaskConical size={19} /><span>AI 产品研发台</span></div>
      <div className="project-menu-shell" ref={projectMenuRef}>
        <button className="project-switcher" onClick={() => setProjectMenuOpen((value) => !value)} aria-expanded={projectMenuOpen}>
          <span className="project-switcher-copy"><small>当前产品项目</small><strong>{project.name}</strong></span><ChevronDown size={15} />
        </button>
        {projectMenuOpen && <div className="project-switcher-menu">
          <div className="project-menu-heading"><span>产品项目</span><small>{state.projectRecords?.length || 1} 个项目</small></div>
          <div className="project-menu-list">
            {(state.projectRecords || []).slice(0, 5).map((record) => {
              const current = record.id === state.projectId
              return <button className={current ? 'current' : ''} key={record.id} onClick={() => { if (!current) openProjectRecord(record.id) }}><span className="project-menu-record"><strong>{record.name}</strong><small>{record.directionName || record.opportunityTitle || '产品开发项目'}</small></span>{current && <Check size={15} />}</button>
            })}
          </div>
          <div className="project-menu-scope">每个产品独立保存方案、设计和交付版本</div>
          <div className="project-menu-actions"><button onClick={() => { setProjectMenuOpen(false); navigate('records') }}><FileClock size={15} />全部项目</button><button className="project-menu-create" onClick={() => { setProjectMenuOpen(false); navigate('observation') }}><Plus size={15} />接收新机会</button></div>
        </div>}
      </div>
      <div className="save-state"><Check size={14} />已自动保存</div>
      <div className="header-spacer" />
      <button className="ai-trigger" aria-label="产品开发智能体" onClick={() => setAiOpen(true)}><Sparkles size={16} /><span>开发智能体</span></button>
      <button className={`icon-button header-history-button ${appView === 'records' ? 'active' : ''}`} aria-label="项目记录" title="项目记录" onClick={() => navigate('records')}><FileClock size={18} /></button>
      <button className="icon-button notification-button" aria-label="通知"><Bell size={18} /></button>
      <div className="avatar">张</div><span className="user-name">产品经理</span>
    </header>

    <aside className={`side-nav ${mobileMenu ? 'side-nav-open' : ''}`}>
      <nav><button className={appView !== 'records' ? 'active' : ''} onClick={() => navigate(lastWorkflowView)}><Boxes size={18} /><span>产品开发工作台</span></button></nav>
      <div className="side-progress-summary"><span>当前流程</span><strong>{workflowSteps.find((step) => step.id === lastWorkflowView)?.label}</strong><small>四段流程持续保存</small></div>
      <div className="side-foot"><ClipboardList size={17} /><div><strong>{activeTemplate.name}</strong><span>{project.sourceCount || 0}份{project.sourceLabel || '项目资料'}</span></div></div>
    </aside>

    <main className="main-shell">
      {appView !== 'records' && <WorkflowRail active={appView} state={state} onSelect={navigate} />}
      <div className={`screen ${appView === 'observation' || appView === 'demo' || appView === 'delivery' || appView === 'records' ? 'project-settings-screen' : ''}`}>{renderView()}</div>
    </main>
    {toast && <div className="toast"><Check size={16} />{toast}</div>}
    <AiAdvisor open={aiOpen} onClose={() => setAiOpen(false)} state={state} currentView={appView} onNavigate={navigate} onExecute={executeAgentTool} />
  </div>
}

function StatusPill() {
  return <div className="warehouse-flow-state"><span className="active">2D效果</span><i /><span>局部修改</span><i /><span>按需3D</span></div>
}

function WorkflowRail({ active, state, onSelect }) {
  const completed = new Set()
  if (state.selectedOpportunityId) completed.add('observation')
  if (state.selectedDirectionId) completed.add('demo')
  if (state.packagingDesign?.confirmed2D || state.completed?.includes(5)) completed.add('design')
  if (state.workflowStep === 'complete') completed.add('delivery')

  return <div className="workflow-rail" aria-label="产品开发流程">
    <div className="workflow-rail-title"><span>产品开发流程</span><strong>4个阶段</strong></div>
    <div className="workflow-steps">
      {workflowSteps.map((step, index) => {
        const Icon = step.icon
        const done = completed.has(step.id)
        const current = active === step.id
        return <button key={step.id} className={`${current ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => onSelect(step.id)} aria-current={current ? 'step' : undefined}>
          <span className="workflow-step-marker">{done && !current ? <Check size={14} /> : <Icon size={15} />}</span>
          <span className="workflow-step-copy"><small>步骤 {String(index + 1).padStart(2, '0')}</small><strong>{step.label}</strong><em>{step.description}</em></span>
        </button>
      })}
    </div>
  </div>
}

export default App

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  Factory,
  FlaskConical,
  FolderKanban,
  Image,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import {
  createOpportunityWorkspace,
  createProjectState,
  getCategoryTemplate,
  getMarketOpportunity,
  getProductDirection,
  stages,
} from './data'
import { AiAdvisor } from './ai'
import {
  AudienceStage,
  CompetitorStage,
  ConceptStage,
  FactoryStage,
  OutcomeStage,
  PackagingStage,
  PositioningStage,
  ResearchStage,
  TemplateDrivenStage,
} from './stages'
import { OpportunityWorkbench } from './opportunity-workbench'
import { ProjectControlTower } from './project-control-tower'
import { ProjectRecords } from './project-records'
import { SourceDrawer } from './ui'

const STORAGE_KEY = 'eye-oil-experiment-lab-v2'

function dateLabel() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function createProjectCode() {
  return `EO-${dateLabel().replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function withoutProjectRecords(state) {
  const { projectRecords, ...snapshot } = state
  return snapshot
}

function buildProjectRecord(state, previous = {}) {
  const opportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
  const direction = getProductDirection(opportunity, state.selectedDirectionId)
  const progress = state.completed?.length || 0
  const totalStages = stages.length
  const stage = stages[state.activeStage] || stages[0]
  const projectId = state.projectId || previous.id || `project-${Date.now()}`
  return {
    id: projectId,
    code: previous.code || createProjectCode(),
    name: state.project?.name || '未命名项目',
    status: progress >= totalStages ? '已完成' : '开发中',
    progress,
    totalStages,
    progressPercent: Math.round((progress / totalStages) * 100),
    stageLabel: stage.label,
    opportunityTitle: opportunity?.title || '未关联机会',
    directionName: direction?.name || '待选产品路径',
    decisionCount: state.opportunityWorkspace?.decisionLog?.length || 0,
    supplierCount: Object.values(state.supplierSelections || {}).filter(Boolean).length,
    supplierTotal: Object.keys(state.supplierSelections || {}).length,
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
    if (!stored) return syncProjectRecords(createProjectState())
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
    return syncProjectRecords(createProjectState())
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const [drawerItem, setDrawerItem] = useState(null)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [appView, setAppView] = useState('development')
  const [projectView, setProjectView] = useState('overview')
  const toastTimer = useRef(null)
  const activeTemplate = getCategoryTemplate(state.templateId)
  const project = { ...activeTemplate.project, ...(state.project || {}) }

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.title = `实验工厂 - ${project.name || '产品开发'}`
  }, [project.name])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const notify = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const updateState = (patch) => setState((current) => syncProjectRecords({ ...current, ...patch }))

  const updateOpportunityWorkspace = (change) => setState((current) => {
    const workspace = current.opportunityWorkspace || createOpportunityWorkspace()
    const nextWorkspace = typeof change === 'function' ? change(workspace) : { ...workspace, ...change }
    return syncProjectRecords({ ...current, opportunityWorkspace: nextWorkspace })
  })

  const confirmStage = () => {
    setState((current) => {
      const completed = current.completed.includes(current.activeStage)
        ? current.completed
        : [...current.completed, current.activeStage]
      return syncProjectRecords({
        ...current,
        completed,
        activeStage: Math.min(current.activeStage + 1, stages.length - 1),
      })
    })
    notify(state.activeStage === 7 ? '产品方案已更新' : '阶段已确认，已进入下一步')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setActiveStage = (index) => {
    setAppView('development')
    setProjectView('workstream')
    updateState({ activeStage: index })
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEvidence = (item) => {
    setAiOpen(false)
    setDrawerItem(item)
  }

  const exportProject = () => {
    const marketOpportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
    const productDirection = getProductDirection(marketOpportunity, state.selectedDirectionId)
    const blob = new Blob([JSON.stringify({
      project,
      marketOpportunity,
      productDirection,
      opportunityDecisions: state.opportunityWorkspace?.decisionLog || [],
      categoryTemplate: activeTemplate.name,
      exportedAt: new Date().toISOString(),
      ...state,
    }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${project.name || '产品开发方案'}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    notify('产品方案已导出')
  }

  const startFromOpportunity = (opportunityId, directionId) => {
    const opportunity = getMarketOpportunity(opportunityId, state.opportunityWorkspace?.customOpportunities || [])
    const direction = getProductDirection(opportunity, directionId)
    if (!direction?.buildable) {
      notify('该产品路径尚未配置可执行的方法论，不能正式立项')
      return
    }
    const template = getCategoryTemplate(direction.templateId)
    setState((current) => {
      const workspace = current.opportunityWorkspace || createOpportunityWorkspace()
      const nextWorkspace = {
        ...workspace,
        selectedOpportunityId: opportunity.id,
        selectedDirectionByOpportunity: { ...(workspace.selectedDirectionByOpportunity || {}), [opportunity.id]: direction.id },
        decisionLog: [{
          id: `project-${Date.now()}`,
          type: '正式立项',
          title: `以「${direction.name}」建立开发项目`,
          detail: `来源机会：${opportunity.title}；匹配方法论：${template.name}。`,
          createdAt: '当前会话',
        }, ...(workspace.decisionLog || [])],
      }
      const nextState = createProjectState(template.id, opportunity.id, direction.id, workspace.customOpportunities || [])
      return syncProjectRecords({ ...nextState, opportunityWorkspace: nextWorkspace, projectRecords: [ ...(current.projectRecords || []) ] })
    })
    setAppView('development')
    setProjectView('overview')
    notify(`已根据「${opportunity.title}」建立「${direction.name}」开发项目`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProjectRecord = (projectId) => {
    const record = (state.projectRecords || []).find((item) => item.id === projectId)
    if (!record?.snapshot) {
      notify('这个项目只有历史摘要，暂时没有可切换的完整快照')
      return
    }
    setState(syncProjectRecords({ ...record.snapshot, projectRecords: state.projectRecords }))
    setAppView('development')
    setProjectView('overview')
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stageProps = useMemo(() => ({
    state,
    updateState,
    confirmStage,
    notify,
    openEvidence,
    exportProject,
    setActiveStage,
    openAiSettings: () => setAiOpen(true),
  }), [state])

  const eyeOilScreens = [
    <ResearchStage {...stageProps} />,
    <AudienceStage {...stageProps} />,
    <CompetitorStage {...stageProps} />,
    <ConceptStage {...stageProps} />,
    <PositioningStage {...stageProps} />,
    <PackagingStage {...stageProps} />,
    <FactoryStage {...stageProps} />,
    <OutcomeStage {...stageProps} />,
  ]
  const usesEyeOilDemo = state.templateId === 'eye-oil'
    && state.selectedOpportunityId === 'screen-eye-care'
    && state.selectedDirectionId === 'roll-on-eye-oil'
  const screens = usesEyeOilDemo
    ? eyeOilScreens
    : stages.map((stage, index) => <TemplateDrivenStage key={stage.id} {...stageProps} stageIndex={index} />)

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="打开导航">
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="brand-mark"><FlaskConical size={19} /><span>实验工厂</span></div>
        <button className="project-switcher" onClick={() => { setAppView('projects'); setProjectView('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span>{project.name}</span><ChevronDown size={15} />
        </button>
        <div className="save-state"><Check size={14} />已自动保存</div>
        <div className="header-spacer" />
        <button className="ai-trigger" aria-label="AI 产品顾问" onClick={() => { setDrawerItem(null); setAiOpen(true) }}>
          <Sparkles size={16} /><span>AI 产品顾问</span>
        </button>
        <button className="icon-button" aria-label="通知"><Bell size={18} /></button>
        <div className="avatar">张</div>
        <span className="user-name">产品经理</span>
      </header>

      <aside className={`side-nav ${mobileMenu ? 'side-nav-open' : ''}`}>
        <nav>
          <button className={appView === 'projects' ? 'active' : ''} onClick={() => { setAppView('projects'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><FolderKanban size={18} /><span>项目记录</span></button>
          <button className={appView === 'development' ? 'active' : ''} onClick={() => { setAppView('development'); setProjectView('overview'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><FlaskConical size={18} /><span>项目执行</span></button>
          <button><BookOpen size={18} /><span>知识库</span></button>
          <button><Image size={18} /><span>素材库</span></button>
          <button><Archive size={18} /><span>数据工具</span></button>
          <button className={appView === 'opportunity' ? 'active' : ''} onClick={() => { setAppView('opportunity'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Settings size={18} /><span>机会快跑</span></button>
        </nav>
        <div className="side-foot">
          <ClipboardList size={17} />
          <div><strong>样本数据已载入</strong><span>{project.sourceCount}份{project.sourceLabel}</span></div>
        </div>
      </aside>

      <main className="main-shell">
        {appView === 'projects' ? <div className="screen project-settings-screen"><ProjectRecords state={state} onOpenProject={openProjectRecord} onOpenOpportunity={() => { setAppView('opportunity'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /></div> : appView === 'development' ? <>
          {projectView === 'overview' ? <div className="screen"><ProjectControlTower state={state} project={project} onOpenStage={setActiveStage} onOpenOpportunity={() => { setAppView('opportunity'); setProjectView('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onExportProject={exportProject} /></div> : <><StageRail active={state.activeStage} completed={state.completed} onSelect={setActiveStage} onOverview={() => { setProjectView('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /><div className="screen">{screens[state.activeStage]}</div></>}
        </> : <div className="screen project-settings-screen"><OpportunityWorkbench state={state} updateWorkspace={updateOpportunityWorkspace} startFromOpportunity={startFromOpportunity} enterDevelopment={() => { setAppView('development'); setProjectView('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} openEvidence={openEvidence} /></div>}
      </main>

      {toast && <div className="toast"><Check size={16} />{toast}</div>}
      <SourceDrawer item={drawerItem} onClose={() => setDrawerItem(null)} />
      <AiAdvisor open={aiOpen} onClose={() => setAiOpen(false)} state={state} />
    </div>
  )
}

function StageRail({ active, completed, onSelect, onOverview }) {
  return (
    <div className="stage-rail" aria-label="产品开发阶段">
      <button className="stage-rail-overview" onClick={onOverview}><span className="stage-overview-icon"><FolderKanban size={15} /></span><span className="stage-label">项目总览</span></button>
      {stages.map((stage, index) => {
        const isDone = completed.includes(index)
        return (
          <button
            key={stage.id}
            className={`${index === active ? 'active' : ''} ${isDone ? 'done' : ''}`}
            onClick={() => onSelect(index)}
          >
            <span className="stage-number">{isDone ? <Check size={14} /> : index + 1}</span>
            <span className="stage-label">{stage.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default App

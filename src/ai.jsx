import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  CircleCheck,
  Eye,
  EyeOff,
  Images,
  ListFilter,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import {
  audiences,
  competitors,
  concepts,
  evidence,
  developmentBlueprint,
  getCategoryTemplate,
  getMarketOpportunity,
  getProductDirection,
  packagingOptions,
  positioningOptions,
  readinessItems,
  stages,
  suppliers,
} from './data'
import { Button } from './ui'

const quickActions = {
  research: ['验证市场机会', '寻找反向证据', '列出数据缺口'],
  audience: ['提炼核心人群', '识别购买阻力', '设计用户访谈'],
  competitors: ['寻找竞争空档', '检查同质化风险', '重排竞品优先级'],
  concepts: ['优化当前概念', '检查成分逻辑', '生成打样验证项'],
  positioning: ['复核价格定位', '压缩一句话卖点', '检查渠道匹配度'],
  packaging: ['评估包材方案', '识别结构风险', '补齐验收标准'],
  factory: ['复核成本与MOQ', '梳理供应链风险', '生成询价问题'],
  outcome: ['做上市前复核', '指出最大决策风险', '生成下一步清单'],
}

const confidenceLabels = {
  low: '低，需要更多数据',
  medium: '中，建议验证',
  high: '高，资料较充分',
}

const agentWorkspaceStates = {
  observation: { label: '机会确认', task: '把上游市场机会整理成一个可继续推进的产品任务。', next: '生成并调校产品方案', nextView: 'demo', tool: 'generate-directions', toolLabel: '直接生成 3 个方案', planPrompt: '根据当前市场机会，先判断最值得推进的产品任务，列出缺口、风险和下一步要生成的产品方案。' },
  demo: { label: '产品方案', task: '把市场机会转成可选择、可继续修改的产品方向。', next: '检查方案并进入设计', nextView: 'design', tool: 'generate-directions', toolLabel: '重新生成 3 个方案', planPrompt: '基于当前市场机会和已选产品方向，判断方案是否足够清晰，指出必须调整的内容，并给出进入包装设计前的行动顺序。' },
  design: { label: '产品设计', task: '生成写实包装效果图，并在确认前细修局部内容。', next: '生成 2D 包装效果图', nextView: 'design', tool: 'generate-packaging', toolLabel: '生成 3 张 2D 效果图', runningLabel: '正在生成效果图…', planPrompt: '检查当前产品方案和包装设计状态，列出下一步最有价值的设计动作、需要确认的包装信息与不应擅自假定的部分。' },
  delivery: { label: '产品交付', task: '把市场机会、产品方案和效果图整合成可下发的开发交付物。', next: '检查交付版本', nextView: 'delivery', planPrompt: '检查当前产品交付物是否足够让开发人员或供应商理解，指出缺失信息、最大风险和最优先补齐项。' },
  records: { label: '项目记录', task: '回看已有项目，确定当前要继续推进的产品任务。', next: '返回当前工作台', nextView: 'observation', planPrompt: '根据当前项目记录，梳理哪些项目正在开发、哪些需要补资料，并建议最值得优先继续的一个任务。' },
}

const agentRoles = {
  orchestrator: { label: '产品总控', responsibility: '串联机会、方案、设计与交付，确保每一步有明确的输入、决策和交接。', output: '下一步优先级与跨阶段风险' },
  market: { label: '市场机会', responsibility: '判断上游信号是否构成可推进机会，明确证据、缺口与不成立的条件。', output: '机会判断与待验证问题' },
  strategy: { label: '方案与定价', responsibility: '把机会转成可选择的产品方向，并区分产品假设、价格带与真实成本。', output: '产品方向与选择依据' },
  packaging: { label: '包装创意', responsibility: '把已选方向转成可确认的包装视觉与结构要求，避免把效果图当作生产事实。', output: '2D 设计动作与确认项' },
  sampling: { label: '打样验证', responsibility: '把待确认的规格、工艺和样品问题整理成开发验证项，不虚构供应商或报价。', output: '打样验证清单' },
  review: { label: '交付审查', responsibility: '检查交付物能否被开发人员理解，明确缺失信息与不能下发的风险。', output: '交付完整度与补齐项' },
}

const stageAgentTeams = {
  observation: { lead: 'market', support: ['orchestrator'] },
  demo: { lead: 'strategy', support: ['orchestrator'] },
  design: { lead: 'packaging', support: ['orchestrator'] },
  delivery: { lead: 'review', support: ['sampling', 'orchestrator'] },
  records: { lead: 'orchestrator', support: [] },
}

const advisorProviders = [
  { id: 'openai', label: 'OpenAI', keyLabel: 'OpenAI 分析 API Key', description: '适合结构化产品判断、策略复核和长链路分析。' },
  { id: 'tikbit', label: 'TikBit', keyLabel: 'TikBit API Key', description: '通过 TikBit 的 OpenAI 兼容接口调用 GPT 等模型，接口地址已预设。' },
  { id: 'kimi', label: 'Kimi', keyLabel: 'Kimi API Key', description: 'Moonshot/Kimi OpenAI 兼容接口，适合中文长上下文分析。' },
  { id: 'custom', label: '自定义网关', keyLabel: '网关 API Key', description: '适合 OpenRouter、硅基流动、302、OneAPI 或自建 OpenAI 兼容代理。' },
]

const imageProviders = [
  { id: 'openai', label: 'OpenAI', keyLabel: 'OpenAI 生图 API Key', description: '直接调用 OpenAI 生图接口。' },
  { id: 'tikbit', label: 'TikBit', keyLabel: 'TikBit 生图 API Key', description: '通过 TikBit 调用 GPT Image，接口地址已预设。' },
  { id: 'custom', label: '自定义网关', keyLabel: '生图网关 API Key', description: '用于兼容 OpenAI Images API 的其他网关。' },
]

const recommendedModels = [
  { id: 'gpt-6-sol', label: 'GPT-6 Sol', description: '智能、速度与成本的平衡，适合日常产品决策。' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna', description: '快速低成本，适合批量提取、分类和初步复核。' },
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', description: '最高能力，适合复杂策略、反证与关键决策。' },
]

const additionalModels = [
  { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol', description: '上一代旗舰能力，适合复杂专业分析。' },
  { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra', description: '较强能力与成本平衡。' },
  { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna', description: '适合低成本、高频分析。' },
  { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', description: '适合清晰、结构化、高频任务。' },
  { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano', description: '适合简单提取、分类与批处理。' },
]

const recommendedKimiModels = [
  { id: 'kimi-k3', label: 'Kimi K3', description: 'Kimi 旗舰模型，适合长上下文资料复核和复杂产品分析。' },
  { id: 'kimi-k2.6', label: 'Kimi K2.6', description: '适合中文对话、代码与多模态理解相关分析。' },
]

const additionalKimiModels = [
  { id: 'kimi-k2.7-code', label: 'Kimi K2.7 Code', description: '偏代码与工具任务，也可用于流程设计和结构化推理。' },
  { id: 'kimi-k2.5', label: 'Kimi K2.5', description: '兼容旧项目的 Kimi 模型选项。' },
]

const modelModes = [
  { id: 'recommended', label: '推荐' },
  { id: 'more', label: '更多' },
  { id: 'account', label: '账号可用' },
  { id: 'custom', label: '自定义' },
]

const recommendedImageModels = [
  { id: 'gpt-image-2.5-flare', label: 'GPT Image 2.5 Flare', description: '速度优先，适合日常包装概念图和批量方案。' },
  { id: 'gpt-image-2.5-sunburst', label: 'GPT Image 2.5 Sunburst', description: '质量与精细编辑优先，适合产品定稿和高保真修改。' },
]

const compatibleImageModels = [
  { id: 'gpt-image-2', label: 'GPT Image 2', description: '上一代高质量生图与编辑模型。' },
  { id: 'gpt-image-1.5', label: 'GPT Image 1.5', description: '旧版 GPT Image 兼容选项。' },
  { id: 'gpt-image-1', label: 'GPT Image 1', description: '旧版 GPT Image 兼容选项。' },
  { id: 'gpt-image-1-mini', label: 'GPT Image 1 Mini', description: '较低成本的旧版生图模型。' },
  { id: 'dall-e-3', label: 'DALL-E 3', description: 'DALL-E 兼容选项。' },
  { id: 'dall-e-2', label: 'DALL-E 2', description: '旧项目兼容选项。' },
]

const imageModelModes = [
  { id: 'recommended', label: '推荐' },
  { id: 'compatible', label: '兼容' },
  { id: 'account', label: '账号可用' },
  { id: 'custom', label: '自定义' },
]

function modeForModel(modelId) {
  if ([...recommendedModels, ...recommendedKimiModels].some((item) => item.id === modelId)) return 'recommended'
  if ([...additionalModels, ...additionalKimiModels].some((item) => item.id === modelId)) return 'more'
  return 'custom'
}

function modelsForProvider(provider, mode) {
  if (provider === 'kimi') return mode === 'more' ? additionalKimiModels : recommendedKimiModels
  if (provider === 'custom') return []
  return mode === 'more' ? additionalModels : recommendedModels
}

function defaultModelForProvider(provider) {
  if (provider === 'custom') return ''
  return provider === 'kimi' ? 'kimi-k3' : 'gpt-6-sol'
}

function modeForImageModel(modelId) {
  if (recommendedImageModels.some((item) => item.id === modelId)) return 'recommended'
  if (compatibleImageModels.some((item) => item.id === modelId)) return 'compatible'
  return 'custom'
}

function selectedById(items, id) {
  return items.find((item) => item.id === id) || null
}

function buildProjectContext(state) {
  const template = getCategoryTemplate(state.templateId)
  const marketOpportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
  const selectedProductDirection = getProductDirection(marketOpportunity, state.selectedDirectionId)
  const projectInstance = { ...template.project, ...(state.project || {}) }
  const usesEyeOilDemo = template.id === 'eye-oil'
    && state.selectedOpportunityId === 'screen-eye-care'
    && state.selectedDirectionId === 'roll-on-eye-oil'
  const stageNotes = developmentBlueprint.map((stage) => ({
    stage: stage.label,
    focus: template.stageProfiles[stage.id].focus,
    decision: template.stageProfiles[stage.id].decision,
    note: state.stageNotes?.[stage.id] || '',
  }))
  return {
    product: {
      name: projectInstance.name,
      category: template.category,
      form: projectInstance.form,
      structure: projectInstance.structure,
      targetChannel: projectInstance.channel,
      priceBand: projectInstance.priceBand,
    },
    categoryPlaybook: { name: template.name, summary: template.summary, stageNotes },
    marketOpportunity: {
      title: marketOpportunity.title,
      summary: marketOpportunity.summary,
      signal: marketOpportunity.signal,
      evidence: marketOpportunity.evidence,
      decision: marketOpportunity.decision,
    },
    selectedProductDirection: selectedProductDirection ? {
      name: selectedProductDirection.name,
      premise: selectedProductDirection.premise,
      scores: selectedProductDirection.scores,
      risk: selectedProductDirection.risk,
    } : null,
    opportunityDecisions: (state.opportunityWorkspace?.decisionLog || []).slice(0, 8),
    assumptions: state.assumptions,
    completedStages: state.completed.map((index) => stages[index]?.label).filter(Boolean),
    selectedAudience: usesEyeOilDemo ? selectedById(audiences, state.selectedAudience) : null,
    selectedConcept: usesEyeOilDemo ? selectedById(concepts, state.selectedConcept) : null,
    selectedPositioning: usesEyeOilDemo ? selectedById(positioningOptions, state.selectedPositioning) : null,
    selectedPackaging: usesEyeOilDemo ? selectedById(packagingOptions, state.selectedPackaging) : { structure: projectInstance.structure },
    evidence: usesEyeOilDemo
      ? evidence.map(({ id, finding, source, confidence, note }) => ({ id, finding, source, confidence, note }))
      : template.stageProfiles.research.dimensions,
    competitors: usesEyeOilDemo
      ? competitors.map(({ name, price, volume, structure, strength, risk }) => ({ name, price, volume, structure, strength, risk }))
      : template.stageProfiles.competitors.dimensions,
    suppliers: usesEyeOilDemo
      ? suppliers.map(({ item, supplier, quote, moq, sample, status, source }) => ({ item, supplier, quote, moq, sample, status, source }))
      : template.stageProfiles.factory.dimensions,
    readiness: readinessItems.map((item, index) => ({ item, ready: state.readiness.includes(index) })),
  }
}

function AdviceList({ title, icon: Icon, items, tone = '' }) {
  if (!items?.length) return null
  return (
    <section className={`ai-result-section ${tone}`}>
      <h3><Icon size={15} />{title}</h3>
      <ol>
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ol>
    </section>
  )
}

function AgentMission({ currentView, onNavigate, onPlan, onExecute, loading, instruction }) {
  const mission = agentWorkspaceStates[currentView] || agentWorkspaceStates.observation
  const team = stageAgentTeams[currentView] || stageAgentTeams.observation
  const lead = agentRoles[team.lead]
  const support = team.support.map((roleId) => agentRoles[roleId]).filter(Boolean)
  const [executing, setExecuting] = useState(false)
  const [executionError, setExecutionError] = useState('')

  const executeMission = async () => {
    if (!mission.tool || executing) return
    setExecuting(true)
    setExecutionError('')
    try {
      const outcome = await onExecute({ tool: mission.tool, instruction })
      if (outcome?.nextView) onNavigate(outcome.nextView)
    } catch (error) {
      setExecutionError(error.message || '智能体执行失败，请稍后重试。')
    } finally {
      setExecuting(false)
    }
  }

  return <section className="agent-mission">
    <div className="agent-mission-heading"><Bot size={18} /><div><span>当前任务</span><strong>{mission.label}</strong></div><em>执行中</em></div>
    <p>{mission.task}</p>
    <div className="agent-team" aria-label="当前智能体协作分工">
      <div><span>本轮主责</span><strong>{lead.label}</strong></div>
      <p>{lead.responsibility}</p>
      {support.length > 0 && <small>协作：{support.map((role) => role.label).join('、')}。</small>}
    </div>
    <div className="agent-mission-next"><span>建议下一步</span><strong>{mission.next}</strong></div>
    <div className="agent-mission-actions">
      <Button variant="secondary" icon={Sparkles} onClick={() => onPlan(mission.planPrompt)} disabled={loading}>{loading ? '正在制定计划…' : '让智能体先规划'}</Button>
      {mission.tool ? <Button icon={ArrowRight} onClick={executeMission} disabled={executing || loading}>{executing ? mission.runningLabel || '正在执行…' : mission.toolLabel}</Button> : <Button icon={ArrowRight} onClick={() => onNavigate(mission.nextView)}>打开执行界面</Button>}
    </div>
    {executionError && <p className="agent-mission-error">{executionError}</p>}
    <small>{mission.tool ? `${mission.tool === 'generate-packaging' ? '点击生成会调用生图模型；' : '点击生成会调用文本模型；'}下方填写的任务要求会一并带入。` : '分析、生成方案和生图会先说明将要执行的内容；需要消耗模型或确认版本时，由你决定是否继续。'}</small>
  </section>
}

export function AiAdvisor({ open, onClose, state, currentView = 'observation', onNavigate = () => {}, onExecute = async () => ({}) }) {
  const [health, setHealth] = useState({ status: 'loading', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, imageProvider: 'openai', imageLabel: 'OpenAI', imageBaseUrl: '', model: '', imageModel: '' })
  const [showSettings, setShowSettings] = useState(false)
  const [advisorProvider, setAdvisorProvider] = useState('openai')
  const [analysisApiKey, setAnalysisApiKey] = useState('')
  const [kimiBaseUrl, setKimiBaseUrl] = useState('https://api.moonshot.ai/v1')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customProviderName, setCustomProviderName] = useState('自定义网关')
  const [imageProvider, setImageProvider] = useState('openai')
  const [imageBaseUrl, setImageBaseUrl] = useState('')
  const [imageApiKey, setImageApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-6-sol')
  const [modelMode, setModelMode] = useState('recommended')
  const [customModel, setCustomModel] = useState('')
  const [accountModels, setAccountModels] = useState([])
  const [selectedImageModel, setSelectedImageModel] = useState('gpt-image-2.5-flare')
  const [imageModelMode, setImageModelMode] = useState('recommended')
  const [customImageModel, setCustomImageModel] = useState('')
  const [accountImageModels, setAccountImageModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [showAnalysisKey, setShowAnalysisKey] = useState(false)
  const [showImageKey, setShowImageKey] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configError, setConfigError] = useState('')
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const agentStageId = currentView === 'observation' ? 'research' : currentView === 'demo' ? 'concepts' : currentView === 'design' ? 'packaging' : currentView === 'delivery' ? 'outcome' : 'research'
  const stage = stages.find((item) => item.id === agentStageId) || stages[0]
  const agentTeam = stageAgentTeams[currentView] || stageAgentTeams.observation
  const leadAgent = agentRoles[agentTeam.lead]
  const project = useMemo(() => buildProjectContext(state), [state])

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setHealth({ status: 'loading', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, imageProvider: 'openai', imageLabel: 'OpenAI', imageBaseUrl: '', model: '', imageModel: '' })
    fetch('/api/ai/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('服务状态不可用')
        return response.json()
      })
      .then((data) => {
        const nextProvider = data.configured ? data.advisorProvider || 'tikbit' : 'tikbit'
        const nextImageProvider = data.imageConfigured ? data.imageProvider || 'openai' : 'tikbit'
        const nextModel = data.configured ? data.model || defaultModelForProvider(nextProvider) : defaultModelForProvider(nextProvider)
        setHealth({ status: 'ready', configured: data.configured, advisorProvider: nextProvider, advisorLabel: data.configured ? data.advisorLabel || (nextProvider === 'tikbit' ? 'TikBit' : nextProvider === 'kimi' ? 'Kimi' : 'OpenAI') : 'TikBit', providerConfigured: data.providerConfigured || {}, imageConfigured: data.imageConfigured, imageProvider: nextImageProvider, imageLabel: data.imageConfigured ? data.imageLabel || 'OpenAI' : 'TikBit', imageBaseUrl: data.imageConfigured ? data.imageBaseUrl || '' : 'https://tikbit.ai/v1', model: nextModel, imageModel: data.imageModel })
        setAdvisorProvider(nextProvider)
        setCustomBaseUrl(data.customAdvisorBaseUrl || '')
        setCustomProviderName(data.customAdvisorName || '自定义网关')
        setImageProvider(nextImageProvider)
        setImageBaseUrl(data.imageConfigured ? data.imageBaseUrl || '' : 'https://tikbit.ai/v1')
        setSelectedModel(nextModel)
        setModelMode(nextProvider === 'custom' ? 'custom' : modeForModel(nextModel))
        setCustomModel(nextProvider === 'custom' || modeForModel(nextModel) === 'custom' ? nextModel : '')
        setSelectedImageModel(data.imageModel || 'gpt-image-2.5-flare')
        setImageModelMode(modeForImageModel(data.imageModel || 'gpt-image-2.5-flare'))
        setCustomImageModel(modeForImageModel(data.imageModel || 'gpt-image-2.5-flare') === 'custom' ? data.imageModel : '')
        setShowSettings(!data.configured || !data.imageConfigured)
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') {
          setHealth({ status: 'error', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, imageProvider: 'openai', imageLabel: 'OpenAI', imageBaseUrl: '', model: '', imageModel: '' })
        }
      })
    return () => controller.abort()
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  useEffect(() => {
    setQuestion('')
    setResult(null)
    setError('')
  }, [currentView])

  const askAdvisor = async (prompt = question) => {
    const normalizedPrompt = prompt.trim()
    if (!normalizedPrompt || loading || !health.configured) return

    setQuestion(normalizedPrompt)
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: stage.id, agentRoleId: agentTeam.lead, question: normalizedPrompt, project }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'AI 分析失败')
      setResult(data)
    } catch (requestError) {
      setError(requestError.message || 'AI 分析失败')
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async (event) => {
    event.preventDefault()
    const modelToSave = modelMode === 'custom' ? customModel.trim() : selectedModel
    const imageModelToSave = imageModelMode === 'custom' ? customImageModel.trim() : selectedImageModel
    const sharedTikBitKey = advisorProvider === 'tikbit' && imageProvider === 'tikbit' ? analysisApiKey.trim() : ''
    const imageKeyToSave = imageApiKey.trim() || sharedTikBitKey
    const providerAlreadyConfigured = Boolean(health.providerConfigured?.[advisorProvider])
    const needsAnalysisKey = !providerAlreadyConfigured && !analysisApiKey.trim()
    const needsCustomBaseUrl = advisorProvider === 'custom' && !providerAlreadyConfigured && !customBaseUrl.trim()
    const imageProviderConfigured = health.imageConfigured && health.imageProvider === imageProvider
    const needsImageKey = !imageProviderConfigured && !imageKeyToSave
    const needsImageBaseUrl = imageProvider === 'custom' && !imageProviderConfigured && !imageBaseUrl.trim()
    if (savingConfig) return
    if (needsAnalysisKey) {
      setConfigError(`请在上方输入完整的 ${selectedProviderInfo.label} API Key。`)
      return
    }
    if (needsCustomBaseUrl) {
      setConfigError('请输入分析网关的 Base URL。')
      return
    }
    if (needsImageKey) {
      setConfigError(`请为 ${selectedImageProviderInfo.label} 输入完整的生图 API Key。`)
      return
    }
    if (needsImageBaseUrl) {
      setConfigError('请输入生图网关的 Base URL。')
      return
    }
    if (!modelToSave) {
      setConfigError('请选择或填写一个文本分析模型。')
      return
    }
    if (!imageModelToSave) {
      setConfigError('请选择或填写一个生图模型。')
      return
    }

    setSavingConfig(true)
    setConfigError('')
    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: advisorProvider,
          apiKey: analysisApiKey.trim(),
          kimiBaseUrl: kimiBaseUrl.trim(),
          customBaseUrl: customBaseUrl.trim(),
          customName: customProviderName.trim(),
          imageProvider,
          imageBaseUrl: imageBaseUrl.trim(),
          imageApiKey: imageKeyToSave,
          model: modelToSave,
          imageModel: imageModelToSave,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '配置验证失败')
      setHealth({ status: 'ready', configured: true, advisorProvider: data.advisorProvider || advisorProvider, advisorLabel: data.advisorLabel || selectedProviderInfo.label, providerConfigured: data.providerConfigured || { ...health.providerConfigured, [advisorProvider]: true }, imageConfigured: true, imageProvider: data.imageProvider || imageProvider, imageLabel: data.imageLabel || selectedImageProviderInfo.label, imageBaseUrl: data.imageBaseUrl || imageBaseUrl, model: data.model, imageModel: data.imageModel })
      setAnalysisApiKey('')
      setImageApiKey('')
      setShowAnalysisKey(false)
      setShowImageKey(false)
      setShowSettings(false)
    } catch (configurationError) {
      setConfigError(configurationError.message || '配置验证失败')
    } finally {
      setSavingConfig(false)
    }
  }

  const chooseModelMode = (nextMode) => {
    setModelMode(nextMode)
    setConfigError('')
    const recommendedForProvider = modelsForProvider(advisorProvider, 'recommended')
    const additionalForProvider = modelsForProvider(advisorProvider, 'more')
    if (nextMode === 'recommended' && !recommendedForProvider.some((item) => item.id === selectedModel)) {
      setSelectedModel(recommendedForProvider[0].id)
    }
    if (nextMode === 'more' && !additionalForProvider.some((item) => item.id === selectedModel)) {
      setSelectedModel(additionalForProvider[0].id)
    }
    if (nextMode === 'account' && accountModels.length && !accountModels.includes(selectedModel)) {
      setSelectedModel(accountModels[0])
    }
  }

  const chooseAdvisorProvider = (nextProvider) => {
    setAdvisorProvider(nextProvider)
    setConfigError('')
    setAccountModels([])
    const nextDefault = defaultModelForProvider(nextProvider)
    setSelectedModel(nextDefault)
    setModelMode(nextProvider === 'custom' ? 'custom' : 'recommended')
    setCustomModel(nextProvider === 'custom' ? customModel : '')
  }

  const chooseImageModelMode = (nextMode) => {
    setImageModelMode(nextMode)
    setConfigError('')
    if (nextMode === 'recommended' && !recommendedImageModels.some((item) => item.id === selectedImageModel)) {
      setSelectedImageModel(recommendedImageModels[0].id)
    }
    if (nextMode === 'compatible' && !compatibleImageModels.some((item) => item.id === selectedImageModel)) {
      setSelectedImageModel(compatibleImageModels[0].id)
    }
    if (nextMode === 'account' && accountImageModels.length && !accountImageModels.includes(selectedImageModel)) {
      setSelectedImageModel(accountImageModels[0])
    }
  }

  const loadAccountModels = async (scope = 'text') => {
    const keyForScope = scope === 'image' ? (imageApiKey.trim() || (advisorProvider === 'tikbit' && imageProvider === 'tikbit' ? analysisApiKey.trim() : '')) : analysisApiKey.trim()
    const configuredForScope = scope === 'image' ? health.imageConfigured && health.imageProvider === imageProvider : Boolean(health.providerConfigured?.[advisorProvider])
    if (loadingModels || (!configuredForScope && !keyForScope)) return
    setLoadingModels(true)
    setConfigError('')
    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          provider: advisorProvider,
          apiKey: analysisApiKey.trim(),
          kimiBaseUrl: kimiBaseUrl.trim(),
          customBaseUrl: customBaseUrl.trim(),
          customName: customProviderName.trim(),
          imageProvider,
          imageBaseUrl: imageBaseUrl.trim(),
          imageApiKey: keyForScope,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '读取模型失败')
      if (scope === 'text') setAccountModels(data.textModels)
      if (scope === 'image') setAccountImageModels(data.imageModels)
      if (scope === 'text' && data.textModels.length) {
        setSelectedModel(data.textModels.includes(selectedModel) ? selectedModel : data.textModels[0])
      }
      if (scope === 'image' && data.imageModels.length) {
        setSelectedImageModel(data.imageModels.includes(selectedImageModel) ? selectedImageModel : data.imageModels[0])
      } else if (scope === 'text' && !data.textModels.length) {
        setConfigError('当前账号没有返回适合产品顾问的文本模型。')
      } else if (scope === 'image' && !data.imageModels.length) {
        setConfigError('当前账号没有返回可用的生图模型。')
      }
    } catch (modelError) {
      setConfigError(modelError.message || '读取模型失败')
    } finally {
      setLoadingModels(false)
    }
  }

  const visibleModels = modelMode === 'recommended'
    ? modelsForProvider(advisorProvider, 'recommended')
    : modelMode === 'more'
      ? modelsForProvider(advisorProvider, 'more')
      : accountModels.map((id) => ({ id, label: id, description: `该模型由当前 ${advisorProvider === 'kimi' ? 'Kimi' : 'OpenAI'} 账号返回。` }))
  const selectedModelInfo = [...recommendedModels, ...additionalModels, ...recommendedKimiModels, ...additionalKimiModels, ...visibleModels]
    .find((item) => item.id === selectedModel)
  const visibleImageModels = imageModelMode === 'recommended'
    ? recommendedImageModels
    : imageModelMode === 'compatible'
      ? compatibleImageModels
      : accountImageModels.map((id) => ({ id, label: id, description: '该生图模型由当前 OpenAI 账号返回。' }))
  const selectedImageModelInfo = [...recommendedImageModels, ...compatibleImageModels, ...visibleImageModels]
    .find((item) => item.id === selectedImageModel)
  const canSaveModel = modelMode === 'custom'
    ? Boolean(customModel.trim())
    : modelMode === 'account'
      ? Boolean(accountModels.length && selectedModel)
      : Boolean(selectedModel)
  const canSaveImageModel = imageModelMode === 'custom'
    ? Boolean(customImageModel.trim())
    : imageModelMode === 'account'
      ? Boolean(accountImageModels.length && selectedImageModel)
      : Boolean(selectedImageModel)
  const selectedProviderInfo = advisorProviders.find((provider) => provider.id === advisorProvider) || advisorProviders[0]
  const selectedImageProviderInfo = imageProviders.find((provider) => provider.id === imageProvider) || imageProviders[0]
  const advisorProviderConfigured = Boolean(health.providerConfigured?.[advisorProvider])
  const imageProviderConfigured = health.imageConfigured && health.imageProvider === imageProvider
  const advisorModelModes = advisorProvider === 'custom'
    ? modelModes.filter((mode) => mode.id === 'account' || mode.id === 'custom')
    : modelModes
  const missingCustomBaseUrl = advisorProvider === 'custom' && !advisorProviderConfigured && !customBaseUrl.trim()
  const sharedTikBitKeyAvailable = advisorProvider === 'tikbit' && imageProvider === 'tikbit' && Boolean(analysisApiKey.trim())
  const missingImageBaseUrl = imageProvider === 'custom' && !imageProviderConfigured && !imageBaseUrl.trim()
  const missingImageKey = !imageProviderConfigured && !imageApiKey.trim() && !sharedTikBitKeyAvailable

  if (!open) return null

  return (
    <div className="drawer-backdrop" onMouseDown={onClose} role="presentation">
      <aside className="ai-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label="产品开发智能体">
        <div className="ai-drawer-head">
          <div>
            <span className="eyebrow"><Bot size={13} />产品开发智能体</span>
            <h2>我来协调整个产品任务</h2>
          </div>
          <div className="ai-head-actions">
            <button
              className={`icon-button ${showSettings ? 'active' : ''}`}
              onClick={() => { setShowSettings((value) => !value); setConfigError('') }}
              aria-label="配置AI模型"
              title="配置AI模型"
            >
              <Settings2 size={18} />
            </button>
            <button className="icon-button" onClick={onClose} aria-label="关闭产品开发智能体"><X size={19} /></button>
          </div>
        </div>

        <div className={`ai-service-state ${health.configured ? 'ready' : ''}`}>
          <span className="ai-status-dot" />
          <div>
            <strong>{health.status === 'loading' ? '正在检查智能体服务' : health.configured ? `${health.advisorLabel || 'AI'} 智能体已连接` : '智能体模型尚未配置'}</strong>
            <span>{health.configured || health.imageConfigured ? `${health.configured ? `${health.advisorLabel || 'AI'} · ${health.model}` : '分析未配置'} · ${health.imageConfigured ? `${health.imageLabel || '生图'} · ${health.imageModel}` : '生图未配置'} · 会读取当前项目状态后再规划动作。` : '本地服务不会把密钥发送到浏览器'}</span>
          </div>
        </div>

        {health.status === 'ready' && (!health.configured || showSettings) ? (
          <form className="ai-config-form" onSubmit={saveConfiguration}>
            <div className="ai-config-title">
              <Settings2 size={19} />
              <div>
                <h3>AI 模型设置</h3>
                <p>分析与生图密钥分开保存，保存前分别验证模型访问权限。</p>
              </div>
            </div>

            <fieldset className="ai-model-picker">
              <legend>分析供应商</legend>
              <div className="ai-model-tabs" role="tablist" aria-label="分析供应商">
                {advisorProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    role="tab"
                    aria-selected={advisorProvider === provider.id}
                    className={advisorProvider === provider.id ? 'active' : ''}
                    onClick={() => chooseAdvisorProvider(provider.id)}
                    disabled={savingConfig}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>
              <p className="ai-inline-note">{selectedProviderInfo.description}</p>
            </fieldset>

            <label className="ai-config-field">
              <span>{selectedProviderInfo.keyLabel}</span>
              <div className="ai-secret-input">
                <input
                  type={showAnalysisKey ? 'text' : 'password'}
                  value={analysisApiKey}
                  onChange={(event) => setAnalysisApiKey(event.target.value)}
                  placeholder={advisorProviderConfigured ? `已配置；留空将保留现有 ${selectedProviderInfo.label} 密钥` : 'sk-...'}
                  autoComplete="new-password"
                  spellCheck="false"
                  maxLength={512}
                  disabled={savingConfig}
                />
                <button type="button" onClick={() => setShowAnalysisKey((value) => !value)} aria-label={showAnalysisKey ? '隐藏分析密钥' : '显示分析密钥'}>
                  {showAnalysisKey ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <small className={analysisApiKey.trim() ? 'ai-key-ready' : ''}>
                {analysisApiKey.trim()
                  ? '已收到密钥，可以点击下方按钮验证。'
                  : advisorProviderConfigured
                    ? '已经配置；留空会保留现有密钥。'
                    : '用于市场、人群、竞品、定位等文本分析。'}
              </small>
            </label>

            {advisorProvider === 'kimi' && (
              <label className="ai-config-field">
                <span>Kimi Base URL</span>
                <input
                  value={kimiBaseUrl}
                  onChange={(event) => setKimiBaseUrl(event.target.value)}
                  placeholder="https://api.moonshot.ai/v1"
                  spellCheck="false"
                  maxLength={180}
                  disabled={savingConfig}
                />
                <small>默认使用 Moonshot/Kimi 官方 OpenAI 兼容接口。</small>
              </label>
            )}

            {advisorProvider === 'custom' && (
              <>
                <label className="ai-config-field">
                  <span>网关名称</span>
                  <input
                    value={customProviderName}
                    onChange={(event) => setCustomProviderName(event.target.value)}
                    placeholder="例如 OpenRouter / OneAPI"
                    spellCheck="false"
                    maxLength={40}
                    disabled={savingConfig}
                  />
                  <small>仅用于本地显示，便于区分不同代理或聚合平台。</small>
                </label>
                <label className="ai-config-field">
                  <span>网关 Base URL</span>
                  <input
                    value={customBaseUrl}
                    onChange={(event) => setCustomBaseUrl(event.target.value)}
                    placeholder="例如 https://openrouter.ai/api/v1"
                    spellCheck="false"
                    maxLength={240}
                    disabled={savingConfig}
                  />
                  <small>需要兼容 OpenAI Chat Completions 协议。</small>
                </label>
              </>
            )}

            {advisorProvider === 'tikbit' && (
              <label className="ai-config-field">
                <span>TikBit Base URL</span>
                <input value="https://tikbit.ai/v1" readOnly aria-readonly="true" />
                <small>已按 TikBit 官方 OpenAI Chat Completions 接口预设。</small>
              </label>
            )}

            <fieldset className="ai-model-picker">
              <legend><Images size={14} />生图供应商</legend>
              <div className="ai-model-tabs" role="tablist" aria-label="生图供应商">
                {imageProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    role="tab"
                    aria-selected={imageProvider === provider.id}
                    className={imageProvider === provider.id ? 'active' : ''}
                    onClick={() => { setImageProvider(provider.id); setImageBaseUrl(provider.id === 'tikbit' ? 'https://tikbit.ai/v1' : ''); setAccountImageModels([]); setConfigError('') }}
                    disabled={savingConfig}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>
              <p className="ai-inline-note">{selectedImageProviderInfo.description}</p>
            </fieldset>

            {imageProvider === 'tikbit' && (
              <label className="ai-config-field">
                <span>TikBit 生图 Base URL</span>
                <input value="https://tikbit.ai/v1" readOnly aria-readonly="true" />
                <small>首次同时配置分析与生图时，生图密钥可留空并使用上方同一个 TikBit Key。</small>
              </label>
            )}

            {imageProvider === 'custom' && (
              <label className="ai-config-field">
                <span>生图网关 Base URL</span>
                <input value={imageBaseUrl} onChange={(event) => setImageBaseUrl(event.target.value)} placeholder="例如 https://example.com/v1" spellCheck="false" maxLength={240} disabled={savingConfig} />
                <small>需要兼容 OpenAI Images API。</small>
              </label>
            )}

            {advisorProvider === 'tikbit' && imageProvider === 'tikbit' ? (
              <div className="ai-shared-key-note">
                <ShieldCheck size={16} />
                <div>
                  <strong>生图自动使用上方 TikBit Key</strong>
                  <span>保存时仍会分别验证文本模型和生图模型。</span>
                </div>
              </div>
            ) : (
              <label className="ai-config-field">
                <span>{selectedImageProviderInfo.keyLabel}</span>
                <div className="ai-secret-input">
                  <input
                    type={showImageKey ? 'text' : 'password'}
                    value={imageApiKey}
                    onChange={(event) => setImageApiKey(event.target.value)}
                    placeholder={imageProviderConfigured ? '已配置；留空将保留现有生图密钥' : 'sk-...'}
                    autoComplete="new-password"
                    spellCheck="false"
                    maxLength={512}
                    disabled={savingConfig}
                  />
                  <button type="button" onClick={() => setShowImageKey((value) => !value)} aria-label={showImageKey ? '隐藏生图密钥' : '显示生图密钥'}>
                    {showImageKey ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <small>用于包装设计图生成与局部修改。</small>
              </label>
            )}

            <fieldset className="ai-model-picker">
              <legend>模型来源</legend>
              <div className="ai-model-tabs" role="tablist" aria-label="模型来源">
                {advisorModelModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={modelMode === mode.id}
                    className={modelMode === mode.id ? 'active' : ''}
                    onClick={() => chooseModelMode(mode.id)}
                    disabled={savingConfig}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {modelMode === 'custom' ? (
                <label className="ai-config-field ai-model-control">
                  <span>自定义模型 ID</span>
                  <input
                    value={customModel}
                    onChange={(event) => setCustomModel(event.target.value)}
                    placeholder={advisorProvider === 'kimi' ? '例如 kimi-k3' : advisorProvider === 'custom' ? '例如 openrouter/moonshotai/kimi-k2 或 qwen-plus' : '例如 gpt-4.1-mini'}
                    spellCheck="false"
                    maxLength={128}
                    disabled={savingConfig}
                  />
                  <small>保存时会检查该模型是否存在且当前账号有权访问。</small>
                </label>
              ) : modelMode === 'account' ? (
                <div className="ai-account-models">
                  <Button type="button" variant="secondary" icon={loadingModels ? RefreshCw : ListFilter} onClick={() => loadAccountModels('text')} disabled={loadingModels || (!advisorProviderConfigured && !analysisApiKey.trim()) || missingCustomBaseUrl} className="full-width">
                    {loadingModels ? '正在读取模型' : accountModels.length ? '重新读取账号模型' : '读取账号可用模型'}
                  </Button>
                  {accountModels.length > 0 && (
                    <label className="ai-config-field ai-model-control">
                      <span>账号返回的文本模型</span>
                      <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} disabled={savingConfig}>
                        {visibleModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              ) : (
                <label className="ai-config-field ai-model-control">
                  <span>默认模型</span>
                  <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} disabled={savingConfig}>
                    {visibleModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                  </select>
                  {selectedModelInfo && <small>{selectedModelInfo.description}</small>}
                </label>
              )}
            </fieldset>

            <fieldset className="ai-model-picker ai-image-model-picker">
              <legend><Images size={14} />生图模型</legend>
              <div className="ai-model-tabs" role="tablist" aria-label="生图模型来源">
                {imageModelModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={imageModelMode === mode.id}
                    className={imageModelMode === mode.id ? 'active' : ''}
                    onClick={() => chooseImageModelMode(mode.id)}
                    disabled={savingConfig}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {imageModelMode === 'custom' ? (
                <label className="ai-config-field ai-model-control">
                  <span>自定义生图模型 ID</span>
                  <input
                    value={customImageModel}
                    onChange={(event) => setCustomImageModel(event.target.value)}
                    placeholder="例如 gpt-image-2.5-flare"
                    spellCheck="false"
                    maxLength={128}
                    disabled={savingConfig}
                  />
                  <small>支持 GPT Image 与 DALL-E 模型 ID。</small>
                </label>
              ) : imageModelMode === 'account' ? (
                <div className="ai-account-models">
                  <Button type="button" variant="secondary" icon={loadingModels ? RefreshCw : Images} onClick={() => loadAccountModels('image')} disabled={loadingModels || (!imageProviderConfigured && !imageApiKey.trim() && !sharedTikBitKeyAvailable)} className="full-width">
                    {loadingModels ? '正在读取模型' : accountImageModels.length ? '重新读取账号模型' : '读取账号生图模型'}
                  </Button>
                  {accountImageModels.length > 0 && (
                    <label className="ai-config-field ai-model-control">
                      <span>账号返回的生图模型</span>
                      <select value={selectedImageModel} onChange={(event) => setSelectedImageModel(event.target.value)} disabled={savingConfig}>
                        {visibleImageModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              ) : (
                <label className="ai-config-field ai-model-control">
                  <span>默认生图模型</span>
                  <select value={selectedImageModel} onChange={(event) => setSelectedImageModel(event.target.value)} disabled={savingConfig}>
                    {visibleImageModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                  </select>
                  {selectedImageModelInfo && <small>{selectedImageModelInfo.description}</small>}
                </label>
              )}
            </fieldset>

            {configError && <p className="ai-config-error"><TriangleAlert size={14} />{configError}</p>}
            <Button icon={ShieldCheck} className="full-width" disabled={savingConfig}>
              {savingConfig ? '正在验证连接' : '验证并保存模型'}
            </Button>
            <p className="ai-config-note">密钥仅保存在当前电脑的本地配置文件中，页面不会读取或回显已保存的密钥。</p>
          </form>
        ) : (
          <>
            <AgentMission currentView={currentView} onNavigate={onNavigate} onPlan={askAdvisor} onExecute={onExecute} loading={loading} instruction={question} />
            <section className="ai-prompt-section">
              <h3>交给智能体</h3>
              <div className="ai-quick-actions">
                {quickActions[stage.id].map((action) => (
                  <button key={action} disabled={!health.configured || loading} onClick={() => askAdvisor(action)}>
                    {action}
                  </button>
                ))}
              </div>
              <label className="ai-question">
                <span>这次要完成什么</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={`例如：围绕当前${agentWorkspaceStates[currentView]?.label || '项目'}，给我一套可执行的推进方案`}
                  maxLength={500}
                  disabled={!health.configured || loading}
                />
              </label>
              <Button icon={Send} onClick={() => askAdvisor()} disabled={!question.trim() || !health.configured || loading} className="full-width">
                {loading ? '正在规划' : '分析并制定行动计划'}
              </Button>
              <p className="ai-privacy-note"><ShieldCheck size={13} />仅发送当前项目的结构化字段，不发送本地文件或图片。</p>
            </section>

            <div className="ai-response" aria-live="polite">
              {loading && (
                <div className="ai-loading">
                  <span className="ai-spinner" />
                  <strong>正在交叉检查资料、假设与风险</strong>
                  <p>通常需要几秒钟。</p>
                </div>
              )}

              {error && (
                <div className="ai-error">
                  <TriangleAlert size={18} />
                  <div><strong>本次分析未完成</strong><p>{error}</p></div>
                  <button onClick={() => askAdvisor()} aria-label="重试"><RotateCcw size={16} /></button>
                </div>
              )}

              {result && (
                <div className="ai-result">
                  <div className="ai-summary">
                    <span>{leadAgent.label}判断</span>
                    <h3>{result.advice.summary}</h3>
                    <small>判断信心：{confidenceLabels[result.advice.confidence]}</small>
                  </div>
                  <AdviceList title="建议动作" icon={CircleCheck} items={result.advice.recommendations} />
                  <AdviceList title="主要风险" icon={TriangleAlert} items={result.advice.risks} tone="risk" />
                  <AdviceList title="验证清单" icon={ShieldCheck} items={result.advice.validations} />
                  <AdviceList title="判断依据" icon={Sparkles} items={result.advice.basis} tone="basis" />
                  <p className="ai-result-meta">{agentRoles[result.agentRoleId]?.label || leadAgent.label} · {result.provider === 'tikbit' ? 'TikBit' : result.provider === 'kimi' ? 'Kimi' : result.provider === 'custom' ? customProviderName || '自定义网关' : 'OpenAI'} · {result.model} · {new Date(result.generatedAt).toLocaleString('zh-CN')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

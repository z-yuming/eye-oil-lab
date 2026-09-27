import { useEffect, useMemo, useState } from 'react'
import {
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

const advisorProviders = [
  { id: 'openai', label: 'OpenAI', keyLabel: 'OpenAI 分析 API Key', description: '适合结构化产品判断、策略复核和长链路分析。' },
  { id: 'kimi', label: 'Kimi', keyLabel: 'Kimi API Key', description: 'Moonshot/Kimi OpenAI 兼容接口，适合中文长上下文分析。' },
  { id: 'custom', label: '自定义网关', keyLabel: '网关 API Key', description: '适合 OpenRouter、硅基流动、302、OneAPI 或自建 OpenAI 兼容代理。' },
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

export function AiAdvisor({ open, onClose, state }) {
  const [health, setHealth] = useState({ status: 'loading', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, model: '', imageModel: '' })
  const [showSettings, setShowSettings] = useState(false)
  const [advisorProvider, setAdvisorProvider] = useState('openai')
  const [analysisApiKey, setAnalysisApiKey] = useState('')
  const [kimiBaseUrl, setKimiBaseUrl] = useState('https://api.moonshot.ai/v1')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customProviderName, setCustomProviderName] = useState('自定义网关')
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
  const stage = stages[state.activeStage]
  const project = useMemo(() => buildProjectContext(state), [state])

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setHealth({ status: 'loading', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, model: '', imageModel: '' })
    fetch('/api/ai/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('服务状态不可用')
        return response.json()
      })
      .then((data) => {
        const nextProvider = data.advisorProvider || 'openai'
        const nextModel = data.model || defaultModelForProvider(nextProvider)
        setHealth({ status: 'ready', configured: data.configured, advisorProvider: nextProvider, advisorLabel: data.advisorLabel || (nextProvider === 'kimi' ? 'Kimi' : 'OpenAI'), providerConfigured: data.providerConfigured || {}, imageConfigured: data.imageConfigured, model: nextModel, imageModel: data.imageModel })
        setAdvisorProvider(nextProvider)
        setCustomBaseUrl(data.customAdvisorBaseUrl || '')
        setCustomProviderName(data.customAdvisorName || '自定义网关')
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
          setHealth({ status: 'error', configured: false, advisorProvider: 'openai', advisorLabel: 'OpenAI', providerConfigured: {}, imageConfigured: false, model: '', imageModel: '' })
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
  }, [state.activeStage])

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
        body: JSON.stringify({ stageId: stage.id, question: normalizedPrompt, project }),
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
    const providerAlreadyConfigured = Boolean(health.providerConfigured?.[advisorProvider])
    const needsAnalysisKey = !providerAlreadyConfigured && !analysisApiKey.trim()
    const needsCustomBaseUrl = advisorProvider === 'custom' && !providerAlreadyConfigured && !customBaseUrl.trim()
    const needsImageKey = !health.imageConfigured && !imageApiKey.trim()
    if (savingConfig || !modelToSave || !imageModelToSave || needsAnalysisKey || needsCustomBaseUrl || needsImageKey) return

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
          imageApiKey: imageApiKey.trim(),
          model: modelToSave,
          imageModel: imageModelToSave,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || '配置验证失败')
      setHealth({ status: 'ready', configured: true, advisorProvider: data.advisorProvider || advisorProvider, advisorLabel: data.advisorLabel || selectedProviderInfo.label, providerConfigured: data.providerConfigured || { ...health.providerConfigured, [advisorProvider]: true }, imageConfigured: true, model: data.model, imageModel: data.imageModel })
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
    const keyForScope = scope === 'image' ? imageApiKey.trim() : analysisApiKey.trim()
    const configuredForScope = scope === 'image' ? health.imageConfigured : Boolean(health.providerConfigured?.[advisorProvider])
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
          imageApiKey: imageApiKey.trim(),
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
  const advisorProviderConfigured = Boolean(health.providerConfigured?.[advisorProvider])
  const advisorModelModes = advisorProvider === 'custom'
    ? modelModes.filter((mode) => mode.id === 'account' || mode.id === 'custom')
    : modelModes
  const missingCustomBaseUrl = advisorProvider === 'custom' && !advisorProviderConfigured && !customBaseUrl.trim()

  if (!open) return null

  return (
    <div className="drawer-backdrop" onMouseDown={onClose} role="presentation">
      <aside className="ai-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label="AI产品顾问">
        <div className="ai-drawer-head">
          <div>
            <span className="eyebrow"><Sparkles size={13} />AI 产品顾问</span>
            <h2>{stage.label}复核</h2>
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
            <button className="icon-button" onClick={onClose} aria-label="关闭AI产品顾问"><X size={19} /></button>
          </div>
        </div>

        <div className={`ai-service-state ${health.configured ? 'ready' : ''}`}>
          <span className="ai-status-dot" />
          <div>
            <strong>{health.status === 'loading' ? '正在检查服务' : health.configured ? `${health.advisorLabel || 'AI'} 已连接` : 'AI 分析尚未配置'}</strong>
            <span>{health.configured || health.imageConfigured ? `${health.configured ? `${health.advisorLabel || 'AI'} · ${health.model}` : '分析未配置'} · ${health.imageConfigured ? `OpenAI 生图 · ${health.imageModel}` : '生图未配置'}` : '本地服务不会把密钥发送到浏览器'}</span>
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
              <small>用于市场、人群、竞品、定位等文本分析。</small>
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

            <label className="ai-config-field">
              <span>生图 API Key</span>
              <div className="ai-secret-input">
                <input
                  type={showImageKey ? 'text' : 'password'}
                  value={imageApiKey}
                  onChange={(event) => setImageApiKey(event.target.value)}
                  placeholder={health.imageConfigured ? '已配置；留空将保留现有生图密钥' : 'sk-...'}
                  autoComplete="new-password"
                  spellCheck="false"
                  maxLength={512}
                  disabled={savingConfig}
                />
                <button type="button" onClick={() => setShowImageKey((value) => !value)} aria-label={showImageKey ? '隐藏生图密钥' : '显示生图密钥'}>
                  {showImageKey ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <small>用于包装设计图生成；需要 OpenAI 项目密钥和生图权限。</small>
            </label>

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
                  <Button type="button" variant="secondary" icon={loadingModels ? RefreshCw : Images} onClick={() => loadAccountModels('image')} disabled={loadingModels || (!health.imageConfigured && !imageApiKey.trim())} className="full-width">
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
            <Button icon={ShieldCheck} className="full-width" disabled={savingConfig || !canSaveModel || !canSaveImageModel || (!advisorProviderConfigured && !analysisApiKey.trim()) || missingCustomBaseUrl || (!health.imageConfigured && !imageApiKey.trim())}>
              {savingConfig ? '正在验证连接' : '验证并保存模型'}
            </Button>
            <p className="ai-config-note">密钥仅保存在当前电脑的本地配置文件中，页面不会读取或回显已保存的密钥。</p>
          </form>
        ) : (
          <>
            <section className="ai-prompt-section">
              <h3>快速复核</h3>
              <div className="ai-quick-actions">
                {quickActions[stage.id].map((action) => (
                  <button key={action} disabled={!health.configured || loading} onClick={() => askAdvisor(action)}>
                    {action}
                  </button>
                ))}
              </div>
              <label className="ai-question">
                <span>你的问题</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={`针对“${stage.label}”提出一个具体问题`}
                  maxLength={500}
                  disabled={!health.configured || loading}
                />
              </label>
              <Button icon={Send} onClick={() => askAdvisor()} disabled={!question.trim() || !health.configured || loading} className="full-width">
                {loading ? '正在分析' : '让 AI 复核'}
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
                    <span>AI 结论</span>
                    <h3>{result.advice.summary}</h3>
                    <small>判断信心：{confidenceLabels[result.advice.confidence]}</small>
                  </div>
                  <AdviceList title="建议动作" icon={CircleCheck} items={result.advice.recommendations} />
                  <AdviceList title="主要风险" icon={TriangleAlert} items={result.advice.risks} tone="risk" />
                  <AdviceList title="验证清单" icon={ShieldCheck} items={result.advice.validations} />
                  <AdviceList title="判断依据" icon={Sparkles} items={result.advice.basis} tone="basis" />
                  <p className="ai-result-meta">{result.provider === 'kimi' ? 'Kimi' : result.provider === 'custom' ? customProviderName || '自定义网关' : 'OpenAI'} · {result.model} · {new Date(result.generatedAt).toLocaleString('zh-CN')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

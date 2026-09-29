import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Download,
  FileClock,
  Image as ImageIcon,
  Lightbulb,
  PackageCheck,
  Printer,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import {
  audiences,
  concepts,
  getMarketOpportunities,
  getMarketOpportunity,
  getProductDirection,
  packagingOptions,
} from './data'
import { getProductProfile } from './product-profiles'
import { Button, StageHeading, Status } from './ui'

const statusMeta = {
  capture: { label: '待整理', tone: 'neutral' },
  review: { label: '待评审', tone: 'warning' },
  validation: { label: '待验证', tone: 'warning' },
  ready: { label: '可生成 Demo', tone: 'success' },
  paused: { label: '已暂缓', tone: 'neutral' },
}

const categoryNames = {
  'eye-oil': '眼部护理',
  'cold-brew': '即饮咖啡',
  'pet-treat': '宠物食品',
  'home-care': '家庭清洁',
  'digital-accessory': '数码配件',
}

function opportunityTitle(opportunity) {
  return opportunity?.title || `${categoryNames[opportunity?.templateId] || '新产品'}机会`
}

function firstDirection(opportunity, workspace) {
  const directionId = workspace?.selectedDirectionByOpportunity?.[opportunity?.id]
  return getProductDirection(opportunity, directionId)
}

export function SolutionObservation({ state, updateWorkspace, onOpenDemo }) {
  const workspace = state.opportunityWorkspace || {}
  const opportunities = getMarketOpportunities(workspace.customOpportunities || [])
  const selectedId = workspace.selectedOpportunityId || opportunities[0]?.id
  const selected = getMarketOpportunity(selectedId, workspace.customOpportunities || [])
  const direction = firstDirection(selected, workspace)
  const meta = statusMeta[workspace.statusByOpportunity?.[selected.id] || selected.stage] || statusMeta.capture
  const scores = Object.entries(selected.scoreBreakdown || {})
  const scoreLabels = { demand: '需求强度', differentiation: '差异空间', margin: '利润空间', feasibility: '落地难度', evidence: '证据完整度' }

  const selectOpportunity = (id) => updateWorkspace((current) => ({ ...current, selectedOpportunityId: id }))

  return <div className="workflow-page observation-page">
    <StageHeading
      title="机会确认"
      description="接收市场观察模块给出的机会，把已有证据收拢成可以继续生成产品方案的起点。"
      actions={<Button icon={Sparkles} onClick={() => onOpenDemo(selected.id)}>生成产品 Demo</Button>}
    />

    <div className="observation-layout">
      <section className="opportunity-queue" aria-label="市场机会列表">
        <div className="module-section-head"><div><span>机会池</span><strong>{opportunities.length} 个待处理机会</strong></div><small>来自上游市场观察</small></div>
        <div className="opportunity-queue-list">
          {opportunities.map((item, index) => {
            const itemMeta = statusMeta[workspace.statusByOpportunity?.[item.id] || item.stage] || statusMeta.capture
            return <button key={item.id} className={`opportunity-row ${item.id === selected.id ? 'selected' : ''}`} onClick={() => selectOpportunity(item.id)}>
              <span className="opportunity-row-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="opportunity-row-copy"><strong>{opportunityTitle(item)}</strong><small>{categoryNames[item.templateId] || '自定义品类'} · {item.evidence || '资料待接入'}</small></span>
              <Status tone={itemMeta.tone}>{itemMeta.label}</Status>
            </button>
          })}
        </div>
        <div className="observation-source-note"><BadgeCheck size={16} /><span>这里只接收并整理机会，不重复建设市场数据库。</span></div>
      </section>

      <section className="opportunity-detail">
        <div className="opportunity-detail-top">
          <div>
            <div className="workflow-kicker"><span>{categoryNames[selected.templateId] || '自定义品类'}</span><Status tone={meta.tone}>{meta.label}</Status></div>
            <h2>{opportunityTitle(selected)}</h2>
            <p>{selected.summary || `现有资料显示这里可能存在产品机会，下一步先用低成本 Demo 验证产品方向，不把资料缺口当成确定结论。`}</p>
          </div>
          <div className="opportunity-confidence"><span>当前判断</span><strong>{selected.confidence || '证据待补充'}</strong><small>随着真实数据接入持续更新</small></div>
        </div>

        <div className="observation-facts">
          <article><span className="fact-source known">已有资料</span><Target size={19} /><div><small>机会依据</small><strong>{selected.evidence || '尚未接入来源资料'}</strong></div></article>
          <article><span className="fact-source suggested">AI建议</span><Lightbulb size={19} /><div><small>优先产品方向</small><strong>{direction?.name || '等待生成产品方向'}</strong></div></article>
          <article><span className="fact-source pending">待确认</span><Users size={19} /><div><small>核心人群</small><strong>{selected.targetUser || '由现有证据推导，进入 Demo 后确认'}</strong></div></article>
        </div>

        <div className="opportunity-score-panel">
          <div className="module-section-head"><div><span>机会判断</span><strong>用于决定是否生成 Demo</strong></div><small>不是最终市场结论</small></div>
          <div className="opportunity-score-grid">
            {scores.length ? scores.map(([key, value]) => <div key={key}><span>{scoreLabels[key] || key}</span><strong>{value}</strong><div><i style={{ width: `${value}%` }} /></div></div>) : <div className="workflow-empty"><CircleAlert size={18} /><span>评分数据尚未接入，可直接生成 Demo 后再补。</span></div>}
          </div>
        </div>

        <div className="opportunity-next-step">
          <div><Sparkles size={20} /><span><strong>下一步只做一件事</strong><small>根据这条市场机会生成 2-3 个产品 Demo，选定方向后再进入设计仓。</small></span></div>
          <Button icon={ArrowRight} onClick={() => onOpenDemo(selected.id)}>进入产品 Demo</Button>
        </div>
      </section>
    </div>
  </div>
}

function demoFallback(direction, opportunity) {
  const category = categoryNames[opportunity.templateId] || '产品'
  return {
    premise: direction?.premise || `围绕「${opportunityTitle(opportunity)}」形成一个可快速验证的${category}方案。`,
    form: direction?.project?.form || `${category}概念样`,
    structure: direction?.project?.structure || '包装结构待设计确认',
    price: direction?.project?.priceBand || '价格带待确认',
  }
}

function DemoConceptBoard({ opportunity, index, direction, detail }) {
  const scoreItems = Object.entries(direction.scores || {}).slice(0, 3)
  const scoreLabels = { userFit: '人群匹配', differentiation: '差异空间', margin: '利润空间', feasibility: '落地可行' }
  return <div className="demo-concept-board">
    <header><span>PRODUCT DEMO</span><strong>{String(index + 1).padStart(2, '0')}</strong></header>
    <div className="demo-concept-main"><PackageCheck size={24} /><span>{categoryNames[opportunity.templateId] || '新产品'}</span><h3>{direction.name}</h3><p>{detail.premise}</p></div>
    <div className="demo-concept-scores">
      {scoreItems.length ? scoreItems.map(([key, value]) => <span key={key}><small>{scoreLabels[key] || key}</small><strong>{value}</strong></span>) : <span><small>方案状态</small><strong>待评审</strong></span>}
    </div>
  </div>
}

export function ProductDemo({ state, updateWorkspace, onConfirm }) {
  const workspace = state.opportunityWorkspace || {}
  const opportunity = getMarketOpportunity(workspace.selectedOpportunityId || state.selectedOpportunityId, workspace.customOpportunities || [])
  const directions = opportunity.directions?.length ? opportunity.directions : [getProductDirection(opportunity)].filter(Boolean)
  const selectedId = workspace.selectedDirectionByOpportunity?.[opportunity.id] || directions[0]?.id
  const selected = directions.find((direction) => direction.id === selectedId) || directions[0]
  const [generatingDirections, setGeneratingDirections] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [generationBrief, setGenerationBrief] = useState('')

  const chooseDirection = (directionId) => updateWorkspace((current) => ({
    ...current,
    selectedDirectionByOpportunity: { ...(current.selectedDirectionByOpportunity || {}), [opportunity.id]: directionId },
  }))

  const generateDirections = async () => {
    if (generatingDirections) return
    const customRequest = generationBrief.trim()
    setGeneratingDirections(true)
    setGenerationError('')
    try {
      const response = await fetch('/api/ai/product-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: opportunity.templateId,
          category: categoryNames[opportunity.templateId] || '新产品',
          opportunity,
          customRequest,
          selectedDirection: selected ? {
            name: selected.name,
            premise: selected.premise,
            form: selected.project?.form,
            structure: selected.project?.structure,
            priceBand: selected.project?.priceBand,
          } : null,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'AI产品方案生成失败，请稍后重试。')
      const nextDirections = payload.directions || []
      const recommended = nextDirections.find((direction) => direction.recommended) || nextDirections[0]
      updateWorkspace((current) => ({
        ...current,
        customOpportunities: [
          ...(current.customOpportunities || []).filter((item) => item.id !== opportunity.id),
          { ...opportunity, directions: nextDirections, aiGeneratedAt: payload.generatedAt, aiModel: payload.model, generationBrief: customRequest },
        ],
        selectedDirectionByOpportunity: { ...(current.selectedDirectionByOpportunity || {}), [opportunity.id]: recommended?.id || '' },
      }))
    } catch (error) {
      setGenerationError(error.message)
    } finally {
      setGeneratingDirections(false)
    }
  }

  return <div className="workflow-page demo-page">
    <StageHeading
      title="产品方案"
      description="基于已确认的市场机会，生成可比较的产品方向。"
      actions={<><Button variant="secondary" icon={Sparkles} onClick={generateDirections} disabled={generatingDirections}>{generatingDirections ? '正在生成…' : 'AI生成方案'}</Button><Button icon={ArrowRight} disabled={!selected} onClick={() => onConfirm(opportunity.id, selected.id)}>{selected ? `以「${selected.name}」进入设计仓` : '确认方案，进入设计仓'}</Button></>}
    />

    <div className="demo-context-strip">
      <span><Target size={16} />来源机会</span><strong>{opportunityTitle(opportunity)}</strong><small>{opportunity.evidence || '资料待接入'}</small>
    </div>
    {generationError && <div className="demo-generation-error"><CircleAlert size={16} /><span>{generationError}</span></div>}

    <section className="demo-refine-panel" aria-label="调校产品方案方向">
      <div className="demo-refine-copy"><span><SlidersHorizontal size={16} />调校方向</span><strong>让 AI 按你的想法重做方案</strong><small>可指定人群、剂型、功能、价格、包装、想保留或排除的内容；不必局限于下面的预设卡片。</small></div>
      <textarea value={generationBrief} onChange={(event) => setGenerationBrief(event.target.value)} maxLength={500} placeholder="例如：不要做眼油，改为 79 元以内的眼部啫喱；面向熬夜办公人群，突出即时清爽感；包装要方便出差携带。" aria-label="自定义产品方案要求" />
      <div className="demo-refine-actions">
        <div className="demo-refine-examples" aria-label="常用调整方向">
          {['换成另一种产品形态', '控制建议售价', '锁定目标人群', '突出一个核心卖点'].map((item) => <button key={item} type="button" onClick={() => setGenerationBrief((current) => current ? `${current}；${item}` : item)}>{item}</button>)}
        </div>
        <Button icon={Sparkles} onClick={generateDirections} disabled={generatingDirections}>{generatingDirections ? '正在按要求生成…' : '按要求生成 3 个新方案'}</Button>
      </div>
    </section>

    <p className="demo-selection-guide">点击任一产品方案即可切换当前选择；{opportunity.generationBrief ? `本轮已按“${opportunity.generationBrief}”生成。` : '选好后再进入设计仓。'}</p>

    <div className="demo-grid">
      {directions.map((direction, index) => {
        const active = direction.id === selected?.id
        const detail = demoFallback(direction, opportunity)
        const scoreValues = Object.values(direction.scores || {})
        const average = scoreValues.length ? Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length) : null
        const selectWithKeyboard = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            chooseDirection(direction.id)
          }
        }
        return <article key={direction.id} className={`demo-card ${active ? 'selected' : ''}`} role="button" tabIndex={0} aria-pressed={active} aria-label={`${active ? '当前已选择' : '选择'}${direction.name}`} onClick={() => chooseDirection(direction.id)} onKeyDown={selectWithKeyboard}>
          <div className="demo-select" aria-hidden="true">
            <span>{active ? <CheckCircle2 size={18} /> : String(index + 1).padStart(2, '0')}</span>{direction.recommended && <em>AI 推荐</em>}
          </div>
          <div className="demo-media"><DemoConceptBoard opportunity={opportunity} index={index} direction={direction} detail={detail} /></div>
          <div className="demo-copy">
            <div className="demo-title-row"><div><small>方向 {String(index + 1).padStart(2, '0')}</small><h2>{direction.name}</h2></div>{average != null && <strong>{average}<span>综合分</span></strong>}</div>
            <p>{detail.premise}</p>
            <dl><div><dt>产品形态</dt><dd>{detail.form}</dd></div><div><dt>包装结构</dt><dd>{detail.structure}</dd></div><div><dt>建议价格</dt><dd>{detail.price}</dd></div></dl>
            <div className="demo-data-state"><span className="fact-source known">已有资料</span><span className="fact-source suggested">AI产品方案</span>{direction.risk ? <span className="fact-source pending">有待验证项</span> : <span className="fact-source pending">细节待确认</span>}</div>
            <div className="demo-choice-state">{active ? <><CheckCircle2 size={15} />当前选择</> : '点击选择此方案'}</div>
          </div>
        </article>
      })}
    </div>

    <div className="demo-confirm-band">
      <div><CheckCircle2 size={21} /><span><strong>当前选择：{selected?.name || '尚未选择'}</strong><small>确认后建立独立产品项目，并进入 2D 包装设计与局部修改。</small></span></div>
      <Button icon={ArrowRight} disabled={!selected} onClick={() => onConfirm(opportunity.id, selected.id)}>{selected ? `以「${selected.name}」建立项目` : '用此方向建立项目'}</Button>
    </div>
  </div>
}

function deliveryContent(state, project) {
  const customOpportunities = state.opportunityWorkspace?.customOpportunities || []
  const opportunity = getMarketOpportunity(state.selectedOpportunityId, customOpportunities)
  const candidateDirection = getProductDirection(opportunity, state.selectedDirectionId)
  const direction = candidateDirection?.buildable && candidateDirection?.project ? candidateDirection : null
  const concept = concepts.find((item) => item.id === state.selectedConcept) || concepts[0]
  const audience = audiences.find((item) => item.id === state.selectedAudience) || audiences[0]
  const isEyeOil = state.templateId === 'eye-oil'
  const profile = getProductProfile(state.templateId)
  const design = state.packagingDesign || {}
  const aiReport = state.deliveryReport && typeof state.deliveryReport === 'object' ? state.deliveryReport : null
  const aiProductDefinition = aiReport?.productDefinition || {}
  const aiPackagingDelivery = aiReport?.packagingDelivery || {}
  const packaging = isEyeOil
    ? packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
    : {
        name: project.structure || profile.packagingObject,
        bottle: project.form || profile.productType,
        applicator: project.structure || profile.packagingObject,
        carton: state.packagingDesign?.finishes?.join(' + ') || '材质与印刷待打样确认',
        risk: direction?.risk || '结构、材料与运输条件待打样验证',
      }
  const generatedConcepts = state.packagingDesign?.generatedConcepts || []
  const finalConceptId = state.packagingDesign?.confirmedConceptId || state.packagingDesign?.selectedConceptId
  const finalConcept = generatedConcepts.find((item) => item.id === finalConceptId)
  const designStatus = design.confirmed2D ? '2D方案已确认' : finalConcept?.image ? '已有效果图，待确认' : '设计待确认'
  const designBrief = design.description || '尚未补充包装视觉描述'
  const designConstraints = Array.isArray(design.supportingConstraints) ? design.supportingConstraints : []
  const finishSummary = design.finishes?.length ? design.finishes.join('、') : '待确定'
  const productImage = finalConcept?.image || (isEyeOil ? profile.deliveryFallbackImage : '')
  const usesThreeView = Boolean(!finalConcept?.image && isEyeOil && profile.deliveryFallbackImage)
  const genericPoints = [
    direction?.premise || `回应「${opportunityTitle(opportunity)}」的核心使用任务`,
    project.form || '产品形态等待确认',
    `${project.structure || '包装结构待确认'}，便于进入打样沟通`,
  ]
  const sellingPoints = isEyeOil ? [concept.tagline, '滚珠按摩与轻润油相结合，兼顾便携和使用体验', '20ml随身规格，覆盖通勤、办公与睡前护理'] : genericPoints
  const audienceName = isEyeOil ? audience.name : opportunity.targetUser || state.assumptions?.user || '目标人群待确认'
  const audienceDetail = isEyeOil ? `${audience.range}，核心场景为${audience.scene}。` : opportunity.targetUser || state.assumptions?.user || '根据上游机会数据与首轮方案继续确认。'
  const sampleFocus = isEyeOil ? concept.pilot || concept.proof || profile.sampleFocus : profile.sampleFocus
  const fallbackSampleTasks = isEyeOil
    ? [
        { task: '内容物小试', purpose: '比较3版油相粘度、肤感与吸收速度。', acceptance: '明确首选配方版本，并记录观察条件。' },
        { task: '滚珠组件验证', purpose: '验证304不锈钢滚珠的顺滑度、出液量与装配匹配。', acceptance: '倒置不漏液，出液均匀，连续使用不卡顿。' },
        { task: '包装适配测试', purpose: '验证瓶器、标签、纸盒与油性内容物及运输的适配。', acceptance: '无渗漏、掉标、明显色差或运输破损。' },
        { task: '小范围体验', purpose: '覆盖妆前、办公和睡前场景，观察油感与使用理解。', acceptance: '收集可复述的体验反馈，不直接当作功效结论。' },
      ]
    : sampleFocus.slice(0, 4).map((item) => ({ task: item, purpose: `围绕${project.form || profile.productType}确认真实使用与生产适配。`, acceptance: '形成样品记录、问题清单和下一版调整结论。' }))
  const fallbackPendingItems = [
    !design.confirmed2D && '最终2D设计版本与可编辑文字确认',
    '配方比例、INCI/原料资料与合规宣称依据',
    '包材精确尺寸、刀版、色值和印前文件',
    '供应商报价、MOQ、打样周期与量产交期',
    '样品测试记录、问题关闭和最终放行人',
  ].filter(Boolean)
  const sampleTasks = Array.isArray(aiReport?.sampleTasks) && aiReport.sampleTasks.length >= 3 ? aiReport.sampleTasks : fallbackSampleTasks
  const pendingItems = Array.isArray(aiReport?.missingItems) && aiReport.missingItems.length ? aiReport.missingItems : fallbackPendingItems
  const reportSummary = aiReport?.summary || ''
  const reportSource = aiReport ? `AI整理${aiReport.model ? ` · ${aiReport.model}` : ''}` : '系统结构化兜底'
  const reportStatus = aiReport?.status === 'sampling'
    ? '可进入打样沟通'
    : aiReport?.status === 'review'
      ? '需要继续评审'
      : '资料不足，暂不能下发量产'

  return { opportunity, direction, concept, packaging, isEyeOil, profile, design, designStatus, designBrief, designConstraints, finishSummary, sellingPoints, audienceName, audienceDetail, sampleFocus, sampleTasks, knownCount: [opportunity?.title, audienceName, project.form || profile.productType, project.structure || packaging.name, designStatus].filter(Boolean).length, pendingItems, finalConcept, productImage, usesThreeView, aiReport, aiProductDefinition, aiPackagingDelivery, reportSummary, reportSource, reportStatus }
}

export function ProductDelivery({ state, project, onOpenDesign, onOpenRecords, onGenerateReport, generatingReport, notify }) {
  const content = useMemo(() => deliveryContent(state, project), [state, project])
  const { opportunity, direction, concept, packaging, isEyeOil, profile, design, designStatus, designBrief, designConstraints, finishSummary, sellingPoints, audienceName, audienceDetail, sampleFocus, sampleTasks, knownCount, pendingItems, finalConcept, productImage, usesThreeView, aiReport, aiProductDefinition, aiPackagingDelivery, reportSummary, reportSource, reportStatus } = content

  const copySummary = async () => {
    const text = `${project.name}\n报告来源：${reportSource}\nAI交付判断：${reportSummary || '尚未生成AI交付判断'}\n市场机会：${opportunityTitle(opportunity)}\n产品方向：${direction?.name || project.name || '待确认'}\n目标人群：${audienceName}\n产品卖点：${sellingPoints.join('；')}\n产品形态：${project.form || '待确认'}\n包装结构：${project.structure || packaging.name || '待确认'}\n建议价格：${project.priceBand || state.assumptions?.price || '待确认'}\n设计状态：${designStatus}\n下发前检查：${pendingItems.length ? `${pendingItems.length}项待补资料` : '资料完整'}\n工艺：${finishSummary}\n首轮打样：${sampleTasks.map((item) => item.task).join('；')}\n待补资料：${pendingItems.join('；')}`
    try {
      await navigator.clipboard.writeText(text)
      notify('产品方案摘要已复制')
    } catch {
      notify('浏览器未允许复制，请使用打印或保存 PDF')
    }
  }

  return <div className="workflow-page delivery-page">
    <StageHeading
      title="产品交付"
      actions={<><Button icon={Sparkles} onClick={onGenerateReport} disabled={generatingReport}>{generatingReport ? 'AI正在整理…' : aiReport ? '重新生成AI报告' : 'AI生成交付报告'}</Button><Button variant="secondary" icon={ImageIcon} onClick={onOpenDesign}>返回产品设计仓</Button></>}
    />

    <div className="delivery-workspace">
      <article className="delivery-document">
        <header className="delivery-document-head">
          <div><span>PRODUCT DEVELOPMENT BRIEF</span><h1>{project.name || direction?.name || '产品开发方案'}</h1><p>{direction?.premise || (isEyeOil ? '高频用眼人群的随身轻护理方案' : `由「${opportunityTitle(opportunity)}」形成的产品方案`)}</p></div>
          <div className="delivery-version"><strong>V1.{Math.max(0, state.completed?.length || 0)}</strong><span>{new Date().toLocaleDateString('zh-CN')}</span></div>
        </header>

        <div className="delivery-hero">
          <div className="delivery-product-media">
            <span className="delivery-image-status"><BadgeCheck size={13} />{finalConcept?.image ? '设计仓最终确认版本' : isEyeOil ? '内置三视图参考版本' : '效果图待生成'}</span>
            {productImage ? <img src={productImage} alt={`${project.name}${usesThreeView ? '正面、侧面与顶部' : ''}产品效果图`} /> : <div className="delivery-generic-visual"><PackageCheck size={46} /><strong>{project.name}</strong><span>请先在产品设计中生成并确认效果图</span></div>}
            {usesThreeView ? <div className="delivery-view-labels"><span>正面效果</span><span>侧面信息</span><span>顶部结构</span></div> : productImage ? <div className="delivery-image-caption">最终包装效果图</div> : null}
          </div>
          <div className="delivery-insights">
            <section><span className="delivery-section-no">01</span><div><small>市场机会</small><h2>{opportunityTitle(opportunity)}</h2><p>{opportunity.evidence || '来源资料待接入'}；当前判断为“{opportunity.confidence || '待验证'}”。</p></div></section>
            <section><span className="delivery-section-no">02</span><div><small>目标人群</small><h2>{audienceName}</h2><p>{audienceDetail}</p></div></section>
            <section className="delivery-selling-points"><span className="delivery-section-no">03</span><div><small>三大产品卖点</small>{sellingPoints.slice(0, 3).map((point, index) => <p key={point}><b>{index + 1}</b>{point}</p>)}</div></section>
          </div>
        </div>

        <div className="delivery-status-strip">
          <div><small>交付状态</small><strong>{aiReport ? reportStatus : design.confirmed2D ? '可进入打样沟通，仍有资料待补' : '可用于方案评审，暂不能下发量产'}</strong><span>下方列出缺失资料，补齐后再进入量产确认。</span></div>
          <div><small>已汇总信息</small><strong>{knownCount} 项核心信息</strong><span>机会、人群、产品方向、结构和当前设计状态。</span></div>
          <div><small>待补齐信息</small><strong>{pendingItems.length} 项</strong><span>缺失资料不会被系统自动补成确定结论。</span></div>
        </div>

        <div className={`delivery-ai-summary ${aiReport ? 'is-generated' : ''}`}>
          <Sparkles size={17} />
          <div><small>{reportSource}</small><strong>{aiReport ? 'AI交付判断' : '交付报告尚未经过AI整理'}</strong><p>{reportSummary || '点击右上角“AI生成交付报告”，让模型读取当前市场机会、产品方案和包装设计状态后，重新整理执行任务与验收标准。'}</p></div>
        </div>

        <div className="delivery-facts">
          <div><small>产品功能</small><strong>{isEyeOil ? concept.name : direction?.name || project.form || '待确认'}</strong><span>{isEyeOil ? concept.tagline : direction?.premise || 'AI建议'}</span></div>
          <div><small>成分 / 技术方向</small><strong>{isEyeOil ? concept.ingredients.slice(0, 3).join(' · ') : profile.technology}</strong><span>{isEyeOil ? '最终配方以打样和合规评审为准' : '具体技术与参数以打样和专业评审为准'}</span></div>
          <div><small>规格与结构</small><strong>{project.structure || project.form || '待确认'}</strong><span>{packaging.name || '包装方案待确认'}</span></div>
          <div><small>建议售价</small><strong>{project.priceBand || (state.assumptions?.price ? `¥${state.assumptions.price}` : '待确认')}</strong><span>价格仍需真实成本校准</span></div>
        </div>

        <div className="delivery-report-grid">
          <section className="delivery-report-section delivery-report-definition">
            <div className="delivery-report-title"><span>04</span><div><small>产品定义</small><strong>拿给开发人员先看这一段</strong></div></div>
            <dl className="delivery-definition-list">
              <div><dt>市场机会</dt><dd>{opportunityTitle(opportunity)}</dd></div>
              <div><dt>已确认方向</dt><dd>{direction?.name || project.name || '待确认，需返回产品方案确认'}</dd></div>
              <div><dt>核心任务</dt><dd>{aiProductDefinition.coreTask || direction?.premise || `回应「${opportunityTitle(opportunity)}」并验证${project.form || profile.productType}的真实使用价值。`}</dd></div>
              <div><dt>使用场景</dt><dd>{aiProductDefinition.usageScenes || audienceDetail}</dd></div>
              <div><dt>技术方向</dt><dd>{aiProductDefinition.technicalDirection || (isEyeOil ? concept.ingredients.join('、') : profile.technology)}</dd></div>
              <div><dt>生产边界</dt><dd>{aiProductDefinition.productionBoundary || '当前是产品开发 Brief，不替代配方单、刀版、法规审核、检测报告或供应商报价。'}</dd></div>
            </dl>
          </section>
          <section className="delivery-report-section">
            <div className="delivery-report-title"><span>05</span><div><small>包装交付</small><strong>效果图与包材要求</strong></div></div>
            <dl className="delivery-definition-list">
              <div><dt>设计状态</dt><dd>{designStatus}</dd></div>
              <div><dt>视觉方向</dt><dd>{aiPackagingDelivery.visualDirection || design.style || '待确认'}</dd></div>
              <div><dt>自由需求</dt><dd>{aiPackagingDelivery.copyGuidance || designBrief}</dd></div>
              <div><dt>结构方案</dt><dd>{aiPackagingDelivery.structure || `${packaging.bottle}；${packaging.applicator}；${packaging.carton}`}</dd></div>
              <div><dt>工艺材质</dt><dd>{aiPackagingDelivery.materialFinish || finishSummary}</dd></div>
              <div><dt>额外约束</dt><dd>{designConstraints.length ? designConstraints.join('、') : '未额外指定，按产品结构与打样验证确认'}</dd></div>
            </dl>
          </section>
        </div>

        <div className="delivery-report-grid delivery-report-grid-lower">
          <section className="delivery-report-section">
            <div className="delivery-report-title"><span>06</span><div><small>首轮打样任务</small><strong>按这个顺序交给开发执行</strong></div></div>
            <div className="delivery-task-list">
              {sampleTasks.map((item, index) => <div key={`${item.task}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.task}</strong><p>{item.purpose}</p><small>验收：{item.acceptance}</small></div></div>)}
            </div>
          </section>
          <section className="delivery-report-section">
            <div className="delivery-report-title"><span>07</span><div><small>下发前检查</small><strong>缺什么就补什么</strong></div></div>
            <div className="delivery-missing-list">
              {pendingItems.map((item) => <div key={item}><CircleAlert size={14} /><span>{item}</span></div>)}
            </div>
            <div className="delivery-handoff-note"><BadgeCheck size={15} /><span>当前报告适合方案评审、打样沟通和任务分派；补齐以上资料后，才进入量产确认。</span></div>
          </section>
        </div>

        <div className="delivery-handoff-bar"><div><CircleAlert size={18} /><span><small>下发前检查</small><strong>{pendingItems.length ? `还有 ${pendingItems.length} 项资料待补` : '资料已齐，可下发'}</strong></span></div><p>{pendingItems.length ? '可以带着待确认项进行方案沟通；量产前不要把缺失资料当成已确认。' : '当前报告可以作为开发任务单使用。'}</p></div>

        <div className="delivery-bottom">
          <section><div className="delivery-bottom-title"><PackageCheck size={18} /><span><small>包装方案</small><strong>{packaging.name}</strong></span></div><p>{isEyeOil ? `${packaging.bottle}，${packaging.applicator}，${packaging.carton}。` : `${packaging.bottle}；${packaging.applicator}；${packaging.carton}。`}</p><em>风险：{packaging.risk}</em></section>
          <section><div className="delivery-bottom-title"><BadgeCheck size={18} /><span><small>首轮打样重点</small><strong>只验证影响产品成立的项目</strong></span></div><ol>{sampleFocus.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ol></section>
          <section><div className="delivery-bottom-title"><CircleAlert size={18} /><span><small>待确认</small><strong>交付前保留边界</strong></span></div><ul><li>供应商报价、MOQ 与交期待询价</li><li>最终文案与宣称待合规审核</li><li>量产前完成稳定性与包装适配测试</li></ul></section>
        </div>

        <footer className="delivery-document-foot"><span><i /> 已有资料</span><span><i /> AI建议</span><span><i /> 待确认</span><strong>{state.projectRecords?.find((item) => item.id === state.projectId)?.code || 'PRODUCT BRIEF'}</strong></footer>
      </article>

      <aside className="delivery-actions" aria-label="产品交付操作">
        <div><span>交付操作</span><strong>当前版本</strong></div>
        <button onClick={() => window.print()}><Printer size={18} /><span>打印 / 保存 PDF</span></button>
        {productImage ? <a href={productImage} download><Download size={18} /><span>下载产品效果图</span></a> : <button onClick={() => notify('请先在产品设计中生成并确认效果图')}><Download size={18} /><span>下载产品效果图</span></button>}
        <button onClick={copySummary}><BadgeCheck size={18} /><span>复制方案摘要</span></button>
        <button onClick={onOpenRecords}><FileClock size={18} /><span>查看项目记录</span></button>
        <div className="delivery-action-note"><CheckCircle2 size={16} /><p>产品图、方案内容和待确认项已集中在同一页。</p></div>
      </aside>
    </div>
  </div>
}

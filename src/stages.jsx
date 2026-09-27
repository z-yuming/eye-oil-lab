import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  ClipboardList,
  Database,
  Download,
  Filter,
  FileSpreadsheet,
  FilePlus2,
  FlaskConical,
  GitCompare,
  Info,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import {
  audiences,
  competitors,
  concepts,
  defaultConceptWeights,
  developmentBlueprint,
  evidence,
  getCategoryTemplate,
  getMarketOpportunity,
  getProductDirection,
  marketTrend,
  packagingGateItems,
  packagingOptions,
  painPoints,
  positioningOptions,
  readinessItems,
  sourcingItems,
  supplierLibrary,
  supplierSourceStats,
  trendYears,
} from './data'
import { mergeSupplierLibrary, parseSupplierFiles } from './supplier-import'
import {
  Button,
  Confidence,
  ConfirmBar,
  EvidenceLink,
  Field,
  Panel,
  ProgressBar,
  SearchInput,
  StageHeading,
  Status,
} from './ui'

const PackagingStudio = lazy(() => import('./packaging').then((module) => ({ default: module.PackagingStudio })))
const PackagingDecision = lazy(() => import('./packaging').then((module) => ({ default: module.PackagingDecision })))

function StageLayout({ main, aside, confirm }) {
  return (
    <>
      <div className="workspace-grid">
        <div className="workspace-main">{main}</div>
        <aside className="workspace-aside">{aside}</aside>
      </div>
      {confirm}
    </>
  )
}

function isDone(state, index) {
  return state.completed.includes(index)
}

export function TemplateDrivenStage({ state, updateState, confirmStage, stageIndex }) {
  const template = getCategoryTemplate(state.templateId)
  const marketOpportunity = getMarketOpportunity(state.selectedOpportunityId, state.opportunityWorkspace?.customOpportunities || [])
  const productDirection = getProductDirection(marketOpportunity, state.selectedDirectionId)
  const blueprint = developmentBlueprint[stageIndex]
  const profile = template.stageProfiles[blueprint.id]
  const project = { ...template.project, ...(state.project || {}) }
  const note = state.stageNotes?.[blueprint.id] || ''
  const updateNote = (value) => updateState({
    stageNotes: { ...state.stageNotes, [blueprint.id]: value },
  })

  const main = (
    <>
      <StageHeading title={blueprint.label} description={profile.focus} />
      <div className="template-stage-band">
        <div><span>当前品类方法论</span><strong>{template.name}</strong></div>
        <div><span>项目形态</span><strong>{project.form}</strong></div>
        <div><span>本阶段通用职责</span><strong>{blueprint.role}</strong></div>
      </div>
      <Panel title="本品类分析框架" subtitle="这些不是眼油字段，而是当前品类在这一阶段必须回答的问题。">
        <div className="playbook-dimension-grid">
          {profile.dimensions.map((item, index) => (
            <article key={item.label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{item.label}</h2>
              <p>{item.focus}</p>
              <small>需要证据：{item.evidence}</small>
            </article>
          ))}
        </div>
      </Panel>
      <div className="split-panels template-decision-grid">
        <Panel title="阶段关键决策" subtitle="完成资料整理后，团队需要对这一件事作出判断。">
          <div className="template-decision-copy"><CircleAlert size={18} /><strong>{profile.decision}</strong></div>
        </Panel>
        <Panel title="阶段交付物" subtitle="它会成为下一步骤的输入，而不是单独一份报告。">
          <div className="template-output-copy"><Check size={18} /><strong>{profile.output}</strong></div>
        </Panel>
      </div>
      <Panel title="本阶段记录" subtitle="将真实资料中的结论、反证或待确认项写入当前项目；切换品类时不会继承。">
        <textarea
          className="template-stage-note"
          value={note}
          maxLength={500}
          placeholder={`例如：围绕“${profile.dimensions[0].label}”补充本项目结论或待验证问题。`}
          onChange={(event) => updateNote(event.target.value)}
        />
        <div className="template-note-meta"><span>{note.length}/500</span><span>资料基线：{project.sourceCount}份{project.sourceLabel}</span></div>
      </Panel>
    </>
  )

  const aside = (
    <Panel title="当前项目实例" subtitle="这层是本次开发的真实约束，不会写死在品类模板里。" className="sticky-panel">
      <div className="selection-summary"><span className="selection-index">{template.category}</span><h2>{project.name}</h2><p>{project.form} · {project.structure}</p></div>
      <dl className="definition-list compact">
        <div><dt>来源机会</dt><dd>{marketOpportunity.title}</dd></div>
        <div><dt>选定路径</dt><dd>{productDirection?.name || '未记录'}</dd></div>
        <div><dt>首发渠道</dt><dd>{project.channel}</dd></div>
        <div><dt>目标价格带</dt><dd>{project.priceBand}</dd></div>
        <div><dt>目标上市</dt><dd>{project.launch}</dd></div>
        <div><dt>阶段状态</dt><dd>{isDone(state, stageIndex) ? '已确认' : '待确认'}</dd></div>
      </dl>
      <div className="template-risk-list">
        <strong>本阶段风险边界</strong>
        {profile.risks.map((risk) => <div key={risk}><CircleAlert size={14} /><span>{risk}</span></div>)}
      </div>
    </Panel>
  )

  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, stageIndex)} label={`确认${blueprint.label}结论`} note={profile.output} onConfirm={confirmStage} />} />
}

export function ResearchStage({ state, updateState, confirmStage, openEvidence, notify }) {
  const fileInput = useRef(null)
  const [imported, setImported] = useState(35)

  const updateAssumption = (key, value) => updateState({
    assumptions: { ...state.assumptions, [key]: value },
  })

  const handleFiles = (event) => {
    const count = event.target.files?.length || 0
    if (!count) return
    setImported((current) => current + count)
    notify(`已加入 ${count} 份资料，等待结构化处理`)
  }

  const main = (
    <>
      <StageHeading
        title="市场调研"
        description="从真实资料中提取市场需求、反向风险与可验证的产品机会。"
        actions={<>
          <input ref={fileInput} className="visually-hidden" type="file" accept=".pdf" multiple onChange={handleFiles} />
          <Button variant="secondary" icon={FilePlus2} onClick={() => fileInput.current?.click()}>导入资料</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={() => notify('分析已刷新')}>刷新分析</Button>
        </>}
      />

      <div className="thesis-band">
        <div className="thesis-icon"><BarChart3 size={21} /></div>
        <div>
          <strong>市场核心判断</strong>
          <p>眼部护理的机会不只在“淡纹”，而在于把疲态、干燥与按摩体验组合成一种可随身使用的轻护理方案。滚珠眼油具备结构差异，但必须证明不油腻、不刺激、不漏液。</p>
        </div>
      </div>

      <Panel
        title="关键证据"
        subtitle={`${imported}份资料已载入 · 结论均保留来源与使用边界`}
        action={<EvidenceLink onClick={() => openEvidence(evidence[0])}>查看证据详情</EvidenceLink>}
      >
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>关键发现</th><th>数据来源</th><th>时间</th><th>样本/口径</th><th>可信度</th></tr></thead>
            <tbody>
              {evidence.map((item, index) => (
                <tr key={item.id} className="clickable-row" onClick={() => openEvidence(item)}>
                  <td>{index + 1}</td><td className="cell-strong">{item.finding}</td><td>{item.source}</td><td>{item.date}</td><td>{item.sample}</td><td><Confidence value={item.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="split-panels">
        <Panel title="眼部护理需求趋势" subtitle="指数化示例 · 2021=72">
          <div className="bar-chart" aria-label="眼部护理需求趋势柱状图">
            {marketTrend.map((value, index) => (
              <div className="chart-column" key={trendYears[index]}>
                <span className="chart-value">{value}</span>
                <div className="chart-bar" style={{ height: `${Math.round(value / 2.2)}%` }} />
                <span className="chart-label">{trendYears[index]}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="用户痛点分布" subtitle="评论与访谈主题聚类">
          <div className="progress-list">
            {painPoints.map((item, index) => <ProgressBar key={item.label} {...item} accent={index > 3} />)}
          </div>
        </Panel>
      </div>

      <Panel title="调研结论与反证" subtitle="机会成立，不代表产品方案已经成立">
        <div className="finding-grid">
          <div><span>需求信号</span><strong>便携按摩、轻润修护、专业感包装</strong><p>适合继续进入人群和竞品验证。</p></div>
          <div><span>核心反证</span><strong>油感、刺激、漏液可能抵消差异</strong><p>必须写入样品测试和包材校验。</p></div>
          <div><span>当前结论</span><strong>建议进入概念开发，不建议直接立项量产</strong><p>先验证人群接受度和结构可行性。</p></div>
        </div>
      </Panel>
    </>
  )

  const aside = (
    <Panel title="项目假设与决策" subtitle="后续分析将围绕这些条件展开" className="sticky-panel">
      <div className="form-stack">
        <Field label="目标用户" hint={`${state.assumptions.user.length}/60`}>
          <textarea value={state.assumptions.user} maxLength={60} onChange={(event) => updateAssumption('user', event.target.value)} />
        </Field>
        <Field label="建议零售价（元）" hint="当前假设，可在定位阶段修改">
          <input type="number" value={state.assumptions.price} onChange={(event) => updateAssumption('price', Number(event.target.value))} />
        </Field>
        <Field label="目标综合成本（元）" hint="包含内容物、包材、加工与检测分摊">
          <input type="number" value={state.assumptions.targetCost} onChange={(event) => updateAssumption('targetCost', Number(event.target.value))} />
        </Field>
        <Field label="首发渠道">
          <input value={state.assumptions.channel} onChange={(event) => updateAssumption('channel', event.target.value)} />
        </Field>
        <Field label="目标上市时间">
          <input value={state.assumptions.launch} onChange={(event) => updateAssumption('launch', event.target.value)} />
        </Field>
      </div>
      <div className="side-note"><Info size={16} /><span>当前使用样本数据演示流程。真实项目接入后，所有结论应回链到原报告和页码。</span></div>
    </Panel>
  )

  return <StageLayout main={main} aside={aside} confirm={
    <ConfirmBar done={isDone(state, 0)} label="确认市场机会" note="确认后锁定当前假设，进入人群分析。" onConfirm={confirmStage} />
  } />
}

export function AudienceStage({ state, updateState, confirmStage }) {
  const selected = audiences.find((item) => item.id === state.selectedAudience) || audiences[0]
  const main = (
    <>
      <StageHeading title="人群分析" description="不是给所有人做一瓶眼油，而是先选定最值得验证的使用者与场景。" />
      <div className="option-grid audience-grid">
        {audiences.map((item) => (
          <button key={item.id} className={`choice-card ${item.id === selected.id ? 'selected' : ''}`} onClick={() => updateState({ selectedAudience: item.id })}>
            <div className="choice-top"><span>{item.size}</span>{item.id === selected.id && <Check size={17} />}</div>
            <h2>{item.name}</h2><p className="muted">{item.range} · {item.scene}</p>
            <ul>{item.pains.map((pain) => <li key={pain}>{pain}</li>)}</ul>
          </button>
        ))}
      </div>
      <Panel title="人群痛点 × 产品机会矩阵" subtitle="把痛点转成可设计、可测试的产品要求">
        <div className="table-wrap">
          <table>
            <thead><tr><th>痛点</th><th>发生场景</th><th>现有替代方案不足</th><th>产品机会</th><th>验证方式</th></tr></thead>
            <tbody>
              <tr><td className="cell-strong">眼周疲态</td><td>熬夜、久看屏幕</td><td>普通眼霜缺少即时体验</td><td>清凉滚珠按摩</td><td>半脸对照与主观评分</td></tr>
              <tr><td className="cell-strong">干纹卡粉</td><td>上妆前、空调房</td><td>厚重产品影响底妆</td><td>轻润快吸收油相</td><td>妆前兼容性测试</td></tr>
              <tr><td className="cell-strong">便携护理</td><td>通勤、旅行</td><td>罐装或滴管易污染</td><td>20ml滚珠结构</td><td>漏液与连续滚动测试</td></tr>
              <tr><td className="cell-strong">成分焦虑</td><td>敏感、换季</td><td>复杂成分难理解</td><td>精简配方与证据透明</td><td>斑贴和眼周使用测试</td></tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="购买决策链" subtitle="从看到内容到复购的关键阻力">
        <div className="journey-row">
          {['被疲态内容击中', '理解滚珠价值', '相信温和与不油腻', '接受89元价格', '使用后没有漏液', '形成睡前习惯'].map((item, index) => (
            <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>
          ))}
        </div>
      </Panel>
    </>
  )
  const aside = (
    <Panel title="已选核心人群" subtitle="该选择将影响概念、定价与内容表达" className="sticky-panel">
      <div className="selection-summary">
        <span className="selection-index">{selected.range}</span>
        <h2>{selected.name}</h2>
        <p>{selected.gain}</p>
      </div>
      <dl className="definition-list compact">
        <div><dt>核心场景</dt><dd>{selected.scene}</dd></div>
        <div><dt>价格接受假设</dt><dd>{state.assumptions.price}元左右</dd></div>
        <div><dt>首发渠道</dt><dd>{state.assumptions.channel}</dd></div>
      </dl>
      <div className="side-note warning"><CircleAlert size={16} /><span>人群结论仍需通过概念访谈或小样测试验证，当前不能直接推导销量。</span></div>
    </Panel>
  )
  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, 1)} label="确认核心人群" note={`当前选择：${selected.name}`} onConfirm={confirmStage} />} />
}

export function CompetitorStage({ state, confirmStage }) {
  const [query, setQuery] = useState('')
  const filtered = competitors.filter((item) => `${item.name}${item.type}${item.structure}`.toLowerCase().includes(query.toLowerCase()))
  const average = Math.round(competitors.reduce((sum, item) => sum + item.price, 0) / competitors.length)
  const main = (
    <>
      <StageHeading title="竞品分析" description="用Top 10样本识别结构、价格和价值表达的拥挤区与空档。" actions={<SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索竞品或结构" />} />
      <Panel title="类目Top 10竞品" subtitle="示例数据 · 保留原始排名，不因字段缺失删除样本">
        <div className="table-wrap">
          <table>
            <thead><tr><th>排名</th><th>产品</th><th>形态</th><th>售价</th><th>规格</th><th>结构</th><th>优势</th><th>风险</th></tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.rank}><td>{item.rank}</td><td className="cell-strong">{item.name}</td><td>{item.type}</td><td>¥{item.price}</td><td>{item.volume}</td><td>{item.structure}</td><td>{item.strength}</td><td className="risk-text">{item.risk}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
      <div className="split-panels competitor-summary">
        <Panel title="价格 × 结构分布" subtitle="圆点越高代表售价越高">
          <div className="scatter-plot">
            {competitors.map((item, index) => (
              <span key={item.rank} title={`${item.name} ¥${item.price}`} style={{ left: `${8 + index * 9}%`, bottom: `${12 + (item.price - 50) * .58}%` }}>{item.rank}</span>
            ))}
            <div className="axis-label x">低结构差异 → 高结构差异</div>
            <div className="axis-label y">价格</div>
          </div>
        </Panel>
        <Panel title="机会空档" subtitle="不是简单复制畅销品">
          <div className="opportunity-list">
            <div><strong>轻润眼油 + 单珠按摩</strong><p>在眼油的滋润与精华的清爽之间寻找平衡。</p></div>
            <div><strong>专业但不医疗化</strong><p>以测试和结构证据建立信任，不做夸张淡纹承诺。</p></div>
            <div><strong>89元可感知升级</strong><p>包装和触感需明显优于59元价格带。</p></div>
          </div>
        </Panel>
      </div>
    </>
  )
  const aside = (
    <Panel title="竞品结论" subtitle="下一阶段的设计约束" className="sticky-panel">
      <div className="metric-list"><div><span>样本数</span><strong>10</strong></div><div><span>平均售价</span><strong>¥{average}</strong></div><div><span>滚珠结构</span><strong>3款</strong></div></div>
      <dl className="definition-list compact">
        <div><dt>必须进入</dt><dd>便携、按摩、专业感</dd></div>
        <div><dt>必须避开</dt><dd>油腻、廉价感、夸张宣称</dd></div>
        <div><dt>需要验证</dt><dd>89元价格与20ml规格</dd></div>
      </dl>
      <div className="side-note"><Info size={16} /><span>竞品表仅用于定位参考，后续应接入真实商品链接、时间范围和销量口径。</span></div>
    </Panel>
  )
  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, 2)} label="确认竞品结论" note="确认差异方向后，生成三套产品概念。" onConfirm={confirmStage} />} />
}

const conceptScoreLabels = [
  ['demand', '需求强度', '市场、人群和使用场景是否足够明确'],
  ['difference', '差异体验', '用户是否能快速感知方案不一样'],
  ['feasibility', '可行性', '配方、结构和测试路径是否容易推进'],
  ['cost', '成本友好', '价格带能否覆盖成本和打样投入'],
  ['compliance', '合规压力', '功效表达和证据要求是否可控'],
]

const conceptWeightPresets = [
  { id: 'launch', name: '首发转化', note: '需求与差异优先', weights: { demand: 34, difference: 28, feasibility: 16, cost: 12, compliance: 10 } },
  { id: 'cost', name: '成本优先', note: '控制首单风险', weights: { demand: 20, difference: 18, feasibility: 20, cost: 30, compliance: 12 } },
  { id: 'compliance', name: '合规稳妥', note: '降低宣称和测试压力', weights: { demand: 18, difference: 16, feasibility: 22, cost: 14, compliance: 30 } },
]

function conceptOverallScore(concept, weights = defaultConceptWeights) {
  const total = conceptScoreLabels.reduce((sum, [key]) => sum + Number(weights[key] || 0), 0) || 1
  const weighted = conceptScoreLabels.reduce((sum, [key]) => sum + Number(concept.scores?.[key] || 0) * Number(weights[key] || 0), 0)
  return Math.round(weighted / total)
}

function conceptScoreTone(value) {
  if (value >= 82) return 'success'
  if (value >= 70) return 'warning'
  return 'neutral'
}

function conceptVersionLabel(versions) {
  return `V1.${Math.max(0, versions.length)}`
}

function conceptBriefFor(concept, state, score) {
  return {
    conceptId: concept.id,
    generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    score,
    sections: [
      { title: '配方师 brief', items: [`产品方向：${concept.name}，${concept.mechanism}`, `成分方向：${concept.ingredients.join('、')}`, `目标肤感：轻润、低拉扯、眼周可接受。`] },
      { title: '包材 brief', items: ['20ml滚珠结构优先，必须验证倒置密封。', '滚珠顺滑度、出液量、瓶口适配要与内容物一起测试。', '外观需支撑专业轻护理，不做廉价感装饰。'] },
      { title: '测试项目', items: [...concept.proof, ...concept.pilot] },
      { title: '禁止宣称', items: concept.boundaries },
      { title: '要问工厂的问题', items: ['是否有眼部油相或滚珠精华经验？', '能否提供稳定性、相容性和批次追溯资料？', '首轮打样周期、最小起订量和改样次数如何计算？'] },
    ],
  }
}

function conceptBriefText(concept, brief) {
  if (!brief) return ''
  return [
    `${concept.name} 打样任务书`,
    `生成时间：${brief.generatedAt}`,
    `当前评分：${brief.score}`,
    '',
    ...brief.sections.flatMap((section) => [
      `# ${section.title}`,
      ...section.items.map((item) => `- ${item}`),
      '',
    ]),
  ].join('\n')
}

export function ConceptStage({ state, updateState, confirmStage, notify }) {
  const [generating, setGenerating] = useState(false)
  const weights = { ...defaultConceptWeights, ...(state.conceptWeights || {}) }
  const versions = Array.isArray(state.conceptVersions) ? state.conceptVersions : []
  const rankedConcepts = [...concepts].sort((a, b) => conceptOverallScore(b, weights) - conceptOverallScore(a, weights))
  const selected = concepts.find((item) => item.id === state.selectedConcept) || concepts[0]
  const selectedScore = conceptOverallScore(selected, weights)
  const selectedRank = rankedConcepts.findIndex((item) => item.id === selected.id) + 1
  const activeBrief = state.conceptBrief?.conceptId === selected.id ? state.conceptBrief : null
  const addVersion = (type, concept, score, summary, patch = {}) => {
    const nextVersion = {
      id: `concept-${Date.now()}`,
      label: conceptVersionLabel(versions),
      type,
      conceptId: concept.id,
      summary,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      score,
    }
    updateState({ ...patch, conceptVersions: [nextVersion, ...versions].slice(0, 10) })
  }
  const selectConcept = (item) => {
    if (item.id === selected.id) return
    addVersion('切换方案', item, conceptOverallScore(item, weights), `从方案${selected.code}切换为方案${item.code}，用于比较不同打样主线。`, { selectedConcept: item.id })
  }
  const updateWeight = (key, value) => updateState({ conceptWeights: { ...weights, [key]: Number(value) } })
  const applyWeightStrategy = (nextWeights = weights, label = '自定义权重') => {
    const ranked = [...concepts].sort((a, b) => conceptOverallScore(b, nextWeights) - conceptOverallScore(a, nextWeights))
    const top = ranked[0]
    const score = conceptOverallScore(top, nextWeights)
    addVersion('权重策略', top, score, `${label}后，系统推荐方案${top.code} ${top.name}。`, { conceptWeights: nextWeights, selectedConcept: top.id })
  }
  const generateBrief = () => {
    const brief = conceptBriefFor(selected, state, selectedScore)
    addVersion('打样任务书', selected, selectedScore, `生成方案${selected.code}的首轮打样任务书。`, { conceptBrief: brief })
    notify('已生成首轮打样任务书')
  }
  const downloadBrief = () => {
    const text = conceptBriefText(selected, activeBrief)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `打样任务书-方案${selected.code}-${selected.name}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    notify('打样任务书已导出')
  }
  const regenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      addVersion('重新生成', selected, selectedScore, `沿用当前权重重新评估三套概念，当前仍选方案${selected.code}。`)
      notify('已结合当前证据重新生成三套概念')
    }, 900)
  }
  const main = (
    <>
      <StageHeading title="产品功能概念策划" description="把人群痛点转成成分、结构、机制与验证任务，先做可比较的方案，再决定打样主线。" actions={<Button variant="secondary" icon={RefreshCw} onClick={regenerate} disabled={generating}>{generating ? '生成中...' : '重新生成'}</Button>} />
      <div className={`concept-grid ${generating ? 'is-loading' : ''}`}>
        {concepts.map((item) => (
          <button key={item.id} className={`concept-card ${item.id === selected.id ? 'selected' : ''}`} onClick={() => selectConcept(item)}>
            <div className="concept-code">方案 {item.code}<span>排序 #{rankedConcepts.findIndex((concept) => concept.id === item.id) + 1}</span>{item.id === selected.id && <Check size={16} />}</div>
            <h2>{item.name}</h2><p className="concept-tagline">{item.tagline}</p>
            <div className="concept-score-mini"><strong>{conceptOverallScore(item, weights)}</strong><span>加权评分</span><Status tone={conceptScoreTone(conceptOverallScore(item, weights))}>{item.decision}</Status></div>
            <dl><div><dt>适配人群</dt><dd>{item.fit}</dd></div><div><dt>售价/成本</dt><dd>¥{item.price} / ¥{item.cost}</dd></div><div><dt>作用逻辑</dt><dd>{item.mechanism}</dd></div></dl>
            <div className="token-list">{item.ingredients.map((value) => <span key={value}>{value}</span>)}</div>
            <div className="concept-risk"><CircleAlert size={15} /><span>{item.risk}</span></div>
          </button>
        ))}
      </div>
      <Panel title="权重策略" subtitle="不同经营目标会改变方案排序，拖动后实时重算，也可一键套用策略。">
        <div className="concept-weight-panel">
          <div className="concept-weight-presets">
            {conceptWeightPresets.map((preset) => <button key={preset.id} onClick={() => applyWeightStrategy(preset.weights, preset.name)}><strong>{preset.name}</strong><span>{preset.note}</span></button>)}
          </div>
          <div className="concept-weight-sliders">
            {conceptScoreLabels.map(([key, label, help]) => (
              <label key={key}>
                <span><strong>{label}</strong><small>{help}</small></span>
                <input type="range" min="0" max="40" value={weights[key]} onChange={(event) => updateWeight(key, event.target.value)} />
                <em>{weights[key]}</em>
              </label>
            ))}
          </div>
          <div className="concept-weight-actions">
            <Button variant="secondary" icon={RefreshCw} onClick={() => updateState({ conceptWeights: { ...defaultConceptWeights } })}>恢复默认</Button>
            <Button icon={Check} onClick={() => applyWeightStrategy(weights, '自定义权重')}>应用并记录</Button>
          </div>
        </div>
      </Panel>
      <Panel title="概念评分矩阵" subtitle="先比较需求、体验、研发、成本和合规，再决定哪个方案进入打样。">
        <div className="table-wrap concept-score-table">
          <table>
            <thead><tr><th>方案</th><th>综合</th>{conceptScoreLabels.map(([, label]) => <th key={label}>{label}</th>)}<th>决策建议</th></tr></thead>
            <tbody>
              {rankedConcepts.map((item) => (
                <tr key={item.id} className={item.id === selected.id ? 'selected-row clickable-row' : 'clickable-row'} onClick={() => selectConcept(item)}>
                  <td className="cell-strong">方案{item.code} {item.name}</td>
                  <td><strong>{conceptOverallScore(item, weights)}</strong></td>
                  {conceptScoreLabels.map(([key]) => <td key={key}><span className="score-pill" title={item.scoreReasons[key]} style={{ '--score': `${item.scores[key]}%` }}>{item.scores[key]}</span></td>)}
                  <td>{item.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="评分依据" subtitle={`当前方案排名 #${selectedRank}，每个分数都保留可质疑的理由。`}>
        <div className="concept-reason-grid">
          {conceptScoreLabels.map(([key, label]) => <div key={key}><strong>{label}<em>{selected.scores[key]}</em></strong><p>{selected.scoreReasons[key]}</p></div>)}
        </div>
      </Panel>
      <Panel title="概念验证清单" subtitle="选中方案进入下一阶段前，先确认需要拿到什么证据">
        <div className="validation-grid">
          {selected.proof.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong><p>{index === 0 ? '由配方与用户测试共同验证' : index === 1 ? '进入包材打样验收标准' : '纳入量产前阶段门'}</p></div>)}
        </div>
      </Panel>
      <div className="split-panels concept-execution-grid">
        <Panel title="首轮小试任务" subtitle="把概念变成可验收样品，而不是停留在卖点。">
          <div className="concept-task-list">{selected.pilot.map((item, index) => <div key={item}><FlaskConical size={16} /><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>)}</div>
        </Panel>
        <Panel title="开发边界" subtitle="这些内容需要写入配方、合规和内容评审。">
          <div className="concept-boundary-list">{selected.boundaries.map((item) => <div key={item}><CircleAlert size={16} /><span>{item}</span></div>)}</div>
        </Panel>
      </div>
      <Panel title="打样任务书" subtitle={activeBrief ? `已生成 · ${activeBrief.generatedAt}` : '一键生成可发给配方、包材和工厂的首轮 brief。'} action={<><Button variant="secondary" icon={ClipboardList} onClick={generateBrief}>{activeBrief ? '重新生成' : '生成任务书'}</Button>{activeBrief && <Button variant="secondary" icon={Download} onClick={downloadBrief}>导出TXT</Button>}</>}>
        {activeBrief ? <div className="concept-brief-grid">
          {activeBrief.sections.map((section) => <div key={section.title}><h3>{section.title}</h3>{section.items.map((item) => <p key={item}>{item}</p>)}</div>)}
        </div> : <div className="concept-brief-empty"><FlaskConical size={18} /><strong>等待生成任务书</strong><span>生成后会写入版本记录，并同步保存到当前项目。</span></div>}
      </Panel>
    </>
  )
  const aside = (
    <Panel title="概念决策" subtitle="当前选中的产品雏形" className="sticky-panel">
      <div className="selection-summary concept-decision-head"><span className="selection-index">方案 {selected.code} · 排名 #{selectedRank}</span><h2>{selected.name}</h2><p>{selected.tagline}</p><div className="concept-score-large"><strong>{selectedScore}</strong><span>加权评分</span></div></div>
      <dl className="definition-list compact"><div><dt>目标人群</dt><dd>{selected.fit}</dd></div><div><dt>建议售价</dt><dd>¥{selected.price}</dd></div><div><dt>目标成本</dt><dd>¥{selected.cost}以内</dd></div><div><dt>核心成分方向</dt><dd>{selected.ingredients.join('、')}</dd></div></dl>
      <div className="concept-score-stack">
        {conceptScoreLabels.map(([key, label]) => <div key={key}><span>{label}</span><div><i style={{ width: `${selected.scores[key]}%` }} /></div><strong>{selected.scores[key]}</strong></div>)}
      </div>
      <div className="concept-evidence-list">
        <strong><ShieldCheck size={15} />支持证据</strong>
        {selected.evidence.map((item) => <p key={item}>{item}</p>)}
      </div>
      <div className="concept-version-list">
        <strong><ClipboardList size={15} />版本记录</strong>
        {versions.slice(0, 4).map((version) => {
          const concept = concepts.find((item) => item.id === version.conceptId) || concepts[0]
          return <div key={version.id}><span>{version.label}</span><p>{version.type} · 方案{concept.code} · {version.score ?? conceptOverallScore(concept, weights)}分</p><small>{version.summary}</small></div>
        })}
      </div>
      <div className="side-note warning"><CircleAlert size={16} /><span>成分仅为策划方向，最终配方、用量、稳定性和宣称必须由专业人员确认。</span></div>
    </Panel>
  )
  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, 3)} label="确认产品概念" note={`当前选择：方案${selected.code} ${selected.name}`} onConfirm={confirmStage} />} />
}

export function PositioningStage({ state, updateState, confirmStage }) {
  const selectedConcept = concepts.find((item) => item.id === state.selectedConcept) || concepts[0]
  const selected = positioningOptions.find((item) => item.id === state.selectedPositioning) || positioningOptions[0]
  const main = (
    <>
      <StageHeading title="产品定位" description="确定打动哪类人、以什么价格、用哪一句话进入市场。" />
      <div className="positioning-list">
        {positioningOptions.map((item) => (
          <button key={item.id} className={`positioning-row ${item.id === selected.id ? 'selected' : ''}`} onClick={() => updateState({ selectedPositioning: item.id, assumptions: { ...state.assumptions, price: Number(item.price.split('-')[0]) + 10 } })}>
            <span className="radio-mark">{item.id === selected.id && <span />}</span><div><h2>{item.name}</h2><p>{item.statement}</p></div><dl><div><dt>价格带</dt><dd>{item.price}</dd></div><div><dt>主渠道</dt><dd>{item.channel}</dd></div><div><dt>表达气质</dt><dd>{item.tone}</dd></div></dl>
          </button>
        ))}
      </div>
      <Panel title="一句话卖点编辑" subtitle="描述真实价值，不写无法证明的结果">
        <div className="copy-editor">
          <textarea value={selectedConcept.tagline} readOnly />
          <div className="copy-rules"><span><Check size={14} />包含使用体验</span><span><Check size={14} />符合核心人群</span><span><CircleAlert size={14} />功效词待合规确认</span></div>
        </div>
      </Panel>
      <Panel title="渠道表达重点">
        <div className="channel-table">
          <div><strong>小红书</strong><span>场景与使用仪式</span><p>展示滚珠按摩、妆前兼容与便携使用。</p></div>
          <div><strong>抖音</strong><span>即时可感知体验</span><p>强调滚珠触感、轻润质地和真实测试。</p></div>
          <div><strong>天猫</strong><span>信息完整与信任</span><p>补足成分、测试、结构和售后说明。</p></div>
        </div>
      </Panel>
    </>
  )
  const aside = (
    <Panel title="定位结果" subtitle="用于包装与内容设计的统一约束" className="sticky-panel">
      <div className="selection-summary"><span className="selection-index">{selected.name}</span><h2>{selectedConcept.tagline}</h2><p>{selected.statement}</p></div>
      <dl className="definition-list compact"><div><dt>核心人群</dt><dd>{selectedConcept.fit}</dd></div><div><dt>建议零售价</dt><dd>¥{state.assumptions.price}</dd></div><div><dt>目标成本</dt><dd>¥{selectedConcept.cost}以内</dd></div><div><dt>表达气质</dt><dd>{selected.tone}</dd></div></dl>
    </Panel>
  )
  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, 4)} label="确认产品定位" note={`当前定位：${selected.name}`} onConfirm={confirmStage} />} />
}

export function PackagingStage({ state, updateState, confirmStage, notify, openAiSettings }) {
  const selected = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
  const twoDConfirmed = Boolean(state.packagingDesign?.confirmed2D)
  const gateChecks = Array.isArray(state.packagingDesign?.gateChecks) ? state.packagingDesign.gateChecks : []
  const gateReady = packagingGateItems.every((item) => gateChecks.includes(item.id))
  const packagingReady = twoDConfirmed && gateReady
  const stageDone = isDone(state, 5) && packagingReady
  const fallback = <div className="packaging-loading"><span className="ai-spinner" /><strong>正在载入AI包装设计工作台</strong></div>
  const main = <Suspense fallback={fallback}><PackagingStudio state={state} updateState={updateState} confirmStage={confirmStage} notify={notify} openAiSettings={openAiSettings} /></Suspense>
  return <><div className="packaging-workspace-main">{main}</div><ConfirmBar done={stageDone} disabled={!packagingReady} label="确认包装方案" note={packagingReady ? `2D已确认 · ${gateChecks.length}/${packagingGateItems.length}项验收通过 · 当前包材：${selected.name}` : `请先完成2D确认与打样前验收（${gateChecks.length}/${packagingGateItems.length}）。`} onConfirm={confirmStage} /></>
}

function supplierSearchText(supplier) {
  return `${supplier.name}${supplier.type}${supplier.region}${supplier.capabilities.join('')}${supplier.tags.join('')}${supplier.note || ''}`.toLowerCase()
}

function supplierNameKey(name) {
  return String(name || '').replace(/[（(].*?[）)]/g, '').replace(/有限公司|集团|包装制品厂|包装材料有限公司|科技有限公司|生物科技有限公司/g, '').replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '').toLowerCase()
}

function matchQuality(supplier, item) {
  const text = supplierSearchText(supplier)
  const hits = (item.matchTerms || item.keywords || []).filter((term) => text.includes(term.toLowerCase())).length
  const hasBlockingNote = /不是滚珠|不是眼油|需重新确认|需确认20ml|仅作.*参考/.test(supplier.note || '')
  const exact = supplier.fit.includes(item.id) && hits >= Math.min(3, (item.matchTerms || []).length || 2) && !hasBlockingNote
  const related = supplier.fit.includes(item.id) && hits > 0
  if (exact) return '精准匹配'
  if (related) return '相关参考'
  return '待核验'
}

function matchScore(supplier, item) {
  const quality = matchQuality(supplier, item)
  const qualityScore = quality === '精准匹配' ? 62 : quality === '相关参考' ? 35 : 18
  const moq = supplier.moq == null ? 2 : supplier.moq <= item.moq ? 12 : 4
  const risk = supplier.risk === '低' ? 8 : supplier.risk === '中' ? 4 : 1
  const rating = supplier.rating == null ? 0 : Math.round(supplier.rating * 2)
  const source = supplier.source?.includes('供应商信息表') ? 4 : 0
  return Math.min(99, qualityScore + moq + rating + risk + source)
}

function qualityTone(quality) {
  return quality === '精准匹配' ? 'success' : quality === '相关参考' ? 'warning' : 'neutral'
}

function supplierQuote(supplier, item) {
  return typeof supplier.price === 'number' ? supplier.price : item.targetCost
}

function supplierPriceLabel(supplier) {
  return supplier.priceLabel || (typeof supplier.price === 'number' ? `¥${supplier.price.toFixed(2)}` : '待询价')
}

function supplierMoqLabel(supplier) {
  return supplier.moqLabel || (supplier.moq == null ? '待确认' : supplier.moq.toLocaleString())
}

function supplierKey(itemId, supplierId) {
  return `${itemId}:${supplierId}`
}

const supplierStatuses = ['待询价', '已发送', '已报价', '已寄样', '样品合格', '小批试产', '量产供应商']

function supplierForItem(state, item, library = supplierLibrary) {
  return library.find((supplier) => supplier.id === state.supplierSelections?.[item.id])
    || library.find((supplier) => supplier.fit.includes(item.id))
    || library[0]
}

export function FactoryStage({ state, updateState, confirmStage, notify }) {
  const [selectedItemId, setSelectedItemId] = useState('formula')
  const [groupFilter, setGroupFilter] = useState('全部')
  const [query, setQuery] = useState('')
  const [qualityFilter, setQualityFilter] = useState('全部')
  const [compareOpen, setCompareOpen] = useState(false)
  const [rfqOpen, setRfqOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryType, setLibraryType] = useState('全部')
  const [libraryMissingOnly, setLibraryMissingOnly] = useState(false)
  const [supplierImportOpen, setSupplierImportOpen] = useState(false)
  const [supplierImportPreview, setSupplierImportPreview] = useState(null)
  const supplierFileInput = useRef(null)
  const [matching, setMatching] = useState(false)
  const packaging = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
  const selectedItem = sourcingItems.find((item) => item.id === selectedItemId) || sourcingItems[0]
  const activeSupplierLibrary = state.supplierLibraryOverride?.length ? state.supplierLibraryOverride : supplierLibrary
  const selectedSupplier = supplierForItem(state, selectedItem, activeSupplierLibrary)
  const workbench = state.supplierWorkbench || {}
  const selectedRows = sourcingItems.map((item) => ({ item, supplier: supplierForItem(state, item, activeSupplierLibrary) }))
  const quoteFor = (supplier, item) => {
    const adjustment = Number(workbench.quoteAdjustments?.[supplierKey(item.id, supplier.id)] || 0)
    const quote = supplierQuote(supplier, item)
    return Math.max(0, quote + adjustment)
  }
  const baseTotal = selectedRows.reduce((sum, row) => sum + quoteFor(row.supplier, row.item), 0)
  const costModel = { taxRate: 0, shipping: 0, tooling: 0, wasteRate: 0, ...(workbench.costModel || {}) }
  const landedBeforeTax = baseTotal + Number(costModel.shipping || 0) + Number(costModel.tooling || 0) / Math.max(1, selectedItem.moq)
  const total = landedBeforeTax * (1 + Number(costModel.wasteRate || 0) / 100) * (1 + Number(costModel.taxRate || 0) / 100)
  const matchedCount = selectedRows.filter(({ item, supplier }) => state.supplierSelections?.[item.id] === supplier.id).length
  const shortlist = workbench.shortlist?.[selectedItem.id] || []
  const backups = workbench.backups?.[selectedItem.id] || []
  const compareIds = Array.from(new Set([selectedSupplier.id, ...shortlist, ...backups])).slice(0, 4)
  const candidates = useMemo(() => activeSupplierLibrary
    .filter((supplier) => supplier.fit.includes(selectedItem.id))
    .filter((supplier) => qualityFilter === '全部' || matchQuality(supplier, selectedItem) === qualityFilter)
    .filter((supplier) => supplierSearchText(supplier).includes(query.toLowerCase()))
    .sort((a, b) => matchScore(b, selectedItem) - matchScore(a, selectedItem)), [activeSupplierLibrary, query, selectedItem, qualityFilter])
  const groups = ['全部', ...new Set(sourcingItems.map((item) => item.group))]
  const visibleItems = groupFilter === '全部' ? sourcingItems : sourcingItems.filter((item) => item.group === groupFilter)
  const compareSuppliers = compareIds.map((id) => activeSupplierLibrary.find((supplier) => supplier.id === id)).filter(Boolean)
  const sourceRecords = activeSupplierLibrary.filter((supplier) => supplier.sourceType)
  const libraryMeta = state.supplierLibraryMeta || supplierSourceStats
  const libraryRows = sourceRecords
    .filter((supplier) => libraryType === '全部' || supplier.sourceType === libraryType)
    .filter((supplier) => !libraryMissingOnly || supplier.missing?.length)
    .filter((supplier) => supplierSearchText(supplier).includes(libraryQuery.toLowerCase()) || `${supplier.source}${supplier.sourceRow}`.toLowerCase().includes(libraryQuery.toLowerCase()))
  const sourceTypeLabel = (type) => type === 'packaging' ? '包材' : type === 'oem' ? '代加工' : '成品'
  const updateWorkbench = (patch) => updateState({ supplierWorkbench: { ...workbench, ...patch } })
  const updateList = (field, supplierId) => {
    const current = workbench[field]?.[selectedItem.id] || []
    const next = current.includes(supplierId) ? current.filter((id) => id !== supplierId) : [...current, supplierId]
    updateWorkbench({ [field]: { ...workbench[field], [selectedItem.id]: next } })
  }
  const toggleCompare = (supplierId) => {
    if (compareIds.includes(supplierId)) {
      updateWorkbench({
        shortlist: { ...workbench.shortlist, [selectedItem.id]: (workbench.shortlist?.[selectedItem.id] || []).filter((id) => id !== supplierId) },
        backups: { ...workbench.backups, [selectedItem.id]: (workbench.backups?.[selectedItem.id] || []).filter((id) => id !== supplierId) },
      })
      return
    }
    if (compareIds.length >= 4) {
      notify('最多对比4家供应商')
      return
    }
    updateList('shortlist', supplierId)
  }
  const statusFor = (supplier) => workbench.statuses?.[supplierKey(selectedItem.id, supplier.id)] || (supplier.id === selectedSupplier.id ? '已报价' : '待询价')
  const setStatus = (supplier, status) => updateWorkbench({ statuses: { ...workbench.statuses, [supplierKey(selectedItem.id, supplier.id)]: status } })
  const setItemNote = (value) => updateWorkbench({ notes: { ...workbench.notes, [selectedItem.id]: value } })
  const setCostModel = (key, value) => updateWorkbench({ costModel: { ...costModel, [key]: Number(value) || 0 } })
  const selectSupplier = (supplier) => {
    if (supplier.price == null) {
      if (!shortlist.includes(supplier.id)) updateList('shortlist', supplier.id)
      notify(`${supplier.name}暂无报价，已保留为待询价候选`)
      return
    }
    updateState({ supplierSelections: { ...state.supplierSelections, [selectedItem.id]: supplier.id } })
    updateWorkbench({ shortlist: { ...workbench.shortlist, [selectedItem.id]: Array.from(new Set([...shortlist, supplier.id])) }, statuses: { ...workbench.statuses, [supplierKey(selectedItem.id, supplier.id)]: '已报价' } })
    notify(`已将${supplier.name}加入${selectedItem.name}的供应商组合`)
  }
  const downloadRfq = () => {
    const targets = compareSuppliers.length ? compareSuppliers : [selectedSupplier]
    const text = [
      `眼部精华油项目询价单`,
      `开发物料：${selectedItem.name}`,
      `规格要求：${selectedItem.spec}`,
      `首单数量：${selectedItem.moq.toLocaleString()}件`,
      `目标成本：¥${selectedItem.targetCost.toFixed(2)} / 件`,
      `必须确认：${selectedItem.mustHave.join('、')}`,
      '',
      ...targets.map((supplier, index) => `${index + 1}. ${supplier.name}\n联系人：${supplier.contact || '待补充'}\n请报价：样品价、大货阶梯价（${selectedItem.moq.toLocaleString()} / 5000 / 10000件）、含税含运价、打样周期、大货周期、开模或工艺费。`),
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `询价单-${selectedItem.name}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setRfqOpen(true)
    notify(`已生成${targets.length}家供应商的询价单`)
  }
  const refreshMatches = () => {
    setMatching(true)
    window.setTimeout(() => {
      setMatching(false)
      notify('已按当前规格、MOQ和历史表现刷新匹配结果')
    }, 550)
  }
  const handleSupplierFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    try {
      const parsed = await parseSupplierFiles(files)
      const nextLibrary = mergeSupplierLibrary(supplierLibrary, parsed.records)
      setSupplierImportPreview({ ...parsed, nextLibrary })
      setSupplierImportOpen(true)
    } catch (error) {
      notify(`供应商库导入失败：${error.message}`)
    }
  }
  const applySupplierImport = () => {
    if (!supplierImportPreview) return
    const { nextLibrary, ...meta } = supplierImportPreview
    const historyEntry = {
      id: `supplier-import-${Date.now()}`,
      importedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      fileNames: meta.fileNames,
      rawRecords: meta.rawRecords,
      libraryRecords: meta.libraryRecords,
    }
    updateState({ supplierLibraryOverride: nextLibrary, supplierLibraryMeta: meta, supplierLibraryHistory: [historyEntry, ...(state.supplierLibraryHistory || [])].slice(0, 10) })
    setSupplierImportPreview(null)
    setSupplierImportOpen(false)
    notify(`已更新供应商库：${meta.libraryRecords}条去重记录`)
  }
  const main = (
    <>
      <StageHeading title="落地工厂" description="将内容物、包材、包装与检测拆成寻源任务，从供应商库匹配可执行的候选组合。" actions={<><input ref={supplierFileInput} className="visually-hidden" type="file" accept=".xlsx,.xls" multiple onChange={handleSupplierFiles} /><Button variant="secondary" icon={FileSpreadsheet} onClick={() => supplierFileInput.current?.click()}>更新供应商库</Button><Button variant="secondary" icon={Database} onClick={() => setLibraryOpen((value) => !value)}>{libraryOpen ? '返回匹配' : `供应商库（${sourceRecords.length}）`}</Button><Button variant="secondary" icon={ClipboardList} onClick={() => setRfqOpen((value) => !value)}>询价单</Button><Button variant="secondary" icon={RefreshCw} onClick={refreshMatches}>{matching ? '匹配中…' : '重新匹配'}</Button></>} />
      <div className="supplier-summary">
        <div className="supplier-summary-card"><span><Boxes size={16} />开发物料</span><strong>{sourcingItems.length}<small>项</small></strong><em>内料、包材、包装、检测</em></div>
        <div className="supplier-summary-card"><span><Building2 size={16} />已匹配供应商</span><strong>{matchedCount}<small>/{sourcingItems.length}</small></strong><em>当前方案已有候选</em></div>
        <div className="supplier-summary-card"><span><CircleDollarSign size={16} />预估综合成本</span><strong>¥{total.toFixed(2)}<small>/件</small></strong><em>目标 ¥{state.assumptions.targetCost}以内</em></div>
        <div className="supplier-summary-card"><span><ShieldCheck size={16} />待推进事项</span><strong>{selectedRows.filter(({ item, supplier }) => matchQuality(supplier, item) !== '精准匹配').length + Object.values(workbench.statuses || {}).filter((status) => status === '待询价').length}<small>项</small></strong><em>匹配、询价或核验</em></div>
      </div>
      {supplierImportOpen && supplierImportPreview && <Panel title="供应商库更新预览" subtitle="请先核对文件和去重结果，确认后才会替换当前供应商库。" className="supplier-import-preview" action={<div className="panel-actions"><Button variant="secondary" onClick={() => { setSupplierImportOpen(false); setSupplierImportPreview(null) }}>取消</Button><Button onClick={applySupplierImport} icon={CheckCircle2}>确认更新</Button></div>}>
        <div className="supplier-import-files">{supplierImportPreview.fileNames.map((name) => <span key={name}><FileSpreadsheet size={15} />{name}</span>)}</div>
        <div className="supplier-library-stats"><span>原始记录 <b>{supplierImportPreview.rawRecords}</b></span><span>去重后入库 <b>{supplierImportPreview.libraryRecords}</b></span><span>供应商名称 <b>{supplierImportPreview.uniqueNames}</b></span><span>包材 <b>{supplierImportPreview.sourceCounts.packaging || 0}</b></span><span>代加工 <b>{supplierImportPreview.sourceCounts.oem || 0}</b></span><span>成品 <b>{supplierImportPreview.sourceCounts.finished || 0}</b></span></div>
      </Panel>}
      {libraryOpen && <Panel title="供应商库" subtitle={`三份供应商表共 ${libraryMeta.rawRecords} 条原始记录，去重后入库 ${sourceRecords.length} 条；保留原始行号和缺失字段。`} className="supplier-library-panel">
        <div className="supplier-library-toolbar"><div className="supplier-library-types">{['全部', 'packaging', 'oem', 'finished'].map((type) => <button key={type} className={libraryType === (type === '全部' ? '全部' : type) ? 'active' : ''} onClick={() => setLibraryType(type === '全部' ? '全部' : type)}>{type === '全部' ? '全部' : sourceTypeLabel(type)}</button>)}</div><label className="supplier-missing-toggle"><input type="checkbox" checked={libraryMissingOnly} onChange={(event) => setLibraryMissingOnly(event.target.checked)} />只看待补字段</label><SearchInput value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="搜索供应商、产品、来源行" /></div>
        <div className="supplier-library-stats"><span><Database size={14} />原始表格记录 <b>{libraryMeta.rawRecords}</b></span><span>去重后入库 <b>{sourceRecords.length}</b></span><span>当前筛选 <b>{libraryRows.length}</b></span><span>去重后供应商 <b>{libraryMeta.uniqueNames}</b></span><span><Filter size={14} />缺失字段 <b>{sourceRecords.filter((supplier) => supplier.missing?.length).length}</b></span></div>
        {state.supplierLibraryHistory?.length > 0 && <details className="supplier-history"><summary>最近更新记录（{state.supplierLibraryHistory.length}）</summary><div className="supplier-history-list">{state.supplierLibraryHistory.map((entry) => <div key={entry.id}><strong>{entry.importedAt}</strong><span>{entry.fileNames.join('、')}</span><em>{entry.rawRecords}条原始 · {entry.libraryRecords}条入库</em></div>)}</div></details>}
        <div className="table-wrap supplier-library-table"><table><thead><tr><th>供应商</th><th>来源类型</th><th>产品 / 品类</th><th>报价</th><th>MOQ</th><th>交期</th><th>联系方式</th><th>完整性</th><th>原始来源</th></tr></thead><tbody>{libraryRows.slice(0, 80).map((supplier) => <tr key={supplier.id}><td className="cell-strong">{supplier.name}</td><td>{sourceTypeLabel(supplier.sourceType)}</td><td>{supplier.product || supplier.capabilities.join('、')}</td><td>{supplierPriceLabel(supplier)}</td><td>{supplierMoqLabel(supplier)}</td><td>{supplier.lead} / {supplier.bulkLead}</td><td className="contact-cell">{supplier.contact || '待补充'}</td><td><Status tone={supplier.missing?.length ? 'warning' : 'success'}>{supplier.missing?.length ? `缺${supplier.missing.length}项` : '字段齐全'}</Status></td><td><small>{supplier.source} · 第{supplier.sourceRow}行</small></td></tr>)}</tbody></table></div>
        {libraryRows.length > 80 && <div className="supplier-library-limit">当前展示前80条，使用搜索或类型筛选查看其余记录。</div>}
      </Panel>}
      {rfqOpen && <Panel title="本次询价单" subtitle="根据当前物料规格和候选供应商自动生成，可下载后发送。" className="rfq-panel" action={<Button variant="secondary" icon={Send} onClick={downloadRfq}>下载询价单</Button>}>
        <div className="rfq-preview"><div><strong>{selectedItem.name}</strong><span>{selectedItem.spec} · 首单{selectedItem.moq.toLocaleString()}件</span></div><div><span>询价对象</span><strong>{compareSuppliers.length ? `${compareSuppliers.length}家对比候选` : selectedSupplier.name}</strong></div><div><span>必须确认</span><strong>{selectedItem.mustHave.join(' · ')}</strong></div></div>
      </Panel>}
      <Panel title="开发物料寻源" subtitle="先选物料，再查看供应商库的匹配候选。">
        <div className="supplier-toolbar">
          <div className="supplier-group-filter">{groups.map((group) => <button key={group} className={group === groupFilter ? 'active' : ''} onClick={() => setGroupFilter(group)}>{group}</button>)}</div>
          <span className="supplier-toolbar-note"><ShieldCheck size={14} />匹配依据：规格、MOQ、交期、历史表现</span>
        </div>
        <div className="supplier-layout">
          <div className="sourcing-item-list">
            {visibleItems.map((item) => {
              const supplier = supplierForItem(state, item)
              const active = item.id === selectedItem.id
              return <button key={item.id} className={`sourcing-item ${active ? 'selected' : ''}`} onClick={() => setSelectedItemId(item.id)}>
                <span className="sourcing-item-icon"><Boxes size={17} /></span>
                <span className="sourcing-item-copy"><strong>{item.name}</strong><small>{item.group} · {item.spec}</small><em>目标 ¥{item.targetCost.toFixed(2)} · MOQ {item.moq}</em></span>
                <span className="sourcing-item-status"><Status tone={supplier.risk === '低' ? 'success' : 'warning'}>{supplier.risk === '低' ? '已匹配' : '需关注'}</Status><ChevronRight size={16} /></span>
              </button>
            })}
          </div>
          <div className="supplier-match-panel">
            <div className="supplier-match-head"><div><span className="eyebrow">{selectedItem.group} / {selectedItem.id.toUpperCase()}</span><h3>{selectedItem.name}</h3><p>{selectedItem.spec} · 目标成本 ¥{selectedItem.targetCost.toFixed(2)} / 件 · 期望MOQ {selectedItem.moq}</p></div><div className="selected-supplier-chip"><Check size={15} />当前：{selectedSupplier.name}</div></div>
            <div className="supplier-requirement-strip"><div><span>必须满足</span>{selectedItem.mustHave.map((requirement) => <em key={requirement}>{requirement}</em>)}</div><small>报价缺失时只进入询价，不会计入成本</small></div>
            <div className="supplier-work-note"><label><span>采购备注</span><input value={workbench.notes?.[selectedItem.id] || ''} placeholder="记录供应商回复、样品问题或下一步动作" onChange={(event) => setItemNote(event.target.value)} /></label><small>备注会随项目自动保存</small></div>
            <div className="supplier-match-controls"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索供应商、能力或地区" /><div className="supplier-filter-actions">{['全部', '精准匹配', '相关参考', '待核验'].map((filter) => <button key={filter} className={qualityFilter === filter ? 'active' : ''} onClick={() => setQualityFilter(filter)}>{filter}</button>)}<span>{candidates.length} 家</span></div></div>
            <div className="supplier-candidate-grid">
              {candidates.length ? candidates.map((supplier) => {
                const selected = supplier.id === selectedSupplier.id
                const score = matchScore(supplier, selectedItem)
                const quality = matchQuality(supplier, selectedItem)
                const shortlisted = shortlist.includes(supplier.id)
                const backedUp = backups.includes(supplier.id)
                const compareSelected = compareIds.includes(supplier.id)
                return <div className={`supplier-card ${selected ? 'selected' : ''}`} key={supplier.id}>
                  <div className="supplier-card-top"><div><strong>{supplier.name}</strong><small>{supplier.type}</small></div><div className="supplier-card-score"><Status tone={qualityTone(quality)}>{quality}</Status><div className="match-score"><b>{score}</b><span>匹配度</span></div></div></div>
                  <div className="supplier-card-meta"><span><MapPin size={14} />{supplier.region}</span><span><Truck size={14} />打样 {supplier.lead} · 大货 {supplier.bulkLead || '待确认'}</span><span><CircleDollarSign size={14} />{supplierPriceLabel(supplier)} / 件</span></div>
                  <div className="supplier-stat-row"><span>历史评分 <b>{supplier.rating ?? '未记录'}</b></span><span>交付准时 <b>{supplier.onTimeRate == null ? '未记录' : `${supplier.onTimeRate}%`}</b></span><span>质检通过 <b>{supplier.passRate == null ? '未记录' : `${supplier.passRate}%`}</b></span></div>
                  <div className="supplier-tags">{supplier.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <p className="supplier-note">{supplier.note}</p>
                  <small className="supplier-source">来源：{supplier.source} · 联系方式：{supplier.contact || '未记录'}</small>
                  <div className="supplier-card-bottom"><Status tone={supplier.risk === '低' ? 'success' : 'warning'}>{supplier.risk} · MOQ {supplierMoqLabel(supplier)}</Status><select className="supplier-status-select" value={statusFor(supplier)} onChange={(event) => setStatus(supplier, event.target.value)} aria-label={`${supplier.name}询价状态`}>{supplierStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
                  <div className="supplier-card-actions"><button className={shortlisted ? 'supplier-action active' : 'supplier-action'} onClick={() => updateList('shortlist', supplier.id)}><Star size={14} />{shortlisted ? '已入短名单' : '加入短名单'}</button><button className={backedUp ? 'supplier-action active' : 'supplier-action'} onClick={() => updateList('backups', supplier.id)}><ShieldCheck size={14} />{backedUp ? '已设为备选' : '设为备选'}</button><label className="supplier-compare-check"><input type="checkbox" checked={compareSelected} onChange={() => { toggleCompare(supplier.id); setCompareOpen(true) }} />加入对比</label><Button disabled={!selected && supplier.price == null} variant={selected ? 'secondary' : 'primary'} icon={selected ? Check : supplier.price == null ? Info : ChevronRight} onClick={() => selectSupplier(supplier)}>{selected ? '当前方案' : supplier.price == null ? '先去询价' : '选用此供应商'}</Button></div>
                </div>
              }) : <div className="supplier-empty"><Search size={19} /><strong>没有找到匹配供应商</strong><span>试试搜索供应商名称、能力标签或地区。</span></div>}
            </div>
          </div>
        </div>
      </Panel>
      {compareOpen && <Panel title="候选供应商对比" subtitle="最多保留4家，适合在询价前确定主选与备选。" action={<Button variant="secondary" icon={GitCompare} onClick={downloadRfq}>生成对比询价单</Button>}>
        <div className="table-wrap supplier-compare-table"><table><thead><tr><th>供应商</th><th>匹配等级</th><th>报价</th><th>MOQ</th><th>打样 / 大货</th><th>风险</th><th>询价状态</th></tr></thead><tbody>{compareSuppliers.map((supplier) => <tr key={supplier.id}><td className="cell-strong">{supplier.name}</td><td><Status tone={qualityTone(matchQuality(supplier, selectedItem))}>{matchQuality(supplier, selectedItem)}</Status></td><td>{supplierPriceLabel(supplier)}</td><td>{supplierMoqLabel(supplier)}</td><td>{supplier.lead} / {supplier.bulkLead || '待确认'}</td><td>{supplier.risk}</td><td><select className="supplier-status-select" value={statusFor(supplier)} onChange={(event) => setStatus(supplier, event.target.value)}>{supplierStatuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>
        <div className="supplier-compare-note"><Info size={15} />当前主供应商：{selectedSupplier.name}。建议至少保留1家已确认结构和价格的备选。</div>
      </Panel>}
      <Panel title="当前组合方案" subtitle="选中的供应商将同步到成本拆分、产品卡和导出方案。">
        <div className="table-wrap supplier-solution-table"><table><thead><tr><th>类别</th><th>开发项</th><th>主供应商</th><th>单件</th><th>MOQ</th><th>交期</th><th>匹配 / 风险</th></tr></thead><tbody>{selectedRows.map(({ item, supplier }) => <tr key={item.id} className="clickable-row" onClick={() => setSelectedItemId(item.id)}><td>{item.group}</td><td className="cell-strong">{item.name}</td><td>{supplier.name}<small className="table-subline">备选 {((workbench.backups?.[item.id] || []).length)}家 · {workbench.statuses?.[supplierKey(item.id, supplier.id)] || '已报价'}</small></td><td>¥{quoteFor(supplier, item).toFixed(2)}</td><td>{supplierMoqLabel(supplier)}</td><td>{supplier.lead}</td><td><Status tone={qualityTone(matchQuality(supplier, item))}>{matchQuality(supplier, item)}</Status></td></tr>)}</tbody></table></div>
      </Panel>
      <div className="split-panels factory-panels">
        <Panel title="成本拆分" subtitle={`落地估算 ¥${total.toFixed(2)} / 件`}><div className="cost-stack">{selectedRows.map(({ item, supplier }) => <div key={item.id}><span>{item.name}</span><div><i style={{ width: `${quoteFor(supplier, item) / Math.max(baseTotal, 0.01) * 100}%` }} /></div><strong>¥{quoteFor(supplier, item).toFixed(2)}</strong></div>)}</div><div className="cost-model-grid"><label><span>税率 %</span><input type="number" min="0" value={costModel.taxRate} onChange={(event) => setCostModel('taxRate', event.target.value)} /></label><label><span>单件运费</span><input type="number" min="0" step="0.01" value={costModel.shipping} onChange={(event) => setCostModel('shipping', event.target.value)} /></label><label><span>开模/工艺费</span><input type="number" min="0" value={costModel.tooling} onChange={(event) => setCostModel('tooling', event.target.value)} /></label><label><span>损耗率 %</span><input type="number" min="0" value={costModel.wasteRate} onChange={(event) => setCostModel('wasteRate', event.target.value)} /></label></div><div className="cost-assumption-note"><Info size={14} />落地成本 = 供应商报价 + 运费 + 开模费分摊，再叠加税率与损耗。当前仍需用正式报价单校准。</div></Panel>
        <Panel title="开发排期" subtitle="从需求冻结到确认样"><div className="timeline"><div><span>第1周</span><strong>询价与索样</strong><p>冻结BOM和问题清单</p></div><div><span>第2-3周</span><strong>首轮打样</strong><p>配方、包材并行推进</p></div><div><span>第4-5周</span><strong>测试与改样</strong><p>稳定性、密封与肤感</p></div><div><span>第6周</span><strong>确认样</strong><p>成本、合规与量产评审</p></div></div></Panel>
      </div>
      <Panel title="组合校验" subtitle="未通过的项目不能进入量产"><div className="validation-table"><div><CheckCircle2 size={17} /><strong>瓶口与滚珠组件</strong><span>规格匹配，等待实物装配</span></div><div><CircleAlert size={17} /><strong>内容物与滚珠结构</strong><span>需要验证粘度、出液量和堵塞风险</span></div><div><CircleAlert size={17} /><strong>包装与运输</strong><span>{packaging.risk}，需跌落与运输模拟</span></div><div><CheckCircle2 size={17} /><strong>成本与售价</strong><span>当前估算低于¥{state.assumptions.targetCost}目标线</span></div></div><div className="factory-gate-grid">{selectedItem.mustHave.map((requirement) => <div key={requirement}><CircleAlert size={14} /><span>{requirement}</span><em>待核验</em></div>)}</div></Panel>
    </>
  )
  const aside = <Panel title="方案经济性" subtitle="以首单3000件测算" className="sticky-panel"><div className="price-summary"><span>预计综合成本</span><strong>¥{total.toFixed(2)}</strong><small>目标 ¥{state.assumptions.targetCost}以内</small></div><dl className="definition-list compact"><div><dt>建议零售价</dt><dd>¥{state.assumptions.price}</dd></div><div><dt>首单货值</dt><dd>¥{Math.round(total * 3000).toLocaleString()}</dd></div><div><dt>主选 / 备选</dt><dd>{selectedSupplier.name} / {backups.length}家</dd></div><div><dt>预计开发周期</dt><dd>约6周，不含合规周期</dd></div></dl><div className="aside-action-stack"><Button variant="secondary" icon={GitCompare} onClick={() => setCompareOpen((value) => !value)}>{compareOpen ? '收起对比' : `对比候选（${compareIds.length}）`}</Button><Button icon={Send} onClick={downloadRfq}>生成询价单</Button></div><div className="side-note warning"><CircleAlert size={16} /><span>报价为样本估算，不含投放、平台扣点、退货、税费、运费、开模费与损耗，不能直接视为实际毛利。</span></div></Panel>
  return <StageLayout main={main} aside={aside} confirm={<ConfirmBar done={isDone(state, 6)} label="确认并生成产品方案" note="确认BOM、成本和风险后生成最终产品卡。" onConfirm={confirmStage} />} />
}

export function OutcomeStage({ state, updateState, exportProject, setActiveStage, notify }) {
  const concept = concepts.find((item) => item.id === state.selectedConcept) || concepts[0]
  const positioning = positioningOptions.find((item) => item.id === state.selectedPositioning) || positioningOptions[0]
  const packaging = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
  const activeSupplierLibrary = state.supplierLibraryOverride?.length ? state.supplierLibraryOverride : supplierLibrary
  const selectedRows = sourcingItems.map((item) => ({ item, supplier: supplierForItem(state, item, activeSupplierLibrary) }))
  const costModel = { taxRate: 0, shipping: 0, tooling: 0, wasteRate: 0, ...(state.supplierWorkbench?.costModel || {}) }
  const baseTotal = selectedRows.reduce((sum, row) => sum + supplierQuote(row.supplier, row.item), 0)
  const total = (baseTotal + Number(costModel.shipping || 0) + Number(costModel.tooling || 0) / 3000) * (1 + Number(costModel.wasteRate || 0) / 100) * (1 + Number(costModel.taxRate || 0) / 100)
  const grossMargin = Math.round((1 - total / state.assumptions.price) * 100)
  const productVersion = state.completed.filter((index) => index >= 3 && index <= 6).length
  const toggleReadiness = (index) => updateState({ readiness: state.readiness.includes(index) ? state.readiness.filter((item) => item !== index) : [...state.readiness, index] })
  return (
    <div className="outcome-screen">
      <StageHeading title="产品效果" description="当前版本汇总，可用于内部评审、打样沟通和后续生产执行。" actions={<><Button variant="secondary" icon={ArrowLeft} onClick={() => setActiveStage(4)}>返回修改</Button><Button icon={Download} onClick={exportProject}>导出产品方案</Button></>} />
      <div className="outcome-grid">
        <div className="outcome-product"><img src="/eye-oil-product.png" alt="植萃修护眼部精华油产品效果图" /></div>
        <div className="product-sheet">
          <div className="product-sheet-head"><span>最终产品方案</span><Status tone="success">V1.{productVersion}</Status></div>
          <h2>20ml滚珠眼部精华油</h2>
          <dl>
            <div><dt>一句话卖点</dt><dd>{concept.tagline}</dd></div>
            <div><dt>核心人群</dt><dd>{concept.fit}</dd></div>
            <div><dt>建议零售价</dt><dd>¥{state.assumptions.price} / 20ml</dd></div>
            <div><dt>预测综合成本</dt><dd>¥{total.toFixed(2)}</dd></div>
            <div><dt>理论毛利空间</dt><dd>约{grossMargin}%（未扣渠道与投放）</dd></div>
            <div><dt>关键成分方向</dt><dd>{concept.ingredients.join('、')}</dd></div>
            <div><dt>产品定位</dt><dd>{positioning.name} · {positioning.tone}</dd></div>
            <div><dt>包材方案</dt><dd>{packaging.bottle} + {packaging.applicator}</dd></div>
            <div><dt>生产周期</dt><dd>约6周，不含合规备案周期</dd></div>
            <div><dt>主要风险</dt><dd>{concept.risk}</dd></div>
          </dl>
        </div>
        <Panel title="版本与决策记录" subtitle="关键选择均可追溯" className="version-panel">
          <div className="version-list"><div className="current"><span /><strong>V1.{productVersion}</strong><p>生成当前产品方案</p><time>刚刚</time></div><div><span /><strong>V1.2</strong><p>确认包材与成本组合</p><time>当前会话</time></div><div><span /><strong>V1.1</strong><p>确认核心概念与定位</p><time>当前会话</time></div><div><span /><strong>V1.0</strong><p>创建眼油开发项目</p><time>项目初始</time></div></div>
        </Panel>
      </div>
      <div className="outcome-lower">
        <Panel title="上市准备清单" subtitle={`${state.readiness.length}/${readinessItems.length}项已完成`}>
          <div className="checklist-grid">{readinessItems.map((item, index) => <label key={item}><input type="checkbox" checked={state.readiness.includes(index)} onChange={() => toggleReadiness(index)} /><span className="custom-check">{state.readiness.includes(index) && <Check size={14} />}</span><span>{item}</span></label>)}</div>
        </Panel>
        <Panel title="成本拆分" subtitle={`目标成本 ¥${state.assumptions.targetCost}以内`}>
          <div className="compact-cost-table">{selectedRows.map(({ item, supplier }) => <div key={item.id}><span>{item.name}</span><small>{supplier.name}</small><strong>¥{supplierQuote(supplier, item).toFixed(2)}</strong></div>)}<div className="total"><span>合计</span><small>当前预测</small><strong>¥{total.toFixed(2)}</strong></div></div>
        </Panel>
      </div>
      <div className="handoff-band"><PackageCheck size={22} /><div><strong>当前方案可进入打样评审</strong><p>仍需完成配方稳定性、包材相容性、滚珠密封与真实人群使用测试。</p></div><Button variant="secondary" icon={FlaskConical} onClick={() => notify('已建立首轮打样任务')}>建立打样任务</Button></div>
    </div>
  )
}

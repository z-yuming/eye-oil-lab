export const stages = [
  { id: 'research', label: '市场调研', short: '市场' },
  { id: 'audience', label: '人群分析', short: '人群' },
  { id: 'competitors', label: '竞品分析', short: '竞品' },
  { id: 'concepts', label: '功能概念', short: '概念' },
  { id: 'positioning', label: '产品定位', short: '定位' },
  { id: 'packaging', label: '包装设计', short: '包装' },
  { id: 'factory', label: '落地工厂', short: '落地' },
  { id: 'outcome', label: '产品效果', short: '成果' },
]

export const defaultPackagingDesign = {
  brandName: '植萃修护',
  productName: '眼部精华油',
  style: '自然植萃 · 现代简约',
  palette: ['#c9685a', '#f4f1e9', '#58725c', '#242826'],
  finishes: ['哑光覆膜'],
  description: '天然植萃成分，温和修护；简约自然的专业护肤风格，突出植物元素与便携滚珠体验。',
  generatedConcepts: [],
  selectedConceptId: 'seed-natural',
  confirmed2D: false,
  confirmedConceptId: '',
  show3D: false,
  viewMode: '2d',
  editorTab: 'parts',
  activePartId: 'illustration',
  activeTool: 'select',
  canvasZoom: 100,
  localEditPrompt: '植物插画缩小20%，保持其他部位不变',
  referenceImages: [],
  gateChecks: [],
  gateConfirmedAt: '',
  partSettings: {
    carton: { visible: true, locked: true },
    illustration: { visible: true, locked: false },
    brand: { visible: true, locked: true },
    product: { visible: true, locked: true },
    bottleLabel: { visible: true, locked: false },
    cap: { visible: true, locked: false },
  },
}

export const packagingGateItems = [
  {
    id: 'text-layer',
    title: '文字图层可控',
    detail: '品牌名、品名和容量不交给生图模型定稿，后续可独立校对。',
  },
  {
    id: 'structure-fit',
    title: '结构与成本匹配',
    detail: '瓶器、滚珠、纸盒工艺与当前目标成本和首单数量相容。',
  },
  {
    id: 'risk-brief',
    title: '包材风险已写入',
    detail: '漏液、破损、出液量、色差和法规宣称进入打样验证。',
  },
  {
    id: 'supplier-brief',
    title: '可发给工厂沟通',
    detail: '已形成结构、材质、工艺、图片版本和待验证问题。',
  },
]

export const evidence = [
  {
    id: 'E-01',
    finding: '眼部护理需求由单一淡纹转向疲态、干燥与按摩体验并重',
    source: '美妆个护趋势资料库',
    date: '2026-06',
    sample: '多源报告',
    confidence: '高',
    scope: '中国美妆个护市场',
    note: '来自行业趋势、平台内容与产品案例的交叉观察。具体规模仍需交易数据验证。',
  },
  {
    id: 'E-02',
    finding: '滚珠结构在便携、按摩与使用仪式感方面具有明显表达优势',
    source: '竞品与产品案例库',
    date: '2026-05',
    sample: 'Top 10竞品',
    confidence: '高',
    scope: '眼部精华及眼油',
    note: '结构优势成立，但滚珠顺滑度和倒置漏液是必须验证的反向风险。',
  },
  {
    id: 'E-03',
    finding: '用户负面反馈集中在油腻、吸收慢、刺激和包装漏液',
    source: '用户评论聚类',
    date: '2026-04',
    sample: 'N=3,200',
    confidence: '中高',
    scope: '电商评论样本',
    note: '评论数据存在极端体验放大效应，需用样品实测确认肤感和包材表现。',
  },
  {
    id: 'E-04',
    finding: '69-99元价格带适合建立专业感与首购门槛之间的平衡',
    source: '价格带与竞品分析',
    date: '2026-06',
    sample: '36个SKU',
    confidence: '中',
    scope: '国内主流电商',
    note: '这是当前项目假设，最终需要结合渠道扣点、投放成本和复购表现修正。',
  },
]

export const marketTrend = [72, 89, 112, 138, 171, 198]
export const trendYears = ['2021', '2022', '2023', '2024', '2025', '2026E']

export const painPoints = [
  { label: '黑眼圈与疲态', value: 62 },
  { label: '眼周干燥', value: 58 },
  { label: '细纹与干纹', value: 49 },
  { label: '眼部浮肿', value: 46 },
  { label: '油腻吸收慢', value: 38 },
  { label: '包装漏液', value: 31 },
]

export const audiences = [
  {
    id: 'office',
    name: '高频用眼职场女性',
    range: '25-38岁',
    size: '核心人群',
    scene: '通勤、久坐办公、睡前护理',
    pains: ['眼周疲态明显', '干纹卡粉', '需要便携护理'],
    gain: '滚珠按摩带来即时舒缓感，轻润配方可在妆前和睡前使用。',
  },
  {
    id: 'mature',
    name: '初老精细护理人群',
    range: '35-45岁',
    size: '高价值人群',
    scene: '夜间修护、出差旅行',
    pains: ['细纹加深', '弹性下降', '普通眼霜缺少仪式感'],
    gain: '更强调滋养、修护和夜间护理，但需要控制油感。',
  },
  {
    id: 'sensitive',
    name: '敏感眼周谨慎尝鲜者',
    range: '23-40岁',
    size: '机会人群',
    scene: '换季、熬夜后、局部干燥',
    pains: ['害怕刺激', '成分焦虑', '不信任夸张宣称'],
    gain: '精简配方、清楚的安全边界和真实测试信息更能建立信任。',
  },
]

export const competitors = [
  { rank: 1, name: 'A品牌按摩眼精华', type: '精华', price: 129, volume: '15ml', structure: '金属按摩头', strength: '品牌认知', risk: '价格偏高' },
  { rank: 2, name: 'B品牌植萃眼油', type: '眼油', price: 79, volume: '10ml', structure: '滴管', strength: '成分故事', risk: '油腻反馈' },
  { rank: 3, name: 'C品牌咖啡因眼精华', type: '精华', price: 69, volume: '20ml', structure: '软管', strength: '性价比', risk: '体验普通' },
  { rank: 4, name: 'D品牌滚珠眼精华', type: '精华', price: 99, volume: '15ml', structure: '三珠按摩头', strength: '按摩体验', risk: '结构复杂' },
  { rank: 5, name: 'E品牌夜间修护油', type: '眼油', price: 159, volume: '15ml', structure: '滴管', strength: '高端定位', risk: '受众较窄' },
  { rank: 6, name: 'F品牌草本眼油', type: '眼油', price: 59, volume: '12ml', structure: '滚珠', strength: '价格友好', risk: '包装廉价' },
  { rank: 7, name: 'G品牌淡纹精华', type: '精华', price: 119, volume: '20ml', structure: '泵头', strength: '功效认知', risk: '同质化' },
  { rank: 8, name: 'H品牌便携眼部棒', type: '精华棒', price: 89, volume: '9g', structure: '旋转棒', strength: '便携', risk: '卫生疑虑' },
  { rank: 9, name: 'I品牌敏感肌眼精华', type: '精华', price: 139, volume: '20ml', structure: '泵头', strength: '温和背书', risk: '缺少差异' },
  { rank: 10, name: 'J品牌双相眼油', type: '眼油', price: 109, volume: '15ml', structure: '滚珠', strength: '视觉新颖', risk: '使用步骤多' },
]

export const concepts = [
  {
    id: 'light',
    code: 'A',
    name: '轻润按摩型',
    tagline: '滚一滚，松开疲态眼周',
    fit: '高频用眼职场女性',
    price: 89,
    cost: 16,
    ingredients: ['角鲨烷', '霍霍巴籽油', '咖啡因', '红景天提取物', '维生素E'],
    mechanism: '轻质油相减少拉扯，金属滚珠提供清凉按摩体验。',
    proof: ['轻润肤感测试', '滚珠顺滑度', '倒置密封测试'],
    risk: '咖啡因在油相中的配方实现与宣称证据需专业确认。',
    scores: { demand: 92, difference: 86, feasibility: 78, cost: 88, compliance: 72 },
    scoreReasons: {
      demand: '疲态、干燥和妆前卡粉都能被轻润按摩场景承接。',
      difference: '滚珠触感比普通滴管眼油更容易被用户感知。',
      feasibility: '油相与滚珠结构成熟，但咖啡因油相实现要配方师确认。',
      cost: '89元价格带能覆盖20ml玻璃滚珠和基础检测成本。',
      compliance: '需要把咖啡因表达控制在体验辅助，不直接承诺淡纹消肿。',
    },
    evidence: ['高频用眼与疲态场景强相关', '滚珠结构能把即时触感做成差异', '89元价格带与20ml规格匹配度较高'],
    boundaries: ['不承诺淡纹或消肿结果', '咖啡因相关表达先按体验辅助处理', '油相轻薄度和出液量必须同步测试'],
    pilot: ['3版油相粘度小试', '304不锈钢滚珠出液量测试', '20人妆前和睡前半脸体验'],
    decision: '优先推荐进入首轮打样，作为主线方案。',
  },
  {
    id: 'calm',
    code: 'B',
    name: '敏肌舒缓型',
    tagline: '精简一滴，温和守住眼周',
    fit: '敏感眼周谨慎尝鲜者',
    price: 99,
    cost: 18,
    ingredients: ['角鲨烷', '白池花籽油', '红没药醇', '维生素E'],
    mechanism: '精简无香体系，优先降低刺激和成分理解门槛。',
    proof: ['斑贴测试', '眼周使用测试', '成分相容性'],
    risk: '舒缓表达需要避免医疗化宣称，差异度依赖测试透明度。',
    scores: { demand: 78, difference: 72, feasibility: 84, cost: 76, compliance: 68 },
    scoreReasons: {
      demand: '敏感眼周是明确购买阻力，但首发声量小于疲态场景。',
      difference: '精简温和容易理解，但竞品也常使用类似表达。',
      feasibility: '无香精简体系更易打样，斑贴和相容性验证路径清楚。',
      cost: '配方和测试成本略高，仍可落在99元价格带内。',
      compliance: '舒缓词需要证据支撑，不能写成医疗化修复。',
    },
    evidence: ['敏感眼周是明确阻力点', '精简成分能降低尝鲜门槛', '更适合承接温和透明的内容表达'],
    boundaries: ['舒缓不能写成治疗或修复疾病', '差异化不能只依赖少成分', '需证明无香和温和不是牺牲体验'],
    pilot: ['无香版本气味接受度测试', '斑贴和眼周耐受观察', '敏感肌人群概念访谈'],
    decision: '适合作为备选方案，验证通过后可做敏感肌支线。',
  },
  {
    id: 'night',
    code: 'C',
    name: '夜间修护型',
    tagline: '一夜润养，醒来眼周更柔软',
    fit: '初老精细护理人群',
    price: 129,
    cost: 22,
    ingredients: ['山茶籽油', '白池花籽油', '植物甾醇', '生育酚'],
    mechanism: '更丰润的夜间油相形成柔润保护，突出护理仪式感。',
    proof: ['经皮水分散失测试', '连续使用测试', '枕套迁移测试'],
    risk: '成本和油腻感更高，首购转化门槛高于另外两案。',
    scores: { demand: 70, difference: 82, feasibility: 74, cost: 58, compliance: 76 },
    scoreReasons: {
      demand: '初老人群有护理意愿，但夜间眼油不是最高频首发需求。',
      difference: '夜间仪式感和更高客单更容易做出内容差异。',
      feasibility: '丰润油相可开发，但吸收残留和枕套迁移要提前验证。',
      cost: '油脂组合、精致包材和测试成本更高，毛利压力明显。',
      compliance: '可主打柔润体验，但不能暗示一夜改善纹路。',
    },
    evidence: ['夜间修护内容更容易形成仪式感', '高客单能支撑更精致包材', '适合小红书种草和私域复购故事'],
    boundaries: ['不能暗示一夜改善纹路', '需控制枕套迁移和粘腻反馈', '首发价格不宜直接进入大众货架'],
    pilot: ['丰润度梯度小试', '7天夜间连续使用记录', '枕套迁移和吸收残留测试'],
    decision: '建议先做内容概念验证，不作为首发主线。',
  },
]

export const defaultConceptWeights = {
  demand: 28,
  difference: 24,
  feasibility: 18,
  cost: 16,
  compliance: 14,
}

export const positioningOptions = [
  {
    id: 'professional',
    name: '专业轻护理',
    statement: '为高频用眼的都市女性，提供随时可用的轻润滚珠眼部护理。',
    price: '79-99元',
    channel: '天猫 / 抖音 / 小红书',
    tone: '专业、克制、可信',
  },
  {
    id: 'natural',
    name: '植萃温和护理',
    statement: '以精简植萃油相，为关注成分与温和体验的人群减轻护理负担。',
    price: '89-109元',
    channel: '小红书 / 天猫',
    tone: '自然、温和、透明',
  },
  {
    id: 'ritual',
    name: '夜间修护仪式',
    statement: '把滚珠按摩变成睡前两分钟的眼周放松与修护仪式。',
    price: '109-139元',
    channel: '小红书 / 私域',
    tone: '安静、精致、有仪式感',
  },
]

export const packagingOptions = [
  { id: 'amber', name: '棕瓶专业款', bottle: '20ml棕色玻璃瓶', applicator: '304不锈钢滚珠', carton: '白卡纸 + 珊瑚红侧边', cost: 5.2, lead: '18-22天', risk: '玻璃运输破损' },
  { id: 'pet', name: '轻量便携款', bottle: '20ml茶色PET瓶', applicator: '陶瓷滚珠', carton: 'FSC白卡纸单色印刷', cost: 4.1, lead: '14-18天', risk: '材质高级感较弱' },
  { id: 'premium', name: '高端夜间款', bottle: '15ml厚壁玻璃瓶', applicator: '三珠锌合金按摩头', carton: '特种纸 + 局部烫银', cost: 8.6, lead: '28-35天', risk: 'MOQ与模具费较高' },
]

export const suppliers = [
  { item: '内容物与灌装', supplier: '华东功效护肤OEM A', quote: 6.8, moq: 3000, sample: '7-10天', status: '推荐', source: '供应商库' },
  { item: '棕色玻璃瓶', supplier: '宁波包材 B', quote: 2.6, moq: 3000, sample: '5-7天', status: '待索样', source: '历史询价' },
  { item: '金属滚珠与外盖', supplier: '广州包材 C', quote: 1.45, moq: 5000, sample: '5天', status: 'MOQ风险', source: '候选库' },
  { item: '标签', supplier: '东莞标签 D', quote: 0.42, moq: 3000, sample: '3天', status: '可询价', source: '历史合作' },
  { item: '彩盒', supplier: '深圳印刷 E', quote: 1.18, moq: 3000, sample: '5-7天', status: '可询价', source: '历史合作' },
  { item: '检测与运输分摊', supplier: '组合估算', quote: 1.55, moq: 3000, sample: '—', status: '待确认', source: '成本模型' },
]

export const sourcingItems = [
  { id: 'formula', group: '内料', name: '眼部精华油内容物', spec: '轻润油相 · 咖啡因+红景天', targetCost: 6.8, moq: 3000, lead: '7-10天', keywords: ['眼部精华油', '油相配方', '温和'], matchTerms: ['眼部精华油', '精华', '油相', '护肤'], mustHave: ['油相配方经验', '可提供配方与检测资料'], risk: '配方稳定性与宣称证据' },
  { id: 'bottle', group: '包材', name: '20ml棕色玻璃瓶', spec: '避光玻璃 · 20ml', targetCost: 2.8, moq: 3000, lead: '5-7天', keywords: ['玻璃瓶', '20ml', '棕色'], matchTerms: ['玻璃瓶', '20ml', '棕色', '避光'], mustHave: ['20ml规格', '瓶口可装滚珠组件', '油性内容物相容性'], risk: '运输破损与色差' },
  { id: 'applicator', group: '包材', name: '304不锈钢滚珠+外盖', spec: '滚珠顺滑 · 倒置不漏液', targetCost: 1.6, moq: 3000, lead: '5天', keywords: ['滚珠', '不锈钢', '密封'], matchTerms: ['滚珠', '不锈钢', '陶瓷', '密封', '外盖'], mustHave: ['滚珠材质与直径', '出液量', '倒置密封测试'], risk: 'MOQ与装配匹配' },
  { id: 'label', group: '包装', name: '标签', spec: '哑膜白标 · 红色侧边信息', targetCost: 0.5, moq: 3000, lead: '3天', keywords: ['标签', '哑膜', '化妆品'], matchTerms: ['标签', '哑膜', '耐磨', '化妆品'], mustHave: ['油性表面附着', '耐磨与耐酒精', '法规信息区'], risk: '附着与耐磨' },
  { id: 'carton', group: '包装', name: '白卡纸彩盒', spec: '白正面+珊瑚红侧边', targetCost: 1.3, moq: 3000, lead: '5-7天', keywords: ['彩盒', '白卡纸', '化妆品'], matchTerms: ['彩盒', '白卡纸', '印刷', '化妆品'], mustHave: ['20ml盒型结构', '抗压', '印前信息审核'], risk: '抗压与运输保护' },
  { id: 'testing', group: '加工/检测', name: '灌装组装与检测', spec: '灌装、装珠、贴标、装盒、稳定性', targetCost: 1.8, moq: 3000, lead: '15-20天', keywords: ['灌装', '组装', '检测'], matchTerms: ['灌装', '组装', '滚珠装配', '稳定性', '检测'], mustHave: ['灌装与装珠能力', '稳定性/相容性资料', '批次追溯'], risk: '排期与检测资料' },
]

import { supplierSourceRecords } from './supplier-source'

const curatedSupplierLibrary = [
  { id: 'sl-001', name: '华东功效护肤OEM A', type: '内料 / OEM', region: '江苏苏州', capabilities: ['眼部精华油', '油相配方', '灌装组装', '检测资料'], moq: 3000, price: 6.8, lead: '7-10天', rating: 4.8, passRate: 92, onTimeRate: 96, risk: '低', verified: '2026-08', source: '历史合作+供应商库', tags: ['小单友好', '可做功效配方'], fit: ['formula', 'testing'], note: '有眼部精华油与油相配方经验，支持小单打样。' },
  { id: 'sl-002', name: '宁波玻器包材 B', type: '包材 / 瓶器', region: '浙江宁波', capabilities: ['20ml玻璃瓶', '棕色避光', '丝印/贴标'], moq: 3000, price: 2.6, lead: '5-7天', rating: 4.6, passRate: 88, onTimeRate: 91, risk: '低', verified: '2026-07', source: '历史询价', tags: ['现成瓶型', '可小批量'], fit: ['bottle'], note: '有现成20ml棕色瓶型，适配贴标方案。' },
  { id: 'sl-003', name: '广州精密包材 C', type: '包材 / 滚珠组件', region: '广东广州', capabilities: ['不锈钢滚珠', '陶瓷滚珠', '外盖', '密封件'], moq: 5000, price: 1.45, lead: '5天', rating: 4.4, passRate: 86, onTimeRate: 89, risk: '中', verified: '2026-06', source: '候选库', tags: ['滚珠经验', '交期快'], fit: ['applicator'], note: '滚珠组件匹配度高，但MOQ高于首单目标。' },
  { id: 'sl-004', name: '东莞精印标签 D', type: '包装 / 标签', region: '广东东莞', capabilities: ['化妆品标签', '哑膜', '耐磨印刷'], moq: 3000, price: 0.42, lead: '3天', rating: 4.5, passRate: 93, onTimeRate: 94, risk: '低', verified: '2026-08', source: '历史合作', tags: ['耐磨', '小单友好'], fit: ['label'], note: '可按化妆品标签规范预留信息区，打样响应快。' },
  { id: 'sl-005', name: '深圳纸品印刷 E', type: '包装 / 彩盒', region: '广东深圳', capabilities: ['白卡纸彩盒', '局部工艺', '抗压结构'], moq: 3000, price: 1.18, lead: '5-7天', rating: 4.7, passRate: 90, onTimeRate: 95, risk: '低', verified: '2026-08', source: '历史合作', tags: ['结构打样', '交期稳定'], fit: ['carton'], note: '支持白卡纸彩盒和红色侧边分色打样。' },
  { id: 'sl-006', name: '华南灌装检测 F', type: '加工 / 检测', region: '广东广州', capabilities: ['灌装组装', '滚珠装配', '稳定性测试', '检测资料'], moq: 3000, price: 1.55, lead: '15-20天', rating: 4.3, passRate: 84, onTimeRate: 88, risk: '中', verified: '2026-05', source: '成本模型+候选库', tags: ['可整包协调', '检测资料'], fit: ['testing'], note: '能协调多部件进厂，但排期要提前锁定。' },
  { id: 'sl-007', name: '苏州温和配方 G', type: '内料 / OEM', region: '江苏苏州', capabilities: ['敏肌配方', '植物油相', '小试打样'], moq: 2000, price: 7.4, lead: '10-14天', rating: 4.7, passRate: 95, onTimeRate: 90, risk: '低', verified: '2026-07', source: '供应商库', tags: ['敏肌经验', '小试灵活'], fit: ['formula'], note: '更适合敏肌舒缓方向，单件报价略高。' },
  { id: 'sl-008', name: '浙江复合包材 H', type: '包材 / 组合', region: '浙江宁波', capabilities: ['玻璃瓶', '滚珠头', '外盖', '套装组合'], moq: 5000, price: 4.1, lead: '12-15天', rating: 4.2, passRate: 87, onTimeRate: 86, risk: '中', verified: '2026-04', source: '供应商库', tags: ['一站式包材', '减少协调'], fit: ['bottle', 'applicator'], note: '可以整包提供瓶器与滚珠组件，但MOQ更高。' },
  { id: 'real-p-001', name: '绍兴市上虞天博包装制品厂', type: '包材 / 精华液瓶', region: '浙江绍兴', capabilities: ['头皮精华液瓶', '5ml塑料瓶', '精华液包装'], moq: 10000, moqLabel: '1w', price: 0.55, priceLabel: '¥0.55', lead: '7天左右', bulkLead: '15天左右', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['精华液瓶', '包材实价'], fit: ['bottle'], contact: '15857548661', note: '原表记录：头皮精华液，规格5ml。适合做精华类瓶器参考，需确认20ml和滚珠结构。' },
  { id: 'real-p-002', name: '广州臻尚包装制品', type: '包材 / 精华液瓶', region: '广东广州', capabilities: ['头皮精华液瓶', '5ml塑料瓶', '精华液包装'], moq: 10000, moqLabel: '1w', price: 1.55, priceLabel: '¥1.55', lead: '10天左右', bulkLead: '30天左右', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['精华液瓶', '广州供应商'], fit: ['bottle'], contact: '18588859039', note: '原表记录：头皮精华液，规格5ml。需重新确认眼油瓶型与避光要求。' },
  { id: 'real-p-003', name: '宁波靓妆塑业有限公司', type: '包材 / 精华液瓶', region: '浙江宁波', capabilities: ['头皮精华液瓶', '5ml塑料瓶', '塑料包材'], moq: 10000, moqLabel: '1w', price: 0.6, priceLabel: '¥0.60', lead: '7天左右', bulkLead: '15天左右', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['精华液瓶', '实价'], fit: ['bottle'], note: '原表记录：头皮精华液，规格5ml。需确认20ml规格是否可开模或改款。' },
  { id: 'real-p-004', name: '广州锦豪包装制品有限公司', type: '包材 / 精华液瓶', region: '广东广州', capabilities: ['头皮精华液瓶', '5ml塑料瓶', '精华液包装'], moq: 10000, moqLabel: '1w', price: 1.4, priceLabel: '¥1.40', lead: '3-5天', bulkLead: '10天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['交期快', '精华液瓶'], fit: ['bottle'], contact: '15918679995', note: '原表记录：头皮精华液，规格5ml。需确认眼油项目的容量和瓶口结构。' },
  { id: 'real-p-005', name: '宁波引际包装有限公司', type: '包材 / 精华液瓶', region: '浙江宁波', capabilities: ['头皮精华液瓶', '5ml塑料瓶', '精华液包装'], moq: 10000, moqLabel: '1w', price: 0.59, priceLabel: '¥0.59', lead: '3-5天', bulkLead: '7-10天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['交期快', '实价'], fit: ['bottle'], contact: '/', note: '原表记录：头皮精华液，规格5ml。需确认避光和滚珠头适配。' },
  { id: 'real-p-006', name: '徐州格木汐玻璃制品有限公司', type: '包材 / 油类玻璃瓶', region: '江苏徐州', capabilities: ['身体油喷雾玻璃瓶', '玻璃瓶', '丝印', '喷涂烫金'], moq: null, moqLabel: '无起订量', price: 2.08, priceLabel: '¥2.08-2.10', lead: '3-6天', bulkLead: '6-10天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类瓶器', '无起订量'], fit: ['bottle'], contact: '待补充', note: '原表记录：身体油喷雾玻璃瓶。5k量裸价约2.10元，1w量约2.08元。需确认20ml眼油瓶型。' },
  { id: 'real-p-007', name: '精玻智造玻璃科技有限公司', type: '包材 / 油类玻璃瓶', region: '待补充', capabilities: ['身体油喷雾玻璃瓶', '玻璃瓶', '喷涂'], moq: null, moqLabel: '无起订量', price: 1.65, priceLabel: '¥1.65-1.70', lead: '3-4天', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类瓶器', '无起订量'], fit: ['bottle'], contact: '待补充', note: '原表记录：身体油喷雾玻璃瓶。需确认眼油的避光、瓶口和滚珠头适配。' },
  { id: 'real-p-008', name: '广州鑫语玻璃制品厂', type: '包材 / 油类玻璃瓶', region: '广东广州', capabilities: ['身体油喷雾玻璃瓶', 'PPC泵头', '电化铝泵头'], moq: 3000, moqLabel: '3k起，部分泵头1w起', price: 2.25, priceLabel: '¥2.25-3.20', lead: '5天左右', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类瓶器', '泵头'], fit: ['bottle'], contact: '待补充', note: '原表记录：PPC泵头3k单价约2.35元起，电化铝泵头1w起。不是滚珠头，需重新确认结构。' },
  { id: 'real-p-009', name: '广州博鑫包装', type: '包材 / 玻璃瓶', region: '广东广州', capabilities: ['身体油喷雾玻璃瓶', '玻璃瓶', '印刷包装'], moq: null, moqLabel: '待确认', price: 2.35, priceLabel: '¥2.35-3.20', lead: '3-5天', bulkLead: '15-20天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类瓶器', '交期明确'], fit: ['bottle'], contact: '待补充', note: '原表记录多款身体油喷雾玻璃瓶，需确认20ml眼油规格。' },
  { id: 'real-p-010', name: '广州瑞正包装材料有限公司', type: '包材 / 油泵玻璃瓶', region: '广东广州', capabilities: ['身体油油泵玻璃瓶', '玻璃瓶', '乳液泵'], moq: 5000, moqLabel: '5k', price: 4, priceLabel: '¥4.00-4.20', lead: '3-5天', bulkLead: '15-20天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类瓶器', '泵头'], fit: ['bottle'], contact: '待补充', note: '原表记录：80ml-120ml身体油油泵玻璃瓶，不是眼油滚珠头，作为油类包装备选。' },
  { id: 'real-p-011', name: '广州星彩包装材料有限公司', type: '包材 / 沐浴油瓶', region: '广东广州', capabilities: ['沐浴油瓶', '瓶器+油泵', '丝印'], moq: 10000, moqLabel: '1w', price: 1.95, priceLabel: '¥1.95', lead: '7-10天', bulkLead: '25天左右', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '包材供应商信息表', tags: ['油类包装', '瓶泵组合'], fit: ['bottle'], contact: '待补充', note: '原表记录：250ml沐浴油指定瓶型，含运参考。眼油项目需重新确认容量与瓶口。' },
  { id: 'real-o-001', name: '上海召兰生物科技有限公司', type: '代加工 / OEM ODM', region: '上海宝山', capabilities: ['化妆品OEM/ODM', '私人定制', '香型定制', '跨境贴牌'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['OEM/ODM', '私人定制'], fit: ['formula', 'testing'], contact: '+86 13162266333 / +86 15043055333 / 微信13162266333 / 88yangxiaolan88@163.com', note: '护肤、彩妆、洗护及化妆品OEM/ODM，原表注明法国工厂、跨境贴牌。' },
  { id: 'real-o-002', name: '美中集团（广州美中生物科技）', type: '代加工 / 功效护肤', region: '广东广州黄埔', capabilities: ['生物护肤', '精华', '面膜', '膏霜', '冻干粉'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['精华', '生物护肤'], fit: ['formula', 'testing'], contact: '翁炎荣 · 19120314973 / 17276497889 / www.mzswj.com', note: '原表记录：生物护肤化妆品，包含精华类产品。' },
  { id: 'real-o-003', name: '广州宝捷化妆品有限公司', type: '代加工 / OEM ODM', region: '广东广州花都', capabilities: ['护肤OEM/ODM', '彩妆', '个护', '代加工'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['护肤', 'OEM/ODM'], fit: ['formula', 'testing'], contact: '林斯燕 · +86 18122323851 / QQ 2855504135 / 288550415@qq.com', note: '原表记录：化妆品彩妆、护肤、个护OEM/ODM代加工。' },
  { id: 'real-o-004', name: '广东博研界生物医药科技有限公司', type: '代加工 / 生物护肤', region: '广东佛山三水', capabilities: ['护肤研发生产', '医美', '化妆品研发', '生物医药'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['研发生产', '护肤'], fit: ['formula', 'testing'], contact: '高雯 Gina · 17322073070 / gao_wen00@126.com', note: '运营中心在广州，制造工厂在佛山三水。' },
  { id: 'real-o-005', name: '广州君研生物科技有限公司（君研智造）', type: '代加工 / 功效护肤', region: '广东清远', capabilities: ['功效护肤', '化妆品OEM/ODM', '次抛', '冻干粉'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['功效护肤', 'OEM/ODM'], fit: ['formula', 'testing'], contact: '吴冶语 · 188-2517-7606', note: '原表记录：功效护肤、母婴、私密、头疗、彩妆、次抛、冻干粉等OEM/ODM。' },
  { id: 'real-o-006', name: '广东盛美健康产业集团有限公司', type: '代加工 / 护肤健康品', region: '广东广州白云', capabilities: ['护肤', '精华', '膏霜', '跨境OEM/ODM', '健康品'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['精华', '跨境OEM/ODM'], fit: ['formula', 'testing'], contact: '方锦帆 Jasper · 176 2010 9121', note: '原表记录：护肤、彩妆、面膜、精华、膏霜及健康品。' },
  { id: 'real-o-007', name: '伊尔美集团（YRM BIOLOGY）', type: '代加工 / 功效护肤', region: '广东广州白云', capabilities: ['功效护肤', '问题肌肤修护', '院线化妆品OEM/ODM'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['问题肌修护', '功效护肤'], fit: ['formula', 'testing'], contact: '王鑫（OEM业务经理）· 18566054360 / 18145725371', note: '原表记录：30年院线专研，问题肌肤修护与功效护肤OEM/ODM。' },
  { id: 'real-o-008', name: '广州市泽牧泽生物科技有限公司', type: '代加工 / 护肤OEM ODM', region: '广东广州花都', capabilities: ['护肤', '面膜', '精华', '膏霜', '配方开发'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['精华', '配方开发'], fit: ['formula', 'testing'], contact: '邝锦彪 · 13143690682 / 020-61812606 / www.zhuanze.net', note: '原表记录：护肤、面膜、精华、膏霜OEM/ODM。' },
  { id: 'real-o-009', name: '广东品盛生物科技有限公司', type: '代加工 / 配方定制', region: '广东广州白云', capabilities: ['OEM/ODM', '贴牌加工', '配方定制', '打样生产'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['配方定制', '打样'], fit: ['formula', 'testing'], contact: '韩剑波 · 15057602000 / 519396402@qq.com', note: '原表记录：化妆品OEM/ODM、贴牌加工、配方定制、打样、生产。' },
  { id: 'real-o-010', name: '广州天玺生物科技有限公司（天玺国际）', type: '代加工 / 功效护肤', region: '广东广州开发区', capabilities: ['护肤', '面膜', '母婴', '洗护', '功效性OEM/ODM'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['功效性', '自有厂区'], fit: ['formula', 'testing'], contact: '肖耿佳（业务经理）· 15019483329 / 400-008-3178 / 847054124@qq.com / www.txodm.com', note: '原表记录：护肤、面膜、母婴、洗护和功效性产品OEM/ODM/OBM。' },
  { id: 'real-o-011', name: '广东万禧生物科技有限公司（TRUE）', type: '代加工 / 修护护肤', region: '广东佛山三水', capabilities: ['修护', '抗衰', '提亮', '化妆品OEM/ODM'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['修护', '抗衰'], fit: ['formula', 'testing'], contact: '朱桐艳 / LULU · 13719413488 / 706592973@qq.com', note: '原表记录品牌TRUE，方向包含修护、抗衰和提亮。' },
  { id: 'real-o-012', name: '广州好迪集团', type: '代加工 / 日化洗护', region: '广东广州白云', capabilities: ['日化洗护', '护肤', '家清', 'OEM外贸'], moq: null, moqLabel: '待确认', price: null, priceLabel: '待询价', lead: '待确认', bulkLead: '待确认', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '代加工供应商信息表', tags: ['自有大型工厂', 'OEM外贸'], fit: ['formula', 'testing'], contact: 'Vivid Zhu（OEM外贸经理）· 86-15913112183 / oem@houdy.com', note: '原表记录：日化洗护、护肤、家清OEM/外贸。' },
  { id: 'real-f-001', name: '美续', type: '成品 / 供应商', region: '待补充', capabilities: ['眼膜', '沐浴油', '清洁霜', '成品供货'], moq: 5000, moqLabel: '5k', price: null, priceLabel: '按产品询价', lead: '3-5天', bulkLead: '18-30天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '成品供应商信息表', tags: ['眼膜', '沐浴油', '成品'], fit: ['finished'], contact: '18565156053', note: '原表记录：OURBE眼膜、沐浴油、清洁霜等成品报价。' },
  { id: 'real-f-002', name: '上云', type: '成品 / 供应商', region: '待补充', capabilities: ['眼膜', '沐浴油', '清洁霜', '成品供货'], moq: 5000, moqLabel: '5k', price: null, priceLabel: '按产品询价', lead: '待确认', bulkLead: '18-25天', rating: null, passRate: null, onTimeRate: null, risk: '待核验', verified: '供应商表', source: '成品供应商信息表', tags: ['眼膜', '沐浴油', '成品'], fit: ['finished'], contact: '15362377618', note: '原表记录：OURBE精华眼膜、沐浴油、清洁霜等成品报价。' },
]

function normalizeSupplierName(name) {
  return String(name || '').replace(/[（(].*?[）)]/g, '').replace(/有限公司|集团|包装制品厂|包装材料有限公司|科技有限公司|生物科技有限公司/g, '').replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '').toLowerCase()
}

function dedupeSupplierRecords(records) {
  const seen = new Map()
  return records.filter((supplier) => {
    const key = `${normalizeSupplierName(supplier.name)}|${supplier.source || ''}|${supplier.product || supplier.type || ''}`
    if (seen.has(key)) return false
    seen.set(key, supplier)
    return true
  })
}

export const supplierLibrary = dedupeSupplierRecords([
  ...curatedSupplierLibrary,
  ...supplierSourceRecords.map((record) => ({
    ...record,
    id: `source-${record.sourceId}`,
    rating: null,
    passRate: null,
    onTimeRate: null,
  })),
])

export const supplierSourceStats = {
  rawRecords: supplierSourceRecords.length,
  libraryRecords: supplierLibrary.filter((supplier) => supplier.sourceType).length,
  uniqueNames: new Set(supplierSourceRecords.map((supplier) => normalizeSupplierName(supplier.name))).size,
}

export const readinessItems = [
  '配方打样与稳定性测试',
  '包材打样与确认',
  '产品安全评估',
  '合规资料与宣称审核',
  '首批生产排期确认',
  '商品视觉与详情页',
  '渠道与首发计划',
  '上市评审会',
]

const dimension = (label, focus, evidence) => ({ label, focus, evidence })

const playbookStage = (focus, dimensions, decision, output, risks) => ({
  focus,
  dimensions,
  decision,
  output,
  risks,
})

export const developmentBlueprint = [
  {
    id: 'research',
    label: '市场调研',
    short: '市场',
    role: '判断机会是否值得进入',
    universalInput: '行业信号、用户反馈、渠道数据',
    universalOutput: '市场机会与反证清单',
  },
  {
    id: 'audience',
    label: '人群分析',
    short: '人群',
    role: '明确最先服务的用户和场景',
    universalInput: '场景、任务、痛点、购买阻力',
    universalOutput: '核心人群与验证假设',
  },
  {
    id: 'competitors',
    label: '竞品分析',
    short: '竞品',
    role: '识别拥挤区、空档和进入门槛',
    universalInput: 'Top 商品、价格、结构、评价',
    universalOutput: '差异方向与避坑边界',
  },
  {
    id: 'concepts',
    label: '功能概念',
    short: '概念',
    role: '把机会翻译成可验证的产品方案',
    universalInput: '人群任务、技术或配方、成本约束',
    universalOutput: '多套概念与测试清单',
  },
  {
    id: 'positioning',
    label: '产品定位',
    short: '定位',
    role: '统一价值、价格与渠道表达',
    universalInput: '概念、竞品区间、渠道规则',
    universalOutput: '定位、价格带与一句话卖点',
  },
  {
    id: 'packaging',
    label: '包装设计',
    short: '包装',
    role: '让产品形态和信息可被看见与使用',
    universalInput: '结构、材质、信息、视觉方向',
    universalOutput: '结构方案、视觉稿与打样边界',
  },
  {
    id: 'factory',
    label: '落地工厂',
    short: '落地',
    role: '将方案拆成可报价、可打样的供应链任务',
    universalInput: 'BOM、规格、MOQ、质量要求',
    universalOutput: '供应商组合、成本和风险计划',
  },
  {
    id: 'outcome',
    label: '产品效果',
    short: '成果',
    role: '形成可评审、可交接的项目版本',
    universalInput: '已确认决策、样品和验证记录',
    universalOutput: '产品卡、上市准备与下一步任务',
  },
]

export const categoryTemplates = [
  {
    id: 'eye-oil',
    name: '眼部精华油',
    category: '美妆个护',
    summary: '以配方体验、宣称边界、滚珠结构和包材相容性为核心的护肤开发方法论。',
    project: {
      name: '20ml滚珠眼部精华油',
      form: '油相滚珠精华',
      structure: '20ml玻璃滚珠瓶 + 白卡纸盒',
      channel: '天猫 / 抖音 / 小红书',
      priceBand: '69-99元',
      sourceCount: 35,
      sourceLabel: '市场研究资料',
      launch: '2026年12月',
    },
    assumptions: {
      user: '25-40岁高频用眼、关注眼周疲态的职场女性',
      price: 89,
      targetCost: 16,
      channel: '天猫 / 抖音 / 小红书',
      launch: '2026年12月',
    },
    packaging: {
      brandName: '植萃修护',
      productName: '眼部精华油',
      style: '自然植萃 · 现代简约',
      palette: ['#c9685a', '#f4f1e9', '#58725c', '#242826'],
      description: '天然植萃成分，温和修护；简约自然的专业护肤风格，突出植物元素与便携滚珠体验。',
    },
    stageProfiles: {
      research: playbookStage('从疲态、干燥与按摩体验中验证便携眼部护理的真实需求。', [
        dimension('需求变化', '疲态、干燥、按摩体验是否共同出现', '趋势报告、搜索词、内容热度'),
        dimension('负面反馈', '油腻、刺激、漏液是否会抵消价值', '评论聚类、售后和试用反馈'),
        dimension('价格带', '69-99元是否有足够的体验升级空间', 'Top SKU价格与成交口径'),
      ], '是否值得以“轻润滚珠眼油”进入验证，而不是直接量产。', '市场机会判断、反证清单、待补数据。', ['不能把趋势直接视为销量', '功效表达必须由证据支持']),
      audience: playbookStage('围绕高频用眼、妆前、睡前与出差场景锁定首个使用人群。', [
        dimension('使用任务', '即时舒缓、轻润修护、便携按摩', '访谈、日记研究、评论语境'),
        dimension('购买阻力', '担心油感、刺激和卫生问题', '差评、问答、概念访谈'),
        dimension('复购条件', '肤感、顺滑度与不漏液', '试用测试、复购访谈'),
      ], '优先服务哪个场景，哪些痛点必须转成产品指标。', '核心人群、场景链路、验证问题。', ['敏感眼周不能只靠自我宣称', '人群结论需小样测试']),
      competitors: playbookStage('比较眼油、眼霜与按摩头精华的结构和价值表达。', [
        dimension('产品结构', '滚珠、滴管、泵头、按摩头的体验差异', 'Top 10商品页与实物'),
        dimension('体验证据', '轻润、按摩、温和的证明方式', '评价、测评、详情页'),
        dimension('价格规格', '价格、毫升数、包材感知是否匹配', '历史价格和规格表'),
      ], '结构差异是否能支撑89元价位而不落入廉价感。', '机会空档、必要能力、避开点。', ['竞品销量和排名需有时间口径', '不能把视觉差异当成用户价值']),
      concepts: playbookStage('将人群任务翻译为油相、滚珠、肤感和验证设计。', [
        dimension('配方方向', '轻润油相、舒缓或夜间修护', '配方师可行性评估'),
        dimension('结构体验', '滚珠材质、出液量、密封', '工程样与台架测试'),
        dimension('验证任务', '肤感、相容性、稳定性与宣称', '测试方案与合规审核'),
      ], '选择哪套概念进入打样，且清楚哪些结论尚未成立。', '三套概念、测试清单、风险边界。', ['AI不能替代配方确认', '避免医疗化或绝对化宣称']),
      positioning: playbookStage('统一专业轻护理的对象、价格和可信表达。', [
        dimension('目标人群', '高频用眼职场女性还是敏感/初老细分人群', '概念反馈'),
        dimension('价值表达', '轻润、按摩、便携的优先顺序', '渠道内容与合规审核'),
        dimension('价格带', '价值感是否覆盖包材和体验成本', '毛利模型、竞品价'),
      ], '哪一句话能说明可证明的价值并适配首发渠道。', '定位声明、价格带、渠道表达重点。', ['一句话卖点不是功效证明', '价格需回算完整成本']),
      packaging: playbookStage('让滚珠结构、准确文字与打样边界一起落地。', [
        dimension('主容器', '玻璃或PET、容量、滚珠组件', '包材规格与相容性'),
        dimension('外盒信息', '品名、容量、标签和合规信息区', '法规清单与印前审核'),
        dimension('运输风险', '破损、漏液、色差与耐磨', '跌落、倒置和耐磨测试'),
      ], '视觉和结构是否能进入打样，并能被供应商准确理解。', '2D视觉、三视图、包材验收清单。', ['三视图不等于印刷刀版', '生图文字不能直接定稿']),
      factory: playbookStage('拆解内容物、瓶器、滚珠、标签、纸盒和检测的可执行组合。', [
        dimension('BOM', '油相、玻璃瓶、滚珠、外盒、检测', '规格与报价单'),
        dimension('供应商匹配', 'MOQ、交期、历史表现和能力', '供应商库、询价记录'),
        dimension('量产风险', '相容性、密封、灌装与宣称资料', '样品测试和质量协议'),
      ], '在目标成本和首单数量下，能否形成可打样的供应商组合。', '供应商组合、成本拆分、排期与风险表。', ['样本报价不可直接当量产报价', '需验证滚珠与内容物相容性']),
      outcome: playbookStage('汇总产品卡、样品结果和上市前未决项。', [
        dimension('产品定义', '人群、概念、规格、定位与包材', '确认记录'),
        dimension('验证状态', '肤感、稳定性、密封、合规', '测试记录'),
        dimension('上市准备', '视觉、详情、首批排期与渠道', '任务清单'),
      ], '当前版本是否可进入打样评审，而不是直接承诺上市。', '产品卡、阶段门结论、下一步任务。', ['样品未通过不能进入量产', '理论毛利不等于实际利润']),
    },
  },
  {
    id: 'cold-brew',
    name: '即饮冷萃咖啡',
    category: '食品饮料',
    summary: '以风味、糖度、咖啡因、保质与渠道冷启动为核心的饮品开发方法论。',
    project: {
      name: '低糖燕麦冷萃咖啡',
      form: '即饮冷萃咖啡饮料',
      structure: '250ml铝罐 + 纸箱',
      channel: '便利店 / 抖音 / 天猫',
      priceBand: '8-12元',
      sourceCount: 22,
      sourceLabel: '饮品趋势与评价资料',
      launch: '2027年3月',
    },
    assumptions: {
      user: '18-32岁追求提神、低糖与便携的城市通勤人群',
      price: 10,
      targetCost: 3.2,
      channel: '便利店 / 抖音 / 天猫',
      launch: '2027年3月',
    },
    packaging: {
      brandName: '晨间引擎',
      productName: '低糖燕麦冷萃咖啡',
      style: '干净提神 · 通勤友好',
      palette: ['#d66f3c', '#fffaf1', '#315c4a', '#202322'],
      description: '突出低糖冷萃与燕麦口感，信息清晰、适合便利店货架识别。',
    },
    stageProfiles: {
      research: playbookStage('验证低糖冷萃在通勤、早餐和午后提神中的需求强度。', [dimension('饮用场景', '通勤、早餐替代、午后提神', '便利店走访、内容和搜索数据'), dimension('口味趋势', '苦感、燕麦感、甜度偏好', '试饮、评价语料'), dimension('价格带', '单罐8-12元的接受度', '渠道货架与成交数据')], '低糖燕麦冷萃是否有足够明确的场景和价格空间。', '场景机会、风味假设、数据缺口。', ['热度不等于复购', '渠道价格需扣除促销与进场费用']),
      audience: playbookStage('锁定把咖啡当效率工具而非精品仪式的首批用户。', [dimension('任务', '快速提神、少糖、方便带走', '访谈和随行观察'), dimension('阻力', '担心太苦、太甜或口感稀薄', '差评与试饮'), dimension('复购', '口味稳定、喝后体感和可得性', '复购数据、回访')], '谁最愿意用一罐低糖咖啡替代现有选择。', '优先人群、购买路径、试饮问题。', ['咖啡因耐受差异大', '不要把提神表述夸张化']),
      competitors: playbookStage('比较即饮咖啡、茶咖和能量饮料的风味、糖度与渠道陈列。', [dimension('配方信息', '咖啡含量、糖度、乳或燕麦基底', '标签和检测资料'), dimension('货架竞争', '罐型、色彩、陈列位', '线下走访'), dimension('价格规格', '容量、单价、组合促销', '渠道价格记录')], '在口味和包装之外，什么差异可以被消费者感知。', '空档、核心对标、进入门槛。', ['配料表需以实物为准', '促销价不能直接视为常规售价']),
      concepts: playbookStage('将低糖、燕麦和冷萃风味转为可试饮的配方概念。', [dimension('风味', '苦感、酸感、烘焙香、燕麦厚度', '盲测和感官评审'), dimension('配方', '糖度、咖啡因、稳定性', '研发小试'), dimension('保质', '杀菌、沉淀、风味衰减', '货架期测试')], '哪套风味概念能同时满足口感、成本和保质。', '风味概念、试饮方案、保质风险。', ['食品配方和标签由专业人员确认', '不能直接假设长期稳定']),
      positioning: playbookStage('在“低糖、冷萃、燕麦”中选择一个清楚的购买理由。', [dimension('价值主张', '真低糖、顺口冷萃或通勤效率', '概念测试'), dimension('价格', '单罐价与组合装策略', '毛利和渠道模型'), dimension('渠道', '便利店首发与内容种草分工', '渠道规则')], '最值得占据的心智位置与可接受价格。', '定位、货架短句、渠道表达。', ['食品营养信息必须准确', '低糖等表述须符合规范']),
      packaging: playbookStage('以罐型、信息层级和运输堆码服务货架购买。', [dimension('容器', '铝罐规格、易拉盖与耐压', '包材规格'), dimension('信息', '营养、配料、咖啡因与保质信息', '法规清单'), dimension('运输', '堆码、掉漆、渗漏和温差', '运输测试')], '包装是否能在货架被识别且能安全交付。', '罐身视觉、箱规、打样要求。', ['效果图不能替代标签审核', '需验证灌装与罐材匹配']),
      factory: playbookStage('拆解原料、萃取、灌装、罐材和检测的供应链组合。', [dimension('原料', '咖啡、燕麦基底、甜味系统', '规格和样品'), dimension('加工', '萃取、杀菌、灌装能力', '工厂能力表'), dimension('质量', '微生物、保质、批次稳定', '检测计划')], '目标成本下是否有可量产且可控品质的路线。', 'BOM、加工厂、质量计划和交期。', ['需落实食品生产资质', '必须完成保质与标签审核']),
      outcome: playbookStage('汇总风味、标签、包材和渠道试销的确认状态。', [dimension('产品卡', '口味、规格、营养与卖点', '定稿文件'), dimension('试销', '试饮、复购、退货和差评', '渠道数据'), dimension('量产门槛', '保质、合规、产能', '测试与资质')], '是否可以进入试销或首批生产。', '产品卡、试销计划、未决项。', ['试饮认可不代表规模化复购', '未完成保质测试不能量产']),
    },
  },
  {
    id: 'pet-treat',
    name: '冻干猫零食',
    category: '宠物食品',
    summary: '以适口性、原料透明、颗粒规格、包装保鲜和宠主信任为核心的宠物食品开发方法论。',
    project: {
      name: '单一蛋白冻干猫零食',
      form: '冻干颗粒零食',
      structure: '40g铝箔自立袋 + 拉链',
      channel: '天猫 / 抖音 / 宠物店',
      priceBand: '19-29元',
      sourceCount: 18,
      sourceLabel: '宠主反馈与商品资料',
      launch: '2027年4月',
    },
    assumptions: {
      user: '重视配料透明、适口性和复购的城市养猫人',
      price: 25,
      targetCost: 8,
      channel: '天猫 / 抖音 / 宠物店',
      launch: '2027年4月',
    },
    packaging: {
      brandName: '猫口福',
      productName: '单一蛋白冻干猫零食',
      style: '原料透明 · 干净可信',
      palette: ['#d18b58', '#fbf6ed', '#4e705d', '#252825'],
      description: '突出原料、适口性与保鲜，方便宠主快速理解规格与喂食边界。',
    },
    stageProfiles: {
      research: playbookStage('验证单一蛋白、配料透明与小包装复购的真实机会。', [dimension('宠主需求', '安心喂食、奖励互动、成分透明', '评论、社群和访谈'), dimension('宠物反馈', '适口性、软便、挑食风险', '试喂记录'), dimension('价格规格', '克重、单价和组合购买', 'Top SKU和订单数据')], '单一蛋白冻干是否值得以小袋高复购路线进入。', '机会判断、宠主顾虑、数据缺口。', ['宠主偏好不能代替宠物适口性', '健康相关表达需谨慎']),
      audience: playbookStage('区分买单的人与实际食用的猫，建立双角色决策链。', [dimension('购买者', '新手、精细喂养、敏感肠胃关注者', '访谈'), dimension('使用场景', '训练奖励、拌粮、出行', '日记研究'), dimension('阻力', '价格、碎渣、保存、挑食', '差评和售后')], '先服务哪类宠主，以及必须为猫验证什么。', '双角色画像、喂食场景、试喂计划。', ['不要将宠粮当治疗方案', '需区分人和宠物的需求']),
      competitors: playbookStage('比较蛋白来源、颗粒、碎渣率、袋型和喂食透明度。', [dimension('原料', '蛋白来源、单一性、配料表', '实物标签'), dimension('体验', '颗粒大小、粉化、适口性', '评价与实测'), dimension('信任信息', '溯源、批次、喂食建议', '商品页和包装')], '什么组合既能形成信任又能避免同质化。', '对标表、差异方向、避坑项。', ['成分信息必须回到实物标签', '宠物评价样本需说明品种与年龄']),
      concepts: playbookStage('将蛋白、颗粒、适口性和保鲜转为小批试喂方案。', [dimension('原料方案', '单一蛋白与原料等级', '供应商规格'), dimension('颗粒体验', '大小、脆度、碎渣', '工程样'), dimension('安全边界', '水分、微生物、喂食建议', '检测计划')], '哪套方案可在适口性、成本和安全间取得平衡。', '产品概念、试喂和检测清单。', ['必须有宠物食品检测', '喂食量和适用范围需明确']),
      positioning: playbookStage('强调原料透明与可放心奖励，而不是过度健康承诺。', [dimension('核心价值', '单一蛋白、好喂、少负担', '概念反馈'), dimension('价格', '单袋与组合装价格感知', '毛利模型'), dimension('内容', '原料解释、喂食场景与真实反馈', '渠道内容')], '可信表达和价格是否与宠主决策方式匹配。', '定位、货架短句、内容边界。', ['避免医疗功效暗示', '不要夸大适口性为所有猫适用']),
      packaging: playbookStage('确保袋材阻隔、拉链复封和喂食信息可用。', [dimension('袋材', '阻氧防潮、耐穿刺、站立性', '包材规格'), dimension('信息', '原料、营养、喂食与保存', '标签审核'), dimension('运输', '压碎、漏气、封口一致性', '跌落和密封测试')], '包装能否保持产品状态并清楚传递喂食边界。', '袋型、信息层级、打样验收。', ['视觉稿不能替代营养标签审核', '必须测试封口和阻隔']),
      factory: playbookStage('对接原料、冻干加工、包装、检测和批次追溯。', [dimension('加工', '冻干能力、批次稳定、最小订单', '工厂审核'), dimension('质控', '水分、微生物、异物控制', '检测报告'), dimension('包装', '充氮、封口、批次码', '产线验证')], '能否建立小批试产并留出质量追溯。', '供应商组合、质量计划、成本表。', ['食品资质与检测不可缺失', '不同蛋白原料的过敏风险需说明']),
      outcome: playbookStage('汇总试喂、检测、包装和首发渠道准备。', [dimension('确认版本', '原料、颗粒、规格、包装', '定稿记录'), dimension('试喂反馈', '适口性、便便、复购意向', '试喂日志'), dimension('上市条件', '检测、库存、客服知识', '清单')], '是否具备首批小规模销售条件。', '产品卡、试销清单、风险追踪。', ['试喂样本不可过度外推', '质量异常需有召回与追溯准备']),
    },
  },
  {
    id: 'home-care',
    name: '浓缩洗衣凝珠',
    category: '家居清洁',
    summary: '以去污体验、香型残留、溶解性、儿童安全与运输稳定性为核心的家清开发方法论。',
    project: {
      name: '低敏浓缩洗衣凝珠',
      form: '水溶膜洗衣凝珠',
      structure: '12颗密封袋 + 纸盒',
      channel: '天猫 / 抖音 / 商超',
      priceBand: '29-39元',
      sourceCount: 16,
      sourceLabel: '家清评价与趋势资料',
      launch: '2027年5月',
    },
    assumptions: {
      user: '追求省事、气味舒适且关注家庭使用安全的年轻家庭',
      price: 35,
      targetCost: 12,
      channel: '天猫 / 抖音 / 商超',
      launch: '2027年5月',
    },
    packaging: {
      brandName: '日常清单',
      productName: '低敏浓缩洗衣凝珠',
      style: '洁净克制 · 家庭友好',
      palette: ['#5d9a8c', '#f7faf7', '#6684a7', '#21302c'],
      description: '突出用量、衣物适配、保存方式与安全提醒，避免过度功效化表达。',
    },
    stageProfiles: {
      research: playbookStage('验证省时洗护、低香或低敏需求与凝珠形态的接受度。', [dimension('洗护场景', '日常机洗、换季、婴童衣物分洗', '访谈和搜索数据'), dimension('负面体验', '不溶、残留、香味刺鼻、漏液', '评论和售后'), dimension('替代品', '洗衣液、洗衣粉、洗衣片', '渠道商品数据')], '凝珠形态是否解决了真实麻烦，并有清楚的安全边界。', '机会、风险、验证优先级。', ['低敏等表述需有证据', '不应把清洁品描述为医疗产品']),
      audience: playbookStage('锁定愿意为省时、易用与安心付费的首批家庭。', [dimension('任务', '定量、便携、洗后气味舒适', '访谈'), dimension('阻力', '担心儿童误食、膜不溶、价格', '评论'), dimension('复购', '去污稳定、衣物手感、易保存', '试用回访')], '哪些需求必须被产品体验和说明共同满足。', '核心家庭、决策链、试用问题。', ['家庭人群差异明显', '安全提醒必须突出']),
      competitors: playbookStage('对比活性、香型、颗数、膜材和安全设计。', [dimension('清洁力', '污渍类型与适用水温', '实测和标签'), dimension('使用体验', '溶解、香味、残留、取用', '评价'), dimension('安全设计', '外包、防潮、警示信息', '实物包装')], '是否存在同时兼顾易用和安全感的空档。', '对标表、进入门槛、避坑点。', ['商品页的去污承诺需验证', '关注不同洗衣机和水温']),
      concepts: playbookStage('把去污、香型、溶解和安全转换为配方与使用测试。', [dimension('配方', '表活、酶、香精或无香方向', '研发小试'), dimension('膜材', '水溶性、防潮、耐运输', '样品测试'), dimension('适配性', '水温、衣物、洗衣机', '场景测试')], '哪套概念能在性能、稳定性和成本间成立。', '概念、使用测试、风险边界。', ['不能凭概念直接承诺去污能力', '需验证误用场景']),
      positioning: playbookStage('在省事、洁净、低香和家庭安心之间选择可信主张。', [dimension('主张', '一次一颗、低香、衣物友好', '概念测试'), dimension('价格', '单次成本与整盒价格', '单位经济模型'), dimension('渠道', '电商教育与商超货架信息', '渠道研究')], '什么价值最能解释价格并避免误导。', '定位、使用短句、渠道表达。', ['不要制造绝对安全承诺', '声明须与检测和标签一致']),
      packaging: playbookStage('围绕防潮、儿童安全、颗数和用量信息设计外包装。', [dimension('内包', '密封袋、防潮、取用', '包材规格'), dimension('外盒', '警示、图示、储存和规格', '法规与印前审核'), dimension('运输', '漏液、挤压、温湿度', '运输模拟')], '包装能否同时服务安全、保存和使用理解。', '袋盒方案、信息版式、验收项。', ['需审阅安全警示', '效果图不替代包材测试']),
      factory: playbookStage('对接配方、凝珠成型、包装、检测与仓储条件。', [dimension('制造', '成型精度、膜材、封装', '工厂能力'), dimension('质量', '重量、泄漏、溶解性、稳定性', '检验计划'), dimension('仓储', '温湿度、挤压和保质', '物流要求')], '工厂和物流条件是否能保护凝珠的一致性。', 'BOM、供应商、质控和交期。', ['需确认生产与安全规范', '夏季运输风险要单列']),
      outcome: playbookStage('汇总性能验证、安全信息和上市前客服准备。', [dimension('产品卡', '颗数、用量、场景、价格', '定稿'), dimension('性能', '去污、溶解、残留、稳定性', '测试记录'), dimension('上市', '库存、详情页、安全问答', '任务清单')], '是否具备首批发售条件。', '产品卡、风险清单、下一步任务。', ['未完成稳定性和包装测试不可量产', '安全问题需有明确售后预案']),
    },
  },
  {
    id: 'digital-accessory',
    name: '65W氮化镓充电器',
    category: '数码配件',
    summary: '以兼容性、功率体验、散热、安全认证和电商信息透明为核心的数码产品开发方法论。',
    project: {
      name: '65W双口氮化镓充电器',
      form: 'USB-C双口快充适配器',
      structure: '折叠插脚充电器 + 内托彩盒',
      channel: '天猫 / 京东 / 抖音',
      priceBand: '99-149元',
      sourceCount: 24,
      sourceLabel: '数码商品与售后资料',
      launch: '2027年2月',
    },
    assumptions: {
      user: '拥有手机、平板和笔记本，希望减少充电器数量的通勤用户',
      price: 129,
      targetCost: 48,
      channel: '天猫 / 京东 / 抖音',
      launch: '2027年2月',
    },
    packaging: {
      brandName: '随行功率',
      productName: '65W双口氮化镓充电器',
      style: '科技克制 · 参数清楚',
      palette: ['#2e7d9b', '#f5f8fb', '#657f91', '#18232b'],
      description: '突出端口、协议、功率分配与兼容范围，减少消费者对参数的猜测。',
    },
    stageProfiles: {
      research: playbookStage('验证多设备合一、轻量出行和协议兼容的真实痛点。', [dimension('设备场景', '手机、平板、笔记本共用', '问答、评论和访谈'), dimension('性能期待', '快充、双口分配、发热', '售后与测评'), dimension('价格带', '99-149元的性能感知', 'Top SKU和成交')], '双口65W是否解决明确的设备组合问题。', '机会、用户痛点、技术约束。', ['协议和功率需实测', '不能只参考标称参数']),
      audience: playbookStage('锁定多设备、经常出行且重视兼容性的用户。', [dimension('任务', '少带一个充电器、稳定快充', '访谈'), dimension('阻力', '担心虚标、发热、伤设备', '差评和售后'), dimension('决策证据', '协议表、实测、认证', '内容测试')], '哪类设备组合最值得优先服务。', '核心设备组合、购买阻力、测试问题。', ['兼容性需要明确边界', '不能以单设备体验概括全部设备']),
      competitors: playbookStage('比较端口、协议、功率分配、体积和售后。', [dimension('功率', '单口/双口分配与持续输出', '规格与实测'), dimension('结构', '折叠脚、体积、插拔稳定', '实物和评价'), dimension('信任', '认证、保修、售后响应', '商品页和售后')], '什么能力能形成可解释而非参数堆叠的差异。', '对标、空档、硬性门槛。', ['参数表需统一测试条件', '认证状态不能假设']),
      concepts: playbookStage('把功率、端口、散热和便携组合成工程可行的概念。', [dimension('电气', '协议、功率分配、纹波保护', '工程评审'), dimension('结构', '体积、插脚、散热路径', '样机'), dimension('可靠性', '温升、插拔、跌落', '可靠性测试')], '哪套方案可通过性能、安全与成本约束。', '产品概念、样机计划、验证清单。', ['需由工程团队确认电气方案', '不要将认证视为可后补项目']),
      positioning: playbookStage('将“多设备一充”表达为看得懂的能力边界。', [dimension('核心卖点', '双口、65W、便携、兼容', '概念测试'), dimension('价格', '功率和服务是否支持129元', '成本模型'), dimension('内容', '功率分配、兼容设备、使用场景', '渠道详情规范')], '用什么语言解释性能并降低参数焦虑。', '定位、规格声明、内容结构。', ['必须清楚说明功率分配', '禁用不实兼容承诺']),
      packaging: playbookStage('让参数、认证、内托保护和开箱体验可被准确理解。', [dimension('内托', '跌落保护、线材收纳、环保材料', '结构打样'), dimension('信息', '端口、协议、功率、认证与警示', '法规和认证文件'), dimension('运输', '跌落、挤压、外箱堆码', '包装测试')], '包装能否保护产品并防止参数误解。', '包装结构、信息版式、测试要求。', ['效果图不是认证文件', '包装信息需与实物固件一致']),
      factory: playbookStage('协调PCBA、壳体、装配、老化、认证和包装供应商。', [dimension('核心料件', '芯片、磁件、壳体、插脚', 'BOM与供应链'), dimension('制造', 'SMT、装配、老化、测试', '工厂能力'), dimension('合规', '安规、EMC、能效与标签', '认证计划')], '供应链能否在性能、良率和合规上同步达标。', 'BOM、工厂组合、认证和质量计划。', ['认证周期需计入上市时间', '不可跳过老化与安全测试']),
      outcome: playbookStage('汇总兼容性、可靠性、认证和上市物料。', [dimension('产品卡', '型号、端口、功率、尺寸', '定稿'), dimension('测试', '温升、协议、跌落、老化', '报告'), dimension('上市', '认证、客服问答、售后政策', '清单')], '是否具备对外销售和售后承接条件。', '产品卡、测试状态、上市门槛。', ['实测范围必须透明', '认证未完成不可宣称已取得']),
    },
  },
]

export function getCategoryTemplate(templateId) {
  return categoryTemplates.find((template) => template.id === templateId) || categoryTemplates[0]
}

// An opportunity is the traceable output of prior market research. It is the
// entry point for a project; the product category is a recommended response.
export const marketOpportunities = [
  {
    id: 'screen-eye-care',
    title: '高频用眼的轻护理空档',
    summary: '用户同时在意疲态、干燥和即时按摩，但现有眼霜、眼油与按摩头产品往往只解决其中一项。',
    signal: '评论和访谈持续出现“便携、轻润、不要油腻”的组合需求。',
    evidence: '35份眼部护理趋势、评价与竞品资料',
    confidence: '证据较充分',
    decision: '先验证可随身使用的滚珠轻护理方案，并把油感、温和与漏液设为硬门槛。',
    fitReason: '滚珠眼部精华油可以把轻润、按摩和便携放进同一使用动作。',
    templateId: 'eye-oil',
  },
  {
    id: 'low-sugar-commute-coffee',
    title: '通勤提神与低糖口感的平衡',
    summary: '城市通勤人群需要即时提神，但对高糖、厚重乳感和不方便携带的咖啡饮品保持警惕。',
    signal: '低糖、燕麦、冷萃和便利店即饮场景在商品评价中高频共现。',
    evidence: '22份饮品趋势、渠道商品与消费者评价资料',
    confidence: '需要口感验证',
    decision: '围绕低糖冷萃与燕麦口感做小样测试，再判断是否进入便利店价格带。',
    fitReason: '即饮冷萃可以在通勤场景中验证“提神但不负担”的价值组合。',
    templateId: 'cold-brew',
  },
  {
    id: 'transparent-cat-treat',
    title: '宠主对原料透明和适口性的双重需求',
    summary: '宠主愿意为单一蛋白、原料清楚的零食付费，但复购仍取决于猫的适口性和储存体验。',
    signal: '成分表、蛋白来源、挑食和开袋后保存问题反复出现。',
    evidence: '18份宠物商品、宠主反馈与竞品资料',
    confidence: '需要适口性验证',
    decision: '先做单一蛋白冻干试吃，验证适口性、碎渣率和复购理由。',
    fitReason: '冻干猫零食便于用原料透明、单一蛋白和适口性来形成可测试差异。',
    templateId: 'pet-treat',
  },
  {
    id: 'family-laundry-safety',
    title: '家庭洗护中的省事与安全感空档',
    summary: '家庭用户想减少用量判断和瓶瓶罐罐，同时担心凝珠的误食、防潮和溶解表现。',
    signal: '定量、省空间、低香与儿童安全在评价和问答中共同出现。',
    evidence: '16份家清趋势、商品评价与问答资料',
    confidence: '需要场景测试',
    decision: '先验证低敏凝珠在不同水温和洗衣机中的溶解与安全信息理解。',
    fitReason: '浓缩洗衣凝珠能把定量便利、防潮包装和安全提示一起纳入产品体验。',
    templateId: 'home-care',
  },
  {
    id: 'multi-device-charging',
    title: '多设备出行的充电负担',
    summary: '用户希望一只充电器解决手机、平板和笔记本，但对功率分配、发热和兼容性缺少信任。',
    signal: '双口、便携、协议兼容和温升问题在售后与测评中高频出现。',
    evidence: '24份数码商品、售后与测评资料',
    confidence: '需要性能实测',
    decision: '先以双口65W为基准，验证持续功率、温升和真实设备组合。',
    fitReason: '65W双口氮化镓充电器能直接回应多设备共用与出行减负场景。',
    templateId: 'digital-accessory',
  },
]

export const opportunityStatusOptions = [
  { id: 'capture', label: '待整理', tone: 'neutral', description: '资料已进入库，但尚未形成清晰机会判断。' },
  { id: 'review', label: '待评审', tone: 'warning', description: '机会方向已出现，等待团队判断是否投入验证。' },
  { id: 'validation', label: '待验证', tone: 'warning', description: '关键假设仍需通过用户、样品、渠道或成本验证。' },
  { id: 'ready', label: '可建项', tone: 'success', description: '证据、路径与约束足以建立开发项目。' },
  { id: 'paused', label: '暂缓', tone: 'neutral', description: '当前不投入，保留资料和复盘原因。' },
]

const evidenceItem = (id, finding, source, confidence, scope, note) => ({
  id,
  finding,
  source,
  date: '2026-09',
  sample: '已归档样本',
  confidence,
  scope,
  note,
})

export const opportunityResearch = {
  'screen-eye-care': {
    stage: 'ready',
    targetUser: '25-40岁高频用眼、在通勤、空调房和睡前需要即时轻护理的职场人群。',
    unmetNeed: '用户不是只想淡纹，而是想在不油腻、不刺激、不漏液的前提下完成舒缓、轻润和按摩。',
    counterEvidence: '“眼油”本身可能引发油感、刺激和卫生疑虑，结构体验不能仅凭商品页成立。',
    scoreBreakdown: { demand: 86, differentiation: 75, margin: 72, feasibility: 69, evidence: 82 },
    evidenceItems: [
      evidenceItem('MO-EYE-01', '眼部护理需求由单一淡纹转向疲态、干燥与按摩体验并重。', '美妆个护趋势资料库', '高', '趋势方向判断', '可支持机会定义，不能直接推导单品销量。'),
      evidenceItem('MO-EYE-02', '滚珠结构在便携、按摩与使用仪式感方面具有明显表达优势。', '竞品与产品案例库', '高', '结构差异判断', '需要用真实出液、密封和肤感测试复核。'),
      evidenceItem('MO-EYE-03', '用户负面反馈集中在油腻、吸收慢、刺激和包装漏液。', '用户评论聚类', '中高', '风险与反证', '样品验证应优先覆盖油感、温和与漏液。'),
    ],
    directions: [
      {
        id: 'roll-on-eye-oil',
        name: '轻润滚珠眼部精华油',
        premise: '以滚珠结构把轻润、按摩与便携整合成一件产品。',
        templateId: 'eye-oil',
        buildable: true,
        recommended: true,
        scores: { userFit: 86, differentiation: 78, margin: 72, feasibility: 69 },
        risk: '油感、刺激、出液量和倒置漏液必须先过样品门。',
        project: { name: '20ml滚珠眼部精华油', form: '油相滚珠精华', structure: '20ml玻璃滚珠瓶 + 白卡纸盒', priceBand: '69-99元' },
      },
      {
        id: 'eye-serum-pump',
        name: '咖啡因眼部精华',
        premise: '更强调清爽和功效成分，降低用户对油感的顾虑。',
        templateId: 'eye-oil',
        buildable: false,
        recommended: false,
        scores: { userFit: 75, differentiation: 54, margin: 71, feasibility: 76 },
        risk: '更接近拥挤的眼精华赛道；尚未配置独立的配方和功效验证方法论。',
      },
      {
        id: 'night-eye-mask',
        name: '夜间修护眼膜',
        premise: '把睡前仪式感和局部修护作为核心使用任务。',
        templateId: 'eye-oil',
        buildable: false,
        recommended: false,
        scores: { userFit: 62, differentiation: 58, margin: 60, feasibility: 52 },
        risk: '需要先验证贴合、刺激性、储存和一次性使用成本。',
      },
    ],
  },
  'low-sugar-commute-coffee': {
    stage: 'validation',
    targetUser: '18-32岁需要通勤、早餐替代和午后提神的城市消费者。',
    unmetNeed: '消费者想要低糖、清爽、方便买到的即饮咖啡，而不是高糖或厚重乳咖。',
    counterEvidence: '搜索和内容热度无法证明口感复购；便利店定价与促销成本也会压缩利润。',
    scoreBreakdown: { demand: 78, differentiation: 63, margin: 66, feasibility: 74, evidence: 58 },
    evidenceItems: [
      evidenceItem('MO-COF-01', '低糖、燕麦、冷萃和便利店即饮场景在商品评价中高频共现。', '饮品趋势与商品评价资料', '中', '需求与口味方向', '需要用盲测区分“喜欢概念”和“愿意复购”。'),
      evidenceItem('MO-COF-02', '8-12元是通勤即饮咖啡的主要可感知比较区间。', '便利店货架与价格跟踪', '中', '价格带判断', '尚未扣除渠道进场、促销与冷链损耗。'),
    ],
    directions: [
      { id: 'oat-cold-brew', name: '低糖燕麦冷萃咖啡', premise: '用燕麦口感降低黑咖啡门槛，服务早餐与通勤。', templateId: 'cold-brew', buildable: true, recommended: true, scores: { userFit: 80, differentiation: 65, margin: 64, feasibility: 73 }, risk: '燕麦感、甜度和咖啡风味需通过小样盲测。', project: { name: '低糖燕麦冷萃咖啡', form: '即饮冷萃咖啡饮料', structure: '250ml铝罐 + 纸箱', priceBand: '8-12元' } },
      { id: 'black-cold-brew', name: '清爽黑冷萃咖啡', premise: '以低糖甚至无糖、轻负担作为通勤提神选择。', templateId: 'cold-brew', buildable: true, recommended: false, scores: { userFit: 66, differentiation: 51, margin: 71, feasibility: 82 }, risk: '口味门槛高，容易与现有黑咖啡同质化。', project: { name: '清爽黑冷萃咖啡', form: '即饮黑冷萃咖啡', structure: '250ml铝罐 + 纸箱', priceBand: '7-10元' } },
      { id: 'protein-cold-brew', name: '蛋白冷萃咖啡', premise: '把午后提神与轻饱腹结合，探索更高客单。', templateId: 'cold-brew', buildable: true, recommended: false, scores: { userFit: 58, differentiation: 74, margin: 59, feasibility: 48 }, risk: '风味稳定、沉淀和法规标识需要额外验证。', project: { name: '蛋白冷萃咖啡饮料', form: '复合蛋白即饮咖啡', structure: '280ml利乐砖 + 纸箱', priceBand: '12-16元' } },
    ],
  },
  'transparent-cat-treat': {
    stage: 'review',
    targetUser: '关注配料表、猫咪适口性和日常投喂安全感的城市宠主。',
    unmetNeed: '用户希望看懂蛋白来源，并能判断零食是否值得长期复购。',
    counterEvidence: '宠主偏好不等于猫咪偏好；原料透明也可能抬高采购成本。',
    scoreBreakdown: { demand: 72, differentiation: 67, margin: 61, feasibility: 70, evidence: 55 },
    evidenceItems: [evidenceItem('MO-PET-01', '成分表、蛋白来源、挑食和开袋后保存问题反复出现。', '宠主反馈与商品问答', '中', '需求和复购风险', '需要猫咪试吃和保存测试进一步验证。')],
    directions: [
      { id: 'single-protein-freeze-dried', name: '单一蛋白冻干猫零食', premise: '以原料透明和适口性做第一轮验证。', templateId: 'pet-treat', buildable: true, recommended: true, scores: { userFit: 76, differentiation: 69, margin: 61, feasibility: 70 }, risk: '适口性、碎渣率和供应稳定性仍待验证。', project: { name: '单一蛋白冻干猫零食', form: '冻干颗粒零食', structure: '40g铝箔自立袋 + 拉链', priceBand: '19-29元' } },
      { id: 'freeze-dried-mix', name: '冻干拌粮伴侣', premise: '增加每日投喂频次，向拌粮场景延展。', templateId: 'pet-treat', buildable: true, recommended: false, scores: { userFit: 64, differentiation: 62, margin: 58, feasibility: 66 }, risk: '功能表达与投喂剂量需要更强证据。', project: { name: '冻干拌粮伴侣', form: '冻干拌粮颗粒', structure: '60g罐装 + 铝箔封口', priceBand: '29-39元' } },
    ],
  },
  'family-laundry-safety': {
    stage: 'validation',
    targetUser: '希望减少洗衣步骤、在意低香和家庭安全提示的年轻家庭。',
    unmetNeed: '用户需要稳定省事的定量清洁体验，也需要看得懂的保存和安全边界。',
    counterEvidence: '不同水温、机型和夏季运输都可能影响溶解与安全体验。',
    scoreBreakdown: { demand: 73, differentiation: 57, margin: 64, feasibility: 60, evidence: 62 },
    evidenceItems: [evidenceItem('MO-HOME-01', '定量、省空间、低香与儿童安全在评价和问答中共同出现。', '家清评价与趋势资料', '中', '使用任务判断', '需要把安全理解和溶解表现拆开验证。')],
    directions: [
      { id: 'sensitive-laundry-pods', name: '低敏浓缩洗衣凝珠', premise: '用低香与定量便利切入家庭洗护。', templateId: 'home-care', buildable: true, recommended: true, scores: { userFit: 75, differentiation: 57, margin: 65, feasibility: 60 }, risk: '膜材、低温溶解和儿童安全信息要一起验证。', project: { name: '低敏浓缩洗衣凝珠', form: '水溶膜洗衣凝珠', structure: '12颗密封袋 + 纸盒', priceBand: '29-39元' } },
      { id: 'travel-laundry-sheets', name: '旅行洗衣纸', premise: '面向出行和小空间收纳的轻量清洁方案。', templateId: 'home-care', buildable: true, recommended: false, scores: { userFit: 60, differentiation: 70, margin: 56, feasibility: 54 }, risk: '去污能力、受潮和用户教育成本较高。', project: { name: '旅行洗衣纸', form: '浓缩洗衣纸', structure: '20片铝箔袋 + 纸盒', priceBand: '19-29元' } },
    ],
  },
  'multi-device-charging': {
    stage: 'review',
    targetUser: '同时携带手机、平板和笔记本的通勤与差旅人群。',
    unmetNeed: '用户想减少充电器数量，但不愿承担兼容、发热和功率虚标风险。',
    counterEvidence: '参数表不等于实际输出，认证和售后能力会显著改变产品可信度。',
    scoreBreakdown: { demand: 75, differentiation: 61, margin: 63, feasibility: 56, evidence: 59 },
    evidenceItems: [evidenceItem('MO-DIG-01', '双口、便携、协议兼容和温升问题在售后与测评中高频出现。', '数码售后与测评资料', '中', '性能与信任边界', '必须统一测试条件，不能用标称参数替代实测。')],
    directions: [
      { id: 'dual-port-65w', name: '65W双口氮化镓充电器', premise: '以多设备共充和便携作为可解释的首发价值。', templateId: 'digital-accessory', buildable: true, recommended: true, scores: { userFit: 78, differentiation: 61, margin: 63, feasibility: 56 }, risk: '协议、温升、持续输出和认证周期必须进入立项门。', project: { name: '65W双口氮化镓充电器', form: 'USB-C双口快充适配器', structure: '折叠插脚充电器 + 内托彩盒', priceBand: '99-149元' } },
      { id: 'travel-charging-kit', name: '旅行充电套装', premise: '用充电器、线材和收纳组合服务差旅打包需求。', templateId: 'digital-accessory', buildable: true, recommended: false, scores: { userFit: 65, differentiation: 67, margin: 58, feasibility: 61 }, risk: '组合BOM和配件品质会提高供应链复杂度。', project: { name: '65W旅行充电套装', form: '充电器 + 数据线组合', structure: '折叠插脚充电器 + 线材收纳盒彩盒', priceBand: '149-199元' } },
    ],
  },
}

export function getMarketOpportunities(customOpportunities = []) {
  const seeded = marketOpportunities.map((opportunity) => ({ ...opportunity, ...(opportunityResearch[opportunity.id] || {}) }))
  return [...seeded, ...customOpportunities]
}

export function getMarketOpportunity(opportunityId, customOpportunities = []) {
  const opportunities = getMarketOpportunities(customOpportunities)
  return opportunities.find((item) => item.id === opportunityId) || opportunities[0]
}

export function getProductDirection(opportunity, directionId) {
  const directions = opportunity?.directions || []
  return directions.find((direction) => direction.id === directionId)
    || directions.find((direction) => direction.recommended)
    || directions[0]
}

export function createOpportunityWorkspace() {
  const opportunities = getMarketOpportunities()
  return {
    selectedOpportunityId: opportunities[0].id,
    selectedDirectionByOpportunity: Object.fromEntries(opportunities.map((opportunity) => [opportunity.id, getProductDirection(opportunity)?.id || ''])),
    statusByOpportunity: Object.fromEntries(opportunities.map((opportunity) => [opportunity.id, opportunity.stage || 'capture'])),
    customOpportunities: [],
    importedSources: [],
    customEvidence: [],
    decisionLog: [
      {
        id: 'decision-seed',
        type: '资料归档',
        title: '已载入示例市场机会池',
        detail: '机会、路径和证据均可继续用真实市场资料更新。',
        createdAt: '项目初始化',
      },
    ],
  }
}

function getOpportunityForTemplate(templateId) {
  return marketOpportunities.find((opportunity) => opportunity.templateId === templateId) || marketOpportunities[0]
}

function cloneDefaultPackaging(template) {
  const packaging = template.packaging
  return {
    ...defaultPackagingDesign,
    brandName: packaging.brandName,
    productName: packaging.productName,
    style: packaging.style,
    palette: [...packaging.palette],
    description: packaging.description,
    generatedConcepts: [],
    gateChecks: [],
    referenceImages: [],
    partSettings: Object.fromEntries(Object.entries(defaultPackagingDesign.partSettings).map(([key, value]) => [key, { ...value }])),
  }
}

export function createProjectState(templateId = 'eye-oil', opportunityId, directionId, customOpportunities = []) {
  const opportunity = opportunityId
    ? getMarketOpportunity(opportunityId, customOpportunities)
    : getMarketOpportunity(getOpportunityForTemplate(templateId).id)
  const direction = getProductDirection(opportunity, directionId)
  const template = getCategoryTemplate(direction?.templateId || opportunity.templateId)
  return {
    projectId: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activeStage: 0,
    completed: [],
    templateId: template.id,
    selectedOpportunityId: opportunity.id,
    selectedDirectionId: direction?.id || '',
    project: { ...template.project, ...(direction?.project || {}) },
    assumptions: { ...template.assumptions, ...(direction?.assumptions || {}) },
    opportunityWorkspace: createOpportunityWorkspace(),
    stageNotes: {},
    selectedAudience: 'office',
    selectedConcept: 'light',
    conceptWeights: { ...defaultConceptWeights },
    conceptVersions: [
      {
        id: 'concept-v1',
        label: 'V1.0',
        type: '初始方案',
        conceptId: 'light',
        summary: '默认以需求强度和差异体验优先，选中轻润按摩型作为首发候选。',
        createdAt: '当前会话',
      },
    ],
    conceptBrief: null,
    selectedPositioning: 'professional',
    selectedPackaging: 'amber',
    supplierSelections: {
      formula: 'sl-001',
      bottle: 'sl-002',
      applicator: 'sl-003',
      label: 'sl-004',
      carton: 'sl-005',
      testing: 'sl-006',
    },
    supplierWorkbench: {
      shortlist: {},
      backups: {},
      statuses: {},
      notes: {},
      quoteAdjustments: {},
      costModel: { taxRate: 0, shipping: 0, tooling: 0, wasteRate: 0 },
    },
    supplierLibraryOverride: null,
    supplierLibraryMeta: null,
    supplierLibraryHistory: [],
    packagingDesign: cloneDefaultPackaging(template),
    readiness: [0, 1, 2, 3],
  }
}

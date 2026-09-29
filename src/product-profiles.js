const baseParts = [
  { id: 'carton', kind: 'image', number: 1 },
  { id: 'illustration', kind: 'image', number: 2 },
  { id: 'brand', kind: 'text', field: 'brandName', number: 3 },
  { id: 'product', kind: 'text', field: 'productName', number: 4 },
  { id: 'bottleLabel', kind: 'image', number: 5 },
  { id: 'cap', kind: 'image', number: 6 },
]

const profiles = {
  'eye-oil': {
    category: '眼部护理',
    productType: '滚珠眼部精华油',
    packagingObject: '滚珠瓶与纸盒',
    imageComposition: '一只正面朝向镜头的滚珠瓶和对应纸盒，瓶器在左、纸盒在右',
    fallbackImage: '/assets/eye-oil-packaging-base-v2.png',
    deliveryFallbackImage: '/assets/eye-oil-packaging-photoreal-three-view-v1.png',
    supportsStructural3D: true,
    parts: ['纸盒正面', '植物插画', '品牌文字', '产品名称', '瓶身标签', '瓶盖'],
    editPrompt: '植物插画缩小20%，保持其他部位不变',
    styles: ['自然植萃 · 现代简约', '草本清新 · 植物插画', '高端质感 · 简约线条', '专业功效 · 实验室感'],
    briefConstraints: {
      structureLabel: '瓶器与出液结构',
      conditionLabel: '本轮重点约束',
      conditionOptions: ['滚珠触感与顺滑', '倒置密封不漏液', '避光与油相相容', '随身携带不脏包'],
      finishLabel: '纸盒与标签工艺',
      finishOptions: ['哑光覆膜', '局部UV', '烫金', '特种纸'],
      referenceHint: '可上传瓶器、标签、纸盒或氛围参考，AI会优先理解结构和视觉语言。',
    },
    technology: '角鲨烷 · 霍霍巴籽油 · 咖啡因',
    sampleFocus: ['3版油相粘度小试', '304不锈钢滚珠出液量测试', '20人妆前和睡前半脸体验'],
    specLabels: ['瓶器', '出液结构', '纸盒工艺'],
    specNotes: ['校验尺寸、材质与批次色差', '验证顺滑、出液均匀与倒置密封', '确认抗压、运输保护与印刷可实现性'],
    gateDetails: {
      structure: '瓶器、滚珠、纸盒工艺与当前目标成本和首单数量相容。',
      risk: '漏液、破损、出液量、色差和法规宣称进入打样验证。',
    },
  },
  'cold-brew': {
    category: '即饮咖啡',
    productType: '即饮冷萃咖啡',
    packagingObject: '铝罐与运输纸箱',
    imageComposition: '一只完整直立的铝罐作为主体，旁边展示同系列运输纸箱或组合装',
    supportsStructural3D: false,
    parts: ['罐身正面', '风味主视觉', '品牌文字', '产品名称', '营养信息区', '易拉罐顶部'],
    editPrompt: '风味主视觉缩小10%，保持品牌和产品名称不变',
    styles: ['干净提神 · 通勤友好', '冷萃质感 · 风味突出', '货架醒目 · 信息清楚', '克制专业 · 低糖表达'],
    briefConstraints: {
      structureLabel: '罐型与运输包装',
      conditionLabel: '本轮重点约束',
      conditionOptions: ['容量与风味信息清楚', '通勤携带和开罐体验', '常温运输抗压', '低糖信息不夸大'],
      finishLabel: '罐身与外箱表现',
      finishOptions: ['哑光质感', '局部亮光', '金属质感', '可回收信息区'],
      referenceHint: '可上传罐型、货架陈列、饮品氛围或竞品信息层级参考。',
    },
    technology: '冷萃工艺 · 低糖配方 · 燕麦基底',
    sampleFocus: ['3档糖度与燕麦感盲测', '罐装稳定性与沉淀观察', '常温货架期与风味衰减测试'],
    specLabels: ['主容器', '开口结构', '外箱与印刷'],
    specNotes: ['确认罐型、容量、涂层与耐压', '验证易拉盖密封与开启体验', '校验堆码、掉漆和运输保护'],
    gateDetails: {
      structure: '罐型、易拉盖、箱规与目标成本和首单数量相容。',
      risk: '渗漏、耐压、掉漆、营养标签和保质信息进入打样验证。',
    },
  },
  'pet-treat': {
    category: '宠物食品',
    productType: '冻干猫零食',
    packagingObject: '铝箔自立袋',
    imageComposition: '一只完整直立的可复封铝箔自立袋，旁边少量展示真实冻干颗粒作为规格参照',
    supportsStructural3D: false,
    parts: ['包装袋正面', '原料主视觉', '品牌文字', '产品名称', '喂食信息区', '拉链封口'],
    editPrompt: '原料主视觉更清晰，保持喂食信息区域不变',
    styles: ['原料透明 · 干净可信', '温和陪伴 · 日常奖励', '专业营养 · 信息清楚', '自然食材 · 克制插画'],
    briefConstraints: {
      structureLabel: '袋型与封口',
      conditionLabel: '本轮重点约束',
      conditionOptions: ['拉链重复密封', '阻氧防潮', '原料和投喂信息清楚', '碎渣与开袋保存提示'],
      finishLabel: '袋面与信息呈现',
      finishOptions: ['哑光袋面', '局部亮光', '透明观察窗', '批次信息留白'],
      referenceHint: '可上传袋型、宠物场景、原料摄影或信息版式参考。',
    },
    technology: '单一蛋白 · 冻干工艺 · 阻氧保鲜',
    sampleFocus: ['猫咪适口性与复吃测试', '颗粒碎渣率和含水率检测', '袋材阻隔与复封保存测试'],
    specLabels: ['袋型', '封口结构', '印刷与信息'],
    specNotes: ['确认克重、阻隔、耐穿刺与站立性', '验证拉链复封、充氮与热封一致性', '校验原料、营养和喂食信息'],
    gateDetails: {
      structure: '袋材、拉链、充氮和印刷方案与目标成本和首单数量相容。',
      risk: '漏气、受潮、碎渣、营养标签和喂食说明进入打样验证。',
    },
  },
  'home-care': {
    category: '家庭清洁',
    productType: '浓缩洗衣凝珠',
    packagingObject: '防潮密封袋与外盒',
    imageComposition: '一套完整的防潮密封袋和外盒，包装闭合展示，不出现儿童、手部或夸张泡沫场景',
    supportsStructural3D: false,
    parts: ['外包装正面', '使用图示', '品牌文字', '产品名称', '安全警示区', '防潮封口'],
    editPrompt: '使用图示更简洁，保持安全警示区域不变',
    styles: ['洁净克制 · 家庭友好', '低香安心 · 信息清楚', '现代家务 · 高效直观', '商超识别 · 安全优先'],
    briefConstraints: {
      structureLabel: '防潮包装与外盒',
      conditionLabel: '本轮重点约束',
      conditionOptions: ['儿童安全提示醒目', '颗数与用量图示清楚', '防潮密封与储存条件', '不同洗衣机使用说明留白'],
      finishLabel: '安全信息与货架识别',
      finishOptions: ['低香信息区', '安全图示', '防潮材料标识', '商超识别色块'],
      referenceHint: '可上传袋盒结构、使用图示、商超货架或家庭场景参考。',
    },
    technology: '浓缩表活 · 水溶膜 · 防潮安全',
    sampleFocus: ['不同水温与机型溶解测试', '污渍清洁与残留对比', '高温高湿运输和防潮测试'],
    specLabels: ['主包装', '安全结构', '外盒与印刷'],
    specNotes: ['确认袋材、颗数、阻湿与耐挤压', '验证封口、储存和儿童安全提示', '校验用量图示、警示和运输保护'],
    gateDetails: {
      structure: '密封袋、外盒、防潮和安全结构与目标成本和首单数量相容。',
      risk: '漏液、受潮、不溶、挤压和安全警示进入打样验证。',
    },
  },
  'digital-accessory': {
    category: '数码配件',
    productType: '氮化镓充电器',
    packagingObject: '产品纸盒与保护内托',
    imageComposition: '一只完整的充电器产品和对应零售纸盒，清楚展示端口、插脚和包装正面',
    supportsStructural3D: false,
    parts: ['纸盒正面', '产品渲染', '品牌文字', '型号名称', '参数信息区', '保护内托'],
    editPrompt: '产品渲染放大10%，保持参数信息区域不变',
    styles: ['科技克制 · 参数清楚', '便携高效 · 结构直观', '专业性能 · 电商友好', '简洁可靠 · 认证突出'],
    briefConstraints: {
      structureLabel: '内托与保护包装',
      conditionLabel: '本轮重点约束',
      conditionOptions: ['型号与功率信息清楚', '认证信息预留', '跌落与运输保护', '封签和拆封体验'],
      finishLabel: '纸盒与参数表现',
      finishOptions: ['参数信息区', '产品渲染位', '局部亮光', '防伪封签预留'],
      referenceHint: '可上传产品渲染、纸盒开箱、参数排版或电商主图参考。',
    },
    technology: '65W GaN · 双口功率分配 · 安规认证',
    sampleFocus: ['多设备协议与功率分配实测', '满载温升和老化测试', '跌落、插拔与包装保护测试'],
    specLabels: ['产品本体', '内托保护', '纸盒与参数'],
    specNotes: ['确认尺寸、端口、插脚与散热边界', '验证跌落保护、收纳和环保材料', '校验协议、功率、认证和警示'],
    gateDetails: {
      structure: '产品尺寸、内托、纸盒和目标成本及首单数量相容。',
      risk: '跌落、挤压、参数误读、认证状态和运输保护进入打样验证。',
    },
  },
}

const genericProfile = {
  category: '新产品',
  productType: '产品',
  packagingObject: '产品与零售包装',
  imageComposition: '完整展示产品本体和对应零售包装，结构清楚、比例可信',
  supportsStructural3D: false,
  parts: ['包装正面', '产品主视觉', '品牌文字', '产品名称', '信息区域', '结构细节'],
  editPrompt: '优化产品主视觉，保持品牌、品名和信息区域不变',
  styles: ['现代简洁 · 信息清楚', '专业可信 · 结构明确', '货架识别 · 主次清楚', '克制高级 · 材质真实'],
  briefConstraints: {
    structureLabel: '产品与零售包装',
    conditionLabel: '本轮重点约束',
    conditionOptions: ['核心信息清楚', '结构与使用场景匹配', '运输保护', '合规信息留白'],
    finishLabel: '材质与信息表现',
    finishOptions: ['哑光质感', '局部亮光', '信息图示', '批次留白'],
    referenceHint: '可上传产品、包装结构、竞品或视觉氛围参考。',
  },
  technology: '技术方向待打样确认',
  sampleFocus: ['确认核心使用体验', '确认结构和材料适配', '确认合规信息与生产边界'],
  specLabels: ['产品结构', '关键部件', '外包装'],
  specNotes: ['确认尺寸、材质与批次一致性', '验证关键部件与实际使用体验', '确认运输保护和印刷可实现性'],
  gateDetails: {
    structure: '产品结构、材料和包装与目标成本和首单数量相容。',
    risk: '结构、材料、运输和合规风险进入打样验证。',
  },
}

export function getProductProfile(templateId) {
  return profiles[templateId] || genericProfile
}

export function getPackagingParts(templateId) {
  const profile = getProductProfile(templateId)
  return baseParts.map((part, index) => ({ ...part, label: profile.parts[index] }))
}

export function getPackagingGateItems(templateId) {
  const profile = getProductProfile(templateId)
  return [
    { id: 'text-layer', title: '文字图层可控', detail: '品牌名、品名和关键信息不交给生图模型定稿，后续可独立校对。' },
    { id: 'structure-fit', title: '结构与成本匹配', detail: profile.gateDetails.structure },
    { id: 'risk-covered', title: '包材风险已写入', detail: profile.gateDetails.risk },
    { id: 'supplier-ready', title: '可发给工厂沟通', detail: '已形成结构、材质、工艺、图片版本和待验证问题。' },
  ]
}

export function createStarterConcepts(templateId, design) {
  const profile = getProductProfile(templateId)
  const styles = [design.style, ...profile.styles.filter((style) => style !== design.style)].slice(0, 3)
  return styles.map((direction, index) => ({
    id: ['seed-natural', 'seed-botanical', 'seed-premium'][index],
    name: `方案${['一', '二', '三'][index]}`,
    direction,
    palette: index === 0 ? design.palette : design.palette.map((color, colorIndex) => colorIndex === 0 ? color : color),
  }))
}

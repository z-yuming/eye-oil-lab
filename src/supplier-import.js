import * as XLSX from 'xlsx'

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const unique = (values) => Array.from(new Set(values.map(clean).filter(Boolean)))

const pick = (row, keys) => {
  for (const key of keys) {
    const value = clean(row[key])
    if (value) return value
  }
  return ''
}

const numberFrom = (value) => {
  const match = clean(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

const splitCapabilities = (value) => unique(clean(value).split(/[、，,;/\\|]+/))

function findHeaderIndex(rows) {
  return rows.findIndex((row) => row.some((cell) => /供应商名称|公司名称|产品名称|品类|产品/.test(clean(cell))))
}

function sourceTypeFor(fileName, headers) {
  const label = `${fileName} ${headers.join(' ')}`
  if (/包材|包装/.test(label)) return 'packaging'
  if (/代加工|OEM|ODM|工厂/.test(label)) return 'oem'
  return 'finished'
}

function missingFields(values) {
  return Object.entries(values).filter(([, value]) => !clean(value)).map(([key]) => key)
}

function inferPackagingFit(text) {
  if (/滚珠|钢珠|陶瓷|不锈钢|外盖|密封/.test(text)) return ['applicator']
  if (/标签|贴纸/.test(text)) return ['label']
  if (/彩盒|纸盒|包装盒/.test(text)) return ['carton']
  return ['bottle']
}

function normalizeRow(row, sourceType, source, sourceRow) {
  if (sourceType === 'oem') {
    const name = pick(row, ['公司名称', '供应商名称', '公司'])
    if (!name) return null
    const product = pick(row, ['品类', '产品名称', '产品', '主营品类'])
    const contact = unique([pick(row, ['联系人', '负责人']), pick(row, ['联系方式', '联系电话', '电话'])]).join(' · ')
    const region = pick(row, ['公司地址', '工厂地址', '地址'])
    return {
      sourceId: `${sourceType}-${sourceRow}`,
      source,
      sourceRow,
      sourceType,
      id: `source-${sourceType}-${sourceRow}`,
      name,
      type: '代加工 / 原始供应商',
      region: region || '待补充',
      product,
      capabilities: splitCapabilities(product),
      fit: ['formula', 'testing'],
      price: null,
      priceLabel: '待询价',
      moq: null,
      moqLabel: '待确认',
      lead: pick(row, ['打样周期', '样品周期']) || '待确认',
      bulkLead: pick(row, ['大货周期', '量产周期']) || '待确认',
      contact,
      note: `原始表格记录：${[region, product].filter(Boolean).join('；')}`,
      tags: ['原始表格', '待核验'],
      risk: '待核验',
      verified: '未核验',
      missing: ['报价', 'MOQ', '打样周期', '大货周期'],
      raw: row,
    }
  }

  const name = pick(row, ['供应商名称', '公司名称', '供应商', '品牌方'])
  if (!name) return null
  const product = pick(row, ['产品名称', '产品', '品类', '产品品类'])
  const accessory = pick(row, ['配件（加图片）', '配件', '规格'])
  const details = pick(row, ['详细信息', '备注', '说明'])
  const priceLabel = pick(row, ['单价', '报价', '价格'])
  const moqLabel = pick(row, ['最低起订量', '起订量', 'MOQ'])
  const sampleLead = pick(row, ['打样周期', '样品周期'])
  const bulkLead = pick(row, ['大货周期', '量产周期'])
  const contact = pick(row, ['供应商联系方式', '联系方式', '联系电话', '电话'])
  const fitText = `${product} ${accessory} ${details}`
  const price = numberFrom(priceLabel)
  return {
    sourceId: `${sourceType}-${sourceRow}`,
    source,
    sourceRow,
    sourceType,
    id: `source-${sourceType}-${sourceRow}`,
    name,
    type: sourceType === 'finished' ? '成品 / 原始供应商' : '包材 / 原始供应商',
    region: pick(row, ['地区', '公司地址', '地址']) || '待补充',
    product,
    capabilities: unique([product, accessory, details]),
    fit: sourceType === 'finished' ? ['finished'] : inferPackagingFit(fitText),
    price,
    priceLabel: priceLabel || '待询价',
    moq: numberFrom(moqLabel),
    moqLabel: moqLabel || '待确认',
    lead: sampleLead || '待确认',
    bulkLead: bulkLead || '待确认',
    contact,
    note: `原始表格记录：${[product, accessory, details].filter(Boolean).join('；')}`,
    tags: ['原始表格', '待核验'],
    risk: '待核验',
    verified: '未核验',
    missing: missingFields({ 报价: priceLabel, MOQ: moqLabel, 打样周期: sampleLead, 大货周期: bulkLead }),
    raw: row,
  }
}

export function normalizeSupplierName(name) {
  return String(name || '')
    .replace(/[（(].*?[）)]/g, '')
    .replace(/有限公司|集团|包装制品厂|包装材料有限公司|科技有限公司|生物科技有限公司/g, '')
    .replace(/[^\u4e00-\u9fa5a-z0-9]/gi, '')
    .toLowerCase()
}

export function dedupeSupplierRecords(records) {
  const seen = new Set()
  return records.filter((supplier) => {
    const key = `${normalizeSupplierName(supplier.name)}|${supplier.product || supplier.type || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function mergeSupplierLibrary(baseLibrary, importedRecords) {
  return dedupeSupplierRecords([
    ...baseLibrary.filter((supplier) => !supplier.sourceType),
    ...importedRecords,
  ])
}

export async function parseSupplierFiles(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) throw new Error('请选择至少一个 Excel 文件')
  const records = []
  const fileNames = []
  for (const file of files) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
    const headerIndex = findHeaderIndex(rows)
    if (headerIndex < 0) throw new Error(`${file.name} 未识别到供应商表头`)
    const headers = rows[headerIndex].map((value, index) => clean(value) || `列${index + 1}`)
    const sourceType = sourceTypeFor(file.name, headers)
    fileNames.push(file.name)
    rows.slice(headerIndex + 1).forEach((values, index) => {
      const row = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(values[columnIndex])]))
      const record = normalizeRow(row, sourceType, file.name, headerIndex + index + 2)
      if (record) records.push(record)
    })
  }
  const deduped = dedupeSupplierRecords(records)
  return {
    records: deduped,
    fileNames,
    rawRecords: records.length,
    libraryRecords: deduped.length,
    uniqueNames: new Set(records.map((record) => normalizeSupplierName(record.name))).size,
    sourceCounts: deduped.reduce((counts, record) => ({ ...counts, [record.sourceType]: (counts[record.sourceType] || 0) + 1 }), {}),
  }
}

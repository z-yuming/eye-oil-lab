import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Columns2,
  Copy,
  GripVertical,
  Eye,
  EyeOff,
  Eraser,
  FlaskConical,
  Image as ImageIcon,
  ImagePlus,
  Layers3,
  Lock,
  Maximize2,
  MousePointer2,
  Paintbrush,
  RotateCcw,
  Rotate3D,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { defaultPackagingDesign, packagingGateItems, packagingOptions } from './data'
import { Button, Field, StageHeading } from './ui'

const finishOptions = ['哑光覆膜', '烫金', '局部UV', '压纹', '特种纸']

const baseMockup = '/assets/eye-oil-packaging-base-v2.png'
const photorealThreeView = '/assets/eye-oil-packaging-photoreal-three-view-v1.png'

const packagingParts = [
  { id: 'carton', label: '纸盒正面', kind: 'image', number: 1 },
  { id: 'illustration', label: '植物插画', kind: 'image', number: 2 },
  { id: 'brand', label: '品牌文字', kind: 'text', field: 'brandName', number: 3 },
  { id: 'product', label: '产品名称', kind: 'text', field: 'productName', number: 4 },
  { id: 'bottleLabel', label: '瓶身标签', kind: 'image', number: 5 },
  { id: 'cap', label: '瓶盖', kind: 'image', number: 6 },
]

const defaultPartSettings = Object.fromEntries(packagingParts.map((part) => [part.id, {
  visible: true,
  locked: ['carton', 'brand', 'product'].includes(part.id),
}]))

function normalizePartSettings(settings = {}) {
  return Object.fromEntries(packagingParts.map((part) => [part.id, {
    ...defaultPartSettings[part.id],
    ...(settings[part.id] || {}),
  }]))
}

function deriveDraftAdjustments(prompt, current = {}) {
  const next = { ...current }
  if (/缩小/.test(prompt)) next.illustrationScale = Math.max(0.58, (current.illustrationScale || 1) - 0.2)
  if (/放大/.test(prompt)) next.illustrationScale = Math.min(1.35, (current.illustrationScale || 1) + 0.18)
  if (/深绿|墨绿/.test(prompt)) next.overlayColor = '#355c4a'
  if (/珊瑚|红色/.test(prompt)) next.overlayColor = '#c9685a'
  if (/更简洁|减少|留白/.test(prompt)) next.overlayOpacity = 0.72
  return next
}

function readAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('参考图片读取失败'))
    reader.onload = () => {
      const image = new window.Image()
      image.onerror = () => reject(new Error('参考图片格式不受支持'))
      image.onload = () => {
        const maxEdge = 720
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve({
          id: `reference-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          dataUrl: canvas.toDataURL('image/jpeg', 0.78),
        })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function MaskCanvas({ active, mode = 'paint', brushSize = 34, resetKey, onChange = () => {} }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const hasMaskRef = useRef(false)

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    hasMaskRef.current = false
    onChange('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 1536
    canvas.height = 1024
    clear()
  }, [resetKey])

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (event.clientY - rect.top) * (canvasRef.current.height / rect.height),
    }
  }

  const drawSegment = (from, to) => {
    const context = canvasRef.current.getContext('2d')
    context.save()
    context.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over'
    context.strokeStyle = '#0c8a5f'
    context.lineWidth = brushSize * (canvasRef.current.width / canvasRef.current.getBoundingClientRect().width)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(from.x, from.y)
    context.lineTo(to.x, to.y)
    context.stroke()
    context.restore()
    if (mode !== 'erase') hasMaskRef.current = true
  }

  const exportMask = () => {
    if (!hasMaskRef.current) {
      onChange('')
      return
    }
    const source = canvasRef.current
    const mask = document.createElement('canvas')
    mask.width = source.width
    mask.height = source.height
    const context = mask.getContext('2d')
    context.fillStyle = '#000'
    context.fillRect(0, 0, mask.width, mask.height)
    context.globalCompositeOperation = 'destination-out'
    context.drawImage(source, 0, 0)
    onChange(mask.toDataURL('image/png'))
  }

  const begin = (event) => {
    if (!active) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    const point = getPoint(event)
    lastPointRef.current = point
    drawSegment(point, { x: point.x + 0.01, y: point.y + 0.01 })
  }

  const move = (event) => {
    if (!drawingRef.current || !active) return
    const point = getPoint(event)
    drawSegment(lastPointRef.current, point)
    lastPointRef.current = point
  }

  const end = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
    exportMask()
  }

  return (
    <canvas
      ref={canvasRef}
      className={`mask-canvas ${active ? 'active' : ''} ${mode}`}
      aria-label="局部修改选区画布"
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    />
  )
}

const starterConcepts = [
  {
    id: 'seed-natural',
    name: '方案一',
    direction: '自然植萃 · 现代简约',
    palette: ['#c9685a', '#f4f1e9', '#58725c', '#242826'],
  },
  {
    id: 'seed-botanical',
    name: '方案二',
    direction: '草本清新 · 植物插画',
    palette: ['#74916d', '#f1f4eb', '#b7c6a8', '#334139'],
  },
  {
    id: 'seed-premium',
    name: '方案三',
    direction: '高端质感 · 简约线条',
    palette: ['#b99b61', '#f3eee2', '#8a7450', '#2d2a25'],
  },
]

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const characters = Array.from(text || '')
  let line = ''
  let lineIndex = 0
  characters.forEach((character, index) => {
    const next = `${line}${character}`
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight)
      line = character
      lineIndex += 1
    } else {
      line = next
    }
    if (index === characters.length - 1 && lineIndex < maxLines) {
      context.fillText(line, x, y + lineIndex * lineHeight)
    }
  })
}

function createArtworkTexture({ brandName, productName, palette }) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 1280
  const context = canvas.getContext('2d')
  const [accent = '#c9685a', paper = '#f4f1e9', botanical = '#58725c', ink = '#242826'] = palette

  context.fillStyle = paper
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = accent
  context.fillRect(0, 0, 28, canvas.height)
  context.fillStyle = ink
  context.font = '600 62px "Microsoft YaHei", sans-serif'
  context.textBaseline = 'top'
  drawWrappedText(context, brandName, 88, 135, 580, 82, 2)
  context.font = '500 54px "Microsoft YaHei", sans-serif'
  drawWrappedText(context, productName, 88, 300, 580, 72, 2)
  context.fillStyle = accent
  context.fillRect(88, 472, 84, 9)
  context.fillStyle = ink
  context.font = '32px Georgia, serif'
  context.fillText('BOTANICAL', 88, 525)
  context.fillText('EYE SERUM OIL', 88, 570)

  context.globalAlpha = 0.9
  context.fillStyle = accent
  context.beginPath()
  context.arc(385, 825, 130, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = botanical
  context.lineWidth = 9
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(365, 1035)
  context.quadraticCurveTo(390, 820, 520, 690)
  context.moveTo(405, 915)
  context.quadraticCurveTo(510, 850, 565, 780)
  context.moveTo(400, 890)
  context.quadraticCurveTo(315, 805, 286, 730)
  context.stroke()
  context.lineWidth = 6
  ;[[530, 705, 585, 665], [515, 795, 600, 765], [300, 740, 250, 690], [340, 830, 275, 805]].forEach(([x1, y1, x2, y2]) => {
    context.beginPath()
    context.ellipse((x1 + x2) / 2, (y1 + y2) / 2, 48, 21, Math.atan2(y2 - y1, x2 - x1), 0, Math.PI * 2)
    context.stroke()
  })
  context.globalAlpha = 1
  context.fillStyle = ink
  context.font = '28px "Microsoft YaHei", sans-serif'
  context.fillText('净含量：20ml', 88, 1160)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function PackagingPreview3D({ design, concept }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const sceneApiRef = useRef(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [boxVisible, setBoxVisible] = useState(true)
  const [bottleVisible, setBottleVisible] = useState(true)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8faf9')
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(5.4, 3.6, 8.4)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 1.75, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 5.2
    controls.maxDistance = 12
    controls.maxPolarAngle = Math.PI / 2.04
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.72
    controls.saveState()

    scene.add(new THREE.HemisphereLight('#ffffff', '#ccd4cf', 2.35))
    const keyLight = new THREE.DirectionalLight('#ffffff', 4.2)
    keyLight.position.set(4.5, 8, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight('#dfede6', 2.2)
    fillLight.position.set(-5, 4, 4)
    scene.add(fillLight)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ color: '#82928b', opacity: 0.16 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const palette = concept?.palette || design.palette
    const artworkTexture = createArtworkTexture({ ...design, palette })
    const paperMaterial = new THREE.MeshStandardMaterial({ color: palette[1] || '#f4f1e9', roughness: 0.82 })
    const sideMaterial = new THREE.MeshStandardMaterial({ color: palette[0] || '#c9685a', roughness: 0.72 })
    const darkMaterial = new THREE.MeshStandardMaterial({ color: palette[3] || '#242826', roughness: 0.58 })
    const frontMaterial = new THREE.MeshStandardMaterial({ map: artworkTexture, roughness: 0.78 })

    const boxGroup = new THREE.Group()
    const carton = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 4.35, 1.12),
      [sideMaterial, paperMaterial, paperMaterial, darkMaterial, frontMaterial, paperMaterial],
    )
    carton.position.y = 2.18
    carton.castShadow = true
    carton.receiveShadow = true
    boxGroup.add(carton)
    boxGroup.position.x = 1.05
    boxGroup.rotation.y = -0.2
    boxGroup.visible = boxVisible
    scene.add(boxGroup)

    const bottleGroup = new THREE.Group()
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#8e4d12',
      roughness: 0.18,
      metalness: 0.05,
      transmission: 0.18,
      transparent: true,
      opacity: 0.92,
    })
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 2.65, 48), glassMaterial)
    body.position.y = 1.48
    body.castShadow = true
    bottleGroup.add(body)
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.61, 0.32, 48), glassMaterial)
    shoulder.position.y = 2.96
    shoulder.castShadow = true
    bottleGroup.add(shoulder)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.55, 48), glassMaterial)
    neck.position.y = 3.36
    neck.castShadow = true
    bottleGroup.add(neck)
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.49, 0.49, 0.36, 48),
      new THREE.MeshStandardMaterial({ color: '#ede9e1', roughness: 0.5 }),
    )
    collar.position.y = 3.73
    collar.castShadow = true
    bottleGroup.add(collar)
    const roller = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 48, 32),
      new THREE.MeshStandardMaterial({ color: '#c9cdcc', metalness: 0.86, roughness: 0.16 }),
    )
    roller.position.y = 4.05
    roller.castShadow = true
    bottleGroup.add(roller)

    const bottleLabel = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.75), frontMaterial.clone())
    bottleLabel.position.set(0, 1.48, 0.666)
    bottleGroup.add(bottleLabel)
    bottleGroup.position.x = -1.12
    bottleGroup.rotation.y = 0.12
    bottleGroup.visible = bottleVisible
    scene.add(bottleGroup)

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.7, 48),
      new THREE.MeshStandardMaterial({ color: '#171918', roughness: 0.52 }),
    )
    cap.position.set(-2.3, 0.86, 0.18)
    cap.castShadow = true
    scene.add(cap)

    let generatedTexture
    if (concept?.image) {
      new THREE.TextureLoader().load(concept.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        generatedTexture = texture
        frontMaterial.map = texture
        frontMaterial.needsUpdate = true
        bottleLabel.material.map = texture
        bottleLabel.material.needsUpdate = true
      })
    }

    sceneApiRef.current = { camera, controls, boxGroup, bottleGroup, cap }
    let frameId
    const render = () => {
      controls.autoRotate = sceneApiRef.current?.autoRotate ?? autoRotate
      controls.update()
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(render)
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    render()

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
      controls.dispose()
      generatedTexture?.dispose()
      artworkTexture.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      sceneApiRef.current = null
    }
  }, [concept?.id, concept?.image, concept?.palette, design.brandName, design.productName, design.palette])

  const toggleRotation = () => {
    setAutoRotate((current) => {
      const next = !current
      if (sceneApiRef.current) sceneApiRef.current.autoRotate = next
      return next
    })
  }

  const toggleBox = () => {
    setBoxVisible((current) => {
      const next = !current
      if (sceneApiRef.current) sceneApiRef.current.boxGroup.visible = next
      return next
    })
  }

  const toggleBottle = () => {
    setBottleVisible((current) => {
      const next = !current
      if (sceneApiRef.current) {
        sceneApiRef.current.bottleGroup.visible = next
        sceneApiRef.current.cap.visible = next
      }
      return next
    })
  }

  const zoomIn = () => {
    const api = sceneApiRef.current
    if (!api) return
    api.camera.position.lerp(api.controls.target, 0.14)
    api.controls.update()
  }

  const resetView = () => sceneApiRef.current?.controls.reset()

  return (
    <div className="packaging-viewport" ref={hostRef}>
      <canvas ref={canvasRef} aria-label="可旋转的眼油纸盒与滚珠瓶三维预览" />
      <div className="viewport-toolbar" role="toolbar" aria-label="三维预览工具">
        <button className={autoRotate ? 'active' : ''} onClick={toggleRotation} title="自动旋转" aria-label="自动旋转"><Rotate3D size={16} /></button>
        <button onClick={zoomIn} title="放大" aria-label="放大"><ZoomIn size={16} /></button>
        <button onClick={resetView} title="重置视角" aria-label="重置视角"><Maximize2 size={16} /></button>
        <span />
        <button className={boxVisible ? 'active' : ''} onClick={toggleBox} title="显示或隐藏纸盒" aria-label="显示或隐藏纸盒"><Box size={16} /></button>
        <button className={bottleVisible ? 'active' : ''} onClick={toggleBottle} title="显示或隐藏滚珠瓶" aria-label="显示或隐藏滚珠瓶"><FlaskConical size={16} /></button>
      </div>
      <div className="viewport-hint"><Rotate3D size={14} />拖动旋转 · 滚轮缩放</div>
    </div>
  )
}

function createPaperBumpTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const image = context.createImageData(canvas.width, canvas.height)
  for (let index = 0; index < image.data.length; index += 4) {
    const pixel = index / 4
    const grain = 116 + Math.round((Math.sin(pixel * 12.9898) * 43758.5453 % 1) * 14)
    image.data[index] = grain
    image.data[index + 1] = grain
    image.data[index + 2] = grain
    image.data[index + 3] = 255
  }
  context.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 7)
  return texture
}

function createCapRidgeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = '#777'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let x = 0; x < canvas.width; x += 5) {
    context.fillStyle = x % 10 === 0 ? '#b8b8b8' : '#3f3f3f'
    context.fillRect(x, 0, 2, canvas.height)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

function PackagingProductView({ design, concept, view }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#edf1ef')
    const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = view !== 'top'
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12

    const environmentGenerator = new THREE.PMREMGenerator(renderer)
    const environmentTarget = environmentGenerator.fromScene(new RoomEnvironment(), 0.035)
    scene.environment = environmentTarget.texture
    environmentGenerator.dispose()

    scene.add(new THREE.HemisphereLight('#ffffff', '#aebbb5', 1.35))
    const keyLight = new THREE.DirectionalLight('#fffdf8', 3.6)
    keyLight.position.set(4.8, 8.5, 6.2)
    keyLight.castShadow = view !== 'top'
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 7
    keyLight.shadow.camera.bottom = -2
    keyLight.shadow.bias = -0.0004
    keyLight.shadow.normalBias = 0.025
    scene.add(keyLight)
    const fillLight = new THREE.RectAreaLight('#e5f0eb', 4.2, 4.5, 6)
    fillLight.position.set(-4.5, 5.5, 5)
    fillLight.lookAt(0, 2, 0)
    scene.add(fillLight)
    const rimLight = new THREE.RectAreaLight('#fff1e4', 3.2, 3, 5)
    rimLight.position.set(4, 5, -4)
    rimLight.lookAt(0, 2, 0)
    scene.add(rimLight)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: '#e8eeeb', roughness: 0.94, metalness: 0 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const palette = concept?.palette || design.palette
    const artworkTexture = createArtworkTexture({ ...design, palette })
    artworkTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const paperBumpTexture = createPaperBumpTexture()
    const capRidgeTexture = createCapRidgeTexture()
    const paperMaterial = new THREE.MeshPhysicalMaterial({
      color: palette[1] || '#f4f1e9',
      roughness: 0.72,
      clearcoat: 0.12,
      clearcoatRoughness: 0.68,
      bumpMap: paperBumpTexture,
      bumpScale: 0.018,
    })
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: artworkTexture,
      roughness: 0.67,
      clearcoat: 0.14,
      clearcoatRoughness: 0.62,
      bumpMap: paperBumpTexture,
      bumpScale: 0.012,
    })
    const sideMaterial = new THREE.MeshPhysicalMaterial({
      color: palette[0] || '#c9685a',
      roughness: 0.62,
      clearcoat: 0.18,
      clearcoatRoughness: 0.5,
      bumpMap: paperBumpTexture,
      bumpScale: 0.012,
    })
    const topMaterial = new THREE.MeshPhysicalMaterial({
      color: '#eee9df',
      roughness: 0.78,
      clearcoat: 0.08,
      bumpMap: paperBumpTexture,
      bumpScale: 0.014,
    })

    const cartonGroup = new THREE.Group()
    const cartonGeometry = new RoundedBoxGeometry(1.72, 4.28, 1.08, 8, 0.045)
    const carton = new THREE.Mesh(cartonGeometry, paperMaterial)
    carton.position.y = 2.16
    carton.castShadow = true
    carton.receiveShadow = true
    cartonGroup.add(carton)
    const cartonFront = new THREE.Mesh(new THREE.PlaneGeometry(1.64, 4.18), frontMaterial)
    cartonFront.position.set(0, 2.16, 0.546)
    cartonFront.castShadow = true
    cartonGroup.add(cartonFront)
    const cartonSide = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 4.18), sideMaterial)
    cartonSide.position.set(0.866, 2.16, 0)
    cartonSide.rotation.y = Math.PI / 2
    cartonSide.castShadow = true
    cartonGroup.add(cartonSide)
    const cartonTop = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1), topMaterial)
    cartonTop.position.set(0, 4.305, 0)
    cartonTop.rotation.x = -Math.PI / 2
    cartonGroup.add(cartonTop)
    const topAccent = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.96), sideMaterial.clone())
    topAccent.position.set(-0.69, 4.311, 0)
    topAccent.rotation.x = -Math.PI / 2
    cartonGroup.add(topAccent)
    const cartonEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cartonGeometry, 22),
      new THREE.LineBasicMaterial({ color: palette[3] || '#242826', transparent: true, opacity: 0.12 }),
    )
    cartonEdges.position.y = 2.16
    cartonGroup.add(cartonEdges)
    cartonGroup.position.set(1.02, 0.01, 0.7)
    scene.add(cartonGroup)

    const bottleGroup = new THREE.Group()
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#8c3d08',
      roughness: 0.11,
      metalness: 0,
      transmission: 0.52,
      thickness: 0.16,
      ior: 1.49,
      attenuationColor: new THREE.Color('#713005'),
      attenuationDistance: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    })
    const bottleProfile = [
      [0, 0.06], [0.49, 0.06], [0.57, 0.13], [0.59, 0.23],
      [0.59, 2.38], [0.57, 2.52], [0.5, 2.67], [0.41, 2.82],
      [0.39, 3.28], [0, 3.28],
    ].map(([radius, height]) => new THREE.Vector2(radius, height))
    const bottle = new THREE.Mesh(new THREE.LatheGeometry(bottleProfile, 64), glassMaterial)
    bottle.castShadow = true
    bottle.receiveShadow = true
    bottleGroup.add(bottle)

    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.515, 0.515, 2.22, 64),
      new THREE.MeshPhysicalMaterial({
        color: '#9d4c0a',
        roughness: 0.2,
        transmission: 0.1,
        transparent: true,
        opacity: 0.76,
      }),
    )
    liquid.position.y = 1.23
    bottleGroup.add(liquid)
    const glassBase = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.055, 18, 64),
      new THREE.MeshPhysicalMaterial({ color: '#a65a16', roughness: 0.16, transmission: 0.25, transparent: true, opacity: 0.82 }),
    )
    glassBase.rotation.x = Math.PI / 2
    glassBase.position.y = 0.13
    bottleGroup.add(glassBase)

    const labelBacking = new THREE.Mesh(
      new THREE.PlaneGeometry(1.055, 1.7),
      new THREE.MeshPhysicalMaterial({ color: '#f5f1e8', roughness: 0.8, thickness: 0.01 }),
    )
    labelBacking.position.set(0, 1.43, 0.594)
    bottleGroup.add(labelBacking)
    const label = new THREE.Mesh(new THREE.PlaneGeometry(1.01, 1.64), frontMaterial.clone())
    label.position.set(0, 1.43, 0.599)
    bottleGroup.add(label)

    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: '#101312',
      roughness: 0.34,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      bumpMap: capRidgeTexture,
      bumpScale: 0.07,
    })
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.6, 1.18, 64), capMaterial)
    cap.position.y = 3.82
    cap.castShadow = true
    bottleGroup.add(cap)
    const capTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.535, 0.57, 0.065, 64),
      new THREE.MeshPhysicalMaterial({ color: '#090b0a', roughness: 0.58, clearcoat: 0.08, clearcoatRoughness: 0.72 }),
    )
    capTop.position.y = 4.44
    capTop.castShadow = true
    bottleGroup.add(capTop)
    const capRingMaterial = new THREE.MeshStandardMaterial({ color: '#292d2b', roughness: 0.34, metalness: 0.08 })
    ;[3.27, 4.39].forEach((height) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.575, 0.018, 12, 64), capRingMaterial)
      ring.rotation.x = Math.PI / 2
      ring.position.y = height
      bottleGroup.add(ring)
    })
    bottleGroup.position.set(-1.14, 0.02, -0.75)
    scene.add(bottleGroup)

    const setCamera = (aspect) => {
      const halfHeight = 3.15
      camera.left = -halfHeight * aspect
      camera.right = halfHeight * aspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      if (view === 'side') {
        camera.position.set(10, 2.25, 0)
        camera.up.set(0, 1, 0)
        camera.lookAt(0, 2.25, 0)
      } else if (view === 'top') {
        camera.position.set(0, 12, 0.01)
        camera.up.set(0, 0, -1)
        camera.lookAt(0, 0, 0)
      } else {
        camera.position.set(0, 2.25, 10)
        camera.up.set(0, 1, 0)
        camera.lookAt(0, 2.25, 0)
      }
      camera.updateProjectionMatrix()
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      setCamera(width / height)
      renderer.render(scene, camera)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    return () => {
      observer.disconnect()
      artworkTexture.dispose()
      paperBumpTexture.dispose()
      capRidgeTexture.dispose()
      environmentTarget.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
    }
  }, [concept?.id, concept?.palette, design.brandName, design.productName, design.palette, view])

  return (
    <div className="product-view-render" ref={hostRef}>
      <canvas ref={canvasRef} aria-label={`${view === 'front' ? '正面' : view === 'side' ? '侧面' : '顶部'}成品包装渲染图`} />
      <span className="product-render-state"><Box size={12} />成品渲染</span>
    </div>
  )
}

function PackagingArtwork2D({ design, concept, partSettings, activePartId, onSelectPart, maskMode, brushSize, maskResetKey, onMaskChange }) {
  const palette = concept.palette || ['#c9685a', '#f4f1e9', '#58725c', '#242826']
  const adjustments = concept.adjustments || {}
  const artworkStyle = {
    '--art-accent': adjustments.overlayColor || palette[0],
    '--art-paper': palette[1],
    '--art-botanical': palette[2],
    '--art-ink': palette[3],
    '--illustration-scale': adjustments.illustrationScale || 1,
    '--illustration-opacity': adjustments.overlayOpacity || 1,
    transform: `scale(${design.canvasZoom / 100})`,
  }
  const source = concept.image || baseMockup
  const regionClass = (partId) => `artwork-region ${activePartId === partId ? 'active' : ''} ${partSettings[partId]?.locked ? 'locked' : ''}`

  return (
    <div className="workbench-stage" style={artworkStyle}>
      <div className={`workbench-artboard ${design.activeTool !== 'select' ? 'masking' : ''}`}>
        <img src={source} alt={`${concept.name}眼油包装效果图`} draggable="false" />
        <MaskCanvas active={design.activeTool !== 'select'} mode={maskMode} brushSize={brushSize} resetKey={maskResetKey} onChange={onMaskChange} />
        {partSettings.illustration?.visible && Object.keys(adjustments).length > 0 && <span className="artwork-edit-wash" aria-hidden="true" />}
        {partSettings.brand?.visible && <div className="exact-text-layer carton-brand">{design.brandName}</div>}
        {partSettings.product?.visible && <div className="exact-text-layer carton-product">{design.productName}</div>}
        {partSettings.brand?.visible && <div className="exact-text-layer bottle-brand">{design.brandName}</div>}
        {partSettings.product?.visible && <div className="exact-text-layer bottle-product">{design.productName}</div>}
        {partSettings.carton?.visible && <button className={regionClass('carton')} data-part="carton" onClick={() => onSelectPart('carton')} aria-label="选择纸盒正面"><span>1</span></button>}
        {partSettings.illustration?.visible && <button className={regionClass('illustration')} data-part="illustration" onClick={() => onSelectPart('illustration')} aria-label="选择植物插画"><span>2</span></button>}
        {partSettings.brand?.visible && <button className={regionClass('brand')} data-part="brand" onClick={() => onSelectPart('brand')} aria-label="选择品牌文字"><span>3</span></button>}
        {partSettings.product?.visible && <button className={regionClass('product')} data-part="product" onClick={() => onSelectPart('product')} aria-label="选择产品名称"><span>4</span></button>}
        {partSettings.bottleLabel?.visible && <button className={regionClass('bottleLabel')} data-part="bottleLabel" onClick={() => onSelectPart('bottleLabel')} aria-label="选择瓶身标签"><span>5</span></button>}
        {partSettings.cap?.visible && <button className={regionClass('cap')} data-part="cap" onClick={() => onSelectPart('cap')} aria-label="选择瓶盖"><span>6</span></button>}
      </div>
    </div>
  )
}

function PackagingPhotorealView({ view }) {
  const viewIndex = { front: 0, side: 1, top: 2 }[view] || 0
  return (
    <div className={`photoreal-product-view photoreal-${view}`} style={{ '--photo-view-index': viewIndex }}>
      <img src={photorealThreeView} alt={`${view === 'front' ? '正面' : view === 'side' ? '侧面' : '顶部'}AI写实成品效果图`} />
      <span className="product-render-state"><Sparkles size={12} />AI写实效果</span>
    </div>
  )
}

function PackagingThreeViews({ design, concept, selectedPackaging }) {
  const [renderMode, setRenderMode] = useState('photo')
  const views = [
    {
      id: 'front',
      title: '正视图',
      note: '查看纸盒正面、瓶身标签与主要视觉层级',
      cartonSize: '48 x 128mm',
      bottleSize: '直径22 x 高118mm',
    },
    {
      id: 'side',
      title: '侧视图',
      note: '检查纸盒厚度、瓶器轮廓与侧面材质关系',
      cartonSize: '26 x 128mm',
      bottleSize: '直径22 x 高118mm',
    },
    {
      id: 'top',
      title: '俯视图',
      note: '检查盒体深度、瓶盖直径与整体占位比例',
      cartonSize: '48 x 26mm',
      bottleSize: '盖径18mm / 滚珠6mm',
    },
  ]

  return (
    <div className="three-view-board">
      <div className="three-view-head">
        <div>
          <strong>当前方案 · 成品三视图</strong>
          <span>{renderMode === 'photo' ? 'AI棚拍效果用于确认产品质感与包装完成度' : '3D结构模型用于检查比例、方向与包材关系'}</span>
          <div className="three-view-mode-switch" role="tablist" aria-label="三视图渲染模式">
            <button className={renderMode === 'photo' ? 'active' : ''} onClick={() => setRenderMode('photo')} role="tab" aria-selected={renderMode === 'photo'}><Sparkles size={13} />AI写实</button>
            <button className={renderMode === 'model' ? 'active' : ''} onClick={() => setRenderMode('model')} role="tab" aria-selected={renderMode === 'model'}><Box size={13} />3D结构</button>
          </div>
        </div>
        <dl>
          <div><dt>结构</dt><dd>{selectedPackaging.name}</dd></div>
          <div><dt>工艺</dt><dd>{design.finishes.join(' + ') || selectedPackaging.carton}</dd></div>
          <div><dt>瓶器</dt><dd>{selectedPackaging.bottle}</dd></div>
        </dl>
      </div>

      <div className="three-view-grid">
        {views.map((view) => (
          <article className="three-view-card" key={view.id}>
            <div className="three-view-canvas" aria-label={view.title}>
              {renderMode === 'photo'
                ? <PackagingPhotorealView view={view.id} />
                : <PackagingProductView design={design} concept={concept} view={view.id} />}
            </div>
            <div className="three-view-copy">
              <h3>{view.title}</h3>
              <p>{view.note}</p>
              <small>外盒 {view.cartonSize} · 瓶器 {view.bottleSize}</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function VersionComparison({ design, current, comparison, position, onPositionChange }) {
  const renderArtwork = (concept) => {
    const palette = concept.palette || design.palette
    const adjustments = concept.adjustments || {}
    const layerStyle = {
      '--art-accent': adjustments.overlayColor || palette[0],
      '--art-paper': palette[1],
      '--art-botanical': palette[2],
      '--art-ink': palette[3],
      '--illustration-scale': adjustments.illustrationScale || 1,
      '--illustration-opacity': adjustments.overlayOpacity || 1,
    }
    return (
      <div className="comparison-artwork" style={layerStyle}>
        <img src={concept.image || baseMockup} alt="" draggable="false" />
        {Object.keys(adjustments).length > 0 && <span className="artwork-edit-wash" aria-hidden="true" />}
        <div className="exact-text-layer carton-brand">{design.brandName}</div>
        <div className="exact-text-layer carton-product">{design.productName}</div>
        <div className="exact-text-layer bottle-brand">{design.brandName}</div>
        <div className="exact-text-layer bottle-product">{design.productName}</div>
      </div>
    )
  }

  return (
    <div className="comparison-stage" style={{ transform: `scale(${design.canvasZoom / 100})` }}>
      <div className="comparison-artboard">
        <div className="comparison-layer comparison-base">{renderArtwork(comparison)}</div>
        <div className="comparison-layer comparison-current" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>{renderArtwork(current)}</div>
        <span className="comparison-label current">当前 · {current.name}</span>
        <span className="comparison-label baseline">对比 · {comparison.name}</span>
        <span className="comparison-divider" style={{ left: `${position}%` }} aria-hidden="true"><Columns2 size={15} /></span>
        <input className="comparison-slider" type="range" min="5" max="95" value={position} onChange={(event) => onPositionChange(Number(event.target.value))} aria-label="拖动查看两个版本的差异" />
      </div>
    </div>
  )
}

function VersionThumbnail({ concept, selected, onSelect }) {
  const palette = concept.palette || ['#c9685a', '#f4f1e9', '#58725c', '#242826']
  return (
    <button className={`version-thumbnail ${selected ? 'selected' : ''}`} onClick={onSelect} aria-label={`切换到${concept.name}`}>
      <div className="version-image" style={{ '--version-accent': palette[0], '--version-paper': palette[1] }}>
        <img src={concept.image || baseMockup} alt="" />
        {selected && <span className="version-selected"><Check size={12} /></span>}
      </div>
      <strong>{concept.name}</strong>
      <span>{concept.mode === 'draft' ? '编辑草稿' : concept.image ? 'AI效果图' : '初始方向'}</span>
    </button>
  )
}

function LegacyPackagingStudio({ state, updateState, confirmStage, notify, openAiSettings }) {
  const design = { ...defaultPackagingDesign, ...(state.packagingDesign || {}) }
  const [generating, setGenerating] = useState(false)
  const [generating3D, setGenerating3D] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const allConcepts = useMemo(() => [...starterConcepts, ...(design.generatedConcepts || [])], [design.generatedConcepts])
  const selectedConcept = design.selectedConceptId === 'custom-live'
    ? { id: 'custom-live', name: '自定义预览', direction: design.style, palette: design.palette }
    : allConcepts.find((item) => item.id === design.selectedConceptId) || allConcepts[0]
  const selectedPackaging = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]

  const updateDesign = (patch, preserveConfirmation = false) => updateState({
    packagingDesign: {
      ...design,
      ...(preserveConfirmation ? {} : { confirmed2D: false, confirmedConceptId: '', gateConfirmedAt: '', show3D: false, viewMode: '2d' }),
      ...patch,
    },
    ...(preserveConfirmation ? {} : { completed: state.completed.filter((index) => index !== 5) }),
  })
  const updatePalette = (index, value) => {
    const palette = [...design.palette]
    palette[index] = value
    updateDesign({ palette, selectedConceptId: 'custom-live' })
  }
  const toggleFinish = (finish) => updateDesign({
    finishes: design.finishes.includes(finish)
      ? design.finishes.filter((item) => item !== finish)
      : [...design.finishes, finish],
  })

  const selectConcept = (concept) => {
    updateDesign({ selectedConceptId: concept.id, style: concept.direction, palette: concept.palette || design.palette })
  }

  const changePackaging = (packagingId) => updateState({
    selectedPackaging: packagingId,
    packagingDesign: { ...design, confirmed2D: false, confirmedConceptId: '', show3D: false, viewMode: '2d' },
    completed: state.completed.filter((index) => index !== 5),
  })

  const generateConcepts = async () => {
    setGenerating(true)
    setGenerationError('')
    try {
      const response = await fetch('/api/ai/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: design.brandName,
          productName: design.productName,
          structure: selectedPackaging.name,
          style: design.style,
          palette: design.palette,
          finishes: design.finishes,
          description: design.description,
          audience: state.assumptions.user,
          price: state.assumptions.price,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '包装方案生成失败，请稍后重试。')
      const generatedConcepts = payload.concepts.map((item, index) => ({
        ...item,
        name: `AI方案${index + 1}`,
        direction: design.style,
        palette: design.palette,
      }))
      updateDesign({ generatedConcepts, selectedConceptId: generatedConcepts[0].id })
      notify(`已用 ${payload.model} 生成3套包装概念`)
    } catch (error) {
      setGenerationError(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const activeConcept = selectedConcept
  const displayConcepts = activeConcept.id === 'custom-live' ? [activeConcept, ...allConcepts] : allConcepts
  const show3D = Boolean(design.confirmed2D && design.show3D)
  const viewMode = show3D && design.viewMode === '3d' ? '3d' : '2d'

  const confirm2D = () => {
    updateDesign({ confirmed2D: true, confirmedConceptId: activeConcept.id, viewMode: '2d' }, true)
    notify(`已确认2D包装方案：${activeConcept.name}`)
  }

  const generate3D = () => {
    if (!design.confirmed2D || generating3D) return
    setGenerating3D(true)
    window.setTimeout(() => {
      updateDesign({ show3D: true, viewMode: '3d' }, true)
      setGenerating3D(false)
      notify('已根据确认的2D方案建立3D包装样机')
    }, 650)
  }

  const setViewMode = (mode) => updateDesign({ viewMode: mode }, true)

  return (
    <>
      <StageHeading title="包装设计" description="先生成并确认2D包装视觉；确认后，再按需要建立3D纸盒与瓶器样机。" />
      <div className="packaging-workflow" aria-label="包装设计流程">
        <div className="done"><span>1</span><strong>选择2D方案</strong></div>
        <i />
        <div className={design.confirmed2D ? 'done' : 'active'}><span>{design.confirmed2D ? <Check size={13} /> : 2}</span><strong>确认2D效果</strong></div>
        <i />
        <div className={show3D ? 'done' : design.confirmed2D ? 'optional' : ''}><span>{show3D ? <Check size={13} /> : 3}</span><strong>按需生成3D</strong><small>可选</small></div>
      </div>
      <div className="packaging-studio">
        <section className="packaging-inspector" aria-label="包装设计参数">
          <div className="studio-section-title"><div><strong>2D设计参数</strong><span>修改后需重新确认2D方案</span></div><Sparkles size={17} /></div>
          <div className="studio-form">
            <Field label="品牌名称" hint={`${design.brandName.length}/20`}>
              <input maxLength={20} value={design.brandName} onChange={(event) => updateDesign({ brandName: event.target.value })} />
            </Field>
            <Field label="产品名称" hint={`${design.productName.length}/24`}>
              <input maxLength={24} value={design.productName} onChange={(event) => updateDesign({ productName: event.target.value })} />
            </Field>
            <label className="studio-select"><span>包装结构</span><select value={state.selectedPackaging} onChange={(event) => changePackaging(event.target.value)}>{packagingOptions.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.bottle}</option>)}</select></label>
            <label className="studio-select"><span>风格方向</span><select value={design.style} onChange={(event) => updateDesign({ style: event.target.value, selectedConceptId: 'custom-live' })}><option>自然植萃 · 现代简约</option><option>草本清新 · 植物插画</option><option>高端质感 · 简约线条</option><option>专业功效 · 实验室感</option></select></label>
            <fieldset className="palette-field"><legend>主色调</legend><div>{design.palette.map((color, index) => <label key={`${color}-${index}`} title={`颜色 ${index + 1}`}><input type="color" value={color} onChange={(event) => updatePalette(index, event.target.value)} /><span style={{ background: color }} /></label>)}</div></fieldset>
            <fieldset className="finish-field"><legend>工艺与材质</legend><div>{finishOptions.map((finish) => <label key={finish}><input type="checkbox" checked={design.finishes.includes(finish)} onChange={() => toggleFinish(finish)} /><span className="finish-check">{design.finishes.includes(finish) ? <Check size={12} /> : null}</span>{finish}</label>)}</div></fieldset>
            <Field label="包装设计描述（可选）" hint={`${design.description.length}/240`}>
              <textarea maxLength={240} value={design.description} onChange={(event) => updateDesign({ description: event.target.value })} />
            </Field>
            <Button className="full-width packaging-generate" icon={Sparkles} onClick={generateConcepts} disabled={generating}>{generating ? '正在生成3套方案…' : 'AI生成3套方案'}</Button>
            <div className={`generation-state ${generationError ? 'error' : ''}`}>
              {generating ? <><span className="generation-spinner" /><span>正在绘制包装正面稿，预计需要1-2分钟</span></> : generationError ? <><CircleStatus /><span>{generationError}</span><button onClick={openAiSettings}>打开AI设置</button></> : <><span className="ready-dot" /><span>先确认2D视觉，再按需要建立3D样机</span></>}
            </div>
          </div>
        </section>

        <section className="packaging-canvas" aria-label="包装2D设计与可选3D样机">
          <div className="packaging-preview-area">
            <div className="preview-modebar">
              <div className="preview-tabs" aria-label="预览模式">
                <button className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')}><ImageIcon size={15} />2D设计</button>
                {show3D && <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')}><Box size={15} />3D样机</button>}
              </div>
              <div className="preview-actions">
                {!design.confirmed2D && <Button icon={Check} onClick={confirm2D}>确认2D效果</Button>}
                {design.confirmed2D && !show3D && <><span className="two-d-confirmed"><Check size={13} />2D已确认</span><Button variant="secondary" icon={Box} onClick={generate3D} disabled={generating3D}>{generating3D ? '正在建立3D…' : '生成3D样机'}</Button></>}
                {show3D && <span className="two-d-confirmed"><Check size={13} />2D已确认</span>}
              </div>
            </div>
            {viewMode === '3d'
              ? <PackagingPreview3D design={design} concept={activeConcept} />
              : <PackagingArtwork2D design={design} concept={activeConcept} />}
          </div>
          <div className="concept-library-head"><div><strong>2D包装方案</strong><span>{allConcepts.length}套 · 选择后进入2D预览</span></div><div><Eye size={14} />{design.confirmed2D ? '2D已确认' : '待确认'}</div></div>
          <div className="packaging-concepts">
            {displayConcepts.map((concept) => <ConceptThumbnail key={concept.id} concept={concept} selected={concept.id === activeConcept?.id} onSelect={() => selectConcept(concept)} />)}
          </div>
        </section>
      </div>

      <section className="packaging-spec-band">
        <div><span>瓶器</span><strong>{selectedPackaging.bottle}</strong><p>校验尺寸、材质与批次色差</p></div>
        <div><span>出液结构</span><strong>{selectedPackaging.applicator}</strong><p>验证顺滑、出液均匀与倒置密封</p></div>
        <div><span>纸盒工艺</span><strong>{design.finishes.join(' + ') || selectedPackaging.carton}</strong><p>确认抗压、运输保护与印刷可实现性</p></div>
        <div><span>生产边界</span><strong>概念图 ≠ 印刷刀版</strong><p>定稿前仍需法规、条码和印前审核</p></div>
      </section>
    </>
  )
}

export function PackagingStudio({ state, updateState, notify, openAiSettings }) {
  const design = { ...defaultPackagingDesign, ...(state.packagingDesign || {}) }
  const partSettings = normalizePartSettings(design.partSettings)
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [generating3D, setGenerating3D] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [editError, setEditError] = useState('')
  const [maskDataUrl, setMaskDataUrl] = useState('')
  const [maskMode, setMaskMode] = useState('paint')
  const [brushSize, setBrushSize] = useState(34)
  const [maskResetKey, setMaskResetKey] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [compareConceptId, setCompareConceptId] = useState('')
  const [comparePosition, setComparePosition] = useState(50)
  const uploadRef = useRef(null)
  const allConcepts = useMemo(() => [...starterConcepts, ...(design.generatedConcepts || [])], [design.generatedConcepts])
  const activeConcept = allConcepts.find((item) => item.id === design.selectedConceptId) || allConcepts[0]
  const fallbackCompareConcept = allConcepts.find((item) => item.id === activeConcept.parentId && item.id !== activeConcept.id)
    || allConcepts.find((item) => item.id !== activeConcept.id)
  const compareConcept = allConcepts.find((item) => item.id === compareConceptId && item.id !== activeConcept.id)
    || fallbackCompareConcept
  const activePart = packagingParts.find((part) => part.id === design.activePartId) || packagingParts[1]
  const selectedPackaging = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
  const show3D = Boolean(design.confirmed2D && design.show3D)
  const viewMode = design.viewMode === 'views' ? 'views' : show3D && design.viewMode === '3d' ? '3d' : '2d'

  useEffect(() => {
    setMaskDataUrl('')
    setMaskResetKey((value) => value + 1)
  }, [activeConcept.id, activePart.id])
  const gateChecks = Array.isArray(design.gateChecks) ? design.gateChecks : []
  const gateReady = packagingGateItems.every((item) => gateChecks.includes(item.id))

  const updateDesign = (patch, preserveConfirmation = false) => updateState({
    packagingDesign: {
      ...design,
      ...(preserveConfirmation ? {} : { confirmed2D: false, confirmedConceptId: '', show3D: false, viewMode: '2d' }),
      ...patch,
    },
    ...(preserveConfirmation ? {} : { completed: state.completed.filter((index) => index !== 5) }),
  })

  const updatePalette = (index, value) => {
    const palette = [...design.palette]
    palette[index] = value
    updateDesign({ palette })
  }

  const selectConcept = (concept) => {
    if (concept.id === activeConcept.id) return
    updateDesign({ selectedConceptId: concept.id, style: concept.direction, palette: concept.palette || design.palette })
  }

  const changePackaging = (packagingId) => updateState({
    selectedPackaging: packagingId,
    packagingDesign: { ...design, gateChecks: [], confirmed2D: false, confirmedConceptId: '', gateConfirmedAt: '', show3D: false, viewMode: '2d' },
    completed: state.completed.filter((index) => index !== 5),
  })

  const setActivePart = (partId) => updateDesign({ activePartId: partId, editorTab: 'parts' }, true)

  const togglePartLock = (partId) => updateDesign({
    partSettings: {
      ...partSettings,
      [partId]: { ...partSettings[partId], locked: !partSettings[partId].locked },
    },
  }, true)

  const togglePartVisibility = (partId) => updateDesign({
    partSettings: {
      ...partSettings,
      [partId]: { ...partSettings[partId], visible: !partSettings[partId].visible },
    },
  })

  const changeZoom = (delta) => updateDesign({ canvasZoom: Math.min(130, Math.max(70, design.canvasZoom + delta)) }, true)

  const selectCanvasTool = (tool) => {
    setCompareMode(false)
    if (tool === 'mask') setMaskMode('paint')
    if (tool === 'erase') setMaskMode('erase')
    updateDesign({ activeTool: tool }, true)
  }

  const clearMask = () => {
    setMaskDataUrl('')
    setMaskResetKey((value) => value + 1)
  }

  const startComparison = (concept = compareConcept) => {
    if (!concept || concept.id === activeConcept.id) {
      notify('请先选择另一个版本进行对比')
      return
    }
    setCompareConceptId(concept.id)
    setComparePosition(50)
    setCompareMode(true)
    clearMask()
    updateDesign({ activeTool: 'select', viewMode: '2d', editorTab: 'versions' }, true)
  }

  const toggleComparison = () => {
    if (compareMode) {
      setCompareMode(false)
      return
    }
    startComparison()
  }

  const toggleGateCheck = (itemId) => updateDesign({
    gateChecks: gateChecks.includes(itemId)
      ? gateChecks.filter((id) => id !== itemId)
      : [...gateChecks, itemId],
  })

  const handleReferenceUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/')).slice(0, 3 - design.referenceImages.length)
    if (!files.length) return
    try {
      const additions = await Promise.all(files.map(readAndCompressImage))
      updateDesign({ referenceImages: [...design.referenceImages, ...additions].slice(0, 3) }, true)
      notify(`已加入${additions.length}张参考图`)
    } catch (error) {
      setGenerationError(error.message)
    } finally {
      event.target.value = ''
    }
  }

  const removeReference = (referenceId) => updateDesign({
    referenceImages: design.referenceImages.filter((item) => item.id !== referenceId),
  }, true)

  const generateConcepts = async () => {
    setGenerating(true)
    setGenerationError('')
    try {
      const response = await fetch('/api/ai/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: design.brandName,
          productName: design.productName,
          structure: selectedPackaging.name,
          style: design.style,
          palette: design.palette,
          finishes: design.finishes,
          description: design.description,
          audience: state.assumptions.user,
          price: state.assumptions.price,
          referenceImages: design.referenceImages.map((item) => item.dataUrl),
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '包装效果图生成失败，请稍后重试。')
      const generatedConcepts = payload.concepts.map((item, index) => ({
        ...item,
        name: `AI方案${index + 1}`,
        direction: design.style,
        palette: design.palette,
        mode: 'ai',
        createdAt: new Date().toISOString(),
      }))
      updateDesign({ generatedConcepts: [...(design.generatedConcepts || []), ...generatedConcepts], selectedConceptId: generatedConcepts[0].id })
      notify(`已用 ${payload.model} 生成3套包装效果图`)
    } catch (error) {
      setGenerationError(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const createDraftVersion = (message) => {
    const draft = {
      id: `draft-${Date.now()}`,
      name: `版本${(design.generatedConcepts || []).length + 1}`,
      direction: activeConcept.direction,
      palette: activeConcept.palette || design.palette,
      image: activeConcept.image || '',
      adjustments: deriveDraftAdjustments(design.localEditPrompt, activeConcept.adjustments),
      parentId: activeConcept.id,
      partId: activePart.id,
      editPrompt: design.localEditPrompt,
      maskApplied: Boolean(maskDataUrl),
      mode: 'draft',
      createdAt: new Date().toISOString(),
    }
    updateDesign({
      generatedConcepts: [...(design.generatedConcepts || []), draft],
      selectedConceptId: draft.id,
    })
    notify(message || '已创建局部修改草稿')
  }

  const refinePart = async () => {
    if (!design.localEditPrompt.trim() || activePart.kind === 'text' || partSettings[activePart.id]?.locked || refining) return
    setRefining(true)
    setEditError('')
    try {
      const healthResponse = await fetch('/api/ai/health')
      const health = await healthResponse.json().catch(() => ({}))
      if (!health.imageConfigured) {
        createDraftVersion('生图模型未配置，已创建可视化修改草稿')
        return
      }
      const response = await fetch('/api/ai/packaging/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImage: activeConcept.image || baseMockup,
          partId: activePart.id,
          partLabel: activePart.label,
          instruction: design.localEditPrompt,
          lockedParts: packagingParts.filter((part) => partSettings[part.id]?.locked).map((part) => part.label),
          brandName: design.brandName,
          productName: design.productName,
          mask: maskDataUrl,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '局部修改失败，请稍后重试。')
      const version = {
        ...payload.concept,
        name: `版本${(design.generatedConcepts || []).length + 1}`,
        direction: activeConcept.direction,
        palette: activeConcept.palette || design.palette,
        parentId: activeConcept.id,
        partId: activePart.id,
        editPrompt: design.localEditPrompt,
        maskApplied: Boolean(maskDataUrl),
        mode: 'ai',
        createdAt: new Date().toISOString(),
      }
      updateDesign({
        generatedConcepts: [...(design.generatedConcepts || []), version],
        selectedConceptId: version.id,
      })
      notify(`已完成“${activePart.label}”局部修改`)
    } catch (error) {
      setEditError(error.message)
    } finally {
      setRefining(false)
    }
  }

  const duplicateVersion = (concept) => {
    const duplicate = {
      ...concept,
      id: `copy-${Date.now()}`,
      name: `${concept.name}副本`,
      parentId: concept.id,
      mode: 'draft',
      createdAt: new Date().toISOString(),
    }
    updateDesign({ generatedConcepts: [...(design.generatedConcepts || []), duplicate], selectedConceptId: duplicate.id })
    notify('已复制为新版本')
  }

  const deleteVersion = (conceptId) => {
    const generatedConcepts = (design.generatedConcepts || []).filter((concept) => concept.id !== conceptId)
    updateDesign({
      generatedConcepts,
      selectedConceptId: activeConcept.id === conceptId ? (activeConcept.parentId || starterConcepts[0].id) : activeConcept.id,
    })
    notify('版本已删除')
  }

  const confirm2D = () => {
    if (!gateReady) {
      notify('请先完成打样前验收检查')
      return
    }
    updateDesign({ confirmed2D: true, confirmedConceptId: activeConcept.id, gateConfirmedAt: new Date().toISOString(), viewMode: '2d' }, true)
    notify(`已确认2D包装方案：${activeConcept.name}`)
  }

  const generate3D = () => {
    if (!design.confirmed2D || generating3D) return
    setCompareMode(false)
    setGenerating3D(true)
    window.setTimeout(() => {
      updateDesign({ show3D: true, viewMode: '3d' }, true)
      setGenerating3D(false)
      notify('已根据确认的2D方案建立3D包装样机')
    }, 650)
  }

  return (
    <>
      <div className="packaging-stage-heading">
        <StageHeading title="包装设计" description="AI先生成完整效果图，再按部位精细修改；文字保持为可控图层，确认2D后可按需生成3D。" />
        <div className="packaging-stage-actions">
          <Button variant="secondary" icon={Layers3} onClick={() => { setCompareMode(false); updateDesign({ viewMode: viewMode === 'views' ? '2d' : 'views' }, true) }}>{viewMode === 'views' ? '返回2D编辑' : '查看成品三视图'}</Button>
          {show3D && <Button variant="secondary" icon={viewMode === '3d' ? ImageIcon : Box} onClick={() => { setCompareMode(false); updateDesign({ viewMode: viewMode === '3d' ? '2d' : '3d' }, true) }}>{viewMode === '3d' ? '返回2D编辑' : '查看3D样机'}</Button>}
          {!design.confirmed2D && <Button icon={Check} onClick={confirm2D} disabled={!gateReady}>确认2D效果</Button>}
          {design.confirmed2D && !show3D && <Button icon={Box} onClick={generate3D} disabled={generating3D}>{generating3D ? '正在建立3D…' : '生成3D样机'}</Button>}
          {design.confirmed2D && <span className="two-d-confirmed"><Check size={13} />2D已确认</span>}
        </div>
      </div>

      <div className="packaging-workbench">
        <section className="workbench-brief" aria-label="包装生成需求">
          <div className="workbench-panel-title"><div><strong>生成需求</strong><span>描述方向并上传参考素材</span></div><Sparkles size={17} /></div>
          <div className="workbench-brief-body">
            <div className="compact-field-grid">
              <Field label="品牌名称"><input maxLength={20} value={design.brandName} onChange={(event) => updateDesign({ brandName: event.target.value })} /></Field>
              <Field label="产品名称"><input maxLength={24} value={design.productName} onChange={(event) => updateDesign({ productName: event.target.value })} /></Field>
            </div>
            <Field label="设计需求" hint={`${design.description.length}/240`}>
              <textarea className="brief-textarea" maxLength={240} value={design.description} onChange={(event) => updateDesign({ description: event.target.value })} />
            </Field>

            <div className="reference-field">
              <div className="reference-field-head"><strong>参考图片</strong><span>{design.referenceImages.length}/3</span></div>
              <div className="reference-grid">
                {design.referenceImages.map((reference) => (
                  <div className="reference-tile" key={reference.id}>
                    <img src={reference.dataUrl} alt={reference.name} />
                    <button onClick={() => removeReference(reference.id)} title="移除参考图" aria-label={`移除${reference.name}`}><Trash2 size={12} /></button>
                  </div>
                ))}
                {design.referenceImages.length < 3 && <button className="reference-upload" onClick={() => uploadRef.current?.click()}><ImagePlus size={18} /><span>上传图片</span></button>}
              </div>
              <input ref={uploadRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={handleReferenceUpload} />
              <small>支持JPG、PNG，自动压缩用于AI参考</small>
            </div>

            <label className="studio-select"><span>包装结构</span><select value={state.selectedPackaging} onChange={(event) => changePackaging(event.target.value)}>{packagingOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="studio-select"><span>设计风格</span><select value={design.style} onChange={(event) => updateDesign({ style: event.target.value })}><option>自然植萃 · 现代简约</option><option>草本清新 · 植物插画</option><option>高端质感 · 简约线条</option><option>专业功效 · 实验室感</option></select></label>
            <fieldset className="palette-field"><legend>配色倾向</legend><div>{design.palette.map((color, index) => <label key={`${color}-${index}`} title={`颜色 ${index + 1}`}><input type="color" value={color} onChange={(event) => updatePalette(index, event.target.value)} /><span style={{ background: color }} /></label>)}</div></fieldset>
            <fieldset className="finish-field"><legend>工艺与材质</legend><div>{finishOptions.map((finish) => <label key={finish}><input type="checkbox" checked={design.finishes.includes(finish)} onChange={() => updateDesign({ finishes: design.finishes.includes(finish) ? design.finishes.filter((item) => item !== finish) : [...design.finishes, finish] })} /><span className="finish-check">{design.finishes.includes(finish) ? <Check size={12} /> : null}</span>{finish}</label>)}</div></fieldset>
            <Button className="full-width workbench-generate" icon={Sparkles} onClick={generateConcepts} disabled={generating}>{generating ? '正在生成效果图…' : '生成新方案'}</Button>
            <div className={`generation-state ${generationError ? 'error' : ''}`}>
              {generating ? <><span className="generation-spinner" /><span>正在生成纸盒与瓶器效果图</span></> : generationError ? <><CircleStatus /><span>{generationError}</span><button onClick={openAiSettings}>打开AI设置</button></> : <><span className="ready-dot" /><span>先生成整体，再从右侧选择部位修改</span></>}
            </div>
          </div>
        </section>

        <section className="workbench-center" aria-label="包装效果图编辑画布">
          <div className="canvas-toolbar" role="toolbar" aria-label="画布工具">
            <button className={`canvas-tool-button ${design.activeTool === 'select' ? 'active' : ''}`} onClick={() => selectCanvasTool('select')} title="选择部位" aria-label="选择"><MousePointer2 size={15} /><span>选择</span></button>
            <button className={`canvas-tool-button ${design.activeTool === 'mask' ? 'active' : ''}`} onClick={() => selectCanvasTool('mask')} title="绘制局部选区" aria-label="画笔"><Paintbrush size={15} /><span>画笔</span></button>
            <button className={`canvas-tool-button ${design.activeTool === 'erase' ? 'active' : ''}`} onClick={() => selectCanvasTool('erase')} title="擦除选区" aria-label="擦除"><Eraser size={15} /><span>擦除</span></button>
            <button className={`canvas-tool-button ${compareMode ? 'active' : ''}`} onClick={toggleComparison} title="对比两个设计版本" aria-label="版本对比"><Columns2 size={15} /><span>对比</span></button>
            <span className="toolbar-divider" />
            <div className="canvas-selection"><Layers3 size={14} /><span>{compareMode && compareConcept ? `${activeConcept.name} vs ${compareConcept.name}` : activePart.label}</span>{!compareMode && partSettings[activePart.id]?.locked && <Lock size={12} />}</div>
            {!compareMode && design.activeTool !== 'select' && <><label className="brush-size" title="画笔大小"><span>{brushSize}px</span><input type="range" min="16" max="80" step="2" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /></label><button className="clear-mask" onClick={clearMask} title="清空选区" aria-label="清空选区"><Trash2 size={15} /></button></>}
            <div className="toolbar-spacer" />
            <button onClick={() => changeZoom(-10)} title="缩小" aria-label="缩小"><ZoomOut size={16} /></button>
            <span className="zoom-value">{design.canvasZoom}%</span>
            <button onClick={() => changeZoom(10)} title="放大" aria-label="放大"><ZoomIn size={16} /></button>
            <button onClick={() => updateDesign({ canvasZoom: 100 }, true)} title="重置缩放" aria-label="重置缩放"><Maximize2 size={16} /></button>
          </div>

          <div className="canvas-main">
            {viewMode === '3d'
              ? <PackagingPreview3D design={design} concept={activeConcept} />
              : viewMode === 'views'
                ? <PackagingThreeViews design={design} concept={activeConcept} selectedPackaging={selectedPackaging} />
                : compareMode && compareConcept
                  ? <VersionComparison design={design} current={activeConcept} comparison={compareConcept} position={comparePosition} onPositionChange={setComparePosition} />
                  : <PackagingArtwork2D design={design} concept={activeConcept} partSettings={partSettings} activePartId={activePart.id} onSelectPart={setActivePart} maskMode={maskMode} brushSize={brushSize} maskResetKey={maskResetKey} onMaskChange={setMaskDataUrl} />}
          </div>

          <div className="version-filmstrip">
            <div className="version-filmstrip-head"><div><strong>设计版本</strong><span>{compareMode && compareConcept ? `${activeConcept.name} vs ${compareConcept.name}` : `${allConcepts.length}个版本`}</span></div><button onClick={() => duplicateVersion(activeConcept)}><Copy size={13} />复制当前版本</button></div>
            <div className="version-filmstrip-list">
              {allConcepts.map((concept) => <VersionThumbnail key={concept.id} concept={concept} selected={concept.id === activeConcept.id} onSelect={() => selectConcept(concept)} />)}
            </div>
          </div>
        </section>

        <aside className="workbench-layers" aria-label="包装部位与版本">
          <div className="layer-tabs" role="tablist" aria-label="编辑器面板">
            <button className={design.editorTab === 'parts' ? 'active' : ''} onClick={() => updateDesign({ editorTab: 'parts' }, true)} role="tab">部位</button>
            <button className={design.editorTab === 'versions' ? 'active' : ''} onClick={() => updateDesign({ editorTab: 'versions' }, true)} role="tab">版本</button>
          </div>

          {design.editorTab === 'parts' ? (
            <>
              <div className="layer-section-head"><strong>图层 / 设计部位</strong><span>点击画布也可选择</span></div>
              <div className="part-list">
                {packagingParts.map((part) => (
                  <div className={`part-row ${activePart.id === part.id ? 'active' : ''}`} key={part.id}>
                    <button className="part-main" onClick={() => setActivePart(part.id)}><GripVertical size={14} /><span className="part-number">{part.number}</span><strong>{part.label}</strong></button>
                    <button onClick={() => togglePartVisibility(part.id)} title={partSettings[part.id].visible ? '隐藏' : '显示'} aria-label={`${partSettings[part.id].visible ? '隐藏' : '显示'}${part.label}`}>{partSettings[part.id].visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                    <button onClick={() => togglePartLock(part.id)} title={partSettings[part.id].locked ? '解锁' : '锁定'} aria-label={`${partSettings[part.id].locked ? '解锁' : '锁定'}${part.label}`}>{partSettings[part.id].locked ? <Lock size={14} /> : <Unlock size={14} />}</button>
                  </div>
                ))}
              </div>

              <div className="local-edit-panel">
                {activePart.kind === 'text' ? (
                  <>
                    <div className="local-edit-title"><div><strong>精确文字图层</strong><span>文字不会交给生图模型重绘</span></div><span className="part-number">{activePart.number}</span></div>
                    <Field label={activePart.label} hint={`${design[activePart.field].length}/${activePart.field === 'brandName' ? 20 : 24}`}>
                      <input value={design[activePart.field]} maxLength={activePart.field === 'brandName' ? 20 : 24} onChange={(event) => updateDesign({ [activePart.field]: event.target.value })} />
                    </Field>
                    <div className="text-layer-note"><Lock size={13} />保持字体清晰、内容准确，并独立于效果图保存。</div>
                  </>
                ) : (
                  <>
                    <div className="local-edit-title"><div><strong>AI局部修改</strong><span>只修改当前选中的“{activePart.label}”</span></div><span className="part-number">{activePart.number}</span></div>
                    <div className={`mask-status ${maskDataUrl ? 'ready' : ''}`}><Paintbrush size={13} /><span>{maskDataUrl ? '已绘制精确选区，AI只重绘透明蒙版区域' : '可直接按部位修改，也可用画笔圈出精确选区'}</span></div>
                    <textarea maxLength={200} value={design.localEditPrompt} onChange={(event) => updateDesign({ localEditPrompt: event.target.value }, true)} disabled={partSettings[activePart.id]?.locked} />
                    <div className="local-edit-meta"><span>{design.localEditPrompt.length}/200</span><span>{packagingParts.filter((part) => partSettings[part.id]?.locked).length}个部位已锁定</span></div>
                    <Button className="full-width" icon={Sparkles} onClick={refinePart} disabled={refining || partSettings[activePart.id]?.locked || !design.localEditPrompt.trim()}>{partSettings[activePart.id]?.locked ? '请先解锁该部位' : refining ? '正在局部修改…' : maskDataUrl ? '按选区生成局部修改' : '生成局部修改'}</Button>
                    {editError && <div className="inline-edit-error"><CircleStatus /><span>{editError}</span></div>}
                  </>
                )}
              </div>

              <div className="gate-check-panel">
                <div className="gate-check-head">
                  <div><strong>打样前验收</strong><span>{gateChecks.length}/{packagingGateItems.length}项完成</span></div>
                  {gateReady ? <span className="gate-ready"><Check size={12} />可确认</span> : <span className="gate-pending">待补齐</span>}
                </div>
                <div className="gate-check-list">
                  {packagingGateItems.map((item) => {
                    const checked = gateChecks.includes(item.id)
                    return (
                      <label key={item.id} className={checked ? 'checked' : ''}>
                        <input type="checkbox" checked={checked} onChange={() => toggleGateCheck(item.id)} />
                        <span className="custom-check">{checked && <Check size={13} />}</span>
                        <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="layer-section-head"><strong>版本记录</strong><span>当前：{activeConcept.name}</span></div>
              <div className="version-history">
                {[...allConcepts].reverse().map((concept) => {
                  const generated = !concept.id.startsWith('seed-')
                  return (
                    <div className={`version-history-row ${activeConcept.id === concept.id ? 'active' : ''} ${compareMode && compareConcept?.id === concept.id ? 'comparing' : ''}`} key={concept.id}>
                      <button className="version-history-main" onClick={() => selectConcept(concept)}><span className="history-thumb"><img src={concept.image || baseMockup} alt="" /></span><span><strong>{concept.name}</strong><small>{concept.mode === 'draft' ? '编辑草稿' : concept.image ? 'AI效果图' : '初始方向'}</small></span></button>
                      <button className="version-compare-button" onClick={() => startComparison(concept)} disabled={activeConcept.id === concept.id} title="与当前版本对比" aria-label={`将${concept.name}设为对比版本`}><Columns2 size={14} /></button>
                      <button onClick={() => duplicateVersion(concept)} title="复制版本" aria-label={`复制${concept.name}`}><Copy size={14} /></button>
                      {generated && <button onClick={() => deleteVersion(concept.id)} title="删除版本" aria-label={`删除${concept.name}`}><Trash2 size={14} /></button>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </aside>
      </div>

      <section className="packaging-spec-band workbench-specs">
        <div><span>瓶器</span><strong>{selectedPackaging.bottle}</strong><p>校验尺寸、材质与批次色差</p></div>
        <div><span>出液结构</span><strong>{selectedPackaging.applicator}</strong><p>验证顺滑、出液均匀与倒置密封</p></div>
        <div><span>纸盒工艺</span><strong>{design.finishes.join(' + ') || selectedPackaging.carton}</strong><p>确认抗压、运输保护与印刷可实现性</p></div>
        <div><span>生产边界</span><strong>三视图 ≠ 印刷刀版</strong><p>正侧俯视只用于结构沟通，定稿前仍需印前审核</p></div>
      </section>
    </>
  )
}

function CircleStatus() {
  return <span className="error-dot" aria-hidden="true"><EyeOff size={11} /></span>
}

export function PackagingDecision({ state }) {
  const design = { ...defaultPackagingDesign, ...(state.packagingDesign || {}) }
  const concepts = [...starterConcepts, ...(design.generatedConcepts || [])]
  const selectedConcept = design.selectedConceptId === 'custom-live'
    ? { id: 'custom-live', name: '自定义预览', direction: design.style, palette: design.palette }
    : concepts.find((item) => item.id === design.selectedConceptId) || concepts[0]
  const selectedPackaging = packagingOptions.find((item) => item.id === state.selectedPackaging) || packagingOptions[0]
  const palette = selectedConcept.palette || design.palette
  const gateChecks = Array.isArray(design.gateChecks) ? design.gateChecks : []
  const gateReady = packagingGateItems.every((item) => gateChecks.includes(item.id))
  return (
    <div className="packaging-decision">
      <div className="decision-heading"><div><span>当前2D方案</span><h2>{selectedConcept.name}</h2></div><span className={`decision-state ${design.confirmed2D ? '' : 'pending'}`}>{design.confirmed2D ? <Check size={12} /> : <ImageIcon size={12} />}{design.confirmed2D ? '2D已确认' : '待确认'}</span></div>
      <div className="decision-preview" style={{ '--decision-accent': palette[0], '--decision-paper': palette[1] }}>
        {selectedConcept.image ? <img src={selectedConcept.image} alt="当前包装方案" /> : <><span className="decision-bottle" /><span className="decision-box" /></>}
        <div><strong>{design.brandName}<br />{design.productName}</strong><span>{selectedPackaging.bottle}</span><small>20ml</small></div>
      </div>
      <dl className="definition-list compact">
        <div><dt>设计方向</dt><dd>{selectedConcept.direction}</dd></div>
        <div><dt>纸盒材质</dt><dd>{selectedPackaging.carton}</dd></div>
        <div><dt>表面工艺</dt><dd>{design.finishes.join('、') || '待选择'}</dd></div>
        <div><dt>3D样机</dt><dd>{design.show3D ? '已生成，可切换查看' : design.confirmed2D ? '可按需要生成' : '确认2D后开放'}</dd></div>
        <div><dt>瓶身材质</dt><dd>{selectedPackaging.bottle} + {selectedPackaging.applicator}</dd></div>
        <div><dt>包材成本</dt><dd>约 ¥{selectedPackaging.cost} / 套</dd></div>
        <div><dt>打样周期</dt><dd>{selectedPackaging.lead}</dd></div>
        <div><dt>验收进度</dt><dd>{gateChecks.length}/{packagingGateItems.length}项{gateReady ? ' · 可进入打样' : ' · 待补齐'}</dd></div>
      </dl>
      <div className="decision-gate-list">
        {packagingGateItems.map((item) => {
          const checked = gateChecks.includes(item.id)
          return <div key={item.id} className={checked ? 'checked' : ''}><span>{checked ? <Check size={12} /> : null}</span><strong>{item.title}</strong></div>
        })}
      </div>
      <div className="production-risk"><strong>生产风险提示</strong><p>先以2D方案冻结视觉方向，3D只用于按需检查立体效果；两者都不替代刀版、色值、条码和合规审核。</p></div>
    </div>
  )
}

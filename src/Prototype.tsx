import { useEffect, useMemo, useState } from "react"

type Surface = "kiosk" | "product" | "mobile" | "console"
type ProgramId = "release" | "recover" | "focus" | "renew" | "reshape"
type Source = "프로그램" | "AI" | "수동"
type SessionStatus = "none" | "assigned" | "preparing" | "ready" | "active" | "paused" | "completed" | "interrupted"
type Connection = "connected" | "disconnected"
type RequestState = "idle" | "pending" | "applied" | "failed"
type ControlKey = "heat" | "massage" | "light" | "mood" | "lower" | "pemf" | "sound" | "voice"
type IconName = "capsule" | "kiosk" | "grid" | "phone" | "home" | "user" | "check" | "alert" | "help" | "back" | "next" | "heat" | "massage" | "light" | "sound" | "spark" | "pause" | "play" | "wifi" | "clock" | "clean" | "report" | "settings" | "door" | "plus" | "minus"

type Program = {
  id: ProgramId
  ko: string
  en: string
  temp: number
  intensity: "낮음" | "중간" | "높음"
  region: string
  pattern: string
  light: string
  mood: string
  sound: string
}

type Controls = {
  heat: {
    enabled: boolean
    target: number
    measured: number
    source: Source
  }
  massage: {
    enabled: boolean
    intensity: "낮음" | "중간" | "높음"
    source: Source
  }
  light: {
    enabled: boolean
    output: "낮음" | "중간" | "높음"
    source: Source
  }
  mood: {
    enabled: boolean
    preset: string
    brightness: number
    source: Source
  }
  lower: { enabled: boolean; brightness: number; source: Source }
  pemf: { enabled: boolean; source: Source }
  sound: {
    enabled: boolean
    track: string
    playing: boolean
    volume: number
    source: Source
  }
  voice: {
    enabled: boolean
    language: string
    volume: number
    source: Source
  }
}

type Adjustment = {
  id: number
  kind: "수동" | "AI" | "시스템"
  parameter: string
  detail: string
  at: string
}

const programs: Program[] = [
  {
    id: "release",
    ko: "긴장 완화",
    en: "Release",
    temp: 45,
    intensity: "낮음",
    region: "경추–흉추",
    pattern: "느린 반복 롤링",
    light: "660nm 중심",
    mood: "은은한 앰버",
    sound: "느린 자연 소리",
  },
  {
    id: "recover",
    ko: "피로 회복",
    en: "Recover",
    temp: 55,
    intensity: "중간",
    region: "경추–요추",
    pattern: "척추 순환",
    light: "660nm + 850nm",
    mood: "따뜻한 백색",
    sound: "중간 템포",
  },
  {
    id: "focus",
    ko: "리프레시",
    en: "Focus",
    temp: 42,
    intensity: "중간",
    region: "경추–상부 흉추",
    pattern: "교차 리듬",
    light: "저강도 660nm",
    mood: "밝은 냉백색",
    sound: "밝은 템포",
  },
  {
    id: "renew",
    ko: "뭉침 이완",
    en: "Renew",
    temp: 55,
    intensity: "높음",
    region: "흉추–요추",
    pattern: "집중 압박",
    light: "850nm 비중 높음",
    mood: "따뜻한 백색",
    sound: "저주파 사운드",
  },
  {
    id: "reshape",
    ko: "바디 컨디셔닝",
    en: "Reshape",
    temp: 50,
    intensity: "중간",
    region: "요추–골반",
    pattern: "순환 롤링",
    light: "660nm 비중 높음",
    mood: "로즈 톤",
    sound: "가벼운 템포",
  },
]

const member = { name: "박정희", maskedPhone: "010-••••-2486", id: "M-20486" }
const venue = "한남 웰니스 센터"
const sessionId = "NMC-250528-014"

const iconPaths: Record<IconName, React.ReactNode> = {
  capsule: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="8" />
      <path d="M4 12h16M9 7h6" />
    </>
  ),
  kiosk: (
    <>
      <rect x="5" y="2.5" width="14" height="15" rx="2" />
      <path d="M9 21h6M12 17.5V21M8 7h8" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 5h4M11 19h2" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-6h6v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  check: <path d="m5 12 4.2 4L19 6.5" />,
  alert: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17.2h.01" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.8-1.2 1.8M12 17h.01" />
    </>
  ),
  back: <path d="m15 5-7 7 7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  heat: (
    <>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 8v9" />
    </>
  ),
  massage: (
    <>
      <path d="M7 3v7a5 5 0 0 0 10 0V3M5 21c2-4 4.4-5.5 7-5.5s5 1.5 7 5.5" />
      <path d="M10 6h4" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  sound: (
    <>
      <path d="M4 10v4h4l5 4V6L8 10H4Z" />
      <path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.2 4.3L17.5 8l-4.3 1.7L12 14l-1.2-4.3L6.5 8l4.3-1.7L12 2Z" />
      <path d="m19 15 .7 2.3 2.3.7-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  wifi: (
    <>
      <path d="M4 9a12 12 0 0 1 16 0M7 12.5a7.5 7.5 0 0 1 10 0M10 16a3 3 0 0 1 4 0" />
      <circle cx="12" cy="19" r=".7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  clean: (
    <>
      <path d="M7 3h10l-1 5H8L7 3ZM8 8l-3 13h14L16 8" />
      <path d="M9 13h6M8 17h8" />
    </>
  ),
  report: (
    <>
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 14 5.7L13.7 3h-4L9.4 5.7A8 8 0 0 0 7 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.4 1.4l.3 2.7h4l.3-2.7a8 8 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .2-1Z" />
    </>
  ),
  door: (
    <>
      <path d="M5 21V3h13v18M9 21V6h6v15M12 13h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
}

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  disabled,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark"
  icon?: IconName
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      className={`button ${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "orange" | "green" | "red" | "blue"
}) {
  return <span className={`badge ${tone}`}>{children}</span>
}

function SourceTag({ source }: { source: Source }) {
  return (
    <Badge
      tone={source === "수동" ? "blue" : source === "AI" ? "orange" : "neutral"}
    >
      {source}
    </Badge>
  )
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress-track">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const sec = (seconds % 60).toString().padStart(2, "0")
  return `${min}:${sec}`
}

function nowLabel() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function defaultsFor(program: Program): Controls {
  return {
    heat: {
      enabled: true,
      target: program.temp,
      measured: 36,
      source: "프로그램",
    },
    massage: {
      enabled: true,
      intensity: program.intensity,
      source: "프로그램",
    },
    light: {
      enabled: true,
      output: program.id === "renew" ? "높음" : "중간",
      source: "프로그램",
    },
    mood: {
      enabled: true,
      preset: program.mood,
      brightness: program.id === "focus" ? 75 : 45,
      source: "프로그램",
    },
    lower: { enabled: true, brightness: 40, source: "프로그램" },
    pemf: { enabled: true, source: "프로그램" },
    sound: {
      enabled: true,
      track: program.sound,
      playing: true,
      volume: 45,
      source: "프로그램",
    },
    voice: {
      enabled: true,
      language: "한국어",
      volume: 70,
      source: "프로그램",
    },
  }
}

type Shared = ReturnType<typeof usePrototype>

function usePrototype() {
  const [surface, setSurface] = useState<Surface>("kiosk")
  const [selectedId, setSelectedId] = useState<ProgramId>("recover")
  const selected = programs.find((item) => item.id === selectedId)!
  const [checkedIn, setCheckedIn] = useState(false)
  const [checklist, setChecklist] = useState({
    understood: false,
    comfort: false,
    review: false,
  })
  const [reviewStatus, setReviewStatus] =
    useState<"none" | "required" | "approved" | "declined">("none")
  const [assignment, setAssignment] = useState<"none" | "waiting" | "assigned">(
    "none",
  )
  const [roomReady, setRoomReady] = useState(true)
  const [room, setRoom] = useState("03")
  const [deviceReady, setDeviceReady] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("none")
  const [connection, setConnection] = useState<Connection>("connected")
  const [remaining, setRemaining] = useState(1800)
  const [controls, setControls] = useState<Controls>(() =>
    defaultsFor(selected),
  )
  const [request, setRequest] = useState<RequestState>("idle")
  const [failNext, setFailNext] = useState(false)
  const [lastConfirmed, setLastConfirmed] = useState("아직 없음")
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [feedback, setFeedback] = useState("입력 없음")
  const [interruptionReason, setInterruptionReason] = useState("")
  const [staffCalls, setStaffCalls] = useState(0)
  const [cleaning, setCleaning] =
    useState<"not-required" | "required" | "completed">("not-required")
  const [sanitation, setSanitation] =
    useState<"not-required" | "required" | "completed">("not-required")
  const [toast, setToast] = useState("")
  const [reportReady, setReportReady] = useState(false)
  const [reportStatus, setReportStatus] =
    useState<"completed" | "interrupted" | null>(null)
  const [reportDuration, setReportDuration] = useState(0)

  const phase =
    remaining <= 300 ? "마무리" : remaining > 1500 ? "도입" : "집중 케어"
  const elapsed = 1800 - remaining

  useEffect(() => {
    if (sessionStatus !== "active" || remaining <= 0) return
    const timer = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [sessionStatus, remaining])

  useEffect(() => {
    if (phase !== "마무리" || !controls.heat.enabled) return
    setControls((value) => ({
      ...value,
      heat: { ...value.heat, enabled: false },
    }))
    setAdjustments((value) => [
      ...value,
      {
        id: Date.now(),
        kind: "시스템",
        parameter: "온열",
        detail: "마무리 단계 자동 꺼짐",
        at: nowLabel(),
      },
    ])
  }, [phase, controls.heat.enabled])

  useEffect(() => {
    if (remaining !== 0 || sessionStatus !== "active") return
    completeSession()
  }, [remaining, sessionStatus])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function selectProgram(id: ProgramId) {
    const next = programs.find((item) => item.id === id)!
    setSelectedId(id)
    setControls(defaultsFor(next))
    setAdjustments([])
    setToast(`${next.ko} 프로그램을 선택했습니다.`)
  }

  function addAdjustment(
    kind: Adjustment["kind"],
    parameter: string,
    detail: string,
  ) {
    setAdjustments((value) => [
      ...value,
      {
        id: Date.now() + value.length,
        kind,
        parameter,
        detail,
        at: nowLabel(),
      },
    ])
  }

  function assignRoom(nextRoom = "03") {
    if (!roomReady) {
      setAssignment("waiting")
      setToast("준비된 룸이 없어 대기 명단에 등록했습니다.")
      return
    }
    setRoom(nextRoom)
    setAssignment("assigned")
    setSessionStatus("assigned")
    setDeviceReady(false)
    setToast(`${nextRoom}번 룸이 배정되었습니다.`)
  }

  function startPreparation() {
    setSessionStatus("preparing")
    window.setTimeout(() => {
      setDeviceReady(true)
      setSessionStatus("ready")
      setToast("척추 위치 확인을 완료했습니다.")
    }, 1400)
  }

  function startSession() {
    if (!deviceReady || assignment !== "assigned") {
      setToast("제품 준비와 룸 배정을 먼저 완료해 주세요.")
      return
    }
    setRemaining(1800)
    setSessionStatus("active")
    setCleaning("not-required")
    setSanitation("not-required")
    setReportReady(false)
    setReportStatus(null)
    setReportDuration(0)
    setInterruptionReason("")
    setToast("통합 프로그램을 시작했습니다.")
  }

  function pauseSession() {
    setSessionStatus("paused")
    setToast("타이머와 구성된 하드웨어 동작을 일시정지했습니다.")
  }

  function resumeSession() {
    setSessionStatus("active")
    setToast("통합 프로그램을 다시 시작했습니다.")
  }

  function completeSession() {
    setSessionStatus("completed")
    setRemaining(0)
    setReportReady(true)
    setReportStatus("completed")
    setReportDuration(1800)
    setCleaning("required")
    setSanitation("required")
    addAdjustment("시스템", "세션", "30분 프로그램 정상 완료")
    setToast("보고서를 생성하고 제품을 정리 대기로 전환했습니다.")
  }

  function interrupt(reason: string) {
    if (!["active", "paused"].includes(sessionStatus)) {
      setToast("진행 중인 세션이 없어 종료할 수 없습니다.")
      return
    }
    setSessionStatus("interrupted")
    setInterruptionReason(reason)
    setReportReady(true)
    setReportStatus("interrupted")
    setReportDuration(elapsed)
    setCleaning("required")
    setSanitation("required")
    addAdjustment("시스템", "세션", `${reason}로 중단`)
    if (reason === "캡슐 열림 감지") setStaffCalls((value) => value + 1)
    setToast("기능을 정지하고 직원에게 알렸습니다.")
  }

  function requestControl(
    parameter: string,
    updater: (value: Controls) => Controls,
    detail: string,
    kind: Adjustment["kind"] = "수동",
    origin: "product" | "mobile" = "product",
  ) {
    if (origin === "mobile" && connection === "disconnected") {
      setToast("연결이 끊겨 요청을 보낼 수 없습니다.")
      return
    }
    if (parameter === "온열" && phase === "마무리") {
      setToast("마무리 단계에서는 온열이 꺼집니다.")
      return
    }
    setRequest("pending")
    window.setTimeout(() => {
      if (failNext) {
        setFailNext(false)
        setRequest("failed")
        setToast("제품이 요청을 적용하지 못했습니다. 확인값을 유지합니다.")
        return
      }
      setControls(updater)
      setRequest("applied")
      setLastConfirmed(nowLabel())
      addAdjustment(kind, parameter, detail)
      setToast(`${parameter} 설정이 제품에 적용되었습니다.`)
    }, 650)
  }

  function applyDraft(draft: Controls) {
    ;(Object.keys(controlLabels) as ControlKey[]).forEach((key) => {
      if (JSON.stringify(controls[key]) === JSON.stringify(draft[key])) return
      addAdjustment(
        draft[key].source === "AI" ? "AI" : "수동",
        controlLabels[key],
        `시작 전 설정 · ${controlSummary(key, draft)}`,
      )
    })
    setControls(draft)
    setLastConfirmed(nowLabel())
    setToast("시작 전 설정을 저장했습니다. 하드웨어는 아직 작동하지 않습니다.")
  }

  function applyAi(origin: "product" | "mobile" = "product") {
    const nextVolume = Math.max(30, controls.sound.volume - 10)
    requestControl(
      "사운드",
      (value) => ({
        ...value,
        sound: { ...value.sound, volume: nextVolume, source: "AI" },
      }),
      `이용 선호에 따라 음량 ${controls.sound.volume}% → ${nextVolume}%`,
      "AI",
      origin,
    )
  }

  function restoreParameter(
    key: ControlKey,
    toAi = false,
    origin: "product" | "mobile" = "product",
  ) {
    const defaults = defaultsFor(selected)
    if (toAi) {
      if (key === "heat")
        requestControl(
          "온열",
          (value) => ({
            ...value,
            heat: {
              ...value.heat,
              target: Math.max(38, selected.temp - 2),
              source: "AI",
            },
          }),
          `AI 제어로 전환 · ${Math.max(38, selected.temp - 2)}°C`,
          "AI",
          origin,
        )
      else setToast("이 항목의 AI 제어는 데모 구성에서 지원되지 않습니다.")
      return
    }
    requestControl(
      controlLabels[key],
      (value) => ({ ...value, [key]: defaults[key] }),
      "현재 단계의 프로그램 설정 복원",
      "시스템",
      origin,
    )
  }

  function staffCall() {
    setStaffCalls((value) => value + 1)
    setToast("운영 콘솔로 직원 호출을 보냈습니다.")
  }

  function finishTurnaround() {
    if (cleaning !== "completed" || sanitation !== "completed") {
      setToast("청소와 구성된 살균 절차를 모두 완료해 주세요.")
      return
    }
    setCheckedIn(false)
    setChecklist({ understood: false, comfort: false, review: false })
    setReviewStatus("none")
    setAssignment("none")
    setDeviceReady(false)
    setSessionStatus("none")
    setRemaining(1800)
    setCleaning("not-required")
    setSanitation("not-required")
    setRoomReady(true)
    setToast(`${room}번 룸을 이용 가능으로 전환했습니다.`)
  }

  function reset() {
    setSelectedId("recover")
    setCheckedIn(false)
    setChecklist({ understood: false, comfort: false, review: false })
    setReviewStatus("none")
    setAssignment("none")
    setRoomReady(true)
    setRoom("03")
    setDeviceReady(false)
    setSessionStatus("none")
    setConnection("connected")
    setRemaining(1800)
    setControls(defaultsFor(programs[1]))
    setRequest("idle")
    setLastConfirmed("아직 없음")
    setAdjustments([])
    setFeedback("입력 없음")
    setInterruptionReason("")
    setStaffCalls(0)
    setCleaning("not-required")
    setSanitation("not-required")
    setReportReady(false)
    setReportStatus(null)
    setReportDuration(0)
    setToast("데모 상태를 초기화했습니다.")
  }

  return {
    surface,
    setSurface,
    selected,
    selectedId,
    selectProgram,
    checkedIn,
    setCheckedIn,
    checklist,
    setChecklist,
    reviewStatus,
    setReviewStatus,
    assignment,
    setAssignment,
    roomReady,
    setRoomReady,
    room,
    assignRoom,
    deviceReady,
    sessionStatus,
    setSessionStatus,
    connection,
    setConnection,
    remaining,
    setRemaining,
    phase,
    elapsed,
    controls,
    setControls,
    request,
    setRequest,
    failNext,
    setFailNext,
    lastConfirmed,
    adjustments,
    feedback,
    setFeedback,
    interruptionReason,
    staffCalls,
    setStaffCalls,
    cleaning,
    setCleaning,
    sanitation,
    setSanitation,
    toast,
    setToast,
    reportReady,
    reportStatus,
    reportDuration,
    startPreparation,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    interrupt,
    requestControl,
    applyDraft,
    applyAi,
    restoreParameter,
    staffCall,
    finishTurnaround,
    reset,
  }
}

const controlLabels: Record<ControlKey, string> = {
  heat: "온열",
  massage: "마사지",
  light: "광케어",
  mood: "무드 조명",
  lower: "하단 조명",
  pemf: "PEMF",
  sound: "사운드",
  voice: "음성 안내",
}

const controlIcons: Record<ControlKey, IconName> = {
  heat: "heat",
  massage: "massage",
  light: "light",
  mood: "light",
  lower: "light",
  pemf: "spark",
  sound: "sound",
  voice: "sound",
}

function controlSummary(key: ControlKey, controls: Controls) {
  const values: Record<ControlKey, string> = {
    heat: controls.heat.enabled ? `${controls.heat.target}°C` : "꺼짐",
    massage: controls.massage.enabled ? controls.massage.intensity : "꺼짐",
    light: controls.light.enabled ? `${controls.light.output} · 6존` : "꺼짐",
    mood: controls.mood.enabled
      ? `${controls.mood.preset} · ${controls.mood.brightness}%`
      : "꺼짐",
    lower: controls.lower.enabled ? `${controls.lower.brightness}%` : "꺼짐",
    pemf: controls.pemf.enabled ? "프로그램 제어 · 작동" : "꺼짐",
    sound: controls.sound.enabled
      ? `${controls.sound.track} · ${controls.sound.volume}%`
      : "꺼짐",
    voice: controls.voice.enabled
      ? `${controls.voice.language} · ${controls.voice.volume}%`
      : "꺼짐",
  }
  return values[key]
}

export default function Prototype() {
  const shared = usePrototype()
  return (
    <main className="prototype-shell">
      <PrototypeHeader shared={shared} />
      <LifecycleBar shared={shared} />
      <div className={`stage stage-${shared.surface}`}>
        {shared.surface === "kiosk" && <Kiosk shared={shared} />}
        {shared.surface === "product" && <Product shared={shared} />}
        {shared.surface === "mobile" && <Mobile shared={shared} />}
        {shared.surface === "console" && <Console shared={shared} />}
      </div>
      {shared.toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {shared.toast}
        </div>
      )}
    </main>
  )
}

function PrototypeHeader({ shared }: { shared: Shared }) {
  const options: { id: Surface; label: string; icon: IconName }[] = [
    { id: "kiosk", label: "리셉션 키오스크", icon: "kiosk" },
    { id: "product", label: "제품 디스플레이", icon: "capsule" },
    { id: "mobile", label: "모바일 앱", icon: "phone" },
    { id: "console", label: "운영 콘솔", icon: "grid" },
  ]
  return (
    <header className="prototype-header">
      <div className="prototype-brand">
        <span className="brand-mark">
          <i />
          <i />
          <i />
        </span>
        <div>
          <strong>MASTER CAPSULE</strong>
          <span>2.0 · 연결형 서비스 프로토타입</span>
        </div>
      </div>
      <nav className="prototype-nav" aria-label="프로토타입 화면 선택">
        {options.map((option) => (
          <button
            key={option.id}
            className={shared.surface === option.id ? "active" : ""}
            onClick={() => shared.setSurface(option.id)}
          >
            <Icon name={option.icon} size={19} />
            <span>{option.label}</span>
          </button>
        ))}
      </nav>
      <button
        className="demo-toggle"
        onClick={() => document.body.classList.toggle("show-demo")}
      >
        <Icon name="settings" size={18} />
        데모 제어
      </button>
      <DemoPanel shared={shared} />
    </header>
  )
}

function DemoPanel({ shared }: { shared: Shared }) {
  return (
    <aside className="demo-panel">
      <div>
        <strong>데모 트리거</strong>
        <button onClick={() => document.body.classList.remove("show-demo")}>
          닫기
        </button>
      </div>
      <button
        onClick={() => {
          shared.setChecklist((value) => ({ ...value, review: true }))
          shared.setReviewStatus("required")
          shared.setToast("직원 확인이 필요한 응답을 만들었습니다.")
        }}
      >
        직원 확인 필요
      </button>
      <button
        onClick={() => {
          shared.setRoomReady(false)
          shared.setAssignment("waiting")
          shared.setToast("모든 룸을 준비 중 상태로 전환했습니다.")
        }}
      >
        준비된 룸 없음
      </button>
      <button
        onClick={() => {
          shared.setFailNext(true)
          shared.setToast("다음 제어 요청은 실패합니다.")
        }}
      >
        다음 조정 실패
      </button>
      <button
        onClick={() => {
          shared.setConnection("disconnected")
          shared.setToast("모바일 연결을 끊었습니다.")
        }}
      >
        연결 끊김
      </button>
      <button onClick={() => shared.interrupt("캡슐 열림 감지")}>
        캡슐 열림
      </button>
      <button onClick={() => shared.interrupt("비상 정지")}>비상 정지</button>
      <button
        onClick={() => {
          shared.setRemaining(300)
          shared.setSessionStatus("active")
          shared.setToast("마무리 단계로 이동했습니다.")
        }}
      >
        마무리 단계
      </button>
      <button onClick={shared.completeSession}>세션 완료</button>
      <button className="reset" onClick={shared.reset}>
        전체 초기화
      </button>
    </aside>
  )
}

function LifecycleBar({ shared }: { shared: Shared }) {
  const states = [
    "이용 가능",
    "체크인",
    "체크리스트",
    "프로그램",
    "룸 배정",
    "제품 준비",
    "이용",
    "보고서",
    "정리",
  ]
  let index = 0
  if (shared.checkedIn) index = 1
  if (
    shared.checkedIn &&
    shared.checklist.understood &&
    shared.checklist.comfort
  )
    index = 2
  if (shared.checkedIn && shared.reviewStatus === "approved") index = 3
  if (shared.assignment !== "none") index = 4
  if (["preparing", "ready"].includes(shared.sessionStatus)) index = 5
  if (["active", "paused"].includes(shared.sessionStatus)) index = 6
  if (shared.reportReady && shared.sessionStatus !== "none") index = 7
  if (
    shared.sessionStatus !== "none" &&
    (shared.cleaning === "completed" || shared.sanitation === "completed")
  )
    index = 8
  return (
    <div className="lifecycle-bar">
      <span>{sessionId}</span>
      <div>
        {states.map((state, position) => (
          <span
            key={state}
            className={
              position < index ? "done" : position === index ? "current" : ""
            }
          >
            <i>{position < index ? "✓" : position + 1}</i>
            {state}
          </span>
        ))}
      </div>
      <Badge tone={shared.connection === "connected" ? "green" : "red"}>
        {shared.connection === "connected" ? "앱 연결됨" : "앱 연결 끊김"}
      </Badge>
    </div>
  )
}

function Brand() {
  return (
    <div className="mini-brand">
      <span className="brand-mark small">
        <i />
        <i />
        <i />
      </span>
      MASTER CAPSULE 2.0
    </div>
  )
}

function ScreenTitle({
  step,
  title,
  description,
}: {
  step?: string
  title: string
  description?: string
}) {
  return (
    <div className="title-block">
      {step && <p className="eyebrow">{step}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}

function BackHeader({
  title,
  onBack,
  right,
}: {
  title: string
  onBack: () => void
  right?: React.ReactNode
}) {
  return (
    <div className="flow-subhead">
      <button onClick={onBack}>
        <Icon name="back" />
        뒤로
      </button>
      <strong>{title}</strong>
      <span>{right}</span>
    </div>
  )
}

type KioskScreen = "welcome" | "identify" | "checklist" | "review" | "programs" | "confirm" | "assignment"

function Kiosk({ shared }: { shared: Shared }) {
  const [screen, setScreen] = useState<KioskScreen>("welcome")
  const [identified, setIdentified] = useState(false)
  const steps: KioskScreen[] = [
    "welcome",
    "identify",
    "checklist",
    "programs",
    "confirm",
    "assignment",
  ]
  const stepIndex = Math.max(0, steps.indexOf(screen))

  useEffect(() => {
    if (shared.reviewStatus === "approved" && screen === "review")
      setScreen("programs")
  }, [shared.reviewStatus, screen])

  useEffect(() => {
    if (
      !shared.checkedIn &&
      shared.assignment === "none" &&
      shared.sessionStatus === "none"
    ) {
      setScreen("welcome")
      setIdentified(false)
    }
  }, [shared.checkedIn, shared.assignment, shared.sessionStatus])

  function submitChecklist() {
    if (!shared.checklist.understood || !shared.checklist.comfort) {
      shared.setToast("필수 확인 항목에 응답해 주세요.")
      return
    }
    if (shared.checklist.review) {
      shared.setReviewStatus("required")
      setScreen("review")
    } else {
      shared.setReviewStatus("approved")
      setScreen("programs")
    }
  }

  return (
    <div className="device-wrap kiosk-wrap">
      <div className="device-caption">
        <span>리셉션 키오스크 · K{String(stepIndex + 1).padStart(2, "0")}</span>
        <Badge tone="green">운영 중</Badge>
      </div>
      <div className="kiosk-device flow-kiosk">
        <header className="kiosk-header">
          <Brand />
          <Button variant="ghost" icon="help" onClick={shared.staffCall}>
            직원 도움
          </Button>
        </header>
        <div className="kiosk-progress">
          <div>
            {steps.map((item, index) => (
              <span key={item} className={index <= stepIndex ? "active" : ""} />
            ))}
          </div>
          <small>{stepIndex + 1} / 6</small>
        </div>
        <div className="kiosk-content">
          {screen === "welcome" && (
            <div className="flow-center welcome">
              <span className="hero-icon">
                <Icon name="user" size={38} />
              </span>
              <ScreenTitle
                step="방문을 환영합니다"
                title="마스터 캡슐을 이용하시나요?"
                description="회원 확인부터 룸 안내까지 한 단계씩 도와드릴게요."
              />
              <Button
                className="hero-button"
                onClick={() => setScreen("identify")}
              >
                이용 시작
              </Button>
              <Button
                variant="secondary"
                icon="help"
                onClick={shared.staffCall}
              >
                직원 도움
              </Button>
            </div>
          )}
          {screen === "identify" && (
            <>
              <ScreenTitle
                step="K02 · 회원 확인"
                title="회원 정보를 확인해 주세요"
                description="데모 회원의 개인정보는 가려서 표시됩니다."
              />
              <Card
                className={`member-identify ${identified ? "identified" : ""}`}
              >
                <span>
                  <Icon name="user" size={30} />
                </span>
                <div>
                  <small>등록 회원</small>
                  <strong>{identified ? member.name : "박○희"}</strong>
                  <p>{member.maskedPhone}</p>
                </div>
                {identified && <Badge tone="green">확인됨</Badge>}
              </Card>
              {identified ? (
                <Button
                  className="kiosk-wide"
                  onClick={() => {
                    shared.setCheckedIn(true)
                    setScreen("checklist")
                  }}
                >
                  다음
                </Button>
              ) : (
                <Button
                  className="kiosk-wide"
                  onClick={() => setIdentified(true)}
                >
                  데모 회원 확인
                </Button>
              )}
              <Button
                variant="ghost"
                className="kiosk-wide"
                onClick={() => setScreen("welcome")}
              >
                이전
              </Button>
            </>
          )}
          {screen === "checklist" && (
            <>
              <ScreenTitle
                step="K03 · 이용 전 확인"
                title="안내 내용을 확인해 주세요"
                description="응답은 직원 확인에 사용되며 자동으로 이용 가능 여부를 판단하지 않습니다."
              />
              <div className="checklist-cards">
                <ChecklistItem
                  checked={shared.checklist.understood}
                  title="이용 안내를 확인했습니다"
                  description="캡슐 열림 시 모든 기능이 정지되고 이용이 종료됩니다."
                  onClick={() =>
                    shared.setChecklist((value) => ({
                      ...value,
                      understood: !value.understood,
                    }))
                  }
                />
                <ChecklistItem
                  checked={shared.checklist.comfort}
                  title="현재 편안하게 이용할 수 있습니다"
                  description="도움이 필요하면 언제든 직원을 호출할 수 있습니다."
                  onClick={() =>
                    shared.setChecklist((value) => ({
                      ...value,
                      comfort: !value.comfort,
                    }))
                  }
                />
                <ChecklistItem
                  checked={shared.checklist.review}
                  warning
                  title="직원과 먼저 확인하고 싶은 내용이 있습니다"
                  description="선택하면 직원 확인 후 다음 단계로 진행합니다."
                  onClick={() =>
                    shared.setChecklist((value) => ({
                      ...value,
                      review: !value.review,
                    }))
                  }
                />
              </div>
              <Button className="kiosk-wide" onClick={submitChecklist}>
                응답 제출
              </Button>
            </>
          )}
          {screen === "review" && (
            <div className="flow-center review-wait">
              <span className="danger-symbol">
                <Icon name="help" size={38} />
              </span>
              <Badge
                tone={shared.reviewStatus === "declined" ? "red" : "orange"}
              >
                {shared.reviewStatus === "declined"
                  ? "진행 보류"
                  : "직원 확인 대기"}
              </Badge>
              <ScreenTitle
                title={
                  shared.reviewStatus === "declined"
                    ? "직원 확인 후 다시 진행해 주세요"
                    : "직원 확인이 필요합니다."
                }
                description="요청을 운영 콘솔로 보냈습니다. 자동 판단하지 않으며 직원 확인 후 다음 단계가 열립니다."
              />
              <Button
                variant="secondary"
                icon="help"
                onClick={shared.staffCall}
              >
                직원 호출
              </Button>
            </div>
          )}
          {screen === "programs" && (
            <>
              <ScreenTitle
                step="K04 · 프로그램 선택"
                title="오늘의 30분 케어를 선택해 주세요"
                description="다섯 가지 통합 프로그램 중 하나를 선택하세요."
              />
              <div className="kiosk-programs connected-programs">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    className={
                      shared.selectedId === program.id ? "selected" : ""
                    }
                    onClick={() => {
                      shared.selectProgram(program.id)
                      setScreen("confirm")
                    }}
                  >
                    <div>
                      <span className="radio">
                        <i />
                      </span>
                      <p>
                        <strong>{program.ko}</strong>
                        <small>{program.en}</small>
                      </p>
                    </div>
                    <span>{program.temp}°C</span>
                    <small>
                      {program.intensity} · {program.light}
                    </small>
                    <em>30분</em>
                    {program.id === "recover" && (
                      <Badge tone="orange">AI 추천</Badge>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {screen === "confirm" && (
            <>
              <ScreenTitle
                step="K05 · 선택 확인"
                title={`${shared.selected.ko} 프로그램`}
                description={`${shared.selected.en} · 30분 통합 케어`}
              />
              <ProgramSummary shared={shared} />
              <div className="kiosk-confirm-actions">
                <Button
                  variant="secondary"
                  onClick={() => setScreen("programs")}
                >
                  다시 선택
                </Button>
                <Button
                  onClick={() => {
                    shared.assignRoom()
                    setScreen("assignment")
                  }}
                >
                  선택 완료
                </Button>
              </div>
            </>
          )}
          {screen === "assignment" && <AssignmentScreen shared={shared} />}
        </div>
      </div>
    </div>
  )
}

function ChecklistItem({
  checked,
  title,
  description,
  warning,
  onClick,
}: {
  checked: boolean
  title: string
  description: string
  warning?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`${checked ? "checked" : ""} ${warning ? "warning" : ""}`}
      onClick={onClick}
    >
      <span>
        <Icon name="check" />
      </span>
      <p>
        <strong>{title}</strong>
        <small>{description}</small>
      </p>
    </button>
  )
}

function AssignmentScreen({ shared }: { shared: Shared }) {
  if (shared.assignment === "waiting")
    return (
      <div className="flow-center assignment">
        <span className="hero-icon neutral">
          <Icon name="clock" size={38} />
        </span>
        <Badge tone="orange">룸 준비 대기</Badge>
        <ScreenTitle
          step="K06 · 룸 배정"
          title="준비된 룸을 기다리고 있어요"
          description="룸이 준비되면 같은 프로그램과 세션 정보가 제품으로 전달됩니다."
        />
        <Card>
          <span>선택 프로그램</span>
          <strong>{shared.selected.ko} · 30분</strong>
        </Card>
        <Button variant="secondary" icon="help" onClick={shared.staffCall}>
          직원 도움
        </Button>
      </div>
    )
  return (
    <div className="flow-center assignment">
      <Badge tone="green">배정 완료</Badge>
      <span className="room-number">{shared.room}</span>
      <ScreenTitle
        step="K06 · 룸 배정"
        title={`${Number(shared.room)}번 룸으로 이동해 주세요`}
        description="선택한 프로그램이 제품으로 전달되었습니다. 이 화면에서는 제품을 시작하지 않습니다."
      />
      <Card>
        <span>
          <Icon name="capsule" />
          {shared.selected.ko}
        </span>
        <strong>
          {member.name} · {sessionId}
        </strong>
      </Card>
      <Button
        onClick={() => {
          shared.setSurface("product")
          shared.setToast("배정된 제품 화면을 열었습니다.")
        }}
      >
        제품 화면 확인
      </Button>
    </div>
  )
}

function ProgramSummary({ shared }: { shared: Shared }) {
  return (
    <Card className="program-summary">
      <div>
        <span className="summary-program-icon">
          <Icon name="spark" />
        </span>
        <p>
          <small>통합 프로그램</small>
          <strong>{shared.selected.ko}</strong>
          <em>{shared.selected.en}</em>
        </p>
        <Badge tone="orange">30분</Badge>
      </div>
      <dl>
        <div>
          <dt>온열</dt>
          <dd>{shared.controls.heat.target}°C</dd>
        </div>
        <div>
          <dt>마사지</dt>
          <dd>
            {shared.controls.massage.intensity} · {shared.selected.region}
          </dd>
        </div>
        <div>
          <dt>광케어</dt>
          <dd>{shared.selected.light}</dd>
        </div>
        <div>
          <dt>사운드</dt>
          <dd>{shared.controls.sound.track}</dd>
        </div>
      </dl>
    </Card>
  )
}

type ProductScreen = "available" | "assigned" | "review" | "programs" | "settings" | "control" | "prepare" | "ready" | "active" | "paused" | "completed" | "interrupted" | "report"

function Product({ shared }: { shared: Shared }) {
  const [screen, setScreen] = useState<ProductScreen>(
    shared.assignment === "assigned" ? "assigned" : "available",
  )
  const [control, setControl] = useState<ControlKey>("heat")
  const [controlMode, setControlMode] = useState<"draft" | "live">("draft")
  const [draft, setDraft] = useState<Controls>(shared.controls)
  const [scanFailed, setScanFailed] = useState(false)

  useEffect(() => {
    if (shared.sessionStatus === "none" && shared.assignment === "none")
      setScreen("available")
    if (shared.sessionStatus === "assigned" && screen === "available")
      setScreen("assigned")
    if (shared.sessionStatus === "active") setScreen("active")
    if (shared.sessionStatus === "paused") setScreen("paused")
    if (shared.sessionStatus === "completed") setScreen("completed")
    if (shared.sessionStatus === "interrupted") setScreen("interrupted")
  }, [shared.sessionStatus, shared.assignment, screen])

  function openPreControl(key: ControlKey) {
    setDraft(structuredClone(shared.controls))
    setControlMode("draft")
    setControl(key)
    setScreen("control")
  }

  function openLiveControl(key: ControlKey) {
    setControlMode("live")
    setControl(key)
    setScreen("control")
  }

  return (
    <div className="device-wrap product-wrap">
      <div className="device-caption">
        <span>제품 본체 · 7인치 · P{productCode(screen)}</span>
        <Badge tone="green">{shared.room}번 룸 · 제품 연결됨</Badge>
      </div>
      <div className="product-device connected-product">
        <header className="product-header">
          <Brand />
          <span>
            {sessionId}
            <i className="header-divider" />
            <Icon name="wifi" size={18} />
          </span>
        </header>
        {screen === "available" && (
          <div className="product-centered">
            <Badge tone="green">이용 가능</Badge>
            <span className="ready-symbol success">
              <Icon name="capsule" size={38} />
            </span>
            <p className="eyebrow">{shared.room}번 룸</p>
            <h1>다음 세션을 기다리고 있습니다</h1>
            <p className="lead">
              체크인과 룸 배정이 완료되면 프로그램 정보가 표시됩니다.
            </p>
            <Button variant="secondary" icon="help" onClick={shared.staffCall}>
              직원 호출
            </Button>
          </div>
        )}
        {screen === "assigned" && (
          <div className="product-centered">
            <Badge tone="green">세션 배정됨</Badge>
            <span className="ready-symbol">
              <Icon name="capsule" size={38} />
            </span>
            <p className="eyebrow">
              {shared.room}번 룸 · {member.name} 회원
            </p>
            <h1>{shared.selected.ko}</h1>
            <p className="lead">{shared.selected.en} · 30분 통합 프로그램</p>
            <div className="product-primary-stack">
              <Button
                className="wide-action"
                onClick={() => setScreen("review")}
              >
                프로그램 확인
              </Button>
              <Button
                variant="secondary"
                icon="help"
                onClick={shared.staffCall}
              >
                직원 호출
              </Button>
            </div>
          </div>
        )}
        {screen === "review" && (
          <ProductPage>
            <BackHeader
              title="프로그램 확인"
              onBack={() => setScreen("assigned")}
              right={<Badge tone="orange">30분</Badge>}
            />
            <ScreenTitle
              title={shared.selected.ko}
              description={`${shared.selected.en} · 마사지, 온열, 광케어, PEMF, 사운드 통합`}
            />
            <div className="review-grid">
              <Metric
                icon="heat"
                label="온열 목표"
                value={`${shared.controls.heat.target}°C`}
              />
              <Metric
                icon="massage"
                label="마사지"
                value={shared.controls.massage.intensity}
              />
              <Metric
                icon="light"
                label="광케어"
                value={shared.selected.light}
              />
            </div>
            <StageStrip />
            <div className="product-footer-actions three">
              <Button variant="ghost" onClick={() => setScreen("programs")}>
                프로그램 변경
              </Button>
              <Button
                variant="secondary"
                icon="settings"
                onClick={() => {
                  setControlMode("draft")
                  setDraft(structuredClone(shared.controls))
                  setScreen("settings")
                }}
              >
                상세 설정
              </Button>
              <Button onClick={() => setScreen("prepare")}>이용 준비</Button>
            </div>
          </ProductPage>
        )}
        {screen === "programs" && (
          <ProductPage>
            <BackHeader
              title="프로그램 변경"
              onBack={() => setScreen("review")}
            />
            <div className="compact-program-list">
              {programs.map((program) => (
                <button
                  className={program.id === shared.selectedId ? "selected" : ""}
                  key={program.id}
                  onClick={() => {
                    shared.selectProgram(program.id)
                    setScreen("review")
                  }}
                >
                  <span className="radio">
                    <i />
                  </span>
                  <p>
                    <strong>{program.ko}</strong>
                    <small>{program.en} · 30분</small>
                  </p>
                  <span>{program.temp}°C</span>
                  <Icon name="next" />
                </button>
              ))}
            </div>
          </ProductPage>
        )}
        {screen === "settings" && (
          <ProductPage>
            <BackHeader
              title={
                controlMode === "live"
                  ? "이용 중 설정 조절"
                  : "시작 전 상세 설정"
              }
              onBack={() =>
                setScreen(controlMode === "live" ? "active" : "review")
              }
              right={
                controlMode === "live"
                  ? formatTime(shared.remaining)
                  : undefined
              }
            />
            <p className="screen-instruction">
              {controlMode === "live"
                ? "변경 사항은 제품 확인 후 즉시 적용되며 타이머는 계속 진행됩니다."
                : "기능을 하나씩 열어 조절하세요. 저장 전에는 제품이 작동하지 않습니다."}
            </p>
            {controlMode === "draft" && (
              <button
                className="ai-suggestion product-ai"
                onClick={() => {
                  setDraft((value) => aiDraft(value))
                  shared.setToast(
                    "이용 선호를 반영해 사운드 음량 초안을 조정했습니다.",
                  )
                }}
              >
                <span>
                  <Icon name="spark" />
                </span>
                <p>
                  <strong>AI 맞춤 조정</strong>
                  <small>
                    저장 전 초안에만 적용되며 사운드 음량을 범위 안에서
                    조정합니다.
                  </small>
                </p>
                <Icon name="next" />
              </button>
            )}
            <ControlList
              controls={controlMode === "live" ? shared.controls : draft}
              selected={shared.selected}
              onOpen={controlMode === "live" ? openLiveControl : openPreControl}
            />
            <div className="product-footer-actions">
              <Button
                variant="secondary"
                onClick={() =>
                  setScreen(controlMode === "live" ? "active" : "review")
                }
              >
                {controlMode === "live" ? "이용 화면으로" : "취소"}
              </Button>
              {controlMode === "draft" && (
                <Button
                  onClick={() => {
                    shared.applyDraft(draft)
                    setScreen("review")
                  }}
                >
                  설정 적용
                </Button>
              )}
            </div>
          </ProductPage>
        )}
        {screen === "control" && (
          <ProductPage>
            <BackHeader
              title={controlLabels[control]}
              onBack={() => setScreen("settings")}
              right={
                controlMode === "live" ? (
                  formatTime(shared.remaining)
                ) : (
                  <Badge tone="neutral">초안</Badge>
                )
              }
            />
            <FunctionControl
              mode={controlMode}
              control={control}
              values={controlMode === "live" ? shared.controls : draft}
              setValues={setDraft}
              shared={shared}
            />
            {controlMode === "draft" && (
              <div className="product-footer-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraft(structuredClone(shared.controls))
                    setScreen("settings")
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    shared.applyDraft(draft)
                    setScreen("review")
                  }}
                >
                  설정 적용
                </Button>
              </div>
            )}
          </ProductPage>
        )}
        {screen === "prepare" && (
          <ProductPreparation
            shared={shared}
            failed={scanFailed}
            setFailed={setScanFailed}
            onReady={() => setScreen("ready")}
            onBack={() => setScreen("review")}
          />
        )}
        {screen === "ready" && (
          <div className="product-centered final-ready">
            <Badge tone="green">준비 완료</Badge>
            <p className="eyebrow">
              {shared.room}번 룸 · {member.name} 회원
            </p>
            <h1>{shared.selected.ko}</h1>
            <p className="lead">
              최종 설정을 확인했습니다. 시작하면 모든 프리셋 기능이 함께
              실행됩니다.
            </p>
            <div className="ready-summary">
              <span>
                <Icon name="heat" />
                {shared.controls.heat.target}°C
              </span>
              <span>
                <Icon name="massage" />
                {shared.controls.massage.intensity}
              </span>
              <span>
                <Icon name="light" />
                {shared.selected.light}
              </span>
            </div>
            <Button
              className="one-touch"
              icon="play"
              onClick={shared.startSession}
            >
              시작
            </Button>
          </div>
        )}
        {screen === "active" && (
          <ActiveProduct
            shared={shared}
            onControls={() => {
              setControlMode("live")
              setScreen("settings")
            }}
            onControl={openLiveControl}
          />
        )}
        {screen === "paused" && (
          <div className="product-centered">
            <span className="ready-symbol">
              <Icon name="pause" size={38} />
            </span>
            <p className="eyebrow">{shared.selected.ko}</p>
            <h1>이용을 잠시 멈췄습니다</h1>
            <p className="timer compact">{formatTime(shared.remaining)}</p>
            <p className="lead">
              타이머와 구성된 하드웨어 동작이 일시정지되었습니다.
            </p>
            <div className="pause-actions">
              <Button icon="play" onClick={shared.resumeSession}>
                다시 시작
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm("이용을 종료할까요?"))
                    shared.interrupt("사용자 종료")
                }}
              >
                이용 종료
              </Button>
            </div>
          </div>
        )}
        {screen === "completed" && (
          <EndScreen
            shared={shared}
            completed
            onReport={() => setScreen("report")}
          />
        )}
        {screen === "interrupted" && (
          <EndScreen shared={shared} onReport={() => setScreen("report")} />
        )}
        {screen === "report" && (
          <ProductPage>
            <BackHeader
              title="이용 보고서"
              onBack={() =>
                setScreen(
                  shared.sessionStatus === "completed"
                    ? "completed"
                    : "interrupted",
                )
              }
            />
            <SessionReport shared={shared} compact />
          </ProductPage>
        )}
      </div>
    </div>
  )
}

function productCode(screen: ProductScreen) {
  const codes: Record<ProductScreen, string> = {
    available: "00",
    assigned: "01",
    review: "02",
    programs: "02",
    settings: "03",
    control: "03",
    prepare: "04",
    ready: "05",
    active: "06",
    paused: "08",
    completed: "09",
    interrupted: "10",
    report: "09",
  }
  return codes[screen]
}

function ProductPage({ children }: { children: React.ReactNode }) {
  return <div className="product-page flow-product-page">{children}</div>
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: IconName
  label: string
  value: string
}) {
  return (
    <Card className="metric">
      <span className="icon-tile">
        <Icon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </Card>
  )
}

function StageStrip() {
  return (
    <div className="phase-strip">
      <span>
        <b>도입</b>
        <small>5분</small>
      </span>
      <i />
      <span className="main">
        <b>집중 케어</b>
        <small>20분</small>
      </span>
      <i />
      <span>
        <b>마무리</b>
        <small>5분 · 온열 꺼짐</small>
      </span>
    </div>
  )
}

function ProductPreparation({
  shared,
  failed,
  setFailed,
  onReady,
  onBack,
}: {
  shared: Shared
  failed: boolean
  setFailed: (value: boolean) => void
  onReady: () => void
  onBack: () => void
}) {
  const [running, setRunning] = useState(false)
  function run(ignoreFailure = false) {
    setRunning(true)
    shared.setSessionStatus("preparing")
    window.setTimeout(() => {
      if (failed && !ignoreFailure) {
        setRunning(false)
        shared.setToast("척추 위치를 확인하지 못했습니다.")
      } else {
        shared.startPreparation()
        window.setTimeout(onReady, 1450)
      }
    }, 900)
  }
  return (
    <ProductPage>
      <BackHeader
        title="이용 준비"
        onBack={onBack}
        right={
          <Button variant="ghost" icon="help" onClick={shared.staffCall}>
            직원 호출
          </Button>
        }
      />
      <div className="prep-layout">
        <div className={`scan-visual ${running ? "scanning" : ""}`}>
          <span />
          <span />
          <span />
          <i />
        </div>
        <ScreenTitle
          step="V7 척추 위치 확인"
          title={
            failed
              ? "위치를 확인하지 못했습니다"
              : running
                ? "척추 위치를 확인하고 있어요"
                : "편안하게 누워 준비해 주세요"
          }
          description={
            failed
              ? "자세를 확인한 뒤 다시 시도하거나 직원을 불러 주세요."
              : "어깨 위치는 스캔하지 않습니다. 안내에 따라 편안하게 누워 주세요."
          }
        />
        {failed ? (
          <div className="prep-actions">
            <Button
              onClick={() => {
                setFailed(false)
                run(true)
              }}
            >
              다시 시도
            </Button>
            <Button variant="secondary" icon="help" onClick={shared.staffCall}>
              직원 호출
            </Button>
          </div>
        ) : (
          <Button disabled={running} onClick={() => run()}>
            {running ? "확인 중..." : "척추 위치 확인 시작"}
          </Button>
        )}
        <button className="scan-failure-link" onClick={() => setFailed(true)}>
          스캔 실패 데모
        </button>
      </div>
    </ProductPage>
  )
}

function ActiveProduct({
  shared,
  onControls,
  onControl,
}: {
  shared: Shared
  onControls: () => void
  onControl: (key: ControlKey) => void
}) {
  return (
    <div className="active-session">
      <div className="active-main">
        <div className="session-labels">
          <Badge tone="orange">{shared.phase}</Badge>
          <span>
            {shared.selected.ko} <small>{shared.selected.en}</small>
          </span>
        </div>
        <p className="timer">{formatTime(shared.remaining)}</p>
        <p className="remaining-label">남은 시간</p>
        <Progress value={(shared.remaining / 1800) * 100} />
        {shared.phase === "마무리" && (
          <div className="closing-note">
            <Icon name="heat" />
            마무리 단계에서는 온열이 꺼집니다. 현재 측정{" "}
            {shared.controls.heat.measured}°C
          </div>
        )}
        <div className="active-stats">
          <button onClick={() => onControl("heat")}>
            <span className="icon-tile warm">
              <Icon name="heat" />
            </span>
            <p>
              <small>온열</small>
              <strong>
                {shared.phase === "마무리"
                  ? "꺼짐"
                  : `${shared.controls.heat.target}°C`}
              </strong>
            </p>
            <SourceTag source={shared.controls.heat.source} />
          </button>
          <button onClick={() => onControl("massage")}>
            <span className="icon-tile">
              <Icon name="massage" />
            </span>
            <p>
              <small>마사지</small>
              <strong>{shared.controls.massage.intensity}</strong>
            </p>
            <SourceTag source={shared.controls.massage.source} />
          </button>
        </div>
      </div>
      <aside className="product-action-rail">
        <Button variant="dark" icon="settings" onClick={onControls}>
          설정 조절
        </Button>
        <Button variant="secondary" icon="pause" onClick={shared.pauseSession}>
          일시정지
        </Button>
        <Button variant="secondary" icon="help" onClick={shared.staffCall}>
          직원 호출
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm("이용을 종료할까요?"))
              shared.interrupt("사용자 종료")
          }}
        >
          이용 종료
        </Button>
      </aside>
    </div>
  )
}

function EndScreen({
  shared,
  completed,
  onReport,
}: {
  shared: Shared
  completed?: boolean
  onReport: () => void
}) {
  return (
    <div className={`product-centered ${completed ? "" : "termination"}`}>
      <span className={completed ? "ready-symbol success" : "danger-symbol"}>
        <Icon name={completed ? "check" : "alert"} size={40} />
      </span>
      <Badge tone={completed ? "green" : "red"}>
        {completed ? "정상 완료" : "이용 중단"}
      </Badge>
      <h1>{completed ? "케어가 완료되었습니다." : "이용이 중단되었습니다."}</h1>
      <p className="lead">
        {completed
          ? `${shared.selected.ko} · 실제 이용 30분`
          : `${shared.interruptionReason} · 실제 이용 ${Math.max(1, Math.floor(shared.elapsed / 60))}분`}
        <br />
        {completed
          ? "이용 보고서를 생성했습니다."
          : "부분 보고서를 생성하고 직원에게 알렸습니다."}
      </p>
      <Button icon="report" onClick={onReport}>
        보고서 보기
      </Button>
    </div>
  )
}

function ControlList({
  controls,
  selected,
  onOpen,
}: {
  controls: Controls
  selected: Program
  onOpen: (key: ControlKey) => void
}) {
  const values: Record<ControlKey, string> = {
    heat: controls.heat.enabled ? `${controls.heat.target}°C` : "꺼짐",
    massage: controls.massage.enabled
      ? `${controls.massage.intensity} · ${selected.pattern}`
      : "꺼짐",
    light: controls.light.enabled ? `${controls.light.output} · 6존` : "꺼짐",
    mood: controls.mood.enabled
      ? `${controls.mood.preset} · ${controls.mood.brightness}%`
      : "꺼짐",
    lower: controls.lower.enabled
      ? `켜짐 · ${controls.lower.brightness}%`
      : "꺼짐",
    pemf: controls.pemf.enabled ? "프로그램 제어 · 작동" : "꺼짐",
    sound: controls.sound.enabled
      ? `${controls.sound.track} · ${controls.sound.volume}%`
      : "꺼짐",
    voice: controls.voice.enabled
      ? `${controls.voice.language} · ${controls.voice.volume}%`
      : "꺼짐",
  }
  return (
    <div className="settings-list compact-settings">
      {(Object.keys(controlLabels) as ControlKey[]).map((key) => (
        <button key={key} className="setting-row" onClick={() => onOpen(key)}>
          <span className="icon-tile">
            <Icon name={controlIcons[key]} />
          </span>
          <span>
            <strong>{controlLabels[key]}</strong>
            <small>{values[key]}</small>
          </span>
          <SourceTag source={controls[key].source} />
          <Icon name="next" />
        </button>
      ))}
    </div>
  )
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      className={`switch ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <i />
    </button>
  )
}

function FunctionControl({
  mode,
  control,
  values,
  setValues,
  shared,
  origin = "product",
}: {
  mode: "draft" | "live"
  control: ControlKey
  values: Controls
  setValues?: React.Dispatch<React.SetStateAction<Controls>>
  shared: Shared
  origin?: "product" | "mobile"
}) {
  const live = mode === "live"
  const finalHeat = shared.phase === "마무리" && control === "heat"
  const updateDraft = (updater: (value: Controls) => Controls) =>
    setValues?.(updater)
  const update = (
    parameter: string,
    updater: (value: Controls) => Controls,
    detail: string,
  ) =>
    live
      ? shared.requestControl(parameter, updater, detail, "수동", origin)
      : updateDraft(updater)
  const status = live ? (
    <RequestFeedback shared={shared} origin={origin} />
  ) : (
    <div className="draft-note">
      <Icon name="alert" />
      초안 편집 중 · 설정 적용 전에는 제품이 작동하지 않습니다.
    </div>
  )

  if (control === "heat")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="heat"
          title="온열"
          description="단계별 자동 목표와 이용자 범위를 구분해 적용합니다."
          value={values.heat.enabled}
          onToggle={(enabled) =>
            update(
              "온열",
              (state) => ({
                ...state,
                heat: { ...state.heat, enabled, source: "수동" },
              }),
              enabled ? "온열 켜짐" : "온열 꺼짐",
            )
          }
          disabled={finalHeat}
        />
        <div className="measured-row">
          <span>현재 측정 온도</span>
          <strong>{values.heat.measured}°C</strong>
        </div>
        <div className="stepper">
          <button
            disabled={!values.heat.enabled || finalHeat}
            onClick={() =>
              update(
                "온열",
                (state) => ({
                  ...state,
                  heat: {
                    ...state.heat,
                    target: Math.max(38, state.heat.target - 1),
                    source: "수동",
                  },
                }),
                `목표 ${Math.max(38, values.heat.target - 1)}°C`,
              )
            }
          >
            <Icon name="minus" />
          </button>
          <strong>
            {values.heat.target}
            <small>°C</small>
          </strong>
          <button
            disabled={!values.heat.enabled || finalHeat}
            onClick={() =>
              update(
                "온열",
                (state) => ({
                  ...state,
                  heat: {
                    ...state.heat,
                    target: Math.min(60, state.heat.target + 1),
                    source: "수동",
                  },
                }),
                `목표 ${Math.min(60, values.heat.target + 1)}°C`,
              )
            }
          >
            <Icon name="plus" />
          </button>
        </div>
        <p className="range-note">이용자 조절 38–60°C · 제품 사양 20–80°C</p>
        {finalHeat && (
          <div className="blocked-note">
            <Icon name="alert" />
            마무리 단계에서는 온열이 꺼집니다.
          </div>
        )}
        {status}
        {live && (
          <RestoreActions
            shared={shared}
            control="heat"
            ai
            origin={origin}
          />
        )}
      </Card>
    )
  if (control === "massage")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="massage"
          title="마사지"
          description="V7 지원 강도만 조절할 수 있습니다."
          value={values.massage.enabled}
          onToggle={(enabled) =>
            update(
              "마사지",
              (state) => ({
                ...state,
                massage: { ...state.massage, enabled, source: "수동" },
              }),
              enabled ? "마사지 켜짐" : "마사지 꺼짐",
            )
          }
        />
        <OptionButtons
          value={values.massage.intensity}
          options={["낮음", "중간", "높음"]}
          onChange={(intensity) =>
            update(
              "마사지",
              (state) => ({
                ...state,
                massage: {
                  ...state.massage,
                  intensity: intensity as Controls["massage"]["intensity"],
                  source: "수동",
                },
              }),
              `강도 ${intensity}`,
            )
          }
        />
        <ReadOnlyInfo
          rows={[
            ["프로그램 패턴", shared.selected.pattern],
            ["지원 부위", shared.selected.region],
            ["척추 스캔", shared.deviceReady ? "완료" : "준비 전"],
          ]}
        />
        {status}
        {live && (
          <RestoreActions shared={shared} control="massage" origin={origin} />
        )}
      </Card>
    )
  if (control === "light")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="light"
          title="광케어"
          description="상·하부 여섯 존이 프로그램 구성에 따라 함께 작동합니다."
          value={values.light.enabled}
          onToggle={(enabled) =>
            update(
              "광케어",
              (state) => ({
                ...state,
                light: { ...state.light, enabled, source: "수동" },
              }),
              enabled ? "광케어 켜짐" : "광케어 꺼짐",
            )
          }
        />
        <div className="zone-schematic">
          <div>
            {[1, 2, 3].map((zone) => (
              <span className={values.light.enabled ? "active" : ""} key={zone}>
                상부 {zone}
              </span>
            ))}
          </div>
          <i />
          <div>
            {[1, 2, 3].map((zone) => (
              <span className={values.light.enabled ? "active" : ""} key={zone}>
                하부 {zone}
              </span>
            ))}
          </div>
        </div>
        <OptionButtons
          value={values.light.output}
          options={["낮음", "중간", "높음"]}
          onChange={(output) =>
            update(
              "광케어",
              (state) => ({
                ...state,
                light: {
                  ...state.light,
                  output: output as Controls["light"]["output"],
                  source: "수동",
                },
              }),
              `출력 ${output}`,
            )
          }
        />
        <p className="range-note">
          {shared.selected.light} · 존별 개별 제어는 지원하지 않습니다.
        </p>
        {status}
        {live && (
          <RestoreActions shared={shared} control="light" origin={origin} />
        )}
      </Card>
    )
  if (control === "mood")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="light"
          title="무드 조명"
          description="지원되는 프로그램 톤과 밝기를 조절합니다."
          value={values.mood.enabled}
          onToggle={(enabled) =>
            update(
              "무드 조명",
              (state) => ({
                ...state,
                mood: { ...state.mood, enabled, source: "수동" },
              }),
              enabled ? "무드 조명 켜짐" : "무드 조명 꺼짐",
            )
          }
        />
        <OptionButtons
          value={values.mood.preset}
          options={["따뜻한 백색", "은은한 앰버", "로즈 톤"]}
          onChange={(preset) =>
            update(
              "무드 조명",
              (state) => ({
                ...state,
                mood: { ...state.mood, preset, source: "수동" },
              }),
              `톤 ${preset}`,
            )
          }
        />
        <SliderRow
          label="밝기"
          value={values.mood.brightness}
          onChange={(brightness) =>
            update(
              "무드 조명",
              (state) => ({
                ...state,
                mood: { ...state.mood, brightness, source: "수동" },
              }),
              `밝기 ${brightness}%`,
            )
          }
        />
        {status}
        {live && (
          <RestoreActions shared={shared} control="mood" origin={origin} />
        )}
      </Card>
    )
  if (control === "lower")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="light"
          title="하단 조명"
          description="광케어와 무드 조명과 별도로 작동합니다."
          value={values.lower.enabled}
          onToggle={(enabled) =>
            update(
              "하단 조명",
              (state) => ({
                ...state,
                lower: { ...state.lower, enabled, source: "수동" },
              }),
              enabled ? "하단 조명 켜짐" : "하단 조명 꺼짐",
            )
          }
        />
        <SliderRow
          label="밝기"
          value={values.lower.brightness}
          onChange={(brightness) =>
            update(
              "하단 조명",
              (state) => ({
                ...state,
                lower: { ...state.lower, brightness, source: "수동" },
              }),
              `밝기 ${brightness}%`,
            )
          }
        />
        {status}
        {live && (
          <RestoreActions shared={shared} control="lower" origin={origin} />
        )}
      </Card>
    )
  if (control === "pemf")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="spark"
          title="PEMF"
          description="세부 주파수와 출력 값은 제공되지 않습니다."
          value={values.pemf.enabled}
          onToggle={() =>
            shared.setToast("PEMF는 이 프로그램에서 프로그램 제어 항목입니다.")
          }
          disabled
        />
        <div className="program-controlled">
          <Badge tone={values.pemf.enabled ? "green" : "neutral"}>
            {values.pemf.enabled ? "작동 중" : "정지"}
          </Badge>
          <strong>프로그램 제어</strong>
          <p>
            확정된 통합 프리셋에 따라 작동하며 임의 수치 편집은 지원하지
            않습니다.
          </p>
        </div>
        {status}
      </Card>
    )
  if (control === "sound")
    return (
      <Card className="function-panel">
        <ControlHeading
          icon="sound"
          title="사운드"
          description="명상 오디오 또는 바이노럴 비트를 선택합니다."
          value={values.sound.enabled}
          onToggle={(enabled) =>
            update(
              "사운드",
              (state) => ({
                ...state,
                sound: { ...state.sound, enabled, source: "수동" },
              }),
              enabled ? "사운드 켜짐" : "사운드 꺼짐",
            )
          }
        />
        <OptionButtons
          value={values.sound.track}
          options={["느린 자연 소리", "호흡 명상", "바이노럴 비트"]}
          onChange={(track) =>
            update(
              "사운드",
              (state) => ({
                ...state,
                sound: { ...state.sound, track, source: "수동" },
              }),
              `재생 ${track}`,
            )
          }
        />
        <div className="play-row">
          <Button
            variant="secondary"
            icon={values.sound.playing ? "pause" : "play"}
            onClick={() =>
              update(
                "사운드",
                (state) => ({
                  ...state,
                  sound: {
                    ...state.sound,
                    playing: !state.sound.playing,
                    source: "수동",
                  },
                }),
                values.sound.playing ? "일시정지" : "재생",
              )
            }
          >
            {values.sound.playing ? "일시정지" : "재생"}
          </Button>
          <span>블루투스 스피커 연결됨</span>
        </div>
        <SliderRow
          label="음량"
          value={values.sound.volume}
          onChange={(volume) =>
            update(
              "사운드",
              (state) => ({
                ...state,
                sound: { ...state.sound, volume, source: "수동" },
              }),
              `음량 ${volume}%`,
            )
          }
        />
        {status}
        {live && (
          <RestoreActions shared={shared} control="sound" origin={origin} />
        )}
      </Card>
    )
  return (
    <Card className="function-panel">
      <ControlHeading
        icon="sound"
        title="음성 안내"
        description="화면 언어와 별도로 안내 언어와 음량을 설정합니다."
        value={values.voice.enabled}
        onToggle={(enabled) =>
          update(
            "음성 안내",
            (state) => ({
              ...state,
              voice: { ...state.voice, enabled, source: "수동" },
            }),
            enabled ? "음성 안내 켜짐" : "음성 안내 꺼짐",
          )
        }
      />
      <OptionButtons
        value={values.voice.language}
        options={["한국어", "English", "中文", "Русский", "Español"]}
        onChange={(language) =>
          update(
            "음성 안내",
            (state) => ({
              ...state,
              voice: { ...state.voice, language, source: "수동" },
            }),
            `언어 ${language}`,
          )
        }
      />
      <SliderRow
        label="음량"
        value={values.voice.volume}
        onChange={(volume) =>
          update(
            "음성 안내",
            (state) => ({
              ...state,
              voice: { ...state.voice, volume, source: "수동" },
            }),
            `음량 ${volume}%`,
          )
        }
      />
      {status}
      {live && (
        <RestoreActions shared={shared} control="voice" origin={origin} />
      )}
    </Card>
  )
}

function ControlHeading({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled,
}: {
  icon: IconName
  title: string
  description: string
  value: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="control-heading">
      <span className="icon-tile warm">
        <Icon name={icon} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <Toggle value={value} onChange={onToggle} disabled={disabled} />
    </div>
  )
}

function OptionButtons({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="option-buttons">
      {options.map((option) => (
        <button
          key={option}
          className={option === value ? "active" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="slider-row">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <strong>{value}%</strong>
    </div>
  )
}

function ReadOnlyInfo({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="readonly-info">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RestoreActions({
  shared,
  control,
  ai,
  origin,
}: {
  shared: Shared
  control: ControlKey
  ai?: boolean
  origin: "product" | "mobile"
}) {
  return (
    <div className="restore-actions">
      <button onClick={() => shared.restoreParameter(control, false, origin)}>
        프로그램 설정으로 복원
      </button>
      {ai && (
        <button onClick={() => shared.restoreParameter(control, true, origin)}>
          AI 제어로 전환
        </button>
      )}
    </div>
  )
}

function RequestFeedback({
  shared,
  origin = "product",
}: {
  shared: Shared
  origin?: "product" | "mobile"
}) {
  if (origin === "mobile" && shared.connection === "disconnected")
    return (
      <div className="request-feedback error">
        <Icon name="alert" />
        연결 끊김 · 마지막 확인 {shared.lastConfirmed}
      </div>
    )
  if (shared.request === "pending")
    return (
      <div className="request-feedback pending">
        <span className="spinner" />
        제품 응답을 기다리는 중...
      </div>
    )
  if (shared.request === "failed")
    return (
      <div className="request-feedback error">
        <Icon name="alert" />
        적용 실패 · 마지막 확인값 유지
      </div>
    )
  if (shared.request === "applied")
    return (
      <div className="request-feedback success">
        <Icon name="check" />
        제품에 적용됨 · {shared.lastConfirmed}
      </div>
    )
  return (
    <div className="request-feedback">
      <Icon name="wifi" />
      제품과 연결됨 · 마지막 확인 {shared.lastConfirmed}
    </div>
  )
}

type MobileScreen = "home" | "connect" | "review" | "settings" | "control" | "session" | "report"

function aiDraft(controls: Controls): Controls {
  return {
    ...controls,
    sound: {
      ...controls.sound,
      volume: Math.max(30, controls.sound.volume - 10),
      source: "AI",
    },
  }
}

function Mobile({ shared }: { shared: Shared }) {
  const [screen, setScreen] = useState<MobileScreen>("home")
  const [control, setControl] = useState<ControlKey>("heat")
  const [draft, setDraft] = useState<Controls>(shared.controls)

  useEffect(() => {
    if (
      screen === "connect" &&
      shared.connection === "connected" &&
      ["active", "paused"].includes(shared.sessionStatus)
    )
      setScreen("session")
  }, [shared.connection, shared.sessionStatus, screen])

  function connect() {
    shared.setConnection("connected")
    setScreen(
      ["active", "paused"].includes(shared.sessionStatus)
        ? "session"
        : "review",
    )
    shared.setToast("배정된 세션 정보를 불러왔습니다.")
  }

  return (
    <div className="device-wrap mobile-wrap">
      <div className="device-caption">
        <span>회원 앱 · {sessionId}</span>
        <Badge tone={shared.connection === "connected" ? "green" : "red"}>
          {shared.connection === "connected" ? "동기화됨" : "연결 끊김"}
        </Badge>
      </div>
      <div className="mobile-device connected-mobile">
        <header className="mobile-header">
          <button onClick={() => setScreen("home")}>
            <Icon name="back" />
          </button>
          <strong>{mobileTitle(screen)}</strong>
          <button onClick={() => setScreen("connect")}>
            <Icon name={shared.connection === "connected" ? "wifi" : "alert"} />
          </button>
        </header>
        <div className="mobile-content">
          {screen === "home" && (
            <MobileHome
              shared={shared}
              onConnect={() => setScreen("connect")}
              onReport={() => setScreen("report")}
            />
          )}
          {screen === "connect" && (
            <MobileConnect shared={shared} onConnect={connect} />
          )}
          {screen === "review" && (
            <>
              <ScreenTitle
                step="M03 · 배정 프로그램"
                title={shared.selected.ko}
                description={`${shared.selected.en} · ${shared.room}번 룸 · ${sessionId}`}
              />
              <ProgramSummary shared={shared} />
              <Button
                className="mobile-full"
                onClick={() => {
                  setDraft(structuredClone(shared.controls))
                  setScreen("settings")
                }}
              >
                이용 전 설정
              </Button>
              {shared.sessionStatus === "ready" && (
                <Button
                  variant="secondary"
                  className="mobile-full"
                  onClick={shared.startSession}
                >
                  제품 앞에서 시작
                </Button>
              )}
              <div className="local-use-note">
                <Icon name="alert" />
                모바일 시작은 제품 준비 완료와 현장 사용 조건이 확인된 경우에만
                가능합니다.
              </div>
            </>
          )}
          {screen === "settings" && (
            <>
              <ScreenTitle
                step="M04 · 시작 전 설정"
                title="기능을 하나씩 조절하세요"
                description="저장 전에는 제품이 작동하지 않습니다."
              />
              <button
                className="ai-suggestion"
                onClick={() => {
                  setDraft((value) => aiDraft(value))
                  shared.setToast(
                    "이용 선호를 반영해 사운드 음량 초안을 조정했습니다.",
                  )
                }}
              >
                <span>
                  <Icon name="spark" />
                </span>
                <p>
                  <strong>AI 맞춤 조정</strong>
                  <small>사운드 음량을 범위 안에서 조정해 초안에 반영합니다.</small>
                </p>
                <Icon name="next" />
              </button>
              <ControlList
                controls={draft}
                selected={shared.selected}
                onOpen={(key) => {
                  setControl(key)
                  setScreen("control")
                }}
              />
              <Button
                className="mobile-full"
                onClick={() => {
                  shared.applyDraft(draft)
                  setScreen("review")
                }}
              >
                설정 저장
              </Button>
            </>
          )}
          {screen === "control" && (
            <>
              <BackHeader
                title={controlLabels[control]}
                onBack={() =>
                  setScreen(
                    ["active", "paused"].includes(shared.sessionStatus)
                      ? "session"
                      : "settings",
                  )
                }
                right={<SourceTag source={shared.controls[control].source} />}
              />
              <FunctionControl
                mode={
                  ["active", "paused"].includes(shared.sessionStatus)
                    ? "live"
                    : "draft"
                }
                control={control}
                values={
                  ["active", "paused"].includes(shared.sessionStatus)
                    ? shared.controls
                    : draft
                }
                setValues={setDraft}
                shared={shared}
                origin="mobile"
              />
            </>
          )}
          {screen === "session" && (
            <MobileSession
              shared={shared}
              onControl={(key) => {
                setControl(key)
                setScreen("control")
              }}
              onReport={() => setScreen("report")}
            />
          )}
          {screen === "report" && (
            <>
              <ScreenTitle
                step="M06 · 이용 보고서"
                title={
                  shared.reportReady
                    ? "이용 기록이 준비되었습니다"
                    : "완료된 보고서가 없습니다"
                }
                description="실제 세션 이벤트와 확정된 설정만 표시합니다."
              />
              {shared.reportReady ? (
                <>
                  <FeedbackPicker shared={shared} />
                  <SessionReport shared={shared} />
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="mobile-full"
                  onClick={() => setScreen("home")}
                >
                  홈으로
                </Button>
              )}
            </>
          )}
        </div>
        <nav className="mobile-bottom">
          <button
            className={screen === "home" ? "active" : ""}
            onClick={() => setScreen("home")}
          >
            <Icon name="home" />
            <span>홈</span>
          </button>
          <button
            className={
              ["connect", "review", "settings", "control", "session"].includes(
                screen,
              )
                ? "active"
                : ""
            }
            onClick={() =>
              setScreen(
                shared.connection === "connected" &&
                  ["active", "paused"].includes(shared.sessionStatus)
                  ? "session"
                  : "connect",
              )
            }
          >
            <Icon name="capsule" />
            <span>제품</span>
          </button>
          <button
            className={screen === "report" ? "active" : ""}
            onClick={() => setScreen("report")}
          >
            <Icon name="report" />
            <span>이용 기록</span>
          </button>
          <button
            onClick={() =>
              shared.setToast("회원 정보는 데모 회원으로 고정되어 있습니다.")
            }
          >
            <Icon name="user" />
            <span>내 정보</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

function mobileTitle(screen: MobileScreen) {
  return {
    home: "홈",
    connect: "제품 연결",
    review: "배정 프로그램",
    settings: "이용 전 설정",
    control: "기능 조절",
    session: "세션 제어",
    report: "이용 보고서",
  }[screen]
}

function MobileHome({
  shared,
  onConnect,
  onReport,
}: {
  shared: Shared
  onConnect: () => void
  onReport: () => void
}) {
  return (
    <>
      <div className="mobile-greeting">
        <p>안녕하세요, {member.name}님</p>
        <h1>
          {shared.assignment === "assigned"
            ? "배정된 세션이 있어요"
            : "오늘도 편안한 하루 보내세요"}
        </h1>
      </div>
      <Card className="mobile-device-card">
        <div>
          <span className="capsule-orbit">
            <Icon name="capsule" size={30} />
          </span>
          <p>
            <Badge
              tone={shared.assignment === "assigned" ? "green" : "neutral"}
            >
              {shared.assignment === "assigned"
                ? `${shared.room}번 룸 배정`
                : "배정 대기"}
            </Badge>
            <strong>
              {shared.assignment === "assigned"
                ? shared.selected.ko
                : "진행 중인 세션 없음"}
            </strong>
            <small>{sessionId}</small>
          </p>
        </div>
        <Button onClick={onConnect}>
          {shared.connection === "connected" ? "배정 세션 열기" : "제품 연결"}
        </Button>
      </Card>
      {shared.reportReady && (
        <button className="report-ready-card" onClick={onReport}>
          <span>
            <Icon name="report" />
          </span>
          <p>
            <strong>새 이용 보고서가 도착했어요</strong>
            <small>
              {shared.selected.ko} ·{" "}
              {shared.reportStatus === "completed"
                ? "정상 완료"
                : "부분 보고서"}
            </small>
          </p>
          <Icon name="next" />
        </button>
      )}
      <Card className="capacity-note">
        <span>오늘 이용 안내</span>
        <strong>30분 케어 + 약 10분 정리</strong>
        <p>제품 상태와 정리 절차에 따라 실제 예약 가능 시간이 달라집니다.</p>
      </Card>
    </>
  )
}

function MobileConnect({
  shared,
  onConnect,
}: {
  shared: Shared
  onConnect: () => void
}) {
  if (shared.connection === "disconnected")
    return (
      <div className="mobile-centered">
        <span className="danger-symbol">
          <Icon name="wifi" size={38} />
        </span>
        <h1>제품 연결이 끊겼어요</h1>
        <p>
          물리 제품은 계속 작동할 수 있습니다. 마지막 확인값을 표시하며 새 제어
          요청은 비활성화됩니다.
        </p>
        <Card className="last-confirmed">
          <span>마지막 확인</span>
          <strong>{shared.lastConfirmed}</strong>
          <p>
            {shared.selected.ko} · 온열 {shared.controls.heat.target}°C
          </p>
        </Card>
        <Button onClick={onConnect}>다시 연결</Button>
      </div>
    )
  return (
    <div className="mobile-centered">
      <span className="connection-orbit connected">
        <Icon name="capsule" size={42} />
      </span>
      <h1>배정된 제품을 찾았어요</h1>
      <p>
        {venue} · {shared.room}번 룸<br />
        기존 세션 정보를 불러오며 새 세션을 만들지 않습니다.
      </p>
      <Card className="connection-card">
        <span>
          <Icon name="wifi" />
        </span>
        <p>
          <strong>
            NMC-{shared.room} · {shared.selected.ko}
          </strong>
          <small>{sessionId}</small>
        </p>
        <Badge tone="green">연결 가능</Badge>
      </Card>
      <Button onClick={onConnect}>연결하고 세션 열기</Button>
    </div>
  )
}

function MobileSession({
  shared,
  onControl,
  onReport,
}: {
  shared: Shared
  onControl: (key: ControlKey) => void
  onReport: () => void
}) {
  if (["completed", "interrupted"].includes(shared.sessionStatus))
    return (
      <div className="mobile-centered">
        <span
          className={
            shared.sessionStatus === "completed"
              ? "ready-symbol success"
              : "danger-symbol"
          }
        >
          <Icon
            name={shared.sessionStatus === "completed" ? "check" : "alert"}
            size={38}
          />
        </span>
        <h1>
          {shared.sessionStatus === "completed"
            ? "케어가 완료되었습니다"
            : "이용이 중단되었습니다"}
        </h1>
        <p>
          {shared.sessionStatus === "interrupted"
            ? shared.interruptionReason
            : shared.selected.ko}
        </p>
        <Button onClick={onReport}>보고서 보기</Button>
      </div>
    )
  return (
    <>
      <div className="mobile-session-head">
        <div>
          <Badge
            tone={shared.sessionStatus === "paused" ? "neutral" : "orange"}
          >
            {shared.sessionStatus === "paused" ? "일시정지" : shared.phase}
          </Badge>
          <h1>{shared.selected.ko}</h1>
          <p>
            {shared.selected.en} · {shared.room}번 룸
          </p>
        </div>
        <span className={`connection-mini ${shared.connection}`}>
          <i />
          {shared.connection === "connected" ? "제품 연결됨" : "연결 끊김"}
        </span>
      </div>
      <Card className="mobile-timer-card">
        <small>남은 시간</small>
        <strong>{formatTime(shared.remaining)}</strong>
        <Progress value={(shared.remaining / 1800) * 100} />
        <div>
          <span>도입</span>
          <span className={shared.phase === "집중 케어" ? "active" : ""}>
            집중 케어
          </span>
          <span className={shared.phase === "마무리" ? "active" : ""}>
            마무리
          </span>
        </div>
      </Card>
      {shared.phase === "마무리" && (
        <div className="closing-note">
          <Icon name="heat" />
          마무리 단계에서는 온열이 꺼집니다.
        </div>
      )}
      <button
        className="ai-suggestion"
        disabled={shared.connection === "disconnected"}
        onClick={() => shared.applyAi("mobile")}
      >
        <span>
          <Icon name="spark" />
        </span>
        <p>
          <strong>AI 맞춤 조정</strong>
          <small>이용 선호에 따라 사운드 음량을 10% 낮춥니다.</small>
        </p>
        <Icon name="next" />
      </button>
      <div className="mobile-live-grid">
        <button
          disabled={shared.connection === "disconnected"}
          onClick={() => onControl("heat")}
        >
          <span className="icon-tile warm">
            <Icon name="heat" />
          </span>
          <p>
            <small>온열</small>
            <strong>
              {shared.phase === "마무리"
                ? "꺼짐"
                : `${shared.controls.heat.target}°C`}
            </strong>
          </p>
          <SourceTag source={shared.controls.heat.source} />
        </button>
        <button
          disabled={shared.connection === "disconnected"}
          onClick={() => onControl("massage")}
        >
          <span className="icon-tile">
            <Icon name="massage" />
          </span>
          <p>
            <small>마사지</small>
            <strong>{shared.controls.massage.intensity}</strong>
          </p>
          <SourceTag source={shared.controls.massage.source} />
        </button>
      </div>
      <RequestFeedback shared={shared} origin="mobile" />
      <div className="mobile-actions">
        {shared.sessionStatus === "paused" ? (
          <Button
            icon="play"
            disabled={shared.connection === "disconnected"}
            onClick={shared.resumeSession}
          >
            다시 시작
          </Button>
        ) : (
          <Button
            variant="secondary"
            icon="pause"
            disabled={shared.connection === "disconnected"}
            onClick={shared.pauseSession}
          >
            일시정지
          </Button>
        )}
        <Button variant="secondary" icon="help" onClick={shared.staffCall}>
          직원 호출
        </Button>
      </div>
      <Button
        variant="ghost"
        className="mobile-full danger-text"
        disabled={shared.connection === "disconnected"}
        onClick={() => {
          if (window.confirm("이용을 종료할까요?"))
            shared.interrupt("모바일 사용자 종료")
        }}
      >
        이용 종료
      </Button>
    </>
  )
}

function FeedbackPicker({ shared }: { shared: Shared }) {
  const options = [
    "매우 편안했어요",
    "편안했어요",
    "보통이에요",
    "직원 도움이 필요했어요",
  ]
  return (
    <Card className="feedback-picker">
      <strong>이용 후 의견</strong>
      <p>선택한 의견이 보고서에 기록됩니다.</p>
      <div>
        {options.map((option) => (
          <button
            key={option}
            className={shared.feedback === option ? "selected" : ""}
            onClick={() => {
              shared.setFeedback(option)
              shared.setToast("이용 의견을 보고서에 기록했습니다.")
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </Card>
  )
}

function SessionReport({
  shared,
  compact,
}: {
  shared: Shared
  compact?: boolean
}) {
  return (
    <Card className={`session-report ${compact ? "compact" : ""}`}>
      <div className="report-head">
        <span
          className={
            shared.reportStatus === "completed" ? "success" : "danger"
          }
        >
          <Icon
            name={shared.reportStatus === "completed" ? "check" : "alert"}
          />
        </span>
        <div>
          <Badge tone={shared.reportStatus === "completed" ? "green" : "red"}>
            {shared.reportStatus === "completed" ? "완료" : "중단"}
          </Badge>
          <h2>{shared.selected.ko}</h2>
          <p>2025년 5월 28일 · {venue}</p>
        </div>
      </div>
      <dl>
        <div>
          <dt>세션 ID</dt>
          <dd>{sessionId}</dd>
        </div>
        <div>
          <dt>실제 이용 시간</dt>
          <dd>
            {shared.reportStatus === "completed"
              ? "30분"
              : `${Math.max(1, Math.floor(shared.reportDuration / 60))}분`}
          </dd>
        </div>
        <div>
          <dt>종료 상태</dt>
          <dd>
            {shared.reportStatus === "completed"
              ? "정상 완료"
              : shared.interruptionReason}
          </dd>
        </div>
        <div>
          <dt>확정 설정</dt>
          <dd>
            온열 {shared.controls.heat.target}°C · 마사지{" "}
            {shared.controls.massage.intensity} · 광케어{" "}
            {shared.controls.light.output}
          </dd>
        </div>
        <div>
          <dt>이용자 의견</dt>
          <dd>{shared.feedback}</dd>
        </div>
      </dl>
      <div className="report-adjustments">
        <strong>설정 변경 기록</strong>
        {shared.adjustments.length ? (
          shared.adjustments.map((item) => (
            <div key={item.id}>
              <Badge
                tone={
                  item.kind === "AI"
                    ? "orange"
                    : item.kind === "수동"
                      ? "blue"
                      : "neutral"
                }
              >
                {item.kind}
              </Badge>
              <span>
                {item.parameter} · {item.detail}
              </span>
              <small>{item.at}</small>
            </div>
          ))
        ) : (
          <p>기록된 조정이 없습니다.</p>
        )}
      </div>
    </Card>
  )
}

type ConsoleScreen = "overview" | "review" | "assignment" | "device" | "calls" | "reports" | "turnaround"

function Console({ shared }: { shared: Shared }) {
  const [screen, setScreen] = useState<ConsoleScreen>("overview")
  const nav: { id: ConsoleScreen; label: string; icon: IconName }[] = [
    { id: "overview", label: "전체 현황", icon: "grid" },
    { id: "review", label: "체크리스트 검토", icon: "check" },
    { id: "assignment", label: "대기 · 룸 배정", icon: "clock" },
    { id: "device", label: "제품 · 세션 상세", icon: "capsule" },
    { id: "calls", label: "직원 호출", icon: "help" },
    { id: "reports", label: "이용 보고서", icon: "report" },
    { id: "turnaround", label: "청소 · 살균", icon: "clean" },
  ]
  return (
    <div className="console-device connected-console">
      <aside className="console-sidebar">
        <div className="console-logo">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <p>
            <strong>MASTER CAPSULE</strong>
            <small>운영 콘솔 2.0</small>
          </p>
        </div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={screen === item.id ? "active" : ""}
              onClick={() => setScreen(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === "review" && shared.reviewStatus === "required" && (
                <em>1</em>
              )}
              {item.id === "calls" && shared.staffCalls > 0 && (
                <em>{shared.staffCalls}</em>
              )}
            </button>
          ))}
        </nav>
        <div className="staff-profile">
          <span>김</span>
          <p>
            <strong>김민서 매니저</strong>
            <small>운영 관리자</small>
          </p>
        </div>
      </aside>
      <div className="console-main">
        <header className="console-header">
          <div>
            <p>{venue}</p>
            <h1>{nav.find((item) => item.id === screen)?.label}</h1>
          </div>
          <div className="console-head-actions">
            <span>
              <Icon name="clock" />
              2025년 5월 28일 · 오후 2:22
            </span>
            <Badge tone="green">제품 연결됨</Badge>
          </div>
        </header>
        {screen === "overview" && (
          <ConsoleOverview shared={shared} go={setScreen} />
        )}
        {screen === "review" && <ChecklistReview shared={shared} />}
        {screen === "assignment" && <RoomAssignment shared={shared} />}
        {screen === "device" && <DeviceDetail shared={shared} />}
        {screen === "calls" && <StaffCalls shared={shared} />}
        {screen === "reports" && <Reports shared={shared} />}
        {screen === "turnaround" && <Turnaround shared={shared} />}
      </div>
    </div>
  )
}

function ConsoleOverview({
  shared,
  go,
}: {
  shared: Shared
  go: (screen: ConsoleScreen) => void
}) {
  const availability =
    shared.assignment === "assigned" ||
    shared.cleaning === "required" ||
    shared.sanitation === "required"
      ? "사용 불가"
      : "이용 가능"
  return (
    <div className="console-content">
      <div className="summary-grid">
        <Summary
          label="운영 중"
          value={shared.sessionStatus === "active" ? "1" : "0"}
          detail="/ 6대"
          tone="orange"
        />
        <Summary
          label="대기 고객"
          value={shared.assignment === "waiting" ? "1" : "0"}
          detail="명"
        />
        <Summary
          label="직원 확인"
          value={shared.reviewStatus === "required" ? "1" : "0"}
          detail="건"
          tone="red"
        />
        <Summary
          label="정리 필요"
          value={shared.cleaning === "required" ? "1" : "0"}
          detail="대"
          tone="green"
        />
      </div>
      <div className="operations-layout">
        <section className="rooms-panel">
          <div className="section-heading">
            <div>
              <h2>룸 · 제품 현황</h2>
              <p>연결 상태와 예약 가능 상태는 별도로 표시됩니다.</p>
            </div>
            <Badge tone={availability === "이용 가능" ? "green" : "red"}>
              {availability}
            </Badge>
          </div>
          <div className="room-grid operational">
            <RoomCard
              room="01"
              status="이용 중"
              detail="긴장 완화 · 08:14"
              onClick={() => shared.setToast("1번 룸 데모 상세입니다.")}
            />
            <RoomCard
              room="02"
              status="정리 중"
              detail="청소 확인 중"
              onClick={() => shared.setToast("2번 룸은 정리 중입니다.")}
            />
            <RoomCard
              room={shared.room}
              status={roomStatus(shared)}
              detail={`${shared.selected.ko} · ${member.name}`}
              alert={shared.sessionStatus === "interrupted"}
              onClick={() => go("device")}
            />
            <RoomCard
              room="04"
              status="이용 가능"
              detail="예약 가능"
              onClick={() => {
                shared.setRoomReady(true)
                shared.setToast("4번 룸이 배정 가능한 상태입니다.")
              }}
            />
            <RoomCard
              room="05"
              status="점검 중"
              detail="예약 불가"
              onClick={() => shared.setToast("5번 룸은 유지보수 중입니다.")}
            />
            <RoomCard
              room="06"
              status="이용 가능"
              detail="예약 가능"
              onClick={() => {
                shared.setRoomReady(true)
                shared.setToast("6번 룸이 배정 가능한 상태입니다.")
              }}
            />
          </div>
        </section>
        <aside className="alerts-panel">
          <div className="section-heading">
            <div>
              <h2>조치 필요</h2>
              <p>우선 확인할 운영 항목입니다.</p>
            </div>
          </div>
          {shared.reviewStatus === "required" && (
            <ActionAlert
              icon="check"
              title="체크리스트 검토 필요"
              detail={member.name}
              onClick={() => go("review")}
            />
          )}
          {shared.staffCalls > 0 && (
            <ActionAlert
              icon="help"
              title="고객 직원 호출"
              detail={`${shared.room}번 룸 · ${shared.staffCalls}건`}
              onClick={() => go("calls")}
            />
          )}
          {shared.cleaning === "required" && (
            <ActionAlert
              icon="clean"
              title="턴어라운드 필요"
              detail={`${shared.room}번 룸`}
              onClick={() => go("turnaround")}
            />
          )}
          <Card className="capacity-card">
            <small>이론상 일일 최대</small>
            <strong>18회 / 제품</strong>
            <p>
              12시간 운영 · 30분 세션 기준입니다. 10분 정리, 살균, 점검과 중단
              시간은 실제 예약 가능량에서 차감됩니다.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Summary({
  label,
  value,
  detail,
  tone = "dark",
}: {
  label: string
  value: string
  detail: string
  tone?: string
}) {
  return (
    <Card className={`summary-card ${tone}`}>
      <span>{label}</span>
      <p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </p>
    </Card>
  )
}

function RoomCard({
  room,
  status,
  detail,
  alert,
  onClick,
}: {
  room: string
  status: string
  detail: string
  alert?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`room-card action ${alert ? "alerted" : ""}`}
      onClick={onClick}
    >
      <div className="room-top">
        <span>
          <b>{room}</b>번 룸
        </span>
        <Badge
          tone={
            alert
              ? "red"
              : status === "이용 가능"
                ? "green"
                : status === "이용 중"
                  ? "orange"
                  : "neutral"
          }
        >
          {status}
        </Badge>
      </div>
      <div className="room-device-icon">
        <Icon name="capsule" size={30} />
      </div>
      <strong>{detail}</strong>
      <span className="room-connection">
        <Icon name="wifi" size={16} />
        제품 연결됨
      </span>
    </button>
  )
}

function roomStatus(shared: Shared) {
  if (shared.cleaning === "required" || shared.sanitation === "required")
    return "정리 필요"
  if (shared.sessionStatus === "interrupted") return "이용 중단"
  if (shared.sessionStatus === "completed") return "보고서 생성"
  if (shared.sessionStatus === "active") return "이용 중"
  if (shared.sessionStatus === "paused") return "일시정지"
  if (shared.sessionStatus === "ready") return "시작 준비"
  if (shared.assignment === "assigned") return "배정됨"
  return "이용 가능"
}

function ActionAlert({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: IconName
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button className="action-alert" onClick={onClick}>
      <span>
        <Icon name={icon} />
      </span>
      <p>
        <strong>{title}</strong>
        <small>{detail}</small>
      </p>
      <Icon name="next" />
    </button>
  )
}

function ChecklistReview({ shared }: { shared: Shared }) {
  if (shared.reviewStatus !== "required")
    return (
      <EmptyState
        icon="check"
        title="검토할 응답이 없습니다"
        description="직원 확인이 필요한 체크리스트가 들어오면 여기에 표시됩니다."
      />
    )
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>{member.name} 회원 · 이용 전 확인</h2>
          <p>
            {member.maskedPhone} · 자동 적격 판단 없이 직원이 직접 검토합니다.
          </p>
        </div>
        <Badge tone="orange">검토 필요</Badge>
      </div>
      <div className="review-layout">
        <Card className="review-responses">
          <h2>체크리스트 응답</h2>
          <Response
            label="이용 안내 확인"
            value={shared.checklist.understood ? "확인" : "미확인"}
          />
          <Response
            label="현재 편안한 상태"
            value={shared.checklist.comfort ? "확인" : "미확인"}
          />
          <Response
            label="직원과 확인할 내용"
            value={shared.checklist.review ? "있음" : "없음"}
            warning={shared.checklist.review}
          />
        </Card>
        <Card className="staff-decision">
          <span className="icon-tile warm">
            <Icon name="user" />
          </span>
          <h2>직원 확인</h2>
          <p>회원과 내용을 직접 확인한 뒤 진행 여부를 선택하세요.</p>
          <Button
            onClick={() => {
              shared.setReviewStatus("approved")
              shared.setToast("직원 승인으로 키오스크 진행이 열렸습니다.")
            }}
          >
            확인 후 진행 승인
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              shared.setReviewStatus("declined")
              shared.setToast("진행을 보류했습니다.")
            }}
          >
            진행 보류
          </Button>
        </Card>
      </div>
    </div>
  )
}

function Response({
  label,
  value,
  warning,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <div className="response-row">
      <span>{label}</span>
      <Badge tone={warning ? "orange" : "green"}>{value}</Badge>
    </div>
  )
}

function RoomAssignment({ shared }: { shared: Shared }) {
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>대기 고객과 준비된 룸</h2>
          <p>준비 완료된 룸만 배정할 수 있습니다.</p>
        </div>
        <Badge tone={shared.assignment === "waiting" ? "orange" : "neutral"}>
          {shared.assignment === "waiting" ? "대기 1명" : "대기 없음"}
        </Badge>
      </div>
      <div className="assignment-layout">
        <Card className="waiting-member">
          <div>
            <span className="avatar">박</span>
            <p>
              <strong>{member.name}</strong>
              <small>{member.maskedPhone}</small>
            </p>
            <Badge tone="orange">{shared.selected.ko}</Badge>
          </div>
          <dl>
            <div>
              <dt>체크인</dt>
              <dd>{shared.checkedIn ? "완료" : "미완료"}</dd>
            </div>
            <div>
              <dt>직원 확인</dt>
              <dd>
                {shared.reviewStatus === "approved" ? "승인" : "해당 없음"}
              </dd>
            </div>
            <div>
              <dt>세션</dt>
              <dd>{sessionId}</dd>
            </div>
          </dl>
        </Card>
        <div className="ready-rooms">
          {["03", "04", "06"].map((room) => (
            <button
              key={room}
              className={
                room === shared.room && shared.assignment === "assigned"
                  ? "selected"
                  : ""
              }
              onClick={() => {
                shared.setRoomReady(true)
                shared.assignRoom(room)
              }}
            >
              <span>
                <b>{room}</b>번 룸
              </span>
              <Badge tone="green">준비 완료</Badge>
              <small>제품 연결됨 · 예약 가능</small>
              <strong>
                {room === shared.room && shared.assignment === "assigned"
                  ? "배정됨"
                  : "이 룸 배정"}
              </strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DeviceDetail({ shared }: { shared: Shared }) {
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>{shared.room}번 룸 · 세션 상세</h2>
          <p>
            {sessionId} · {member.name} · 연결과 세션 상태를 별도로 관리합니다.
          </p>
        </div>
        <div className="heading-badges">
          <Badge tone="green">제품 연결됨</Badge>
          <Badge tone={shared.connection === "connected" ? "green" : "red"}>
            {shared.connection === "connected" ? "앱 연결됨" : "앱 연결 끊김"}
          </Badge>
          <Badge
            tone={shared.sessionStatus === "interrupted" ? "red" : "orange"}
          >
            {roomStatus(shared)}
          </Badge>
        </div>
      </div>
      <div className="detail-grid">
        <Card className="session-detail">
          <div className="session-console-head">
            <div>
              <Badge tone="orange">{shared.phase}</Badge>
              <h2>{shared.selected.ko}</h2>
              <p>{shared.selected.en}</p>
            </div>
            <strong>{formatTime(shared.remaining)}</strong>
          </div>
          <Progress value={(shared.remaining / 1800) * 100} />
          <div className="confirmed-grid">
            <SettingLine
              label="온열"
              value={
                shared.phase === "마무리"
                  ? `꺼짐 · 잔열 ${shared.controls.heat.measured}°C`
                  : `${shared.controls.heat.target}°C`
              }
              source={shared.controls.heat.source}
            />
            <SettingLine
              label="마사지"
              value={`${shared.controls.massage.intensity} · ${shared.selected.pattern}`}
              source={shared.controls.massage.source}
            />
            <SettingLine
              label="광케어"
              value={`${shared.controls.light.output} · 6존`}
              source={shared.controls.light.source}
            />
            <SettingLine
              label="사운드"
              value={`${shared.controls.sound.track} · ${shared.controls.sound.volume}%`}
              source={shared.controls.sound.source}
            />
          </div>
        </Card>
        <Card className="adjustment-history">
          <h2>조정 기록</h2>
          {shared.adjustments.length ? (
            shared.adjustments
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.id}>
                  <Badge
                    tone={
                      item.kind === "AI"
                        ? "orange"
                        : item.kind === "수동"
                          ? "blue"
                          : "neutral"
                    }
                  >
                    {item.kind}
                  </Badge>
                  <p>
                    <strong>{item.parameter}</strong>
                    <small>{item.detail}</small>
                  </p>
                  <time>{item.at}</time>
                </div>
              ))
          ) : (
            <p className="empty-copy">아직 기록된 조정이 없습니다.</p>
          )}
          <Button
            variant="secondary"
            onClick={() => shared.setSurface("product")}
          >
            제품 화면 열기
          </Button>
        </Card>
      </div>
    </div>
  )
}

function SettingLine({
  label,
  value,
  source,
}: {
  label: string
  value: string
  source: Source
}) {
  return (
    <div className="setting-line">
      <span>{label}</span>
      <strong>{value}</strong>
      <SourceTag source={source} />
    </div>
  )
}

function StaffCalls({ shared }: { shared: Shared }) {
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>직원 호출</h2>
          <p>고객 호출과 안전 알림에 응답합니다.</p>
        </div>
        <Badge tone={shared.staffCalls ? "red" : "neutral"}>
          {shared.staffCalls}건
        </Badge>
      </div>
      {shared.staffCalls ? (
        <Card className="call-card">
          <span className="danger-symbol">
            <Icon name="help" />
          </span>
          <div>
            <Badge tone="red">응답 필요</Badge>
            <h2>
              {shared.room}번 룸 · {member.name}
            </h2>
            <p>
              {shared.interruptionReason ||
                "제품 또는 앱에서 직원 도움을 요청했습니다."}
            </p>
          </div>
          <Button
            onClick={() => {
              shared.setStaffCalls(0)
              shared.setToast("직원 호출을 확인하고 응답 처리했습니다.")
            }}
          >
            응답 완료
          </Button>
        </Card>
      ) : (
        <EmptyState
          icon="help"
          title="대기 중인 호출이 없습니다"
          description="새 호출이 접수되면 룸과 세션 정보가 함께 표시됩니다."
        />
      )}
    </div>
  )
}

function Reports({ shared }: { shared: Shared }) {
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>회원 이용 보고서</h2>
          <p>권한이 있는 직원만 실제 세션 이벤트를 조회합니다.</p>
        </div>
        <Badge tone={shared.reportReady ? "green" : "neutral"}>
          {shared.reportReady ? "1건 생성" : "기록 없음"}
        </Badge>
      </div>
      {shared.reportReady ? (
        <SessionReport shared={shared} />
      ) : (
        <EmptyState
          icon="report"
          title="생성된 보고서가 없습니다"
          description="세션 완료 또는 중단 시 실제 이벤트를 기반으로 보고서가 생성됩니다."
        />
      )}
    </div>
  )
}

function Turnaround({ shared }: { shared: Shared }) {
  const [conditions, setConditions] = useState({
    empty: false,
    items: false,
    restricted: false,
  })
  const eligible = Object.values(conditions).every(Boolean)
  return (
    <div className="console-content">
      <div className="section-heading large">
        <div>
          <h2>{shared.room}번 룸 · 턴어라운드</h2>
          <p>
            완료된 세션은 청소와 구성된 살균 확인 전까지 예약할 수 없습니다.
          </p>
        </div>
        <Badge
          tone={
            shared.cleaning === "required" || shared.sanitation === "required"
              ? "orange"
              : "green"
          }
        >
          {shared.cleaning === "required" || shared.sanitation === "required"
            ? "예약 불가"
            : "정리 완료"}
        </Badge>
      </div>
      <div className="turnaround-grid">
        <Card className="turnaround-card">
          <span className="step-number">1</span>
          <h2>청소 확인</h2>
          <p>침구, 접촉면과 주변을 시설 운영 기준에 따라 정리합니다.</p>
          <Button
            variant={shared.cleaning === "completed" ? "secondary" : "primary"}
            onClick={() => {
              shared.setCleaning("completed")
              shared.setToast("청소 완료를 기록했습니다.")
            }}
          >
            {shared.cleaning === "completed" ? "청소 완료됨" : "청소 완료 확인"}
          </Button>
        </Card>
        <Card className="turnaround-card">
          <span className="step-number">2</span>
          <h2>UV 살균 조건 확인</h2>
          <p>
            열림 감지는 안전 조건의 증명이 아닙니다. 직원이 직접 확인하세요.
          </p>
          <div className="mini-checks">
            {([
              ["empty", "룸 내부 비어 있음"],
              ["items", "소지품 제거"],
              ["restricted", "출입 제한 준비"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={conditions[key] ? "checked" : ""}
                onClick={() =>
                  setConditions((value) => ({ ...value, [key]: !value[key] }))
                }
              >
                <span>
                  <Icon name="check" />
                </span>
                {label}
              </button>
            ))}
          </div>
          <Button
            disabled={!eligible}
            onClick={() => {
              shared.setSanitation("completed")
              shared.setToast("구성된 UV 살균 절차 완료를 기록했습니다.")
            }}
          >
            {shared.sanitation === "completed"
              ? "살균 완료됨"
              : "살균 실행 및 완료"}
          </Button>
          {!eligible && (
            <small className="blocked-copy">
              필수 조건 확인 전에는 활성화할 수 없습니다. 시간은 시설 설정을
              따릅니다.
            </small>
          )}
        </Card>
        <Card className="turnaround-card final">
          <span className="step-number">3</span>
          <h2>이용 가능 전환</h2>
          <p>청소와 살균 완료 후 제품을 다시 예약 가능한 상태로 전환합니다.</p>
          <div className="turnaround-status">
            <span>
              <Icon name="clean" />
              청소
            </span>
            <Badge tone={shared.cleaning === "completed" ? "green" : "neutral"}>
              {shared.cleaning === "completed" ? "완료" : "대기"}
            </Badge>
            <span>
              <Icon name="spark" />
              살균
            </span>
            <Badge
              tone={shared.sanitation === "completed" ? "green" : "neutral"}
            >
              {shared.sanitation === "completed" ? "완료" : "대기"}
            </Badge>
          </div>
          <Button
            disabled={
              shared.cleaning !== "completed" ||
              shared.sanitation !== "completed"
            }
            onClick={shared.finishTurnaround}
          >
            룸을 이용 가능으로 전환
          </Button>
        </Card>
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconName
  title: string
  description: string
}) {
  return (
    <Card className="console-empty">
      <span className="icon-tile">
        <Icon name={icon} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </Card>
  )
}

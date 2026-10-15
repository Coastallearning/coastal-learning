"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Video runs on Jitsi Meet (free, no account, encrypted). The whiteboard is our own canvas,
 * synced live between everyone in the room over Supabase Realtime, so Lindsay and the student draw on the same page.
 */
const COLORS = ["#1f3764", "#6fb3b8", "#7f9f8a", "#d9534f", "#e8b84a"];
const WORDS = ["the", "and", "said", "was", "they", "have", "come", "where", "little", "look", "could", "because", "friend", "again", "people", "would"];
const W = 1200, H = 760;

type Stroke = { color: string; size: number; erase: boolean; pts: number[][] };

export default function TutoringRoom({ room, displayName, isTutor }: { room: string; displayName: string; isTutor: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const channel = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(5);
  const [erase, setErase] = useState(false);
  const [lines, setLines] = useState(false);
  const [peers, setPeers] = useState(1);
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [wi, setWi] = useState(0);
  const linesRef = useRef(false);

  function redraw() {
    const cx = canvasRef.current?.getContext("2d"); if (!cx) return;
    cx.fillStyle = "#ffffff"; cx.fillRect(0, 0, W, H);
    if (linesRef.current) {
      cx.strokeStyle = "#cfe2ec"; cx.lineWidth = 2;
      for (let y = 120; y < H; y += 120) {
        cx.setLineDash([]); cx.beginPath(); cx.moveTo(40, y); cx.lineTo(W - 40, y); cx.stroke();
        cx.setLineDash([8, 10]); cx.beginPath(); cx.moveTo(40, y - 60); cx.lineTo(W - 40, y - 60); cx.stroke();
      }
      cx.setLineDash([]);
    }
    for (const s of strokes.current) drawStroke(cx, s);
  }
  function drawStroke(cx: CanvasRenderingContext2D, s: Stroke) {
    if (s.pts.length < 1) return;
    cx.lineCap = "round"; cx.lineJoin = "round"; cx.lineWidth = s.erase ? s.size * 5 : s.size; cx.strokeStyle = s.erase ? "#ffffff" : s.color;
    cx.beginPath(); cx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (const [x, y] of s.pts) cx.lineTo(x, y);
    cx.stroke();
  }

  // realtime sync
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(`room:${room}`, { config: { presence: { key: displayName } } });
    ch.on("broadcast", { event: "stroke" }, ({ payload }) => { strokes.current.push(payload as Stroke); redraw(); })
      .on("broadcast", { event: "undo" }, () => { strokes.current.pop(); redraw(); })
      .on("broadcast", { event: "clear" }, () => { strokes.current = []; redraw(); })
      .on("broadcast", { event: "lines" }, ({ payload }) => { linesRef.current = payload.on; setLines(payload.on); redraw(); })
      .on("broadcast", { event: "sync-request" }, () => { if (isTutor) ch.send({ type: "broadcast", event: "sync", payload: { strokes: strokes.current, lines: linesRef.current } }); })
      .on("broadcast", { event: "sync" }, ({ payload }) => { if (!isTutor) { strokes.current = payload.strokes; linesRef.current = payload.lines; setLines(payload.lines); redraw(); } })
      .on("presence", { event: "sync" }, () => setPeers(Object.keys(ch.presenceState()).length))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ name: displayName, at: Date.now() });
          if (!isTutor) ch.send({ type: "broadcast", event: "sync-request", payload: {} });
        }
      });
    channel.current = ch;
    redraw();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, displayName, isTutor]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * W / r.width), Math.round((e.clientY - r.top) * H / r.height)];
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    current.current = { color, size, erase, pts: [pos(e)] };
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!current.current) return;
    e.preventDefault();
    current.current.pts.push(pos(e));
    const cx = canvasRef.current!.getContext("2d")!;
    const p = current.current.pts; const n = p.length;
    cx.lineCap = "round"; cx.lineJoin = "round"; cx.lineWidth = erase ? size * 5 : size; cx.strokeStyle = erase ? "#ffffff" : color;
    cx.beginPath(); cx.moveTo(p[n - 2][0], p[n - 2][1]); cx.lineTo(p[n - 1][0], p[n - 1][1]); cx.stroke();
  }
  function up() {
    if (!current.current) return;
    const s = current.current; current.current = null;
    strokes.current.push(s);
    channel.current?.send({ type: "broadcast", event: "stroke", payload: s });
  }
  const send = (event: string, payload: object = {}) => channel.current?.send({ type: "broadcast", event, payload });
  function undo() { strokes.current.pop(); redraw(); send("undo"); }
  function clear() { strokes.current = []; redraw(); send("clear"); }
  function toggleLines() { const on = !linesRef.current; linesRef.current = on; setLines(on); redraw(); send("lines", { on }); }

  // timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [running]);

  const jitsi = `https://meet.jit.si/CoastalLearning-${room}#userInfo.displayName=${encodeURIComponent(`"${displayName}"`)}&config.prejoinConfig.enabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

  return (
    <div className="room">
      <div>
        <iframe className="video" src={jitsi} allow="camera; microphone; fullscreen; display-capture; autoplay" title="Video call" />
        <div className="board-wrap">
          <div className="toolbar">
            {COLORS.map((c) => <button key={c} className={"sw" + (color === c && !erase ? " on" : "")} style={{ background: c }} aria-label={`Pen ${c}`} onClick={() => { setColor(c); setErase(false); }} />)}
            <label className="hint">Size <input type="range" min={2} max={18} value={size} onChange={(e) => setSize(+e.target.value)} /></label>
            <button className={"tb" + (erase ? " on" : "")} onClick={() => setErase(!erase)}>Eraser</button>
            <button className={"tb" + (lines ? " on" : "")} onClick={toggleLines}>Writing lines</button>
            <button className="tb" onClick={undo}>Undo</button>
            <button className="tb" onClick={clear}>Clear</button>
            <span className="presence" style={{ marginLeft: "auto" }}>{peers} in the room</span>
          </div>
          <canvas ref={canvasRef} className="board" width={W} height={H} aria-label="Shared whiteboard" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
        </div>
      </div>
      <div className="roomside">
        <div className="card">
          <h3>Session timer</h3>
          <div className="timer">{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</div>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <button className="btn sm" onClick={() => setRunning(!running)}>{running ? "Pause" : secs === 0 ? "Done" : "Start"}</button>
            <button className="btn ghost sm" onClick={() => { setRunning(false); setSecs(25 * 60); }}>Reset</button>
          </div>
          <p className="hint center" style={{ marginTop: ".5rem" }}>Short, focused blocks with a brain break between.</p>
        </div>
        <div className="card">
          <h3>Sight-word flashcards</h3>
          <div className="flash" role="button" tabIndex={0} onClick={() => setWi((wi + 1) % WORDS.length)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setWi((wi + 1) % WORDS.length); } }}>
            <span>{WORDS[wi]}<br /><small>{wi + 1} of {WORDS.length}</small></span>
          </div>
          <div className="cta-row" style={{ justifyContent: "center", marginTop: ".7rem" }}>
            <button className="btn ghost sm" onClick={() => setWi((wi - 1 + WORDS.length) % WORDS.length)}>Back</button>
            <button className="btn sea sm" onClick={() => setWi((wi + 1) % WORDS.length)}>Next word</button>
          </div>
        </div>
        <div className="card">
          <h3>Tips</h3>
          <p className="hint">If the video asks for a name or a camera permission, allow it. Everyone sees the same whiteboard; the student can draw too. Lindsay&apos;s board is the source of truth if anything gets out of step.</p>
        </div>
      </div>
    </div>
  );
}

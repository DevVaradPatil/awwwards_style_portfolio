import { useEffect, useRef, useState } from 'react'

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// Domain-warped noise distorts a texture of the text; the pointer adds a
// decaying ripple + bulge and splits the color channels. Iridescence comes
// from a cosine palette driven by the same noise.
const FRAG = `precision highp float;
uniform sampler2D u_t;uniform vec2 u_res;uniform float u_time;uniform vec2 u_m;uniform float u_ms;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;vec2 A=vec2(u_res.x/u_res.y,1.);
  vec2 q=vec2(fbm(uv*A*2.+u_time*.07),fbm(uv*A*2.+vec2(5.2,1.3)-u_time*.06));
  vec2 w=vec2(fbm(uv*A*3.+q*2.+u_time*.05),fbm(uv*A*3.+q*2.+vec2(8.3,2.8)));
  vec2 d=(w-.5)*.05;
  vec2 mv=(uv-u_m)*A;float md=length(mv);
  float rip=exp(-md*5.5)*u_ms;
  d+=normalize(mv+vec2(1e-5))*sin(md*36.-u_time*7.)*.03*rip;
  d-=mv*.22*rip;
  vec2 duv=uv+d/A;
  float ab=.003+.014*rip;
  float r=texture2D(u_t,duv+vec2(ab,0.)).r;
  float g=texture2D(u_t,duv).r;
  float b=texture2D(u_t,duv-vec2(ab,0.)).r;
  float t=fbm(duv*A*1.6+u_time*.05)+duv.x*.4+duv.y*.25+u_time*.03;
  vec3 iri=.55+.45*cos(6.2831*(t+vec3(0.,.33,.67)));
  float shine=pow(fbm(duv*A*5.-u_time*.1),3.)*2.2;
  vec3 chrome=mix(vec3(.9,.91,.94),iri,.6)+shine;
  vec3 bg=vec3(.043,.043,.051)+.05*vec3(.5,.45,.9)*fbm(uv*A*3.+u_time*.03);
  vec3 col=bg*(1.-g)+vec3(r,g,b)*chrome;
  col+=(h(gl_FragCoord.xy+fract(u_time))-.5)*.05;
  gl_FragColor=vec4(col,1.);
}`

/**
 * LiquidName — text rendered as flowing, iridescent liquid metal (raw WebGL,
 * one fragment shader, no library). The pointer sends ripples through it.
 * Falls back to plain type when WebGL is unavailable. Only renders while on
 * screen.
 *
 * @param {{ lines?: string[], className?: string }} props
 */
export default function LiquidName({ lines = ['VARAD', 'PATIL'], className = '' }) {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const text = lines.join(' ')

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { antialias: false })
    if (!gl) {
      setFailed(true)
      return
    }
    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (name) => gl.getUniformLocation(prog, name)
    const uRes = U('u_res')
    const uTime = U('u_time')
    const uM = U('u_m')
    const uMs = U('u_ms')

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    const tc = document.createElement('canvas')
    const tx = tc.getContext('2d')

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = tc.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      canvas.height = tc.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      tx.fillStyle = '#000'
      tx.fillRect(0, 0, tc.width, tc.height)
      tx.fillStyle = '#fff'
      tx.textAlign = 'center'
      tx.textBaseline = 'middle'
      const longest = Math.max(...lines.map((l) => l.length))
      const size = Math.min(tc.width / (longest * 0.66), tc.height / (lines.length * 1.05))
      tx.font = `900 ${size}px "Anybody", sans-serif`
      lines.forEach((line, i) => {
        const y = tc.height / 2 + (i - (lines.length - 1) / 2) * size * 0.98
        tx.fillText(line, tc.width / 2, y)
      })
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, s: 0 }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      m.tx = (e.clientX - r.left) / r.width
      m.ty = 1 - (e.clientY - r.top) / r.height
      m.s = Math.min(1.4, m.s + 0.12)
    }
    canvas.addEventListener('pointermove', onMove)

    let visible = true
    let raf = 0
    const t0 = performance.now()
    const frame = (now) => {
      raf = 0
      if (!visible) return
      m.x += (m.tx - m.x) * 0.12
      m.y += (m.ty - m.y) * 0.12
      m.s *= 0.965
      gl.uniform1f(uTime, (now - t0) / 1000)
      gl.uniform2f(uM, m.x, m.y)
      gl.uniform1f(uMs, m.s)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(frame)
    }
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
            if (visible && !raf) raf = requestAnimationFrame(frame)
          })
        : null
    io?.observe(canvas)

    let alive = true
    let rt = 0
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(layout, 150)
    }
    window.addEventListener('resize', onResize)
    Promise.resolve(document.fonts?.load('900 100px "Anybody"'))
      .catch(() => {})
      .then(() => {
        if (!alive) return
        layout()
        if (!raf) raf = requestAnimationFrame(frame)
      })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearTimeout(rt)
      io?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointermove', onMove)
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
    // `text` stands in for `lines` so a new array literal doesn't rebuild GL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  if (failed) {
    return (
      <p className={`flex items-center justify-center font-display text-[clamp(3rem,12vw,9rem)] font-black text-(--color-fg) ${className}`}>
        {text}
      </p>
    )
  }
  return <canvas ref={canvasRef} role="img" aria-label={text} className={`block w-full touch-pan-y ${className}`} />
}

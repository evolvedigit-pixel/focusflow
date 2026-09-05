// ── Sons d'ambiance générés via Web Audio API ─────────────────────────────────
// Aucun fichier audio requis — tout est synthétisé en temps réel
 
type SoundStop = () => void
 
function getCtx(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)()
}
 
// ── Pluie ─────────────────────────────────────────────────────────────────────
export function playRain(volume = 0.4): SoundStop {
  const ctx   = getCtx()
  const nodes: AudioNode[] = []
 
  // Bruit blanc filtré = pluie
  const bufferSize = ctx.sampleRate * 2
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data       = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
 
  const source  = ctx.createBufferSource()
  source.buffer = buffer
  source.loop   = true
 
  // Filtre passe-bas pour adoucir
  const filter      = ctx.createBiquadFilter()
  filter.type       = "lowpass"
  filter.frequency.value = 1800
  filter.Q.value    = 0.5
 
  // Filtre passe-haut pour retirer les basses
  const hipass      = ctx.createBiquadFilter()
  hipass.type       = "highpass"
  hipass.frequency.value = 400
 
  const gain       = ctx.createGain()
  gain.gain.value  = volume
 
  source.connect(filter)
  filter.connect(hipass)
  hipass.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  nodes.push(source, filter, hipass, gain)
 
  // Quelques gouttes aléatoires
  const dropInterval = setInterval(() => {
    const drop  = ctx.createOscillator()
    const dGain = ctx.createGain()
    drop.connect(dGain)
    dGain.connect(ctx.destination)
    drop.type = "sine"
    drop.frequency.value = 800 + Math.random() * 400
    dGain.gain.setValueAtTime(0, ctx.currentTime)
    dGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01)
    dGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    drop.start(ctx.currentTime)
    drop.stop(ctx.currentTime + 0.18)
  }, 180 + Math.random() * 300)
 
  return () => {
    clearInterval(dropInterval)
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    setTimeout(() => {
      try { source.stop(); ctx.close() } catch {}
    }, 500)
  }
}
 
// ── Café ──────────────────────────────────────────────────────────────────────
export function playCafe(volume = 0.3): SoundStop {
  const ctx   = getCtx()
 
  // Bruit de fond (murmures)
  const bufferSize = ctx.sampleRate * 3
  const buffer     = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  }
 
  const source  = ctx.createBufferSource()
  source.buffer = buffer
  source.loop   = true
 
  const filter      = ctx.createBiquadFilter()
  filter.type       = "bandpass"
  filter.frequency.value = 600
  filter.Q.value    = 0.3
 
  const gain      = ctx.createGain()
  gain.gain.value = volume * 0.4
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
 
  // Sons de tasses et couverts
  const clink = setInterval(() => {
    const osc  = ctx.createOscillator()
    const gn   = ctx.createGain()
    osc.connect(gn); gn.connect(ctx.destination)
    osc.type = "triangle"
    osc.frequency.value = 1200 + Math.random() * 600
    gn.gain.setValueAtTime(0, ctx.currentTime)
    gn.gain.linearRampToValueAtTime(0.06 * volume, ctx.currentTime + 0.005)
    gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.45)
  }, 2000 + Math.random() * 4000)
 
  // Machine à café occasionnelle
  const machine = setInterval(() => {
    const buf2   = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const d2     = buf2.getChannelData(0)
    for (let i = 0; i < d2.length; i++) d2[i] = Math.random() * 2 - 1
    const src2   = ctx.createBufferSource()
    src2.buffer  = buf2
    const f2     = ctx.createBiquadFilter()
    f2.type      = "highpass"; f2.frequency.value = 2000
    const g2     = ctx.createGain(); g2.gain.value = 0.08 * volume
    src2.connect(f2); f2.connect(g2); g2.connect(ctx.destination)
    src2.start()
    setTimeout(() => { try { src2.stop() } catch {} }, 600)
  }, 8000 + Math.random() * 10000)
 
  return () => {
    clearInterval(clink)
    clearInterval(machine)
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    setTimeout(() => { try { source.stop(); ctx.close() } catch {} }, 500)
  }
}
 
// ── Forêt ─────────────────────────────────────────────────────────────────────
export function playForest(volume = 0.35): SoundStop {
  const ctx = getCtx()
 
  // Vent doux
  const bufSize = ctx.sampleRate * 4
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data    = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
 
  const source = ctx.createBufferSource()
  source.buffer = buf; source.loop = true
 
  const f1 = ctx.createBiquadFilter()
  f1.type = "lowpass"; f1.frequency.value = 400
 
  const gain = ctx.createGain(); gain.gain.value = volume * 0.3
  source.connect(f1); f1.connect(gain); gain.connect(ctx.destination)
  source.start()
 
  // Oiseaux
  function chirp() {
    const notes = [1200, 1400, 1600, 1800, 2000, 2400]
    const count = 2 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator()
      const gn  = ctx.createGain()
      osc.connect(gn); gn.connect(ctx.destination)
      osc.type = "sine"
      const freq = notes[Math.floor(Math.random() * notes.length)]
      const t    = ctx.currentTime + i * 0.12
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.linearRampToValueAtTime(freq * 1.1, t + 0.06)
      gn.gain.setValueAtTime(0, t)
      gn.gain.linearRampToValueAtTime(0.08 * volume, t + 0.02)
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      osc.start(t); osc.stop(t + 0.12)
    }
  }
 
  chirp()
  const birdInterval = setInterval(chirp, 3000 + Math.random() * 5000)
 
  // Feuilles
  const leafInterval = setInterval(() => {
    const lb   = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
    const ld   = lb.getChannelData(0)
    for (let i = 0; i < ld.length; i++) ld[i] = Math.random() * 2 - 1
    const ls   = ctx.createBufferSource(); ls.buffer = lb
    const lf   = ctx.createBiquadFilter(); lf.type = "highpass"; lf.frequency.value = 3000
    const lg   = ctx.createGain(); lg.gain.value = 0.05 * volume
    ls.connect(lf); lf.connect(lg); lg.connect(ctx.destination)
    ls.start()
    setTimeout(() => { try { ls.stop() } catch {} }, 350)
  }, 1500 + Math.random() * 2000)
 
  return () => {
    clearInterval(birdInterval)
    clearInterval(leafInterval)
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    setTimeout(() => { try { source.stop(); ctx.close() } catch {} }, 500)
  }
}
 
// ── Océan ─────────────────────────────────────────────────────────────────────
export function playOcean(volume = 0.4): SoundStop {
  const ctx = getCtx()
 
  // Bruit de fond océan
  const bufSize = ctx.sampleRate * 4
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data    = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
 
  const source = ctx.createBufferSource()
  source.buffer = buf; source.loop = true
 
  const f1 = ctx.createBiquadFilter()
  f1.type = "lowpass"; f1.frequency.value = 500
 
  const masterGain = ctx.createGain(); masterGain.gain.value = volume * 0.3
  source.connect(f1); f1.connect(masterGain); masterGain.connect(ctx.destination)
  source.start()
 
  // Vagues — LFO sur le volume
  const waveInterval = setInterval(() => {
    const duration = 3 + Math.random() * 2
    const t = ctx.currentTime
 
    // Montée de la vague
    masterGain.gain.setValueAtTime(volume * 0.1, t)
    masterGain.gain.linearRampToValueAtTime(volume * 0.5, t + duration * 0.4)
    // Déferlement
    masterGain.gain.linearRampToValueAtTime(volume * 0.6, t + duration * 0.5)
    // Retrait
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.1, t + duration)
  }, 4000)
 
  // Écume
  const foamInterval = setInterval(() => {
    const fb   = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate)
    const fd   = fb.getChannelData(0)
    for (let i = 0; i < fd.length; i++) fd[i] = Math.random() * 2 - 1
    const fs   = ctx.createBufferSource(); fs.buffer = fb
    const ff   = ctx.createBiquadFilter(); ff.type = "highpass"; ff.frequency.value = 2000
    const fg   = ctx.createGain(); fg.gain.value = 0.06 * volume
    fs.connect(ff); ff.connect(fg); fg.connect(ctx.destination)
    fs.start()
    setTimeout(() => { try { fs.stop() } catch {} }, 900)
  }, 4200)
 
  return () => {
    clearInterval(waveInterval)
    clearInterval(foamInterval)
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
    setTimeout(() => { try { source.stop(); ctx.close() } catch {} }, 800)
  }
}
 
// ── Manager global ─────────────────────────────────────────────────────────────
export type AmbientSound = 'rain' | 'cafe' | 'forest' | 'ocean' | null
 
const SOUND_FNS = {
  rain:   playRain,
  cafe:   playCafe,
  forest: playForest,
  ocean:  playOcean,
}
 
let currentStop: SoundStop | null = null
let currentSound: AmbientSound    = null
 
export function toggleAmbientSound(sound: AmbientSound, volume = 0.4): AmbientSound {
  // Stopper le son actuel
  if (currentStop) { currentStop(); currentStop = null }
 
  // Si on reclique le même son → juste l'arrêter
  if (currentSound === sound) { currentSound = null; return null }
 
  // Démarrer le nouveau son
  if (sound && SOUND_FNS[sound]) {
    currentStop   = SOUND_FNS[sound](volume)
    currentSound  = sound
    return sound
  }
 
  currentSound = null
  return null
}
 
export function stopAllSounds() {
  if (currentStop) { currentStop(); currentStop = null }
  currentSound = null
}
 
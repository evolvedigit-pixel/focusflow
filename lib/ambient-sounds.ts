// ── Sons d'ambiance — fichiers locaux dans /public/sounds/ ───────────────────
export type AmbientSound = 'rain' | 'forest' | 'ocean' | 'fire' | 'night' | null
 
const SOUND_URLS: Record<string, string> = {
  rain:   "/sounds/rain.mp3",
  forest: "/sounds/forest.mp3",
  ocean:  "/sounds/ocean.mp3",
  fire:   "/sounds/fire.mp3",
  night:  "/sounds/night.mp3",
}
 
let currentAudio: HTMLAudioElement | null = null
let currentSound: AmbientSound = null
let fadeInterval: ReturnType<typeof setInterval> | null = null
 
function clearFade() {
  if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null }
}
 
export function toggleAmbientSound(sound: AmbientSound, volume = 0.4): AmbientSound {
  clearFade()
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
 
  if (currentSound === sound) { currentSound = null; return null }
 
  if (sound) {
    const audio   = new Audio(SOUND_URLS[sound])
    audio.loop    = true
    audio.volume  = 0
    audio.play().then(() => {
      let vol = 0
      fadeInterval = setInterval(() => {
        vol = Math.min(vol + 0.02, volume)
        audio.volume = vol
        if (vol >= volume) clearFade()
      }, 50)
    }).catch(e => console.warn("Audio:", e))
    currentAudio  = audio
    currentSound  = sound
    return sound
  }
 
  currentSound = null
  return null
}
 
export function setAmbientVolume(volume: number) {
  if (currentAudio) currentAudio.volume = Math.max(0, Math.min(1, volume))
}
 
export function stopAllSounds() {
  clearFade()
  if (currentAudio) {
    const audio = currentAudio
    let vol = audio.volume
    fadeInterval = setInterval(() => {
      vol = Math.max(vol - 0.04, 0)
      audio.volume = vol
      if (vol <= 0) { clearFade(); audio.pause(); audio.src = "" }
    }, 40)
    currentAudio = null
  }
  currentSound = null
}
 
export function getCurrentSound(): AmbientSound { return currentSound }
 
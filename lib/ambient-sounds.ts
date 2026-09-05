// ── Sons d'ambiance — vrais fichiers audio MP3 libres de droits ───────────────
// Sources : Pixabay (licence libre, pas d'attribution requise)
 
export type AmbientSound = 'rain' | 'cafe' | 'forest' | 'ocean' | null
 
const SOUND_URLS: Record<string, string> = {
  rain:   "https://cdn.pixabay.com/audio/2022/03/10/audio_270f39571e.mp3",
  cafe:   "https://cdn.pixabay.com/audio/2022/10/30/audio_946b09cce7.mp3",
  forest: "https://cdn.pixabay.com/audio/2022/03/15/audio_8b55e5e8a4.mp3",
  ocean:  "https://cdn.pixabay.com/audio/2022/03/10/audio_1e2edd6e87.mp3",
}
 
let currentAudio: HTMLAudioElement | null = null
let currentSound: AmbientSound = null
 
export function toggleAmbientSound(sound: AmbientSound, volume = 0.4): AmbientSound {
  // Arrêter le son actuel
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ""
    currentAudio = null
  }
 
  // Si on reclique le même → juste arrêter
  if (currentSound === sound) {
    currentSound = null
    return null
  }
 
  // Démarrer le nouveau
  if (sound && SOUND_URLS[sound]) {
    const audio      = new Audio(SOUND_URLS[sound])
    audio.loop       = true
    audio.volume     = volume
    audio.crossOrigin = "anonymous"
 
    // Fade in progressif
    audio.volume = 0
    audio.play().catch(() => {
      // Fallback si bloqué par le navigateur
      console.warn("Audio bloqué — interaction utilisateur requise")
    })
 
    // Montée en volume progressive
    let vol = 0
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.02, volume)
      audio.volume = vol
      if (vol >= volume) clearInterval(fadeIn)
    }, 50)
 
    currentAudio = audio
    currentSound = sound
    return sound
  }
 
  currentSound = null
  return null
}
 
export function setAmbientVolume(volume: number) {
  if (currentAudio) {
    currentAudio.volume = Math.max(0, Math.min(1, volume))
  }
}
 
export function stopAllSounds() {
  if (currentAudio) {
    // Fade out
    const audio = currentAudio
    let vol = audio.volume
    const fadeOut = setInterval(() => {
      vol = Math.max(vol - 0.03, 0)
      audio.volume = vol
      if (vol <= 0) {
        clearInterval(fadeOut)
        audio.pause()
        audio.src = ""
      }
    }, 40)
    currentAudio = null
  }
  currentSound = null
}
 
export function getCurrentSound(): AmbientSound {
  return currentSound
}
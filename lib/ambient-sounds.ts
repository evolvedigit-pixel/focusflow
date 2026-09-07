// ── Sons d'ambiance — fichiers locaux dans /public/sounds/ ───────────────────
export type AmbientSound = 'rain' | 'forest' | 'ocean' | 'fire' | 'night' | null
 
const SOUND_URLS: Record<string, string> = {
  forest: "https://res.cloudinary.com/ratzczbc/video/upload/v1788817208/AMBForst_Foret_et_ruisseau_1_ID_2713__LaSonotheque.fr.wav",
  rain:   "https://res.cloudinary.com/ratzczbc/video/upload/v1788817036/RAINConc_Pluie_d_ete_sur_terrasse_ID_1019__LaSonotheque.fr.wav",
  fire:   "https://res.cloudinary.com/ratzczbc/video/upload/v1788816963/FIREBurn_Feu_de_cheminee_4_ID_2856__LaSonotheque.fr.wav",
  ocean:  "https://res.cloudinary.com/ratzczbc/video/upload/v1788816937/WATRWave_Petites_vagues_face_ocean_ID_1046__LaSonotheque.fr.wav",
  night:  "https://res.cloudinary.com/ratzczbc/video/upload/v1788816745/AMBBird_Oiseaux_de_nuit_ID_0315__LaSonotheque.fr.wav",
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
 
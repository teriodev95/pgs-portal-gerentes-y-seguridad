const LOWERCASE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

/** "MARIA DE LOS ANGELES GOMEZ" → "Maria de los Angeles Gomez". Los acentos solo si vienen en el dato. */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => (index > 0 && LOWERCASE_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

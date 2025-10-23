import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const fruits = [
  { emoji: '🍍', name: 'Piña' },
  { emoji: '🍎', name: 'Manzana' },
  { emoji: '🍉', name: 'Sandía' },
  { emoji: '🍇', name: 'Uva' },
  { emoji: '🍒', name: 'Cereza' },
  { emoji: '🍓', name: 'Fresa' },
  { emoji: '🍑', name: 'Durazno' },
  { emoji: '🍊', name: 'Naranja' },
  { emoji: '🍋', name: 'Limón' },
  { emoji: '🍈', name: 'Melón' },
  { emoji: '🍐', name: 'Pera' },
  { emoji: '🍓', name: 'Frambuesa' },
  { emoji: '🥭', name: 'Mango' },
  { emoji: '🥥', name: 'Coco' },
  { emoji: '🍅', name: 'Tomate' },
  { emoji: '🥝', name: 'Kiwi' }
]

export function useVerificationMessage() {
  const seedState = ref(uuidv4())

  const seededRandom = (seed: string): number => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return (hash & 0x7fffffff) / 0x7fffffff
  }

  const getRandomNumber = (min: number, max: number, seed: string): number => {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min
  }

  const getRandomFruit = (seed: string): typeof fruits[0] => {
    return fruits[Math.floor(seededRandom(seed) * fruits.length)]
  }

  const verificationMessage = computed(() => {
    const randomFruit = getRandomFruit(seedState.value)
    const randomNumber = getRandomNumber(10, 100, seedState.value)
    return `${randomFruit.emoji} ${randomFruit.name} ${randomNumber}`
  })

  const regenerateMessage = () => {
    seedState.value = uuidv4()
  }

  return {
    verificationMessage,
    regenerateMessage
  }
}
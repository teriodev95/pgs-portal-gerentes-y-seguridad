import { ref, computed } from 'vue'
import type { PhotoField } from '../types/soliFilter.types'

export function usePhotoCapture() {
  const photos = ref<Record<PhotoField, File | null>>({
    ineCliente: null,
    comprobanteCliente: null,
    ineAval: null,
    comprobanteAval: null,
  })

  const previews = ref<Record<PhotoField, string>>({
    ineCliente: '',
    comprobanteCliente: '',
    ineAval: '',
    comprobanteAval: '',
  })

  const allPhotosReady = computed(() =>
    Object.values(photos.value).every((file) => file !== null),
  )

  const photosCount = computed(() =>
    Object.values(photos.value).filter((file) => file !== null).length,
  )

  function setPhoto(field: PhotoField, file: File): void {
    photos.value[field] = file

    if (previews.value[field]) {
      URL.revokeObjectURL(previews.value[field])
    }
    previews.value[field] = URL.createObjectURL(file)
  }

  function removePhoto(field: PhotoField): void {
    photos.value[field] = null
    if (previews.value[field]) {
      URL.revokeObjectURL(previews.value[field])
      previews.value[field] = ''
    }
  }

  function resetPhotos(): void {
    const fields: PhotoField[] = ['ineCliente', 'comprobanteCliente', 'ineAval', 'comprobanteAval']
    fields.forEach((field) => removePhoto(field))
  }

  return {
    photos,
    previews,
    allPhotosReady,
    photosCount,
    setPhoto,
    removePhoto,
    resetPhotos,
  }
}

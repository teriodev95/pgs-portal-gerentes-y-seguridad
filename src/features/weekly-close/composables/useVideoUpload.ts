import { blob2base64 } from '@/shared/utils'
import { ref, computed } from 'vue'
import { useSignStore } from '../stores'
import { useToast } from 'vue-toast-notification'
import { weeklyClosingService } from '../services/weekly-close.service'

type UploadStatus = 'success' | 'error' | 'uploading' | 'idle'

interface UploadOptions {
  videoBlobFile: Blob | undefined
  fileName: string
  mode: 'agente' | 'gerente'
  emit: (event: 'uploaded', url?: string | undefined) => void
}

export function useVideoUpload() {
  const $sign = useSignStore()
  const $toast = useToast()

  const uploadStatus = ref<UploadStatus>('idle')
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)

  const isVideoUploading = computed(() => uploadStatus.value === 'uploading')

  const onClickUpload = async (options: UploadOptions) => {
    const { videoBlobFile, fileName, mode, emit } = options

    if (isVideoUploading.value) {
      $toast.warning('El video está subiendo')
      return
    }

    if (!videoBlobFile) {
      // Continue flow even without video by assigning error message
      if (mode === 'agente') {
        $sign.uidVerificacionAgente = 'hubo un error en la subida'
      } else {
        $sign.uidVerificacionGerente = 'hubo un error en la subida'
      }
      uploadStatus.value = 'success'
      emit('uploaded')
      return
    }

    uploadStatus.value = 'uploading'
    uploadError.value = null
    uploadProgress.value = 0

    try {
      const fileBase64 = await blob2base64(videoBlobFile)
      const response = await weeklyClosingService.uploadVideo(new File([videoBlobFile], fileName, { type: 'video/mp4' }))
      //throw new Error('Function not implemented.')
      console.log('Video upload response:', response.data)
      
      uploadProgress.value = 100

      if (mode === 'agente') {
        $sign.firmaAgente = fileBase64
        $sign.uidVerificacionAgente = response.data.videoUrl
      } else {
        $sign.firmaGerente = fileBase64
        $sign.uidVerificacionGerente = response.data.videoUrl
      }

      uploadStatus.value = 'success'
      emit('uploaded')

    } catch (error) {
      console.error('Error uploading video', error)

      // Continue flow even on error by assigning error message to store
      const fileBase64 = await blob2base64(videoBlobFile).catch(() => '')

      if (mode === 'agente') {
        $sign.firmaAgente = fileBase64
        $sign.uidVerificacionAgente = 'hubo un error en la subida'
      } else {
        $sign.firmaGerente = fileBase64
        $sign.uidVerificacionGerente = 'hubo un error en la subida'
      }

      uploadStatus.value = 'success'
      emit('uploaded')
    }
  }

  const resetUploadStatus = () => {
    uploadStatus.value = 'idle'
    uploadProgress.value = 0
    uploadError.value = null
  }

  return {
    uploadStatus,
    uploadProgress,
    uploadError,
    isVideoUploading,
    onClickUpload,
    resetUploadStatus
  }
}
// New refactored composables
export { useWeeklyClose } from './useWeeklyClose'
export { useWeeklyCloseApi } from './useWeeklyCloseApi'
export { useSignWeeklyClose } from './useSignWeeklyClose'

// Modal management (unchanged)
export { useCierreSemanalModal } from './useCierreSemanalModal'

// Error handling (unchanged)
export { useWeeklyCloseErrorHandler } from './useWeeklyCloseErrorHandler'

// Legacy composables still used by CameraVideoCapture component
// These should remain until CameraVideoCapture is refactored
export { useCameraRecording } from './useCameraRecording'
export { useVideoUpload } from './useVideoUpload'

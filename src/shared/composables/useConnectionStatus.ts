import { ref, onMounted, onUnmounted } from 'vue';

export function useConnectionStatus() {
  const isOnline = ref(true);
  const message = ref<string | null>(null);

  const handleOnline = () => {
    isOnline.value = true;
    message.value = null;
  };

  const handleOffline = () => {
    isOnline.value = false;
    message.value = 'Sin conexión a Internet';
  };

  const handleCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    isOnline.value = detail.isOnline;
    message.value = detail.message;
  };

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-status', handleCustomEvent);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('connection-status', handleCustomEvent);
  });

  return { isOnline, message };
}

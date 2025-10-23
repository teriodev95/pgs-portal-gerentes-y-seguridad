import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/shared/stores';
import { ROUTE_NAME } from '@/router';
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet';

export function useAuthLogout() {
  // Services
  const $router = useRouter();
  const $store = useStore();

  // Refs
  const logoutBottomSheet = ref<InstanceType<typeof VueBottomSheet>>();

  // Methods
  const openLogoutBottomSheet = (): void => {
    logoutBottomSheet.value?.open();
  };

  const closeLogoutBottomSheet = (): void => {
    logoutBottomSheet.value?.close();
  };

  const logout = (): void => {
    void $router.push({
      name: ROUTE_NAME.AUTH_LOGIN
    });
    $store.clearData();
  };

  const handleLogout = (): void => {
    closeLogoutBottomSheet();
    logout();
  };

  return {
    // Refs
    logoutBottomSheet,
    
    // Methods
    openLogoutBottomSheet,
    closeLogoutBottomSheet,
    handleLogout,
  };
}
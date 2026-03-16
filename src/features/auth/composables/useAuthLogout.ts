import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/shared/stores';
import { ROUTE_NAME } from '@/router';

export function useAuthLogout() {
  // Services
  const $router = useRouter();
  const $store = useStore();

  // Refs
  const isLogoutDrawerOpen = ref(false);

  // Methods
  const openLogoutDrawer = (): void => {
    isLogoutDrawerOpen.value = true;
  };

  const closeLogoutDrawer = (): void => {
    isLogoutDrawerOpen.value = false;
  };

  const logout = (): void => {
    void $router.push({
      name: ROUTE_NAME.AUTH_LOGIN
    });
    $store.clearData();
  };

  const handleLogout = (): void => {
    closeLogoutDrawer();
    logout();
  };

  return {
    // Refs
    isLogoutDrawerOpen,

    // Methods
    openLogoutDrawer,
    closeLogoutDrawer,
    handleLogout,
  };
}
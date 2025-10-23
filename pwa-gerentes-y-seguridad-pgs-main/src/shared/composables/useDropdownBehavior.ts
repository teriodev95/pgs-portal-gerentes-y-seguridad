// composables/useDropdownBehavior.ts
import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
import type { ItemSearchFilter } from './useItemRenderer';

interface UseDropdownBehaviorProps {
  items: ItemSearchFilter[];
  value: string;
}

interface UseDropdownBehaviorEmits {
  (event: 'update:value', value: string): void;
  (e: 'selectItem', item: ItemSearchFilter): void;
}

export function useDropdownBehavior(props: UseDropdownBehaviorProps, emit: UseDropdownBehaviorEmits) {
  // State
  const showItems = ref(false);
  const blurTimeoutId = ref<number | null>(null);

  // Computed
  const hasItems = computed(() => props.items.length > 0);

  /**
   * Clears any existing blur timeout
   */
  function clearBlurTimeout() {
    if (blurTimeoutId.value) {
      clearTimeout(blurTimeoutId.value);
      blurTimeoutId.value = null;
    }
  }

  /**
   * Handles input changes
   */
  function handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    emit('update:value', inputElement.value);

    if (inputElement.value !== '' && hasItems.value) {
      showItems.value = true;
    } else {
      showItems.value = false;
    }
  }

  /**
   * Handles input focus
   */
  function handleFocus(event: FocusEvent) {
    clearBlurTimeout();

    const inputElement = event.target as HTMLInputElement;
    nextTick(() => {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    if (hasItems.value && props.value !== '') {
      showItems.value = true;
    }
  }

  /**
   * Handles input blur
   */
  function handleBlur() {
    blurTimeoutId.value = window.setTimeout(() => {
      showItems.value = false;
    }, 200);
  }

  /**
   * Handles item selection
   */
  function handleItemSelection(item: ItemSearchFilter) {
    clearBlurTimeout();
    emit('selectItem', item);
    showItems.value = false;
  }

  // Cleanup
  onBeforeUnmount(() => {
    clearBlurTimeout();
  });

  return {
    // State
    showItems,
    
    // Computed
    hasItems,
    
    // Methods
    handleInput,
    handleFocus,
    handleBlur,
    handleItemSelection
  };
}
import { ref, computed } from 'vue';

export function useAssignmentStyles() {
  const backgroundColor = ref('rgb(26 86 219 / 1)');

  const slideUnlockStyles = computed(() => ({
    '--su-color-text-normal': 'white',
    '--su-color-bg': backgroundColor.value,
    '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
    '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
    '--su-size-padding': '0'
  }));

  return {
    backgroundColor,
    slideUnlockStyles,
  };
}
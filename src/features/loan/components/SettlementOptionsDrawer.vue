<script setup lang="ts">
import { computed } from 'vue'
import { useDrawer } from '@/shared/composables'
import { LOAN_MODAL_MESSAGES, LOAN_BUTTON_LABELS } from '@/features/loan/constants'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

// Events
const emit = defineEmits<{
  navigateToSettlements: []
  settleWithoutDiscount: []
}>()

// Composables
const settlementOptionsDrawer = useDrawer('settlementOptions')

// Computed
const drawerTitle = computed(() => LOAN_MODAL_MESSAGES.SETTLEMENT_OPTIONS.title)
const drawerMessage = computed(() => LOAN_MODAL_MESSAGES.SETTLEMENT_OPTIONS.message)

// Methods
function handleNavigateToSettlements() {
  emit('navigateToSettlements')
  settlementOptionsDrawer.reset()
}

function handleSettleWithoutDiscount() {
  emit('settleWithoutDiscount')
  settlementOptionsDrawer.reset()
}

function handleOpenChange(open: boolean) {
  if (!open) {
    settlementOptionsDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="settlementOptionsDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ drawerMessage }}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter class="flex flex-col gap-2">
          <Button @click="handleNavigateToSettlements" class="w-full">
            {{ LOAN_BUTTON_LABELS.SETTLEMENT_WITH_DISCOUNT }}
          </Button>
          <Button @click="handleSettleWithoutDiscount" variant="outline" class="w-full">
            {{ LOAN_BUTTON_LABELS.SETTLEMENT_WITHOUT_DISCOUNT }}
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>

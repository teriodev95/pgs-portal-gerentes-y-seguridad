<script setup lang="ts">
import { computed } from 'vue'
import { useDrawer } from '@/shared/composables'
import { toCurrency } from '@/shared/utils'
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
import TextCT from '@/shared/components/ui/TextCT.vue'

interface WeeklyFeeData {
  tarifa: number
  weeklyPayment: number
}

// Composables
const weeklyFeeDrawer = useDrawer<WeeklyFeeData>('weeklyFee')

// Computed
const drawerTitle = computed(() => LOAN_MODAL_MESSAGES.WEEKLY_FEE_NOT_PAID.title)
const drawerMessage = computed(() => {
  if (!weeklyFeeDrawer.selectedData.value) return ''

  const { tarifa, weeklyPayment } = weeklyFeeDrawer.selectedData.value
  return LOAN_MODAL_MESSAGES.WEEKLY_FEE_NOT_PAID.message
    .replace('{tarifa}', toCurrency(tarifa))
    .replace('{weeklyPayment}', toCurrency(weeklyPayment))
})

// Methods
function handleClose() {
  weeklyFeeDrawer.reset()
}

function handleOpenChange(open: boolean) {
  if (!open) {
    weeklyFeeDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="weeklyFeeDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            <TextCT>
              {{ drawerMessage }} h
            </TextCT>
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter>
          <Button @click="handleClose" class="w-full">
            {{ LOAN_BUTTON_LABELS.UNDERSTOOD }}
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>

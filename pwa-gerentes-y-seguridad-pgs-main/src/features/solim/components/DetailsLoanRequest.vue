<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { Check, Clock } from "lucide-vue-next"
import DetailSection from './DetailSection.vue';
import DocumentViewer from './DocumentViewer.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import type { Checks } from '../types/solim.types';
import { Button } from "@/components/ui/button"
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/components/ui/stepper"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Props {
  addressInfo: Array<{ label: string; value: string }>;
  analysisCreditInfo: Array<{ label: string; value: string }>;
  clientDocuments: Array<{ label: string; value: string; type: 'image' | 'text' }>;
  clientInfo: Array<{ label: string; value: string }>;
  creditInfo: Array<{ label: string; value: string }>;
  guarantorDocuments: Array<{ label: string; value: string; type: 'image' | 'text' }>;
  guarantorInfo: Array<{ label: string; value: string }>;
  scheduleInfo: Array<{ label: string; value: string }>;
  checks: Checks;
}

const props = defineProps<Props>()

const checkSteps = computed(() => [
  {
    step: 1,
    title: "Gerente",
    description: props.checks.gerente.nota || "Revisión por gerente",
    checkData: props.checks.gerente,
    date: props.checks.gerente.check_date,
    by: props.checks.gerente.check_by
  },
  {
    step: 2,
    title: "Oficina", 
    description: props.checks.oficina.nota || "Verificación de oficina",
    checkData: props.checks.oficina,
    date: props.checks.oficina.check_date,
    by: props.checks.oficina.check_by
  },
  {
    step: 3,
    title: "Dirección",
    description: props.checks.direccion.nota || "Aprobación de dirección", 
    checkData: props.checks.direccion,
    date: props.checks.direccion.check_date,
    by: props.checks.direccion.check_by
  },
  {
    step: 4,
    title: "Seguridad",
    description: props.checks.seguridad.nota || "Verificación de seguridad",
    checkData: props.checks.seguridad,
    date: props.checks.seguridad.check_date,
    by: props.checks.seguridad.check_by
  },
])

const getStepState = (checkData: any) => {
  return checkData.check === 'checked' ? 'completed' : 'inactive'
}

onBeforeMount(() => {
  // Any setup logic if needed
  console.log('DetailsLoanRequest component mounted', props);
});
</script>

<template>
  <Tabs default-value="checks">
    <TabsList class="grid w-full grid-cols-1 bg-slate-200">
      <TabsTrigger value="checks">
        Checks
      </TabsTrigger>
      <TabsTrigger value="client">
        Cliente
      </TabsTrigger>
      <TabsTrigger value="guarantor">
        Aval
      </TabsTrigger>
      <TabsTrigger value="credit">
        Crédito
      </TabsTrigger>
      <TabsTrigger value="analysis-credit">
        Análisis de Crédito
      </TabsTrigger>
    </TabsList>
    <TabsContent value="checks" class="space-y-2">
      <CardContainer>
        <div>
          <h3 class="text-lg font-semibold mb-3 text-blue-800">Estado de Verificaciones</h3>
          
          <Stepper orientation="vertical" class="mx-auto flex w-full max-w-md flex-col justify-start gap-6">
            <StepperItem
              v-for="step in checkSteps"
              :key="step.step"
              v-slot="{}"
              class="relative flex w-full items-start gap-6"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== checkSteps[checkSteps.length - 1].step"
                class="absolute left-[18px] top-[38px] block h-[105%] w-0.5 shrink-0 rounded-full bg-muted"
                :class="[getStepState(step.checkData) === 'completed' && getStepState(checkSteps[step.step]?.checkData) === 'completed' && 'bg-green-500']"
              />

              <StepperTrigger as-child>
                <Button
                  :variant="getStepState(step.checkData) === 'completed' ? 'default' : 'outline'"
                  size="icon"
                  class="z-10 rounded-full shrink-0"
                  :class="[
                    getStepState(step.checkData) === 'completed' && 'bg-green-500 hover:bg-green-600',
                    getStepState(step.checkData) === 'inactive' && 'bg-gray-200'
                  ]"
                  disabled
                >
                  <Check v-if="getStepState(step.checkData) === 'completed'" class="size-5 text-white" />
                  <Clock v-else class="size-5 text-gray-400" />
                </Button>
              </StepperTrigger>

              <div class="flex flex-col gap-1">
                <StepperTitle
                  :class="[getStepState(step.checkData) === 'completed' && 'text-green-600']"
                  class="text-sm font-semibold transition lg:text-base"
                >
                  {{ step.title }}
                </StepperTitle>
                <StepperDescription class="text-xs text-muted-foreground transition md:text-sm">
                  {{ step.description }}
                </StepperDescription>
                <div v-if="step.date && step.by" class="text-xs text-gray-500 mt-1">
                  <div>{{ new Date(step.date).toLocaleString('es-MX') }}</div>
                  <div>Por: {{ step.by }}</div>
                </div>
              </div>
            </StepperItem>
          </Stepper>
        </div>
      </CardContainer>
    </TabsContent>
    <TabsContent value="client" class="space-y-2">
      <CardContainer>
        <DetailSection title="Información del Cliente" :items="clientInfo" />
      </CardContainer>
      
      <CardContainer>
        <DetailSection title="Domicilio" :items="addressInfo" />
      </CardContainer>
      
      <CardContainer>
        <div>
          <h3 class="text-lg font-semibold mb-3 text-blue-800">Documentos del Cliente</h3>
          <DocumentViewer :documents="clientDocuments" />
        </div>
      </CardContainer>
    </TabsContent>
    <TabsContent value="guarantor" class="space-y-2">
      <CardContainer>
        <DetailSection title="Información del Aval" :items="guarantorInfo" />
      </CardContainer>
      
      <CardContainer>
        <div>
          <h3 class="text-lg font-semibold mb-3 text-blue-800">Documentos del Aval</h3>
          <DocumentViewer :documents="guarantorDocuments" />
        </div>
      </CardContainer>
    </TabsContent>
    <TabsContent value="credit" class="space-y-2">
      <CardContainer>
        <DetailSection title="Detalles del Crédito" :items="creditInfo" />
      </CardContainer>
      <CardContainer>
        <DetailSection title="Horarios" :items="scheduleInfo" />
      </CardContainer>
    </TabsContent>
    <TabsContent value="analysis-credit" class="space-y-2">
      <CardContainer>
        <DetailSection title="Análisis del Crédito" :items="analysisCreditInfo" />
      </CardContainer>
    </TabsContent>
  </Tabs>
</template>
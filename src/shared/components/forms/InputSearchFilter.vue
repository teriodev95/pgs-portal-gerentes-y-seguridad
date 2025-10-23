<script setup lang="ts">
import type { Component } from 'vue';
import { useDropdownBehavior, useItemRenderer, type ItemSearchFilter, type ItemType } from '@/shared/composables';

// Props and emits
interface Props {
  icon: Component;
  id: string;
  label: string;
  value: string;
  placeholder: string;
  items: ItemSearchFilter[];
  itemType: ItemType;
}

interface Emits {
  (event: 'update:value', value: string): void;
  (e: 'selectItem', reporteSelect: ItemSearchFilter): void;
}

const $props = defineProps<Props>();
const $emit = defineEmits<Emits>();

// Composables
const { highlightText, renderItemContent } = useItemRenderer();
const { 
  showItems: $showItems, 
  hasItems: $hasItems, 
  handleInput, 
  handleFocus, 
  handleBlur, 
  handleItemSelection 
} = useDropdownBehavior($props, $emit);
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label :for="$props.id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {{ $props.label }}
    </label>

    <div class="relative">
      <!-- Icon -->
      <div class="absolute top-3.5 flex items-center ps-3.5 pointer-events-none">
        <component :is="$props.icon" class="h-5 w-5 text-gray-400 dark:text-gray-400" />
      </div>

      <!-- Input Field -->
      <input type="text" :id="$props.id"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        :placeholder="$props.placeholder" :value="$props.value" @input="handleInput" @focus="handleFocus"
        @blur="handleBlur" aria-haspopup="listbox" :aria-expanded="$showItems" autocomplete="off" />

      <!-- Dropdown Results -->
      <div v-if="$showItems && $hasItems && $props.value !== ''"
        class="bg-slate-50 border border-slate-300 rounded-lg p-2 absolute z-10 left-0 right-0 space-y-3 h-80 overflow-y-auto"
        role="listbox" :aria-labelledby="$props.id">
        <!-- Result Items -->
        <div v-for="(item, index) in $props.items" @click="handleItemSelection(item)"
          :key="`${$props.itemType}-${index}`"
          class="flex items-center text-xs cursor-pointer gap-1 p-2 hover:bg-slate-200 rounded" role="option"
          :aria-selected="false" tabindex="0" @keydown.enter="handleItemSelection(item)">
          <!-- Item Type Indicator -->
          <div class="size-2 rounded-full" :class="$props.itemType === 'reporte' ? 'bg-blue-500' : 'bg-green-500'">
          </div>

          <!-- Item Content -->
          <div class="flex flex-col">
            <!-- Report Content -->
            <template v-if="$props.itemType === 'reporte'">
              <p v-html="'Cli: ' + highlightText(renderItemContent(item, $props.itemType).client as string, $props.value)"></p>
              <p v-html="'Ava: ' + highlightText(renderItemContent(item, $props.itemType).aval as string, $props.value)"></p>
              <p class="text-[10px]">{{ renderItemContent(item, $props.itemType).details }}</p>
            </template>

            <!-- Payment Content -->
            <template v-else>
              <p v-html="highlightText(renderItemContent(item, $props.itemType).nombre as string, $props.value)"></p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
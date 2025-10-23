import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AvailableCreditOptions } from '@/interfaces';

const STORE_NAME = 'csvLoader';
export const useCsvLoaderStore = defineStore(STORE_NAME, () => {
  const csvData = ref<AvailableCreditOptions[]>([]);

  async function loadCsvData() {

    const filePath: string = '/data/creditos_not_format.csv';
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Error loading CSV file');
      }

      const csvText = await response.text();
      const rows = csvText.split('\n').slice(0, 365);

      csvData.value = rows.map(row => {
        const columns = row.split(',');
        return {
          desconocida: columns[0],
          montoSolicitado: columns[1],
          cargo: columns[2],
          totalPagar: columns[3],
          tarifaSemanal: columns[4],
          primerPago: columns[5],
          nivel: columns[6],
          plazoSemanas: columns[7],
          identificador: columns[8],
        } as AvailableCreditOptions;
      });
    } catch (error) {
      console.error('Error loading CSV file:', error);
    }
  }

  return {
    // State
    csvData,

    // Actions
    loadCsvData,
  };
});
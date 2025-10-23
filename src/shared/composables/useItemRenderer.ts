// composables/useItemRenderer.ts
import type { ICobranza } from '@/interfaces';
import type { ICallCenterReport } from '@/features/call-center/types';

export type ItemSearchFilter = ICallCenterReport | ICobranza;
export type ItemType = 'reporte' | 'cobranza';

export function useItemRenderer() {
  /**
   * Highlights search term in text by wrapping with <strong> tags
   */
  function highlightText(text: string, search: string): string {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  /**
   * Renders the appropriate content based on item type
   */
  function renderItemContent(item: ItemSearchFilter, itemType: ItemType) {
    if (itemType === 'reporte') {
      const report = item as ICallCenterReport;
      return {
        client: report.nombres_cliente,
        aval: report.nombres_aval,
        details: `${report.gerencia} ${report.agencia} ${report.semana}`
      };
    } else {
      const payment = item as ICobranza;
      return {
        nombre: payment.nombre,
      };
    }
  }

  return {
    highlightText,
    renderItemContent
  };
}
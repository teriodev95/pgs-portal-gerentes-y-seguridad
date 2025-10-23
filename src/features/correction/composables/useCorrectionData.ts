import type { CorrectionRequest } from '../types';

interface FormData {
  newAmount?: number;
  newBonusesPaidInWeek?: number;
  newCollectionCommissionPaidInWeek?: number;
  newSalesCommissionPaidInWeek?: number;
}

export function useCorrectionData() {
  const buildCorrectionData = (
    correctionType: string,
    recordId: string,
    actionType: string,
    formData: FormData
  ) => {
    const baseData = {
      type: correctionType,
      recordId: recordId,
      action: actionType,
      newAmount: 0,
      newBonusesPaidInWeek: 0,
      newCollectionCommissionPaidInWeek: 0,
      newSalesCommissionPaidInWeek: 0
    };

    if (actionType === 'correct') {
      if (correctionType === 'cierre') {
        Object.assign(baseData, {
          newBonusesPaidInWeek: formData.newBonusesPaidInWeek || 0,
          newCollectionCommissionPaidInWeek: formData.newCollectionCommissionPaidInWeek || 0,
          newSalesCommissionPaidInWeek: formData.newSalesCommissionPaidInWeek || 0
        });
      } else {
        baseData.newAmount = formData.newAmount || 0;
      }
    }

    return baseData;
  };

  const buildCorrectionRequest = (
    correctionData: ReturnType<typeof buildCorrectionData>,
    storeData: {
      agencySelected: string;
      gerenciaSelected: string;
      currentDate: { year: number; week: number };
      user: { usuario: string };
    }
  ): CorrectionRequest => {
    return {
      agencia: storeData.agencySelected,
      gerencia: storeData.gerenciaSelected,
      anio: storeData.currentDate.year,
      semana: storeData.currentDate.week,
      tipo: correctionData.type as any,
      operacion: correctionData.action === 'correct' ? 'editar' : 'eliminar',
      datosAactualizar: {
        id: correctionData.recordId,
        ...(['pago', 'venta', 'asignacion', 'gasto'].includes(correctionData.type) && {
          monto: correctionData.newAmount
        }),
        ...(correctionData.type === 'cierre' && {
          comisionCobranzaPagadaEnSemana: correctionData.newCollectionCommissionPaidInWeek,
          comisionVentasPagadaEnSemana: correctionData.newSalesCommissionPaidInWeek,
          bonosPagadosEnSemana: correctionData.newBonusesPaidInWeek
        })
      },
      creadoPor: storeData.user.usuario
    };
  };

  const parseAmountFromUrl = (amountStr: string, correctionType: string) => {
    if (correctionType === 'cierre') {
      // For closure, the amount param contains comma-separated values
      const [bonuses, collectionCommission, salesCommission] = amountStr.split(',').map(val => parseFloat(val) || 0);
      return {
        bonusesPaidInWeek: bonuses,
        collectionCommissionPaidInWeek: collectionCommission,
        salesCommissionPaidInWeek: salesCommission
      };
    } else {
      // For other types, it's a single amount
      return {
        amount: parseFloat(amountStr) || 0
      };
    }
  };

  return {
    buildCorrectionData,
    buildCorrectionRequest,
    parseAmountFromUrl
  };
}

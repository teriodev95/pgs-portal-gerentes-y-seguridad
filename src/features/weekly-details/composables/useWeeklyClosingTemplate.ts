// useWeeklyClosingTemplate.ts
import type {
  IAgencyClosureDetail,
  IGeneralBalance,
  IManagementNumbers,
  IWeeklyDetails,
  userPDF
} from '@/interfaces'
import { toCurrency } from '@/shared/utils'
import type { MoneyTabulation } from '@/features/tabulator/types'

// Tipos
type FormatType = 'currency' | 'percent' | 'text'
type EvaluationType = 'efficiency' | 'sales' | null

export const useWeeklyClosingTemplate = () => {
  // Funciones de utilidad

  const countActiveAgents = (agencies: IAgencyClosureDetail[]): number => {
    return agencies.filter((a) => a.agente !== 'Sin Agente Asignado').length
  }

  const formatValue = (value: string | number, formatType: FormatType): string => {
    if (typeof value === 'string' && value === 'Sin Agente Asignado') {
      value = 'Sin Agente'
    }

    if (typeof value !== 'number') return value

    switch (formatType) {
      case 'currency':
        return toCurrency(value)
      case 'percent':
        return `${value}%`
      case 'text':
      default:
        return value.toString()
    }
  }

  const getClassByValue = (value: number, evaluationType: EvaluationType): string => {
    if (!evaluationType) return ''

    switch (evaluationType) {
      case 'efficiency':
        if (value >= 90) return 'status-good'
        if (value >= 80) return 'status-regular'
        return 'status-bad'

      case 'sales':
        if (value >= 25) return 'status-good'
        if (value >= 15) return 'status-regular'
        return 'status-bad'

      default:
        return ''
    }
  }

  const generateColumnCells = (
    agencyData: IAgencyClosureDetail[],
    selector: (agency: IAgencyClosureDetail) => string | number,
    formatType: FormatType = 'text',
    evaluationType: EvaluationType = null
  ): string => {
    return agencyData
      .map((agency) => {
        const value = selector(agency)
        const evaluationClass =
          typeof value === 'number' ? getClassByValue(value, evaluationType) : ''

        return `<td class="${evaluationClass}">${formatValue(value, formatType)}</td>`
      })
      .join('\n')
  }

  const generateDualValueCells = (
    agencyData: IAgencyClosureDetail[],
    selector: (agency: IAgencyClosureDetail) => { semanaAnterior: number; semanaActual: number }
  ): string => {
    return agencyData
      .map((agency) => {
        const values = selector(agency)
        return `
        <td>
          <div class="flex flex-around">
            <span>${values.semanaAnterior}</span>
            <span>${values.semanaActual}</span>
          </div>
        </td>`
      })
      .join('\n')
  }

  // Componentes modulares del template
  const headerSection = {
    render(generalBalance: IGeneralBalance): string {
      return `
  <div class="title">${generalBalance.tituloReporte}</div>

  <section>
    <div class="flex flex-wrap flex-between font-bold">
      <div class="flex flex-center items-center gap-1">
        <span class="important ingresos rounded p-05">${generalBalance.sucursal} XPRESS</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">Sem:</span>
        <span class="important ingresos rounded p-05">${generalBalance.semana}</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">Año: </span>
        <span class="important ingresos rounded p-05">${generalBalance.anio}</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">Gerente:</span>
        <span class="important ingresos rounded p-05">${generalBalance.gerente}</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">Zona: </span>
        <span class="important ingresos rounded p-05">${generalBalance.zona}</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">#Emp: </span>
        <span class="important ingresos rounded p-05">${generalBalance.sucursal}</span>
      </div>

      <div class="flex flex-center items-center gap-1">
        <span class="text-center ">Hora y Fecha: </span>
        <span class="important ingresos rounded p-05">${generalBalance.curdate}</span>
      </div>
    </div>
  </section>
      `
    }
  }

  const agencyClosureSection = {
    render(generalBalance: IGeneralBalance): string {
      return `
  <div class="sub-title">
    DETALLE DE CIERRE DE AGENCIAS
  </div>

  <table class="table-center mt-2">
        <tr class="tr-header">
          <td>${generalBalance.agencias.length}</td>
          <td>Agencias</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.agencia)}
        </tr>
        <tr class="tr-header">
          <td>${generalBalance.agencias.length}</td>
          <td>Agentes</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.agente)}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td>DEBIT</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.debito, 'currency')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td>Cob. Pura</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.cobranzaPura, 'currency')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td>Faltante</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.faltante, 'currency')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td>Eficiencia</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.eficiencia, 'percent')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td>Ventas</td>
          ${generateColumnCells(generalBalance.agencias, (a) => a.ventas, 'text')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td class="td-empty"></td>
          ${generalBalance.agencias
            .map(
              () => `
            <td>
              <div class="flex flex-around">
                <span>S.ant</span>
                <span>S.act</span>
              </div>
            </td>
          `
            )
            .join('\n')}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td># clientes</td>
          ${generateDualValueCells(generalBalance.agencias, (a) => a.clientes)}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td># NO pagos</td>
          ${generateDualValueCells(generalBalance.agencias, (a) => a.noPagos)}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td># P. Reducidos</td>
           ${generateDualValueCells(generalBalance.agencias, (a) => a.pagosReducidos)}
        </tr>
        <tr>
          <td class="td-empty"></td>
          <td># Clts con liquidación</td>
          ${generateDualValueCells(generalBalance.agencias, (a) => a.clientesLiquidados)}
        </tr>
      </table>
      `
    }
  }

  const managementNumbersSection = {
    render(numbers: IManagementNumbers, countAgencies: number): string {
      return `
  <div class="sub-title">
    NUMEROS DE LA GERENCIA
  </div>

  <section class="flex flex-between mt-2 gap-2">
    <div class="flex-1">
      <table class="table-center">
        <tr class="tr-header text-center">
          <th></th>
          <th>Sem Ant</th>
          <th>Sem Act</th>
          <th>Diferencia</th>
        </tr>
        <tr>
          <td>DEBIT</td>
          <td>${toCurrency(numbers.metricasFinancieras.debito.semanaAnterior)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.debito.semanaActual)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.debito.diferencia)}</td>
        </tr>
        <tr>
          <td>Cob. PURA</td>
          <td>${toCurrency(numbers.metricasFinancieras.cobranzaPura.semanaAnterior)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.cobranzaPura.semanaActual)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.cobranzaPura.diferencia)}</td>
        </tr>
        <tr>
          <td>Faltante</td>
          <td>${toCurrency(numbers.metricasFinancieras.faltante.semanaAnterior)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.faltante.semanaActual)}</td>
          <td>${toCurrency(numbers.metricasFinancieras.faltante.diferencia)}</td>
        </tr>
        <tr>
          <td>Eficiencia</td>
          <td>${numbers.metricasFinancieras.eficiencia.semanaAnterior}</td>
          <td>${numbers.metricasFinancieras.eficiencia.semanaActual}</td>
          <td>${numbers.metricasFinancieras.eficiencia.diferencia}</td>
        </tr>
      </table>
    </div>

    <div class="flex-1">
      <table class="table-center">
        <tr class="tr-header">
          <th></th>
          <th>Sem Ant</th>
          <th>Sem Act</th>
          <th>Diferencia</th>
        </tr>
        <tr>
          <td># de clientes</td>
          <td>${numbers.metricasClientes.clientes.semanaAnterior}</td>
          <td>${numbers.metricasClientes.clientes.semanaActual}</td>
          <td>${numbers.metricasClientes.clientes.diferencia}</td>
        </tr>
        <tr>
          <td># de NO pagos</td>
          <td>${numbers.metricasClientes.noPagos.semanaAnterior}</td>
          <td>${numbers.metricasClientes.noPagos.semanaActual}</td>
          <td>${numbers.metricasClientes.noPagos.diferencia}</td>
        </tr>
        <tr>
          <td># P. reducidos</td>
          <td>${numbers.metricasClientes.pagosReducidos.semanaAnterior}</td>
          <td>${numbers.metricasClientes.pagosReducidos.semanaActual}</td>
          <td>${numbers.metricasClientes.pagosReducidos.diferencia}</td>
        </tr>
        <tr>
          <td># Clts LIQUID</td>
          <td>${numbers.metricasClientes.clientesLiquidados.semanaAnterior}</td>
          <td>${numbers.metricasClientes.clientesLiquidados.semanaActual}</td>
          <td>${numbers.metricasClientes.clientesLiquidados.diferencia}</td>
        </tr>
      </table>
    </div>

    <div class="flex-1">
      <table>
        <tr>
          <td>Objet. Ventas</td>
          <td>${toCurrency(countAgencies * 15000)}</td>
          <td>${numbers.objetivosVentas.porcentajeAlcanzado}</td>
        </tr>
        <tr>
          <td>Ventas nuevas</td>
          <td>${toCurrency(numbers.objetivosVentas.ventasNuevas)}</td>
          <td>${numbers.objetivosVentas.cantidadVentasNuevas}</td>
        </tr>
        <tr>
          <td>Renovaciones</td>
          <td>${toCurrency(numbers.objetivosVentas.renovaciones)}</td>
          <td>${numbers.objetivosVentas.cantidadRenovaciones}</td>
        </tr>
        <tr>
          <td>Total</td>
          <td>${toCurrency(numbers.objetivosVentas.totalVentas)}</td>
          <td>${numbers.objetivosVentas.cantidadTotalVentas}</td>
        </tr>
      </table>
    </div>
  </section>
      `
    }
  }

  const operationsSection = {
    render(data: IWeeklyDetails): string {
      return `
  <div class="sub-title">
    DETALLE DEL CIERRE SEMANAL DE LA GERENCIA
  </div>

  <table class="mt-2 mb-2 table-fixed">
    <tr>
      <th class="text-center" colspan="4">DETALLES</th>
    </tr>
    <tr>
      <th colspan="2" class="text-center ingresos">INGRESOS</th>
      <th colspan="2" class="text-center egresos">EGRESOS</th>
    </tr>
    <tr>
      <td>Asignaciones</td>
      <td class="ingresos">${toCurrency(data.ingresos.asignaciones.total)}</td>
      <td>Asignaciones</td>
      <td class="egresos">${toCurrency(data.egresos.asignaciones.total)}</td>
    </tr>
    <tr>
      <td>Cobranza pura</td>
      <td class="ingresos">${toCurrency(data.ingresos.cobranza.cobranzaPura)}</td>
      <td>Bonos y comisiones</td>
      <td class="egresos">${toCurrency(data.egresos.bonosYComisiones.total)}</td>
    </tr>
    <tr>
      <td>Primeros pagos</td>
      <td class="ingresos">${toCurrency(data.ingresos.cobranza.primerosPagos)}</td>
      <td>Ventas nuevas</td>
      <td class="egresos">${toCurrency(data.egresos.ventas.nuevas.total)}</td>
    </tr>
    <tr>
      <td>Monto excedente</td>
      <td class="ingresos">${toCurrency(data.ingresos.cobranza.montoExcedente)}</td>
      <td>Renovaciones</td>
      <td class="egresos">${toCurrency(data.egresos.ventas.renovaciones.total)}</td>
    </tr>
    <tr>
      <td>Multas + Liquidaciones</td>
      <td class="ingresos">${toCurrency(
        data.ingresos.cobranza.multas + data.ingresos.cobranza.liquidaciones
      )}</td>
      <td>Gasto operativos</td>
      <td class="egresos">${toCurrency(data.egresos.gastos.total)}</td>
    </tr>
    <tr>
      <td class="total">TOTAL DE INGRESOS</td>
      <td class="total ingresos">${toCurrency(data.ingresos.total)}</td>
      <td class="total">TOTAL DE EGRESOS</td>
      <td class="total egresos">${toCurrency(data.egresos.total)}</td>
    </tr>
    <tr>
      <td colspan="2" class="total">EFECTIVO A ENTREGAR</td>
      <td colspan="2" class="total entregar">${toCurrency(data.efectivoAEntregar)}</td>
    </tr>
  </table>

      `
    }
  }

  const footerSection = {
    render(user: userPDF, tabulation?: MoneyTabulation, cashOnDelivery?: number): string {
      const billDenominations = [
        { denominacion: 1000, cantidad: tabulation?.cantidad1000Billetes ?? 0 },
        { denominacion: 500, cantidad: tabulation?.cantidad500Billetes ?? 0 },
        { denominacion: 200, cantidad: tabulation?.cantidad200Billetes ?? 0 },
        { denominacion: 100, cantidad: tabulation?.cantidad100Billetes ?? 0 },
        { denominacion: 50, cantidad: tabulation?.cantidad50Billetes ?? 0 },
        { denominacion: 20, cantidad: tabulation?.cantidad20Billetes ?? 0 }
      ]

      const coinDenominations = [
        { denominacion: 20, cantidad: tabulation?.cantidad20Pesos ?? 0 },
        { denominacion: 10, cantidad: tabulation?.cantidad10Pesos ?? 0 },
        { denominacion: 5, cantidad: tabulation?.cantidad5Pesos ?? 0 },
        { denominacion: 2, cantidad: tabulation?.cantidad2Pesos ?? 0 },
        { denominacion: 1, cantidad: tabulation?.cantidad1Peso ?? 0 },
        { denominacion: 0.5, cantidad: tabulation?.cantidad50Centavos ?? 0 }
      ]

      const totalBill = billDenominations.reduce(
        (acc, { denominacion, cantidad }) => acc + denominacion * cantidad,
        0
      )

      const totalCoin = coinDenominations.reduce(
        (acc, { denominacion, cantidad }) => acc + denominacion * cantidad,
        0
      )

      const totalCash = totalBill + totalCoin
      const diff = (cashOnDelivery || 0) - totalCash

      // Función auxiliar para generar filas de tabla
      const generateTableRows = (items: { denominacion: number; cantidad: number }[]) => {
        return items
          .map(
            ({ denominacion, cantidad }) => `
          <tr>
            <td>$${denominacion}</td>
            <td>${cantidad}</td>
            <td>${toCurrency(denominacion * cantidad)}</td>
          </tr>
        `
          )
          .join('\n')
      }

      if (user === 'managment') {
        return `
        <section class="flex flex-between gap-1">
          <div class="w-1-3 border p-2">
            <p class="text-center">Certifico que la información aquí mencionada y los lineamientos de efectivo recibidos y
              pagados por mí, son correctos y ciertos con los lineamientos establecidos en las transacciones de la semana</p>
            <div style="margin-top: 60px; border-top: 1px solid #333; text-align: center;">
              Nombre y firma de quien realiza el cierre
            </div>
          </div>
  
          <div class="w-1-3 border p-2">
            <p class="text-center">Confirmo que los aumentos y deducciones arriba mencionados son correctos y
              que he recibido el efectivo neto, mencionado anteriormente.</p>
            <div style="margin-top: 77px; border-top: 1px solid #333; text-align: center;">
              Nombre y firma de administración
            </div>
          </div>
  
          <div class="w-1-2 flex flex-col gap-1">
            <div class="flex gap-1">
              <table class="table-center">
                <tr>
                  <th class="text-center" colspan="4">Billetes</th>
                </tr>
                <tr class="tr-header">
                  <th>Den</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
                ${generateTableRows(billDenominations)}
                <tr>
                  <td colspan="2">TOTAL EN BILLETES</td>
                  <td>${toCurrency(totalBill)}</td>
                </tr>
              </table>
  
              <table class="table-center">
                <tr>
                  <th class="text-center" colspan="4">Monedas</th>
                </tr>
                <tr>
                  <th class="tr-header">Den</th>
                  <th class="tr-header">Cantidad</th>
                  <th class="tr-header">Subtotal</th>
                </tr>
                ${generateTableRows(coinDenominations)}
                <tr>
                  <td colspan="2">TOTAL EN MONEDAS</td>
                  <td>${toCurrency(totalCoin)}</td>
                </tr>
              </table>
            </div>
  
            <div class="flex flex-center items-center gap-2">
              <div class="flex flex-center items-center gap-1">
                <span class="text-center">TOTAL EFECTIVO: </span>
                <span class="total text-green rounded p-05">${toCurrency(totalCash)}</span>
              </div>
              
              <div class="flex flex-center items-center gap-1">
                <span class="text-center">DIFERENCIA: </span>
                <div class="total ${diff >= 0 ? 'ingresos' : 'egresos'} rounded p-05">${toCurrency(
          Math.abs(diff)
        )}</div>
              </div>
            </div>
          </div>

          </section>
          <div class="mt-2 text-center">
            <p class="font-italic text-lg">Este es un vistazo general de los datos. Si quieres ver más detalles, dirígete a la sección Detalles de cierre en tu PGS.</p>
          </div>
        `
      }

      return `
        <section class="flex flex-between gap-1">
          <div class="flex-1 border p-2">
            <p class="text-center">Certifico que la información aquí mencionada y los lineamientos de efectivo recibidos y
              pagados por mí, son correctos y ciertos con los lineamientos establecidos en las transacciones de la semana</p>
            <div style="margin-top: 70px; border-top: 1px solid #333; text-align: center;">
              Nombre y firma de quien realiza el cierre
            </div>
          </div>
    
          <div class="flex-1 border p-2">
            <p class="text-center">Confirmo que los aumentos y deducciones arriba mencionados son correctos y
              que he recibido el efectivo neto, mencionado anteriormente.</p>
            <div style="margin-top: 80px; border-top: 1px solid #333; text-align: center;">
              Nombre y firma de administración
            </div>
          </div>
        </section>
        <div class="mt-2 text-lg text-center>
          <p class="font-italic">Este es un vistazo general de los datos. Si quieres ver más detalles, dirígete a la sección Detalles de cierre en tu PGS.</p>
        </div>
      `
    }
  }

  // Estilos del CSS extraído a un archivo separado
  const getStylesheet = (): string => {
    return `
  <style>
    * {
  box-sizing: border-box;
  font-size: 8px;
}

body {
  background-color: #f9f9f9;
  color: #333;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.border {
  border: 1px solid black;
}

.container-total {
  border: 1px solid #bdc3c7;
  padding: 2px;
  text-align: right;
}

.egresos {
  color: #c0392b;
}

.entregar {
  color: #27ae60;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.flex-around {
  justify-content: space-around;
}

.flex-between {
  justify-content: space-between;
}

.flex-center {
  justify-content: center;
}

.flex-wrap {
  flex-wrap: wrap;
}

.firma-section {
  border-top: 2px solid #7f8c8d;
  margin-top: 30px;
  padding-top: 20px;
}

.firma-section p {
  line-height: 1.6;
}

.font-bold {
  font-weight: bold;
}

.font-italic {
  font-style: italic;
}

.gap-1 {
  gap: 10px;
}

.gap-2 {
  gap: 20px;
}

.ingresos {
  color: #2980b9;
}

.inline-block {
  display: inline-block;
}

.items-center {
  align-items: center;
}

.m-2 {
  margin: 20px;
}

.mt-2 {
  margin-top: 20px;
}

.mb-2 {
  margin-bottom: 20px;
}

.p-05 {
  padding: 5px;
}

.p-1 {
  padding: 10px;
}

.p-2 {
  padding: 20px;
}

.rounded {
  border-radius: 5px;
}

.status-bad {
  background: oklch(0.704 0.191 22.216);
  color: oklch(0.396 0.141 25.723);
}

.status-good {
  background: oklch(0.596 0.145 163.225);
  color: oklch(0.378 0.077 168.94);
}

.status-regular {
  background: oklch(0.681 0.162 75.834);
  color: oklch(0.421 0.095 57.708);
}

.table-center th,
.table-center td {
  text-align: center;
}

.sub-title {
  color: #2c3e50;
  font-size: 10px;
  font-weight: bold;
  margin-top: 20px;
  text-align: center;
}

table {
  background-color: #fff;
  border-collapse: collapse;
  width: 100%;
}

.table-fixed {
  table-layout: fixed;
  width: 100%;
}

.table-fixed td {
  width: 25%;
}

.td-empty {
  background-color: #f9f9f9;
  border: none;
}

.text-center {
  text-align: center;
}

.text-green {
  color: #057a55 ;
}

.text-lg {
  font-size: 12px;
}

.text-right {
  text-align: right;
}

th {
  background-color: #ecf0f1;
}

th, td {
  border: 1px solid #bdc3c7;
  padding: 2px;
  text-align: right;
}

.title {
  background-color: #2c3e50;
  color: #ecf0f1;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 20px;
  padding: 8px;
  text-align: center;
}

.important,
.total {
  background-color: #ecf0f1;
  font-weight: bold;
}

.td-header,
.tr-header {
  background-color: #ecf0f1;
  font-weight: bold;
}

.w-1-3 {
  width: 25%;
}

.w-1-2 {
  width: 50%;
}

.w-12 {
  width: 120px;
}

.w-6 {
  width: 60px;
}

p {
  margin: 0;
}
  </style>
    `
  }

  // Template base
  const baseTemplate = {
    render(
      generalBalance: IGeneralBalance,
      data: IWeeklyDetails,
      numbers: IManagementNumbers,
      user: userPDF,
      tabulation?: MoneyTabulation
    ): string {
      return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  ${getStylesheet()}
</head>
<body>
  ${headerSection.render(generalBalance)}
  ${agencyClosureSection.render(generalBalance)}
  ${managementNumbersSection.render(numbers, countActiveAgents(generalBalance.agencias))}
  ${operationsSection.render(data)}
  ${footerSection.render(user, tabulation, data.efectivoAEntregar)}
</body>
</html>
      `
    }
  }

  // Función principal que genera el template HTML
  const generateHTMLTemplate = (
    generalBalance: IGeneralBalance,
    data: IWeeklyDetails,
    numbers: IManagementNumbers,
    user: userPDF,
    tabulation?: MoneyTabulation
  ): string => {
    return baseTemplate.render(generalBalance, data, numbers, user, tabulation)
  }

  return {
    generateHTMLTemplate,
    // Exponemos componentes individuales para facilitar pruebas o reutilización
    components: {
      headerSection,
      agencyClosureSection,
      managementNumbersSection,
      operationsSection,
      footerSection
    },
    // Funciones de utilidad que pueden ser útiles en otros contextos
    utils: {
      formatValue,
      getClassByValue
    }
  }
}

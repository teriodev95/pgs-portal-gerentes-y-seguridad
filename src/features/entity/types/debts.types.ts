interface IParameters {
  gerencia: string;
  semana: number;
  anio: number;
}

export interface IReport {
  gerencia: string;
  agencia: string;
  semana: number;
  anio: number;
  debitoMiercoles: number;
  debitoJueves: number;
  debitoViernes: number;
  debitoTotal: number;
}

interface ISummary {
  debitoTotal: number;
  debitoViernes: number;
  debitoMiercoles: number;
  totalAgencias: number;
  debitoJueves: number;
}

export interface IManagementDebts {
  parametros: IParameters;
  reportes: IReport[];
  resumen: ISummary;
}
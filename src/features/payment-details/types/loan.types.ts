interface IClientData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefonoCliente: string;
  direccion: string;
  noExterior: string;
  noInterior: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;
}

interface IPersonalData {
  fechaNacimiento: string | null;
  genero: string;
  curp: string;
  rfc: string;
  correo: string;
  telefonoPersona: string;
  estadoCivil: string;
  nombreConyugue: string;
}

interface IGuarantorData {
  nombresAval: string;
  apellidoPaternoAval: string;
  apellidoMaternoAval: string;
  telefonoAval: string;
  direccionAval: string;
  coloniaAval: string;
  codigoPostalAval: string;
  estadoAval: string;
  avalCurp: string;
  avalTelefonoPersona: string;
}

interface ICreditConditions {
  semanaOtorgado: number;
  anioOtorgado: number;
  plazo: number;
  montoOtorgado: number;
  cargo: number;
  totalAPagar: number;
  primerPago: number;
  tarifa: number;
  diaDePago: string;
  tipoDeCredito: string;
  tipoDeCliente: string;
}

interface IFinancialStatus {
  saldo: number;
  cobrado: number;
  porcentajeCobrado: number;
}

interface IAdministrativeLocation {
  gerencia: string;
  sucursalId: string;
  agente: string;
  gerenteEnTurno: string;
}

export interface ILoan {
  prestamoId: string;
  clienteId: string;
  noDeContrato: string;
  identificadorCredito: string;
  status: string;
  datosCliente: IClientData;
  datosPersonales: IPersonalData;
  datosAval: IGuarantorData;
  condicionesCredito: ICreditConditions;
  estadoFinanciero: IFinancialStatus;
  ubicacionAdministrativa: IAdministrativeLocation;
}
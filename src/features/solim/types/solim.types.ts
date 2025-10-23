// Interfaz para el domicilio del cliente
interface Domicilio {
  direccion: string;
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  tipoPropiedad: string;
}

interface Documentos {
  comprobante: string;
  ineFrontal: string;
  ineTrasera: string;
  no_servicio: string;
}

// Interfaz para la información del cliente
interface InformacionCliente {
  nombreCompleto: string;
  curp: string;
  telefono: string;
  email: string;
  rfc: string;
  estadoCivil: string;
  nacionalidad: string;
  fechaNacimiento: string;
  domicilio: Domicilio;
  documentos: Documentos;
}

// Interfaz para la información del aval
interface InformacionAval {
  nombreCompleto: string;
  curp: string;
  telefono: string;
  email: string;
  rfc: string;
  estadoCivil: string;
  documentos: Documentos;
}

// Interfaz para los horarios de crédito
interface Horarios {
  diaEntrega: string;
  horaEntrega: string;
  diaPago: string;
  horaPago: string;
}

// Interfaz para los detalles del crédito
interface DetallesCredito {
  montoSolicitado: number;
  plazo: string;
  plazoEnSemanas: number;
  tarifaSemanal: number;
  totalAPagar: number;
  primerPago: number;
  cargo: number;
  nivelCliente: string;
  tipoCredito: string;
  horarios: Horarios;
}

// Interfaz para los checks de una solicitud
export interface CheckInfo {
  check: string | null;
  check_date: string | null;
  check_by: string | null;
  nota: string;
}

export interface Checks {
  gerente: CheckInfo;
  oficina: CheckInfo;
  direccion: CheckInfo;
  seguridad: CheckInfo;
}

// Interfaz para una solicitud individual
export interface Solicitud {
  id: string;
  analisisFiltrado: {
    analisisFiltrado: string;
  }
  informacionCliente: InformacionCliente;
  informacionAval: InformacionAval;
  detallesCredito: DetallesCredito;
  checks: Checks;
}

// Interfaz para el objeto data de la respuesta
export interface DataResponse {
  total: number;
  semana: number;
  anio: number;
  solicitudes: Solicitud[];
}

// Interfaz principal para la respuesta completa de la API
export interface ApiResponse {
  success: boolean;
  message: string;
  data: DataResponse;
}
export interface UpdateCheckStatus {
  id: string;
  seguridad?: CheckInfo;
  gerente?: CheckInfo;
}
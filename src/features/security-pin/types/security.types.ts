export interface PinResponse {
  pin: string;
  gerencia: string;
  createdAt: string;
  expiresAt: string;
  timezone: string;
  currentTime: string;
  expiresInMinutes: number;
}

interface PinDetails {
  pin: string;
  gerencia: string;
  createdAt: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  isExpired: boolean;
  timezone: string;
}

export interface ManagementPinsResponse {
  gerenciaId: string;
  totalPins: number;
  pins: Record<string, PinDetails>; // Diccionario donde la clave es el pin
  currentTime: string;
}
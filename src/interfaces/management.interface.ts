export interface GetGerenciasUsuario {
  [key: string]: IGerencia[]
}

export interface IGerencia {
  gerencia: string
  gerente: string
}

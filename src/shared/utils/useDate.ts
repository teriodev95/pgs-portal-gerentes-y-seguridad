/**
 * getDateTime
 * @returns
 */
export function getDateTime() {
  // day/month/year hour:minutes
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * getDateTime2
 * @returns
 */
export function getDateTime2() {
  // day, numberDay month year
  const date = new Date()
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const fecha = formatter.format(date)
  return capitalizar(fecha)
}

function capitalizar(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

/**
 * formatToHumanDate
 * @param fechaHora
 * @returns
 */
export function formatToHumanDate(fecha: string | Date, conHora: boolean = false): string {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]  
  let fechaObj: Date;
  
  if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    // Si el string ya tiene hora, lo usamos tal como está
    if (fecha.includes(' ') || fecha.includes('T')) {
      // Reemplazar espacio por 'T' para formato ISO si es necesario
      const fechaISO = fecha.includes('T') ? fecha : fecha.replace(' ', 'T');
      fechaObj = new Date(fechaISO);
    } else {
      // Solo fecha sin hora, agregamos T00:00:00
      fechaObj = new Date(`${fecha}T00:00:00`);
    }
  }

  const diaSemana = diasSemana[fechaObj.getDay()]
  const dia = fechaObj.getDate()
  console.log('dia', dia)
  const mes = meses[fechaObj.getMonth()]
  const anio = fechaObj.getFullYear()
  const hora = fechaObj.getHours()
  const minutos = fechaObj.getMinutes()

  const horaFormateada = hora < 10 ? '0' + hora : hora
  const minutosFormateados = minutos < 10 ? '0' + minutos : minutos

  if (conHora) {
    return `${diaSemana} ${dia} de ${mes} del ${anio} a las ${horaFormateada}:${minutosFormateados}`
  }

  return `${diaSemana} ${dia} de ${mes} del ${anio}`
}

/**
 * Generates a full timestamp string in the format `YYYY-MM-DD HH:mm:ss.SSS`.
 *
 * @returns {string} The formatted timestamp string.
 */
export function getFullTimestamp(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Genera un array con los últimos 10 años desde el año actual hacia atrás
 * @param currentYear - El año actual desde donde comenzar
 * @param yearsBack - Cantidad de años hacia atrás que queremos obtener
 * @returns Array<number> - Array con los años ordenados de mayor a menor
 */
export const generateYearsArray = (currentYear: number, yearsBack: number): number[] => {
  if (currentYear < 0 || yearsBack < 0) {
    throw new Error('Los parámetros deben ser números positivos');
  }

  const years: number[] = [];

  for (let i = 0; i <= yearsBack; i++) {
    years.push(currentYear - i);
  }

  return years;
};

/**
 * Genera un array con las semanas del año en orden descendente
 * @param startWeek - Número de semana inicial (máximo)
 * @param endWeek - Número de semana final (mínimo)
 * @returns Array<number> - Array con las semanas ordenadas de mayor a menor
 */
export const generateWeeksArray = (startWeek: number, endWeek: number): number[] => {
  if (startWeek < 1 || endWeek < 1) {
  throw new Error('Las semanas deben ser números positivos');
  }
  
  if (startWeek < endWeek) {
    throw new Error('La semana inicial debe ser mayor que la semana final');
  }

  if (startWeek > 52) {
    throw new Error('El número máximo de semanas en un año es 52');
  }

  const weeks: number[] = [];

  for (let i = startWeek; i >= endWeek; i--) {
    weeks.push(i);
  }

  return weeks;
};

export const getCurrentDay = () => {
  const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  return days[new Date().getDay()];
};

/**
 * Obtiene la semana anterior a la semana dada
 * @param currentWeek - Número de la semana actual (1-53)
 * @param year - Año para verificar si es bisiesto (opcional, por defecto año actual)
 * @returns number - Número de la semana anterior
 */
export const getPreviousWeek = (currentWeek: number, year?: number): number => {
  if (currentWeek < 1 || currentWeek > 53) {
    throw new Error('El número de semana debe estar entre 1 y 53');
  }

  if (currentWeek > 1) {
    return currentWeek - 1;
  }

  const targetYear = year || new Date().getFullYear();

  return getLastWeekOfYear(targetYear - 1);
};

/**
 * Obtiene el número de la última semana del año
 * @param year - Año para verificar
 * @returns number - Número de la última semana (52 o 53)
 */
export const getLastWeekOfYear = (year: number): number => {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  const jan1WeekDay = jan1.getDay();
  const dec31WeekDay = dec31.getDay();

  if (jan1WeekDay === 4 || (jan1WeekDay === 3 && isLeapYear(year))) {
    return 53;
  }

  if (dec31WeekDay === 4 || (dec31WeekDay === 5 && isLeapYear(year))) {
    return 53;
  }

  return 52;
};

/**
 * Verifica si un año es bisiesto
 * @param year - Año a verificar
 * @returns boolean - true si el año es bisiesto
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};
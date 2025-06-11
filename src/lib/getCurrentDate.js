// Retorna el año actual en formato "YYYY"
export function getCurrentYear() {
  const fecha = new Date();
  return fecha.getFullYear().toString();
}

// Retorna el mes actual en formato "MM"
export function getCurrentMonth() {
  const fecha = new Date();
  const mes = (fecha.getMonth() + 1).toString();
  return mes;
}

// Retorna el primer día del mes actual como string "01"
export function getCurrentStartDay() {
  return "1";
}

// Retorna el último día del mes actual
export function getCurrentFinalDay() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const ultimoDia = new Date(año, mes, 0).getDate();
  return ultimoDia.toString();
}

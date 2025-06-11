// Retorna el año actual en formato "YYYY"
export function getCurrentYear() {
  const fecha = new Date();
  return fecha.getFullYear().toString();
}


// Retorna el mes actual en formato "MM"
export function getCurrentMonth() {
  const fecha = new Date();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  return mes;
}

// Retorna el primer día del mes actual como string "01"
export function getCurrentStartDate() {
  return "01";
}

// Retorna el último día del mes actual como string con 2 dígitos
export function getCurrentFinalDate() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; 
  const ultimoDia = new Date(año, mes, 0).getDate();
  return ultimoDia.toString().padStart(2, "0");
}

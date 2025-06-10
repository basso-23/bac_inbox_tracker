export default function getCurrentMonth() {
  const fecha = new Date();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  return mes;
}

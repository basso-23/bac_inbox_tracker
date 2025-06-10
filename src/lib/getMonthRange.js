export default function getMonthRange(month) {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const mesFormateado = month.toString().padStart(2, "0");

  const startDate = `${year}-${mesFormateado}-01`;
  const endDate = `${year}-${mesFormateado}-31`;

  return [startDate, endDate];
}

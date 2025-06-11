import { JSDOM } from "jsdom";
import pLimit from "p-limit";

// Para poder ver las tildes y demás
const decodeBase64 = (str) => {
  try {
    const decoded = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return decodeURIComponent(escape(decoded));
  } catch (err) {
    console.error("Error al decodificar Base64:", err);
    return "";
  }
};

export default async function getMails({
  accessToken,
  target,
  qty,
  startDate,
  endDate,
}) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const afterTimestamp = startDate
    ? Math.floor(new Date(startDate).getTime() / 1000)
    : null;
  const beforeTimestamp = endDate
    ? Math.floor(new Date(endDate).getTime() / 1000)
    : null;

  let query = `from:${target}`;
  if (afterTimestamp) query += ` after:${afterTimestamp}`;
  if (beforeTimestamp) query += ` before:${beforeTimestamp}`;

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
        query
      )}&maxResults=${qty.toString()}`,
      { headers }
    );

    const listData = await listRes.json();
    const messages = listData.messages || [];

    const limit = pLimit(5); // Limitar concurrencia a 5

    const emailDetails = await Promise.all(
      messages.map((msg) =>
        limit(async () => {
          try {
            const msgRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
              { headers }
            );
            const msgData = await msgRes.json();

            const headersMap = {};
            msgData.payload.headers.forEach((h) => {
              headersMap[h.name] = h.value;
            });

            let body = "";
            const parts = msgData.payload.parts;
            const htmlPart = parts?.find(
              (p) => p.mimeType === "text/html" && p.body?.data
            );
            const plainPart = parts?.find(
              (p) => p.mimeType === "text/plain" && p.body?.data
            );

            let comercio = "";
            let monto = "";
            let tipo = "";
            let estado = "";
            let fechaHora = "";

            if (htmlPart) {
              body = decodeBase64(htmlPart.body.data);
              try {
                const dom = new JSDOM(body);
                const doc = dom.window.document;
                doc.body.setAttribute("style", "overflow:hidden");

                const strongs = Array.from(doc.querySelectorAll("strong"));
                const anchors = Array.from(doc.querySelectorAll("a"));

                // Marcar filas de interés
                strongs.forEach((el) => {
                  const text = el.textContent.trim();
                  const tr = el.closest("tr");
                  if (!tr) return;
                  if (text === "Fecha y hora") tr.id = "hour_date";
                  if (text === "Monto") tr.id = "name_plus_amount";
                  if (text === "Tipo de compra") tr.id = "type_plus_status";
                  if (text === "Panamá") tr.id = "final-content3";
                });

                anchors.forEach((el) => {
                  const text = el.textContent.trim();
                  const tr = el.closest("tr");
                  if (!tr) return;
                  if (text === "Centro de Ayuda") tr.id = "final-content";
                  if (text === "Comunicate aquí") tr.id = "final-content2";
                });

                // Extraer valores
                const extractTextFromTd = (trId, index) => {
                  const tr = doc.getElementById(trId);
                  const valueRow = tr?.nextElementSibling;
                  if (!valueRow) return "";
                  const td = valueRow.querySelectorAll("td")[index];
                  return td?.querySelector("p")?.textContent.trim() || "";
                };

                comercio = extractTextFromTd(
                  "name_plus_amount",
                  0
                ).toLowerCase();
                const rawMonto = extractTextFromTd("name_plus_amount", 1)
                  .replace(/[^\d.,-]/g, "")
                  .replace(",", ".");
                const parsedMonto = parseFloat(rawMonto);
                monto = isNaN(parsedMonto) ? rawMonto : parsedMonto.toFixed(2);

                tipo = extractTextFromTd("type_plus_status", 0);
                estado = extractTextFromTd("type_plus_status", 1);
                fechaHora = extractTextFromTd("hour_date", 0);

                // Eliminar secciones innecesarias
                ["final-content", "final-content2", "final-content3"].forEach(
                  (id) => {
                    const ref = doc.getElementById(id);
                    if (!ref) return;
                    let current = ref;
                    while (current) {
                      const next = current.nextElementSibling;
                      current.remove();
                      current = next?.tagName === "TR" ? next : null;
                    }
                  }
                );

                body = doc.documentElement.outerHTML;
              } catch (err) {
                console.error("Error al procesar HTML:", err);
              }
            } else if (plainPart) {
              body = decodeBase64(plainPart.body.data);
            } else if (msgData.payload.body?.data) {
              body = decodeBase64(msgData.payload.body.data);
            }

            return {
              id: msg.id,
              subject: headersMap["Subject"],
              from: headersMap["From"],
              date: headersMap["Date"],
              body,
              isHtml: !!htmlPart,
              comercio,
              monto,
              tipo,
              estado,
              fechaHora,
            };
          } catch (err) {
            console.error(`Error al procesar mensaje ${msg.id}:`, err);
            return null;
          }
        })
      )
    );

    const validEmails = emailDetails.filter((e) => e !== null);
    return validEmails.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (err) {
    console.error("Error al obtener correos:", err);
    return [];
  } finally {
    console.log("Carga de correos finalizada ✅");
  }
}

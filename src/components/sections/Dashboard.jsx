"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { FaAngleDown } from "react-icons/fa6";
import { MdSearch } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { VscSettings } from "react-icons/vsc";
import { RxUpdate } from "react-icons/rx";

/// Componente iframe para renderizar HTML
function EmailIframe({ html }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && html) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Email Content"
      className="iframe-container"
      style={{
        width: "100%",
        position: "fixed",
        zIndex: 10,
        height: "100dvh",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

export default function Dashboard({ session, mails }) {
  const [emails, setEmails] = useState(mails);
  const [loading, setLoading] = useState(false);

  const [totalAmount, setTotalAmount] = useState();
  const [qtyMails, setQtyMails] = useState();
  const [qtyApproved, setQtyApproved] = useState();
  const [qtyRejected, setQtyRejected] = useState();

  ///Se activa cada vez que se actualiza los mails
  useEffect(() => {
    console.log(emails);

    if (emails) {
      //Monto total
      let sumaMontos = 0;
      for (const email of emails) {
        sumaMontos += parseFloat(email.monto);
      }
      setTotalAmount("$" + sumaMontos.toFixed(2));

      //Cantidad de correos
      let total = 0;
      for (const _ of emails) {
        total++;
      }
      setQtyMails(total);

      //Cantidad aprobadas
      let aprobadas = 0;
      for (const email of emails) {
        if (email.estado.toLowerCase() === "aprobada") {
          aprobadas++;
        }
      }
      setQtyApproved(aprobadas);

      //Cantidad rechazadas
      let rechazadas = 0;
      for (const email of emails) {
        if (email.estado.toLowerCase() != "aprobada") {
          rechazadas++;
        }
      }
      setQtyRejected(rechazadas);
    }
  }, [emails]);

  ///Funcion para actualizar los mails con parametros
  const updateMails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: "notificacion_pa@pa.bac.net",
          qty: 5,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmails(data.mails);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error en fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  ///Circulos de los rectangulos
  const CircleTag = ({ name, number, color }) => {
    return (
      <div className="rectangle">
        <div className="flex items-center gap-2 leading-0">
          <div className={`circle-tag ${color}`}></div>
          <span className="text-secondary-color">{name}</span>
        </div>

        {number || number === 0 ? (
          <div className="font-xl mt-4">{number}</div>
        ) : (
          <div className="font-xl mt-4 animate-pulse skeleton">0</div>
        )}
      </div>
    );
  };

  ///No session
  if (!session) {
    return (
      <div className="flex justify-center p-8">
        <button className="btn-primary transition-all" onClick={() => signIn()}>
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  ///Logged in
  return (
    <>
      {loading && (
        <div className="p-4 text-center animate-pulse">Cargando correos...</div>
      )}

      <div className="main-container general-padding">
        {/*//---- HEADER ---- */}
        <div className="header-container">
          {/*//* Name */}
          <div className="font-large tracking-tight">
            Bienvenido, {session.user.name}
          </div>

          {/*//* Right Header */}
          <div className="header-right">
            <div>options1</div>

            <div>options2</div>
            <div className="separator-vertical"></div>
            <button className="profile-container">
              <div
                className="profile-image"
                style={{ backgroundImage: `url(${session.user.image})` }}
              ></div>
              <div>
                <FaAngleDown />
              </div>
            </button>
          </div>
        </div>

        <div className="content-container general-padding">
          {/*//---- ACTIONS ---- */}
          <div className="actions-container">
            {/*//* Actions left */}
            <div className="actions-left">
              <div className="font-large tracking-tight">Transacciones</div>
              <div className="searchbar-container">
                <input
                  type="text"
                  placeholder="Buscar comercio"
                  className="searchbar-input"
                />
                <div className="searchbar-icon">
                  <MdSearch />
                </div>
              </div>
            </div>

            {/*//* Actions left */}
            <div className="actions-right">
              <button className="btn-secondary">
                <FiFilter />
                Filtros
              </button>
              <button className="btn-secondary">
                <VscSettings />
                Parámetros
              </button>
              <button className="btn-primary" onClick={updateMails}>
                <RxUpdate />
                Actualizar
              </button>
            </div>
          </div>

          {/*//---- RECTANGLES INFO ---- */}
          <div className="rectangles-container">
            <CircleTag
              name={"Monto Total"}
              number={totalAmount}
              color={"circle-bg-amount"}
            />
            <CircleTag
              name={"Cantidad de correos"}
              number={qtyMails}
              color={"circle-bg-qty"}
            />
            <CircleTag
              name={"Aprobadas"}
              number={qtyApproved}
              color={"circle-bg-approved"}
            />
            <CircleTag
              name={"Rechazadas"}
              number={qtyRejected}
              color={"circle-bg-rejected"}
            />
          </div>

          {/*//---- TABLE ---- */}
          <div className="table-container">
            <Table>
              <Thead className="table-head ">
                <Tr>
                  <Th className="first-th">Comercio</Th>
                  <Th>Monto</Th>
                  <Th>Fecha y hora</Th>
                  <Th>Tipo de compra</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {emails.map((email) => {
                  return (
                    <Tr
                      className="general-padding"
                      key={email.id}
                      onClick={() => console.log(email.id)}
                    >
                      <Td className="first-th capitalize">{email.comercio}</Td>
                      <Td>${email.monto}</Td>
                      <Td>{email.fechaHora}</Td>
                      <Td>{email.tipo}</Td>
                      <Td>{email.estado}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

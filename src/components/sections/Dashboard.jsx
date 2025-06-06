"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { FaAngleDown } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { MdSearch } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { VscSettings } from "react-icons/vsc";
import { RxUpdate } from "react-icons/rx";
import { RxCaretSort } from "react-icons/rx";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa6";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
      style={{
        width: "100%",
        position: "fixed",
        zIndex: 10,
        height: "600px",
        top: "50%",
        left: "50%",
        marginTop: "28px",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

export default function Dashboard({ session, mails }) {
  const [emails, setEmails] = useState(mails);
  const [filteredEmails, setFilteredEmails] = useState(mails); // correos filtrados
  const [searchTerm, setSearchTerm] = useState(""); // texto de búsqueda
  const [loading, setLoading] = useState(false);

  const [totalAmount, setTotalAmount] = useState();
  const [qtyMails, setQtyMails] = useState();
  const [qtyApproved, setQtyApproved] = useState();
  const [qtyRejected, setQtyRejected] = useState();

  const [currentId, setCurrentId] = useState();

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

  ///Se activa cuando cambia el texto del buscador, con delay de 2 segundos
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmails(emails); // mostrar todos sin activar loading
      return;
    }

    setLoading(true); // activa loading solo si hay texto

    const timeout = setTimeout(() => {
      const filtered = emails.filter((email) =>
        email.comercio.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmails(filtered);
      setLoading(false); // desactiva loading al finalizar
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchTerm, emails]);

  ///Actualizar correos filtrados si llegan nuevos
  useEffect(() => {
    setFilteredEmails(emails);
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
      <div className="main-container general-padding">
        {/*//---- HEADER ---- */}
        <div className="header-container">
          {/*//* Name */}
          <div className="font-large tracking-tight">
            Bienvenido, {session.user.name}
          </div>

          {/*//* Right Header */}
          <div className="header-right">
            <button
              className="logout-btn transition-all "
              onClick={() => signOut()}
            >
              Cerrar sesión
              <RiLogoutBoxRLine />
            </button>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              name={"Completadas"}
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
            {qtyMails != 0 && !loading ? (
              <Table>
                <Thead className="table-head ">
                  <Tr>
                    <Th className="first-th">
                      <div className="table-header">
                        Comercio
                        <span className="sort-icon">
                          <RxCaretSort />
                        </span>
                      </div>
                    </Th>
                    <Th>
                      <div className="table-header">
                        Fecha y hora
                        <span className="sort-icon">
                          <RxCaretSort />
                        </span>
                      </div>
                    </Th>
                    <Th>
                      <div className="table-header">
                        Estado
                        <span className="sort-icon">
                          <RxCaretSort />
                        </span>
                      </div>
                    </Th>
                    <Th>
                      <div className="table-header">
                        Monto
                        <span className="sort-icon">
                          <RxCaretSort />
                        </span>
                      </div>
                    </Th>
                    <Th>
                      <div className="table-header">
                        Tipo de compra
                        <span className="sort-icon">
                          <RxCaretSort />
                        </span>
                      </div>
                    </Th>
                    <Th>
                      <div className="table-header">Info</div>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody className="table-body">
                  {filteredEmails.map((email) => {
                    return (
                      <Tr className="general-padding" key={email.id}>
                        <Td className="first-th capitalize">
                          {email.comercio}
                        </Td>
                        <Td>{email.fechaHora}</Td>
                        <Td>
                          {email.estado.toLowerCase() === "aprobada" ? (
                            <div className="status-approved">Completada</div>
                          ) : (
                            <div className="status-rejected">Rechazada</div>
                          )}
                        </Td>
                        <Td>${email.monto}</Td>
                        <Td>{email.tipo}</Td>
                        <Td>
                          {/*//---- RENDER DEL BODY DE LOS CORREOS ---- */}
                          <div className="iframe-container">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="show-mail-btn transition-all"
                                  onClick={() => {
                                    setCurrentId(email.id);
                                  }}
                                >
                                  Ver correo
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle asChild>
                                    <div className="modal-header">
                                      <div className="flex gap-3">
                                        <div className="gmail-icon-container">
                                          <div className="gmail-icon"></div>
                                        </div>

                                        <div className=" flex justify-center flex-col leading-5">
                                          <div className="gmail-title">
                                            Gmail
                                          </div>
                                          <a
                                            className="gmail-subtitle"
                                            href={
                                              "https://cloud.google.com/?hl=es"
                                            }
                                            target="_blank"
                                          >
                                            Google cloud API
                                            <span>
                                              <FaArrowRight />
                                            </span>
                                          </a>
                                        </div>
                                      </div>
                                      <AlertDialogCancel asChild>
                                        <button className="btn-secondary close-iframe-btn leading-0">
                                          <IoClose />
                                        </button>
                                      </AlertDialogCancel>
                                    </div>
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <EmailIframe html={email.body} />
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <div className="p-4 text-center animate-pulse">
                Cargando correos...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

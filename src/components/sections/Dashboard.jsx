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
import { HiOutlineTrash } from "react-icons/hi2";
import { GoCheckCircleFill } from "react-icons/go";
import { FiCircle } from "react-icons/fi";

import getCurrentMonth from "@/lib/getCurrentMonth";
import getMonthRange from "@/lib/getMonthRange";

import Lottie from "lottie-react";
import NoFounded from "../../../public/lottie/animation-no-founded";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function Dashboard({
  session,
  mails,
  currentMonth,
  currentRange,
}) {
  const [emails, setEmails] = useState(mails);
  const [filteredEmails, setFilteredEmails] = useState(mails); // correos filtrados
  const [searchTerm, setSearchTerm] = useState(""); // texto de búsqueda
  const [loading, setLoading] = useState(false);

  const [firstLoad, setFirstLoad] = useState(false);
  const [resetSearch, setResetSearch] = useState(false);

  const [totalAmount, setTotalAmount] = useState();
  const [qtyMails, setQtyMails] = useState();
  const [qtyApproved, setQtyApproved] = useState();
  const [qtyRejected, setQtyRejected] = useState();

  const [selectedFilter, setSelectedFilter] = useState("más recientes");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const defaultTarget = process.env.NEXT_PUBLIC_DEFAULT_TARGET;
  const defaultQty = process.env.NEXT_PUBLIC_DEFAULT_QTY;

  //---- FUNCIONES ---- */

  ///Se activa cada vez que se actualiza los mails
  useEffect(() => {
    console.log(emails);
    //console.log(defaultTarget);

    if (emails) {
      //Monto total
      let sumaMontos = 0;
      for (const email of filteredEmails) {
        sumaMontos += parseFloat(email.monto);
      }
      setTotalAmount("$" + sumaMontos.toFixed(2));

      //Cantidad de correos
      let total = 0;
      for (const _ of filteredEmails) {
        total++;
      }
      setQtyMails(total);

      //Cantidad aprobadas
      let aprobadas = 0;
      for (const email of filteredEmails) {
        if (email.estado.toLowerCase() === "aprobada") {
          aprobadas++;
        }
      }
      setQtyApproved(aprobadas);

      //Cantidad rechazadas
      let rechazadas = 0;
      for (const email of filteredEmails) {
        if (email.estado.toLowerCase() != "aprobada") {
          rechazadas++;
        }
      }
      setQtyRejected(rechazadas);
    }
  }, [filteredEmails]);

  ///Se activa cuando cambia el texto del buscador, con delay de 500 milisegundos
  useEffect(() => {
    if (!resetSearch) {
      if (firstLoad) {
        setLoading(true); // activa el loading inmediatamente al escribir
        setSelectedFilter("");
      }
      const timeout = setTimeout(() => {
        if (searchTerm.trim() === "") {
          setFilteredEmails(emails);
        } else {
          const filtered = emails.filter((email) =>
            email.comercio.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredEmails(filtered);
        }
        setLoading(false); // desactiva el loading después de filtrar
        setFirstLoad(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm, emails]);

  ///Actualizar correos filtrados si llegan nuevos
  useEffect(() => {
    setFilteredEmails(emails);
  }, [emails]);

  ///Funcion para actualizar los mails con parametros
  const updateMails = async (target, qty, rangeDate) => {
    setLoading(true);
    setFirstLoad(false);
    setResetSearch(true);
    setSearchTerm("");
    selectFilter("más recientes");

    try {
      const res = await fetch("/api/get-mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target,
          qty: qty,
          startDate: rangeDate[0],
          endDate: rangeDate[1],
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
      setResetSearch(false);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  ///Limpiar filtros
  const clearFilters = () => {
    if (searchTerm != "") {
      setLoading(true);
      setSearchTerm("");
    }
    selectFilter("más recientes");
  };

  ///Seleccionar filtro
  const selectFilter = (filter) => {
    let sortedEmails = [...filteredEmails];

    setTimeout(() => {
      if (filter === "más recientes") {
        sortedEmails.sort(
          (a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)
        );
      } else if (filter === "más antiguos") {
        sortedEmails.sort(
          (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
        );
      } else if (filter === "monto ascendente") {
        sortedEmails.sort((a, b) => parseFloat(a.monto) - parseFloat(b.monto));
      } else if (filter === "monto descendente") {
        sortedEmails.sort((a, b) => parseFloat(b.monto) - parseFloat(a.monto));
      }

      setSelectedFilter(filter);
      setFilteredEmails(sortedEmails);
    }, 0);
  };

  ///Seleccionar params
  const selectParams = (month) => {
    const rangeDate = getMonthRange(month);
    setSelectedMonth(month);
    updateMails(defaultTarget, defaultQty, rangeDate);
  };

  //---- COMPONENTES PARA RENDERIZAR ---- */

  ///Rectangulos con info
  const Rectangles = ({ name, number, color }) => {
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

  ///Headers de la tabla
  const ThTable = ({ name, icon, style }) => {
    return (
      <Th className={`${style}`}>
        <div className="table-header">
          {name}
          <span className="sort-icon">{icon}</span>
        </div>
      </Th>
    );
  };

  ///Menu items for Filters
  const FiltersMenuItem = ({ name }) => {
    let nameLower = name.toLowerCase();
    return (
      <DropdownMenuItem asChild>
        <button
          className="logout-btn transition-all text-primary-color"
          onClick={() => selectFilter(nameLower)}
        >
          {name}
          {nameLower === selectedFilter ? (
            <div className="text-black">
              <GoCheckCircleFill />
            </div>
          ) : (
            <FiCircle />
          )}
        </button>
      </DropdownMenuItem>
    );
  };

  ///Menu items for Params
  const ParamsMenuItem = ({ name, month }) => {
    return (
      <DropdownMenuItem asChild>
        <button
          className="logout-btn transition-all text-primary-color"
          onClick={() => selectParams(month)}
        >
          {name}
          {month === selectedMonth ? (
            <div className="text-black">
              <GoCheckCircleFill />
            </div>
          ) : (
            <FiCircle />
          )}
        </button>
      </DropdownMenuItem>
    );
  };

  ///No session screen
  if (!session) {
    return (
      <div className="flex justify-center p-8">
        <button className="btn-primary transition-all" onClick={() => signIn()}>
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  ///Logged in screen
  return (
    <>
      <div className="main-container">
        {/*//---- HEADER ---- */}
        <div className="header-container general-padding">
          {/*//* Left Header */}
          <div className="flex items-center gap-3">
            <div
              className="logo"
              style={{ backgroundImage: `url(logo-small.svg` }}
            ></div>

            <div className="font-large font-semibold">BAC Mail Checker</div>
          </div>

          {/*//* Right Header */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="header-right outline-none">
                <div
                  className="profile-image"
                  style={{ backgroundImage: `url(${session.user.image})` }}
                ></div>

                <div>
                  <div className="text-primary-color font-medium">
                    {session.user.name}
                  </div>
                  <div className="text-secondary-color leading-3 text-[12px] font-medium">
                    Administrar
                  </div>
                </div>
                <div>
                  <FaAngleDown />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-10" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <button
                    className="logout-btn transition-all text-primary-color"
                    onClick={() => signOut()}
                  >
                    Cerrar sesión
                    <RiLogoutBoxRLine />
                  </button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="content-container general-padding screen-width">
          {/*//---- ACTIONS ---- */}
          <div className="actions-container">
            {/*//* Actions left */}
            <div className="actions-left">
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
              <button className="btn-secondary" onClick={clearFilters}>
                <HiOutlineTrash />
                Limpiar
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-secondary">
                    <FiFilter />
                    Filtros
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuGroup>
                    <FiltersMenuItem name={"Más recientes"} />
                    <FiltersMenuItem name={"Más antiguos"} />
                    <FiltersMenuItem name={"Monto descendente"} />
                    <FiltersMenuItem name={"Monto ascendente"} />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-secondary">
                    <VscSettings />
                    Parámetros
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuGroup>
                    <ParamsMenuItem name={"Enero"} month={"01"} />
                    <ParamsMenuItem name={"Febrero"} month={"02"} />
                    <ParamsMenuItem name={"Marzo"} month={"03"} />
                    <ParamsMenuItem name={"Abril"} month={"04"} />
                    <ParamsMenuItem name={"Mayo"} month={"05"} />
                    <ParamsMenuItem name={"Junio"} month={"06"} />
                    <ParamsMenuItem name={"Julio"} month={"07"} />
                    <ParamsMenuItem name={"Agosto"} month={"08"} />
                    <ParamsMenuItem name={"Septiembre"} month={"09"} />
                    <ParamsMenuItem name={"Octubre"} month={"10"} />
                    <ParamsMenuItem name={"Noviembre"} month={"11"} />
                    <ParamsMenuItem name={"Diciembre"} month={"12"} />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                className="btn-primary"
                onClick={() => {
                  updateMails(defaultTarget, defaultQty, currentRange);
                  setSelectedMonth(currentMonth);
                }}
              >
                <div
                  className={`${loading ? "animate-spin transition-all" : ""}`}
                >
                  <RxUpdate />
                </div>
                Actualizar
              </button>
            </div>
          </div>

          {/*//---- RECTANGLES INFO ---- */}
          <div className="rectangles-container">
            <Rectangles
              name={"Monto Total"}
              number={totalAmount}
              color={"circle-bg-amount"}
            />
            <Rectangles
              name={"Cantidad de correos"}
              number={qtyMails}
              color={"circle-bg-qty"}
            />
            <Rectangles
              name={"Completadas"}
              number={qtyApproved}
              color={"circle-bg-approved"}
            />
            <Rectangles
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
                    <ThTable
                      name={"Comercio"}
                      icon={<RxCaretSort />}
                      style={"first-th"}
                    />
                    <ThTable name={"Fecha y hora"} icon={<RxCaretSort />} />
                    <ThTable name={"Estado"} icon={<RxCaretSort />} />
                    <ThTable name={"Monto"} icon={<RxCaretSort />} />
                    <ThTable name={"Tipo de compra"} icon={<RxCaretSort />} />
                    <ThTable name={"Info"} />
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
                                <button className="show-mail-btn transition-all">
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
              <>
                {qtyMails || loading ? (
                  <div className="p-4 text-center animate-pulse text-secondary-color">
                    Cargando correos...
                  </div>
                ) : (
                  <div className=" m-auto flex items-center p-4 flex-col">
                    <div className="lottie-notfound">
                      <Lottie animationData={NoFounded} loop={true} />
                    </div>
                    <div className=" font-medium">
                      No se encontraron resultados
                    </div>
                    <div className="text-secondary-color notfound-subtitle">
                      Intenta con otra búsqueda o limpia los filtros y empecemos
                      de nuevo
                    </div>
                    <button
                      className="btn-primary mt-6 w-[125px]"
                      onClick={() => {
                        updateMails(defaultTarget, defaultQty, currentRange);
                        setSelectedMonth(currentMonth);
                      }}
                    >
                      <div
                        className={`${
                          loading ? "animate-spin transition-all" : ""
                        }`}
                      >
                        <RxUpdate />
                      </div>
                      Actualizar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

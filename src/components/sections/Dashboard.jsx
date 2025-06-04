"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import { Button } from "@/components/ui/button";

import { FiSearch } from "react-icons/fi";

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
  let emails = mails;

  ///No session
  if (!session) {
    return (
      <div className="flex justify-center p-8">
        <Button asChild variant="default">
          <button onClick={() => signIn()}>Iniciar sesión con Google</button>
        </Button>
      </div>
    );
  }

  ///Logged in
  return (
    <>
      <div className="main-container">
        {/*//---- HEADER ---- */}
        <div className="title-container general-padding">
          {/*//* Image */}
          <div
            className="title-image"
            style={{ backgroundImage: `url(${session.user.image})` }}
          ></div>

          {/*//* Name */}
          <div>
            <div className="title">Bienvenido, {session.user.name}</div>
            <div className="subtitle leading-4">
              Estas son tus transacciones más recientes
            </div>
          </div>
        </div>

        {/*//---- ACTION BUTTONS ---- */}
        <div className="action-buttons-container ">
          <div className="general-padding action-buttons-content">
            {/*//* Left */}
            <div className="action-buttons-left">
              <div className="searchbar-container">
                <input
                  type="text"
                  placeholder="Buscar comercio"
                  className="search-input"
                />
                <div className="search-icon">
                  <FiSearch />
                </div>
              </div>

              <div>
                <button
                  className="update-btn"
                  onClick={() => console.log("actualizar correos")}
                >
                  Actualizar correos
                </button>
              </div>
            </div>

            {/*//* Right */}
            <div></div>
          </div>
        </div>

        {/*//---- TABLE ---- */}
        <div>
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

      {/*//---- RENDER DEL BODY DE LOS CORREOS ---- */}
      {emails.map((email) => {
        return (
          <div key={email.id}>
            <EmailIframe html={email.body} />
          </div>
        );
      })}
    </>
  );
}

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import { Button } from "@/components/ui/button";

import { FiSearch } from "react-icons/fi";

export default function Dashboard({ session, mails }) {
  let emails = mails;

  ///NO SESSION
  if (!session) {
    return (
      <div className="flex justify-center p-8">
        <Button asChild variant="default">
          <button onClick={() => signIn()}>Iniciar sesión con Google</button>
        </Button>
      </div>
    );
  }

  ///LOGGED IN
  return (
    <>
      <div className="main-container">
        {/*//---- HEADER ---- */}
        <div className="title-container general-padding">
          {/*//* IMAGE */}
          <div
            className="title-image"
            style={{ backgroundImage: `url(${session.user.image})` }}
          ></div>

          {/*//* NAME */}
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
            {/*//* LEFT */}
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

            {/*//* RIGHT */}
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

      {emails.map((email) => {
        return (
          <div key={email.id}>
            <div className="mail" />

            {email.body}
          </div>
        );
      })}
    </>
  );
}

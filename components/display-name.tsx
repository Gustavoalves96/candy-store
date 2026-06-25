"use client";

import { useEffect, useState } from "react";
import { PencilIcon } from "@/components/icons";

// Nome de exibição guardado no navegador (LocalStorage), por aparelho.
const KEY = "candy_display_name";
const EVENT = "candy-display-name-change";

function readName(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(KEY) || fallback;
}

function saveName(name: string) {
  if (name) localStorage.setItem(KEY, name);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

// Mantem o nome sincronizado entre os componentes (saudacao e menu).
function useDisplayName(fallback: string): string {
  const [name, setName] = useState(fallback);
  useEffect(() => {
    const update = () => setName(readName(fallback));
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [fallback]);
  return name;
}

// Saudacao editavel do painel: "Olá, Nome!" com um lápis para trocar o nome.
export function Greeting({ fallback }: { fallback: string }) {
  const name = useDisplayName(fallback);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Seu nome"
          autoFocus
          className="rounded-xl border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
        />
        <button
          type="button"
          onClick={() => {
            saveName(draft.trim());
            setEditing(false);
          }}
          className="rounded-xl bg-candy-brown px-4 py-2 font-semibold text-white hover:bg-candy-brown-light"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-candy-pink px-4 py-2 text-candy-brown hover:bg-candy-pink-light"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-3xl font-bold text-candy-brown">
        Olá, {name.split(" ")[0]}!
      </h1>
      <button
        type="button"
        onClick={() => {
          setDraft(name === fallback ? "" : name);
          setEditing(true);
        }}
        title="Mudar nome"
        className="rounded-lg p-2 text-candy-brown hover:bg-candy-pink-light"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

// Exibicao do nome (menu lateral), sincronizada com a saudacao.
export function UserName({ fallback }: { fallback: string }) {
  const name = useDisplayName(fallback);
  return <>{name}</>;
}

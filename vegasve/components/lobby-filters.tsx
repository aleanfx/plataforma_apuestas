"use client";

import * as React from "react";

const FILTERS = ["Todos", "En vivo", "Mesas Bs.", "Mesas USD", "Torneos"];

export function LobbyFilters() {
  const [active, setActive] = React.useState("Todos");
  return (
    <div className="chips-row">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`fchip${active === f ? " active" : ""}`}
          onClick={() => setActive(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

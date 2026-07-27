/** @type {import('next').NextConfig} */
const nextConfig = {
  // FASE 2 — Parley y Caballos están como "Próximamente" hasta que se contraten.
  // Sus páginas siguen en el repo (app/parley, app/caballos) listas para volver:
  // basta con borrar estas dos redirecciones y devolverlos a GAMES en
  // components/game-cards.tsx.
  async redirects() {
    return [
      { source: "/parley", destination: "/lobby", permanent: false },
      { source: "/caballos", destination: "/lobby", permanent: false },
    ];
  },
};

export default nextConfig;

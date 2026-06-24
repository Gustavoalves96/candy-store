import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acessar o servidor de desenvolvimento por estes enderecos
  // (alem de localhost) sem que o Next bloqueie recursos internos do dev.
  allowedDevOrigins: ["172.20.128.1"],
};

export default nextConfig;

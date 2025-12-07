import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const ODOO_URL = process.env.ODOO_API_URL || 'http://127.0.0.1:8069';
    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:3001/api';

    return [
      {
        source: '/api/chat/stream',
        destination: `${ODOO_URL}/superchat/api/chat/stream`,
      },
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

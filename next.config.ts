import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "orcxzxbkciebsifelctj.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // ADD THIS NEW SECTION:
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Allows all Cloudinary images
      },
    ],
  },
};

export default nextConfig;

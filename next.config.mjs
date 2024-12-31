import process from "process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  async redirects() {
    const maintenanceMode = process.env.MAINTENANCE_MODE;
    console.log(maintenanceMode);
    if (maintenanceMode === "true") {
      return [
        {
          source: "/((?!maintenance.html$).*$)",
          destination: "/maintenance.html",
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

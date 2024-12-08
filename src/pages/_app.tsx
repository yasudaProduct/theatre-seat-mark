import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AuthWrapper>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <Toaster richColors />
          <Component {...pageProps} />
          <Footer />
        </div>
      </AuthWrapper>
    </SessionProvider>
  );
}

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
        <div className="min-h-screen bg-[#F6EBFF]] flex flex-col">
          <Header />
          <Toaster richColors />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </AuthWrapper>
    </SessionProvider>
  );
}

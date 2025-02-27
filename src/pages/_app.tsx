import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { PagesProgressBar as ProgressBar } from "next-nprogress-bar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AuthWrapper>
        <div className="min-h-screen bg-[#E5EDF0] flex flex-col">
          <Header />
          <Toaster richColors />
          <main className="flex-grow bg-white">
            <Component {...pageProps} />
            <ProgressBar
              height="2px"
              color="#ffff00"
              options={{ showSpinner: false }}
              shallowRouting
            />
          </main>
          <Footer />
        </div>
      </AuthWrapper>
    </SessionProvider>
  );
}

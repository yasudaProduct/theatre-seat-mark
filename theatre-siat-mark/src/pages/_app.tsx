import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
        <AuthWrapper>
          <Header />
          <Component {...pageProps} />
        </AuthWrapper>
    </SessionProvider>
  );
}

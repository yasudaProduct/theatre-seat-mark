import "@/styles/globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "シネポジ - 映画館の座席評価・レビュー共有サービス",
  description:
    "映画館の座席の評価やレビューを共有できるサービスです。スクリーンごとの座席の評価、見やすさ、おすすめポイントなどの情報を共有し、ベストな座席で映画を楽しみましょう。",
  keywords:
    "映画館,座席,スクリーン,座席評価,映画館レビュー,おすすめ座席,映画,シネマ,座席指定,見やすい座席",
  openGraph: {
    title: "シネポジ - 映画館の座席評価・レビュー共有サービス",
    type: "website",
    url: "https://sineposi.vercel.app/",
    siteName: "シネポジ",
    description:
      "映画館の座席の評価やレビューを共有できるサービスです。スクリーンごとの座席の評価、見やすさ、おすすめポイントなどの情報を共有し、ベストな座席で映画を楽しみましょう。",
    images: [
      {
        url: "/images/ogp.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sineposi",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sineposi.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "シネポジ",
              description: "映画館の座席評価・レビュー共有サービス",
              url: "https://sineposi.vercel.app/",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://sineposi.vercel.app/theaters?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <AuthWrapper>
            <div className="min-h-screen bg-[#E5EDF0] flex flex-col">
              <Header />
              <Toaster richColors />
              <main className="flex-grow bg-white">{children}</main>
              <Footer />
            </div>
          </AuthWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}

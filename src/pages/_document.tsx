import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <title>シネポジ - 映画館の座席評価・レビュー共有サービス</title>

          {/* Primary Meta Tags */}
          <meta
            name="title"
            content="シネポジ - 映画館の座席評価・レビュー共有サービス"
          />
          <meta
            name="description"
            content="映画館の座席の評価やレビューを共有できるサービスです。スクリーンごとの座席の評価、見やすさ、おすすめポイントなどの情報を共有し、ベストな座席で映画を楽しみましょう。"
          />
          <meta
            name="keywords"
            content="映画館,座席,スクリーン,座席評価,映画館レビュー,おすすめ座席,映画,シネマ,座席指定,見やすい座席"
          />

          {/* OGP Basic */}
          <meta
            property="og:title"
            content="シネポジ - 映画館の座席評価・レビュー共有サービス"
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://sineposi.vercel.app/" />
          <meta property="og:image" content="/images/ogp.png" />

          {/* OGP Additional */}
          <meta property="og:site_name" content="シネポジ" />
          <meta
            property="og:description"
            content="映画館の座席の評価やレビューを共有できるサービスです。スクリーンごとの座席の評価、見やすさ、おすすめポイントなどの情報を共有し、ベストな座席で映画を楽しみましょう。"
          />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@sineposi" />

          {/* Additional SEO Meta Tags */}
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          <link rel="canonical" href="https://sineposi.vercel.app/" />

          {/* Schema.org Markup */}
          <script type="application/ld+json">
            {JSON.stringify({
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
            })}
          </script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

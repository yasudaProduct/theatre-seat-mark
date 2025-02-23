import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <title>シネポジ</title>
          {/* OGP Basic */}
          <meta
            property="og:title"
            content="シネポジ - 映画館の座席レビューサービス"
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://sineposi.vercel.app/" />
          <meta property="og:image" content="/images/ogp.png" />

          {/* OGP Additional */}
          <meta property="og:site_name" content="シネポジ" />
          <meta
            property="og:description"
            content="映画館の座席レビューを登録し、あなたの好みの座席を記録しよう。"
          />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@sineposi" />
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

import React from "react";

export default function MaintenancePage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>現在メンテナンス中です。</h1>
      <p>しばらくお待ちください。</p>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

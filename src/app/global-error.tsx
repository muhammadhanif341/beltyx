"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#0b0a09",
          color: "#f7f3ec",
        }}
      >
        <p style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "0.05em" }}>BELTYX</p>
        <h1 style={{ marginTop: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.75rem", color: "#a89f92", maxWidth: "28rem" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "#c9a24b",
            color: "#0b0a09",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}

import React, { useState } from "react";

const COOKIE_BANNER_KEY = "cookieBannerAccepted";

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_BANNER_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#222",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ marginRight: "1rem" }}>
        This website does not use cookies
      </span>
      <button
        onClick={handleAccept}
        style={{
          background: "#fff",
          color: "#222",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        okay
      </button>
    </div>
  );
};

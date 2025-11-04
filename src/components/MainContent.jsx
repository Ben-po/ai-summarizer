import React from "react";

export default function MainContent({ summaryResult, filename }) {
  const renderContent = () => {
    if (!summaryResult) {
      return <p style={{ padding: "1rem", color: "#444" }}>No summary yet — upload a PDF to get started.</p>;
    }

    if (summaryResult.error) {
      return (
        <div style={{ padding: "1rem", color: "#b00020" }}>
          <h3>Error check OpenAI API</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(summaryResult.error)}</pre>
        </div>
      );
    }

    return (
      <div style={{ padding: "1rem", color: "#111" }}>
        {filename ? <h3>{filename}</h3> : null}
        <div>
          <h2>Summary</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{String(summaryResult.summary || "(no summary returned)")}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <header className="main-header">
        <h1>AI-Powered summaries</h1>
        <button className="logout-btn">Logout</button>
      </header>

      <div className="summary-box">{renderContent()}</div>
    </div>
  );
}

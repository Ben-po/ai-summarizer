import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state && location.state.summaryData;

  if (!data) {
    return (
      <div className="summary-page">
        <h1>Summary</h1>
        <p>No summary data found. Upload a file first.</p>
        <button onClick={() => navigate("/")}>Go home</button>
      </div>
    );
  }

  // Helpful rendering: show error if present, otherwise try to show common fields
  const hasError = data && data.error;
  const summaryText = data && (data.summary || data.text || data.result || data.summary_text);

  return (
    <div className="summary-page">
      <h1>Summary</h1>
      {hasError ? (
        <div className="error">Error: {String(data.error)}</div>
      ) : (
        <>
          {summaryText ? (
            <div className="summary-text">{summaryText}</div>
          ) : (
            <div>
              <h3>Returned JSON</h3>
              <pre style={{ whiteSpace: "pre-wrap", maxWidth: "90%" }}>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(-1)}>Back</button>
        <button style={{ marginLeft: 8 }} onClick={() => navigate("/")}>Home</button>
      </div>
    </div>
  );
}

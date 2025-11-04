import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import "../App.css";

export default function Dashboard() {
  const [summaryResult, setSummaryResult] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState("");

  const handleUploadResult = (data) => {
    // UploadSection sends either {summary: '...'} or {error: '...'}
    if (!data) return;
    if (data.filename) setUploadedFilename(data.filename);
    if (data.summary || data.error) setSummaryResult(data);
  };

  return (
    <div className="dashboard">
      <Sidebar onResult={handleUploadResult} />
      <MainContent summaryResult={summaryResult} filename={uploadedFilename} />
    </div>
  );
}

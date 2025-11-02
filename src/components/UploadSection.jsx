import React, { useRef, useEffect, useState } from "react";
import { Upload } from "lucide-react";

function UploadSection({ onResult }) {

  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [filename, setFilename] = useState("");

  const handleButtonClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const uploadFile = async (file) => {
    setStatus("uploading");
    setFilename(file.name || "");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data && data.error ? data.error : `HTTP ${res.status}`;
        throw new Error(err);
      }
      setStatus("done");
      if (typeof onResult === "function") onResult(data);
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("error");
      if (typeof onResult === "function") onResult({ error: err.message || String(err) });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file) {
      uploadFile(file);
    }
  };

  useEffect(() => {
    try {
      const els = document.querySelectorAll("#upload-button");
      if (els.length > 1) {
        els.forEach((el, idx) => {
          if (idx > 0) el.style.display = "none";
        });
        console.warn("Found multiple #upload-button elements; hiding duplicates.");
      }
    } catch (e) {
      // ignore (e.g., SSR)
    }
  }, []);

  return (
    <div className="upload-section">
      <input
        type="file"
        id="fileInput"
        ref={fileInputRef}
        className="hidden-file-input"
        onChange={handleFileChange}
      />

      <button
        id="upload-button"
        className="upload-btn"
        onClick={handleButtonClick}
        disabled={status === "uploading"}
        aria-busy={status === "uploading"}
      >
        <Upload className="upload-icon" />
        <span>
          {status === "uploading" ? "Uploading..." : status === "done" ? `Uploaded: ${filename}` : status === "error" ? "Upload failed" : "Upload file"}
        </span>
      </button>
    </div>
  );
}

export default UploadSection;

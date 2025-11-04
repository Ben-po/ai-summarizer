import React from "react";
import UploadSection from "./UploadSection";

export default function Sidebar({ onResult }) {
  // Sidebar delegates upload UI/behavior to the UploadSection component.

  return (
    <div className="sidebar">
      <UploadSection onResult={onResult} />

    </div>
  );
}

import React, { useState, useEffect } from "react";

const NavLinks = () => {
  const [openModal, setOpenModal] = useState(null); // 'tiers' | 'terms' | 'about' | null

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const renderModalContent = () => {
    if (!openModal) return null;

    let title = "";
    let body = null;

    if (openModal === "tiers") {
      title = "Tiers";
      body = (
        <div>
          <p>Choose a plan that fits your needs. Example tiers: Free, Pro, Enterprise.</p>
        </div>
      );
    } else if (openModal === "terms") {
      title = "Terms & Conditions";
      body = (
        <div>
          <p>Please read our terms and conditions before using the service. This is placeholder text.</p>
        </div>
      );
    } else if (openModal === "about") {
      title = "About us";
      body = (
        <div>
          <p>We build AI-powered summaries to help users quickly understand documents.</p>
        </div>
      );
    }

    return (
      <div className="modal-overlay" onClick={() => setOpenModal(null)}>
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <h2>{title}</h2>
          {body}
          <div className="modal-footer">
            <button className="modal-close" onClick={() => setOpenModal(null)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="nav-links">
        <button onClick={() => setOpenModal("tiers")}>Tiers</button>
        <button onClick={() => setOpenModal("terms")}>Terms & Conditions</button>
        <button onClick={() => setOpenModal("about")}>About us</button>
      </div>
      {renderModalContent()}
    </>
  );
};

export default NavLinks;
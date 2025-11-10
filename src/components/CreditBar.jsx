import React, { useState, useEffect } from "react";

/**
 * CreditBar with a Contact button that opens a small modal showing the email.
 * Pass `email` prop to customize the displayed address. Defaults to a placeholder.
 */
const CreditBar = ({ email = "benjaminam737@gmail.com" }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="credit-bar">
        <a href="https://github.com/Ben-po" target="_blank" rel="noopener noreferrer">My GitHub</a>
        <h3>Powered by OpenAI</h3>
        <button onClick={() => setOpen(true)}>Contact</button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Contact</h2>
            <p>
              Email: <a href={`mailto:${email}`}>{email}</a>
            </p>
            <div className="modal-footer">
                <button className="modal-close" onClick={() => setOpen(false)}>Close</button>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditBar;

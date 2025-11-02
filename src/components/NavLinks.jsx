import { useNavigate } from "react-router-dom";

const NavLinks =() => {
  const navigate = useNavigate();

  return (
    <div className="nav-links">
      <button onClick={() => navigate("/tiers")}>Tiers</button>
      <button onClick={() => navigate("/terms")}>Terms & Conditions</button>
      <button onClick={() => navigate("/about")}>About us</button>
    </div>
  );
};

export default NavLinks;
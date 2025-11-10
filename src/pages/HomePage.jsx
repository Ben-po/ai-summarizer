import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NavLinks from "../components/NavLinks";
import CreditBar from "../components/CreditBar";
import "../App.css";

export default function HomePage() {
  const navigate = useNavigate();


  return (
    <div className="home-page">
      <Navbar />
      <NavLinks />

      <div className="Info-section">
        <h2>Welcome to AI-Powered Summaries</h2>
        <p>This is an AI-Powered summarizer that helps you quickly generate concise summaries of uploaded files first built to help students quickly and effectently learn materials.</p>
        <h1>Get started now! No login required</h1>
      </div>


      <button className="Dashboard-btn" onClick={() => navigate("/Dashboard")}>
        Clicks to start summarizing
      </button>

      <CreditBar />
      
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NavLinks from "../components/NavLinks";
import UploadSection from "../components/UploadSection";
import "../App.css";

export default function HomePage() {
  const navigate = useNavigate();

  const handleUploadResult = (res) => {
    // navigate to /summary and pass the response in location.state
    navigate("/Dashboard", { state: { summaryData: res } });
  };

  return (
    <div className="home-page">
      <Navbar />
      <NavLinks />
      <UploadSection onResult={handleUploadResult} />
    </div>
  );
}

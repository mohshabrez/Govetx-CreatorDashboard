import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "GoVertX - Content Creator Platform";

createRoot(document.getElementById("root")!).render(<App />);

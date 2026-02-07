import { render } from "preact";
import "./index.css";
import App from "./App.tsx";
import { initializeDatabase } from "./data/dbInitializer";

// Initialize the triplet store asynchronously
initializeDatabase().catch(console.error);

render(<App />, document.getElementById("root")!);

import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

import LegacyPage from "./pages/LegacyPage";
import AIPage from "./pages/AIPage";

import "./App.css";

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={<LegacyPage />}
                />
                <Route
                    path="/ai-generator"
                    element={<AIPage />}
                />
            </Routes>
        </>
    );
}

export default App;
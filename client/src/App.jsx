import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Button } from "./components/ui/button";
import Auth from "./pages/auth/Auth";
import Chat from "./pages/chat/Chat";
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

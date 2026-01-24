import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import { Routes, Route, useLocation } from "react-router-dom"
import Profile from "./pages/Profile"
import Navbar from "./components/Navbar"
import EditProfile from "./pages/EditProfile"
import SearchPage from "./pages/SearchPage"
import Timeline from "./pages/Timeline"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import ChatPage from "./pages/ChatPage"
import Messages from "./pages/Messages"
function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password","/edit-profile","/messages"];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>  
        <Route path="/" element={<Timeline />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  )
}

export default App

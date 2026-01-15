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
function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password","/edit-profile"];
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
      </Routes>
    </>
  )
}

export default App

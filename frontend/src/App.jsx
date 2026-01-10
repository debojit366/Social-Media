import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import ForgotPassword from "./pages/ForgotPassword"
import { Routes, Route, useLocation } from "react-router-dom"
import Profile from "./pages/Profile"
import Navbar from "./components/Navbar"
import EditProfile from "./pages/EditProfile"
function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password","/edit-profile"];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>  
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </>
  )
}

export default App

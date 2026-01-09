import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import ForgotPassword from "./pages/ForgotPassword"
import { Routes, Route } from "react-router-dom"
function App() {

  return (
    <>
      <Routes>  
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  )
}

export default App

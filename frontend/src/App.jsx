import Login from "./pages/Login"
import Register from "./pages/Register"
import { Routes, Route } from "react-router-dom"
function App() {

  return (
    <>
      <Routes>  
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App

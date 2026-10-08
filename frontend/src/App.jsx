import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<h1>Movie Discovery Platform</h1>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-phone" element={<h1>Verify Phone</h1>} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/forgot-password" element={<h1>Forgot Password</h1>} />

        <Route path="/movies" element={<h1>Movies</h1>} />
        <Route path="/saved-movies" element={<h1>Saved Movies</h1>} />

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
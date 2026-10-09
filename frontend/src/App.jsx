import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext.jsx";

import Signup from "./pages/Signup.jsx";
import VerifyPhone from "./pages/VerifyPhone.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Movies from "./pages/Movies.jsx";
import SavedMovies from "./pages/SavedMovies.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/saved-movies" element={<SavedMovies />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
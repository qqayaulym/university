import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import MainPage from "./pages/MainPage"
import PrivateRoute from "./components/PrivateRoute"
import MainLayout from "./Layouts/MainLayout"
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute>
          <MainLayout>
          <MainPage />
          </MainLayout>
          </PrivateRoute>} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
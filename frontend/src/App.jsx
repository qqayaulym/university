import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
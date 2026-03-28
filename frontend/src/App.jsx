import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import MainPage from "./pages/MainPage"
import Courses from "./pages/Courses"
import StudentProfile from "./pages/StudentProfile"
import Settings from "./pages/Settings"
import AdminDashBoard from "./pages/AdminDashboard"
import CreateDeleteCourse from "./pages/CreateDeleteCourse"
import CoursesDetails from "./pages/CoursesDetails"

import PrivateRoute from "./components/PrivateRoute"
import MainLayout from "./Layouts/MainLayout"

import { BrowserRouter, Routes, Route } from "react-router-dom"

const App = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<MainPage />} />
          <Route path="/course" element={<Courses />} />
          <Route path="/myprofile" element={<StudentProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashBoard />} />
          <Route path="/course/:id" element={<CoursesDetails />} />
        </Route>
        <Route path="/createcourse" element={<CreateDeleteCourse />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
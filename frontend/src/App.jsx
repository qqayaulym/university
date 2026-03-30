import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./Layouts/MainLayout";
import MainPage from "./pages/MainPage";
import StudentProfile from "./pages/StudentProfile";
import Courses from "./pages/Courses";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CoursesDetails from "./pages/CoursesDetails";
import CreateDeleteCourse from "./pages/CreateDeleteCourse";
import AdminDashBoard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<MainPage />} />
        <Route path="myprofile" element={<StudentProfile />} />
        <Route path="course" element={<Courses />} />
        <Route path="course/:id" element={<CoursesDetails />} />
        <Route
          path="createcourse"
          element={
            <PrivateRoute roles={["creator", "admin"]}>
              <CreateDeleteCourse />
            </PrivateRoute>
          }
        />
        <Route path="settings" element={<Settings />} />
        <Route
          path="admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashBoard />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
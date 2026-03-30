import { Navigate, Route, Routes, MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import PrivateRoute from "./PrivateRoute";

const makeToken = (payload) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("PrivateRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects to login without token", () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <PrivateRoute>
                <div>Private Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders private page with valid token", () => {
    const token = makeToken({
      id: 1,
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem("token", token);

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <PrivateRoute>
                <div>Private Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<Navigate to="/private" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Private Content")).toBeInTheDocument();
  });
});

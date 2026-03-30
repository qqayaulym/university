import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NotFound from "./NotFound";

describe("NotFound page", () => {
  it("renders 404 content", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Басты бетке оралу/i)).toBeInTheDocument();
  });
});

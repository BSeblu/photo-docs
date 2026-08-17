import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("renders the page", () => {
    render(<Home />);
    expect(screen.getByText(/edit the/)).toBeInTheDocument();
  });
});
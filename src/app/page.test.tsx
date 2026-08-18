import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Photo Docs heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Photo Docs" })
    ).toBeInTheDocument();
  });
});

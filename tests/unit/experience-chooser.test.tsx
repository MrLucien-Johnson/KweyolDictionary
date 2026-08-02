import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperienceChooser } from "@/components/home/ExperienceChooser";

describe("ExperienceChooser", () => {
  it("offers Adult and Children’s dictionary without a quiz gate", () => {
    render(<ExperienceChooser />);
    expect(
      screen.getByRole("heading", { name: /choose how you want to learn/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open adult dictionary/i }),
    ).toHaveAttribute("href", "/dictionary");
    expect(
      screen.getByRole("link", { name: /open children’s dictionary/i }),
    ).toHaveAttribute("href", "/children");
    expect(screen.queryByText(/quiz/i)).not.toBeNull();
    expect(screen.getByText(/no quiz required/i)).toBeInTheDocument();
  });
});

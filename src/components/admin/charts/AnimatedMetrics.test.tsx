import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedBar, AnimatedNumber, OccupancyRing } from "./AnimatedMetrics";

describe("AnimatedMetrics", () => {
  it("affiche la valeur du compteur", () => {
    render(<AnimatedNumber value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("affiche le pourcentage au centre de l'anneau", () => {
    render(<OccupancyRing percent={73} />);
    expect(screen.getByText("73%")).toBeInTheDocument();
  });

  it("expose la barre de progression avec aria", () => {
    render(<AnimatedBar percent={55} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "55");
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import FlatDieline from "../features/cartons/FlatDieline";
import IsometricBox from "../features/cartons/IsometricBox";

// ══════════════════════════════════════════════════
// FLAT DIELINE
// ══════════════════════════════════════════════════

describe("FlatDieline", () => {

  const defaultProps = {
    style: "bottom_side_lock",
    L: 45, W: 45, H: 83,
    flatW: 190, flatH: 157.7,
    topTuck: 33.2, bottomTuck: 41.5,
    glueFlap: 10,
  };

  test("renders SVG element", () => {
    const { container } = render(<FlatDieline {...defaultProps} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("renders all panel labels", () => {
    render(<FlatDieline {...defaultProps} />);
    expect(screen.getByText("FRONT")).toBeInTheDocument();
    expect(screen.getByText("BACK")).toBeInTheDocument();
    expect(screen.getByText("LEFT")).toBeInTheDocument();
    expect(screen.getByText("RIGHT")).toBeInTheDocument();
    expect(screen.getByText("TOP TUCK")).toBeInTheDocument();
  });

  test("renders flat width annotation", () => {
    render(<FlatDieline {...defaultProps} />);
    expect(screen.getByText("Flat W: 190mm")).toBeInTheDocument();
  });

  test("renders flat height annotation", () => {
    render(<FlatDieline {...defaultProps} />);
    expect(screen.getByText("Flat H: 157.7mm")).toBeInTheDocument();
  });

  test("renders BOT LOCK for bottom_side_lock style", () => {
    render(<FlatDieline {...defaultProps} style="bottom_side_lock" />);
    expect(screen.getByText("BOT LOCK")).toBeInTheDocument();
  });

  test("renders BOT LOCK for lock_bottom style", () => {
    render(<FlatDieline {...defaultProps} style="lock_bottom" />);
    expect(screen.getByText("BOT LOCK")).toBeInTheDocument();
  });

  test("renders BOT TUCK for straight_tuck_end style", () => {
    render(<FlatDieline {...defaultProps} style="straight_tuck_end" />);
    expect(screen.getByText("BOT TUCK")).toBeInTheDocument();
  });

  test("renders nothing when dimensions are zero", () => {
    const { container } = render(
      <FlatDieline {...defaultProps} L={0} W={0} H={0} />
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  test("renders top tuck depth annotation", () => {
    render(<FlatDieline {...defaultProps} />);
    expect(screen.getByText("33.2mm")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════
// ISOMETRIC BOX
// ══════════════════════════════════════════════════

describe("IsometricBox", () => {

  test("renders SVG element", () => {
    const { container } = render(<IsometricBox L={45} W={45} H={83} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("renders L dimension label", () => {
    render(<IsometricBox L={45} W={45} H={83} />);
    expect(screen.getByText("L:45mm")).toBeInTheDocument();
  });

  test("renders W dimension label", () => {
    render(<IsometricBox L={45} W={45} H={83} />);
    expect(screen.getByText("W:45mm")).toBeInTheDocument();
  });

  test("renders H dimension label", () => {
    render(<IsometricBox L={45} W={45} H={83} />);
    expect(screen.getByText("H:83mm")).toBeInTheDocument();
  });

  test("renders nothing when dimensions are zero", () => {
    const { container } = render(<IsometricBox L={0} W={0} H={0} />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  test("renders three visible faces", () => {
    const { container } = render(<IsometricBox L={45} W={45} H={83} />);
    const polygons = container.querySelectorAll("polygon");
    expect(polygons.length).toBeGreaterThanOrEqual(3);
  });

  test("renders correctly for tall box", () => {
    render(<IsometricBox L={57} W={57} H={157} />);
    expect(screen.getByText("H:157mm")).toBeInTheDocument();
  });

  test("renders correctly for wide box", () => {
    render(<IsometricBox L={150} W={55} H={142} />);
    expect(screen.getByText("L:150mm")).toBeInTheDocument();
  });
});

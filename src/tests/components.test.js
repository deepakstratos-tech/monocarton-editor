import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "../components/StatCard";
import Tooltip from "../components/Tooltip";
import SectionPanel from "../components/SectionPanel";

// ══════════════════════════════════════════════════
// STATCARD
// ══════════════════════════════════════════════════

describe("StatCard", () => {

  test("renders label and value", () => {
    render(<StatCard label="Total Cartons" value={18} color="#1565c0" />);
    expect(screen.getByText("Total Cartons")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  test("renders sub text when provided", () => {
    render(<StatCard label="Utilization" value="80%" color="#27ae60" sub="Excellent" />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  test("does not render sub when not provided", () => {
    const { container } = render(<StatCard label="Cartons" value={10} color="#333" />);
    expect(container.querySelectorAll("div")).toHaveLength(3);
  });

  test("applies correct color to value", () => {
    const { container } = render(<StatCard label="Test" value="42" color="#e74c3c" />);
    const valueDiv = container.querySelectorAll("div")[2];
    expect(valueDiv.style.color).toBe("rgb(231, 76, 60)");
  });

  test("renders string values", () => {
    render(<StatCard label="Flat Size" value="190×157mm" color="#333" />);
    expect(screen.getByText("190×157mm")).toBeInTheDocument();
  });

  test("renders zero value", () => {
    render(<StatCard label="Cartons" value={0} color="#333" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("renders dash for undefined value", () => {
    render(<StatCard label="Cartons" value="—" color="#333" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════
// TOOLTIP
// ══════════════════════════════════════════════════

describe("Tooltip", () => {

  test("renders info icon", () => {
    render(<Tooltip text="This is a tooltip" />);
    expect(screen.getByText("ⓘ")).toBeInTheDocument();
  });

  test("has title attribute with tooltip text", () => {
    render(<Tooltip text="Flat width of the carton" />);
    const icon = screen.getByText("ⓘ");
    expect(icon).toHaveAttribute("title", "Flat width of the carton");
  });

  test("renders with empty text", () => {
    render(<Tooltip text="" />);
    expect(screen.getByText("ⓘ")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════
// SECTIONPANEL
// ══════════════════════════════════════════════════

describe("SectionPanel", () => {

  test("renders title", () => {
    render(<SectionPanel title="📦 Carton Specification">content</SectionPanel>);
    expect(screen.getByText("📦 Carton Specification")).toBeInTheDocument();
  });

  test("renders children", () => {
    render(<SectionPanel title="Test Panel"><p>Child content</p></SectionPanel>);
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("renders multiple children", () => {
    render(
      <SectionPanel title="Test">
        <span>Item 1</span>
        <span>Item 2</span>
      </SectionPanel>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });
});

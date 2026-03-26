import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobsPage from "../features/jobs/JobsPage";

// Mock fetch globally
global.fetch = jest.fn();

const mockEnrichedJob = {
  job_id: "abc12345",
  client_name: "Fronius Biotech",
  product_name: "Musli Power",
  style: "bottom_side_lock",
  length: 45, width: 45, height: 83,
  quantity: 5000,
  paper_type: "FBB",
  gsm: 330,
  lamination: "UV",
  colours: "CMYK",
  stamping: "NONE",
  flat_w: 190,
  flat_h: 157.7,
  top_tuck_depth: 33.2,
  nesting_saving_pct: 21.05,
};

const renderJobsPage = (jobs = [], setJobs = jest.fn()) => {
  return render(
    <MemoryRouter>
      <JobsPage jobs={jobs} setJobs={setJobs} />
    </MemoryRouter>
  );
};

beforeEach(() => {
  fetch.mockClear();
});

// ══════════════════════════════════════════════════
// RENDER TESTS
// ══════════════════════════════════════════════════

describe("JobsPage — Rendering", () => {

  test("renders page title", () => {
    renderJobsPage();
    expect(screen.getByText("📋 Job Management")).toBeInTheDocument();
  });

  test("renders Add New Job form", () => {
    renderJobsPage();
    expect(screen.getByText("➕ Add New Job")).toBeInTheDocument();
  });

  test("renders empty state when no jobs", () => {
    renderJobsPage();
    expect(screen.getByText("No jobs added yet")).toBeInTheDocument();
  });

  test("renders Add Job button", () => {
    renderJobsPage();
    expect(screen.getByText("Add Job")).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    renderJobsPage();
    expect(screen.getByPlaceholderText("e.g. Fronius Biotech")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Musli Power")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 5000")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 330")).toBeInTheDocument();
  });

  test("does not show Plan Imposition button with fewer than 2 jobs", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.queryByText(/Plan Imposition/)).not.toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════
// FORM VALIDATION
// ══════════════════════════════════════════════════

describe("JobsPage — Form Validation", () => {

  test("shows error when client name is empty", async () => {
    renderJobsPage();
    fireEvent.click(screen.getByText("Add Job"));
    await waitFor(() => {
      expect(screen.getByText("⚠️ Client name is required")).toBeInTheDocument();
    });
  });

  test("shows error when product name is empty", async () => {
    renderJobsPage();
    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Test Client" }
    });
    fireEvent.click(screen.getByText("Add Job"));
    await waitFor(() => {
      expect(screen.getByText("⚠️ Product name is required")).toBeInTheDocument();
    });
  });

  test("shows error when dimensions are missing", async () => {
    renderJobsPage();
    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Test Client" }
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Musli Power"), {
      target: { value: "Test Product" }
    });
    fireEvent.click(screen.getByText("Add Job"));
    await waitFor(() => {
      expect(screen.getByText("⚠️ All dimensions are required")).toBeInTheDocument();
    });
  });

  test("shows error when quantity is missing", async () => {
    renderJobsPage();
    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Test Client" }
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Musli Power"), {
      target: { value: "Test Product" }
    });
    fireEvent.click(screen.getByText("Add Job"));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════
// JOB LIST RENDERING
// ══════════════════════════════════════════════════

describe("JobsPage — Job List", () => {

  test("renders job card when jobs exist", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("Musli Power")).toBeInTheDocument();
    expect(screen.getByText("Fronius Biotech")).toBeInTheDocument();
  });

  test("renders job flat size", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("190×157.7mm")).toBeInTheDocument();
  });

  test("renders job quantity", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("5,000")).toBeInTheDocument();
  });

  test("renders Edit and Remove buttons for each job", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  test("removes job when Remove is clicked", () => {
    const setJobs = jest.fn();
    renderJobsPage([mockEnrichedJob], setJobs);
    fireEvent.click(screen.getByText("Remove"));
    expect(setJobs).toHaveBeenCalled();
  });

  test("shows Edit form when Edit is clicked", () => {
    renderJobsPage([mockEnrichedJob]);
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("✏️ Edit Job")).toBeInTheDocument();
  });

  test("shows Cancel button when editing", () => {
    renderJobsPage([mockEnrichedJob]);
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("cancels edit and shows Add form", () => {
    renderJobsPage([mockEnrichedJob]);
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("➕ Add New Job")).toBeInTheDocument();
  });

  test("shows Plan Imposition button with 2+ jobs", () => {
    const job2 = { ...mockEnrichedJob, job_id: "xyz99999", product_name: "Trujoint Plus" };
    renderJobsPage([mockEnrichedJob, job2]);
    expect(screen.getAllByText(/Plan Imposition/).length).toBeGreaterThan(0);
  });

  test("renders paper type badge", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("FBB")).toBeInTheDocument();
  });

  test("renders GSM badge", () => {
    renderJobsPage([mockEnrichedJob]);
    expect(screen.getByText("330")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════
// API INTEGRATION
// ══════════════════════════════════════════════════

describe("JobsPage — API Integration", () => {

  test("calls /jobs/enrich on Add Job", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockEnrichedJob],
    });

    renderJobsPage();

    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Fronius Biotech" }
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Musli Power"), {
      target: { value: "Musli Power" }
    });

    // Fill dimensions
    const numberInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(numberInputs[0], { target: { value: "45" } });   // L
    fireEvent.change(numberInputs[1], { target: { value: "45" } });   // W
    fireEvent.change(numberInputs[2], { target: { value: "83" } });   // H
    fireEvent.change(numberInputs[3], { target: { value: "5000" } }); // Qty
    fireEvent.change(numberInputs[4], { target: { value: "330" } });  // GSM

    fireEvent.click(screen.getByText("Add Job"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/jobs/enrich"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  test("shows backend error message on failed request", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Not Found" }),
    });

    renderJobsPage();

    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Test Client" }
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Musli Power"), {
      target: { value: "Test Product" }
    });

    const numberInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(numberInputs[0], { target: { value: "45" } });
    fireEvent.change(numberInputs[1], { target: { value: "45" } });
    fireEvent.change(numberInputs[2], { target: { value: "83" } });
    fireEvent.change(numberInputs[3], { target: { value: "5000" } });
    fireEvent.change(numberInputs[4], { target: { value: "330" } });

    fireEvent.click(screen.getByText("Add Job"));

    await waitFor(() => {
      expect(screen.getByText(/Backend error/i)).toBeInTheDocument();
    });
  });

  test("clears form after successful add", async () => {
    const setJobs = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockEnrichedJob],
    });

    renderJobsPage([], setJobs);

    fireEvent.change(screen.getByPlaceholderText("e.g. Fronius Biotech"), {
      target: { value: "Fronius Biotech" }
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Musli Power"), {
      target: { value: "Musli Power" }
    });

    const numberInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(numberInputs[0], { target: { value: "45" } });
    fireEvent.change(numberInputs[1], { target: { value: "45" } });
    fireEvent.change(numberInputs[2], { target: { value: "83" } });
    fireEvent.change(numberInputs[3], { target: { value: "5000" } });
    fireEvent.change(numberInputs[4], { target: { value: "330" } });

    fireEvent.click(screen.getByText("Add Job"));

    await waitFor(() => {
      expect(setJobs).toHaveBeenCalled();
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProspectingWorkspace } from "./prospecting-workspace";

describe("ProspectingWorkspace", () => {
  it("starts in Demo mode with the complete primary navigation", () => {
    render(<ProspectingWorkspace />);

    expect(screen.getAllByText("Demo mode").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Good morning, prospector." })).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).toBeInTheDocument();
    for (const label of ["Dashboard", "Search", "Leads", "Pipeline", "Settings"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("moves to each workspace section through accessible navigation", () => {
    render(<ProspectingWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("heading", { name: "Find your next conversation." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No search results yet" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Leads" }));
    expect(screen.getByRole("heading", { name: "Leads worth following." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No leads saved yet" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));
    expect(screen.getByRole("heading", { name: "Your pipeline, at a glance." })).toBeInTheDocument();
    expect(screen.getByText("Not interested")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Your workspace settings." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No profile details yet" })).toBeInTheDocument();
  });

  it("offers clear next steps from empty dashboard and lead states", () => {
    render(<ProspectingWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Explore Search" }));
    expect(screen.getByRole("heading", { name: "Find your next conversation." })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Leads" }));
    fireEvent.click(screen.getByRole("button", { name: "Find businesses" }));
    expect(screen.getByRole("heading", { name: "Find your next conversation." })).toBeInTheDocument();
  });

  it("validates and saves the local profile without losing input", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
    expect(await screen.findByText("Check the highlighted fields.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Cesar" } });
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "North Star" } });
    fireEvent.change(screen.getByLabelText("Offered service"), { target: { value: "Web design" } });
    fireEvent.change(screen.getByLabelText("Base outreach message"), { target: { value: "Hello {{name}}" } });
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
    expect(await screen.findByText("Saved locally.")).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem("prospect.local.workspace.v1")).toContain("North Star"));
  });
});

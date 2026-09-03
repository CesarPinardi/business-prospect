import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ProspectingWorkspace } from "./prospecting-workspace";
import { resetStorageForTests } from "./prospecting-storage";

beforeEach(() => {
  window.localStorage.clear();
  resetStorageForTests();
});

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

  it("searches deterministic Demo businesses inside the selected radius", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist" } });
    fireEvent.change(screen.getByLabelText("Radius"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();
    expect(screen.getByText("10 loaded")).toBeInTheDocument();
    expect(screen.getAllByText("Demo provider · sample data")).toHaveLength(10);
    expect(screen.getAllByTestId("map-marker")).toHaveLength(10);
    fireEvent.click(screen.getAllByTestId("map-marker")[1]);
    expect(document.activeElement).toHaveAttribute("id", "candidate-demo:place:jundiai:02");
    fireEvent.click(screen.getByRole("heading", { name: "Aurora Dental Studio" }));
    await waitFor(() => expect(document.activeElement).toHaveAttribute("id", "marker-demo:place:jundiai:01"));
  });

  it("shows invalid, loading, and provider-error search states", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByText("Select a city, enter a niche, and choose a radius from 1 to 10 km.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(screen.getByRole("heading", { name: "Loading Demo businesses…" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "[provider-error]" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "The Demo provider is unavailable" })).toBeInTheDocument();
  });
});

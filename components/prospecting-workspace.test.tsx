import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProspectingWorkspace } from "./prospecting-workspace";
import { resetStorageForTests, STORAGE_KEY } from "./prospecting-storage";

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
    expect(screen.getByTestId("demo-map")).toHaveAttribute("data-radius-km", "10");
    const markerStyles = screen.getAllByTestId("map-marker").map((marker) => `${marker.getAttribute("style")}`);
    expect(new Set(markerStyles).size).toBeGreaterThan(1);
    expect(screen.getByRole("link", { name: "Open map for Aurora Dental Studio" })).toHaveAttribute("href", "https://maps.google.com/?cid=demo:city:jundiai-1");
    fireEvent.click(screen.getAllByTestId("map-marker")[1]);
    expect(document.activeElement).toHaveAttribute("id", "candidate-demo:place:jundiai:02");
    fireEvent.click(screen.getByRole("heading", { name: "Aurora Dental Studio" }));
    await waitFor(() => expect(document.activeElement).toHaveAttribute("id", "marker-demo:place:jundiai:01"));
  });

  it("filters, sorts, paginates, and loads the next Demo page", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist" } });
    fireEvent.change(screen.getByLabelText("Radius"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Website" }), { target: { value: "not-listed" } });
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Website" })).toHaveValue("not-listed"));
    expect(screen.getAllByText("No website listed").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("combobox", { name: "Website" }), { target: { value: "all" } });
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Website" })).toHaveValue("all"));
    fireEvent.click(screen.getByRole("button", { name: "Load 10 more" }));
    await waitFor(() => expect(screen.getByText("20 loaded")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByText(/Page 2 of/)).toBeInTheDocument());
    expect(screen.getAllByTestId("map-marker").length).toBeLessThanOrEqual(10);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => expect(screen.getByText(/Page 1 of/)).toBeInTheDocument());
  });

  it("saves a lead once and associates it with repeated searches", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Save lead" })[0]);
    expect(await screen.findByText("Lead saved.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Leads" })).toHaveTextContent("1"));

    fireEvent.click(screen.getByRole("button", { name: "Leads" }));
    expect(screen.getByRole("heading", { name: "Aurora Dental Studio" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Change status for Aurora Dental Studio" }), { target: { value: "Contacted" } });
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").leads[0].status).toBe("Contacted"));
    expect(screen.getAllByText("Contacted").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Leads" }));
    fireEvent.click(screen.getByRole("button", { name: "Open lead" }));
    expect(screen.getByRole("heading", { name: "Outreach message" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Next follow-up"), { target: { value: "2026-09-10" } });
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").leads[0].followUpDate).toBe("2026-09-10"));
    fireEvent.change(screen.getByLabelText("Next follow-up"), { target: { value: "" } });
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").leads[0].followUpDate).toBeUndefined());
    fireEvent.change(screen.getByRole("textbox", { name: "Outreach message" }), { target: { value: "Hello Aurora" } });
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").leads[0].outreachMessage).toBe("Hello Aurora"));
    expect(screen.getByRole("link", { name: "Open WhatsApp" })).toHaveAttribute("href", expect.stringContaining("Hello%20Aurora"));
    fireEvent.click(screen.getByRole("button", { name: "Copy message" }));
    expect(await screen.findByText(/Copy unavailable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back to leads/ }));
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Saved" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Saved" })[0]);

    expect(screen.getByRole("heading", { name: "Saved searches" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Rename" })[0]);
    fireEvent.change(screen.getByRole("textbox", { name: "Search name" }), { target: { value: "Dentist discovery" } });
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").searches[0].name).toBe("Dentist discovery"));
    fireEvent.click(screen.getAllByRole("button", { name: "Reopen" })[0]);
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").leads[0].searchIds).toHaveLength(2));
    const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(persisted.leads).toHaveLength(1);
    expect(persisted.leads[0].searchIds).toHaveLength(2);
    expect(persisted.searches).toHaveLength(1);
  });

  it("shows status persistence errors in the lead detail", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Save lead" })[0]);
    expect(await screen.findByText("Lead saved.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Leads" }));
    fireEvent.click(screen.getByRole("button", { name: "Open lead" }));

    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage full"); });
    try {
      fireEvent.change(screen.getByRole("combobox", { name: "Change status for Aurora Dental Studio" }), { target: { value: "Contacted" } });
       expect(await screen.findByText("Could not save this status change. The lead stayed in its previous stage.")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Change status for Aurora Dental Studio" })).toHaveValue("New");
    } finally {
      setItem.mockRestore();
    }

    const followUpSetItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage full"); });
    try {
      fireEvent.change(screen.getByLabelText("Next follow-up"), { target: { value: "2026-09-10" } });
      await waitFor(() => expect(screen.getAllByRole("alert").some((alert) => alert.textContent?.includes("Could not save this follow-up date"))).toBe(true));
      expect(screen.getByLabelText("Next follow-up")).toHaveValue("");
    } finally {
      followUpSetItem.mockRestore();
    }
  });

  it("shows a load-more provider error while keeping loaded results", async () => {
    render(<ProspectingWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "jundiai" } });
    fireEvent.change(screen.getByLabelText("Business niche"), { target: { value: "dentist [provider-error-more]" } });
    fireEvent.change(screen.getByLabelText("Radius"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Search businesses" }));
    expect(await screen.findByRole("heading", { name: "Demo businesses" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Load 10 more" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The next Demo page failed to load");
    expect(screen.getByText("10 loaded")).toBeInTheDocument();
    expect(screen.getAllByTestId("map-marker")).toHaveLength(10);
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

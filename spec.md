# Global Business Prospecting Portal

Status: ready-for-implementation

## MVP Definition

The first release is a local, single-user prospecting workspace for independent professionals and small businesses that sell services to other local businesses. Its primary job is to organize prospecting from discovery through outreach and follow-up until a lead is won or rejected.

The product is English-first and designed so that its search model can work globally. Initial validation happens locally, without authentication, deployment infrastructure, or mandatory paid services.

The first validation target is that one user can find 50 useful candidates, contact 20 of them, and create at least 2 sales conversations within 14 days.

The first complete journey is:

1. Select a city, enter a niche, and choose a radius.
2. Search and review synchronized map and list results.
3. Filter candidates and save selected businesses as leads.
4. Prepare and copy an outreach message or open WhatsApp.
5. Move saved leads through the pipeline and schedule follow-up.

## Problem Statement

People who prospect for their own service business need a fast way to find businesses in a specific area, understand their online presence, contact them, and track the outcome. Today this work requires switching between maps, search results, spreadsheets, WhatsApp, and notes.

The user wants an English-first global portal where they choose a city, business niche, and a radius from 1 km to 10 km. The portal should show matching businesses on a map and in a list, including available contact and online-presence information. It must not be limited to businesses without a website: website, image, and other information must be visible and filterable. The user must be able to prepare an outreach message, open WhatsApp when available, and manage each saved lead in a sales pipeline.

## Solution

Build a responsive local prospecting workspace with two provider modes:

- `Demo`: the default zero-cost mode, using deterministic sample businesses and a simulated map. It requires no API key or external infrastructure.
- `Google`: an optional live mode, enabled only when the user configures Google Maps Platform credentials. It uses authorized Google services for city resolution, map display, and business discovery.

A user selects a city, enters a free-text niche, chooses a radius, and runs a search. Results appear as a radius circle, map markers, and a synchronized paginated lead list.

Every result shows the information available from its provider: business name, category, address, phone number, website status and link, image availability, map link, and source attribution. Filters let the user include all loaded businesses or narrow results by website, image, or phone availability. A candidate becomes a pipeline lead only after the user explicitly saves it. A lead detail view prepares a personalized outreach message, while a Kanban-style pipeline tracks status, notes, and follow-up date.

## User Stories

1. As a prospecting user, I want to use the portal in English, so that I can use the same interface globally.
2. As a prospecting user, I want to enter and select a city, so that the search starts in the correct place.
3. As a prospecting user, I want the selected city to resolve to a named country and geographic center, so that the search area is unambiguous.
4. As a prospecting user, I want to enter any business niche in any language, so that I can search the market I serve.
5. As a prospecting user, I want previously used niche terms to be suggested, so that repeated searches are faster.
6. As a prospecting user, I want to choose an integer radius from 1 km through 10 km, so that I can control how local the results are.
7. As a prospecting user, I want to see the chosen radius as a circle on the map, so that I understand the coverage area.
8. As a prospecting user, I want businesses outside the exact selected radius excluded, so that the radius is trustworthy.
9. As a prospecting user, I want to run a search for businesses matching the city, niche, and radius, so that I can find prospects.
10. As a prospecting user, I want results shown in pages of 10, so that the interface remains responsive.
11. As a prospecting user, I want to load 10 more provider results at a time, so that I control additional requests.
12. As a prospecting user, I want to know how many results have been loaded, so that I understand the scope of filters and counts.
13. As a prospecting user, I want to see every loaded matching business by default, so that businesses with websites or images are not silently excluded.
14. As a prospecting user, I want to filter results by website, photo, and phone availability, individually or in combination.
15. As a prospecting user, I want the wording `No website listed`, rather than a claim that a business has no website, so that missing provider data stays honest.
16. As a prospecting user, I want map markers and the current result page to represent the same 10 businesses, so that I can trust the interface.
17. As a prospecting user, I want to click a marker and see the business summary.
18. As a prospecting user, I want to click a result card and focus its marker.
19. As a prospecting user, I want to see the available name, category, address, phone, website, photo status, provider link, and source attribution for a business.
20. As a prospecting user, I want clear missing-data labels, so that unavailable data is not mistaken for verified absence.
21. As a prospecting user, I want to sort results by provider relevance, distance, or business name.
22. As a prospecting user, I want provider relevance identified honestly, without presenting it as an application-generated lead score.
23. As a prospecting user, I want to save a selected candidate as a lead, so that the pipeline contains only businesses I chose.
24. As a prospecting user, I want the same business merged when it appears in multiple searches, so that the pipeline has no duplicate lead.
25. As a prospecting user, I want to configure my name, business, offered service, and base message locally.
26. As a prospecting user, I want a ready-to-edit outreach message that uses available lead and profile data.
27. As a prospecting user, I want to copy the current outreach message and open WhatsApp with the phone number when available.
28. As a prospecting user, I want clear disabled actions when no usable phone exists.
29. As a prospecting user, I want to move a lead through `New`, `Contacted`, `Interested`, `Follow-up`, `Won`, and `Not interested`.
30. As a prospecting user, I want to move pipeline cards by dragging or by using an accessible status selector.
31. As a prospecting user, I want to record an optional next follow-up date.
32. As a prospecting user, I want to see overdue, today, and upcoming follow-ups in the local dashboard.
33. As a prospecting user, I want one free-text note per lead with automatic saving and a visible saved state.
34. As a prospecting user, I want a simple activity history for status and follow-up changes.
35. As a prospecting user, I want searches retained locally, with the ability to reopen, rename, and delete them.
36. As a prospecting user, I want saved leads, notes, messages, and pipeline state retained after the app restarts.
37. As a prospecting user, I want useful empty, loading, invalid-input, no-phone, and provider-error states.
38. As a prospecting user, I want the workspace to work well on desktop and small screens.

## Implementation Decisions

### Application shape

- The MVP runs locally for one user. Authentication, hosting, team permissions, billing, and cloud synchronization are not part of this release.
- Use Next.js with TypeScript for the interface and server boundary, plus a local SQLite database for user-owned persistence.
- Keep one project and one normal local start command. Do not require external infrastructure for Demo mode.
- The primary surface is one prospecting workspace with map, list, lead detail, and Kanban pipeline views.
- Labels, empty states, pipeline states, and the default outreach message are in English. Localization beyond English is not part of the first release.

### Provider modes

- Define a narrow provider boundary so deterministic Demo data and live Google data exercise the same application workflow.
- Demo mode is the default when Google credentials are absent. It includes businesses with and without phone, website, and photo data, plus points inside and outside the selected radius.
- Demo mode uses predefined cities and a simulated map. It does not pretend that its businesses are current real-world results.
- Google mode uses documented Google Maps Platform APIs and a Google Map. It does not scrape Google Search, Google Maps pages, social networks, or competitor databases.
- Google credentials remain server-side. Request validation, rate limiting, error translation, quotas, and cost protection happen at the application boundary.
- The Google integration requests only fields needed by the product. It must follow current storage, attribution, photo, display, and territory-specific rules.

### Search and results

- A search requires a selected city, free-text niche, and integer radius from 1 km through 10 km.
- Demo mode offers predefined cities. Google mode uses autocomplete and requires an explicit valid selection. A city stores display name, country, latitude, longitude, and provider identifier when present.
- Niche input accepts any language. Previously used values can be suggested without introducing a fixed category taxonomy.
- Provider results are candidates, not saved leads.
- Apply an exact geographic distance check in the application and exclude candidates outside the chosen circle.
- Request 10 results initially. An explicit `Load 10 more` action fetches the next provider page until no token remains or the provider limit is reached.
- Filters operate over all currently loaded candidates. The interface must display the loaded-result count and must not imply that it represents every business in the area.
- After filtering, paginate the candidate list in pages of 10. Map markers always show exactly the businesses on the current page.
- Sorting options are `Google relevance` or provider relevance, `Distance`, and `Business name`. Relevance preserves provider order and is never described as an application-generated score.
- Website status is `All`, `Website listed`, or `No website listed`. Photo and phone filters use equivalent three-state wording.
- Search results can be incomplete and can vary between identical searches. The interface discloses this limitation.

### Leads and pipeline

- Saving a candidate creates a lead in `New`. Search results are never bulk-saved automatically.
- Deduplicate provider-backed leads by stable provider identifier. The lead can retain links to multiple searches without duplicating user-owned state.
- Each lead has one status from `New`, `Contacted`, `Interested`, `Follow-up`, `Won`, and `Not interested`.
- Each lead supports an optional next follow-up date, one auto-saved free-text note, an editable outreach message, and timestamps.
- Record a simple user-owned activity history for status and follow-up changes.
- The dashboard groups due follow-ups as `Overdue`, `Today`, and `Upcoming`. Email, push, and background notifications are not part of the MVP.
- Status changes work through drag-and-drop and an accessible explicit selector.

### Outreach

- Local settings contain the user's name, business name, offered service, and base outreach message.
- The default English message uses available profile, lead, and selected niche data, with safe generic fallbacks.
- Message editing is local and deterministic. AI-generated outreach is not part of the MVP.
- Copy message is the primary action. WhatsApp is an optional convenience action when a usable international phone number exists.
- No automatic or bulk message sending is allowed.

### Persistence

- SQLite stores user-owned searches, provider identifiers, search-to-lead relationships, pipeline status, notes, follow-up dates, edited messages, settings, and activity timestamps.
- Searches retain city, niche, radius, filters, sort, execution time, loaded-result summary, and provider mode. They can be reopened, renamed, and deleted.
- Provider-derived Google fields are refreshed or displayed only as permitted by the current Google Maps Platform terms. The database must not treat a transient provider field as permanent user-owned data.

## Testing Decisions

- The main test seam is the prospecting workspace UI. Tests validate visible user behavior instead of map-library methods or internal component state.
- Start with deterministic Demo provider fixtures. Include leads with and without phone, website, and photo fields, duplicate provider identifiers, and locations inside and outside the selected radius.
- Test the complete journey: search, exact-radius filtering, synchronized map/list selection, save lead, compose message, WhatsApp availability, pipeline move, note persistence, and follow-up date.
- Test initial 10 results, loading the next 10, loaded-result disclosure, filtered pagination, and exactly 10 synchronized current-page markers.
- Test website, photo, and phone filters individually and in combination, including `No website listed` wording.
- Test relevance-order preservation plus distance and name sorting.
- Test deduplication across multiple searches while preserving existing notes and pipeline status.
- Test moving cards by drag-and-drop and by the accessible status selector.
- Test auto-saved notes, status activity, due-date grouping, reload persistence, and deletion of saved searches.
- Test empty, loading, malformed-input, provider-error, and no-phone states as visible outcomes.
- Add a small number of provider-boundary contract tests before enabling live Google mode.

## First Delivery Milestone

The first milestone is complete when a user can run the app locally without a Google key and complete this journey using Demo mode:

> Open the app, search for `dentist`, see 10 synchronized results, filter candidates, save one lead, edit and copy its message, open WhatsApp when available, move the lead to `Follow-up`, set a date, and find the same state after restarting the app.

## Out of Scope

- Public deployment and production hosting.
- Authentication, multi-user teams, permissions, billing, subscriptions, and cloud synchronization.
- Competitor research and monitoring as a separate workflow.
- Scraping Google Search, Google Maps pages, social networks, or another product's database.
- Guaranteeing that a business truly has no website.
- Automatic WhatsApp sending, bulk messaging, contact scraping, or bypassing messaging policies.
- CRM integrations and a public API.
- Full multilingual UI translation beyond English.
- Lead scoring, AI-generated outreach, AI-generated site audits, email enrichment, and automated website-quality verification.
- Email, push, and background follow-up notifications.
- Reproducing another product's visual identity, logo, copy, or proprietary dataset.

## Further Notes

- The visual design and product identity must be original.
- Existing Jundiai CSV files are reference lead material only. They are not the discovery engine for the global portal.
- Google Places API result sets can be incomplete and variable. Result limits and billing depend on requested fields and endpoints.
- Before live Google mode is released, review the current [Places API reference](https://developers.google.com/maps/documentation/places/web-service/reference/rest), [Text Search documentation](https://developers.google.com/maps/documentation/places/web-service/text-search), [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies), and [Google Maps Platform pricing](https://developers.google.com/maps/billing-and-pricing/pricing).

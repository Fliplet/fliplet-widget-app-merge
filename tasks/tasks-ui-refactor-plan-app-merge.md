# Tasks: App Merge UI Refactor & Completion

Generated from `ui-refactor-plan-app-merge.md`.

## 1. Foundation Stabilisation

- [ ] 1.1 Align `AppShell` tests with updated test IDs and progress selectors.
- [ ] 1.2 Audit `FlipletTableWrapper.vue` event payloads and extend helpers if required for expandable rows.
- [ ] 1.3 Extract shared selection diff utilities (if needed) for reuse across tab components.

## 2. Tab Rebuilds (Screens / Data Sources / Files)

- [x] 2.1 Rebuild `ScreensTab.vue` with `FlipletTableWrapper`, expandable associations, and aria labels.
- [x] 2.2 Update `ScreensTab.test.js` to validate table configuration, selection mapping, and nested association emits.
- [x] 2.3 Complete `DataSourcesTab.vue` Fliplet table integration, including copy-mode dropdown and association sync props.
- [x] 2.4 Extend `DataSourcesTab.test.js` for wrapper instantiation, copy-mode behaviour, and nested toggle events.
- [x] 2.5 Implement `FilesTab.vue` Fliplet table with folder options, preview handling, and nested association tables.
- [x] 2.6 Rewrite `FilesTab.test.js` to cover selection changes, folder option events, and association toggles.

## 3. MergeConfiguration Integration

- [x] 3.1 Pass `selectedScreens`, `selectedDataSources`, and `selectedFiles` props to tab components from `MergeConfiguration.vue`.
- [x] 3.2 Implement `handleAssociationToggle` and ensure `handleSelectionChange` clones arrays to avoid mutation.
- [x] 3.3 Update `MergeConfiguration.test.js` to cover new props, selection sync, and association events.

## 4. Destination Selector Modernisation

- [x] 4.1 Rebuild `DestinationSelector.vue` using `FlipletTableWrapper` with search, sort, and disabled row handling.
- [x] 4.2 Integrate `DataService` mock data flow and remove legacy timeouts.
- [x] 4.3 Refresh `DestinationSelector.test.js` with synchronous mocks and table interaction assertions.

## 5. Test Suite Restoration

- [x] 5.1 Stabilise page/component tests (e.g., `MergeDashboard`) using `flushPromises` patterns instead of timers.
- [x] 5.2 Review Jest configuration/timeouts and adjust if necessary.
- [x] 5.3 Ensure Fliplet table mocks are consistent across tests and cover emitted events.

## 6. Build Verification & Documentation

- [x] 6.1 Run `npm test` and resolve all failing suites.
- [x] 6.2 Run `npm run build` and address lint/style errors.
- [x] 6.3 Smoke-test UI in mock mode (tab navigation, nested selections, selection counts).
- [x] 6.4 Document verification steps and mock/middleware switching guidance in README or task notes.


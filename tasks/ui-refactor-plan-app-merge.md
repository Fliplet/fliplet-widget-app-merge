# App Merge UI Refactor & Completion Plan

This plan coordinates the remaining UI work for the App Merge widget so we can finish the Fliplet table integration, restore green tests, and align with the middleware architecture. It focuses on stabilising the refactor already in flight and delivering the full multi-step workflow described in the UI/UX plan.

---

## 1. Objectives

- **Stabilise the codebase**: Remove half-converted components, restore test coverage, and ensure `npm run build` passes.
- **Implement FlipletTableWrapper integration**: Rebuild Screens, Data Sources, Files tabs with the wrapper, expandable associations, and synced selections.
- **Complete Step 1–3 workflow**: Ensure Dashboard → Destination Selector → Merge Configuration flow is fully functional with real mock data.
- **Prepare for middleware hookup**: Maintain the DataService/mock infrastructure so the UI can switch to middleware as it lands.

---

## 2. Current Snapshot

| Area | State | Gaps |
| --- | --- | --- |
| `AppShell` | Title/progress test IDs out-of-sync | Update tests & template alignment ✅ (minor)
| `ScreensTab` | Legacy list view, tests fail | Needs full FlipletTableWrapper conversion & new tests
| `DataSourcesTab` | Partially converted; missing handler methods/tests | Finish wrapper flow & sync events
| `FilesTab` | Still legacy list; tests expect wrapper | Full rebuild required
| `MergeConfiguration` | No association syncing logic | Implement cross-tab sync + new emits
| `DestinationSelector` | Still legacy table; tests timeout | Rebuild with wrapper & modern search/filter
| Tests | Many timeouts/legacy expectations | Rewrite for new architecture

---

## 3. Workstreams & Tasks

### 3.1 Foundation Stabilisation
1. **AppShell parity**
   - Update component test IDs & classnames (already aligned) ✅
   - Adjust `AppShell.test.js` assertions to new IDs (pending)
2. **Shared utilities**
   - Confirm `FlipletTableWrapper.vue` supports `expand` event payload used in new tabs (adjust if required)
   - Add helper utilities (e.g. selection diffing) if reused across tabs

### 3.2 Tab Rebuilds (Screens / Data Sources / Files)
*Goal: Each tab uses FlipletTableWrapper, emits selection + association toggles, supports search/sort/pagination when middleware arrives.*

1. **ScreensTab.vue**
   - Replace legacy list with table columns (Name, ID, DS count, File count, Warning)
   - Implement `handleTableSelectionChange`, `handleExpand`, `handleNestedSelection`
   - Track association selections per-screen (local state + emit events)
   - Update computed properties (`screenRows`, `expandedScreens`)
   - Add accessibility (aria labels for counts, buttons)
2. **ScreensTab.test.js**
   - Mock Fliplet wrapper: assert options, selection mapping, expand handling
   - Test association emits when nested tables fire selection change
   - Cover loading/error/empty states

3. **DataSourcesTab.vue**
   - Finalise table configuration + nested tables for screens/files
   - Implement copy-mode dropdown inside table (may use custom column render or overlay element)
   - Sync `selectedScreens` / `selectedFiles` props into nested tables
   - Emit `toggle:screen`/`toggle:file` events when nested selection changes
4. **DataSourcesTab.test.js**
   - Assert wrapper instantiation + copy-mode behaviour
   - Validate selection change & nested emits
   - Cover global dependency indicator

5. **FilesTab.vue**
   - Introduce table columns (Name, Path, Type, Added, Status)
   - Support folder option dropdown per row + nested tables for screens/data sources
   - Manage `selectedScreens`/`selectedDataSources` props and emits
   - Ensure preview images render via inline element (outside wrapper when necessary)
6. **FilesTab.test.js**
   - Similar coverage to other tabs; test folder option change & nested selection events

### 3.3 MergeConfiguration Vue Integration
1. Extend component props passed to tabs (`selectedScreens`, `selectedDataSources`, `selectedFiles`)
2. Implement `handleAssociationToggle(collection, payload)` to keep `selections` object in sync
3. Ensure `handleSelectionChange` clones arrays to avoid mutation side-effects
4. Update `totalSelectedItems` calculation to include deduplicated association arrays if desired (decide if association counts should be reflected)
5. Adjust tests (`MergeConfiguration.test.js`) to account for new props and event wiring

### 3.4 DestinationSelector Modernisation
1. Rebuild UI using FlipletTableWrapper
   - Columns: Name, ID, Modified, Status badge
   - Search input bound to table search API
   - Row selection via wrapper `row-click` + `selection:change`
   - Disabled rows for locked/source apps (apply classes + skip selection)
2. Integrate DataService for mock data
3. Update tests to remove `setTimeout` dependency; stub DataService promises directly

### 3.5 Test Suite Restoration
1. Update `jest` configs/timeouts if necessary (avoid per-test 5000ms default by awaiting stable promises)
2. Rewrite failing page tests (Dashboard, DestinationSelector) using synchronous mock data & `await flushPromises()` pattern
3. Ensure all new table interactions are covered with mock wrappers
4. Run `npx jest --runInBand` to stabilise after each chunk

### 3.6 Build & QA
1. `npm run build` to confirm ESLint/Tailwind compilation passes
2. Smoke-test UI in browser using mock mode (flip through tabs, expand rows, verify selection counts)
3. Document verification steps in README or task notes

---

## 4. Risk & Mitigation

| Risk | Mitigation |
| --- | --- |
| Fliplet tables lack nested template API | Use wrapper event-only approach (emit toggle events for associations) and fall back to simple lists if necessary |
| Complex selection syncing causes regressions | Centralise diffing logic (e.g. helper to compute added/removed IDs) + add unit tests |
| Mock & middleware responses diverge | Keep DataService abstraction; mirror middleware response shape in fixtures |
| Test timeouts from async mocks | Replace `setTimeout` based mocks with direct resolved promises and `flushPromises()` |

---

## 5. Deliverables

- Updated tab components with Fliplet table integration
- Passing Jest suite (`npm test`)
- Passing build (`npm run build`)
- Mock scenarios updated to reflect new data shape
- Documentation note in README (or dedicated doc) on using mock/middleware modes

---

## 6. Next Steps Checklist

1. ✅ Align AppShell template/test selectors
2. ☐ Rebuild ScreensTab + tests
3. ☐ Finish DataSourcesTab conversion + tests
4. ☐ Rebuild FilesTab + tests
5. ☐ Implement association syncing in MergeConfiguration + update tests
6. ☐ Modernise DestinationSelector with wrapper + tests
7. ☐ Restore remaining page tests (Dashboard etc.)
8. ☐ Run full Jest & build, resolve any lint warnings
9. ☐ Document verification steps / mock usage in README

---

Use this plan as the living checklist while executing the refactor. Update the corresponding task files in `tasks/` as milestones are completed.


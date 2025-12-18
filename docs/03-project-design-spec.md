# App Merge User Flow - Design Specification

This document describes the complete App Merge design specification including UI flows, backend processes, Studio integration, global code versioning, and all system components.

## States

1. User selects "Merge" option from the app card's "More" dropdown.
2. Overlay to select the destination app.
3. User redirected to “Merge” overlay. User selecting items to be merged.
4. User selected items and clicked “Review & Merge”. User redirected to “Review and Merge” screen.
5. User clicks “Merge”. User redirected to “Merge” screen.
6. User clicks “Open app” and redirected to the merged app.

## 1\. User selects "Merge" option from the app card's "More" dropdown.

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| “Merge app with…” option in a dropdown app settings list | Click on this option | Access this feature If user or organization doesn't have permission to merge |

## 2\. Overlay with “Merge Dashboard”

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Description text that will educate user what should be done before starting app merge: check for name duplicates, rename items to match name in order to be overwritten, warn that app merge configuration can not be saved. Show current state of selected (source) app: Name ID Org Region Published/Not Published Last modified (timestamp) Last modified by (user) Show instructions on what should be done next to merge app. Link to open audit log  **CTA**: Configure merge  | Click “Merge configuration” to start configuring app merge Close this overlay Open audit log   |  |

## 3\. **Step 1:** Select the destination app.

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| User now see 3 steps, (indicating that user is on the first one): Select destination app Select items to merge Review merge summary Information that progress can not be saved on these steps until merge is initiated. Notify user that any users of the source & destination app in Studio will be unable to work on the app until the merge is complete | Proceed to the next step when first is completed.  Can go back to the dashboard Close this overlay  | Save progress |
| **Title** of the action “Select destination app” **Description** on what actions are required and what will happen next. Warn user that selected apps will be blocked for editing after proceeding to the next step, those apps also will not receive any updates until the merge is completed.   |   |  |
| **Organisation selection** (by default should be selected the same one). Inside the list user will see available list of organisations (Title, ID, region) that can be used for merge feature | Select other available organisation.  User can start typing and relevant organisation should appear at the top of the list.  | If user, organization or app doesn't have permission to merge it won’t appear in the list.  Organisation dropdown should be hidden if user belongs only to one organisation |
| **App list associated with selected organization**  List of apps that will include: App name, App ID, last modified, “live” tag.  Search, sort  | Select  available app.  Search, sort by last edited   |  |
| **CTA: Next**, Cancel, close overlay |  |  |

## 4\. **Step 2:** Merge Settings. User selecting items to be merged.

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| App name that is merging and destination app.(with a clear direction UI) Text that describes what actions should be done on this screen Warning that apps are blocked from changes. | Close overlay | Save changes before they complete or cancel a merge Make changes to app after it’s selected. Another merge request can not be  initiated for both apps during an ongoing merge. |
| **Tabs**: Screens, Data Sources, Files, Settings & Global Code  **Table functionality(screens, DS, files):** SearchColumn headers (name & last edited): Up/down sort arrows to toggle those sorts, syncing with the dropdown.  **CTA: Review merge settings Number of selected items** | Switch between tabs and table or information below will change depending on tab, search and relevant info will be shown, unselect items, review number of selected items,  proceed to the next step. |  |
| **Screens tab** Instructions about merging this particular type of item (e.g. match data source name to overwrite ) Table that consist of columns:  Screen name (sort, select all, number of screes selected) screen ID  Preview screen last modified timestamp (sort) Associated data sources Associated files See \# of selected screens Instructions about version control | Select/deselect all screens at once, one by one,  Search, Sort, Filter review list of associated assets (data sources, files) for a particular screen. See if these assts selelcted or not.  | ~~Select screens that can not be copied (e.g. sso login)~~ User is unable to rename screens User is unable to copy component settings that use private configuration. (Component will be copied, but should be adjusted again) |
| **Data Sources tab** Instructions about merging this particular type of item (e.g. match data source name to overwrite) Table that consists of columns:  DS name (sort, select all) DS ID  last modified timestamp (sort) Data structure only (select all) \# of Associated screens  \# of Associated files  Global dependency (yes/no) See \# of selected DS See \# of entries (in each DS) Instructions about version control | Select/deselect all DS at once,one by one   Search, Sort, Filter,  review list of associated assets (screens, files) for a particular DS. See if these assets selected or not.  Select data structure only (all or one by one)  | User is unable to rename data sources |
| **Files tab** Instructions about merging this particular type of item (e.g. match file names to overwrite) Table that consist of columns: File name folder path (sort) File type (sort) Added timestamp (sort) File ID Preview icon See \# of selected files Associated screens Associated DS Global library (as a type of file) | Select/deselect all at once, one by one  Search, Sort, Filter  review list of associated assets (screens, DS) for a particular File. See if these assets selected or not.  | User is unable to rename files |
| **App-level configuration** Instructions about merging settings Checkbox to overwrite app settings (list of settings that will be applied) Checkbox to overwrite menu settings (list of settings that will be applied) Checkbox to overwrite global appearance settings (list of settings that will be applied) Checkbox to overwrite global code (list of settings that will be applied) Instructions and info about version control | Select/deselect options |  |

## 5\. **Step 3:** “Review merge settings”. User reviewing merge settings summary

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Instructions about what should be done on this screen, how much time merge will take Table of all items that will be merged, highlighted what will be overwritten, what will be copied, and what have conflicts (title duplicates) Warnings (automated rollback is unavailable, DS will go live, after merge is started user can’t cancel it) Instructions on how to review summary **CTA: Start merge, Edit merge settings**  | Click “Merge” to start merge process Click “Edit” to go back and make changes Close an overlay. After clicking on “X” user should be warned that nothing will be saved. | Save progress If name duplicates appear in selected items, unable to start merge. |
| Table with a list of previously selected items that will be merged. List of items that will be overwritten, copied, or have conflicts will be highlighted in color:  List of screens (name, ID, total \#) List of DS (name, ID, total \#, \# of entries for each DS, if structure only show instead of \# of entries)  List of files (name, ID, total \#) Settings & Global code (list of selected items) | Review list | Rename items, search, sort, filter, deselect. |
|  |  |  |
|   |  |  |

## 6\. Merging process initiated, completed.

After user initiated merge process, user redirected back to the merge dashboard screen.

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Instructions about what is happening, what user can / can not do. Instructions what to do after merge (appears after merge is completed) | User can close overlay. User can open Merge dashboard.  | open merging apps during the merge process. stop/cancel the merge process |
| **During merge:** Progress bar with estimated time, list of merging process status messages (The frontend must show real-time merge progress updates to users, including the type of item being merged and success/failure messages.), Error messages encountered are reported immediately System will provide actions that can be done (e.g. try again, skip) | Make a decision on what should be done with errors.  Close/open overlay |  |
| **After merge is completed:** Show a list of completed actions: \#  of screens merged \#  of DS merged \#  of Files merged List of settings/Global code applied Highlight list of conflicts / errors  If the merge causes plan or pricing limits to be exceeded (e.g. file count, storage, data rows), The UI must clearly display this information to the user so they can take action before proceeding further. **CTA** open app List of previous merges (if any) Link to review the detailed audit log list  | Open merged app Open app audit log Close overlay |  |

##  7\. User clicks “Open app” and redirected to the merged app.

If app belongs to another organisation \- switch user organisation automatically and open app

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| App with all merged/copied screens, DS, files & settings | Roll back (screens, DS, global code using) version control, review, publish merged app, review merge audit log in the app audit log section. |  |

## 8\. User closes merge overlay during app merge in progress.

After initiating app merge user can close merge overlay. User should be notified after merge is completed. To navigate back to merge process user needs to click “Merge” in the app “More” dropdown

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| If app merge in progress / completed: State \#6: Merging process initiated, completed |  |  |

---

# Additional required design changes

## Global code version control

1. Ability to review version history and optionally roll back global code using version control. (similar to DS version control)

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| In Global code tab: **CTA**: See Version history | Click to open version history overlay |  |
| Global code version history overlay: Summary of all versions stored for the last 30 versions: Version number Timestamp Current version tag Description Modified by Data sources included Libraries included **CTA**: Actions (Preview, Restore) | Preview version: This will open a new window with global code (formatted as code). review list of DS ad libraries included Restore version: user can click “Restore” and will be asked to confirm action. Confirm or cancel action Restore previous version (before clicking restore) | Edit code, data sources or libraries. After restoring version of the global code user is unable to undo action. |

## App list

1. Add option “Merge” in app card in order to set up app merge

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| List of apps \- “More” dropdown: **CTA**: Merge with app… | Click on this action | To see this option if app/org/user permissions are not allowed to run merge |

## Audit log

1. Update current audit log to include merge audit log

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Merge audit log in the list of other logs, which will include: Date Category Log type App User Session id Data | Review audit log information, user sorting, filtering and export feature | Review app merge logs for more than a previous year |

Below is an example of merge audit log information

| Date | Category | Log type | App | User | Session ID | Data |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Organization admin settings

1. Ability to restrict which Organisations receive merges

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| In manage organization section \- Security tab: A setting that will restrict apps within this organization to be available for app merge | Turn on/off this feature | Select specific apps to be restricted |



## App UI (during the merge)

1. Both apps should not be available during the merge process and should be blocked from studio user to make any changes.

### User has an opened app in browser (merging or destination one):

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Overlay with information about ongoing merge. That app is not available to be edited during this process.  | User can close this overlay and he will be automatically redirected to studio home screen | User can’t make any changes to the app during the merge. |

###  User is trying to select app from a list of apps (in studio home screen)

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Label on the app card that indicates ongoing merge. Disabled action links | User can read information on the card User can proceed to  “app merge” from the list of actions  | click on links on the app card. Color will indicate that they disabled |

2. If user is trying to initiate another merge during ongoing merge

### User is trying to select app from the destination app list

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
|  App in the list with indicator about ongoing merge | User can see the app in the list  | unable to select this app as a destination app for merge.  |

3. ### If user is trying to edit data sources or files that belong to merging apps

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Data source or file in the list with indicator about ongoing merge | User can see Data source or file in the list | User is unable to click on data source or file in the list, or open “actions” dropdown. Text color indicates that DS or File can’t be selected. |

4. ### App maintenance mode

| What users see: | What can do: | What users are restricted from or unable to do |
| :---- | :---- | :---- |
| Description on what is it and how it works Toggle to turn on / off maintenance mode Save button (saving in progress, saved success state) | Chage maintenance mode Apply changes by saving them | See this section if they don’t have app publisher permission |

   1. During the merge process, maintenance mode is also enabled on the destination app to prevent live apps from downloading updates during the merge. Maintenance mode ensures that users do not receive partial or unstable updates while the merge is in progress. App Publishers will be able to view the current maintenance mode status and toggle it ON or OFF as needed via the Studio UI.

## Needs Clarification

| Scenario/Question | Clarification Needed | Decision |
| :---- | :---- | :---- |
| User leaves the flow during the "merge" state. | Can progress be saved or will the user need to start over? How can user open merge UI? What happens if user loses internet connection? | Merge progress can not be saved utill user initiated merge. If user left merge process, apps should become available for editing again. If user lost interet connection before initiating a merge process \- progress will be lost and user needs to start over. If user initiated the process ad connevtion was lost, Fliplet should complete merge process ad user can review merge result after. |
| Can org admins manage who can initiate app merge? | Do we need a separate UI for Organization Admins to manage merge permissions between Organizations, or should this be embedded in the merge setup process? | Merge permission should be set up on the organization level by admin for all apps.  |
| Checkbox to overwrite appearance settings  | Will this overwrite global appearance settings and component settings? | Only global appearance settings |
| how much time merge will take | Can we calculate and provide a real remaining time left for merging? | We will show a step by step status and tell that it will take no longer then 5 min |
|  if user selected a screen \- will it automatically include DS and files that are associated with it or not?  | How would user know if he selected associated ds with screen/files | Suggested solution: **By default**: **All screens, DS, Files, Settings** are selected. User can “ucheck” all in each separate tab. If you **uncheck a screen, file, DS**, its dependencies remain included (so you don’t accidentally drop a DS that you actually wanted), but the summary will highlight that standalone DS/files are still slated to merge. Indicate in UI which “associated items” are loincluded  |
| The frontend must show real-time merge progress updates to users, including the type of item being merged and success/failure messages. | List of items (or this will be only Screens, DS, files, setting)?  |  |
| System will provide actions that can be done (e.g. try again, skip)  | List of actions that system will provide |  |
| Copy libraries as a part of file selection | What information can we show to the user? (Name, ID, Created, Type, Size, Associated screens, Associated DS \- these are columns in file tabel) |  |

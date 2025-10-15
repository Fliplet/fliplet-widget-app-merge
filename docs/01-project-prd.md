# App Merge Product Requirements Document (PRD)

> **Full Project Scope:** This document describes the complete App Merge project requirements including backend APIs, version control, Studio integration, permissions, and all system components.
>
> **Looking for the Widget/UI scope?** See [02-widget-prd.md](./02-widget-prd.md) for the product requirements specific to the App Merge UI widget that lives in this directory.

## Executive Summary

1. Project Overview
   1. The app merge feature will enable Fliplet Studio users to merge apps within their Organisation or across Organisations.
   2. This includes the ability to consolidate app components, data, and configurations into a single unified app.
   3. The feature automates merge tasks, reducing manual effort and errors.
2. Primary Goals and Objectives
   1. To enable the merging of apps safely and efficiently.
   2. While Fliplet already has version control, this feature will make version control more efficient by delivering merge-specific capabilities.
   3. To avoid manual merge tasks and ensure customers can review historic merges and undo specific aspects if needed.
2. Expected Business Impacts
   1. Streamlined workflows for advanced Fliplet Studio users, reducing time and complexity associated with manual app merges.
   2. Improved customer satisfaction by leveraging existing version control in a more efficient manner, making merges more transparent and reversible.
   3. Facilitates the use of multiple Fliplet Organisations for different purposes (e.g., development, staging, production), reducing time spent managing app versions across environments.
   4. By simplifying merge processes, Fliplet adoption can expand more confidently and efficiently, as teams can manage versions across environments with minimal friction.

## Project Background

1. Product Brief
   1. Overview:
      1. This feature aims to streamline the merging of apps between different Fliplet Organisations, reducing manual work and leveraging existing version control in a more powerful way.
   2. Target Use Cases:
      1. Merging multiple apps within the same Organisation.
      2. Merging apps across different Organisations (e.g., dev, staging, production).
      3. Reviewing and undoing specific merge changes (via version control)
      4. The merge process should take in under 5 minutes even for large apps.
   3. Target Audience:
      1. Fliplet Studio users responsible for maintaining multiple app versions.
      2. Organisation Admins or product teams who maintain multiple environments.
   4. Success Metrics:
      1. Merge completion time under 5 minutes.
      2. Reduction of manual merge tasks and related support tickets.
   5. Business Impacts:
      1. Shortened development cycles due to faster merges across environments.
      2. More seamless collaboration for Organisations managing multiple app versions.
      3. Potentially increased Fliplet adoption among larger enterprises needing complex environment management.

## Appendices and Glossary

1. Glossary
   1. Live App – A published version of an app accessible to end users.
   2. Test App – An app version under development or in staging, not yet published.
   3. Fliplet Components – The building blocks used to assemble apps in Fliplet Studio, including UI elements and functional modules.
   4. Merge Logs – Records of all actions taken during the merge process, including changes and any errors encountered.
   5. Version Control – The system that tracks changes and allows rollback of app components, screens, and data sources.
   6. Global Code Version Control – Stores previous versions of the app’s global code (including library and data source references). Enables users to manually inspect and roll back to earlier versions after a merge.
2. Additional Diagrams or References
   1. Include any supplementary visual aids such as sequence diagrams, flow charts, or reference documents that support the technical specifications or process flows outlined in the PRD.
   2. Diagrams should clearly illustrate the merge process, integration points between components, and error-handling workflows.

## Requirements

### Product Specifications

#### Scope

1. This feature will provide the ability to merge apps, screens, data sources, and related configurations between environments (e.g., development, staging, production).
2. The term ‘merge’ refers to the destination app having the source app merged with it, not necessarily the individual assets being merged e.g. screens, data sources, etc. The merge will be a combination or injecting new versions or merging. For each resource type the merge feature will work like this:
   1. Screen configuration data will replace the destination screen configuration data as a new version into destination screens. If the screen doesn’t exist it will be created. Settings for some components will not be copied due to their incompatibility outside of their original app or the sensitivity of data e.g. SAML2 Login.
   2. Data source data and settings will replace the destination data source data and settings. Data will be inserted as a new version, there is no version control for data sources settings. If the data source doesn’t exist it will be created.
   3. App settings, menus and appearance settings will be replaced. There is no version control for these features.
   4. Global code from the source app will overwrite the destination app’s global code. A version history will be created to allow users to review and manually roll back the changes if needed. Version control will be added to global code, including global dependencies for libraries and data sources.
3. Users will be able to select which **files**, **data sources**, and whether to include **app-level configurations** in the merge.
4. App-level configurations include:
   1. App settings
   2. Menu settings
   3. Global appearance settings
   4. Global code customisations
5. The solution will integrate with existing Fliplet version control, allowing users to review changes, track logs, and manually roll back components (screens, data sources, global code, etc.).
6. The merge functionality will include both cross-Organisation and intra-Organisation merges, as indicated by user stories referencing dev/staging/production environments.

#### Out of Scope

1. Full Automatic Rollback – The system will not provide a one-click rollback of the entire merge. Users must manually revert changes using version history and re-linking steps.
2. Advanced Code Merge Control – Sophisticated Git-like code merge tools may not be fully implemented in this release.
3. Cross-App Data or Schema Transformations – Any significant data transformations beyond structure-and-content copying (e.g., mapping new fields or converting data types) are not within scope.
4. Permissions Revamp – Existing permission models will be leveraged rather than building a new permissions system.

#### User Roles and Permissions

1. Existing roles (e.g., App Publisher, Organisation Admin, Organisation User) will be leveraged.
2. Only users with App Publisher rights can perform merges.
3. To merge apps across Organisations, the user must be an App Publisher in both the source and the destination app.
4. Additional controls will exist at the Organisation level to specify which Organisations can receive merged apps (no domain whitelist functionality will be added in this feature).

#### Permission Matrix

1. Organisation Admin
   1. Can configure which Organisations can receive merges.
      2. Can invite users and manage security settings (such as SSO).
   2. App Publisher
      1. Can initiate merges, select items for merging (screens, data sources, global code), and finalize merges.
      2. Can see and manage merge logs, though not necessarily with full Organisation-level settings access.
      3. Must have App Publisher rights on both source and destination apps to merge across Organisations.
   2. Other Organisation Users
      1. Can view or edit the app depending on existing permissions but cannot perform merges to other Organisations unless they also have App Publisher rights.
   2. Support (internal Fliplet role)
      1. Can provide guidance and support for merges but does not initiate merges unless granted App Publisher rights on the customer’s Organisation.

#### Functional Requirements

1. General
   1. Users can migrate apps, screens, dependent files, and data between environments without accidentally moving sensitive items or breaking existing functionality.
   2. Users can merge content from any environment to any other environment, including dev, staging, and production.
   3. Users can copy new features, bug fixes, or enhancements to a live version of an application.
   4. Users can optionally merge global code and appearance settings. Global code from the source app will overwrite the destination app’s global code, and a new version will be saved to allow users to review or roll back the changes.
   5. Users can optionally copy the app settings to the destination app but all of the app settings are copied excluding anything that must be unique for the app and therefore copying would break the destination app
   6. Users can manually roll back changes if issues arise. The merge UI must inform users that complete automated rollback is not available, but version history and manual re-linking steps are provided.
   7. If the merge causes plan or pricing limits to be exceeded (e.g. file count, storage, data rows), the API must include details of these limits in the merge result response. The UI must clearly display this information to the user so they can take action before proceeding further. This ensures that potential issues are flagged immediately.
   8. The frontend must show real-time merge progress updates to users, including the type of item being merged and success/failure messages. This is essential to help users understand the live impact of certain changes and allow post-merge validation.
   9. The system must validate that both the source and destination apps do not contain duplicate screen names or data source names. If duplicates are found in the destinationeither app, the user should not be able to select the app as a destination app with a clear error message that identifies the problematic items. The frontend must prompt the user to rename items before retrying the merge to ensure deterministic behaviour.
   10. Merge configurations are temporary and will not be saved. If a user leaves the merge configuration interface before completing the merge, they will need to start over from the beginning.
2. Permissions
   1. Only users with app publishing rights on an app can initiate an app merge from the app.
   2. Only apps that a user has app publishing rights to can receive an app merge.
   3. An app cannot be merged with itself.
   4. Users can restrict which Organisations receive merges from other organisations, protecting app security.
   5. Organisation Admins manage Organisation membership and security via SSO or existing methods.
3. Screens
   1. Screen components, code, library dependencies, appearance settings, and widgets are migrated to the destination screen.
   2. Associated files and data sources will be displayed in the UI, and users will have the option to select/unselect them for copying to the destination app for use by this screen. Note, files and data sources can be associated with multiple screens so it’s important users are aware which screens use a file or data source before copying the file or data source to the destination.
   3. Some widgets (e.g. [SSO widget](https://github.com/Fliplet/fliplet-widget-sso-saml2/blob/a8f0a7ea1fb8617d6a5f38694d34b273ecef0f45/widget.json#L12)) may not have their settings copied if they are considered sensitive or require reconfiguration for each app. See [App settings review](https://docs.google.com/spreadsheets/d/1zVUV33nW5v30lqhgpaAIblD30vs-DZik6LhOepDw8UE/edit?gid=1326083523#gid=1326083523) \> **App-specific widget** settings for more.
   4. Changes to screens after the merge can be rolled back using the screen version feature, which also allows users to preview old versions before restoring them.
   5. Users can preview screen versions before restoring or copying them with security disabled.
   6. A new screen version is created upon merge, enabling rollback or copy actions from the screen’s version history.
4. Data Sources (DS)
   1. ~~Data source data, columns, settings, and security rules are replaced in the destination DS.~~
      1. *We don’t actually always want everything mentioned above replaced*
   2. Data sources are matched strictly by name. A source data source will be merged with a destination data source only if the names match exactly.
   3. Data source settings, properties and security rules are managed as described below
      1. The `guid` definition will be replaced in the destination data source
      2. Data source hooks have associated widget instance IDs that created the hook. If the associated widget instance is copied as part of the merge, then the associated hook should be copied and appended to the destination data source hooks.
      3. Security rules from the source data source should be copied and appended to the list of destination security rules.
   4. Users will be able to see which screens each DS is associated with. Note, data source can be associated with multiple screens so it’s important users are aware which screens use a data source before copying the data source to the destination
   5. Files referenced by the data source can optionally be copied to the destination app by detecting all Media API references found in the data source entries across all columns.
   6. Users can review the data source version at the destination to see what changes have been made before restoring or copying it.
   7. A new data source version is created upon merge, enabling rollback or copy actions.
   8. Merging DS changes goes live immediately, so the UI must warn users of potential disruption.
   9. If the selected data source is listed in the global data source dependencies, it should be added to the destination app data source dependencies
   10. Only standard data sources (without any data source type) are selectable
   11. Users can choose to copy either just the DS structure (column headings only, without any data) or both the structure and the data to avoid copying sensitive production data to test environments.
   12. Users can choose between two modes when copying a data source:
       1. **Overwrite structure and data**: Replaces both the data entries and columns in the destination data source with the source version.
       2. **Copy structure only**: Adds any new columns from the source data source to the destination without deleting existing columns. Data rows from both data sources will not be affected.
   13. The merge UI must use clear, unambiguous labels for each mode mentioned above and provide a tooltip or description to explain the difference.
5. Files
   1. Users can copy files, folders and global library dependencies to the destination app
   2. If a file/folder from the source app has the same name as a file/folder in the destination app, the destination file/folder will be renamed using a timestamp before it is replaced. For example, **logo.png** might become **logo (replaced on 2025-04-14T07:40:04-05:00).png**. This allows users to retain access to the original file without overwriting it. Renamed files must be visible in the File Manager, and users should be able to refer to merge logs to understand when and why the replacement occurred.
   3. Users can choose between two modes when copying a folder
      1. **Copy folder only**: Copies the folder without copying the files within
         1. Useful for Form component references for file/image fields
      2. **Copy folder and files**: Copies the folder and all the content including subfolders
         1. Useful for LFD references
   4. If a selected file or global library dependency isn’t found in the destination app library dependencies list, it will be added to the destination app library dependencies
6. App-level configurations
   1. App settings. See [App settings review](https://docs.google.com/spreadsheets/d/1zVUV33nW5v30lqhgpaAIblD30vs-DZik6LhOepDw8UE/edit?gid=0#gid=0) for which settings to copy. If enabled all the settings deemed valuable to the merge will be copied to replace the destination app settings.
   2. Menu settings: If selected, the menu type and selected menu list will be copied to replace the destination app menu type and menu list.
   3. Global appearance settings. If selected, all the global appearance settings will be copied to replace the destination app global appearance settings. This includes all the associated media files if they are referenced. Appearance settings for individual widget instances will be ignored.
   4. Global code customisations. If selected, the following will be processed accordingly
      1. Global CSS: All code will be copied to replace the destination app global CSS
      2. Global JS: All code will be copied to replace the destination app global JS
7. Logs
   1. Users can view an audit trail of code changes, merges, and configuration modifications for each merge for compliance and troubleshooting.
   2. The merge feature logs all changes, including details of the environments involved, the merge configuration, and the user who performed the merge. These logs should be accessible in both the source and destination Organisations, as well as in the app’s audit log.
8. Global code version control
   1. Users can view a list of global code versions
   2. Only the most recent 30 versions are kept in the system
   3. Each version will specify the following:
      1. Version number
      2. Timestamp when the version was created
      3. Who modified the global code to generate the version
      4. No. of data sources included as dependencies in the version
      5. No. of libraries included as dependencies in the version
      6. Description of what was changed
   4. Each version will record the description of what was changed in the version, which would be one of the following reasons:
      1. App merge
      2. Code modified: CSS, JS, Data sources, Libraries (only list the aspects that have changed)
   5. A global code version is generated whenever changes are made to global CSS/JS, library and data source dependencies. However, If the code was changed by the user, a new version is created only if at least 5 minutes have passed since the last version
   6. Changes triggered by app merges should always create a new version, regardless of timing
   7. Users can view the full code for each version, including the listed data sources and libraries. There’s no need to highlight the changes.
   8. Users can restore the global code customisations to a selected version, which will copy the restored version as a new version
9. App locking
   1. When a user starts to configure a merge, both the source and destination apps will be locked. During the merge operation, both the source and destination apps will also be locked.
   2. When an app is locked, Studio users will be unable to edit either app until the merge completes or fails. An app that is currently locked cannot be selected as a source or destination app for a new merge. The UI must clearly indicate when an app is locked and prevent it from being selected for other merge operations.
   3. When a user begins configuring a merge, both the source and destination apps will be locked to prevent edits. The locking mechanism has the following behaviour:
      1. Lock is applied immediately upon selecting a destination app.
      2. Initial lock duration is **10 minutes** and is extendable in **1-minute increments** if the user remains active.
      3. If the lock duration has **less than 5 minutes left**, the lock auto-extends while the user interacts with the merge configuration screen at any point **in the last 1 minute**.
      4. If the lock duration has **less than 2 minutes left**, the user configuring the merge will be shown the warning that the merge will be aborted soon (with a countdown). The user can **extend the lock by 5 minutes**.
      5. The following actions are allowed for locked apps:
         1. Analytics data
         2. Audit log
         3. Notifications
      6. If the user goes back to selecting a new destination app, the source app and previously selected destination app will both be unlocked.
      7. If the user closes the app merge UI and a destination app has already been selected, the source app and selected destination app will both be unlocked.
      8. Once the merge operation has commenced in the backend, the lock does not expire mid-merge; it only auto-unlocks if the merge completes successfully or fails.
   4. When an app is locked, the following API requests should result in a failure, specifying the request failed due to an app merge in progress
      1. App settings update
      2. Page CRUD
      3. App/page component CRUD
10. Information
    1. The merge feature can also be used to copy apps, screens, or data sources when the destination does not yet exist, maintaining control over what is transferred between environments.
    2. Users receive a final message confirming successful completion of the merge.
    3. Clear status messages are provided throughout the merge process to inform users of progress.
    4. The UI explains how to correct issues (e.g., missing files, app settings not copied) at the end of the merge, and these details are also logged.
    5. The merge UI clarifies which app settings are copied and which are excluded.
    6. Users must be made aware that the merge could disrupt users currently accessing the app, and that changes to screens or app settings may require the app to be republished or updated.
11. Additional Functional Modifications
    1. The user must select a destination app and organisation or specify that a new app must be created in a specific organisation.
    2. Any error messages should be reported during the merge process so the user is aware of any issues that will impact the merge.
    3. When an app merge completes, an email, Studio notification and Studio push notification will be sent to the user that initiated the merge to inform them whether it was successful or not.
    4. The user can review the merge logs which should include a summary of everything that was completed and highlight any issues or errors.
    5. The user is provided the ability to load the destination app and is encouraged to review all changes, test the app, and publish it if required. The user is reminded that data source changes will go live immediately.
    6. API should be updated to prevent screens & data sources from being created/updated to have the duplicate names in the same app.
12. Fliplet admins must be able to
    1. Copy apps between Fliplet instances e.g. prod, staging, local environment, cloud environments, etc
    2. The admin UI in Studio should support this functionality
13. Clone endpoints must not timeout when copying large apps
    1. Users should be notified when copying tasks are completed
    2. The admin UI in Studio should support this functionality

#### Tabular UI library

Here are features to include for the tabular UI:

* **Clear Column Headings:** Clearly label each column to indicate the data it contains.
* **Pagination:** For large datasets, implement pagination to efficiently display data without overwhelming the user, including:
  * Configurable page sizes incl. “Show all”
  * (Optional) Lazy loading
* **Global search:** Allow users to easily filter data within the table by specific keywords to match a list of columns.
* **Sorting:** Enable users to sort data by one or more columns in ascending or descending order, including proper sorting of numerical values.
* **Responsive Design:** Ensure the table adapts well to different screen sizes (e.g., displaying fewer columns or offering horizontal scrolling on smaller screens).
* **Loading Indicators:** Provide visual feedback when data is being loaded or filtered.
* **Bulk Actions:** For items like files or data sources, allow selecting multiple items for a combined action.
* **Partial Selection**: When multi-select is enabled, UI needs to show what partial selection looks like.
* **Custom UI in Cells**: Ensure cells can include drop-down UI and allow JS API to read the select values from the drop-downs.
* **Nested Tables**: For each row, tables can be nested with a different set of table layout and columns, designed to load the details for a specific entity, e.g. showing a list of data sources related to a screen.
* **Rich Event Handling**: Row click, double-click, selection change, sort change, page change

### User Stories and Journey

#### User Stories

1. General
   1. As a user, I want to be able to migrate my apps, screens, and dependent files and data between environments safely without accidentally moving sensitive files, data, or breaking existing functionality. The user will be able to select the files and data copied during the merge process.
   2. As a user, I want to be able to merge content from any environment to any other environment.
   3. As a user, I want to be able to copy and deploy new features, bug fixes, or enhancements to the live version of the application.
   4. As a user, I want to be able to optionally merge the app’s global code and appearance settings. The global code from the source app will replace the destination version. I expect a version history to be created so I can review and manually roll back the changes if needed.
   5. As a user, I expect to be able to manually roll back changes by reviewing the merge logs, using the version history feature for data sources and screens, relinking old files via the Studio edit interface, and manually updating app settings, global appearance, and global code. I do not expect the complete merge to be rolled back automatically.
   6. As a user, when selecting what to merge I must be able to see the associated files, screens and data sources and other associated assets. This is important as an asset can be used by multiple other assets and it must be clear to the user if they merge an asset what the impact on other assets will be.
   7. As a user, I want to see the real-time progress of the app merge, including what’s being merged and whether each step succeeded or failed, so that I can quickly verify the outcome and take follow-up actions if necessary.
   8. As a user, I want to be notified if there are duplicate screen or data source names in the source or destination app before starting a merge, so I can fix them and avoid errors during the process.
   9. As a user, I want the merge process to block if duplicate screen or data source names exist in either app, so that the merge behaves predictably and doesn’t cause unintended data overwrites.
   10. As a user, I want to receive clear error messages identifying the duplicate items when a merge is blocked, so I can quickly locate and resolve the problem.
2. Permissions
   1. As a user, only users with App Publisher rights should be able to migrate apps to other environments.
   2. As a user, I want to be able to control which Organisations my apps can be copied to in order to protect the security of my apps and prevent copying to Organisations I do not control.
3. Screens
   1. As a user, I expect the screen components, code, appearance settings, and widgets to be migrated to the destination screen. Using the screen versions, I should be able to roll back all settings or copy them to a new screen.
   2. As a user, I expect to preview the screen version before restoring or making a copy of it.
   3. As a user, I want to see the screen version created during the merge and have the ability to roll back to it or copy it to a new screen.
4. Data Sources (DS)
   1. As a user, I expect the data source data, columns, name, settings, and security rules to be merged to the destination DS. Using the DS versions, I should be able to roll back all settings or copy them to a new DS.
   2. As a user, I expect to review the data source version at the destination to see what changes have been made before restoring or copying it.
   3. As a user, I want to see the data source version created during the merge and have the ability to roll back to it or copy it to a new DS.
   4. As a user, I want to be warned that DS changes go live immediately via the merge UI, with guidance on when to perform a DS merge (e.g., when the app has no users or when the app is offline).
   5. As a user, I want to be able to copy either just the DS structure (column headings only, without any data) or both the structure and the data to avoid copying sensitive production data to test environments.
5. Files
   1. As a user, I expect to be able to migrate files to the destination app and have the destination app use the new file
   2. As a user, I expect the replaced file to be available in the file manager with an appropriate name so I know it was replaced and when so I can review relevant merge logs to understand why it was replaced
   3. As a user, I do not expect to be able to rollback file versions via the file manager.
   4. As a user, I expect to be able to rollback a version of a screen or DS and have it reference the previous version of the file
   5. As a user, when selecting files to merge, I want to see which screens or components currently reference each file, so I can understand the impact of including or excluding them.
   6. As a user, I want to easily identify unused files during merge preparation, so I can skip merging unnecessary assets and reduce clutter or duplication.
6. App-level configurations
   1. As a user, I want to understand which app-level configurations will be copied during a merge (e.g. app settings, menus, appearance, global code), so I can make informed decisions about what to include and avoid unexpected changes.
   2. As a user, I want to choose whether to include app-level configurations in the merge, knowing that if I choose to include them, all supported configurations will be copied except those that are excluded for safety or compliance reasons.
   3. As a user, I want to review which app-level configurations were copied or excluded during a merge, so I can trace changes and verify what was affected.
7. Logs
   1. As a user, I want to be able to view an audit trail of code changes, merges, and configuration modifications for each merge for compliance and troubleshooting.
   2. The merge feature must log all changes, including details of the environments involved, the merge configuration, and the user who performed the merge. These logs should be accessible in both the source and destination Organisations, as well as in the app’s audit log.
8. Global code version control
   1. As a user, I want every overwrite of global code to create a new version automatically, so I can safely restore a previous version if something breaks.
   2. As a user, I want to view a history of global code versions with timestamps and authorship, so I can identify which version to restore and why.
   3. As a user, I want to preview a previous version of global code and compare it with the current version before restoring, so I can confidently roll back only when necessary.
   4. As a user, I want to restore the global code customisations to a selected version from the version history, so I can recover from unwanted changes or mistakes with minimal disruption.
9. Information
   1. As a user, I want to use the merge feature to merge (or copy, if the destination app does not exist) apps, screens, or data sources while maintaining control over what is transferred between environments.
   2. As a user, I want to receive a final message at the end of the merge process confirming that the merge has completed successfully.
   3. As a user, I want to receive clear messaging during the merge process to understand the steps being taken and the current status.
   4. As a user, I want to be informed about how to correct issues with the merge (for example, if a code conflict is found in the global code) via detailed reports written to the log.
   5. As a user, I expect the merge UI to clearly indicate which app settings will and will not be copied to the destination.
   6. As a user, I must be made aware that the merge could disrupt users currently accessing the app, and that changes to screens or app settings may require the app to be republished or updated.
10. Additional User Story Modifications
    1. **The user must select a destination app and organisation or specify that a new app must be created in a specific organisation.**
    2. Any error messages should be reported during the merge process so the user is aware of any issues that will impact the merge.
    3. The user can review the merge logs which should include a summary of everything that was completed and highlight any issues or errors.
    4. The user is provided the ability to load the destination app and is encouraged to review all changes, test the app, and publish it if required. The user is reminded that data source changes will go live immediately.
    5. As a user, I want the platform to prevent me from creating screens or data sources with duplicate names within the same app, so that I avoid introducing errors or merge issues in the future.

#### User Journey

1. Initiation
   1. The user logs into Fliplet Studio.
   2. The user navigates to the merge feature interface within the app management section.
2. Preparation
   1. The user selects the source app.
   2. The user must select a destination app and organisation, or specify that a new app must be created in a specific organisation.
   3. The user reviews available items for merging, including screens, data sources, and global settings.
   4. The user configures merge options by selecting specific files, settings, or components to include.
   5. The user is notified that any users of the source & destination app in Studio will be unable to work on the app until the merge is complete
      1. If the user navigates away or closes the session before completing the merge, the configuration will not be saved and must be reconfigured from scratch.
3. Merge Execution
   1. The user initiates the merge process by clicking the merge button.
   2. The system processes the merge, logging all actions and highlighting any errors or exceptions.
   3. Any error messages encountered during the merge process are reported immediately so that the user is aware of issues that may impact the merge.
   4. During the merge, both the source and destination apps should be locked. Studio users will be prohibited from accessing or editing either app until the merge is complete.
   5. While the merge configuration is open, the system automatically extends the lock duration as long as the user is active.
   6. After a successful merge, apps are auto-unlocked.
   7. After a failed merge, apps are auto-unlocked and an error message is shown to all affected users.
   8. The system provides clear, step-by-step status messages throughout the process.
4. Post-Merge Review & Action
   1. The user can review the merge logs, which include a summary of everything that was completed and highlight any issues or errors.
   2. The user is provided the ability to load the destination app and is encouraged to review all changes, test the app, and publish it if required. The user is reminded that data source changes will go live immediately.

##### User journey mermaid syntax

**flowchart** TD
   A\[User logs into Fliplet Studio\] **\--\>** B\[Access Merge Feature\]
   B **\--\>** C\[Select Source App\]
   C **\--\>** D\[Select Destination App or Specify New App\]
   D **\--\>** E\[Configure Merge Options\]
   E **\--\>** F\[Initiate Merge Process\]
   F **\--\>** G\[Merge In Progress\]
   G **\--\>** H{Merge Successful?}
   H **\--** Yes **\--\>** I\[Display Success Message & Review Changes\]
   H **\--** No **\--\>** J\[Display Error Message\]
   J **\--\>** K\[User Reviews Logs & Initiates Manual Rollback\]
   I **\--\>** L\[User Tests & Publishes Updated App\]

### Dependencies, Constraints, and Technical Specifications

#### Dependencies

1. Studio Features
   1. Dependence on existing Fliplet Studio components such as the data container and UI builder.
   2. Utilization of Fliplet’s version control and audit logging features.
2. REST APIs
   1. Use of internal REST APIs to fetch app details, manage merge operations, and record merge logs.
3. JS APIs
   1. Integration with Fliplet’s custom widget JS API for merge-related functionalities.
4. Other Features
   1. Dependency on existing merge logs, version control, and audit features to support the merge process.

#### Constraints

1. Technical Constraints
   1. Merge operations should be optimised to run concurrently wherever possible (e.g., updating files, screens, and data sources in parallel) to avoid unnecessary linear processing that could increase the total duration. This optimisation is aimed at improving performance within individual merges, not enabling multiple merges to run simultaneously for the same app.
   2. Locked apps must be excluded from available options when selecting source or destination apps for merge operations. This prevents potential data conflicts and ensures the merge process only targets stable, accessible apps.
   3. The proposed merge execution order is the following, prioritising low-risk and low-dependency items first (files, global code), followed by app-level configurations, then screens, and finally data source entries, which may have immediate impact on live users. Data source changes are applied last to minimise live disruption and allow any dependent screens or settings to be processed before the data is modified.
      1. Files
      2. Create data sources as necessary
      3. Global code
      4. Global appearance settings
      5. Menu
      6. App settings
      7. Screens
      8. Data source settings & entries
   4. The merge process should complete in under five minutes for apps with less than 20 data sources, 50 files, and 40 screens.
   5. Data source changes are applied immediately, necessitating robust error handling and prompt user notification.
   6. Merge locks are time-bound and auto-extend while active. Merge operations must override any expiry timers to prevent accidental unlocks mid-process.
2. Resource Constraints
   1. Limited developer capacity with a targeted delivery in Q2 2025\.
   2. Testing resources may be constrained, necessitating a focused testing strategy.

#### APIs, Hooks, and Tracking

1. Customer-Facing APIs and Hooks
   1. Logs will be made available via the existing log API.
   2. An API for initiating the merge process will not be public.
2. Event Tracking
   1. Track key events such as merge initiation, completion, and any errors that occur during the merge process.
   2. All events in the UI must be tracked for usage analysis.
3. Logging
   1. Log all merge operations, including source and destination details, configuration settings, and user actions for auditing and troubleshooting purposes.

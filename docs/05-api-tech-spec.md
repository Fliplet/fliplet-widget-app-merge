# Copy Apps between Fliplet instances

## Overview

We need to clone an app from a production environment to a developer’s local setup or any other environment without direct database access.

Current cloning (`POST /v1/apps/:appId/clone`) copies apps via direct DB links across regions/environments. See [routes/v1/apps.js](https://github.com/Fliplet/fliplet-api/blob/3ed1127565c983930d8e0df28f06d5729a5aaf11/routes/v1/apps.js#L2241-L2416) lines 2241‑2416 for the existing clone logic.

Since the production DB cannot be reached from local, we will expose an export endpoint in production and an import endpoint in the local environment.

## New Endpoints

### Export App data

* Gather app metadata, pages, widget instances, media info, data sources and their entries similar to what models/app.clone() reads in json file which can be used by import endpoint to create new app in the any environment
* Returns a JSON file required for re-creation. File will contains:
  * App details
  * App pages
  * App DataSources
  * App DataSourceEntries
  * App media folder
  * App media files
  * App widgetInstances
  * Widget

**This endpoint will return data from the source DB**

**Endpoint** GET /v1/apps/{appId}/export

* 200 Response (JSON File will be downloaded):

```javascript
{
  "app": {
    "id": 275,
    "name": "Publishing V2",
    "icon": "https://d2fx5g1ro9ok5z.cloudfront.net/apps/275/icon-1745318277128.jpg",
    "isSystemTemplate": false,
    "settings": {},
    "slug": "fliplet-publishing-v-2-h-6-o-0-trrj",
    "createdAt": "2025-04-21T12:37:58.519Z",
    "updatedAt": "2025-06-02T06:46:56.168Z",
    "deletedAt": null,
    "organizationId": 2,
    "startingPageId": 401,
    "productionAppId": 276,
    "masterAppId": null
  },
  "pages": [
    {
      "id": 400,
      "layoutId": 2,
      "title": "chat",
      "layout": "{{{widget 7181}}}{{{widget 7182}}}",
      "dependencies": [],
      "assets": [
        {
          "url": "https://cdn.fliplet.test/assets/fliplet-runtime/1.0/runtime.js?_=1745316360",
          "hash": 1745316360,
          "path": "assets/fliplet-runtime/1.0/runtime.js",
          "updatedAt": "2025-04-22T10:06:00+00:00"
        }
      ],
      "html": "",
      "webHtml": null,
      "order": 4,
      "layoutOrder": 0,
      "isLayout": false,
      "icon": null,
      "settings": {
        "interactVersion": "3.0",
        "widgetInstancesInUse": [
          7181,
          7182
        ]
      },
      "appId": 275,
      "sectionId": null,
      "masterPageId": null
    }
  ],
  "dataSources": [
    {
      "permissions": "crudq",
      "id": 289,
      "name": "Login data for Local Android notification",
      "appCapabilities": null,
      "hooks": [],
      "encrypted": false,
      "columns": [
        "Email",
        "Password"
      ],
      "type": null,
      "definition": {
        "exclude": [
          "Password"
        ],
        "columnsWidths": [
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          250,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50
        ],
        "parentDataSourceIds": [
          158
        ],
        "sessionIdleTimeoutMinutes": 55,
        "sessionMaxDurationMinutes": 60
      },
      "bundle": true,
      "appId": 275,
      "organizationId": null,
      "masterDataSourceId": 158,
      "dataSourceEntries": [
        {
          "id": 205427,
          "data": {
            "Email": "ajokhakar+4@fliplet.com",
            "Password": "Test123#"
          },
          "dataSourceId": 289
        }
      ],
      "dataSourceRoles": []
    }
  ],
  "mediaFolders": [
    {
      "id": 123,
      "name": "Screenshots",
      "metadata": {},
      "createdAt": "2025-04-22T10:33:46.860Z",
      "updatedAt": "2025-04-22T10:33:46.860Z",
      "deletedAt": null,
      "appId": 275,
      "masterMediaFolderId": null,
      "parentId": null,
      "organizationId": null,
      "mediaFiles": []
    }
  ],
  "mediaFiles": [
    {
      "id": 147,
      "name": "01-mobilex-Login.png",
      "contentType": null,
      "path": "pages/01-mobilex-Login.png",
      "url": "https://d2fx5g1ro9ok5z.cloudfront.net/apps/275/pages/58d41619d861e841d71b20d50b605e47.png",
      "thumbnail": "https://d2fx5g1ro9ok5z.cloudfront.net/apps/275/pages/58d41619d861e841d71b20d50b605e47.png",
      "size": [
        414,
        896
      ],
      "isEncrypted": null,
      "versions": {},
      "isOrganizationMedia": false,
      "metadata": {},
      "createdAt": "2025-04-22T10:33:59.270Z",
      "updatedAt": "2025-04-22T10:33:59.270Z",
      "deletedAt": null,
      "appId": 275,
      "dataSourceEntryId": null,
      "dataTrackingId": null,
      "mediaFolderId": 129,
      "userId": null,
      "masterMediaFileId": null,
      "organizationId": null
    }
  ],
  "widgetInstances": [
    {
      "id": 7199,
      "settings": {},
      "uuid": "94449b9a-f7d0-47c7-aae1-d6510e820022",
      "createdAt": "2025-04-21T12:37:59.140Z",
      "updatedAt": "2025-04-21T12:37:59.272Z",
      "deletedAt": null,
      "widgetId": 37,
      "parentId": null,
      "widget": {
        "isTheme": false,
        "isFunction": false,
        "isInline": false,
        "id": 37,
        "package": "com.fliplet.analytics",
        "version": "1.0.0",
        "icon": "https://d2fx5g1ro9ok5z.cloudfront.net/widgets/com.fliplet.analytics/1.0.0/2304241338/img/icon.png?_=1682343484127",
        "tags": [
          "type:appComponent",
          "category:analytics"
        ],
        "isProviderOnly": false,
        "hasInterface": true,
        "htmlTag": "div",
        "name": "System: Analytics",
        "description": "<p>Use this add-on to track app usage data.</p>",
        "publisher": null,
        "baseAssetsUri": "https://d2fx5g1ro9ok5z.cloudfront.net/widgets/com.fliplet.analytics/1.0.0/2304241338/",
        "sourceUrl": "https://d2fx5g1ro9ok5z.cloudfront.net/widgets/com.fliplet.analytics/1.0.0/2304241338/sources/6986096eb52813550df5e5d1196ac7ea.zip?_=1682343485",
        "assets": [
        ],
        "interfaceAssets": [
          "interface.js",
          "interface.css"
        ],
        "renderingAssets": [
          "rendering.js"
        ],
        "appRenderingAssets": null,
        "interfaceDependencies": [
          "fliplet-core",
          "fliplet-studio-ui"
        ],
        "renderingDependencies": [
          "fliplet-core"
        ],
        "isSystem": null,
        "repository": "https://github.com/Fliplet/fliplet-widget-analytics",
        "capabilities": [],
        "references": [],
        "settings": {},
        "themeSettings": null,
        "schema": null,
        "exports": null,
        "createdAt": "2023-04-24T13:38:04.450Z",
        "updatedAt": "2023-04-24T13:38:05.206Z",
        "organizationId": null
      },
      "appWidget": {
        "createdAt": "2025-04-21T12:37:59.170Z",
        "updatedAt": "2025-04-21T12:37:59.170Z",
        "appId": 275,
        "widgetInstanceId": 7199
      }
    }
  ]
}
```

* 404 Response: App not found

```javascript
{
  "message": "App not found or user does not have access"
}
```

###

### Import App data

**User can import data in 2 ways:**

**1: Call Export & Import endpoint separately**
User needs to call export endpoint in the source environment to get export.json file and upload this file to import endpoint to import the app in the destination environment

A background job will process the data, reconstruct the app using a new App.import() method (or re-uses App.clone() internally) to insert records and copy assets to the local bucket.

**Widget Import**

* It will import the widget which is required by the app and not available in the destination environment.

**Note**: If the user wants to copy a local environment app to the staging or production environment, they will need to use this approach.
**2: Pass source environment details in import endpoint**
User needs to provide source environment details like in JSON payload:

1. Source endpoint
   2. App Id
   3. Organization Id
   4. Source User token

Import Endpoint point will call GET /v1/apps/{appId}/export endpoint with payload to get the source app data

A background job will process the data, reconstruct the app using a new App.import() method (or re-uses App.clone() internally) to insert records and copy assets to the local bucket.

**Note**:This approach requires both the source and destination environments to be publicly accessible, and it will only work when the user wants to copy an app between production, staging, or development environments.

**This endpoint will insert data in the destination DB**

**Endpoint** POST /v1/apps/import

Payload

```javascript
{
  "sourceEndpoint": "api.fliplet.com",
  "sourceAppId": 1234,
  "sourceOrganizationId": 4567,
  "sourceToken": "eu-123456"
}

```

# REST Endpoints

## Get App Details

**(No change) Endpoint:** `GET /v1/apps/:appId`

**Usage:**

When a user is selecting apps to merge or get app details, this endpoint can be used to fetch specific app details. **`lockedUntil`** in the response will tell studio if the app is in lock state or not

**Success Response:**
**Status: 200**
`{ “app”: {`

  		`"id": 1123,`
  		`"name": “Event App”,`
  		`"settings": {} ,`
	       `“lockedUntil”: 12781872,`
`}`
     `}`
**Error Responses:**

* **Status: 404**
  `{`
    `"message": "App not found"`
  `}`
* **Status: 404**
  `{`
    `"message": "The app has not been found or you don’t have enough permissions to view it."`
  `}`

## Get Apps

**(No change) Endpoint:** `GET /v1/apps`

**Usage:**

Listing of apps will be used to tell if the app is ready is for merge or not on app listing screen

**Success Response:**
**Status: 200**

`{ apps: [{`
  		`"id": 1123,`
  		`"name": “Event App”,`
  		`"settings": {} ,`
	      	`“lockedUntil”: 1283892,`
     `}]}`

## Get User Organizations

**(No change) Endpoint:** `GET /v1/organizations`

**Usage:**

When a user is selecting a destination app to merge into, this endpoint can be used to list all of his organizations.

**Success Response:**
**Status: 200**
`{`
  	    `“organizations”: [`
`{`
   `"id": 1123,`
  		   `"name": “Fliplet Merge”,`
  		   `"settings": {},`
		   `“region”: “eu”`
`}`
    `]`
     `}`
**Error Responses:**

* **Status: 404**
  `{`
    `"message": "This user does not have any organization"`
  `}`

## Get User Apps In An Organization

**(Existing) Endpoint:** `GET /v1/organizations/:organizationId/users/:userId/apps?publisher=true&mergeable=true`

**Usage:**

Once a user has selected a destination organization, this endpoint can be used to list all of his apps in which he has publisher role and can be merged.

**Change:**
Endpoint will be updated to fetch mergeable apps with publisher role based on publisher and mergeable flag.

**Success Response:**
**Status: 200**
`{`
   `“apps”:[{`
  		  	`"id": 1123,`
  		  	`"name": “Event App”,`
  		  	`"settings": {},`
			`“organizationId”: 1234`
		`}]`
     	`}`

## Preview An App Screen

**(No Change) Endpoint:** `GET /v1/apps/:appId/pages/:pageId/preview`

**Usage:**

In the **Screens** tab, this endpoint can be used to preview a specific app page.

## Merge Apps Endpoint

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/merge`

**Usage:**
Once user has clicked merge button after finalizing app merge configurations, this API endpoint will start merge process

**Description**:
This endpoint will implement core functionality for the app merge feature. It will receive finalized configuration at the end of app merge config setup once the user has clicked the button for app merge. Since, app merge will be a lengthy process, it will simply create a log, start the background job and inform the user that app merge has started. In order to reduce the risk for breaking any functionality of the app, merging will go through different stages in following order:

* Files and folders (media)
* Create new data-sources in destination app
* Global code (JS, CSS and HTML)
* Global appearance settings
* Global menu settings
* App settings
* Screens
* Merge existing data sources

**Audit Log Type:** `app.merge.initiated`

**Headers**
 `{`
	`"X-target-region": “eu”, //us, ca`
`}`

**Request Payload**
`{`
		`"destinationAppId": Number,`
  		`"destinationOrganizationId": Number,`
  	`“fileIds”: [1, 123, 567], // [] empty array when no files are to be merged, accepts a string ‘all’ when all files are to be merged`
		`“folderIds”: [`
`{`
		`id: 123,`
		`scope: “folder”,`
`},`
`{`
   `id: 245,`
		`scope: “all”,`
`}`
`], // [] empty array when no folders are to be merged, accepts a string ‘all’ when all folders are to be merged`
		`“mergeAppSettings”: true, //false`
`“mergeAppMenuSettings”: true, //false`
		`“mergeAppearanceSettings”: true //false`
		`“mergeGlobalCode”: true, //false`
`“pageIds”: [123, 456], // [] empty array when no pages are to be merged, accepts a string ‘all’ when all pages are to be merged`
		`“dataSources”: [`
			`{`
				`“id”: 123,`
`“structureOnly”: true,`
`},`
`], [] empty array when no datasources are to be merged, accepts a string ‘all’ when all datasources are to be merged`
`“customDataSourcesInUse”: [] //To store global DS dependency`
`}`
**Success Response:**
**Status: 200**

```javascript
{
  "status": "success",
  "mergeId": 123,
  "message": "App merge initiated successfully"
}
```

**Error Responses:**

* **Status: 401**

```javascript
{
  "status": "error",
  "message": "You must have an app publisher role to merge this app"
}
```

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`

* **Status: 404**

```javascript
{
  "status": "error",
  "message": "Source or destination app not found."
}
```


* **Status: 400**

```javascript
{
  "status": "error",
  "message": "Destination App ID is required."
}
```

## Update Organization policy to enable/disable app merge.

**(No change) Endpoint:** `POST /v1/organizations/:id/policy`

**Request Payload**
`{`
	`“isAppMergeAllowed”: true, // boolean`
`}`

**Usage:**
Usage of this is it defines if the app merge is allowed in this organization or not?
To update policy via postman. Please refer to this video.
[https://www.loom.com/share/e775945fdf5b477da20cd87bc64fd4ec](https://www.loom.com/share/e775945fdf5b477da20cd87bc64fd4ec)

```
Referer: http://localhost:8080
```

If testing on staging use staging studio url or in produce use studio url

**Success Response:**
**Status: 200**
`{`
  	    `“organizations”: [`
`{`
   `"id": 1123,`
  		   `"name": “Fliplet Merge”,`
  		   `"settings": {},`
		   `“policy”: {`
			`“isAppMergeAllowed”: true,`
   `},`
		   `“region”: “eu”`
`}`
    `]`
     `}`
**Error Responses:**

* **Status: 404**
  `{`
    `"message": "This user does not have any organization"`
  `}`

## Screens Overview

**(Existing) Endpoint:** `GET /v1/apps/:sourceAppId/pages?include=associatedDS,associatedFiles`

**Usage:**
When a user clicks on **“Screens”** tab in the UI, this endpoint will be called to return all source app screens.

**Description:**
This endpoint will list screens from the source app. It will also provide all files and data-sources associated with each screen.

**Changes:**
This endpoint will be updated to fetch data-sources (if include=associatedDS) and files (if include=associatedFiles) or both associated with app pages.

**Success Response:**
**Status: 200**
`{`
  `“pages”: [{`
	`“id”: 123,`
	`“name”: “screen1”,`
	`“associatedDS”: 1,`
`“associatedFiles”: 10,`
`}]`
`}`

**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`

**(Existing) Endpoint:** `GET /v1/apps/:sourceAppId/pages/:pageId?include=associatedDS,associatedFiles`

**Usage:**
This endpoint will fetch details for associated DS and media files for specific screen ID.

**Changes:**
This endpoint will be updated to fetch data-sources (if include=associatedDS) and files (if include=associatedFiles) or both associated with app pages.

**Success Response:**
**Status: 200**
`{`
 `“page”: {`
	`“id”: 123,`
	`“title”: “screen1”,`
	`“settings”: {},`
	`“associatedDS”: [{`
		`“id”: 123,`
`“name”: “DS 1”,`
`“columns”: [],`
`“definition”:{}`
`}],`
`“associatedFiles”: [{`
`“id”: 123,`
`“name”: “hello.doc”,`
`“path”: “”`
`}],`
 `}`
`}`

**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Screen not found"`
  `}`

## Data Sources Overview

**(Existing) Endpoint:** `GET /v1/data-sources?appId=123&include=’associatedPages’&includeInUse=true`
**Description:**
This endpoint will list all the standard data-sources (of type=null) from the source app. It will also provide all files and screens associated with data-source.

**Changes:**
This endpoint will be updated to fetch pages (if include=associatedPages) and files (if include=associatedFiles) or both associated with app pages.

**Success Response:**
**Status: 200**
`{`
  `“dataSources”: [{`
	`“id”: 123,`
	`“name”: “DS1”,`
	`“definition”: ””,`
	`“hooks”: “”,`
	`“entriesCount”: 1000, // Number`
	`“associatedPages”: 2`
   `}]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`

**(Existing) Endpoint:** `GET /v1/data-sources/:dataSourceId?appId=123&include=associatedPages’`

**Usage:**
This endpoint will fetch specific data-source with details for associated files and screens.

**Changes:**
This endpoint will be updated to fetch linked screens (if include=associatedPages) and files (if include=associatedFiles.

**Success Response:**
**Status: 200**
`{`
  `“dataSources”: [{`
	`“id”: 123,`
	`“name”: “DS1”,`
	`“definition”: ””,`
	`“hooks”: “”,`
	`“entriesCount”: 1000, // Number`
	`“associatedPages”: [{`
		`“id”: 123,`
		`“name”: “Screen 1”,`
		`“settings”: {}`
`}],`
`“associatedFiles”: [{`
	`“id”: 456,`
	`“name”: “document.pdf”,`
`}]`
   `}]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Data source not found"`
  `}`

## Files Overview

**(Existing) Endpoint:** `GET /v1/media?appId=123&include=‘associatedPages,associatedDS’`

**Usage:**
When a user clicks on **“Files”** tab in the UI, this endpoint will be called to return all source app files.

**Change:**
This endpoint will be updated to provide all the screens associated with each file if (includes=associatedPages).

**Success Response:**
**Status: 200**
`{`
  `“files”: [{`
	`“id”: 123,`
	`“name”: “image.png”,`
	`“type”: “png”,`
       `“path”: “Images/image.png”,`
`“associatedPages”: 1,`
`“associatedDS”: 2`
   `}],`
  `“folders”: [{`
     `“id”: 455,`
     `“name”: “Images”,`
     `“metadata”: {},`
     `“associatedPages”: 2,`
     `“associatedDS”: 2`
   `}]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`

**(Existing) Endpoint:** `GET /v1/media/folders/:folderId?appId=123&include=’associatedPages’`

**Usage:**
This can be used by the frontend to show details for a specific folder.

**Change:**
When associatedPages is sent in a query, it will also send screen details in the specified app where this media folder was referenced.

**Success Response:**
**Status: 200**
`{`
  `  “folders”: [{`
     `“id”: 455,`
     `“name”: “Images”,`
     `“metadata”: {},`
     `“associatedPages”: [{`
          `“id”: 1234,`
	   `“name”: “screen1”,`
          `“settings”: {}`
`}]`
   `}]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Media folder not found"`
  `}`

**(Existing) Endpoint:** `GET /v1/media/files/:fileId?appId=123&include=’associatedPages,associatedDS’`

**Usage:**
This can be used by the frontend to show details for a specific file.

**Change:**
When associatedPages is sent in a query, it will also send screen details in the specified app where this media file was referenced.

**Success Response:**
**Status: 200**
`{`
  `  “files”: [{`
     `“id”: 455,`
     `“name”: “image.png”,`
     `“metadata”: {},`
     `“associatedPages”: [{`
          `“id”: 1234,`
	   `“name”: “screen1”,`
          `“settings”: {}`
`}],`
    `“associatedDS”: [{`
	   `“id”: 123,`
	   `“name”: “DS 1”,`
	   `“definition”: {},`
          `“columns”: [“column1”, “column2”]`
`}]`
   `}]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to merge this app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "File not found"`
  `}`


## Lock an App to accept Any Changes from Studio {#lock-an-app-to-accept-any-changes-from-studio}

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/lock`

**Request Payload:**
`{`
  `  “targetApp”: {`
	`id: 21,`
	`region: “us”`
     `},`
    `“lockedUntil”: 12837923 //default 10 minutes - in seconds`
`}`

**Usage:**
This endpoint will be used by the frontend to lock the app from being edited or modified as soon as the user begins configuring app merging.
Send real-time notifications to all users actively working on apps in **Studio** regarding app lock status

**Success Response:**

* **Status: 200**
  `{`
    `  “status”: “success”,`
      `“message”: “Source and destination apps have been locked”`
    `“lockedUntil”: 1718650400000`

  `}`


**Error Responses:**

* **Status: 409**
  `{`
    `  “status”: “success”,`
      `“message”: “Source and destination apps are already locked”`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to lock source app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Destination app not found"`
  `}`

## UnLock an App to accept Any Changes from Studio

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/unlock`

**Request Payload:**
`{`
  `  “targetApp”: {`
	`id: 21,`
	`region: “us”`
     `}`
`}`

**Usage:**
This endpoint will be used by the frontend to unlock the app from being edited or modified as soon as the user begins configuring app merging.
Send real-time notifications to all users actively working on apps in **Studio** regarding app unlock status

**Success Response:**

* **Status: 200**
  `{`
    `  “status”: “success”,`
      `“message”: “Source and destination apps have been unlocked”`
  `}`



**Error Responses:**

* **Status: 409**
  `{`
    `  “status”: “success”,`
      `“message”: “Source and destination apps are already unlocked”`
  `}`

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to lock destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Destination app not found"`
  `}`

## Extend Lock Duration

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/lock/extend`

**Request Payload:**
`{`
  `"targetApp": {`
    `"id": 21,`
    `"region": "us"`
  `},`
  `“extendDuration”: 1202323 // null - in seconds`
`}`

**Usage:**
Called when the user is actively interacting with the merge configuration screen.
Should only be allowed if the lock is active and owned by the requesting user.
Auto-extends the lock duration by 1 minute if current expiry is within 5 minutes.

**Success Response:**

* **Status: 200**
  `{`
    `"status": "success",`
    `"message": "Lock extended",`
    `"lockUntil": 1718650400000`
  `}`



**Error Responses:**

* **Status: 409**
  `{`
    `"status": "error",`
    `"message": "Lock has already expired"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to extend source app"`
  `}`
* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to extend destination app"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Source app not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Destination app not found"`
  `}`

## List Global Code Versions

**(New) Endpoint:** `GET /v1/apps/:appId/global-code/versions`

**Usage:** This endpoint will be used to list latest global code versions in the UI where user can view global code history.

**Description:**
This endpoint will list the global code versions in descending order with details like when the version was created and the reason for creation.

**Success Response:**
**Status: 200**
`{`
  `“versions”: [`
	`{`
  `“id”: 123,`
	  `“createdAt”: “”,`
	  `“data”: {`
	     `“mergeId”: 123,`
	     `“tag”: “”,`
     `“description”: “app merge”,`
   `}`
`},`
`{`
  `“id”: 456,`
  `“createdAt”: “”,`
 `“data”: {`
     `“tag”:””,`
     `“description”: “user edit”,`
   `}`
`}`
`]`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to view global code versions"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "App not found"`
  `}`

## Restore Global Code Version

**(New) Endpoint:** `POST /v1/apps/:appId/global-code/versions/:versionId/restore`

**Usage:**
Once the user clicks on **“Restore”** button, this endpoint will replace existing code with the requested version of the code.

**Description:**
This endpoint will list the global code versions in descending order with details like when the version was created and the reason for creation.

**Success Response:**
**Status: 200**
`{`
  `“status”: “success”,`
  `“message”: “Global code restored to version {{versionId}} successfully”`
`}`
**Error Responses:**

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role to restore global code to an older version"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "App not found"`
  `}`
* **Status: 404**
  `{`
    `"status": "error",`
    `"message": "Requested version was not found"`
  `}`

## Restrict user to have same page name

**(Existing) Endpoint:** `POST /v1/apps/:appId/pages/:pageId`

**Usage:**
Users can rename the page using studio.

**Description:**
This endpoint will ensure that user is not able to rename the pages

**Success Response:**
**Status: 200**
`{`
  `“status”: “success”,`
  `“page”: { id:1, … }`
`}`
**Error Responses:**

* **Status: 400**
  `{`
    `"status": "error",`
    `"message": "Page with {{name}} already exists in this app. Please rename it."`
  `}`

## Restrict user to have same data-source name

**(Existing) Endpoint:** `POST /v1/data-sources/:id`

**Usage:**
Users can rename the data-source using studio in app data

**Description:**
This endpoint will ensure that user is not able to rename the data-source

**Success Response:**
**Status: 200**
`{`
 ` id: 1,`
  `…`
`}`
**Error Responses:**

* **Status: 400**
  `{`
    `"status": "error",`
    `"message": "Data Source with {{name}} already exists in this app. Please rename it."`
  `}`

## Check for duplicate pages and data-sources.

**(New) Endpoint:** `POST /v1/apps/:appId/duplicates?items=”pages,datasources”`

**Usage:**
Once the user clicks on the configure merge button this endpoint will check if the App
selected has the duplicate named pages or datasources.


**Description:**
This endpoint will ensure that the user is not able to select a destination app that has
duplicate pages names or data source names.

**Success Response:**
**Status: 200**
`{`
   `"status": "success",`
   `"message": "Selected app have NO duplicate item names",`
   `"pages": [],`
   `"dataSources": []`
`}`
**Error Responses:**

* **Status: 400**
    `{`
      `"status": "error",`
      `"message": "Selected app have multiple duplicate item names. In order to run a merge, your`
  `destination app should have only 1 reference item name",`
      `"pages": [`
          `{`
              `"title": "record",`
              `"count": "2",`
              `"ids": [`
                  `68,`
                  `67`
              `]`
          `}`
      `],`
      `"dataSources": [`
          `{`
              `"name": "formdata1",`
              `"count": "2",`
              `"ids": [`
                  `61,`
                  `60`
              `]`
          `}`
      `]`
  `}`

* **Status: 400**
  `{`
     `"message": "Items are required to validate duplicates in app",`
     `"stackTrace": {}`
  `}`

## Pre-Merge Overview

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/merge/preview`

**Usage:**
Once the user navigates to the **“Overview”** section, this endpoint will be called to show final results of the app merge based on the selected configuration. If the app is locked then disable user from performing any action.

**Endpoint Request:**

```javascript
{
		"destinationAppId": Number,
  		"destinationOrganizationId": Number,
  	"region": "eu", //us, ca
	“fileIds”: [1, 123, 567], // [] empty array when no files are to be merged, accepts a string ‘all’ when all files are to be merged
		“folderIds”: [
{
		id: 123,
		scope: "folders", "folders" or "all"
},
{
   id: 245
		scope: "all", "folders" or "all"

}
], // [] empty array when no folders are to be merged, accepts a string ‘all’ when all folders are to be merged
		“mergeAppSettings”: true, //false
		“mergeAppearanceSettings”: true //false
		“mergeGlobalCode”: true, //false
“pageIds”: [123, 456], // [] empty array when no pages are to be merged, accepts a string ‘all’ when all pages are to be merged
		“dataSources”: [
			{
				“id”: 123,
				"scope": "structure" //structure or all
},
], [] empty array when no datasources are to be merged, accepts a string ‘all’ when all datasources are to be merged
“customDataSourcesInUse”: [] //To store global DS dependency
}
```

**Description:**
This endpoint will compare source app and destination apps screens and provide an overview of the merge i.e.: what will be overwritten, what will be copied, etc. It will also check for plan limitations and send warning if necessary.

**Success Response:**
**Status: 200**
`{`
  `“pages”: {`
	  `“overwritten”: [`
	  	`{`
	   `“sourcePage”: {`
		   `“id”: 123,`
		   `“name”: “screen1”,`
		   `“appId”: 1234`
`},`
   `“destinationPage”: {`
	   `“id”: 456,`
   `“name”: “screen1”,`
		   `“appId”: 1211`

`}`
`}`
         `],`
	`“copied”: [`
	`{“id”: 999, “name”: “screen2”}`
`]`
`},`
  `“dataSources”: {`
	   `“overwritten”: [`
	  	`{`
	   `“sourceDS”: {`
		   `“id”: 123,`
		   `“name”: “DS 1”,`
		   `“appId”: 1234`
`},`
   `“destinationDS”: {`
	   `“id”: 456,`
   `“name”: “DS 2”,`
		   `“appId”: 1211`
`},`
  `“scope”: “all”`
`},`
`{`
	   `“sourceDS”: {`
		   `“id”: 121,`
		   `“name”: “DS 3”,`
		   `“appId”: 1234`
`},`
   `“destinationDS”: {`
	   `“id”: 4560,`
   `“name”: “DS 4”,`
		   `“appId”: 1211`
`},`
  `“scope”: “all”,`
  `“entriesCount”: 1000`
`}`
         `],`
	`“copied”: [`
	`{“id”: 999, “name”: “DS 10”, entriesCount: 1200}`
`]`

`},`
  `“files”: {`
		`// Same structure as pages`
	`}`
`}`
**Error Responses:**

* **Status: 401**

`{`
	`“status”: “Failed”,`
	`“message”: “You must have an app publisher role to merge this app”`
`}`

* **Status: 401**
  `{`
    `"status": "error",`
    `"message": "You must have an app publisher role for destination app"`
  `}`
* **Status: 404**

`{`
	`“status”: “Failed”,`
	`“message”: “Destination app not found”`
`}`

* **Status: 404**

`{`
	`“status”: “Failed”,`
	`“message”: “Source app not found”`
`}`

* **Status: 400**

`{`
	`“status”: “Failed”,`
	`“message”: “Cannot merge an app into itself”`
`}`

* **Status: 400**

`{`
	`“status”: “Failed”,`
	`“message”: “This organization is not configured to merge an app.”`
`}`

## Get Current Status of the App Merge {#get-current-status-of-the-app-merge}

**(New) Endpoint:** `POST /v1/apps/:sourceAppId/merge/status`

**Request Payload:**
	`{`
  	`“mergeId”: 123`
`}`

**Usage:**
This endpoint can be used by the frontend whenever they want to show live status of the app merge or the merge result if status is completed or failed due to critical error. Here appId can either be source app id or destination app id.

**Success Response:**

* **Status: 200**
  `{`
    `“status”: “completed”,`
    `“lockedUntil”: null, //flag for app lock i.e.: whether app can be edited`
    `“result”: {`

   	       `“mergeId”: 123,`
`“pages”: {`
	  `“overwritten”: [`
	  	`{`
	   `“sourcePage”: {`
		   `“id”: 123,`
		   `“name”: “screen1”,`
		   `“appId”: 1234`
`},`
   `“destinationPage”: {`
	   `“id”: 456,`
   `“name”: “screen1”,`
		   `“appId”: 1211`

`}`
`}`
         `],`
	 `“copied”: [`
	`{“id”: 999, “name”: “screen2”}`
 `]`
`},`
  `“dataSources”: {`
		`// Same structure as pages`
`},`
  `“files”: {`
		`// Same structure as pages`
	`},`
   `“limitWarnings”: {`
`“unpublishedApps”: {`
`“limit”: 5,`
`“current”: 4,`
`“percentage”: 80,`
`“message”: “You have reached your limit of {{limit}} total apps.”`
`}`
  `}`
`}`

* **Status: 200**
  `{`
    `“status”: “in progress”,`
    `“mergeId”: 123,`
    `“appLock”: true,`
    `“mergingStage”: “data-sources” //”pages”, “media”, “settings”`
  `}`
* **Status: 200**
  `{`
    `“status”: “error”,`
    `“mergeId”: 123,`
    `“appLock”: false,`
    `“message”: “Duplicated screen names found”`
  `}`

**Error Responses**

* **Status: 404**

`{`
	`“status”: “not found”`
`“error”: “App not found”`
`}`

* **Status: 400**

`{`
`“status”: “no merge”`
	`“error”: “Merge process has not been initiated for this app”`
`}`

## Fetch App Merging Logs Endpoint

**(No change) Endpoint:** `POST /v1/apps/:appId/logs`

**Usage:**
This endpoint can be used by FE to fetch detailed audit logs of app merging process by providing Sequelize query in payload.

**Request Payload:**
`{`
  `"where": {`
  `"type": {`
            	`"$iLike": "%app.merge%"`
         	`},`
        `"data":{`
            `"$contains":{`
                `"mergeId": 123`
            `}`
        `}`
    `}`
`}`

**Description:**
This endpoint will retrieve all the logs created during the app merging process for all the stages. It can be particularly useful to show progression of app merging when a user returns to UI.

**List of Audit Logs:**

* **`app.merge.initiated`** \-  Log merge parameters and details as soon as app merge has been requested.
* **`app.merge.media` \-** Log the details for merging process of app folder structure and files
* **`app.merge.newDataSources`** \-  Log new data-source details when it's being merged .
* **`app.merge.globalCode` \-** Log the status for the merging process of global code (JS, CSS, HTML) of the app.
* **`app.merge.globalAppearance` \-** Log the details for the merging process of global appearance settings (global font colors, background colors, etc.) of the app
* **`app.merge.menuSettings` \-** Log the details for merging menu widget and settings.
* **`app.merge.settings` \-** Log the details for merging app settings (hooks, languages, etc.)
* **`app.merge.screens` \-** Log the status for merging process of app screen
* **`app.merge.existingDataSources` \-** Log the status for merging process of data sources
* **`app.merge.error` \-** Contains list of errors with details
* **`app.merge.complete` \-** List the merge parameters, what was successfully merged, what wasn’t merged and what failed, etc.

**Success Response:**

Response Status: 200

```javascript
{
   "logs": [{
 	"type": "app.merge.initiated",
 	"data": { "status": "success", "mergeId": "123",... }
     },
     {
       "type": "app.merge.dataSources",
       "data": { "status": "in progress", "mergeId": "123", ... }
     },
     ...
    ]
}
```

**Error Response:**

Response Status: 404

```javascript
{
   "status": "error",
   "message": "No app merge logs are present for this app"
}
```

Response Status: 401

```javascript
{
   "status": "error",
   "message": "You do not enough permissions to perform this action"
}
```

#

# Flow Diagram

[Link](https://www.mermaidchart.com/app/projects/fa707526-e755-41b4-8c05-6cfebad6d8ef/diagrams/61811145-45d8-422b-9bf7-72d915af2be1/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiNjE4MTExNDUtNDVkOC00MjJiLTliZjctNzJkOTE1YWYyYmUxIiwiYWNjZXNzIjoiRWRpdCIsImlhdCI6MTc0OTE1MDc4Mn0.LclWJudsCRGKiSC1NHeDLiSlVUMbfcYLSEI_6DmsJLg) for flow diagram.

# Sequence Diagram

[Link](https://www.mermaidchart.com/app/projects/fa707526-e755-41b4-8c05-6cfebad6d8ef/diagrams/6d0532b4-4753-4b64-9fec-1be0c364faec/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiNmQwNTMyYjQtNDc1My00YjY0LTlmZWMtMWJlMGMzNjRmYWVjIiwiYWNjZXNzIjoiRWRpdCIsImlhdCI6MTc0OTE1MDczN30.w96_3zl6mqM7rq2-BtiqrJToqQh9U2tcHumwZMq9r5s) for sequence diagram

* The sequence diagram suggests app locking/unlocking occurs automatically when the app merge starts/completes/fails. App should be locked at an earlier point, when the user starts the app merge configuration so that the configuration remains fixed
  * This suggests we will need API endpoints for locking, unlocking and retrieving the lock status of an app (I have added a [new endpoint](#lock-an-app-to-accept-any-changes-from-studio) so that app can be locked/unlocked by frontend. I have also added **lockedUntil** property in [status endpoint](#get-current-status-of-the-app-merge) which will show whether app is locked)

# Sub-tasks and Estimates

[Project Estimates](https://docs.google.com/spreadsheets/d/1fCVkib2CfezALZWVa47M3NRblUEVi1QjLHfh4zbnTQs/edit?gid=561692829#gid=561692829)

Epic Link: [https://weboo.atlassian.net/browse/DEV-519](https://weboo.atlassian.net/browse/DEV-519)

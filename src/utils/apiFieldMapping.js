/**
 * API Field Mapping Utilities
 *
 * Provides functions to map API response fields to UI-expected field names
 * Handles field name mismatches between backend API and frontend components
 */

/**
 * Map app fields from API response to UI format
 * @param {Object} app - Raw app object from API
 * @param {Object} options - Mapping options
 * @param {Object} [options.organization] - Organization object if already fetched
 * @returns {Object} Mapped app object for UI consumption
 */
export function mapAppFields(app, options = {}) {
  if (!app) return null;

  const mapped = {
    id: app.id,
    name: app.name,
    organizationId: app.organizationId,
    region: app.region,
    updatedAt: app.updatedAt,
    lockedUntil: app.lockedUntil,
    users: app.users,
    // Map productionAppId to isPublished boolean
    isPublished: !!app.productionAppId,
    productionAppId: app.productionAppId
  };

  // Add organization name if provided
  if (options.organization) {
    mapped.organizationName = options.organization.name;
  }

  return mapped;
}

/**
 * Map data source fields from API response to UI format
 * @param {Object} dataSource - Raw data source object from API
 * @returns {Object} Mapped data source object for UI consumption
 */
export function mapDataSourceFields(dataSource) {
  if (!dataSource) return null;

  return {
    id: dataSource.id,
    name: dataSource.name,
    lastModified: dataSource.updatedAt || dataSource.lastModified,
    // Map entriesCount to entryCount
    entryCount: dataSource.entriesCount || 0,
    entriesCount: dataSource.entriesCount,
    // Map associatedPages to associatedScreens for UI terminology
    associatedScreens: dataSource.associatedPages || [],
    associatedPages: dataSource.associatedPages,
    associatedFiles: dataSource.associatedFiles || [],
    type: dataSource.type,
    // Preserve original fields
    ...dataSource
  };
}

/**
 * Map page/screen fields from API response to UI format
 * @param {Object} page - Raw page object from API
 * @returns {Object} Mapped page/screen object for UI consumption
 */
export function mapPageFields(page) {
  if (!page) return null;

  return {
    id: page.id,
    // Map 'title' to 'name' if needed
    name: page.name || page.title,
    title: page.title || page.name,
    lastModified: page.updatedAt || page.lastModified,
    // Map associatedDS to associatedDataSources
    associatedDataSources: page.associatedDS || page.associatedDataSources || [],
    associatedDS: page.associatedDS,
    associatedFiles: page.associatedFiles || [],
    order: page.order,
    // Preserve original fields
    ...page
  };
}

/**
 * Map media/files fields from API response to UI format
 * Handles merging separate files and folders arrays into single array
 * @param {Object} mediaResponse - Raw media response from API with files and folders arrays
 * @returns {Array} Flat array of files and folders with type field
 */
export function mapMediaFields(mediaResponse) {
  if (!mediaResponse) return [];

  const result = [];

  // Process folders
  if (Array.isArray(mediaResponse.folders)) {
    mediaResponse.folders.forEach(folder => {
      result.push({
        id: folder.id,
        name: folder.name,
        type: 'folder',
        path: folder.path,
        addedAt: folder.createdAt || folder.addedAt,
        // Map association field names
        associatedScreens: folder.associatedPages || [],
        associatedPages: folder.associatedPages,
        associatedDataSources: folder.associatedDS || [],
        associatedDS: folder.associatedDS,
        children: folder.children || [],
        ...folder
      });
    });
  }

  // Process files
  if (Array.isArray(mediaResponse.files)) {
    mediaResponse.files.forEach(file => {
      result.push({
        id: file.id,
        name: file.name,
        // Determine type based on file metadata
        type: file.type || determineFileType(file),
        path: file.path,
        addedAt: file.createdAt || file.addedAt,
        // Map association field names
        associatedScreens: file.associatedPages || [],
        associatedPages: file.associatedPages,
        associatedDataSources: file.associatedDS || [],
        associatedDS: file.associatedDS,
        ...file
      });
    });
  }

  return result;
}

/**
 * Determine file type based on file metadata
 * @param {Object} file - File object
 * @returns {string} File type
 */
function determineFileType(file) {
  if (file.contentType) {
    if (file.contentType.startsWith('image/')) return 'image';
    if (file.contentType.startsWith('video/')) return 'video';
    if (file.contentType.startsWith('audio/')) return 'audio';
  }

  // Check extension
  const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
  const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';

  return 'file';
}

/**
 * Map organization fields from API response to UI format
 * @param {Object} org - Raw organization object from API
 * @returns {Object} Mapped organization object
 */
export function mapOrganizationFields(org) {
  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    region: org.region,
    ...org
  };
}

/**
 * Batch map array of items using specified mapping function
 * @param {Array} items - Array of items to map
 * @param {Function} mapFn - Mapping function to apply
 * @param {Object} options - Options to pass to mapping function
 * @returns {Array} Array of mapped items
 */
export function mapArray(items, mapFn, options = {}) {
  if (!Array.isArray(items)) return [];
  return items.map(item => mapFn(item, options)).filter(Boolean);
}

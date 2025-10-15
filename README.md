# fliplet-widget-app-merge

App Merge widget for Fliplet platform - enables merging content between Fliplet apps.

## Table of Contents

- [Development](#development)
- [Testing](#testing)
- [Build & Verification](#build--verification)
- [Architecture](#architecture)
- [Mock vs Production Mode](#mock-vs-production-mode)

## Development

### Prerequisites

- Node.js 12.x
- npm

### Setup

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Project Structure

```
src/
├── components/          # Vue components
│   ├── pages/          # Page-level components
│   ├── tabs/           # Tab components for merge configuration
│   ├── layout/         # Layout components (AppShell, ProgressIndicator)
│   ├── ui/             # Reusable UI components
│   └── feedback/       # User feedback components (modals, toasts, warnings)
├── middleware/         # Business logic layer
│   ├── api/           # API service classes
│   ├── controllers/   # Business logic controllers
│   ├── core/          # Core middleware components
│   ├── config/        # Configuration files
│   └── utils/         # Utility functions
├── Application.vue    # Root application component
└── main.js           # Application entry point
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Coverage

- Current coverage: **850 tests passing**
- All major components and middleware services have comprehensive test coverage
- Tests follow behavior-driven testing principles

## Build & Verification

### Build for Production

```bash
npm run build
```

The build process:
1. Cleans the `dist` directory
2. Compiles SCSS to CSS
3. Bundles JavaScript with webpack
4. Outputs to `dist/app.js` and `dist/css/index.css`

### Verification Steps

After making changes, verify the build is healthy:

1. **Run tests**: `npm test`
   - Should show: "Test Suites: 36 passed, 36 total"
   - Should show: "Tests: 850 passed, 850 total"

2. **Run build**: `npm run build`
   - Should complete with: "webpack 5.x compiled successfully"
   - No errors should be present
   - Warnings are acceptable if non-breaking

3. **Check linting**: Build process includes ESLint validation
   - All Vue components are linted automatically during build
   - Run `npx eslint --fix src/components/**/*.vue` to auto-fix formatting issues

### Common Build Issues

#### CSS/Style Issues
- **Problem**: Scoped styles in Vue components cause build errors
- **Solution**: This project doesn't use component-scoped styles. Use Tailwind CSS classes or global SCSS instead.

#### Unused Component Warnings
- **Problem**: ESLint warns about registered but unused components
- **Solution**: Remove unused imports and component registrations. Note: Some imports may be used in methods but not as template components.

## Architecture

### Component Layer
Vue components handle UI rendering and user interaction. Major components:

- **AppShell**: Main application shell with navigation and progress tracking
- **MergeDashboard**: Source app overview and merge initiation
- **DestinationSelector**: Destination app selection with validation
- **MergeConfiguration**: Tab-based configuration interface
  - ScreensTab: Screen selection and association management
  - DataSourcesTab: Data source selection with copy mode options
  - FilesTab: File/folder selection with preview
  - SettingsTab: Merge options and settings

### Middleware Layer
The middleware provides a clean separation between UI and business logic:

- **API Services**: REST API communication (AppsApiService, PagesApiService, etc.)
- **Controllers**: Business logic orchestration (MergeConfigurationController, etc.)
- **Core Services**: Shared infrastructure (ApiClient, StateManager, ErrorHandler, etc.)

### Data Flow
```
User Interaction → Component → Middleware Controller → API Service → REST API
                                      ↓
                              State Manager (reactive state)
                                      ↓
                              Component Updates (via Vue reactivity)
```

## Mock vs Production Mode

The widget supports two modes of operation:

### Production Mode (Live API)

**When**: Deployed to Fliplet platform
**Data Source**: Live Fliplet REST APIs
**Configuration**: Automatic (uses Fliplet.API)

In production, the middleware automatically uses the Fliplet platform's API infrastructure.

### Mock Mode (Development)

**When**: Local development and testing
**Data Source**: Mock data files in `tests/mocks/`
**Configuration**: Automatic for tests

#### Mock Data Files

Located in `tests/mocks/`:
- `apps.json` - Sample app data
- `dataSources.json` - Sample data sources
- `pages.json` - Sample screen/page data
- `media.json` - Sample file/media data
- `organizations.json` - Sample organization data
- `mergeStatus.json` - Sample merge operation status

#### Switching Modes

The mode is determined automatically:

- **Tests**: Always use mocks (configured in `jest.config.js`)
- **Development**: Configure in component data functions or environment variables
- **Production**: Automatically uses live APIs when on Fliplet platform

#### Mock Data in Components

For development testing, components use mock data in their lifecycle hooks:

```javascript
async mounted() {
  // Mock data - will be replaced with actual API calls
  await Promise.resolve();
  
  this.data = [
    { id: 123, name: 'Example', ... }
  ];
}
```

#### Middleware Mocking

Tests mock middleware services:

```javascript
// In tests
jest.mock('../middleware/controllers/MergeConfigurationController');
```

### Adding New Mock Data

1. Create JSON file in `tests/mocks/`
2. Structure to match API response format
3. Import in tests or components as needed

### API Integration

When ready to integrate with live APIs:

1. Replace `Promise.resolve()` with actual API calls
2. Use middleware services (e.g., `AppsApiService.getApps()`)
3. Handle errors appropriately
4. Update tests to use API mocks instead of data mocks

## Smoke Testing Checklist

### UI Verification (Mock Mode)

Before deploying, manually verify:

#### Navigation Flow
- [ ] Dashboard loads and displays source app info
- [ ] "Configure merge" button navigates to destination selector
- [ ] Destination selector displays available apps
- [ ] Selecting an app enables "Next" button
- [ ] Next button navigates to configuration tabs

#### Tab Functionality
- [ ] All tabs are visible and clickable
- [ ] Screens tab: Table displays screens, selection works
- [ ] Data Sources tab: Table displays data sources, copy mode dropdown works
- [ ] Files tab: Table displays files/folders, folder options work
- [ ] Settings tab: Options are configurable

#### Nested Selections
- [ ] Selecting a screen shows associated data sources
- [ ] Toggling association checkboxes works
- [ ] Association changes reflect in parent selection

#### Selection Counts
- [ ] Tab badges show correct selection counts
- [ ] Counts update when selections change
- [ ] Counts include associated items

#### Error Handling
- [ ] Loading states display appropriately
- [ ] Error messages display for failed operations
- [ ] Validation errors prevent invalid actions

## Contributing

### Code Style
- Follow ESLint rules (enforced during build)
- Use Tailwind CSS for styling
- Vue components should not have scoped style blocks
- Follow existing patterns for consistency

### Testing
- Write tests for all new components
- Maintain 100% coverage for business logic
- Use behavior-driven testing principles
- Tests should not examine implementation details

### Commits
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
- Include descriptive commit messages
- Reference task numbers when applicable

## License

Copyright © 2025 Fliplet Ltd.

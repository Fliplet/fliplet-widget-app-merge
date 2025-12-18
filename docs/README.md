# App Merge UI Documentation

Complete documentation for the App Merge UI feature, organized in multiple layers for different audiences.

## Project Context

- **App ID**: 427998
- **Project Type**: Fliplet App (embedded in Studio via iframe)
- **Tech Stack**: Vue.js 3 (Composition API), Fliplet.UI.Table, Bootstrap 4, Fliplet APIs
- **Access**: Studio menu → App > Merge app...
- **Repository**: `fliplet-widget-app-merge/`

## Quick Links

- [AGENT.md](../AGENT.md) - Documentation standards and quality guidelines
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Current progress, completed work, and next steps

## For AI Agents & Developers

### Core Development Guides
- [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) - Development rules and patterns *(Phase 1)*
- [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md) - Vue.js code scaffolds *(Phase 2)*
- [Middleware Guidelines](MIDDLEWARE_GUIDELINES.md) - API middleware patterns ✅

### Technical Documentation
- [Implementation Overview](implementation/00-overview.md) - Architecture and approach ✅
- [API Technical Specification](05-api-tech-spec.md) - Backend APIs ✅
- [Implementation Roadmap](IMPLEMENTATION.md) - Phase-by-phase implementation ✅

### Pattern Library
- [Common Patterns](patterns/README.md) - Reusable patterns *(Phase 2)*
  - Loading states
  - Error handling
  - API calls
  - Lock management
  - State persistence
  - Interaction patterns

## For Non-Technical Stakeholders

### Understanding the Feature
- [GLOSSARY.md](GLOSSARY.md) - Terms and definitions *(Phase 1)*
- [USER_FLOWS.md](USER_FLOWS.md) - User journey descriptions *(Phase 3)*
- [Project PRD](01-project-prd.md) - Product requirements ✅

### Visual Design
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Colors, typography, components *(Phase 1)*
- [Design Specification](03-project-design-spec.md) - Complete UI/UX specs ✅

## Screen Specifications

Detailed specifications for each screen in the merge flow:

1. [Dashboard](screens/01-dashboard.md) - Entry screen, shows source app *(Phase 3)*
2. [Select Destination](screens/02-select-destination.md) - Choose organization and app *(Phase 3)*
3. [Configure Merge](screens/03-configure-merge.md) - Select items to merge (4 tabs) *(Phase 3)*
4. [Review & Merge](screens/04-review-merge.md) - Preview selections before execution *(Phase 3)*
5. [Merge Progress](screens/05-merge-progress.md) - Real-time execution status *(Phase 3)*
6. [Merge Complete](screens/06-merge-complete.md) - Results and next steps *(Phase 3)*

## Implementation Phases

Detailed phase-by-phase implementation guide:

- **[Phase 1](implementation/phase-1-foundation/)**: Foundation & Design System (Days 1-3) ✅
- **[Phase 2](implementation/phase-2-screens/)**: Screen-by-Screen Implementation (Days 4-10) ✅
- **[Phase 3](implementation/phase-3-integration/)**: API Integration & Testing (Days 11-14) ✅
- **[Phase 4](implementation/phase-4-polish/)**: Polish & Studio Integration (Days 15-17) ✅

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for complete phase details and [Implementation Overview](implementation/00-overview.md) for architecture.

## Component Library

### Design System Components
*(To be documented in Phase 2)*

- **MergeButton** - Standardized buttons (primary, secondary, danger)
- **MergeCard** - Card containers with variants
- **MergeAlert** - Alert/notification boxes
- **MergeModal** - Modal dialogs
- **MergeBadge** - Status badges
- **MergeProgressBar** - Progress indicators
- **MergeStepper** - Step navigation
- **MergeLoadingSpinner** - Loading states
- **MergeLockTimer** - Countdown timers

Full component registry: [templates/component-registry.md](templates/component-registry.md) *(Phase 2)*

## Templates & Tools

### Code Templates
- [Component Templates](COMPONENT_TEMPLATE.md) - Vue.js scaffolds
- [Component Registry](templates/component-registry.md) - Full component catalog

### Quality Standards
- [Documentation Review Checklist](templates/doc-review-checklist.md) - Quality checklist for documentation reviews
- [Documentation Metrics](metrics/README.md) - Quality metrics and health scoring

## Key Concepts

### The Merge Process
1. **Source App**: The app you're copying from (read-only)
2. **Destination App**: The app you're copying to (will be modified)
3. **Merge Items**: Screens, data sources, files, and settings
4. **Lock**: 15-minute reservation on destination app
5. **Merge Operations**: Copy (green), Overwrite (orange), Conflict (red)

See [GLOSSARY.md](GLOSSARY.md) for complete terminology *(Phase 1)*

### Architecture
- **Vue.js 3**: Reactive UI framework
- **Fliplet.UI.Table**: Advanced table component
- **MergeState**: Global state management
- **MergeAPI**: Middleware layer for backend calls
- **Embedded in Studio**: Opens via iframe from "App > Merge app..." menu

See [Implementation Overview](implementation/00-overview.md) for architecture details ✅

## Documentation Status

For current completion status and next steps, see [PROJECT_STATUS.md](../PROJECT_STATUS.md).

## Getting Started

**Developers**: Start with [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → [IMPLEMENTATION.md](IMPLEMENTATION.md)

**AI Assistants**: Start with [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) → [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md) → Screen specs in `screens/`

**Product/Design**: Start with [USER_FLOWS.md](USER_FLOWS.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → [GLOSSARY.md](GLOSSARY.md) → [PROJECT_STATUS.md](../PROJECT_STATUS.md)

## Contributing

### Updating Documentation
1. Follow [Documentation Review Checklist](templates/doc-review-checklist.md) for quality standards
2. Update [PROJECT_STATUS.md](../PROJECT_STATUS.md) with changes when completing major work
3. Run the 4 quality tests defined in [AGENT.md](../AGENT.md) when making significant changes
4. See maintenance principles in [AGENT.md](../AGENT.md) for when to update docs

### Adding New Patterns
1. Document in `patterns/` directory
2. Add example to [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md)
3. Update [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) if it changes conventions
4. Update [Component Registry](templates/component-registry.md)

### Creating New Screens
1. Create spec in `screens/` directory (follow existing pattern)
2. Update [USER_FLOWS.md](USER_FLOWS.md) with new flows
3. Add to implementation phase docs
4. Update [PROJECT_STATUS.md](../PROJECT_STATUS.md)

## Support & Resources

### Internal Resources
- [Fliplet Studio Documentation](https://developers.fliplet.com)
- [Fliplet.UI.Table Library](https://developers.fliplet.com/UI-Table.html)
- [Fliplet API Reference](https://developers.fliplet.com/API-Documentation.html)

### Project Resources
- **App ID**: 427998
- **Access**: Studio → App > Merge app...
- **Tech Stack**: Vue.js 3, Fliplet.UI.Table, Fliplet APIs, Bootstrap 4

---

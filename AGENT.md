# App Merge UI - AI Agent & Team Documentation Guide

## Project Context

For complete project context including App ID, tech stack, and access details, see [docs/README.md](docs/README.md).

---

## 📚 Multi-Layered Documentation Standard

This project follows a multi-layered documentation approach that enables:
- **Non-technical stakeholders** to request and review features
- **AI assistants** to generate accurate code
- **Developers** to onboard quickly and maintain consistency

### Required Documentation Layers

#### ✅ Layer 1: AI Agent Guidelines (`docs/AGENT_GUIDELINES.md`)
**Purpose**: Rules and constraints for AI assistants working on this codebase

**Must Include**:
- [ ] Component development rules
- [ ] Naming conventions (files, functions, classes, CSS)
- [ ] Mandatory patterns (state management, API calls, error handling)
- [ ] Restrictions (what NOT to do)
- [ ] Quality checklist
- [ ] Communication protocols

**Quality Criteria**:
- Rules are specific, not vague ("Use PascalCase for components" not "use good naming")
- Includes examples of correct and incorrect patterns
- Lists prohibited practices with explanations
- References other documentation files

**Example Structure**:
```markdown
# AI Agent Guidelines

## Development Rules
- Always use Vue.js 3 Composition API
- Follow MergeState pattern for state management
- Use design tokens from Global CSS

## Naming Conventions
- Components: PascalCase (e.g., MergeButton)
- Files: kebab-case (e.g., merge-button.vue)
- Functions: camelCase (e.g., fetchAppDetails)

## Restrictions
- ❌ Never bypass API middleware
- ❌ Don't create inline styles
- ✅ Always include accessibility attributes
```

#### ✅ Layer 2: Design System (`docs/DESIGN_SYSTEM.md`)
**Purpose**: Visual language accessible to designers and non-technical users

**Must Include**:
- [ ] Color palette with semantic names and hex codes
- [ ] Typography scale (sizes, weights, line heights)
- [ ] Spacing system (scale values and usage)
- [ ] Component visual specifications (buttons, cards, alerts, etc.)
- [ ] Border radius, shadows, motion timing
- [ ] Accessibility requirements (contrast, focus states)

**Quality Criteria**:
- Colors have semantic names (not just "blue-500")
- Examples show actual usage, not just values
- Includes "when to use" guidance
- No technical jargon (unless explained)
- Visual examples or mockups where helpful

#### ✅ Layer 3: Component Templates (`docs/COMPONENT_TEMPLATE.md`)
**Purpose**: Ready-to-use code scaffolds for consistent implementation

**Must Include**:
- [ ] Basic Vue component structure
- [ ] Component with state management
- [ ] Component with API integration
- [ ] Component with error handling
- [ ] Accessibility patterns (ARIA, keyboard nav)
- [ ] Common patterns library

**Quality Criteria**:
- Templates are copy-paste ready
- Includes inline comments explaining each part
- Shows loading, error, and success states
- Demonstrates proper TypeScript/prop types
- References design system tokens

#### ✅ Layer 4: Feature/Screen Specifications (`docs/screens/`)
**Purpose**: Complete specifications for each UI screen

**Must Include**:
- [ ] Purpose and user goals
- [ ] Layout structure (header, panels, sections)
- [ ] Component breakdown with examples
- [ ] Mock data structures
- [ ] API integration points
- [ ] User interactions and states
- [ ] Error scenarios

**Quality Criteria**:
- Includes visual hierarchy description
- Specifies exact copy/labels for buttons and messages
- Mock data matches real API structure
- Covers happy path AND error flows
- References components from design system

#### ✅ Layer 5: Glossary (`docs/GLOSSARY.md`)
**Purpose**: Bridge technical and business terminology

**Must Include**:
- [ ] User-facing terms (what users see/say)
- [ ] Technical terms (what code uses)
- [ ] Domain-specific concepts
- [ ] Common abbreviations
- [ ] Examples of usage

**Quality Criteria**:
- Terms listed alphabetically or by category
- Each term has clear, concise definition
- Includes examples where helpful
- Cross-references related terms
- Avoids circular definitions

#### ✅ Layer 6: User Flows (`docs/USER_FLOWS.md`)
**Purpose**: Non-technical descriptions of user journeys

**Must Include**:
- [ ] Happy path flows (step-by-step)
- [ ] Alternative paths
- [ ] Error/edge case flows
- [ ] Screen transitions
- [ ] Data transformations (user perspective)

**Quality Criteria**:
- Uses business language, not technical terms
- Numbered steps, easy to follow
- Includes decision points
- Shows what user sees at each step
- Can be understood by non-developers

#### ✅ Layer 7: Progress Tracking (`PROJECT_STATUS.md`)
**Purpose**: Current state, completed work, and next steps

**Must Include**:
- [ ] Overview of project
- [ ] Completed features/components
- [ ] Remaining work (prioritized)
- [ ] Asset requirements
- [ ] Known issues
- [ ] Testing checklist

**Quality Criteria**:
- Updated regularly (at least weekly)
- Clear ✅/❌ completion indicators
- Realistic next steps
- Links to relevant docs
- Includes blockers and dependencies

---

## 📋 Documentation Setup Checklist

Use this checklist when starting a new project or auditing existing documentation:

### Phase 1: Foundation (Week 1)
- [ ] Create `AGENT.md` with project context
- [ ] Write `docs/AGENT_GUIDELINES.md` with development rules
- [ ] Document design system in `docs/DESIGN_SYSTEM.md`
- [ ] Create `docs/GLOSSARY.md` with key terms

### Phase 2: Patterns (Week 1-2)
- [ ] Create `docs/COMPONENT_TEMPLATE.md` with code scaffolds
- [ ] Document common patterns (error handling, loading states, etc.)
- [ ] Add accessibility requirements to component templates

### Phase 3: Features (Week 2-3)
- [ ] Create `docs/screens/` directory
- [ ] Write specifications for each major screen
- [ ] Include mock data for each feature
- [ ] Document user flows in `docs/USER_FLOWS.md`

### Phase 4: Tracking (Ongoing)
- [ ] Create `PROJECT_STATUS.md` with current state
- [ ] Update status weekly or after major milestones
- [ ] Document completed features and remaining work

### Phase 5: Quality Assurance (Ongoing)
- [ ] Review all docs for consistency
- [ ] Test AI agents can generate correct code from specs
- [ ] Validate non-technical stakeholders can understand flows
- [ ] Update documentation when code changes

---

## 🎯 Documentation Quality Standards

### For All Documentation:
- **Clear**: No ambiguity, specific examples
- **Complete**: Covers happy path AND edge cases
- **Current**: Updated when code changes
- **Accessible**: Appropriate audience language
- **Actionable**: Readers know what to do next

### Testing Documentation Quality:

**Test 1: AI Assistant Test**
- Give an AI assistant only the documentation
- Ask it to implement a feature
- Success = 80%+ correct on first try

**Test 2: New Team Member Test**
- Give a new developer only the documentation
- Ask them to add a simple feature
- Success = Completes in < 1 day without asking questions

**Test 3: Non-Technical Stakeholder Test**
- Give a PM/designer the documentation
- Ask them to request a feature modification
- Success = Request is specific and actionable

**Test 4: Consistency Test**
- Compare 3 similar components in codebase
- Success = They follow same patterns and naming

---

## 📖 Examples from Successful Projects

### Example 1: Website-Events Project
Location: `/Users/twu/Sites/fliplet/website-events/docs/`

**Strengths**:
- `agents.md`: Explicit rules like "NEVER create new .md files"
- `COMPONENT_TEMPLATE.md`: Ready-to-use Astro component scaffolds
- `visual-guide.md`: Complete design tokens with no technical jargon
- `copy-plan.md`: Brand voice with approved/prohibited terms
- `pages/home-page.md`: Complete page specification with SEO, copy, images
- `PROJECT_STATUS.md`: Clear progress tracking with ✅/❌ indicators

**Result**: Marketing team can work with AI to build and modify website

### Example 2: App Merge UI Project (This Project)
Location: `/Users/twu/Sites/fliplet/widgets/fliplet-widget-app-merge/docs/`

**Current State**: Technical implementation documentation only (Phase-based roadmap)

**After Enhancement**: Adding all 7 documentation layers to enable:
- Product managers to request feature changes
- AI assistants to generate accurate Vue.js code
- Designers to understand visual specifications
- New developers to contribute in 1 day

---

## 🚀 Getting Started with Your Project

### Step 1: Copy This Template
1. Copy this `AGENT.md` file to your project root
2. Update the "Project Context" section with your details
3. Keep the rest as a reference guide

### Step 2: Create Required Directories
```bash
mkdir -p docs/screens
mkdir -p docs/implementation  # if needed
```

### Step 3: Start with Foundation Docs
1. Write `docs/AGENT_GUIDELINES.md` first
2. Document your design system
3. Create glossary of key terms
4. These enable all other documentation

### Step 4: Add Component Templates
1. Create 3-5 example components following your patterns
2. Document them as templates
3. Include common scenarios (API calls, errors, loading)

### Step 5: Document Features
1. Start with most important screen/page
2. Write complete specification
3. Include mock data and flows
4. Repeat for each feature

### Step 6: Track Progress
1. Create `PROJECT_STATUS.md`
2. Update after each milestone
3. Keep team informed of progress

---

## 🔄 Maintaining Documentation

### When Code Changes
- [ ] Update relevant documentation immediately
- [ ] Test that examples still work
- [ ] Update mock data if API changes
- [ ] Review related documentation for consistency

### Weekly Reviews
- [ ] Update `PROJECT_STATUS.md` with progress
- [ ] Check for outdated information
- [ ] Add newly discovered patterns
- [ ] Update quality metrics

### Monthly Audits
- [ ] Run all quality tests (AI, new developer, stakeholder)
- [ ] Review documentation coverage
- [ ] Identify gaps and create issues
- [ ] Celebrate improvements

---

## 📝 Documentation Maintenance Principles

### When to Update Documentation

**Immediately (Same Session):**
- After adding/changing a component
- After modifying API endpoints
- After changing design patterns
- After discovering documentation errors

**Regularly:**
- Update PROJECT_STATUS.md when completing major milestones
- Fix broken links when discovered
- Update examples when code patterns change

### Quality Maintenance

Run the 4 quality tests when:
- Making significant documentation changes
- Adding new screens or major features
- Onboarding new team members
- Every few months as a health check

**The 4 Tests:**
1. **AI Assistant Test**: Can AI generate correct code from docs alone?
2. **New Developer Test**: Can someone onboard in < 1 day?
3. **Stakeholder Test**: Can non-technical people understand and request features?
4. **Consistency Test**: Do all components follow the same patterns?

### Avoid Documentation Debt

- Don't let documentation lag behind code changes
- Update examples to stay current
- Remove outdated information immediately
- Keep PROJECT_STATUS.md as single source of truth for progress

---

## 🚫 Avoiding Documentation Redundancy

### Single Source of Truth Principle

Each piece of information should have **one canonical location**. Other documents reference it, not duplicate it.

### Redundancy Guidelines

#### ❌ DO NOT Duplicate:

1. **Project Metadata** (App ID, tech stack, access method)
   - **Source of Truth**: `docs/README.md`
   - Other docs: Reference it with link

2. **Architecture & Structure Diagrams**
   - **Source of Truth**: `docs/implementation/00-overview.md`
   - Other docs: Link to it, don't recreate

3. **Success Criteria & Testing Checklists**
   - **Source of Truth**: `PROJECT_STATUS.md`
   - Other docs: Reference it, don't duplicate

4. **Implementation Phase Descriptions**
   - **Source of Truth**: `docs/IMPLEMENTATION.md`
   - Other docs: Link to it, don't repeat details

5. **Design Token Values** (colors, spacing, typography)
   - **Source of Truth**: `docs/DESIGN_SYSTEM.md`
   - Other docs: Reference it, show minimal examples only

6. **Merge Operation Color Meanings**
   - **Source of Truth**: `docs/DESIGN_SYSTEM.md` (detailed explanations)
   - **Quick Reference**: `docs/GLOSSARY.md` (brief definitions + link)
   - Other docs: Link to DESIGN_SYSTEM.md, don't explain

7. **Development Rules & Patterns**
   - **Source of Truth**: `docs/AGENT_GUIDELINES.md`
   - Other docs: Reference it, don't duplicate code examples

#### ✅ DO Instead:

**Pattern: Reference with Context**
```markdown
<!-- ❌ WRONG: Duplicate information -->
The app uses Vue.js 3 with Composition API, Fliplet.UI.Table
for tables, and Bootstrap 4 for styling. It's embedded in
Studio via iframe at App ID 427998.

<!-- ✅ CORRECT: Reference with context -->
For project context and technical details, see [README.md](README.md).
```

**Pattern: Link to Source of Truth**
```markdown
<!-- ❌ WRONG: Recreate structure -->
## Architecture
- Vue.js 3 with Composition API
- Fliplet.UI.Table for advanced tables
- Bootstrap 4 for styling
- MergeState for state management

<!-- ✅ CORRECT: Reference -->
## Architecture

For complete architecture and technical details, see
[implementation/00-overview.md](implementation/00-overview.md).
```

**Pattern: Minimal Example with Reference**
```markdown
<!-- ❌ WRONG: List all tokens -->
### Spacing Scale
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

<!-- ✅ CORRECT: Example + reference -->
### Styling

Use design tokens from Global CSS. For complete token reference, see
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

Example:
\`\`\`css
.component {
  padding: var(--spacing-md);
  color: var(--primary-color);
}
\`\`\`
```

### Remove "Related Documentation" Sections

**❌ Don't Add These Sections:**
```markdown
## Related Documentation
- [AGENT_GUIDELINES.md](AGENT_GUIDELINES.md) - Development rules
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Visual specs
- [GLOSSARY.md](GLOSSARY.md) - Terminology
- [USER_FLOWS.md](USER_FLOWS.md) - User journeys
```

**✅ Instead:**
- Keep `docs/README.md` as the navigation hub with links
- Individual docs only link to immediate dependencies
- Use inline links within content where natural

**Exception**: Document-specific "Next Steps" are okay:
```markdown
## Next Steps

After completing this phase, see [Phase 2](../phase-2/) for screen implementation.
```

### Status Tracking

**❌ Don't Duplicate Status Tables**

Remove completion status tables from individual docs. Keep tracking centralized.

**✅ Single Location:** `PROJECT_STATUS.md`

Other docs can link to it:
```markdown
For current completion status, see [PROJECT_STATUS.md](../PROJECT_STATUS.md).
```

### When to Break the Rule

It's acceptable to repeat information when:

1. **Safety-Critical**: Security warnings, data loss warnings
2. **Convenience in Context**: Brief inline definition of term with link to glossary
3. **Examples**: Code examples demonstrating a concept (not listing all values)

### Documentation Review Checklist

Before committing documentation:

- [ ] Check if this information already exists elsewhere
- [ ] If yes, reference it instead of duplicating
- [ ] If no, is this the right location for it?
- [ ] Remove any "Related Documentation" link sections
- [ ] Ensure inline links are contextual and necessary
- [ ] Verify sources of truth are clearly marked

---

## Project-Specific Notes

For current documentation status and project progress, see [PROJECT_STATUS.md](PROJECT_STATUS.md).

For key technologies and architecture details, see [docs/README.md](docs/README.md) and [docs/implementation/00-overview.md](docs/implementation/00-overview.md).

---

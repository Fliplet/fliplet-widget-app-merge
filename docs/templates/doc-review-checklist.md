# Documentation Review Checklist

Use this checklist when reviewing or updating any documentation in the App Merge UI project.

## General Quality

- [ ] No spelling or grammar errors
- [ ] Clear, concise writing (no jargon without explanation)
- [ ] Follows project style guide
- [ ] Examples are correct and tested
- [ ] Code blocks have proper syntax highlighting
- [ ] Links work and point to correct locations
- [ ] Uses appropriate tone for target audience
- [ ] Free of outdated information

## Completeness

- [ ] Covers happy path scenarios
- [ ] Covers error scenarios
- [ ] Includes edge cases
- [ ] Has code examples where needed
- [ ] References related documentation
- [ ] Is up-to-date with current implementation
- [ ] Lists prerequisites clearly
- [ ] Provides troubleshooting guidance

## For AGENT_GUIDELINES.md

- [ ] Rules are specific and actionable (not vague)
- [ ] Includes correct and incorrect examples
- [ ] Restrictions are clearly stated with explanations
- [ ] Patterns are documented with working code
- [ ] Links to other relevant docs (design system, glossary)
- [ ] Quality checklist is comprehensive
- [ ] Common mistakes section helps prevent errors
- [ ] Testing guidelines are practical

## For DESIGN_SYSTEM.md

- [ ] All colors have hex codes and semantic names
- [ ] Typography scale is complete (sizes, weights, line heights)
- [ ] Spacing system is documented with examples
- [ ] Component specs include all variants
- [ ] Accessibility requirements stated (contrast, ARIA)
- [ ] No technical jargon (or explained if necessary)
- [ ] Visual examples show actual usage
- [ ] Includes "when to use" guidance for colors/components

## For COMPONENT_TEMPLATE.md

- [ ] Templates are copy-paste ready (syntactically correct)
- [ ] Code is tested and works as shown
- [ ] Includes comments explaining key parts
- [ ] Shows loading, error, and success states
- [ ] Demonstrates accessibility patterns (ARIA, keyboard nav)
- [ ] References design system tokens
- [ ] Includes prop definitions with types
- [ ] Shows common variations (with props, with API, etc.)

## For Screen Specifications

- [ ] Purpose clearly stated (what this screen does)
- [ ] Layout structure described (header, panels, sections)
- [ ] Component breakdown with specific examples
- [ ] Mock data provided in correct format
- [ ] API endpoints documented (request/response)
- [ ] User interactions explained (clicks, form fills)
- [ ] Error states covered (API failures, validation)
- [ ] Accessibility notes included (focus, screen readers)
- [ ] Visual hierarchy described
- [ ] Button labels and copy specified exactly

## For USER_FLOWS.md

- [ ] Steps are numbered and sequential
- [ ] Uses business language (no tech jargon)
- [ ] Includes what user sees at each step
- [ ] Shows decision points (if/else paths)
- [ ] Covers alternative paths (cancel, back button)
- [ ] Documents error recovery flows
- [ ] Can be understood by non-developers
- [ ] Matches actual implementation

## For GLOSSARY.md

- [ ] Terms listed alphabetically or by logical category
- [ ] Each term has clear, concise definition
- [ ] Includes examples of usage
- [ ] Cross-references related terms
- [ ] Avoids circular definitions
- [ ] Bridges technical and business terminology
- [ ] Covers acronyms and abbreviations
- [ ] No duplicate definitions

## For PROJECT_STATUS.md

- [ ] Overview is current and accurate
- [ ] Completed features marked clearly (with checkmarks)
- [ ] Remaining work is prioritized
- [ ] Realistic estimates provided
- [ ] Known issues documented
- [ ] Blockers and dependencies identified
- [ ] Links to relevant documentation
- [ ] Updated within last week

## For Pattern Documentation

- [ ] Pattern name clearly describes what it does
- [ ] Problem statement explains when to use it
- [ ] Solution includes working code example
- [ ] Usage notes cover common scenarios
- [ ] Anti-patterns show what NOT to do
- [ ] References design system and guidelines
- [ ] Tested and verified to work
- [ ] Accessibility considerations included

## Accessibility Verification

- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Focus indicators documented (outline, offset)
- [ ] ARIA attributes shown in examples
- [ ] Keyboard navigation described
- [ ] Screen reader guidance provided
- [ ] Alternative text for images included
- [ ] Form labels explicit (not placeholder-only)

## Cross-Reference Validation

- [ ] All internal links tested and working
- [ ] References to other docs are accurate
- [ ] Component names match registry
- [ ] API endpoint names match spec
- [ ] Design token names match global CSS
- [ ] Terminology matches GLOSSARY.md
- [ ] Code examples use documented patterns

## Review Process

### Self-Review (Author)
1. Complete this checklist before submitting
2. Test all code examples
3. Verify all links work
4. Read aloud to catch awkward phrasing

### Peer Review (Reviewer)
1. Verify completeness sections are checked
2. Test code examples independently
3. Check for consistency with existing docs
4. Confirm accessibility requirements met

### AI Assistant Test
1. Give AI only the documentation (no code access)
2. Ask it to implement a simple feature
3. Verify 80%+ of generated code is correct
4. If fails, identify gaps and improve docs

### Stakeholder Review (Optional)
1. Share with PM/designer for non-technical docs
2. Ask them to describe feature in their own words
3. Verify they understand without clarification
4. If confused, simplify language or add examples

## Continuous Improvement

After completing review:
- [ ] Document any patterns discovered
- [ ] Update templates if new patterns emerge
- [ ] Add to GLOSSARY.md if new terms introduced
- [ ] Update AGENT_GUIDELINES.md if rules change
- [ ] Share learnings with team

## Quality Metrics

Track these metrics for documentation health:

- **Accuracy**: 100% of examples work as shown
- **Completeness**: All required sections present
- **Clarity**: Non-technical readers understand flows
- **Consistency**: Same terminology used throughout
- **Currency**: Updated within 1 week of code changes

## Common Issues to Watch For

### Vague Language
- ❌ "Configure the settings properly"
- ✅ "Set `variant` prop to 'primary' for main actions"

### Missing Context
- ❌ "Call the API"
- ✅ "Call `MergeAPI.fetchApps(organizationId)` to load apps"

### Outdated Examples
- ❌ Code that no longer works
- ✅ Tested examples that match current implementation

### Circular References
- ❌ "See merge process for merge details"
- ✅ "See GLOSSARY.md for term definitions"

### Jargon Without Explanation
- ❌ "Use BEM for CSS classes"
- ✅ "Use BEM (Block Element Modifier) for CSS classes like `.merge-card__header`"

---

**Last Updated**: December 18, 2024
**Version**: 1.0
**Applies To**: All documentation in `docs/` directory

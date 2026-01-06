# Testing Guide

This document provides guidance for testing the Personality Assessment application.

## Pre-Deployment Testing

### Build Testing

1. **Clean Build**
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```
   ✅ Should complete without errors
   ✅ Should create `dist/` directory with assets

2. **Preview Build**
   ```bash
   npm run preview
   ```
   ✅ Should start local server
   ✅ App should load at provided URL

### Development Testing

```bash
npm run dev
```
✅ Should start dev server without errors
✅ Hot reload should work when editing files

## Functional Testing

### 1. Welcome Screen

- [ ] Page loads without errors
- [ ] Name input field is visible and functional
- [ ] Cannot submit with empty name
- [ ] "Begin Assessment" button works
- [ ] Layout is responsive on mobile/tablet/desktop
- [ ] All text is readable and properly formatted

### 2. Assessment Flow

**Navigation:**
- [ ] Progress bar displays correctly
- [ ] Question counter shows "X of 90 answered"
- [ ] Estimated time remaining updates as questions are answered
- [ ] Page indicator shows "Page X of Y"
- [ ] "Previous" button disabled on first page
- [ ] "Previous" button works on subsequent pages
- [ ] "Next" button disabled until all page questions answered
- [ ] "Next" button works when page is complete
- [ ] Last page shows "Complete Assessment" instead of "Next"
- [ ] "Complete Assessment" disabled until all 90 questions answered

**Questions:**
- [ ] All 90 questions display correctly
- [ ] 5 questions per page
- [ ] Each question shows context label (Usually) or (Under Stress)
- [ ] Context labels have correct colors (blue/orange)
- [ ] All 5 Likert scale options display for each question
- [ ] Clicking an option selects it visually
- [ ] Can change answer by clicking different option
- [ ] Selected answers persist when navigating between pages
- [ ] No duplicate questions appear
- [ ] All questions are clearly worded and understandable

**Responsiveness:**
- [ ] Questions display properly on mobile (single column)
- [ ] Questions display properly on tablet
- [ ] Questions display properly on desktop (grid layout)
- [ ] Touch targets are appropriately sized for mobile

### 3. Results Screen

**Display:**
- [ ] Results page loads after completing assessment
- [ ] User name displays correctly
- [ ] Archetype icon and name display
- [ ] Archetype description is visible
- [ ] Top 3 strengths show with percentile scores
- [ ] Adaptability score displays (0-100)
- [ ] Dimension scorecard shows all 6 dimensions
- [ ] Each dimension shows both usual and stress scores
- [ ] Visual bars represent scores accurately
- [ ] Delta (Δ) values show difference between usual and stress

**Buttons:**
- [ ] "Download Full PDF Report" button is visible
- [ ] "Take Assessment Again" button is visible
- [ ] Both buttons are clickable and styled correctly

**Responsiveness:**
- [ ] Layout adapts properly to mobile screens
- [ ] All content is readable on small screens
- [ ] No horizontal scrolling required

### 4. PDF Generation

**Basic Functionality:**
- [ ] Clicking "Download Full PDF Report" starts generation
- [ ] Button shows "Generating PDF..." during generation
- [ ] PDF downloads successfully
- [ ] Filename includes user name (e.g., "John_Doe_Personality_Assessment.pdf")
- [ ] Can generate PDF multiple times

**PDF Content - Page 1 (Cover):**
- [ ] User name displays correctly
- [ ] Current date displays
- [ ] Title "Personality Profile" is present
- [ ] Professional appearance with blue background

**PDF Content - Page 2 (Executive Summary):**
- [ ] "Executive Summary" heading
- [ ] Archetype name and icon
- [ ] Brief description of archetype
- [ ] "Key Insights" section with top 3 dimensions
- [ ] "Stress Response" section
- [ ] "Top Strengths" section

**PDF Content - Page 3 (Dimension Scorecard):**
- [ ] All 6 dimensions listed
- [ ] Usual and Stress scores for each
- [ ] Delta (Δ) values shown
- [ ] Visual bars for each dimension
- [ ] Blue bars for usual behavior
- [ ] Orange bars for stress behavior
- [ ] Legend explaining colors

**PDF Content - Pages 4-7 (Dimension Profiles):**
- [ ] Top 4 dimensions by score are included
- [ ] Each dimension has its own section
- [ ] Dimension name and scores shown
- [ ] "What This Means for You" narrative
- [ ] "Your Stress Behavior" description
- [ ] "Real Workplace Scenarios" (3 examples)
- [ ] "Development Tips" (3-4 tips)
- [ ] Content is personalized based on score level (low/medium/high)

**PDF Content - Pages 8-9 (Archetype Portrait):**
- [ ] Archetype name and icon
- [ ] Narrative introduction
- [ ] Core Strengths listed (3-4 items)
- [ ] Potential Blind Spots (2-3 items)
- [ ] Typical Career Paths (3-4 items)
- [ ] Team Role description
- [ ] Leadership Style description

**PDF Content - Page 10 (Team Dynamics):**
- [ ] "Team Dynamics Matrix" heading
- [ ] Descriptions of working with other 7 archetypes
- [ ] Each archetype shows icon and name
- [ ] Synergy level indicated (High/Medium/Low)
- [ ] Practical tips for each pairing

**PDF Content - Page 11 (Career Guidance):**
- [ ] "Career Guidance" heading
- [ ] Roles that play to strengths
- [ ] Where you thrive (environment description)
- [ ] Growth opportunities (3-4 items)
- [ ] Potential career pitfalls (2-3 items)

**PDF Content - Page 12 (Stress & Resilience):**
- [ ] "Stress & Resilience Insights" heading
- [ ] Stress profile description
- [ ] Stress triggers for the archetype
- [ ] Coping strategies (3-4 items)
- [ ] Team support needs
- [ ] Recovery recommendations

**PDF Content - Page 13 (Summary Dashboard):**
- [ ] "Your Profile Summary" heading
- [ ] Archetype icon and name
- [ ] All 6 dimension scores (usual | stress)
- [ ] Top 3 strengths highlighted
- [ ] Adaptability score displayed
- [ ] Footer with user name and date

**PDF Quality:**
- [ ] All text is readable (no blurry or cut-off text)
- [ ] Pages are properly formatted (no overlapping content)
- [ ] Page breaks occur at appropriate places
- [ ] Colors render correctly
- [ ] Consistent formatting throughout
- [ ] No console errors during generation

## Edge Case Testing

### Assessment Behavior

**Navigation:**
- [ ] Can navigate backward through entire assessment
- [ ] Answers persist when going back multiple pages
- [ ] Can change answers on any previous page
- [ ] Progress bar updates correctly when changing answers
- [ ] Cannot skip pages without answering all questions

**Input Validation:**
- [ ] Cannot submit assessment with unanswered questions
- [ ] Clear error message if trying to complete incomplete assessment
- [ ] All 90 questions must be answered to complete

### Score Validation

Test with extreme inputs:

**All Minimum Responses (All 1s):**
- [ ] Produces low scores across all dimensions (0-33 range)
- [ ] Archetype is determined correctly
- [ ] PDF generates without errors
- [ ] Content matches "low score" templates

**All Maximum Responses (All 5s):**
- [ ] Produces high scores across all dimensions (67-100 range)
- [ ] Archetype is determined correctly
- [ ] PDF generates without errors
- [ ] Content matches "high score" templates

**Mixed Responses:**
- [ ] Produces varied scores across dimensions
- [ ] Archetype reflects top 2 dimensions
- [ ] Personalized content matches actual scores
- [ ] No dimension descriptions are missing or incorrect

**Identical Usual and Stress:**
- [ ] All deltas are 0
- [ ] Adaptability score is 100
- [ ] Stress insights reflect consistency

**Opposite Usual and Stress:**
- [ ] Large positive or negative deltas
- [ ] Lower adaptability score
- [ ] Stress insights reflect significant changes

## Browser Compatibility

Test on multiple browsers:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

For each browser:
- [ ] App loads correctly
- [ ] Assessment functions properly
- [ ] PDF generates successfully
- [ ] No console errors
- [ ] Layout renders correctly

## Performance Testing

- [ ] App loads in under 3 seconds on good connection
- [ ] Assessment transitions are smooth
- [ ] No lag when selecting answers
- [ ] PDF generates in under 5 seconds
- [ ] No memory leaks during extended use
- [ ] Can complete multiple assessments in one session

## Accessibility Testing

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] Form inputs have proper labels
- [ ] Buttons have descriptive text
- [ ] Text is readable (appropriate font sizes)

## Mobile Testing

**Portrait Mode:**
- [ ] All content is readable
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough
- [ ] Buttons are easy to tap
- [ ] Assessment is usable one-handed

**Landscape Mode:**
- [ ] Layout adapts appropriately
- [ ] Content remains accessible
- [ ] No awkward gaps or overlaps

## Deployment Testing

After deploying to GitHub Pages:
- [ ] App loads at correct URL
- [ ] No 404 errors for assets
- [ ] All functionality works in production
- [ ] PDF generation works in production
- [ ] No console errors in production
- [ ] HTTPS works correctly
- [ ] Can share direct link to app

## Data Validation

- [ ] Exactly 90 questions in questions.json
- [ ] Each dimension has 15 questions
- [ ] Each context has questions for all 6 dimensions
- [ ] All questions have required fields (id, dimension, context, text, reverse)
- [ ] Question IDs are unique
- [ ] All 8 archetypes are defined
- [ ] Each archetype has all required fields
- [ ] Dimension descriptions exist for all 6 dimensions
- [ ] Each dimension has low/medium/high score variants

## Regression Testing

After making changes, verify:
- [ ] Build still completes successfully
- [ ] No new console errors
- [ ] Assessment flow unchanged (unless intentionally modified)
- [ ] PDF still generates correctly
- [ ] All existing features still work
- [ ] No broken links or missing resources

## Bug Report Template

When issues are found:

**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Environment:**
- Browser:
- Device:
- OS:
- Screen size:

**Screenshots/Console Errors:**
[Attach if applicable]

---

## Test Sign-Off

Before considering the app production-ready:
- [ ] All critical tests pass
- [ ] All high-priority tests pass
- [ ] Known issues are documented
- [ ] Performance is acceptable
- [ ] Mobile experience is good
- [ ] PDF quality is professional
- [ ] No data privacy issues
- [ ] Deployment is successful

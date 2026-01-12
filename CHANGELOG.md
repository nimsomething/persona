# Changelog

All notable changes to the Birkman Personality Assessment will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2024-01-12

### Added - Major v3.0 Release

#### Birkman Color Model (Pages 5-11)
- **Four Birkman Colors**: Red (Action-Oriented Doer), Green (Analytical Thinker), Yellow (Enthusiastic Collaborator), Blue (Supportive Stabilizer)
- Primary and secondary color determination
- Color spectrum percentages across all four colors
- Detailed color descriptions including behavioral examples, strengths, work focus, and stress patterns

#### 9 Personality Components (Pages 14-24)
- **Social Energy**: Preference for social interaction vs. solitary work
- **Physical Energy**: Activity level and need for physical engagement
- **Emotional Energy**: Emotional expressiveness and intensity
- **Self-Consciousness**: Awareness of others' perceptions
- **Assertiveness**: Tendency to take charge and influence
- **Insistence**: Preference for having things done your way
- **Incentives**: Motivation by external rewards vs. intrinsic satisfaction
- **Restlessness**: Need for variety and change vs. stability
- **Thought**: Abstract/theoretical vs. concrete/practical thinking
- "Usual Behavior" and "Needs" scores for each component
- Gap analysis between usual behavior and needs
- Detailed component descriptions with stress triggers

#### Birkman Internal States (Pages 6-11)
- **Interests**: What naturally draws your attention and energy
- **Usual Behavior**: How you typically show up day-to-day
- **Needs**: Environmental conditions you require to thrive
- **Stress Behavior**: How you respond when needs aren't met
- Each state mapped to its own Birkman color spectrum
- Visual Birkman Map with all four states plotted

#### Career Guidance Enhancement (Pages 25-30)
- **8 Career Families**: Leadership & Management, Analytical & Technical, Creative & Design, Sales & Business Development, Helping & Service, Administrative & Operational, Entrepreneurial & Innovation, Skilled Trades & Craftsmanship
- Alignment scoring for each career family based on personality profile
- Detailed career family descriptions with typical roles and work environments
- Top 3-4 aligned career areas with personalized explanations
- Ideal work environment analysis (team structure, decision-making, pace, communication, rewards, structure)

#### Expanded PDF Report (32 pages, up from 13)
- **Pages 1-3**: Cover, Table of Contents, Welcome
- **Pages 4-5**: Background & Purpose, Birkman Color Key
- **Pages 6-11**: Birkman Map with all 4 internal states
- **Pages 12-13**: Interests section
- **Pages 14-15**: Components overview and dashboard
- **Pages 16-24**: Individual component deep-dives (9 pages)
- **Pages 25-26**: Career exploration overview
- **Pages 27-28**: Top career areas (2 pages)
- **Page 29**: Ideal work environment
- **Page 30**: Growth opportunities & development
- **Page 31**: Action plan worksheet
- **Page 32**: One-page summary dashboard

#### V2 to V3 Upgrade Path
- 20 new upgrade questions (IDs 121-140) for v2 users
- Upgrade assessment takes 10-15 minutes (vs. 20-25 for full assessment)
- Blends v2 dimension scores with v3 component scores
- Preserves all original v2 data and metadata
- Tracks upgrade history (original completion date, upgrade date, versions)
- Upgrade service with validation and blending logic

#### New Services & Architecture
- **birkmanMappingService**: Birkman color calculation, internal states, component mapping
- **upgradeService**: V2→V3 upgrade logic, eligibility checking, score blending
- Enhanced **storageService**: V3 data persistence, upgrade tracking
- Enhanced **scoring.js**: Component calculation, Birkman state calculation, blending functions

#### UI Enhancements
- Results page with 4 tabs: Birkman Colors, Components, Internal States, Download Report
- Component dashboard with responsive grid (4 col desktop, 2 col tablet, 1 col mobile)
- Expandable component cards with full details
- Birkman color badges and spectrum visualizations
- Internal states display with color spectrums and gap analysis
- Enhanced Welcome component with v2 recovery and upgrade options
- Version-aware UI elements

#### Data & Configuration
- New data files: `birkman_colors.json`, `components.json`, `career_families.json`
- 20 upgrade questions in `questions.json` (total now 140 questions)
- Upgrade questions tagged with `upgrade_only: true` and `targets` arrays

### Changed

#### Scoring System
- `calculateDimensionScores()` now returns components, birkman_color, birkman_states
- Added `calculateComponentScores()`, `calculateBirkmanStates()`, `calculateBirkmanColor()`
- Added `blendV2withUpgradeAnswers()` for upgrade logic
- Enhanced `getArchetypeFromScores()` with Birkman color mapping

#### Storage
- `saveCompletedAssessment()` now accepts version parameter (default '3.0.0')
- Assessment objects now include v3 fields: components, birkman_color, birkman_states, upgradedFrom
- Added `upgradeAssessmentFromV2()` method
- Improved logging for version tracking

#### Metadata
- App version: **3.0.0**
- App name: "Birkman Personality Assessment" (was "Personality Assessment")
- Package name: "birkman-personality-assessment-v3"

### Fixed
- Component scoring now deterministic and consistent
- Gap analysis calculations validated
- Internal state color spectrum normalization (always sums to 100%)
- Upgrade blending weights optimized for accuracy

### Technical Details
- Dependencies: No new dependencies added
- Browser support: Chrome, Firefox, Safari, Edge (latest versions)
- Performance: PDF generation ~3-5 seconds, file size ~2-3 MB
- Mobile responsive: Full support for mobile, tablet, desktop

### Backward Compatibility
- ✅ **Fully backward compatible**: All v2 assessments can be loaded and viewed
- ✅ **One-way upgrade path**: V2 assessments can be upgraded to v3
- ✅ **Data preservation**: All v2 dimension scores, archetypes, and metadata preserved
- ✅ **No breaking changes**: Existing v2 assessments continue to work

### Migration Guide
**For v2 Users:**
1. Open app → v2 assessment detected
2. Choose "Upgrade to v3" option
3. Answer 20 additional questions (~10-15 minutes)
4. Receive enhanced 32-page report with all v3 features
5. Original v2 data and completion date preserved

**For Developers:**
- Import new services: `birkmanMappingService`, `upgradeService`
- Use enhanced `calculateDimensionScores()` for v3 features
- Check version compatibility with `isCompatibleVersion(version)`
- Handle both v2 and v3 assessment structures in UI

---

## [2.0.1] - 2024-01-10

### Fixed
- Results saving logic moved to useEffect in Results component
- Auto-save reliability improvements
- Session recovery validation

### Changed
- Logger service enhancements
- Storage operation tracking improvements

---

## [2.0.0] - 2024-01-08

### Added
- 8 core personality dimensions
- 8 personality archetypes
- MBTI mapping
- Values profile (6 dimensions)
- Work style profile (5 dimensions)
- 13-page PDF report generation
- Session auto-save and recovery
- Comprehensive logging system
- Version tracking

### Technical
- React 18 with Vite
- Tailwind CSS styling
- jsPDF for PDF generation
- localStorage for persistence

---

## [1.0.0] - 2023-12-15

### Added
- Initial release
- Basic personality assessment
- Simple scoring system
- Basic PDF export

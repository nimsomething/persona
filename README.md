# Personality Assessment Web App

A comprehensive Birkman-style personality assessment tool that measures 6 core dimensions across dual profiles (usual and stress behavior) and generates personalized PDF reports with detailed insights.

## Features

### Assessment
- **90-120 questions** measuring 8 core dimensions and profiles
- **Dual-profile testing**: Measures both usual behavior and stress behavior
- **5-point Likert scale** format for nuanced responses
- **Progress tracking** with estimated time remaining
- **Mobile-responsive design** works on all devices
- **Question navigation** allows reviewing and changing answers
- **Auto-save functionality**: Progress saved every 3 questions
- **Session recovery**: Resume interrupted assessments automatically
- **Results persistence**: View previous assessments after refresh
- **Comprehensive logging**: Debug mode for troubleshooting (add `?debug=true` to URL)

### Eight Core Dimensions
1. **Assertiveness** - Initiative, confidence, directness
2. **Sociability** - Openness, engagement, relationship-building
3. **Conscientiousness** - Attention to detail, reliability, planning
4. **Flexibility** - Adaptability, openness to change
5. **Emotional Intelligence** - Empathy, self-awareness, interpersonal sensitivity
6. **Creativity** - Innovation, original thinking, artistic expression
7. **Risk Appetite** - Comfort with uncertainty, decision-making under risk
8. **Theoretical Orientation** - Preference for abstract concepts vs. practical application

### Eight Archetypes
- **The Strategist** (high assertiveness + conscientiousness)
- **The Connector** (high sociability + emotional intelligence)
- **The Stabilizer** (high patience + conscientiousness)
- **The Innovator** (high flexibility + assertiveness)
- **The Advocate** (high emotional intelligence + sociability)
- **The Leader** (high assertiveness + emotional intelligence)
- **The Analyst** (high conscientiousness + patience)
- **The Catalyst** (high flexibility + sociability)

### Comprehensive PDF Report (9 Sections)

1. **Cover Page** - Personalized with user name and date
2. **Executive Summary** - Archetype overview, key insights, top strengths
3. **Dimension Scorecard** - Visual dashboard comparing usual vs. stress scores
4. **Detailed Dimension Profiles** - In-depth analysis of top 4 dimensions with:
   - Narrative descriptions personalized to score levels
   - Stress behavior comparisons
   - Real workplace scenarios
   - Actionable development tips
5. **Archetype Portrait** - Complete profile including:
   - Core strengths and blind spots
   - Career paths and team role
   - Leadership style
6. **Team Dynamics Matrix** - How your archetype works with all 8 types
7. **Career Coaching Guidance** - Personalized career advice
8. **Stress & Resilience Insights** - Triggers, coping strategies, recovery recommendations
9. **Summary Dashboard** - One-page visual overview

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Hosting**: GitHub Pages (static site)

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd birkman-personality-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploying to GitHub Pages

1. Update the `base` property in `vite.config.js` to match your repository name:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
})
```

2. Build the project:
```bash
npm run build
```

3. Deploy the `dist` folder to GitHub Pages:
```bash
# Using gh-pages package (install if needed: npm install -D gh-pages)
npx gh-pages -d dist

# Or manually: Push the dist folder to the gh-pages branch
```

4. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select the `gh-pages` branch
   - Save

Your app will be available at `https://yourusername.github.io/your-repo-name/`

## Project Structure

```
src/
├── components/          # React components
│   ├── Assessment.jsx   # Main assessment flow
│   ├── Question.jsx     # Individual question component
│   ├── ProgressBar.jsx  # Progress indicator
│   ├── Results.jsx      # Results display with error handling
│   ├── Welcome.jsx      # Welcome screen with recovery UI
│   ├── DimensionScorecard.jsx  # Score visualization
│   └── VersionFooter.jsx      # Version display
├── services/            # Business logic and services
│   ├── loggerService.js        # Centralized logging system
│   ├── storageService.js       # localStorage management
│   └── mbtiMappingService.js   # MBTI calculation
├── data/               # JSON data files
│   ├── questions.json              # Question bank
│   ├── archetypes.json             # Archetype definitions
│   └── dimensionDescriptions.json  # Dimension content
├── utils/              # Utility functions
│   ├── scoring.js      # Scoring logic
│   ├── pdfGeneratorV2.js # PDF generation with error handling
│   ├── appMeta.js      # App version metadata
│   └── debug.js        # Debug utilities
├── App.jsx             # Main app component with recovery logic
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Debugging and Logging

### Enabling Debug Mode

Add `?debug=true` to the URL to enable detailed logging:

```
http://localhost:5173/?debug=true
```

### Debug Features

- Detailed console logs with timestamps and categories
- Storage operations logged for troubleshooting
- Logger exposed to window as `window.__logger`
- Export debug logs as JSON for analysis

### Log Categories

- `storage`: localStorage operations
- `assessment`: Assessment lifecycle events
- `pdf`: PDF generation events
- `ui`: UI interactions
- `app`: Application-level events

For more details, see [VERSIONING.md](VERSIONING.md).

## Customization

### Modifying Questions
Edit `src/data/questions.json` to add, remove, or modify questions. Each question has:
- `id`: Unique identifier
- `dimension`: Which dimension it measures
- `context`: "usual" or "stress"
- `text`: The question text
- `reverse`: Whether scoring should be reversed

### Customizing Archetypes
Edit `src/data/archetypes.json` to modify archetype descriptions, strengths, career paths, etc.

### Adjusting Dimension Descriptions
Edit `src/data/dimensionDescriptions.json` to customize the narrative content for different score levels.

## Content Guidelines

The assessment follows these principles:
- **Straightforward language**: Minimal metaphors, clear explanations
- **Workplace-focused**: Concrete scenarios from professional contexts
- **Personalized**: Content adapts based on actual scores
- **Honest**: Addresses both strengths and growth areas constructively
- **Actionable**: Provides specific, practical recommendations

## License

This project is available for educational and personal use.

## Acknowledgments

Inspired by the Birkman Method and similar personality assessment frameworks, adapted for modern web delivery with comprehensive personalized reporting.

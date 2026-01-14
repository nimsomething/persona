# Quick Start Guide

Get the Personality Assessment app running in under 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 3. Take a Test Assessment

1. Enter your name (e.g., "Test User")
2. Answer all 140 questions (120 core + 20 if upgrading from v2)
3. View your results
4. Generate and download the PDF report

## 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 5. Preview Production Build

```bash
npm run preview
```

## That's It!

You now have a fully functional personality assessment app.

---

## Next Steps

### To Deploy to GitHub Pages

1. Update `vite.config.js` with your repository name:
   ```javascript
   base: '/your-repo-name/'
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. Enable GitHub Pages in repository settings:
   - Settings → Pages
   - Source: GitHub Actions

4. Access your app at:
   ```
   https://yourusername.github.io/your-repo-name/
   ```

### To Customize

- **Questions**: Edit `src/data/questions.json`
- **Archetypes**: Edit `src/data/archetypes.json`
- **Dimension Descriptions**: Edit `src/data/dimensionDescriptions.json`
- **Styling**: Modify Tailwind classes in component files
- **PDF Layout**: Edit `src/utils/pdfGenerator.js`

### Documentation

- **README.md** - Complete project overview
- **DEPLOYMENT.md** - Detailed deployment instructions
- **SCORING_GUIDE.md** - How scoring works
- **TESTING.md** - Comprehensive testing checklist

---

## Common Issues

**Problem**: `npm install` fails
- **Solution**: Ensure you have Node.js 16+ installed

**Problem**: Port 5173 already in use
- **Solution**: Kill the process using that port or Vite will automatically use a different port

**Problem**: PDF generation doesn't work
- **Solution**: Check browser console for errors; ensure all data files are present

**Problem**: Build succeeds but deployed site is blank
- **Solution**: Check that `base` in `vite.config.js` matches your repository name

---

## Support

For detailed information, see the main README.md or other documentation files.

Happy assessing! 🎯

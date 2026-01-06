# Deployment Guide

This guide will help you deploy the Personality Assessment web app to GitHub Pages.

## Quick Deployment Steps

### 1. Prepare Your Repository

1. Create a new repository on GitHub (or use an existing one)
2. Note your repository name (e.g., `personality-assessment`)

### 2. Update Configuration

Open `vite.config.js` and update the `base` property to match your repository name:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/personality-assessment/', // Replace with your repo name
})
```

**Important**: The base path must match your GitHub repository name exactly, including the leading and trailing slashes.

### 3. Option A: Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the repository.

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Enable GitHub Pages in your repository:
   - Go to your repository on GitHub
   - Click **Settings** > **Pages**
   - Under "Build and deployment", select:
     - Source: **GitHub Actions**
   - Save

3. The deployment will start automatically. Check the **Actions** tab to monitor progress.

4. Once complete, your app will be available at:
   ```
   https://yourusername.github.io/your-repo-name/
   ```

### 3. Option B: Manual Deployment

If you prefer to deploy manually:

1. Install the gh-pages package:
```bash
npm install -D gh-pages
```

2. Add a deploy script to `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

4. Enable GitHub Pages:
   - Go to **Settings** > **Pages**
   - Select branch: **gh-pages**
   - Click **Save**

## Troubleshooting

### Issue: App shows blank page after deployment

**Solution**: Check that the `base` property in `vite.config.js` matches your repository name exactly.

### Issue: CSS or JavaScript files not loading

**Solution**: Verify the base path is correct. The app should be at `https://username.github.io/repo-name/` and the base should be `/repo-name/`.

### Issue: GitHub Actions deployment fails

**Solution**: 
1. Check the Actions tab for error details
2. Ensure you have enabled GitHub Pages in Settings
3. Verify your Node version in `.github/workflows/deploy.yml` matches your local version

### Issue: Build succeeds but deployment doesn't update

**Solution**: 
1. Clear your browser cache
2. Check that you pushed to the correct branch (main or your feature branch)
3. Wait a few minutes - GitHub Pages can take time to update

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain name:
   ```
   assessment.yourdomain.com
   ```

2. Update your domain's DNS settings to point to GitHub Pages:
   - Add a CNAME record pointing to `yourusername.github.io`

3. In GitHub repository settings > Pages, enter your custom domain

4. Update `vite.config.js` to use root path:
   ```javascript
   base: '/'
   ```

## Local Testing Before Deployment

Always test your build locally before deploying:

```bash
npm run build
npm run preview
```

Open the URL shown (usually `http://localhost:4173`) and test all functionality:
- Take the assessment
- Generate a PDF report
- Verify all navigation works
- Test on mobile viewport

## Environment-Specific Configuration

The app is currently configured for production deployment. If you need different configurations for different environments, you can use Vite's environment variables.

Create `.env.production`:
```
VITE_BASE_PATH=/your-repo-name/
```

Then update `vite.config.js`:
```javascript
base: import.meta.env.VITE_BASE_PATH || '/',
```

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] All questions display correctly
- [ ] Progress bar works
- [ ] Navigation (Previous/Next) works
- [ ] Assessment completes successfully
- [ ] Results page displays correctly
- [ ] PDF generation works
- [ ] PDF contains all expected sections
- [ ] PDF downloads with correct filename
- [ ] Mobile responsive design works
- [ ] No console errors

## Monitoring and Analytics (Optional)

To track usage, you can add analytics:

1. **Google Analytics**: Add the GA4 tracking code to `index.html`
2. **Plausible**: Add the script tag for privacy-friendly analytics
3. **GitHub Insights**: Monitor traffic in your repository's Insights tab

## Updating Content

To update questions, archetypes, or descriptions:

1. Edit the respective JSON file in `src/data/`
2. Test locally with `npm run dev`
3. Build and verify: `npm run build && npm run preview`
4. Commit and push (auto-deploy) or run `npm run deploy`

## Support

For issues or questions:
1. Check the main README.md for project documentation
2. Review the troubleshooting section above
3. Check the GitHub Actions logs for deployment errors
4. Verify your configuration matches this guide

---

**Note**: This app is fully client-side with no backend requirements. All processing happens in the user's browser, making it fast, private, and easy to deploy.

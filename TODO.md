# Deployment Fix for Network Error - Retry Logic for Render Cold Starts

## Current Status
- [x] 1. Edit frontend/src/components/api.js: Add retry logic to fetch (3 retries with exponential backoff for failures).
- [x] 2. Build frontend: cd frontend; npm run build. (Includes user edits to Home.js and Footer.js)
- [x] 3. Add build files to Git: git add -A (stages all changed build artifacts, api.js, Home.js, Footer.js).
- [x] 4. Commit: git commit -m "Add API retry logic for Render cold starts and rebuild (includes Home.js and Footer.js updates)".
- [x] 5. Push: git push origin gh-pages.
- [ ] 6. Test: Verify Universities and Companies pages load data without network errors after deployment.

## Notes
- Backend is live and functional (Firebase connected, CORS enabled).
- Issue: Render cold starts cause initial API requests to timeout/503.
- Solution: Retries in frontend handle delays (~10-20s wakeup).
- User edits: Home.js and Footer.js included in build.
- Build warnings: ESLint issues (unused vars, deps) – non-blocking.

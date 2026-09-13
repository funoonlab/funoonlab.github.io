# Funoon Lab Static Website

This repository contains the visual-faithful static frontend for the Funoon Lab website. The pages preserve the previous The7/Elementor design, but the site no longer depends on a live WordPress runtime, PHP, `wp-content/`, or `wp-includes/` paths.

## Commands

```sh
npm run validate
python -m http.server 8080
```

Then visit `http://localhost:8080/`.

`npm run build` is available for rebuilding the visual static export after restoring the original WordPress-export source files from git.

## Structure

- Static route HTML lives at the same public paths as before.
- `assets/media/` contains migrated uploads and project images.
- `assets/vendor/` contains local static theme/plugin/browser runtime assets needed to preserve the previous design.
- `assets/css/generated/` contains externalized CSS that was previously inline in the export.
- `assets/js/generated/` contains externalized JavaScript config/runtime snippets that were previously inline in the export.
- `assets/css/static-site.css` and `assets/js/static-site.js` contain small static-only helpers.
- `assets/js/analytics.js` adds Google Analytics site-wide.
- `scripts/validate-site.mjs` checks page count, local asset references, and removed WordPress backend paths.

## Analytics

Google Analytics is added site-wide with measurement ID `G-MPPC8HMV6S`.

## Maintenance

This site intentionally keeps the local The7/Elementor static assets because they are what preserve the original visual design. Do not remove `assets/vendor/`, `assets/css/generated/`, or `assets/js/generated/` unless a visual regression test confirms the pages still match.

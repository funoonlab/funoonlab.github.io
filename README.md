# Funoon Lab Static Website

This repository contains the visual-faithful static frontend for the Funoon Lab website. The pages preserve the previous The7/Elementor design, but the site no longer depends on a live WordPress runtime, PHP, `wp-content/`, or `wp-includes/` paths.

## Commands

```sh
npm run build
npm run validate
python -m http.server 8080
```

Then visit `http://localhost:8080/`.

`npm run build` rebuilds the visual static export and then runs validation. It is safe to run against the current already-static checkout.

## Structure

- Static route HTML lives at the same public paths as before.
- `assets/media/` contains migrated uploads and project images.
- `assets/vendor/` contains only the reachable static theme/plugin/browser runtime assets needed to preserve the previous design.
- `assets/css/generated/` contains externalized CSS that was previously inline in the export.
- `assets/js/generated/` contains externalized JavaScript config/runtime snippets that were previously inline in the export.
- `assets/css/static-site.css` and `assets/js/static-site.js` contain small static-only helpers.
- `assets/js/analytics.js` adds Google Analytics site-wide.
- `scripts/validate-site.mjs` checks page count, HTML/CSS/JS asset references, and removed WordPress backend paths.

## Analytics

Google Analytics is added site-wide with measurement ID `G-MPPC8HMV6S`.

## Maintenance

This site intentionally keeps the local The7/Elementor static assets that are still reachable from the exported pages because they preserve the original visual design. Run `npm run build` before publishing changes; it now validates the site as part of the build.

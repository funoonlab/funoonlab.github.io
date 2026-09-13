# Cleanup Report

Date: 2026-09-13

## What Changed

- Restored the visual-faithful static export after the simplified rewrite changed the design.
- Moved WordPress asset paths into neutral static paths:
  - `wp-content/uploads` -> `assets/media`
  - `wp-content/themes/dt-the7` -> `assets/vendor/the7`
  - `wp-content/plugins/elementor` -> `assets/vendor/elementor`
  - `wp-content/plugins/pro-elements` -> `assets/vendor/pro-elements`
  - `wp-content/plugins/dt-the7-core` -> `assets/vendor/the7-core`
  - `wp-includes` -> `assets/vendor/core`
- Removed the public WordPress-named runtime folders.
- Externalized inline style/script blocks into `assets/css/generated/` and `assets/js/generated/`.
- Added site-wide Google Analytics through `assets/js/analytics.js`.
- Removed the WordPress sample page and icon demo HTML.
- Pruned unreachable migrated media and vendor files while keeping the existing public route structure.
- Made `npm run build` idempotent for the current static checkout and chained validation after rebuilds.
- Expanded validation to follow HTML, CSS, JS, SVG, responsive image, and escaped asset references.

## Verification

Run:

```sh
npm run validate
```

Current validation result:

- `htmlFiles`: 32
- `errors`: 0

Representative local HTTP checks returned `200` for home, contact, project, vendor CSS, static helper JS, Lottie JSON, and migrated media assets.

## Notes

This is the practical clean/static version that still looks like the previous website. A fully hand-authored version with identical visuals would require rebuilding the design system section by section and comparing screenshots.

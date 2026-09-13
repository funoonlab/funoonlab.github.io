# Codebase Audit

Date: 2026-09-13

## Result

The site has been restored to the previous visual design while keeping it static and WordPress-runtime-free.

## Current Architecture

| Area | Purpose |
| --- | --- |
| Static HTML routes | Preserve the original route structure and page markup needed by the design. |
| `assets/media/` | Local migrated uploads and project imagery. |
| `assets/vendor/` | Reachable static The7, Elementor, Pro Elements, The7 Core, and WordPress browser-runtime assets required for visual fidelity. |
| `assets/css/generated/` | CSS externalized from inline export blocks. |
| `assets/js/generated/` | JS config/runtime snippets externalized from inline export blocks. |
| `assets/css/static-site.css` | Small static-only accessibility/form helper styles. |
| `assets/js/static-site.js` | Small static-only form fallback script. |
| `assets/js/analytics.js` | Site-wide Google Analytics loader. |
| `scripts/rebuild-visual-static.mjs` | Rebuilds the visual-preserving static export and preserves existing generated assets when run on an already-static checkout. |
| `scripts/validate-site.mjs` | Validates page count, HTML/CSS/JS asset references, and removed WordPress backend references. |

## Removed Runtime Dependencies

- No public `wp-content/` folder.
- No public `wp-includes/` folder.
- No `wp-admin`, `wp-json`, `xmlrpc.php`, or `admin-ajax.php` references in HTML or generated custom files.
- No PHP or live WordPress server is required.
- The old icon demo HTML route was removed.
- The default WordPress sample page was removed.
- Unreachable migrated media and vendor files were pruned after an asset reachability check.

## Visual Fidelity Note

The previous design depends on The7/Elementor CSS and JavaScript. Those files are now treated as static frontend vendor assets under `assets/vendor/`. Keeping them is not a WordPress backend dependency; it is how the static site preserves the original layout, responsive behavior, typography, and interactions.

## Analytics

Google Analytics is configured site-wide in `assets/js/analytics.js` with measurement ID `G-MPPC8HMV6S`.

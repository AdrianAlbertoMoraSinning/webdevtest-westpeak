Montecristo deployment refresh.

## June 2026 Update - Montecristo Client Adjustments

Included in this package:

- Updated transparent Montecristo logo assets for the white header strip.
- Added white logo version for dark hero/footer use.
- Updated advisor image to `images/marlon-molina.jpg`.
- Updated experience references from 8+ to 10+ years.
- Added `credit-application.html` as a full Credit Application extension/form.
- Added `Credit Application` links in navigation, footer, and mobile action bar.
- Added Google Reviews section with buttons for Read / Leave Review.
- Added admin-managed reviews capability inside `modules/agenda/agenda-admin.html`.
- Updated Apps Script backend to support two tabs in Google Sheets: `appointments` and `reviews`.

### Important Apps Script Step

After uploading the website files, update the Apps Script project with the new file:

`modules/agenda/apps-script-backend.gs`

Then redeploy the Apps Script Web App and confirm the deployment URL remains the same in:

`modules/agenda/agenda-config.js`

The reviews module has no monthly subscription cost. Reviews can be added, edited, hidden, or deleted from the private admin panel.

- Google Review buttons currently point to the existing Google Business search for "Montecristo Credit - Marlon Molina". Replace with the direct Google Reviews URL when Marlon shares it.

### Google Reviews / Business Profile Note

The client reported that searching `Montecristo auto finance` does not show a separate Google Reviews profile. The active profile found is:

`Montecristo Credit - Marlon Molina` — 5.0 rating, 11 Google reviews.

This package addresses that by using the existing Google Business profile as the reviews source on the website. The section explains that Google currently indexes the business under `Montecristo Credit - Marlon Molina`, so the existing credibility and reviews can be used immediately instead of starting from zero. The website links can later be replaced with a direct review/share link from Google Business Profile.

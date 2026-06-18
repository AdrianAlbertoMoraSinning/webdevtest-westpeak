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

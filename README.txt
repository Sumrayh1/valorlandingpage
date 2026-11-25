VALOR CUSTOM LANDING PAGE

Upload index.html and the assets folder together to the root of the new subdomain.
For Cloudflare Pages Direct Upload, upload this folder's contents or the supplied ZIP.
No installation, build command, Node server, PHP, database or WordPress is required.

Preserved behavior:
- Desktop/laptop: text left, video right; booking scrolls to the inline calendar.
- Tablet/mobile: centered stacked layout; booking scrolls to the inline calendar.
- The inline calendar lazy loads when its section becomes visible on all screen sizes.
  Event details remain visible; no fixed placeholder height is added.
- Video uses the direct Wistia embed with native lazy loading; the responsive
  frame stays 16:9 on desktop/tablet and 9:16 on mobile.
- Existing Meta Pixel 1656922198355882 records PageView and embedded booking Schedule events.

The local font and background files match the assets rendered by the reference page.
The headline uses the verified Magiora-Regular-Fixed font from the live page.
Only Wistia, Cal.com and the existing Meta advertising pixel require external requests.

Run node check-performance.cjs for local asset, direct video embed, calendar loading,
duplicate prevention, successful-booking tracking and one Pixel PageView checks.

The original Cal.com inline configuration is used, with no custom theme or redirect.
bookingSuccessfulV2 sends Schedule only to pixel 1656922198355882. Duplicate success
notifications are suppressed by booking UID in this tab's session storage, with an
in-memory fallback when storage is blocked. No lead answers are added to the event.
Desktop and mobile both use the same inline calendar and successful-booking listener.
The tracking checks run locally with a pixel spy, without sending fabricated Meta
conversions. A genuine booking in Meta Test Events is required for end-to-end verification.
The inline embed is initialized lazily. Cal.com handles completion.
The existing booked page remains available but is no longer a redirect destination.

PageSpeed baseline (Nov 23, 2026, mobile): score 55, FCP/LCP 3.6s, TBT 1,130ms,
Speed Index 6.3s, CLS 0. Cal.com transferred 2,022 KiB and Wistia 384 KiB.
Wistia uses its own player preview; Cal.com waits for section visibility.
Third-party caching and scripts are controlled by those providers. Re-run PageSpeed
after uploading the updated files to measure the new deployed score.

Before directing ads to the new address, check video playback, calendar availability,
and Meta Test Events on the final HTTPS subdomain. Domain-specific tracking settings
and any Wistia/Cal domain restrictions must permit the new subdomain.

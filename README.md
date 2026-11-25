# Valor landing page

Live website: https://design.valorwebagency.com/

Static HTML website. No build, package installation, database, or application server is required.

## Files

- `index.html`: landing page, styles, lazy Cal.com embed, and Meta Pixel booking tracking.
- `assets/`: local images and fonts.
- `booked/index.html`: standalone confirmation page; the calendar currently does not redirect here.
- `check-performance.cjs`: dependency-free local checks.
- `README.txt`: implementation details and performance baseline.

## Editing and checks

Edit the files, then run:

```sh
node check-performance.cjs
git diff
git add index.html assets booked check-performance.cjs README.md README.txt .gitignore
git commit -m "Describe the website change"
git push origin main
```

GitHub commits preserve the history and show changes. Revert a specific change with `git revert <commit>` and push the resulting commit.

## Hostinger

The intended deployment is the `main` branch of this repository to **design.valorwebagency.com** only. The existing site directory is `/domains/valorwebagency.com/public_html/design`.

In hPanel, open this website's **Advanced → GIT** page to connect the repository and inspect deployment status. The connection must be verified there before assuming that pushes publish automatically. Clear this website's cache after deploying if the previous version is still displayed.

Do not upload credentials, private booking information, or local screenshots. Do not deploy this repository over the parent website's directory.

## Booking tracking

Desktop and mobile use the same lazy inline Cal.com calendar. `bookingSuccessfulV2` sends the standard `Schedule` event to Meta Pixel `1656922198355882`, with duplicate protection by booking UID. There is no custom redirect. Local checks use a mock pixel; a real booking is required to verify receipt in Meta Events Manager.

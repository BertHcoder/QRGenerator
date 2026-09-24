# Transparent QR Code Generator

A small, self-contained web tool to generate **transparent QR codes** from any URL
(such as a LinkedIn profile) so they can be placed on business cards, PDFs, or slides.

Free to use, open source, and hosted on Cloudflare. If it helps you, you can
[buy me a coffee](https://buymeacoffee.com/dirtymasterchief) &#9749;

## How to use

1. Open `public/index.html` in any modern browser (double-click it), or use the hosted site.
2. Paste your URL (e.g. `https://www.linkedin.com/in/your-profile`).
3. Pick a foreground color and keep **Transparent background** checked.
4. Download:
   - **PNG** &mdash; transparent raster image; pick the size for the resolution you need.
   - **SVG** &mdash; scalable vector, **best choice for printing** on a business card.
   - **Copy image** &mdash; puts a transparent PNG on your clipboard.

## Tips for business cards

- Prefer the **SVG** export for print &mdash; it stays crisp at any size.
- Keep the **Quiet zone** at 4 (or more) so scanners read it reliably.
- If you'll place a logo over the center, raise **Error correction** to **High (30%)**.
- Test the printed code with a phone camera before ordering a batch.

## Keeping the background transparent when sharing

A downloaded PNG really is transparent, but transparency can be lost **after** you send it:
email clients and chat apps (Messenger, WhatsApp, etc.) often re-compress inline photos to
JPEG, which has no transparency and gets flattened onto a solid (often white or black) background.

To preserve transparency:

- Send the file as an **attachment / document**, not as an inline **photo**.
- In email, **attach** the file rather than pasting it into the message body.
- Prefer the **SVG** export when the recipient will drop it into a design tool.
- Don't screenshot the code &mdash; screenshots are always opaque.

## Notes

- The QR engine ([`qrcode`](https://www.npmjs.com/package/qrcode)) is bundled locally in
  `public/vendor/qrcode.min.js`, so the tool works **fully offline** &mdash; no internet needed.
- No data is uploaded; everything is generated locally in your browser.

## Deploying to Cloudflare (free)

The site is plain static files in `public/`, served as a Cloudflare Worker with
[static assets](https://developers.cloudflare.com/workers/static-assets/) only &mdash; no
Worker script, database or build step. Static asset requests are free and unlimited.

**Option A &mdash; automatic deploys from GitHub (recommended)**

1. Cloudflare dashboard &rarr; **Workers & Pages** &rarr; **Create** &rarr; **Import a repository**.
2. Pick this repo. Leave the build command empty; deploy command: `npx wrangler deploy`.
3. Every push to `main` now redeploys automatically.
4. Optional: **Settings &rarr; Domains & Routes** &rarr; add a custom domain such as
   `qr.itaanhuys.com`.

**Option B &mdash; from your machine**

```bash
npm install
npm run dev      # local preview at http://localhost:8787
npm run deploy   # publishes to <name>.<your-subdomain>.workers.dev
```

Security headers (CSP etc.) are set in `public/_headers`.

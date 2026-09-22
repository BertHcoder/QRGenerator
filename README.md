# Transparent QR Code Generator

A small, self-contained web tool to generate **transparent QR codes** from any URL
(such as a LinkedIn profile) so they can be placed on business cards, PDFs, or slides.

## How to use

1. Open `index.html` in any modern browser (double-click it).
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
  `vendor/qrcode.min.js`, so the tool works **fully offline** &mdash; no internet needed.
- No data is uploaded; everything is generated locally in your browser.

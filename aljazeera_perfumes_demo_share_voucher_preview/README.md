# Al Jazeera Perfumes Demo Website

This is a static front-end prototype generated from the uploaded Excel file: `productFullExport_20260609141453.xlsx`.

## What is included

- `index.html` — homepage
- `shop.html` — shop/collection page with search and filters
- `product.html` — smart product page using dynamic product data
- `gift.html` — gift experience concept
- `cart.html` — demo cart
- `checkout.html` — demo checkout page with delivery, payment, gift options, and order summary
- `about.html` — developer notes
- `assets/data/products.json` — website product data for 177 products
- `assets/js/products.js` — embedded data for local preview without a server
- `product_data_imported_template.csv` — Excel-ready product data for review/editing

## How to preview

Open `index.html` in a browser.

## Developer implementation idea

1. Keep the existing custom backend.
2. Build these pages/components in the current website codebase.
3. Add database fields for smart product decision content.
4. Use Excel/CSV import to update 300+ products.
5. Review generated fields before publishing.

## Note

The product export did not include every smart UX field directly. Some fields such as scent profile scores, best-for occasions, and compare text were generated from available columns such as subcategory, fragrance family, ingredients, description, price, gender, and concentration. They should be reviewed before use on the live site.


## Checkout page

The checkout page is front-end only. It uses localStorage demo cart data and should be connected by developers to the real order creation, payment gateway, delivery methods, stock reservation, and confirmation emails.


## Latest update

- Updated visual style to a black, white, cream, and gold Al-Jazeera-inspired direction.
- Removed the perfume confidence score block from the product page.
- Added the long description into the Smart Product Decision Page area.


## Europe E-Gift Voucher feature

Added page: `e-voucher.html`

Rules in demo:
- Voucher starts from €100.
- Customer selects the country where the recipient will use the voucher.
- No delivery charge is added to e-voucher purchases.
- The total to pay equals the selected voucher value.
- Product page and checkout show: "Shipping & Taxes included".
- Country fee table is editable in `assets/js/app.js` under `EUROPE_COUNTRY_FEES`.

Production notes:
- Developers should store voucher value, recipient country, delivery fee, recipient email, and message in the order database.
- Voucher code generation and redemption rules must be connected to the real backend.
- If the live site supports multiple currencies, voucher checkout should run in EUR for the Europe website.


## E-gift voucher update

The e-voucher page now includes:
- To / recipient name
- From / sender name
- Recipient email and confirmation email
- 400-character gift message
- Live e-gift card preview
- Requested delivery date: send now or scheduled date/time
- No delivery charge for e-vouchers

Developers should connect these fields to the real voucher code generator, email delivery queue, payment gateway, and order/admin panel.


## E-voucher v3 updates
- Added a **Custom** voucher amount option (minimum €100).
- Replaced the preview card with an **email-style e-gift card preview** inspired by the shared Selfridges flow, adapted to Al-Jazeera Perfumes branding.
- The preview updates the recipient, sender, message, amount, and requested delivery timing.


## E-voucher v4 update
- Removed the separate visual gift-card graphic from the preview.
- Replaced it with a clean Al-Jazeera-style recipient email preview.
- The preview still updates recipient name, sender name, message, amount, and requested delivery timing.

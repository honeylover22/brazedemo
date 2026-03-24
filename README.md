# Safia – Gourmet Bakery App
**A Mobile-First Web Application with iPhone Frame Layout**

---

## Overview

Safia is a high-fidelity single-page web application that simulates a native iOS bakery ordering experience, rendered inside a realistic iPhone 14/15 frame in the browser. Its primary purpose is to **demonstrate Braze WebSDK integrations** — including In-App Messages, Content Cards, Custom Events, and User Attribute tracking — in a visually authentic mobile context. The app can be shared instantly via a Vercel URL, giving stakeholders a live, interactive demo without requiring a native build.

---

## Tech Stack

| Layer        | Technology |
|:-------------|:-----------|
| **UI**       | HTML5, CSS3 Custom Properties (iPhone Frame), Vanilla JS |
| **Icons**    | FontAwesome Kit [`a21f98a3f6`](https://kit.fontawesome.com/a21f98a3f6.js) |
| **Fonts**    | Google Fonts — [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (headings) · [Inter](https://fonts.google.com/specimen/Inter) (body) |
| **Marketing**| [Braze WebSDK](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=web) |

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/honeylover22/brazedemo.git
cd brazedemo
```

### 2. Configure Braze credentials
Open `config.js` and replace the placeholders:
```js
window.BrazeConfig = {
  apiKey:   'YOUR_BRAZE_API_KEY_HERE',   // Dashboard → Settings → API Keys
  endpoint: 'YOUR_BRAZE_SDK_ENDPOINT_HERE'  // e.g. "sdk.iad-01.braze.com"
};
```
> **Security note:** Never commit a real API key to a public repository. Use Vercel environment variables and a build step to inject them at deploy time.

### 3. Run locally
No build step required. Open `index.html` directly in any modern browser, or serve it with any static file server:
```bash
npx serve .
# → http://localhost:3000
```

### 4. Deploy to Vercel
Push to `main` branch — Vercel auto-deploys from the root `index.html`. The project requires no framework or build pipeline.

---

## Architecture

### `StorageManager` (LocalStorage Gateway)
All disk I/O is routed through a singleton `StorageManager` object. This prevents scattered `localStorage.getItem()` calls across components and ensures:
- A consistent `ar_app_` prefix on every key (avoids collisions with Braze's own storage).
- Safe JSON parsing with `try/catch` to prevent crashes on corrupted data.
- A single `clearSession()` method that powers the **Reset Demo** button without touching Braze's internal keys.

### `AppLogger` (Centralised Logging)
Every module logs through `AppLogger` instead of `console.*`. This provides:
- Structured entries with `{ timestamp, level, category, message, data }`.
- A rolling in-memory buffer (last 100 entries) surfaced in the **SDK Debugger** overlay.
- Auto-forwarding of `ERROR`-level logs to Braze as `App_Error` Custom Events.
- Colour-coded console output on `localhost` / `127.0.0.1`.

### `BrazeManager` (SDK Wrapper)
All Braze calls are wrapped in `if (window.braze)` guards and `try/catch` blocks.  
**Why:** Browser extensions (ad-blockers, privacy tools) can silently block SDK script loading. If `window.braze` is undefined, the app degrades gracefully into demo mode — the UI never breaks.

### `DemoData` (Content Source of Truth)
An immutable `Object.freeze`'d object containing all users, products, banners, promotions, and order types. The HTML shell contains **zero static content** — everything is rendered by JavaScript reading from `DemoData`.

---

## Screen Map

| Screen       | Route ID      | Description |
|:-------------|:-------------|:------------|
| Home         | `home`        | Carousel banner, order type selector (asymmetric grid), loyalty card |
| Catalog      | `catalog`     | Search bar, category pills, grouped product shelves / grid |
| Cart         | `cart`        | Cart items with qty controls, order summary, checkout |
| Offers       | `promotions`  | Tab-switched list: Discounts, Promotions, Subscriptions |
| Profile      | `profile`     | User stats, menu items, Reset & Sign Out |
| Product Detail | *(modal)*   | Slide-up overlay with image, description, sticky Add-to-Cart CTA |

---

## Braze Integration Details

### SDK Lifecycle
1. `BrazeManager.init()` is called on `DOMContentLoaded` using credentials from `config.js`.
2. `braze.changeUser(external_id)` is called immediately after with the test user profile.
3. `braze.openSession()` starts the session.

### Test User Profile
| Attribute        | Value |
|:-----------------|:------|
| `external_id`    | `demo_user_safia_001` |
| `first_name`     | Safia |
| `email`          | safia.alrashid@demo.com |
| `loyalty_tier`   | Gold |
| `loyalty_points` | 340 |
| `platform`       | web_mobile_frame |

### Custom Events Tracked

| Event Name                    | Trigger |
|:------------------------------|:--------|
| `Navigation - Tab Switched`   | Every bottom-nav tap |
| `Product - Viewed`            | Opening a product detail overlay |
| `Cart - Item Added`           | Tapping "Add to Cart" |
| `Cart - Item Removed`         | Reducing cart qty to 0 |
| `Cart - Cleared`              | "Clear all" button |
| `Cart - Checkout Started`     | "Proceed to Checkout" button |
| `Order Type - Selected`       | Picking Pick Up / Pre-order / Delivery |
| `Catalog - Category Selected` | Tapping a category pill |
| `Promotion - Viewed`          | Navigating to the Offers screen |
| `Promotion - Tab Switched`    | Switching between Discounts / Promotions / Subscriptions |
| `Promotion - Details Viewed`  | Tapping "More Details" on a promo card |
| `Profile - * Tapped`          | Tapping menu items on the Profile screen |
| `App - Reset`                 | Using the Reset Demo button |
| `App_Error`                   | Any `AppLogger.error()` call (forwarded automatically) |

### User Attributes Set
`loyalty_tier` · `loyalty_points` · `member_since` · `platform` · `app_version`

### In-App Messages
Intercepted via `braze.subscribeToInAppMessage()`. The SDK is forced to render the IAM inside the `#phone-frame` via `braze.showInAppMessage(iam)` with `inAppMessageZIndex: 9000`.

### Content Cards
Subscribed via `braze.subscribeToContentCardsUpdates()`. Cards with `extras.type === 'banner'` are mapped to the Home carousel.

---

## iPhone Frame Layout

All application content is contained within a single `#phone-frame` `<div>`:

```
body
└── #phone-frame  (390×844px, border-radius:40px, border:12px #1C1C1E)
    ├── ::before            — Dynamic Island (120×34px pill, centred)
    ├── #app-content        — Scrollable area (inset: above bottom nav)
    │   ├── #screen-home    — Home screen
    │   ├── #screen-catalog — Catalog screen
    │   ├── #screen-cart    — Cart screen
    │   ├── #screen-promotions — Promotions screen
    │   └── #screen-profile — Profile screen
    ├── #product-detail     — Slide-up modal overlay (z-index: 150)
    └── .bottom-nav         — Fixed tab bar (z-index: 100)
```

Safe-area constants prevent content from hiding behind the Dynamic Island (`--safe-top: 47px`) and the Home Indicator (`--safe-bottom: 34px`).

On viewports ≤ 430 px (actual mobile devices), the frame chrome is hidden via CSS media query and the app fills the entire screen seamlessly.

---

## SDK Debug Overlay

Click **SDK Debugger** (the bug icon in any screen header, or the button above the frame) to open a full-screen panel showing:

- Current Braze user profile (External ID, email, loyalty attributes)
- Live app state (active screen, cart, order type selection)
- Rolling log of the last 20 `AppLogger` entries, colour-coded by level

The overlay lives **outside** the `#phone-frame` so it never interferes with IAM rendering.

---

## Branching & Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ui): add product detail slide-up modal
fix(braze): handle missing SDK gracefully
chore(config): update Vercel environment variables
```

Branches: `main` (production) · `feature/<name>` · `fix/<name>`

---

## Further Reading

- [Braze WebSDK Documentation](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=web)
- [Braze Custom Events](https://www.braze.com/docs/user_guide/data_and_analytics/custom_data/custom_events/)
- [Braze Content Cards](https://www.braze.com/docs/developer_guide/content_cards/?sdktab=web)
- [Vercel Deployment Docs](https://vercel.com/docs)

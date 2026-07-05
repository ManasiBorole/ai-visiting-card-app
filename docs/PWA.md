# PWA and Android APK Guide

This app is configured as a Progressive Web App (PWA) with offline support and is ready to be packaged as an Android APK using Trusted Web Activity (TWA).

## PWA features

- **Manifest**: `app/manifest.ts` (served at `/manifest.webmanifest`)
- **Service worker**: generated to `public/sw.js` during production build
- **Offline page**: `/offline`
- **Install prompt**: Settings → Install app
- **Icons**: `public/icons/` (regenerate with `npm run pwa:icons`)

## Local testing

1. Build for production (Serwist requires Webpack):

   ```bash
   npm run build
   npm start
   ```

2. Open `http://localhost:3000` in Chrome.
3. Service workers only register in production mode.
4. Use Chrome DevTools → Application → Service Workers to verify caching.
5. Use DevTools → Network → Offline to test the offline fallback.

For install testing on a phone, deploy over HTTPS and set:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Generate icons

```bash
npm run pwa:icons
```

## Build Android APK (Bubblewrap / TWA)

### Prerequisites

- Node.js 18+
- JDK 17+
- Android SDK (via Android Studio)
- Production site deployed over HTTPS

Install Bubblewrap globally:

```bash
npm install -g @bubblewrap/cli
```

### Step 1: Deploy the PWA

Deploy the app and confirm these URLs work:

- `https://your-domain.com/manifest.webmanifest`
- `https://your-domain.com/icons/icon-512x512.png`
- `https://your-domain.com/.well-known/assetlinks.json`

Update `NEXT_PUBLIC_APP_URL` in production.

### Step 2: Configure TWA manifest

Edit `twa/twa-manifest.json`:

- Replace `your-production-domain.com` with your domain
- Update `packageId` if needed (reverse-DNS format)
- Set icon URLs to your production domain

Or initialize from your live manifest:

```bash
npm run twa:init
```

### Step 3: Build the APK

```bash
npm run twa:build
```

Output APK/AAB files appear in `twa/app/build/outputs/`.

### Step 4: Digital Asset Links

1. Generate a signing key (first time only):

   ```bash
   keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Get the SHA-256 fingerprint:

   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```

3. Update `public/.well-known/assetlinks.json` with the fingerprint.
4. Redeploy the site so Android can verify app ownership.

### Play Store

For Play Store distribution, upload the AAB from `bubblewrap build` and complete the store listing.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run pwa:icons` | Generate PNG icons from SVG |
| `npm run twa:init` | Initialize Bubblewrap from live manifest |
| `npm run twa:build` | Build Android APK/AAB (after init) |

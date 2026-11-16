# ShopSpark

A React + Vite storefront with Firebase Authentication and Firestore.

## Run locally

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The app is configured for GitHub Pages at `https://mukeshsingh1234.github.io/shopspark/`. GitHub Actions builds and deploys the `dist` directory on pushes to `main`.

## Firebase

This source currently points to the Firebase project configured in `src/firebase.js`. Before using real customer data, confirm that Firebase Authentication authorized domains and Firestore security rules are configured for this app and its live domain. Never put service-account credentials or private keys in client-side code.

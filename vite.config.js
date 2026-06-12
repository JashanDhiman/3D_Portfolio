import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import pkg from './package.json'

// The primary deploy is Netlify at a domain root, so base is '/'.
//
// package.json also carries a gh-pages `deploy` script, and that path was quietly broken:
// GitHub project pages serve from /<repo>/, but every built asset URL was absolute from
// the root, so a gh-pages deploy would 404 on the JS, the CSS and the favicons — a blank
// page. Rather than delete a deploy target, `npm run deploy:gh` sets DEPLOY_TARGET and
// gets the right base. Nothing changes for the Netlify build.
//
// The .glb is loaded as './planet/planet.glb', resolved against the document URL, so it
// is already correct under either base. The canonical and og: URLs in index.html stay
// pointed at the Netlify domain on purpose: a gh-pages copy should credit the primary
// site rather than compete with it in search results.
// Derived from package.json's `homepage` rather than hardcoded, so the subpath cannot
// drift out of sync with the field that documents it.
const ghPagesBase = pkg.homepage ? new URL(pkg.homepage).pathname : '/'
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? ghPagesBase : '/'

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split the dependencies that never change away from app code, so editing a
        // component does not invalidate the cached copy of React or three.js. Without
        // this, every deploy rehashes one chunk containing both.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          // Only reachable from the lazily-imported scene, so this stays off the
          // critical path; naming it just gives it a stable hash of its own.
          'three-vendor': ['three'],
        },
      },
    },
  },
})

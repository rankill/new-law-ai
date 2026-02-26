# 🚀 Quick Start - Deploy to Cloudflare Pages

## What's Changed ✨

### 1. UI Improvements
- ✅ Flag emojis: 🇪🇸 Spanish, 🇺🇸 English
- ✅ Translation icon in language selector
- ✅ Microphone icon on "Grabar/Record" button
- ✅ Changed "Notas de Voz" → "Mis Notas"

### 2. Deployment Ready
- ✅ Build script added: `npm run build:web`
- ✅ Cloudflare Pages optimization files created
- ✅ Deployment guide created (see DEPLOYMENT.md)

---

## 🏃‍♂️ Deploy in 5 Minutes

### Step 1: Build the Web App
```bash
npm run build:web
```

### Step 2: Push to Git
```bash
git add .
git commit -m "feat: add web deployment and UI improvements"
git push origin main
```

### Step 3: Deploy on Cloudflare
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create application** → **Pages**
3. Connect your Git repository
4. Configure:
   - **Build command:** `npm run build:web`
   - **Build output:** `dist`
5. Add environment variables (from `.env.example`)
6. **Deploy!**

### Step 4: Add Custom Domain
1. In Cloudflare Pages → **Custom domains**
2. Add: `notas.defendo.legal`
3. Wait 2 minutes for DNS + SSL

**Done! 🎉** Your app is live at `https://notas.defendo.legal`

---

## 📋 Environment Variables Needed

Copy these from your Firebase Console:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_DEEPGRAM_API_KEY=
```

---

## 🧪 Test Locally First

```bash
# Start dev server
npm start

# Test web version
npm run web

# Build for production (test build)
npm run build:web

# Serve the built files locally
npx serve dist
```

---

## ⚠️ Don't Forget!

1. **Add `notas.defendo.legal` to Firebase Console** → Authentication → Authorized domains
2. **Check Firestore Rules** are production-ready (user isolation)
3. **Check Storage Rules** restrict access by userId

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

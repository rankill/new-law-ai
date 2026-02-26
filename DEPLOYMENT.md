# 🚀 Deployment Guide - Voice Notes AI to Cloudflare Pages

This guide will help you deploy your Voice Notes AI app to Cloudflare Pages with the subdomain `notas.defendo.legal`.

## Prerequisites

- ✅ Cloudflare account
- ✅ Domain `defendo.legal` configured in Cloudflare
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Firebase project credentials

---

## 📋 Step 1: Prepare Environment Variables

Create a `.env.production` file (don't commit this!):

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Deepgram API
EXPO_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key

# OpenAI API (if used)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

---

## 📦 Step 2: Build the Web Version

### 2.1. Add Build Script

Add this to your `package.json`:

```json
{
  "scripts": {
    "build:web": "expo export --platform web"
  }
}
```

### 2.2. Build for Production

```bash
# Install dependencies
npm install

# Build the web app
npm run build:web
```

This creates a `dist/` folder with static files ready for deployment.

---

## 🌐 Step 3: Deploy to Cloudflare Pages

### Method A: Using Cloudflare Dashboard (Easiest)

#### 3.1. Push Code to Git

```bash
# Make sure your code is in a Git repository
git add .
git commit -m "feat: add web deployment configuration"
git push origin main
```

#### 3.2. Create Cloudflare Pages Project

1. **Go to Cloudflare Dashboard** → `Workers & Pages` → `Create application` → `Pages` → `Connect to Git`

2. **Select your repository** and authorize Cloudflare

3. **Configure build settings:**
   - **Project name:** `voice-notes-ai`
   - **Production branch:** `main`
   - **Build command:** `npm run build:web`
   - **Build output directory:** `dist`

4. **Add environment variables:**
   - Click `Environment variables`
   - Add each variable from your `.env.production` (without `EXPO_PUBLIC_` prefix for Cloudflare, or keep them as-is)

   Example:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY = AIza...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   EXPO_PUBLIC_DEEPGRAM_API_KEY = ...
   ```

5. **Click** `Save and Deploy`

Cloudflare will build and deploy your app automatically!

---

### Method B: Using Wrangler CLI (Advanced)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build:web

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=voice-notes-ai
```

---

## 🔗 Step 4: Configure Custom Subdomain

### 4.1. In Cloudflare Pages Dashboard

1. Go to your deployed project: `voice-notes-ai`
2. Click **`Custom domains`** tab
3. Click **`Set up a custom domain`**
4. Enter: `notas.defendo.legal`
5. Cloudflare will automatically:
   - Create DNS records
   - Issue SSL certificate
   - Configure routing

**Done!** Your app will be live at `https://notas.defendo.legal` in ~2 minutes.

---

## 🔒 Step 5: Firebase Configuration for Web

### 5.1. Update Firebase Console

1. Go to **Firebase Console** → Your Project → **Authentication** → **Settings**
2. Add authorized domain:
   ```
   notas.defendo.legal
   ```

3. Go to **Firestore** → **Rules** and ensure they're production-ready:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /voiceNotes/{noteId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```

4. Go to **Storage** → **Rules**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /recordings/{userId}/{fileName} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

---

## 🔄 Step 6: Enable Continuous Deployment

Cloudflare Pages automatically redeploys when you push to `main`:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Cloudflare automatically rebuilds and deploys!
```

---

## ⚡ Step 7: Optimize for Production

### 7.1. Add `_headers` file for better caching

Create `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: microphone=(self)

/_expo/*
  Cache-Control: public, max-age=31536000, immutable

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### 7.2. Add `_redirects` for SPA routing

Create `public/_redirects`:

```
/*    /index.html   200
```

---

## 🧪 Testing Your Deployment

After deployment, test:

1. ✅ **Visit:** `https://notas.defendo.legal`
2. ✅ **Sign in/Register** with email/password
3. ✅ **Record** a voice note (browser microphone permission required)
4. ✅ **Check transcription** works
5. ✅ **Test AI chat** functionality
6. ✅ **Test on mobile browser** (responsive design)

---

## 🐛 Troubleshooting

### Issue: "Firebase Auth not working"
**Solution:** Make sure `notas.defendo.legal` is added to Firebase authorized domains.

### Issue: "Microphone not working"
**Solution:** Browsers require HTTPS for microphone access. Cloudflare provides automatic SSL.

### Issue: "Build fails"
**Solution:** Check Node version. Use Node 18 or 20:
```bash
node -v  # Should be 18.x or 20.x
```

### Issue: "Environment variables not working"
**Solution:** In Cloudflare, variables must start with `EXPO_PUBLIC_` to be accessible in the browser.

---

## 📊 Monitor Your Deployment

- **Analytics:** Cloudflare Dashboard → `voice-notes-ai` → `Analytics`
- **Logs:** Dashboard → `Deployment details` → `View build logs`
- **Custom domain status:** Dashboard → `Custom domains`

---

## 🎉 You're Done!

Your Voice Notes AI app is now live at:
**🌐 https://notas.defendo.legal**

### Next Steps:
- 📱 Consider deploying mobile apps (iOS/Android) via EAS
- 🔔 Set up error monitoring (Sentry)
- 📈 Add analytics (Posthog, Mixpanel)
- 🌍 Add more languages beyond Spanish/English

---

## 📝 Quick Reference Commands

```bash
# Local development
npm start              # Start Expo dev server
npm run web           # Start web version

# Build for production
npm run build:web     # Build static web files

# Deploy with Wrangler
wrangler pages deploy dist --project-name=voice-notes-ai

# View logs
wrangler pages deployment tail
```

---

## 🆘 Need Help?

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Expo Web Docs:** https://docs.expo.dev/workflow/web/
- **Firebase Docs:** https://firebase.google.com/docs/web/setup

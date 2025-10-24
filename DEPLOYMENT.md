# 🚀 OncoGraph Deployment Guide

Get your OncoGraph Knowledge Assistant live on the internet with a public URL!

## 🌟 Quick Deploy Options

### 🥇 **Option 1: Vercel (Recommended)**

**Why Vercel?**
- ✅ Free tier with generous limits
- ✅ Automatic deployments from GitHub
- ✅ Built-in CI/CD
- ✅ Custom domain support
- ✅ Global CDN
- ✅ Perfect for React/Vite apps

**Steps:**
1. **Visit** [vercel.com](https://vercel.com)
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Import** your repository: `ericjohnsonps2000/ONCOGRAPH`
5. **Configure:**
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables:**
   - Add `VITE_OPENAI_API_KEY` with your API key
7. **Deploy!**

**Result:** `https://oncograph-[random].vercel.app`

---

### 🥈 **Option 2: Netlify**

**Why Netlify?**
- ✅ Free tier with 100GB bandwidth
- ✅ Drag-and-drop deployment
- ✅ Form handling and serverless functions
- ✅ Split testing capabilities

**Steps:**
1. **Visit** [netlify.com](https://netlify.com)
2. **Sign up** with GitHub
3. **New site from Git**
4. **Select** your repository
5. **Configure:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. **Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add `VITE_OPENAI_API_KEY`
7. **Deploy!**

**Result:** `https://oncograph-[random].netlify.app`

---

### 🥉 **Option 3: GitHub Pages**

**Why GitHub Pages?**
- ✅ Completely free
- ✅ Integrated with your repository
- ✅ Custom domain support
- ✅ Automatic SSL certificates

**Steps:**
1. **Go to your repository** on GitHub
2. **Settings** → **Pages**
3. **Source:** GitHub Actions
4. **Add API Key Secret:**
   - Settings → Secrets and variables → Actions
   - New repository secret: `VITE_OPENAI_API_KEY`
5. **The workflow is already set up!** (`.github/workflows/deploy.yml`)
6. **Push changes** to trigger deployment

**Result:** `https://ericjohnsonps2000.github.io/ONCOGRAPH/`

---

## 🔧 **Quick Setup for Any Platform**

### **Step 1: Choose Your Platform**
Pick Vercel, Netlify, or GitHub Pages based on your preference.

### **Step 2: Set Environment Variables**
**Critical:** Your OpenAI API key must be added as an environment variable:
- **Name:** `VITE_OPENAI_API_KEY`
- **Value:** Your actual OpenAI API key (starts with `sk-`)

### **Step 3: Configure Build Settings**
Most platforms auto-detect, but if needed:
- **Framework:** Vite/React
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `frontend` (if required)

### **Step 4: Deploy**
Push to your main branch or trigger manual deployment.

---

## 🚨 **Security Notes**

### **Environment Variables**
- ✅ **DO** use environment variables for API keys
- ❌ **DON'T** commit API keys to your repository
- ✅ **DO** use different keys for development/production

### **API Key Best Practices**
```bash
# Development (local .env file)
VITE_OPENAI_API_KEY=sk-dev-key-here

# Production (deployment platform)
VITE_OPENAI_API_KEY=sk-prod-key-here
```

---

## 🎯 **Custom Domain (Optional)**

### **For Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### **For Netlify:**
1. Site Settings → Domain management
2. Add custom domain
3. Update DNS records

### **For GitHub Pages:**
1. Repository Settings → Pages
2. Custom domain field
3. Add CNAME record in DNS

---

## 📊 **Performance Optimization**

### **Build Optimization**
The app is already configured with:
- ✅ Code splitting for faster loading
- ✅ Asset optimization
- ✅ Compression and minification
- ✅ CDN-ready static assets

### **Monitoring**
- **Vercel:** Built-in analytics
- **Netlify:** Analytics add-on
- **GitHub Pages:** GitHub Insights

---

## 🔄 **Automatic Deployments**

### **How it Works:**
1. **Push to main branch** → Automatic deployment
2. **Pull request** → Preview deployment (Vercel/Netlify)
3. **Rollback** → Easy one-click rollback

### **Deployment Status:**
- ✅ **Success:** Your site is live
- 🟡 **Building:** Deployment in progress
- ❌ **Failed:** Check build logs

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
```bash
# Check build locally
cd frontend
npm run build
```

**Environment Variables Not Working:**
- Verify the key name: `VITE_OPENAI_API_KEY`
- Check the value starts with `sk-`
- Redeploy after adding variables

**404 Errors:**
- Check base URL configuration in `vite.config.ts`
- Verify build output directory

**API Errors:**
- Verify OpenAI API key is valid
- Check API quota and billing

---

## 🎉 **Success Checklist**

- [ ] Platform account created
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Build settings correct
- [ ] Deployment successful
- [ ] Public URL accessible
- [ ] OpenAI API working
- [ ] Knowledge graph loading
- [ ] Visualizations rendering

---

## 📞 **Getting Help**

**Deployment Issues:**
- Check platform documentation
- Review build logs
- Test local build first

**App Issues:**
- Open browser dev tools
- Check console for errors
- Verify API key configuration

**Need Support?**
- Create GitHub issue with deployment details
- Include error messages and platform used
- Mention build logs if available

---

**🎯 Recommended:** Start with **Vercel** for the easiest setup and best performance!

**🚀 Your OncoGraph app will be live in minutes!**
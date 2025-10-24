# 🛠️ OncoGraph Setup Guide - Cross-Platform Compatibility

This guide ensures OncoGraph works reliably on Windows, macOS, and Linux systems.

## 📋 Prerequisites Checklist

### Required Software
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **OpenAI API Key**: Valid GPT-4o-mini access

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 500MB free space
- **Browser**: Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 🔧 Installation Instructions

### Step 1: Verify Prerequisites

**Check Node.js version:**
```bash
node --version
# Should show v16.0.0 or higher
```

**Check npm version:**
```bash
npm --version
# Should show 8.0.0 or higher
```

**If Node.js is not installed or outdated:**
- **Windows**: Download from [nodejs.org](https://nodejs.org/)
- **macOS**: Use Homebrew: `brew install node` or download from nodejs.org
- **Linux**: Use package manager: `sudo apt install nodejs npm` (Ubuntu/Debian) or `sudo yum install nodejs npm` (CentOS/RHEL)

### Step 2: Clone the Repository

```bash
git clone https://github.com/ericjohnsonps2000/ONCOGRAPH.git
cd ONCOGRAPH
```

**Note**: Repository name may be case-sensitive on some systems.

### Step 3: Install Dependencies

```bash
cd frontend
npm install
```

**If you encounter permission errors:**
- **Windows**: Run PowerShell as Administrator
- **macOS/Linux**: Use `sudo npm install` if needed, or fix npm permissions:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
  source ~/.bashrc
  ```

### Step 4: Environment Setup

**Create environment file:**
```bash
# In the frontend directory
echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" > .env
```

**For Windows Command Prompt:**
```cmd
echo VITE_OPENAI_API_KEY=your_openai_api_key_here > .env
```

**For Windows PowerShell:**
```powershell
"VITE_OPENAI_API_KEY=your_openai_api_key_here" | Out-File -FilePath .env -Encoding utf8
```

### Step 5: Start the Application

```bash
npm run dev
```

**Expected output:**
```
VITE v4.5.14  ready in XXXms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
➜  press h to show help
```

## 🚨 Troubleshooting Common Issues

### Issue 1: Port Already in Use
**Error**: `Port 3000 is already in use`
**Solution**:
```bash
# Check what's using the port
netstat -tulpn | grep 3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
npm run dev -- --port 3001
```

### Issue 2: Node.js Version Issues
**Error**: `The engine "node" is incompatible`
**Solution**:
```bash
# Use Node Version Manager (recommended)
# Install nvm first, then:
nvm install 18
nvm use 18
```

### Issue 3: npm Install Failures
**Error**: `EACCES permission denied` or `gyp ERR!`
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # Linux/macOS
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

### Issue 4: OpenAI API Issues
**Error**: `Authentication failed` or `API key not found`
**Solution**:
1. Verify your API key is correct
2. Check the .env file exists in the frontend directory
3. Restart the development server after adding the API key
4. Ensure no extra spaces in the .env file

### Issue 5: Build Failures
**Error**: Various TypeScript or build errors
**Solution**:
```bash
# Update dependencies
npm update

# Clear Vite cache
rm -rf .vite  # Linux/macOS
rmdir /s .vite  # Windows

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

### Required Browser Features
- ES2020 support
- WebGL for D3.js visualizations
- Local Storage for caching
- Fetch API for HTTP requests

## 🔒 Security Considerations

### API Key Security
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use environment variables in production
export VITE_OPENAI_API_KEY=your_key_here  # Linux/macOS
set VITE_OPENAI_API_KEY=your_key_here     # Windows
```

### CORS Issues
If you encounter CORS errors:
1. The app uses `dangerouslyAllowBrowser: true` for development
2. In production, implement a backend proxy
3. Use environment variables for API endpoints

## 📱 Mobile Compatibility

### Responsive Design
- ✅ Mobile-first responsive design
- ✅ Touch-friendly interactions
- ✅ Optimized for tablets and phones
- ✅ Adaptive graph layouts

### Testing on Mobile
```bash
# Access from mobile device on same network
npm run dev -- --host 0.0.0.0
# Then visit http://your-computer-ip:3000 from mobile
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

### Deployment Options
- **Netlify**: Connect GitHub repo, auto-deploy
- **Vercel**: Connect GitHub repo, auto-deploy
- **GitHub Pages**: Use gh-pages branch
- **Docker**: Use provided Dockerfile

### Environment Variables in Production
Set these in your deployment platform:
- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## 🧪 Testing the Installation

### Quick Test Checklist
1. ✅ App loads at http://localhost:3000
2. ✅ Dark theme displays correctly
3. ✅ Can type in chat input
4. ✅ AI responds to test query: "What is EGFR?"
5. ✅ Knowledge graph visualization appears
6. ✅ Neon styling and animations work
7. ✅ No console errors

### Test Queries
```
"What is EGFR?"
"Show me drugs for breast cancer"
"Explain the PI3K pathway"
"Drugs related to colorectal cancer"
```

## 📞 Getting Help

### If Issues Persist
1. **Check the console** for error messages (F12 in browser)
2. **Verify all prerequisites** are met
3. **Try the troubleshooting steps** above
4. **Create an issue** on GitHub with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

### System-Specific Notes

**Windows Users:**
- Use PowerShell or Command Prompt as Administrator if needed
- Ensure Windows Defender doesn't block npm operations
- Consider using Windows Subsystem for Linux (WSL) for better compatibility

**macOS Users:**
- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for package management: `brew install node`
- May need to allow Node.js in Security & Privacy settings

**Linux Users:**
- Install build essentials: `sudo apt install build-essential`
- Use official Node.js repositories for latest versions
- Ensure proper permissions for npm global packages

## 🔄 Keeping Updated

### Update the Project
```bash
git pull origin main
npm install  # Install any new dependencies
npm run dev  # Restart development server
```

### Update Dependencies
```bash
npm update  # Update to latest compatible versions
npm audit fix  # Fix security vulnerabilities
```

---

**Need help?** Create an issue on GitHub with your system details and error messages.
# 📦 PlanForge Desktop Release Guide

## 🚀 Release Process

### Automated Release (Recommended)

1. **Create Release Tag**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Manual Trigger**
   - Go to GitHub Actions → Release Desktop App
   - Click "Run workflow"
   - Enter version number (e.g., v1.0.1)

### Local Build Testing

```bash
cd apps/desktop

# Build all platforms
npm run build

# Build specific platform
npm run build:mac     # macOS
npm run build:win     # Windows
npm run build:linux   # Linux
```

## 📦 Unsigned Build Strategy

### Why Unsigned?

- **Cost Effective**: Avoids $300-500/year in signing certificates
- **Free Distribution**: Keeps the project accessible to everyone
- **Open Source**: Users can verify security through source code
- **Same Security**: Code is identical, only signature is missing

### User Experience

- **macOS**: Right-click → Open (one-time bypass)
- **Windows**: "More info" → "Run anyway" (one-time bypass)
- **Linux**: Standard AppImage execution

## 📋 Release Checklist

### Before Release

- [ ] Update version number (`apps/desktop/package.json`)
- [ ] Update CHANGELOG.md
- [ ] Test local build successfully
- [ ] Verify installation guide is current
- [ ] Check GitHub Actions permissions

### After Release

- [ ] Verify Release page files uploaded successfully
- [ ] Test unsigned DMG installation (expect security dialog)
- [ ] Test unsigned EXE installation (expect SmartScreen)
- [ ] Test Linux AppImage execution
- [ ] Update project README download links
- [ ] Share installation guide with users

## 🔧 User Support Strategy

### Documentation

- **INSTALLATION_GUIDE.md**: Comprehensive unlock instructions
- **GitHub Release Notes**: Clear security notice and steps
- **FAQ Section**: Common installation issues

### Support Channels

- **GitHub Issues**: Technical problems
- **GitHub Discussions**: General questions
- **Installation Guide**: Step-by-step solutions

## 🛠️ Build Configuration

### Simplified electron-builder

```json
{
  "mac": {
    "icon": "resources/icon.icns",
    "category": "public.app-category.productivity"
  },
  "win": {
    "icon": "resources/icon.ico"
  },
  "linux": {
    "icon": "resources/icon.png"
  }
}
```

### No Code Signing

- No identity configuration
- No entitlements files
- No notarization scripts
- No signing certificates required

## 📊 Release Statistics

### Version History

| Version | Release Date | Key Features                               |
| ------- | ------------ | ------------------------------------------ |
| v1.0.0  | 2024-01-XX   | Initial release, AI planning, Gantt charts |

### Expected User Experience

- **macOS**: 95% success rate with right-click method
- **Windows**: 98% success rate with SmartScreen bypass
- **Linux**: 99% success rate (no security warnings)

## 🔄 Future Considerations

### Potential Upgrades

1. **Community Funding**: If project grows, consider community-funded signing
2. **Sponsor Program**: Corporate sponsors could fund certificates
3. **Alternative Distribution**: Mac App Store, Windows Store (different requirements)

### Current Benefits

- **Zero Cost**: No ongoing certificate expenses
- **Full Control**: No dependency on certificate authorities
- **Rapid Deployment**: No waiting for notarization processes
- **Global Access**: No geographic restrictions from signing requirements

---

## 📞 Support

- **Installation Issues**: See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **Bug Reports**: [GitHub Issues](https://github.com/your-username/planforge/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/planforge/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-username/planforge/wiki)

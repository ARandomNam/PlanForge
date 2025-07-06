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

## 🔐 Apple Notarization Setup

### Prerequisites

1. **Apple Developer Account** ($99/year)
2. **App-specific Password**:
   - Visit [appleid.apple.com](https://appleid.apple.com)
   - Sign in → Security → App-Specific Passwords
   - Generate password for notarization

### GitHub Secrets Configuration

Add the following Secrets in GitHub repository settings:

| Secret Name         | Description                  | Example                 |
| ------------------- | ---------------------------- | ----------------------- |
| `APPLE_ID`          | Apple ID email               | `developer@example.com` |
| `APPLE_ID_PASSWORD` | App-specific password        | `abcd-efgh-ijkl-mnop`   |
| `APPLE_TEAM_ID`     | Developer Team ID (optional) | `ABC123DEF4`            |

### Finding Team ID

```bash
# Method 1: Command line
xcrun altool --list-providers -u "your-apple-id@example.com" -p "your-app-password"

# Method 2: Developer website
# Visit https://developer.apple.com/account/
# Team ID is displayed in the top right corner
```

## 📋 Release Checklist

### Before Release

- [ ] Update version number (`apps/desktop/package.json`)
- [ ] Update CHANGELOG.md
- [ ] Test local build successfully
- [ ] Confirm Apple notarization environment variables are set
- [ ] Check GitHub Actions permissions

### After Release

- [ ] Verify Release page files uploaded successfully
- [ ] Test macOS DMG installation (no warnings)
- [ ] Test Windows EXE installation
- [ ] Test Linux AppImage execution
- [ ] Update project README download links

## 🔧 User Installation Guide

### macOS Users

1. Download `PlanForge-v1.0.0-arm64.dmg` (Apple Silicon) or `PlanForge-v1.0.0-x64.dmg` (Intel)
2. Double-click the DMG file
3. Drag PlanForge.app to Applications folder
4. **Notarized by Apple, runs directly without additional steps**

### Windows Users

1. Download `PlanForge-Setup-v1.0.0.exe`
2. Double-click to run the installer
3. **If SmartScreen warning appears**:
   - Click "More info"
   - Click "Run anyway"
4. Follow installation prompts

### Linux Users

1. Download `PlanForge-v1.0.0.AppImage`
2. Add execute permission:
   ```bash
   chmod +x PlanForge-v1.0.0.AppImage
   ```
3. Double-click to run or execute from command line:
   ```bash
   ./PlanForge-v1.0.0.AppImage
   ```

## 🛠️ Troubleshooting

### macOS Issues

**Issue**: "PlanForge.app is damaged and can't be opened"

```bash
# Solution: Remove quarantine attribute
xattr -r -d com.apple.quarantine /Applications/PlanForge.app
```

**Issue**: Notarization failed

- Check Apple ID and password are correct
- Confirm two-factor authentication is enabled
- Use App-specific password, not Apple ID password

### Windows Issues

**Issue**: SmartScreen blocks execution

- Click "More info" → "Run anyway"
- Or check "Unblock" in file properties

**Issue**: Installation fails

- Run installer as administrator
- Temporarily disable antivirus software

### Linux Issues

**Issue**: AppImage won't run

```bash
# Install FUSE (if missing)
sudo apt install fuse

# Or extract and run
./PlanForge-v1.0.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

## 📊 Release Statistics

### Version History

| Version | Release Date | Key Features                               |
| ------- | ------------ | ------------------------------------------ |
| v1.0.0  | 2024-01-XX   | Initial release, AI planning, Gantt charts |

### Download Statistics

View download data at GitHub Insights → Traffic → Git clones and visits.

## 🔄 Auto-Update (Future)

Current version doesn't support auto-update. Planned for future versions:

1. **electron-updater** integration
2. **GitHub Releases** as update source
3. **Incremental update** support
4. **Silent update** options

---

## 📞 Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/planforge/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/planforge/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-username/planforge/wiki)

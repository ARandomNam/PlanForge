# 📖 PlanForge Installation Guide

## ⚠️ Important Security Notice

PlanForge is distributed as **unsigned software** to keep the project free and accessible. This means your operating system will show security warnings on first launch. **The app is completely safe** - these warnings appear because we haven't purchased expensive code signing certificates.

---

## 🍎 macOS Installation

### Step 1: Download and Install

1. Download `PlanForge-v1.0.0-arm64.dmg` (Apple Silicon) or `PlanForge-v1.0.0-x64.dmg` (Intel)
2. Double-click the DMG file to open it
3. Drag **PlanForge.app** to your **Applications** folder

### Step 2: First Launch (Important!)

When you first try to open PlanForge, macOS will show a security warning:

> **"PlanForge.app" cannot be opened because it is from an unidentified developer.**

**DO NOT** click "Move to Trash". Instead, follow one of these methods:

#### Method 1: Right-Click Method (Recommended)

1. Go to **Applications** folder
2. **Right-click** on **PlanForge.app**
3. Select **"Open"** from the context menu
4. Click **"Open"** in the security dialog
5. PlanForge will launch and remember this choice

#### Method 2: Terminal Command

1. Open **Terminal** (Applications → Utilities → Terminal)
2. Run this command:
   ```bash
   xattr -d com.apple.quarantine /Applications/PlanForge.app
   ```
3. Now you can double-click PlanForge.app normally

#### Method 3: System Preferences

1. Try to open PlanForge.app (it will be blocked)
2. Go to **System Preferences** → **Security & Privacy**
3. Click **"Open Anyway"** next to the PlanForge message
4. Confirm by clicking **"Open"**

### Troubleshooting macOS

**Problem**: "PlanForge.app is damaged and can't be opened"

```bash
# Solution: Remove quarantine attribute
xattr -r -d com.apple.quarantine /Applications/PlanForge.app
```

**Problem**: App won't start after following steps

1. Check if you have the correct architecture (ARM64 for Apple Silicon, x64 for Intel)
2. Restart your Mac and try again
3. Re-download the DMG file in case of corruption

---

## 🪟 Windows Installation

### Step 1: Download

Download `PlanForge-Setup-v1.0.0.exe`

### Step 2: Run Installer

When you run the installer, Windows SmartScreen will appear:

> **Microsoft Defender SmartScreen prevented an unrecognized app from starting.**

#### Method 1: SmartScreen Bypass (Recommended)

1. Click **"More info"** in the SmartScreen dialog
2. Click **"Run anyway"** button that appears
3. Follow the installation prompts

#### Method 2: File Properties

1. **Right-click** the installer file
2. Select **"Properties"**
3. Check **"Unblock"** at the bottom
4. Click **"OK"**
5. Run the installer normally

#### Method 3: Windows Defender Exception

1. Open **Windows Security** (Windows Defender)
2. Go to **Virus & threat protection**
3. Click **"Manage settings"** under "Virus & threat protection settings"
4. Add the installer file to **"Exclusions"**

### Troubleshooting Windows

**Problem**: "Windows protected your PC"

- This is normal for unsigned software
- Always click "More info" → "Run anyway"

**Problem**: Installation fails

- Run installer as Administrator (right-click → "Run as administrator")
- Temporarily disable antivirus software
- Check if you have enough disk space

**Problem**: App won't start after installation

- Check Windows Defender quarantine
- Add PlanForge to antivirus exclusions

---

## 🐧 Linux Installation

### AppImage (Universal)

1. Download `PlanForge-v1.0.0.AppImage`
2. Make it executable:
   ```bash
   chmod +x PlanForge-v1.0.0.AppImage
   ```
3. Run it:
   ```bash
   ./PlanForge-v1.0.0.AppImage
   ```

### Desktop Integration (Optional)

To add PlanForge to your application menu:

```bash
# Create desktop entry
cat > ~/.local/share/applications/planforge.desktop << EOF
[Desktop Entry]
Name=PlanForge
Comment=AI-driven project planning
Exec=/path/to/PlanForge-v1.0.0.AppImage
Icon=planforge
Terminal=false
Type=Application
Categories=Office;ProjectManagement;
EOF

# Make it executable
chmod +x ~/.local/share/applications/planforge.desktop
```

### Troubleshooting Linux

**Problem**: AppImage won't run

```bash
# Install FUSE if missing
sudo apt install fuse  # Ubuntu/Debian
sudo yum install fuse  # CentOS/RHEL
sudo pacman -S fuse    # Arch Linux

# Or extract and run manually
./PlanForge-v1.0.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

**Problem**: Permission denied

```bash
# Ensure execute permission
chmod +x PlanForge-v1.0.0.AppImage

# Check if file is corrupted
file PlanForge-v1.0.0.AppImage
```

---

## 🔒 Why These Steps Are Necessary

### Code Signing Costs

- **Apple**: $99/year for Developer Program
- **Windows**: $200-400/year for Code Signing Certificate
- **Total**: $300-500/year just for signatures

### Our Choice

We chose to keep PlanForge **free and accessible** rather than pass these costs to users. The app undergoes the same security practices - only the expensive signature is missing.

### What This Means

- ✅ **App is completely safe** - same code, just unsigned
- ✅ **No malware or tracking** - you can verify this in our open source code
- ✅ **Privacy focused** - all data stays on your device
- ⚠️ **OS warnings expected** - one-time setup required

---

## 🆘 Still Having Issues?

### Check Our FAQ

- [GitHub Issues](https://github.com/your-username/planforge/issues)
- [Discussions](https://github.com/your-username/planforge/discussions)

### Report a Bug

If you encounter installation issues:

1. **Include your OS version** (macOS 14.1, Windows 11, Ubuntu 22.04, etc.)
2. **Describe the exact error message**
3. **Mention which method you tried**
4. **Attach screenshots if helpful**

### Alternative Installation

If you're comfortable with development tools:

```bash
# Build from source
git clone https://github.com/your-username/planforge.git
cd planforge/apps/desktop
npm install
npm run build
```

---

## 🎉 After Installation

Once PlanForge is running:

1. **Set up your OpenAI API key** in Settings
2. **Create your first plan** with the AI assistant
3. **Explore the Kanban and Gantt views**
4. **Import/export your data** for backup

Welcome to PlanForge! 🚀

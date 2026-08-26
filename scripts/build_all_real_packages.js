import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const downloadsDir = path.join(rootDir, 'frontend', 'public', 'downloads');
const distDownloadsDir = path.join(rootDir, 'frontend', 'dist', 'downloads');
const tempDir = path.join(rootDir, 'scripts', 'build_temp');

// Ensure clean directories
[downloadsDir, distDownloadsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const standaloneHtmlPath = path.join(rootDir, 'standalone-portal.html');
const standaloneHtml = fs.readFileSync(standaloneHtmlPath, 'utf8');

// ==============================================================================
// 1. BUILD REAL MACOS APP BUNDLE (.app -> .zip)
// ==============================================================================
console.log('Building macOS Application Bundle...');
const macAppDir = path.join(tempDir, 'SSN Attendance.app');
const macContentsDir = path.join(macAppDir, 'Contents');
const macMacOSDir = path.join(macContentsDir, 'MacOS');
const macResourcesDir = path.join(macContentsDir, 'Resources');

fs.mkdirSync(macMacOSDir, { recursive: true });
fs.mkdirSync(macResourcesDir, { recursive: true });

// Info.plist
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>SSN Attendance</string>
    <key>CFBundleIdentifier</key>
    <string>com.ssn.attendance.mac</string>
    <key>CFBundleName</key>
    <string>SSN Attendance</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>`;

fs.writeFileSync(path.join(macContentsDir, 'Info.plist'), infoPlist);

// MacOS executable launcher script
const macLauncher = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
RESOURCES_DIR="$DIR/../Resources"
open "$RESOURCES_DIR/app.html"
`;

const macLauncherPath = path.join(macMacOSDir, 'SSN Attendance');
fs.writeFileSync(macLauncherPath, macLauncher);
fs.chmodSync(macLauncherPath, '755');

// Put offline portal in Resources
fs.writeFileSync(path.join(macResourcesDir, 'app.html'), standaloneHtml);

// Zip macOS app
const macZipDest = path.join(downloadsDir, 'SSN-Attendance-macOS.zip');
try {
  if (fs.existsSync(macZipDest)) fs.unlinkSync(macZipDest);
  execSync(`zip -r -q -y "${macZipDest}" "SSN Attendance.app"`, { cwd: tempDir });
  console.log('✓ Successfully created real macOS app bundle:', macZipDest);
} catch (err) {
  console.error('Error zipping macOS app:', err.message);
}

// ==============================================================================
// 2. BUILD REAL WINDOWS APP PACKAGE (.zip)
// ==============================================================================
console.log('Building Windows Application Package...');
const winAppDir = path.join(tempDir, 'SSN Attendance Windows');
if (fs.existsSync(winAppDir)) fs.rmSync(winAppDir, { recursive: true });
fs.mkdirSync(winAppDir, { recursive: true });

// Windows batch launcher
const winBat = `@echo off
title SSN IT Attendance System
start "" "%~dp0SSN-Attendance.html"
exit
`;
fs.writeFileSync(path.join(winAppDir, 'Launch-SSN-Attendance.bat'), winBat);

// Windows VBS silent launcher (no cmd black window)
const winVbs = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c start """" """ & Replace(WScript.ScriptFullName, WScript.ScriptName, "") & "SSN-Attendance.html""", 0, False
`;
fs.writeFileSync(path.join(winAppDir, 'SSN-Attendance.vbs'), winVbs);

// Offline portal HTML
fs.writeFileSync(path.join(winAppDir, 'SSN-Attendance.html'), standaloneHtml);

// Windows Readme
const winReadme = `=====================================================
SSN IT ATTENDANCE TRACKING SYSTEM — WINDOWS EDITION
=====================================================

HOW TO USE:
1. Double-click "SSN-Attendance.vbs" or "Launch-SSN-Attendance.bat" to start.
2. The attendance tracking portal will open immediately in your default browser.
3. Works completely offline with zero installation required.

SSN College of Engineering • Department of Information Technology
`;
fs.writeFileSync(path.join(winAppDir, 'README.txt'), winReadme);

// Zip Windows package
const winZipDest = path.join(downloadsDir, 'SSN-Attendance-Windows.zip');
try {
  if (fs.existsSync(winZipDest)) fs.unlinkSync(winZipDest);
  execSync(`zip -r -q "${winZipDest}" "SSN Attendance Windows"`, { cwd: tempDir });
  console.log('✓ Successfully created real Windows app package:', winZipDest);
} catch (err) {
  console.error('Error zipping Windows app:', err.message);
}

// ==============================================================================
// 3. COPY STANDALONE OFFLINE & MOBILE FILES
// ==============================================================================
fs.writeFileSync(path.join(downloadsDir, 'SSN-Attendance-Offline.html'), standaloneHtml);
fs.writeFileSync(path.join(downloadsDir, 'SSN-Attendance-Mobile.html'), standaloneHtml);

// Copy all generated files to frontend/dist/downloads if dist exists
if (fs.existsSync(path.join(rootDir, 'frontend', 'dist'))) {
  fs.cpSync(downloadsDir, distDownloadsDir, { recursive: true });
}

// Clean up build_temp
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {}

console.log('✓ All Real App Packages (macOS .app, Windows .zip, Mobile .html) Built Successfully!');

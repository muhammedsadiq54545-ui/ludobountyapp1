#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  Ludo Bounty - Codespaces Android Build Script           "
echo "  Package: com.ludobounty.game                            "
echo "=========================================================="

# 1. Detect directory
if [ -f "settings.gradle.kts" ]; then
    ANDROID_DIR="."
elif [ -d "android" ] && [ -f "android/settings.gradle.kts" ]; then
    ANDROID_DIR="./android"
else
    echo "❌ Error: Could not find Android Gradle project."
    echo "Make sure you run this script from the project root or the android/ folder."
    exit 1
fi

cd "$ANDROID_DIR"
echo "📁 Working directory: $(pwd)"

# 2. Check Java
echo "☕ Checking Java..."
if ! command -v java &> /dev/null; then
    echo "Installing OpenJDK 17..."
    sudo apt-get update && sudo apt-get install -y openjdk-17-jdk
fi
java -version

# 3. Setup Android SDK if not present
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "📥 Installing Android SDK command-line tools into $ANDROID_HOME..."
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    TMP_ZIP="/tmp/cmdline-tools.zip"
    curl -sSLo "$TMP_ZIP" https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q -o "$TMP_ZIP" -d "$ANDROID_HOME/cmdline-tools"
    rm -f "$TMP_ZIP"
    rm -rf "$ANDROID_HOME/cmdline-tools/latest"
    mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
    
    echo "📝 Accepting Android SDK licenses..."
    yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1 || true
    echo "📦 Installing build-tools and platforms..."
    "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-35" "build-tools;35.0.0" "platform-tools" > /dev/null
fi

# Ensure local.properties points to SDK
echo "sdk.dir=$ANDROID_HOME" > local.properties

# 4. Generate upload keystore if not exists
KEYSTORE_PATH="app/upload-keystore.jks"
KEY_ALIAS="ludobounty"
KEY_PASS="ludobounty123"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "🔑 Generating upload keystore ($KEYSTORE_PATH)..."
    keytool -genkeypair \
        -v \
        -keystore "$KEYSTORE_PATH" \
        -alias "$KEY_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$KEY_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=Ludo Bounty, OU=Mobile, O=Ludo Bounty Game, L=Play, ST=Global, C=US"
    echo "✅ Keystore created successfully."
else
    echo "🔑 Using existing keystore ($KEYSTORE_PATH)"
fi

# 5. Make gradlew executable
chmod +x gradlew

# 6. Build Android App Bundle (.aab)
echo "🚀 Building Android App Bundle (AAB) for Google Play Console..."
./gradlew :app:bundleRelease --stacktrace

# 7. Build APK for direct testing
echo "📱 Building Release APK for direct install..."
./gradlew :app:assembleRelease --stacktrace || ./gradlew :app:assembleDebug

echo ""
echo "=========================================================="
echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
echo "=========================================================="
echo ""
echo "📦 Google Play Console Release Bundle (AAB):"
find "$(pwd)/app/build/outputs/bundle/release" -name "*.aab" -exec ls -lh {} + 2>/dev/null || true
echo ""
echo "📱 Direct Install APK:"
find "$(pwd)/app/build/outputs/apk" -name "*.apk" -exec ls -lh {} + 2>/dev/null || true
echo ""
echo "👉 In GitHub Codespaces File Explorer on the left:"
echo "   1. Right-click on app/build/outputs/bundle/release/app-release.aab"
echo "   2. Click 'Download...'"
echo "   3. Upload to Google Play Console closed testing track!"
echo "=========================================================="

#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🎯 Ludo Bounty - Android Codespaces Builder"
echo "Package: com.ludobounty.game"
echo "=========================================="

# 1. Update and install JDK 17 & required utilities
echo "📦 Step 1: Installing OpenJDK 17 and dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq openjdk-17-jdk wget unzip

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 2. Setup Android Command Line Tools & SDK if not present
echo "📱 Step 2: Checking Android SDK..."
export ANDROID_HOME=$HOME/android-sdk
mkdir -p "$ANDROID_HOME/cmdline-tools"

if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "⬇️ Downloading Android Command-Line Tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip
    unzip -q /tmp/cmdline-tools.zip -d "$ANDROID_HOME/cmdline-tools"
    mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
    rm -f /tmp/cmdline-tools.zip
fi

export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept Android SDK licenses automatically
echo "📝 Accepting Android SDK licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

# Install platform and build-tools
echo "⬇️ Installing Android Platform 35 and Build Tools 35.0.0..."
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0" > /dev/null 2>&1

# Ensure gradle wrapper jar exists
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "⬇️ Downloading gradle-wrapper.jar..."
    mkdir -p gradle/wrapper
    curl -sSL "https://raw.githubusercontent.com/gradle/gradle/v8.9.0/gradle/wrapper/gradle-wrapper.jar" -o gradle/wrapper/gradle-wrapper.jar
fi

# 3. Create Upload Keystore if not present
echo "🔑 Step 3: Preparing Keystore for Google Play Console..."
if [ ! -f "app/release.keystore" ]; then
    keytool -genkey -v -keystore app/release.keystore \
        -alias ludobounty -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass ludobounty123 -keypass ludobounty123 \
        -dname "CN=LudoBounty, OU=Gaming, O=LudoBounty, L=SanFrancisco, S=California, C=US"
    echo "✅ Release keystore created at app/release.keystore"
else
    echo "✅ Existing release keystore found at app/release.keystore"
fi

# 4. Make gradlew executable
chmod +x gradlew

# 5. Build Android App Bundle (.aab)
echo "🚀 Step 4: Building Signed Android App Bundle (.aab) for Google Play Console..."
./gradlew bundleRelease --stacktrace

# 6. Build APK (.apk) for device testing
echo "📱 Step 5: Building APK (.apk) for direct phone installation..."
./gradlew assembleRelease --stacktrace

echo ""
echo "=========================================="
echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "1️⃣ Android App Bundle (.aab) for Google Play Console:"
echo "   👉 android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "2️⃣ Release APK (.apk) for device testing:"
echo "   👉 android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "💡 To download to your computer from Codespaces:"
echo "   - In the Codespaces file tree on the left,"
echo "   - Navigate to: android > app > build > outputs > bundle > release"
echo "   - Right-click 'app-release.aab' and select 'Download...'"
echo "   - Then drag and drop it into Google Play Console!"
echo "=========================================="

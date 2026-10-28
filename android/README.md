# Ludo Bounty - Android Studio & Kotlin Native Project

A complete, professional native Android Ludo board game built with Kotlin, Custom Canvas 2D/3D-shaded rendering, clean modular architecture, and offline persistence.

---

## 📱 Project Specifications
- **App Name**: Ludo Bounty
- **Platform**: Android
- **IDE**: Android Studio (Ladybug, Koala, Hedgehog or newer)
- **Language**: Kotlin 2.0+
- **Min SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 35 (Android 15)
- **UI Architecture**: Custom Android `Canvas` & `Paint` game rendering + Android Material Components
- **Orientation**: Portrait Only (`android:screenOrientation="portrait"`)
- **Game Modes**:
  1. **Computer Mode** (Single Player vs Smart Heuristic AI)
  2. **Local Multiplayer** (Pass & Play on single device with 2P, 3P, or 4P)

---

## 🏗️ Architecture & Package Structure
```
app/src/main/
├── AndroidManifest.xml
├── java/com/ludobounty/game/
│   ├── MainActivity.kt               # Android lifecycle, dialogs, state coordination
│   ├── model/
│   │   └── LudoModels.kt             # Player, Token, MoveOption, GameState, Enums
│   ├── ui/
│   │   └── LudoBoardView.kt          # Custom Android Canvas 15x15 board renderer
│   ├── engine/
│   │   ├── LudoRules.kt              # Classic Ludo rule validator, safe star indices
│   │   └── LudoAI.kt                 # Heuristic decision tree for computer players
│   └── data/
│       └── GameSaveManager.kt        # SharedPreferences persistence for unfinished games
└── res/
    ├── layout/
    │   └── activity_main.xml
    └── values/
        ├── colors.xml
        └── strings.xml
```

---

## 🎲 Classic Ludo Rules Implemented
1. **Releasing from Yard**: Rolling a **6** allows moving a token from the yard onto the player's start square.
2. **Extra Turns**:
   - Rolling a 6 grants an extra turn.
   - Capturing an opponent token grants an extra turn + **120 Bounty Coins**.
   - Moving a token into Center Home grants an extra turn + **250 Bounty Coins**.
3. **Three Sixes Penalty**: Rolling three consecutive 6s immediately cancels the 3rd roll and advances the turn.
4. **Safe Squares**: 8 safe squares (4 color start arrows + 4 golden stars). Tokens on safe squares cannot be captured.
5. **Captures**: Landing on an opponent's token on a non-safe cell sends them back to their yard.
6. **Home Stretch & Victory**: Tokens complete 52 perimeter squares before entering the 5-cell colored home stretch. Exact dice roll required to enter the Center Home. First player with all 4 tokens home wins!

---

## 🛠️ How to Open & Build in Android Studio

1. Open **Android Studio**.
2. Select **File > Open** and choose the `android` folder (or extracted project folder).
3. Allow Gradle to sync. Android Studio will automatically download AGP 8.7.2, Kotlin 2.0, and the AndroidX libraries.
4. To test on an emulator or connected phone, press **Run 'app'** (`Shift + F10`).

---

## 🚀 Generating the Signed Release AAB (.aab) for Google Play Console

Google Play Console requires an **Android App Bundle (.aab)** signed with an upload key. Follow these exact steps:

### Option A: Via Android Studio Menu (Recommended)
1. In Android Studio, go to top menu: **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Under **Key store path**:
   - If you already have an upload keystore, click **Choose existing...** and enter your passwords.
   - If this is your first release, click **Create new...**:
     - Choose a file path on your computer (e.g. `ludo-bounty-upload-key.jks`)
     - Enter and confirm password
     - Enter an Alias (e.g. `key0`) and Alias password
     - Enter your Name/Organization under Certificate
     - Click **OK**
4. Click **Next**.
5. Select the **release** build variant.
6. Check **V2 (Full APK Signature)** / default bundle settings.
7. Click **Create** / **Finish**.
8. Android Studio compiles the bundle. When complete, a popup appears: *"Generate Signed Bundle: app-release.aab"*. Click **Locate**.
9. The `.aab` file is located at:
   ```
   app/release/app-release.aab
   (or app/build/outputs/bundle/release/app-release.aab)
   ```
10. Open **Google Play Console**, go to **Testing > Closed testing** (or Production > Releases), and drag and drop `app-release.aab` into the *"Drop app bundles here to upload"* area.

### Option B: Via Command Line (Gradle)
```bash
./gradlew bundleRelease
```
Output bundle will be located at `app/build/outputs/bundle/release/app-release.aab`.


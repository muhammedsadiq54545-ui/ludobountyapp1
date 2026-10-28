import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Smartphone, Terminal, Download, Package, HelpCircle, ArrowRight } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANDROID_FILES = [
  {
    id: 'view',
    name: 'LudoBoardView.kt',
    path: 'app/src/main/java/com/ludobounty/game/ui/LudoBoardView.kt',
    lang: 'kotlin',
    code: `package com.ludobounty.game.ui

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.ludobounty.game.model.MoveOption
import com.ludobounty.game.model.Player
import com.ludobounty.game.model.PlayerColor
import com.ludobounty.game.model.Token

/**
 * Custom Android Canvas-based Board rendering for Ludo Bounty.
 * Draws 15x15 Ludo board with 3D shaded pawns, safe star indicators,
 * color-coded quadrants, and handles responsive touch input.
 */
class LudoBoardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f
        color = Color.argb(80, 255, 255, 255)
    }
    private val starPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#FBBF24")
    }
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        textSize = 24f
        typeface = Typeface.DEFAULT_BOLD
    }

    private var players: List<Player> = emptyList()
    private var validMoves: List<MoveOption> = emptyList()
    private var onTokenClickListener: ((Int) -> Unit)? = null

    fun updateGameState(players: List<Player>, validMoves: List<MoveOption>) {
        this.players = players
        this.validMoves = validMoves
        invalidate()
    }

    fun setOnTokenClickListener(listener: (Int) -> Unit) {
        this.onTokenClickListener = listener
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        val size = width.coerceAtMost(height)
        setMeasuredDimension(size, size)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val size = width.toFloat()
        val cellSize = size / 15f

        // Draw Board Background
        bgPaint.color = Color.parseColor("#0F172A")
        canvas.drawRect(0f, 0f, size, size, bgPaint)

        // Draw 4 Base Quadrants: Green (top-left), Red (top-right), Yellow (bottom-left), Blue (bottom-right)
        drawYard(canvas, 0f, 0f, cellSize * 6, cellSize * 6, Color.parseColor("#059669"), "GREEN", PlayerColor.GREEN, cellSize)
        drawYard(canvas, cellSize * 9, 0f, cellSize * 6, cellSize * 6, Color.parseColor("#DC2626"), "RED", PlayerColor.RED, cellSize)
        drawYard(canvas, 0f, cellSize * 9, cellSize * 6, cellSize * 6, Color.parseColor("#D97706"), "YELLOW", PlayerColor.YELLOW, cellSize)
        drawYard(canvas, cellSize * 9, cellSize * 9, cellSize * 6, cellSize * 6, Color.parseColor("#2563EB"), "BLUE", PlayerColor.BLUE, cellSize)

        // Draw 15x15 Grid Track Cells
        for (r in 0 until 15) {
            for (c in 0 until 15) {
                val inBase = (r < 6 && c < 6) || (r < 6 && c >= 9) || (r >= 9 && c < 6) || (r >= 9 && c >= 9)
                val inCenter = (r in 6..8 && c in 6..8)
                if (inBase || inCenter) continue

                val left = c * cellSize
                val top = r * cellSize
                val right = left + cellSize
                val bottom = top + cellSize

                when {
                    r == 7 && c in 1..5 -> bgPaint.color = Color.parseColor("#10B981") // Green home run
                    c == 7 && r in 1..5 -> bgPaint.color = Color.parseColor("#EF4444") // Red home run
                    r == 7 && c in 9..13 -> bgPaint.color = Color.parseColor("#3B82F6") // Blue home run
                    c == 7 && r in 9..13 -> bgPaint.color = Color.parseColor("#FBBF24") // Yellow home run
                    r == 6 && c == 1 -> bgPaint.color = Color.parseColor("#059669") // Green Start
                    r == 1 && c == 8 -> bgPaint.color = Color.parseColor("#DC2626") // Red Start
                    r == 8 && c == 13 -> bgPaint.color = Color.parseColor("#2563EB") // Blue Start
                    r == 13 && c == 6 -> bgPaint.color = Color.parseColor("#D97706") // Yellow Start
                    (r + c) % 2 == 0 -> bgPaint.color = Color.parseColor("#FFFFFF")
                    else -> bgPaint.color = Color.parseColor("#F8FAFC")
                }

                canvas.drawRect(left, top, right, bottom, bgPaint)
                canvas.drawRect(left, top, right, bottom, strokePaint)

                // Safe star markings
                if ((r == 2 && c == 6) || (r == 6 && c == 12) || (r == 12 && c == 8) || (r == 8 && c == 2)) {
                    drawStar(canvas, left + cellSize / 2, top + cellSize / 2, cellSize * 0.35f)
                }
            }
        }

        // Draw Center Triangles
        drawCenterTriangles(canvas, cellSize * 6, cellSize * 6, cellSize * 3)

        // Draw 3D Shaded Tokens
        drawTokens(canvas, cellSize)
    }

    private fun drawYard(canvas: Canvas, x: Float, y: Float, w: Float, h: Float, color: Int, title: String, pColor: PlayerColor, cellSize: Float) {
        bgPaint.color = color
        canvas.drawRect(x, y, x + w, y + h, bgPaint)
        val innerMargin = w * 0.10f
        bgPaint.color = Color.parseColor("#FFFFFF")
        val innerRect = RectF(x + innerMargin, y + innerMargin, x + w - innerMargin, y + h - innerMargin)
        canvas.drawRoundRect(innerRect, 20f, 20f, bgPaint)
    }


    private fun drawCenterTriangles(canvas: Canvas, x: Float, y: Float, w: Float) {
        val cx = x + w / 2
        val cy = y + w / 2

        // Green Left Triangle
        val pathG = Path().apply { moveTo(x, y); lineTo(cx, cy); lineTo(x, y + w); close() }
        bgPaint.color = Color.parseColor("#059669")
        canvas.drawPath(pathG, bgPaint)

        // Red Top Triangle
        val pathR = Path().apply { moveTo(x, y); lineTo(cx, cy); lineTo(x + w, y); close() }
        bgPaint.color = Color.parseColor("#DC2626")
        canvas.drawPath(pathR, bgPaint)

        // Blue Right Triangle
        val pathB = Path().apply { moveTo(x + w, y); lineTo(cx, cy); lineTo(x + w, y + w); close() }
        bgPaint.color = Color.parseColor("#2563EB")
        canvas.drawPath(pathB, bgPaint)

        // Yellow Bottom Triangle
        val pathY = Path().apply { moveTo(x, y + w); lineTo(cx, cy); lineTo(x + w, y + w); close() }
        bgPaint.color = Color.parseColor("#D97706")
        canvas.drawPath(pathY, bgPaint)
    }

    private fun drawStar(canvas: Canvas, cx: Float, cy: Float, radius: Float) {
        val path = Path()
        val innerRadius = radius * 0.45f
        for (i in 0 until 10) {
            val r = if (i % 2 == 0) radius else innerRadius
            val angle = (i * 36 - 90) * Math.PI / 180.0
            val x = (cx + r * Math.cos(angle)).toFloat()
            val y = (cy + r * Math.sin(angle)).toFloat()
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        path.close()
        canvas.drawPath(path, starPaint)
    }

    /**
     * Step-by-step animation stepping through each square along the valid Ludo path.
     * Advances one square at a time with visible stop and hop sound trigger.
     */
    fun animateTokenStepMovement(
        color: PlayerColor,
        tokenId: Int,
        startStep: Int,
        targetStep: Int,
        onHopStep: (step: Int) -> Unit,
        onAnimationFinished: () -> Unit
    ) {
        val steps = (startStep + 1..targetStep).toList()
        var stepIdx = 0

        fun hopNext() {
            if (stepIdx >= steps.size) {
                invalidate()
                onAnimationFinished()
                return
            }
            val currentStepVal = steps[stepIdx]
            val animator = ValueAnimator.ofFloat(0f, 1f).apply {
                duration = 120L // 120ms per square
                interpolator = DecelerateInterpolator()
                addUpdateListener { invalidate() }
            }
            animator.addListener(object : android.animation.AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: android.animation.Animator) {
                    onHopStep(currentStepVal)
                    stepIdx++
                    Handler(Looper.getMainLooper()).postDelayed({ hopNext() }, 20L)
                }
            })
            animator.start()
        }
        hopNext()
    }
}`,
  },
  {
    id: 'activity',
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/ludobounty/game/MainActivity.kt',
    lang: 'kotlin',
    code: `package com.ludobounty.game

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.ludobounty.game.model.GameMode
import com.ludobounty.game.model.PlayerColor
import com.ludobounty.game.ui.LudoBoardView

class MainActivity : AppCompatActivity() {

    private lateinit var boardView: LudoBoardView
    private var currentGameMode: GameMode = GameMode.VS_COMPUTER
    private var bountyCoins: Int = 1250

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        boardView = findViewById(R.id.ludoBoardView)
        boardView.setOnTokenClickListener { tokenId ->
            Toast.makeText(this, "Moved Token \${tokenId + 1}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onBackPressed() {
        AlertDialog.Builder(this)
            .setTitle("Exit Game")
            .setMessage("Do you want to save and exit to the main menu?")
            .setPositiveButton("Exit") { _, _ -> super.onBackPressed() }
            .setNegativeButton("Cancel", null)
            .show()
    }
}`,
  },
  {
    id: 'models',
    name: 'LudoModels.kt',
    path: 'app/src/main/java/com/ludobounty/game/model/LudoModels.kt',
    lang: 'kotlin',
    code: `package com.ludobounty.game.model

enum class PlayerColor { GREEN, YELLOW, BLUE, RED }
enum class GameMode { VS_COMPUTER, LOCAL_MULTIPLAYER }
enum class GameStatus { MENU, PLAYING, PAUSED, GAME_OVER }

data class Token(
    val id: Int,
    val color: PlayerColor,
    var step: Int = -1,
    var isHome: Boolean = false,
    var isInBase: Boolean = true
)

data class Player(
    val id: String,
    val name: String,
    val color: PlayerColor,
    val isComputer: Boolean,
    val tokens: List<Token>,
    var tokensHome: Int = 0,
    var rank: Int? = null,
    var bountyScore: Int = 0
)

data class MoveOption(
    val tokenId: Int,
    val token: Token,
    val fromStep: Int,
    val toStep: Int,
    val willCapture: Boolean,
    val willReachHome: Boolean
)`,
  },
  {
    id: 'gradle',
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    lang: 'gradle',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.ludobounty.game"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.ludobounty.game"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}`,
  },
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    lang: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Ludo Bounty"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LudoBounty"
        tools:targetApi="35">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
  },
  {
    id: 'layout',
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    lang: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#090D16">

    <!-- Top Player Row: GREEN (top-left) and RED (top-right) aligned directly with Ludo board edges -->
    <LinearLayout
        android:id="@+id/topPlayersRow"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        app:layout_constraintTop_toBottomOf="@id/topBar"
        app:layout_constraintStart_toStartOf="@id/ludoBoardView"
        app:layout_constraintEnd_toEndOf="@id/ludoBoardView">

        <!-- 1. Top Left: Player GREEN Info -->
        <LinearLayout
            android:id="@+id/playerGreenInfo"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="vertical">
            <!-- Avatar, Role, Home, and Progress Bar -->
        </LinearLayout>

        <View
            android:layout_width="0dp"
            android:layout_height="1dp"
            android:layout_weight="1" />

        <!-- 2. Top Right: Player RED Info -->
        <LinearLayout
            android:id="@+id/playerRedInfo"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:gravity="end"
            android:orientation="vertical">
            <!-- Avatar, Role, Home, and Progress Bar -->
        </LinearLayout>
    </LinearLayout>

    <!-- Centered 15x15 Ludo Board View (Pure board canvas, zero overlay, generous margins) -->
    <com.ludobounty.game.ui.LudoBoardView
        android:id="@+id/ludoBoardView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:layout_marginStart="64dp"
        android:layout_marginEnd="64dp"
        android:layout_marginTop="8dp"
        android:layout_marginBottom="8dp"
        app:layout_constraintDimensionRatio="1:1"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/topPlayersRow"
        app:layout_constraintBottom_toTopOf="@id/bottomRow"
        app:layout_constraintVertical_bias="0.5" />

    <!-- 1. Green ROLL Button: Upper-left outside edge of the board ("Green Roll") -->
    <FrameLayout
        android:id="@+id/btnRollGreen"
        android:layout_width="52dp"
        android:layout_height="52dp"
        android:layout_marginEnd="8dp"
        android:layout_marginTop="12dp"
        android:background="#FFFFFF"
        app:layout_constraintEnd_toStartOf="@id/ludoBoardView"
        app:layout_constraintTop_toTopOf="@id/ludoBoardView" />

    <!-- 2. Red ROLL Button: Upper-right outside edge of the board ("Red Roll") -->
    <FrameLayout
        android:id="@+id/btnRollRed"
        android:layout_width="52dp"
        android:layout_height="52dp"
        android:layout_marginStart="8dp"
        android:layout_marginTop="12dp"
        android:background="#FFFFFF"
        app:layout_constraintStart_toEndOf="@id/ludoBoardView"
        app:layout_constraintTop_toTopOf="@id/ludoBoardView" />

    <!-- 3. Yellow ROLL Button: Lower-left outside edge of the board ("Yellow Roll") -->
    <FrameLayout
        android:id="@+id/btnRollYellow"
        android:layout_width="52dp"
        android:layout_height="52dp"
        android:layout_marginEnd="8dp"
        android:layout_marginBottom="12dp"
        android:background="#FFFFFF"
        app:layout_constraintEnd_toStartOf="@id/ludoBoardView"
        app:layout_constraintBottom_toBottomOf="@id/ludoBoardView" />

    <!-- 4. Blue ROLL Button: Lower-right outside edge of the board ("Blue Roll") -->
    <FrameLayout
        android:id="@+id/btnRollBlue"
        android:layout_width="52dp"
        android:layout_height="52dp"
        android:layout_marginStart="8dp"
        android:layout_marginBottom="12dp"
        android:background="#FFFFFF"
        app:layout_constraintStart_toEndOf="@id/ludoBoardView"
        app:layout_constraintBottom_toBottomOf="@id/ludoBoardView" />

    <!-- Bottom Row: Player YELLOW (bottom-left) and BLUE (bottom-right) aligned directly with Ludo board edges -->
    <LinearLayout
        android:id="@+id/bottomRow"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginBottom="8dp"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="@id/ludoBoardView"
        app:layout_constraintEnd_toEndOf="@id/ludoBoardView">
        <!-- Player YELLOW Controls (Left) -->
        <!-- Player BLUE Controls (Right) -->
    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`,
  },
  {
    id: 'settings_gradle',
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    lang: 'gradle',
    code: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LudoBounty"
include(":app")`,
  },
  {
    id: 'libs_toml',
    name: 'libs.versions.toml',
    path: 'gradle/libs.versions.toml',
    lang: 'toml',
    code: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.13.1"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.1.4"
lifecycle = "2.8.6"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-lifecycle-viewmodel-ktx = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-ktx", version.ref = "lifecycle" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }`,
  },
  {
    id: 'themes',
    name: 'themes.xml',
    path: 'app/src/main/res/values/themes.xml',
    lang: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.LudoBounty" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/ludo_green</item>
        <item name="colorPrimaryVariant">#047857</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="android:statusBarColor">#090D16</item>
        <item name="android:navigationBarColor">#090D16</item>
        <item name="android:windowBackground">@color/navy_bg</item>
    </style>
</resources>`,
  },
];

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'aab_guide' | 'code'>('aab_guide');
  const [selectedFileId, setSelectedFileId] = useState('view');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeFile = ANDROID_FILES.find((f) => f.id === selectedFileId) || ANDROID_FILES[0];

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(activeFile.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-400/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                Google Play .AAB Release & Code
              </h2>
              <span className="text-[11px] text-slate-400">
                Package: <code className="text-amber-300 font-mono">com.ludobounty.game</code> (v1.0.0)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher + 1-Click Download Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('aab_guide');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'aab_guide'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Google Play .AAB Guide</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('code');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Kotlin Files ({ANDROID_FILES.length})</span>
            </button>
          </div>

          <a
            href="/ludo-bounty-android-project.zip"
            download="ludo-bounty-android-project.zip"
            onClick={() => soundEffects.playClick()}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download Project (.ZIP)</span>
          </a>
        </div>

        {/* TAB 1: Google Play .aab Instructions */}
        {activeTab === 'aab_guide' ? (
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-slate-200">
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-2xl border border-emerald-500/40">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎯 For Google Play Console "App bundles" Dropzone</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Google Play requires an <strong>Android App Bundle (.aab)</strong> file signed with your developer keystore. Follow these 4 easy steps to generate and upload it:
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                  1
                </span>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white">Download & Extract Project</div>
                  <p className="text-slate-400 mt-0.5">
                    Click the amber <strong>"Download Project (.ZIP)"</strong> button above to download <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">ludo-bounty-android-project.zip</code>, then unzip it to any folder on your computer.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                  2
                </span>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white">Open in Android Studio</div>
                  <p className="text-slate-400 mt-0.5">
                    Open Android Studio, click <strong>File &gt; Open</strong>, and select the unzipped <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">android/</code> directory. Android Studio will automatically sync dependencies.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                  3
                </span>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white">Generate Signed App Bundle (.aab)</div>
                  <p className="text-slate-400 mt-0.5">
                    From the top menu, click <strong>Build &gt; Generate Signed Bundle / APK...</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300 text-[11px]">
                    <li>Select <strong>Android App Bundle (.aab)</strong> and click Next</li>
                    <li>Choose your keystore (or click <em>Create new...</em>) and enter credentials</li>
                    <li>Select destination build type: <strong>release</strong> and click <strong>Finish</strong></li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-400/30 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-emerald-300">Upload to Google Play Console</div>
                  <p className="text-slate-300 mt-0.5">
                    Android Studio will create your file at:
                    <br />
                    <code className="text-amber-300 bg-black/50 px-1.5 py-0.5 rounded font-mono text-[11px] inline-block mt-1">
                      app/build/outputs/bundle/release/app-release.aab
                    </code>
                  </p>
                  <p className="text-slate-400 mt-1">
                    Drag and drop that <code className="text-white">app-release.aab</code> file directly into the <strong>"Drop app bundles here to upload"</strong> box in Google Play Console!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: File Code Viewer */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-2">
            {/* File tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 border-b border-white/5 scrollbar-thin">
              {ANDROID_FILES.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedFileId(file.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedFileId === file.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            {/* Path & Copy bar */}
            <div className="flex items-center justify-between py-2 px-1 text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[320px]">{activeFile.path}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code display */}
            <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-3 border border-white/5 font-mono text-[11px] sm:text-xs text-emerald-200 leading-relaxed">
              <pre>{activeFile.code}</pre>
            </div>
          </div>
        )}

        {/* Footer callout */}
        <div className="mt-3 p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              CLI Command: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">./gradlew bundleRelease</code>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">com.ludobounty.game</span>
        </div>
      </div>
    </div>
  );
};


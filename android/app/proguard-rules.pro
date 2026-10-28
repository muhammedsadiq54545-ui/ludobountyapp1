# Proguard / R8 rules for Ludo Bounty
-keep class com.ludobounty.game.model.** { *; }
-keep class com.ludobounty.game.ui.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

package com.ludobounty.game

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
        // Custom portrait Android Game setup
        setContentView(R.layout.activity_main)

        boardView = findViewById(R.id.ludoBoardView)
        boardView.setOnTokenClickListener { tokenId ->
            // Move token
            Toast.makeText(this, "Moved Token ${tokenId + 1}", Toast.LENGTH_SHORT).show()
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
}

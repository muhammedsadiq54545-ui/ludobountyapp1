package com.ludobounty.game.model

enum class PlayerColor {
    GREEN, YELLOW, BLUE, RED
}

enum class GameMode {
    VS_COMPUTER, LOCAL_MULTIPLAYER
}

enum class GameStatus {
    MENU, PLAYING, PAUSED, GAME_OVER
}

data class Token(
    val id: Int,
    val color: PlayerColor,
    var step: Int = -1, // -1: in yard, 0..50: perimeter, 51..55: home stretch, 56: home
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
)

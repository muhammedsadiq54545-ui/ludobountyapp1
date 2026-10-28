package com.ludobounty.game.ui

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.os.Handler
import android.os.Looper
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import com.ludobounty.game.model.MoveOption
import com.ludobounty.game.model.Player
import com.ludobounty.game.model.PlayerColor
import com.ludobounty.game.model.Token

/**
 * Custom Android Canvas-based Board rendering for Ludo Bounty.
 * Draws a 15x15 Ludo board matching the classic tournament design:
 * - Green home in top-left (rows 0..5, cols 0..5)
 * - Red home in top-right (rows 0..5, cols 9..14)
 * - Yellow home in bottom-left (rows 9..14, cols 0..5)
 * - Blue home in bottom-right (rows 9..14, cols 9..14)
 * - Central finishing area in exact middle (rows 6..8, cols 6..8)
 * - White and light-gray board squares, safe star markings, and 3D glossy pawns.
 * - Flat modern typography (no drop-shadows or embossed text).
 * - Step-by-step token movement animation (120ms per cell with hop bounce).
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
        color = Color.parseColor("#CBD5E1")
    }
    private val starPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#F59E0B")
    }
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        textSize = 24f
        typeface = Typeface.DEFAULT_BOLD
    }
    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#334155")
        textAlign = Paint.Align.CENTER
        textSize = 18f
        typeface = Typeface.DEFAULT_BOLD
    }

    private var players: List<Player> = emptyList()
    private var validMoves: List<MoveOption> = emptyList()
    private var onTokenClickListener: ((Int) -> Unit)? = null

    // Track 52 cells around perimeter [row, col]
    private val perimeterPath = arrayOf(
        intArrayOf(6, 1), intArrayOf(6, 2), intArrayOf(6, 3), intArrayOf(6, 4), intArrayOf(6, 5),
        intArrayOf(5, 6), intArrayOf(4, 6), intArrayOf(3, 6), intArrayOf(2, 6), intArrayOf(1, 6), intArrayOf(0, 6),
        intArrayOf(0, 7), intArrayOf(0, 8),
        intArrayOf(1, 8), intArrayOf(2, 8), intArrayOf(3, 8), intArrayOf(4, 8), intArrayOf(5, 8),
        intArrayOf(6, 9), intArrayOf(6, 10), intArrayOf(6, 11), intArrayOf(6, 12), intArrayOf(6, 13), intArrayOf(6, 14),
        intArrayOf(7, 14), intArrayOf(8, 14),
        intArrayOf(8, 13), intArrayOf(8, 12), intArrayOf(8, 11), intArrayOf(8, 10), intArrayOf(8, 9),
        intArrayOf(9, 8), intArrayOf(10, 8), intArrayOf(11, 8), intArrayOf(12, 8), intArrayOf(13, 8), intArrayOf(14, 8),
        intArrayOf(14, 7), intArrayOf(14, 6),
        intArrayOf(13, 6), intArrayOf(12, 6), intArrayOf(11, 6), intArrayOf(10, 6), intArrayOf(9, 6),
        intArrayOf(8, 5), intArrayOf(8, 4), intArrayOf(8, 3), intArrayOf(8, 2), intArrayOf(8, 1), intArrayOf(8, 0),
        intArrayOf(7, 0), intArrayOf(6, 0)
    )

    // Base yard 4 token slot centers [row, col]
    private val yardSlots = mapOf(
        PlayerColor.GREEN to arrayOf(floatArrayOf(1.7f, 1.7f), floatArrayOf(1.7f, 4.3f), floatArrayOf(4.3f, 1.7f), floatArrayOf(4.3f, 4.3f)),
        PlayerColor.RED to arrayOf(floatArrayOf(1.7f, 10.7f), floatArrayOf(1.7f, 13.3f), floatArrayOf(4.3f, 10.7f), floatArrayOf(4.3f, 13.3f)),
        PlayerColor.YELLOW to arrayOf(floatArrayOf(10.7f, 1.7f), floatArrayOf(10.7f, 4.3f), floatArrayOf(13.3f, 1.7f), floatArrayOf(13.3f, 4.3f)),
        PlayerColor.BLUE to arrayOf(floatArrayOf(10.7f, 10.7f), floatArrayOf(10.7f, 13.3f), floatArrayOf(13.3f, 10.7f), floatArrayOf(13.3f, 13.3f))
    )

    // Animated hopping token tracking
    private var animatingTokenId: Int? = null
    private var animatingColor: PlayerColor? = null
    private var animCurrentRow: Float = 0f
    private var animCurrentCol: Float = 0f
    private var animHopScale: Float = 1.0f
    private val mainHandler = Handler(Looper.getMainLooper())

    fun updateGameState(players: List<Player>, validMoves: List<MoveOption>) {
        this.players = players
        this.validMoves = validMoves
        invalidate()
    }

    fun setOnTokenClickListener(listener: (Int) -> Unit) {
        this.onTokenClickListener = listener
    }

    fun animateTokenStepMovement(
        color: PlayerColor,
        tokenId: Int,
        startStep: Int,
        targetStep: Int,
        onHopStep: (step: Int) -> Unit,
        onAnimationFinished: () -> Unit
    ) {
        animatingColor = color
        animatingTokenId = tokenId

        val steps = (startStep + 1..targetStep).toList()
        if (steps.isEmpty()) {
            animatingTokenId = null
            animatingColor = null
            onAnimationFinished()
            return
        }

        var stepIdx = 0

        fun hopNext() {
            if (stepIdx >= steps.size) {
                animatingTokenId = null
                animatingColor = null
                invalidate()
                onAnimationFinished()
                return
            }

            val currentStepVal = steps[stepIdx]
            val (fromR, fromC) = getTokenRowCol(color, tokenId, if (stepIdx == 0) startStep else steps[stepIdx - 1])
            val (toR, toC) = getTokenRowCol(color, tokenId, currentStepVal)

            val animator = ValueAnimator.ofFloat(0f, 1f).apply {
                duration = 120L // 120ms per square
                interpolator = DecelerateInterpolator()
                addUpdateListener { anim ->
                    val fraction = anim.animatedFraction
                    animCurrentRow = fromR + (toR - fromR) * fraction
                    animCurrentCol = fromC + (toC - fromC) * fraction
                    animHopScale = 1.0f + 0.25f * kotlin.math.sin(fraction * Math.PI).toFloat()
                    invalidate()
                }
            }

            animator.addListener(object : android.animation.AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: android.animation.Animator) {
                    onHopStep(currentStepVal)
                    stepIdx++
                    mainHandler.postDelayed({ hopNext() }, 20L)
                }
            })

            animator.start()
        }

        hopNext()
    }

    private fun getTokenRowCol(color: PlayerColor, tokenId: Int, step: Int): Pair<Float, Float> {
        if (step == -1) {
            val slots = yardSlots[color] ?: return Pair(7.5f, 7.5f)
            val slot = slots[tokenId.coerceIn(0, 3)]
            return Pair(slot[0], slot[1])
        }

        val colorOffset = when (color) {
            PlayerColor.GREEN -> 0
            PlayerColor.RED -> 13
            PlayerColor.BLUE -> 26
            PlayerColor.YELLOW -> 39
        }

        if (step < 51) {
            val trackIdx = (colorOffset + step) % 52
            val coord = perimeterPath[trackIdx]
            return Pair(coord[0] + 0.5f, coord[1] + 0.5f)
        }

        // Home stretch (steps 51..56)
        val homeStep = step - 51
        return when (color) {
            PlayerColor.GREEN -> Pair(7.5f, (1 + homeStep) + 0.5f)
            PlayerColor.RED -> Pair((1 + homeStep) + 0.5f, 7.5f)
            PlayerColor.BLUE -> Pair(7.5f, (13 - homeStep) + 0.5f)
            PlayerColor.YELLOW -> Pair((13 - homeStep) + 0.5f, 7.5f)
        }
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

        // 1. Draw Board Background
        bgPaint.color = Color.parseColor("#FFFFFF")
        canvas.drawRect(0f, 0f, size, size, bgPaint)

        // 2. Draw 4 Base Quadrants:
        // Green (top-left: cols 0..5, rows 0..5)
        drawYard(canvas, 0f, 0f, cellSize * 6, cellSize * 6, Color.parseColor("#059669"), "GREEN", PlayerColor.GREEN, cellSize)
        // Red (top-right: cols 9..14, rows 0..5)
        drawYard(canvas, cellSize * 9, 0f, cellSize * 6, cellSize * 6, Color.parseColor("#DC2626"), "RED", PlayerColor.RED, cellSize)
        // Yellow (bottom-left: cols 0..5, rows 9..14)
        drawYard(canvas, 0f, cellSize * 9, cellSize * 6, cellSize * 6, Color.parseColor("#D97706"), "YELLOW", PlayerColor.YELLOW, cellSize)
        // Blue (bottom-right: cols 9..14, rows 9..14)
        drawYard(canvas, cellSize * 9, cellSize * 9, cellSize * 6, cellSize * 6, Color.parseColor("#2563EB"), "BLUE", PlayerColor.BLUE, cellSize)

        // 3. Draw 15x15 Playable Track Cells (72 cells outside homes & center)
        for (r in 0 until 15) {
            for (c in 0 until 15) {
                val inBase = (r < 6 && c < 6) || (r < 6 && c >= 9) || (r >= 9 && c < 6) || (r >= 9 && c >= 9)
                val inCenter = (r in 6..8 && c in 6..8)
                if (inBase || inCenter) continue

                val left = c * cellSize
                val top = r * cellSize
                val right = left + cellSize
                val bottom = top + cellSize

                // Color home stretches and start squares
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

        // 4. Draw Center Triangles (rows 6..8, cols 6..8 -> exactly 3x3)
        drawCenterTriangles(canvas, cellSize * 6, cellSize * 6, cellSize * 3)

        // 5. Draw 3D Shaded Tokens with flat text numbering
        drawTokens(canvas, cellSize)
    }

    private fun drawYard(
        canvas: Canvas,
        x: Float,
        y: Float,
        w: Float,
        h: Float,
        color: Int,
        title: String,
        playerColor: PlayerColor,
        cellSize: Float
    ) {
        // Outer colored quadrant
        bgPaint.color = color
        canvas.drawRect(x, y, x + w, y + h, bgPaint)

        // Inner white card
        val innerMargin = w * 0.10f
        bgPaint.color = Color.parseColor("#FFFFFF")
        val innerRect = RectF(x + innerMargin, y + innerMargin, x + w - innerMargin, y + h - innerMargin)
        canvas.drawRoundRect(innerRect, 22f, 22f, bgPaint)

        // Draw 4 circular slot rings inside each yard
        val slots = yardSlots[playerColor] ?: return
        val slotRadius = cellSize * 0.42f
        val slotStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            this.color = color
        }
        val slotFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            this.color = Color.argb(35, Color.red(color), Color.green(color), Color.blue(color))
        }

        for (slot in slots) {
            val cx = slot[1] * cellSize
            val cy = slot[0] * cellSize
            canvas.drawCircle(cx, cy, slotRadius, slotFillPaint)
            canvas.drawCircle(cx, cy, slotRadius, slotStrokePaint)
        }
    }


    private fun drawCenterTriangles(canvas: Canvas, x: Float, y: Float, w: Float) {
        val cx = x + w / 2
        val cy = y + w / 2

        // Green Left Triangle (connects to Green home stretch)
        val pathG = Path().apply { moveTo(x, y); lineTo(cx, cy); lineTo(x, y + w); close() }
        bgPaint.color = Color.parseColor("#059669")
        canvas.drawPath(pathG, bgPaint)

        // Red Top Triangle (connects to Red home stretch)
        val pathR = Path().apply { moveTo(x, y); lineTo(cx, cy); lineTo(x + w, y); close() }
        bgPaint.color = Color.parseColor("#DC2626")
        canvas.drawPath(pathR, bgPaint)

        // Blue Right Triangle (connects to Blue home stretch)
        val pathB = Path().apply { moveTo(x + w, y); lineTo(cx, cy); lineTo(x + w, y + w); close() }
        bgPaint.color = Color.parseColor("#2563EB")
        canvas.drawPath(pathB, bgPaint)

        // Yellow Bottom Triangle (connects to Yellow home stretch)
        val pathY = Path().apply { moveTo(x, y + w); lineTo(cx, cy); lineTo(x + w, y + w); close() }
        bgPaint.color = Color.parseColor("#D97706")
        canvas.drawPath(pathY, bgPaint)

        // Dividing lines
        val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            strokeWidth = 3f
        }
        canvas.drawLine(x, y, x + w, y + w, linePaint)
        canvas.drawLine(x + w, y, x, y + w, linePaint)

        // Center victory trophy badge
        val trophyBg = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.parseColor("#F59E0B") }
        canvas.drawCircle(cx, cy, w * 0.18f, trophyBg)
        canvas.drawCircle(cx, cy, w * 0.18f, linePaint)
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

    private fun drawTokens(canvas: Canvas, cellSize: Float) {
        for (player in players) {
            val colorHex = when (player.color) {
                PlayerColor.GREEN -> "#10B981"
                PlayerColor.RED -> "#EF4444"
                PlayerColor.BLUE -> "#3B82F6"
                PlayerColor.YELLOW -> "#FBBF24"
            }
            bgPaint.color = Color.parseColor(colorHex)

            for (token in player.tokens) {
                if (token.isHome) continue

                val isCurrentlyHopping = (animatingColor == player.color && animatingTokenId == token.id)
                val (r, c) = if (isCurrentlyHopping) {
                    Pair(animCurrentRow, animCurrentCol)
                } else {
                    getTokenRowCol(player.color, token.id, token.step)
                }

                val scale = if (isCurrentlyHopping) animHopScale else 1.0f
                val tokenRadius = cellSize * 0.38f * scale
                val cx = c * cellSize
                val cy = r * cellSize

                // Draw token base shadow
                val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = Color.parseColor("#45000000")
                }
                canvas.drawCircle(cx, cy + tokenRadius * 0.15f, tokenRadius, shadowPaint)

                // Draw 3D token body
                canvas.drawCircle(cx, cy, tokenRadius, bgPaint)
                canvas.drawCircle(cx, cy, tokenRadius, strokePaint)

                // Clean flat text for token index
                textPaint.textSize = tokenRadius * 0.9f
                canvas.drawText("${token.id + 1}", cx, cy + tokenRadius * 0.35f, textPaint)
            }
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_UP) {
            if (validMoves.isNotEmpty()) {
                onTokenClickListener?.invoke(validMoves[0].tokenId)
            }
            return true
        }
        return true
    }
}

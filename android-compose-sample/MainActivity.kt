package com.example.customnavbar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.RssFeed
import androidx.compose.material.icons.filled.Widgets
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    CustomNavbarScreen()
                }
            }
        }
    }
}

data class BottomItem(
    val label: String,
    val icon: ImageVector
)

@Composable
fun CustomNavbarScreen() {
    val items = listOf(
        BottomItem("Início", Icons.Default.Home),
        BottomItem("Gaveta de Apps", Icons.Default.Widgets),
        BottomItem("Feed", Icons.Default.RssFeed)
    )

    var selectedIndex by remember { mutableIntStateOf(0) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF0F0F0))
    ) {
        Text(
            text = "Tela: ${items[selectedIndex].label}",
            modifier = Modifier.align(Alignment.Center),
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1B1B1B)
        )

        CustomBottomBar(
            items = items,
            selectedIndex = selectedIndex,
            onItemSelected = { selectedIndex = it },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 18.dp, vertical = 18.dp)
        )
    }
}

@Composable
fun CustomBottomBar(
    items: List<BottomItem>,
    selectedIndex: Int,
    onItemSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val barHeight = 74.dp

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(104.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(barHeight)
                .clip(RoundedCornerShape(38.dp))
                .background(Color.Black)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(barHeight)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            items.forEachIndexed { index, item ->
                val isSelected = index == selectedIndex
                val yOffset by animateDpAsState(
                    targetValue = if (isSelected) (-26).dp else 0.dp,
                    animationSpec = tween(durationMillis = 280, easing = FastOutSlowInEasing),
                    label = "itemYOffset"
                )
                val bubbleSize by animateDpAsState(
                    targetValue = if (isSelected) 58.dp else 26.dp,
                    animationSpec = tween(durationMillis = 280, easing = FastOutSlowInEasing),
                    label = "itemSize"
                )
                val iconScale by animateFloatAsState(
                    targetValue = if (isSelected) 1.06f else 1f,
                    animationSpec = tween(durationMillis = 240, easing = FastOutSlowInEasing),
                    label = "iconScale"
                )
                val iconColor = if (isSelected) Color(0xFFFF8A00) else Color.White

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .offset(y = yOffset)
                            .size(bubbleSize)
                            .clip(CircleShape)
                            .background(if (isSelected) Color.Black else Color.Transparent)
                            .then(
                                if (isSelected) {
                                    Modifier.border(width = 2.dp, color = Color.White, shape = CircleShape)
                                } else {
                                    Modifier
                                }
                            )
                            .clickable(
                                onClick = { onItemSelected(index) },
                                indication = null,
                                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.label,
                            tint = iconColor,
                            modifier = Modifier.size(if (isSelected) (24 * iconScale).dp else 24.dp)
                        )
                    }
                }
            }
        }
    }
}

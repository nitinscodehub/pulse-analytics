"""Generate the portfolio cover image used on GitHub / Contra.

Usage: python3 scripts/generate_cover.py
Output: public/pulse-cover.png
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


base = Image.new("RGB", (W, H), (8, 12, 18))

glow = Image.new("RGB", (W, H), (0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse((620, -260, 1420, 540), fill=(18, 105, 86))
base = ImageChops.add(base, glow.filter(ImageFilter.GaussianBlur(150)))

glow2 = Image.new("RGB", (W, H), (0, 0, 0))
glow2_draw = ImageDraw.Draw(glow2)
glow2_draw.ellipse((-220, 380, 560, 920), fill=(38, 38, 110))
base = ImageChops.add(base, glow2.filter(ImageFilter.GaussianBlur(160)))

grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
grid_draw = ImageDraw.Draw(grid)
for x in range(0, W, 60):
    grid_draw.line((x, 0, x, H), fill=(255, 255, 255, 8))
for y in range(0, H, 60):
    grid_draw.line((0, y, W, y), fill=(255, 255, 255, 8))
base = Image.alpha_composite(base.convert("RGBA"), grid)

draw = ImageDraw.Draw(base)

# Brand mark
draw.rounded_rectangle((70, 78, 122, 130), radius=16, fill=(52, 211, 153))
draw.line((84, 110, 94, 96, 104, 106, 115, 88), fill=(8, 12, 18), width=4, joint="curve")

draw.text((140, 88), "PULSE", font=font(FONT_BOLD, 30), fill=(233, 240, 248))
draw.text((141, 128), "ANALYTICS SUITE", font=font(FONT_REG, 14), fill=(139, 154, 174))

# Headline
draw.text((70, 218), "Analytics that", font=font(FONT_BOLD, 64), fill=(233, 240, 248))
draw.text((70, 300), "answers back.", font=font(FONT_BOLD, 64), fill=(52, 211, 153))

draw.text(
    (74, 412),
    "Revenue intelligence + AI insights in one dashboard.",
    font=font(FONT_REG, 24),
    fill=(150, 166, 186),
)

chips = [("Next.js 15", (99, 102, 241)), ("Recharts", (52, 211, 153)), ("Neon AI", (56, 189, 248))]
x = 74
for label, color in chips:
    width = draw.textbbox((0, 0), label, font=font(FONT_REG, 17))[2] + 30
    draw.rounded_rectangle((x, 478, x + width, 518), radius=12, outline=color, width=2)
    draw.text((x + 15, 487), label, font=font(FONT_REG, 17), fill=color)
    x += width + 14

# Mini dashboard card
card = (700, 118, 1138, 540)
draw.rounded_rectangle(card, radius=24, fill=(16, 23, 32), outline=(36, 48, 64), width=2)
draw.text((736, 152), "Revenue overview", font=font(FONT_BOLD, 20), fill=(233, 240, 248))
draw.text((736, 182), "Last 30 days", font=font(FONT_REG, 14), fill=(139, 154, 174))

draw.text((736, 220), "$21.4k", font=font(FONT_BOLD, 42), fill=(233, 240, 248))
draw.rounded_rectangle((880, 232, 976, 266), radius=10, fill=(52, 211, 153, 40))
draw.text((894, 240), "+14.2%", font=font(FONT_BOLD, 15), fill=(52, 211, 153))

chart_bottom = 492
bars = [118, 146, 132, 178, 160, 205, 188, 232, 214, 262, 248, 290]
for index, height in enumerate(bars):
    bx = 736 + index * 32
    color = (52, 211, 153) if index >= 8 else (52, 130, 110)
    draw.rounded_rectangle(
        (bx, chart_bottom - height, bx + 20, chart_bottom),
        radius=5,
        fill=color,
    )

draw.line((736, 492, 1100, 492), fill=(36, 48, 64), width=2)
draw.text((736, 508), "Built with Next.js, Recharts & Neon", font=font(FONT_REG, 14), fill=(139, 154, 174))

output = Path(__file__).resolve().parents[1] / "public" / "pulse-cover.png"
output.parent.mkdir(parents=True, exist_ok=True)
base.convert("RGB").save(output, optimize=True)
print(f"Wrote {output}")

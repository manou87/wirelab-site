#!/usr/bin/env python3
"""Generate fork-type DIN supply combs (peignes) aligned to 36px module pitch.

Pitch matches ABB S200/S203 3P and CHINT NXB-63H 3P (LIB w=108 for 3 modules).
Teeth sit on pole centres: nx = (i+0.5)/nPoles → terminals 1 / 3 / 5.
"""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
SCALE = 8
MOD = 36 * SCALE  # 18 mm DIN module in board px, upscaled
HEIGHT = 42 * SCALE

PHASE_3 = [
    (139, 69, 34),   # L1 brown
    (32, 32, 34),    # L2 black
    (120, 128, 136), # L3 grey
]
COPPER = (196, 118, 58)
COPPER_HI = (232, 176, 108)
COPPER_LO = (148, 78, 32)
GREY = (125, 139, 150)
GREY_HI = (176, 186, 194)
GREY_LO = (86, 98, 108)
GREY_EDGE = (58, 68, 76)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def font(size):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                pass
    return ImageFont.load_default()


def rounded_rect(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=max(1, int(r)), fill=fill, outline=outline, width=width)


def metallic_bar(img, box, hi, mid, lo):
    x0, y0, x1, y1 = [int(v) for v in box]
    w = max(1, x1 - x0)
    h = max(1, y1 - y0)
    strip = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = strip.load()
    for y in range(h):
        t = y / max(1, h - 1)
        if t < 0.18:
            c = lerp(hi, mid, t / 0.18)
        elif t < 0.55:
            c = lerp(mid, lo, (t - 0.18) / 0.37)
        else:
            c = lerp(lo, mid, (t - 0.55) / 0.45)
        for x in range(w):
            edge = min(x, w - 1 - x) / max(1, w * 0.12)
            k = min(1.0, 0.55 + 0.45 * edge)
            px[x, y] = (int(c[0] * k + hi[0] * (1 - k) * 0.15),
                        int(c[1] * k + hi[1] * (1 - k) * 0.15),
                        int(c[2] * k + hi[2] * (1 - k) * 0.15), 255)
    img.paste(strip, (x0, y0), strip)


def draw_fork_tooth(img, draw, cx, y_root, y_tip, tooth_w, phase_rgb):
    """Front-view fork (fourche): two prongs, slot for the MCB screw."""
    hw = tooth_w / 2
    slot = max(3 * SCALE / 8, tooth_w * 0.18)
    prong = (tooth_w - slot) / 2
    r = max(2, int(prong * 0.35))

    # root block under the housing
    metallic_bar(
        img,
        (cx - hw, y_root, cx + hw, y_root + (y_tip - y_root) * 0.32),
        COPPER_HI, COPPER, COPPER_LO,
    )
    # phase tick
    tick_h = max(2, int(1.2 * SCALE))
    draw.rectangle(
        [cx - hw + 1, y_root, cx + hw - 1, y_root + tick_h],
        fill=phase_rgb + (255,),
    )

    y_split = y_root + (y_tip - y_root) * 0.38
    # left prong
    metallic_bar(img, (cx - hw, y_split - 2, cx - hw + prong, y_tip), COPPER_HI, COPPER, COPPER_LO)
    # right prong
    metallic_bar(img, (cx + hw - prong, y_split - 2, cx + hw, y_tip), COPPER_HI, COPPER, COPPER_LO)
    # round tips
    for px0 in (cx - hw, cx + hw - prong):
        tip = Image.new("RGBA", (max(1, int(prong)), r * 2 + 2), (0, 0, 0, 0))
        td = ImageDraw.Draw(tip)
        td.ellipse([0, 0, int(prong) - 1, r * 2], fill=COPPER_LO + (255,))
        td.ellipse([1, 0, int(prong) - 2, r * 2 - 3], fill=COPPER_HI + (255,))
        img.alpha_composite(tip, (int(px0), int(y_tip - r)))


def draw_comb(n_modules: int, poles: int, label: str, path: str):
    w = n_modules * MOD
    h = HEIGHT
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    body_top = int(h * 0.04)
    body_bot = int(h * 0.58)
    radius = int(4.2 * SCALE)

    # drop shadow
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    rounded_rect(sd, (2, body_top + 4, w - 2, int(h * 0.96)), radius, (20, 22, 24, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(1.4 * SCALE)))
    img.alpha_composite(shadow)

    # housing
    rounded_rect(draw, (0, body_top, w - 1, body_bot), radius, GREY + (255,), GREY_EDGE + (255,), max(1, SCALE // 2))
    # top bevel
    rounded_rect(draw, (2, body_top + 1, w - 3, body_top + int(h * 0.16)), radius - 2, GREY_HI + (255,))
    # front face
    metallic_bar(img, (3, body_top + int(h * 0.14), w - 3, body_bot - 2), GREY_HI, GREY, GREY_LO)

    # copper bus window (stacked phases for 3P, single for 1P)
    win_y0 = body_top + int(h * 0.20)
    win_y1 = body_bot - int(h * 0.10)
    win_x0 = int(5.5 * SCALE)
    win_x1 = w - int(5.5 * SCALE)
    draw.rounded_rectangle(
        [win_x0, win_y0, win_x1, win_y1],
        radius=int(1.2 * SCALE),
        fill=(42, 46, 50, 255),
        outline=(30, 34, 38, 255),
    )
    n_bars = 3 if poles == 3 else 1
    gap = max(1, int(0.35 * SCALE))
    inner_h = win_y1 - win_y0 - 4
    bar_h = max(3, (inner_h - gap * (n_bars - 1)) // n_bars)
    for i in range(n_bars):
        by = win_y0 + 2 + i * (bar_h + gap)
        metallic_bar(img, (win_x0 + 3, by, win_x1 - 3, by + bar_h), COPPER_HI, COPPER, COPPER_LO)
        if poles == 3:
            # thin phase ID line on each bus
            ph = PHASE_3[i]
            draw.rectangle([win_x0 + 4, by, win_x0 + int(3.2 * SCALE), by + bar_h], fill=ph + (255,))

    # end caps
    cap_w = int(3.4 * SCALE)
    for x0 in (0, w - cap_w - 1):
        rounded_rect(
            draw,
            (x0, body_top, x0 + cap_w, body_bot),
            int(2.2 * SCALE),
            GREY_LO + (255,),
            GREY_EDGE + (255,),
            1,
        )

    # label
    f = font(max(10, int(3.4 * SCALE)))
    tw = draw.textbbox((0, 0), label, font=f)
    tx = w - int(6 * SCALE) - (tw[2] - tw[0])
    ty = body_top + int(1.1 * SCALE)
    draw.text((tx, ty), label, font=f, fill=(245, 247, 248, 230))
    brand = font(max(9, int(2.6 * SCALE)))
    draw.text((int(6.5 * SCALE), ty + 1), "SwissDz", font=brand, fill=(236, 239, 241, 210))

    # teeth — one per 18 mm module, centred (matches ABB/CHINT 1-3-5)
    y_root = body_bot - int(1.2 * SCALE)
    y_tip = h - int(1.2 * SCALE)
    tooth_w = int(8.2 * SCALE)
    for i in range(n_modules):
        cx = int((i + 0.5) * MOD)
        phase = PHASE_3[i % 3] if poles == 3 else PHASE_3[0]
        draw_fork_tooth(img, draw, cx, y_root, y_tip, tooth_w, phase)

    # housing lip over tooth roots
    draw.rectangle(
        [int(2 * SCALE), body_bot - int(1.6 * SCALE), w - int(2 * SCALE), body_bot + int(0.6 * SCALE)],
        fill=GREY_LO + (255,),
    )

    img.save(path, "PNG", optimize=True)
    print("wrote", path, img.size)


def main():
    specs = [
        (3, 3, "3P ×1  63A", "peigne-fork-3p-x1.png"),
        (6, 3, "3P ×2  63A", "peigne-fork-3p-x2.png"),
        (9, 3, "3P ×3  63A", "peigne-fork-3p-x3.png"),
        (12, 3, "3P ×4  63A", "peigne-fork-3p-x4.png"),
        (6, 1, "1P ×6  63A", "peigne-fork-1p-x6.png"),
        (12, 1, "1P ×12  63A", "peigne-fork-1p-x12.png"),
    ]
    for n_mod, poles, label, name in specs:
        draw_comb(n_mod, poles, label, os.path.join(OUT, name))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Vues de face orthogonales (comme plc-logo8-front), pas de 3D."""
from pathlib import Path

OUT = Path(__file__).resolve().parent
BODY = "#6a7380"
BODY_DK = "#5a6370"
BODY_LT = "#7a8490"
STRIP = "#4f5864"
SCREW = "#c8ccd0"
SLOT = "#6b7280"
LABEL = "#e8eaed"
MUTED = "#c5cad0"
TEAL = "#00a19a"
TEAL_DK = "#007a76"
LED_G = "#22c55e"
SCREEN = "#1a1f24"


def wrap(w, h, inner):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n'
        f"  <!-- Face avant orthogonale SwissDz / kit école -->\n{inner}\n</svg>\n"
    )


def body(w, h):
    return (
        f'<rect width="{w}" height="{h}" rx="6" fill="{BODY_DK}"/>'
        f'<rect x="2" y="2" width="{w - 4}" height="{h - 4}" rx="5" fill="{BODY}"/>'
    )


def strip(x, y, w, h):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{STRIP}"/>'


def screw(cx, cy, r=4.4):
    return (
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{SCREW}" stroke="#9aa0a6" stroke-width="0.6"/>'
        f'<rect x="{cx - r * 0.55:.1f}" y="{cy - 0.7:.1f}" width="{r * 1.1:.1f}" height="1.4" rx="0.4" fill="{SLOT}"/>'
    )


def lbl(x, y, text, size=5.4, fill=MUTED, weight="700"):
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" font-size="{size}" font-weight="{weight}" '
        f'font-family="system-ui,sans-serif" fill="{fill}">{text}</text>'
    )


def row_screws(ids, y, w, pad, r=4.4):
    n = len(ids)
    xs = [w / 2] if n == 1 else [pad + i * (w - 2 * pad) / (n - 1) for i in range(n)]
    parts = []
    terms = []
    for i, tid in enumerate(ids):
        parts.append(screw(xs[i], y, r))
        terms.append((tid, xs[i] / w, y))
    return "".join(parts), terms, xs


def power():
    w, h = 74, 187
    top_ids = ["L", "N", "L+", "M"]
    screws, terms, xs = row_screws(top_ids, 16, w, 11, 4.2)
    labels = "".join(lbl(xs[i], 8.2, top_ids[i], 5.2) for i in range(4))
    fins = "".join(
        f'<rect x="10" y="{42 + i * 5}" width="54" height="2.4" rx="0.6" fill="{BODY_DK}"/>'
        for i in range(8)
    )
    inner = (
        body(w, h)
        + strip(4, 4, w - 8, 24)
        + screws + labels
        + fins
        + f'<rect x="10" y="92" width="54" height="18" rx="2" fill="{TEAL}"/>'
        + lbl(37, 104.5, "SIEMENS", 7.2, "#fff", "800")
        + lbl(37, 128, "LOGO!", 11, LABEL, "800")
        + lbl(37, 142, "Power  24 V", 7, MUTED, "650")
        + f'<circle cx="22" cy="158" r="3.2" fill="#111"/>'
        + f'<circle cx="22" cy="158" r="1.8" fill="{LED_G}"/>'
        + lbl(42, 161, "O.K.", 6, MUTED)
    )
    nxny = [{"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": "top"} for t in terms]
    return w, h, wrap(w, h, inner), nxny


def dm8():
    w, h = 102, 187
    top_ids = ["L+", "M", "I9", "I10", "I11", "I12"]
    bot_ids = ["Q5.1", "Q5.2", "Q6.1", "Q6.2", "Q7.1", "Q7.2", "Q8.1", "Q8.2"]
    ts, terms_t, xs_t = row_screws(top_ids, 16, w, 9, 3.8)
    bs, terms_b, xs_b = row_screws(bot_ids, 171, w, 8, 3.5)
    top_l = "".join(lbl(xs_t[i], 8, top_ids[i], 4.6) for i in range(6))
    bot_l = "".join(lbl(xs_b[i], 183.5, bot_ids[i].replace("Q", ""), 4.2) for i in range(8))
    inner = (
        body(w, h)
        + strip(4, 4, w - 8, 24)
        + strip(4, 159, w - 8, 24)
        + ts + bs + top_l + bot_l
        + f'<rect x="12" y="42" width="28" height="14" rx="2" fill="{BODY_DK}"/>'
        + lbl(51, 52, "INPUT 4× AC/DC", 5.4, MUTED, "650")
        + f'<rect x="14" y="66" width="74" height="22" rx="3" fill="{BODY_DK}"/>'
        + lbl(51, 80, "DM8 24R", 9, LABEL, "800")
        + lbl(51, 104, "LOGO!  expansion", 6.2, MUTED, "650")
        + f'<rect x="18" y="116" width="66" height="12" rx="2" fill="{STRIP}"/>'
        + lbl(51, 125, "RUN / STOP", 5.6, MUTED)
        + lbl(51, 146, "Q5  Q6  Q7  Q8", 6, MUTED, "650")
    )
    nxny = (
        [{"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": "top"} for t in terms_t]
        + [{"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": "bottom"} for t in terms_b]
    )
    return w, h, wrap(w, h, inner), nxny


def am2():
    w, h = 90, 187
    top_ids = ["L+", "M"]
    bot_ids = ["AI1", "AGND", "AI2"]
    ts, terms_t, xs_t = row_screws(top_ids, 16, w, 18, 4.2)
    bs, terms_b, xs_b = row_screws(bot_ids, 171, w, 14, 4.0)
    top_l = "".join(lbl(xs_t[i], 8, top_ids[i], 5.4) for i in range(2))
    bot_l = "".join(lbl(xs_b[i], 183.5, bot_ids[i], 5) for i in range(3))
    inner = (
        body(w, h)
        + strip(4, 4, w - 8, 24)
        + strip(4, 159, w - 8, 24)
        + ts + bs + top_l + bot_l
        + f'<rect x="12" y="42" width="24" height="14" rx="2" fill="{BODY_DK}"/>'
        + lbl(45, 52, "DC 12/24 V", 5.6, MUTED, "650")
        + f'<rect x="12" y="70" width="66" height="28" rx="3" fill="{BODY_DK}"/>'
        + lbl(45, 87, "AM2", 12, LABEL, "800")
        + lbl(45, 116, "LOGO!  analog", 6.2, MUTED, "650")
        + lbl(45, 134, "2× 0–10 V / 0–20 mA", 5.2, MUTED, "600")
        + f'<rect x="16" y="142" width="58" height="10" rx="2" fill="{STRIP}"/>'
        + lbl(45, 149.5, "RUN / STOP", 5.2, MUTED)
    )
    nxny = (
        [{"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": "top"} for t in terms_t]
        + [{"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": "bottom"} for t in terms_b]
    )
    return w, h, wrap(w, h, inner), nxny


def tde():
    w, h = 200, 128
    keys = "".join(
        f'<rect x="{18 + i * 28}" y="90" width="24" height="16" rx="2" fill="#eef1f4"/>'
        + lbl(30 + i * 28, 101, f"F{i + 1}", 6.2, "#334155", "700")
        for i in range(4)
    )
    inner = (
        f'<rect width="{w}" height="{h}" rx="8" fill="#8b939c"/>'
        f'<rect x="3" y="3" width="{w - 6}" height="{h - 6}" rx="6" fill="#c5ccd3"/>'
        f'<rect x="10" y="10" width="118" height="72" rx="3" fill="#111"/>'
        f'<rect x="14" y="14" width="36" height="10" rx="1.5" fill="{TEAL}"/>'
        + lbl(32, 21.8, "SIEMENS", 6, "#fff", "800")
        + lbl(96, 21.5, "LOGO! TDE", 7, LABEL, "700")
        + f'<rect x="16" y="30" width="106" height="46" rx="2" fill="#9aa8a4"/>'
        + f'<rect x="136" y="18" width="52" height="62" rx="3" fill="#d8dee4"/>'
        + f'<polygon points="162,28 170,40 154,40" fill="#2d3338"/>'
        + f'<polygon points="148,50 160,44 160,56" fill="#2d3338"/>'
        + f'<polygon points="176,50 164,44 164,56" fill="#2d3338"/>'
        + f'<polygon points="162,72 170,60 154,60" fill="#2d3338"/>'
        + keys
        + lbl(150, 100, "ESC", 6, "#64748b", "700")
        + lbl(178, 100, "ENTER", 6, TEAL_DK, "800")
        + strip(50, 114, 100, 10)
        + screw(80, 119, 3.2)
        + screw(120, 119, 3.2)
        + lbl(80, 112, "L+", 5, "#475569")
        + lbl(120, 112, "M", 5, "#475569")
    )
    nxny = [
        {"id": "L+", "nx": 0.40, "ny": 0.93, "direction": "bottom"},
        {"id": "M", "nx": 0.60, "ny": 0.93, "direction": "bottom"},
    ]
    return w, h, wrap(w, h, inner), nxny


def s7():
    w, h = 158, 187
    top_a = ["L+", "M", "1M"]
    top_b = ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"]
    bot_a = ["1L+", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]
    bot_b = ["AI1", "AI2", "AGND"]
    s1, t1, x1 = row_screws(top_a, 12, w, 18, 3.6)
    s2, t2, x2 = row_screws(top_b, 28, w, 10, 3.4)
    s3, t3, x3 = row_screws(bot_a, 160, w, 12, 3.4)
    s4, t4, x4 = row_screws(bot_b, 176, w, 22, 3.4)
    labs = (
        "".join(lbl(x1[i], 6.2, top_a[i], 4.6) for i in range(3))
        + "".join(lbl(x2[i], 21.2, top_b[i], 4.4) for i in range(8))
        + "".join(lbl(x3[i], 168.8, bot_a[i], 4.4) for i in range(7))
        + "".join(lbl(x4[i], 184.5, bot_b[i], 4.4) for i in range(3))
    )
    leds = "".join(
        f'<circle cx="18" cy="{48 + i * 12}" r="3" fill="#111"/>'
        f'<circle cx="18" cy="{48 + i * 12}" r="1.6" fill="{["#22c55e","#ef4444","#f59e0b"][i]}"/>'
        for i in range(3)
    )
    led_txt = lbl(40, 51, "RUN", 5.2) + lbl(42, 63, "ERR", 5.2) + lbl(46, 75, "MAINT", 5.2)
    inner = (
        body(w, h)
        + strip(4, 3, w - 8, 32)
        + strip(4, 152, w - 8, 32)
        + s1 + s2 + s3 + s4 + labs
        + f'<rect x="10" y="42" width="28" height="10" rx="1.5" fill="{TEAL}"/>'
        + lbl(24, 49.5, "SIEMENS", 5.2, "#fff", "800")
        + lbl(100, 58, "SIMATIC S7-1200", 8.5, LABEL, "800")
        + leds + led_txt
        + f'<rect x="56" y="88" width="90" height="48" rx="3" fill="{BODY_DK}"/>'
        + lbl(101, 108, "CPU 1212C", 8, LABEL, "800")
        + lbl(101, 122, "DC / DC / DC", 6, MUTED, "650")
        + lbl(101, 134, "DI 8  /  DQ 6  /  AI 2", 5.4, MUTED, "600")
    )
    nxny = []
    for group, direction in ((t1, "top"), (t2, "top"), (t3, "bottom"), (t4, "bottom")):
        for t in group:
            nxny.append({"id": t[0], "nx": round(t[1], 4), "ny": round(t[2] / h, 4), "direction": direction})
    return w, h, wrap(w, h, inner), nxny


def main():
    js = []
    for key, fn in [
        ("power-24v-front", power),
        ("dm8-24r-front", dm8),
        ("am2-front", am2),
        ("tde-front", tde),
        ("s7-1212c-front", s7),
    ]:
        w, h, svg, terms = fn()
        path = OUT / f"{key}.svg"
        path.write_text(svg, encoding="utf-8")
        arr = ",".join(
            '{id:"%s",nx:%s,ny:%s,direction:"%s"}' % (t["id"], t["nx"], t["ny"], t["direction"])
            for t in terms
        )
        js.append(f"{key}: w:{w} h:{h}\n    terminals:[{arr}]")
        print(f"wrote {path.name} {w}x{h} {len(terms)} terms")
    print("\n".join(js))


if __name__ == "__main__":
    main()

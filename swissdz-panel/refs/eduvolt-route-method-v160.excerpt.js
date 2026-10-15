/* EduVolt routing method v160 — extrait sauvegardé (ne pas charger tel quel). */
/* Branche complète : cursor/eduvolt-route-fix-18da */
/* Rev panneau : native-shell-8777-v160-eduvolt-route-fix */


/* ===== css-stubs ===== */
/* v160 : flèches ~25 % taille, ~50 % plus claires (alpha ÷ 2). */
    svg.eduvolt-stubs { position:absolute; left:0; top:0; overflow:visible; pointer-events:none; z-index:54; }
    svg.eduvolt-stubs .ev-stub {
      fill:none; stroke:rgba(248,113,113,.36); stroke-width:1.1; stroke-linecap:round;
    }
    svg.eduvolt-stubs .ev-dot {
      fill:rgba(248,113,113,.28); stroke:rgba(185,28,28,.38); stroke-width:0.5;
    }
    svg.eduvolt-stubs .ev-arrow { fill:rgba(248,113,113,.42); }

    

/* ===== toggle-helpers ===== */
/* v159 : EduVolt optionnel — OFF par défaut = comportement historique inchangé. */
    const EDUVOLT_ROUTE_KEY = "panelwire-eduvolt-route";
    let eduVoltRouteOn = false;
    /* muted=true → silence. Défaut : sons ON (pas de mute). */
    let soundsMuted = false;
    let boardGridOn = true;
    function isDarkTheme() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }
    function syncThemeButton() {
      const btn = document.getElementById("btnTheme");
      if (!btn) return;
      const dark = isDarkTheme();
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      const key = dark ? "themeToLight" : "themeToDark";
      btn.setAttribute("data-i18n-title", key);
      btn.title = t(key);
      btn.setAttribute("aria-label", t("themeAria"));
    }
    function syncMuteButton() {
      const btn = document.getElementById("btnMute");
      if (!btn) return;
      btn.classList.toggle("is-muted", !!soundsMuted);
      btn.setAttribute("aria-pressed", soundsMuted ? "true" : "false");
      const key = soundsMuted ? "btnSoundOffTitle" : "btnSoundOnTitle";
      btn.setAttribute("data-i18n-title", key);
      btn.title = t(key);
      btn.setAttribute("aria-label", t("btnSoundAria"));
    }
    function syncGridButton() {
      const btn = document.getElementById("btnGrid");
      if (!btn) return;
      const on = !!boardGridOn;
      btn.classList.toggle("active", on);
      btn.classList.toggle("is-off", !on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      const key = on ? "btnGridOnTitle" : "btnGridOffTitle";
      btn.setAttribute("data-i18n-title", key);
      btn.title = t(key);
      btn.setAttribute("aria-label", t("btnGridAria"));
    }
    function setBoardGridOn(on) {
      boardGridOn = !!on;
      document.documentElement.classList.toggle("pw-grid-off", !boardGridOn);
      try { localStorage.setItem(BOARD_GRID_KEY, boardGridOn ? "1" : "0"); } catch (_) {}
      syncGridButton();
    }
    function isEduVoltRoute() { return !!eduVoltRouteOn; }
    function boardCoordsStep() { return isEduVoltRoute() ? 50 : BOARD_COORDS_STEP; }
    /** Longueur stub sortie : EduVolt = 1 carré de grille ; classique = STUB historique. */
    function wireStubLen() {
      if (!isEduVoltRoute()) return (typeof STUB !== "undefined" ? STUB : 70);
      return boardCoordsStep();
    }
    function syncEduVoltButton() {
      const btn = document.getElementById("btnEduVolt");
      if (!btn) return;
      const on = isEduVoltRoute();
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.title = on
        ? "EduVolt ON — grille 50 + stubs sortie (cliquer = classique)"
        : "EduVolt OFF — câblage classique (cliquer = grille 50 + stubs)";
      try { document.body.classList.toggle("eduvolt-route", on); } catch (_) {}
    }
    function setEduVoltRoute(on) {
      eduVoltRouteOn = !!on;
      try { localStorage.setItem(EDUVOLT_ROUTE_KEY, eduVoltRouteOn ? "1" : "0"); } catch (_) {}
      syncEduVoltButton();
      try { boardCoordsExtentKey = ""; } catch (_) {}
      try { syncBoardCoords(); } catch (_) {}
      try { render(); } catch (_) {}
    }
    

/* ===== router ===== */
/** EduVolt : projette un point sur le côté de grille le plus proche. */
    function snapPointToGridEdge(x, y) {
      const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
      if (!(step > 0)) return { x: x, y: y };
      const gx = Math.round(x / step) * step;
      const gy = Math.round(y / step) * step;
      const dx = Math.abs(x - gx);
      const dy = Math.abs(y - gy);
      if (dx <= dy) return { x: gx, y: y };
      return { x: x, y: gy };
    }
    /** EduVolt : coin de coude = intersection de côtés de grille (n×step). */
    function snapPointToGridCorner(x, y) {
      const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
      if (!(step > 0)) return { x: x, y: y };
      return { x: Math.round(x / step) * step, y: Math.round(y / step) * step };
    }
    function snapRouteToGridEdges(pts) {
      if (!pts || pts.length < 2) return pts;
      const out = pts.map((p, i) => {
        if (i === 0 || i === pts.length - 1) return { x: p.x, y: p.y };
        return snapPointToGridCorner(p.x, p.y);
      });
      return forceOrtho(dedupePts(out));
    }
    /**
     * v160 EduVolt — stub exact 1 carré dans le sens de la flèche, puis 1er mouvement
     * perpendiculaire (jamais retour inverse sur le même fil). Coudes = coins de grille.
     */
    function eduVoltStubEnd(pad, step) {
      const d = padUnit(pad);
      return { x: pad.x + d[0] * step, y: pad.y + d[1] * step };
    }
    /** Après le stub : rejoindre le côté de grille (coin) sans revenir vers la borne. */
    function eduVoltJoinGrid(stub, pad, step) {
      const d = padUnit(pad);
      const g = snapPointToGridCorner(stub.x, stub.y);
      /* Si déjà sur un coin et toujours « devant » la borne : OK. */
      if (Math.hypot(g.x - stub.x, g.y - stub.y) < 0.5
          && (g.x - pad.x) * d[0] + (g.y - pad.y) * d[1] >= step * 0.45) {
        return g;
      }
      /* Déplacement latéral seul (coude 90°) vers le côté de grille — jamais −d. */
      if (Math.abs(d[0]) > 0.5) {
        const gy = Math.round(stub.y / step) * step;
        let gx = Math.round(stub.x / step) * step;
        if ((gx - pad.x) * d[0] < step * 0.45) gx = pad.x + d[0] * step;
        gx = Math.round(gx / step) * step;
        if ((gx - pad.x) * d[0] < step * 0.45) {
          gx = (d[0] > 0 ? Math.ceil : Math.floor)((pad.x + d[0] * step) / step) * step;
        }
        return { x: gx, y: gy };
      }
      const gx = Math.round(stub.x / step) * step;
      let gy = Math.round(stub.y / step) * step;
      if ((gy - pad.y) * d[1] < step * 0.45) gy = pad.y + d[1] * step;
      gy = Math.round(gy / step) * step;
      if ((gy - pad.y) * d[1] < step * 0.45) {
        gy = (d[1] > 0 ? Math.ceil : Math.floor)((pad.y + d[1] * step) / step) * step;
      }
      return { x: gx, y: gy };
    }
    function eduVoltSegDot(a, b, c) {
      const ix = b.x - a.x, iy = b.y - a.y;
      const ox = c.x - b.x, oy = c.y - b.y;
      return ix * ox + iy * oy;
    }
    /** True si un segment revient en arrière (U-turn 180°) ou si sortie/entrée viole la flèche. */
    function eduVoltHasIllegalReverse(pts, A, B, da, db) {
      if (!pts || pts.length < 3) return false;
      /* 1er mouvement après A (= pts[0])→pts[1] doit suivre da ; pts[1]→pts[2] ne doit pas être −da. */
      const s1x = pts[1].x - pts[0].x, s1y = pts[1].y - pts[0].y;
      if (s1x * da[0] + s1y * da[1] < -1) return true;
      if (pts.length >= 3) {
        const s2x = pts[2].x - pts[1].x, s2y = pts[2].y - pts[1].y;
        if (s2x * da[0] + s2y * da[1] < -1 && Math.abs(s2x * da[0] + s2y * da[1]) > Math.hypot(s2x, s2y) * 0.85) {
          return true; /* retour inverse sur le stub */
        }
      }
      const n = pts.length;
      const t1x = pts[n - 1].x - pts[n - 2].x, t1y = pts[n - 1].y - pts[n - 2].y;
      /* Dernier segment = vers la borne = −db ; l’avant-dernier ne doit pas déjà aller vers −db depuis l’intérieur. */
      if (n >= 3) {
        const t0x = pts[n - 2].x - pts[n - 3].x, t0y = pts[n - 2].y - pts[n - 3].y;
        if (t0x * (-db[0]) + t0y * (-db[1]) > 1
            && t1x * (-db[0]) + t1y * (-db[1]) > 1
            && eduVoltSegDot(pts[n - 3], pts[n - 2], pts[n - 1]) < -1) {
          return true;
        }
      }
      for (let i = 1; i < n - 1; i++) {
        if (eduVoltSegDot(pts[i - 1], pts[i], pts[i + 1]) < -1) return true;
      }
      return false;
    }
    function eduVoltGridManhattan(P, Q, step, laneK) {
      const k = laneK || 0;
      const cands = [];
      const px = P.x, py = P.y, qx = Q.x, qy = Q.y;
      cands.push([{ x: qx, y: py }, { x: qx, y: qy }]);
      cands.push([{ x: px, y: qy }, { x: qx, y: qy }]);
      if (k > 0) {
        const o = k * step;
        cands.push([{ x: px, y: py + o }, { x: qx, y: py + o }, { x: qx, y: qy }]);
        cands.push([{ x: px, y: py - o }, { x: qx, y: py - o }, { x: qx, y: qy }]);
        cands.push([{ x: px + o, y: py }, { x: px + o, y: qy }, { x: qx, y: qy }]);
        cands.push([{ x: px - o, y: py }, { x: px - o, y: qy }, { x: qx, y: qy }]);
      }
      return cands.map((mid) => mid.map((p) => snapPointToGridCorner(p.x, p.y)));
    }
    function eduVoltRebuildRoute(A, B, hintPts) {
      const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
      const da = padUnit(A), db = padUnit(B);
      const A2 = eduVoltStubEnd(A, step);
      const B2 = eduVoltStubEnd(B, step);
      const Ag = eduVoltJoinGrid(A2, A, step);
      const Bg = eduVoltJoinGrid(B2, B, step);
      const cands = [];
      for (let k = 0; k <= 8; k++) {
        eduVoltGridManhattan(Ag, Bg, step, k).forEach((mid) => {
          cands.push(forceOrtho(dedupePts([
            { x: A.x, y: A.y }, A2, Ag, ...mid, Bg, B2, { x: B.x, y: B.y }
          ])));
        });
      }
      /* Hints = coudes intérieurs seulement (pas les stubs A2/B2 — sinon jog multi-points). */
      if (hintPts && hintPts.length) {
        const hints = hintPts
          .map((p) => snapPointToGridCorner(p.x, p.y))
          .filter((p) => {
            const alongA = rayAlong(A, da, p);
            const alongB = rayAlong(B, db, p);
            if (alongA < step * 1.15 || alongB < step * 1.15) return false;
            /* Écarter les points quasi-alignés sur le stub (évite double raccord). */
            if (rayLat(A, da, p) < 8 && alongA < step * 1.6) return false;
            if (rayLat(B, db, p) < 8 && alongB < step * 1.6) return false;
            return true;
          });
        if (hints.length) {
          cands.unshift(forceOrtho(dedupePts([
            { x: A.x, y: A.y }, A2, Ag, ...hints, Bg, B2, { x: B.x, y: B.y }
          ])));
        }
      }
      for (let i = 0; i < cands.length; i++) {
        if (!eduVoltHasIllegalReverse(cands[i], A, B, da, db)) return cands[i];
      }
      /* Fallback forcé : stub → coude latéral 1 case → Manhattan. */
      const latA = { x: A2.x + (-da[1]) * step, y: A2.y + da[0] * step };
      const latB = { x: B2.x + (-db[1]) * step, y: B2.y + db[0] * step };
      const La = snapPointToGridCorner(latA.x, latA.y);
      const Lb = snapPointToGridCorner(latB.x, latB.y);
      return forceOrtho(dedupePts([
        { x: A.x, y: A.y }, A2, La, { x: Lb.x, y: La.y }, Lb, B2, { x: B.x, y: B.y }
      ]));
    }
    /** Guides rouge clair : 25 % longueur stub, flèche légère (repère direction seulement). */
    function appendEduVoltExitGuides(world, NS) {
      if (!world || !NS) return;
      if (typeof isEduVoltRoute !== "function" || !isEduVoltRoute()) return;
      if (!state || state.mode !== "wire") return;
      const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
      const stubLen = step * 0.25; /* v160 : flèche à 25 % */
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "eduvolt-stubs");
      svg.setAttribute("aria-hidden", "true");
      try { sizeBoardSvg(svg); } catch (_) {}
      (state.items || []).forEach((item) => {
        const def = LIB[item.type];
        if (!def || def.flukeMeter) return;
        (termsOf(item) || []).forEach((t) => {
          try {
            if (typeof kmFrHiddenTerm === "function" && kmFrHiddenTerm(item, t.id)) return;
            const p = termAbs(item, t);
            const d = DIR[t.direction] || [0, -1];
            const x2 = p.x + d[0] * stubLen;
            const y2 = p.y + d[1] * stubLen;
            const line = document.createElementNS(NS, "line");
            line.setAttribute("class", "ev-stub");
            line.setAttribute("x1", String(p.x));
            line.setAttribute("y1", String(p.y));
            line.setAttribute("x2", String(x2));
            line.setAttribute("y2", String(y2));
            svg.appendChild(line);
            const dot = document.createElementNS(NS, "circle");
            dot.setAttribute("class", "ev-dot");
            dot.setAttribute("cx", String(p.x));
            dot.setAttribute("cy", String(p.y));
            dot.setAttribute("r", "1.6");
            svg.appendChild(dot);
            const head = Math.max(2.2, stubLen * 0.35);
            const ax = x2 - d[0] * head;
            const ay = y2 - d[1] * head;
            const px = -d[1] * (head * 0.45), py = d[0] * (head * 0.45);
            const tri = document.createElementNS(NS, "polygon");
            tri.setAttribute("class", "ev-arrow");
            tri.setAttribute("points",
              x2 + "," + y2 + " " + (ax + px) + "," + (ay + py) + " " + (ax - px) + "," + (ay - py));
            svg.appendChild(tri);
          } catch (_) {}
        });
      });
      world.appendChild(svg);
    }

    function withCardinalStubs(pts, A, B) {
      /* v160 : mode EduVolt = routeur dédié (flèche, anti-U-turn, coins grille). */
      if (typeof isEduVoltRoute === "function" && isEduVoltRoute()
          && typeof eduVoltRebuildRoute === "function") {
        const hint = (pts || []).slice(1, -1).map((p) => ({ x: p.x, y: p.y }));
        return eduVoltRebuildRoute(A, B, hint);
      }
      const da = padUnit(A), db = padUnit(B);
      let raw = (pts || []).slice(1, -1).map((p) => ({ x: p.x, y: p.y }));
      raw = raw.filter((p) => !onRevRay(A, da, p) && !onRevRay(B, db, p));
      /* Min 28 : assez pour bandelette + congé. Autoriser < STUB pour un couloir parallèle. */
      const STUB_MIN = 28;
      const stubBase = (typeof wireStubLen === "function") ? wireStubLen() : STUB;
      let aLen = stubBase;
      if (raw.length && onOutRay(A, da, raw[0])) {
        aLen = Math.max(STUB_MIN, rayAlong(A, da, raw[0]));
        raw.shift();
      }
      let bLen = stubBase;
      if (raw.length && onOutRay(B, db, raw[raw.length - 1])) {
        bLen = Math.max(STUB_MIN, rayAlong(B, db, raw[raw.length - 1]));
        raw.pop();
      }
      const A2 = stubOf(A, aLen);
      const B2 = stubOf(B, bLen);
      return forceOrtho(dedupePts([{ x: A.x, y: A.y }, A2, ...raw, B2, { x: B.x, y: B.y }]));
    }

    

/* ===== termDrawDelta ===== */
function termDrawDelta(w, end) {
      const ref = w[end];
      if (!ref) return { dx: 0, dy: 0, side: "top" };
      /* v160 EduVolt : raccord DIRECT sur la borne (pas de double point / jog pastille). */
      if (typeof isEduVoltRoute === "function" && isEduVoltRoute()) {
        let side = "top";
        try {
          const ep = endpoint(ref);
          if (ep && ep.direction) side = ep.direction;
        } catch (_) {}
        return { dx: 0, dy: 0, lx: 0, ly: 0, side };
      }
      const fan = termSiblingFan(w, end);
      let side = fan.side;
      const r = termPadRadius(ref);
      const u = side === "left" ? [-1, 0]
        : side === "right" ? [1, 0]
        : side === "bottom" ? [0, 1]
        : [0, -1];
      const lat = (side === "left" || side === "right") ? [0, 1] : [1, 0];
      const lateral = fan.lateral;
      return {
        dx: u[0] * r + lat[0] * lateral,
        dy: u[1] * r + lat[1] * lateral,
        lx: lat[0] * lateral,
        ly: lat[1] * lateral,
        side
      };
    }
    

/* ===== wirePts ===== */
function wirePts(w) {
      /* v42: pendant drag module, géométrie 100 % figée (aucun fil ne suit / ne se contourne). */
      if (state.drag && state.drag.frozenWirePts && w && w.id != null
          && state.drag.frozenWirePts[w.id]) {
        return state.drag.frozenWirePts[w.id].map((p) => ({ x: p.x, y: p.y }));
      }
      const A = endpoint(w.a);
      const B = endpoint(w.b);
      /* v160 EduVolt : toujours reconstruire (stubs frais) — waypoints = hints intérieurs. */
      if (typeof isEduVoltRoute === "function" && isEduVoltRoute()
          && typeof eduVoltRebuildRoute === "function") {
        const hints = (w.waypoints && w.waypoints.length)
          ? w.waypoints.map((p) => ({ x: p.x, y: p.y }))
          : null;
        return eduVoltRebuildRoute(A, B, hints);
      }
      if (w.waypoints && w.waypoints.length) {
        const mids = w.waypoints.map((p) => ({ x: p.x, y: p.y }));
        /* v85: pointes de virage via withCardinalStubs (réf. 2026-10-01).
           v42: pas de finalizeFaceRoute / re-route sous un module posé sur le fil. */
        return withCardinalStubs([{ x: A.x, y: A.y }, ...mids, { x: B.x, y: B.y }], A, B);
      }
      return autoRoute(A, B);
    }
    /* Affichage seul (guidage inchangé) : embouts + ancrage selon direction d’approche. */
    

/* ===== bakeWaypoints ===== */
function bakeWaypoints(w, pts) {
      const cleaned = simplifyOrtho(pts);
      let mids = cleaned.slice(1, -1).map((p) => ({ x: p.x, y: p.y }));
      /* v160 EduVolt : ne pas figer les stubs (A2/B2) — seulement les coudes grille intérieurs. */
      if (typeof isEduVoltRoute === "function" && isEduVoltRoute() && w && w.a && w.b) {
        try {
          const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
          const A = endpoint(w.a), B = endpoint(w.b);
          const da = padUnit(A), db = padUnit(B);
          mids = mids.filter((p) => {
            const alongA = rayAlong(A, da, p);
            const alongB = rayAlong(B, db, p);
            if (alongA < step * 1.15 || alongB < step * 1.15) return false;
            if (rayLat(A, da, p) < 8 && alongA < step * 1.6) return false;
            if (rayLat(B, db, p) < 8 && alongB < step * 1.6) return false;
            return true;
          }).map((p) => snapPointToGridCorner(p.x, p.y));
        } catch (_) {}
      }
      w.waypoints = mids;
    }
    /** Snapshot positions de bornes (resize / follow fils). */
    

/* ===== autoRoute ===== */
function autoRoute(a, b) {
      /* v160 : EduVolt — ne passe plus par les candidats Manhattan classiques (U-turns). */
      if (typeof isEduVoltRoute === "function" && isEduVoltRoute()
          && typeof eduVoltRebuildRoute === "function") {
        const routed = eduVoltRebuildRoute(a, b, null);
        if (!pathHitsOtherWires(routed)) return routed;
        /* Essais couloirs grille si collision. */
        const step = (typeof boardCoordsStep === "function") ? boardCoordsStep() : 50;
        for (let k = 1; k <= 8; k++) {
          const da = padUnit(a), db = padUnit(b);
          const A2 = eduVoltStubEnd(a, step);
          const B2 = eduVoltStubEnd(b, step);
          const Ag = eduVoltJoinGrid(A2, a, step);
          const Bg = eduVoltJoinGrid(B2, b, step);
          const mids = eduVoltGridManhattan(Ag, Bg, step, k);
          for (let m = 0; m < mids.length; m++) {
            const cand = forceOrtho(dedupePts([
              { x: a.x, y: a.y }, A2, Ag, ...mids[m], Bg, B2, { x: b.x, y: b.y }
            ]));
            if (!eduVoltHasIllegalReverse(cand, a, b, da, db) && !pathHitsOtherWires(cand)) return cand;
          }
        }
        return routed;
      }
      const da = padUnit(a);
      const db = padUnit(b);
      const cands = [];
      const stub0 = (typeof wireStubLen === "function") ? wireStubLen() : STUB;
      if (db && da[0] === db[0] && da[1] === db[1]) {
        const span = Math.abs(da[0] ? (b.y - a.y) : (b.x - a.x));
        const along = da[0] * (b.x - a.x) + da[1] * (b.y - a.y);
        if (span > 16 && span < 480 && Math.abs(along) < 40) {
          for (let k = 0; k <= WIRE_LANE_MAX; k++) {
            cands.push(sameEdgeURoute(a, b, stub0 + k * WIRE_LANE));
          }
        }
      }
      /* k=0 = L isolé (inchangé). Ensuite : profondeur d’entrée/sortie en couloirs. */
      cands.push(manhattanRoute(a, b, stub0, stub0));
      for (let k = 1; k <= WIRE_LANE_MAX; k++) {
        const extra = k * WIRE_LANE;
        /* Stub dest plus court (min 28) : horizontal plus près de la cible = couloir au-dessus. */
        const bShort = Math.max(28, stub0 - extra);
        cands.push(manhattanRoute(a, b, stub0 + extra, stub0));
        cands.push(manhattanRoute(a, b, stub0, bShort));
        cands.push(manhattanRoute(a, b, stub0 + extra, bShort));
        cands.push(manhattanRoute(a, b, stub0 + extra, stub0 + extra));
      }
      for (let i = 0; i < cands.length; i++) {
        const routed = withCardinalStubs(cands[i], a, b);
        if (!pathHitsOtherWires(routed)) return routed;
      }
      return withCardinalStubs(cands[0] || manhattanRoute(a, b, stub0, stub0), a, b);
    }
    

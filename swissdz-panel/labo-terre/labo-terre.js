/**
 * Labo terre V1 — piquets (cartoon chantier + mesure Fluke).
 * API: window.WireLabLaboTerre.open() / .close() / .reset()
 */
(function () {
  "use strict";

  var STEPS = [
    { id: "stock", title: "Prendre le matériel", hint: "Va au stock : piquet + perforateur + conducteur" },
    { id: "drill", title: "Percer le sol", hint: "Amène le technicien sur la zone jardin et perce" },
    { id: "plant", title: "Planter le piquet", hint: "Enfonce le piquet de terre dans le trou" },
    { id: "wire", title: "Conducteur de terre", hint: "Tire le conducteur jusqu’à la barrette" },
    { id: "barrette", title: "Barrette de terre", hint: "Fixe puis ouvre la barrette (mesure)" },
    { id: "pe", title: "Raccorder le PE", hint: "Lie le PE du tableau à la barrette" },
    { id: "measure", title: "Mesurer", hint: "Choisis une méthode et place S / H si besoin" }
  ];

  var METHODS = [
    { id: "p3_62", name: "3 pôles — 62 %", need: ["piquet_h", "piquet_s"], tip: "Place S à ~62 % de E→H" },
    { id: "triangle", name: "Triangle (2 piquets)", need: ["piquet_h", "piquet_s"], tip: "E, S, H en triangle" },
    { id: "p4", name: "4 pôles", need: ["piquet_h", "piquet_s", "cordon_es"], tip: "ES sur la terre mesurée" },
    { id: "loop_pe", name: "Boucle Phase-PE", need: ["fiche_choco"], tip: "Fiche choco sur la prise — sans piquet" }
  ];

  var ACCESSORIES = [
    { id: "pointes_lnpe", label: "Pointes L / N / PE" },
    { id: "piquet_h", label: "Piquet auxiliaire H" },
    { id: "piquet_s", label: "Piquet auxiliaire S" },
    { id: "cordon_es", label: "Cordon ES (4 pôles)" },
    { id: "croco", label: "Pinces crocodiles" },
    { id: "fiche_choco", label: "Fiche prise type J / choco" }
  ];

  var DEFAULT_STAKE_POS = {
    e: { x: 16, y: 58 },
    s: { x: 40, y: 58 },
    h: { x: 60, y: 62 }
  };

  /* Zone sol jardin — piquets mobiles (apprentissage 62 % / triangle) */
  var STAKE_BOUNDS = { minX: 8, maxX: 72, minY: 48, maxY: 76 };

  var state = {
    step: 0,
    inventory: { piquet: false, drill: false, conductor: false },
    scene: { hole: false, planted: false, wired: false, barrette: false, barretteOpen: false, pe: false },
    accessories: {},
    method: null,
    stakes: { s: false, h: false },
    stakePos: {
      e: { x: DEFAULT_STAKE_POS.e.x, y: DEFAULT_STAKE_POS.e.y },
      s: { x: DEFAULT_STAKE_POS.s.x, y: DEFAULT_STAKE_POS.s.y },
      h: { x: DEFAULT_STAKE_POS.h.x, y: DEFAULT_STAKE_POS.h.y }
    },
    tech: { x: 70, y: 18, pose: "idle", hasFluke: false },
    score: 0,
    mistakes: 0,
    lastReadout: null,
    scoredMethods: {},
    open: false
  };

  var els = {};
  var drag = null;
  var fxTimers = {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function coach(msg, kind) {
    if (!els.coach) return;
    els.coach.innerHTML = msg + '<span class="score">Score : ' + state.score +
      " · Erreurs : " + state.mistakes + "</span>";
    els.coach.dataset.kind = kind || "info";
  }

  function addScore(n, why) {
    state.score = Math.max(0, state.score + n);
    if (why) coach(why, n >= 0 ? "ok" : "bad");
    else renderSide();
  }

  function currentStep() { return STEPS[state.step] || STEPS[STEPS.length - 1]; }

  function canMeasure() {
    return state.scene.planted && state.scene.wired && state.scene.barrette &&
      state.scene.barretteOpen && state.scene.pe;
  }

  function setStep(i) {
    state.step = clamp(i, 0, STEPS.length - 1);
    if (state.step === STEPS.length - 1) {
      state.tech.hasFluke = true;
      ensureFlukeDock();
      if (!state.method) {
        /* Défaut pédagogique : 3P 62 % — déploie Fluke + accessoires terre */
        selectMethod("p3_62", true);
      } else {
        renderAll();
      }
      coach("Fluke prêt avec cordons — " + currentStep().hint, "ok");
      return;
    }
    renderAll();
    coach(currentStep().hint, "info");
  }

  function flukeSrc() {
    try {
      return new URL("../oibt-trainer/meter-embed.html?embed=1&v=labo-terre-test2#/meter", location.href).href;
    } catch (e) {
      return "/oibt-trainer/meter-embed.html?embed=1&v=labo-terre-test2#/meter";
    }
  }

  function ensureFlukeDock() {
    if (!els.stage) return;
    var dock = els.stage.querySelector(".labo-fluke-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "labo-fluke-dock";
      dock.innerHTML =
        '<span class="labo-fluke-label">FLUKE 1664 FC</span>' +
        '<div class="labo-fluke-viewport">' +
        '<div class="labo-fluke-wait">Chargement Fluke…</div>' +
        '<iframe class="labo-fluke-live" title="Fluke 1664 FC" allow="fullscreen" scrolling="no" frameborder="0"></iframe>' +
        "</div>";
      els.stage.appendChild(dock);
      var frame = dock.querySelector("iframe.labo-fluke-live");
      if (frame) {
        frame.src = flukeSrc();
        frame.addEventListener("load", function () {
          dock.classList.add("is-ready");
          scaleLaboFluke();
        });
      }
      window.addEventListener("resize", scaleLaboFluke);
    }
    els.flukeDock = dock;
    scaleLaboFluke();
  }

  function scaleLaboFluke() {
    var dock = els.flukeDock || (els.stage && els.stage.querySelector(".labo-fluke-dock"));
    if (!dock) return;
    var frame = dock.querySelector("iframe.labo-fluke-live");
    var vp = dock.querySelector(".labo-fluke-viewport");
    if (!frame || !vp) return;
    var w = vp.clientWidth || dock.clientWidth || 200;
    var s = Math.max(0.25, w / 400);
    frame.style.transform = "scale(" + s + ")";
  }

  function ensureCordsSvg() {
    if (!els.stage) return null;
    var svg = els.stage.querySelector("svg.labo-cords");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "labo-cords");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      els.stage.appendChild(svg);
    }
    els.cords = svg;
    return svg;
  }

  function cordPath(x1, y1, x2, y2, cls) {
    var mx = (x1 + x2) / 2;
    var my = Math.min(y1, y2) - 10;
    return '<path class="' + cls + '" d="M ' + x1 + " " + y1 +
      " Q " + mx + " " + my + " " + x2 + " " + y2 + '" />';
  }

  function stakeTip(id) {
    var p = state.stakePos[id] || DEFAULT_STAKE_POS[id];
    /* Pointe du piquet = bas du sprite (~ + hauteur visuelle) */
    return { x: p.x + 1.2, y: Math.min(STAKE_BOUNDS.maxY + 4, p.y + 14) };
  }

  function playFx(sel, cls, ms) {
    if (!els.stage) return;
    var el = typeof sel === "string" ? els.stage.querySelector(sel) : sel;
    if (!el) return;
    var key = (el.className || "") + "|" + cls;
    el.classList.remove(cls);
    /* force reflow pour rejouer l’anim */
    void el.offsetWidth;
    el.classList.add(cls);
    if (fxTimers[key]) clearTimeout(fxTimers[key]);
    fxTimers[key] = setTimeout(function () {
      el.classList.remove(cls);
      delete fxTimers[key];
    }, ms || 900);
  }

  function renderGuides() {
    if (!els.stage) return;
    var layer = els.stage.querySelector(".labo-guides");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "labo-guides";
      layer.setAttribute("aria-hidden", "true");
      els.stage.appendChild(layer);
    }
    var stepId = currentStep().id;
    var targets = [];
    function add(zone, label) {
      var z = els.stage.querySelector('.labo-zone[data-zone="' + zone + '"]');
      if (!z) return;
      var stageR = els.stage.getBoundingClientRect();
      if (!stageR.width || !stageR.height) return;
      var zr = z.getBoundingClientRect();
      var cx = ((zr.left + zr.width / 2 - stageR.left) / stageR.width) * 100;
      var cy = ((zr.top + zr.height * 0.35 - stageR.top) / stageR.height) * 100;
      targets.push({ x: cx, y: cy, label: label || zone, zone: zone });
    }
    if (stepId === "stock") add("stock", "Stock");
    if (stepId === "drill") add("drill", "Percer");
    if (stepId === "plant") add("plant", "Planter");
    if (stepId === "wire") add("barrette", "Barrette");
    if (stepId === "barrette") add("barrette", "Ouvrir");
    if (stepId === "pe") add("pe", "PE");
    if (stepId === "measure") {
      if (state.method === "loop_pe") add("prise", "Prise");
      else if (state.method) {
        if (!state.stakes.s) add("measure-s", "S");
        if (!state.stakes.h) add("measure-h", "H");
        if (state.stakes.s && state.stakes.h) add("measure-e", "E");
      } else {
        add("measure-s", "S");
        add("measure-h", "H");
      }
    }
    layer.innerHTML = targets.map(function (t) {
      return '<div class="labo-guide" style="left:' + t.x.toFixed(1) + "%;top:" + t.y.toFixed(1) + '%">' +
        '<span class="labo-guide-label">' + t.label + "</span>" +
        '<svg viewBox="0 0 40 56" width="40" height="56" aria-hidden="true">' +
        '<path class="labo-guide-shaft" d="M20 4 L20 34" />' +
        '<path class="labo-guide-head" d="M8 30 L20 50 L32 30 Z" />' +
        "</svg></div>";
    }).join("");
  }

  function renderFlukeCords() {
    var svg = ensureCordsSvg();
    if (!svg) return;
    var measuring = currentStep().id === "measure" && canMeasure();
    svg.classList.toggle("is-on", measuring);
    if (!measuring) {
      svg.innerHTML = "";
      return;
    }
    /* Jacks Fluke (dock bas-droite) → piquets mobiles E / S / H */
    var jackE = { x: 70, y: 88 };
    var jackS = { x: 78, y: 86 };
    var jackH = { x: 86, y: 88 };
    var tipE = stakeTip("e");
    var tipS = stakeTip("s");
    var tipH = stakeTip("h");
    var prise = { x: 86, y: 48 };
    var html = "";
    var m = state.method;
    if (m === "loop_pe") {
      if (state.accessories.fiche_choco) {
        html += cordPath(jackH.x, jackH.y, prise.x - 2, prise.y, "cord-l");
        html += cordPath(jackS.x, jackS.y, prise.x, prise.y + 2, "cord-n");
        html += cordPath(jackE.x, jackE.y, prise.x + 2, prise.y, "cord-pe");
      }
    } else if (m === "p3_62" || m === "triangle" || m === "p4") {
      /* Cordons réels appareil → trois piquets (suivent le drag) */
      if (state.scene.planted) {
        html += cordPath(jackE.x, jackE.y, tipE.x, tipE.y, "cord-pe");
      }
      if (state.stakes.s || state.accessories.piquet_s) {
        html += cordPath(jackS.x, jackS.y, tipS.x, tipS.y, "cord-s");
      }
      if (state.stakes.h || state.accessories.piquet_h) {
        html += cordPath(jackH.x, jackH.y, tipH.x, tipH.y, "cord-h");
      }
      if (m === "p4" && state.accessories.cordon_es) {
        html += cordPath(jackE.x - 3, jackE.y, tipE.x + 3, tipE.y - 3, "cord-es");
      }
    }
    svg.innerHTML = html;
  }

  function renderMeasureProps() {
    if (!els.stage) return;
    var fiche = els.stage.querySelector(".labo-prop.fiche-choco");
    var croco = els.stage.querySelector(".labo-prop.croco");
    var pointes = els.stage.querySelector(".labo-prop.pointes");
    var hint = els.stage.querySelector(".labo-kit-hint");
    var dock = els.flukeDock || els.stage.querySelector(".labo-fluke-dock");
    var measuring = currentStep().id === "measure" && canMeasure();

    if (dock) dock.classList.toggle("is-on", measuring);
    if (hint) {
      hint.classList.toggle("is-on", measuring);
      if (measuring) {
        var tip = "Fluke prêt — place les accessoires puis Lancer TEST";
        var m = METHODS.find(function (x) { return x.id === state.method; });
        if (m) tip = "Fluke + " + m.name + " — " + m.tip;
        hint.textContent = tip;
      }
    }
    if (fiche) {
      fiche.style.opacity = (measuring && state.accessories.fiche_choco) ? "1" : "0";
      fiche.style.left = "82%";
      fiche.style.top = "44%";
    }
    if (croco) {
      croco.style.opacity = (measuring && state.accessories.croco) ? "1" : "0";
      croco.style.left = "62%";
      croco.style.top = "52%";
    }
    if (pointes) {
      pointes.style.opacity = (measuring && state.accessories.pointes_lnpe) ? "1" : "0";
      pointes.style.left = "74%";
      pointes.style.top = "70%";
    }
    renderFlukeCords();
  }

  function advanceIfReady() {
    var s = currentStep().id;
    if (s === "stock" && state.inventory.piquet && state.inventory.drill && state.inventory.conductor) {
      addScore(10, "Matériel pris. Va percer le sol.");
      setStep(1);
      return;
    }
    if (s === "drill" && state.scene.hole) {
      addScore(15, "Trou prêt. Plante le piquet.");
      setStep(2);
      return;
    }
    if (s === "plant" && state.scene.planted) {
      addScore(20, "Piquet enfoncé. Tire le conducteur.");
      setStep(3);
      return;
    }
    if (s === "wire" && state.scene.wired) {
      addScore(15, "Conducteur posé. Fixe la barrette.");
      setStep(4);
      return;
    }
    if (s === "barrette" && state.scene.barrette && state.scene.barretteOpen) {
      addScore(15, "Barrette ouverte. Raccorde le PE.");
      setStep(5);
      return;
    }
    if (s === "pe" && state.scene.pe) {
      addScore(25, "Terre prête ! Fluke + cordons débloqués.");
      setStep(6);
      return;
    }
  }

  function zoneHit(clientX, clientY) {
    if (!els.stage) return null;
    var zones = els.stage.querySelectorAll(".labo-zone");
    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return zones[i].getAttribute("data-zone");
      }
    }
    return null;
  }

  function moveTechToZone(zoneId) {
    var map = {
      stock: { x: 74, y: 16, pose: "idle" },
      drill: { x: 12, y: 42, pose: "drill" },
      plant: { x: 14, y: 44, pose: "plant" },
      barrette: { x: 52, y: 36, pose: "kneel" },
      pe: { x: 54, y: 38, pose: "kneel" },
      "measure-e": { x: 10, y: 40, pose: "idle" },
      "measure-s": { x: 34, y: 44, pose: "idle" },
      "measure-h": { x: 54, y: 46, pose: "idle" },
      prise: { x: 74, y: 32, pose: "kneel" }
    };
    var m = map[zoneId];
    if (!m) return;
    state.tech.x = m.x;
    state.tech.y = m.y;
    state.tech.pose = m.pose;
    renderTech();
  }

  function onTechAction(zone) {
    var step = currentStep().id;
    if (!zone) return;

    if (step === "stock" && zone === "stock") {
      state.inventory.piquet = true;
      state.inventory.drill = true;
      state.inventory.conductor = true;
      /* Debout statique — plus de sprite « qui marche » (tech_carry mid-stride). */
      state.tech.pose = "idle";
      coach("Tu as piquet, perforateur et conducteur.", "ok");
      advanceIfReady();
      renderAll();
      return;
    }
    if (step === "drill" && (zone === "drill" || zone === "plant" || zone === "measure-e")) {
      if (!state.inventory.drill) {
        state.mistakes++;
        addScore(-5, "Il te faut le perforateur (retour stock).");
        return;
      }
      moveTechToZone("drill");
      state.scene.hole = true;
      coach("Sol percé — mouvement de pressage.", "ok");
      advanceIfReady();
      renderAll();
      playFx(".labo-prop.drill", "is-fx-drill", 1000);
      playFx(els.tech, "is-fx-work", 1000);
      return;
    }
    if (step === "plant" && (zone === "plant" || zone === "drill" || zone === "measure-e")) {
      if (!state.scene.hole) {
        state.mistakes++;
        addScore(-5, "Perce d’abord le sol.");
        return;
      }
      if (!state.inventory.piquet) {
        state.mistakes++;
        addScore(-5, "Prends un piquet au stock.");
        return;
      }
      moveTechToZone("plant");
      state.scene.planted = true;
      state.stakePos.e.x = DEFAULT_STAKE_POS.e.x;
      state.stakePos.e.y = DEFAULT_STAKE_POS.e.y;
      coach("Piquet enfoncé — animation de pressage.", "ok");
      advanceIfReady();
      renderAll();
      playFx(".labo-prop.piquet", "is-fx-plant", 1100);
      playFx(els.tech, "is-fx-work", 1100);
      return;
    }
    if (step === "wire" && (zone === "barrette" || zone === "pe" || zone === "plant")) {
      if (!state.scene.planted) {
        state.mistakes++;
        addScore(-5, "Plante d’abord le piquet.");
        return;
      }
      moveTechToZone("barrette");
      state.scene.wired = true;
      coach("Conducteur tiré — raccordement visible.", "ok");
      advanceIfReady();
      renderAll();
      playFx(".labo-prop.conductor", "is-fx-wire", 1200);
      playFx(els.tech, "is-fx-work", 900);
      return;
    }
    if (step === "barrette" && (zone === "barrette" || zone === "pe")) {
      moveTechToZone("barrette");
      if (!state.scene.barrette) {
        state.scene.barrette = true;
        coach("Barrette fixée. Ouvre-la pour la mesure (retape).", "info");
        renderAll();
        playFx(".labo-prop.barrette", "is-fx-connect", 900);
        return;
      }
      state.scene.barretteOpen = true;
      coach("Barrette ouverte — prêt pour PE.", "ok");
      advanceIfReady();
      renderAll();
      playFx(".labo-prop.barrette", "is-fx-connect", 900);
      return;
    }
    if (step === "pe" && (zone === "pe" || zone === "barrette")) {
      if (!state.scene.barretteOpen) {
        state.mistakes++;
        addScore(-5, "Ouvre la barrette avant le PE.");
        return;
      }
      moveTechToZone("pe");
      state.scene.pe = true;
      coach("PE raccordé — animation de raccordement.", "ok");
      advanceIfReady();
      renderAll();
      playFx(".labo-panel", "is-fx-pe", 1200);
      playFx(".labo-prop.barrette", "is-fx-connect", 1000);
      playFx(els.tech, "is-fx-work", 900);
      return;
    }
    if (step === "measure") {
      if (zone === "measure-s") {
        state.stakes.s = true;
        state.accessories.piquet_s = true;
        moveTechToZone(zone);
        coach("Piquet S posé.", "ok");
        renderAll();
        return;
      }
      if (zone === "measure-h") {
        state.stakes.h = true;
        state.accessories.piquet_h = true;
        moveTechToZone(zone);
        coach("Piquet H posé.", "ok");
        renderAll();
        return;
      }
      if (zone === "prise") {
        state.accessories.fiche_choco = true;
        moveTechToZone(zone);
        coach("Fiche choco sur la prise.", "ok");
        renderAll();
        return;
      }
      if (zone === "measure-e" || zone === "plant") {
        moveTechToZone("measure-e");
        coach("Technicien à la terre E (piquet).", "info");
        renderAll();
      }
    }
  }

  /** Modèle simple R terre selon construction + méthode (pas de valeurs inventées hors règles). */
  function computeEarthReading() {
    if (!canMeasure()) {
      return { ok: false, text: "— — —", detail: "Termine la construction (barrette ouverte + PE)." };
    }
    if (!state.method) {
      return { ok: false, text: "— — —", detail: "Choisis une méthode de mesure." };
    }
    var m = METHODS.find(function (x) { return x.id === state.method; });
    if (!m) return { ok: false, text: "— — —", detail: "Méthode inconnue." };

    for (var i = 0; i < m.need.length; i++) {
      if (!state.accessories[m.need[i]]) {
        return { ok: false, text: "CHECK ACC.", detail: "Accessoire manquant : " + m.need[i] };
      }
    }
    if (!state.scene.barretteOpen && state.method !== "loop_pe") {
      state.mistakes++;
      return { ok: false, text: "ERR", detail: "Barrette fermée — ouvre-la (mesure faussée sinon)." };
    }

    /* R piquet de base (scène habitat) */
    var rEarth = 18.4;
    if (state.scene.planted) rEarth = 16.2;
    var r = rEarth;
    var detail = m.tip;

    if (state.method === "p3_62") {
      if (!state.stakes.s || !state.stakes.h) {
        return { ok: false, text: "CHECK", detail: "Place les piquets S et H (62 %)." };
      }
      r = rEarth;
      detail = "3P 62 % · " + stakeSpacingTip() + " · R ≈ " + r.toFixed(1) + " Ω";
    } else if (state.method === "triangle") {
      if (!state.stakes.s || !state.stakes.h) {
        return { ok: false, text: "CHECK", detail: "Place S et H en triangle." };
      }
      r = rEarth * 1.04;
      detail = "Triangle · " + stakeSpacingTip() + " · R ≈ " + r.toFixed(1) + " Ω";
    } else if (state.method === "p4") {
      if (!state.stakes.s || !state.stakes.h) {
        return { ok: false, text: "CHECK", detail: "Place S et H + cordon ES." };
      }
      r = rEarth * 0.98;
      detail = "4P · cordons compensés · R ≈ " + r.toFixed(2) + " Ω";
    } else if (state.method === "loop_pe") {
      r = rEarth + 0.8 + 0.35; /* + Rtransfo + câbles (par excès) */
      detail = "Boucle Phase-PE · Rmes > Rterre · ≈ " + r.toFixed(1) + " Ω";
    }

    /* Coach OIBT / NIBT : seuil pédagogique TT courant ~20 Ω (hors cas particuliers) */
    var oibt = scoreOibt(r, state.method);
    detail += " · " + oibt.label;
    if (!state.scoredMethods[state.method]) {
      state.scoredMethods[state.method] = true;
      var methodBonus = state.method === "p4" ? 25 : (state.method === "p3_62" ? 20 : 15);
      addScore(methodBonus + (oibt.bonus || 0), detail);
    }

    pushToFluke(r, state.method);
    return { ok: true, text: r.toFixed(2) + " Ω", detail: detail, oibt: oibt };
  }

  /** Feedback pédagogique position S entre E et H (~62 %). */
  function stakeSpacingTip() {
    var e = state.stakePos.e;
    var s = state.stakePos.s;
    var h = state.stakePos.h;
    var dxEH = h.x - e.x;
    var dyEH = h.y - e.y;
    var lenEH = Math.sqrt(dxEH * dxEH + dyEH * dyEH) || 1;
    var t = ((s.x - e.x) * dxEH + (s.y - e.y) * dyEH) / (lenEH * lenEH);
    var pct = Math.round(clamp(t, 0, 1) * 100);
    if (pct >= 55 && pct <= 70) return "S ≈ " + pct + "% E→H (bon)";
    return "S ≈ " + pct + "% E→H (vise ~62 %)";
  }

  function scoreOibt(ohms, method) {
    var limit = 20;
    if (method === "loop_pe") {
      /* Boucle : valeur par excès — seuil pédagogique plus lâche */
      if (ohms <= 30) return { pass: true, label: "OIBT OK (boucle ≤ 30 Ω pédagog.)", bonus: 10 };
      return { pass: false, label: "OIBT KO — boucle trop élevée", bonus: -10 };
    }
    if (ohms <= limit) return { pass: true, label: "OIBT OK — R ≤ " + limit + " Ω (TT)", bonus: 15 };
    return { pass: false, label: "OIBT KO — R > " + limit + " Ω", bonus: -10 };
  }

  function laboFlukeFrames() {
    var out = [];
    if (els.flukeDock) {
      var f = els.flukeDock.querySelector("iframe.labo-fluke-live");
      if (f) out.push(f);
    }
    document.querySelectorAll("iframe.labo-fluke-live, iframe.fluke-live").forEach(function (fr) {
      if (out.indexOf(fr) < 0) out.push(fr);
    });
    return out;
  }

  function pushToFluke(ohms, method, doTest) {
    try {
      var leads = { L: true, N: true, PE: true };
      var msg = {
        type: doTest ? "panelwire/fluke-test" : "panelwire/fluke-state",
        leads: leads,
        L: true, N: true, PE: true,
        volts: { LN: 0, LPE: 0, NPE: 0 },
        ln: 0, lpe: 0, npe: 0,
        maxV: 0,
        live: false,
        sim: true,
        earthOhm: ohms,
        earthMethod: method || state.method
      };
      laboFlukeFrames().forEach(function (f) {
        try { f.contentWindow && f.contentWindow.postMessage(msg, "*"); } catch (e) {}
      });
      window.dispatchEvent(new CustomEvent("wirelab-labo-terre", { detail: msg }));
    } catch (e) {}
  }

  function armFlukeLeads() {
    if (!canMeasure()) return;
    pushToFluke(state.lastReadout && state.lastReadout.ok
      ? parseFloat(state.lastReadout.text)
      : 16.2, state.method || "p3_62", false);
  }

  function toggleAccessory(id) {
    if (!canMeasure() && id !== "pointes_lnpe" && id !== "croco") {
      coach("Termine d’abord la pose des piquets.", "bad");
      return;
    }
    state.accessories[id] = !state.accessories[id];
    if (id === "piquet_s") state.stakes.s = !!state.accessories[id];
    if (id === "piquet_h") state.stakes.h = !!state.accessories[id];
    renderAll();
  }

  function selectMethod(id, silent) {
    if (!canMeasure()) {
      state.mistakes++;
      addScore(-5, "Construction incomplète — pas encore de mesure.");
      return;
    }
    state.method = id;
    state.tech.hasFluke = true;
    ensureFlukeDock();
    /* Déploie automatiquement les accessoires requis pour la méthode */
    var m = METHODS.find(function (x) { return x.id === id; });
    if (m && m.need) {
      m.need.forEach(function (accId) {
        state.accessories[accId] = true;
        if (accId === "piquet_s") state.stakes.s = true;
        if (accId === "piquet_h") state.stakes.h = true;
      });
    }
    if (id === "p3_62" || id === "triangle" || id === "p4") {
      state.accessories.croco = true;
      state.accessories.pointes_lnpe = true;
    }
    if (!silent) coach(m ? ("Fluke + cordons : " + m.tip) : "Méthode sélectionnée.", "info");
    renderAll();
    armFlukeLeads();
  }

  function runMeasure() {
    ensureFlukeDock();
    var reading = computeEarthReading();
    state.lastReadout = reading;
    if (els.readout) {
      els.readout.innerHTML = reading.text + "<small>" + reading.detail + "</small>";
    }
    if (!reading.ok) {
      state.mistakes++;
      coach(reading.detail, "bad");
      renderSide();
      return;
    }
    var ohms = parseFloat(reading.text);
    /* 1) injecte R + leads sur le Fluke  2) déclenche le vrai bouton TEST */
    pushToFluke(ohms, state.method, false);
    setTimeout(function () {
      pushToFluke(ohms, state.method, true);
      coach("TEST Fluke — écran RE : " + reading.text, "ok");
    }, 180);
    renderSide();
  }

  function reset() {
    state.step = 0;
    state.inventory = { piquet: false, drill: false, conductor: false };
    state.scene = { hole: false, planted: false, wired: false, barrette: false, barretteOpen: false, pe: false };
    state.accessories = {};
    state.method = null;
    state.stakes = { s: false, h: false };
    state.stakePos = {
      e: { x: DEFAULT_STAKE_POS.e.x, y: DEFAULT_STAKE_POS.e.y },
      s: { x: DEFAULT_STAKE_POS.s.x, y: DEFAULT_STAKE_POS.s.y },
      h: { x: DEFAULT_STAKE_POS.h.x, y: DEFAULT_STAKE_POS.h.y }
    };
    state.tech = { x: 70, y: 18, pose: "idle", hasFluke: false };
    state.score = 0;
    state.mistakes = 0;
    state.lastReadout = null;
    state.scoredMethods = {};
    renderAll();
    coach("Nouveau chantier : commence par le stock (piquets).", "info");
  }

  function renderTech() {
    if (!els.tech) return;
    els.tech.style.left = state.tech.x + "%";
    els.tech.style.top = state.tech.y + "%";
    els.tech.className = "labo-tech pose-" + (state.tech.pose || "idle") +
      (state.tech.hasFluke ? " has-fluke" : "");
  }

  function renderScene() {
    if (!els.stage) return;
    var hole = els.stage.querySelector(".labo-prop.hole");
    var piquet = els.stage.querySelector(".labo-prop.piquet");
    var cond = els.stage.querySelector(".labo-prop.conductor");
    var barr = els.stage.querySelector(".labo-prop.barrette");
    var drill = els.stage.querySelector(".labo-prop.drill");
    var stakeS = els.stage.querySelector(".labo-prop.stake-aux.s");
    var stakeH = els.stage.querySelector(".labo-prop.stake-aux.h");
    var panel = els.stage.querySelector(".labo-panel");

    if (hole) {
      hole.style.opacity = state.scene.hole ? "1" : "0";
      hole.style.left = (state.stakePos.e.x + 1) + "%";
      hole.style.top = (state.stakePos.e.y + 18) + "%";
    }
    if (piquet) {
      piquet.style.opacity = (state.inventory.piquet || state.scene.planted) ? "1" : "0";
      piquet.classList.toggle("is-planted", !!state.scene.planted);
      piquet.classList.toggle("is-draggable", !!state.scene.planted);
      piquet.setAttribute("title", state.scene.planted ? "Glisser le piquet E" : "");
      if (state.scene.planted) {
        piquet.style.left = state.stakePos.e.x + "%";
        piquet.style.top = state.stakePos.e.y + "%";
      } else if (state.inventory.piquet && !state.scene.planted) {
        /* porté par le tech — prop stock masqué */
        piquet.style.opacity = "0";
      }
    }
    if (drill) {
      var showDrill = state.tech.pose === "drill" || (state.inventory.drill && !state.scene.hole && currentStep().id === "stock");
      drill.style.opacity = showDrill ? "1" : "0";
      drill.style.left = state.tech.pose === "drill" ? (state.stakePos.e.x + 8) + "%" : "80%";
      drill.style.top = state.tech.pose === "drill" ? (state.stakePos.e.y + 4) + "%" : "28%";
    }
    if (cond) {
      cond.style.opacity = state.scene.wired ? "1" : "0";
      if (state.scene.wired) {
        cond.style.left = "22%";
        cond.style.top = "66%";
        cond.style.width = "140px";
      }
    }
    if (barr) {
      barr.style.opacity = state.scene.barrette ? "1" : "0";
      barr.classList.toggle("is-open", !!state.scene.barretteOpen);
      barr.style.left = "58%";
      barr.style.top = "50%";
    }
    if (panel) panel.classList.toggle("is-pe", !!state.scene.pe);
    if (stakeS) {
      stakeS.style.opacity = state.stakes.s ? "1" : "0";
      stakeS.style.left = state.stakePos.s.x + "%";
      stakeS.style.top = state.stakePos.s.y + "%";
      stakeS.classList.toggle("is-draggable", !!state.stakes.s);
      stakeS.setAttribute("title", state.stakes.s ? "Glisser le piquet S" : "");
    }
    if (stakeH) {
      stakeH.style.opacity = state.stakes.h ? "1" : "0";
      stakeH.style.left = state.stakePos.h.x + "%";
      stakeH.style.top = state.stakePos.h.y + "%";
      stakeH.classList.toggle("is-draggable", !!state.stakes.h);
      stakeH.setAttribute("title", state.stakes.h ? "Glisser le piquet H" : "");
    }

    /* Zones = hitboxes invisibles ; guidage = flèches (pas de cercles jaunes) */
    els.stage.querySelectorAll(".labo-zone").forEach(function (z) {
      z.classList.remove("is-target");
    });
    renderGuides();
  }

  function renderSide() {
    if (els.steps) {
      els.steps.innerHTML = STEPS.map(function (st, i) {
        var cls = "labo-step";
        if (i === state.step) cls += " is-active";
        if (i < state.step) cls += " is-done";
        return '<div class="' + cls + '"><span class="n">' + (i + 1) + '</span><div>' +
          '<div class="txt">' + st.title + '</div><span class="hint">' + st.hint + "</span></div></div>";
      }).join("");
    }
    if (els.inv) {
      els.inv.innerHTML =
        invChip("piquet", "Piquet") +
        invChip("drill", "Perforateur") +
        invChip("conductor", "Conducteur");
    }
    if (els.methods) {
      var unlocked = canMeasure();
      els.methods.innerHTML = METHODS.map(function (m) {
        return '<button type="button" data-method="' + m.id + '"' +
          (unlocked ? "" : " disabled") +
          (state.method === m.id ? ' class="is-on"' : "") + ">" +
          m.name + "</button>";
      }).join("");
      els.methods.querySelectorAll("[data-method]").forEach(function (btn) {
        btn.onclick = function () { selectMethod(btn.getAttribute("data-method")); };
      });
    }
    if (els.acc) {
      els.acc.innerHTML = ACCESSORIES.map(function (a) {
        return '<button type="button" class="labo-acc' + (state.accessories[a.id] ? " is-on" : "") +
          '" data-acc="' + a.id + '">' + a.label + "</button>";
      }).join("");
      els.acc.querySelectorAll("[data-acc]").forEach(function (btn) {
        btn.onclick = function () { toggleAccessory(btn.getAttribute("data-acc")); };
      });
    }
    if (els.readout && state.lastReadout) {
      els.readout.innerHTML = state.lastReadout.text + "<small>" + state.lastReadout.detail + "</small>";
    } else if (els.readout) {
      els.readout.innerHTML = "— — —<small>Pas encore de mesure</small>";
    }
  }

  function invChip(key, label) {
    var have = !!state.inventory[key];
    var need = currentStep().id === "stock" && !have;
    return '<span class="labo-inv' + (have ? " is-have" : "") + (need ? " is-need" : "") + '">' +
      label + (have ? " ✓" : "") + "</span>";
  }

  function renderAll() {
    renderTech();
    renderScene();
    renderMeasureProps();
    renderSide();
  }

  function buildDom() {
    var root = document.getElementById("laboTerre");
    if (!root) return null;
    root.innerHTML =
      '<div class="labo-terre-bar" id="laboTerreBar">' +
      "<strong>Labo terre — Piquets</strong>" +
      '<button type="button" id="laboTerreReset">Recommencer</button>' +
      '<button type="button" class="primary" id="laboTerreMeasure">Mesurer</button>' +
      '<button type="button" id="laboTerreClose">Fermer</button>' +
      "</div>" +
      '<div class="labo-terre-body">' +
      '<aside class="labo-terre-side" id="laboTerreSteps"></aside>' +
      '<div class="labo-stage" id="laboTerreStage">' +
      '<div class="labo-panel" title="Tableau PE" aria-hidden="true"></div>' +
      '<div class="labo-zone" data-zone="stock" aria-label="Stock"></div>' +
      '<div class="labo-zone" data-zone="drill" aria-label="Percer"></div>' +
      '<div class="labo-zone" data-zone="plant" aria-label="Piquet"></div>' +
      '<div class="labo-zone" data-zone="barrette" aria-label="Barrette"></div>' +
      '<div class="labo-zone" data-zone="pe" aria-label="PE"></div>' +
      '<div class="labo-zone" data-zone="measure-e" aria-label="Terre E"></div>' +
      '<div class="labo-zone" data-zone="measure-s" aria-label="Piquet S"></div>' +
      '<div class="labo-zone" data-zone="measure-h" aria-label="Piquet H"></div>' +
      '<div class="labo-zone" data-zone="prise" aria-label="Prise"></div>' +
      '<div class="labo-prop hole" style="left:18%;top:78%;opacity:0"></div>' +
      '<div class="labo-prop piquet" style="left:78%;top:22%;opacity:0"></div>' +
      '<div class="labo-prop drill" style="left:82%;top:24%;opacity:0"></div>' +
      '<div class="labo-prop conductor" style="opacity:0"></div>' +
      '<div class="labo-prop barrette" style="opacity:0"></div>' +
      '<div class="labo-prop stake-aux s" style="opacity:0"></div>' +
      '<div class="labo-prop stake-aux h" style="opacity:0"></div>' +
      '<div class="labo-prop fiche-choco" style="opacity:0"></div>' +
      '<div class="labo-prop croco" style="opacity:0"></div>' +
      '<div class="labo-prop pointes" style="opacity:0"></div>' +
      '<div class="labo-kit-hint" aria-live="polite"></div>' +
      '<div class="labo-tech pose-idle" id="laboTerreTech" title="Glisser le technicien"></div>' +
      "</div>" +
      '<aside class="labo-terre-side right">' +
      "<h3>Inventaire</h3><div class=\"labo-inventory\" id=\"laboTerreInv\"></div>" +
      "<h3>Coach</h3><div class=\"labo-coach\" id=\"laboTerreCoach\"></div>" +
      "<h3>Méthodes</h3><div class=\"labo-methods\" id=\"laboTerreMethods\"></div>" +
      "<h3>Accessoires</h3><div class=\"labo-acc-list\" id=\"laboTerreAcc\"></div>" +
      '<div class="labo-readout" id="laboTerreReadout">— — —<small>Pas encore de mesure</small></div>' +
      '<div class="labo-footer-actions">' +
      '<button type="button" id="laboTerreAct">Action ici</button>' +
      '<button type="button" class="primary" id="laboTerreRun">Lancer TEST</button>' +
      "</div></aside></div>";

    els.root = root;
    els.bar = $("#laboTerreBar", root);
    els.steps = $("#laboTerreSteps", root);
    els.stage = $("#laboTerreStage", root);
    els.tech = $("#laboTerreTech", root);
    els.inv = $("#laboTerreInv", root);
    els.coach = $("#laboTerreCoach", root);
    els.methods = $("#laboTerreMethods", root);
    els.acc = $("#laboTerreAcc", root);
    els.readout = $("#laboTerreReadout", root);

    $("#laboTerreClose", root).onclick = close;
    $("#laboTerreReset", root).onclick = reset;
    $("#laboTerreMeasure", root).onclick = function () {
      if (canMeasure()) setStep(6);
      else coach("Finis la pose avant de mesurer.", "bad");
    };
    $("#laboTerreRun", root).onclick = runMeasure;
    $("#laboTerreAct", root).onclick = function () {
      var r = els.tech.getBoundingClientRect();
      var z = zoneHit(r.left + r.width / 2, r.top + r.height / 2);
      onTechAction(z || guessZoneFromStep());
    };

    bindTechDrag();
    bindStakeDrag();
    bindPanelDrag();
    els.stage.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".labo-prop.is-draggable")) return;
      var z = zoneHit(ev.clientX, ev.clientY);
      if (z) {
        moveTechToZone(z === "drill" ? "drill" : z);
        onTechAction(z);
      }
    });
    return root;
  }

  function guessZoneFromStep() {
    var s = currentStep().id;
    if (s === "stock") return "stock";
    if (s === "drill") return "drill";
    if (s === "plant") return "plant";
    if (s === "wire" || s === "barrette") return "barrette";
    if (s === "pe") return "pe";
    if (s === "measure") {
      if (state.method === "loop_pe") return "prise";
      if (!state.stakes.s) return "measure-s";
      if (!state.stakes.h) return "measure-h";
      return "measure-e";
    }
    return null;
  }

  function bindTechDrag() {
    if (!els.tech || !els.stage) return;
    els.tech.onpointerdown = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var st = els.stage.getBoundingClientRect();
      drag = {
        kind: "tech",
        ox: ev.clientX,
        oy: ev.clientY,
        x0: state.tech.x,
        y0: state.tech.y,
        sw: st.width,
        sh: st.height,
        pid: ev.pointerId
      };
      try { els.tech.setPointerCapture(ev.pointerId); } catch (e) {}
    };
    els.tech.onpointermove = function (ev) {
      if (!drag || drag.kind !== "tech") return;
      var dx = ((ev.clientX - drag.ox) / drag.sw) * 100;
      var dy = ((ev.clientY - drag.oy) / drag.sh) * 100;
      state.tech.x = clamp(drag.x0 + dx, 2, 90);
      state.tech.y = clamp(drag.y0 + dy, 2, 78);
      /* Garder la pose courante (idle/drill/…) — ne pas basculer sur le sprite marche. */
      renderTech();
    };
    els.tech.onpointerup = function (ev) {
      if (!drag || drag.kind !== "tech") return;
      var z = zoneHit(ev.clientX, ev.clientY);
      drag = null;
      if (z) onTechAction(z);
      else renderTech();
    };
  }

  function bindStakeDrag() {
    if (!els.stage) return;
    var map = [
      { sel: ".labo-prop.piquet", key: "e", need: function () { return state.scene.planted; } },
      { sel: ".labo-prop.stake-aux.s", key: "s", need: function () { return state.stakes.s; } },
      { sel: ".labo-prop.stake-aux.h", key: "h", need: function () { return state.stakes.h; } }
    ];
    map.forEach(function (item) {
      var el = els.stage.querySelector(item.sel);
      if (!el) return;
      el.onpointerdown = function (ev) {
        if (!item.need()) return;
        ev.preventDefault();
        ev.stopPropagation();
        var st = els.stage.getBoundingClientRect();
        var pos = state.stakePos[item.key];
        drag = {
          kind: "stake",
          key: item.key,
          el: el,
          ox: ev.clientX,
          oy: ev.clientY,
          x0: pos.x,
          y0: pos.y,
          sw: st.width,
          sh: st.height,
          pid: ev.pointerId
        };
        el.classList.add("is-dragging");
        try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      };
      el.onpointermove = function (ev) {
        if (!drag || drag.kind !== "stake" || drag.key !== item.key) return;
        var dx = ((ev.clientX - drag.ox) / drag.sw) * 100;
        var dy = ((ev.clientY - drag.oy) / drag.sh) * 100;
        state.stakePos[item.key].x = clamp(drag.x0 + dx, STAKE_BOUNDS.minX, STAKE_BOUNDS.maxX);
        state.stakePos[item.key].y = clamp(drag.y0 + dy, STAKE_BOUNDS.minY, STAKE_BOUNDS.maxY);
        el.style.left = state.stakePos[item.key].x + "%";
        el.style.top = state.stakePos[item.key].y + "%";
        if (item.key === "e") {
          var hole = els.stage.querySelector(".labo-prop.hole");
          if (hole) {
            hole.style.left = (state.stakePos.e.x + 1) + "%";
            hole.style.top = (state.stakePos.e.y + 18) + "%";
          }
        }
        renderFlukeCords();
      };
      el.onpointerup = function () {
        if (!drag || drag.kind !== "stake" || drag.key !== item.key) return;
        el.classList.remove("is-dragging");
        drag = null;
        if (currentStep().id === "measure" && state.method === "p3_62" && state.stakes.s && state.stakes.h) {
          coach("Piquets mobiles — " + stakeSpacingTip() + ". Cordons Fluke suivent.", "info");
        } else {
          coach("Piquet déplacé — les cordons suivent.", "info");
        }
        renderGuides();
        renderFlukeCords();
      };
    });
  }

  function bindPanelDrag() {
    if (!els.bar || !els.root) return;
    els.bar.onpointerdown = function (ev) {
      if (ev.target.tagName === "BUTTON") return;
      var r = els.root.getBoundingClientRect();
      drag = {
        kind: "panel",
        ox: ev.clientX,
        oy: ev.clientY,
        l0: r.left,
        t0: r.top,
        pid: ev.pointerId
      };
      try { els.bar.setPointerCapture(ev.pointerId); } catch (e) {}
    };
    els.bar.onpointermove = function (ev) {
      if (!drag || drag.kind !== "panel") return;
      els.root.style.left = Math.max(0, drag.l0 + (ev.clientX - drag.ox)) + "px";
      els.root.style.top = Math.max(0, drag.t0 + (ev.clientY - drag.oy)) + "px";
    };
    els.bar.onpointerup = function () { drag = null; };
  }

  function open() {
    var root = document.getElementById("laboTerre");
    if (!root) return;
    if (!els.stage) buildDom();
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    state.open = true;
    if (state.score === 0 && state.step === 0 && !state.inventory.piquet) {
      coach("Chantier piquets : commence au stock.", "info");
    }
    renderAll();
    /* Flèches après layout (évite positions 0×0 si panneau encore masqué) */
    requestAnimationFrame(function () { renderGuides(); });
  }

  function close() {
    var root = document.getElementById("laboTerre");
    if (!root) return;
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    state.open = false;
  }

  function ensureShell() {
    if (document.getElementById("laboTerre")) return;
    var div = document.createElement("div");
    div.id = "laboTerre";
    div.className = "labo-terre";
    div.hidden = true;
    div.setAttribute("aria-hidden", "true");
    document.body.appendChild(div);
  }

  function init() {
    ensureShell();
    buildDom();
    var btn = document.getElementById("btnLaboTerreMenu");
    if (btn) btn.onclick = function () { open(); };
    if (/[?&]open=labo-terre\b/.test(location.search)) open();
  }

  window.WireLabLaboTerre = {
    open: open,
    close: close,
    reset: reset,
    state: state,
    ACCESSORIES: ACCESSORIES,
    METHODS: METHODS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

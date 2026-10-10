(function () {
  var KEY = "wirelab-site-lang";
  var DICT = {
    fr: {
      title: "WireLab Pro by SwissDZ",
      desc: "WireLab Pro by SwissDZ : teste le câblage en ligne. Place les modules, tire les fils, lance Play.",
      heroTitle: "Le câblage électrique, comme sur le terrain.",
      heroLead: "Place les modules, tire les fils, lance Play — le courant circule. Bibliothèque pro, KNX, PV, Fluke.",
      testOnline: "Tester WireLab en ligne",
      testShort: "Tester en ligne",
      seeOffers: "Voir les offres",
      tryLead: "Ouvre le panneau dans le navigateur. Entre avec Google ou ton e-mail, pose les modules, tire les fils, puis lance Play.",
      chipWire: "Câblage réel",
      chipLib: "Bibliothèque pro",
      shotsTitle: "Dans l’application",
      shotsLead: "Captures réelles : câblage, bibliothèque, protections.",
      altWire: "Câblage WireLab Pro by SwissDZ",
      altLib: "Bibliothèque de composants",
      altProt: "Protections et tableau",
      doTitle: "Ce que tu peux faire",
      doLead: "Un atelier numérique pour former et vérifier avant le terrain.",
      svc1t: "Câblage et simulation",
      svc1p: "Bornes, sections, couleurs IEC, Play / Stop — le courant se voit sur les fils.",
      svc2t: "Bibliothèque pro",
      svc2p: "Disjoncteurs, contacteurs, moteurs, commande, KNX SwissDz, PLC LOGO!, PV…",
      svc3t: "Mesure Gold",
      svc3p: "Fluke 1664 FC sur le plan, accessoires de mise à la terre, ETS formation.",
      plansTitle: "Offres",
      plansLead: "Prix en euros. Achats via les stores (bientôt) — tu peux déjà tester les niveaux dans l’app.",
      freeStart: "pour démarrer",
      free1: "Alim, structure, borniers, disjoncteurs, différentiels, moulés, sectionneurs",
      free2: "Boutonnerie et commande sélectionnées, KM+FR, moteurs, LOGO!",
      free3: "KNX SwissDz de base, éclairage, prises, capteurs clés, compteurs numériques",
      free4: "Sans Fluke, ETS, PV ni schémas prédéfinis",
      silverName: "Argent",
      silverPrice: "0,99 € / mois",
      silverYear: "ou 8,99 € / an",
      silver1: "Toute la bibliothèque sauf l’appareil de mesure",
      silver2: "Photovoltaïque inclus",
      silver3: "Fluke + ETS + installations prédéfinies → Gold",
      goldName: "Gold",
      goldPrice: "1,69 € / mois",
      goldYear: "ou 14,99 € / an",
      gold1: "Tout Argent",
      gold2: "Fluke 1664 + accessoires mise à la terre",
      gold3: "ETS formation + installations prédéfinies",
      linksTitle: "Liens",
      linksLead: "Stores et contact.",
      soon: "Bientôt",
      contact: "Contact SwissDZ",
      write: "Écrire",
      privacy: "Confidentialité",
      read: "Lire",
      socialAria: "Suivez-nous sur nos réseaux",
      langAria: "Langue"
    },
    en: {
      title: "WireLab Pro by SwissDZ",
      desc: "WireLab Pro by SwissDZ: try the wiring online. Place the modules, pull the wires, hit Play.",
      heroTitle: "Electrical wiring, as on the job.",
      heroLead: "Place the modules, pull the wires, hit Play — current flows. Pro library, KNX, PV, Fluke.",
      testOnline: "Try WireLab online",
      testShort: "Try online",
      seeOffers: "See plans",
      tryLead: "Open the panel in the browser. Sign in with Google or your email, place the modules, pull the wires, then hit Play.",
      chipWire: "Real wiring",
      chipLib: "Pro library",
      shotsTitle: "Inside the app",
      shotsLead: "Real screens: wiring, library, protection devices.",
      altWire: "WireLab Pro by SwissDZ wiring",
      altLib: "Component library",
      altProt: "Protection devices and board",
      doTitle: "What you can do",
      doLead: "A digital workshop to train and check before the job site.",
      svc1t: "Wiring and simulation",
      svc1p: "Terminals, cross-sections, IEC colours, Play / Stop — current shows on the wires.",
      svc2t: "Pro library",
      svc2p: "Breakers, contactors, motors, control, SwissDz KNX, LOGO! PLC, PV…",
      svc3t: "Gold measurement",
      svc3p: "Fluke 1664 FC on the board, earthing accessories, ETS training.",
      plansTitle: "Plans",
      plansLead: "Prices in euros. Store purchases coming soon — you can already try the levels in the app.",
      freeStart: "to start",
      free1: "Supply, structure, terminals, breakers, RCDs, moulded-case, isolators",
      free2: "Selected pushbuttons and control, contactor + overload, motors, LOGO!",
      free3: "Basic SwissDz KNX, lighting, sockets, key sensors, digital meters",
      free4: "No Fluke, ETS, PV, or ready-made diagrams",
      silverName: "Silver",
      silverPrice: "€0.99 / month",
      silverYear: "or €8.99 / year",
      silver1: "The whole library except the test instrument",
      silver2: "Photovoltaics included",
      silver3: "Fluke + ETS + ready-made installations → Gold",
      goldName: "Gold",
      goldPrice: "€1.69 / month",
      goldYear: "or €14.99 / year",
      gold1: "Everything in Silver",
      gold2: "Fluke 1664 + earthing accessories",
      gold3: "ETS training + ready-made installations",
      linksTitle: "Links",
      linksLead: "Stores and contact.",
      soon: "Soon",
      contact: "Contact SwissDZ",
      write: "Write",
      privacy: "Privacy",
      read: "Read",
      socialAria: "Follow us",
      langAria: "Language"
    },
    es: {
      title: "WireLab Pro by SwissDZ",
      desc: "WireLab Pro by SwissDZ: prueba el cableado en línea. Coloca los módulos, tira los cables, pulsa Play.",
      heroTitle: "El cableado eléctrico, como en la obra.",
      heroLead: "Coloca los módulos, tira los cables, pulsa Play — la corriente circula. Biblioteca pro, KNX, PV, Fluke.",
      testOnline: "Probar WireLab en línea",
      testShort: "Probar en línea",
      seeOffers: "Ver los planes",
      tryLead: "Abre el panel en el navegador. Entra con Google o tu correo, coloca los módulos, tira los cables y pulsa Play.",
      chipWire: "Cableado real",
      chipLib: "Biblioteca pro",
      shotsTitle: "Dentro de la aplicación",
      shotsLead: "Capturas reales: cableado, biblioteca, protecciones.",
      altWire: "Cableado WireLab Pro by SwissDZ",
      altLib: "Biblioteca de componentes",
      altProt: "Protecciones y cuadro",
      doTitle: "Qué puedes hacer",
      doLead: "Un taller digital para formarte y comprobar antes de la obra.",
      svc1t: "Cableado y simulación",
      svc1p: "Bornes, secciones, colores IEC, Play / Stop — la corriente se ve en los cables.",
      svc2t: "Biblioteca pro",
      svc2p: "Interruptores, contactores, motores, mando, KNX SwissDz, PLC LOGO!, PV…",
      svc3t: "Medida Gold",
      svc3p: "Fluke 1664 FC en el plano, accesorios de puesta a tierra, formación ETS.",
      plansTitle: "Planes",
      plansLead: "Precios en euros. Compras en las tiendas (pronto) — ya puedes probar los niveles en la app.",
      freeStart: "para empezar",
      free1: "Alimentación, estructura, bornes, interruptores, diferenciales, caja moldeada, seccionadores",
      free2: "Pulsadores y mando seleccionados, contactor + térmico, motores, LOGO!",
      free3: "KNX SwissDz básico, iluminación, tomas, sensores clave, contadores digitales",
      free4: "Sin Fluke, ETS, PV ni esquemas preparados",
      silverName: "Plata",
      silverPrice: "0,99 € / mes",
      silverYear: "o 8,99 € / año",
      silver1: "Toda la biblioteca salvo el aparato de medida",
      silver2: "Fotovoltaica incluida",
      silver3: "Fluke + ETS + instalaciones preparadas → Gold",
      goldName: "Gold",
      goldPrice: "1,69 € / mes",
      goldYear: "o 14,99 € / año",
      gold1: "Todo Plata",
      gold2: "Fluke 1664 + accesorios de puesta a tierra",
      gold3: "Formación ETS + instalaciones preparadas",
      linksTitle: "Enlaces",
      linksLead: "Tiendas y contacto.",
      soon: "Pronto",
      contact: "Contacto SwissDZ",
      write: "Escribir",
      privacy: "Privacidad",
      read: "Leer",
      socialAria: "Síguenos",
      langAria: "Idioma"
    },
    ar: {
      title: "WireLab Pro by SwissDZ",
      desc: "WireLab Pro by SwissDZ: جرّب التمديد عبر الإنترنت. ضع الوحدات، اسحب الأسلاك، شغّل Play.",
      heroTitle: "التمديد الكهربائي، كما في الورشة.",
      heroLead: "ضع الوحدات، اسحب الأسلاك، شغّل Play — التيار يمر. مكتبة احترافية، KNX، PV، Fluke.",
      testOnline: "جرّب WireLab عبر الإنترنت",
      testShort: "تجربة عبر الإنترنت",
      seeOffers: "عرض العروض",
      tryLead: "افتح اللوحة في المتصفح. ادخل بحساب Google أو بريدك، ضع الوحدات، اسحب الأسلاك، ثم شغّل Play.",
      chipWire: "تمديد حقيقي",
      chipLib: "مكتبة احترافية",
      shotsTitle: "داخل التطبيق",
      shotsLead: "لقطات حقيقية: التمديد، المكتبة، الحمايات.",
      altWire: "تمديد WireLab Pro by SwissDZ",
      altLib: "مكتبة المكونات",
      altProt: "الحمايات واللوحة",
      doTitle: "ماذا يمكنك أن تفعل",
      doLead: "ورشة رقمية للتدرّب والتحقق قبل الميدان.",
      svc1t: "التمديد والمحاكاة",
      svc1p: "أطراف، مقاطع، ألوان IEC، Play / Stop — التيار يظهر على الأسلاك.",
      svc2t: "مكتبة احترافية",
      svc2p: "قواطع، كونتاكتورات، محركات، تحكم، KNX SwissDz، PLC LOGO!، PV…",
      svc3t: "قياس Gold",
      svc3p: "Fluke 1664 FC على المخطط، ملحقات التأريض، تكوين ETS.",
      plansTitle: "العروض",
      plansLead: "الأسعار باليورو. الشراء من المتاجر قريبًا — يمكنك تجربة المستويات في التطبيق الآن.",
      freeStart: "للبداية",
      free1: "تغذية، هيكل، أطراف، قواطع، تفاضليات، قواطع مقولبة، فواصل",
      free2: "أزرار وتحكم مختارة، كونتاكتور + حراري، محركات، LOGO!",
      free3: "KNX SwissDz الأساسي، إضاءة، مآخذ، حساسات أساسية، عدادات رقمية",
      free4: "بدون Fluke وETS وPV ومخططات جاهزة",
      silverName: "فضي",
      silverPrice: "0,99 € / شهر",
      silverYear: "أو 8,99 € / سنة",
      silver1: "كل المكتبة ما عدا جهاز القياس",
      silver2: "الطاقة الشمسية مشمولة",
      silver3: "Fluke + ETS + تركيبات جاهزة → Gold",
      goldName: "Gold",
      goldPrice: "1,69 € / شهر",
      goldYear: "أو 14,99 € / سنة",
      gold1: "كل الفضي",
      gold2: "Fluke 1664 + ملحقات التأريض",
      gold3: "تكوين ETS + تركيبات جاهزة",
      linksTitle: "روابط",
      linksLead: "المتاجر والتواصل.",
      soon: "قريبًا",
      contact: "تواصل SwissDZ",
      write: "اكتب",
      privacy: "الخصوصية",
      read: "اقرأ",
      socialAria: "تابعنا",
      langAria: "اللغة"
    }
  };

  function panelLang(lang) {
    return lang === "es" ? "en" : lang;
  }

  function apply(lang) {
    if (!DICT[lang]) lang = "fr";
    var pack = DICT[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = pack.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", pack.desc);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (pack[key] != null) el.textContent = pack[key];
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (pack[key] != null) el.alt = pack[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (pack[key] != null) el.setAttribute("aria-label", pack[key]);
    });
    var nav = document.querySelector(".langs");
    if (nav && pack.langAria) nav.setAttribute("aria-label", pack.langAria);
    var href = "swissdz-panel/index.html?lang=" + panelLang(lang);
    document.querySelectorAll("[data-panel]").forEach(function (a) {
      a.setAttribute("href", href);
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try {
      localStorage.setItem(KEY, lang);
      localStorage.setItem("panelwire-lang", panelLang(lang));
    } catch (e) {}
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(btn.getAttribute("data-set-lang"));
    });
  });

  var start = "fr";
  try {
    var saved = localStorage.getItem(KEY);
    if (saved && DICT[saved]) start = saved;
    else {
      var navLang = (navigator.language || "fr").slice(0, 2).toLowerCase();
      if (DICT[navLang]) start = navLang;
    }
  } catch (e) {}
  apply(start);
})();

/**
 * script.js – Météo Burkina Faso
 * Charge les données via l'API Flask et initialise 5 graphiques Chart.js
 */

"use strict";

// ── Palette de couleurs par ville ──────────────────────────────────────────
const PALETTE = {
  "Ouagadougou":   { border: "#009A00", bg: "rgba(0,154,0,.15)" },
  "Bobo-Dioulasso":{ border: "#1565C0", bg: "rgba(21,101,192,.15)" },
  "Dedougou":      { border: "#E65100", bg: "rgba(230,81,0,.15)" },
  "Dori":          { border: "#6A1B9A", bg: "rgba(106,27,154,.15)" },
  "Fada N'Gourma": { border: "#AD1457", bg: "rgba(173,20,87,.15)" },
  "Gaoua":         { border: "#00838F", bg: "rgba(0,131,143,.15)" },
};

function couleur(ville, opacity) {
  const c = PALETTE[ville] || { border: "#888", bg: "rgba(136,136,136,.15)" };
  return opacity ? c.bg : c.border;
}

// ── Noms des mois ──────────────────────────────────────────────────────────
const MOIS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

// ── Références jour de l'année ─────────────────────────────────────────────
const DOY_MAI  = 121;
const DOY_JUIN = 152;
const DOY_JUIL = 182;

// ── Données agronomiques des cultures ─────────────────────────────────────
const CULTURES = {
  "Maïs": {
    icon: "🌽",
    besoins_eau: "500–800 mm/saison",
    temp_optimale: "18–32°C",
    cycle_jours: "90–120 jours",
    semis_mois: [4, 5],      // indices 0-based (4=Mai, 5=Juin)
    recolte_mois: [7, 8],    // (7=Août, 8=Sep)
    semis_label: "Mai – mi-Juin",
    recolte_label: "Août – Septembre",
    notes: "Sensible à la sécheresse pendant la floraison (juillet). Besoin de 5 mm/jour minimum au moment du semis.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Déconseillé", classe: "v-non" },
    },
  },
  "Sorgho": {
    icon: "🌾",
    besoins_eau: "350–600 mm/saison",
    temp_optimale: "25–35°C",
    cycle_jours: "90–130 jours",
    semis_mois: [5, 6],
    recolte_mois: [8, 9],
    semis_label: "Juin – Juillet",
    recolte_label: "Septembre – Octobre",
    notes: "Très résistant à la chaleur et aux périodes sèches. Culture principale au Sahel burkinabè.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },
  "Mil": {
    icon: "🌿",
    besoins_eau: "200–400 mm/saison",
    temp_optimale: "25–35°C",
    cycle_jours: "75–90 jours",
    semis_mois: [5, 6],
    recolte_mois: [8, 9],
    semis_label: "Juin – Juillet",
    recolte_label: "Septembre – Octobre",
    notes: "Culture la plus adaptée aux zones sahéliennes. Résiste aux longues sécheresses grâce à ses racines profondes.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Bon",       classe: "v-bon"   },
      "Gaoua":          { note: "Bon",       classe: "v-bon"   },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Excellent", classe: "v-excel" },
    },
  },
  "Riz": {
    icon: "🍚",
    besoins_eau: "800–1200 mm/saison",
    temp_optimale: "20–35°C",
    cycle_jours: "100–150 jours",
    semis_mois: [5, 6],
    recolte_mois: [9, 10],
    semis_label: "Juin – Juillet",
    recolte_label: "Octobre – Novembre",
    notes: "Nécessite beaucoup d'eau. Viable en pluvial uniquement au Sud (>1000 mm/an). Irrigation nécessaire au Centre et au Nord.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Bon (pluvial)",      classe: "v-bon"   },
      "Gaoua":          { note: "Excellent",           classe: "v-excel" },
      "Ouagadougou":    { note: "Irrigué seulement",   classe: "v-moyen" },
      "Dedougou":       { note: "Irrigué seulement",   classe: "v-moyen" },
      "Fada N'Gourma":  { note: "Irrigué seulement",   classe: "v-moyen" },
      "Dori":           { note: "Déconseillé",         classe: "v-non"   },
    },
  },
  "Bissap": {
    icon: "🌺",
    besoins_eau: "400–600 mm/saison",
    temp_optimale: "24–35°C",
    cycle_jours: "120–150 jours",
    semis_mois: [6, 7],
    recolte_mois: [10, 11],
    semis_label: "Juillet – Août",
    recolte_label: "Novembre – Décembre",
    notes: "Culture de rente à fort potentiel économique. Se sème après la mise en place de la saison des pluies. Sensible à l'excès d'eau.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },
};

// ── Variables globales ─────────────────────────────────────────────────────
let DATA        = {};
let villeActive = "Toutes";
let charts      = {};

// ── Chargement initial ─────────────────────────────────────────────────────
async function chargerDonnees() {
  const [stats, cumul, clim, temps, anom, saison, villes] = await Promise.all([
    fetch("/api/stats").then(r => r.json()),
    fetch("/api/cumul_annuel").then(r => r.json()),
    fetch("/api/climatologie").then(r => r.json()),
    fetch("/api/temperatures").then(r => r.json()),
    fetch("/api/anomalies").then(r => r.json()),
    fetch("/api/debut_saison").then(r => r.json()),
    fetch("/api/villes").then(r => r.json()),
  ]);

  DATA = { stats, cumul, clim, temps, anom, saison, villes };

  construireFiltres();
  construireSelectClim();
  mettreAJourHero();
  construireTableau();
  initTousLesGraphiques();
  initRechercheCulture();
  document.getElementById("loading").style.display = "none";
}

// ── Hero stats ─────────────────────────────────────────────────────────────
function mettreAJourHero() {
  const vals = Object.values(DATA.stats);
  const pluieMoy = (vals.reduce((s, v) => s + v.pluie_annuelle_moy, 0) / vals.length).toFixed(0);
  const tmaxMoy  = (vals.reduce((s, v) => s + v.tmax_moy, 0) / vals.length).toFixed(1);
  document.getElementById("hero-pluie").textContent = pluieMoy;
  document.getElementById("hero-tmax").textContent  = tmaxMoy + "°";
}

// ── Filtres villes ─────────────────────────────────────────────────────────
function construireFiltres() {
  const container = document.getElementById("btn-villes");
  ["Toutes", ...DATA.villes].forEach(v => {
    const btn = document.createElement("button");
    btn.className = "btn-ville" + (v === "Toutes" ? " active" : "");
    btn.textContent = v;
    btn.addEventListener("click", () => changerVille(v));
    container.appendChild(btn);
  });
}

function changerVille(ville) {
  villeActive = ville;
  document.querySelectorAll(".btn-ville").forEach(b => {
    b.classList.toggle("active", b.textContent === ville);
  });

  // Sync dropdown climatologie
  const sel = document.getElementById("selectVilleClim");
  if (ville !== "Toutes") {
    sel.value = ville;
    mettreAJourClim(ville);
  } else {
    mettreAJourClim(sel.value);
  }

  mettreAJourCumul();   // FIX graphique 1
  mettreAJourTemp();
  mettreAJourSaison();
}

// ── Select climatologie ────────────────────────────────────────────────────
function construireSelectClim() {
  const sel = document.getElementById("selectVilleClim");
  DATA.villes.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", e => mettreAJourClim(e.target.value));
}

// ── Tableau récap ──────────────────────────────────────────────────────────
function construireTableau() {
  const tbody = document.getElementById("statsTableBody");
  DATA.villes.forEach(v => {
    const s = DATA.stats[v];
    tbody.innerHTML += `
      <tr>
        <td><strong>${v}</strong></td>
        <td>${s.pluie_annuelle_moy} mm</td>
        <td>${s.tmax_moy} °C</td>
        <td>${s.tmin_moy} °C</td>
        <td>${s.humidite_moy} %</td>
      </tr>`;
  });
}

// ── Utilitaires Chart.js ───────────────────────────────────────────────────
function defaultOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: "index", intersect: false },
    },
    ...extra,
  };
}

// ── Chart 1 : Cumul annuel ─────────────────────────────────────────────────
function initChartCumul() {
  const annees = Object.keys(Object.values(DATA.cumul)[0]).sort();
  const datasets = DATA.villes.map(v => ({
    label: v,
    data: annees.map(a => DATA.cumul[v][a] ?? null),
    borderColor: couleur(v),
    backgroundColor: couleur(v, true),
    borderWidth: 2,
    pointRadius: 3,
    tension: .3,
    fill: false,
  }));

  charts.cumul = new Chart(document.getElementById("chartCumul"), {
    type: "line",
    data: { labels: annees, datasets },
    options: defaultOptions({
      scales: {
        x: { title: { display: true, text: "Année" } },
        y: { title: { display: true, text: "mm" }, beginAtZero: true },
      },
    }),
  });
}

// FIX : filtre ville appliqué au cumul annuel
function mettreAJourCumul() {
  if (!charts.cumul) return;
  const villes = villeActive === "Toutes" ? DATA.villes : [villeActive];
  charts.cumul.data.datasets.forEach(ds => {
    ds.hidden = !villes.includes(ds.label);
  });
  charts.cumul.update();
}

// ── Chart 2 : Climatologie mensuelle ──────────────────────────────────────
function initChartClim() {
  const villeInit = DATA.villes[0];
  const vals = Object.values(DATA.clim[villeInit]);

  charts.clim = new Chart(document.getElementById("chartClim"), {
    type: "bar",
    data: {
      labels: MOIS,
      datasets: [{
        label: villeInit,
        data: vals,
        backgroundColor: MOIS.map((_, i) =>
          (i === 4 || i === 5) ? "rgba(230,81,0,.75)" : "rgba(0,154,0,.65)"
        ),
        borderColor: MOIS.map((_, i) =>
          (i === 4 || i === 5) ? "#E65100" : "#009A00"
        ),
        borderWidth: 1.5,
        borderRadius: 4,
      }],
    },
    options: defaultOptions({
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(2)} mm/jour` } },
      },
      scales: {
        x: { title: { display: true, text: "Mois" } },
        y: { title: { display: true, text: "mm/jour" }, beginAtZero: true },
      },
    }),
  });
}

function mettreAJourClim(ville) {
  if (!charts.clim) return;
  const data = DATA.clim[ville] || DATA.clim[DATA.villes[0]];
  charts.clim.data.datasets[0].data  = Object.values(data);
  charts.clim.data.datasets[0].label = ville;
  charts.clim.update();
}

// ── Chart 3 : Températures max ─────────────────────────────────────────────
function initChartTemp() {
  const annees = Object.keys(Object.values(DATA.temps)[0]).sort();
  const datasets = DATA.villes.map(v => ({
    label: v,
    data: annees.map(a => DATA.temps[v][a] ?? null),
    borderColor: couleur(v),
    backgroundColor: couleur(v, true),
    borderWidth: 2,
    pointRadius: 3,
    tension: .3,
    fill: false,
  }));

  charts.temp = new Chart(document.getElementById("chartTemp"), {
    type: "line",
    data: { labels: annees, datasets },
    options: defaultOptions({
      scales: {
        x: { title: { display: true, text: "Année" } },
        y: { title: { display: true, text: "°C" } },
      },
    }),
  });
}

function mettreAJourTemp() {
  if (!charts.temp) return;
  const villes = villeActive === "Toutes" ? DATA.villes : [villeActive];
  charts.temp.data.datasets.forEach(ds => {
    ds.hidden = !villes.includes(ds.label);
  });
  charts.temp.update();
}

// ── Chart 4 : Anomalies (toujours national) ────────────────────────────────
function initChartAnom() {
  const annees = Object.keys(DATA.anom).sort();
  const vals   = annees.map(a => DATA.anom[a]);

  charts.anom = new Chart(document.getElementById("chartAnom"), {
    type: "bar",
    data: {
      labels: annees,
      datasets: [{
        label: "Anomalie (%)",
        data: vals,
        backgroundColor: vals.map(v => v >= 0 ? "rgba(21,101,192,.7)" : "rgba(211,47,47,.7)"),
        borderColor:      vals.map(v => v >= 0 ? "#1565C0" : "#D32F2F"),
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: defaultOptions({
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)} %` } },
      },
      scales: {
        x: { title: { display: true, text: "Année" } },
        y: {
          title: { display: true, text: "Anomalie (%)" },
          grid: { color: ctx => ctx.tick.value === 0 ? "#333" : "rgba(0,0,0,.06)" },
        },
      },
    }),
  });
}

// ── Chart 5 : Début de saison ──────────────────────────────────────────────
function initChartSaison() {
  const annees = Object.keys(Object.values(DATA.saison)[0]).sort();

  const datasets = DATA.villes.map(v => ({
    label: v,
    data: annees.map(a => DATA.saison[v]?.[a] ?? null),
    borderColor: couleur(v),
    backgroundColor: couleur(v, true),
    borderWidth: 2,
    pointRadius: 4,
    tension: .2,
    fill: false,
    spanGaps: true,
  }));

  const refLines = [
    { doy: DOY_MAI,  label: "1 Mai",     color: "#aaa" },
    { doy: DOY_JUIN, label: "1 Juin",    color: "#999" },
    { doy: DOY_JUIL, label: "1 Juillet", color: "#777" },
  ].map(r => ({
    label: r.label,
    data: annees.map(() => r.doy),
    borderColor: r.color,
    borderWidth: 1,
    borderDash: [6, 4],
    pointRadius: 0,
    fill: false,
    tension: 0,
  }));

  charts.saison = new Chart(document.getElementById("chartSaison"), {
    type: "line",
    data: { labels: annees, datasets: [...datasets, ...refLines] },
    options: defaultOptions({
      scales: {
        x: { title: { display: true, text: "Année" } },
        y: {
          title: { display: true, text: "Jour de l'année" },
          min: 100, max: 230,
          ticks: {
            callback(val) {
              const labels = { 121: "1 Mai", 152: "1 Juin", 182: "1 Juillet" };
              return labels[val] ?? val;
            },
            stepSize: 10,
          },
          grid: {
            color: ctx => [DOY_MAI, DOY_JUIN, DOY_JUIL].includes(ctx.tick.value)
              ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.05)",
          },
        },
      },
    }),
  });
}

function mettreAJourSaison() {
  if (!charts.saison) return;
  const villes = villeActive === "Toutes" ? DATA.villes : [villeActive];
  const refLabels = ["1 Mai", "1 Juin", "1 Juillet"];
  charts.saison.data.datasets.forEach(ds => {
    if (refLabels.includes(ds.label)) return;
    ds.hidden = !villes.includes(ds.label);
  });
  charts.saison.update();
}

// ── Initialisation globale ─────────────────────────────────────────────────
function initTousLesGraphiques() {
  initChartCumul();
  initChartClim();
  initChartTemp();
  initChartAnom();
  initChartSaison();
}

// ══════════════════════════════════════════════════════════════════════════
// RECHERCHE CULTURALE
// ══════════════════════════════════════════════════════════════════════════

function initRechercheCulture() {
  const container = document.getElementById("culture-buttons");
  Object.keys(CULTURES).forEach(nom => {
    const c = CULTURES[nom];
    const btn = document.createElement("button");
    btn.className = "btn-culture";
    btn.innerHTML = `${c.icon} ${nom}`;
    btn.addEventListener("click", () => afficherCulture(nom, btn));
    container.appendChild(btn);
  });
}

function afficherCulture(nom, btnClique) {
  // Toggle si déjà actif
  const result = document.getElementById("culture-result");
  const dejActif = btnClique.classList.contains("active");

  document.querySelectorAll(".btn-culture").forEach(b => b.classList.remove("active"));

  if (dejActif) {
    result.innerHTML = "";
    result.classList.remove("visible");
    return;
  }

  btnClique.classList.add("active");
  const c = CULTURES[nom];

  // Calendrier mensuel (barres colorées)
  const calendrier = MOIS.map((mois, i) => {
    let classe = "cal-vide";
    if (c.semis_mois.includes(i))   classe = "cal-semis";
    if (c.recolte_mois.includes(i)) classe = "cal-recolte";
    return `<div class="cal-mois ${classe}">
              <div class="cal-label">${mois}</div>
              <div class="cal-barre"></div>
              ${classe !== "cal-vide" ? `<div class="cal-tag">${classe === "cal-semis" ? "Semis" : "Récolte"}</div>` : ""}
            </div>`;
  }).join("");

  // Viabilité par ville
  const viabilite = Object.entries(c.viabilite).map(([ville, v]) => `
    <div class="viab-item">
      <span class="viab-ville">${ville}</span>
      <span class="viab-note ${v.classe}">${v.note}</span>
    </div>`).join("");

  result.innerHTML = `
    <div class="culture-card">
      <div class="culture-card-header">
        <span class="culture-icon">${c.icon}</span>
        <div>
          <div class="culture-nom">${nom}</div>
          <div class="culture-meta">
            💧 ${c.besoins_eau} &nbsp;|&nbsp; 🌡️ ${c.temp_optimale} &nbsp;|&nbsp; ⏱️ Cycle ${c.cycle_jours}
          </div>
        </div>
      </div>

      <div class="culture-periodes">
        <div class="periode-item semis">
          <div class="periode-label">🌱 Semis</div>
          <div class="periode-val">${c.semis_label}</div>
        </div>
        <div class="periode-item recolte">
          <div class="periode-label">🌾 Récolte</div>
          <div class="periode-val">${c.recolte_label}</div>
        </div>
      </div>

      <div class="culture-calendrier">
        <div class="cal-titre">Calendrier cultural</div>
        <div class="cal-grille">${calendrier}</div>
        <div class="cal-legende">
          <span class="leg-semis">Semis</span>
          <span class="leg-recolte">Récolte</span>
        </div>
      </div>

      <div class="culture-viabilite">
        <div class="viab-titre">Viabilité par ville</div>
        <div class="viab-grille">${viabilite}</div>
      </div>

      <div class="culture-note">
        <strong>Note agronomique :</strong> ${c.notes}
      </div>
    </div>`;

  result.classList.add("visible");
}

// ── Démarrage ──────────────────────────────────────────────────────────────
chargerDonnees().catch(err => {
  console.error("Erreur de chargement :", err);
  document.getElementById("loading").innerHTML =
    `<p style="color:#c00;font-size:1rem;">Erreur de chargement des données.<br>
     Assurez-vous que le serveur Flask est démarré.</p>`;
});

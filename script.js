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

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const DOY_MAI  = 121;
const DOY_JUIN = 152;
const DOY_JUIL = 182;

// ══════════════════════════════════════════════════════════════════════════
// BASE DE DONNÉES AGRONOMIQUE — CULTURES DU BURKINA FASO
// Sources : FAO, CILSS, INERA Burkina, ICRISAT
// ══════════════════════════════════════════════════════════════════════════

const CULTURES_DB = {

  // ── CÉRÉALES ───────────────────────────────────────────────────────────

  "Maïs": {
    icon: "🌽", categorie: "Céréale",
    besoins_eau: "500–800 mm/saison", temp_optimale: "18–32°C", cycle_jours: "90–120 jours",
    semis_mois: [4, 5], recolte_mois: [7, 8],
    semis_label: "Mai – mi-Juin", recolte_label: "Août – Septembre",
    notes: "Sensible à la sécheresse pendant la floraison (juillet). Nécessite au minimum 5 mm/jour au semis. Déconseillé à Dori où les pluies sont insuffisantes.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent",    classe: "v-excel" },
      "Gaoua":          { note: "Excellent",    classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",          classe: "v-bon"   },
      "Dedougou":       { note: "Bon",          classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",          classe: "v-bon"   },
      "Dori":           { note: "Déconseillé",  classe: "v-non"   },
    },
  },

  "Sorgho": {
    icon: "🌾", categorie: "Céréale",
    besoins_eau: "350–600 mm/saison", temp_optimale: "25–35°C", cycle_jours: "90–130 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Culture pilier du Burkina. Très résistant à la chaleur et aux sécheresses courtes. Peut pousser dans tous les types de sols. Cultivé dans toutes les zones.",
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
    icon: "🌿", categorie: "Céréale",
    besoins_eau: "200–400 mm/saison", temp_optimale: "25–35°C", cycle_jours: "75–90 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Culture la plus adaptée au Sahel burkinabè. Résiste aux sécheresses grâce à ses racines profondes. Culture de sécurité alimentaire essentielle dans le Nord.",
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
    icon: "🍚", categorie: "Céréale",
    besoins_eau: "800–1200 mm/saison", temp_optimale: "20–35°C", cycle_jours: "100–150 jours",
    semis_mois: [5, 6], recolte_mois: [9, 10],
    semis_label: "Juin – Juillet", recolte_label: "Octobre – Novembre",
    notes: "Viable en pluvial uniquement au Sud (>1000 mm/an). Irrigation nécessaire au Centre et au Nord. Zones aménagées : périmètres irrigués de Bagré, Sourou, Kompienga.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Bon (pluvial)",    classe: "v-bon"   },
      "Gaoua":          { note: "Excellent",         classe: "v-excel" },
      "Ouagadougou":    { note: "Irrigué seulement", classe: "v-moyen" },
      "Dedougou":       { note: "Irrigué seulement", classe: "v-moyen" },
      "Fada N'Gourma":  { note: "Irrigué seulement", classe: "v-moyen" },
      "Dori":           { note: "Déconseillé",       classe: "v-non"   },
    },
  },

  "Fonio": {
    icon: "🌱", categorie: "Céréale",
    besoins_eau: "300–500 mm/saison", temp_optimale: "25–35°C", cycle_jours: "70–90 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Août – Septembre",
    notes: "Céréale ancienne très nutritive. Pousse sur des sols pauvres et dégradés où d'autres cultures échouent. Potentiel export en hausse grâce à l'engouement pour les super-céréales.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  // ── LÉGUMINEUSES ───────────────────────────────────────────────────────

  "Niébé": {
    icon: "🫘", categorie: "Légumineuse",
    besoins_eau: "300–500 mm/saison", temp_optimale: "25–35°C", cycle_jours: "60–90 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Août – Septembre",
    notes: "Haricot à œil noir, pilier de l'alimentation burkinabè. Fixe l'azote dans le sol (améliore la fertilité). Cycle court permettant une double culture dans le Sud.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Arachide": {
    icon: "🥜", categorie: "Légumineuse",
    besoins_eau: "400–600 mm/saison", temp_optimale: "25–30°C", cycle_jours: "90–120 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Culture vivrière et de rente importante. Sensible à l'excès d'eau. Préfère les sols sablonneux bien drainés. L'huile d'arachide est un produit clé au Burkina.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Bon",       classe: "v-bon"   },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Soja": {
    icon: "🟢", categorie: "Légumineuse",
    besoins_eau: "450–700 mm/saison", temp_optimale: "20–30°C", cycle_jours: "90–130 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Culture en expansion au Burkina pour la transformation locale (huile, farine). Nécessite une inoculation rhizobium pour une bonne fixation d'azote. Marché en croissance.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Voandzou": {
    icon: "🫙", categorie: "Légumineuse",
    besoins_eau: "300–500 mm/saison", temp_optimale: "20–30°C", cycle_jours: "90–150 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Pois bambara — légumineuse traditionnelle très résistante à la sécheresse. Très nutritif. Pousse sur sols pauvres. Consommé bouilli ou grillé. Culture de sécurité.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Pois d'angole": {
    icon: "🌿", categorie: "Légumineuse",
    besoins_eau: "600–1000 mm/saison", temp_optimale: "18–30°C", cycle_jours: "150–180 jours",
    semis_mois: [4, 5], recolte_mois: [10, 11],
    semis_label: "Mai – Juin", recolte_label: "Novembre – Décembre",
    notes: "Arbrisseau pérenne à cycle long. Excellent pour la restauration des sols dégradés. Feuilles utilisées comme fourrage. Graines vendues comme légumineuse de rente.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  // ── TUBERCULES ─────────────────────────────────────────────────────────

  "Igname": {
    icon: "🍠", categorie: "Tubercule",
    besoins_eau: "900–1200 mm/saison", temp_optimale: "25–30°C", cycle_jours: "150–240 jours",
    semis_mois: [3, 4], recolte_mois: [9, 10],
    semis_label: "Avril – Mai", recolte_label: "Octobre – Novembre",
    notes: "Principalement cultivée dans les zones soudaniennes humides (Gaoua, Bobo). Nécessite un sol profond et bien drainé. Culture à forte valeur nutritive et économique.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent",   classe: "v-excel" },
      "Gaoua":          { note: "Excellent",   classe: "v-excel" },
      "Ouagadougou":    { note: "Possible",    classe: "v-moyen" },
      "Dedougou":       { note: "Possible",    classe: "v-moyen" },
      "Fada N'Gourma":  { note: "Possible",    classe: "v-moyen" },
      "Dori":           { note: "Déconseillé", classe: "v-non"   },
    },
  },

  "Manioc": {
    icon: "🌿", categorie: "Tubercule",
    besoins_eau: "500–1000 mm/saison", temp_optimale: "25–29°C", cycle_jours: "270–365 jours",
    semis_mois: [4, 5], recolte_mois: [9, 10],
    semis_label: "Avril – Juin (boutures)", recolte_label: "12 à 18 mois après la plantation",
    notes: "Culture vivace tolérante à la sécheresse une fois établie. Les feuilles sont consommées comme légume. Culture de sécurité alimentaire. Propagation par boutures.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Patate douce": {
    icon: "🍠", categorie: "Tubercule",
    besoins_eau: "400–700 mm/saison", temp_optimale: "21–26°C", cycle_jours: "90–120 jours",
    semis_mois: [5, 6], recolte_mois: [8, 9],
    semis_label: "Juin – Juillet", recolte_label: "Septembre – Octobre",
    notes: "Culture polyvalente, feuilles et tubercules consommés. Cycle court adapté aux zones humides. La variété orange (riche en vitamine A) est promue dans les programmes nutritionnels.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  // ── MARAÎCHAGE ─────────────────────────────────────────────────────────

  "Tomate": {
    icon: "🍅", categorie: "Maraîchage",
    besoins_eau: "400–600 mm/saison", temp_optimale: "18–27°C", cycle_jours: "60–90 jours",
    semis_mois: [9, 10], recolte_mois: [11, 0],
    semis_label: "Octobre – Novembre (saison sèche)", recolte_label: "Décembre – Janvier",
    notes: "Cultivée principalement en saison sèche sous irrigation. La chaleur excessive de mars-avril réduit la nouaison. Culture maraîchère la plus commercialisée au Burkina.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Oignon": {
    icon: "🧅", categorie: "Maraîchage",
    besoins_eau: "350–500 mm/saison", temp_optimale: "13–24°C", cycle_jours: "90–120 jours",
    semis_mois: [9, 10], recolte_mois: [1, 2],
    semis_label: "Octobre – Novembre", recolte_label: "Février – Mars",
    notes: "Culture de saison sèche sous irrigation. Importante culture de rente. La région de Tamalé (vallée du Sourou) est le principal bassin de production. Exportation vers les pays côtiers.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Bon",       classe: "v-bon"   },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Gombo": {
    icon: "🌿", categorie: "Maraîchage",
    besoins_eau: "400–600 mm/saison", temp_optimale: "25–35°C", cycle_jours: "50–65 jours",
    semis_mois: [4, 5], recolte_mois: [7, 8],
    semis_label: "Mai – Juin", recolte_label: "Juillet – Août",
    notes: "Très résistant à la chaleur. Légume sauce essentiel dans la cuisine burkinabè. Cycle très court permettant plusieurs récoltes par saison. Feuilles et fruits consommés.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Aubergine locale": {
    icon: "🍆", categorie: "Maraîchage",
    besoins_eau: "350–500 mm/saison", temp_optimale: "22–32°C", cycle_jours: "70–100 jours",
    semis_mois: [4, 5], recolte_mois: [7, 8],
    semis_label: "Mai – Juin", recolte_label: "Juillet – Août",
    notes: "L'aubergine locale (petite et ronde) est bien adaptée aux conditions sahéliennes. Moins exigeante que l'aubergine importée. Consommée en sauce dans tout le pays.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Piment": {
    icon: "🌶️", categorie: "Maraîchage",
    besoins_eau: "400–600 mm/saison", temp_optimale: "20–30°C", cycle_jours: "70–90 jours",
    semis_mois: [9, 10], recolte_mois: [11, 0],
    semis_label: "Octobre – Novembre", recolte_label: "Décembre – Janvier",
    notes: "Cultivé principalement en saison sèche sous irrigation. Très bon potentiel de conservation (séchage). Marché local fort et exportation possible vers les pays de la région.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Chou": {
    icon: "🥬", categorie: "Maraîchage",
    besoins_eau: "380–500 mm/saison", temp_optimale: "15–20°C", cycle_jours: "60–90 jours",
    semis_mois: [9, 10], recolte_mois: [11, 0],
    semis_label: "Octobre – Novembre", recolte_label: "Décembre – Janvier",
    notes: "Sensible à la chaleur. Cultivé exclusivement en saison fraîche (décembre–février). Irrigation indispensable. Production concentrée autour des grandes villes.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Bon",       classe: "v-bon"   },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Pastèque": {
    icon: "🍉", categorie: "Maraîchage",
    besoins_eau: "400–600 mm/saison", temp_optimale: "25–30°C", cycle_jours: "70–90 jours",
    semis_mois: [10, 11], recolte_mois: [1, 2],
    semis_label: "Novembre – Décembre", recolte_label: "Janvier – Février",
    notes: "Culture lucrative de saison sèche. Tolère la chaleur mais pas le froid. Cultivée sur berges de cours d'eau ou sous irrigation. Bonne demande sur les marchés urbains.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Bon",       classe: "v-bon"   },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Concombre": {
    icon: "🥒", categorie: "Maraîchage",
    besoins_eau: "300–500 mm/saison", temp_optimale: "24–32°C", cycle_jours: "45–60 jours",
    semis_mois: [9, 10], recolte_mois: [11, 0],
    semis_label: "Octobre – Novembre", recolte_label: "Novembre – Décembre",
    notes: "Cycle très court. Culture de contre-saison très rentable. Très apprécié sur les marchés urbains. Peut être cultivé deux fois par saison sèche.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  // ── CULTURES DE RENTE ──────────────────────────────────────────────────

  "Coton": {
    icon: "🌼", categorie: "Culture de rente",
    besoins_eau: "700–1200 mm/saison", temp_optimale: "18–30°C", cycle_jours: "150–180 jours",
    semis_mois: [4, 5], recolte_mois: [9, 10],
    semis_label: "Mai – Juin", recolte_label: "Octobre – Novembre",
    notes: "Première culture de rente du Burkina Faso. La SOFITEX encadre la production dans l'Ouest. Nécessite un bon suivi phytosanitaire. Source de revenus essentiels pour les familles rurales.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent",   classe: "v-excel" },
      "Gaoua":          { note: "Excellent",   classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",         classe: "v-bon"   },
      "Dedougou":       { note: "Excellent",   classe: "v-excel" },
      "Fada N'Gourma":  { note: "Bon",         classe: "v-bon"   },
      "Dori":           { note: "Déconseillé", classe: "v-non"   },
    },
  },

  "Sésame": {
    icon: "🌻", categorie: "Culture de rente",
    besoins_eau: "300–500 mm/saison", temp_optimale: "25–35°C", cycle_jours: "80–100 jours",
    semis_mois: [6, 7], recolte_mois: [9, 10],
    semis_label: "Juillet – Août", recolte_label: "Octobre – Novembre",
    notes: "Culture de rente en forte expansion. Le Burkina est l'un des premiers exportateurs africains de sésame. Très résistant à la sécheresse. Bon complément au coton.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Excellent", classe: "v-excel" },
      "Dedougou":       { note: "Excellent", classe: "v-excel" },
      "Fada N'Gourma":  { note: "Excellent", classe: "v-excel" },
      "Dori":           { note: "Bon",       classe: "v-bon"   },
    },
  },

  "Bissap": {
    icon: "🌺", categorie: "Culture de rente",
    besoins_eau: "400–600 mm/saison", temp_optimale: "24–35°C", cycle_jours: "120–150 jours",
    semis_mois: [6, 7], recolte_mois: [10, 11],
    semis_label: "Juillet – Août", recolte_label: "Novembre – Décembre",
    notes: "Oseille de Guinée (Hibiscus sabdariffa). Fleurs séchées exportées et consommées localement en jus. Se sème après la mise en place de la saison. Sensible à l'excès d'eau.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  // ── ARBRES FRUITIERS / CULTURES PÉRENNES ───────────────────────────────

  "Mangue": {
    icon: "🥭", categorie: "Arbre fruitier",
    besoins_eau: "500–1000 mm/an", temp_optimale: "24–30°C", cycle_jours: "Arbre pérenne (récolte annuelle)",
    semis_mois: [3, 4], recolte_mois: [2, 3],
    semis_label: "Plantation en saison sèche (Nov – Fév)", recolte_label: "Mars – Avril (selon variété)",
    notes: "Le Burkina est un grand producteur de mangues. Les variétés Amélie, Kent et Keitt sont les plus exportées. La région de Bobo-Dioulasso est le principal bassin de production.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent",   classe: "v-excel" },
      "Gaoua":          { note: "Excellent",   classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",         classe: "v-bon"   },
      "Dedougou":       { note: "Bon",         classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",         classe: "v-bon"   },
      "Dori":           { note: "Déconseillé", classe: "v-non"   },
    },
  },

  "Anacarde": {
    icon: "🌰", categorie: "Arbre fruitier",
    besoins_eau: "600–1500 mm/an", temp_optimale: "24–30°C", cycle_jours: "Arbre pérenne (3–5 ans pour la 1ère récolte)",
    semis_mois: [5, 6], recolte_mois: [2, 3],
    semis_label: "Plantation en début de saison (Juin)", recolte_label: "Février – Avril",
    notes: "Noix de cajou, en forte expansion dans le Sud-Ouest. Exportation brute vers l'Inde et le Vietnam. Un des secteurs agricoles à plus forte valeur ajoutée du pays.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent",   classe: "v-excel" },
      "Gaoua":          { note: "Excellent",   classe: "v-excel" },
      "Ouagadougou":    { note: "Possible",    classe: "v-moyen" },
      "Dedougou":       { note: "Possible",    classe: "v-moyen" },
      "Fada N'Gourma":  { note: "Possible",    classe: "v-moyen" },
      "Dori":           { note: "Déconseillé", classe: "v-non"   },
    },
  },

  "Karité": {
    icon: "🌳", categorie: "Arbre fruitier",
    besoins_eau: "600–1200 mm/an", temp_optimale: "20–40°C", cycle_jours: "Arbre sauvage, collecte des noix",
    semis_mois: [5, 6], recolte_mois: [4, 5],
    semis_label: "Arbre protégé (non semé)", recolte_label: "Mai – Juin (collecte des noix)",
    notes: "Arbre sacré du Burkina Faso. Le beurre de karité est une importante source de revenus pour les femmes rurales. Le Burkina est l'un des premiers producteurs mondiaux.",
    viabilite: {
      "Bobo-Dioulasso": { note: "Excellent", classe: "v-excel" },
      "Gaoua":          { note: "Excellent", classe: "v-excel" },
      "Ouagadougou":    { note: "Bon",       classe: "v-bon"   },
      "Dedougou":       { note: "Bon",       classe: "v-bon"   },
      "Fada N'Gourma":  { note: "Bon",       classe: "v-bon"   },
      "Dori":           { note: "Possible",  classe: "v-moyen" },
    },
  },

  "Papaye": {
    icon: "🍈", categorie: "Arbre fruitier",
    besoins_eau: "1000–2000 mm/an", temp_optimale: "21–33°C", cycle_jours: "9–12 mois pour la 1ère récolte",
    semis_mois: [4, 5], recolte_mois: [2, 3],
    semis_label: "Avril – Juin (plantation)", recolte_label: "Toute l'année une fois en production",
    notes: "Fruitier rapide, récolte continue une fois en production. Nécessite de l'eau régulièrement. Cultivé dans les jardins et périmètres irrigués. Riche en vitamine C et papaïne.",
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
  const sel = document.getElementById("selectVilleClim");
  if (ville !== "Toutes") {
    sel.value = ville;
    mettreAJourClim(ville);
  } else {
    mettreAJourClim(sel.value);
  }
  mettreAJourCumul();
  mettreAJourTemp();
  mettreAJourSaison();
}

// ── Select climatologie ────────────────────────────────────────────────────
function construireSelectClim() {
  const sel = document.getElementById("selectVilleClim");
  DATA.villes.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v; opt.textContent = v;
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
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: "index", intersect: false },
    },
    ...extra,
  };
}

// ── Chart 1 ────────────────────────────────────────────────────────────────
function initChartCumul() {
  const annees = Object.keys(Object.values(DATA.cumul)[0]).sort();
  charts.cumul = new Chart(document.getElementById("chartCumul"), {
    type: "line",
    data: {
      labels: annees,
      datasets: DATA.villes.map(v => ({
        label: v,
        data: annees.map(a => DATA.cumul[v][a] ?? null),
        borderColor: couleur(v), backgroundColor: couleur(v, true),
        borderWidth: 2, pointRadius: 3, tension: .3, fill: false,
      })),
    },
    options: defaultOptions({
      scales: {
        x: { title: { display: true, text: "Année" } },
        y: { title: { display: true, text: "mm" }, beginAtZero: true },
      },
    }),
  });
}

function mettreAJourCumul() {
  if (!charts.cumul) return;
  const villes = villeActive === "Toutes" ? DATA.villes : [villeActive];
  charts.cumul.data.datasets.forEach(ds => { ds.hidden = !villes.includes(ds.label); });
  charts.cumul.update();
}

// ── Chart 2 ────────────────────────────────────────────────────────────────
function initChartClim() {
  const villeInit = DATA.villes[0];
  charts.clim = new Chart(document.getElementById("chartClim"), {
    type: "bar",
    data: {
      labels: MOIS,
      datasets: [{
        label: villeInit,
        data: Object.values(DATA.clim[villeInit]),
        backgroundColor: MOIS.map((_, i) => (i === 4 || i === 5) ? "rgba(230,81,0,.75)" : "rgba(0,154,0,.65)"),
        borderColor:      MOIS.map((_, i) => (i === 4 || i === 5) ? "#E65100" : "#009A00"),
        borderWidth: 1.5, borderRadius: 4,
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

// ── Chart 3 ────────────────────────────────────────────────────────────────
function initChartTemp() {
  const annees = Object.keys(Object.values(DATA.temps)[0]).sort();
  charts.temp = new Chart(document.getElementById("chartTemp"), {
    type: "line",
    data: {
      labels: annees,
      datasets: DATA.villes.map(v => ({
        label: v,
        data: annees.map(a => DATA.temps[v][a] ?? null),
        borderColor: couleur(v), backgroundColor: couleur(v, true),
        borderWidth: 2, pointRadius: 3, tension: .3, fill: false,
      })),
    },
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
  charts.temp.data.datasets.forEach(ds => { ds.hidden = !villes.includes(ds.label); });
  charts.temp.update();
}

// ── Chart 4 ────────────────────────────────────────────────────────────────
function initChartAnom() {
  const annees = Object.keys(DATA.anom).sort();
  const vals   = annees.map(a => DATA.anom[a]);
  charts.anom = new Chart(document.getElementById("chartAnom"), {
    type: "bar",
    data: {
      labels: annees,
      datasets: [{
        label: "Anomalie (%)", data: vals,
        backgroundColor: vals.map(v => v >= 0 ? "rgba(21,101,192,.7)" : "rgba(211,47,47,.7)"),
        borderColor:      vals.map(v => v >= 0 ? "#1565C0" : "#D32F2F"),
        borderWidth: 1, borderRadius: 3,
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

// ── Chart 5 ────────────────────────────────────────────────────────────────
function initChartSaison() {
  const annees = Object.keys(Object.values(DATA.saison)[0]).sort();
  const datasets = DATA.villes.map(v => ({
    label: v,
    data: annees.map(a => DATA.saison[v]?.[a] ?? null),
    borderColor: couleur(v), backgroundColor: couleur(v, true),
    borderWidth: 2, pointRadius: 4, tension: .2, fill: false, spanGaps: true,
  }));
  const refLines = [
    { doy: DOY_MAI, label: "1 Mai", color: "#aaa" },
    { doy: DOY_JUIN, label: "1 Juin", color: "#999" },
    { doy: DOY_JUIL, label: "1 Juillet", color: "#777" },
  ].map(r => ({
    label: r.label, data: annees.map(() => r.doy),
    borderColor: r.color, borderWidth: 1, borderDash: [6, 4],
    pointRadius: 0, fill: false, tension: 0,
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
              return { 121: "1 Mai", 152: "1 Juin", 182: "1 Juillet" }[val] ?? val;
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
  const refs = ["1 Mai", "1 Juin", "1 Juillet"];
  charts.saison.data.datasets.forEach(ds => {
    if (refs.includes(ds.label)) return;
    ds.hidden = !villes.includes(ds.label);
  });
  charts.saison.update();
}

function initTousLesGraphiques() {
  initChartCumul(); initChartClim(); initChartTemp();
  initChartAnom();  initChartSaison();
}

// ══════════════════════════════════════════════════════════════════════════
// RECHERCHE CULTURALE
// ══════════════════════════════════════════════════════════════════════════

const NOMS_CULTURES = Object.keys(CULTURES_DB);

function initRechercheCulture() {
  const input       = document.getElementById("culture-search");
  const suggestions = document.getElementById("culture-suggestions");

  // Affiche les catégories par défaut
  afficherCategories();

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      suggestions.innerHTML = "";
      suggestions.classList.remove("visible");
      afficherCategories();
      return;
    }
    const matches = NOMS_CULTURES.filter(n => n.toLowerCase().includes(q));
    afficherSuggestions(matches, q);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      input.value = "";
      suggestions.innerHTML = "";
      suggestions.classList.remove("visible");
      afficherCategories();
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrapper")) {
      suggestions.classList.remove("visible");
    }
  });
}

function afficherSuggestions(matches, query) {
  const suggestions = document.getElementById("culture-suggestions");
  if (!matches.length) {
    suggestions.innerHTML = `<div class="sugg-empty">Aucune culture trouvée pour "${query}"</div>`;
    suggestions.classList.add("visible");
    return;
  }
  suggestions.innerHTML = matches.map(nom => {
    const c = CULTURES_DB[nom];
    const highlighted = nom.replace(new RegExp(`(${query})`, "gi"), "<mark>$1</mark>");
    return `<div class="sugg-item" data-nom="${nom}">
      <span class="sugg-icon">${c.icon}</span>
      <div>
        <div class="sugg-nom">${highlighted}</div>
        <div class="sugg-cat">${c.categorie}</div>
      </div>
    </div>`;
  }).join("");
  suggestions.classList.add("visible");
  suggestions.querySelectorAll(".sugg-item").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("culture-search").value = el.dataset.nom;
      suggestions.classList.remove("visible");
      afficherCarte(el.dataset.nom);
    });
  });
}

function afficherCategories() {
  const result = document.getElementById("culture-result");
  const cats = {};
  NOMS_CULTURES.forEach(nom => {
    const cat = CULTURES_DB[nom].categorie;
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(nom);
  });

  result.innerHTML = Object.entries(cats).map(([cat, noms]) => `
    <div class="cat-group">
      <div class="cat-label">${cat}</div>
      <div class="cat-chips">
        ${noms.map(n => `<button class="chip-culture" data-nom="${n}">
          ${CULTURES_DB[n].icon} ${n}
        </button>`).join("")}
      </div>
    </div>`).join("");

  result.querySelectorAll(".chip-culture").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("culture-search").value = btn.dataset.nom;
      afficherCarte(btn.dataset.nom);
    });
  });
}

function afficherCarte(nom) {
  const c = CULTURES_DB[nom];
  const result = document.getElementById("culture-result");

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

  const viabilite = Object.entries(c.viabilite).map(([ville, v]) => `
    <div class="viab-item">
      <span class="viab-ville">${ville}</span>
      <span class="viab-note ${v.classe}">${v.note}</span>
    </div>`).join("");

  result.innerHTML = `
    <button class="btn-retour" onclick="afficherCategories();document.getElementById('culture-search').value=''">
      ← Toutes les cultures
    </button>
    <div class="culture-card">
      <div class="culture-card-header">
        <span class="culture-icon">${c.icon}</span>
        <div>
          <div class="culture-nom">${nom}</div>
          <div class="culture-cat-badge">${c.categorie}</div>
          <div class="culture-meta">💧 ${c.besoins_eau} &nbsp;|&nbsp; 🌡️ ${c.temp_optimale} &nbsp;|&nbsp; ⏱️ ${c.cycle_jours}</div>
        </div>
      </div>
      <div class="culture-periodes">
        <div class="periode-item semis">
          <div class="periode-label">🌱 Semis / Plantation</div>
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
          <span class="leg-semis">Semis / Plantation</span>
          <span class="leg-recolte">Récolte</span>
        </div>
      </div>
      <div class="culture-viabilite">
        <div class="viab-titre">Viabilité par ville</div>
        <div class="viab-grille">${viabilite}</div>
      </div>
      <div class="culture-note"><strong>Note agronomique :</strong> ${c.notes}</div>
    </div>`;
}

// ── Démarrage ──────────────────────────────────────────────────────────────
chargerDonnees().catch(err => {
  console.error("Erreur de chargement :", err);
  document.getElementById("loading").innerHTML =
    `<p style="color:#c00;font-size:1rem;">Erreur de chargement des données.<br>
     Assurez-vous que le serveur Flask est démarré.</p>`;
});

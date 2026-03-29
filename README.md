# Analyse Météorologique du Burkina Faso

Analyse de 33 ans de données météorologiques (1990-2023) pour 6 villes du Burkina Faso, à partir des données NASA POWER. Le projet répond à des questions concrètes sur le climat et l'agriculture au Sahel.

## Aperçu

**Questions traitées :**
- Les précipitations augmentent-elles ou diminuent-elles depuis 30 ans ?
- Quelle est la meilleure période pour semer le maïs selon la région ?
- Le Burkina Faso se réchauffe-t-il, et à quelle vitesse ?
- Le début de la saison des pluies se décale-t-il dans le temps ?
- Quelles années ont été particulièrement sèches ou pluvieuses ?

**Villes analysées :**

| Ville | Zone | Pluie moy./an | Tmax moy. |
|-------|------|--------------|-----------|
| Bobo-Dioulasso | Sud-Ouest | 1110 mm | 33.6°C |
| Gaoua | Sud-Ouest | 1078 mm | 33.7°C |
| Ouagadougou | Centre | 809 mm | 35.1°C |
| Dedougou | Centre-Ouest | 839 mm | 35.3°C |
| Fada N'Gourma | Est | 799 mm | 34.8°C |
| Dori | Nord-Sahel | 516 mm | 36.0°C |

---

## Structure du projet

```
.
├── fetch_data.py           # Téléchargement des données depuis NASA POWER
├── prepare_data.py         # Pré-calcul des agrégations → data.json
├── burkina_meteo_complet.py # Analyse complète + génération des graphiques
├── generer_rapport.py      # Génération du rapport PDF
├── app.py                  # Backend Flask (API REST)
├── index.html              # Dashboard web interactif
├── style.css               # Styles du dashboard
├── script.js               # Graphiques Chart.js
├── data.json               # Données pré-agrégées (généré par prepare_data.py)
├── graphiques/             # Graphiques PNG générés
├── requirements.txt        # Dépendances Python
└── render.yaml             # Configuration déploiement Render
```

---

## Installation

### Prérequis
- Python 3.10+

### 1. Cloner le repo
```bash
git clone https://github.com/dorianeoued/Analyse_meteo_Burkina_Faso.git
cd Analyse_meteo_Burkina_Faso
```

### 2. Installer les dépendances
```bash
python -m pip install -r requirements.txt
python -m pip install fpdf2  # pour la génération PDF uniquement
```

### 3. Télécharger les données brutes (optionnel)
Les données brutes ne sont pas incluses dans le repo. Pour les retélécharger depuis NASA POWER :
```bash
python fetch_data.py
```
> Note : nécessite une connexion internet. Durée ~2 minutes.

### 4. Lancer l'application web
```bash
python app.py
```
Ouvre [http://localhost:5000](http://localhost:5000)

---

## Analyses disponibles

### Graphiques générés (`burkina_meteo_complet.py`)

| Fichier | Contenu |
|---------|---------|
| `01_cumul_annuel.png` | Évolution des précipitations annuelles par ville |
| `02_climatologie_mensuelle.png` | Précipitations moyennes par mois (semis maïs) |
| `03_tendance_temperature.png` | Réchauffement des températures max |
| `04_debut_saison_pluies.png` | Évolution du début de la saison des pluies |
| `05_anomalies_precipitations.png` | Années sèches vs pluvieuses (anomalies %) |

### Rapport PDF (`generer_rapport.py`)
Génère `rapport_meteo_burkina.pdf` avec tous les graphiques, interprétations et conclusions.
```bash
python generer_rapport.py
```

---

## Notions d'analyse appliquées

| Notion | Description |
|--------|-------------|
| **Nettoyage** | Remplacement des valeurs sentinelles NASA (-999.0) par NaN |
| **Rééchantillonnage** | Agrégation journalier → mensuel → annuel |
| **Analyse de tendance** | Régression linéaire (np.polyfit) sur 33 ans |
| **Calcul d'anomalies** | Écart en % par rapport à la moyenne 1990-2023 |
| **Détection d'événement** | Début de saison = cumul 3 jours consécutifs >= 20 mm |
| **Statistiques descriptives** | Moyenne, écart-type, min/max par groupe |

---

## Principaux résultats

- **Transition climatique** : période sèche 1990-2004 (-21% à -29%), reprise pluvieuse depuis 2008 (+15% à +18%)
- **Réchauffement** : +0.7°C à +1.0°C en 33 ans selon les villes
- **Semis du maïs** : fin mai au Sud, mi-juin au Centre, déconseillé au Nord (privilégier mil/sorgho)
- **Gradient Nord-Sud** : Dori (516 mm/an) vs Bobo-Dioulasso (1110 mm/an)

---

## Stack technique

- **Analyse** : Python, pandas, numpy, matplotlib
- **Backend** : Flask
- **Frontend** : Chart.js, HTML/CSS vanilla
- **PDF** : fpdf2
- **Déploiement** : Render
- **Source des données** : [NASA POWER](https://power.larc.nasa.gov) — communauté Agriculture (AG)

---

## Déploiement

L'application est configurée pour Render via `render.yaml`. Tout push sur `main` déclenche un redéploiement automatique.

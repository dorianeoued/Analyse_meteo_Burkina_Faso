"""
prepare_data.py
Lit donnees/burkina_toutes_villes.csv, calcule les agrégations et
sauvegarde le résultat dans data.json.
"""

import json
import pandas as pd
import numpy as np

CSV_PATH = "donnees/burkina_toutes_villes.csv"
OUT_PATH  = "data.json"

# ── Chargement ──────────────────────────────────────────────────────────────
df = pd.read_csv(CSV_PATH, parse_dates=["date"])
df["annee"]  = df["date"].dt.year
df["mois"]   = df["date"].dt.month
df["doy"]    = df["date"].dt.dayofyear   # jour de l'année (1-365)

villes = sorted(df["ville"].unique().tolist())

# ── 1. Stats globales ────────────────────────────────────────────────────────
# Précipitations annuelles par ville-année → moyenne sur toutes les années
pluie_an = df.groupby(["ville", "annee"])["PRECTOTCORR"].sum()   # mm/an

stats_globales = {}
for v in villes:
    sub = df[df["ville"] == v]
    stats_globales[v] = {
        "pluie_annuelle_moy": round(float(pluie_an[v].mean()), 1),
        "tmax_moy":           round(float(sub["T2M_MAX"].mean()), 1),
        "tmin_moy":           round(float(sub["T2M_MIN"].mean()), 1),
        "humidite_moy":       round(float(sub["RH2M"].mean()), 1),
    }

# ── 2. Cumul annuel ──────────────────────────────────────────────────────────
cumul_annuel = {}
for v in villes:
    serie = pluie_an[v]
    cumul_annuel[v] = {str(yr): round(float(val), 1)
                       for yr, val in serie.items()}

# ── 3. Climatologie mensuelle (mm/jour moyen par mois) ──────────────────────
climatologie_mensuelle = {}
for v in villes:
    sub = df[df["ville"] == v]
    moy = sub.groupby("mois")["PRECTOTCORR"].mean()
    climatologie_mensuelle[v] = {str(m): round(float(moy.get(m, 0)), 2)
                                  for m in range(1, 13)}

# ── 4. Températures max annuelles ────────────────────────────────────────────
temperature_annuelle = {}
for v in villes:
    sub = df[df["ville"] == v]
    serie = sub.groupby("annee")["T2M_MAX"].mean()
    temperature_annuelle[v] = {str(yr): round(float(val), 2)
                                for yr, val in serie.items()}

# ── 5. Anomalies nationales ───────────────────────────────────────────────────
# Pour chaque ville, on calcule la moyenne de référence (toutes années)
# Puis pour chaque année, anomalie(ville,an) = (P_an - P_moy) / P_moy * 100
# L'anomalie nationale = moyenne des anomalies de toutes les villes pour l'an

all_years = sorted(df["annee"].unique())
# Référence par ville
ref_by_ville = {v: pluie_an[v].mean() for v in villes}

anomalies = {}
for yr in all_years:
    vals = []
    for v in villes:
        if yr in pluie_an[v].index and ref_by_ville[v] > 0:
            anom = (pluie_an[v][yr] - ref_by_ville[v]) / ref_by_ville[v] * 100
            vals.append(float(anom))
    anomalies[str(yr)] = round(float(np.mean(vals)), 2) if vals else 0.0

# ── 6. Début de saison des pluies ────────────────────────────────────────────
# Critère : premier jour après le 1er avril (doy > 90) où la somme sur
# 3 jours consécutifs >= 20 mm
def debut_saison_annee(sub_ville_annee):
    """Retourne le doy du début de saison ou NaN si non trouvé."""
    grp = sub_ville_annee.sort_values("date")
    prec = grp["PRECTOTCORR"].values
    doys  = grp["doy"].values
    n = len(prec)
    for i in range(n - 2):
        if doys[i] <= 90:
            continue
        if prec[i] + prec[i+1] + prec[i+2] >= 20:
            return int(doys[i])
    return None

debut_saison = {}
for v in villes:
    sub_v = df[df["ville"] == v]
    debut_saison[v] = {}
    for yr in all_years:
        sub_yr = sub_v[sub_v["annee"] == yr]
        doy = debut_saison_annee(sub_yr)
        if doy is not None:
            debut_saison[v][str(yr)] = doy

# ── Sauvegarde ────────────────────────────────────────────────────────────────
data = {
    "villes":                villes,
    "stats_globales":        stats_globales,
    "cumul_annuel":          cumul_annuel,
    "climatologie_mensuelle": climatologie_mensuelle,
    "temperature_annuelle":  temperature_annuelle,
    "anomalies":             anomalies,
    "debut_saison":          debut_saison,
}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"[OK] {OUT_PATH} généré avec succès.")
print(f"     Villes  : {villes}")
print(f"     Années  : {all_years[0]} – {all_years[-1]}")

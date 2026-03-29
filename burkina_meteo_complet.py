"""
ANALYSE METEOROLOGIQUE DU BURKINA FASO (1990-2023)
===================================================
Source des données : NASA POWER (power.larc.nasa.gov)
Questions traitées :
  1. Evolution du cumul annuel des précipitations
  2. Climatologie mensuelle et période optimale de semis du maïs
  3. Tendance de réchauffement des températures
  4. Date moyenne de début de la saison des pluies par ville
  5. Années sèches et années pluvieuses remarquables
"""

import requests
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os
import time

# ══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════

VILLES = {
    "Ouagadougou":   {"lat": 12.36, "lon": -1.53},
    "Bobo-Dioulasso":{"lat": 11.18, "lon": -4.30},
    "Dori":          {"lat": 14.03, "lon": -0.03},
    "Fada N'Gourma": {"lat": 12.06, "lon":  0.35},
    "Gaoua":         {"lat": 10.33, "lon": -3.18},
    "Dedougou":      {"lat": 12.46, "lon": -3.46},
}

PARAMETRES   = ["PRECTOTCORR", "T2M_MAX", "T2M_MIN", "RH2M"]
ANNEE_DEBUT  = 1990
ANNEE_FIN    = 2023
MOIS_LABELS  = ["Jan","Fév","Mar","Avr","Mai","Jun",
                 "Jul","Aoû","Sep","Oct","Nov","Déc"]

os.makedirs("donnees",    exist_ok=True)
os.makedirs("graphiques", exist_ok=True)


# ══════════════════════════════════════════════════════════════════════
# PARTIE 1 — TÉLÉCHARGEMENT DES DONNÉES
# ══════════════════════════════════════════════════════════════════════

def telecharger_ville(nom, lat, lon):
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": ",".join(PARAMETRES),
        "community":  "AG",
        "longitude":  lon,
        "latitude":   lat,
        "start":      f"{ANNEE_DEBUT}0101",
        "end":        f"{ANNEE_FIN}1231",
        "format":     "JSON",
    }
    print(f"  Téléchargement : {nom}...")
    r = requests.get(url, params=params, timeout=90)
    r.raise_for_status()
    params_data = r.json()["properties"]["parameter"]

    dates = pd.date_range(f"{ANNEE_DEBUT}-01-01", f"{ANNEE_FIN}-12-31", freq="D")
    df = pd.DataFrame(index=dates)
    df.index.name = "date"
    for param, values in params_data.items():
        s = pd.Series(values)
        s.index = pd.to_datetime(s.index, format="%Y%m%d")
        df[param] = s
    df.replace(-999.0, pd.NA, inplace=True)
    df["ville"] = nom
    return df


def charger_ou_telecharger():
    fichier_combine = "donnees/burkina_toutes_villes.csv"
    if os.path.exists(fichier_combine):
        print("Données déjà présentes, chargement local...")
        df = pd.read_csv(fichier_combine, parse_dates=["date"], index_col="date")
        print(f"  {df['ville'].nunique()} villes, "
              f"{df.index.min().date()} → {df.index.max().date()}")
        return df

    print("Téléchargement depuis NASA POWER...")
    tous = []
    for nom, coords in VILLES.items():
        try:
            df_v = telecharger_ville(nom, coords["lat"], coords["lon"])
            nom_f = nom.replace(' ', '_').replace("'", '')
            df_v.to_csv(f"donnees/{nom_f}.csv")
            print(f"    Sauvegardé ({len(df_v)} jours)")
            tous.append(df_v)
            time.sleep(1)
        except Exception as e:
            print(f"    ERREUR {nom} : {e}")

    df = pd.concat(tous)
    df.to_csv(fichier_combine)
    print(f"Fichier combiné : {fichier_combine}  ({len(df)} lignes)")
    return df


# ══════════════════════════════════════════════════════════════════════
# PARTIE 2 — RÉSUMÉ STATISTIQUE
# ══════════════════════════════════════════════════════════════════════

def resume_statistiques(df):
    print("\n" + "="*60)
    print("RÉSUMÉ STATISTIQUE PAR VILLE (1990-2023)")
    print("="*60)
    stats = df.groupby("ville").agg(
        pluie_annuelle_moy=("PRECTOTCORR",
                            lambda x: x.groupby(x.index.year).sum().mean()),
        tmax_moy=("T2M_MAX",  "mean"),
        tmin_moy=("T2M_MIN",  "mean"),
        humidite_moy=("RH2M", "mean"),
    ).round(1)
    print(stats.to_string())


# ══════════════════════════════════════════════════════════════════════
# PARTIE 3 — GRAPHIQUE 1 : CUMUL ANNUEL DES PRÉCIPITATIONS
# ══════════════════════════════════════════════════════════════════════

def graphique_cumul_annuel(df):
    annuel = (
        df.groupby(["ville", df.index.year])["PRECTOTCORR"]
        .sum().reset_index()
        .rename(columns={"date": "annee", "PRECTOTCORR": "cumul_mm"})
    )
    villes = annuel["ville"].unique()
    colors = plt.cm.tab10(np.linspace(0, 1, len(villes)))

    fig, ax = plt.subplots(figsize=(13, 6))
    for ville, color in zip(villes, colors):
        d = annuel[annuel["ville"] == ville]
        ax.plot(d["annee"], d["cumul_mm"], label=ville,
                color=color, linewidth=1.6, alpha=0.85)
        z = np.polyfit(d["annee"], d["cumul_mm"], 1)
        p = np.poly1d(z)
        ax.plot(d["annee"], p(d["annee"]),
                color=color, linestyle="--", linewidth=0.9, alpha=0.5)

    ax.set_title("Cumul annuel des précipitations au Burkina Faso (1990–2023)",
                 fontsize=14, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Précipitations (mm)")
    ax.legend(loc="upper right", fontsize=8)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graphiques/01_cumul_annuel.png", dpi=150)
    print("Graphique 1 sauvegardé : graphiques/01_cumul_annuel.png")
    plt.show()
    return annuel


# ══════════════════════════════════════════════════════════════════════
# PARTIE 4 — GRAPHIQUE 2 : CLIMATOLOGIE MENSUELLE (SEMIS MAÏS)
# ══════════════════════════════════════════════════════════════════════

def graphique_climatologie_mensuelle(df):
    mensuel = (
        df.groupby(["ville", df.index.month])["PRECTOTCORR"]
        .mean().reset_index()
        .rename(columns={"date": "mois", "PRECTOTCORR": "pluie_moy"})
    )
    villes = mensuel["ville"].unique()
    fig, axes = plt.subplots(2, 3, figsize=(14, 8), sharey=False)
    axes = axes.flatten()

    for ax, ville in zip(axes, villes):
        d = mensuel[mensuel["ville"] == ville]
        colors_bar = ["orangered" if m in [5, 6] else "steelblue"
                      for m in d["mois"]]
        ax.bar(d["mois"], d["pluie_moy"], color=colors_bar, edgecolor="white")
        ax.set_title(ville, fontweight="bold")
        ax.set_xticks(range(1, 13))
        ax.set_xticklabels(MOIS_LABELS, fontsize=7, rotation=45)
        ax.set_ylabel("mm/jour (moy.)")
        ax.grid(axis="y", alpha=0.3)

    fig.suptitle(
        "Précipitations moyennes par mois (1990–2023)\n"
        "Barres rouges = période optimale de semis du maïs (Mai–Juin)",
        fontsize=12, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig("graphiques/02_climatologie_mensuelle.png", dpi=150)
    print("Graphique 2 sauvegardé : graphiques/02_climatologie_mensuelle.png")
    plt.show()


# ══════════════════════════════════════════════════════════════════════
# PARTIE 5 — GRAPHIQUE 3 : TENDANCE DES TEMPÉRATURES MAX
# ══════════════════════════════════════════════════════════════════════

def graphique_temperature(df):
    annuel = (
        df.groupby(["ville", df.index.year])["T2M_MAX"]
        .mean().reset_index()
        .rename(columns={"date": "annee", "T2M_MAX": "tmax_moy"})
    )
    villes = annuel["ville"].unique()
    colors = plt.cm.tab10(np.linspace(0, 1, len(villes)))

    fig, ax = plt.subplots(figsize=(13, 5))
    for ville, color in zip(villes, colors):
        d = annuel[annuel["ville"] == ville]
        ax.plot(d["annee"], d["tmax_moy"], label=ville,
                color=color, linewidth=1.5)
        z = np.polyfit(d["annee"], d["tmax_moy"], 1)
        p = np.poly1d(z)
        ax.plot(d["annee"], p(d["annee"]),
                color=color, linestyle="--", linewidth=1, alpha=0.6)
        delta = p(ANNEE_FIN) - p(ANNEE_DEBUT)
        sign = "+" if delta >= 0 else ""
        ax.annotate(f"{sign}{delta:.1f}°C",
                    xy=(ANNEE_FIN, p(ANNEE_FIN)),
                    fontsize=7, color=color, va="center")

    ax.set_title("Température max annuelle moyenne – Burkina Faso (1990–2023)",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Température (°C)")
    ax.legend(fontsize=8)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graphiques/03_tendance_temperature.png", dpi=150)
    print("Graphique 3 sauvegardé : graphiques/03_tendance_temperature.png")
    plt.show()


# ══════════════════════════════════════════════════════════════════════
# PARTIE 6 — GRAPHIQUE 4 : DÉBUT DE LA SAISON DES PLUIES
# ══════════════════════════════════════════════════════════════════════

def debut_saison_pluies(pluie_serie):
    """
    Retourne le jour julien du début de la saison pour une année.
    Critère : cumul sur 3 jours consécutifs >= 20 mm, après le 1er avril.
    """
    for i in range(90, len(pluie_serie) - 2):  # à partir du 1er avril (~jour 90)
        cumul3j = pluie_serie.iloc[i:i+3].sum()
        if cumul3j >= 20:
            return pluie_serie.index[i].dayofyear
    return None


def graphique_debut_saison(df):
    resultats = []
    for ville in df["ville"].unique():
        df_v = df[df["ville"] == ville]["PRECTOTCORR"].dropna()
        for annee in range(ANNEE_DEBUT, ANNEE_FIN + 1):
            serie_annee = df_v[df_v.index.year == annee]
            if len(serie_annee) < 200:
                continue
            jour = debut_saison_pluies(serie_annee)
            if jour:
                resultats.append({"ville": ville, "annee": annee, "jour_debut": jour})

    res = pd.DataFrame(resultats)

    villes  = res["ville"].unique()
    colors  = plt.cm.tab10(np.linspace(0, 1, len(villes)))

    fig, ax = plt.subplots(figsize=(13, 6))
    for ville, color in zip(villes, colors):
        d = res[res["ville"] == ville].sort_values("annee")
        ax.plot(d["annee"], d["jour_debut"], label=ville,
                color=color, linewidth=1.5, alpha=0.8, marker="o", markersize=3)
        z = np.polyfit(d["annee"], d["jour_debut"], 1)
        p = np.poly1d(z)
        ax.plot(d["annee"], p(d["annee"]),
                color=color, linestyle="--", linewidth=1, alpha=0.5)

    # Repères calendaires
    for jour, label in [(121, "1 Mai"), (152, "1 Juin"),
                         (182, "1 Jul"), (213, "1 Aoû")]:
        ax.axhline(jour, color="gray", linestyle=":", linewidth=0.7, alpha=0.6)
        ax.text(ANNEE_FIN + 0.2, jour, label, fontsize=7, color="gray", va="center")

    ax.set_title("Jour de début de la saison des pluies – Burkina Faso (1990–2023)",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Jour de l'année")
    ax.legend(fontsize=8)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graphiques/04_debut_saison_pluies.png", dpi=150)
    print("Graphique 4 sauvegardé : graphiques/04_debut_saison_pluies.png")
    plt.show()

    # Résumé textuel
    print("\n" + "="*55)
    print("DÉBUT MOYEN DE LA SAISON DES PLUIES PAR VILLE")
    print("="*55)
    moy = res.groupby("ville")["jour_debut"].agg(["mean","std"]).round(1)
    moy.columns = ["Jour moyen", "Écart-type"]
    # Convertir jour julien en date approximative
    moy["Date approx."] = moy["Jour moyen"].apply(
        lambda j: pd.Timestamp("2001-01-01") + pd.Timedelta(days=int(j)-1)
    ).dt.strftime("%d %B")
    print(moy.to_string())

    return res


# ══════════════════════════════════════════════════════════════════════
# PARTIE 7 — GRAPHIQUE 5 : ANNÉES SÈCHES ET PLUVIEUSES
# ══════════════════════════════════════════════════════════════════════

def graphique_anomalies(df):
    """Anomalie de précipitation par rapport à la moyenne 1990-2023."""
    annuel = (
        df.groupby(["ville", df.index.year])["PRECTOTCORR"]
        .sum().reset_index()
        .rename(columns={"date": "annee", "PRECTOTCORR": "cumul_mm"})
    )
    # Calculer anomalie en % par rapport à la moyenne de chaque ville
    moyennes = annuel.groupby("ville")["cumul_mm"].transform("mean")
    annuel["anomalie_pct"] = ((annuel["cumul_mm"] - moyennes) / moyennes * 100).round(1)

    # Moyenne de l'anomalie sur toutes les villes (signal national)
    national = annuel.groupby("annee")["anomalie_pct"].mean().reset_index()

    fig, ax = plt.subplots(figsize=(13, 5))
    colors_bar = ["steelblue" if v >= 0 else "tomato"
                  for v in national["anomalie_pct"]]
    ax.bar(national["annee"], national["anomalie_pct"],
           color=colors_bar, edgecolor="white", width=0.8)
    ax.axhline(0, color="black", linewidth=0.8)
    ax.set_title("Anomalie annuelle des précipitations – moyenne nationale (1990–2023)\n"
                 "Bleu = année pluvieuse / Rouge = année sèche",
                 fontsize=12, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Anomalie (%)")
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.grid(axis="y", alpha=0.3)

    # Annoter les extrêmes
    for _, row in national.iterrows():
        if abs(row["anomalie_pct"]) > 15:
            ax.text(row["annee"], row["anomalie_pct"] + (2 if row["anomalie_pct"] > 0 else -4),
                    f"{row['anomalie_pct']:+.0f}%",
                    ha="center", fontsize=7, fontweight="bold",
                    color="steelblue" if row["anomalie_pct"] > 0 else "tomato")

    plt.tight_layout()
    plt.savefig("graphiques/05_anomalies_precipitations.png", dpi=150)
    print("Graphique 5 sauvegardé : graphiques/05_anomalies_precipitations.png")
    plt.show()


# ══════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" ANALYSE MÉTÉO BURKINA FASO — NASA POWER 1990-2023")
    print("="*60 + "\n")

    # 1. Données
    df = charger_ou_telecharger()

    # 2. Résumé
    resume_statistiques(df)

    # 3. Graphiques
    print("\nGénération des graphiques...")
    graphique_cumul_annuel(df)
    graphique_climatologie_mensuelle(df)
    graphique_temperature(df)
    graphique_debut_saison(df)
    graphique_anomalies(df)

    print("\n" + "="*60)
    print("ANALYSE TERMINÉE")
    print("Graphiques sauvegardés dans le dossier 'graphiques/'")
    print("="*60)

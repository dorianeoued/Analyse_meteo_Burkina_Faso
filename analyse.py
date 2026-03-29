"""
Analyse de la saison des pluies au Burkina Faso (1990-2023)
Questions :
  1. Le cumul annuel des pluies évolue-t-il ?
  2. La saison des pluies se raccourcit-elle ?
  3. Quelle est la meilleure période pour semer le maïs ?
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import os

SEUIL_PLUIE_MM = 1.0     # jour de pluie si >= 1 mm
SEUIL_DEBUT    = 20.0    # cumul 3 jours >= 20 mm → début de saison
SEUIL_FIN      = 10.0    # aucun jour de pluie pendant 20 jours → fin de saison

os.makedirs("graphiques", exist_ok=True)


# ─────────────────────────────────────────────
# 1. Chargement des données
# ─────────────────────────────────────────────
def charger_donnees():
    fichier = "donnees/burkina_toutes_villes.csv"
    if not os.path.exists(fichier):
        raise FileNotFoundError(
            "Données non trouvées. Lance d'abord fetch_data.py"
        )
    df = pd.read_csv(fichier, parse_dates=["date"], index_col="date")
    print(f"Données chargées : {df['ville'].nunique()} villes, "
          f"{df.index.min().date()} → {df.index.max().date()}")
    return df


# ─────────────────────────────────────────────
# 2. Cumul annuel des précipitations
# ─────────────────────────────────────────────
def cumul_annuel(df):
    """Calcule et trace le cumul annuel par ville."""
    annuel = (
        df.groupby(["ville", df.index.year])["PRECTOTCORR"]
        .sum()
        .reset_index()
        .rename(columns={"date": "annee", "PRECTOTCORR": "cumul_mm"})
    )

    fig, ax = plt.subplots(figsize=(12, 6))
    villes = annuel["ville"].unique()
    colors = plt.cm.tab10(np.linspace(0, 1, len(villes)))

    for ville, color in zip(villes, colors):
        data = annuel[annuel["ville"] == ville]
        ax.plot(data["annee"], data["cumul_mm"], label=ville,
                color=color, linewidth=1.5, alpha=0.8)

        # Tendance linéaire
        z = np.polyfit(data["annee"], data["cumul_mm"], 1)
        p = np.poly1d(z)
        ax.plot(data["annee"], p(data["annee"]),
                color=color, linestyle="--", linewidth=0.8, alpha=0.5)

    ax.set_title("Cumul annuel des précipitations au Burkina Faso (1990–2023)",
                 fontsize=14, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Précipitations (mm)")
    ax.legend(loc="upper right", fontsize=8)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graphiques/01_cumul_annuel.png", dpi=150)
    plt.show()
    print("Graphique sauvegardé : graphiques/01_cumul_annuel.png")
    return annuel


# ─────────────────────────────────────────────
# 3. Climatologie mensuelle (pluie moyenne par mois)
# ─────────────────────────────────────────────
def climatologie_mensuelle(df):
    """Moyenne des précipitations par mois — montre la saison des pluies."""
    MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

    mensuel = (
        df.groupby(["ville", df.index.month])["PRECTOTCORR"]
        .mean()
        .reset_index()
        .rename(columns={"date": "mois", "PRECTOTCORR": "pluie_moyenne_mm"})
    )

    villes = mensuel["ville"].unique()
    fig, axes = plt.subplots(2, 3, figsize=(14, 8), sharey=False)
    axes = axes.flatten()

    for ax, ville in zip(axes, villes):
        data = mensuel[mensuel["ville"] == ville]
        bars = ax.bar(data["mois"], data["pluie_moyenne_mm"],
                      color="steelblue", edgecolor="white")
        ax.set_title(ville, fontweight="bold")
        ax.set_xticks(range(1, 13))
        ax.set_xticklabels(MOIS, fontsize=7, rotation=45)
        ax.set_ylabel("mm/jour (moy.)")
        ax.grid(axis="y", alpha=0.3)

        # Zone de semis maïs conseillée (mai–juin)
        for i, bar in enumerate(bars):
            mois_num = i + 1
            if mois_num in [5, 6]:
                bar.set_color("orangered")
                bar.set_alpha(0.8)

    fig.suptitle(
        "Précipitations moyennes par mois (1990–2023)\n"
        "Barres rouges = période optimale de semis du maïs",
        fontsize=13, fontweight="bold"
    )
    plt.tight_layout()
    plt.savefig("graphiques/02_climatologie_mensuelle.png", dpi=150)
    plt.show()
    print("Graphique sauvegardé : graphiques/02_climatologie_mensuelle.png")


# ─────────────────────────────────────────────
# 4. Évolution des températures max
# ─────────────────────────────────────────────
def tendance_temperature(df):
    """Température maximale annuelle moyenne par ville."""
    annuel = (
        df.groupby(["ville", df.index.year])["T2M_MAX"]
        .mean()
        .reset_index()
        .rename(columns={"date": "annee", "T2M_MAX": "tmax_moy"})
    )

    fig, ax = plt.subplots(figsize=(12, 5))
    villes = annuel["ville"].unique()
    colors = plt.cm.tab10(np.linspace(0, 1, len(villes)))

    for ville, color in zip(villes, colors):
        data = annuel[annuel["ville"] == ville]
        ax.plot(data["annee"], data["tmax_moy"], label=ville,
                color=color, linewidth=1.5)
        z = np.polyfit(data["annee"], data["tmax_moy"], 1)
        p = np.poly1d(z)
        ax.plot(data["annee"], p(data["annee"]),
                color=color, linestyle="--", linewidth=1, alpha=0.6)
        # Annotation de la tendance
        delta = p(2023) - p(1990)
        ax.annotate(f"+{delta:.1f}°C",
                    xy=(2023, p(2023)), fontsize=7, color=color)

    ax.set_title("Température max annuelle moyenne – Burkina Faso (1990–2023)",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Année")
    ax.set_ylabel("Température (°C)")
    ax.legend(fontsize=8)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graphiques/03_tendance_temperature.png", dpi=150)
    plt.show()
    print("Graphique sauvegardé : graphiques/03_tendance_temperature.png")


# ─────────────────────────────────────────────
# 5. Résumé texte dans le terminal
# ─────────────────────────────────────────────
def resume_statistiques(df):
    print("\n" + "="*55)
    print("RESUME STATISTIQUE PAR VILLE (1990-2023)")
    print("="*55)
    stats = df.groupby("ville").agg(
        pluie_annuelle_moy=("PRECTOTCORR",
                            lambda x: x.groupby(x.index.year).sum().mean()),
        tmax_moy=("T2M_MAX", "mean"),
        tmin_moy=("T2M_MIN", "mean"),
        humidite_moy=("RH2M", "mean"),
    ).round(1)
    print(stats.to_string())
    print()


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    df = charger_donnees()
    resume_statistiques(df)
    cumul_annuel(df)
    climatologie_mensuelle(df)
    tendance_temperature(df)
    print("\nAnalyse terminée. Graphiques dans le dossier 'graphiques/'")

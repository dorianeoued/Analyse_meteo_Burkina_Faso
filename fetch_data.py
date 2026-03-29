"""
Téléchargement des données météo NASA POWER pour le Burkina Faso
Données journalières : précipitations, température min/max, humidité
"""

import requests
import pandas as pd
import os
import time

# Villes du Burkina Faso avec leurs coordonnées
VILLES = {
    "Ouagadougou": {"lat": 12.36, "lon": -1.53},
    "Bobo-Dioulasso": {"lat": 11.18, "lon": -4.30},
    "Dori":          {"lat": 14.03, "lon": -0.03},
    "Fada N'Gourma": {"lat": 12.06, "lon":  0.35},
    "Gaoua":         {"lat": 10.33, "lon": -3.18},
    "Dedougou":      {"lat": 12.46, "lon": -3.46},
}

# Paramètres météo à récupérer
PARAMETRES = [
    "PRECTOTCORR",   # Précipitations (mm/jour)
    "T2M_MAX",       # Température max (°C)
    "T2M_MIN",       # Température min (°C)
    "RH2M",          # Humidité relative (%)
]

ANNEE_DEBUT = 1990
ANNEE_FIN   = 2023

def telecharger_ville(nom, lat, lon):
    """Télécharge les données NASA POWER pour une ville."""
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
    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()
    params_data = data["properties"]["parameter"]

    # Convertir en DataFrame
    dates = pd.date_range(start=f"{ANNEE_DEBUT}-01-01",
                          end=f"{ANNEE_FIN}-12-31", freq="D")

    df = pd.DataFrame(index=dates)
    df.index.name = "date"

    for param, values in params_data.items():
        series = pd.Series(values)
        series.index = pd.to_datetime(series.index, format="%Y%m%d")
        df[param] = series

    # Remplacer les valeurs manquantes NASA (-999) par NaN
    df.replace(-999.0, pd.NA, inplace=True)
    df["ville"] = nom

    return df


def main():
    os.makedirs("donnees", exist_ok=True)
    tous = []

    for nom, coords in VILLES.items():
        try:
            df = telecharger_ville(nom, coords["lat"], coords["lon"])
            nom_fichier = nom.replace(' ', '_').replace("'", '')
            fichier = f"donnees/{nom_fichier}.csv"
            df.to_csv(fichier)
            print(f"  Sauvegarde : {fichier}  ({len(df)} jours)")
            tous.append(df)
            time.sleep(1)  # respecter l'API
        except Exception as e:
            print(f"  ERREUR pour {nom} : {e}")

    # Fichier combiné
    if tous:
        combined = pd.concat(tous)
        combined.to_csv("donnees/burkina_toutes_villes.csv")
        print(f"\nFichier combiné : donnees/burkina_toutes_villes.csv")
        print(f"Total lignes : {len(combined)}")

if __name__ == "__main__":
    main()

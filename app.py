"""
app.py  –  Serveur Flask pour l'analyse météorologique du Burkina Faso
"""

import json
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers["X-Frame-Options"] = "ALLOWALL"
    response.headers["Content-Security-Policy"] = "frame-ancestors *"
    return response
# ── Chargement unique des données au démarrage ───────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    DATA = json.load(f)


# ── Helpers ──────────────────────────────────────────────────────────────────
def ville_param():
    return request.args.get("ville", None)


# ── Routes statiques ─────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(".", "index.html")


# ── API ───────────────────────────────────────────────────────────────────────

@app.route("/api/stats")
def api_stats():
    """Statistiques globales par ville."""
    return jsonify(DATA["stats_globales"])


@app.route("/api/cumul_annuel")
def api_cumul_annuel():
    """Cumul annuel des précipitations.
    ?ville=Ouagadougou  → données pour une ville
    (sans paramètre)    → toutes les villes
    """
    ville = ville_param()
    if ville:
        if ville not in DATA["cumul_annuel"]:
            return jsonify({"error": f"Ville inconnue : {ville}"}), 404
        return jsonify({ville: DATA["cumul_annuel"][ville]})
    return jsonify(DATA["cumul_annuel"])


@app.route("/api/climatologie")
def api_climatologie():
    """Climatologie mensuelle (mm/jour moyen par mois).
    ?ville=Ouagadougou  → une ville
    (sans paramètre)    → toutes
    """
    ville = ville_param()
    if ville:
        if ville not in DATA["climatologie_mensuelle"]:
            return jsonify({"error": f"Ville inconnue : {ville}"}), 404
        return jsonify(DATA["climatologie_mensuelle"][ville])
    return jsonify(DATA["climatologie_mensuelle"])


@app.route("/api/temperatures")
def api_temperatures():
    """Températures max annuelles moyennes.
    ?ville=Ouagadougou  → une ville
    (sans paramètre)    → toutes
    """
    ville = ville_param()
    if ville:
        if ville not in DATA["temperature_annuelle"]:
            return jsonify({"error": f"Ville inconnue : {ville}"}), 404
        return jsonify({ville: DATA["temperature_annuelle"][ville]})
    return jsonify(DATA["temperature_annuelle"])


@app.route("/api/anomalies")
def api_anomalies():
    """Anomalies nationales de précipitations (%) par année."""
    return jsonify(DATA["anomalies"])


@app.route("/api/debut_saison")
def api_debut_saison():
    """Début de saison des pluies (jour de l'année).
    ?ville=Ouagadougou  → une ville
    (sans paramètre)    → toutes
    """
    ville = ville_param()
    if ville:
        if ville not in DATA["debut_saison"]:
            return jsonify({"error": f"Ville inconnue : {ville}"}), 404
        return jsonify({ville: DATA["debut_saison"][ville]})
    return jsonify(DATA["debut_saison"])


@app.route("/api/villes")
def api_villes():
    """Liste des villes disponibles."""
    return jsonify(DATA["villes"])


# ── Lancement local ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)

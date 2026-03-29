"""
Génération du rapport PDF  - Analyse météo Burkina Faso (1990-2023)
Dépendance : pip install fpdf2
"""

from fpdf import FPDF
import os

GRAPHIQUES = [
    ("graphiques/01_cumul_annuel.png",
     "1. Cumul annuel des précipitations (1990-2023)",
     [
         "Les précipitations annuelles montrent une tendance à la hausse sur l'ensemble "
         "du territoire burkinabè entre 1990 et 2023. Toutes les courbes de tendance "
         "(tirets) pointent vers le haut, ce qui contredit l'idée d'un assèchement "
         "généralisé du pays.",

         "Dori, située dans la zone sahélienne, reste nettement en dessous des autres "
         "villes avec seulement 400 à 600 mm par an, contre 900 à 1500 mm pour "
         "Bobo-Dioulasso et Gaoua au Sud.",

         "Deux années extrêmes ressortent clairement : 2002-2003, qui constitue la "
         "période la plus sèche des 33 ans analysés, et 2020, année exceptionnellement "
         "pluvieuse notamment à Bobo-Dioulasso qui dépasse 1500 mm.",

         "La variabilité interannuelle est très forte : d'une année à l'autre, les "
         "écarts peuvent dépasser 400 à 500 mm. Ce phénomène représente le principal "
         "défi pour les agriculteurs, qui ne peuvent pas planifier leurs semis avec "
         "certitude d'une année à l'autre.",
     ]),

    ("graphiques/02_climatologie_mensuelle.png",
     "2. Climatologie mensuelle et périodes de semis du maïs",
     [
         "La saison des pluies est fortement concentrée entre juin et septembre dans "
         "toutes les villes. Les mois de janvier, février, mars et décembre sont "
         "pratiquement secs partout.",

         "Les barres rouges (mai-juin) indiquent la période optimale de semis du maïs. "
         "Pour Bobo-Dioulasso et Gaoua (Sud), les précipitations de mai atteignent "
         "déjà 4 à 5 mm par jour, ce qui est suffisant pour démarrer les semis "
         "dès la fin mai.",

         "Pour Ouagadougou, Dedougou et Fada N'Gourma (Centre), le mois de mai reste "
         "trop sec (~2-3 mm/jour). Le mois de juin est plus sûr pour semer le maïs "
         "dans ces zones.",

         "À Dori (Nord-Sahel), les barres rouges de mai-juin sont inférieures à "
         "2 mm/jour, ce qui est insuffisant pour le maïs qui nécessite au minimum "
         "5 mm/jour. Le mil et le sorgho, beaucoup plus résistants à la sécheresse, "
         "sont les cultures recommandées dans cette zone, avec un semis en juillet.",
     ]),

    ("graphiques/03_tendance_temperature.png",
     "3. Évolution des températures maximales (1990-2023)",
     [
         "Les températures maximales annuelles moyennes sont en hausse dans toutes les "
         "villes du Burkina Faso sur la période analysée. Ce réchauffement est réel "
         "et documenté par les données NASA POWER.",

         "Bobo-Dioulasso enregistre la hausse la plus importante avec +1,0°C en "
         "33 ans. C'est particulièrement préoccupant car cette ville est la principale "
         "zone agricole du pays. Ouagadougou suit avec +0,7°C.",

         "Chaque degré supplémentaire de température réduit le rendement du maïs de "
         "5 à 10 % selon les études agronomiques. La hausse de température augmente "
         "également la transpiration des plantes, ce qui accroît leurs besoins en eau "
         "au moment même où les pluies restent irrégulières.",

         "Dori reste la ville la plus chaude du pays avec une température max moyenne "
         "dépassant 36°C, une valeur à la limite du supportable pour la plupart des "
         "cultures vivrières.",
     ]),

    ("graphiques/04_debut_saison_pluies.png",
     "4. Jour de début de la saison des pluies par ville",
     [
         "Les tendances en tirets montrent une légère descente pour la plupart des "
         "villes, ce qui signifie que la saison des pluies commence un peu plus tôt "
         "qu'en 1990. Cette évolution est une bonne nouvelle pour les agriculteurs "
         "de la zone Centre et Sud.",

         "Le gradient Nord-Sud est très marqué : Gaoua et Bobo-Dioulasso voient leur "
         "saison démarrer autour du 1er mai, tandis qu'Ouagadougou et Dedougou "
         "démarrent autour du 1er juin. Dori et Fada N'Gourma attendent souvent "
         "jusqu'en juillet.",

         "La variabilité du début de saison à Dori est alarmante. Certaines années, "
         "la première pluie significative tombe en mai ; d'autres années, pas avant "
         "août. Cette imprévisibilité rend toute planification agricole très difficile "
         "dans le Nord du pays.",

         "Pour un agriculteur à Ouagadougou, attendre que 20 mm soient tombés en "
         "3 jours consécutifs (critère utilisé dans cette analyse) avant de semer "
         "est une stratégie raisonnable pour éviter les faux départs de saison.",
     ]),

    ("graphiques/05_anomalies_precipitations.png",
     "5. Anomalies nationales des précipitations",
     [
         "Ce graphique révèle un basculement climatique majeur au Burkina Faso : "
         "la période 1990-2004 est dominée par des années déficitaires (barres "
         "rouges), tandis que la période 2008-2023 est dominée par des années "
         "excédentaires (barres bleues).",

         "L'année 2002 est la pire de la série avec une anomalie de -29 % par rapport "
         "à la moyenne nationale. Elle correspond à une sécheresse sévère qui a "
         "touché l'ensemble du Sahel ouest-africain et provoqué des crises "
         "alimentaires dans plusieurs pays.",

         "L'année 1990 est également très sèche (-21 %), marquant un début de période "
         "difficile qui s'est prolongée jusqu'au milieu des années 2000.",

         "Depuis 2008, les anomalies positives se multiplient et atteignent +16 % "
         "à +18 % sur plusieurs années consécutives. Cette reprise des pluies est "
         "cohérente avec les observations scientifiques sur la ré-verdification "
         "partielle du Sahel depuis les années 1990.",
     ]),
]

CONCLUSIONS = [
    "Le Burkina Faso a connu une transition climatique notable entre 1990 et 2023 : "
    "une longue période sèche de 1990 à 2004, suivie d'une reprise progressive des "
    "précipitations depuis 2008. Cette tendance positive est visible dans toutes les "
    "six villes analysées.",

    "Malgré la hausse des pluies, le réchauffement des températures (+0,7°C à +1,0°C "
    "selon les villes) constitue une menace croissante pour la productivité agricole. "
    "L'effet combiné de la chaleur et de la variabilité des pluies maintient les "
    "agriculteurs dans une situation de vulnérabilité structurelle.",

    "Le gradient Nord-Sud demeure le facteur déterminant de la géographie agricole "
    "du pays. La zone Sud (Bobo-Dioulasso, Gaoua) bénéficie de 1000 à 1100 mm/an "
    "avec une saison fiable démarrant en mai. La zone sahélienne (Dori) reçoit "
    "seulement 500 mm/an avec une très forte variabilité.",

    "Recommandations de semis du maïs : fin mai pour le Sud, mi-juin pour le Centre, "
    "et abandon du maïs au profit du mil et sorgho pour le Nord. Ces cultures "
    "traditionnelles restent mieux adaptées aux conditions climatiques sahéliennes.",

    "La forte variabilité interannuelle des précipitations (-29 % à +18 % autour de "
    "la moyenne) est le principal risque pour la sécurité alimentaire. Des systèmes "
    "de stockage de l'eau et une diversification des cultures sont essentiels pour "
    "atténuer l'impact des années sèches.",
]


class RapportPDF(FPDF):

    def header(self):
        self.set_font("Helvetica", "B", 11)
        self.set_fill_color(34, 85, 34)       # vert Burkina
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, "Analyse Météorologique du Burkina Faso  |  NASA POWER 1990-2023",
                  fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def footer(self):
        self.set_y(-13)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}   -  Données : NASA POWER  |  Analyse Python",
                  align="C")

    def titre_section(self, texte):
        self.set_font("Helvetica", "B", 12)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(34, 85, 34)
        self.cell(0, 8, texte, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def paragraphe(self, texte):
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 6, texte)
        self.ln(2)

    def puce(self, texte):
        self.set_font("Helvetica", "", 10)
        self.set_x(self.l_margin + 4)
        self.cell(5, 6, "-")
        self.multi_cell(0, 6, texte)
        self.ln(1)


def generer_pdf():
    pdf = RapportPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)

    # ── Page de titre ──────────────────────────────────────────────
    pdf.add_page()
    pdf.ln(20)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(34, 85, 34)
    pdf.multi_cell(0, 12,
        "Analyse Météorologique\ndu Burkina Faso",
        align="C")
    pdf.ln(4)

    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 8, "Données NASA POWER  |  Période 1990-2023", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # Encadré résumé
    pdf.set_fill_color(245, 250, 245)
    pdf.set_draw_color(34, 85, 34)
    pdf.set_line_width(0.5)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, "Questions traitées", border="B", fill=True,
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    questions = [
        "Comment les précipitations annuelles ont-elles évolué entre 1990 et 2023 ?",
        "Quelle est la meilleure période pour semer le maïs selon la région ?",
        "Le Burkina Faso se réchauffe-t-il, et à quelle vitesse ?",
        "Le début de la saison des pluies se décale-t-il dans le temps ?",
        "Quelles années ont été particulièrement sèches ou pluvieuses ?",
    ]
    for q in questions:
        pdf.puce(q)

    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Villes analysées", border="B", fill=True,
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    villes_info = [
        "Ouagadougou (Centre)   -  12.36°N, 1.53°W",
        "Bobo-Dioulasso (Sud-Ouest)   -  11.18°N, 4.30°W",
        "Dori (Nord-Sahel)   -  14.03°N, 0.03°E",
        "Fada N'Gourma (Est)   -  12.06°N, 0.35°E",
        "Gaoua (Sud-Ouest)   -  10.33°N, 3.18°W",
        "Dedougou (Centre-Ouest)   -  12.46°N, 3.46°W",
    ]
    for v in villes_info:
        pdf.puce(v)

    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5,
        "Source : NASA POWER (power.larc.nasa.gov)  - Paramètres : précipitations "
        "journalières corrigées (PRECTOTCORR), températures min/max (T2M_MIN, T2M_MAX), "
        "humidité relative (RH2M). Communauté : Agriculture (AG).")

    # Encadré outils techniques
    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, "Outils et technologies utilisés", border="B", fill=True,
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    outils = [
        "Python : pandas (manipulation), matplotlib/numpy (visualisation et statistiques)",
        "fpdf2 : génération du rapport PDF",
        "Flask : backend de l'application web avec API REST",
        "Chart.js : graphiques interactifs dans le navigateur",
        "Render : hébergement cloud de l'application web",
        "GitHub : versionnement du code source (dorianeoued/Analyse_meteo_Burkina_Faso)",
    ]
    for o in outils:
        pdf.puce(o)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Notions d'analyse de données appliquées", border="B", fill=True,
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    notions = [
        "Nettoyage des données : remplacement des valeurs sentinelles -999.0 par NaN",
        "Réechantillonnage temporel : agrégation journalier vers mensuel et annuel",
        "Analyse de tendance : régression linéaire (np.polyfit) sur 33 ans",
        "Calcul d'anomalies : écart en % par rapport à la moyenne de référence 1990-2023",
        "Détection d'événement : début de saison = cumul 3 jours consécutifs >= 20 mm",
        "Statistiques descriptives : moyenne, écart-type, min/max par groupe (ville, mois, année)",
    ]
    for n in notions:
        pdf.puce(n)

    # ── Sections graphiques ────────────────────────────────────────
    for img_path, titre, interpretations in GRAPHIQUES:
        pdf.add_page()
        pdf.set_text_color(0, 0, 0)
        pdf.titre_section(titre)

        if os.path.exists(img_path):
            pdf.image(img_path, x=10, w=190)
        else:
            pdf.set_font("Helvetica", "I", 9)
            pdf.cell(0, 8, f"[Image non trouvée : {img_path}]",
                     new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(34, 85, 34)
        pdf.cell(0, 7, "Interprétation", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)

        for texte in interpretations:
            pdf.puce(texte)

    # ── Page conclusions ───────────────────────────────────────────
    pdf.add_page()
    pdf.set_text_color(0, 0, 0)
    pdf.titre_section("Conclusions générales")
    pdf.ln(2)

    for i, texte in enumerate(CONCLUSIONS, 1):
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(34, 85, 34)
        pdf.cell(0, 7, f"Conclusion {i}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)
        pdf.paragraphe(texte)

    pdf.ln(6)
    pdf.titre_section("Recommandations pratiques par zone")
    pdf.ln(2)

    reco = [
        ("Zone Sud (Bobo-Dioulasso, Gaoua)",
         "Pluies abondantes (>1000 mm/an). Maïs semable dès fin mai. "
         "Potentiel pour deux cycles de culture par an."),
        ("Zone Centre (Ouagadougou, Dedougou, Fada N'Gourma)",
         "Pluies modérées (700-850 mm/an). Semis du maïs recommandé mi-juin, "
         "après confirmation de la saison. Sorgho conseillé en complément."),
        ("Zone Nord-Sahel (Dori)",
         "Pluies insuffisantes pour le maïs (<550 mm/an). Privilégier le mil "
         "et le sorgho, semés en juillet. Nécessité de techniques de "
         "conservation de l'eau (zaï, cordons pierreux)."),
    ]
    for zone, texte in reco:
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(34, 85, 34)
        pdf.cell(0, 7, zone, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(0, 6, texte)
        pdf.ln(3)

    # ── Page application web ──────────────────────────────────────
    pdf.add_page()
    pdf.set_text_color(0, 0, 0)
    pdf.titre_section("Application Web Interactive")
    pdf.ln(2)

    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6,
        "Les analyses de ce rapport ont été intégrées dans une application web "
        "interactive déployée sur Render. L'application permet de visualiser "
        "dynamiquement les données météorologiques sans avoir à exécuter de code Python.")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(34, 85, 34)
    pdf.cell(0, 7, "Architecture technique", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    archi = [
        "Backend Flask (Python) : API REST servant les données pré-calculées depuis data.json",
        "Frontend Chart.js : 5 graphiques interactifs avec filtre par ville",
        "Données pré-agrégées : cumul annuel, climatologie mensuelle, températures, "
        "anomalies et début de saison - calculées depuis les 12 418 jours × 6 villes",
        "Déploiement continu via GitHub Actions sur Render (plan gratuit)",
    ]
    for a in archi:
        pdf.puce(a)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(34, 85, 34)
    pdf.cell(0, 7, "Fonctionnalités de l'application", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    fonctions = [
        "Graphique 1 : Cumul annuel des précipitations - toutes villes superposées",
        "Graphique 2 : Climatologie mensuelle avec sélecteur de ville",
        "Graphique 3 : Tendance des températures max par ville",
        "Graphique 4 : Anomalies nationales (bleu = excédent, rouge = déficit)",
        "Graphique 5 : Évolution du début de saison des pluies avec repères calendaires",
        "Tableau de statistiques résumées par ville",
    ]
    for f in fonctions:
        pdf.puce(f)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(34, 85, 34)
    pdf.cell(0, 7, "Code source", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6,
        "Le code source complet est disponible sur GitHub :\n"
        "github.com/dorianeoued/Analyse_meteo_Burkina_Faso\n\n"
        "Fichiers principaux :\n"
        "  - fetch_data.py    : téléchargement NASA POWER\n"
        "  - prepare_data.py  : pré-calcul des agrégations vers data.json\n"
        "  - app.py           : serveur Flask et API REST\n"
        "  - script.js        : dashboard Chart.js\n"
        "  - render.yaml      : configuration de déploiement")

    # ── Sauvegarde ─────────────────────────────────────────────────
    sortie = "rapport_meteo_burkina.pdf"
    pdf.output(sortie)
    print(f"\nRapport PDF genere : {sortie}")
    print(f"Taille : {os.path.getsize(sortie) / 1024:.0f} Ko")


if __name__ == "__main__":
    generer_pdf()

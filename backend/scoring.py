# scoring.py - utilities to convert Nutri-Score / Eco-Score letters to numeric
# scores and compute a global team score.

from typing import List, Dict, Tuple

NUTRI_MAP = {
    "A": 95,
    "B": 80,
    "C": 65,
    "D": 45,
    "E": 25,
}

ECO_MAP = {
    "A+": 100,
    "A": 90,
    "B": 75,
    "C": 60,
    "D": 40,
    "E": 25,
    "F": 10,
}


def nutri_to_score(letter: str) -> int:
    if not letter:
        return 50
    return NUTRI_MAP.get(letter.upper(), 50)


def eco_to_score(letter: str) -> int:
    if not letter:
        return 50
    return ECO_MAP.get(letter.upper(), 50)

def coach_feedback(items):
    sugar = average(items, "sugars_100g")
    fiber = average(items, "fiber_100g")
    nova = average(items, "nova_group")
    eco = average(items, "ecoScore")

    messages = []

    if sugar > 12:
        messages.append("⚽ Beaucoup de sucres rapides → ton équipe est très offensive, mais risque la fatigue après la mi-temps.")
    if fiber < 2:
        messages.append("🛡️ Peu de fibres → ta défense est faible, tu manques de stabilité.")
    if nova >= 3:
        messages.append("🟥 Certains produits très transformés → attention aux cartons rouges côté nutrition.")
    if eco < 40:
        messages.append("🌍 Impact environnemental élevé → cartons côté écologie.")

    if not messages:
        messages.append("🌟 Super équilibre : une vraie équipe championne !")

    return messages

def average(items, key):
    """Retourne la moyenne d'un champ nutritionnel OFF (ex: sugars_100g)."""
    values = []
    for p in items:
        v = p.get("kcal") if key == "kcal" else p.get(key)
        try:
            v = float(v)
            values.append(v)
        except (TypeError, ValueError):
            continue
    return sum(values) / len(values) if values else 0



def compute_team_score(products: List[Dict]) -> Dict:
    """Compute average Nutri/Eco scores and a final score with bonuses/maluses.

    Each product dict should contain:
      - nutriScoreLetter
      - ecoScoreLetter
      - tags: list[str] (may include 'seasonal', 'local', 'ultra_processed')
    """

    if not products:
        return {
            "nutriAvg": 0,
            "ecoAvg": 0,
            "finalScore": 0,
            "bonuses": [],
            "penalties": [],
        }

    nutri_values = []
    eco_values = []
    seasonal_count = 0
    local_count = 0
    ultra_processed_count = 0

    for p in products:
        # Nutri
        nutri = p.get("nutriScoreLetter")
        if not nutri or len(nutri) > 1:  # cas "N.A", "E.D", "EA+", etc.
            nutri = "C"  # valeur neutre
        nutri_values.append(nutri_to_score(nutri))

        # Eco
        eco = p.get("ecoScoreLetter")
        if not eco or len(eco) > 1:  # cas "EA+" ou "NOT-APPLICABLE"
            eco = "C"
        eco_values.append(eco_to_score(eco))

        # Tags robustes
        tags = p.get("tags")
        if not isinstance(tags, list):
            tags = []

        tags = p.get("tags") or []
        if "seasonal" in tags:
            seasonal_count += 1
        if "local" in tags:
            local_count += 1
        if "ultra_processed" in tags:
            ultra_processed_count += 1

    avg = lambda arr: sum(arr) / len(arr) if arr else 0.0

    nutri_avg = round(avg(nutri_values))
    eco_avg = round(avg(eco_values))

    # base final score: 60% Nutri, 40% Eco
    final_score = round(nutri_avg * 0.6 + eco_avg * 0.4)
    bonuses = []
    penalties = []

    n = len(products)
    half = (n + 1) // 2  # majority threshold

    if seasonal_count >= half:
        final_score += 5
        bonuses.append("+5 : beaucoup de produits de saison")
    if local_count >= half:
        final_score += 5
        bonuses.append("+5 : majorité de produits locaux")
    if ultra_processed_count >= half:
        final_score -= 8
        penalties.append("-8 : trop de produits ultra transformés")

    final_score = max(0, min(100, final_score))

    return {
        "nutriAvg": nutri_avg,
        "ecoAvg": eco_avg,
        "finalScore": final_score,
        "bonuses": bonuses,
        "penalties": penalties,
        "feedback": coach_feedback(products)

    }

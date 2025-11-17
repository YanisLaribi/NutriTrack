# sample_data.py - static data for demo (products, bosses, leaderboard)

sample_products = [
    {
        "barcode": "3017620422003",
        "name": "Pâte à tartiner noisette",
        "brand": "Sweet & Choco",
        "nutriScoreLetter": "D",
        "ecoScoreLetter": "E",
        "imageUrl": "https://via.placeholder.com/96",
        "kcal": 550,
        "tags": ["ultra_processed"],
    },
    {
        "barcode": "3017620422004",
        "name": "Brocoli frais",
        "brand": "Bio Marché",
        "nutriScoreLetter": "A",
        "ecoScoreLetter": "A+",
        "imageUrl": "https://via.placeholder.com/96",
        "kcal": 34,
        "tags": ["seasonal", "local"],
    },
    {
        "barcode": "3017620422005",
        "name": "Quinoa bio",
        "brand": "Graines du Monde",
        "nutriScoreLetter": "A",
        "ecoScoreLetter": "B",
        "imageUrl": "https://via.placeholder.com/96",
        "kcal": 368,
        "tags": ["local"],
    },
    {
        "barcode": "3017620422006",
        "name": "Saumon fumé",
        "brand": "Océan",
        "nutriScoreLetter": "A",
        "ecoScoreLetter": "D",
        "imageUrl": "https://via.placeholder.com/96",
        "kcal": 208,
        "tags": [],
    },
]

bosses = [
    {"id": "burger-king", "name": "Le Roi Burger", "requiredScore": 40, "rewardPieces": 2},
    {"id": "soda-lord", "name": "Capitaine Soda", "requiredScore": 50, "rewardPieces": 3},
    {"id": "pizza-lord", "name": "Seigneur Pizza", "requiredScore": 60, "rewardPieces": 4},
    {"id": "candy-baron", "name": "Baron Bonbon", "requiredScore": 70, "rewardPieces": 5},
]

leaderboard = [
    {"country": "FR", "name": "HealthyChampion", "points": 9850},
    {"country": "US", "name": "NutriMaster", "points": 9720},
    {"country": "DE", "name": "EcoWarrior", "points": 9680},
    {"country": "ES", "name": "FoodXIPro", "points": 9540},
    {"country": "IT", "name": "GreenTeam", "points": 9420},
    {"country": "FR", "name": "VeggieKing", "points": 9310},
    {"country": "GB", "name": "BalancedLife", "points": 9200},
]

contributed_products = []  # in-memory only

# -------------------------------------------------------------
# 🔥 AUTO-GENERATE 100 DEMO PRODUCTS
# -------------------------------------------------------------

# Listes pour rendre l'affichage plus réaliste
demo_names = [
    "Pomme rouge", "Banane", "Yaourt nature", "Granola", "Pain complet",
    "Riz brun", "Poulet rôti", "Pâtes complètes", "Orange", "Boisson sportive",
    "Avoine", "Beurre de cacahuète", "Fromage blanc", "Oeufs", "Brocoli",
    "Lait demi-écrémé", "Jus d'orange", "Céréales chocolatées", "Chips",
    "Pizza surgelée", "Thon en boîte", "Saumon grillé", "Pomme de terre",
    "Carottes fraîches", "Pois chiches", "Haricots rouges", "Eau minérale",
    "Soda", "Barre énergétique", "Biscuits", "Tomates cerises", "Lait d’amande",
    "Tofu", "Steak haché", "Gaufres", "Miel", "Confiture", "Chocolat noir",
    "Café", "Thé vert", "Smoothie", "Raisins", "Pâtes fraîches",
    "Pommes de terre sautées", "Couscous", "Légumes grillés", "Betterave",
    "Pois verts", "Maïs doux", "Oignon", "Ail", "Gingembre", "Thé glacé"
]

nutri_choices = ["A", "B", "C", "D", "E"]
eco_choices   = ["A+", "A", "B", "C", "D", "E"]

# Générer 100 aliments
for i in range(1, 101):
    sample_products.append({
        "barcode": f"900000{i:04d}",   # barcode = 9000000001, 9000000002, etc.
        "name": demo_names[i % len(demo_names)],
        "brand": "FoodDemo",
        "nutriScoreLetter": nutri_choices[i % 5],
        "ecoScoreLetter": eco_choices[i % 6],
        "imageUrl": "https://via.placeholder.com/96",
        "kcal": 50 + (i % 400),
        "tags": [],
    })


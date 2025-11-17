from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import httpx
from pathlib import Path
from typing import List, Dict

from scoring import compute_team_score
from sample_data import sample_products, bosses, leaderboard, contributed_products

from database import engine
from models import Base


from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import CoachQuestion


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = FastAPI(title="Food XI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/", include_in_schema=False)
async def serve_frontend():
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)


OFF_BASE = "https://world.openfoodfacts.org/api/v2"


async def fetch_off_product(barcode: str) -> Dict | None:
    url = f"{OFF_BASE}/product/{barcode}.json"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        print("Error contacting OFF:", e)
        return None

    if data.get("status") != 1:
        return None

    p = data.get("product", {})
    nutri = (p.get("nutriscore_grade") or "").upper() or None
    eco = (p.get("ecoscore_grade") or "").upper() or None
    nutriments = p.get("nutriments", {})

    prod = {
        "barcode": barcode,
        "name": p.get("product_name") or "Produit sans nom",
        "brand": p.get("brands") or "",
        "nutriScoreLetter": nutri or "C",
        "ecoScoreLetter": eco or "C",
        "imageUrl": p.get("image_small_url")
        or p.get("image_front_small_url")
        or "",
        "kcal": nutriments.get("energy-kcal_100g"),
        "tags": [],  # could be inferred from NOVA, categories, etc.
    }
    return prod


def find_local_product(barcode: str) -> Dict | None:
    for p in sample_products + contributed_products:
        if p.get("barcode") == barcode:
            return p
    return None


@app.get("/api/health")
async def health():
    return {"ok": True, "message": "Food XI FastAPI backend running"}


@app.get("/api/product/{barcode}")
async def get_product(barcode: str):
    # 1) try local
    prod = find_local_product(barcode)
    if not prod:
        # 2) try OFF
        prod = await fetch_off_product(barcode)

    if not prod:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    return prod


@app.get("/api/products")
async def get_products():
    # merged list (no dedup for simplicity)
    return sample_products + contributed_products


from pydantic import BaseModel


class TeamPayload(BaseModel):
    items: List[str]


@app.post("/api/team/score")
async def team_score(payload: TeamPayload):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Liste 'items' vide")

    products: List[Dict] = []
    for barcode in payload.items:
        prod = find_local_product(barcode)
        if not prod:
            prod = await fetch_off_product(barcode)
        if prod:
            products.append(prod)

    if not products:
        raise HTTPException(
            status_code=404,
            detail="Aucun produit valide trouvé pour cette équipe",
        )

    score_data = compute_team_score(products)
    score_data["products"] = products
    return score_data


@app.get("/api/story/bosses")
async def story_bosses():
    return bosses


class StoryFightPayload(BaseModel):
    bossId: str
    teamScore: int


@app.post("/api/story/fight")
async def story_fight(payload: StoryFightPayload):
    boss = next((b for b in bosses if b["id"] == payload.bossId), None)
    if not boss:
        raise HTTPException(status_code=404, detail="Boss introuvable")

    win = payload.teamScore >= boss["requiredScore"]
    return {
        "boss": boss,
        "win": win,
        "piecesWon": boss["rewardPieces"] if win else 0,
    }


@app.get("/api/leaderboard")
async def get_leaderboard():
    return leaderboard


class ContribPayload(BaseModel):
    name: str
    brand: str | None = ""
    barcode: str
    nutriScoreLetter: str
    ecoScoreLetter: str


@app.post("/api/add-product")
async def add_product(payload: ContribPayload):
    payload_dict = payload.dict()
    prod = {
        "barcode": payload_dict["barcode"],
        "name": payload_dict["name"],
        "brand": payload_dict.get("brand") or "",
        "nutriScoreLetter": payload_dict["nutriScoreLetter"].upper(),
        "ecoScoreLetter": payload_dict["ecoScoreLetter"].upper(),
        "imageUrl": "",
        "kcal": None,
        "tags": [],
    }
    contributed_products.append(prod)
    return {"ok": True, "product": prod}

class CoachQuestion(BaseModel):
    question: str


Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/coach/ask")
def coach_ask(data: dict, db: Session = Depends(get_db)):
    question = data.get("question", "")

    if not question:
        return {"error": "question vide"}

    # Pour l’instant : juste une réponse fixe
    answer = "Bonne question ! Je suis encore en apprentissage… mais bientôt je pourrai répondre 😉"

    q = CoachQuestion(question=question, answer=answer)
    db.add(q)
    db.commit()
    db.refresh(q)

    return {
        "id": q.id,
        "question": q.question,
        "answer": q.answer
    }

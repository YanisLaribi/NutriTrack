const API_BASE = window.location.origin;

const screens = ["home", "scan", "search", "team", "story", "leaderboard", "contribute"];

function showScreen(name) {
  screens.forEach((s) => {
    document.getElementById(`screen-${s}`).classList.add("hidden");
  });
  document.getElementById(`screen-${name}`).classList.remove("hidden");
}

function addToTeamPhase(row, item) {
    if (row.length >= 3) return; // max 3 items
    row.push(item);
    renderTeam();
}

function backHome() {
  showScreen("home");
}

showScreen("home");
showCoachAskMode();


let coachVoiceBtn = null;

window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded.");
};

document.addEventListener("DOMContentLoaded", () => {
    coachVoiceBtn = document.getElementById("coach-voice-btn");
});

const coachFacts = [
    "Un bon petit-déjeuner avant le match aide ton cerveau à réagir plus vite.",
    "Les fibres (Nutri-Score A/B) donnent une énergie plus stable et évitent les coups de fatigue.",
    "Les boissons sucrées donnent un boost court mais fatiguent plus vite ensuite.",
    "Les protéines après le match aident tes muscles à réparer les micro-déchirures.",
    "Un fruit avant le match = énergie rapide mais naturelle.",
    "Les aliments ultra-transformés fatiguent ton corps plus vite en match.",
    "Boire de l’eau régulièrement augmente ton attention et ta précision.",
];

const recipeSuggestions = [
    "Wrap énergie : un tortilla + ton aliment riche en fibres + un fruit.",
    "Bol de récupération : yogourt + fruit + une source de protéines.",
    "Pasta pré-match : pâtes + légumes + une petite portion protéinée.",
    "Sandwich rapide : pain complet + légumes + une source protéinée.",
    "Smoothie récupération : lait ou boisson végétale + banane + avoine.",
    "Bol vitaminé : quinoa + légumes + ton aliment préféré de ton équipe.",
];


const teamPre = [];
const teamMid = [];
const teamPost = [];

let pendingItem = null;

// OUVRE LE MODAL
function addToTeam(barcode, name, nutri, eco) {
    pendingItem = { barcode, name, nutri, eco };
    document.getElementById("phase-modal").classList.remove("hidden");
}

// GÈRE LES CHOIX
document.querySelectorAll(".modal-choice").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!pendingItem) return;

        const choice = btn.dataset.choice;

        if (choice === "1") addToTeamPhase(teamPre, pendingItem);
        if (choice === "2") addToTeamPhase(teamMid, pendingItem);
        if (choice === "3") addToTeamPhase(teamPost, pendingItem);

        pendingItem = null;
        document.getElementById("phase-modal").classList.add("hidden");
    });
});

// ANNULER
document.getElementById("phase-modal-cancel").onclick = () => {
    pendingItem = null;
    document.getElementById("phase-modal").classList.add("hidden");
};

// Bouton annuler
document.getElementById("phase-modal-cancel").onclick = () => {
    pendingItem = null;
    document.getElementById("phase-modal").classList.add("hidden");
};


// -------------------- DARK / LIGHT MODE -------------------------

// Applique le thème sauvegardé
function applySavedTheme() {
    const saved = localStorage.getItem("theme");
    const btn = document.getElementById("theme-btn");

    if (!btn) return;

    if (saved === "dark") {
        document.body.classList.add("dark");
        btn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        btn.textContent = "🌙";
    }
}

// Change le thème
function toggleTheme() {
    const btn = document.getElementById("theme-btn");

    if (!btn) return;

    if (document.body.classList.contains("dark")) {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        btn.textContent = "🌙";
    } else {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        btn.textContent = "☀️";
    }
}

// Initialise au chargement
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-btn");
    if (btn) {
        btn.onclick = toggleTheme;
        applySavedTheme();
    }
});


// Team management
const team = []; // { barcode, name, nutri, eco }

function renderTeam() {
    const r1 = document.getElementById("team-pre");
    const r2 = document.getElementById("team-mid");
    const r3 = document.getElementById("team-post");

    r1.innerHTML = "";
    r2.innerHTML = "";
    r3.innerHTML = "";

    displayRow(teamPre, r1);
    displayRow(teamMid, r2);
    displayRow(teamPost, r3);
}

function showBossPopup(win, bossName, piecesWon, requiredScore, userScore) {
    const popup = document.getElementById("boss-popup");
    const box = document.getElementById("boss-popup-box");

    const icon = document.getElementById("boss-popup-icon");
    const title = document.getElementById("boss-popup-title");
    const msg = document.getElementById("boss-popup-message");

    // Reset animation (permet de rejouer le pop)
    box.classList.remove("animate-pop-boss");
    void box.offsetWidth;
    box.classList.add("animate-pop-boss");

    if (win) {
        icon.src = "/static/Pictures/happyCoach.png";
        title.textContent = "🎉 Victoire !";
        msg.textContent = `Tu as battu ${bossName} ! +${piecesWon} pièces de puzzle ✨`;

        // CONFETTIS 🎊
        launchConfetti();

    } else {
        icon.src = "/static/Pictures/ChatGPT%20Image%2016%20nov.%202025,%2017%20h%2051%20min%2018%20s.png";
        title.textContent = "😢 Défaite…";
        msg.textContent = `Ton score (${userScore}) était trop bas (requis : ${requiredScore}).`;
    }

    popup.classList.remove("hidden");
}

document.getElementById("boss-popup-close").onclick = () => {
    document.getElementById("boss-popup").classList.add("hidden");
};


// Close button
document.getElementById("boss-popup-close").onclick = () => {
    document.getElementById("boss-popup").classList.add("hidden");
};

function displayRow(row, container) {
    for (let i = 0; i < 3; i++) {
        const slot = document.createElement("div");
        slot.className =
            "h-20 relative rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-[11px]";

        if (row[i]) {
            slot.innerHTML = `
                <div class="text-center pointer-events-none">
                    <div class="font-semibold text-[11px]">${row[i].name}</div>
                    <div class="text-[10px]">N:${row[i].nutri} · E:${row[i].eco}</div>
                </div>

                <button class="absolute top-1 right-1 text-red-400 text-xs"
                        onclick="removeItemFromRow('${container.id}', ${i})">✖</button>
            `;
        } else {
            slot.textContent = "Vide";
        }

        container.appendChild(slot);
    }
}


function removeItemFromRow(rowId, index) {

    if (rowId.trim() === "team-pre") {
        teamPre.splice(index, 1);
    }

    if (rowId.trim() === "team-mid") {
        teamMid.splice(index, 1);
    }

    if (rowId.trim() === "team-post") {
        teamPost.splice(index, 1);
    }

    renderTeam();
}


function showCoachAskMode() {
    const bubble = document.getElementById("coach-bubble");

    bubble.innerHTML = `
        <div class="font-semibold mb-1">👋 Pose-moi une question !</div>

        <input id="coach-question-input"
               placeholder="Ta question..."
               class="w-full p-2 rounded bg-white text-black" />

        <button onclick="askCoach()"
                class="mt-2 bg-green-500 text-white px-3 py-1 rounded w-full">
            Envoyer
        </button>
    `;
}
function showCoachAnswerMode(response) {
    const bubble = document.getElementById("coach-bubble");

    bubble.innerHTML = `
        <div class="mb-2">
            <b>🤖 Réponse du Coach :</b><br>
            ${response}
        </div>

        <button id="coach-read-btn"
                class="bg-blue-500 text-white px-3 py-1 rounded w-full mb-2">
            🔊 Écouter
        </button>

        <button onclick="showCoachAskMode()"
                class="bg-gray-300 text-black px-3 py-1 rounded w-full">
            ↩ Retour
        </button>
    `;
}


function showCoachAdviceMode(fact, recipe) {
    const bubble = document.getElementById("coach-bubble");

    bubble.innerHTML = `
        <div class="mb-2">
            💡 ${fact}
        </div>

        <div class="mb-3">
            🍽️ <b>Idée recette :</b> ${recipe}
        </div>

        <!-- BOUTON AUDIO DANS LA BULLE -->
        <button id="coach-voice-btn"
                class="px-2 py-1 bg-indigo-500 rounded-full text-white text-xs flex items-center gap-1">
            🔊
            <span>Écouter</span>
        </button>

        <button onclick="showCoachAskMode()"
                class="mt-3 bg-gray-200 text-black px-3 py-1 rounded w-full text-sm">
            ↩ Revenir aux questions
        </button>
    `;
}


async function askCoach() {
    const question = document.getElementById("coach-question-input").value.trim();
    if (!question) return;

    const knowledge = [
        { keywords: ["protéine"], answer: "Les protéines aident tes muscles à récupérer et se renforcer après un match !" },
        { keywords: ["sucre"], answer: "Le sucre donne de l'énergie rapide mais peut causer un coup de fatigue ensuite." },
        { keywords: ["match", "avant"], answer: "Avant un match, choisis un repas léger riche en glucides." },
        { keywords: ["boire", "eau"], answer: "Boire régulièrement améliore ton endurance et ta concentration !" }
    ];

    let response = "Hmm… je ne suis pas certain, mais garde une alimentation équilibrée ! 💚";

    for (let item of knowledge) {
        if (item.keywords.some(k => question.toLowerCase().includes(k))) {
            response = item.answer;
            break;
        }
    }

    // Affiche la bulle réponse
    showCoachAnswerMode(response);

    // Faire lire la réponse
    document.getElementById("coach-read-btn").onclick = () => {
        const msg = new SpeechSynthesisUtterance(response);
        msg.lang = "fr-FR";
        msg.pitch = 1.2;
        msg.rate = 1.1;
        speechSynthesis.speak(msg);
    };
}



function getBestFrenchVoice() {
    const voices = speechSynthesis.getVoices();

    // Voix françaises recommandées par Chrome
    const preferred = voices.find(v =>
        v.lang.startsWith("fr") &&
        (
            v.name.includes("Google") ||
            v.name.includes("Amélie") ||
            v.name.includes("Thomas") ||
            v.name.includes("Marie")
        )
    );

    // Si aucune voix FR premium dispo → prendre la première FR
    return preferred || voices.find(v => v.lang.startsWith("fr"));
}

async function computeTeam() {

    const barcodes = [
        ...teamPre.map(i => i?.barcode).filter(Boolean),
        ...teamMid.map(i => i?.barcode).filter(Boolean),
        ...teamPost.map(i => i?.barcode).filter(Boolean),
    ];

    if (barcodes.length === 0) {
        alert("Ajoute au moins un aliment !");
        return;
    }

    const res = await fetch(`${API_BASE}/api/team/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: barcodes }),
    });

    if (!res.ok) {
        alert("Erreur lors du calcul !");
        return;
    }

    const data = await res.json();

    // Mettre à jour les scores
    document.getElementById("nutri-avg").textContent = data.nutriAvg;
    document.getElementById("eco-avg").textContent = data.ecoAvg;
    document.getElementById("final-score").textContent = data.finalScore;


    // Fait éducatif
    const fact = coachFacts[Math.floor(Math.random() * coachFacts.length)];

    // Analyse de l'aliment principal
    const food = data.products?.[0];
    const name = food?.name || "cet aliment";

    const kcal = food?.kcal || 0;
    const protein = food?.protein_100g || 0;
    const sugar = food?.sugars_100g || 0;

    let suggestion = "";

    if (sugar > 15)
        suggestion = `⚡ Smoothie énergie : mélange ${name} + banane + eau.`;
    else if (protein > 12)
        suggestion = `💪 Bol de récupération : ${name} + yogourt + fruits.`;
    else if (kcal > 200)
        suggestion = `🍝 Assiette pré-match : ajoute ${name} dans un wrap ou des pâtes.`;
    else
        suggestion = `🥗 Repas équilibré : ${name} + légumes + céréales.`;

    // Feed-back
    showCoachAdviceMode(fact, suggestion);

    const voiceBtn = document.getElementById("coach-voice-btn");

    voiceBtn.onclick = () => {
        const text = `Voici ton conseil du coach ! ${fact}. Et voici une suggestion de recette : ${suggestion}.`;

        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = "fr-FR";
        msg.rate = 1.1;   // vitesse
        msg.pitch = 1.1;  // voix un peu enthousiaste

        // choisir voix réaliste française
        const voice = getBestFrenchVoice();
        if (voice) msg.voice = voice;

        speechSynthesis.cancel();
        speechSynthesis.speak(msg);
    };


    function chooseCuteVoice() {
        const voices = speechSynthesis.getVoices();

        // VRAIES VOIX FR
        const frenchVoices = voices.filter(v =>
            v.lang.includes("fr") ||
            v.name.includes("FR") ||
            v.name.includes("Amélie") ||
            v.name.includes("Thomas") ||
            v.name.includes("Google français")
        );

        // Si on trouve une voix FR : parfait
        if (frenchVoices.length > 0) return frenchVoices[0];

        // Sinon fallback
        return voices[0];
    }





}






// Load product list
async function loadProductList() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json();
    const container = document.getElementById("product-list");
    container.innerHTML = "";
    data.forEach((p) => {
      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between rounded-2xl bg-slate-900/40 px-3 py-2";
      div.innerHTML = `
        <div>
          <div class="text-xs font-semibold">${p.name}</div>
          <div class="text-[10px] text-slate-300">${p.brand || ""}</div>
          <div class="text-[10px] mt-1">
            🅽 ${p.nutriScoreLetter} · 🌍 ${p.ecoScoreLetter}
          </div>
        </div>
        <button class="text-xs px-2 py-1 rounded-lg bg-emerald-500/80"
          onclick="addToTeam('${p.barcode}', '${p.name.replace(/'/g, "\'")}', '${p.nutriScoreLetter}', '${p.ecoScoreLetter}')">
          +
        </button>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

// Scan / barcode search
async function searchScan() {
  const barcode = document.getElementById("scan-barcode").value.trim();
  const container = document.getElementById("scan-result");
  if (!barcode) {
    container.textContent = "Entre un code-barres.";
    return;
  }
  container.textContent = "Recherche...";
  try {
    const res = await fetch(`${API_BASE}/api/product/${barcode}`);
    if (!res.ok) {
      container.textContent = "Produit introuvable.";
      return;
    }
    const p = await res.json();
    container.innerHTML = `
      <div class="mt-2 p-2 rounded-xl bg-slate-900/40">
        <div class="text-xs font-semibold">${p.name}</div>
        <div class="text-[10px] text-slate-300">${p.brand || ""}</div>
        <div class="text-[10px] mt-1">
          🅽 ${p.nutriScoreLetter} · 🌍 ${p.ecoScoreLetter}
        </div>
        <button class="mt-2 text-xs px-2 py-1 rounded-lg bg-emerald-500/80"
          onclick="addToTeam('${p.barcode}', '${p.name.replace(/'/g, "\'")}', '${p.nutriScoreLetter}', '${p.ecoScoreLetter}')">
          Ajouter à l'équipe
        </button>
      </div>
    `;
  } catch (e) {
    console.error(e);
    container.textContent = "Erreur réseau.";
  }
}

// Story / bosses
async function loadBosses() {
  try {
    const res = await fetch(`${API_BASE}/api/story/bosses`);
    const bosses = await res.json();
    const container = document.getElementById("boss-list");
    container.innerHTML = "";
    bosses.forEach((b) => {
      const div = document.createElement("div");
      div.className =
        "rounded-2xl bg-slate-900/40 px-3 py-2 flex items-center justify-between";
      div.innerHTML = `
        <div>
          <div class="text-xs font-semibold">${b.name}</div>
          <div class="text-[10px] text-slate-300">Score recommandé ≥ ${b.requiredScore}</div>
        </div>
        <button class="text-xs px-2 py-1 rounded-lg bg-violet-500/80"
          onclick="fightBoss('${b.id}')">
          Affronter
        </button>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

async function fightBoss(id) {
    const score = Number(document.getElementById("final-score").textContent);

    const res = await fetch(`${API_BASE}/api/story/fight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bossId: id, teamScore: score }),
    });

    const data = await res.json();

    showBossPopup(
        data.win,
        data.boss.name,
        data.piecesWon,
        data.boss.requiredScore,
        score
    );
}



// Leaderboard
async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    const data = await res.json();
    const container = document.getElementById("leaderboard-list");
    container.innerHTML = "";
    data.forEach((row, idx) => {
      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between rounded-2xl bg-slate-900/40 px-3 py-2";
      div.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-xs font-bold">${idx + 1}</div>
          <div class="text-xs">${row.country}</div>
          <div class="text-xs font-semibold">${row.name}</div>
        </div>
        <div class="text-xs">${row.points} pts</div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

// Contribution
async function contribute() {
  const name = document.getElementById("c-name").value.trim();
  const brand = document.getElementById("c-brand").value.trim();
  const barcode = document.getElementById("c-barcode").value.trim();
  const nutri = document.getElementById("c-nutri").value.trim();
  const eco = document.getElementById("c-eco").value.trim();
  const div = document.getElementById("contrib-result");
  if (!name || !barcode || !nutri || !eco) {
    alert("Champs obligatoires manquants.");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/add-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        brand,
        barcode,
        nutriScoreLetter: nutri,
        ecoScoreLetter: eco,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      div.textContent = "Merci ! Ton produit sera pris en compte pour le jeu.";
      // reload list to include new product
      loadProductList();
    } else {
      div.textContent = "Erreur lors de l'envoi.";
    }
  } catch (e) {
    console.error(e);
    div.textContent = "Erreur réseau.";
  }
}



// Preload data
loadProductList();
renderTeam();
loadBosses();
loadLeaderboard();

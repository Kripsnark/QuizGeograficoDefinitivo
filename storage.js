// === GEOQUIZ STORAGE E SETTINGS ===
// Gestione dei salvataggi, statistiche locali, backup e impostazioni (vibrazione)

let vibrationEnabled = true;

function toggleVibration() {
    vibrationEnabled = !vibrationEnabled;
    let btn = document.getElementById("vibe-toggle");
    if (btn) btn.innerText = vibrationEnabled ? "📳" : "📴";
    saveStats();
    if (vibrationEnabled) triggerVibration(30);
}

function triggerVibration(pattern) {
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

let allTimeBestScore = 0; let allTimeBestStreak = 0;
let allTimeFotofinish = 0; let allTimeGrazie = 0;
let allTimeNazioniCount = {}; let allTimeNazioniIgnorate = {}; 
let allTimeBestAvgTime = 0;
let globalPlays = 0;
let recentGamesHistory = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

let statsByLevel = {
    0: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    1: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    2: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    3: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    4: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
    5: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 }
};

function loadStats() {
    let saved = localStorage.getItem('geoQuizStats');
    if (saved) {
        let data = JSON.parse(saved);
        allTimeBestScore = data.bestScore || 0;
        allTimeBestStreak = data.bestStreak || 0;
        allTimeFotofinish = data.fotofinish || 0;
        allTimeGrazie = data.grazie || 0;
        allTimeNazioniCount = data.nazioniCount || {}; 
        allTimeNazioniIgnorate = data.nazioniIgnorate || data.nazioniEvitate || {}; 
        allTimeBestAvgTime = data.bestAvgTime || 0; 
        if (data.statsByLevel) { statsByLevel = Object.assign({}, statsByLevel, data.statsByLevel); }
        globalPlays = data.globalPlays || 0;
        if (data.recentGamesHistory) { recentGamesHistory = data.recentGamesHistory; }
        if (data.vibrationEnabled !== undefined) {
            vibrationEnabled = data.vibrationEnabled;
        }
    }
    let btn = document.getElementById("vibe-toggle");
    if (btn) btn.innerText = vibrationEnabled ? "📳" : "📴";
}

function saveStats() {
    let data = {
        bestScore: allTimeBestScore,
        bestStreak: allTimeBestStreak,
        fotofinish: allTimeFotofinish,
        grazie: allTimeGrazie,
        nazioniCount: allTimeNazioniCount,
        nazioniIgnorate: allTimeNazioniIgnorate, 
        bestAvgTime: allTimeBestAvgTime,
        statsByLevel: statsByLevel,
        globalPlays: globalPlays,
        recentGamesHistory: recentGamesHistory,
        vibrationEnabled: vibrationEnabled
    };
    localStorage.setItem('geoQuizStats', JSON.stringify(data));
}

function exportBackup() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('geoQuizStats') || "{}");
    let node = document.createElement('a');
    node.setAttribute("href", dataStr);
    node.setAttribute("download", "geoquiz_backup.json");
    document.body.appendChild(node);
    node.click();
    node.remove();
}

function importBackup(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let contents = e.target.result;
            JSON.parse(contents); 
            localStorage.setItem('geoQuizStats', contents);
            loadStats();
            alert("✅ Salvataggio importato con successo!");
            if (typeof closeModal === "function") closeModal(); 
            if (typeof openRecords === "function") openRecords(); 
        } catch(err) { alert("❌ File di salvataggio non valido!"); }
    };
    reader.readAsText(file);
}

window.clearAllData = function() {
    if (confirm("⚠️ ATTENZIONE! Vuoi davvero eliminare TUTTI i record, le statistiche e la cronologia delle nazioni? L'azione è irreversibile!")) {
        localStorage.removeItem('geoQuizStats');
        allTimeBestScore = 0; allTimeBestStreak = 0;
        allTimeFotofinish = 0; allTimeGrazie = 0;
        allTimeNazioniCount = {}; allTimeNazioniIgnorate = {}; 
        allTimeBestAvgTime = 0;
        globalPlays = 0;
        recentGamesHistory = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
        statsByLevel = {
            0: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            1: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            2: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            3: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            4: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
            5: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 }
        };
        alert("✅ Dati eliminati con successo.");
        if (typeof closeModal === "function") closeModal(); 
    }
};

// Caricamento immediato all'avvio
loadStats();
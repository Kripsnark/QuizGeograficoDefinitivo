// === GEOQUIZ STORAGE E SETTINGS ===
// Gestione dei salvataggi, statistiche locali, backup e impostazioni (vibrazione)

let vibrationEnabled = true;
let voiceSpeed = 1.1; // Velocità di default

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

window.updateVoiceSpeed = function(val) {
    voiceSpeed = parseFloat(val);
    document.getElementById('voice-speed-label').innerText = voiceSpeed.toFixed(1) + 'x';
    saveStats();
};

let allTimeBestScore = 0; let allTimeBestStreak = 0;
let allTimeFotofinish = 0; let allTimeGrazie = 0;
let allTimeNazioniCount = {}; let allTimeNazioniIgnorate = {}; 
let allTimeBestAvgTime = 0;
let globalPlays = 0;
let recentGamesHistory = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }; // Aggiunti livelli 6 e 7

let statsByLevel = {
    0: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    1: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    2: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    3: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
    4: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
    5: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
    6: { 
        plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, 
        progress: {
            sprint_bandiere: 0, sprint_stati: 0, sprint_capitali: 0,
            onu_bandiere: 0, onu_stati: 0, onu_capitali: 0,
            totale_bandiere: 0, totale_stati: 0, totale_capitali: 0
        } 
    },
    7: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 }
};

window.clearAllData = function() {
    if (confirm("⚠️ ATTENZIONE! Vuoi davvero eliminare TUTTI i record, le statistiche e la cronologia delle nazioni? L'azione è irreversibile!")) {
        localStorage.removeItem('geoQuizStats');
        allTimeBestScore = 0; allTimeBestStreak = 0;
        allTimeFotofinish = 0; allTimeGrazie = 0;
        allTimeNazioniCount = {}; allTimeNazioniIgnorate = {}; 
        allTimeBestAvgTime = 0;
        globalPlays = 0;
        recentGamesHistory = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        statsByLevel = {
            0: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            1: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            2: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            3: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            4: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
            5: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
            6: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, progress: { sprint_bandiere: 0, sprint_stati: 0, sprint_capitali: 0, onu_bandiere: 0, onu_stati: 0, onu_capitali: 0, totale_bandiere: 0, totale_stati: 0, totale_capitali: 0 } },
            7: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 }
        };
        alert("✅ Dati eliminati con successo.");
        if (typeof closeModal === "function") closeModal(); 
    }
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
        if (data.vibrationEnabled !== undefined) vibrationEnabled = data.vibrationEnabled;
        if (data.voiceSpeed !== undefined) voiceSpeed = data.voiceSpeed; // AGGIUNTO
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
        vibrationEnabled: vibrationEnabled,
        voiceSpeed: voiceSpeed // AGGIUNTO
    };
    localStorage.setItem('geoQuizStats', JSON.stringify(data));
}

function exportBackup() {
    // 1. Recupera i dati principali (che hai già raggruppato in geoQuizStats)
    let statsData = JSON.parse(localStorage.getItem('geoQuizStats') || "{}");
    
    // 2. Aggiungi le altre chiavi di salvataggio "esterne" a geoQuizStats
    statsData.debiti = JSON.parse(localStorage.getItem('geoQuizDebiti')) || [];
    statsData.nationStreaks = JSON.parse(localStorage.getItem('geoQuizNationStreaks')) || {};
    statsData.badges = localStorage.getItem('geoQuizBadges') || "{}";
    statsData.perfectLevels = localStorage.getItem('geoQuizPerfectLevels') || "[]";

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(statsData));
    let node = document.createElement('a');
    node.setAttribute("href", dataStr);
    
    let d = new Date();
    let ds = d.toLocaleDateString('it-IT').replace(/\//g, '-') + "_" + d.toTimeString().split(' ')[0].replace(/:/g, '-');
    node.setAttribute("download", `GeoQuiz_Backup_${ds}.json`);
    
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
            let importedData = JSON.parse(contents); 
            
            // Estrae le chiavi "esterne" prima di salvare il blocco principale
            if (importedData.debiti !== undefined) {
                localStorage.setItem('geoQuizDebiti', JSON.stringify(importedData.debiti));
                if (typeof debiti !== 'undefined') debiti = importedData.debiti;
                delete importedData.debiti;
            }
            if (importedData.nationStreaks !== undefined) {
                localStorage.setItem('geoQuizNationStreaks', JSON.stringify(importedData.nationStreaks));
                delete importedData.nationStreaks;
            }
            if (importedData.badges !== undefined) {
                localStorage.setItem('geoQuizBadges', importedData.badges);
                if (typeof userBadges !== 'undefined') {
                    userBadges = JSON.parse(importedData.badges);
                }
                delete importedData.badges;
            }
            if (importedData.perfectLevels !== undefined) {
                localStorage.setItem('geoQuizPerfectLevels', importedData.perfectLevels);
                delete importedData.perfectLevels;
            }

            // Salva il resto come stats principali
            localStorage.setItem('geoQuizStats', JSON.stringify(importedData));
            loadStats();
            
            alert("✅ Salvataggio importato con successo! Il Medagliere e i record sono stati aggiornati.");
            if (typeof closeModal === "function") closeModal(); 
            if (typeof openRecords === "function") openRecords(); 
            
            // Aggiorna visivamente il pulsante del recupero debiti se siamo nel menu
            let btnVendetta = document.getElementById("btn-vendetta");
            if (btnVendetta) {
                let debList = JSON.parse(localStorage.getItem('geoQuizDebiti')) || [];
                if (debList.length >= 5) {
                    btnVendetta.style.display = "block";
                    btnVendetta.innerHTML = `<strong>🎯 RECUPERO DEBITI</strong><div class="level-desc">${debList.length} in sospeso</div>`;
                } else {
                    btnVendetta.style.display = "none";
                }
            }
            
        } catch(err) { 
            alert("❌ File di salvataggio non valido!"); 
            console.error(err);
        }
    };
    reader.readAsText(file);
}

window.clearAllData = function() {
    if (confirm("⚠️ ATTENZIONE! Vuoi davvero eliminare TUTTI i record, lo storico partite, i trofei e i debiti accumulati? L'azione è irreversibile!")) {
        // Cancella i dati base
        localStorage.removeItem('geoQuizStats');
        localStorage.removeItem('geoQuizAutoSave');
        
        // Cancella le nuove chiavi
        localStorage.removeItem('geoQuizDebiti');
        localStorage.removeItem('geoQuizNationStreaks');
        localStorage.removeItem('geoQuizBadges');
        localStorage.removeItem('geoQuizPerfectLevels');
        
        // Resetta le variabili in memoria
        allTimeBestScore = 0; allTimeBestStreak = 0;
        allTimeFotofinish = 0; allTimeGrazie = 0;
        allTimeNazioniCount = {}; allTimeNazioniIgnorate = {}; 
        allTimeBestAvgTime = 0;
        globalPlays = 0;
        if (typeof userBadges !== 'undefined') userBadges = {};
        if (typeof debiti !== 'undefined') debiti = [];
        
        recentGamesHistory = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        statsByLevel = {
            0: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            1: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            2: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            3: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 },
            4: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
            5: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, fotofinish: 0, grazie: 0 },
            6: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0, progress: { sprint_bandiere: 0, sprint_stati: 0, sprint_capitali: 0, onu_bandiere: 0, onu_stati: 0, onu_capitali: 0, totale_bandiere: 0, totale_stati: 0, totale_capitali: 0 } },
            7: { plays: 0, bestScore: 0, bestStreak: 0, bestAvgTime: 0 }
        };
        
        alert("✅ Dati eliminati con successo.");
        if (typeof closeModal === "function") closeModal();
        location.reload(); // Ricarica per pulire completamente l'interfaccia
    }
};

// Caricamento immediato all'avvio
loadStats();
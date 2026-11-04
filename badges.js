// === SISTEMA BADGE E TROFEI ===

const SVG_ICONS = {
    vendicatore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    conquistatore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10"/><path d="M17 4v8a5 5 0 0 1-10 0V4"/><path d="M4 4h3v8a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V4h3"/></svg>`,
    maratoneta: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    inarrestabile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    scheggia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    fotofinish: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
    grazia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10.06 10.06 1 0 0-20 0Z"></path><path d="M12 12v8a2 2 0 0 0 4 0"></path><path d="M12 2v1"></path></svg>`,
    infermiere: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>`,
    veterano: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    lucido: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>`,
    infallibile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>`,
    fenice: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 0-5 3.5-5 9 0 4.5 3 6.5 5 11 2-4.5 5-6.5 5-11 0-5.5-5-9-5-9z"></path></svg>`,
    cyborg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
    sestosenso: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
vololinea: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-4 4-2.5-1-1 1 3.5 3.5 3.5 3.5 1-1-1-2.5 4-4 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"/></svg>`,
    blacklist: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`,
    hub: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    rotta: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16l4-4-4-4"></path><path d="M20 12H11"></path><path d="M7 12h.01"></path><path d="M3 12h.01"></path></svg>`,
    pendolare: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12A10 10 0 0 0 12 2v4a6 6 0 0 1 6 6h4z"></path><path d="M2 12a10 10 0 0 0 10 10v-4a6 6 0 0 1-6-6H2z"></path><polyline points="2 7 2 12 7 12"></polyline><polyline points="22 17 22 12 17 12"></polyline></svg>`
};

const BADGE_INFO = {
    vendicatore: { title: "Visto Rinnovato", desc: "Azzera debiti: la burocrazia è sistemata", tiers: [1, 3, 10] },
    conquistatore: { title: "Esploratore", desc: "Vinci un livello: hai mappato un'area", tiers: [1, 3, 10] },
    maratoneta: { title: "Giramondo", desc: "Risposte totali: viaggi in continuazione", tiers: [16, 31, 61] },
    inarrestabile: { title: "Senza Scalo", desc: "Serie esatta: volo diretto senza fermarsi", tiers: [15, 30, 50] },
    scheggia: { title: "Teletrasporto", desc: "Tempo medio: non usi l'aereo (Soglie L0 dimezzate)", tiers: [15, 10, 5], isInverse: true },
    fotofinish: { title: "Scatto al Gate", desc: "Salvataggi in extremis: passi all'ultimo secondo", tiers: [1, 3, 5] },
    grazia: { title: "Viaggio in Solitaria", desc: "Meno grazie: fai a meno della guida turistica", tiers: [2, 1, 0], isInverse: true },
    infermiere: { title: "Assicurazione di Viaggio", desc: "Cuori extra: copertura perfetta per gli imprevisti", tiers: [3, 5, 10] },
    veterano: { title: "Passaporto Pieno", desc: "Domande giocate: riempi il passaporto di timbri", tiers: [36, 80, 150] },
    lucido: { title: "GPS Umano", desc: "Zero Déjà vu: non passi mai due volte dalla stessa strada", tiers: [1, 1, 1], isSpecial: true },
    infallibile: { title: "Rotta Perfetta", desc: "Vittoria a 0 errori: itinerario calcolato al millimetro", tiers: [1, 1, 1], isSpecial: true },
    fenice: { title: "Sopravvissuto", desc: "Serie con 1 vita: perso nel nulla ma continui ad andare", tiers: [3, 5, 10] },
    cyborg: { title: "Autopilota", desc: "Senza Scalo ORO + Teletrasporto ORO (Macchina perfetta)", tiers: [1, 1, 1], isSpecial: true, isSecret: true },
    sestosenso: { title: "Volo alla Cieca", desc: "Leggenda a L7: navighi a intuito senza guardare", tiers: [1, 1, 1], isSpecial: true, isSecret: true },	
    vololinea: { title: "Volo di Linea", desc: "Usa la stessa nazione in una partita", tiers: [4, 7, 10] },
    blacklist: { title: "Blacklist Doganale", desc: "Ignora la stessa nazione in una partita", tiers: [4, 7, 10] },
    hub: { title: "Hub Principale", desc: "La Top 1 Usata supera la Top 1 Ignorata", tiers: [1, 1, 1] },
    rotta: { title: "Rotta Abbandonata", desc: "Ignora nazione in 10 partite di fila (L1-L4)", tiers: [1, 1, 1] },
    pendolare: { title: "Pendolare", desc: "Usa nazione in più partite di fila (L1-L4)", tiers: [3, 7, 20] }
};

let userBadges = JSON.parse(localStorage.getItem('geoQuizBadges')) || {};

window.checkBadges = function(gameData) {
    let { currentLevel, esatte, isVictory, debitiIniziali, debitiRimasti, bestStreak, avgTime, fotofinish, grazie, cuori, domandeTotali, hasDejavu, erroriTotali, bestStreakOneLife, punteggio, maxVoloDiLinea, maxBlacklist, top1UsataVal, top1IgnorataVal, maxPendolare, maxRotta } = gameData;
    let sessionEarned = []; 
    let storicoAggiornato = false;

    const assegnaTier = (id, rawValue, tier, motivo, isInverse = false, isCumulative = false) => {
        sessionEarned.push({ id, tier, motivo });
        let currentBest = userBadges[id] !== undefined ? userBadges[id] : (isInverse ? 9999 : 0);
        if (isCumulative) {
            userBadges[id] = currentBest + rawValue;
            storicoAggiornato = true;
        } else if ((!isInverse && rawValue > currentBest) || (isInverse && rawValue < currentBest)) {
            userBadges[id] = rawValue;
            storicoAggiornato = true;
        }
    };

    if (currentLevel !== 0) {
        if (esatte >= 60) assegnaTier('maratoneta', esatte, 3, "Superate le 60 risposte");
        else if (esatte >= 30) assegnaTier('maratoneta', esatte, 2, "Superate le 30 risposte");
        else if (esatte >= 15) assegnaTier('maratoneta', esatte, 1, "Superate le 15 risposte");
    }

    if (bestStreak >= 50) assegnaTier('inarrestabile', bestStreak, 3, "Serie di 50 risposte");
    else if (bestStreak >= 30) assegnaTier('inarrestabile', bestStreak, 2, "Serie di 30 risposte");
    else if (bestStreak >= 15) assegnaTier('inarrestabile', bestStreak, 1, "Serie di 15 risposte");

    if (domandeTotali >= 150) assegnaTier('veterano', domandeTotali, 3, "Giocate 150 domande");
    else if (domandeTotali >= 80) assegnaTier('veterano', domandeTotali, 2, "Giocate 80 domande");
    else if (domandeTotali > 35) assegnaTier('veterano', domandeTotali, 1, "Giocate almeno 35 domande");

    if (cuori >= 10) assegnaTier('infermiere', cuori, 3, "Guadagnati 10 cuori extra");
    else if (cuori >= 5) assegnaTier('infermiere', cuori, 2, "Guadagnati 5 cuori extra");
    else if (cuori >= 3) assegnaTier('infermiere', cuori, 1, "Guadagnati 3 cuori extra");

    if (esatte >= 10) {
        if (fotofinish >= 5) assegnaTier('fotofinish', fotofinish, 3, "Salvataggi in extremis: 5");
        else if (fotofinish >= 3) assegnaTier('fotofinish', fotofinish, 2, "Salvataggi in extremis: 3");
        else if (fotofinish >= 1) assegnaTier('fotofinish', fotofinish, 1, "Salvataggi in extremis: 1");

        if (avgTime > 0) {
            if (currentLevel === 0) {
                if (avgTime <= 1.5) assegnaTier('scheggia', avgTime, 3, "Tempo medio ≤ 1.5s (Lv0)", true);
                else if (avgTime <= 4) assegnaTier('scheggia', avgTime, 2, "Tempo medio ≤ 4s (Lv0)", true);
                else if (avgTime <= 10) assegnaTier('scheggia', avgTime, 1, "Tempo medio ≤ 10s (Lv0)", true);
            } else {
                if (avgTime <= 5) assegnaTier('scheggia', avgTime, 3, "Tempo medio ≤ 5s", true);
                else if (avgTime <= 10) assegnaTier('scheggia', avgTime, 2, "Tempo medio ≤ 10s", true);
                else if (avgTime <= 15) assegnaTier('scheggia', avgTime, 1, "Tempo medio ≤ 15s", true);
            }
        }
    }

    if ((currentLevel === 4 || currentLevel === 5) && esatte >= 40) {
        if (grazie <= 0) assegnaTier('grazia', grazie, 3, "Nessuna grazia ricevuta", true);
        else if (grazie <= 1) assegnaTier('grazia', grazie, 2, "Solo 1 grazia ricevuta", true);
        else if (grazie <= 2) assegnaTier('grazia', grazie, 1, "Meno di 3 grazie ricevute", true);
    }

    if (maxVoloDiLinea >= 10) assegnaTier('vololinea', maxVoloDiLinea, 3, "Nazione usata 10 volte");
    else if (maxVoloDiLinea >= 7) assegnaTier('vololinea', maxVoloDiLinea, 2, "Nazione usata 7 volte");
    else if (maxVoloDiLinea >= 4) assegnaTier('vololinea', maxVoloDiLinea, 1, "Nazione usata 4 volte");

    if (maxBlacklist >= 10) assegnaTier('blacklist', maxBlacklist, 3, "Nazione ignorata 10 volte");
    else if (maxBlacklist >= 7) assegnaTier('blacklist', maxBlacklist, 2, "Nazione ignorata 7 volte");
    else if (maxBlacklist >= 4) assegnaTier('blacklist', maxBlacklist, 1, "Nazione ignorata 4 volte");

    if (top1UsataVal >= 3 && top1UsataVal > top1IgnorataVal) {
        assegnaTier('hub', 1, 3, "Top 1 usata maggiore della Top 1 ignorata");
    }

    if (maxRotta >= 10) {
        assegnaTier('rotta', 1, 3, "Nazione ignorata in 10 partite consecutive");
    }

    if (maxPendolare >= 20) assegnaTier('pendolare', maxPendolare, 3, "Nazione usata in 20 partite consecutive");
    else if (maxPendolare >= 7) assegnaTier('pendolare', maxPendolare, 2, "Nazione usata in 7 partite consecutive");
    else if (maxPendolare >= 3) assegnaTier('pendolare', maxPendolare, 1, "Nazione usata in 3 partite consecutive");

    if (currentLevel === 8) {
        let debitiSaldati = debitiIniziali - debitiRimasti;
        if (debitiSaldati >= 10) assegnaTier('vendicatore', debitiSaldati, 3, "Saldati 10+ debiti");
        else if (debitiSaldati >= 3) assegnaTier('vendicatore', debitiSaldati, 2, "Saldati 3+ debiti");
        else if (debitiSaldati >= 1) assegnaTier('vendicatore', debitiSaldati, 1, "Saldato 1 debito");
    }

    if (isVictory && currentLevel !== 0 && currentLevel !== 8) {
        let winsAttuali = (userBadges.conquistatore || 0);
        let tierConq = 0;
        let motivoConq = "";
        
        if (winsAttuali + 1 >= 10) { tierConq = 3; motivoConq = "10 Vittorie Assolute"; }
        else if (winsAttuali + 1 >= 3) { tierConq = 2; motivoConq = "3 Vittorie Assolute"; }
        else { tierConq = 1; motivoConq = "Prima Vittoria Assoluta"; }
        
        assegnaTier('conquistatore', 1, tierConq, motivoConq, false, true);
    }

    if (!hasDejavu && domandeTotali >= 50 && currentLevel !== 0 && currentLevel !== 4) {
        assegnaTier('lucido', 1, 4, "Nessun malus dejavu in 50+ domande");
    }

    if (isVictory && erroriTotali === 0 && currentLevel !== 0 && currentLevel !== 8) {
        assegnaTier('infallibile', 1, 4, "Vittoria impeccabile senza errori");
    }

    // ==========================================
    // INIEZIONE TROFEI IMPOSSIBILI E SEGRETI
    // ==========================================
    if (bestStreakOneLife >= 10) assegnaTier('fenice', bestStreakOneLife, 3, "Serie di 10 con 1 sola vita");
    else if (bestStreakOneLife >= 5) assegnaTier('fenice', bestStreakOneLife, 2, "Serie di 5 con 1 sola vita");
    else if (bestStreakOneLife >= 3) assegnaTier('fenice', bestStreakOneLife, 1, "Serie di 3 con 1 sola vita");

    let hasInarrestabileOro = bestStreak >= 50;
    let hasScheggiaOro = (esatte >= 10 && avgTime > 0 && ((currentLevel === 0 && avgTime <= 2.5) || (currentLevel !== 0 && avgTime <= 5)));
    if (hasInarrestabileOro && hasScheggiaOro) {
        assegnaTier('cyborg', 1, 4, "Riflessi inumani (Combo Oro)");
    }

    if (currentLevel === 7 && punteggio >= 10000) {
        assegnaTier('sestosenso', 1, 4, "Leggenda senza mani");
    }

    if (storicoAggiornato) localStorage.setItem('geoQuizBadges', JSON.stringify(userBadges));
    return sessionEarned; 
};

window.renderBadgeNotification = function(earnedArray) {
    if (!earnedArray || earnedArray.length === 0) return "";
    
    let html = `
    <div class="game-over-section">
        <h3 style="color:#ffd700;">🏆 TROFEI DI SESSIONE</h3>
        <div class="badge-list-container">
    `;
    
    earnedArray.forEach(b => {
        let info = BADGE_INFO[b.id];
        let color = b.tier === 4 ? "#9e9e9e" : (b.tier === 3 ? "#ffd700" : (b.tier === 2 ? "#c0c0c0" : "#cd7f32"));
        let bgLight = b.tier === 4 ? "rgba(158, 158, 158, 0.08)" : (b.tier === 3 ? "rgba(255, 215, 0, 0.08)" : (b.tier === 2 ? "rgba(192, 192, 192, 0.08)" : "rgba(205, 127, 50, 0.08)"));
        
        html += `
            <div class="session-badge-item" style="background-color:${bgLight}; border-left:4px solid ${color};">
                <div class="session-badge-icon" style="color:${color};">
                    ${SVG_ICONS[b.id]}
                </div>
                <div class="session-badge-text-col">
                    <span class="session-badge-title" style="color:${color};">${info.title}</span>
                    <span class="session-badge-desc">${b.motivo}</span>
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    return html;
};

window.renderMedagliere = function() {
    let html = `<div class="game-over-section" style="padding:15px; margin:0; text-align:center;">
                    <div class="medagliere-grid">`;
    
    Object.keys(BADGE_INFO).forEach(b => {
        let info = BADGE_INFO[b];
        let count = userBadges[b];
        let tiers = info.tiers;
        
        // IL FIX: Nasconde completamente i trofei segreti se non li hai ancora sbloccati
        if (info.isSecret && (count === undefined || count === 0)) return;
        
        let color = "#333"; let borderColor = "#333"; let opacity = "0.4"; let bg = "#1a1a1a";
        let recordText = count !== undefined && count !== 9999 ? `Record: ${count}` : "Non sbloccato";
        
        if (info.isSpecial) {
            if (count > 0) { color = "#121212"; borderColor = "#9e9e9e"; opacity = "1"; bg = "#9e9e9e"; recordText = "Sbloccato"; }
        } else if (info.isInverse) {
            if (count !== undefined && count <= tiers[2]) { color = "#121212"; borderColor = "#ffd700"; opacity = "1"; bg = "#ffd700"; } 
            else if (count !== undefined && count <= tiers[1]) { color = "#121212"; borderColor = "#c0c0c0"; opacity = "1"; bg = "#c0c0c0"; } 
            else if (count !== undefined && count <= tiers[0]) { color = "#121212"; borderColor = "#cd7f32"; opacity = "1"; bg = "#cd7f32"; } 
        } else {
            if (count !== undefined && count >= tiers[2]) { color = "#121212"; borderColor = "#ffd700"; opacity = "1"; bg = "#ffd700"; } 
            else if (count !== undefined && count >= tiers[1]) { color = "#121212"; borderColor = "#c0c0c0"; opacity = "1"; bg = "#c0c0c0"; } 
            else if (count !== undefined && count >= tiers[0]) { color = "#121212"; borderColor = "#cd7f32"; opacity = "1"; bg = "#cd7f32"; } 
        }
        
        let hasBadge = opacity === "1";
        let headerColor = hasBadge ? "#121212" : "#888";
        let descColor = hasBadge ? "#333" : "#555";
        
        if (b === 'scheggia' && count !== undefined && count !== 9999) recordText = `Record: ${count}s`;
        
        html += `<div class="medagliere-item" style="background-color:${bg}; border:2px solid ${borderColor}; opacity:${opacity};">
                    <div class="medagliere-icon" style="color:${color};">${SVG_ICONS[b]}</div>
                    <div class="medagliere-title" style="color:${headerColor};">${info.title}</div>
                    <div class="medagliere-desc" style="color:${descColor};">${info.desc}</div>
                    <div class="medagliere-record">${recordText}</div>
                 </div>`;
    });
    
    html += `   </div>
              </div>`;
    return html;
};

window.renderLevelBadge = function(bestStreak) {
    if (!bestStreak || bestStreak < BADGE_INFO.inarrestabile.tiers[0]) return "";
    let tier = bestStreak >= BADGE_INFO.inarrestabile.tiers[2] ? 3 : (bestStreak >= BADGE_INFO.inarrestabile.tiers[1] ? 2 : 1);
    let color = tier === 3 ? "#ffd700" : (tier === 2 ? "#c0c0c0" : "#cd7f32");
    let info = BADGE_INFO.inarrestabile;
    
    let html = `<div class="level-badge-row">
                <div class="level-badge-inner" style="border-left:3px solid ${color};">
                    <div class="level-badge-left">
                        <div class="level-badge-icon" style="color:${color};">${SVG_ICONS.inarrestabile}</div>
                        <span class="level-badge-title" style="color:${color};">${info.title}</span>
                        <span class="level-badge-desc">- ${info.desc}</span>
                    </div>
                    <span class="level-badge-record">Record: ${bestStreak}</span>
                </div></div>`;
    return html;
};
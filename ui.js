// === COSTANTI DOM ===
const heartsEl = document.getElementById("hearts");
const esatteEl = document.getElementById("esatte-counter");
const puntiEl = document.getElementById("punti-counter");
const questionEl = document.getElementById("question");
const inputEl = document.getElementById("answer-input");
const eventBadge = document.getElementById("event-badge");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const surrenderBtn = document.getElementById("surrender-btn");
const gameOverScreen = document.getElementById("game-over-screen");
const errorLogEl = document.getElementById("error-log");
const bandieraContainer = document.getElementById("bandiera-container");
const bandieraImg = document.getElementById("bandiera-img");
const homeBtn = document.getElementById("home-btn");
const timerContainer = document.getElementById("timer-container");
const timerBar = document.getElementById("timer-bar");
const timerStatus = document.getElementById("timer-status");
const comboTracker = document.getElementById("combo-tracker");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const errPanel = document.getElementById("error-feedback-panel");
const errTitle = document.getElementById("error-feedback-title");
const errText = document.getElementById("error-feedback-text");

// === GEOQUIZ UI MANAGER ===
const UI = {
    aggiornaHeader: function(vite, customVite, maxVite, esatte, punteggio, currentLevel, totaleNazioni) {
        if (puntiEl.parentNode.childNodes[0].nodeType === 3) {
            puntiEl.parentNode.childNodes[0].nodeValue = (currentLevel === 6) ? "Progresso: " : "Punti: ";
        }

        if (currentLevel === 6) {
            heartsEl.style.fontSize = "16px";
            heartsEl.innerText = "💀 MORTE IMPROVVISA";
            esatteEl.innerText = esatte + " / " + totaleNazioni;
            let pct = totaleNazioni > 0 ? ((esatte / totaleNazioni) * 100).toFixed(1) : 0;
            puntiEl.innerText = pct + "%";
            return;
        }

        let cuoriStringa = "";
        let currentMaxVite = customVite > 5 ? customVite : maxVite;
        
        heartsEl.style.fontSize = vite > 5 ? "16px" : "26px";

        let loopCount = Math.max(vite, currentMaxVite);
        for(let i=0; i<vite; i++) cuoriStringa += "❤️";
        for(let i=vite; i<loopCount; i++) cuoriStringa += "🖤";
        
        heartsEl.innerText = cuoriStringa;
        esatteEl.innerText = esatte;
        puntiEl.innerText = punteggio;
    },

    mostraSuccesso: function(puntiGuadagnati, nomeInserito, badgeText, badgeBorder, badgeBg = "#2a2a2a", badgeTxtColor = "#fff") {
        inputEl.classList.remove("shake", "wrong-flash", "warning-flash");
        inputEl.classList.add("correct-flash");
        inputEl.disabled = true;
        submitBtn.disabled = true;
        surrenderBtn.style.display = "none";

        if (puntiGuadagnati !== null && puntiGuadagnati !== undefined) {
            inputEl.value = `Corretto! +${puntiGuadagnati}pt - ${nomeInserito}`;
        } else {
            inputEl.value = `Esatto! - ${nomeInserito}`;
        }
        
        if (badgeText && badgeText !== "") {
            eventBadge.innerHTML = badgeText; 
            eventBadge.style.backgroundColor = badgeBg;
            eventBadge.style.color = badgeTxtColor; 
            eventBadge.style.borderColor = badgeBorder;
            eventBadge.style.display = "block";
        } else {
            eventBadge.style.display = "none";
        }

        submitBtn.style.display = "none";
        nextBtn.innerText = "PROSSIMA DOMANDA ➔";
        nextBtn.style.display = "block";
    },

    mostraErrore: function(titolo, testoCorretto, isLevelZero) {
        inputEl.value = "";
        inputEl.classList.add("shake", "wrong-flash");
        inputEl.disabled = true;
        submitBtn.style.display = "none"; 
        surrenderBtn.style.display = "none";
        comboTracker.style.display = "none";

        errTitle.innerText = titolo;
        errText.innerText = "Le risposte corrette erano: " + testoCorretto;
        if (!isLevelZero) errPanel.style.display = "flex";
        
        nextBtn.style.display = "block";
    },

    resetTurno: function() {
        inputEl.classList.remove("correct-flash", "wrong-flash", "shake", "warning-flash");
        inputEl.value = "";
        inputEl.disabled = false;
        inputEl.style.color = "";
        
        eventBadge.style.display = "none";
        eventBadge.innerHTML = "";
        eventBadge.style.backgroundColor = "#2a2a2a";
        eventBadge.style.color = "#fff";
        
        errPanel.style.display = "none";
        nextBtn.style.display = "none";
        submitBtn.style.display = "block";
        submitBtn.disabled = false;
    }
};

// ==========================================
// MODALI E SCHERMATE (Spostati da engine.js)
// ==========================================

function openModal(title, htmlContent) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = htmlContent;
    document.getElementById("modal-overlay").style.display = "flex";
}

function closeModal() { 
    document.getElementById("modal-overlay").style.display = "none"; 
    document.getElementById("modal-body").innerHTML = ""; 
}

window.openSettings = function() {
    let html = `
    <div style="display:flex; flex-direction:column; gap:15px; text-align:center;">
        <div style="display:flex; gap:10px; justify-content:center;">
            <button onclick="toggleVibration(); document.getElementById('btn-vibe-ui').innerText = vibrationEnabled ? '📳 VIBRAZIONE: ON' : '📴 VIBRAZIONE: OFF';" id="btn-vibe-ui" class="menu-btn" style="margin:0;">${vibrationEnabled ? '📳 VIBRAZIONE: ON' : '📴 VIBRAZIONE: OFF'}</button>
            <button onclick="toggleSuoni(); document.getElementById('btn-sound-ui').innerText = suoniAttivi ? '🔊 SUONI: ON' : '🔇 SUONI: OFF';" id="btn-sound-ui" class="menu-btn" style="margin:0;">${suoniAttivi ? '🔊 SUONI: ON' : '🔇 SUONI: OFF'}</button>
        </div>
        <h3 style="color:#f44336; margin:10px 0 0 0; font-size:14px; text-transform:uppercase;">Gestione Dati Avanzata</h3>
        <div style="display:flex; gap:10px; justify-content:center;">
            <button onclick="exportBackup()" style="flex:1; background:#2a2a2a; color:#fff; border:1px solid #444; padding:10px 0; border-radius:4px; font-weight:bold; cursor:pointer;">💾 ESPORTA</button>
            <label style="flex:1; background:#2a2a2a; color:#fff; border:1px solid #444; padding:10px 0; border-radius:4px; font-weight:bold; cursor:pointer; margin:0; display:flex; align-items:center; justify-content:center;">
                📂 IMPORTA <input type='file' accept='.json' style='display:none;' onchange='importBackup(event)'>
            </label>
        </div>
        <button onclick="clearAllData()" style="background:#b71c1c; color:#fff; border:1px solid #f44336; padding:10px 0; border-radius:4px; font-weight:bold; cursor:pointer; width:100%;">🗑️ CANCELLA TUTTI I DATI</button>
    </div>
    `;
    openModal("⚙️ IMPOSTAZIONI", html);
}

function openRules() {
    let html = `
        <div style="font-size: 14px; line-height: 1.6; color: #ddd;">
            <p style="font-size: 15px; margin-top: 0;">Benvenuto nel <strong>Quiz Geografico Definitivo</strong>. Il tuo obiettivo è uno solo: dimostrare una padronanza geografica assoluta, gestire la pressione del tempo e sopravvivere al motore logico. Il database comprende fino a <strong>253</strong> tra Stati indipendenti, territori d'oltremare e dipendenze.</p>
            
            <h3 style="color:#f44336; margin: 20px 0 10px 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 5px; text-transform: uppercase;">❤️ Vite, Sopravvivenza e Punteggio</h3>
            <ul style="margin:0; padding-left:20px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Cuori e Cure:</strong> Inizi la partita standard con <strong>3 vite</strong>. Ottieni un cuore extra ogni <strong>750 punti</strong> accumulati.</li>
                <li><strong>Bonus Audacia (x2):</strong> Se nei livelli a bassa difficoltà (L1 e L2) utilizzi come risposte nazioni complesse appartenenti a tier superiori, il punteggio della risposta viene raddoppiato.</li>
                <li><strong>Malus Pigrizia (-50%):</strong> Il motore punisce la ripetitività. Usare nazioni già nominate di recente dimezza il punteggio guadagnato (Attivo nei Livelli 1, 2 e 3).</li>
                <li><strong>Grazia Ricevuta:</strong> Nelle modalità a Combo (L4 e L5), se scade il timer ma hai inserito correttamente la maggioranza delle risposte richieste (es. 2 su 3), il motore è clemente: ti salvi dalla perdita della vita, ma subisci un punteggio dimezzato per ogni risposta mancante.</li>
                <li><strong>Salvataggio al Fotofinish:</strong> Inserire l'ultima risposta corretta nell'ultimo 25% del tempo disponibile conferisce un salvataggio in extremis (registrato nelle statistiche).</li>
            </ul>

            <h3 style="color:#2196f3; margin: 25px 0 10px 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 5px; text-transform: uppercase;">🗺️ Terminologia e Definizioni Geografiche</h3>
            <p style="margin-top: 0; font-size: 13px; color: #aaa;">Presta estrema attenzione alle definizioni fornite dai modificatori di livello. Il motore logico distingue rigorosamente le categorie costiere:</p>
            <ul style="margin:0; padding-left:20px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Stato Insulare:</strong> Accetta ESCLUSIVAMENTE nazioni composte unicamente da isole (es. Giappone, Groenlandia, Cuba).</li>
                <li><strong>Stato Continentale Costiero:</strong> Esclude categoricamente le isole. Valgono SOLO i paesi situati su una massa continentale e bagnati dal mare (es. Italia, Brasile, Sudafrica).</li>
                <li><strong>Con Sbocco sul Mare:</strong> Parametro inclusivo. Accetta indifferentemente ENTRAMBI i casi precedenti (Isole + Costieri).</li>
                <li><strong>Stato Interno (Landlocked):</strong> Nazioni completamente circondate da terraferma, senza alcun accesso diretto agli oceani (es. Svizzera, Ciad, Mongolia).</li>
            </ul>

            <h3 style="color:#ffd700; margin: 25px 0 10px 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 5px; text-transform: uppercase;">🌍 Livelli di Sfida e Traguardi di Vittoria</h3>
            <ul style="margin:0; padding-left:20px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>0. Cucciolo Spaesato:</strong> Modalità allenamento a scelta multipla visiva. Perfetta per prendere confidenza con bandiere e capitali.</li>
                <li><strong>1. Bestia Apolide:</strong> Include solo Nazioni Indipendenti di dominio comune. <em>(Vittoria standard: 2.500 pt)</em></li>
                <li><strong>2. Animale Accasato:</strong> Estende il bacino a tutti i 193 membri ONU (inclusi i micro-stati) e introduce i Modificatori Negativi ("che NON confina con..."). <em>(Vittoria standard: 3.500 pt)</em></li>
                <li><strong>3. Creatura Cosmopolita:</strong> Sblocca il database assoluto, includendo territori d'oltremare e colonie.</li>
                <li><strong>4. Divinità Geografa:</strong> Modalità estrema. Fino a 5 risposte richieste a raffica per singolo turno, Timer implacabile. (Malus Pigrizia disattivato).</li>
                <li><strong>5. Partita Personalizzata:</strong> Sandbox totale. Scegli bacino, continenti ammessi, numero di vite, formato del timer e tetto massimo delle combo.</li>
                <li><strong style="color:#9c27b0;">6. Morte Improvvisa:</strong> Una singola vita. 10 secondi netti a domanda. Scegli il bacino (Sprint 50, ONU 193 o Totale 253) e sopravvivi fino all'ultima bandiera o capitale rimasta nel database.</li>
            </ul>

            <div style="margin-top: 25px; background: rgba(255, 215, 0, 0.1); border-left: 4px solid #ffd700; padding: 12px;">
                <strong style="color: #ffd700; font-size: 16px; text-transform: uppercase;">🏆 Vittoria Leggendaria</strong><br>
                Raggiungere quota <strong>10.000 punti</strong> nei Livelli 3 e 4 sblocca lo status di Vittoria Leggendaria. A quel punto, il giocatore è chiamato a compiere una scelta: ritirarsi da eroe consacrando il punteggio, oppure continuare ad oltranza per frantumare ogni record assoluto.
            </div>
        </div>
    `;
    openModal("📜 REGOLAMENTO UFFICIALE", html);
}
function openDB() {
    let tableHTML = `<div class="db-table-container"><table class="db-table">
        <thead><tr><th>Bandiera</th><th>Sigla</th><th class="sticky-col">Paese</th><th>Capitale</th><th>Confini</th><th>Aree</th></tr></thead><tbody>`;
    globalDb.forEach(n => {
        tableHTML += `<tr>
            <td style="text-align:center;"><img src="GIF/${n.sigla.toLowerCase()}.jpg" style="width:40px; border-radius:2px;" onerror="this.style.display='none'"></td>
            <td>${n.sigla.toUpperCase()}</td><td class="sticky-col" style="font-weight:bold;">${capitalize(n.nome)}</td>
            <td>${capitalize(n.capitale)}</td><td>${n.confini.join(', ')}</td><td>${n.aree.join(', ')}</td>
        </tr>`;
    });
    tableHTML += `</tbody></table></div>`;
    openModal("📚 ENCICLOPEDIA", tableHTML);
}

function openCustomSetup() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("custom-setup-screen").style.display = "flex";
}

function closeCustomSetup() {
    document.getElementById("custom-setup-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
}

window.openL6Setup = function() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("l6-setup-screen").style.display = "flex";
};

window.closeL6Setup = function() {
    document.getElementById("l6-setup-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
};

window.setL6Bacino = function(val) {
    configL6.bacino = val;
    ['sprint', 'onu', 'totale'].forEach(b => {
        let btn = document.getElementById(`opt-l6-${b}`);
        btn.style.background = (b === val) ? "#ffd700" : "#2a2a2a";
        btn.style.color = (b === val) ? "#121212" : "#ccc";
        btn.style.borderColor = (b === val) ? "#ffd700" : "#444";
    });
};

window.setL6Argomento = function(val) {
    configL6.argomento = val;
    ['bandiere', 'stati', 'capitali'].forEach(a => {
        let btn = document.getElementById(`opt-l6-${a}`);
        btn.style.background = (a === val) ? "#ffd700" : "#2a2a2a";
        btn.style.color = (a === val) ? "#121212" : "#ccc";
        btn.style.borderColor = (a === val) ? "#ffd700" : "#444";
    });
};

window.openRecords = function(defaultTab = 'global') {
    let html = `
    <div style="display:flex; gap:10px; margin-bottom:15px; width:100%;">
        <button onclick="renderRecordTab('global')" class="ui-tab-btn ${defaultTab==='global'?'active':''}" id="tab-btn-global">🌍 GLOBALE</button>
        <button onclick="renderRecordTab('levels')" class="ui-tab-btn ${defaultTab==='levels'?'active':''}" id="tab-btn-levels">📊 LIVELLI</button>
        <button onclick="renderRecordTab('logs')" class="ui-tab-btn ${defaultTab==='logs'?'active':''}" id="tab-btn-logs">📜 LOG</button>
    </div>
    <div id="record-tab-content"></div>
    `;
    openModal("🏆 STORICO E RECORD", html);
    renderRecordTab(defaultTab);
}

window.renderRecordTab = function(tabName) {
    ['global', 'levels', 'logs'].forEach(t => document.getElementById(`tab-btn-${t}`).classList.remove('active'));
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');
    
    let container = document.getElementById("record-tab-content");
    let html = "";

    if (tabName === 'global') {
        let sortedUsate = Object.keys(allTimeNazioniCount).map(sigla => {
            let n = globalDb.find(c => c.sigla === sigla);
            return { nome: n ? n.nome : sigla, count: allTimeNazioniCount[sigla], sigla: sigla };
        }).sort((a, b) => b.count - a.count).slice(0, 10);

        let sortedIgnorate = Object.keys(allTimeNazioniIgnorate).map(sigla => {
            let n = globalDb.find(c => c.sigla === sigla);
            return { nome: n ? n.nome : sigla, count: allTimeNazioniIgnorate[sigla], sigla: sigla };
        }).sort((a, b) => b.count - a.count).slice(0, 10);

        const buildList10 = (arr, color) => {
            if (arr.length === 0) return "<p style='color:#888; font-size:12px;'>Nessun dato</p>";
            let h = "<div style='display:flex; flex-direction:column;'>";
            arr.forEach((sn, idx) => {
                h += `<div style='display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding:4px 0;'>
                        <div style='display:flex; align-items:center; gap:5px;'>
                            <span style='color:#777; font-size:11px; width:15px;'>${idx+1}.</span>
                            <img src='GIF/${sn.sigla.toLowerCase()}.jpg' style='width:18px; border-radius:2px;' onerror='this.style.display="none"'>
                            <span style='color:#ccc; font-size:11px; font-weight:bold;'>${sn.nome.toUpperCase()}</span>
                        </div>
                        <span style='color:${color}; font-weight:bold; font-size:12px;'>${sn.count}</span>
                      </div>`;
            });
            return h + "</div>";
        };

        html += `
        <div style="background:#1e1e1e; border:1px solid #ffd700; border-radius:6px; padding:10px; margin-bottom:15px; text-align:center;">
            <div style="display:flex; justify-content:space-around; font-size:11px; color:#aaa;">
                <div style="display:flex; flex-direction:column;"><span>Partite</span><strong style="font-size:16px; color:#fff;">${globalPlays}</strong></div>
                <div style="display:flex; flex-direction:column;"><span>Record Assoluto</span><strong style="font-size:16px; color:#fff;">${allTimeBestScore}</strong></div>
                <div style="display:flex; flex-direction:column;"><span>Serie Max</span><strong style="font-size:16px; color:#fff;">${allTimeBestStreak}</strong></div>
                <div style="display:flex; flex-direction:column;"><span>Tempo Medio</span><strong style="font-size:16px; color:#fff;">${allTimeBestAvgTime > 0 ? allTimeBestAvgTime + "s" : "-"}</strong></div>
            </div>
        </div>
        <div style="display:flex; gap:15px;">
            <div style="flex:1;"><h3 style="color:#4caf50; font-size:12px; text-align:center;">TOP 10 USATE</h3>${buildList10(sortedUsate, '#4caf50')}</div>
            <div style="flex:1;"><h3 style="color:#f44336; font-size:12px; text-align:center;">TOP 10 IGNORATE</h3>${buildList10(sortedIgnorate, '#f44336')}</div>
        </div>`;
    } 
    else if (tabName === 'levels') {
        html += `
        <div style="display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap; justify-content:center;">
            ${[0,1,2,3,4,5,6].map(l => `<button onclick="switchLevelTab(${l})" class="ui-tab-btn" id="lvl-btn-${l}" style="padding:6px; font-size:11px;">${l===5?'CUST':l===6?'SUDDEN':'L'+l}</button>`).join('')}
        </div>
        <div id="level-detail-container" style="background:#2a2a2a; border:1px solid #444; border-radius:6px; padding:15px; text-align:center;">
            <!-- Contenuto dinamico -->
        </div>`;
        container.innerHTML = html;
        switchLevelTab(1); 
        return;
    }
    else if (tabName === 'logs') {
        html += "<div style='max-height: 55vh; overflow-y: auto; padding-right: 5px;'>";
        for(let lvl = 0; lvl <= 6; lvl++) {
            let lvlName = lvl === 0 ? "Livello 0" : (lvl === 5 ? "Personalizzata" : (lvl === 6 ? "Morte Improvvisa" : "Livello " + lvl));
            html += `<h3 style='color:#ffd700; border-bottom:1px solid #444; padding-bottom:3px; margin-top:10px; font-size:14px;'>${lvlName}</h3>`;
            if (recentGamesHistory[lvl].length === 0) {
                html += "<p style='color:#888; font-size:12px; font-style:italic;'>Nessuna partita registrata.</p>";
            } else {
                recentGamesHistory[lvl].forEach((game, idx) => {
                    html += `
                    <div style='display:flex; justify-content:space-between; align-items:center; background:#2a2a2a; margin-bottom:6px; padding:8px 12px; border-radius:6px; border:1px solid #444;'>
                        <div style='display:flex; flex-direction:column; gap:2px;'>
                            <span style='color:#ccc; font-size:11px;'>${game.date}</span>`;
                    if (lvl === 6) {
                        let totalTarget = 193; 
                        if (game.log) { let match = game.log.match(/su (\d+)/); if (match) totalTarget = parseInt(match[1]); }
                        let pctProgresso = ((game.esatte / totalTarget) * 100).toFixed(1);
                        html += `<span style='color:#fff; font-size:13px; font-weight:bold;'>Progresso: <span style='color:#ffd700;'>${pctProgresso}%</span> | Esatte: <span style='color:#4caf50;'>${game.esatte}</span></span>`;
                    } else {
                        html += `<span style='color:#fff; font-size:13px; font-weight:bold;'>Punti: <span style='color:#4caf50;'>${game.punteggio}</span> | Esatte: ${game.esatte}</span>`;
                    }
                    html += `</div>
                        <button onclick='downloadSpecificLog(${lvl}, ${idx})' style='background:#2196f3; color:#fff; border:none; border-radius:4px; padding:6px 10px; cursor:pointer;'>📥</button>
                    </div>`;
                });
            }
        }
        html += "</div>";
    }

    container.innerHTML = html;
}

window.switchLevelTab = function(lvl) {
    for(let i=0; i<=6; i++) {
        let btn = document.getElementById(`lvl-btn-${i}`);
        if(btn) { btn.style.background = (i===lvl) ? "#ffd700" : "#2a2a2a"; btn.style.color = (i===lvl) ? "#121212" : "#ccc"; }
    }
    
    let s = statsByLevel[lvl];
    let html = `<div style="display:flex; justify-content:space-around; font-size:12px; color:#aaa; margin-bottom:10px;">`;
    html += `<div style="display:flex; flex-direction:column;"><span>Partite</span><strong style="font-size:18px; color:#fff;">${s.plays}</strong></div>`;
    
    if (lvl === 6) {
        html += `<div style="display:flex; flex-direction:column;"><span>Sopravvivenza</span><strong style="font-size:18px; color:#fff;">${s.bestStreak} Naz.</strong></div>`;
        html += `<div style="display:flex; flex-direction:column;"><span>Tempo Medio</span><strong style="font-size:18px; color:#fff;">${s.bestAvgTime > 0 ? s.bestAvgTime + "s" : "-"}</strong></div>`;
    } else {
        html += `<div style="display:flex; flex-direction:column;"><span>Record</span><strong style="font-size:18px; color:#fff;">${s.plays > 0 ? s.bestScore : '-'}</strong></div>`;
        html += `<div style="display:flex; flex-direction:column;"><span>Serie Max</span><strong style="font-size:18px; color:#fff;">${s.bestStreak}</strong></div>`;
        html += `<div style="display:flex; flex-direction:column;"><span>Tempo Medio</span><strong style="font-size:18px; color:#fff;">${s.bestAvgTime > 0 ? s.bestAvgTime + "s" : "-"}</strong></div>`;
    }
    html += `</div>`;

    if (lvl === 4 || lvl === 5) {
        html += `<div style="display:flex; justify-content:center; gap:20px; font-size:12px; color:#888; border-top:1px dashed #444; padding-top:10px;">`;
        html += `<span>Fotofinish: <strong style="color:#2196f3;">${s.fotofinish || 0}</strong></span>`;
        html += `<span>Grazie: <strong style="color:#ffd700;">${s.grazie || 0}</strong></span>`;
        html += `</div>`;
    }
    
    document.getElementById("level-detail-container").innerHTML = html;
}

window.downloadSpecificLog = function(lvl, idx) {
    let game = recentGamesHistory[lvl][idx];
    if (!game || !game.log) return;
    let dateStr = game.date.replace(/[\/ :]/g, "_").replace(",", "");
    let dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(game.log);
    let node = document.createElement('a');
    node.setAttribute("href", dataStr);
    node.setAttribute("download", "QG_Log_L" + lvl + "_" + dateStr + ".txt");
    document.body.appendChild(node);
    node.click();
    node.remove();
};
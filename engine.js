        let levelDb = []; 
        let currentLevel = 1;
        let actionTimeout = null; 

        let customConfig = {
            difficolta: 'facile',
            continenti: ['europa', 'asia', 'africa', 'americhe', 'oceania'],
            stati: true,
            capitali: true,
            bandiere: true,
            timer: false,
            maxCombo: 1,
            vite: 3
        };
	
	let configL6 = {
            bacino: 'sprint', 
            argomento: 'bandiere', 
            formato: 9 
        };
        
// Stato dell'audio
let suoniAttivi = true;

// Pre-carichiamo i suoni in memoria così non c'è lag quando si gioca
const EffettiSonori = {
    esatto: new Audio("suoni/esatto.wav"),
    errore: new Audio("suoni/errore.wav"),
    battito: new Audio("suoni/battito.wav"),
    sconfitta: new Audio("suoni/sconfitta.mp3"),
    vittoria: new Audio("suoni/vittoria.mp3")
};

// Funzione per riprodurre un suono
function playSound(nomeSuono) {
    if (!suoniAttivi) return;
    
    // Riporta l'audio a zero. Utile se il giocatore risponde a raffica
    EffettiSonori[nomeSuono].currentTime = 0; 
    
    // Il catch serve per evitare errori del browser se blocca l'autoplay
    EffettiSonori[nomeSuono].play().catch(err => console.log("Audio bloccato dal browser"));
}

function toggleSuoni() {
    suoniAttivi = !suoniAttivi;
    // Nessuna ricerca DOM. La UI viene aggiornata direttamente dal bottone in ui.js!
}

// === VARIABILI DI STATO E COLLEGAMENTI DOM (RECUPERATI) ===
const allColors = ['rosso','bianco','blu','nero','giallo','verde','arancione','azzurro'];
const allLetters = 'ABCDEFGHILMNOPQRSTUVZ'.split('');

let vite = 3;
const maxVite = 5;
const NUM_OPZIONI = 3;
let esatte = 0;
let punteggio = 0;
let prossimoCuore = 750;
let erroriCommessi = []; 
let currentTurnData = null; 
let nazioniUsate = []; 

let currentStreak = 0;
let bestStreak = 0;
let fotofinishCount = 0;
let grazieRicevuteCount = 0;

let timerState = "stopped"; 
let readingTimeout = null;
let mainTimerInterval = null;
let activeTimeTotal = 0;
let activeTimeLeft = 0;
let comboInserted = [];

let nazioniDigitateCount = {};
let nazioniIgnorateCount = {};
let turnStartTime = 0;
let totalActiveTimeMs = 0;
let totalAnswersSubmitted = 0;

let endlessVittoriaSbloccata = false;

let debugGameLog = "";
let recentTargets = [];
let logQuestionCounter = 0;
let totalActiveTime = 0;

// --- GESTIONE PWA E TOUCH ---
window.addEventListener('popstate', function(event) {
    if (document.getElementById("game-over-screen").style.display === "flex") {
    } else if (document.getElementById("input-area").style.display === "flex") {
        let conf = confirm("Partita in corso! Vuoi davvero uscire? I progressi andranno persi.");
        if (conf) resetGame();
        else history.pushState(null, null, window.location.href);
    }
});

document.addEventListener('touchmove', function(e) {
    if (document.getElementById("start-screen").style.display === "flex") return; 
    if (e.target.closest('.db-table-container') || e.target.closest('#modal-body') || e.target.closest('#error-log') || e.target.closest('#top5-nations')) return;
    e.preventDefault();
}, { passive: false });

function findCountryByInput(inputStr, level, td = null) {
    let bestMatches = [];
    let globalMinDist = 999;
    let searchPool = globalDb;
    if (td !== null) {
        searchPool = (td.format === 4 || td.format === 7 || td.isComboInception) ? globalDb : getAnswerPool(level);
    }
    
    for (let country of searchPool) {
        let validNames = [country.nome.toLowerCase(), ...country.alias_paese];
        let validCapitals = country.capitale ? [country.capitale.toLowerCase(), ...country.alias_capitale] : [];
        
        let relevantDist = 999;
        for(let n of validNames) {
            if (isDoppelganger(inputStr, n)) continue;
            let d = levenshteinDistance(inputStr, n);
            if (d <= getLevenshteinTolerance(n, level)) {
                if (d < relevantDist) relevantDist = d;
            }
        }
        for(let c of validCapitals) {
            if (isDoppelganger(inputStr, c)) continue;
            let d = levenshteinDistance(inputStr, c);
            if (d <= getLevenshteinTolerance(c, level)) {
                if (d < relevantDist) relevantDist = d;
            }
        }
        
        if (relevantDist < globalMinDist) {
            globalMinDist = relevantDist;
            bestMatches = [country];
        } else if (relevantDist === globalMinDist && globalMinDist !== 999) {
            bestMatches.push(country);
        }
    }
    
if (bestMatches.length > 0) {
        if (bestMatches.length > 1 && td !== null) {
            let res = checkSingleAnswer(inputStr, td, level);
            if (res.isCorrect) {
                let contextualMatch = bestMatches.find(m => m.sigla === res.matchedCountry.sigla);
                if (contextualMatch) return contextualMatch;
            }
        }
        return bestMatches[0]; 
    }
    return null; 
}

        function toggleCustomOpt(opt) {
            customConfig[opt] = !customConfig[opt];
            let el = document.getElementById("opt-" + opt);
            if(customConfig[opt]) el.classList.add("selected");
            else el.classList.remove("selected");
        }
        function setCustomDiff(diff) {
            customConfig.difficolta = diff;
            ['facile', 'medio', 'difficile'].forEach(d => {
                document.getElementById("opt-diff-" + d).classList.toggle("selected", d === diff);
            });
        }
        function toggleCustomCont(cont) {
            let idx = customConfig.continenti.indexOf(cont);
            if(idx > -1) customConfig.continenti.splice(idx, 1);
            else customConfig.continenti.push(cont);
            let el = document.getElementById("opt-cont-" + cont);
            el.classList.toggle("selected");
        }
        function setCustomVite(val) {
            customConfig.vite = val;
            [1, 3, 5, 10].forEach(v => {
                document.getElementById("opt-vite-" + v).classList.toggle("selected", v === val);
            });
        }
        function setCustomTime(mode) {
            customConfig.timer = (mode === 'ghigliottina');
            document.getElementById("opt-relax").classList.toggle("selected", !customConfig.timer);
            document.getElementById("opt-ghigliottina").classList.toggle("selected", customConfig.timer);
        }
        function setCustomCombo(val) {
            customConfig.maxCombo = val;
            [1, 3, 5].forEach(v => {
                document.getElementById("opt-combo-" + v).classList.toggle("selected", v === val);
            });
        }

        function startGame(lvl) {
            document.body.style.overscrollBehavior = "none"; 
            currentLevel = lvl;
            levelDb = globalDb.filter(n => n.livello <= (lvl === 0 ? 2 : (lvl === 5 ? 3 : lvl))); 
            
            vite = 3; 
            
            debugGameLog = "=== GEOQUIZ DEBUG LOG ===\nData: " + new Date().toLocaleString() + "\nLivello Giocato: " + currentLevel + "\n\n";
                        
            document.getElementById("start-screen").style.display = "none";
            document.getElementById("custom-setup-screen").style.display = "none";
            document.getElementById("header").style.display = "flex";
            document.getElementById("question").style.display = "block";
            document.getElementById("input-area").style.display = "flex";
            homeBtn.style.display = "block"; 
            
            history.pushState(null, null, window.location.href);

            aggiornaUI();
            playTurn();
        }

        function startCustomGame() {
            if(!customConfig.stati && !customConfig.capitali && !customConfig.bandiere) {
                alert("Seleziona almeno un argomento!");
                return;
            }
            if(customConfig.continenti.length === 0) {
                alert("Seleziona almeno un continente!");
                return;
            }

            document.body.style.overscrollBehavior = "none"; 
            currentLevel = 5;
            
            let diffLevel = 1;
            if (customConfig.difficolta === 'medio') diffLevel = 2;
            if (customConfig.difficolta === 'difficile') diffLevel = 3;
            
            levelDb = globalDb.filter(n => n.livello <= diffLevel);
            levelDb = levelDb.filter(c => {
                let cl = c.aree.join(" ").toLowerCase();
                let isAm = cl.includes('nord america') || cl.includes('sud america') || cl.includes('america centrale') || cl.includes('caraibi');
                let match = false;
                if(customConfig.continenti.includes('europa') && cl.includes('europa')) match = true;
                if(customConfig.continenti.includes('asia') && cl.includes('asia')) match = true;
                if(customConfig.continenti.includes('africa') && cl.includes('africa')) match = true;
                if(customConfig.continenti.includes('oceania') && cl.includes('oceania')) match = true;
                if(customConfig.continenti.includes('americhe') && isAm) match = true;
                return match;
            });

            if (levelDb.length === 0) {
                alert("Nessuna nazione trovata con questi filtri! Prova ad allargare il bacino o a cambiare continente.");
                return;
            }
            
            vite = customConfig.vite;
            
            debugGameLog = "=== GEOQUIZ DEBUG LOG ===\nData: " + new Date().toLocaleString() + "\nLivello Giocato: 5 (Personalizzata)\n\n";
            debugGameLog += "Difficoltà: " + customConfig.difficolta.toUpperCase() + " | Timer: " + (customConfig.timer ? "Ghigliottina" : "Relax") + " | Max Combo: " + customConfig.maxCombo + " | Vite Iniziali: " + customConfig.vite + "\n";
            debugGameLog += "Continenti: " + customConfig.continenti.map(c => c.toUpperCase()).join(", ") + "\n";
            debugGameLog += "Argomenti: " + (customConfig.stati?"Stati ":"") + (customConfig.capitali?"Capitali ":"") + (customConfig.bandiere?"Bandiere":"") + "\n\n";

            document.getElementById("start-screen").style.display = "none";
            document.getElementById("custom-setup-screen").style.display = "none";
            document.getElementById("header").style.display = "flex";
            document.getElementById("question").style.display = "block";
            document.getElementById("input-area").style.display = "flex";
            homeBtn.style.display = "block"; 
            
            history.pushState(null, null, window.location.href);

            aggiornaUI();
            playTurn();
        }

	window.startLevel6Game = function() {
            document.body.style.overscrollBehavior = "none"; 
            currentLevel = 6;
            vite = 1; 
            
            // 1. Assegna il formato corretto per il motore logico
            if (configL6.argomento === 'bandiere') configL6.formato = 9;  // Bandiera -> Nazione
            else if (configL6.argomento === 'stati') configL6.formato = 1; // Capitale -> Nazione
            else if (configL6.argomento === 'capitali') configL6.formato = 0; // Nazione -> Capitale
            
            // 2. Filtra il database in base al traguardo scelto
            if (configL6.bacino === 'sprint') {
                let fullDb = globalDb.filter(n => n.livello <= 2);
                levelDb = fullDb.sort(() => 0.5 - Math.random()).slice(0, 50); 
            } else if (configL6.bacino === 'onu') {
                levelDb = globalDb.filter(n => n.livello <= 2);
            } else {
                levelDb = globalDb; // Tutte le 253 nazioni
            }
            
            debugGameLog = `=== GEOQUIZ DEBUG LOG ===\nData: ${new Date().toLocaleString()}\nLivello Giocato: 6 (Morte Improvvisa)\n`;
            debugGameLog += `Modalità: \({configL6.bacino.toUpperCase()} | Argomento:\){configL6.argomento.toUpperCase()}\n\n`;
                        
            document.getElementById("l6-setup-screen").style.display = "none";
            document.getElementById("start-screen").style.display = "none";
            document.getElementById("header").style.display = "flex";
            document.getElementById("question").style.display = "block";
            document.getElementById("input-area").style.display = "flex";
            homeBtn.style.display = "block"; 
            
            history.pushState(null, null, window.location.href);

            UI.aggiornaHeader(vite, customConfig.vite, maxVite, esatte, punteggio, currentLevel, levelDb.length);
            playTurn();
        };

        function resetGame() {
            debugGameLog = ""; 
            clearTimeout(actionTimeout); 
            stopTimer();
            document.body.style.overscrollBehavior = "auto"; 
            
            inputEl.disabled = false;    
            submitBtn.disabled = false;
            submitBtn.style.display = "block";
            nextBtn.style.display = "none";
	    document.getElementById("termina-custom-btn").style.display = "none";
            surrenderBtn.style.display = "none";
            inputEl.classList.remove("shake", "correct-flash", "wrong-flash", "warning-flash");
            inputEl.value = "";
            
            eventBadge.style.display = "none";
            eventBadge.innerHTML = "";
            errPanel.style.display = "none";
            
            document.getElementById("start-screen").style.display = "flex";
            document.getElementById("custom-setup-screen").style.display = "none";
            document.getElementById("header").style.display = "none";
            document.getElementById("question").style.display = "none";
            document.getElementById("input-area").style.display = "none";
            document.getElementById("bandiera-container").style.display = "none";
            document.getElementById("game-over-screen").style.display = "none";
            timerContainer.style.display = "none";
            comboTracker.style.display = "none";
            homeBtn.style.display = "none"; 
            
            vite = 3; esatte = 0; punteggio = 0; prossimoCuore = 750;
            currentStreak = 0; bestStreak = 0; fotofinishCount = 0; grazieRicevuteCount = 0;
            erroriCommessi = []; comboInserted = []; nazioniUsate = [];
            logQuestionCounter = 0; 
            recentTargets = [];
        
            endlessVittoriaSbloccata = false;
            window.pendingVictory = false;
            window.pendingDefeat = false;
            nextBtn.innerText = "PROSSIMA DOMANDA ➔";
            
            document.getElementById("ritirati-btn").style.display = "none";
            document.getElementById("continua-btn").style.display = "none";
            inputEl.style.color = "";
            
            nazioniDigitateCount = {}; nazioniIgnorateCount = {}; 
            totalActiveTimeMs = 0; totalAnswersSubmitted = 0;
            document.getElementById("top5-nations").style.display = "none";

            aggiornaUI();

        }

        window.playAgain = function() {
            let lvlToRestart = currentLevel; 
            resetGame(); 
            
            setTimeout(() => {
                if (lvlToRestart === 5) {
                    startCustomGame();
                } else if (lvlToRestart === 6) {
                    startLevel6Game();
                } else {
                    startGame(lvlToRestart); 
                }
            }, 50);
        };

        function getPreposizioneArea(area) {
            if (!area) return "";
            const a = area.trim();
            const aUpper = a.toUpperCase();
            if (aUpper === "ANDE") return "sulle <strong>ANDE</strong>";
            if (aUpper === "MEDITERRANEO" || aUpper === "GOLFO DI GUINEA") return "sul <strong>" + aUpper + "</strong>";
            if (aUpper === "CARAIBI" || aUpper === "BALCANI" || aUpper === "PAESI BALTICI") return "nei <strong>" + aUpper + "</strong>";
            if (aUpper === "SUBCONTINENTE INDIANO" || aUpper === "SUD-EST ASIATICO" || aUpper === "MEDIO ORIENTE") return "nel <strong>" + aUpper + "</strong>";
            if (aUpper === "PENISOLA ARABICA" || aUpper === "PENISOLA INDOCINESE") return "nella <strong>" + aUpper + "</strong>";
            return "in <strong>" + aUpper + "</strong>";
        }
        
        function getPreposizioneAreaNegativa(area, num) {
            if (!area) return "";
            const a = area.trim().toUpperCase();
            const verbo = num === 1 ? "si trovi" : "si trovino";
            
            if (a === "ANDE") return "che <span class='negative-constraint'>NON</span> " + verbo + " sulle <strong>ANDE</strong>";
            if (a === "MEDITERRANEO" || a === "GOLFO DI GUINEA") return "che <span class='negative-constraint'>NON</span> " + verbo + " sul <strong>" + a + "</strong>";
            if (a === "CARAIBI" || a === "BALCANI" || a === "PAESI BALTICI") return "che <span class='negative-constraint'>NON</span> " + verbo + " nei <strong>" + a + "</strong>";
            if (a === "SUBCONTINENTE INDIANO" || a === "SUD-EST ASIATICO" || a === "MEDIO ORIENTE") return "che <span class='negative-constraint'>NON</span> " + verbo + " nel <strong>" + a + "</strong>";
            if (a === "PENISOLA ARABICA" || a === "PENISOLA INDOCINESE") return "che <span class='negative-constraint'>NON</span> " + verbo + " nella <strong>" + a + "</strong>";
            return "che <span class='negative-constraint'>NON</span> " + verbo + " in <strong>" + a + "</strong>";
        }
        
        function calcolaPuntiDomandaL1_3(format, numSoluzioni, isComboInception = false) {
            // Se NON è una domanda di confini derivata, dai il punteggio fisso
            if (!isComboInception) {
                if (format === 10) return 90; 
                if (format === 0 || format === 1 || format === 9) return 50;
            }
            // Altrimenti calcola in base a quanto era facile/difficile!
            if (numSoluzioni === 1) return 150;
            if (numSoluzioni === 2) return 120;
            if (numSoluzioni === 3) return 90;
            if (numSoluzioni >= 4 && numSoluzioni <= 5) return 60;
            return 30; 
        }

        function generaDistrattori(td) {
            let options = [];
            let correctStr = (td.format === 0) ? capitalize(td.targetNode.capitale) : (td.format === 13 ? td.targetNode.nome : capitalize(td.targetNode.nome));
            options.push({ text: correctStr, sigla: td.targetNode.sigla, isCorrect: true });
            
            // Estrae tutte le parole chiave dalla domanda (rimuovendo la punteggiatura)
            let qTextLower = td.questionText.toLowerCase();
            
            let pool = levelDb.filter(c => {
                if (c.sigla === td.targetNode.sigla) return false; // Non può essere il bersaglio
                if (td.validSiglas && td.validSiglas.includes(c.sigla)) return false; // FIX: Esclude SEMPRE tutte le altre risposte valide
                
                // Se il nome della nazione è palesemente scritto nella domanda, scartalo!
                let cNames = [c.nome.toLowerCase(), ...c.alias_paese];
                let isNamedInQuestion = cNames.some(name => new RegExp(`\\b${name}\\b`).test(qTextLower));
                if (isNamedInQuestion) return false;
                
                return true;
            });
            
            let wrongPool = [];
            
            if (td.format === 13 || td.format === 9) {
                // --- SCORING SYSTEM PER LE TRAPPOLE VISIVE ---
                let targetColors = [...new Set([...td.targetNode.colori_base, ...td.targetNode.colori_emblema])];
                let targetFormats = td.targetNode.formati_bandiera || [];
                let targetSymbols = td.targetNode.simboli || [];
                
                // Diamo un "voto di somiglianza" a tutte le nazioni del bacino
                let scoredPool = pool.map(c => {
                    let score = 0;
                    
                    // 1. Colori (+1 punto per ogni colore in comune)
                    let cCols = [...new Set([...c.colori_base, ...c.colori_emblema])];
                    let sharedColors = cCols.filter(col => targetColors.includes(col)).length;
                    score += sharedColors * 1; 
                    
                    // 2. Geometria (+3 punti se condividono il formato base)
                    let sharedFormats = c.formati_bandiera.filter(f => targetFormats.includes(f)).length;
                    if (sharedFormats > 0) score += 3;
                    
                    // 3. Simboli (+2 punti se condividono un simbolo, es. stella o mezzaluna)
                    let sharedSymbols = c.simboli.filter(s => targetSymbols.includes(s)).length;
                    if (sharedSymbols > 0) score += 2; 
                    
                    return { country: c, score: score };
                });
                
                // Ordiniamo le nazioni dalla più simile (voto alto) alla meno simile
                scoredPool.sort((a, b) => b.score - a.score);
                
                // Prendiamo solo le Top 8 "gemelle" per creare la rete della trappola
                let topCandidates = scoredPool.slice(0, 8).map(item => item.country);
                
                // Mescoliamo la Top 8 per uccidere il "Pattern Recognition" e dare imprevedibilità
                wrongPool = topCandidates;

            } else {
                // --- LOGICA GEOGRAFICA PER LE DOMANDE NORMALI ---
                wrongPool = pool.filter(c => {
                    let isConf = td.targetNode.confini.includes(c.nome.toLowerCase()) || td.targetNode.confini.some(b => c.alias_paese.includes(b));
                    let isMicro = (c.aree.length > 1 && td.targetNode.aree.length > 1 && c.aree[1] === td.targetNode.aree[1]);
                    return (td.targetNode.aree.length <= 1) ? isConf : (isConf || isMicro);
                });
            }
            
            // Rete di emergenza: se per qualche motivo il filtro restringe troppo, pesca a caso
            if (wrongPool.length < NUM_OPZIONI - 1) wrongPool = pool.sort(() => 0.5 - Math.random());
            if (td.format === 0) wrongPool = wrongPool.filter(c => c.capitale); // Solo nazioni con capitali
            
            // Estrazione finale dei distrattori (pesca i primi 2 dalla wrongPool mescolata)
            wrongPool.sort(() => 0.5 - Math.random()).slice(0, NUM_OPZIONI - 1).forEach(c => {
                let wStr = (td.format === 0) ? capitalize(c.capitale) : (td.format === 13 ? c.nome : capitalize(c.nome));
                options.push({ text: wStr, sigla: c.sigla, isCorrect: false });
            });
            
            return options.sort(() => 0.5 - Math.random());
        }

	function generateQuestion() {
            let availableFormats = [];
            
            if (currentLevel === 0) {
                availableFormats = [0, 1, 7, 9, 13];
            } else if (currentLevel === 6) {
                availableFormats = [configL6.formato]; // Forza il formato scelto!
            } else if (currentLevel === 5) {
                if (customConfig.stati) availableFormats.push(2, 3, 4, 5, 7, 8);
                if (customConfig.capitali) availableFormats.push(0, 1, 6, 10);
                if (customConfig.bandiere) availableFormats.push(9, 11);
                if (customConfig.bandiere && (customConfig.stati || customConfig.capitali)) availableFormats.push(12);
                if (availableFormats.length === 0) availableFormats = [0, 1];
            } else {
                availableFormats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]; 
                if (currentLevel > 1) availableFormats.push(10); 
            }

            let format = availableFormats[Math.floor(Math.random() * availableFormats.length)];
            
            // --- SISTEMA DI MEMORIA INTELLIGENTE GLOBALE (Anti-Doppione) ---
            // Filtra: cerca nazioni NON ancora uscite con questo specifico formato
            let availableDb = levelDb.filter(function(n) {
                return !recentTargets.includes(n.sigla + "-" + format);
            });
            
            // LA VALVOLA DEL GIOCATORE SADICO (Domanda 751+)
            if (availableDb.length === 0) {
                // Se hai esaurito le nazioni per questo formato, svuota la memoria SOLO per questo formato
                recentTargets = recentTargets.filter(function(item) {
                    return !item.endsWith("-" + format);
                });
                availableDb = levelDb; 
            }
            
            let nazioneEstratta = availableDb[Math.floor(Math.random() * availableDb.length)];
            
            // Memorizza la coppia Nazione-Formato (Es. "IT-0")
            recentTargets.push(nazioneEstratta.sigla + "-" + format);
            
            // Rimosso il limite di 15 turni! La memoria ora è illimitata.
            
            let td = { format: format, targetNode: nazioneEstratta, numVariables: 1, isComboInception: false };
            
            if (td.targetNode.aree && td.targetNode.aree.length > 0) {
                if (td.targetNode.aree.length > 1) {
                    if (Math.random() <= 0.35) {
                        td.selectedArea = td.targetNode.aree[0];
                    } else {
                        let subAreas = td.targetNode.aree.slice(1);
                        td.selectedArea = subAreas[Math.floor(Math.random() * subAreas.length)];
                    }
                } else {
                    td.selectedArea = td.targetNode.aree[0];
                }
            }

            if (format === 1 && !td.targetNode.capitale) return generateQuestion();
            if (format === 2 && td.targetNode.colori_base.length === 0) return generateQuestion();
            if (format === 3 && td.targetNode.simboli.length === 0 && td.targetNode.colori_emblema.length === 0) return generateQuestion();
            if (format === 4 && (td.targetNode.confini.length < 2 || !td.targetNode.indipendente)) return generateQuestion();

            let lvlCheckNeg = (currentLevel === 5 && customConfig.difficolta !== 'facile') ? true : (currentLevel >= 2 && currentLevel !== 5);

            if (format === 5) {
                if (!td.targetNode.indipendente || td.targetNode.confini.length === 0 || td.targetNode.confini.length > 3) return generateQuestion();
                if (lvlCheckNeg && td.targetNode.aree.length > 0) { td.reqArea = td.selectedArea; td.numVariables++; }
            }
            if (format === 6) {
                if (!td.targetNode.capitale || td.targetNode.aree.length === 0) return generateQuestion();
                td.varEnigmistica = Math.floor(Math.random() * 3);
                td.reqCapInit = td.targetNode.capitale.charAt(0).toUpperCase();
                td.reqCapFin = td.targetNode.capitale.charAt(td.targetNode.capitale.length - 1).toUpperCase();
                td.numVariables++;
            }
            if (format === 7) {
                if (!td.targetNode.indipendente || td.targetNode.confini.length === 0) return generateQuestion();
            }
            
            if (format === 8) {
                td.reqGeo = td.targetNode.tipoGeo; 
                if (['isola', 'costiera'].includes(td.reqGeo) && Math.random() > 0.5) td.reqGeo = 'marittima';
                if (lvlCheckNeg && td.targetNode.aree.length > 0) { td.reqArea = td.selectedArea; td.numVariables++; }
                if (currentLevel >= 3 || currentLevel === 5) { td.reqInit = td.targetNode.nome.charAt(0).toUpperCase(); td.numVariables++; }
                
                if (!td.reqArea && !td.reqInit && !td.negColor) {
                    if (td.targetNode.aree && td.targetNode.aree.length > 0) {
                        td.reqArea = td.selectedArea;
                    }
                }
            }
            
            if (format === 11) {
                if (td.targetNode.formati_bandiera.length === 0) return generateQuestion();
                let pool = [];
                if (td.targetNode.aree.length > 0) pool.push('area');
                if (td.targetNode.colori_base.length > 0) pool.push('colore');
                pool.push('geo');
                if (lvlCheckNeg && td.targetNode.capitale) pool.push('capitale');
                if (currentLevel >= 3 || currentLevel === 5) pool.push('iniziale');
                
                pool.sort(() => 0.5 - Math.random());
                let numConditions = (currentLevel === 1 || (currentLevel === 5 && customConfig.difficolta === 'facile')) ? 1 : (Math.random() > 0.5 ? 1 : 2);
                let selectedConditions = pool.slice(0, numConditions);
                
                if (selectedConditions.includes('capitale') && selectedConditions.includes('iniziale')) {
                    let replacement = pool.find(p => !selectedConditions.includes(p));
                    let removeIdx = Math.random() < 0.5 ? selectedConditions.indexOf('capitale') : selectedConditions.indexOf('iniziale');
                    if (replacement) selectedConditions[removeIdx] = replacement;
                    else selectedConditions.splice(removeIdx, 1);
                }
                
                td.reqFormato = td.targetNode.formati_bandiera[Math.floor(Math.random() * td.targetNode.formati_bandiera.length)];

                if (selectedConditions.includes('area')) { td.reqArea = td.selectedArea; td.numVariables++; }
                if (selectedConditions.includes('colore')) { td.reqColor = td.targetNode.colori_base[0]; td.numVariables++; }
                if (selectedConditions.includes('geo')) { 
                    td.reqGeo = td.targetNode.tipoGeo; 
                    if (['isola', 'costiera'].includes(td.reqGeo) && Math.random() > 0.5) td.reqGeo = 'marittima';
                    td.numVariables++; 
                }
                if (selectedConditions.includes('capitale')) { td.reqCapInit = td.targetNode.capitale.charAt(0).toUpperCase(); td.numVariables++; }
                if (selectedConditions.includes('iniziale')) { td.reqInit = td.targetNode.nome.charAt(0).toUpperCase(); td.numVariables++; }
            }

            if (format === 12) {
                let allTargetColors = [...new Set([...td.targetNode.colori_base, ...td.targetNode.colori_emblema])];
                if (allTargetColors.length < 2) return generateQuestion();
                
                let cBase = allTargetColors.sort(() => 0.5 - Math.random());
                let numCol = (cBase.length >= 3 && Math.random() > 0.5) ? 3 : 2;
                td.f12Colors = cBase.slice(0, numCol);
                
                if (numCol === 3) td.numVariables++;
                
                td.f12AskCapital = false;
                let allowCap = (currentLevel >= 3 || currentLevel === 5);
                if (currentLevel === 5 && !customConfig.capitali) allowCap = false;
                if (allowCap && td.targetNode.capitale && Math.random() < 0.5) {
                    td.f12AskCapital = true;
                }
                if (currentLevel === 5 && !customConfig.stati) {
                    td.f12AskCapital = true;
                }
                
                let pool = [];
                if (td.targetNode.aree.length > 0) pool.push('area');
                if (td.targetNode.simboli.length > 0) pool.push('symbol');
                pool.push('initial');
                pool.sort(() => 0.5 - Math.random());
                
                if (td.f12AskCapital) {
                    td.disableSmartNeg = true; 
                    let choice = pool[0];
                    if (choice === 'area') { td.reqArea = td.selectedArea; td.numVariables++; }
                    else if (choice === 'symbol') { td.f12RequiresSymbol = td.targetNode.simboli[0]; td.numVariables++; }
                    else if (choice === 'initial') { td.reqInit = td.targetNode.nome.charAt(0).toUpperCase(); td.numVariables++; }
                } else {
                    let varsToPick = Math.random() > 0.6 ? 2 : 1;
                    let choices = pool.slice(0, varsToPick);
                    if (choices.includes('area')) { td.reqArea = td.selectedArea; td.numVariables++; }
                    if (choices.includes('symbol')) { td.f12RequiresSymbol = td.targetNode.simboli[0]; td.numVariables++; }
                    if (choices.includes('initial')) { td.reqInit = td.targetNode.nome.charAt(0).toUpperCase(); td.numVariables++; }
                }
            }

            if ((currentLevel === 4 || currentLevel === 5) && [0, 1, 9, 10].includes(format)) {
                let validBordersCount = 0;
                for (let c of getAnswerPool(currentLevel)) {
                    let cNames = [c.nome.toLowerCase(), ...c.alias_paese];
                    if (c.indipendente && cNames.some(n => td.targetNode.confini.includes(n))) {
                        if (format === 0 || format === 10) {
                            if (c.capitale) validBordersCount++;
                        } else validBordersCount++;
                    }
                }
                if (validBordersCount >= 2 && Math.random() < 0.8) td.isComboInception = true;
            }

            if (format === 2) {
                let hasSymbols = td.targetNode.simboli.length > 0;
                if (lvlCheckNeg && Math.random() > 0.5 && hasSymbols) {
                    td.f2RequiresSymbol = td.targetNode.simboli[Math.floor(Math.random() * td.targetNode.simboli.length)];
                    td.numVariables++;
                }
            }

            if (format === 3) {
                let isSimbolo = td.targetNode.simboli.length > 0;
                td.elemScelto = isSimbolo ? td.targetNode.simboli[0] : td.targetNode.colori_emblema[0];
                td.isColoreEmblema = !isSimbolo;
                
                let f3Variant = 0; 
                if (lvlCheckNeg) {
                    let r = Math.random();
                    if (r < 0.33) f3Variant = 1; else if (r < 0.66) f3Variant = 2; else f3Variant = 3;
                }
                
                if (f3Variant === 1 && td.targetNode.aree.length === 0) f3Variant = 0;
                if (f3Variant === 2 && td.targetNode.colori_base.length === 0) f3Variant = 0;
                
                if (f3Variant === 1) { td.reqArea = td.selectedArea; td.numVariables++; }
                if (f3Variant === 2) { td.reqColor = td.targetNode.colori_base[0]; td.numVariables++; }
                if (f3Variant === 3) { td.reqInit = td.targetNode.nome.charAt(0).toUpperCase(); td.numVariables++; }
            }
            if (format === 4) {
                let cShuffled = [...td.targetNode.confini].sort(() => 0.5 - Math.random());
                td.reqConf1 = cShuffled[0];
                td.reqConf2 = cShuffled[1];
                td.numVariables = 2;
            }

td.buildQuestionText = (num) => {
                let areaP = td.selectedArea ? getPreposizioneArea(td.selectedArea) : "";
                
                let nI = "<span class='target-highlight'>NAZIONE INDIPENDENTE</span>";
                let nI_p = `<span class='target-highlight'>${num} NAZIONI INDIPENDENTI</span>`;
                let sT = "<span class='target-highlight'>STATO O TERRITORIO</span>";
                let sT_p = `<span class='target-highlight'>${num} STATI O TERRITORI</span>`;
                let sTI = "<span class='target-highlight'>STATO O TERRITORIO</span> <strong>INSULARE</strong>";
                let sTI_p = `<span class='target-highlight'>${num} STATI O TERRITORI</span> <strong>INSULARI</strong>`;
                
                // ECCO LE DUE RIGHE MODIFICATE CON L'AZZURRO:
                let cS = "<span class='target-highlight' style='color:#2196f3;'>CAPITALE</span>";
                let cS_p = `<span class='target-highlight' style='color:#2196f3;'>${num} CAPITALI</span>`;

                let cloneHint = "";
                if (format === 9 || format === 10) {
                    let cloniSempre = ['TD', 'RO', 'FR', 'MF'];
                    let cloniLvl2 = ['ID', 'MC'];
                    if (cloniSempre.includes(td.targetNode.sigla) || (currentLevel === 2 && cloniLvl2.includes(td.targetNode.sigla))) {
                        let areaPrincipale = td.targetNode.aree[0] || "";
                        if (areaPrincipale) {
                            areaPrincipale = areaPrincipale.toLowerCase();
                            cloneHint = ` (in ${areaPrincipale})`;
                        }
                    }
                }

                let finalQ = "";

                switch(format) {
                    case 0:
                        if (num === 1) {
                            finalQ = td.isComboInception 
                                ? `Nomina 1 ${cS} di uno <strong>STATO INDIPENDENTE</strong> che confina via terra con la nazione <strong>${td.targetNode.nome.toUpperCase()}</strong>.` 
                                : `Qual è la ${cS} della nazione <strong>${td.targetNode.nome.toUpperCase()}</strong>?`;
                        } else {
                            finalQ = td.isComboInception 
                                ? `Nomina ${cS_p} di altrettanti <strong>STATI INDIPENDENTI</strong> che confinano via terra con la nazione <strong>${td.targetNode.nome.toUpperCase()}</strong>.` 
                                : "";
                        }
                        break;
                    
                    case 1:
                        if (num === 1) {
                            finalQ = td.isComboInception 
                                ? `Nomina 1 ${nI} che confina via terra con lo Stato la cui capitale è <strong>${td.targetNode.capitale.toUpperCase()}</strong>.` 
                                : `Di quale ${sT} è capitale la città di <strong>${td.targetNode.capitale.toUpperCase()}</strong>?`;
                        } else {
                            finalQ = td.isComboInception 
                                ? `Nomina ${nI_p} che confinano via terra con lo Stato la cui capitale è <strong>${td.targetNode.capitale.toUpperCase()}</strong>.` 
                                : "";
                        }
                        break;
                    
                    case 2:
                        if (num === 1) {
                            if (td.f2RequiresSymbol) {
                                finalQ = `Nomina 1 ${sT} la cui bandiera include il <strong>${td.targetNode.colori_base[0].toUpperCase()}</strong> tra i colori di base e raffigura l'elemento grafico <strong>${td.f2RequiresSymbol.toUpperCase()}</strong>.`;
                            } else {
                                finalQ = `Nomina 1 ${sT} la cui bandiera ha come UNICI colori di base <strong>${td.targetNode.colori_base.join(', ').toUpperCase()}</strong>.`;
                            }
                        } else {
                            if (td.f2RequiresSymbol) {
                                finalQ = `Nomina ${sT_p} le cui bandiere includono il <strong>${td.targetNode.colori_base[0].toUpperCase()}</strong> tra i colori di base e raffigurano l'elemento grafico <strong>${td.f2RequiresSymbol.toUpperCase()}</strong>.`;
                            } else {
                                finalQ = `Nomina ${sT_p} le cui bandiere hanno come UNICI colori di base <strong>${td.targetNode.colori_base.join(', ').toUpperCase()}</strong>.`;
                            }
                        }
                        break;
                    
                    case 3:
                        if (num === 1) {
                            let bT = `Nomina 1 ${sT}`;
                            if (td.reqArea) bT += ` ${areaP}`;
                            if (td.reqInit) bT += ` che inizia con la lettera <strong>${td.reqInit.toUpperCase()}</strong>`;
                            bT += (td.reqInit) ? `, la cui bandiera ` : ` la cui bandiera `;
                            if (td.reqColor) bT += `include il <strong>${td.reqColor.toUpperCase()}</strong> e `;
                            if (td.isColoreEmblema) bT += `raffigura un elemento grafico di colore <strong>${td.elemScelto.toUpperCase()}</strong>`;
                            else bT += `raffigura l'elemento grafico <strong>${td.elemScelto.toUpperCase()}</strong>`;
                            if (td.negColor) bT += ` ma <span class='negative-constraint'>NON</span> contiene il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            finalQ = bT + ".";
                        } else {
                            let bT = `Nomina ${sT_p}`;
                            if (td.reqArea) bT += ` ${areaP}`;
                            if (td.reqInit) bT += ` che iniziano con la lettera <strong>${td.reqInit.toUpperCase()}</strong>`;
                            bT += (td.reqInit) ? `, le cui bandiere ` : ` le cui bandiere `;
                            if (td.reqColor) bT += `includono il <strong>${td.reqColor.toUpperCase()}</strong> e `;
                            if (td.isColoreEmblema) bT += `raffigurano un elemento grafico di colore <strong>${td.elemScelto.toUpperCase()}</strong>`;
                            else bT += `raffigurano l'elemento grafico <strong>${td.elemScelto.toUpperCase()}</strong>`;
                            if (td.negColor) bT += ` ma <span class='negative-constraint'>NON</span> contengono il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            finalQ = bT + ".";
                        }
                        break;
                    
                    case 4:
                        let f4t = (num === 1) ? `Nomina 1 ${nI} che confina via terra SIA con <strong>${td.reqConf1.toUpperCase()}</strong> SIA con <strong>${td.reqConf2.toUpperCase()}</strong>` : `Nomina ${nI_p} che confinano via terra SIA con <strong>${td.reqConf1.toUpperCase()}</strong> SIA con <strong>${td.reqConf2.toUpperCase()}</strong>`;
                        if (td.negBorders && td.negBorders.length > 0) {
                            let negB = td.negBorders.map(b => `<strong>${b.toUpperCase()}</strong>`);
                            if (negB.length === 1) f4t += ` ma <span class='negative-constraint'>NON</span> con ${negB[0]}`;
                            else f4t += ` ma <span class='negative-constraint'>NON</span> con ${negB.join(" e <span class='negative-constraint'>NON</span> con ")}`;
                        }
                        finalQ = f4t + ".";
                        break;
                    
                    case 5:
                        if (num === 1) {
                            let t5 = `Nomina 1 ${nI}`;
                            if (td.reqArea) t5 += ` ${areaP}`;
                            t5 += ` che confina via terra con ESATTAMENTE <strong>${td.targetNode.confini.length}</strong> stati.`;
                            finalQ = t5;
                        } else {
                            let t5 = `Nomina ${nI_p}`;
                            if (td.reqArea) t5 += ` ${areaP}`;
                            t5 += ` che confinano via terra con ESATTAMENTE <strong>${td.targetNode.confini.length}</strong> stati.`;
                            finalQ = t5;
                        }
                        break;
                    
                    case 6:
                        if (num === 1) {
                            if (td.varEnigmistica === 0) finalQ = `Nomina 1 ${cS} ${areaP} che inizia con la lettera <strong>${td.reqCapInit.toUpperCase()}</strong>.`;
                            if (td.varEnigmistica === 1) finalQ = `Nomina 1 ${cS} ${areaP} che finisce con la lettera <strong>${td.reqCapFin.toUpperCase()}</strong>.`;
                            if (td.varEnigmistica === 2) finalQ = `Nomina 1 ${cS} ${areaP} che inizia per <strong>${td.reqCapInit.toUpperCase()}</strong> e finisce per <strong>${td.reqCapFin.toUpperCase()}</strong>.`;
                        } else {
                            if (td.varEnigmistica === 0) finalQ = `Nomina ${cS_p} ${areaP} che iniziano con la lettera <strong>${td.reqCapInit.toUpperCase()}</strong>.`;
                            if (td.varEnigmistica === 1) finalQ = `Nomina ${cS_p} ${areaP} che finiscono con la lettera <strong>${td.reqCapFin.toUpperCase()}</strong>.`;
                            if (td.varEnigmistica === 2) finalQ = `Nomina ${cS_p} ${areaP} che iniziano per <strong>${td.reqCapInit.toUpperCase()}</strong> e finiscono per <strong>${td.reqCapFin.toUpperCase()}</strong>.`;
                        }
                        break;
                    
                   case 7:
                        if (num === 1) {
                            finalQ = `Nomina 1 ${nI} che confina via terra con <strong>${td.targetNode.confini[0].toUpperCase()}</strong>.`;
                        } else {
                            finalQ = `Nomina ${nI_p} che confinano via terra con <strong>${td.targetNode.confini[0].toUpperCase()}</strong>.`;
                        }
                        break;
                    
                    case 8:
                        let t8 = "";
                        if (num === 1) {
                            if (td.reqGeo === 'isola') t8 = `Nomina 1 ${sTI}`;
                            else if (td.reqGeo === 'costiera') t8 = `Nomina 1 <span class='target-highlight'>STATO CONTINENTALE</span> CON <strong>SBOCCO SUL MARE</strong> (non insulare)`;
                            else if (td.reqGeo === 'marittima') t8 = `Nomina 1 <span class='target-highlight'>STATO O TERRITORIO</span> CON <strong>SBOCCO SUL MARE</strong>`;
                            else if (td.reqGeo === 'interna') t8 = `Nomina 1 <span class='target-highlight'>STATO O TERRITORIO</span> <strong>SENZA SBOCCHI SUL MARE</strong>`;
                            
                            if (td.reqArea) t8 += ` ${areaP}`;
                            if (td.reqInit) t8 += ` che inizia con la lettera <strong>${td.reqInit.toUpperCase()}</strong>`;
                            if (td.negColor) {
                                t8 += (td.reqInit) ? ` e la cui bandiera ` : ` la cui bandiera `;
                                t8 += `<span class='negative-constraint'>NON</span> contiene il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            }
                        } else {
                            if (td.reqGeo === 'isola') t8 = `Nomina ${sTI_p}`;
                            else if (td.reqGeo === 'costiera') t8 = `Nomina <span class='target-highlight'>${num} STATI CONTINENTALI</span> CON <strong>SBOCCO SUL MARE</strong> (Non insulari)`;
                            else if (td.reqGeo === 'marittima') t8 = `Nomina <span class='target-highlight'>${num} STATI O TERRITORI</span> CON <strong>SBOCCO SUL MARE</strong>`;
                            else if (td.reqGeo === 'interna') t8 = `Nomina <span class='target-highlight'>${num} STATI O TERRITORI</span> <strong>SENZA SBOCCHI SUL MARE</strong>`;
                            
                            if (td.reqArea) t8 += ` ${areaP}`;
                            if (td.reqInit) t8 += ` che iniziano con la lettera <strong>${td.reqInit.toUpperCase()}</strong>`;
                            if (td.negColor) {
                                t8 += (td.reqInit) ? ` e le cui bandiere ` : ` le cui bandiere `;
                                t8 += `<span class='negative-constraint'>NON</span> contengono il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            }
                        }
                        finalQ = t8 + ".";
                        break;
                    
                    case 9:
                        if (num === 1) {
                            finalQ = td.isComboInception 
                                ? `Nomina 1 ${nI} che confina via terra con il Paese${cloneHint} di <strong>QUESTA BANDIERA</strong>.` 
                                : `Di quale ${sT}${cloneHint} è questa bandiera?`;
                        } else {
                            finalQ = td.isComboInception 
                                ? `Nomina ${nI_p} che confinano via terra con il Paese${cloneHint} di <strong>QUESTA BANDIERA</strong>.` 
                                : "";
                        }
                        break;
                    
                    case 10:
                        if (num === 1) {
                            finalQ = td.isComboInception 
                                ? `Nomina 1 ${cS} di uno <strong>STATO INDIPENDENTE</strong> che confina via terra con il Paese${cloneHint} di <strong>QUESTA BANDIERA</strong>.` 
                                : `Qual è la ${cS} di questo <strong>STATO O TERRITORIO</strong>${cloneHint}?`;
                        } else {
                            finalQ = td.isComboInception 
                                ? `Nomina ${cS_p} di altrettanti <strong>STATI INDIPENDENTI</strong> che confinano via terra con il Paese${cloneHint} di <strong>QUESTA BANDIERA</strong>.` 
                                : "";
                        }
                        break;
                    
                    case 11:
                        let t11 = "";
                        if (num === 1) {
                            if (td.reqGeo === 'isola') t11 = `Nomina 1 ${sTI}`;
                            else if (td.reqGeo === 'costiera') t11 = `Nomina 1 <span class='target-highlight'>STATO CONTINENTALE</span> CON <strong>SBOCCO SUL MARE</strong> (non insulare)`;
                            else if (td.reqGeo === 'marittima') t11 = `Nomina 1 <span class='target-highlight'>STATO O TERRITORIO</span> CON <strong>SBOCCO SUL MARE</strong>`;
                            else if (td.reqGeo === 'interna') t11 = `Nomina 1 <span class='target-highlight'>STATO O TERRITORIO</span> <strong>SENZA SBOCCHI SUL MARE</strong>`;
                            else t11 = `Nomina 1 ${sT}`;
                            
                            if (td.reqArea) t11 += ` ${areaP}`;
                            if (td.reqInit) t11 += ` che inizia per <strong>${td.reqInit.toUpperCase()}</strong>`;
                            if (td.reqCapInit) {
                                t11 += (td.reqInit) ? ` e la cui capitale inizia per <strong>${td.reqCapInit.toUpperCase()}</strong>` : ` la cui capitale inizia per <strong>${td.reqCapInit.toUpperCase()}</strong>`;
                            }
                            
                            t11 += (td.reqInit || td.reqCapInit) ? `, la cui bandiera presenta la caratteristica: ` : ` la cui bandiera è caratterizzata da: `;
                            t11 += `<strong>${td.reqFormato.toUpperCase()}</strong>`;
                            
                            if (td.reqColor) t11 += ` e contiene il colore <strong>${td.reqColor.toUpperCase()}</strong>`;
                            if (td.negColor) t11 += ` ma <span class='negative-constraint'>NON</span> contiene il <strong>${td.negColor.toUpperCase()}</strong>`;
                            if (td.negInit) t11 += ` e il cui nome <span class='negative-constraint'>NON</span> inizia per la lettera <strong>${td.negInit.toUpperCase()}</strong>`;
                        } else {
                            if (td.reqGeo === 'isola') t11 = `Nomina ${sTI_p}`;
                            else if (td.reqGeo === 'costiera') t11 = `Nomina <span class='target-highlight'>${num} STATI CONTINENTALI</span> CON <strong>SBOCCO SUL MARE</strong> (Non insulari)`;
                            else if (td.reqGeo === 'marittima') t11 = `Nomina <span class='target-highlight'>${num} STATI O TERRITORI</span> CON <strong>SBOCCO SUL MARE</strong>`;
                            else if (td.reqGeo === 'interna') t11 = `Nomina <span class='target-highlight'>${num} STATI O TERRITORI</span> <strong>SENZA SBOCCHI SUL MARE</strong>`;
                            else t11 = `Nomina ${sT_p}`;
                            
                            if (td.reqArea) t11 += ` ${areaP}`;
                            if (td.reqInit) t11 += ` che iniziano per <strong>${td.reqInit.toUpperCase()}</strong>`;
                            if (td.reqCapInit) {
                                t11 += (td.reqInit) ? ` e le cui capitali iniziano per <strong>${td.reqCapInit.toUpperCase()}</strong>` : ` le cui capitali iniziano per <strong>${td.reqCapInit.toUpperCase()}</strong>`;
                            }
                            
                            t11 += (td.reqInit || td.reqCapInit) ? `, le cui bandiere presentano la caratteristica: ` : ` le cui bandiere sono caratterizzate da: `;
                            t11 += `<strong>${td.reqFormato.toUpperCase()}</strong>`;
                            
                            if (td.reqColor) t11 += ` e contengono il colore <strong>${td.reqColor.toUpperCase()}</strong>`;
                            if (td.negColor) t11 += ` ma <span class='negative-constraint'>NON</span> contengono il <strong>${td.negColor.toUpperCase()}</strong>`;
                            if (td.negInit) t11 += ` e i cui nomi <span class='negative-constraint'>NON</span> iniziano per la lettera <strong>${td.negInit.toUpperCase()}</strong>`;
                        }
                        finalQ = t11 + ".";
                        break;

                    case 12:
                        let t12 = "";
                        if (num === 1) {
                            t12 = td.f12AskCapital ? `Nomina 1 ${cS} di uno <strong>STATO</strong>` : `Nomina 1 ${sT}`;
                            if (td.reqArea) t12 += ` ${areaP}`;
                            if (td.reqInit) t12 += (td.f12AskCapital) ? ` il cui nome inizia per <strong>${td.reqInit.toUpperCase()}</strong>` : ` che inizia per <strong>${td.reqInit.toUpperCase()}</strong>`;
                            
                            t12 += `, la cui bandiera INCLUDE i colori `;
                            if (td.f12Colors.length === 3) t12 += `<strong>${td.f12Colors[0].toUpperCase()}, ${td.f12Colors[1].toUpperCase()}</strong> e <strong>${td.f12Colors[2].toUpperCase()}</strong>`;
                            else t12 += `<strong>${td.f12Colors[0].toUpperCase()}</strong> e <strong>${td.f12Colors[1].toUpperCase()}</strong>`;
                            
                            if (td.f12RequiresSymbol) t12 += ` e raffigura l'elemento grafico <strong>${td.f12RequiresSymbol.toUpperCase()}</strong>`;
                            if (td.negColor) t12 += ` ma <span class='negative-constraint'>NON</span> contiene il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            if (td.negInit) t12 += (td.f12AskCapital) ? ` e il cui nome <span class='negative-constraint'>NON</span> inizia per <strong>${td.negInit.toUpperCase()}</strong>` : ` e il cui nome <span class='negative-constraint'>NON</span> inizia per <strong>${td.negInit.toUpperCase()}</strong>`;
                        } else {
                            t12 = td.f12AskCapital ? `Nomina ${cS_p} di altrettanti <strong>STATI</strong>` : `Nomina ${sT_p}`;
                            if (td.reqArea) t12 += ` ${areaP}`;
                            if (td.reqInit) t12 += (td.f12AskCapital) ? ` i cui nomi iniziano per <strong>${td.reqInit.toUpperCase()}</strong>` : ` che iniziano per <strong>${td.reqInit.toUpperCase()}</strong>`;
                            
                            t12 += `, le cui bandiere INCLUDONO i colori `;
                            if (td.f12Colors.length === 3) t12 += `<strong>${td.f12Colors[0].toUpperCase()}, ${td.f12Colors[1].toUpperCase()}</strong> e <strong>${td.f12Colors[2].toUpperCase()}</strong>`;
                            else t12 += `<strong>${td.f12Colors[0].toUpperCase()}</strong> e <strong>${td.f12Colors[1].toUpperCase()}</strong>`;
                            
                            if (td.f12RequiresSymbol) t12 += ` e raffigurano l'elemento grafico <strong>${td.f12RequiresSymbol.toUpperCase()}</strong>`;
                            if (td.negColor) t12 += ` ma <span class='negative-constraint'>NON</span> contengono il colore <strong>${td.negColor.toUpperCase()}</strong>`;
                            if (td.negInit) t12 += (td.f12AskCapital) ? ` e i cui nomi <span class='negative-constraint'>NON</span> iniziano per <strong>${td.negInit.toUpperCase()}</strong>` : ` e i cui nomi <span class='negative-constraint'>NON</span> iniziano per <strong>${td.negInit.toUpperCase()}</strong>`;
                        }
                        finalQ = t12 + ".";
                        break;

		    case 13:
                        finalQ = "Seleziona la bandiera di <strong>" + td.targetNode.nome.toUpperCase() + "</strong>.";
                        break;
                }
                
                if (![0, 1, 9, 10].includes(format)) {
                    let punc = finalQ.slice(-1);
                    let base = finalQ.slice(0, -1);
                    
                    let extraNegs = [];
                    let isCap = (format === 6 || (format === 12 && td.f12AskCapital));
                    let sS = isCap ? "di uno Stato che" : "che";
                    let sP = isCap ? "di Stati che" : "che";
                    
                    if (td.negGeo) {
                        if (td.negGeo === 'isola') extraNegs.push(num === 1 ? `${sS} <span class='negative-constraint'>NON</span> sia insulare` : `${sP} <span class='negative-constraint'>NON</span> siano insulari`);
                        else if (td.negGeo === 'costiera') extraNegs.push(num === 1 ? `${sS} <span class='negative-constraint'>NON</span> sia continentale costiero` : `${sP} <span class='negative-constraint'>NON</span> siano continentali costieri`);
                        else if (td.negGeo === 'interna') extraNegs.push(num === 1 ? `${sS} abbia sbocchi sul mare` : `${sP} abbiano sbocchi sul mare`);
                    }
                    if (td.negArea) {
                        extraNegs.push(getPreposizioneAreaNegativa(td.negArea, num));
                    }
                    
                    if (extraNegs.length > 0) {
                        base += ", " + extraNegs.join(" e ");
                    }
                    return base + punc;
                }
                return finalQ;
            };

            let tempValid = getValidAnswersArray(td, currentLevel);
            
            let isMitragliatrice = (currentLevel === 4) || (currentLevel === 5 && customConfig.maxCombo > 2);
            let isCecchino = (currentLevel === 3) || (currentLevel === 5 && customConfig.maxCombo <= 2);
            
            let maxNegs = 0;
            let negProb = 0;
            if (currentLevel === 2) { maxNegs = 1; negProb = 0.40; } 
            else if (isCecchino || isMitragliatrice) { maxNegs = 2; negProb = 0.85; }
            
            td.negBorders = []; 
            
            let allowSmartNeg = lvlCheckNeg;
            
            // FIX PALETTO INVISIBILE: Disabilita i vincoli negativi per domande dirette e confini
            if ([0, 1, 9, 10].includes(td.format)) allowSmartNeg = false;
            
            if (tempValid.length > 1 && allowSmartNeg && !td.disableSmartNeg && Math.random() < negProb) {
                let possibleNegColors = new Set();
                let possibleNegInits = new Set();
                let possibleNegBorders = new Set();
                let possibleNegAreas = new Set();
                let possibleNegGeos = new Set();

                let targetColors = [...td.targetNode.colori_base, ...td.targetNode.colori_emblema];
                let targetInit = td.targetNode.nome.charAt(0).toUpperCase();
                let targetBorders = td.targetNode.confini;
                let targetNameLower = td.targetNode.nome.toLowerCase();

                let otherCountries = getAnswerPool(currentLevel).filter(c => {
                    let isMatch = false;
                    let capStr = c.capitale ? capitalize(c.capitale) + " (" + capitalize(c.nome) + ")" : "";
                    let nomStr = capitalize(c.nome);
                    if (tempValid.includes(nomStr) || tempValid.includes(capStr)) {
                        if (c.sigla !== td.targetNode.sigla) isMatch = true;
                    }
                    return isMatch;
                });

                otherCountries.forEach(c => {
                    if (td.format === 3 || td.format === 8 || td.format === 11 || td.format === 12) {
                        let colsToCheck = [...c.colori_base, ...c.colori_emblema];
                        colsToCheck.forEach(col => { if (!targetColors.includes(col)) possibleNegColors.add(col); });
                    }
                    if (td.format === 11 || td.format === 12) {
                        let cInit = c.nome.charAt(0).toUpperCase();
                        if (cInit !== targetInit) possibleNegInits.add(cInit);
                    }
                    if (td.format === 4) {
                        c.confini.forEach(b => {
                            if (b !== 'mare' && !targetBorders.includes(b) && b !== targetNameLower) possibleNegBorders.add(b);
                        });
                    }
                    
                    let diffAreas = c.aree.filter(a => !td.targetNode.aree.includes(a));
                    if (diffAreas.length > 0) possibleNegAreas.add(diffAreas[Math.floor(Math.random() * diffAreas.length)]);
                    
                    if (!td.reqGeo && c.tipoGeo !== td.targetNode.tipoGeo) {
                        possibleNegGeos.add(c.tipoGeo);
                    }
                });

                let negOptions = [];
                possibleNegColors.forEach(c => negOptions.push({type: 'color', val: c}));
                possibleNegInits.forEach(i => negOptions.push({type: 'init', val: i}));
                possibleNegBorders.forEach(b => negOptions.push({type: 'border', val: b}));
                possibleNegAreas.forEach(a => negOptions.push({type: 'area', val: a}));
                possibleNegGeos.forEach(g => negOptions.push({type: 'geo', val: g}));

                if (negOptions.length > 0) {
                    negOptions.sort(() => 0.5 - Math.random());
                    
                    let appliedNegs = 0;
                    let usedTypes = new Set();
                    
                    for (let opt of negOptions) {
                        if (tempValid.length === 1) break; 
                        if (appliedNegs >= maxNegs) break;
                        if (usedTypes.has(opt.type) && opt.type !== 'border') continue;
                        if (opt.type === 'border' && td.negBorders.length >= (currentLevel >= 3 ? 2 : 1)) continue;

                        let backupVal = null;
                        if (opt.type === 'color') { backupVal = td.negColor; td.negColor = opt.val; }
                        else if (opt.type === 'init') { backupVal = td.negInit; td.negInit = opt.val; }
                        else if (opt.type === 'area') { backupVal = td.negArea; td.negArea = opt.val; }
                        else if (opt.type === 'geo') { backupVal = td.negGeo; td.negGeo = opt.val; }
                        else if (opt.type === 'border') td.negBorders.push(opt.val);

                        td.numVariables++;
                        let testValid = getValidAnswersArray(td, currentLevel);
                        
                        let rollback = false;
                        if (testValid.length === 0) rollback = true; 
                        else if (testValid.length === tempValid.length) rollback = true; 
                        else if (isMitragliatrice && testValid.length < 6) rollback = true; 
                        
                        if (rollback) {
                            if (opt.type === 'color') td.negColor = backupVal;
                            else if (opt.type === 'init') td.negInit = backupVal;
                            else if (opt.type === 'area') td.negArea = backupVal;
                            else if (opt.type === 'geo') td.negGeo = backupVal;
                            else if (opt.type === 'border') td.negBorders.pop();
                            td.numVariables--;
                        } else {
                            appliedNegs++;
                            usedTypes.add(opt.type);
                            tempValid = testValid;
                        }
                    }
                }
            }

            if (currentLevel >= 3 && ![0, 1, 9, 10].includes(td.format) && td.numVariables < 2) {
                return generateQuestion(); 
            }

            if (tempValid.length === 0) return generateQuestion(); 
            
            getValidAnswersArray(td, currentLevel);

            let typeableSet = new Set();
            let isCapRequired = td.format === 0 || td.format === 6 || td.format === 10 || (td.format === 12 && td.f12AskCapital);
            
            td.validSiglas.forEach(s => {
                let node = globalDb.find(n => n.sigla === s);
                if (node) {
                    if (isCapRequired && node.capitale) {
                        typeableSet.add(normalizzaTesto(node.capitale));
                    } else {
                        typeableSet.add(normalizzaTesto(node.nome));
                    }
                }
            });

            td.maxPossible = typeableSet.size; // RESTA GLOBALE: Salva il calcolo dei punti (es. 5 confini)

            td.validAnswersCache = tempValid;
            td.numReq = 1;

            if (currentLevel === 4 || currentLevel === 5) {
                let limitCombo = (currentLevel === 5) ? customConfig.maxCombo : 5;
                if ([0, 1, 9, 10].includes(format) && !td.isComboInception) {
                    td.numReq = 1; 
                } else {
                    // CONTA QUANTE DELLE RISPOSTE VALIDE SONO PRESENTI NELLA TUA DIFFICOLTÀ
                    let localCount = 0;
                    td.validSiglas.forEach(s => {
                        if (levelDb.some(n => n.sigla === s)) localCount++;
                    });
                    if (localCount === 0) localCount = 1; // Sicurezza anti-crash
                    
                    // IL LIMITE DELLA RICHIESTA USA localCount, MA maxPossible RESTA GLOBALE!
                    let maxR = Math.min(limitCombo, localCount); 
                    td.numReq = Math.floor(Math.random() * maxR) + 1;
                }
            }

            td.questionText = td.buildQuestionText(td.numReq);
            return td;
        }

	function getAnswerPool(level) {
            if (level !== 5) return globalDb;
            return globalDb.filter(c => {
                let cl = c.aree.join(" ").toLowerCase();
                let isAm = cl.includes('nord america') || cl.includes('sud america') || cl.includes('america centrale') || cl.includes('caraibi');
                let match = false;
                if(customConfig.continenti.includes('europa') && cl.includes('europa')) match = true;
                if(customConfig.continenti.includes('asia') && cl.includes('asia')) match = true;
                if(customConfig.continenti.includes('africa') && cl.includes('africa')) match = true;
                if(customConfig.continenti.includes('oceania') && cl.includes('oceania')) match = true;
                if(customConfig.continenti.includes('americhe') && isAm) match = true;
                return match;
            });
        }

	function getValidAnswersArray(td, level) {
            let validList = [];
            td.validSiglas = [];
            
            const checkInitAny = (country, req) => {
                if (!req) return true;
                return country.nome.toLowerCase().startsWith(req.toLowerCase());
            };
            
            const checkCapInitAny = (country, req) => {
                if (!req) return true;
                if (!country.capitale) return false;
                return country.capitale.toLowerCase().startsWith(req.toLowerCase());
            };

            for (let country of getAnswerPool(level)) {
                let match = false;
                
                if (td.negColor && (country.colori_base.includes(td.negColor) || country.colori_emblema.includes(td.negColor))) continue;
                
                if (td.negBorders && td.negBorders.length > 0) {
                    let hasNegBorder = false;
                    let cNames = [country.nome.toLowerCase(), ...country.alias_paese_ufficiali];
                    for (let nb of td.negBorders) {
                        if (country.confini.includes(nb) || cNames.includes(nb)) { hasNegBorder = true; break; }
                    }
                    if (hasNegBorder) continue;
                }
                
                if (td.negArea && country.aree.includes(td.negArea)) continue;
                if (td.negGeo && country.tipoGeo === td.negGeo) continue;
                
                if (td.negInit) {
                    if (checkInitAny(country, td.negInit)) continue;
                }

                if (td.isComboInception) {
                    let targetConfini = td.targetNode.confini;
                    let m = false;
                    let countryNames = [country.nome.toLowerCase(), ...country.alias_paese_ufficiali];
                    for (let name of countryNames) {
                        if (targetConfini.includes(name)) { m = true; break; }
                    }
                    if (m && country.indipendente) {
                        let hasCap = (td.format === 0 || td.format === 10);
                        if (!hasCap || country.capitale) {
                            match = true; 
                        }
                    }
                } else {
                    if (td.format === 0) { if (country.sigla === td.targetNode.sigla) match = true; }
                    else if (td.format === 1) { if (country.capitale && normalizzaTesto(country.capitale) === normalizzaTesto(td.targetNode.capitale) && !isDoppelganger(country.capitale, td.targetNode.capitale)) match = true; }
                    else if (td.format === 2) {
                        let cBaseRichiesti = td.targetNode.colori_base;
                        if (td.f2RequiresSymbol) {
                            if (country.colori_base.includes(cBaseRichiesti[0]) && country.simboli.includes(td.f2RequiresSymbol)) match = true;
                        } else {
                            if (country.colori_base.sort().join(',') === cBaseRichiesti.sort().join(',')) match = true;
                        }
                    }
                    else if (td.format === 3) {
                        let m = false;
                        if (td.isColoreEmblema) { if (country.colori_emblema.includes(td.elemScelto)) m = true; } 
                        else { if (country.simboli.includes(td.elemScelto)) m = true; }
                        if (m && td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                        
                        if (m && td.reqColor) {
                            let hasColor = country.colori_base.includes(td.reqColor) || country.colori_emblema.includes(td.reqColor);
                            if (!hasColor) m = false;
                        }
                        
                        if (m && td.reqInit) {
                            if(!checkInitAny(country, td.reqInit)) m = false;
                        }
                        if (m) match = true;
                    }
                    else if (td.format === 4) {
                        if (country.confini.includes(td.reqConf1) && country.confini.includes(td.reqConf2) && country.indipendente) match = true;
                    }
                    else if (td.format === 5) {
                        if (country.confini.length === td.targetNode.confini.length && country.indipendente) {
                            if (!td.reqArea || country.aree.includes(td.reqArea)) match = true;
                        }
                    }
                    else if (td.format === 6) {
                        let capPaese = country.capitale ? country.capitale.toLowerCase() : "";
                        if (capPaese && country.aree.includes(td.selectedArea)) {
                            let textMatch = false;
                            let cn = capPaese;
                            if (td.varEnigmistica === 0 && cn.startsWith(td.reqCapInit.toLowerCase())) textMatch = true;
                            if (td.varEnigmistica === 1 && cn.endsWith(td.reqCapFin.toLowerCase())) textMatch = true;
                            if (td.varEnigmistica === 2 && cn.startsWith(td.reqCapInit.toLowerCase()) && cn.endsWith(td.reqCapFin.toLowerCase())) textMatch = true;
                            if (textMatch) match = true;
                        }
                    }
                    else if (td.format === 7) {
                        if (country.confini.includes(td.targetNode.confini[0]) && country.indipendente) match = true;
                    }
                    else if (td.format === 8) {
                        let geoMatch = false;
                        if (td.reqGeo === 'marittima') {
                            if (country.tipoGeo === 'isola' || country.tipoGeo === 'costiera') geoMatch = true;
                        } else {
                            if (country.tipoGeo === td.reqGeo) geoMatch = true;
                        }
                        if (geoMatch) {
                            let ok = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) ok = false;
                            if (td.reqInit) {
                                if(!checkInitAny(country, td.reqInit)) ok = false;
                            }
                            if (ok) match = true;
                        }
                    }
                    else if (td.format === 9 || td.format === 10 || td.format === 13) {
                        if (country.sigla === td.targetNode.sigla) match = true;
                    }
                    else if (td.format === 11) {
                        if (country.formati_bandiera.includes(td.reqFormato)) {
                            let m = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                            if (td.reqGeo) {
                                if (td.reqGeo === 'marittima') {
                                    if (country.tipoGeo !== 'isola' && country.tipoGeo !== 'costiera') m = false;
                                } else {
                                    if (country.tipoGeo !== td.reqGeo) m = false;
                                }
                            }
                            
                            if (td.reqColor) {
                                let hasColor = country.colori_base.includes(td.reqColor) || country.colori_emblema.includes(td.reqColor);
                                if (!hasColor) m = false;
                            }
                            
                            if (td.reqCapInit) {
                                if(!checkCapInitAny(country, td.reqCapInit)) m = false;
                            }
                            if (td.reqInit) {
                                if(!checkInitAny(country, td.reqInit)) m = false;
                            }
                            if (m) match = true;
                        }
                    }
                    else if (td.format === 12) {
                        let allCountryColors = [...country.colori_base, ...country.colori_emblema];
                        let hasAllColors = td.f12Colors.every(col => allCountryColors.includes(col));
                        if (hasAllColors) {
                            let m = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                            if (td.f12RequiresSymbol && !country.simboli.includes(td.f12RequiresSymbol)) m = false;
                            if (td.reqInit) {
                                if(!checkInitAny(country, td.reqInit)) m = false;
                            }
                            if (td.f12AskCapital && !country.capitale) m = false;
                            
                            if (m) match = true;
                        }
                    }
                }

                if (match) {
                    td.validSiglas.push(country.sigla);
                    
                    let dName = capitalize(country.nome);
                    if (td.reqInit && !country.nome.toLowerCase().startsWith(td.reqInit.toLowerCase())) {
                        let offAlias = country.alias_paese_ufficiali.find(a => a.toLowerCase().startsWith(td.reqInit.toLowerCase()));
                        if (offAlias) dName = capitalize(offAlias);
                    }

                    if (td.format === 0 || td.format === 10 || td.format === 6 || (td.format === 12 && td.f12AskCapital)) {
                        let cName = capitalize(country.capitale);
                        
                        let textMatchBase = false;
                        let cnLower = country.capitale ? country.capitale.toLowerCase() : "";
                        if (td.reqCapInit && cnLower.startsWith(td.reqCapInit.toLowerCase())) textMatchBase = true;
                        if (td.format === 6 && cnLower) {
                            let starts = td.reqCapInit ? cnLower.startsWith(td.reqCapInit.toLowerCase()) : true;
                            let ends = td.reqCapFin ? cnLower.endsWith(td.reqCapFin.toLowerCase()) : true;
                            if (starts && ends) textMatchBase = true;
                        }
                        
                        if (!textMatchBase && country.alias_capitale_ufficiali) {
                            let offCapAlias = country.alias_capitale_ufficiali.find(c => {
                                let cLow = c.toLowerCase();
                                let s = td.reqCapInit ? cLow.startsWith(td.reqCapInit.toLowerCase()) : true;
                                let e = td.reqCapFin ? cLow.endsWith(td.reqCapFin.toLowerCase()) : true;
                                return s && e;
                            });
                            if (offCapAlias) cName = capitalize(offCapAlias);
                        }
                        
                        validList.push(cName + " (" + dName + ")");
                    } else {
                        validList.push(dName);
                    }
                }
            }
            return validList;
        }

        function checkInit(country, matchedName, reqI) {
            if (!reqI) return true;
            if (country.nome.toLowerCase().startsWith(reqI.toLowerCase())) return true;
            if (country.alias_paese_ufficiali.map(a=>a.toLowerCase()).includes(matchedName.toLowerCase())) {
                if (matchedName.toLowerCase().startsWith(reqI.toLowerCase())) return true;
            }
            return false;
        }

        function checkCapInit(country, matchedCap, reqCapI) {
            if (!reqCapI) return true;
            if (!country.capitale) return false;
            if (country.capitale.toLowerCase().startsWith(reqCapI.toLowerCase())) return true;
            if (country.alias_capitale_ufficiali.map(a=>a.toLowerCase()).includes(matchedCap.toLowerCase())) {
                if (matchedCap.toLowerCase().startsWith(reqCapI.toLowerCase())) return true;
            }
            return false;
        }

        function checkSingleAnswer(inputStr, td, level) {
            let bestMatch = null;
            let globalMinDist = 999;
            let bestMatchNameStr = "";
            let bestMatchCapitalStr = "";

            // Il motore guarda tutto il mondo SOLO per le tre casistiche di confine, altrimenti resta nel livello/continente!
            let searchPool = (td.format === 4 || td.format === 7 || td.isComboInception) ? globalDb : getAnswerPool(level);
            
            for (let country of searchPool) {
                if (td.negColor && (country.colori_base.includes(td.negColor) || country.colori_emblema.includes(td.negColor))) continue;
                
                if (td.negBorders && td.negBorders.length > 0) {
                    let hasNegBorder = false;
                    let cNames = [country.nome.toLowerCase(), ...country.alias_paese_ufficiali];
                    for (let nb of td.negBorders) {
                        if (country.confini.includes(nb) || cNames.includes(nb)) { hasNegBorder = true; break; }
                    }
                    if (hasNegBorder) continue;
                }
                
                if (td.negArea && country.aree.includes(td.negArea)) continue;
                if (td.negGeo && country.tipoGeo === td.negGeo) continue;
                
                if (td.negInit) {
                    let cNamesOff = [country.nome.toLowerCase(), ...country.alias_paese_ufficiali];
                    if (cNamesOff.some(n => n.startsWith(td.negInit.toLowerCase()))) continue;
                }

                let validNames = [country.nome.toLowerCase(), ...country.alias_paese];
                let validCapitals = country.capitale ? [country.capitale.toLowerCase(), ...country.alias_capitale] : [];
                
                let nameMatch = false;
                let nameDist = 999;
                let matchedNameStr = "";
                for(let n of validNames) {
                    if (isDoppelganger(inputStr, n)) continue;
                    let d = levenshteinDistance(inputStr, n);
                    if (d <= getLevenshteinTolerance(n, level)) {
                        nameMatch = true;
                        if(d < nameDist) {
                            nameDist = d;
                            matchedNameStr = n;
                        }
                    }
                }

                let capitalMatch = false;
                let capDist = 999;
                let matchedCapitalStr = "";
                for(let c of validCapitals) {
                    if (isDoppelganger(inputStr, c)) continue;
                    let d = levenshteinDistance(inputStr, c);
                    if (d <= getLevenshteinTolerance(c, level)) {
                        capitalMatch = true;
                        if(d < capDist) {
                            capDist = d;
                            matchedCapitalStr = c;
                        }
                    }
                }

                let match = false;
                let relevantDist = 999;

                if (td.isComboInception) {
                    let targetConfini = td.targetNode.confini;
                    let cNames = [country.nome.toLowerCase(), ...country.alias_paese_ufficiali];
                    let isBordering = cNames.some(n => targetConfini.includes(n));
                    
                    if (isBordering && country.indipendente) {
                        if (td.format === 0 || td.format === 10) {
                            if (capitalMatch && country.capitale) { match = true; relevantDist = capDist; }
                        } else if (td.format === 1 || td.format === 9) {
                            if (nameMatch) { match = true; relevantDist = nameDist; }
                        }
                    }
                } else {
                    if (td.format === 0 && capitalMatch && country.sigla === td.targetNode.sigla) { match = true; relevantDist = capDist; }
                    else if (td.format === 1 && nameMatch && country.capitale && normalizzaTesto(country.capitale) === normalizzaTesto(td.targetNode.capitale) && !isDoppelganger(country.capitale, td.targetNode.capitale)) { match = true; relevantDist = nameDist; }
                    else if (td.format === 2) {
                        let cBaseRichiesti = td.targetNode.colori_base;
                        if (td.f2RequiresSymbol) {
                            if (country.colori_base.includes(cBaseRichiesti[0]) && country.simboli.includes(td.f2RequiresSymbol) && nameMatch) { match = true; relevantDist = nameDist; }
                        } else {
                            if (country.colori_base.sort().join(',') === cBaseRichiesti.sort().join(',')) {
                                if (nameMatch) { match = true; relevantDist = nameDist; }
                            }
                        }
                    }
                    else if (td.format === 3) {
                        let m = false;
                        if (td.isColoreEmblema) { if (country.colori_emblema.includes(td.elemScelto)) m = true; }
                        else { if (country.simboli.includes(td.elemScelto)) m = true; }
                        if (m && td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                        
                        if (m && td.reqColor) {
                            let hasColor = country.colori_base.includes(td.reqColor) || country.colori_emblema.includes(td.reqColor);
                            if (!hasColor) m = false;
                        }
                        
                        if (m && td.reqInit) {
                            if(!checkInit(country, matchedNameStr, td.reqInit)) m = false;
                        }
                        if (m && nameMatch) { match = true; relevantDist = nameDist; }
                    }
                    else if (td.format === 4) {
                        if (country.confini.includes(td.reqConf1) && country.confini.includes(td.reqConf2) && country.indipendente && nameMatch) { match = true; relevantDist = nameDist; }
                    }
                    else if (td.format === 5) {
                        if (country.confini.length === td.targetNode.confini.length && country.indipendente && nameMatch) {
                            if (!td.reqArea || country.aree.includes(td.reqArea)) { match = true; relevantDist = nameDist; }
                        }
                    }
                    else if (td.format === 6) {
                        let capPaese = country.capitale ? country.capitale.toLowerCase() : "";
                        if (capPaese && country.aree.includes(td.selectedArea) && capitalMatch) {
                            let textMatch = false;
                            let stringToTest = country.capitale.toLowerCase();
                            if (!stringToTest.startsWith(td.reqCapInit.toLowerCase()) && 
                                country.alias_capitale_ufficiali.map(a=>a.toLowerCase()).includes(matchedCapitalStr.toLowerCase())) {
                                stringToTest = matchedCapitalStr.toLowerCase();
                            }

                            if (td.varEnigmistica === 0 && stringToTest.startsWith(td.reqCapInit.toLowerCase())) textMatch = true;
                            if (td.varEnigmistica === 1 && stringToTest.endsWith(td.reqCapFin.toLowerCase())) textMatch = true;
                            if (td.varEnigmistica === 2 && stringToTest.startsWith(td.reqCapInit.toLowerCase()) && stringToTest.endsWith(td.reqCapFin.toLowerCase())) textMatch = true;
                            
                            if (textMatch) { match = true; relevantDist = capDist; }
                        }
                    }
                    else if (td.format === 7) {
                        if (country.confini.includes(td.targetNode.confini[0]) && country.indipendente && nameMatch) { 
                            match = true; relevantDist = nameDist; 
                        }
                    }
                    else if (td.format === 8) {
                        let geoMatch = false;
                        if (td.reqGeo === 'marittima') {
                            if (country.tipoGeo === 'isola' || country.tipoGeo === 'costiera') geoMatch = true;
                        } else {
                            if (country.tipoGeo === td.reqGeo) geoMatch = true;
                        }
                        if (geoMatch && nameMatch) {
                            let ok = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) ok = false;
                            if (td.reqInit) {
                                if(!checkInit(country, matchedNameStr, td.reqInit)) ok = false;
                            }
                            if (ok) { match = true; relevantDist = nameDist; }
                        }
                    }
                    else if (td.format === 9 || td.format === 13) {
                        if (nameMatch && country.sigla === td.targetNode.sigla) { match = true; relevantDist = nameDist; }
                    } 
                    else if (td.format === 10) {
                        if (capitalMatch && country.sigla === td.targetNode.sigla) { match = true; relevantDist = capDist; }
                    }
                    else if (td.format === 11) {
                        if (country.formati_bandiera.includes(td.reqFormato) && nameMatch) {
                            let m = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                            if (td.reqGeo) {
                                if (td.reqGeo === 'marittima') {
                                    if (country.tipoGeo !== 'isola' && country.tipoGeo !== 'costiera') m = false;
                                } else {
                                    if (country.tipoGeo !== td.reqGeo) m = false;
                                }
                            }
                            
                            if (td.reqColor) {
                                let hasColor = country.colori_base.includes(td.reqColor) || country.colori_emblema.includes(td.reqColor);
                                if (!hasColor) m = false;
                            }
                            
                            if (td.reqCapInit) {
                                if(!checkCapInit(country, matchedCapitalStr, td.reqCapInit)) m = false;
                            }
                            
                            if (td.reqInit) {
                                if(!checkInit(country, matchedNameStr, td.reqInit)) m = false;
                            }
                            if (m) { match = true; relevantDist = nameDist; }
                        }
                    }
                    else if (td.format === 12) {
                        let allCountryColors = [...country.colori_base, ...country.colori_emblema];
                        let hasAllColors = td.f12Colors.every(col => allCountryColors.includes(col));
                        if (hasAllColors) {
                            let m = true;
                            if (td.reqArea && !country.aree.includes(td.reqArea)) m = false;
                            if (td.f12RequiresSymbol && !country.simboli.includes(td.f12RequiresSymbol)) m = false;
                            if (td.reqInit) {
                                if(!checkInit(country, matchedNameStr, td.reqInit)) m = false;
                            }
                            if (td.f12AskCapital && !country.capitale) m = false;
                            
                            if (td.f12AskCapital) {
                                if (m && capitalMatch) { match = true; relevantDist = capDist; }
                            } else {
                                if (m && nameMatch) { match = true; relevantDist = nameDist; }
                            }
                        }
                    }
                }

                if (match) {
                    if (relevantDist === 0) return { isCorrect: true, matchedCountry: country, matchedNameStr: matchedNameStr, matchedCapitalStr: matchedCapitalStr };
                    if (relevantDist < globalMinDist) {
                        globalMinDist = relevantDist;
                        bestMatch = country;
                        bestMatchNameStr = matchedNameStr;
                        bestMatchCapitalStr = matchedCapitalStr;
                    }
                }
            }
            
            if (bestMatch) return { isCorrect: true, matchedCountry: bestMatch, matchedNameStr: bestMatchNameStr, matchedCapitalStr: bestMatchCapitalStr };
            return { isCorrect: false, matchedCountry: null };
        }

        function startTimerSandboxOrL4(calculatedTime) {
            timerState = "reading";
            activeTimeTotal = calculatedTime;
            activeTimeLeft = calculatedTime;
            
            timerContainer.style.display = "block";
            timerBar.style.transition = "none";
            timerBar.style.width = "100%";
            
            clearTimeout(readingTimeout);
            clearInterval(mainTimerInterval);
            
            if (currentLevel === 6) {
                // LIVELLO 6: Salta la tregua e innesca il timer all'istante!
                activateMainTimer();
            } else {
                // LIVELLI 4-5: Tregua Lettura di 5 secondi
                timerBar.style.backgroundColor = "#2196f3"; 
                timerStatus.innerText = "TREGUA LETTURA (5s)";
                readingTimeout = setTimeout(() => {
                    if(timerState === "reading") activateMainTimer();
                }, 5000);
            }
        }

        function activateMainTimer() {
            if(timerState === "active") return;
            timerState = "active";
            clearTimeout(readingTimeout);
            window.lastVibeSecond = null;
            
            timerBar.style.backgroundColor = "#4caf50";
            
            // Personalizziamo la scritta per renderla più ansiogena
            if (currentLevel === 6) {
                timerStatus.innerText = `MORTE IMPROVVISA! (10s)`;
            } else {
                timerStatus.innerText = `TEMPO CALCOLATO: ${activeTimeTotal}s`;
            }
            
            let lastUpdate = Date.now();
            mainTimerInterval = setInterval(() => {
                let now = Date.now();
                let dt = (now - lastUpdate) / 1000;
                lastUpdate = now;
                activeTimeLeft -= dt;

                if (activeTimeLeft <= 0) {
                    activeTimeLeft = 0;
                    stopTimer();
                    timerBar.style.width = "0%";
                    
                    // FIX: Capisce se sei in una Combo o in una Morte Improvvisa
                    let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
                    if (isMulti) {
                        eseguiValidazioneMultipla(true); 
                    } else {
                        failStandard(""); // Ti uccide "normalmente" se scade il tempo
                    }
                } else {
                    let pct = (activeTimeLeft / activeTimeTotal) * 100;
                    timerBar.style.width = pct + "%";
                    if (pct < 25) {
                        timerBar.style.backgroundColor = "#f44336";
                        let currentSecondInt = Math.ceil(activeTimeLeft);
                        if (window.lastVibeSecond !== currentSecondInt) {
                            window.lastVibeSecond = currentSecondInt;
                            triggerVibration([40, 60, 40]);
                            playSound("battito");
                        }
                    } else if (pct < 50) {
                        timerBar.style.backgroundColor = "#ff9800"; 
                    } 
                }
            }, 50);
        }

        function stopTimer() {
            timerState = "stopped";
            clearTimeout(readingTimeout);
            clearInterval(mainTimerInterval);
            timerContainer.style.display = "none";
        }

        inputEl.addEventListener("input", function() {
            if ((currentLevel === 4 || (currentLevel === 5 && customConfig.timer)) && timerState === "reading") activateMainTimer();
        });

        function aggiornaComboUI() {
            let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
            if (!isMulti || currentTurnData.numReq === 1) {
                comboTracker.style.display = "none";
                return;
            }
            
            comboTracker.style.display = "flex";
            comboTracker.style.flexDirection = "column";
            comboTracker.style.alignItems = "center";
            comboTracker.style.gap = "10px";

            if (comboInserted.length === 0) {
                comboTracker.innerHTML = `<div>Inserisci la prima risposta...</div>`;
            } else {
                let htmlStr = `<div>Trovate (${comboInserted.length}/${currentTurnData.numReq}):</div>`;
                htmlStr += `<div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:5px;">`;
                
                comboInserted.forEach(ans => {
                    let matchedCountry = findCountryByInput(ans.toLowerCase().trim(), currentLevel, currentTurnData);
                    
                    if (matchedCountry) {
                        htmlStr += `<div style="display:flex; flex-direction:column; align-items:center; background:#1a1a1a; padding:6px; border-radius:6px; border:1px solid #444; width:65px; height:70px; justify-content:flex-end;">
                            <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; width:100%;">
                                <img src="GIF/${matchedCountry.sigla.toLowerCase()}.jpg" onclick="window.openFlagModal(this.src)" style="max-width:45px; max-height:35px; border-radius:3px; box-shadow:0 2px 4px rgba(0,0,0,0.5); cursor:pointer;" onerror="this.style.display='none'">
                            </div>
                            <span style="font-size:10px; color:#ffd700; font-weight:bold; letter-spacing:0.5px; text-align:center; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:4px;">${ans.toUpperCase()}</span>
                        </div>`;
                    } else {
                        htmlStr += `<div style="display:flex; flex-direction:column; align-items:center; background:#1a1a1a; padding:6px; border-radius:6px; border:1px solid #444; width:65px; height:70px; justify-content:flex-end;">
                            <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; width:100%; color:#888; font-size:20px;">❓</div>
                            <span style="font-size:10px; color:#ffd700; font-weight:bold; letter-spacing:0.5px; text-align:center; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:4px;">${ans.toUpperCase()}</span>
                        </div>`;
                    }
                });
                
                htmlStr += `</div>`;
                comboTracker.innerHTML = htmlStr;
            }
        }

        function nextTurnMulti() {
            if (window.pendingVictory) {
                window.pendingVictory = false;
                inputEl.classList.remove("correct-flash", "warning-flash");
                inputEl.value = "";
                popolaGameOver(true);
                return;
            }
            if (window.pendingDefeat) {
                window.pendingDefeat = false;
                inputEl.classList.remove("shake", "wrong-flash");
                errPanel.style.display = "none";
                popolaGameOver(false);
                return;
            }

            inputEl.classList.remove("correct-flash", "wrong-flash", "shake", "warning-flash");
            inputEl.value = "";
            inputEl.disabled = false;
            
            eventBadge.style.display = "none";
            eventBadge.innerHTML = "";
            eventBadge.style.backgroundColor = "#2a2a2a";
            eventBadge.style.color = "#fff";
            
            errPanel.style.display = "none";
            nextBtn.style.display = "none";
            submitBtn.style.display = "block";
            submitBtn.disabled = false;
            playTurn();

	setTimeout(() => {
            inputEl.focus();
            inputEl.click();
        }, 100);
        }

        function surrenderTurn() {
    if (inputEl.disabled && errPanel.style.display === "flex") return; 
    
    triggerVibration([100, 50, 100]);
    let surrTime = ((Date.now() - turnStartTime) / 1000).toFixed(1);
    debugGameLog += `-> ESITO [${surrTime}s] [0pti]: 🏳️ RESA\n\n`;
    
    if (currentLevel === 4 || currentLevel === 6 || (currentLevel === 5 && customConfig.timer)) stopTimer();
    
    vite--;
    currentStreak = 0;
    aggiornaUI();
    
    let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
    let insertedStr = isMulti && comboInserted.length > 0 ? " (Trovate: " + comboInserted.map(s => s.toUpperCase()).join(", ") + ")" : "";
    
    let domPulita = currentTurnData.questionText.replace(/<[^>]*>?/gm, ''); 
    let stringaSoluzioni = currentTurnData.validAnswersCache.join(", ");
    erroriCommessi.push({ 
        q: domPulita, 
        wrong: "🏳️ TI SEI ARRESO" + insertedStr, 
        correct: "Risposte valide: " + stringaSoluzioni 
    });

    inputEl.value = "";
    inputEl.disabled = true;
    submitBtn.style.display = "none";
    surrenderBtn.style.display = "none";
    comboTracker.style.display = "none";

    errTitle.innerText = "🏳️ RESA!";
    errText.innerText = "Le risposte corrette erano: " + stringaSoluzioni;
    errPanel.style.display = "flex";
    
    submitBtn.style.display = "none";
    nextBtn.style.display = "block";
    if (vite <= 0) {
        window.pendingDefeat = true;
        nextBtn.innerText = "VAI AI RISULTATI ➔";
    } else {
        window.pendingDefeat = false;
        nextBtn.innerText = "PROSSIMA DOMANDA ➔";
    }
}

        function playTurn() {
            turnStartTime = Date.now();
            bandieraContainer.style.display = "none";
            
            eventBadge.style.display = "none";
            eventBadge.innerHTML = "";
            eventBadge.style.backgroundColor = "#2a2a2a";
            eventBadge.style.color = "#fff";

            let oldGrid = document.getElementById("combo-flags-grid");
            if (oldGrid) oldGrid.remove();

            inputEl.value = "";
            currentTurnData = generateQuestion();
            questionEl.innerHTML = currentTurnData.questionText;

	if (voiceModeActive) {
                parla(currentTurnData.questionText, function() {
                    // Appena la voce robotica finisce di leggere la domanda, si mette in ascolto
                    if (assistantRec && !isListening) {
                        try { assistantRec.start(); } catch(e) {}
                    }
                });
            }
            
            logQuestionCounter++;
            debugGameLog += "----------------------------------------\n[DOMANDA " + logQuestionCounter + "]\n";
            debugGameLog += "TESTO: " + currentTurnData.questionText.replace(/<[^>]*>?/gm, '') + "\n";
            debugGameLog += "TARGET IA: " + currentTurnData.targetNode.nome + " (" + currentTurnData.targetNode.sigla + ") - Formato Iniziale: " + currentTurnData.format + "\n";
            debugGameLog += "VALIDE (" + currentTurnData.maxPossible + "): " + currentTurnData.validAnswersCache.join(", ") + "\n";
            
            if (currentTurnData.format === 9 || currentTurnData.format === 10) {
                bandieraImg.onerror = function() {
                    this.style.display = 'none'; 
                    questionEl.innerHTML += "<br><span style='font-size:16px; color:#f44336; font-weight:bold;'><br>Errore caricamento immagine.<br>Salto in 2 secondi...</span>";
                    inputEl.disabled = true; submitBtn.disabled = true; surrenderBtn.style.display = "none";
                    actionTimeout = setTimeout(() => {
                        inputEl.disabled = false; submitBtn.disabled = false;
                        playTurn();
                    }, 2000); 
                };
                bandieraImg.src = "GIF/" + currentTurnData.targetNode.sigla.toLowerCase() + ".jpg";
                bandieraImg.style.display = "block";
                bandieraContainer.style.display = "block";
            }
            
            surrenderBtn.style.display = "block";
            
            let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
            let useTimer = (currentLevel === 4 || currentLevel === 6 || (currentLevel === 5 && customConfig.timer));

            if (isMulti) {
                comboInserted = [];
                aggiornaComboUI();
            } else {
                comboTracker.style.display = "none";
            }

            if (currentLevel === 6) {
                timerContainer.style.display = "block";
                startTimerSandboxOrL4(10); // 10 SECONDI FISSI E LETALI
            } else if (useTimer) {
                let mathTime = 15 * (currentTurnData.numReq + currentTurnData.numVariables - 1);
                if (mathTime < 15) mathTime = 15; 
                startTimerSandboxOrL4(mathTime);
            } else {
                timerContainer.style.display = "none";
            }
            
            if(currentLevel === 5) document.getElementById("termina-custom-btn").style.display = "block";

	    let mcContainer = document.getElementById("mc-container");
            
            // Seleziona il Livello 0 GIOCATO A MANO (microfono spento)
            if (currentLevel === 0 && !voiceModeActive) {
                inputEl.style.display = "none";
                submitBtn.style.display = "none"; 
                
                if (mcContainer) {
                    mcContainer.style.display = "flex"; // RIMOSSO IL RITARDO: compaiono subito!
                    mcContainer.innerHTML = "";
                    
                    let opzioni = generaDistrattori(currentTurnData);
                    opzioni.forEach(opz => {
                        let btn = document.createElement("button");
                        btn.className = "mc-option-btn"; 
                        btn.style.cssText = "width:100%; padding:15px; background:#2a2a2a; color:#fff; border:2px solid #555; border-radius:8px; font-size:18px; font-weight:bold; cursor:pointer; transition: 0.2s;";
                        
                        if (currentTurnData.format === 13) {
                            btn.innerHTML = `<img src="GIF/${opz.sigla.toLowerCase()}.jpg" style="height:60px; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.5);">`;
                        } else {
                            btn.innerText = opz.text;
                        }
                        
                        btn.onmouseover = function() { if(!inputEl.disabled) this.style.borderColor = "#ffd700"; };
                        btn.onmouseout = function() { if(!inputEl.disabled) this.style.borderColor = "#555"; };
                        
                        btn.onclick = function() {
                            if (inputEl.disabled) return; 
                            let allBtns = document.getElementsByClassName("mc-option-btn");
                            for(let b of allBtns) {
                                if (b !== this) b.style.display = "none";
                            }
                            
                            if (opz.isCorrect) {
                                this.style.borderColor = "#4caf50";
                                this.style.backgroundColor = "rgba(76, 175, 80, 0.2)";
                            } else {
                                this.style.borderColor = "#f44336";
                                this.style.backgroundColor = "rgba(244, 67, 54, 0.2)";
                                let btnCorretto = document.createElement("button");
                                btnCorretto.style.cssText = "width:100%; padding:15px; background:rgba(76, 175, 80, 0.1); color:#4caf50; border:2px dashed #4caf50; border-radius:8px; font-size:16px; font-weight:bold; margin-top:10px; cursor:default;";
                                let corrOpz = opzioni.find(o => o.isCorrect);
                                if (currentTurnData.format === 13) {
                                    btnCorretto.innerHTML = `Era questa: <br><img src="GIF/${corrOpz.sigla.toLowerCase()}.jpg" style="height:40px; margin-top:5px; border-radius:4px;">`;
                                } else {
                                    btnCorretto.innerText = "La risposta corretta era: " + corrOpz.text;
                                }
                                mcContainer.appendChild(btnCorretto);
                            }
                            
                            inputEl.value = opz.text;
                            processaRisposta();
                        };
                        mcContainer.appendChild(btn);
                    });
                }
            } else {
                // Per TUTTI GLI ALTRI LIVELLI o per il Livello 0 VOCALE
                inputEl.style.display = "block";
                
                // Se siamo nel livello 0 a voce, non serve il tasto INVIA (fa tutto il microfono)
                if (currentLevel === 0) {
                    submitBtn.style.display = "none";
                } else {
                    submitBtn.style.display = "block"; 
                }
                
                if (mcContainer) mcContainer.style.display = "none";
            }
        }

function processaRisposta() {
    let inputStr = inputEl.value.trim().toLowerCase();
    if (!inputStr) return;

    let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
    let useTimer = (currentLevel === 4 || currentLevel === 6 || (currentLevel === 5 && customConfig.timer));

    if (useTimer && timerState === "reading") activateMainTimer();

    if (isMulti) {
        if (comboInserted.map(s => s.toLowerCase()).includes(inputStr)) {
            inputEl.classList.add("shake");
            setTimeout(()=> inputEl.classList.remove("shake"), 400);
            inputEl.value = "";
            return; 
        }
        comboInserted.push(inputEl.value.trim()); 
        totalAnswersSubmitted++; 
        inputEl.value = "";
        aggiornaComboUI();

        if (comboInserted.length === currentTurnData.numReq) eseguiValidazioneMultipla(false);
        return;
    }

    let res = checkSingleAnswer(inputStr, currentTurnData, currentLevel);
    
    if (currentLevel === 6 && res.isCorrect && !isMulti && nazioniUsate.includes(res.matchedCountry.sigla)) {
        let wasActive = (timerState === "active");
        let currentQ = logQuestionCounter; 
        
        if (wasActive) {
            stopTimer(); 
            timerBar.style.backgroundColor = "#ff9800"; 
            setTimeout(() => {
                if (logQuestionCounter === currentQ && !inputEl.disabled) {
                    activateMainTimer();
                }
            }, 3000);
        }

        inputEl.classList.add("warning-flash", "shake");
        setTimeout(() => {
            inputEl.classList.remove("warning-flash", "shake");
            inputEl.focus(); 
        }, 400);
        inputEl.value = "";
        
        let oldPlaceholder = inputEl.placeholder;
        inputEl.placeholder = "L'hai già usata, CAMBIA!";
        setTimeout(() => { 
            if (inputEl.placeholder === "L'hai già usata, CAMBIA!") inputEl.placeholder = oldPlaceholder; 
        }, 1500);
        return; 
    }

    totalAnswersSubmitted++;
    totalActiveTimeMs += (Date.now() - turnStartTime);
    let actionTime = ((Date.now() - turnStartTime) / 1000).toFixed(1);

    if (res.isCorrect) {
        triggerVibration(30);
        playSound("esatto");
        if (useTimer) stopTimer();
        
        let sigla = res.matchedCountry.sigla;
        nazioniDigitateCount[sigla] = (nazioniDigitateCount[sigla] || 0) + 1;

        if (currentTurnData.validSiglas && currentTurnData.validSiglas.length <= 30) {
            currentTurnData.validSiglas.forEach(s => {
                if (s !== sigla) nazioniIgnorateCount[s] = (nazioniIgnorateCount[s] || 0) + 1;
            });
        }

        let lazyMargin = 2; 
        let applyMalus = (currentLevel >= 1 && currentLevel <= 3) || (currentLevel === 5 && !customConfig.timer);
        let isLazy = (applyMalus && nazioniUsate.includes(sigla) && currentTurnData.maxPossible > currentTurnData.numReq + lazyMargin);
        if (!nazioniUsate.includes(sigla)) nazioniUsate.push(sigla);

        esatte++;
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;

        let puntiGuadagnati = (currentLevel === 0) ? 50 : calcolaPuntiDomandaL1_3(currentTurnData.format, currentTurnData.maxPossible, currentTurnData.isComboInception); 
        
        let badgeText = "";
        let badgeBorder = "#555";
        let virtualLevel = currentLevel === 5 ? (customConfig.difficolta === 'facile' ? 1 : (customConfig.difficolta === 'medio' ? 2 : 3)) : currentLevel;

        if (currentLevel !== 0) {
            if (virtualLevel < 3 && res.matchedCountry.livello > virtualLevel) { 
                puntiGuadagnati *= 2; 
                badgeText += "⭐ OTTIMA SCELTA! (Bonus Audacia x2)<br>";
                badgeBorder = "#ffd700";
            }
            if (isLazy) {
                puntiGuadagnati = Math.floor(puntiGuadagnati / 2);
                badgeText += "⚠️ DÉJÀ VU! (Malus pigrizia)<br>";
                badgeBorder = "#ff9800";
            }
        }
        
        punteggio += puntiGuadagnati;
        debugGameLog += `-> ESITO [${actionTime}s] [${puntiGuadagnati}pti]: ✅ CORRETTO (Input: ` + inputStr + " -> Riconosciuto: " + res.matchedCountry.nome + ")\n\n";

        let hasWon = (currentLevel === 6 && esatte >= levelDb.length) || (currentLevel === 1 && punteggio >= 2500) || (currentLevel === 2 && punteggio >= 3500);
        let isEndlessTrig = ((currentLevel === 3 || currentLevel === 4) && punteggio >= 10000 && !endlessVittoriaSbloccata) || (currentLevel === 0 && punteggio >= 1500 && !endlessVittoriaSbloccata);
        if (isEndlessTrig) endlessVittoriaSbloccata = true;

        let currentMaxVite = customConfig.vite > 5 ? customConfig.vite : maxVite;
        if (currentLevel !== 6 && !hasWon && punteggio >= prossimoCuore && vite < currentMaxVite) {
            vite++; prossimoCuore += 750; 
            badgeText += "❤️ +1 VITA EXTRA!<br>";
            badgeBorder = "#f44336";
        }

        aggiornaUI();

        let oldGrid = document.getElementById("combo-flags-grid");
        if (oldGrid) oldGrid.remove();

        if (currentTurnData.format === 9 || currentTurnData.format === 10) {
            bandieraImg.style.display = "block";
            bandieraContainer.style.display = "block";
            if (currentTurnData.isComboInception) {
                let gridContainer = document.createElement("div");
                gridContainer.id = "combo-flags-grid";
                gridContainer.style.display = "flex"; gridContainer.style.justifyContent = "center"; gridContainer.style.marginTop = "15px";
                let img = document.createElement("img");
                img.src = "GIF/" + sigla.toLowerCase() + ".jpg";
                img.style.width = "70px"; img.style.borderRadius = "4px"; img.style.boxShadow = "0 3px 6px rgba(0,0,0,0.6)"; img.style.border = "1px solid #444";
                img.style.cursor = "pointer"; img.onclick = function() { window.openFlagModal(this.src); };
                img.onerror = function() { this.style.display = 'none'; };
                gridContainer.appendChild(img);
                bandieraContainer.appendChild(gridContainer);
            }
        } else if (currentTurnData.format === 13) {
            bandieraImg.style.display = "none"; bandieraContainer.style.display = "none";
        } else {
            bandieraImg.onerror = function() { this.style.display = 'none'; };
            bandieraImg.src = "GIF/" + sigla.toLowerCase() + ".jpg";
            bandieraImg.style.display = "block"; bandieraContainer.style.display = "block";
        }

        let isCapitalReq = currentTurnData.format === 0 || currentTurnData.format === 6 || currentTurnData.format === 10 || (currentTurnData.format === 12 && currentTurnData.f12AskCapital);
        let dName = getPrintedName(res.matchedCountry, res.matchedNameStr);
        let nomeInserito = isCapitalReq ? `\({getPrintedCapital(res.matchedCountry, res.matchedCapitalStr)} (\){dName})` : dName;

        // --- INIZIO FIX: MOSTRA "ALTRE RISPOSTE VALIDE" PER LIVELLI SINGOLI ---
        let arrayNomiPrimariTrovati = [];
        let pNameBase = capitalize(res.matchedCountry.nome);
        if (currentTurnData.reqInit && !res.matchedCountry.nome.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase())) {
            let offAlias = res.matchedCountry.alias_paese_ufficiali.find(a => a.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase()));
            if (offAlias) pNameBase = capitalize(offAlias);
        }
        if (isCapitalReq) {
            let cName = capitalize(res.matchedCountry.capitale); 
            let textMatchBase = false; 
            let cnLower = res.matchedCountry.capitale ? res.matchedCountry.capitale.toLowerCase() : "";
            if (currentTurnData.reqCapInit && cnLower.startsWith(currentTurnData.reqCapInit.toLowerCase())) textMatchBase = true;
            if (currentTurnData.format === 6 && cnLower) {
                let starts = currentTurnData.reqCapInit ? cnLower.startsWith(currentTurnData.reqCapInit.toLowerCase()) : true;
                let ends = currentTurnData.reqCapFin ? cnLower.endsWith(currentTurnData.reqCapFin.toLowerCase()) : true;
                if (starts && ends) textMatchBase = true;
            }
            if (!textMatchBase && res.matchedCountry.alias_capitale_ufficiali) {
                let offCapAlias = res.matchedCountry.alias_capitale_ufficiali.find(c => { let cLow = c.toLowerCase(); let s = currentTurnData.reqCapInit ? cLow.startsWith(currentTurnData.reqCapInit.toLowerCase()) : true; let e = currentTurnData.reqCapFin ? cLow.endsWith(currentTurnData.reqCapFin.toLowerCase()) : true; return s && e; });
                if (offCapAlias) cName = capitalize(offCapAlias);
            }
            arrayNomiPrimariTrovati.push(`\({cName} (\){pNameBase})`);
        } else {
            arrayNomiPrimariTrovati.push(pNameBase);
        }

        if (currentTurnData.maxPossible > 1) {
            let rimanenti = currentTurnData.validAnswersCache.filter(v => !arrayNomiPrimariTrovati.includes(v));
            if (rimanenti.length > 0) {
                comboTracker.style.display = "block";
                comboTracker.innerHTML = `Altre risposte valide: ${rimanenti.join(", ")}`;
            } else {
                comboTracker.style.display = "none";
            }
        } else {
            comboTracker.style.display = "none";
        }
        // --- FINE FIX ---

        if (hasWon) {
            if (currentLevel === 6) {
                badgeText = `<span style="color:#ffd700; font-size:16px;">🏆 INUMANO! DATABASE COMPLETATO!</span><br>` + badgeText;
                badgeBorder = "#ffd700";
            } else {
                badgeText = `<span style="color:#4caf50; font-size:16px;">🏆 VITTORIA! Livello Superato!</span><br>` + badgeText;
                badgeBorder = "#4caf50";
            }
            UI.mostraSuccesso(null, nomeInserito, badgeText, badgeBorder);
            window.pendingVictory = true;
            nextBtn.innerText = "VAI AI RISULTATI ➔";
        } else if (isEndlessTrig) {
            if (currentLevel === 0) {
                badgeText = `<span style="color:#4caf50; font-size:16px;">🎓 LIVELLO COMPLETATO!</span><br>` + badgeText;
                badgeBorder = "#4caf50";
                document.getElementById("ritirati-btn").innerHTML = "🚪 TERMINA LA SFIDA";
                document.getElementById("continua-btn").innerHTML = "🔁 CONTINUA LA SFIDA";
            } else {
                badgeText = `<span style="color:#ffd700; font-size:16px;">👑 VITTORIA! Sei una Leggenda! Scegli se continuare:</span><br>` + badgeText;
                badgeBorder = "#ffd700";
                document.getElementById("ritirati-btn").innerHTML = "🏆 RITIRATI DA LEGGENDA";
                document.getElementById("continua-btn").innerHTML = "⚔️ CONTINUA LA SFIDA";
            }
            UI.mostraSuccesso(puntiGuadagnati, nomeInserito, badgeText, badgeBorder);
            nextBtn.style.display = "none";
            document.getElementById("ritirati-btn").style.display = "block";
            document.getElementById("continua-btn").style.display = "block";
        } else {
            if (currentLevel === 0) {
                badgeText = `<span style="color:#4caf50; font-size:18px;">✅ Corretto! +${puntiGuadagnati}pt</span><br>` + badgeText;
                UI.mostraSuccesso(null, "", badgeText, "#4caf50");
            } else {
                let pti = currentLevel === 6 ? null : puntiGuadagnati;
                UI.mostraSuccesso(pti, nomeInserito, badgeText, badgeBorder);
            }
        }
    } else {
        if (currentLevel === 6) {
            inputEl.classList.add("shake", "wrong-flash");
            setTimeout(() => inputEl.classList.remove("shake", "wrong-flash"), 400);
            inputEl.value = "";
        } else {
            if (useTimer) stopTimer();
            triggerVibration([100, 50, 100]);
            playSound("errore");
            failStandard(inputStr);
        }
    }
}

function eseguiValidazioneMultipla(isTimeout = false) {
    totalActiveTimeMs += (Date.now() - turnStartTime);
    let useTimer = (currentLevel === 4 || currentLevel === 6 || (currentLevel === 5 && customConfig.timer));
    let pct = useTimer ? (activeTimeLeft / activeTimeTotal) * 100 : 100;
    if (useTimer) stopTimer();

    if (comboInserted.length === 0) {
        triggerVibration([100, 50, 100]);
        failMulti(isTimeout ? "Tempo scaduto!" : "Errore nella combo!", "");
        return;
    }

    let allCorrect = true;
    let matchedSiglas = [];
    let matchedCountriesInfos = [];

    for (let ans of comboInserted) {
        let res = checkSingleAnswer(ans, currentTurnData, currentLevel);
        if (res.isCorrect) {
            if (matchedSiglas.includes(res.matchedCountry.sigla)) allCorrect = false; 
            else { matchedSiglas.push(res.matchedCountry.sigla); matchedCountriesInfos.push(res); }
        } else allCorrect = false; 
    }

    matchedCountriesInfos.forEach(info => {
        nazioniDigitateCount[info.matchedCountry.sigla] = (nazioniDigitateCount[info.matchedCountry.sigla] || 0) + 1;
    });

    if (!allCorrect) {
        triggerVibration([100, 50, 100]);
        failMulti(isTimeout ? "Tempo scaduto con errori!" : "Errore nella combo!", comboInserted.map(s => s.toUpperCase()).join(", "));
        return;
    }

    let isGrazia = false;
    if (isTimeout && comboInserted.length < currentTurnData.numReq) {
        if (currentTurnData.numReq >= 3 && comboInserted.length >= 2) isGrazia = true; 
        else {
            triggerVibration([100, 50, 100]);
            failMulti("Tempo scaduto!", comboInserted.map(s => s.toUpperCase()).join(", "));
            return;
        }
    }

    if (allCorrect || isGrazia) {
        triggerVibration(30);
        playSound("esatto");
               
        if (currentTurnData.validSiglas && currentTurnData.validSiglas.length <= 30) {
            currentTurnData.validSiglas.forEach(s => {
                if (!matchedSiglas.includes(s)) nazioniIgnorateCount[s] = (nazioniIgnorateCount[s] || 0) + 1;
            });
        }
        
        let badgeText = ""; let badgeBorder = "#555"; let badgeBg = "#2a2a2a"; let badgeTxtColor = "#fff";

        if (isGrazia) {
            grazieRicevuteCount++;
            let mancanti = currentTurnData.numReq - comboInserted.length;
            badgeText = `🕊️ GRAZIA RICEVUTA! (${mancanti === 1 ? 'Mancava' : 'Mancavano'} ${mancanti} ${mancanti === 1 ? 'risposta' : 'risposte'})<br>`;
            badgeBorder = "#ffd700"; badgeBg = "rgba(255, 255, 255, 0.1)"; badgeTxtColor = "#ffd700";
        } else if (pct > 0 && pct <= 25) {
            fotofinishCount++;
            badgeText += "⏱️ FOTOFINISH! Che salvataggio!<br>";
            badgeBorder = "#2196f3";
        }
        
        esatte ++; currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;

        let basePunti = 0;
        if ([0, 1, 9, 10].includes(currentTurnData.format) && !currentTurnData.isComboInception) {
            basePunti = (currentTurnData.format === 10) ? 20 : 15;
        } else {
            let maxP = currentTurnData.numReq * 100;
            let multiplier = currentTurnData.numReq / currentTurnData.maxPossible;
            basePunti = Math.round((maxP * multiplier) / 10) * 10;
            if (basePunti < 10) basePunti = 10; 
        }

        let puntiRound = 0; let lazyNames = []; let audaceNames = [];
        let isL5Relax = (currentLevel === 5 && !customConfig.timer);
        let virtualLevel = currentLevel === 5 ? (customConfig.difficolta === 'facile' ? 1 : (customConfig.difficolta === 'medio' ? 2 : 3)) : currentLevel;

        if (isGrazia) {
            let mancanti = currentTurnData.numReq - comboInserted.length;
            let pRound = Math.round(basePunti / Math.pow(2, mancanti));
            puntiRound = Math.round(pRound / 5) * 5; 
            if (puntiRound < 5) puntiRound = 5;
            matchedCountriesInfos.forEach(info => { if (!nazioniUsate.includes(info.matchedCountry.sigla)) nazioniUsate.push(info.matchedCountry.sigla); });
        } else {
            let pointsPerCountry = basePunti / comboInserted.length;
            matchedCountriesInfos.forEach(info => {
                let sigla = info.matchedCountry.sigla; let dName = capitalize(info.matchedCountry.nome); let p = pointsPerCountry;
                if (isL5Relax && nazioniUsate.includes(sigla) && currentTurnData.maxPossible > currentTurnData.numReq + 2) { p = p / 2; lazyNames.push(dName); }
                if (virtualLevel < 3 && info.matchedCountry.livello > virtualLevel) { p = p * 2; audaceNames.push(dName); }
                if (!nazioniUsate.includes(sigla)) nazioniUsate.push(sigla); 
                puntiRound += p;
            });
            puntiRound = Math.round(puntiRound / 5) * 5; if (puntiRound < 5) puntiRound = 5;
            
            if (audaceNames.length > 0) { badgeText += `⭐ AUDACIA su ${audaceNames.join(", ")} (x2)<br>`; if (!isGrazia) badgeBorder = "#ffd700"; }
            if (lazyNames.length > 0) { badgeText += `⚠️ DÉJÀ VU su ${lazyNames.join(", ")} (-50%)<br>`; if (!isGrazia && audaceNames.length === 0) badgeBorder = "#ff9800"; }
        }
        
        punteggio += puntiRound;
        let comboTimeNum = (Date.now() - turnStartTime) / 1000;
        debugGameLog += `-> ESITO COMBO [${comboTimeNum.toFixed(1)}s tot | ${(comboTimeNum / comboInserted.length).toFixed(1)}s/risp] [${puntiRound}pti]: ✅ SUPERATA` + (isGrazia ? " CON GRAZIA" : "") + " (Trovate: " + comboInserted.join(", ") + ")\n\n";

        let currentMaxVite = customConfig.vite > 5 ? customConfig.vite : maxVite;
        if (currentLevel !== 6 && punteggio >= prossimoCuore && vite < currentMaxVite) {
            vite++; prossimoCuore += 750; 
            badgeText += "❤️ +1 VITA EXTRA!<br>";
            if (!isGrazia) badgeBorder = "#f44336";
        }

        aggiornaUI();

        let oldGrid = document.getElementById("combo-flags-grid");
        if (oldGrid) oldGrid.remove();
        if (currentTurnData.format === 9 || currentTurnData.format === 10) bandieraImg.style.display = "block"; else bandieraImg.style.display = "none"; 

        if (currentTurnData.format !== 9 && currentTurnData.format !== 10 || currentTurnData.isComboInception) {
            let gridContainer = document.createElement("div"); gridContainer.id = "combo-flags-grid"; gridContainer.style.display = "flex"; gridContainer.style.flexDirection = "column"; gridContainer.style.gap = "10px"; gridContainer.style.alignItems = "center"; gridContainer.style.marginTop = "15px";
            let row1 = document.createElement("div"); row1.style.display = "flex"; row1.style.gap = "10px"; row1.style.justifyContent = "center";
            let row2 = document.createElement("div"); row2.style.display = "flex"; row2.style.gap = "10px"; row2.style.justifyContent = "center";

            matchedCountriesInfos.forEach((info, index) => {
                let img = document.createElement("img"); img.src = "GIF/" + info.matchedCountry.sigla.toLowerCase() + ".jpg"; img.style.width = "70px"; img.style.borderRadius = "4px"; img.style.boxShadow = "0 3px 6px rgba(0,0,0,0.6)"; img.style.border = "1px solid #444"; img.style.cursor = "pointer";
                img.onclick = function() { window.openFlagModal(this.src); }; img.onerror = function() { this.style.display = 'none'; };
                if (matchedCountriesInfos.length === 5) { if (index < 3) row1.appendChild(img); else row2.appendChild(img); } else row1.appendChild(img);
            });
            gridContainer.appendChild(row1);
            if (matchedCountriesInfos.length === 5) gridContainer.appendChild(row2);
            bandieraContainer.appendChild(gridContainer);
        }
        bandieraContainer.style.display = "block";

        let arrayNomiTrovati = []; let arrayNomiPrimariTrovati = []; let nomiTrovati = "";
        let isCapitalRequired = currentTurnData.format === 0 || currentTurnData.format === 6 || currentTurnData.format === 10 || (currentTurnData.format === 12 && currentTurnData.f12AskCapital);
        if (currentTurnData.isComboInception && (currentTurnData.format === 1 || currentTurnData.format === 9)) isCapitalRequired = false; 
        else if (currentTurnData.isComboInception && (currentTurnData.format === 0 || currentTurnData.format === 10)) isCapitalRequired = true;

        if (isCapitalRequired) {
            arrayNomiTrovati = matchedCountriesInfos.map(info => `${getPrintedCapital(info.matchedCountry, info.matchedCapitalStr)} (${getPrintedName(info.matchedCountry, info.matchedNameStr)})`);
            arrayNomiPrimariTrovati = matchedCountriesInfos.map(info => {
                let country = info.matchedCountry; let pNameBase = capitalize(country.nome);
                if (currentTurnData.reqInit && !country.nome.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase())) {
                    let offAlias = country.alias_paese_ufficiali.find(a => a.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase()));
                    if (offAlias) pNameBase = capitalize(offAlias);
                }
                let cName = capitalize(country.capitale); let textMatchBase = false; let cnLower = country.capitale ? country.capitale.toLowerCase() : "";
                if (currentTurnData.reqCapInit && cnLower.startsWith(currentTurnData.reqCapInit.toLowerCase())) textMatchBase = true;
                if (currentTurnData.format === 6 && cnLower) {
                    let starts = currentTurnData.reqCapInit ? cnLower.startsWith(currentTurnData.reqCapInit.toLowerCase()) : true;
                    let ends = currentTurnData.reqCapFin ? cnLower.endsWith(currentTurnData.reqCapFin.toLowerCase()) : true;
                    if (starts && ends) textMatchBase = true;
                }
                if (!textMatchBase && country.alias_capitale_ufficiali) {
                    let offCapAlias = country.alias_capitale_ufficiali.find(c => { let cLow = c.toLowerCase(); let s = currentTurnData.reqCapInit ? cLow.startsWith(currentTurnData.reqCapInit.toLowerCase()) : true; let e = currentTurnData.reqCapFin ? cLow.endsWith(currentTurnData.reqCapFin.toLowerCase()) : true; return s && e; });
                    if (offCapAlias) cName = capitalize(offCapAlias);
                }
                return `${cName} (${pNameBase})`;
            });
        } else {
            arrayNomiTrovati = matchedCountriesInfos.map(info => getPrintedName(info.matchedCountry, info.matchedNameStr));
            arrayNomiPrimariTrovati = matchedCountriesInfos.map(info => {
                let pNameBase = capitalize(info.matchedCountry.nome);
                if (currentTurnData.reqInit && !info.matchedCountry.nome.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase())) {
                    let offAlias = info.matchedCountry.alias_paese_ufficiali.find(a => a.toLowerCase().startsWith(currentTurnData.reqInit.toLowerCase()));
                    if (offAlias) pNameBase = capitalize(offAlias);
                }
                return pNameBase;
            });
        }
        nomiTrovati = arrayNomiTrovati.join(", ");

        let isEndlessTrig = false;
        if ((currentLevel === 3 || currentLevel === 4) && punteggio >= 10000 && !endlessVittoriaSbloccata) {
            isEndlessTrig = true; endlessVittoriaSbloccata = true;
        }

        if (currentTurnData.maxPossible > comboInserted.length) {
            let rimanenti = currentTurnData.validAnswersCache.filter(v => !arrayNomiPrimariTrovati.includes(v));
            if (rimanenti.length > 0) {
                comboTracker.style.display = "block";
                comboTracker.innerHTML = `<span style="color:#aaa;">Altre risposte valide: ${rimanenti.join(", ")}</span>`;
            } else comboTracker.style.display = "none";
        } else comboTracker.style.display = "none";

        if (isEndlessTrig) {
            badgeText = `<span style="color:#ffd700; font-size:16px;">👑 VITTORIA! Sei una Leggenda! Scegli se continuare:</span><br>` + badgeText;
            badgeBorder = "#ffd700";
            
            UI.mostraSuccesso(puntiRound, nomiTrovati, badgeText, badgeBorder, badgeBg, badgeTxtColor);
            
            nextBtn.style.display = "none";
            document.getElementById("ritirati-btn").innerHTML = "🏆 RITIRATI DA LEGGENDA";
            document.getElementById("continua-btn").innerHTML = "⚔️ CONTINUA LA SFIDA";
            document.getElementById("ritirati-btn").style.display = "block";
            document.getElementById("continua-btn").style.display = "block";
        } else {
            let pti = currentLevel === 6 ? null : puntiRound;
            UI.mostraSuccesso(pti, nomiTrovati, badgeText, badgeBorder, badgeBg, badgeTxtColor);
        }
    }
}
        function failStandard(wrongInput) {
            let failTime = ((Date.now() - turnStartTime) / 1000).toFixed(1);
            debugGameLog += `-> ESITO [${failTime}s] [0pti]: ❌ ERRORE (Input: ` + (wrongInput || "Nessuno") + ")\n\n";
            vite--;
            currentStreak = 0;
            aggiornaUI();
            
            let domPulita = currentTurnData.questionText.replace(/<[^>]*>?/gm, ''); 
            let stringaSoluzioni = currentTurnData.validAnswersCache.join(", ");
            erroriCommessi.push({ 
                q: domPulita, 
                wrong: "Hai inserito: " + (wrongInput ? wrongInput.toUpperCase() : "Nessuna risposta"), 
                correct: "Risposte valide: " + stringaSoluzioni 
            });

            inputEl.value = "";
            inputEl.classList.add("shake", "wrong-flash");
            inputEl.disabled = true;
            submitBtn.style.display = "none"; 
            surrenderBtn.style.display = "none";
            comboTracker.style.display = "none";

            errTitle.innerText = "❌ ERRORE!";
            errText.innerText = "Le risposte corrette erano: " + stringaSoluzioni;
            if (currentLevel !== 0) errPanel.style.display = "flex";
            
            submitBtn.style.display = "none";
            nextBtn.style.display = "block";
            if (vite <= 0) {
                window.pendingDefeat = true;
                nextBtn.innerText = "VAI AI RISULTATI ➔";
            } else {
                window.pendingDefeat = false;
                nextBtn.innerText = "PROSSIMA DOMANDA ➔";
            } 
        }

        function failMulti(reason, wrongInput) {
            playSound("errore"); 
            let failTimeNum = (Date.now() - turnStartTime) / 1000;
            let numRisp = comboInserted.length > 0 ? comboInserted.length : 1; 
            let timePerRisp = (failTimeNum / numRisp).toFixed(1);
            debugGameLog += `-> ESITO [${failTimeNum.toFixed(1)}s tot | ${timePerRisp}s/risp] [0pti]: ❌ FALLIMENTO COMBO (` + reason + ") (Input: " + (wrongInput || "Nessuno") + ")\n\n";
            vite--;
            currentStreak = 0;
            aggiornaUI();
            
            let domPulita = currentTurnData.questionText.replace(/<[^>]*>?/gm, ''); 
            let stringaSoluzioni = currentTurnData.validAnswersCache.join(", "); 
            erroriCommessi.push({ 
                q: domPulita, 
                wrong: reason + (wrongInput ? " Hai inserito: " + wrongInput : ""), 
                correct: "Risposte valide: " + stringaSoluzioni 
            });

            inputEl.value = "";
            inputEl.classList.add("shake", "wrong-flash");
            inputEl.disabled = true;
            submitBtn.style.display = "none"; 
            surrenderBtn.style.display = "none";
            comboTracker.style.display = "none";
            
            errTitle.innerText = reason.includes("Tempo scaduto") ? "⏳ TEMPO SCADUTO!" : "❌ ERRORE!";
            errText.innerText = "Le risposte corrette erano: " + stringaSoluzioni;
            errPanel.style.display = "flex";
            
            submitBtn.style.display = "none";
            nextBtn.style.display = "block";
            if (vite <= 0) {
                window.pendingDefeat = true;
                nextBtn.innerText = "VAI AI RISULTATI ➔";
            } else {
                window.pendingDefeat = false;
                nextBtn.innerText = "PROSSIMA DOMANDA ➔";
            }
        }

        function ritiratiLeggenda() {
            inputEl.style.color = "";
            document.getElementById("ritirati-btn").style.display = "none";
            document.getElementById("continua-btn").style.display = "none";
            popolaGameOver(true);
        }

        function continuaSfida() {
            inputEl.style.color = "";
            document.getElementById("ritirati-btn").style.display = "none";
            document.getElementById("continua-btn").style.display = "none";
            
            let isMulti = (currentLevel === 4 || (currentLevel === 5 && (customConfig.maxCombo > 1 || customConfig.timer)));
            if (isMulti) {
                nextTurnMulti();
            } else {
                inputEl.classList.remove("correct-flash", "warning-flash");
                inputEl.value = "";
                inputEl.disabled = false;
                submitBtn.disabled = false;
                playTurn();
            }
        }
        
        function aggiornaUI() {
            // Cambia l'etichetta testuale "Punti:" in "Progresso:" solo per il L6
            if (puntiEl.parentNode.childNodes[0].nodeType === 3) {
                puntiEl.parentNode.childNodes[0].nodeValue = (currentLevel === 6) ? "Progresso: " : "Punti: ";
            }

            if (currentLevel === 6) {
                heartsEl.style.fontSize = "16px";
                heartsEl.innerText = "💀 MORTE IMPROVVISA";
                esatteEl.innerText = esatte + " / " + levelDb.length;
                let pct = levelDb.length > 0 ? ((esatte / levelDb.length) * 100).toFixed(1) : 0;
                puntiEl.innerText = pct + "%";
                return;
            }

            let cuoriStringa = "";
            let currentMaxVite = customConfig.vite > 5 ? customConfig.vite : maxVite;
            
            if (vite > 5) heartsEl.style.fontSize = "16px";
            else heartsEl.style.fontSize = "26px";

            let loopCount = Math.max(vite, currentMaxVite);
            for(let i=0; i<vite; i++) cuoriStringa += "❤️";
            for(let i=vite; i<loopCount; i++) cuoriStringa += "🖤";
            
            heartsEl.innerText = cuoriStringa;
            esatteEl.innerText = esatte;
            puntiEl.innerText = punteggio;
        }

        function popolaGameOver(isVictory = false) {
            if (gameOverScreen.style.display === "flex") return; // BLOCCO DOPPIO LOG E SCHERMATA
            
            playSound(isVictory ? "vittoria" : "sconfitta");
            
            document.getElementById("header").style.display = "none";
            document.getElementById("question").style.display = "none";
            document.getElementById("input-area").style.display = "none";
            bandieraContainer.style.display = "none";
            timerContainer.style.display = "none";
            comboTracker.style.display = "none";
            errPanel.style.display = "none";
            homeBtn.style.display = "none"; 
            
            gameOverScreen.style.display = "flex";
            
            let avgTime = totalAnswersSubmitted > 0 ? (totalActiveTimeMs / totalAnswersSubmitted / 1000).toFixed(1) : "0.0";
            let avgTimeFloat = parseFloat(avgTime);
            document.getElementById("final-avg-time").innerText = avgTime + "s";
            
            globalPlays++;
            statsByLevel[currentLevel].plays++;
            
            let isNewRecord = false;
            if (punteggio > statsByLevel[currentLevel].bestScore && punteggio > 0) {
                statsByLevel[currentLevel].bestScore = punteggio;
                isNewRecord = true;
            }
            if (bestStreak > statsByLevel[currentLevel].bestStreak) statsByLevel[currentLevel].bestStreak = bestStreak;
            
            // FIX RECORD TEMPO: Evita i record falsati. Si aggiorna solo se fai almeno 5 risposte esatte.
            if (avgTimeFloat > 0 && esatte >= 5) {
                if (statsByLevel[currentLevel].bestAvgTime === 0 || avgTimeFloat < statsByLevel[currentLevel].bestAvgTime) {
                    statsByLevel[currentLevel].bestAvgTime = avgTimeFloat;
                }
            }
            
            // --- SALVATAGGIO ULTIME 5 PARTITE ---
            let gameRecord = {
                date: new Date().toLocaleString(),
                punteggio: punteggio,
                esatte: esatte,
                log: debugGameLog
            };
            recentGamesHistory[currentLevel].unshift(gameRecord); // Inserisce in cima
            if (recentGamesHistory[currentLevel].length > 5) {
                recentGamesHistory[currentLevel].pop(); // Mantiene solo le ultime 5
            }
            
            if (currentLevel === 4 || (currentLevel === 5 && customConfig.timer)) { 
                statsByLevel[currentLevel].fotofinish += fotofinishCount;
                statsByLevel[currentLevel].grazie += grazieRicevuteCount;
            }

            // Statistiche Globali Legacy - Esclusi Livello 0, Livello 5 (Sandbox) e Livello 6
            if (currentLevel !== 0 && currentLevel !== 5 && currentLevel !== 6) {
                if (punteggio > allTimeBestScore) allTimeBestScore = punteggio;
                if (bestStreak > allTimeBestStreak) allTimeBestStreak = bestStreak;
                allTimeFotofinish += fotofinishCount;
                allTimeGrazie += grazieRicevuteCount;
                for (let sigla in nazioniDigitateCount) { allTimeNazioniCount[sigla] = (allTimeNazioniCount[sigla] || 0) + nazioniDigitateCount[sigla]; }
                for (let sigla in nazioniIgnorateCount) { allTimeNazioniIgnorate[sigla] = (allTimeNazioniIgnorate[sigla] || 0) + nazioniIgnorateCount[sigla]; }
            }
            
            let badge = document.getElementById("new-record-badge");
            if(isNewRecord) badge.style.display = "block";
            else badge.style.display = "none";

            saveStats(); 

            // Calcolo tempo totale per UI
            let tTimeSecUI = totalActiveTimeMs / 1000;
            let minAttivi = Math.floor(tTimeSecUI / 60);
            let secAttivi = (tTimeSecUI % 60).toFixed(1);
            let strTempoTotale = minAttivi > 0 ? `${minAttivi}m ${secAttivi}s` : `${secAttivi}s`;

            // Creiamo o aggiorniamo la riga del tempo totale
            let rowTempoTot = document.getElementById("stat-tempo-totale");
            if (!rowTempoTot) {
                rowTempoTot = document.createElement("div");
                rowTempoTot.id = "stat-tempo-totale";
                rowTempoTot.style.fontSize = "16px";
                document.getElementById("game-over-stats").appendChild(rowTempoTot);
            }
            rowTempoTot.innerHTML = `⏳ Tempo totale: <strong style="color:#ffd700;">${strTempoTotale}</strong>`;

            let statRow = document.getElementById("game-over-stats").firstElementChild;
            let streakRow = document.getElementById("final-streak").parentNode;

            // Personalizzazione testo risultati per il Livello 6
            if (currentLevel === 6) {
                let pct = levelDb.length > 0 ? ((esatte / levelDb.length) * 100).toFixed(1) : 0;
                statRow.innerHTML = `Hai indovinato <strong class="score-highlight">${esatte}</strong> nazioni su <strong class="score-highlight">${levelDb.length}</strong> (${pct}%).`;
                streakRow.style.display = "none"; // Nasconde Serie Migliore
                rowTempoTot.style.display = "block"; // Mostra Tempo Totale
            } else {
                statRow.innerHTML = `Hai totalizzato <strong class="score-highlight" id="final-score">${punteggio}</strong> punti con <strong id="final-esatte">${esatte}</strong> risposte esatte.`;
                streakRow.style.display = "block"; // Mostra Serie Migliore
                document.getElementById("final-streak").innerText = bestStreak;
                rowTempoTot.style.display = "none"; // Nasconde Tempo Totale
            }

            document.getElementById("final-fotofinish").innerText = fotofinishCount;
            document.getElementById("final-grazie").innerText = grazieRicevuteCount;
// FIX: Mostra Fotofinish e Grazie solo se la modalità lo supporta (timer attivo)
            if (currentLevel === 4 || (currentLevel === 5 && customConfig.timer)) {
                document.getElementById("stat-fotofinish-row").style.display = "block";
                document.getElementById("stat-grazie-row").style.display = "block";
            } else {
                document.getElementById("stat-fotofinish-row").style.display = "none";
                document.getElementById("stat-grazie-row").style.display = "none";
            }

            const titleEl = document.getElementById("game-over-title");
            const msgEl = document.getElementById("game-over-msg");
            
            if (isVictory) {
                if (currentLevel === 6) {
                    titleEl.innerText = "LEGGENDA VIVENTE!";
                    titleEl.style.color = "#ffd700"; 
                    msgEl.innerHTML = "Hai conquistato la Morte Improvvisa!<br>La tua conoscenza geografica è assoluta.";
                } else {
                    titleEl.innerText = "VITTORIA!";
                    titleEl.style.color = "#4caf50"; 
                    msgEl.innerText = "Sei troppo bravo per questo livello, passa al prossimo!";
                }
            } else {
                titleEl.innerText = "GAME OVER";
                titleEl.style.color = "#f44336";
                msgEl.innerText = "";
            }

            errorLogEl.style.display = "block";
            errorLogEl.innerHTML = "";
            if (erroriCommessi.length === 0) {
                errorLogEl.innerHTML = "<p style='text-align:center; color:#4caf50;'>Nessun errore commesso! Sei stato perfetto.</p>";
            } else {
                let errorHtml = `<h3 style="color:#f44336; margin:0 0 15px 0; font-size:18px; text-transform:uppercase; text-align:center;">❌ RIEPILOGO ERRORI</h3>`;
                erroriCommessi.forEach(err => {
                    errorHtml += `<div class="error-item">
                                     <div class="error-q">${err.q}</div>
                                     <div class="error-user-input">${err.wrong}</div>
                                     <div class="error-valid-answers">${err.correct}</div>
                                 </div>`;
                });
                errorLogEl.innerHTML = errorHtml;
            }

            // 1. Pulisce le ignorate
            for (let chiave in nazioniIgnorateCount) {
                if (nazioniDigitateCount[chiave] && nazioniDigitateCount[chiave] > 0) {
                    delete nazioniIgnorateCount[chiave];
                }
            }

            // 2. Calcola Usate (Anti-crash)
            let allUsate = Object.keys(nazioniDigitateCount).map(chiave => {
                let n = globalDb.find(c => c.sigla === chiave || c.nome === chiave);
                // Passiamo anche la sigla così le tue bandierine in buildMiniList continuano a funzionare!
                return { nome: n ? n.nome : chiave, count: nazioniDigitateCount[chiave], sigla: n ? n.sigla : chiave };
            }).sort((a, b) => b.count - a.count);
            
            let sortedUsate = allUsate.slice(0, 5); // UI
            let logUsate = allUsate.slice(0, 20);   // LOG
            
            // 3. Calcola Ignorate (Anti-crash)
            let allIgnorate = Object.keys(nazioniIgnorateCount).map(chiave => {
                let n = globalDb.find(c => c.sigla === chiave || c.nome === chiave);
                return { nome: n ? n.nome : chiave, count: nazioniIgnorateCount[chiave], sigla: n ? n.sigla : chiave };
            }).sort((a, b) => b.count - a.count);
            
            let sortedIgnorate = allIgnorate.slice(0, 5); // UI
            let logIgnorate = allIgnorate.slice(0, 20);   // LOG

            const buildMiniList = (arr, color) => {
                if (arr.length === 0) return `<p style="font-size:13px; color:#888;">Nessun dato</p>`;
                let h = `<div style="display:flex; flex-direction:column;">`;
                arr.forEach((sn, idx) => {
                    h += `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; height:40px;">
                            <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0; padding-right:8px;">
                                <img src="GIF/${sn.sigla.toLowerCase()}.jpg" onclick="window.openFlagModal(this.src)" style="width:16px; border-radius:2px; flex-shrink:0; cursor:pointer;" onerror="this.style.display='none'">
                                <span style="color:#ccc; font-size:12px; line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;">${sn.nome.toUpperCase()}</span>
                            </div>
                            <span style="color:${color}; font-weight:bold; font-size:13px; flex-shrink:0;">${sn.count}</span>
                          </div>`;
                });
                return h + `</div>`;
            };

            // FIX: Recupera il contenitore HTML che era andato perso!
            let top5Container = document.getElementById("top5-nations");

            // FIX: Mostra Top 5 solo se NON siamo nel livello 0 e NON nel livello 6
            if (currentLevel !== 0 && currentLevel !== 6 && (sortedUsate.length > 0 || sortedIgnorate.length > 0)) {
                let html = `<div style="display:flex; gap:15px; margin-top:10px;">
                                <div style="flex:1;">
                                    <h3 style="color:#4caf50; margin:0 0 10px 0; font-size:14px; text-transform:uppercase; text-align:center;">Top 5 Usate</h3>
                                    ${buildMiniList(sortedUsate, "#4caf50")}
                                </div>
                                <div style="flex:1;">
                                    <h3 style="color:#f44336; margin:0 0 10px 0; font-size:14px; text-transform:uppercase; text-align:center;">Top 5 Ignorate</h3>
                                    ${buildMiniList(sortedIgnorate, "#f44336")}
                                </div>
                            </div>`;
                top5Container.innerHTML = html;
                top5Container.style.display = "block";
            } else {
                top5Container.style.display = "none";
            }

            // --- AGGIUNTA DELLE STATISTICHE AL FILE DI LOG ---
            debugGameLog += "========================================\n";
            debugGameLog += "[STATISTICHE FINALI PARTITA]\n";
            debugGameLog += "Esito: " + (isVictory ? "🏆 VITTORIA" : "💀 GAME OVER") + "\n";
            
            // FIX: Testo differenziato per il Log nel Livello 6
            if (currentLevel === 6) {
                let pct = levelDb.length > 0 ? ((esatte / levelDb.length) * 100).toFixed(1) : 0;
                if (isVictory) {
                     debugGameLog += "Esatte: COMPLETAMENTO TOTALE (" + esatte + " su " + levelDb.length + ")\n";
                } else {
                     debugGameLog += "Esatte: " + esatte + " su " + levelDb.length + " (" + pct + "%)\n";
                }
            } else {
                debugGameLog += "Punteggio: " + punteggio + " | Esatte: " + esatte + " su " + logQuestionCounter + " | Serie Max: " + bestStreak + "\n";
            }
            
            debugGameLog += "Tempo Medio di Risposta: " + avgTime + "s | Tempo di Gioco Attivo: " + strTempoTotale + "\n";
            if (currentLevel === 4 || (currentLevel === 5 && customConfig.timer)) {
                debugGameLog += "Salvataggi al Fotofinish: " + fotofinishCount + " | Grazie Ricevute: " + grazieRicevuteCount + "\n";
            }
            // Nasconde Top 5 dal log se si gioca a L0 o L6
            if (currentLevel !== 0 && currentLevel !== 6) {
                debugGameLog += "Top 20 Usate: " + (logUsate.length > 0 ? logUsate.map(u => u.nome + " (" + u.count + ")").join(", ") : "Nessuna") + "\n";
                debugGameLog += "Top 20 Ignorate: " + (logIgnorate.length > 0 ? logIgnorate.map(i => i.nome + " (" + i.count + ")").join(", ") : "Nessuna") + "\n";
            }
            debugGameLog += "========================================\n";
        }

	document.addEventListener("keydown", function(event) {
            if (document.getElementById("input-area").style.display !== "flex") return;

            if (event.key === "Enter") {
                if (document.getElementById("continua-btn").style.display === "block") {
                    continuaSfida();
                    event.preventDefault();
                } else if (nextBtn.style.display === "block") {
                    nextTurnMulti(); 
                    event.preventDefault(); 
                } else if (!inputEl.disabled && errPanel.style.display !== "flex") {
                    processaRisposta(); 
                    event.preventDefault();
                }
                return;
            }

            if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !inputEl.disabled) {
                if (document.activeElement !== inputEl) {
                    inputEl.focus();
                }
            }
        });

	function terminaPartitaVolontaria() {
            let conf = confirm("Vuoi davvero terminare la partita e salvare i tuoi record?");
            if (conf) {
                if (currentLevel === 4 || currentLevel === 6 || (currentLevel === 5 && customConfig.timer)) stopTimer();
                inputEl.disabled = true;
                popolaGameOver(false); 
                document.getElementById("game-over-title").innerText = "PARTITA CONCLUSA";
                document.getElementById("game-over-title").style.color = "#2196f3";
                document.getElementById("game-over-msg").innerHTML = "Ti sei ritirato con onore dalla Sandbox.<br>Ottimo allenamento!";
            }
        }
        
        // --- AVVIO SERVICE WORKER (PWA) ---
        let newWorker;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(reg => {
                
                // 1. IL FIX: Se c'è GIÀ un aggiornamento bloccato in attesa da una sessione precedente, mostra subito il banner!
                if (reg.waiting) {
                    newWorker = reg.waiting;
                    document.getElementById('update-banner').style.display = 'block';
                }

                // 2. Se invece sta scaricando un aggiornamento ora, fai come sempre:
                reg.addEventListener('updatefound', () => {
                    newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Se c'è un aggiornamento scaricato e pronto, mostra il banner
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            document.getElementById('update-banner').style.display = 'block';
                        }
                    });
                });
            });

            // Quando l'utente clicca il banner e il SW si aggiorna, ricarica la pagina
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        }

        // Funzione chiamata dal click sul banner
        window.applyUpdate = function() {
            if (newWorker) {
                newWorker.postMessage('SKIP_WAITING');
            }
            document.getElementById('update-banner').style.display = 'none';
        }

// === ASSISTENTE VOCALE (HANDS-FREE) ===
let voiceModeActive = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
let assistantRec = null;
let synth = window.speechSynthesis;
let wakeLock = null; // Aggiunta la variabile per controllare lo schermo

// Funzione per impedire allo schermo di spegnersi
async function gestisciSchermo(attivo) {
    if (!('wakeLock' in navigator)) return; 
    try {
        if (attivo) {
            wakeLock = await navigator.wakeLock.request('screen');
        } else if (wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
        }
    } catch (err) {
        console.log("Impossibile bloccare lo schermo:", err);
    }
}

function creaBottoneAssistente() {
    let oldBtn = document.getElementById("assistant-btn");
    if(oldBtn) oldBtn.remove();
    
    let btnAss = document.createElement("button");
    btnAss.id = "assistant-btn";
    btnAss.innerText = "🎙️";
    btnAss.title = "Modalità Assistente Vocale";
    btnAss.style.cssText = "position: fixed; left: 15px; top: 15px; background: transparent; border: none; font-size: 28px; cursor: pointer; padding: 5px; opacity: 0.5; z-index: 9999; transition: all 0.3s; filter: grayscale(100%);";
    
    btnAss.onclick = function() {
        if (!SpeechRecognition) {
            alert("Il tuo browser non supporta il riconoscimento vocale avanzato.");
            return;
        }
        voiceModeActive = !voiceModeActive;
        if (voiceModeActive) {
            this.style.filter = "grayscale(0%) drop-shadow(0px 0px 8px #4caf50)";
            this.style.opacity = "1";
            gestisciSchermo(true); // Tieni acceso lo schermo del telefono!
            parla("Modalità vocale attivata. Quale livello vuoi giocare?", function() {
                if (assistantRec && !isListening) {
                    try { assistantRec.start(); } catch(e) {}
                }
            });
        } else {
            this.style.filter = "grayscale(100%)";
            this.style.opacity = "0.5";
            gestisciSchermo(false); // Sblocca il risparmio energetico
            synth.cancel();
            if (isListening && assistantRec) {
                try { assistantRec.stop(); } catch(e) {}
            }
        }
    };
    document.body.appendChild(btnAss);
}
window.speechUtterances = []; // TRUCCO: Evita che il browser mobile cancelli la voce dalla RAM

function parla(testo, callbackTermine) {
    if (!voiceModeActive) return;
    synth.cancel(); 
    
    let testoPulito = testo.replace(/<[^>]*>?/gm, '');
    let utterance = new SpeechSynthesisUtterance(testoPulito);
    utterance.lang = 'it-IT';
    utterance.rate = 1.1; 
    
    window.speechUtterances.push(utterance); // Salva l'audio globalmente per ingannare la Garbage Collection
    
    if (callbackTermine) {
        let callbackEseguita = false;
        
        // Funzione blindata che scatta una volta sola
        let eseguiCallback = function() {
            if (!callbackEseguita) {
                callbackEseguita = true;
                callbackTermine();
            }
        };
        
        // Metodo standard
        utterance.onend = eseguiCallback;
        utterance.onerror = eseguiCallback;
        
        // PARACADUTE DI EMERGENZA: Calcola quanto ci mette a leggere (circa 65ms a lettera) 
        // e forza l'avanzamento se il browser si addormenta.
        let tempoDiLetturaStimato = (testoPulito.length * 65) + 800; 
        setTimeout(eseguiCallback, tempoDiLetturaStimato);
    }
    
    synth.speak(utterance);
}

creaBottoneAssistente();

let isListening = false;

if (SpeechRecognition) {
    assistantRec = new SpeechRecognition();
    assistantRec.lang = 'it-IT';
    assistantRec.continuous = false;
    assistantRec.interimResults = false;

    try {
        if (SpeechGrammarList) {
            let paroleValide = ["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "morte improvvisa"];
            globalDb.forEach(n => {
                paroleValide.push(n.nome.toLowerCase());
                if(n.capitale) paroleValide.push(n.capitale.toLowerCase());
                if(n.alias_paese) paroleValide = paroleValide.concat(n.alias_paese);
                if(n.alias_capitale) paroleValide = paroleValide.concat(n.alias_capitale);
            });
            paroleValide = paroleValide.map(p => p.replace(/['’]/g, ' '));
            
            let grammarList = new SpeechGrammarList();
            // IMPORTANT: Ensure the  tag below is NOT deleted by your editor
            let grammar = '#JSGF V1.0; grammar geo; public  = ' + paroleValide.join(' | ') + ' ;';
            grammarList.addFromString(grammar, 1);
            assistantRec.grammars = grammarList;
        }
    } catch (e) {
        console.log("Grammatica chiusa ignorata dal browser.");
    }

    assistantRec.onstart = function() {
        isListening = true;
        let inputEl = document.getElementById("answer-input");
        if(inputEl) inputEl.placeholder = "🎤 Parla ora...";
        let btn = document.getElementById("assistant-btn");
        if(btn) btn.style.transform = "scale(1.2)";
    };

    assistantRec.onresult = function(event) {
        let parolaDetta = event.results[0][0].transcript.replace(/\.$/, '').trim().toLowerCase();
        
        // SE SIAMO NELLA HOME PAGE: Intercetta il numero del livello
        if (document.getElementById("start-screen").style.display !== "none") {
            if (parolaDetta.includes("zero") || parolaDetta.includes("0")) startGame(0);
            else if (parolaDetta.includes("uno") || parolaDetta.includes("1")) startGame(1);
            else if (parolaDetta.includes("due") || parolaDetta.includes("2")) startGame(2);
            else if (parolaDetta.includes("tre") || parolaDetta.includes("3")) startGame(3);
            else if (parolaDetta.includes("quattro") || parolaDetta.includes("4")) startGame(4);
            else if (parolaDetta.includes("cinque") || parolaDetta.includes("5")) {
                document.getElementById("start-screen").style.display = "none";
                document.getElementById("custom-setup-screen").style.display = "flex";
                parla("Configura la partita e premi inizia.");
            }
            else if (parolaDetta.includes("sei") || parolaDetta.includes("6") || parolaDetta.includes("morte")) {
                document.getElementById("start-screen").style.display = "none";
                document.getElementById("l6-setup-screen").style.display = "flex";
                parla("Configura la morte improvvisa e premi inizia.");
            }
            else {
                parla("Livello non riconosciuto. Ripeti numero.", function() {
                    try { assistantRec.start(); } catch(e) {}
                });
            }
            return; 
        }

        let inputEl = document.getElementById("answer-input");
        if(inputEl) inputEl.value = parolaDetta;
        
        if (document.getElementById("continua-btn").style.display === "block") {
            continuaSfida();
        } else if (document.getElementById("next-btn").style.display === "block") {
            nextTurnMulti(); 
        } else if (inputEl && !inputEl.disabled) {
            processaRisposta(); 
        }
    };

    assistantRec.onend = function() {
        isListening = false;
        let inputEl = document.getElementById("answer-input");
        if(inputEl && inputEl.placeholder === "🎤 Parla ora...") {
            inputEl.placeholder = "Scrivi la risposta...";
        }
        let btn = document.getElementById("assistant-btn");
        if(btn) btn.style.transform = "scale(1)";
    };
    
    assistantRec.onerror = function(event) {
        console.log("Errore microfono: ", event.error);
        isListening = false;
    };
}

// === FASE 3: AUTO-AVANZAMENTO VOCALE ===
if (!window.voiceHooksAdded) {
    window.voiceHooksAdded = true;

    // 1. Intercetta gli errori standard
    const origFailStandard = failStandard;
    failStandard = function(wrongInput) {
        origFailStandard(wrongInput);
        if (voiceModeActive) {
            if (window.pendingDefeat) {
                parla("Hai perso. Partita terminata.");
            } else {
                // Estrae il nome pulito senza parentesi
                let correctAns = currentTurnData.validAnswersCache[0].split(" (")[0];
                parla("Sbagliato, era " + correctAns, function() {
                    nextTurnMulti(); // Salta alla prossima domanda in automatico!
                });
            }
        }
    };

    // 2. Intercetta gli errori nelle combo multiple
    const origFailMulti = failMulti;
    failMulti = function(reason, wrongInput) {
        origFailMulti(reason, wrongInput);
        if (voiceModeActive) {
            if (window.pendingDefeat) {
                parla("Hai perso. Partita terminata.");
            } else {
                parla("Sbagliato.", function() {
                    nextTurnMulti(); // Salta alla prossima domanda in automatico!
                });
            }
        }
    };

    // 3. Intercetta le risposte corrette
    const origProcessaRisposta = processaRisposta;
    processaRisposta = function() {
        let esattePrima = esatte;
        let comboPrima = comboInserted.length;
        
        origProcessaRisposta(); // Esegue il controllo normale
        
        if (voiceModeActive) {
            if (window.pendingVictory) {
                parla("Straordinario, hai vinto!");
                return;
            }
            
            let btnContinua = document.getElementById("continua-btn");
            if (btnContinua && btnContinua.style.display === "block") {
                parla("Traguardo raggiunto. Scegli se ritirarti o continuare.");
                return;
            }
            
            if (window.pendingDefeat) {
                return; // Se hai perso ci pensa il blocco di errore
            }

            // Se il punteggio o le combo sono salite, hai indovinato!
            if (esatte > esattePrima || comboInserted.length > comboPrima) {
                let isMulti = (currentLevel === 4 || (currentLevel === 5 && currentTurnData.numReq > 1));
                if (isMulti && comboInserted.length > 0 && comboInserted.length < currentTurnData.numReq) {
                     parla("Corretto.", function() {
                         if (assistantRec && !isListening) { try { assistantRec.start(); } catch(e){} }
                     });
                } else {
                     parla("Esatto!", function() {
                         nextTurnMulti(); // Salta alla prossima domanda in automatico!
                     });
                }
            } else {
                // Parola non riconosciuta, riapre il microfono
                if (assistantRec && !isListening) { try { assistantRec.start(); } catch(e){} }
            }
        }
    };
}
// ==========================================
// FACTORY.JS (BETA) - Il Nuovo Motore Procedurale
// ==========================================

function creaNuovaDomanda(livello, dbAttivo, configCustom, voceAttiva, arrayMemoria, forzaCategoria = null) {
    
    if (!dbAttivo || dbAttivo.length === 0) return null; 

    let macroCategorie = ['Identita', 'Territorio']; 
    if (livello !== 0) macroCategorie.push('Vessillologia');
    if (!voceAttiva && livello !== 7) macroCategorie.push('Visivo');

    // Se stiamo facendo un "reroll" a causa di un fail, manteniamo la categoria decisa al primo giro!
    let categoriaScelta = forzaCategoria || macroCategorie[Math.floor(Math.random() * macroCategorie.length)];
    
    // 2. Memoria intelligente anti-doppioni
    let dbDisponibile = dbAttivo.filter(n => !arrayMemoria.includes(n.sigla + "-" + categoriaScelta));
    
    if (dbDisponibile.length === 0) {
        for (let i = arrayMemoria.length - 1; i >= 0; i--) {
            if (arrayMemoria[i].endsWith("-" + categoriaScelta)) {
                arrayMemoria.splice(i, 1);
            }
        }
        dbDisponibile = dbAttivo;
    }
    
    // 3. Pesca la Nazione Bersaglio
    let nazioneEstratta = dbDisponibile[Math.floor(Math.random() * dbDisponibile.length)];
    arrayMemoria.push(nazioneEstratta.sigla + "-" + categoriaScelta);
    
    // 4. Delega la costruzione della domanda al Modulo Specifico
    let td = null;
    if (categoriaScelta === 'Identita') {
        td = ModuloIdentita(nazioneEstratta, livello, dbAttivo, configCustom);
    } else if (categoriaScelta === 'Territorio') {
        td = ModuloTerritorio(nazioneEstratta, livello, dbAttivo, configCustom);
    } else if (categoriaScelta === 'Vessillologia') {
        td = ModuloVessillologia(nazioneEstratta, livello, dbAttivo, configCustom);
    } else if (categoriaScelta === 'Visivo') {
        td = ModuloVisivo(nazioneEstratta, livello, dbAttivo, configCustom);
    }

    if (!td) return creaNuovaDomanda(livello, dbAttivo, configCustom, voceAttiva, arrayMemoria, categoriaScelta);

    return td;
}

// ==========================================
// MODULO 1: IDENTITÀ (Capitali e Nomi)
// ==========================================
function ModuloIdentita(nazione, livello, db, config) {
    let varianti = ['chiediCapitale', 'chiediNazione'];
    
    let sbloccaEnigmistica = (livello >= 2 && livello !== 5) || (livello === 5 && config.difficolta !== 'facile');
    if (sbloccaEnigmistica) {
        varianti.push('enigmistica'); 
    }

    if (livello === 5) {
        if (!config.capitali) varianti = varianti.filter(v => v !== 'chiediCapitale' && v !== 'enigmistica');
        if (!config.stati) varianti = varianti.filter(v => v !== 'chiediNazione');
    }

    if (varianti.length === 0) return null;

    let varianteScelta = varianti[Math.floor(Math.random() * varianti.length)];
    
    // FAIL FAST: Requisiti rigidi
    if (varianteScelta === 'chiediCapitale' && !nazione.capitale) return null;
    if (varianteScelta === 'chiediNazione' && !nazione.capitale) return null;
    if (varianteScelta === 'enigmistica') {
        if (!nazione.capitale || !nazione.aree || nazione.aree.length === 0) return null;
    }
    
    let td = { categoria: 'Identita', variante: varianteScelta, targetNode: nazione, numVariables: 1, isComboInception: false };

    if (nazione.aree && nazione.aree.length > 0) {
        if (nazione.aree.length > 1 && Math.random() > 0.35) {
            let subAreas = nazione.aree.slice(1);
            td.selectedArea = subAreas[Math.floor(Math.random() * subAreas.length)];
        } else {
            td.selectedArea = nazione.aree[0];
        }
    }

    if (varianteScelta === 'chiediCapitale') td.format = 0; 
    else if (varianteScelta === 'chiediNazione') td.format = 1; 
    else if (varianteScelta === 'enigmistica') {
        td.format = 6;
        td.varEnigmistica = Math.floor(Math.random() * 3);
        let capPulita = nazione.capitale.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        td.reqCapInit = capPulita.charAt(0).toUpperCase();
        td.reqCapFin = capPulita.charAt(capPulita.length - 1).toUpperCase();
        td.numVariables++;
    }

    if ((td.format === 0 || td.format === 1) && (livello === 4 || livello === 5)) {
        let validBordersCount = 0;
        let targetConfini = nazione.confini || [];
        for (let c of db) {
            let aliasP = Array.isArray(c.alias_paese) ? c.alias_paese : (c.alias_paese ? [c.alias_paese] : []);
            let cNames = [c.nome.toLowerCase(), ...aliasP];
            if (c.indipendente && cNames.some(n => targetConfini.includes(n))) {
                if (td.format === 0) { if (c.capitale) validBordersCount++; } 
                else { validBordersCount++; }
            }
        }
        if (validBordersCount >= 2 && Math.random() < 0.8) td.isComboInception = true;
    }

    return td;
}

// ==========================================
// MODULO 2: TERRITORIO (Confini e Geografia)
// ==========================================
function ModuloTerritorio(nazione, livello, db, config) {
    if (livello === 5 && !config.stati) return null; 

    let varianti = [];
    if (livello === 0) {
        varianti.push('singoloConfine'); 
    } else {
        varianti.push('singoloConfine'); 
        varianti.push('tipoGeografico'); 
        varianti.push('doppioConfine'); 
        varianti.push('numeroConfini'); 
    }

    if (varianti.length === 0) return null;
    let varianteScelta = varianti[Math.floor(Math.random() * varianti.length)];

    let numConfini = nazione.confini ? nazione.confini.length : 0;
    let isIndipendente = nazione.indipendente !== false && (!nazione.dipendente || nazione.dipendente.trim() === ''); 
    
    // FAIL FAST: Requisiti rigidi
    if (varianteScelta === 'singoloConfine') {
        if (!isIndipendente || numConfini < 1) return null;
    }
    else if (varianteScelta === 'doppioConfine') {
        if (!isIndipendente || numConfini < 2) return null;
    }
    else if (varianteScelta === 'numeroConfini') {
        if (!isIndipendente || numConfini < 1 || numConfini > 3) return null;
    }

    let td = { categoria: 'Territorio', variante: varianteScelta, targetNode: nazione, numVariables: 1, isComboInception: false };

    if (nazione.aree && nazione.aree.length > 0) {
        if (nazione.aree.length > 1 && Math.random() > 0.35) {
            let subAreas = nazione.aree.slice(1);
            td.selectedArea = subAreas[Math.floor(Math.random() * subAreas.length)];
        } else {
            td.selectedArea = nazione.aree[0];
        }
    }

    let lvlCheckNeg = (livello === 5 && config.difficolta !== 'facile') ? true : (livello >= 2 && livello !== 5);

    if (varianteScelta === 'singoloConfine') {
        td.format = 7;
    } 
    else if (varianteScelta === 'doppioConfine') {
        td.format = 4;
        let cShuffled = [...nazione.confini].sort(() => 0.5 - Math.random());
        td.reqConf1 = cShuffled[0];
        td.reqConf2 = cShuffled[1];
        td.numVariables = 2; 
    } 
    else if (varianteScelta === 'numeroConfini') {
        td.format = 5;
        if (lvlCheckNeg && td.selectedArea) { 
            td.reqArea = td.selectedArea; 
            td.numVariables++; 
        }
    } 
    else if (varianteScelta === 'tipoGeografico') {
        td.format = 8;
        td.reqGeo = nazione.tipoGeo; 
        if (['isola', 'costiera'].includes(td.reqGeo) && Math.random() > 0.5) td.reqGeo = 'marittima';
        if (lvlCheckNeg && td.selectedArea) { 
            td.reqArea = td.selectedArea; 
            td.numVariables++; 
        }
        if ((livello >= 3 && livello !== 7) || livello === 5) { 
            td.reqInit = nazione.nome.charAt(0).toUpperCase(); 
            td.numVariables++; 
        }
        if (!td.reqArea && !td.reqInit && td.selectedArea) td.reqArea = td.selectedArea;
    }

    return td;
}

// ==========================================
// MODULO 3: VESSILLOLOGIA (Bandiere Testuali)
// ==========================================
function ModuloVessillologia(nazione, livello, db, config) {
    if (livello === 0) return null; // SCUDO: Niente Vessillologia al Lv0
    if (livello === 5 && !config.bandiere) return null;
    
    let varianti = ['coloriEsclusivi', 'simboloOEmblema', 'geometriaBandiera', 'paletteInclusiva'];

    let varianteScelta = varianti[Math.floor(Math.random() * varianti.length)];
    
    let hasBaseColors = nazione.colori_base && nazione.colori_base.length > 0;
    let hasSymbols = nazione.simboli && nazione.simboli.length > 0;
    let hasEmblemColors = nazione.colori_emblema && nazione.colori_emblema.length > 0;
    let hasFlagFormats = nazione.formati_bandiera && nazione.formati_bandiera.length > 0;
    
    let allTargetColors = [];
    if (hasBaseColors) allTargetColors.push(...nazione.colori_base);
    if (hasEmblemColors) allTargetColors.push(...nazione.colori_emblema);
    let uniqueColors = [...new Set(allTargetColors)];

    // FAIL FAST: Requisiti rigidi
    if (varianteScelta === 'coloriEsclusivi' && !hasBaseColors) return null;
    if (varianteScelta === 'simboloOEmblema' && (!hasSymbols && !hasEmblemColors)) return null;
    if (varianteScelta === 'geometriaBandiera' && !hasFlagFormats) return null;
    if (varianteScelta === 'paletteInclusiva' && uniqueColors.length < 2) return null;

    let td = { categoria: 'Vessillologia', variante: varianteScelta, targetNode: nazione, numVariables: 1, isComboInception: false };

    if (nazione.aree && nazione.aree.length > 0) {
        if (nazione.aree.length > 1 && Math.random() > 0.35) {
            let subAreas = nazione.aree.slice(1);
            td.selectedArea = subAreas[Math.floor(Math.random() * subAreas.length)];
        } else {
            td.selectedArea = nazione.aree[0];
        }
    }

    let lvlCheckNeg = (livello === 5 && config.difficolta !== 'facile') ? true : (livello >= 2 && livello !== 5);

    if (varianteScelta === 'coloriEsclusivi') {
        td.format = 2;
        if (lvlCheckNeg && Math.random() > 0.5 && hasSymbols) {
            td.f2RequiresSymbol = nazione.simboli[Math.floor(Math.random() * nazione.simboli.length)];
            td.f2Color = nazione.colori_base[Math.floor(Math.random() * nazione.colori_base.length)];
            td.numVariables++;
        }
    }
    else if (varianteScelta === 'simboloOEmblema') {
        td.format = 3;
        td.elemScelto = hasSymbols ? nazione.simboli[Math.floor(Math.random() * nazione.simboli.length)] : nazione.colori_emblema[Math.floor(Math.random() * nazione.colori_emblema.length)];
        td.isColoreEmblema = !hasSymbols;
        
        let f3Variant = 0; 
        if (lvlCheckNeg) {
            let r = Math.random();
            if (r < 0.17) f3Variant = 1;      
            else if (r < 0.34) f3Variant = 2; 
            else if (r < 0.51) f3Variant = 3; 
            else f3Variant = 4;               
        }
        
        // FAIL FAST INTERNO: Se la sottomodalità richiede qualcosa che non c'è, annulliamo
        if (f3Variant === 1 && (!nazione.aree || nazione.aree.length === 0)) return null;
        if (f3Variant === 2 && !hasBaseColors) return null;
        
        if (f3Variant === 1) { td.reqArea = td.selectedArea; td.numVariables++; }
        if (f3Variant === 2) { 
            let validCols = [...nazione.colori_base];
            if (td.isColoreEmblema) {
                validCols = validCols.filter(c => c !== td.elemScelto);
            }
            if (validCols.length > 0) {
                td.reqColor = validCols[Math.floor(Math.random() * validCols.length)];
                td.numVariables++;
            } else {
                return null; // Fallisci in fretta invece di fallback a f3Variant=0
            }
        }
        if (f3Variant === 3) { td.reqInit = nazione.nome.charAt(0).toUpperCase(); td.numVariables++; }
        if (f3Variant === 4) {
            let cBase = nazione.colori_base.length;
            let lvlCheckExact = (livello === 5 && config.difficolta === 'difficile') ? true : (livello >= 3 && livello !== 5 && livello !== 7);
            if (cBase === 2 && lvlCheckExact) { td.exactBaseColors = 2; td.numVariables++; } 
            else if (cBase >= 4) { td.minBaseColors = 4; td.numVariables++; } 
            else { return null; } // Niente fallback!
        }
    }
    else if (varianteScelta === 'geometriaBandiera') {
        td.format = 11;
        let pool = [];
        if (nazione.aree && nazione.aree.length > 0) pool.push('area');
        if (hasBaseColors) pool.push('colore');
        pool.push('geo');
        if (lvlCheckNeg && nazione.capitale) pool.push('capitale');
        if ((livello >= 3 && livello !== 7) || livello === 5) pool.push('iniziale');
        
        pool.sort(() => 0.5 - Math.random());
        let numConditions = (livello === 1 || (livello === 5 && config.difficolta === 'facile')) ? 1 : (Math.random() > 0.5 ? 1 : 2);
        let selectedConditions = pool.slice(0, numConditions);
        
        if (selectedConditions.includes('capitale') && selectedConditions.includes('iniziale')) {
            let replacement = pool.find(p => !selectedConditions.includes(p));
            let removeIdx = Math.random() < 0.5 ? selectedConditions.indexOf('capitale') : selectedConditions.indexOf('iniziale');
            if (replacement) selectedConditions[removeIdx] = replacement;
            else selectedConditions.splice(removeIdx, 1);
        }
        
        td.reqFormato = nazione.formati_bandiera[Math.floor(Math.random() * nazione.formati_bandiera.length)];

        if (selectedConditions.includes('area')) { td.reqArea = td.selectedArea; td.numVariables++; }
        if (selectedConditions.includes('colore')) { 
            let formatoText = td.reqFormato.toLowerCase();
            let getRadice = (col) => col.endsWith("o") ? col.slice(0, -1) : col;
            
            let altColors = nazione.colori_base.filter(c => !formatoText.includes(getRadice(c)));
            if (altColors.length > 0) {
                td.reqColor = altColors[Math.floor(Math.random() * altColors.length)]; 
                td.numVariables++;
            } else {
                return null; // Fallisci in fretta
            }
        }
        if (selectedConditions.includes('geo')) { 
            td.reqGeo = nazione.tipoGeo; 
            if (['isola', 'costiera'].includes(td.reqGeo) && Math.random() > 0.5) td.reqGeo = 'marittima';
            td.numVariables++; 
        }
        if (selectedConditions.includes('capitale')) { td.reqCapInit = nazione.capitale.charAt(0).toUpperCase(); td.numVariables++; }
        if (selectedConditions.includes('iniziale')) { td.reqInit = nazione.nome.charAt(0).toUpperCase(); td.numVariables++; }
    }
    else if (varianteScelta === 'paletteInclusiva') {
        td.format = 12;
        let cBase = uniqueColors.sort(() => 0.5 - Math.random());
        let numCol = (cBase.length >= 3 && Math.random() > 0.5) ? 3 : 2;
        td.f12Colors = cBase.slice(0, numCol);
        if (numCol === 3) td.numVariables++;
        
        td.f12AskCapital = false;
        let allowCap = ((livello >= 3 && livello !== 7) || livello === 5);
        if (livello === 5 && !config.capitali) allowCap = false;
        if (allowCap && nazione.capitale && Math.random() < 0.5) td.f12AskCapital = true;
        if (livello === 5 && !config.stati) td.f12AskCapital = true;
        
        let pool = [];
        if (nazione.aree && nazione.aree.length > 0) pool.push('area');
        if (hasSymbols) pool.push('symbol');
        pool.push('initial');
        pool.sort(() => 0.5 - Math.random());
        
        if (td.f12AskCapital) {
            td.disableSmartNeg = true; 
            let choice = pool[0];
            if (choice === 'area') { td.reqArea = td.selectedArea; td.numVariables++; }
            else if (choice === 'symbol') { td.f12RequiresSymbol = nazione.simboli[Math.floor(Math.random() * nazione.simboli.length)]; td.numVariables++; }
            else if (choice === 'initial') { td.reqInit = nazione.nome.charAt(0).toUpperCase(); td.numVariables++; }
        } else {
            let varsToPick = Math.random() > 0.6 ? 2 : 1;
            let choices = pool.slice(0, varsToPick);
            if (choices.includes('area')) { td.reqArea = td.selectedArea; td.numVariables++; }
            if (choices.includes('symbol')) { td.f12RequiresSymbol = nazione.simboli[Math.floor(Math.random() * nazione.simboli.length)]; td.numVariables++; }
            if (choices.includes('initial')) { td.reqInit = nazione.nome.charAt(0).toUpperCase(); td.numVariables++; }
        }
    }

    return td;
}

// ==========================================
// MODULO 4: VISIVO (Immagini a schermo)
// ==========================================
function ModuloVisivo(nazione, livello, db, config) {
    if (livello === 5 && !config.bandiere) return null;

    let varianti = [];
    if (livello === 0) {
        varianti.push('sceltaMultiplaVisiva'); 
        varianti.push('immagineVersoNazione'); 
    } else {
        varianti.push('immagineVersoNazione'); 
        varianti.push('immagineVersoCapitale'); 
    }

    if (varianti.length === 0) return null;

    let varianteScelta = varianti[Math.floor(Math.random() * varianti.length)];
    
    // FAIL FAST
    if (varianteScelta === 'immagineVersoCapitale' && !nazione.capitale) return null;

    let td = { categoria: 'Visivo', variante: varianteScelta, targetNode: nazione, numVariables: 1, isComboInception: false };

    if (varianteScelta === 'immagineVersoNazione') td.format = 9;
    else if (varianteScelta === 'immagineVersoCapitale') td.format = 10;
    else if (varianteScelta === 'sceltaMultiplaVisiva') td.format = 13;

    if ((livello === 4 || livello === 5) && (td.format === 9 || td.format === 10)) {
        let validBordersCount = 0;
        let targetConfini = nazione.confini || [];
        for (let c of db) {
            let aliasP = Array.isArray(c.alias_paese) ? c.alias_paese : (c.alias_paese ? [c.alias_paese] : []);
            let cNames = [c.nome.toLowerCase(), ...aliasP];
            if (c.indipendente && cNames.some(n => targetConfini.includes(n))) {
                if (td.format === 10) { if (c.capitale) validBordersCount++; } 
                else { validBordersCount++; }
            }
        }
        if (validBordersCount >= 2 && Math.random() < 0.8) td.isComboInception = true;
    }

    return td;
}

// ==========================================
// INTELLIGENZA DI SCARTO (Vincoli Negativi)
// ==========================================
function applicaVincoliNegativi(td, livello, config, tempValid) {
    let isMitragliatrice = (livello === 4) || (livello === 5 && config.maxCombo > 2);
    let isCecchino = (livello === 3) || (livello === 5 && config.maxCombo <= 2);
    
    let maxNegs = 0;
    let negProb = 0;
    if (livello === 2 || livello === 7) { maxNegs = 1; negProb = 0.40; } 
    else if (isCecchino || isMitragliatrice) { maxNegs = 2; negProb = 0.85; }
    
    td.negBorders = []; 
    let lvlCheckNeg = (livello === 5 && config.difficolta !== 'facile') ? true : (livello >= 2 && livello !== 5);
    let allowSmartNeg = lvlCheckNeg;
    
    if ([0, 1, 9, 10, 11, 12].includes(td.format)) allowSmartNeg = false;
    
    if (tempValid.length > 1 && allowSmartNeg && !td.disableSmartNeg && Math.random() < negProb) {
        let possibleNegColors = new Set();
        let possibleNegInits = new Set();
        let possibleNegBorders = new Set();
        let possibleNegAreas = new Set();
        let possibleNegGeos = new Set();

        let targetColors = [];
        if (td.targetNode.colori_base) targetColors.push(...td.targetNode.colori_base);
        if (td.targetNode.colori_emblema) targetColors.push(...td.targetNode.colori_emblema);
        
        let targetInit = td.targetNode.nome.charAt(0).toUpperCase();
        let targetBorders = td.targetNode.confini || [];
        let targetNameLower = td.targetNode.nome.toLowerCase();

        let otherCountries = getAnswerPool(livello).filter(c => {
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
                if (opt.type === 'border' && td.negBorders.length >= (livello >= 3 ? 2 : 1)) continue;

                let backupVal = null;
                if (opt.type === 'color') { backupVal = td.negColor; td.negColor = opt.val; }
                else if (opt.type === 'init') { backupVal = td.negInit; td.negInit = opt.val; }
                else if (opt.type === 'area') { backupVal = td.negArea; td.negArea = opt.val; }
                else if (opt.type === 'geo') { backupVal = td.negGeo; td.negGeo = opt.val; }
                else if (opt.type === 'border') td.negBorders.push(opt.val);

                td.numVariables++;
                let testValid = getValidAnswersArray(td, livello);
                
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
    return tempValid;
}
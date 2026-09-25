// === GEOQUIZ UTILITIES ===
// Funzioni pure: manipolazione stringhe, logica di Levenshtein e filtri testo

const capitalize = str => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";

const normalizzaTesto = function(str) {
    if (!str) return "";
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[-_.,;:]/g, " ") // Converte trattini e punti in spazi
      .replace(/['’`´]/g, " ") // Converte tutti gli apostrofi in spazi
      .replace(/[^a-z0-9\s]/g, "") // Mantiene gli spazi
      .trim()
      .replace(/\s+/g, " "); // Evita di creare doppi spazi
};

function getLevenshteinTolerance(word, level) {
    if (word.length <= 3) return 0;
    let tolerance = 0;
    if (word.length >= 5 && word.length <= 8) tolerance = 1;
    if (word.length >= 9) tolerance = 2;
    if (level === 1) tolerance += 1; 
    return tolerance;
}

function isDoppelganger(input, target) {
    if (!input || !target) return false;
    let iAlpha = input.toLowerCase().replace(/[^a-z]/g, "");
    let tAlpha = target.toLowerCase().replace(/[^a-z]/g, "");
    
    // Evita scambi fatali tra capitali simili
    if ((iAlpha === "kingston" && tAlpha === "kingstown") || (iAlpha === "kingstown" && tAlpha === "kingston")) return true;
    
    // Riconosce la differenza tra Basseterre e Basse-Terre
    if (iAlpha === "basseterre" && tAlpha === "basseterre") {
        let hasSeparatorInput = input.includes("-") || input.includes(" ");
        let hasSeparatorTarget = target.includes("-") || target.includes(" ");
        if (hasSeparatorInput !== hasSeparatorTarget) return true; 
    }
    return false;
}

function levenshteinDistance(a, b) {
    let aNorm = normalizzaTesto(a);
    let bNorm = normalizzaTesto(b);
    const matrix = Array.from({ length: aNorm.length + 1 }, () => Array(bNorm.length + 1).fill(0));
    for (let i = 0; i <= aNorm.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= bNorm.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= aNorm.length; i++) {
        for (let j = 1; j <= bNorm.length; j++) {
            const cost = aNorm[i - 1] === bNorm[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[aNorm.length][bNorm.length];
}

// --- FORMATTAZIONE NOMI ---
function getPrintedName(country, matchedName) {
    let dName = capitalize(country.nome);
    if (matchedName && matchedName.toLowerCase() !== country.nome.toLowerCase() && country.alias_paese_ufficiali.map(a=>a.toLowerCase()).includes(matchedName.toLowerCase())) {
        dName = capitalize(matchedName);
    }
    return dName;
}

function getPrintedCapital(country, matchedCapitalStr) {
    let cName = capitalize(country.capitale);
    if (matchedCapitalStr && matchedCapitalStr.toLowerCase() !== country.capitale.toLowerCase() && country.alias_capitale_ufficiali.map(a=>a.toLowerCase()).includes(matchedCapitalStr.toLowerCase())) {
        cName = capitalize(matchedCapitalStr);
    }
    return cName;
}
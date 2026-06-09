import { useState, useEffect, useCallback } from "react";

// ============================================================
// CONSTANTS
// ============================================================
const ADMIN_PASSWORD = "0630";
const STORAGE_KEY = "prode_mundial_2026_v2";
const BG_IMAGE = "https://i.imgur.com/Thv5tNG.jpeg";

const DEFAULT_EMPLOYEES = [
  "Bernardo","Agustina","Gastón","Catalina","Nerea",
  "Antonela","Romina","Carolina","Natacha","Damian",
  "Ivana","Mayra","Rodrigo",
];

// ============================================================
// FLAGS — códigos ISO 3166-1 alpha-2 para flagcdn.com
// ============================================================
const FLAG_MAP = {
  // Grupo A
  "México":          "mx",
  "Sudáfrica":       "za",
  "Corea del Sur":   "kr",
  "Rep. Checa":      "cz",
  // Grupo B
  "Canadá":          "ca",
  "Bosnia":          "ba",
  "Qatar":           "qa",
  "Suiza":           "ch",
  // Grupo C
  "Brasil":          "br",
  "Marruecos":       "ma",
  "Haití":           "ht",
  "Escocia":         "gb-sct",
  // Grupo D
  "USA":             "us",
  "Paraguay":        "py",
  "Australia":       "au",
  "Turquía":         "tr",
  // Grupo E
  "Alemania":        "de",
  "Curazao":         "cw",
  "Costa de Marfil": "ci",
  "Ecuador":         "ec",
  // Grupo F
  "Países Bajos":    "nl",
  "Japón":           "jp",
  "Suecia":          "se",
  "Túnez":           "tn",
  // Grupo G
  "Bélgica":         "be",
  "Egipto":          "eg",
  "Irán":            "ir",
  "Nueva Zelanda":   "nz",
  // Grupo H
  "España":          "es",
  "Cabo Verde":      "cv",
  "Arabia Saudita":  "sa",
  "Uruguay":         "uy",
  // Grupo I
  "Francia":         "fr",
  "Senegal":         "sn",
  "Noruega":         "no",
  "Irak":            "iq",
  // Grupo J
  "Argentina":       "ar",
  "Argelia":         "dz",
  "Austria":         "at",
  "Jordania":        "jo",
  // Grupo K
  "Portugal":        "pt",
  "R.D. Congo":      "cd",
  "Uzbekistán":      "uz",
  "Colombia":        "co",
  // Grupo L
  "Inglaterra":      "gb-eng",
  "Croacia":         "hr",
  "Ghana":           "gh",
  "Panamá":          "pa",
};

// Componente bandera: imagen real via flagsapi.com
function Flag({ name, size = 28 }) {
  const code = FLAG_MAP[name];
  if (!code) return <span style={{fontSize: size * 0.7, lineHeight: 1}}>⚽</span>;
  // Mapear códigos especiales (Escocia, Inglaterra) a equivalentes que sí soporta el CDN
  const isoCode = code === "gb-sct" ? "GB" : code === "gb-eng" ? "GB" : code.toUpperCase();
  const h = Math.round(size * 0.67);
  return (
    <img
      src={`https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${code}.svg`}
      width={size}
      height={h}
      alt={name}
      style={{
        borderRadius: 3,
        objectFit: "cover",
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

// ============================================================
// GROUP STAGE DATA — Fixture completo oficial FIFA 2026
// Horarios en hora Argentina (ART = ET + 1hs)
// ============================================================
const GROUPS_DATA = {
  // GRUPO A: México, Sudáfrica, Corea del Sur, Rep. Checa
  A: { matches: [
    { id:"A1", date:"2026-06-11T16:00", home:"México",        away:"Sudáfrica",    hf:"🇲🇽", af:"🇿🇦" },
    { id:"A2", date:"2026-06-11T23:00", home:"Corea del Sur", away:"Rep. Checa",   hf:"🇰🇷", af:"🇨🇿" },
    { id:"A3", date:"2026-06-18T13:00", home:"Rep. Checa",    away:"Sudáfrica",    hf:"🇨🇿", af:"🇿🇦" },
    { id:"A4", date:"2026-06-18T22:00", home:"México",        away:"Corea del Sur",hf:"🇲🇽", af:"🇰🇷" },
    { id:"A5", date:"2026-06-24T22:00", home:"Rep. Checa",    away:"México",       hf:"🇨🇿", af:"🇲🇽" },
    { id:"A6", date:"2026-06-24T22:00", home:"Sudáfrica",     away:"Corea del Sur",hf:"🇿🇦", af:"🇰🇷" },
  ]},
  // GRUPO B: Canadá, Bosnia, Qatar, Suiza
  B: { matches: [
    { id:"B1", date:"2026-06-12T16:00", home:"Canadá",  away:"Bosnia",   hf:"🇨🇦", af:"🇧🇦" },
    { id:"B2", date:"2026-06-13T16:00", home:"Qatar",   away:"Suiza",    hf:"🇶🇦", af:"🇨🇭" },
    { id:"B3", date:"2026-06-18T16:00", home:"Suiza",   away:"Bosnia",   hf:"🇨🇭", af:"🇧🇦" },
    { id:"B4", date:"2026-06-18T19:00", home:"Canadá",  away:"Qatar",    hf:"🇨🇦", af:"🇶🇦" },
    { id:"B5", date:"2026-06-24T16:00", home:"Suiza",   away:"Canadá",   hf:"🇨🇭", af:"🇨🇦" },
    { id:"B6", date:"2026-06-24T16:00", home:"Bosnia",  away:"Qatar",    hf:"🇧🇦", af:"🇶🇦" },
  ]},
  // GRUPO C: Brasil, Marruecos, Haití, Escocia
  C: { matches: [
    { id:"C1", date:"2026-06-13T19:00", home:"Brasil",    away:"Marruecos", hf:"🇧🇷", af:"🇲🇦" },
    { id:"C2", date:"2026-06-13T22:00", home:"Haití",     away:"Escocia",   hf:"🇭🇹", af:"🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { id:"C3", date:"2026-06-19T19:00", home:"Escocia",   away:"Marruecos", hf:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", af:"🇲🇦" },
    { id:"C4", date:"2026-06-19T21:30", home:"Brasil",    away:"Haití",     hf:"🇧🇷", af:"🇭🇹" },
    { id:"C5", date:"2026-06-24T19:00", home:"Escocia",   away:"Brasil",    hf:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", af:"🇧🇷" },
    { id:"C6", date:"2026-06-24T19:00", home:"Marruecos", away:"Haití",     hf:"🇲🇦", af:"🇭🇹" },
  ]},
  // GRUPO D: USA, Paraguay, Australia, Turquía
  D: { matches: [
    { id:"D1", date:"2026-06-12T22:00", home:"USA",        away:"Paraguay",  hf:"🇺🇸", af:"🇵🇾" },
    { id:"D2", date:"2026-06-14T01:00", home:"Australia",  away:"Turquía",   hf:"🇦🇺", af:"🇹🇷" },
    { id:"D3", date:"2026-06-19T16:00", home:"USA",        away:"Australia", hf:"🇺🇸", af:"🇦🇺" },
    { id:"D4", date:"2026-06-20T00:00", home:"Turquía",    away:"Paraguay",  hf:"🇹🇷", af:"🇵🇾" },
    { id:"D5", date:"2026-06-25T22:00", home:"Turquía",    away:"USA",       hf:"🇹🇷", af:"🇺🇸" },
    { id:"D6", date:"2026-06-25T22:00", home:"Paraguay",   away:"Australia", hf:"🇵🇾", af:"🇦🇺" },
  ]},
  // GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
  E: { matches: [
    { id:"E1", date:"2026-06-14T14:00", home:"Alemania",        away:"Curazao",         hf:"🇩🇪", af:"🇨🇼" },
    { id:"E2", date:"2026-06-14T20:00", home:"Costa de Marfil", away:"Ecuador",         hf:"🇨🇮", af:"🇪🇨" },
    { id:"E3", date:"2026-06-20T17:00", home:"Alemania",        away:"Costa de Marfil", hf:"🇩🇪", af:"🇨🇮" },
    { id:"E4", date:"2026-06-20T21:00", home:"Ecuador",         away:"Curazao",         hf:"🇪🇨", af:"🇨🇼" },
    { id:"E5", date:"2026-06-25T17:00", home:"Curazao",         away:"Costa de Marfil", hf:"🇨🇼", af:"🇨🇮" },
    { id:"E6", date:"2026-06-25T17:00", home:"Ecuador",         away:"Alemania",        hf:"🇪🇨", af:"🇩🇪" },
  ]},
  // GRUPO F: Países Bajos, Japón, Suecia, Túnez
  F: { matches: [
    { id:"F1", date:"2026-06-14T17:00", home:"Países Bajos", away:"Japón",        hf:"🇳🇱", af:"🇯🇵" },
    { id:"F2", date:"2026-06-14T23:00", home:"Suecia",       away:"Túnez",        hf:"🇸🇪", af:"🇹🇳" },
    { id:"F3", date:"2026-06-20T14:00", home:"Países Bajos", away:"Suecia",       hf:"🇳🇱", af:"🇸🇪" },
    { id:"F4", date:"2026-06-21T01:00", home:"Túnez",        away:"Japón",        hf:"🇹🇳", af:"🇯🇵" },
    { id:"F5", date:"2026-06-25T20:00", home:"Suecia",       away:"Países Bajos", hf:"🇸🇪", af:"🇳🇱" },
    { id:"F6", date:"2026-06-25T20:00", home:"Japón",        away:"Túnez",        hf:"🇯🇵", af:"🇹🇳" },
  ]},
  // GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
  G: { matches: [
    { id:"G1", date:"2026-06-15T16:00", home:"Bélgica",      away:"Egipto",       hf:"🇧🇪", af:"🇪🇬" },
    { id:"G2", date:"2026-06-15T22:00", home:"Irán",         away:"Nueva Zelanda",hf:"🇮🇷", af:"🇳🇿" },
    { id:"G3", date:"2026-06-21T16:00", home:"Bélgica",      away:"Irán",         hf:"🇧🇪", af:"🇮🇷" },
    { id:"G4", date:"2026-06-21T22:00", home:"Nueva Zelanda",away:"Egipto",       hf:"🇳🇿", af:"🇪🇬" },
    { id:"G5", date:"2026-06-27T00:00", home:"Bélgica",      away:"Nueva Zelanda",hf:"🇧🇪", af:"🇳🇿" },
    { id:"G6", date:"2026-06-27T00:00", home:"Egipto",       away:"Irán",         hf:"🇪🇬", af:"🇮🇷" },
  ]},
  // GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
  H: { matches: [
    { id:"H1", date:"2026-06-15T13:00", home:"España",        away:"Cabo Verde",    hf:"🇪🇸", af:"🇨🇻" },
    { id:"H2", date:"2026-06-15T19:00", home:"Arabia Saudita",away:"Uruguay",       hf:"🇸🇦", af:"🇺🇾" },
    { id:"H3", date:"2026-06-21T13:00", home:"España",        away:"Arabia Saudita",hf:"🇪🇸", af:"🇸🇦" },
    { id:"H4", date:"2026-06-21T19:00", home:"Uruguay",       away:"Cabo Verde",    hf:"🇺🇾", af:"🇨🇻" },
    { id:"H5", date:"2026-06-27T21:00", home:"España",        away:"Uruguay",       hf:"🇪🇸", af:"🇺🇾" },
    { id:"H6", date:"2026-06-27T21:00", home:"Cabo Verde",    away:"Arabia Saudita",hf:"🇨🇻", af:"🇸🇦" },
  ]},
  // GRUPO I: Francia, Senegal, Noruega, Irak — Grupo de la Muerte
  I: { matches: [
    { id:"I1", date:"2026-06-16T16:00", home:"Francia",  away:"Senegal",  hf:"🇫🇷", af:"🇸🇳" },
    { id:"I2", date:"2026-06-16T19:00", home:"Irak",     away:"Noruega",  hf:"🇮🇶", af:"🇳🇴" },
    { id:"I3", date:"2026-06-22T18:00", home:"Francia",  away:"Irak",     hf:"🇫🇷", af:"🇮🇶" },
    { id:"I4", date:"2026-06-22T21:00", home:"Noruega",  away:"Senegal",  hf:"🇳🇴", af:"🇸🇳" },
    { id:"I5", date:"2026-06-26T16:00", home:"Francia",  away:"Noruega",  hf:"🇫🇷", af:"🇳🇴" },
    { id:"I6", date:"2026-06-26T16:00", home:"Senegal",  away:"Irak",     hf:"🇸🇳", af:"🇮🇶" },
  ]},
  // GRUPO J: Argentina, Argelia, Austria, Jordania
  J: { matches: [
    { id:"J1", date:"2026-06-16T22:00", home:"Argentina", away:"Argelia",   hf:"🇦🇷", af:"🇩🇿" },
    { id:"J2", date:"2026-06-17T01:00", home:"Austria",   away:"Jordania",  hf:"🇦🇹", af:"🇯🇴" },
    { id:"J3", date:"2026-06-22T14:00", home:"Argentina", away:"Austria",   hf:"🇦🇷", af:"🇦🇹" },
    { id:"J4", date:"2026-06-23T00:00", home:"Jordania",  away:"Argelia",   hf:"🇯🇴", af:"🇩🇿" },
    { id:"J5", date:"2026-06-27T22:00", home:"Argentina", away:"Jordania",  hf:"🇦🇷", af:"🇯🇴" },
    { id:"J6", date:"2026-06-27T22:00", home:"Argelia",   away:"Austria",   hf:"🇩🇿", af:"🇦🇹" },
  ]},
  // GRUPO K: Portugal, Rep. Dem. Congo, Uzbekistán, Colombia
  K: { matches: [
    { id:"K1", date:"2026-06-17T14:00", home:"Portugal",    away:"R.D. Congo",  hf:"🇵🇹", af:"🇨🇩" },
    { id:"K2", date:"2026-06-17T23:00", home:"Uzbekistán",  away:"Colombia",    hf:"🇺🇿", af:"🇨🇴" },
    { id:"K3", date:"2026-06-23T14:00", home:"Portugal",    away:"Uzbekistán",  hf:"🇵🇹", af:"🇺🇿" },
    { id:"K4", date:"2026-06-23T23:00", home:"Colombia",    away:"R.D. Congo",  hf:"🇨🇴", af:"🇨🇩" },
    { id:"K5", date:"2026-06-27T20:00", home:"Portugal",    away:"Colombia",    hf:"🇵🇹", af:"🇨🇴" },
    { id:"K6", date:"2026-06-27T20:00", home:"R.D. Congo",  away:"Uzbekistán",  hf:"🇨🇩", af:"🇺🇿" },
  ]},
  // GRUPO L: Inglaterra, Croacia, Ghana, Panamá
  L: { matches: [
    { id:"L1", date:"2026-06-17T17:00", home:"Inglaterra", away:"Croacia", hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", af:"🇭🇷" },
    { id:"L2", date:"2026-06-17T20:00", home:"Ghana",      away:"Panamá",  hf:"🇬🇭", af:"🇵🇦" },
    { id:"L3", date:"2026-06-23T17:00", home:"Inglaterra", away:"Ghana",   hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", af:"🇬🇭" },
    { id:"L4", date:"2026-06-23T20:00", home:"Panamá",     away:"Croacia", hf:"🇵🇦", af:"🇭🇷" },
    { id:"L5", date:"2026-06-27T23:00", home:"Inglaterra", away:"Panamá",  hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", af:"🇵🇦" },
    { id:"L6", date:"2026-06-27T23:00", home:"Croacia",    away:"Ghana",   hf:"🇭🇷", af:"🇬🇭" },
  ]},
};

// Knockout bracket — slots reference group positions (1A=1° Grupo A, 2B=2° Grupo B, etc.)
const R32 = [
  { id:"R32_1",  date:"2026-07-04T01:00", slotA:"1A", slotB:"2C", label:"Partido 1" },
  { id:"R32_2",  date:"2026-07-04T17:00", slotA:"1C", slotB:"2A", label:"Partido 2" },
  { id:"R32_3",  date:"2026-07-05T01:00", slotA:"1B", slotB:"2D", label:"Partido 3" },
  { id:"R32_4",  date:"2026-07-05T17:00", slotA:"1D", slotB:"2B", label:"Partido 4" },
  { id:"R32_5",  date:"2026-07-06T01:00", slotA:"1E", slotB:"2G", label:"Partido 5" },
  { id:"R32_6",  date:"2026-07-06T17:00", slotA:"1G", slotB:"2E", label:"Partido 6" },
  { id:"R32_7",  date:"2026-07-07T01:00", slotA:"1F", slotB:"2H", label:"Partido 7" },
  { id:"R32_8",  date:"2026-07-07T17:00", slotA:"1H", slotB:"2F", label:"Partido 8" },
  { id:"R32_9",  date:"2026-07-08T01:00", slotA:"1I", slotB:"2K", label:"Partido 9" },
  { id:"R32_10", date:"2026-07-08T17:00", slotA:"1K", slotB:"2I", label:"Partido 10" },
  { id:"R32_11", date:"2026-07-09T01:00", slotA:"1J", slotB:"2L", label:"Partido 11" },
  { id:"R32_12", date:"2026-07-09T17:00", slotA:"1L", slotB:"2J", label:"Partido 12" },
  { id:"R32_13", date:"2026-07-10T01:00", slotA:"3rd_1", slotB:"3rd_2", label:"3ros (1)" },
  { id:"R32_14", date:"2026-07-10T17:00", slotA:"3rd_3", slotB:"3rd_4", label:"3ros (2)" },
  { id:"R32_15", date:"2026-07-11T01:00", slotA:"3rd_5", slotB:"3rd_6", label:"3ros (3)" },
  { id:"R32_16", date:"2026-07-11T17:00", slotA:"3rd_7", slotB:"3rd_8", label:"3ros (4)" },
];
const QF = [
  { id:"QF1", date:"2026-07-17T21:00", slotA:"W_R32_1",  slotB:"W_R32_2",  label:"QF 1" },
  { id:"QF2", date:"2026-07-18T01:00", slotA:"W_R32_3",  slotB:"W_R32_4",  label:"QF 2" },
  { id:"QF3", date:"2026-07-18T21:00", slotA:"W_R32_5",  slotB:"W_R32_6",  label:"QF 3" },
  { id:"QF4", date:"2026-07-19T01:00", slotA:"W_R32_7",  slotB:"W_R32_8",  label:"QF 4" },
  { id:"QF5", date:"2026-07-19T21:00", slotA:"W_R32_9",  slotB:"W_R32_10", label:"QF 5" },
  { id:"QF6", date:"2026-07-20T01:00", slotA:"W_R32_11", slotB:"W_R32_12", label:"QF 6" },
  { id:"QF7", date:"2026-07-20T21:00", slotA:"W_R32_13", slotB:"W_R32_14", label:"QF 7" },
  { id:"QF8", date:"2026-07-21T01:00", slotA:"W_R32_15", slotB:"W_R32_16", label:"QF 8" },
];
const SF = [
  { id:"SF1", date:"2026-07-26T21:00", slotA:"W_QF1", slotB:"W_QF2", label:"Semi 1" },
  { id:"SF2", date:"2026-07-27T01:00", slotA:"W_QF3", slotB:"W_QF4", label:"Semi 2" },
  { id:"SF3", date:"2026-07-27T21:00", slotA:"W_QF5", slotB:"W_QF6", label:"Semi 3" },
  { id:"SF4", date:"2026-07-28T01:00", slotA:"W_QF7", slotB:"W_QF8", label:"Semi 4" },
];
const FINALS = [
  { id:"F3P1",  date:"2026-08-01T21:00", slotA:"L_SF1", slotB:"L_SF2", label:"3° Puesto (1)" },
  { id:"F3P2",  date:"2026-08-01T21:00", slotA:"L_SF3", slotB:"L_SF4", label:"3° Puesto (2)" },
  { id:"FINAL", date:"2026-08-06T21:00", slotA:"W_SF_top", slotB:"W_SF_bot", label:"🏆 GRAN FINAL" },
];

const JORNADAS = [
  { label:"Jornada 1 (11-14 Jun)", matchIds:["A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2"] },
  { label:"Jornada 2 (15-17 Jun)", matchIds:["G1","G2","H1","H2","I1","I2","J1","J2","K1","K2","L1","L2"] },
  { label:"Jornada 3 (18-21 Jun)", matchIds:["A3","A4","B3","B4","C3","C4","D3","D4","E3","E4","F3","F4","G3","G4","H3","H4","I3","I4","J3","J4","K3","K4","L3","L4"] },
  { label:"Jornada 4 (22-27 Jun)", matchIds:["A5","A6","B5","B6","C5","C6","D5","D6","E5","E6","F5","F6","G5","G6","H5","H6","I5","I6","J5","J6","K5","K6","L5","L6"] },
  { label:"Octavos de Final",       matchIds:R32.map(m=>m.id) },
  { label:"Cuartos de Final",       matchIds:QF.map(m=>m.id) },
  { label:"Semifinales",            matchIds:SF.map(m=>m.id) },
  { label:"Final",                  matchIds:FINALS.map(m=>m.id) },
];

// ============================================================
// HELPERS
// ============================================================
function isLocked(dateStr) {
  return new Date() >= new Date(new Date(dateStr).getTime() - 3600000);
}
function calcPts(pred, res) {
  if (!pred || !res) return null;
  if (pred.home === res.home && pred.away === res.away) return 5;
  const pw = pred.home > pred.away ? "H" : pred.home < pred.away ? "A" : "D";
  const rw = res.home  > res.away  ? "H" : res.home  < res.away  ? "A" : "D";
  return pw === rw ? 3 : 0;
}
function fmtDate(s) {
  const d = new Date(s);
  return d.toLocaleDateString("es-AR",{day:"numeric",month:"short"}) +
    " · " + d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}) + "hs";
}
function allGroupMatches() {
  return Object.entries(GROUPS_DATA).flatMap(([g,d])=>d.matches.map(m=>({...m,group:g})));
}
function allKnockoutMatches(kt) {
  const r = (s) => kt?.[s] || s;
  return [
    ...R32.map(m=>({...m,phase:"R32",home:r(m.slotA),away:r(m.slotB)})),
    ...QF.map(m=>({...m,phase:"QF",home:r(m.slotA),away:r(m.slotB)})),
    ...SF.map(m=>({...m,phase:"SF",home:r(m.slotA),away:r(m.slotB)})),
    ...FINALS.map(m=>({...m,phase:"F",home:r(m.slotA),away:r(m.slotB)})),
  ];
}
function buildLeaderboard(employees, predictions, results, kt) {
  const matches = [...allGroupMatches(), ...allKnockoutMatches(kt)];
  return employees.map(name => {
    let pts=0,exact=0,win=0,pend=0;
    matches.forEach(m => {
      const pr=predictions?.[m.id]?.[name], rs=results?.[m.id];
      if (!pr) return;
      if (!rs) { pend++; return; }
      const p=calcPts(pr,rs);
      if (p===null) return;
      pts+=p; if(p===5)exact++; else if(p===3)win++;
    });
    return { name, pts, exact, win, pend };
  }).sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
}
function buildWAMsg(jornadaLabel, lb) {
  const d=new Date().toLocaleDateString("es-AR");
  let m=`⚽ *PRODE MUNDIAL 2026*\n📅 ${jornadaLabel} — ${d}\n${"━".repeat(20)}\n🏆 *TABLA*\n\n`;
  lb.slice(0,13).forEach((r,i)=>{
    const med=i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`;
    m+=`${med} ${r.name} — *${r.pts} pts*`;
    if(r.exact||r.win) m+=` (⭐${r.exact} ✓${r.win})`;
    m+="\n";
  });
  m+=`${"━".repeat(20)}\n5pts=exacto | 3pts=ganador`;
  return m;
}

// Genera imagen PNG de la tabla de posiciones (podio + lista)
async function generateLeaderboardImage(jornadaLabel, lb) {
  const W = 800, podioH = 380, rowH = 56, headerH = 140;
  const restRows = Math.max(0, lb.length - 3);
  const H = headerH + podioH + (restRows * rowH) + 80;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Fondo degradado azul oscuro → dorado tenue
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0c1526");
  bg.addColorStop(0.5, "#1a3260");
  bg.addColorStop(1, "#0c1526");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 42px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PRODE MUNDIAL 2026", W/2, 55);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillText("🏆 " + jornadaLabel, W/2, 92);

  ctx.fillStyle = "#9aa8c0";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText(new Date().toLocaleDateString("es-AR"), W/2, 118);

  // Línea separadora
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, headerH);
  ctx.lineTo(W-60, headerH);
  ctx.stroke();

  // PODIO (top 3)
  const top3 = lb.slice(0, 3);
  if (top3.length > 0) {
    const podioY = headerH + 40;
    const positions = [
      { x: W/2 - 200, h: 180, color: "#c0c0c0", medal: "🥈", rank: 2 }, // izq - 2do
      { x: W/2,       h: 240, color: "#FFD700", medal: "🥇", rank: 1 }, // centro - 1ro
      { x: W/2 + 200, h: 140, color: "#cd7f32", medal: "🥉", rank: 3 }, // der - 3ro
    ];
    const order = [1, 0, 2]; // 1ro al medio
    order.forEach(idx => {
      const pos = positions[idx];
      const player = top3[pos.rank - 1];
      if (!player) return;
      const baseY = podioY + podioH - 50;
      const blockTop = baseY - pos.h;
      // Bloque del podio
      ctx.fillStyle = pos.color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(pos.x - 75, blockTop, 150, pos.h);
      ctx.globalAlpha = 1;
      // Borde brillante arriba
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(pos.x - 75, blockTop, 150, 4);
      // Medalla
      ctx.font = "44px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.fillText(pos.medal, pos.x, blockTop - 30);
      // Nombre
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.fillText(player.name, pos.x, blockTop + 35);
      // Puntos
      ctx.fillStyle = "#0c1526";
      ctx.font = "bold 36px Arial, sans-serif";
      ctx.fillText(`${player.pts}`, pos.x, blockTop + 80);
      ctx.fillStyle = "#0c1526";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillText("PTS", pos.x, blockTop + 100);
      // Stats
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.font = "13px Arial, sans-serif";
      ctx.fillText(`⭐${player.exact} ✓${player.win}`, pos.x, blockTop + pos.h - 20);
    });
  }

  // Resto de la tabla (4to en adelante)
  const restStart = headerH + podioH + 30;
  lb.slice(3).forEach((player, i) => {
    const y = restStart + (i * rowH);
    const rank = i + 4;
    // Fondo de fila (zebra)
    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(60, y, W - 120, rowH - 6);
    }
    // Posición
    ctx.fillStyle = "#9aa8c0";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${rank}°`, 80, y + 36);
    // Nombre
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText(player.name, 140, y + 36);
    // Stats
    ctx.fillStyle = "#9aa8c0";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText(`⭐ ${player.exact} exactos  ✓ ${player.win} ganadores`, 140, y + 14 + 36);
    // Puntos
    ctx.fillStyle = "#f5c518";
    ctx.font = "bold 32px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${player.pts}`, W - 100, y + 36);
    ctx.fillStyle = "#9aa8c0";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("PTS", W - 80, y + 36);
  });

  // Footer
  ctx.fillStyle = "#9aa8c0";
  ctx.font = "13px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("5 PTS = resultado exacto  •  3 PTS = ganador correcto", W/2, H - 30);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/png");
  });
}

// Comparte la imagen via Web Share API (nativo en mobile)
async function shareLeaderboard(jornadaLabel, lb) {
  try {
    const blob = await generateLeaderboardImage(jornadaLabel, lb);
    const file = new File([blob], `prode-${jornadaLabel.replace(/\s/g,"-")}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Tabla Prode Mundial 2026",
        text: `🏆 Resultados ${jornadaLabel}`,
      });
      return { shared: true };
    } else {
      // Fallback: descarga la imagen
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prode-${jornadaLabel.replace(/\s/g,"-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      return { downloaded: true };
    }
  } catch (err) {
    console.error("Share error:", err);
    return { error: err.message };
  }
}
function isJornadaComplete(jornada, results) {
  if (!jornada?.matchIds?.length) return false;
  return jornada.matchIds.every(id => results?.[id] !== undefined);
}

// ============================================================
// API CLIENT  —  apunta al Cloudflare Worker
// ============================================================
// Cambiá esta URL por la de tu Worker después de deployarlo
const API_URL = "https://prode-mundial-2026.rgutierrez-689.workers.dev";

const defaultState = () => ({
  employees: DEFAULT_EMPLOYEES,
  predictions: {},
  results: {},
  knockoutTeams: {},
  waBotConfig: { apikey:"", phone:"" },
  sentJornadas: [],
});

function adminHeaders() {
  const isAdmin = sessionStorage.getItem("prode_is_admin") === "1";
  const h = { "Content-Type": "application/json" };
  if (isAdmin) h["X-Admin-Key"] = ADMIN_PASSWORD;
  return h;
}

async function loadState() {
  try {
    const res = await fetch(`${API_URL}/state`, { headers: adminHeaders() });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return { ...defaultState(), ...data };
  } catch {
    // fallback a localStorage si no hay red
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch {}
    return defaultState();
  }
}

// saveState ya no se usa globalmente — cada acción llama su endpoint específico
async function saveState() {}

// Helpers de API
async function apiPost(path, body, isAdmin = false) {
  const h = { "Content-Type": "application/json" };
  if (isAdmin) h["X-Admin-Key"] = ADMIN_PASSWORD;
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: h,
    body: JSON.stringify(body),
  });
  return res.json();
}

// Refresca estado desde el servidor cada N segundos
const POLL_INTERVAL = 15000; // 15 segundos

// ============================================================
// CSS
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080d18;--surf:#111827;--surf2:#161f30;--surf3:#1a2640;
  --bord:#1e2d45;--bord2:#253550;
  --gold:#f5c518;--red:#e8453c;--green:#22c55e;--blue:#3b82f6;--purple:#a78bfa;
  --text:#e2e8f0;--muted:#64748b;--muted2:#94a3b8;--r:10px;
}
body{font-family:'Barlow',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.bg-cover{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none}
.bg-overlay{position:fixed;inset:0;background:rgba(8,13,24,0.72);z-index:1;pointer-events:none}
.app-wrap{position:relative;z-index:2;min-height:100vh}
/* HEADER */
.hdr{background:linear-gradient(135deg,rgba(12,21,38,0.92),rgba(26,50,96,0.92),rgba(12,21,38,0.92));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:2px solid var(--gold);
  padding:0 18px;position:sticky;top:0;z-index:200;display:flex;align-items:center;
  justify-content:space-between;height:58px;gap:10px}
.hdr-logo{font-family:'Bebas Neue';font-size:24px;letter-spacing:3px;color:var(--gold);
  display:flex;align-items:center;gap:6px;white-space:nowrap}
.hdr-logo em{color:#fff;font-style:normal}
.hdr-r{display:flex;align-items:center;gap:8px}
.badge{background:var(--surf2);border:1px solid var(--bord);border-radius:20px;
  padding:4px 12px;font-size:12px;font-weight:600;color:var(--gold);white-space:nowrap}
.btn-sm{background:transparent;border:1px solid var(--muted);color:var(--muted);
  border-radius:6px;padding:4px 10px;font-family:'Barlow';font-size:12px;cursor:pointer;
  transition:all .2s}
.btn-sm:hover{border-color:var(--red);color:var(--red)}
/* NAV */
.nav{display:flex;border-bottom:1px solid var(--bord);padding:0 18px;background:var(--surf);
  overflow-x:auto;scrollbar-width:none}
.nav::-webkit-scrollbar{display:none}
.nb{background:transparent;border:none;border-bottom:2px solid transparent;
  color:var(--muted);padding:12px 16px;font-family:'Barlow';font-size:11px;font-weight:700;
  letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap}
.nb:hover{color:var(--text)}
.nb.on{color:var(--gold);border-bottom-color:var(--gold)}
/* MAIN */
.main{padding:18px;max-width:1100px;margin:0 auto}
.stitle{font-family:'Bebas Neue';font-size:28px;letter-spacing:2px;color:var(--gold);
  display:flex;align-items:center;gap:10px;margin-bottom:16px}
.stitle::after{content:'';flex:1;height:1px;background:var(--bord)}
/* LOGIN */
.lw{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:transparent;padding:18px}
.lc{background:rgba(17,24,39,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border:1px solid var(--bord);border-radius:16px;
  padding:36px 32px;width:100%;max-width:430px;box-shadow:0 32px 80px rgba(0,0,0,.7)}
.lt{font-family:'Bebas Neue';font-size:52px;line-height:.9;letter-spacing:4px;
  text-align:center;margin-bottom:4px}
.lt .g{color:var(--gold)}
.ls{text-align:center;color:var(--muted);font-size:11px;letter-spacing:3px;
  text-transform:uppercase;margin-bottom:24px}
.sl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
  color:var(--muted);margin-bottom:8px}
.pg{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:18px;
  max-height:260px;overflow-y:auto;scrollbar-width:thin}
.pb{background:var(--surf2);border:1px solid var(--bord);color:var(--text);
  border-radius:7px;padding:8px 11px;font-family:'Barlow';font-size:14px;
  font-weight:500;cursor:pointer;transition:all .15s;text-align:left}
.pb:hover{border-color:var(--gold);color:var(--gold)}
.div{display:flex;align-items:center;gap:8px;margin:14px 0}
.div::before,.div::after{content:'';flex:1;height:1px;background:var(--bord)}
.div span{font-size:10px;color:var(--muted);letter-spacing:1px}
.row{display:flex;gap:7px}
.inp{flex:1;background:var(--surf2);border:1px solid var(--bord);color:var(--text);
  border-radius:7px;padding:8px 11px;font-family:'Barlow';font-size:14px;outline:none;
  transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--muted)}
.bgo{background:var(--gold);color:#000;border:none;border-radius:7px;padding:8px 16px;
  font-family:'Barlow';font-weight:700;font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap}
.bgo:hover{background:#e8b800;transform:translateY(-1px)}
.bgo:disabled{opacity:.4;cursor:not-allowed}
/* TABS */
.tabs{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}
.tab{background:var(--surf);border:1px solid var(--bord);color:var(--muted);
  border-radius:6px;padding:4px 12px;font-family:'Bebas Neue';font-size:15px;
  letter-spacing:1px;cursor:pointer;transition:all .15s}
.tab:hover{border-color:var(--gold);color:var(--gold)}
.tab.on{background:var(--gold);color:#000;border-color:var(--gold)}
/* MATCH CARD */
.mc{background:var(--surf);border:1px solid var(--bord);border-left:3px solid transparent;
  border-radius:var(--r);margin-bottom:8px;overflow:hidden;transition:border-color .2s}
.mc.done{border-left-color:var(--green)}
.mc.lkd{border-left-color:var(--red)}
.mc.opn{border-left-color:var(--blue)}
.mh{display:flex;align-items:center;justify-content:space-between;padding:7px 13px;
  border-bottom:1px solid var(--bord);font-size:11px;color:var(--muted);gap:6px;flex-wrap:wrap}
.mdate{font-weight:600}
.tag{border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700;letter-spacing:.5px}
.tl{background:rgba(232,69,60,.12);color:var(--red);border:1px solid rgba(232,69,60,.3)}
.to{background:rgba(59,130,246,.12);color:var(--blue);border:1px solid rgba(59,130,246,.3)}
.td{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.3)}
.mb{display:flex;align-items:center;gap:8px;padding:11px 13px}
.tm{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.tm.aw{flex-direction:row-reverse}
.tf{display:flex;align-items:center;flex-shrink:0}
.tn{font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm.aw .tn{text-align:right}
.vs{display:flex;align-items:center;gap:5px;flex-shrink:0}
.si{width:44px;background:var(--surf2);border:1px solid var(--bord);color:var(--text);
  border-radius:6px;padding:6px 3px;text-align:center;font-family:'Bebas Neue';font-size:20px;
  outline:none;transition:border-color .2s;-moz-appearance:textfield}
.si::-webkit-outer-spin-button,.si::-webkit-inner-spin-button{-webkit-appearance:none}
.si:focus{border-color:var(--gold)}
.si:disabled{opacity:.4;cursor:not-allowed}
.sd{font-family:'Bebas Neue';font-size:16px;color:var(--muted)}
.sb{background:var(--surf2);border:1px solid var(--bord);border-radius:6px;
  padding:6px 7px;font-family:'Bebas Neue';font-size:20px;min-width:44px;text-align:center}
.pts{font-family:'Bebas Neue';font-size:15px;padding:3px 7px;border-radius:5px;margin-left:5px}
.p5{background:rgba(245,197,24,.15);color:var(--gold);border:1px solid rgba(245,197,24,.3)}
.p3{background:rgba(59,130,246,.15);color:var(--blue);border:1px solid rgba(59,130,246,.3)}
.p0{background:rgba(100,116,139,.1);color:var(--muted);border:1px solid var(--bord)}
.mf{display:flex;align-items:center;justify-content:space-between;
  padding:6px 13px 8px;gap:8px;flex-wrap:wrap}
.mn{font-size:11px;color:var(--muted)}
.mn strong{color:var(--gold)}
.sbtn{background:var(--surf2);border:1px solid var(--bord);color:var(--text);
  border-radius:6px;padding:5px 12px;font-family:'Barlow';font-size:12px;
  font-weight:600;cursor:pointer;transition:all .15s}
.sbtn:hover{border-color:var(--gold);color:var(--gold)}
.sbtn.ok{color:var(--green);border-color:var(--green)}
/* LEADERBOARD */
.lb{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);overflow:hidden}
.lbh,.lbr{display:grid;grid-template-columns:42px 1fr 62px 62px 62px 56px;align-items:center}
.lbh{padding:9px 14px;background:var(--surf2);border-bottom:1px solid var(--bord);
  font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
.lbr{padding:11px 14px;border-bottom:1px solid var(--bord);transition:background .15s}
.lbr:last-child{border-bottom:none}
.lbr:hover{background:var(--surf2)}
.lbr.r1{background:rgba(245,197,24,.06)}
.lbr.r2{background:rgba(148,163,184,.04)}
.lbr.r3{background:rgba(180,100,60,.04)}
.lbpos{font-family:'Bebas Neue';font-size:20px;color:var(--muted)}
.lbr.r1 .lbpos{color:var(--gold)}.lbr.r2 .lbpos{color:#94a3b8}.lbr.r3 .lbpos{color:#b4642c}
.lbname{font-weight:600;font-size:14px;display:flex;align-items:center;gap:5px;overflow:hidden}
.lbr.r1 .lbname{color:var(--gold)}
.you{font-size:9px;color:var(--blue);font-weight:800;letter-spacing:1px;white-space:nowrap}
.lbpts{font-family:'Bebas Neue';font-size:26px;text-align:center}
.lbn{text-align:center;font-size:13px;font-weight:600}
.ne{color:var(--gold)}.nw{color:var(--blue)}.np{color:var(--muted);font-size:11px}
/* STATS */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:20px}
.stat{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);
  padding:12px;text-align:center}
.sn{font-family:'Bebas Neue';font-size:36px;color:var(--gold);line-height:1}
.sl2{font-size:10px;color:var(--muted);margin-top:3px;letter-spacing:1px;text-transform:uppercase}
/* ADMIN */
.ac{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);
  padding:13px 14px;margin-bottom:7px}
.at{display:flex;align-items:center;gap:7px;margin-bottom:9px;font-size:13px;font-weight:600;flex-wrap:wrap}
.ar{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.al{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;white-space:nowrap}
.rok{font-size:11px;color:var(--green);margin-left:4px}
/* BRACKET */
.bp{margin-bottom:24px}
.bpl{font-family:'Bebas Neue';font-size:20px;letter-spacing:2px;color:var(--purple);
  margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--bord)}
/* WA */
.wa{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);padding:18px;margin-bottom:14px}
.wat{font-weight:700;font-size:15px;margin-bottom:6px;display:flex;align-items:center;gap:7px}
.was{font-size:13px;color:var(--muted);margin-bottom:12px;line-height:1.5}
.waf{display:grid;gap:7px;margin-bottom:10px}
.wal{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px}
.warow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
.wasel{background:var(--surf2);border:1px solid var(--bord);color:var(--text);
  border-radius:6px;padding:7px 10px;font-family:'Barlow';font-size:13px;outline:none;flex:1;min-width:140px}
.bwa{background:#25D366;color:#fff;border:none;border-radius:7px;padding:8px 16px;
  font-family:'Barlow';font-weight:700;font-size:13px;cursor:pointer;transition:all .15s}
.bwa:hover{background:#1ebe5a;transform:translateY(-1px)}
.bwa:disabled{opacity:.4;cursor:not-allowed}
/* PLAYERS */
.eg{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:7px;margin-bottom:14px}
.ec{background:var(--surf2);border:1px solid var(--bord);border-radius:7px;
  padding:8px 11px;display:flex;align-items:center;justify-content:space-between;gap:5px;font-size:14px;font-weight:500}
.del{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:15px;
  padding:0 2px;line-height:1;transition:color .15s}
.del:hover{color:var(--red)}
/* LEGEND */
.leg{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.li{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--muted2)}
/* TOAST */
.toast{position:fixed;bottom:18px;right:18px;background:var(--green);color:#000;
  font-weight:700;font-size:14px;padding:10px 16px;border-radius:8px;z-index:999;
  animation:su .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.toast.err{background:var(--red);color:#fff}
@keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:580px){
  .lbh,.lbr{grid-template-columns:34px 1fr 54px 54px 54px}
  .lbh .np,.lbr .np{display:none}
  .lbpts{font-size:20px}.tn{font-size:12px}.mb{padding:9px 10px}.main{padding:12px}
}
`;

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setAdmin]   = useState(false);
  const [tab,     setTab]     = useState("fixture");
  const [phase,   setPhase]   = useState("groups");
  const [selGrp,  setSelGrp]  = useState("J");
  const [state,   setState_]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [saved,   setSaved]   = useState({});

  const refresh = useCallback(async () => {
    const s = await loadState();
    setState_(s);
  }, []);

  // Carga inicial
  useEffect(() => {
    loadState().then(s => { setState_(s); setLoading(false); });
  }, []);

  // Polling automático cada 15s para ver cambios de otros usuarios
  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [user, refresh]);

  // Guardar si es admin en sessionStorage para los headers
  useEffect(() => {
    if (isAdmin) sessionStorage.setItem("prode_is_admin", "1");
    else sessionStorage.removeItem("prode_is_admin");
  }, [isAdmin]);

  const showToast = (msg, err=false) => {
    setToast({msg,err}); setTimeout(()=>setToast(null),3500);
  };

  // persist local (optimistic update) + refresca desde server
  const persist = useCallback(async ns => {
    setState_(ns);
  }, []);

  const savePred = async (matchId, h, a) => {
    if (!user || isAdmin) return;
    const hv=parseInt(h), av=parseInt(a);
    if (isNaN(hv)||isNaN(av)||hv<0||av<0) { showToast("Marcador inválido",true); return; }
    // Optimistic update
    const ns={...state,predictions:{...state.predictions,
      [matchId]:{...(state.predictions[matchId]||{}),[user]:{home:hv,away:av}}}};
    setState_(ns);
    setSaved(m=>({...m,[matchId]:true}));
    setTimeout(()=>setSaved(m=>{const c={...m};delete c[matchId];return c;}),2000);
    try {
      await apiPost("/prediction", { user, matchId, home: hv, away: av });
      showToast("¡Pronóstico guardado!");
    } catch {
      showToast("Error al guardar. Verificá tu conexión.",true);
      refresh(); // revertir
    }
  };

  const setResult = async (matchId, h, a) => {
    if (!isAdmin) return;
    const hv=parseInt(h), av=parseInt(a);
    if (isNaN(hv)||isNaN(av)) { showToast("Marcador inválido",true); return; }
    const newResults = {...state.results,[matchId]:{home:hv,away:av}};
    const ns = {...state, results: newResults};
    setState_(ns);
    try {
      await apiPost("/result", { matchId, home: hv, away: av }, true);
      showToast("✅ Resultado guardado");
    } catch {
      showToast("Error al guardar resultado",true);
      refresh();
      return;
    }

    // Check si jornada completa → enviar WhatsApp automático
    const sentJornadas = state.sentJornadas || [];
    for (const jornada of JORNADAS) {
      if (sentJornadas.includes(jornada.label)) continue;
      if (isJornadaComplete(jornada, newResults)) {
        const {apikey, phone} = state.waBotConfig || {};
        const lb2 = buildLeaderboard(state.employees, state.predictions, newResults, state.knockoutTeams);

        // Si no hay API configurada, ofrecer compartir imagen
        if (!apikey || !phone) {
          showToast(`🎉 ${jornada.label} completa! Generando imagen...`);
          const r = await shareLeaderboard(jornada.label, lb2);
          if (r.shared || r.downloaded) {
            showToast(`✅ Tabla compartida: ${jornada.label}!`);
          }
          return;
        }

        // Si hay API, enviar texto automático
        showToast(`🎉 ${jornada.label} completa! Enviando WhatsApp...`);
        try {
          const msg = buildWAMsg(jornada.label, lb2);
          const encoded = encodeURIComponent(msg);
          const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;
          const ok = (await fetch(url)).ok;
          if (ok) {
            await apiPost("/sentjornada", { label: jornada.label }, true);
            setState_(prev => ({...prev, sentJornadas:[...sentJornadas, jornada.label]}));
            showToast(`✅ WhatsApp enviado: ${jornada.label}!`);
          } else {
            showToast("⚠️ WhatsApp falló. Generando imagen como alternativa...", true);
            await shareLeaderboard(jornada.label, lb2);
          }
        } catch {
          showToast("⚠️ Error de red. Generando imagen como alternativa...", true);
          await shareLeaderboard(jornada.label, lb2);
        }
        break;
      }
    }
  };

  const setKnockout = async (slot, team) => {
    setState_(prev => ({...prev, knockoutTeams:{...(prev.knockoutTeams||{}),[slot]:team}}));
    try {
      await apiPost("/knockout", { slot, team }, true);
      showToast(`${slot} → ${team} ✅`);
    } catch { showToast("Error al guardar",true); refresh(); }
  };

  const addEmployee = async name => {
    if (!name.trim()||state.employees.includes(name.trim())) return;
    setState_(prev => ({...prev, employees:[...prev.employees, name.trim()]}));
    try {
      await apiPost("/employees", { action:"add", name }, true);
      showToast(`${name.trim()} agregado ✅`);
    } catch { showToast("Error al agregar",true); refresh(); }
  };

  const delEmployee = async name => {
    setState_(prev => ({...prev, employees: prev.employees.filter(e=>e!==name)}));
    try {
      await apiPost("/employees", { action:"del", name }, true);
      showToast(`${name} eliminado`);
    } catch { showToast("Error al eliminar",true); refresh(); }
  };

  const saveWAConfig = async (apikey, phone) => {
    try {
      await apiPost("/waconfig", { apikey, phone }, true);
      setState_(prev => ({...prev, waBotConfig:{apikey,phone}}));
      showToast("Configuración guardada ✅");
    } catch { showToast("Error al guardar configuración",true); }
  };

  const sendWA = async jornadaLabel => {
    const {apikey,phone}=state.waBotConfig||{};
    if (!apikey||!phone) { showToast("Configurá API key y teléfono primero",true); return; }
    const lb = buildLeaderboard(state.employees,state.predictions,state.results,state.knockoutTeams);
    const msg = buildWAMsg(jornadaLabel, lb);
    const encoded = encodeURIComponent(msg);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;
    showToast("Enviando...");
    try {
      const ok = (await fetch(url)).ok;
      if (ok) {
        await apiPost("/sentjornada", { label: jornadaLabel }, true);
        setState_(prev=>({...prev,sentJornadas:[...(prev.sentJornadas||[]),jornadaLabel]}));
        showToast("✅ WhatsApp enviado!");
      } else showToast("Error al enviar. Revisá API key/teléfono",true);
    } catch { showToast("Error de red",true); }
  };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"#080d18",color:"#f5c518",fontFamily:"Barlow,sans-serif",fontSize:18}}>
      ⚽ Cargando Prode...
    </div>
  );

  if (!user) return <Login employees={state?.employees||DEFAULT_EMPLOYEES} onLogin={(u,a)=>{setUser(u);setAdmin(a);}} />;

  const lb = buildLeaderboard(state.employees,state.predictions,state.results,state.knockoutTeams);
  const myRank = lb.findIndex(r=>r.name===user)+1;
  const myStats = lb.find(r=>r.name===user);
  const played = Object.keys(state.results||{}).length;
  const total = allGroupMatches().length + allKnockoutMatches(state.knockoutTeams).length;

  return (
    <>
      <style>{CSS}</style>
      <img src={BG_IMAGE} alt="" className="bg-cover" />
      <div className="bg-overlay" />
      <div className="app-wrap">
      <header className="hdr">
        <div className="hdr-logo">⚽ <em>PRODE</em> MUNDIAL 2026</div>
        <div className="hdr-r">
          <div className="badge">{isAdmin?"⚙️ ADMIN":`👤 ${user}`}</div>
          <button className="btn-sm" onClick={()=>{setUser(null);setAdmin(false);}}>Salir</button>
        </div>
      </header>

      <nav className="nav">
        {[["fixture","📋 Fixture"],["tabla","🏆 Tabla"],["bracket","🗂 Bracket"]].map(([k,l])=>(
          <button key={k} className={`nb${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
        {isAdmin && [["admin","⚙️ Admin"],["wa","📲 WhatsApp"],["jugadores","👥 Jugadores"]].map(([k,l])=>(
          <button key={k} className={`nb${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </nav>

      <div className="main">
        {tab==="fixture"    && <FixtureTab    user={user} isAdmin={isAdmin} state={state} phase={phase} setPhase={setPhase} selGrp={selGrp} setSelGrp={setSelGrp} onSave={savePred} savedMap={saved} />}
        {tab==="tabla"      && <TablaTab      lb={lb} user={user} played={played} total={total} myRank={myRank} myStats={myStats} />}
        {tab==="bracket"    && <BracketTab    state={state} user={user} />}
        {tab==="admin"      && isAdmin && <AdminTab     state={state} onResult={setResult} onKnockout={setKnockout} />}
        {tab==="wa"         && isAdmin && <WATab        state={state} lb={lb} onConfig={saveWAConfig} onSend={sendWA} />}
        {tab==="jugadores"  && isAdmin && <JugadoresTab employees={state.employees} onAdd={addEmployee} onDel={delEmployee} />}
      </div>

      {toast && <div className={`toast${toast.err?" err":""}`}>{toast.msg}</div>}
      </div>
    </>
  );
}

// ============================================================
// COUNTDOWN
// ============================================================
const MUNDIAL_START = new Date("2026-06-11T16:00:00"); // México vs Sudáfrica hora Argentina

function useCountdown() {
  const calc = () => {
    const diff = MUNDIAL_START - new Date();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Countdown() {
  const t = useCountdown();
  if (!t) return (
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"var(--green)",letterSpacing:2}}>
        ⚽ ¡EL MUNDIAL YA COMENZÓ!
      </div>
    </div>
  );
  const units = [
    { v: t.d, l: "DÍAS" },
    { v: t.h, l: "HORAS" },
    { v: t.m, l: "MIN" },
    { v: t.s, l: "SEG" },
  ];
  return (
    <div style={{marginBottom:22}}>
      <div style={{textAlign:"center",fontSize:10,fontWeight:700,letterSpacing:3,
        color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>
        Faltan para el partido inaugural
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
        {units.map(({v,l})=>(
          <div key={l} style={{
            background:"rgba(245,197,24,0.08)",border:"1px solid rgba(245,197,24,0.25)",
            borderRadius:10,padding:"10px 4px",textAlign:"center"
          }}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"var(--gold)",lineHeight:1}}>
              {String(v).padStart(2,"0")}
            </div>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:2,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function Login({ employees, onLogin }) {
  const [pwd,setPwd]=useState("");
  return (
    <>
      <style>{CSS}</style>
      <img src={BG_IMAGE} alt="" className="bg-cover" />
      <div className="bg-overlay" />
      <div className="app-wrap">
      <div className="lw">
        <div className="lc">
          <div className="lt">PRODE<br/><span className="g">MUNDIAL</span><br/>2026</div>
          <div className="ls">🏆 Torneo Empresa · Maniagro</div>
          <Countdown />
          <div className="sl">Seleccioná tu nombre</div>
          <div className="pg">
            {employees.map(n=><button key={n} className="pb" onClick={()=>onLogin(n,false)}>{n}</button>)}
          </div>
          <div className="div"><span>ADMIN</span></div>
          <div className="row">
            <input className="inp" type="password" placeholder="Contraseña admin..."
              value={pwd} onChange={e=>setPwd(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&(pwd===ADMIN_PASSWORD?onLogin("Admin",true):alert("Contraseña incorrecta"))}
            />
            <button className="bgo" onClick={()=>pwd===ADMIN_PASSWORD?onLogin("Admin",true):alert("Contraseña incorrecta")}>
              Entrar
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// ============================================================
// FIXTURE TAB
// ============================================================
function FixtureTab({ user, isAdmin, state, phase, setPhase, selGrp, setSelGrp, onSave, savedMap }) {
  const phases = [
    {k:"groups",l:"Grupos"},{k:"r32",l:"Octavos"},{k:"qf",l:"Cuartos"},
    {k:"sf",l:"Semis"},{k:"final",l:"Final"},
  ];
  const ko = { r32:R32, qf:QF, sf:SF, final:FINALS };
  const kt = state?.knockoutTeams||{};
  const resolve = s => kt[s]||s;

  return (
    <div>
      <div className="stitle">Fixture</div>
      <div className="leg">
        <span className="li"><span className="pts p5">5 PTS</span> Exacto</span>
        <span className="li"><span className="pts p3">3 PTS</span> Ganador</span>
        <span className="li"><span className="pts p0">0 PTS</span> Error</span>
      </div>
      <div className="tabs" style={{marginBottom:12}}>
        {phases.map(p=><button key={p.k} className={`tab${phase===p.k?" on":""}`} onClick={()=>setPhase(p.k)}>{p.l}</button>)}
      </div>
      {phase==="groups" && <>
        <div className="tabs">
          {Object.keys(GROUPS_DATA).map(g=>(
            <button key={g} className={`tab${selGrp===g?" on":""}`} onClick={()=>setSelGrp(g)}>Grupo {g}</button>
          ))}
        </div>
        {GROUPS_DATA[selGrp].matches.map(m=>(
          <MatchCard key={m.id} match={m} user={user} isAdmin={isAdmin} state={state} onSave={onSave} savedMap={savedMap} />
        ))}
      </>}
      {phase!=="groups" && (ko[phase]||[]).map(m=>(
        <MatchCard key={m.id}
          match={{...m,home:resolve(m.slotA),away:resolve(m.slotB),hf:"⚽",af:"⚽"}}
          user={user} isAdmin={isAdmin} state={state} onSave={onSave} savedMap={savedMap}
          phaseLabel={m.label}
        />
      ))}
    </div>
  );
}

// ============================================================
// MATCH CARD
// ============================================================
function MatchCard({ match, user, isAdmin, state, onSave, savedMap, phaseLabel }) {
  const locked = isLocked(match.date);
  const result = state?.results?.[match.id];
  const myPred = state?.predictions?.[match.id]?.[user];
  const pts    = myPred&&result ? calcPts(myPred,result) : null;
  const isDone = !!result;

  const [h,setH]=useState(myPred?.home??"");
  const [a,setA]=useState(myPred?.away??"");
  useEffect(()=>{ if(myPred){setH(myPred.home);setA(myPred.away);} },[myPred?.home,myPred?.away]);

  const cls = `mc${isDone?" done":locked?" lkd":" opn"}`;

  return (
    <div className={cls}>
      <div className="mh">
        <span className="mdate">{fmtDate(match.date)}</span>
        {phaseLabel&&<span style={{fontSize:10,color:"var(--purple)",fontWeight:700}}>{phaseLabel}</span>}
        <span style={{fontSize:10,color:"var(--muted)",letterSpacing:1}}>{match.id}</span>
        {isDone?<span className="tag td">✅ Finalizado</span>
          :locked?<span className="tag tl">🔒 Cerrado</span>
          :<span className="tag to">🟢 Abierto</span>}
      </div>
      <div className="mb">
        <div className="tm"><Flag name={match.home} size={28}/><span className="tn">{match.home}</span></div>
        <div className="vs">
          {!isAdmin&&!locked&&<>
            <input className="si" type="number" min="0" max="20" value={h} onChange={e=>setH(e.target.value)} placeholder="—"/>
            <span className="sd">:</span>
            <input className="si" type="number" min="0" max="20" value={a} onChange={e=>setA(e.target.value)} placeholder="—"/>
          </>}
          {!isAdmin&&locked&&<div style={{display:"flex",alignItems:"center",gap:5}}>
            <div className="sb">{myPred?.home??"—"}</div>
            <span className="sd">:</span>
            <div className="sb">{myPred?.away??"—"}</div>
            {pts!==null&&<span className={`pts p${pts}`}>{pts}pts</span>}
          </div>}
          {isAdmin&&<div style={{display:"flex",alignItems:"center",gap:5}}>
            {result?<><div className="sb">{result.home}</div><span className="sd">:</span><div className="sb">{result.away}</div></>
              :<span style={{fontSize:12,color:"var(--muted)"}}>Sin resultado</span>}
          </div>}
        </div>
        <div className="tm aw"><Flag name={match.away} size={28}/><span className="tn">{match.away}</span></div>
      </div>
      {!isAdmin&&!locked&&<div className="mf">
        <span className="mn">{myPred?<>Tu pronóstico: <strong>{myPred.home}–{myPred.away}</strong></>:"Sin pronóstico aún"}</span>
        <button className={`sbtn${savedMap[match.id]?" ok":""}`} onClick={()=>onSave(match.id,h,a)}>
          {savedMap[match.id]?"✓ Guardado":"Guardar pronóstico"}
        </button>
      </div>}
      {!isAdmin&&locked&&!myPred&&<div className="mf">
        <span style={{fontSize:11,color:"var(--red)"}}>⚠️ No cargaste pronóstico</span>
      </div>}
      {isDone&&<div className="mf">
        <span style={{fontSize:11,color:"var(--green)"}}>✅ Resultado oficial: {result.home}–{result.away}</span>
        {!isAdmin&&myPred&&pts!==null&&<span style={{fontSize:11,color:pts===5?"var(--gold)":pts===3?"var(--blue)":"var(--muted)"}}>
          {pts===5?"🎯 ¡Exacto! +5pts":pts===3?"✓ Ganador +3pts":"✗ Sin puntos"}
        </span>}
      </div>}
    </div>
  );
}

// ============================================================
// TABLA
// ============================================================
function TablaTab({ lb, user, played, total, myRank, myStats }) {
  return (
    <div>
      <div className="stitle">Tabla de Posiciones</div>
      <div className="stats">
        <div className="stat"><div className="sn">{played}</div><div className="sl2">Jugados</div></div>
        <div className="stat"><div className="sn">{total}</div><div className="sl2">Total</div></div>
        {myStats&&<>
          <div className="stat"><div className="sn">#{myRank}</div><div className="sl2">Tu posición</div></div>
          <div className="stat"><div className="sn">{myStats.pts}</div><div className="sl2">Tus puntos</div></div>
          <div className="stat"><div className="sn">{myStats.exact}</div><div className="sl2">Exactos ⭐</div></div>
        </>}
      </div>
      <div className="lb">
        <div className="lbh">
          <span>#</span><span>Jugador</span>
          <span style={{textAlign:"center"}}>Pts</span>
          <span style={{textAlign:"center"}}>⭐</span>
          <span style={{textAlign:"center"}}>✓</span>
          <span style={{textAlign:"center",fontSize:9}} className="np">Pend.</span>
        </div>
        {lb.map((r,i)=>(
          <div key={r.name} className={`lbr${i===0?" r1":i===1?" r2":i===2?" r3":""}`}>
            <span className="lbpos">{i+1}</span>
            <span className="lbname">
              {i===0?"🥇 ":i===1?"🥈 ":i===2?"🥉 ":""}
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</span>
              {r.name===user&&<span className="you">TÚ</span>}
            </span>
            <span className="lbpts">{r.pts}</span>
            <span className="lbn ne">{r.exact}</span>
            <span className="lbn nw">{r.win}</span>
            <span className="lbn np">{r.pend>0?`+${r.pend}`:"-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BRACKET
// ============================================================
function BracketTab({ state, user }) {
  const kt=state?.knockoutTeams||{};
  const rs=state?.results||{};
  const pr=state?.predictions||{};
  const resolve=s=>kt[s]||s;

  const getWinner=(id,sA,sB)=>{
    const r=rs[id]; if(!r) return null;
    if(r.home>r.away) return resolve(sA);
    if(r.away>r.home) return resolve(sB);
    return "Penales";
  };

  const renderPhase=(label,matches)=>(
    <div className="bp">
      <div className="bpl">{label}</div>
      {matches.map(m=>{
        const home=resolve(m.slotA), away=resolve(m.slotB);
        const result=rs[m.id]||null;
        const myPred=pr[m.id]?.[user]||null;
        const pts=myPred&&result?calcPts(myPred,result):null;
        return (
          <div key={m.id} className={`mc${result?" done":""}`} style={{marginBottom:7}}>
            <div className="mh">
              <span className="mdate">{fmtDate(m.date)}</span>
              {m.label&&<span style={{fontSize:10,color:"var(--purple)",fontWeight:700}}>{m.label}</span>}
              {result?<span className="tag td">✅ {result.home}–{result.away}</span>
                :<span className="tag tl">⏳ Pendiente</span>}
            </div>
            <div className="mb">
              <div className="tm"><Flag name={home} size={24}/><span className="tn">{home}</span></div>
              <div className="vs">
                {result?<><div className="sb">{result.home}</div><span className="sd">:</span><div className="sb">{result.away}</div></>
                  :<><div className="sb">—</div><span className="sd">:</span><div className="sb">—</div></>}
                {pts!==null&&<span className={`pts p${pts}`}>{pts}pts</span>}
              </div>
              <div className="tm aw"><Flag name={away} size={24}/><span className="tn">{away}</span></div>
            </div>
            {result&&<div className="mf">
              <span style={{fontSize:11,color:"var(--green)"}}>🏆 Avanza: {getWinner(m.id,m.slotA,m.slotB)}</span>
              {myPred&&<span className="mn">Tu pronóstico: <strong>{myPred.home}–{myPred.away}</strong></span>}
            </div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className="stitle">Bracket Eliminatorio</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:16,lineHeight:1.5}}>
        Los equipos se cargan desde Admin → Equipos Clasificados una vez terminada la fase de grupos.
        El bracket sigue el reglamento FIFA 2026 (1°A vs 2°C, etc.)
      </p>
      {renderPhase("⚡ Octavos de Final", R32)}
      {renderPhase("🔥 Cuartos de Final", QF)}
      {renderPhase("🌟 Semifinales", SF)}
      {renderPhase("🏆 Final & 3° Puesto", FINALS)}
    </div>
  );
}

// ============================================================
// ADMIN TAB
// ============================================================
function AdminTab({ state, onResult, onKnockout }) {
  const [phase, setPhase] = useState("groups");
  const [selGrp, setSelGrp] = useState("J");
  const [ktInputs, setKtInputs] = useState({});

  const phases2=[
    {k:"groups",l:"Grupos"},{k:"r32",l:"Octavos"},{k:"qf",l:"Cuartos"},
    {k:"sf",l:"Semis"},{k:"final",l:"Final"},{k:"ko",l:"Equipos Clasificados"},
  ];
  const ko = { r32:R32, qf:QF, sf:SF, final:FINALS };
  const kt = state?.knockoutTeams||{};
  const resolve=s=>kt[s]||s;

  return (
    <div>
      <div className="stitle">⚙️ Panel Admin</div>
      <div className="tabs" style={{marginBottom:14}}>
        {phases2.map(p=><button key={p.k} className={`tab${phase===p.k?" on":""}`} onClick={()=>setPhase(p.k)}>{p.l}</button>)}
      </div>

      {phase==="groups"&&<>
        <div className="tabs">
          {Object.keys(GROUPS_DATA).map(g=>(
            <button key={g} className={`tab${selGrp===g?" on":""}`} onClick={()=>setSelGrp(g)}>Grupo {g}</button>
          ))}
        </div>
        {GROUPS_DATA[selGrp].matches.map(m=>(
          <AdminCard key={m.id} match={{...m,home:m.home,away:m.away}} state={state} onResult={onResult}/>
        ))}
      </>}

      {["r32","qf","sf","final"].includes(phase)&&(ko[phase]||[]).map(m=>(
        <AdminCard key={m.id} match={{...m,home:resolve(m.slotA),away:resolve(m.slotB)}} state={state} onResult={onResult}/>
      ))}

      {phase==="ko"&&<div>
        <p style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.5}}>
          Cargá los equipos clasificados de cada grupo. Esto actualiza automáticamente el bracket de octavos.
        </p>
        {["A","B","C","D","E","F","G","H","I","J","K","L"].map(g=>(
          <div key={g} className="ac">
            <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>Grupo {g}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[1,2,3].map(pos=>{
                const slot=`${pos}${g}`;
                const cur=kt[slot]||"";
                const lbl=pos===1?"🥇 1°":pos===2?"🥈 2°":"🥉 3°";
                return (
                  <div key={slot}>
                    <div className="al">{lbl}</div>
                    <div className="row" style={{marginTop:3}}>
                      <input className="inp" placeholder={`${lbl} Grupo ${g}`}
                        defaultValue={cur}
                        onChange={e=>setKtInputs(prev=>({...prev,[slot]:e.target.value}))}
                      />
                      <button className="bgo" style={{padding:"7px 10px"}}
                        onClick={()=>onKnockout(slot, ktInputs[slot]??cur)}>✓</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function AdminCard({ match, state, onResult }) {
  const res=state?.results?.[match.id];
  const preds=state?.predictions?.[match.id]||{};
  const pc=Object.keys(preds).length;
  const [h,setH]=useState(res?.home??"");
  const [a,setA]=useState(res?.away??"");
  const [ok,setOk]=useState(false);
  const handle=()=>{ onResult(match.id,h,a); setOk(true); setTimeout(()=>setOk(false),2000); };
  return (
    <div className="ac">
      <div className="at">
        <Flag name={match.home} size={20}/><span style={{marginLeft:4}}>{match.home}</span>
        <span style={{color:"var(--muted)"}}>vs</span>
        <Flag name={match.away} size={20}/><span style={{marginLeft:4}}>{match.away}</span>
        <span style={{marginLeft:"auto",fontSize:11,color:"var(--muted)"}}>{fmtDate(match.date)} · {pc} pronósticos</span>
      </div>
      <div className="ar">
        <span className="al">Resultado:</span>
        <input className="si" type="number" min="0" max="30" value={h} onChange={e=>setH(e.target.value)} placeholder="—"/>
        <span className="sd">:</span>
        <input className="si" type="number" min="0" max="30" value={a} onChange={e=>setA(e.target.value)} placeholder="—"/>
        <button className={`sbtn${ok?" ok":""}`} onClick={handle}>{ok?"✓ Guardado":"Guardar"}</button>
        {res&&<span className="rok">Actual: {res.home}–{res.away}</span>}
      </div>
    </div>
  );
}

// ============================================================
// WHATSAPP TAB
// ============================================================
function WATab({ state, lb, onConfig, onSend }) {
  const [apikey,setApikey]=useState(state?.waBotConfig?.apikey||"");
  const [phone, setPhone] =useState(state?.waBotConfig?.phone||"");
  const [jorn,  setJorn]  =useState(JORNADAS[0].label);
  const [sending,setSending]=useState(false);

  const handle=async()=>{ setSending(true); await onSend(jorn); setSending(false); };

  const results = state?.results || {};
  const sentJornadas = state?.sentJornadas || [];
  const cfgOk = !!(state?.waBotConfig?.apikey && state?.waBotConfig?.phone);

  return (
    <div>
      <div className="stitle">📲 WhatsApp Automático</div>

      {/* Status banner */}
      <div className="wa" style={{borderColor: cfgOk ? "var(--green)" : "var(--gold)"}}>
        <div className="wat">{cfgOk ? "✅ Sistema configurado" : "⚠️ Configuración pendiente"}</div>
        <div className="was">
          {cfgOk
            ? "El WhatsApp se envía automáticamente al cargar el último resultado de cada jornada. No requiere acción manual."
            : "Completá la configuración de CallMeBot para activar el envío automático al terminar cada jornada."}
        </div>
      </div>

      {/* Jornada status grid */}
      <div className="wa">
        <div className="wat">📊 Estado de jornadas</div>
        <div style={{display:"grid",gap:6,marginTop:8}}>
          {JORNADAS.map(j => {
            const complete = isJornadaComplete(j, results);
            const sent = sentJornadas.includes(j.label);
            const done = j.matchIds.filter(id => results[id]).length;
            const total = j.matchIds.length;
            const pct = total > 0 ? Math.round(done/total*100) : 0;
            return (
              <div key={j.label} style={{
                display:"flex",alignItems:"center",gap:10,
                background:"var(--surf2)",borderRadius:8,padding:"9px 13px",
                border:`1px solid ${sent?"var(--green)":complete?"var(--blue)":"var(--bord)"}`
              }}>
                <span style={{fontSize:16}}>
                  {sent ? "✅" : complete ? "🕐" : "⏳"}
                </span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color: sent?"var(--green)":complete?"var(--blue)":"var(--text)"}}>
                    {j.label}
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>
                    {done}/{total} partidos cargados
                    {!complete && <span style={{marginLeft:6}}>— {pct}%</span>}
                  </div>
                  {/* mini progress bar */}
                  <div style={{height:3,background:"var(--bord)",borderRadius:2,marginTop:4}}>
                    <div style={{height:"100%",borderRadius:2,width:`${pct}%`,
                      background: sent?"var(--green)":complete?"var(--blue)":"var(--gold)",
                      transition:"width .3s"}}/>
                  </div>
                </div>
                <div style={{fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                  color: sent?"var(--green)":complete?"var(--blue)":"var(--muted)"}}>
                  {sent ? "Enviado ✓" : complete ? "Completada" : `${pct}%`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config */}
      <div className="wa">
        <div className="wat">🔧 Configuración CallMeBot</div>
        <div className="was">
          <strong>Pasos para activar (gratis):</strong><br/>
          1. Guardá el número <strong>+34 644 59 71 91</strong> en WhatsApp<br/>
          2. Enviá el mensaje: <code style={{background:"var(--surf3)",padding:"1px 5px",borderRadius:3,fontSize:12}}>I allow callmebot to send me messages</code><br/>
          3. Recibirás tu API key por WhatsApp<br/>
          4. El teléfono debe tener código de país sin + (ej: 5491112345678 para Argentina)
        </div>
        <div className="waf">
          <div><div className="wal">API Key (te la manda CallMeBot)</div>
            <input className="inp" placeholder="Ej: 123456" value={apikey} onChange={e=>setApikey(e.target.value)}/></div>
          <div><div className="wal">Teléfono del grupo (código país sin +)</div>
            <input className="inp" placeholder="Ej: 5491112345678" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
        </div>
        <button className="bgo" onClick={()=>onConfig(apikey,phone)}>Guardar configuración</button>
      </div>

      {/* Share image (NUEVO - método recomendado) */}
      <div className="wa" style={{borderColor:"var(--green)"}}>
        <div className="wat">📸 Compartir tabla como imagen (recomendado)</div>
        <div className="was">
          Genera una imagen con el podio y la tabla completa. Tocá el botón → elegí el grupo de WhatsApp → enviar. <strong>No necesita configuración ni API key.</strong>
        </div>
        <div className="warow">
          <select className="wasel" value={jorn} onChange={e=>setJorn(e.target.value)}>
            {JORNADAS.map(j=>(
              <option key={j.label} value={j.label}>{j.label}</option>
            ))}
          </select>
          <button className="bwa" style={{background:"var(--green)",color:"#fff"}}
            onClick={async()=>{
              const r = await shareLeaderboard(jorn, lb);
              if (r.error) alert("Error: " + r.error);
              else if (r.downloaded) alert("📥 Imagen descargada. Compartila al grupo desde tu galería.");
            }}>
            📸 Generar y compartir
          </button>
        </div>
      </div>

      {/* Envío via API (alternativo) */}
      <div className="wa">
        <div className="wat">📤 Envío automático por API (alternativo)</div>
        <div className="was">Solo si configuraste CallMeBot. Envía texto (no imagen).</div>
        <div className="warow">
          <select className="wasel" value={jorn} onChange={e=>setJorn(e.target.value)}>
            {JORNADAS.map(j=>(
              <option key={j.label} value={j.label}>
                {j.label}{sentJornadas.includes(j.label)?" ✅":""}
              </option>
            ))}
          </select>
          <button className="bwa" disabled={sending||!cfgOk} onClick={handle}>
            {sending?"Enviando...":"📲 Enviar texto"}
          </button>
        </div>
        {!cfgOk && <div style={{marginTop:8,fontSize:12,color:"var(--muted)"}}>ℹ️ Para usar esto, configurá API key y teléfono arriba.</div>}
      </div>

      {/* Preview */}
      <div className="wa">
        <div className="wat">👁 Vista previa del mensaje</div>
        <pre style={{fontSize:12,color:"var(--text)",whiteSpace:"pre-wrap",lineHeight:1.6,
          background:"var(--surf2)",padding:12,borderRadius:8,marginTop:8,fontFamily:"monospace"}}>
          {buildWAMsg(jorn,lb)}
        </pre>
      </div>
    </div>
  );
}

// ============================================================
// JUGADORES TAB
// ============================================================
function JugadoresTab({ employees, onAdd, onDel }) {
  const [name,setName]=useState("");
  return (
    <div>
      <div className="stitle">👥 Gestión de Jugadores</div>
      <div className="wa" style={{marginBottom:14}}>
        <div className="wat">Agregar participante</div>
        <div className="row" style={{marginTop:10}}>
          <input className="inp" placeholder="Nombre del nuevo participante"
            value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&name.trim()){onAdd(name);setName("");}}}
          />
          <button className="bgo" onClick={()=>{if(name.trim()){onAdd(name);setName("");}}}>+ Agregar</button>
        </div>
      </div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>{employees.length} participantes</div>
      <div className="eg">
        {employees.map(e=>(
          <div key={e} className="ec">
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e}</span>
            <button className="del" onClick={()=>{if(window.confirm(`¿Eliminar a ${e}?`))onDel(e);}}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

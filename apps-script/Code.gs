/**
 * Formulaire de classe
 * - Reçoit les réponses du site et les ajoute dans l'onglet « Réponses ».
 * - Renvoie toutes les réponses au tableau de bord (admin.html),
 *   seulement avec le bon code d'accès.
 *
 * Code d'accès : Paramètres du projet (roue dentée) > Propriétés du script
 * > ajouter la propriété ADMIN_KEY avec un code long que toi seul connais.
 * Installation complète : voir README.md.
 */

const SHEET_NAME = 'Réponses';

// [clé envoyée par le site, titre de la colonne]
const COLUMNS = [
  ['date', 'Reçu le'],
  ['reussite', 'Une année réussie, c’est surtout'],
  ['tech', 'Tech qui attire'],
  ['techAutre', 'Tech (autre)'],
  ['opportunites', 'Opportunités souhaitées'],
  ['resultats', 'Pour booster les résultats'],
  ['matiere', 'Matière difficile'],
  ['groupes', 'Groupes souhaités'],
  ['talent', 'Talent à partager'],
  ['equipe', 'Rejoindre l’équipe'],
  ['idee', 'Idée pour la classe'],
  ['prenom', 'Prénom'],
];

const MAX_LEN = 1000;

function doPost(e) {
  let data;
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    data = JSON.parse(raw);
  } catch (err) {
    return json_({ ok: false, error: 'Format invalide' });
  }

  // Lecture par le tableau de bord
  if (data.action === 'read') return read_(data.key);

  // Nouvelle réponse au formulaire
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    // Seules les clés prévues sont enregistrées ; la date vient du serveur.
    const row = COLUMNS.map(function (col) {
      return col[0] === 'date' ? new Date() : clean_(data[col[0]]);
    });
    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Réponse non enregistrée' });
  } finally {
    lock.releaseLock();
  }
}

// Permet de vérifier dans le navigateur que le déploiement répond.
function doGet() {
  return json_({ ok: true, info: 'Le formulaire est en ligne.' });
}

function read_(key) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected) {
    return json_({ ok: false, error: 'ADMIN_KEY manquant dans les propriétés du script' });
  }
  if (typeof key !== 'string' || key !== expected) {
    Utilities.sleep(1500); // ralentit les essais au hasard
    return json_({ ok: false, error: 'Code incorrect' });
  }
  const values = getSheet_().getDataRange().getValues();
  const rows = values.slice(1).map(function (r) {
    const o = {};
    COLUMNS.forEach(function (col, i) {
      const v = r[i];
      o[col[0]] = v instanceof Date ? v.toISOString() : (v === undefined || v === null ? '' : String(v));
    });
    return o;
  });
  return json_({ ok: true, rows: rows });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (col) { return col[1]; }));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}

function clean_(value) {
  let text;
  if (Array.isArray(value)) {
    text = value.map(String).join(', ');
  } else {
    text = value === undefined || value === null ? '' : String(value);
  }
  text = text.trim().slice(0, MAX_LEN);
  // Empêche une réponse d'être lue comme une formule par Google Sheets
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

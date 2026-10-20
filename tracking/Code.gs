/**
 * YDT.TECH – רישום כניסות ולחיצות לגוגל שיטס
 * הדביקו את הקובץ הזה ב-Apps Script של הגיליון ופרסמו כ-Web app.
 */
const SHEET_NAME = 'כניסות';
const HEADERS = [
  'תאריך ושעה', 'אירוע', 'פרטים', 'מזהה מבקר', 'מבקר חוזר', 'מזהה ביקור',
  'מכשיר', 'דפדפן', 'מערכת הפעלה', 'רזולוציה', 'שפה', 'מקור הגעה', 'קמפיין (UTM)',
  'עמוד', 'שניות מתחילת הביקור'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getSheet_();
    const row = [
      new Date(), s_(d.event), s_(d.details), s_(d.vid), d.returning ? 'כן' : 'לא', s_(d.sid),
      s_(d.device), s_(d.browser), s_(d.os), s_(d.screen), s_(d.lang), s_(d.referrer), s_(d.utm),
      s_(d.page), Number(d.seconds) || 0
    ];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length).setValues([row]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('YDT tracker is running');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setBackground('#C8F031');
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  }
  return sheet;
}

// ניקוי ערכים: מגביל אורך ומונע הזרקת נוסחאות לגיליון
function s_(v) {
  let t = v == null ? '' : String(v).slice(0, 300);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

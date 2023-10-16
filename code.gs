function onEdit(e) {
  if (!e) {
    throw new aError(
      'Please do not run the onEdit(e) function in the script editor window. '
      + 'It runs automatically when you hand edit the spreadsheet.'
    );
  }
  undeletableCheckboxes_(e);
}
 

function undeletableCheckboxes_(e) {
  try {
    const protect = [
      {
        sheets: /^(Pipeline)$/i,
        ranges: ['F2:F10'],
      },
    ];
    if (e.value && e.oldValue !== undefined
      && e.value.match(/^(true|false)$/i) && String(e.oldValue).match(/^(true|false)$/i)) {
      return;
    }
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    let intersect;
    protect.some(prot =>
      sheetName.match(prot.sheets) && prot.ranges.some(rangeA1 =>
        intersect = getRangeIntersection_(e.range, sheet.getRange(rangeA1))
      )
    );
    if (!intersect) {
      return;
    }
    e.range.insertCheckboxes().setValue(e.oldValue || false);
    showMessage_('Please do not remove these checkboxes.');
  } catch (error) {
    showAndThrow_(error);
  }
}

function getRangeIntersection_(range, intersectingRange) {
  const result = { sheet: range.getSheet() };
  if (result.sheet.getSheetId() !== intersectingRange.getSheet().getSheetId()) {
    return null;
  }
  result.columnStart = Math.max(range.columnStart || range.getColumn(), intersectingRange.getColumn());
  result.columnEnd = Math.min(range.columnEnd || range.getLastColumn(), intersectingRange.getLastColumn());
  if (result.columnStart > result.columnEnd) {
    return null;
  }
  result.rowStart = Math.max(range.rowStart || range.getRow(), intersectingRange.getRow());
  result.rowEnd = Math.min(range.rowEnd || range.getLastRow(), intersectingRange.getLastRow());
  if (result.rowStart > result.rowEnd) {
    return null;
  }
  result.numRows = result.rowEnd - result.rowStart + 1;
  result.numColumns = result.columnEnd - result.columnStart + 1;
  result.range = result.sheet.getRange(result.rowStart, result.columnStart, result.numRows, result.numColumns);
  return result;
}

function showAndThrow_(error) {
  var stackCodeLines = String(error.stack).match(/\d+:/);
  if (stackCodeLines) {
    var codeLine = stackCodeLines.join(', ').slice(0, -1);
  } else {
    codeLine = error.stack;
  }
  showMessage_(error.message + ' Code line: ' + codeLine, 30);
  throw error;
}
 
function showMessage_(message, timeoutSeconds) {
  SpreadsheetApp.getActive().toast(message, 'Undeletable checkboxes', timeoutSeconds || 5);
}
 


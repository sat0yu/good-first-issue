import { IIssue } from "./github";

const MAX_ROW_NUMBER = 128;
const MAX_COL_NUMBER = 64;

export const getSheets = () => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheets();
};

export const buildDataMatrix = <T>(
  data: T[],
  rowBuilder: (entity: T) => string[],
) => data.reduce((acc: string[][], entity) => [
    ...acc,
    rowBuilder(entity),
  ], []);

export const clearSheet = (sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
  sheet.getRange(1, 1, MAX_ROW_NUMBER, MAX_COL_NUMBER).clear();
};

export const fillSheet = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  dataMatrix: string[][],
) => {
  sheet.getRange(1, 1, dataMatrix.length, dataMatrix[0].length).setValues(dataMatrix);
};

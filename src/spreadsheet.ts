import { IIssue } from "./github";

const MAX_ROW_NUMBER = 512;
const MAX_COL_NUMBER = 32;

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
  x: number = 1,
  y: number = 1,
) => {
  sheet.getRange(y, x, dataMatrix.length, dataMatrix[0].length).setValues(dataMatrix);
};

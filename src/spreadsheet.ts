import { IIssue } from "./github";

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

import { IIssue } from "./github";

export const getSheet = () => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getActiveSheet();
};

export const buildDataMatrix = <T>(
  data: T[],
  rowBuilder: (entity: T) => string[],
) => data.reduce((acc: string[][], entity) => [
    ...acc,
    rowBuilder(entity),
  ], []);

import { IIssue } from "./github";

const MAX_ROW_NUMBER = 512;
const MAX_COL_NUMBER = 32;

export type IHeader<T> = {
  [K in keyof T]: number;
};

export type IRow<T> = {
  [K in keyof T]: string;
};

type IRowBuilder<E, T> = (entity: E) => IRow<T>;

export const getSheets = () => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheets();
};

export const clearSheet = (sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
  sheet.getRange(1, 1, MAX_ROW_NUMBER, MAX_COL_NUMBER).clear();
};

const buildRow = <T>(header: IHeader<T>, row: IRow<T>): string[] => {
  return Object.keys(row).reduce((acc, key) => {
    acc[header[key]] = row[key];
    return acc;
  }, Object.keys(row));
};

const buildHeaderRow = <T>(header: IHeader<T>): string[] => {
  return Object.keys(header).reduce((acc, key) => {
    acc[header[key]] = key;
    return acc;
  }, Object.keys(header));
};

export const fillSheet = <E, T>(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  header: IHeader<T>,
  data: E[],
  rowBuilder: IRowBuilder<E, T>,
) => {
  const rows = data.reduce((acc: Array<IRow<T>>, e) => [...acc, rowBuilder(e)], []);
  const contents = rows.map((row) => buildRow<T>(header, row));
  const headerRow = buildHeaderRow<T>(header);
  sheet.getRange(1, 1, 1, Object.keys(header).length).setValues([headerRow]);
  sheet.getRange(2, 1, rows.length, Object.keys(contents[0]).length).setValues(contents);
};

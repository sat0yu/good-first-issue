import { fetchIssues, IResponse } from "./github";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

global.main = () => {
  const data: IResponse = fetchIssues(token);

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  const lastRow = data.repository.issues.edges.length;
  const lastColumn = 2;
  const dataRange = sheet.getRange(1, 1, lastRow, lastColumn);
  const dataArray = dataRange.getValues();

  data.repository.issues.edges.forEach((edge, i) => {
    const {title, author} = edge.node;
    Logger.log(edge.node);
    dataArray[i][0] = title;
    dataArray[i][1] = author && author.login;
  });
  sheet.getRange(1, 1, lastRow, lastColumn).setValues(dataArray);
};

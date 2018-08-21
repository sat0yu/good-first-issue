import { fetchIssuesRequestFactory, IIssue, IResponse } from "./github";
import { buildDataMatrix, getSheets } from "./spreadsheet";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

global.main = () => {
  const MAX_ROW_NUMBER = 128;
  const MAX_COL_NUMBER = 64;
  const rowBuilder = (issue: IIssue) => {
    const {title, author, url} = issue;
    Logger.log(issue);
    return [
      `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      author && author.login,
    ];
  };
  const fetchIssuesRequest = fetchIssuesRequestFactory<IResponse>(token);
  const sheets = getSheets();
  sheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    const [ owner, repository ] = sheetName.split("/");
    const data = fetchIssuesRequest(owner, repository);
    const issues = data.repository.issues.edges.map((e) => e.node);
    const dataArray = buildDataMatrix<IIssue>(issues, rowBuilder);
    sheet.getRange(1, 1, MAX_ROW_NUMBER, MAX_COL_NUMBER).clear();
    sheet.getRange(1, 1, dataArray.length, dataArray[0].length).setValues(dataArray);
  });
};

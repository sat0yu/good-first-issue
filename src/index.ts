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
    const {title, author, url, labels, updatedAt} = issue;
    return [
      author && author.avatarUrl && `=IMAGE("${author.avatarUrl}")`,
      author && author.login && `=HYPERLINK("${author.url}", "${author.login}")`,
      (new Date(updatedAt)).toDateString(),
      `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      labels.edges.reduce((acc, e) => [...acc, e.node.name], []).join(", "),
    ];
  };
  const fetchIssuesRequest = fetchIssuesRequestFactory<IResponse>(token);
  const sheets = getSheets();
  sheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    const [ owner, repository, label ] = sheetName.split("/");
    if (!owner || !repository || !label) { return; }
    const data = fetchIssuesRequest(owner, repository, label);
    const issues = data.repository.issues.edges.map((e) => e.node);
    if (issues.length === 0) { return; }
    const dataArray = buildDataMatrix<IIssue>(issues, rowBuilder);
    sheet.getRange(1, 1, MAX_ROW_NUMBER, MAX_COL_NUMBER).clear();
    sheet.getRange(1, 1, dataArray.length, dataArray[0].length).setValues(dataArray);
  });
};

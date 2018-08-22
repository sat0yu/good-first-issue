import { fetchIssuesRequestFactory, IIssue, IResponse } from "./github";
import { buildDataMatrix, clearSheet, fillSheet, getSheets } from "./spreadsheet";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

global.main = () => {
  const header = [[
    "",
    "author",
    "title",
    "created at",
    "updated at",
    "# of comments",
    "labels",
  ]];
  const rowBuilder = (issue: IIssue) => {
    const {title, author, url, labels, updatedAt, createdAt, comments} = issue;
    return [
      author && author.avatarUrl && `=IMAGE("${author.avatarUrl}")`,
      author && author.login && `=HYPERLINK("${author.url}", "${author.login}")`,
      `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      (new Date(createdAt)).toDateString(),
      (new Date(updatedAt)).toDateString(),
      comments.totalCount.toString(),
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
    const dataMatrix = buildDataMatrix<IIssue>(issues, rowBuilder);
    clearSheet(sheet);
    fillSheet(sheet, header);
    fillSheet(sheet, dataMatrix, 1, 2);
  });
};

global.onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("good first issue");
  menu.addItem("update", "main");
  menu.addToUi();
};

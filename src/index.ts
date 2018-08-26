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
    "repo.",
    "title",
    "created at",
    "updated at",
    "# of comments",
    "# of participants",
    "labels",
  ]];
  const rowBuilder = (issue: IIssue) => {
    const {
      title,
      author,
      url,
      labels,
      updatedAt,
      createdAt,
      comments,
      participants,
      repository: repo,
    } = issue;

    return [
      author && author.avatarUrl && `=IMAGE("${author.avatarUrl}")`,
      author && author.login && `=HYPERLINK("${author.url}", "${author.login}")`,
      `=HYPERLINK("${repo.url}", "${repo.name.replace(/"/g, "'")}")`,
      `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      (new Date(createdAt)).toDateString(),
      (new Date(updatedAt)).toDateString(),
      comments.totalCount.toString(),
      participants.totalCount.toString(),
      labels.edges.reduce((acc, e) => [...acc, e.node.name], []).join(", "),
    ];
  };
  const fetchIssuesRequest = fetchIssuesRequestFactory<IResponse>(token);
  const sheets = getSheets();
  sheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    const [ repoQuery, label ] = sheetName.split("/");
    if (!repoQuery || !label) {
      Logger.log(`[${sheetName}] invalid sheet name`);
      return;
    }
    const { data } = fetchIssuesRequest(repoQuery, label);
    const issues = data.search.edges.reduce((acc, repoEdge) => [
      ...acc,
      ...repoEdge.node.issues.edges.map((issueEdge) => issueEdge.node),
    ], []);
    if (issues.length === 0) {
      Logger.log(`[${sheetName}] found no issue`);
      return;
    }
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

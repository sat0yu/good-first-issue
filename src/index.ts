import { fetchIssuesRequestFactory, IIssue, IResponse } from "./github";
import { clearSheet, fillSheet, getSheets, IHeader, IRow } from "./spreadsheet";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

interface ISpreadSheet {
  avatar: string;
  comments: string;
  participants: string;
  author: string;
  createdAt: string;
  labels: string;
  repo: string;
  title: string;
  updatedAt: string;
}

const header: IHeader<ISpreadSheet> = {
  author: 1,
  avatar: 0,
  comments: 6,
  createdAt: 4,
  labels: 8,
  participants: 7,
  repo: 2,
  title: 3,
  updatedAt: 5,
};

const rowBuilder = (issue: IIssue): IRow<ISpreadSheet> => {
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

  return {
    author: author && author.login && `=HYPERLINK("${author.url}", "${author.login}")`,
    avatar: author && author.avatarUrl && `=IMAGE("${author.avatarUrl}")`,
    comments: comments.totalCount.toString(),
    createdAt: (new Date(createdAt)).toDateString(),
    labels: labels.edges.reduce((acc, e) => [...acc, e.node.name], []).join(", "),
    participants: participants.totalCount.toString(),
    repo: `=HYPERLINK("${repo.url}", "${repo.name.replace(/"/g, "'")}")`,
    title: `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
    updatedAt: (new Date(updatedAt)).toDateString(),
  };
};

global.main = () => {
  const fetchIssuesRequest = fetchIssuesRequestFactory<IResponse>(token);
  const sheets = getSheets();
  sheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    const [ repoQuery, label ] = sheetName.split("/");
    if (!repoQuery || !label) {
      Logger.log(`[${sheetName}] invalid sheet name`);
      return;
    }
    const { data, errors } = fetchIssuesRequest(repoQuery, label);
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        Logger.log(`[${sheetName}] ${error.message}`);
      });
      return;
    }
    const issues = data.search.edges.reduce((acc: IIssue[], repoEdge) => [
      ...acc,
      ...repoEdge.node.issues.edges.map((issueEdge) => issueEdge.node),
    ], []);
    if (issues.length === 0) {
      Logger.log(`[${sheetName}] found no issue`);
      return;
    }
    clearSheet(sheet);
    fillSheet<IIssue, ISpreadSheet>(sheet, header, issues, rowBuilder);
  });
};

global.onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("good first issue");
  menu.addItem("update", "main");
  menu.addToUi();
};

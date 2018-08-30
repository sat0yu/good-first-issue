import { fetchIssuesRequestFactory, IIssue, IResponse } from "./github";
import { sendSlackNotification } from "./slack";
import { clearSheet, fillSheet, getPrevSheet, getSheets, IHeader, IRow } from "./spreadsheet";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
const webhook = process.env.SLACK_WEBHOOK;
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
  isNew: string;
  repo: string;
  title: string;
  updatedAt: string;
}

const columns: IHeader<ISpreadSheet> = {
  author: 2,
  avatar: 1,
  comments: 7,
  createdAt: 5,
  isNew: 0,
  labels: 9,
  participants: 8,
  repo: 3,
  title: 4,
  updatedAt: 6,
};

const rowBuilderFactory = (prevSheet: object[][], header: IHeader<ISpreadSheet>, key: keyof ISpreadSheet) => {
  const sanitize = (str: string) => str.replace(/["`']/g, "");

  const dict = prevSheet.reduce((acc, row) => {
    const identifer = sanitize(row[header[key]].toString());
    return {
      ...acc,
      [identifer]: row,
    };
  }, {});

  return (issue: IIssue): IRow<ISpreadSheet> => {
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
      isNew: sanitize(issue[key]) in dict ? "" : "🆕",
      labels: labels.edges.reduce((acc, e) => [...acc, e.node.name], []).join(", "),
      participants: participants.totalCount.toString(),
      repo: `=HYPERLINK("${repo.url}", "${repo.name.replace(/"/g, "'")}")`,
      title: `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      updatedAt: (new Date(updatedAt)).toDateString(),
    };
  };
};

const withSlackNotification = (
  rowBuilder: (issue: IIssue) => IRow<ISpreadSheet>,
) => (issue: IIssue) => {
  const row = rowBuilder(issue);
  if (!!webhook && row.isNew.length > 0) {
    const text = `${issue.repository.name}: <${issue.url}|${issue.title}>`;
    sendSlackNotification(webhook, text);
  }
  return row;
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

    const prevSheet = getPrevSheet(sheet);
    const rowBuilder = rowBuilderFactory(prevSheet, columns, "title");
    clearSheet(sheet);
    fillSheet<IIssue, ISpreadSheet>(
      sheet,
      columns,
      issues,
      withSlackNotification(rowBuilder),
    );
  });
};

global.onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("good first issue");
  menu.addItem("update", "main");
  menu.addToUi();
};

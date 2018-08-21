import { fetchIssues, IIssue, IResponse } from "./github";
import { buildDataMatrix, getSheet } from "./spreadsheet";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

global.main = () => {
  const data: IResponse = fetchIssues(token);

  const rowBuilder = (issue: IIssue) => {
    const {title, author, url} = issue;
    Logger.log(issue);
    return [
      `=HYPERLINK("${url}", "${title.replace(/"/g, "'")}")`,
      author && author.login,
    ];
  };
  const issues = data.repository.issues.edges.map((e) => e.node);
  const dataArray = buildDataMatrix<IIssue>(issues, rowBuilder);
  const sheet = getSheet();
  sheet.getRange(1, 1, dataArray.length, dataArray[0].length).setValues(dataArray);
};

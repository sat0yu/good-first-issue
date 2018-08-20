import { fetchIssues, IResponse } from "./github";

declare let global: any;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("set GITHUB_TOKEN in your .env file");
}

global.main = () => {
  const data: IResponse = fetchIssues(token);
  Logger.log(data.repository);
};

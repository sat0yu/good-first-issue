const GITHUB_ENDPOINT = "https://api.github.com/graphql";

export interface IUser {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface IComment {
  author: IUser;
}

export interface ILabel {
  name: string;
  url: string;
}

export interface IIssue {
  title: string;
  id: string;
  url: string;
  author: IUser;
  participants: IConnection<IUser>;
  createdAt: string;
  updatedAt: string;
  labels: IConnection<ILabel>;
  comments: IConnection<IComment>;
}

export interface IEdge<T> {
  cursor?: string;
  node: T;
}

export interface IConnection<T> {
  edges: Array<IEdge<T>>;
  totalCount: number;
}

export interface IRepositoty {
  issues: IConnection<IIssue>;
}

export interface IResponse {
  repository: IRepositoty;
}

const buildRequestOption = (query: string, token: string) => {
  return {
    contentType: "application/json",
    headers: {
      Authorization: `bearer ${token}`,
    },
    method: "post" as "post" | "get" | "delete" | "patch" | "put",
    payload: JSON.stringify({ query }),
  };
};

export const fetchIssuesRequestFactory = <T>(token: string) => (
  owner: string,
  repository: string,
  label: string,
) => {
  const graphql = `
    {
      repository(owner: "${owner}", name: "${repository}") {
        issues(first: 100, labels: ["${label}"], states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              title
              url
              author {
                login
                url
                avatarUrl
              }
              createdAt
              updatedAt
              labels(first: 10) {
                edges {
                  node {
                    name
                    url
                  }
                }
              }
              comments(first: 1) {
                totalCount
              }
              participants(first: 50) {
                edges {
                  node {
                    avatarUrl
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const option = buildRequestOption(graphql, token);
  const res = UrlFetchApp.fetch(GITHUB_ENDPOINT, option);
  const json = JSON.parse(res.getContentText());
  return json.data as T;
};

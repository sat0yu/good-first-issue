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
  repository: IRepository;
}

export interface IEdge<T> {
  cursor?: string;
  node: T;
}

export interface IConnection<T> {
  edges: Array<IEdge<T>>;
  totalCount: number;
}

export interface IRepository {
  name: string;
  url: string;
  issues?: IConnection<IIssue>;
}

export interface ISearch {
  edges: Array<IEdge<IRepository>>;
}

export interface IData {
  search: ISearch;
}

export interface IResponse {
  data: IData;
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
  repoQuery: string,
  label: string,
) => {
  const labels = label === "*" ? "" : `labels: ["${label}"]`;
  const graphql = `
    {
      search(query: "${repoQuery}", type: REPOSITORY, first: 100) {
        edges {
          node {
            ... on Repository {
              issues(first: 100, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}, ${labels}) {
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
                    labels(first: 5) {
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
                    participants(first: 1) {
                      totalCount
                    }
                    repository {
                      name
                      url
                    }
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
  return json as T;
};

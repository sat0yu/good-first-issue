export const sendSlackNotification = (webhookEndpoint: string, text: string) => {
  const payload = {
    channel: "#times_sat0yu",
    icon_emoji: ":ghost:",
    text,
    username: "webhookbot",
  };
  const option = {
    contentType: "application/json",
    method: "post" as "post" | "get" | "delete" | "patch" | "put",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };
  UrlFetchApp.fetch(webhookEndpoint, option);
};

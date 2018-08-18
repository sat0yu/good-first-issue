export const msgBox = () => {
  Browser.msgBox("hello, world!");
};

export const log = () => {
  Logger.log("hello, world!");
};

export const sheet = () => {
  SpreadsheetApp.getActiveSheet().getRange("A1").setValue("hello, world!");
};

import { msgBox, log, sheet } from "./exportExamples";

declare let global: any;
global.main = () => {
  msgBox();
  log();
  sheet();
};

import { log, msgBox, sheet } from "./exportExamples";

declare let global: any;
global.main = () => {
  msgBox();
  log();
  sheet();
};

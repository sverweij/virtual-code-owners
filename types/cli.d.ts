import { IOptions } from "./main.js";

export interface ICommandLineOptions extends IOptions {
  help: boolean;
  version: boolean;
}

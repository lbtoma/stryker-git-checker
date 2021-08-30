import { PluginKind, declareFactoryPlugin } from "@stryker-mutator/api/plugin";
import { create } from "./git-checker";

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Checker, "git-checker", create)
];

export const createGitChecker = create;

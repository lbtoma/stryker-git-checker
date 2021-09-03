import { PluginKind, declareFactoryPlugin } from "@stryker-mutator/api/plugin";
import { create } from "./git-checker";

/**
 * Exported Plugins.
 */
export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Checker, "git-checker", create),
];

/**
 * The Git Checker plugin instance.
 */
export const createGitChecker = create;

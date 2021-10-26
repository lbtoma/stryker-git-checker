export const VALID_CHUNK = `     "license": "Apache-2.0",
     "private": false,
     "scripts": {
-    "build": "concurrently yarn:build:*",
-    "build:spack": "spack",
-    "build:types": "tsc src/index.ts --emitDeclarationOnly --declaration --skipLibCheck --declarationDir dist"
+    "build": "rm -rf dist && tsc"
   },
   "dependencies": {
-    "@stryker-mutator/api": "^5.3.0"
+    "@stryker-mutator/api": "^5.3.0",
+    "typed-inject": "^3.0.0"
   },
   "devDependencies": {
+    "concurrently": "^6.2.1",
     "jest": "^27.0.6",
-    "swc": "^1.0.11"
+    "swc": "^1.0.11",
+    "typescript": "^4.3.5"
   }
 }`;

export const INVALID_CHUNK = '""';

export const GIT_DIFF_STDOUT = `diff --git a/src/git-checker.ts b/src/git-checker.ts
index 824468b..726ac43 100644
--- a/src/git-checker.ts
+++ b/src/git-checker.ts
@@ -71,7 +71,7 @@ export class GitChecker implements Checker {
       exec(GIT_DIFF_COMMAND, (error, stdout, stderr) => {
         if (error) {
           this.logger.error(stderr);
-          this.logger.fatal("Error while executing the Git command.");
+          this.logger.fatal(\`Error while executing the \\\`\${GIT_DIFF_COMMAND}\\\` command.\`);
           reject(error);
         }
 
diff --git a/tests/unit/helpers/diff-parser.spec.ts b/tests/unit/helpers/diff-parser.spec.ts
index d717279..2370206 100644
--- a/tests/unit/helpers/diff-parser.spec.ts
+++ b/tests/unit/helpers/diff-parser.spec.ts
@@ -1,7 +1,7 @@
 import { compareLine, parseChunk } from "@/helpers/diff-parser";
 import { INVALID_CHUNK, VALID_CHUNK } from "@tests/mocks/chunks";
 
-describe("GitParser", () => {
+describe("Git parsing utils", () => {
   describe("compareLine", () => {
     test("Equal lines", () => {
       const deleted = "const fn = () => console.log('FOO');";
@@ -89,4 +89,8 @@ describe("GitParser", () => {
       }).toThrow('Unexpected chunk prefix = "');
     });
   });
+  
+  describe("parseDiffs", () => {
+
+  });
 });`;

export const DELETED_FILE_DIFF = `diff --git a/src/index.js b/src/index.js
deleted file mode 100644
index 1464b96..0000000
--- a/src/index.js
+++ /dev/null
@@ -1,11 +0,0 @@
-const fibonacci = n => {
-  if (n <= 0) {
-    return 0;
-  } else if (n === 1) {
-    return 1;
-  } else {
-    return fibonacci(n - 1) + fibonacci(n - 2);
-  }
-};
-
-module.exports.fibonacci = fibonacci;`;

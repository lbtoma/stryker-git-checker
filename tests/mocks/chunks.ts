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

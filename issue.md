[plugin:vite:css] Failed to load PostCSS config (searchPath: C:/Users/hurle_1pxotab/Documents/2 backend projec - Copy): [ReferenceError] module is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and 'C:\Users\hurle_1pxotab\Documents\2 backend projec - Copy\package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
ReferenceError: module is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and 'C:\Users\hurle_1pxotab\Documents\2 backend projec - Copy\package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
    at file:///C:/Users/hurle_1pxotab/Documents/2%20backend%20projec%20-%20Copy/postcss.config.js?t=1760543996911:1:1
    at ModuleJob.run (node:internal/modules/esm/module_job:218:25)
    at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
    at async req$3 (file:///C:/Users/hurle_1pxotab/Documents/2%20backend%20projec%20-%20Copy/node_modules/vite/dist/node/chunks/dep-N2lvmi1C.js:11658:13)
    at async Object.search (file:///C:/Users/hurle_1pxotab/Documents/2%20backend%20projec%20-%20Copy/node_modules/vite/dist/node/chunks/dep-N2lvmi1C.js:11400:23)
C:/Users/hurle_1pxotab/Documents/2 backend projec - Copy/src/app.css
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.js.
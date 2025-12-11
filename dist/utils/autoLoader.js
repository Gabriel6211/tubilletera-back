"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMiddlewares = loadMiddlewares;
exports.loadRoutes = loadRoutes;
exports.loadServices = loadServices;
exports.loadControllers = loadControllers;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function isRouter(value) {
    if (typeof value !== "function")
        return false;
    const v = value;
    // Express Router is callable and has use and handle methods
    return typeof v.use === "function" && typeof v.handle === "function";
}
function isMiddleware(value) {
    return typeof value === "function" && value.length >= 2;
}
function safeRequire(modulePath) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(modulePath);
        return mod;
    }
    catch (err) {
        console.error(`Failed to load module: ${modulePath}`, err);
        return null;
    }
}
function listScriptFiles(dir) {
    if (!fs_1.default.existsSync(dir))
        return [];
    return fs_1.default
        .readdirSync(dir)
        .filter((file) => {
        const full = path_1.default.join(dir, file);
        const isFile = fs_1.default.statSync(full).isFile();
        const isScript = /\.(ts|js)$/.test(file) && !/\.d\.ts$/.test(file);
        const isIndex = /^index\.(ts|js)$/.test(file);
        return isFile && isScript && !isIndex;
    })
        .map((file) => path_1.default.join(dir, file));
}
function loadMiddlewares(app, baseDir) {
    const dir = path_1.default.join(baseDir, "middleware");
    for (const file of listScriptFiles(dir)) {
        const mod = safeRequire(file);
        if (!mod)
            continue;
        const candidate = (mod.default ?? mod.middleware);
        if (isMiddleware(candidate)) {
            app.use(candidate);
            console.log(`Mounted middleware from ${path_1.default.basename(file)}`);
        }
        else if (typeof candidate === "function" && candidate.length === 1) {
            // allow register(app)
            candidate(app);
            console.log(`Registered middleware via function from ${path_1.default.basename(file)}`);
        }
        else {
            console.warn(`No middleware exported from ${path_1.default.basename(file)}`);
        }
    }
}
function loadRoutes(app, baseDir) {
    const dir = path_1.default.join(baseDir, "routes");
    for (const file of listScriptFiles(dir)) {
        const mod = safeRequire(file);
        if (!mod)
            continue;
        const explicitRouter = (mod.router ?? mod.default);
        const basePath = mod.basePath ?? inferBasePathFromFilename(file);
        if (isRouter(explicitRouter)) {
            app.use(basePath, explicitRouter);
            console.log(`Mounted router '${path_1.default.basename(file)}' at '${basePath}'`);
            continue;
        }
        if (typeof mod.default === "function" && !isRouter(mod.default)) {
            // allow default export to be a registrar like (app) => { app.get(...); }
            mod.default(app);
            console.log(`Registered routes via function from ${path_1.default.basename(file)}`);
            continue;
        }
        console.warn(`No router exported from ${path_1.default.basename(file)}`);
    }
}
function loadServices(baseDir) {
    const dir = path_1.default.join(baseDir, "services");
    for (const file of listScriptFiles(dir)) {
        const mod = safeRequire(file);
        if (!mod)
            continue;
        const candidate = mod.default;
        // If service exports a default initializer function, call it
        if (typeof candidate === "function") {
            try {
                candidate();
                console.log(`Initialized service from ${path_1.default.basename(file)}`);
            }
            catch (err) {
                console.error(`Service initializer failed for ${path_1.default.basename(file)}`, err);
            }
        }
        else {
            // merely requiring the module may run side-effects (e.g., schedulers)
            console.log(`Loaded service module ${path_1.default.basename(file)}`);
        }
    }
}
function inferBasePathFromFilename(file) {
    const name = path_1.default.basename(file).replace(/\.(ts|js)$/, "");
    return `/api/${name}`;
}
function loadControllers(app, baseDir) {
    const dir = path_1.default.join(baseDir, "controllers");
    const registry = {};
    for (const file of listScriptFiles(dir)) {
        const mod = safeRequire(file);
        if (!mod)
            continue;
        const moduleName = path_1.default.basename(file).replace(/\.(ts|js)$/, "");
        Object.entries(mod).forEach(([exportName, value]) => {
            if (typeof value === "function") {
                const key = `${moduleName}.${exportName}`;
                registry[key] = value;
            }
        });
    }
    app.locals.controllers = registry;
    const count = Object.keys(registry).length;
    console.log(`Loaded ${count} controller function(s)`);
}

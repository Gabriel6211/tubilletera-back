import fs from "fs";
import path from "path";
import express, { Application, Router } from "express";

type AnyModule = Record<string, unknown> & { default?: unknown };

function isRouter(value: unknown): value is Router {
  if (typeof value !== "function") return false;
  const v = value as Router & { handle?: unknown };
  // Express Router is callable and has use and handle methods
  return typeof v.use === "function" && typeof (v as any).handle === "function";
}

function isMiddleware(value: unknown): value is express.RequestHandler {
  return typeof value === "function" && (value as Function).length >= 2;
}

function safeRequire(modulePath: string): AnyModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modulePath);
    return mod as AnyModule;
  } catch (err) {
    console.error(`Failed to load module: ${modulePath}`, err);
    return null;
  }
}

function listScriptFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => {
      const full = path.join(dir, file);
      const isFile = fs.statSync(full).isFile();
      const isScript = /\.(ts|js)$/.test(file) && !/\.d\.ts$/.test(file);
      const isIndex = /^index\.(ts|js)$/.test(file);
      return isFile && isScript && !isIndex;
    })
    .map((file) => path.join(dir, file));
}

export function loadMiddlewares(app: Application, baseDir: string): void {
  const dir = path.join(baseDir, "middleware");
  for (const file of listScriptFiles(dir)) {
    const mod = safeRequire(file);
    if (!mod) continue;
    const candidate = (mod.default ?? mod.middleware) as unknown;
    if (isMiddleware(candidate)) {
      app.use(candidate);
      console.log(`Mounted middleware from ${path.basename(file)}`);
    } else if (typeof candidate === "function" && (candidate as Function).length === 1) {
      // allow register(app)
      (candidate as (app: Application) => void)(app);
      console.log(`Registered middleware via function from ${path.basename(file)}`);
    } else {
      console.warn(`No middleware exported from ${path.basename(file)}`);
    }
  }
}

export function loadRoutes(app: Application, baseDir: string): void {
  const dir = path.join(baseDir, "routes");
  for (const file of listScriptFiles(dir)) {
    const mod = safeRequire(file);
    if (!mod) continue;

    const explicitRouter = (mod.router ?? mod.default) as unknown;
    const basePath = (mod.basePath as string | undefined) ?? inferBasePathFromFilename(file);

    if (isRouter(explicitRouter)) {
      app.use(basePath, explicitRouter);
      console.log(`Mounted router '${path.basename(file)}' at '${basePath}'`);
      continue;
    }

    if (typeof mod.default === "function" && !isRouter(mod.default)) {
      // allow default export to be a registrar like (app) => { app.get(...); }
      (mod.default as (app: Application) => void)(app);
      console.log(`Registered routes via function from ${path.basename(file)}`);
      continue;
    }

    console.warn(`No router exported from ${path.basename(file)}`);
  }
}

export function loadServices(baseDir: string): void {
  const dir = path.join(baseDir, "services");
  for (const file of listScriptFiles(dir)) {
    const mod = safeRequire(file);
    if (!mod) continue;
    const candidate = mod.default as unknown;
    // If service exports a default initializer function, call it
    if (typeof candidate === "function") {
      try {
        (candidate as () => unknown)();
        console.log(`Initialized service from ${path.basename(file)}`);
      } catch (err) {
        console.error(`Service initializer failed for ${path.basename(file)}`, err);
      }
    } else {
      // merely requiring the module may run side-effects (e.g., schedulers)
      console.log(`Loaded service module ${path.basename(file)}`);
    }
  }
}

function inferBasePathFromFilename(file: string): string {
  const name = path.basename(file).replace(/\.(ts|js)$/, "");
  return `/api/${name}`;
}

// Controllers
export type ControllerFn = (...args: unknown[]) => unknown | Promise<unknown>;
export type ControllersRegistry = Record<string, ControllerFn>;

export function loadControllers(app: Application, baseDir: string): void {
  const dir = path.join(baseDir, "controllers");
  const registry: ControllersRegistry = {};

  for (const file of listScriptFiles(dir)) {
    const mod = safeRequire(file);
    if (!mod) continue;
    const moduleName = path.basename(file).replace(/\.(ts|js)$/, "");

    Object.entries(mod).forEach(([exportName, value]) => {
      if (typeof value === "function") {
        const key = `${moduleName}.${exportName}`;
        registry[key] = value as ControllerFn;
      }
    });
  }

  app.locals.controllers = registry;
  const count = Object.keys(registry).length;
  console.log(`Loaded ${count} controller function(s)`);
}



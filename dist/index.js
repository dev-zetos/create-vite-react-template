// src/index.ts
import cac from "cac";

// src/constants.ts
var VERSION = "1.0.0";
var CLI_NAME = "create-vite-react-template";
var OPTIONAL_MODULES = [
  {
    value: "i18n",
    label: "\u56FD\u9645\u5316 (i18n)",
    hint: "\u591A\u8BED\u8A00\u652F\u6301\uFF0C\u57FA\u4E8E i18next"
  },
  {
    value: "theme",
    label: "\u4E3B\u9898\u5207\u6362",
    hint: "\u6697\u9ED1/\u4EAE\u8272\u6A21\u5F0F\uFF0CCSS \u53D8\u91CF\u7CFB\u7EDF"
  },
  {
    value: "subscription",
    label: "\u8BA2\u9605\u6A21\u5757",
    hint: "Stripe \u652F\u4ED8\u96C6\u6210"
  }
];
var PACKAGE_MANAGERS = [
  { value: "pnpm", label: "pnpm\uFF08\u63A8\u8350\uFF09" },
  { value: "npm", label: "npm" },
  { value: "yarn", label: "yarn" }
];

// src/prompts.ts
import * as p from "@clack/prompts";
import pc from "picocolors";
async function runPrompts(defaultProjectName) {
  p.intro(`${pc.bgCyan(pc.black(` ${CLI_NAME} v${VERSION} `))}`);
  const options = await p.group(
    {
      // 项目名称
      projectName: () => p.text({
        message: "\u9879\u76EE\u540D\u79F0",
        placeholder: defaultProjectName || "my-app",
        defaultValue: defaultProjectName || "my-app",
        validate: (value) => {
          if (!value) return "\u8BF7\u8F93\u5165\u9879\u76EE\u540D\u79F0";
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return "\u9879\u76EE\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u8FDE\u5B57\u7B26\u548C\u4E0B\u5212\u7EBF";
          }
          return void 0;
        }
      }),
      // 可选模块
      modules: () => p.multiselect({
        message: "\u9009\u62E9\u9700\u8981\u7684\u529F\u80FD\u6A21\u5757\uFF08\u7A7A\u683C\u9009\u62E9\uFF0C\u56DE\u8F66\u786E\u8BA4\uFF09",
        options: OPTIONAL_MODULES.map((m) => ({
          value: m.value,
          label: m.label,
          hint: m.hint
        })),
        required: false
      }),
      // 包管理器
      packageManager: () => p.select({
        message: "\u5305\u7BA1\u7406\u5668",
        options: PACKAGE_MANAGERS.map((pm) => ({
          value: pm.value,
          label: pm.label
        })),
        initialValue: "pnpm"
      }),
      // 是否自动安装依赖
      installDeps: () => p.confirm({
        message: "\u662F\u5426\u81EA\u52A8\u5B89\u88C5\u4F9D\u8D56\uFF1F",
        initialValue: true
      })
    },
    {
      onCancel: () => {
        p.cancel("\u64CD\u4F5C\u5DF2\u53D6\u6D88");
        return process.exit(0);
      }
    }
  );
  return options;
}

// src/generator.ts
import path2 from "path";
import { exec } from "child_process";
import { promisify } from "util";
import fs2 from "fs-extra";
import * as p2 from "@clack/prompts";
import pc2 from "picocolors";

// src/utils.ts
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function getTemplatesDir() {
  return path.resolve(__dirname, "..", "templates");
}
async function isDirEmpty(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.length === 0;
  } catch {
    return true;
  }
}
async function copyDir(src, dest, options) {
  await fs.copy(src, dest, {
    overwrite: true,
    filter: options?.filter
  });
}
async function renderTemplate(templatePath, destPath, variables) {
  let content = await fs.readFile(templatePath, "utf-8");
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    content = content.replace(regex, value);
  }
  const finalPath = destPath.replace(/\.hbs$/, "");
  await fs.writeFile(finalPath, content, "utf-8");
}
async function mergePackageJson(basePath, moduleDepsPath) {
  const basePkg = await fs.readJson(basePath);
  const moduleDeps = await fs.readJson(moduleDepsPath);
  if (moduleDeps.dependencies) {
    basePkg.dependencies = {
      ...basePkg.dependencies,
      ...moduleDeps.dependencies
    };
  }
  if (moduleDeps.devDependencies) {
    basePkg.devDependencies = {
      ...basePkg.devDependencies,
      ...moduleDeps.devDependencies
    };
  }
  await fs.writeJson(basePath, basePkg, { spaces: 2 });
}
function getInstallCommand(pm) {
  switch (pm) {
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn";
    case "npm":
    default:
      return "npm install";
  }
}
function getRunCommand(pm) {
  switch (pm) {
    case "pnpm":
      return "pnpm dev";
    case "yarn":
      return "yarn dev";
    case "npm":
    default:
      return "npm run dev";
  }
}

// src/generator.ts
var execAsync = promisify(exec);
async function generateProject(options) {
  const { projectName, modules, packageManager, installDeps } = options;
  const targetDir = path2.resolve(process.cwd(), projectName);
  const templatesDir = getTemplatesDir();
  const baseTemplateDir = path2.join(templatesDir, "base");
  const modulesDir = path2.join(templatesDir, "modules");
  if (await fs2.pathExists(targetDir)) {
    const isEmpty = await isDirEmpty(targetDir);
    if (!isEmpty) {
      const shouldOverwrite = await p2.confirm({
        message: `\u76EE\u5F55 ${pc2.cyan(projectName)} \u5DF2\u5B58\u5728\u4E14\u975E\u7A7A\uFF0C\u662F\u5426\u8986\u76D6\uFF1F`,
        initialValue: false
      });
      if (!shouldOverwrite || p2.isCancel(shouldOverwrite)) {
        p2.cancel("\u64CD\u4F5C\u5DF2\u53D6\u6D88");
        process.exit(0);
      }
      await fs2.emptyDir(targetDir);
    }
  }
  await fs2.ensureDir(targetDir);
  const spinner2 = p2.spinner();
  spinner2.start("\u6B63\u5728\u521B\u5EFA\u9879\u76EE...");
  try {
    await copyDir(baseTemplateDir, targetDir, {
      filter: (src) => !src.endsWith(".hbs")
    });
    const hbsFiles = await findHbsFiles(baseTemplateDir);
    for (const hbsFile of hbsFiles) {
      const relativePath = path2.relative(baseTemplateDir, hbsFile);
      const destPath = path2.join(targetDir, relativePath);
      await fs2.ensureDir(path2.dirname(destPath));
      await renderTemplate(hbsFile, destPath, {
        projectName
      });
    }
    spinner2.stop("\u9879\u76EE\u7ED3\u6784\u521B\u5EFA\u5B8C\u6210");
  } catch (error) {
    spinner2.stop("\u9879\u76EE\u521B\u5EFA\u5931\u8D25");
    throw error;
  }
  if (modules.length > 0) {
    spinner2.start("\u6B63\u5728\u96C6\u6210\u9009\u4E2D\u7684\u6A21\u5757...");
    try {
      for (const moduleName of modules) {
        await integrateModule(moduleName, modulesDir, targetDir);
      }
      spinner2.stop(`\u5DF2\u96C6\u6210 ${modules.length} \u4E2A\u6A21\u5757`);
    } catch (error) {
      spinner2.stop("\u6A21\u5757\u96C6\u6210\u5931\u8D25");
      throw error;
    }
  }
  if (installDeps) {
    spinner2.start("\u6B63\u5728\u5B89\u88C5\u4F9D\u8D56...");
    try {
      const installCmd = getInstallCommand(packageManager);
      await execAsync(installCmd, { cwd: targetDir });
      spinner2.stop("\u4F9D\u8D56\u5B89\u88C5\u5B8C\u6210");
    } catch (error) {
      spinner2.stop("\u4F9D\u8D56\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u5B89\u88C5");
      console.error(pc2.yellow(`\u8BF7\u8FDB\u5165\u9879\u76EE\u76EE\u5F55\u540E\u8FD0\u884C: ${getInstallCommand(packageManager)}`));
    }
  }
  const runCmd = getRunCommand(packageManager);
  p2.note(
    `${pc2.cyan("cd")} ${projectName}
${pc2.cyan(runCmd)}`,
    "\u4E0B\u4E00\u6B65"
  );
  p2.outro(`\u{1F389} ${pc2.green("\u9879\u76EE\u521B\u5EFA\u6210\u529F\uFF01")}`);
  if (modules.length > 0) {
    console.log();
    console.log(pc2.dim("\u5DF2\u96C6\u6210\u7684\u6A21\u5757:"));
    modules.forEach((m) => {
      console.log(pc2.dim(`  - ${m}`));
    });
  }
}
async function findHbsFiles(dir) {
  const files = [];
  async function walk(currentDir) {
    const entries = await fs2.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path2.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".hbs")) {
        files.push(fullPath);
      }
    }
  }
  await walk(dir);
  return files;
}
async function integrateModule(moduleName, modulesDir, targetDir) {
  const moduleDir = path2.join(modulesDir, moduleName);
  if (!await fs2.pathExists(moduleDir)) {
    console.warn(pc2.yellow(`\u8B66\u544A: \u6A21\u5757 ${moduleName} \u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7`));
    return;
  }
  const moduleSrcDir = path2.join(moduleDir, "src");
  if (await fs2.pathExists(moduleSrcDir)) {
    await copyDir(moduleSrcDir, path2.join(targetDir, "src"));
  }
  const depsFile = path2.join(moduleDir, "dependencies.json");
  const targetPkgFile = path2.join(targetDir, "package.json");
  if (await fs2.pathExists(depsFile)) {
    await mergePackageJson(targetPkgFile, depsFile);
  }
}

// src/index.ts
var cli = cac(CLI_NAME);
cli.command("[project-name]", "\u521B\u5EFA\u65B0\u9879\u76EE").option("--force", "\u5F3A\u5236\u8986\u76D6\u5DF2\u5B58\u5728\u7684\u76EE\u5F55").action(async (projectName) => {
  try {
    const options = await runPrompts(projectName);
    if (!options) {
      process.exit(1);
    }
    await generateProject(options);
  } catch (error) {
    console.error("\u9519\u8BEF:", error);
    process.exit(1);
  }
});
cli.help();
cli.version(VERSION);
cli.parse();

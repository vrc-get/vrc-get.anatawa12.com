const Handlebars = require("handlebars");
const minimatch = require("minimatch");
const { exit, env } = require("process");
const i18next = require("i18next");
const parse5 = require("parse5");
const chalk = require("chalk");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

const file_releases = 'tmp/releases.json';
const file_contributors = 'tmp/contributors.json';

class Release {
  name = '';
  displayName = '';
  downloads = [];
  isGui = false;
}

// Configuration
const config = {
  localesDir: "./locales",
  templatesDir: "./public",
  componentsDir: "./components",
  outputDir: "./dist",
  excludePatterns: ["**/*.html", "**/*.hbs"],
  defaultLanguage: "en",
  safeTags: ["b", "i", "br", "code"],
  safeAttributes: [],
};

// Logger function
const log = (message, type = "info") => {
  const prefix =
    {
      info: chalk.blue("INFO"),
      warn: chalk.yellow("WARN"),
      error: chalk.red("ERROR"),
    }[type] || chalk.gray("LOG");

  console.log(`[${prefix}] ${message}`);
};

function doesTmpFileNeedUpdate(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return true;
    const stats = fs.statSync(filePath);
    const now = new Date();
    const fileTime = new Date(stats.mtime);
    const differenceInMinutes = (now.getTime() - fileTime.getTime()) / (1000 * 60);
    return differenceInMinutes > 30;
  } catch (err) {
    console.error('Error checking file age:', err);
    return false;
  }
}

async function updateGitHubData() {
  let options = { headers: {} };
  if (process.env.GITHUB_TOKEN !== undefined) {
    options.headers.Authorization = `Bearer: ${process.env.GITHUB_TOKEN}`;
  }

  if (doesTmpFileNeedUpdate(file_releases)) {
    console.log('Updating releases...');
    let releases = [];
    let page = 1;
    while (true) {
      const response = await fetch(`https://api.github.com/repos/vrc-get/vrc-get/releases?per_page=100&page=${page}`, options);
      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}: ${await response.text()}`);
      }
      const json = await response.json();
      releases = releases.concat(json);
      if (json.length != 100) break;
      page = page + 1;
    }

    releases = releases.sort((a, b) => b.id - a.id);
    let items = [];
    releases.forEach(r => {
      const release = new Release();
      release.name = r.tag_name;
      release.isGui = r.tag_name.startsWith('gui-');
      release.displayName = r.tag_name.substring(release.isGui ? 5 : 1);
      release.downloads = [];
      r.assets.forEach(a => {
        if ( ! release.isGui && a.name.endsWith('.d')) return;
        release.downloads.push({
          name: a.name,
          link: a.browser_download_url,
          sie: a.size,
        });
      });
      // items[`${r.id}`] = release;
      items.push(release);
    });

    fs.writeFileSync(file_releases, JSON.stringify(items));
  }

  if (doesTmpFileNeedUpdate(file_contributors)) {
    console.log('Updating contributors...');
    const response = await fetch(`https://api.github.com/repos/vrc-get/vrc-get/contributors`, options);
    let contributors = await response.json();
    contributors = contributors.sort((a, b) => b.contributions - a.contributions);
    fs.writeFileSync(file_contributors, JSON.stringify(contributors));
  }
}

// Build function
async function build() {
  await updateGitHubData();

  try {
    log("Starting build...");

    // Load locales (using async/await for i18next.init)
    const locales = fs
      .readdirSync(config.localesDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""))
      .sort();

    const resources = {};
    locales.forEach((locale) => {
      resources[locale] = {
        translation: require(
          "./" + path.join(config.localesDir, `${locale}.json`),
        ),
      };
    });
    log(locales);
    await i18next.init({
      lng: config.defaultLanguage,
      resources,
    });

    // Register the not helper
    Handlebars.registerHelper('not', function(value) {
      return !value;
    });

    // Register the safe-html helper
    Handlebars.registerHelper("safe", function (key) {
      const translatedString = i18next.t(key);

      // Recursive sanitization function
      function sanitize(node) {
        if (node.type === "tag") {
          if (!config.safeTags.includes(node.name.toLowerCase())) {
            return "";
          }

          // Sanitize attributes
          node.attribs = Object.keys(node.attribs).reduce((acc, attr) => {
            if (config.safeAttributes.includes(attr.toLowerCase())) {
              acc[attr] = node.attribs[attr];
            }
            return acc;
          }, {});
        }
        if (node.children) {
          node.children = node.children.map(sanitize).filter(Boolean);
        }
        return node;
      }

      // Parse, sanitize, and serialize
      const doc = parse5.parseFragment(translatedString);
      const sanitized = parse5.serialize(sanitize(doc));

      return new Handlebars.SafeString(sanitized);
    });

    // Register the contains helper
    Handlebars.registerHelper("contains", function (arrayStr, value, options) {
      const array = (arrayStr ?? "").split(",").map((s) => s.trim());
      if (array && array.indexOf(value) !== -1) {
        return true;
      } else {
        return false;
      }
    });

    // Register components
    const componentFiles = fs
      .readdirSync(config.componentsDir)
      .filter((file) => file.endsWith(".hbs"))
      .map((file) => file.replace(".hbs", ""));
    componentFiles.forEach((componentFile) => {
      const raw = fs.readFileSync(
        path.join(config.componentsDir, componentFile + ".hbs"),
        "utf-8",
      );
      Handlebars.registerPartial(componentFile, raw);
    });

    // Remove previous instance of the output directory
    if (fs.existsSync(config.outputDir))
      fs.rmSync(config.outputDir, { recursive: true, force: true });

    // Find & copy non-HTML files (excluding patterns)
    const nonHtmlFiles = glob
      .sync(path.join(config.templatesDir, "**/*"), { nodir: true })
      .filter(
        (file) =>
          !config.excludePatterns.some((pattern) => {
            const regex = new RegExp(pattern.replace(/\*\*/g, ".*"));
            return regex.test(file);
          }),
      );

    nonHtmlFiles.forEach((file) => {
      const relativePath = path.relative(config.templatesDir, file);
      const outputPath = path.join(config.outputDir, relativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.copyFileSync(file, outputPath);
      log(`Copied: ${relativePath}`);
    });

    // Update the locales
    let localesList = {};
    for (const locale of locales) {
      const resources = i18next.getResourceBundle(locale, "translation");
      localesList[resources.locale.code] = resources.locale;
    }
    const outputPath = path.join(config.outputDir, "resources", "locales");
    fs.mkdirSync(outputPath, { recursive: true });
    for (const locale of locales) {
      const resources = i18next.getResourceBundle(locale, "translation");
      resources.__locales = localesList;
      const raw = JSON.stringify(resources, null, "\t");
      fs.writeFileSync(path.join(outputPath, locale + ".json"), raw);
    }

    // Find HTML templates & generate localized pages
    const templateFiles = glob
      .sync(path.join(config.templatesDir, "**/*.{html,hbs}"))
      .filter((filePath) => !path.basename(filePath).startsWith("_"));
    const contributors = JSON.parse(fs.readFileSync(file_contributors));
    const releases = JSON.parse(fs.readFileSync(file_releases));

    for (const templateFile of templateFiles) {
      const template = Handlebars.compile(
        fs.readFileSync(templateFile, "utf8"),
      );

      for (const locale of locales) {
        const resources = i18next.getResourceBundle(locale, "translation");
        resources.__releases = releases;
        resources.__contributors = contributors;
        const htmlContent = template(resources);

        const relativePath = path.relative(config.templatesDir, templateFile);
        let outputPath = path.join(config.outputDir, locale, relativePath);
        if (outputPath.endsWith(".hbs")) {
          outputPath = outputPath.replace(/\.hbs$/, ".html");
        }
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, htmlContent);
        if (locale === config.defaultLanguage) {
          outputPath = path.join(config.outputDir, relativePath);
          if (outputPath.endsWith(".hbs")) {
            outputPath = outputPath.replace(/\.hbs$/, ".html");
          }
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, htmlContent);
        }
        log(`Built: ${outputPath} (locale: ${locale})`);
      }
    }

    log("Build complete!", "success");
  } catch (error) {
    log(`Build failed: ${error.message}`, "error");
    console.error(chalk.red(error.stack));
    exit(1);
  }
}

build();

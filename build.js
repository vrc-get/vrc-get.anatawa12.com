const Handlebars = require('handlebars');
const minimatch = require('minimatch');
const i18next = require('i18next');
const chalk = require('chalk');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

// Configuration
const config = {
  localesDir: './src/locales',
  templatesDir: './src',
  outputDir: './dist',
  excludePatterns: ['**/*.html'],
  defaultLanguage: 'en'
};

// Logger function
const log = (message, type = 'info') => {
  const prefix = {
    info: chalk.blue('INFO'),
    warn: chalk.yellow('WARN'),
    error: chalk.red('ERROR')
  }[type] || chalk.gray('LOG');

  console.log(`[${prefix}] ${message}`);
};

// Build function
async function build() {
  try {
    log('Starting build...');

    // Load locales (using async/await for i18next.init)
    const locales = fs.readdirSync(config.localesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
      
    const resources = {};
    locales.forEach(locale => {
        resources[locale] = {
            translation: require('./' + path.join(config.localesDir, `${locale}.json`))
        };
    });
    log(locales);
    await i18next.init({
        lng: config.defaultLanguage,
        resources,
      });

    // Register the link localizer
    Handlebars.registerHelper('localizeLink', function(link) {
        const resources = this; // Access current context's data
        const currentLocale = resources.locale.code; // Get locale code directly
        return '/' + path.join(currentLocale, link);
      });

    // Find & copy non-HTML files (excluding patterns)
    const nonHtmlFiles = glob.sync(path.join(config.templatesDir, '**/*'), { nodir: true })
      .filter(file => !config.excludePatterns.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*'));
          return regex.test(file);
      }));

    nonHtmlFiles.forEach(file => {
      const relativePath = path.relative(config.templatesDir, file);
      const outputPath = path.join(config.outputDir, relativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.copyFileSync(file, outputPath);
      log(`Copied: ${relativePath}`);
    });

    // Find HTML templates & generate localized pages
    const templateFiles = glob.sync(path.join(config.templatesDir, '**/*.html'));

    for (const templateFile of templateFiles) {
      const template = Handlebars.compile(fs.readFileSync(templateFile, 'utf8'));
      
      for (const locale of locales) {
        const resources = i18next.getResourceBundle(locale, 'translation');
        const htmlContent = template(resources);

        const relativePath = path.relative(config.templatesDir, templateFile);
        let outputPath = path.join(config.outputDir, locale, relativePath);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, htmlContent);
        if (locale === config.defaultLanguage) {
            let outputPath = path.join(config.outputDir, relativePath);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, htmlContent);
        }
        log(`Built: ${outputPath} (locale: ${locale})`);
      }
    }

    log('Build complete!', 'success');
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    console.error(chalk.red(error.stack));
    exit(1);
  }
}

build(); // Execute the build function

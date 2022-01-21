'use strict';
const Package = require('dgeni').Package,
  jsdocPackage = require('dgeni-packages/jsdoc'),
  nunjucksPackage = require('dgeni-packages/nunjucks'),
  typescriptPackage = require('dgeni-packages/typescript'),
  linksPackage = require('dgeni-packages/links'),
  path = require('path'),
  config = require('../config.json');

module.exports = (currentVersion) => {
  return (
    new Package('ionic-native-readmes', [jsdocPackage, nunjucksPackage, typescriptPackage, linksPackage])

      .processor(require('./processors/readmes'))
      .processor(require('./processors/remove-private-members'))
      .processor(require('./processors/hide-private-api'))
      .processor(require('./processors/npm-id'))

      .config(require('./configs/log'))
      .config(require('./configs/template-filters'))
      .config(require('./configs/template-tags'))
      .config(require('./configs/tag-defs'))
      .config(require('./configs/links'))

      .config(function (renderDocsProcessor, computePathsProcessor) {
        currentVersion = {
          href: '/' + config.v2DocsDir.replace('content/', ''),
          folder: '',
          name: currentVersion,
        };

        renderDocsProcessor.extraData.version = {
          list: [currentVersion],
          current: currentVersion,
          latest: currentVersion,
        };

        computePathsProcessor.pathTemplates = [
          {
            docTypes: ['class'],
            getOutputPath: (doc) =>
              doc.originalModule.replace(config.pluginDir + '/', '').replace(/\/index$/, '/README.md'),
          },
        ];
      })

      //configure file reading
      .config(function (readFilesProcessor, readTypeScriptModules) {
        // Don't run unwanted processors since we are not using the normal file reading processor
        readFilesProcessor.$enabled = false;
        readFilesProcessor.basePath = path.resolve(__dirname, '../../..');

        readTypeScriptModules.basePath = path.resolve(path.resolve(__dirname, '../../..'));
        readTypeScriptModules.sourceFiles = ['./src/@awesome-cordova-plugins/plugins/**/*.ts'];
      })

      // Configure file writing
      .config(function (writeFilesProcessor) {
        writeFilesProcessor.outputFolder = './dist/@awesome-cordova-plugins/';
      })

      .config(function (writeFilesProcessor) {
        writeFilesProcessor.outputFolder = './docs/';
      })

      // Configure rendering
      .config(function (templateFinder) {
        templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

        // Specify how to match docs to templates.
        templateFinder.templatePatterns = ['${ doc.template }', '${ doc.docType }.template.md', 'readme.template.md'];
      })
  );
};

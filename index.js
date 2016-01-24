'use strict';

var fs = require('fs'),
    path = require('path');

var grayMatter = require('gray-matter'),
    gUtil = require('gulp-util'),
    jade = require('jade'),
    marked = require('marked'),
    merge = require('merge'),
    highlightjs = require('highlight.js'),
    slug = require('slug'),
    through = require('through2');

var chalk = gUtil.colors,
    log = gUtil.log,
    logFlag = chalk.gray('[') + chalk.magenta('SSG') + chalk.gray(']'),
    PluginError = gUtil.PluginError;

/**
 * static site generator gulp plugin
 * @param  {options} options custom options (see readme)
 * @return {object}          destroyable transform object
 */
function staticSiteGenerator(options) {

  var buffer = {},
      layoutCache = {},
      templateCache = {},
      markedRenderer = new marked.Renderer();

  options = merge.recursive({
    basePath: '/',
    data: {},
    defaultLayout: false,
    jade: jade,
    jadeOptions: {
      basedir: path.join(process.cwd(), 'src')
    },
    layoutPath: 'layouts',
    marked: marked,
    markedOptions: {
      renderer: markedRenderer
    },
    passThrough: true,
    prettyUrls: true,
    regexpHtml: /\.html$/i,
    regexpMarkdown: /\.(md|markdown)$/i,
    regexpTemplate: /\.jade$/i,
    renderCode: renderCode,
    renderTemplate: renderTemplate,
    renderMarkdown: renderMarkdown,
    slugify: true,
    slugOptions: {
      mode: 'rfc3986',
      remove: /^\./g
    }
  }, options || {});

  options.markedOptions.renderer.code = options.renderCode;
  options.marked.setOptions(options.markedOptions);
  options.jade.filters.markdown = options.renderMarkdown;

  return through.obj(transformChunk);

  /**
   * transforms a stream chunk
   * @param  {object}   chunk    chunk object
   * @param  {string}   encoding file encoding
   * @param  {Function} done     callback
   * @return {undefined}
   */
  function transformChunk(chunk, encoding, done) {
    if (chunk.isNull()) return done();
    if (chunk.isStream()) return this.emit('error', new PluginError(logFlag, 'Streaming not supported'));
    if (
      !(chunk.isMarkdown = options.regexpMarkdown.test(chunk.relative)) &&
      !(chunk.isTemplate = options.regexpTemplate.test(chunk.relative)) &&
      !(chunk.isHtml = options.regexpHtml.test(chunk.relative))
    ) {
      return options.passThrough ? done(null, chunk) : done();
    }
    transformChunkData(chunk);
    if (chunk.data.draft && process.env.NODE_ENV !== 'development') return done();
    if (buffer.hasOwnProperty(chunk.relative)) {
      logDuplicate(chunk);
      return done();
    }
    transformChunkContents.call(this, chunk);
    buffer[chunk.relative] = chunk;
    done(null, chunk);
  }

  /**
   * merge site data, options data, frontmatter data into chunk data
   * @param  {object} chunk stream chunk object
   * @return {object}       chunk with transformed data
   */
  function transformChunkData(chunk) {
    var matter = grayMatter(String(chunk.contents)),
        relPath = chunk.hasOwnProperty('data') && chunk.data.relativePath ?
          chunk.data.relativePath : getRelativePath(chunk.relative),
        absPath = path.normalize(path.join(options.basePath, relPath));
    chunk.data = merge.recursive({},
      options.data || {},
      {
        basePath: options.basePath,
        relativePath: relPath,
        path: absPath,
        urlPath: options.prettyUrls ? path.dirname(absPath) + '/' : absPath,
        srcBasePath: chunk.base,
        srcRelativePath: chunk.relative,
        srcPath: chunk.path,
        contents: '',
        draft: false,
        layout: options.defaultLayout
      },
      chunk.data || {},
      matter.data || {}
    );
    chunk.contents = new Buffer(matter.content);
    chunk.path = path.join(chunk.base, relPath);
    return chunk;
  }

  /**
   * render chunk contents with markdown renderer, wrap layout, render template
   * @param  {object} chunk stream chunk object
   * @return {object}       chunk with transformed contents
   */
  function transformChunkContents(chunk) {
    var contents = String(chunk.contents);
    try {
      if (chunk.isMarkdown) {
        contents = options.renderMarkdown(contents);
      }
      if (chunk.isTemplate) {
        contents = options.renderTemplate(contents, chunk.data, chunk.data.srcPath);
      }
      chunk.contents = new Buffer(contents);
      if (chunk.data.layout) applyLayout(chunk);
    } catch (err) {
      this.emit('error', new PluginError(logFlag, err.stack || err));
    }
    return chunk;
  }

  /**
   * render a template string with optional data
   * @param  {string} contents template
   * @param  {object} data     optional template data
   * @param  {object} filename optional template path for importing/mergeing
   * @return {string}          rendered template
   */
  function renderTemplate(contents, data, filename) {
    if (!templateCache.hasOwnProperty(contents)) {
      var jadeOptions = merge.recursive({}, options.jadeOptions, {filename: filename});
      templateCache[contents] = options.jade.compile(contents, jadeOptions);
    }
    var locals = merge.recursive({}, data, {locals: locals});
    return templateCache[contents](data);
  }

  /**
   * render a markdown string to html
   * @param  {string} contents markdown
   * @return {string}          html
   */
  function renderMarkdown(contents) {
    return options.marked(contents).trim();
  }

  /**
   * render string of code to highlighted code html structure
   * @param {string}  code source code string
   * @param {string}  lang source code language string
   * @return {string}      html
   */
  function renderCode(code, lang) {
    lang = typeof lang === 'string' && highlightjs.getLanguage(lang) ? lang : false;
    code = lang ? highlightjs.highlight(lang, code).value : highlightjs.highlightAuto(code).value;
    return '<pre><code class="hljs' + (lang ? ' ' + lang : '') + '">' + code + '</code></pre>';
  }

  /**
   * set chunk contents as template data property and render it with a layout
   * @param  {object} chunk stream chunk object
   * @return {object}       chunk with applied layout
   */
  function applyLayout(chunk) {
    chunk.data.contents = String(chunk.contents);
    var layout = getLayout(chunk.data.layout),
        contents = options.renderTemplate(layout.contents, chunk.data, layout.path);
    chunk.contents = new Buffer(contents);
    return chunk;
  }

  /**
   * transform a src file path into an relative url path
   * @param  {string} filePath file path
   * @return {string}          url
   */
  function getRelativePath(filePath) {
    var urlPath = path.join(
      path.dirname(filePath),
      path.basename(filePath, path.extname(filePath))
    );
    if (options.slugify) {
      urlPath = urlPath.split('/').map(function(part) {
        return slug(part, options.slug);
      }).join('/');
    }
    urlPath += !options.prettyUrls || (/(^|\/)index$/i).test(urlPath) ?
      '.html' : '/index.html';
    return urlPath;
  }

  /**
   * read a layout file from given path; store it in cache object for further
   * usage; return object with layout contents and absolute path
   * @param  {string}   layout path to layout
   * @return {object}          layout contents and path
   */
  function getLayout(layout) {
    if (!layoutCache.hasOwnProperty(layout) || !layoutCache[layout]) {
      var layoutPath = path.join(
        path.isAbsolute(options.layoutPath) ?
          options.layoutPath : path.join(process.cwd(), options.layoutPath),
        layout
      );
      layoutCache[layout] = {
        contents: fs.readFileSync(layoutPath, 'utf8'),
        path: layoutPath
      };
    }
    return layoutCache[layout];
  }

  /**
   * log possible output overwrite to console
   * @param  {object} chunk stream chunk object
   * @return {undefined}
   */
  function logDuplicate(chunk) {
    log(logFlag,
      chalk.red('WARNING: ') +
      chalk.yellow(chunk.data.relativeFilename) +
      ' outputs to same url as ' +
      chalk.yellow(buffer[chunk.relative].data.relativeFilename) +
      '. ' + chalk.red('Skipping...')
    );
  }

}

module.exports = staticSiteGenerator;

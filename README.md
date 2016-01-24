gulp-static-site-generator
==========================

  > A static site generator for gulp.

[![npm Package Version](https://img.shields.io/npm/v/gulp-static-site-generator.svg?style=flat-square)](https://www.npmjs.com/package/gulp-static-site-generator)
[![MIT License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://simbo.mit-license.org)

[![Travis Build Status](https://img.shields.io/travis/simbo/gulp-static-site-generator/master.svg?style=flat-square)](https://travis-ci.org/simbo/gulp-static-site-generator)
[![Code Climate Test Coverage](https://img.shields.io/codeclimate/coverage/github/simbo/gulp-static-site-generator.svg?style=flat-square)](https://codeclimate.com/github/simbo/gulp-static-site-generator)

[![Dependencies Status](https://img.shields.io/david/simbo/gulp-static-site-generator.svg?style=flat-square)](https://david-dm.org/simbo/gulp-static-site-generator)
[![devDependencies Status](https://img.shields.io/david/dev/simbo/gulp-static-site-generator.svg?style=flat-square)](https://david-dm.org/simbo/gulp-static-site-generator#info=devDependencies)

---

<!-- MarkdownTOC -->

- [About](#about)
  - [Features](#features)
  - [Demo](#demo)
- [Setup and usage](#setup-and-usage)
- [Options](#options)
  - [Defaults overview](#defaults-overview)
  - [Options properties](#options-properties)
- [Template Data](#template-data)
  - [Basic site structure data](#basic-site-structure-data)
- [License](#license)

<!-- /MarkdownTOC -->

---


## About


### Features

  - render templates to html
    (customizable template engine, defaults to [jade](https://github.com/pugjs/jade))
  - render markdown to html and wrap it in a layout template
    (customizable markdown engine, defaults to [marked](https://github.com/chjj/marked))
  - extract frontmatter data from all markdown, template and html files
    (using [gray-matter](https://github.com/jonschlinkert/gray-matter))
  - recursively merge `options.data`,
    *[basic site structure data](#basic-site-structure-data)*,
    stream data and frontmatter data and use it as template variables
  - sanitize file and folder names and create seo-friendly/pretty urls
    (using [slug](https://github.com/dodo/node-slug))
  - pass-through all files that are not markdown, templates or html
  - transform drafts only in development environment
  - customizable options and behavior


### Demo

You can find an example implementation in 
[./demo](https://github.com/simbo/gulp-static-site-generator/tree/master/demo)
within this plugin's repository.


## Setup and usage

Install `gulp-static-site-generator` using [npm](https://www.npmjs.com/).

This module is a [gulp](https://github.com/gulpjs/gulp) plugin.
You can use it in your `gulpfile.js`:

``` js
var gulp = require('gulp'),
    ssg = require('gulp-static-site-generator');

var options = {
  // your custom options
};

gulp.task('ssg', function() {
  return gulp.src('./src/site/**/*')
    .pipe(ssg(options))
    .pipe(gulp.dest('./dest'));
});
```


## Options


### Defaults overview

``` js
{
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
    renderer: renderer
  },
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
  },

}
```


### Options properties


#### basePath

Type: *String*

Default: `'/'`

The base path to generate URL paths. Note that this is only for URL path 
generating and should not contain protocol or domain.


#### data

Type: *Object*

Default: `{}`

Global template data. See also readme section about [template data](#template-data).


#### defaultLayout

Type: *String*

Default: `false`

Path to default layout, relative to `options.layoutPath`. Will be used for 
template data's `layout` property, which can be overridden using frontmatter.
See also readme section about [template data](#template-data).


#### jade

Type: *Object*

Default: `require('jade')` (included dependency)

*jade* module. You can set your own required *jade*, i.e. to use a specific 
version or applying custom filters.


#### jadeOptions

Type: *Object*

Default:
``` js
{
  basedir: path.join(process.cwd(), 'src')
}
```

[Options](http://jade-lang.com/api/) passed to `options.jade.compile`.


#### layoutPath

Type: *String*

Default: `'layouts'`

Path to layouts, relative to `process.cwd()` or absolute.


#### marked

Type: *Function*

Default: `require('marked')`

*marked* module. You can set your own required marked to use a specific version.


#### markedOptions

Type: *Object*

Default: 
``` js
{
  renderer: renderer // marked renderer with customized code highlighting
}
```

[Options](https://github.com/chjj/marked#options-1) passed to `options.marked.setOptions`.


#### passThrough

Type: *Boolean*

Default: `true`

If set to `true`, all files, which are not recognized as markdown, templates or 
HTML, will be passed-through untransformed.


#### prettyUrls

Type: *Boolean*

Default: `true`

If set to `true`, all URL paths will be transformed to seo-friendly or so called
"pretty" URLs (for example, `/foo.html` will be transformed to 
`/foo/index.html`).

If a file would generate an URL path, that is already owned by another file in 
buffer, output of this file is skipped and a warning is displayed in console log.


#### regexpHtml

Type: *RegExp*

Default: `/\.html$/i`

A regular expression to recognize a file as HTML by testing its relative file path.


#### regexpMarkdown

Type: *RegExp*

Default: `/\.(md|markdown))$/i`

A regular expression to recognize a file as Markdown by testing its relative file path.


#### regexpTemplate

Type: *RegExp*

Default: `/\.jade$/i`

A regular expression to recognize a file as Template by testing its relative file path.


#### renderCode

Type: *Function*

Default: `renderCode` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))

A function to render and highlight the string contents of a markdown sourcecode 
block. The default function uses [highlight.js](https://github.com/isagalaev/highlight.js)
for syntax highlighting. It accepts the two string parameters `code` and `lang` 
and should return a string containing HTML. 

The function is used as code renderer for the *marked* renderer referenced at 
`options.markedOptions.renderer`.


#### renderTemplate

Type: *Function*

Default: `renderTemplate` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))

A function to render a template string to HTML, using *jade* by default. It 
accepts three parameters: a template `contents` string to render, an optional 
object with template `data` and an optional absolute `filepath` string to 
correctly include or extend other template files. It should return a string 
containing HTML.

When setting a custom template rendering function, the options `jade` and 
`jadeOptions` won't have any effect.


#### renderMarkdown

Type: *Function*

Default: `renderMarkdown` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))

A function to render markdown to HTML, using *marked* by default. It accepts a 
markdown `contents` string as the only argument and should return a string 
containing HTML.

Beside being used to render markdown files, this function is also referenced as 
`options.jade.filters.markdown` to render markdown blocks or includes in *jade* 
templates.

When setting a custom markdown rendering function, the options `marked`, 
`markedOptions` and `renderCode` won't have any effect.


#### slugify

Type: *Boolean*

Default: `true`

If set to `true`, folder and file names within the generated URL path of a file
will be sanitized by *slug*.


#### slugOptions

Type: *Object*

Default:
``` js
{
  mode: 'rfc3986',
  remove: /^\./g
}
```

[Options](https://github.com/dodo/node-slug#options) passed to *slug*.


## Template Data

Template data will be passed to `options.renderTemplate` to set template
variables when rendering.

The template data for a file results from an recursive merge of `options.data`,
*basic site structure data*, the respective file stream's `data` property and 
the data extracted from the file's frontmatter using *gray-matter*.

### Basic site structure data

The *basic site structure data* for each file is automatically generated during
transformation and can be overridden by applying data to the respective stream 
or setting frontmatter in the file contents. 

By overriding `data.relativePath`, you can manipulate the files output URL path,
which would otherwise be generated from the source file's relative path.

Assuming the source file `foo.jade` was globbed with `gulp.src('./src/site/**.*')`
with `/bar` as current working directory, the *basic site structure data* of 
this file using default options without overrides would look like this:

``` js
{
  basePath: '/',                      // url base path from options.basePath
  relativePath: 'foo/index.html',     // relative url path from base path
  path: '/foo/index.html',            // full url path to file
  urlPath: '/foo/',                   // prettified URL path (depending on `options.prettyUrls`)
  srcBasePath: '/bar/src/site/',      // absolute path to source base dir
  srcRelativePath: 'foo.jade',        // relative path to source file from source base dir
  srcPath: '/bar/src/site/foo.jade',  // absolute path to source file
  contents: '',                       // contents to use in a layout template
  draft: false,                       // is this a draft?
  layout: 'base.jade'                 // path to layout template, relative to `options.layoutPath`
}
```


## License

[MIT &copy; 2016 Simon Lepel](http://simbo.mit-license.org/)

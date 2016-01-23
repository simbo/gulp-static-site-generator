gulp-static-site-generator
==========================

  > A static site generator for gulp.

**WORK IN PROGRESS**

[![npm Package Version](https://img.shields.io/npm/v/gulp-static-site-generator.svg?style=flat-square)](https://www.npmjs.com/package/gulp-static-site-generator)
[![MIT License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://simbo.mit-license.org)

[![Dependencies Status](https://img.shields.io/david/simbo/gulp-static-site-generator.svg?style=flat-square)](https://david-dm.org/simbo/gulp-static-site-generator)
[![devDependencies Status](https://img.shields.io/david/dev/simbo/gulp-static-site-generator.svg?style=flat-square)](https://david-dm.org/simbo/gulp-static-site-generator#info=devDependencies)

<!-- MarkdownTOC -->

- [About](#about)
  - [Features](#features)
- [Setup and usage](#setup-and-usage)
- [Options](#options)
  - [Defaults overview](#defaults-overview)
  - [Options properties](#options-properties)
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
  - sanitize file and folder names and create seo-friendly/pretty urls
    (using [slug](https://github.com/dodo/node-slug))
  - pass-through all files that are not markdown, templates or html
  - transform drafts only in development environment
  - customizable options and behavior


## Setup and usage

This module is a [gulp](https://github.com/gulpjs/gulp) plugin.

Install `gulp-static-site-generator` using [npm](https://www.npmjs.com/).

In your `gulpfile.js`:

``` js
var ssg = require('gulp-static-site-generator');

var ssgOptions = {
  // your custom options
};

gulp.task('ssg', function() {
  return gulp.src('./src/site/**/*')
    .pipe(ssg(ssgOptions))
    .pipe(gulp.dest('./dest'));
});
```


## Options


### Defaults overview

``` js
{
  basePath: '/',
  data: {},
  defaultLayout: 'base.jade',
  jade: jade,
  jadeOptions: {
    basedir: path.join(process.cwd(), 'src')
  },
  layoutPath: 'src/layouts',
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


#### data

Type: *Object*

Default: `{}`


#### defaultLayout

Type: *String*

Default: `'base.jade'`


#### jade

Type: *Object*

Default: `require('jade')` (included dependency)


#### jadeOptions

Type: *Object*

Default:
``` js
{
  basedir: path.join(process.cwd(), 'src')
}
```


#### layoutPath

Type: *String*

Default: `'src/layouts'`


#### marked

Type: *Function*

Default: `require('marked')`


#### markedOptions

Type: *Object*

Default: 
``` js
{
  renderer: renderer // marked renderer with customized code highlighting
}
```


#### prettyUrls

Type: *Boolean*

Default: `true`


#### regexpHtml

Type: *RegExp*

Default: `/\.html$/i`


#### regexpMarkdown

Type: *RegExp*

Default: `/\.(md|markdown))$/i`


#### regexpTemplate

Type: *RegExp*

Default: `/\.jade$/i`


#### renderCode

Type: *Function*

Default: `renderCode` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))


#### renderTemplate

Type: *Function*

Default: `renderTemplate` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))


#### renderMarkdown

Type: *Function*

Default: `renderMarkdown` ([see source](https://github.com/simbo/gulp-static-site-generator/blob/master/index.js))


#### slugify

Type: *Boolean*

Default: `true`


#### slugOptions

Type: *Object*

Default:
``` js
{
  mode: 'rfc3986',
  remove: /^\./g
}
```


## License

[MIT &copy; 2016 Simon Lepel](http://simbo.mit-license.org/)

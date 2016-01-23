gulp-static-site-generator
==========================

  > A static site generator for gulp.

**WORK IN PROGRESS**

<!-- MarkdownTOC -->

- [About](#about)
  - [Features](#features)
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

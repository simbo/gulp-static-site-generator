'use strict';

var assert = require('assert'),
    path = require('path');

var streamAssert = require('stream-assert'),
    gulp = require('gulp'),
    through = require('through2');

var ssg = require('..');

function fixtures(glob, options) {
  return gulp.src(path.join(__dirname, 'fixtures/site', glob || '**/*'), options || {});
}

function assertChunk(assertions) {
  return function(chunk) {
    Object.keys(assertions).forEach(function(prop) {
      if (prop === 'contents') {
        assert.equal(String(chunk[prop]).trim(), assertions[prop]);
      } else if ((/^data\./i).test(prop)) {
        assert.deepEqual(chunk.data[prop.substr(5)], assertions[prop]);
      } else {
        assert.equal(chunk[prop], assertions[prop]);
      }
    });
  };
}

describe('gulp-static-site-generator', function() {

  it('should throw an error on a streamed file', function(done) {
    fixtures('template.jade', {buffer: false})
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .on('error', function(err) {
        assert.equal(err.message, 'Streaming not supported');
        done();
      });
  });

  it('should not pass-through files with no content', function(done) {
    fixtures('template.jade', {read: false})
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.length(0))
      .pipe(streamAssert.end(done));
  });

  it('should transform a jade file into html with seo-friendly url', function(done) {
    fixtures('template.jade')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'template/index.html',
        contents: '<p>hello world</p>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should transform a markdown file into html with seo-friendly url', function(done) {
    fixtures('markdown.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'markdown/index.html',
        contents: '<p>hello world</p>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should transform a html file\'s path into a seo-friendly url', function(done) {
    fixtures('plain.html')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'plain/index.html',
        contents: '<p>hello world</p>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should allow to disable generating seo-friendly URLs', function(done) {
    fixtures('template.jade')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        prettyUrls: false
      }))
      .pipe(streamAssert.first(assertChunk({
        relative: 'template.html'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should pass-through other files', function(done) {
    fixtures('other.txt')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'other.txt'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should not pass-through other files if option is set to false', function(done) {
    fixtures('other.txt')
      .pipe(streamAssert.length(1))
      .pipe(ssg({defaultLayout: false, passThrough: false}))
      .pipe(streamAssert.length(0))
      .pipe(streamAssert.end(done));
  });

  it('should not transform drafts', function(done) {
    fixtures('draft.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.length(0))
      .pipe(streamAssert.end(done));
  });

  it('should transform drafts in development env', function(done) {
    process.env.NODE_ENV = 'development';
    fixtures('draft.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.length(1))
      .pipe(streamAssert.end(function() {
        process.env.NODE_ENV = 'production';
        done();
      }));
  });

  it('should allow output path manipulation via chunk.data.relativePath', function(done) {
    fixtures('template.jade')
      .pipe(streamAssert.length(1))
      .pipe(through.obj(function(chunk, enc, cb) {
        chunk.data = chunk.data || {};
        chunk.data.relativePath = 'manipulate.html';
        cb(null, chunk);
      }))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'manipulate.html'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should skip duplicate url paths', function(done) {
    fixtures('plain.*')
      .pipe(streamAssert.length(2))
      .pipe(ssg())
      .pipe(streamAssert.length(1))
      .pipe(streamAssert.end(done));
  });

  it('should render code blocks in markdown using highlight.js', function(done) {
    fixtures('code.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        contents: '<pre><code class="hljs js">alert(<span class="hljs-string">\'!\'</span>);</code></pre>' +
          '<pre><code class="hljs"><span class="hljs-built_in">text</span></code></pre>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should throw an error if default layout is not found', function(done) {
    fixtures('template.jade')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        defaultLayout: 'base.jade'
      }))
      .on('error', function(err) {
        assert.equal(err.message.trim(),
          'Could not read layout: \'' +
          path.dirname(__dirname) +
          '/layouts/base.jade\''
        );
        done();
      });
  });

  it('should apply a default layout by setting relative path to layouts', function(done) {
    fixtures('@(template|markdown).*')
      .pipe(streamAssert.length(2))
      .pipe(ssg({
        defaultLayout: 'base.jade',
        layoutPath: 'test/fixtures/layouts'
      }))
      .pipe(streamAssert.all(assertChunk({
        contents: '<html><head><title></title></head><body><p>hello world</p></body></html>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should apply a default layout by setting absolute path to layouts', function(done) {
    fixtures('template.*')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        defaultLayout: 'base.jade',
        layoutPath: path.join(__dirname, 'fixtures/layouts')
      }))
      .pipe(streamAssert.first(assertChunk({
        contents: '<html><head><title></title></head><body><p>hello world</p></body></html>'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should read frontmatter data and change title and layout accordingly', function(done) {
    fixtures('frontmatter.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        defaultLayout: 'base.jade',
        layoutPath: 'test/fixtures/layouts'
      }))
      .pipe(streamAssert.first(assertChunk({
        contents: '<html><head><title>Foo</title></head><body><article><p>hello world</p></article></body></html>',
        'data.bar': [1, 2, 3],
        'data.baz': [1, 2, 3],
        'data.boo': {a: 0, b: 1, c: 2}
      })))
      .pipe(streamAssert.end(done));
  });

  it('should sanitize url parts using slug', function(done) {
    fixtures('äöü.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg())
      .pipe(streamAssert.first(assertChunk({
        relative: 'aou/index.html'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should allow custom slug options', function(done) {
    fixtures('markdown.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        slugOptions: {
          remove: /[ao]/gi
        }
      }))
      .pipe(streamAssert.first(assertChunk({
        relative: 'mrkdwn/index.html'
      })))
      .pipe(streamAssert.end(done));
  });

  it('should allow to disable sanitizing using slug', function(done) {
    fixtures('äöü.md')
      .pipe(streamAssert.length(1))
      .pipe(ssg({
        slugify: false
      }))
      .pipe(streamAssert.first(assertChunk({
        relative: 'äöü/index.html'
      })))
      .pipe(streamAssert.end(done));
  });

});

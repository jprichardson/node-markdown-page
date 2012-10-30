/*this will probably be made browser compatible at some point in time*/
;(function(root){
  var marked = require('marked')
    , mde = require('markdown-extra')
    , S = require('string')
    , hl = require('highlight').Highlight


  function MarkdownPage(text) {
    this.text = text;
    this.metadata = {};
    this.title = null;
    this.markdown = null;

    marked.setOptions({gfm: true, pedantic: false, sanitize: true, highlight: function(code, lang) {
      return hl(code);
    }});
  }

  MarkdownPage.prototype.parse = function(callback) {
    //this is actually just a sync method, but in the future, may call out to other executables or services
    this.metadata = mde.metadata(this.text, parseMetadata);
    this.title = mde.heading(this.text);
    this.markdown = mde.content(this.text);
    this.html = marked(this.markdown);

    callback(null);
  }

  MarkdownPage.prototype.slug = function(slugString) {
    if (slugString) return S(slugString).slugify().s;
    if (this.metadata.slug) return this.metadata.slug;
    return S(this.title).slugify().s;
  }

  /*************************
   * STATIC CLASS Methods
   *************************/


  MarkdownPage.create = function(text) {
    return new MarkdownPage(text);
  }


  /*************************
   * EXPORTS
   *************************/

  root.MarkdownPage = MarkdownPage;


  /*************************
   * PRIVATE
   *************************/

  function parseMetadata(metaText){
    var metaObj = {};
    metaText.split('\n').forEach(function(line) {
      var data = line.split(':');
      metaObj[data[0].trim()] = data[1].trim();
    });

    if (metaObj.tags)
      metaObj.tags = parseTags(metaObj.tags);

    if (metaObj.publish)
      metaObj.publish = parsePublish(metaObj.publish);

    return metaObj;
  }

  function parsePublish(dateString) {
    return new Date(Date.parse(dateString));
  }

  function parseTags(tagString) {
    if (S(tagString).contains(',')) {
      return tagString.split(',').map(function(tag){ return tag.trim() });
    } else if (S(tagString).contains(' ')) {
      return tagString.split(' ').map(function(tag){ return tag.trim() });
    } else {
      return tagString;
    }
  }


})(module.exports || this);
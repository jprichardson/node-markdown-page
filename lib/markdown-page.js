
var marked = require('marked')
  , mde = require('markdown-extra')
  , S = require('string')
  , hl = require('highlight').Highlight
  , fs = require('fs')


function MarkdownPage(text) {
  this.text = text || '';
  this.metadata = {};
  this.title = null;
  this.markdown = '';
  this.metadataConversions = {}

  initMetadataConversions.apply(this)

  marked.setOptions({gfm: true, pedantic: false, sanitize: true, highlight: function(code, lang) {
    return hl(code);
  }});
}

MarkdownPage.prototype.genOutput = function() {
  var data = '<!--\n'
    , _this = this

  Object.keys(this.metadata).forEach(function(key) {
    if (_this.metadataConversions[key])
      data += key + ': ' + _this.metadataConversions[key].serialize(_this.metadata[key]) + '\n';
    else
      data += key + ': ' + _this.metadata[key] + '\n'
  })

  data += '-->\n\n\n'

  if (this.title) {
    data += this.title + '\n'
    data += S('=').repeat(this.title.length) + '\n\n'
  }

  data += this.markdown + '\n'
  return data;
}

//this is actually just a sync method, but in the future, may call out to other executables or services
MarkdownPage.prototype.parse = function(callback) {
  this.metadata = mde.metadata(this.text, parseMetadata);
  parseMetadataWithConversions.call(this)

  this.title = mde.heading(this.text);
  this.markdown = mde.content(this.text);
  this.html = marked(this.markdown);

  callback(null);
}

MarkdownPage.prototype.slug = function(slugString) {
  if (slugString) return S(slugString.toLowerCase()).slugify().s;
  if (this.metadata.slug) return this.metadata.slug;
  return S(this.title.toLowerCase()).slugify().s;
}

MarkdownPage.prototype.writeFile = function(file, callback) {
  var data = this.genOutput()
  fs.writeFile(file, data, callback)
}

/*************************
 * STATIC CLASS Methods
 *************************/


MarkdownPage.create = function(text) {
  return new MarkdownPage(text);
}

MarkdownPage.readFile = function(file, callback) {
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) return callback(err)

    var mdp = MarkdownPage.create(data)
    mdp.parse(function(err) {
      if (err) return callback(err)

      callback(null, mdp)
    })
  })
}


/*************************
 * EXPORTS
 *************************/

module.exports.MarkdownPage = MarkdownPage;


/*************************
 * PRIVATE
 *************************/

function initMetadataConversions() {
  var mdc = this.metadataConversions

  mdc['publish'] = {
    deserialize: function (dateString) {
      if (dateString)
        return new Date(Date.parse(dateString))
      else
        return dateString
    },
    serialize: function (date) {
      if (date instanceof Date) {
        return date.getFullYear() + '-' 
          + ('0' + (date.getMonth()+1)).slice(-2) + '-'
          + ('0' + date.getDate())
      } else {
        return date.toString()
      }
    }
  }

  mdc['tags'] = {
    deserialize: function (tagString) { //prob not very readable
      if (S(tagString).contains(',')) return tagString.split(',').map(function(tag){ return tag.trim() })
      //else if (S(tagString).contains(' ')) return tagString.split(' ').map(function(tag){ return tag.trim() })
      else return [tagString]
    },
    serialize: function (tagArray) {
      return tagArray.join(', ')
    }
  }
}

function parseMetadata(metaText){
  var metaObj = {};
  metaText.split('\n').forEach(function(line) {
    var idx = line.indexOf(':')
    metaObj[line.substr(0,idx)] = line.substr(idx+1).trim();
  });

  return metaObj;
}

function parseMetadataWithConversions() {
  var mdc = this.metadataConversions
    , _this = this

  Object.keys(this.metadata).forEach(function(key) {
    if (mdc[key])
      _this.metadata[key] = mdc[key].deserialize(_this.metadata[key])
  })
}




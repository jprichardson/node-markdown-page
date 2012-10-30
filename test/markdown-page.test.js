var testutil = require('testutil')
  , MarkdownPage = require('../lib/markdown-page').MarkdownPage;

var data = [""
       , "<!--"
       , "author: JP Richardson"
       , "publish: 2012-03-04"
       , "tags: programming, node.js"
       , "anything: can write anything"
       , "-->"
       , ""
       , "Node.js is a Fun Platform"
       , "============================"
       , ""
       , "Here is some node.js code:"
       , ""
       , "```javascript"
       , "function(){"
       , "  console.log('hi');"
       , "}"
       , "```"
       , ""].join('\n');

describe('MarkdownPage', function() {
  var MDP = null;
  beforeEach(function(done) {
    MDP = MarkdownPage.create(data);
    MDP.parse(done);
  })

  describe('new', function() {
    it ('should create a new MarkdownPage', function() {
      var mdp = new MarkdownPage();
      T (mdp)
    })

    it ('should create a new MarkdownPage with markdown text', function() {
      var mdp = new MarkdownPage(data);
      T (mdp)
      T (mdp.text === data)
    })
  })

  describe('+ create()', function() {
    it ('should create a new MarkdownPage', function() {
      var mdp = MarkdownPage.create();
      T (mdp)
    })

    it ('should create a new MarkdownPage with markdown text', function() {
      var mdp = MarkdownPage.create(data);
      T (mdp)
      T (mdp.text === data)
    })
  })

  describe('- html', function() {
    it ('should be the converted html only', function() {
      console.log(MDP.html)
      T (MDP.html.length > 0)
    })
  })


  describe('- markdown', function() {
    it ('should be the markdown only', function() {
      T (MDP.markdown.length > 0)
    })
  })

  describe('- parse()', function() {
    it ('should parse the markdown text without error', function(done) {
      var mdp = MarkdownPage.create(data);
      mdp.parse(function(err) {
        F (err);
        done();
      })
    })
  })

  describe('- text', function() {
    it ('should be the text passed into the constructor', function() {
      T (MDP.text === data)
    })
  })

  describe('- title', function() {
    it('should retrieve the title', function() {
      T (MDP.title === 'Node.js is a Fun Platform')
    })
  })

  describe('- metadata', function() {
    it ('should retrieve the metadata', function(){
      T (MDP.metadata.author)
      T (MDP.metadata.tags)
      T (MDP.metadata.publish)
      T (MDP.metadata.anything)
    })

    describe('- metadata.tags', function() {
      describe ('> when delimitted by spaces', function() {
        it ('should parse the tags', function(done) {
          var newData = data.replace("tags: programming, node.js", "tags: programming node.js")
            , mdp = MarkdownPage.create(newData)

          mdp.parse(function(err) {
            F (err)
            T (MDP.metadata.tags.length === 2)
            done()
          })
        })
      })

      describe ('> when delimitted by commas', function() {
        it ('should parse the tags', function() {
          T (MDP.metadata.tags.length === 2)
        })
      })
    })

    describe('- metadata.publish', function() {
      it ('should parse any JavaScript parsable date', function() {
        T (MDP.metadata.publish.getTime() === (new Date(Date.parse('2012-03-04'))).getTime())
      })
    })
  })

  describe('- slug([textString])', function() {
    describe('> when textString parameter is present', function() {
      it ('should slugify the string', function() {
        T (MDP.slug('Smart Programming') === 'smart-programming')
      })
    })

    describe('> when a slug metadata field is present', function() {
      it ('should use the metadata field verbatim', function() {
        MDP.metadata.slug = 'some-slug'
        T (MDP.slug() === 'some-slug')
      })
    })

    describe('> when neither a parameter is present or a slug metadata field is present, slugify the title', function() {
      it ('should slugify the title', function() {
        T (MDP.slug() === 'nodejs-is-a-fun-platform')
      })
    })
  })

})






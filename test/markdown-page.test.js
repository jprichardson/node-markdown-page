var testutil = require('testutil')
  , MarkdownPage = require('../lib/markdown-page').MarkdownPage
  , path = require('path')
  , fs = require('fs')
  , S = require('string')

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

var TEST_DIR = ''


describe('MarkdownPage', function() {
  var MDP = null;
  beforeEach(function(done) {
    TEST_DIR = testutil.createTestDir('markdown-page')
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
      EQ (mdp.text, data)
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
      EQ (mdp.text, data)
    })
  })

  describe('- html', function() {
    it ('should be the converted html only', function() {
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
      EQ (MDP.text, data)
    })
  })

  describe('- title', function() {
    it('should retrieve the title', function() {
      EQ (MDP.title, 'Node.js is a Fun Platform')
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
        it ('should treat as one tag (spaces as delimitters are not supported anymore)', function(done) {
          var newData = data.replace("tags: programming, node.js", "tags: programming node.js")
            , mdp = MarkdownPage.create(newData)

          mdp.parse(function(err) {
            F (err)
            EQ (mdp.metadata.tags.length, 1)
            EQ (mdp.metadata.tags[0], "programming node.js")

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

  describe('- readFile(file, callback)', function() {
    it ('should read and parse the file', function(done) {
      var file = path.join(TEST_DIR, 'something.md')
      fs.writeFileSync(file, data)

      MarkdownPage.readFile(file, function(err, mdp) {
        F (err)
        T (mdp.metadata.author)
        T (mdp.markdown.length > 0)
        done()
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

  describe('- writeFile(file, callback)', function() {
    it ('should write the file', function(done) {
      var file = path.join(TEST_DIR, 'something.md')

      var mdp = MarkdownPage.create()
      //console.dir(mdp)
      //process.exit()
      mdp.metadata.author = 'JP Richardson'
      mdp.metadata.tags = ['airplanes', 'cars']
      mdp.title = 'Transporation in the 20th Century'

      mdp.markdown = 'Transportation blah blah...'

      mdp.writeFile(file, function(err) {
        F (err)

        var data = '<!--\nauthor: JP Richardson\ntags: airplanes, cars\n-->\n\n\n' + mdp.title
        data += '\n' + S('=').repeat(mdp.title.length)
        data += '\n\n'
        data += mdp.markdown + '\n'

        var data2 = fs.readFileSync(file, 'utf8')

        EQ (data, data2)

        done()
        
      })
    })

    describe('> when a markdown body is not present', function() {
      it('should write the file with an empty body', function(done) {
        var file = path.join(TEST_DIR, 'something.md')
        var mdp = MarkdownPage.create()
        mdp.title = 'Some Title'
        mdp.writeFile(file, function(err) {
          F (err)

          var data = fs.readFileSync(file, 'utf8')
          EQ (data.indexOf('null'), -1)
          done()
        })
      })
    })

    describe('> when a title is not present', function() {
      it('should not put the title header', function(done) {
        var file = path.join(TEST_DIR, 'something.md')
        var mdp = MarkdownPage.create()
        mdp.writeFile(file, function(err) {
          F (err)

          var data = fs.readFileSync(file, 'utf8')
          F (data.indexOf('=') >= 0)
          done()
        })
      })
    })
  })

  describe('Metadata Conversions', function() {
    describe('tags', function() {
      it('should serialize from an array to a string', function() {
        var serialize = (new MarkdownPage).metadataConversions.tags.serialize
        EQ (serialize(['cars', 'planes']), 'cars, planes')
        EQ (serialize(['cars']), 'cars')
      })

      it('should deserialize from a string to an array', function() {
        var deserialize = (new MarkdownPage).metadataConversions.tags.deserialize
        var a1 = ['cars', 'planes']
        var a2 = ['cars']

        EQ (deserialize('cars, planes')[0], a1[0])
        EQ (deserialize('cars, planes')[1], a1[1])
        EQ (deserialize('cars')[0], a2[0])
        EQ (deserialize('cars')[0], a2[0])
      })
    })
  })
})







0.2.1 / 2013-07-19
------------------
* fixed bug if metadata had a `:` in it

0.2.0 / 2013-05-16
------------------
* if `title` is not present, `writeFile()` will not error anymore
* spaces as delimiters for tags is now forbidden

0.1.2 / 2013-02-16
------------------
* Fixed deserialize bug on one tag. Added tests.

0.1.1 / 2013-01-31
------------------
* add `genOutput()` method

0.1.0 / 2013-01-23
------------------
* Fixed null body bug.
* Updated deps.

0.0.5 / 2012-11-08
------------------
* Bug fix on `publish` metadataConversion method.

0.0.4 / 2012-11-08
------------------
* Added methods `readFile()` and `writeFile()`. Shouldn't be used on the same object.
* Add field `metadataConversions`. 
* Fixed behavior of `slug()`. See: https://github.com/jprichardson/string.js/issues/17

0.0.3 / 2012-11-04
------------------
* Bug fix: added `highlight` dependency.

0.0.2 / 2012-10-30
------------------
* Added parsing of `tags` and `publish` on page metadata

0.0.1 / 2012-10-30
------------------
* Initial release.

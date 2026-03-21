// verse-resolver.js — Canonical verse addressing for Scripture Deep Dive
//
// Parses any standard Bible reference string into a structured object.
// Maps references to URLs, book keys, chapter numbers, and verse ranges.
//
// Usage:
//   var v = VerseResolver.parse("Gen 22:1-3");
//   // → { book:"genesis", name:"Genesis", ch:22, v1:1, v2:3,
//   //     testament:"ot", url:"ot/genesis/Genesis_22.html",
//   //     ref:"Genesis 22:1-3", short:"Gen 22:1-3" }
//
//   var url = VerseResolver.toUrl("Heb 11:17");
//   VerseResolver.toShort("Genesis 22:1");  // → "Gen 22:1"
//   VerseResolver.isLive("genesis", 22);    // → true if chapter is built
//
// Depends on: books.js (window.BOOKS) for live chapter counts.
// Consumed by: cross-ref-engine, word-study, annotations, synoptic

(function() {
  'use strict';

  // ── Book table ──────────────────────────────────────────────────────────
  // All 66 canonical books. dir = folder name, name = display, short = abbrev,
  // testament = ot|nt, chapters = total chapter count in canon.
  // Books not yet built still resolve — isLive() checks separately.

  var BOOK_TABLE = [
    { dir:'genesis',        name:'Genesis',         short:'Gen',   testament:'ot', chapters:50 },
    { dir:'exodus',         name:'Exodus',          short:'Exod',  testament:'ot', chapters:40 },
    { dir:'leviticus',      name:'Leviticus',       short:'Lev',   testament:'ot', chapters:27 },
    { dir:'numbers',        name:'Numbers',         short:'Num',   testament:'ot', chapters:36 },
    { dir:'deuteronomy',    name:'Deuteronomy',     short:'Deut',  testament:'ot', chapters:34 },
    { dir:'joshua',         name:'Joshua',          short:'Josh',  testament:'ot', chapters:24 },
    { dir:'judges',         name:'Judges',          short:'Judg',  testament:'ot', chapters:21 },
    { dir:'ruth',           name:'Ruth',            short:'Ruth',  testament:'ot', chapters:4 },
    { dir:'1_samuel',       name:'1 Samuel',        short:'1Sam',  testament:'ot', chapters:31 },
    { dir:'2_samuel',       name:'2 Samuel',        short:'2Sam',  testament:'ot', chapters:24 },
    { dir:'1_kings',        name:'1 Kings',         short:'1Kgs',  testament:'ot', chapters:22 },
    { dir:'2_kings',        name:'2 Kings',         short:'2Kgs',  testament:'ot', chapters:25 },
    { dir:'1_chronicles',   name:'1 Chronicles',    short:'1Chr',  testament:'ot', chapters:29 },
    { dir:'2_chronicles',   name:'2 Chronicles',    short:'2Chr',  testament:'ot', chapters:36 },
    { dir:'ezra',           name:'Ezra',            short:'Ezra',  testament:'ot', chapters:10 },
    { dir:'nehemiah',       name:'Nehemiah',        short:'Neh',   testament:'ot', chapters:13 },
    { dir:'esther',         name:'Esther',          short:'Esth',  testament:'ot', chapters:10 },
    { dir:'job',            name:'Job',             short:'Job',   testament:'ot', chapters:42 },
    { dir:'psalms',         name:'Psalms',          short:'Ps',    testament:'ot', chapters:150 },
    { dir:'proverbs',       name:'Proverbs',        short:'Prov',  testament:'ot', chapters:31 },
    { dir:'ecclesiastes',   name:'Ecclesiastes',    short:'Eccl',  testament:'ot', chapters:12 },
    { dir:'song_of_solomon',name:'Song of Solomon', short:'Song',  testament:'ot', chapters:8 },
    { dir:'isaiah',         name:'Isaiah',          short:'Isa',   testament:'ot', chapters:66 },
    { dir:'jeremiah',       name:'Jeremiah',        short:'Jer',   testament:'ot', chapters:52 },
    { dir:'lamentations',   name:'Lamentations',    short:'Lam',   testament:'ot', chapters:5 },
    { dir:'ezekiel',        name:'Ezekiel',         short:'Ezek',  testament:'ot', chapters:48 },
    { dir:'daniel',         name:'Daniel',          short:'Dan',   testament:'ot', chapters:12 },
    { dir:'hosea',          name:'Hosea',           short:'Hos',   testament:'ot', chapters:14 },
    { dir:'joel',           name:'Joel',            short:'Joel',  testament:'ot', chapters:3 },
    { dir:'amos',           name:'Amos',            short:'Amos',  testament:'ot', chapters:9 },
    { dir:'obadiah',        name:'Obadiah',         short:'Obad',  testament:'ot', chapters:1 },
    { dir:'jonah',          name:'Jonah',           short:'Jonah', testament:'ot', chapters:4 },
    { dir:'micah',          name:'Micah',           short:'Mic',   testament:'ot', chapters:7 },
    { dir:'nahum',          name:'Nahum',           short:'Nah',   testament:'ot', chapters:3 },
    { dir:'habakkuk',       name:'Habakkuk',        short:'Hab',   testament:'ot', chapters:3 },
    { dir:'zephaniah',      name:'Zephaniah',       short:'Zeph',  testament:'ot', chapters:3 },
    { dir:'haggai',         name:'Haggai',          short:'Hag',   testament:'ot', chapters:2 },
    { dir:'zechariah',      name:'Zechariah',       short:'Zech',  testament:'ot', chapters:14 },
    { dir:'malachi',        name:'Malachi',         short:'Mal',   testament:'ot', chapters:4 },
    { dir:'matthew',        name:'Matthew',         short:'Matt',  testament:'nt', chapters:28 },
    { dir:'mark',           name:'Mark',            short:'Mark',  testament:'nt', chapters:16 },
    { dir:'luke',           name:'Luke',            short:'Luke',  testament:'nt', chapters:24 },
    { dir:'john',           name:'John',            short:'John',  testament:'nt', chapters:21 },
    { dir:'acts',           name:'Acts',            short:'Acts',  testament:'nt', chapters:28 },
    { dir:'romans',         name:'Romans',          short:'Rom',   testament:'nt', chapters:16 },
    { dir:'1_corinthians',  name:'1 Corinthians',   short:'1Cor',  testament:'nt', chapters:16 },
    { dir:'2_corinthians',  name:'2 Corinthians',   short:'2Cor',  testament:'nt', chapters:13 },
    { dir:'galatians',      name:'Galatians',       short:'Gal',   testament:'nt', chapters:6 },
    { dir:'ephesians',      name:'Ephesians',       short:'Eph',   testament:'nt', chapters:6 },
    { dir:'philippians',    name:'Philippians',     short:'Phil',  testament:'nt', chapters:4 },
    { dir:'colossians',     name:'Colossians',      short:'Col',   testament:'nt', chapters:4 },
    { dir:'1_thessalonians',name:'1 Thessalonians', short:'1Thess',testament:'nt', chapters:5 },
    { dir:'2_thessalonians',name:'2 Thessalonians', short:'2Thess',testament:'nt', chapters:3 },
    { dir:'1_timothy',      name:'1 Timothy',       short:'1Tim',  testament:'nt', chapters:6 },
    { dir:'2_timothy',      name:'2 Timothy',       short:'2Tim',  testament:'nt', chapters:4 },
    { dir:'titus',          name:'Titus',           short:'Titus', testament:'nt', chapters:3 },
    { dir:'philemon',       name:'Philemon',        short:'Phlm',  testament:'nt', chapters:1 },
    { dir:'hebrews',        name:'Hebrews',         short:'Heb',   testament:'nt', chapters:13 },
    { dir:'james',          name:'James',           short:'Jas',   testament:'nt', chapters:5 },
    { dir:'1_peter',        name:'1 Peter',         short:'1Pet',  testament:'nt', chapters:5 },
    { dir:'2_peter',        name:'2 Peter',         short:'2Pet',  testament:'nt', chapters:3 },
    { dir:'1_john',         name:'1 John',          short:'1John', testament:'nt', chapters:5 },
    { dir:'2_john',         name:'2 John',          short:'2John', testament:'nt', chapters:1 },
    { dir:'3_john',         name:'3 John',          short:'3John', testament:'nt', chapters:1 },
    { dir:'jude',           name:'Jude',            short:'Jude',  testament:'nt', chapters:1 },
    { dir:'revelation',     name:'Revelation',      short:'Rev',   testament:'nt', chapters:22 }
  ];

  // ── Abbreviation index ──────────────────────────────────────────────────
  // Maps lowercase abbreviation → BOOK_TABLE index.
  // Multiple abbreviations per book for flexibility.

  var _index = {};

  function _addAbbrev(abbrev, idx) {
    _index[abbrev.toLowerCase().replace(/\./g, '')] = idx;
  }

  BOOK_TABLE.forEach(function(b, i) {
    // Full name, directory, and standard short form
    _addAbbrev(b.name, i);
    _addAbbrev(b.dir, i);
    _addAbbrev(b.short, i);

    // Common variants
    var n = b.name.toLowerCase();
    // Strip number prefix for alternate forms: "1 samuel" → also "1samuel", "1sam", "1sa"
    var numPrefix = n.match(/^(\d)\s*/);
    if (numPrefix) {
      var base = n.replace(/^\d\s*/, '');
      var num = numPrefix[1];
      _addAbbrev(num + base, i);                              // 1samuel
      _addAbbrev(num + ' ' + base, i);                        // 1 samuel
      _addAbbrev(num + base.slice(0, 3), i);                  // 1sam
      _addAbbrev(num + ' ' + base.slice(0, 3), i);            // 1 sam
      _addAbbrev(num + base.slice(0, 2), i);                  // 1sa
      if (base === 'kings') {
        _addAbbrev(num + 'ki', i);                             // 1ki
        _addAbbrev(num + 'kgs', i);                            // 1kgs
        _addAbbrev(num + ' ki', i);
        _addAbbrev(num + ' kgs', i);
        _addAbbrev(num + ' kings', i);
      }
      if (base === 'chronicles') {
        _addAbbrev(num + 'chr', i);
        _addAbbrev(num + ' chr', i);
        _addAbbrev(num + 'chron', i);
        _addAbbrev(num + ' chron', i);
      }
      if (base === 'corinthians') {
        _addAbbrev(num + 'cor', i);
        _addAbbrev(num + ' cor', i);
      }
      if (base === 'thessalonians') {
        _addAbbrev(num + 'thess', i);
        _addAbbrev(num + ' thess', i);
        _addAbbrev(num + 'th', i);
      }
      if (base === 'timothy') {
        _addAbbrev(num + 'tim', i);
        _addAbbrev(num + ' tim', i);
      }
      if (base === 'peter') {
        _addAbbrev(num + 'pet', i);
        _addAbbrev(num + ' pet', i);
        _addAbbrev(num + 'pt', i);
      }
      if (base === 'john') {
        _addAbbrev(num + 'jn', i);
        _addAbbrev(num + ' jn', i);
        _addAbbrev(num + 'john', i);
        _addAbbrev(num + ' john', i);
      }
      if (base === 'samuel') {
        _addAbbrev(num + 'sa', i);
        _addAbbrev(num + ' sa', i);
      }
    }
  });

  // Additional common abbreviations not covered by the loop
  var extras = {
    'ge': 'genesis', 'gn': 'genesis',
    'ex': 'exodus', 'exo': 'exodus',
    'lv': 'leviticus', 'le': 'leviticus',
    'nm': 'numbers', 'nu': 'numbers',
    'dt': 'deuteronomy', 'deu': 'deuteronomy',
    'jos': 'joshua', 'jsh': 'joshua',
    'jdg': 'judges', 'jdgs': 'judges', 'jg': 'judges',
    'ru': 'ruth', 'rth': 'ruth',
    'jb': 'job',
    'psa': 'psalms', 'pss': 'psalms', 'psalm': 'psalms',
    'pr': 'proverbs', 'pro': 'proverbs',
    'ec': 'ecclesiastes', 'ecc': 'ecclesiastes', 'qoh': 'ecclesiastes',
    'sng': 'song_of_solomon', 'sos': 'song_of_solomon', 'canticles': 'song_of_solomon',
    'song of songs': 'song_of_solomon', 'ss': 'song_of_solomon',
    'is': 'isaiah',
    'je': 'jeremiah',
    'la': 'lamentations',
    'eze': 'ezekiel', 'ez': 'ezekiel',
    'da': 'daniel', 'dn': 'daniel',
    'ho': 'hosea',
    'jl': 'joel',
    'am': 'amos',
    'ob': 'obadiah',
    'jon': 'jonah',
    'mi': 'micah',
    'na': 'nahum',
    'hb': 'habakkuk',
    'zep': 'zephaniah', 'zp': 'zephaniah',
    'hg': 'haggai',
    'zec': 'zechariah', 'zc': 'zechariah',
    'ml': 'malachi',
    'mt': 'matthew', 'mat': 'matthew',
    'mk': 'mark', 'mr': 'mark',
    'lk': 'luke', 'lu': 'luke',
    'jn': 'john',
    'ac': 'acts',
    'ro': 'romans', 'rm': 'romans',
    'ga': 'galatians',
    'ep': 'ephesians', 'eph': 'ephesians',
    'php': 'philippians', 'phi': 'philippians',
    'co': 'colossians',
    'tt': 'titus', 'tit': 'titus',
    'phm': 'philemon',
    'heb': 'hebrews',
    'jas': 'james', 'jm': 'james',
    'jud': 'jude',
    're': 'revelation', 'rv': 'revelation', 'apocalypse': 'revelation'
  };

  Object.keys(extras).forEach(function(abbr) {
    var dir = extras[abbr];
    for (var i = 0; i < BOOK_TABLE.length; i++) {
      if (BOOK_TABLE[i].dir === dir) { _addAbbrev(abbr, i); break; }
    }
  });


  // ── Parsing ─────────────────────────────────────────────────────────────

  // Reference pattern: "BookName Ch:V1-V2" or "BookName Ch:V1" or "BookName Ch"
  // Book name may include number prefix and spaces: "1 Kings", "Song of Solomon"
  var REF_RE = /^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–—]\s*(\d+))?)?$/;

  function _resolveBook(raw) {
    var key = raw.toLowerCase().replace(/\./g, '').trim();
    if (_index.hasOwnProperty(key)) return BOOK_TABLE[_index[key]];

    // Try progressively shorter prefixes for fuzzy match
    for (var len = key.length; len >= 2; len--) {
      var prefix = key.slice(0, len);
      if (_index.hasOwnProperty(prefix)) return BOOK_TABLE[_index[prefix]];
    }
    return null;
  }

  function parse(refStr) {
    if (!refStr || typeof refStr !== 'string') return null;

    var s = refStr.trim();
    var m = REF_RE.exec(s);
    if (!m) {
      // Maybe just a book name?
      var book = _resolveBook(s);
      if (book) {
        return {
          book: book.dir, name: book.name, short: book.short,
          testament: book.testament, ch: 1, v1: null, v2: null,
          url: book.testament + '/' + book.dir + '/' + book.name.replace(/ /g, '_') + '_1.html',
          ref: book.name + ' 1'
        };
      }
      return null;
    }

    var bookRaw = m[1];
    var ch = parseInt(m[2], 10);
    var v1 = m[3] ? parseInt(m[3], 10) : null;
    var v2 = m[4] ? parseInt(m[4], 10) : null;

    var book = _resolveBook(bookRaw);
    if (!book) return null;

    // Validate chapter range
    if (ch < 1 || ch > book.chapters) return null;

    var fileName = book.name.replace(/ /g, '_') + '_' + ch + '.html';
    var url = book.testament + '/' + book.dir + '/' + fileName;

    // Build display strings
    var fullRef = book.name + ' ' + ch;
    var shortRef = book.short + ' ' + ch;
    if (v1 !== null) {
      fullRef += ':' + v1;
      shortRef += ':' + v1;
      if (v2 !== null && v2 !== v1) {
        fullRef += '-' + v2;
        shortRef += '-' + v2;
      }
    }

    return {
      book: book.dir,
      name: book.name,
      short: book.short,
      testament: book.testament,
      ch: ch,
      v1: v1,
      v2: v2,
      url: url,
      ref: fullRef,
      shortRef: shortRef
    };
  }


  // ── Convenience methods ─────────────────────────────────────────────────

  function toUrl(refStr) {
    var v = parse(refStr);
    return v ? v.url : null;
  }

  function toShort(refStr) {
    var v = parse(refStr);
    return v ? v.shortRef : refStr;
  }

  function getBook(bookKey) {
    for (var i = 0; i < BOOK_TABLE.length; i++) {
      if (BOOK_TABLE[i].dir === bookKey) return BOOK_TABLE[i];
    }
    return null;
  }

  function isLive(bookKey, ch) {
    var books = window.BOOKS || [];
    for (var i = 0; i < books.length; i++) {
      if (books[i].dir === bookKey) {
        return ch >= 1 && ch <= books[i].live;
      }
    }
    return false;
  }

  function allBooks() {
    return BOOK_TABLE.slice();
  }


  // ── Public API ──────────────────────────────────────────────────────────

  window.VerseResolver = {
    parse: parse,
    toUrl: toUrl,
    toShort: toShort,
    getBook: getBook,
    isLive: isLive,
    allBooks: allBooks,
    BOOK_TABLE: BOOK_TABLE
  };

})();

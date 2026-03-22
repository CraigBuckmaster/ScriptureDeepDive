#!/usr/bin/env node
// test_verse_resolver.js — Unit tests for verse-resolver.js
//
// Run: node _tools/tests/test_verse_resolver.js
// Depends on: verse-resolver.js (loaded inline via eval)

var fs = require('fs');

// Minimal shim for window + books.js
global.window = {};
global.BOOKS = [
  { dir:'genesis', name:'Genesis', live:50, testament:'OT' },
  { dir:'exodus', name:'Exodus', live:40, testament:'OT' },
  { dir:'ruth', name:'Ruth', live:4, testament:'OT' },
  { dir:'1_kings', name:'1 Kings', live:22, testament:'OT' },
  { dir:'2_samuel', name:'2 Samuel', live:24, testament:'OT' },
  { dir:'matthew', name:'Matthew', live:28, testament:'NT' },
  { dir:'john', name:'John', live:21, testament:'NT' },
  { dir:'acts', name:'Acts', live:28, testament:'NT' },
  { dir:'hebrews', name:'Hebrews', live:0, testament:'NT' },
  { dir:'revelation', name:'Revelation', live:0, testament:'NT' },
];
global.window.BOOKS = global.BOOKS;

// Load verse-resolver.js
var code = fs.readFileSync('js/features/verse-resolver.js', 'utf8');
eval(code);

var VR = global.window.VerseResolver;
var passed = 0;
var failed = 0;

function assert(label, condition) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log('  ✗ ' + label);
  }
}

function assertParse(label, input, expected) {
  var result = VR.parse(input);
  if (!expected) {
    assert(label, result === null);
    return;
  }
  if (!result) {
    failed++;
    console.log('  ✗ ' + label + ': parse returned null for "' + input + '"');
    return;
  }
  for (var k in expected) {
    if (result[k] !== expected[k]) {
      failed++;
      console.log('  ✗ ' + label + ': ' + k + ' = ' + JSON.stringify(result[k]) + ', expected ' + JSON.stringify(expected[k]));
      return;
    }
  }
  passed++;
}

console.log('verse-resolver.js unit tests');
console.log('════════════════════════════');

// ── Full name parsing ────────────────────────────────────────────────────
console.log('\n1. Full name references:');
assertParse('Genesis 1:1',     'Genesis 1:1',     { book:'genesis', ch:1, v1:1, v2:null });
assertParse('Exodus 14:21-31', 'Exodus 14:21-31', { book:'exodus',  ch:14, v1:21, v2:31 });
assertParse('Ruth 3',          'Ruth 3',          { book:'ruth',    ch:3, v1:null });
assertParse('1 Kings 18:36',   '1 Kings 18:36',   { book:'1_kings', ch:18, v1:36 });
assertParse('2 Samuel 7:12',   '2 Samuel 7:12',   { book:'2_samuel', ch:7, v1:12 });
assertParse('Matthew 5:3-12',  'Matthew 5:3-12',  { book:'matthew', ch:5, v1:3, v2:12 });
assertParse('Revelation 21:1', 'Revelation 21:1', { book:'revelation', ch:21, v1:1 });

// ── Standard abbreviations ───────────────────────────────────────────────
console.log('\n2. Standard abbreviations:');
assertParse('Gen 1:1',    'Gen 1:1',    { book:'genesis' });
assertParse('Exod 3:14',  'Exod 3:14',  { book:'exodus' });
assertParse('Lev 19:18',  'Lev 19:18',  { book:'leviticus' });
assertParse('Num 6:24',   'Num 6:24',   { book:'numbers' });
assertParse('Deut 6:4',   'Deut 6:4',   { book:'deuteronomy' });
assertParse('Josh 1:9',   'Josh 1:9',   { book:'joshua' });
assertParse('Judg 7:7',   'Judg 7:7',   { book:'judges' });
assertParse('1Sam 17:45', '1Sam 17:45', { book:'1_samuel' });
assertParse('1Kgs 19:12', '1Kgs 19:12', { book:'1_kings' });
assertParse('Prov 3:5',   'Prov 3:5',   { book:'proverbs' });
assertParse('Isa 53:5',   'Isa 53:5',   { book:'isaiah' });
assertParse('Matt 28:19', 'Matt 28:19', { book:'matthew' });
assertParse('Mark 1:1',   'Mark 1:1',   { book:'mark' });
assertParse('Luke 2:10',  'Luke 2:10',  { book:'luke' });
assertParse('John 3:16',  'John 3:16',  { book:'john' });
assertParse('Acts 2:38',  'Acts 2:38',  { book:'acts' });
assertParse('Rom 8:28',   'Rom 8:28',   { book:'romans' });
assertParse('Heb 11:1',   'Heb 11:1',   { book:'hebrews' });
assertParse('Rev 22:20',  'Rev 22:20',  { book:'revelation' });

// ── Alternate abbreviations ──────────────────────────────────────────────
console.log('\n3. Alternate abbreviations:');
assertParse('Ge 1:1',     'Ge 1:1',     { book:'genesis' });
assertParse('Ex 3:14',    'Ex 3:14',    { book:'exodus' });
assertParse('1Ki 18:1',   '1Ki 18:1',   { book:'1_kings' });
assertParse('1 Ki 18:1',  '1 Ki 18:1',  { book:'1_kings' });
assertParse('1 Sam 1:1',  '1 Sam 1:1',  { book:'1_samuel' });
assertParse('Jn 1:1',     'Jn 1:1',     { book:'john' });
assertParse('Mt 5:1',     'Mt 5:1',     { book:'matthew' });
assertParse('Mk 1:1',     'Mk 1:1',     { book:'mark' });
assertParse('Lk 1:1',     'Lk 1:1',     { book:'luke' });
assertParse('Ac 2:1',     'Ac 2:1',     { book:'acts' });
assertParse('Ro 1:1',     'Ro 1:1',     { book:'romans' });

// ── Numbered book disambiguation ─────────────────────────────────────────
console.log('\n4. Numbered books:');
assertParse('1 John 4:8',   '1 John 4:8',   { book:'1_john' });
assertParse('1John 4:8',    '1John 4:8',     { book:'1_john' });
assertParse('1Jn 4:8',      '1Jn 4:8',       { book:'1_john' });
assertParse('2 Pet 3:9',    '2 Pet 3:9',     { book:'2_peter' });
assertParse('1 Chr 17:1',   '1 Chr 17:1',    { book:'1_chronicles' });
assertParse('2 Cor 5:17',   '2 Cor 5:17',    { book:'2_corinthians' });
assertParse('1 Tim 2:5',    '1 Tim 2:5',     { book:'1_timothy' });
assertParse('1 Thess 4:17', '1 Thess 4:17',  { book:'1_thessalonians' });

// ── URL generation ───────────────────────────────────────────────────────
console.log('\n5. URL generation:');
assertParse('URL: Gen 1', 'Genesis 1:1', { url:'ot/genesis/Genesis_1.html' });
assertParse('URL: Matt 5', 'Matt 5:3', { url:'nt/matthew/Matthew_5.html' });
assertParse('URL: 1 Kgs 18', '1 Kings 18:36', { url:'ot/1_kings/1_Kings_18.html' });
assertParse('URL: Ruth 2', 'Ruth 2:12', { url:'ot/ruth/Ruth_2.html' });

// ── Display strings ──────────────────────────────────────────────────────
console.log('\n6. Display strings:');
assertParse('Ref: Gen 22:1-3', 'Gen 22:1-3', { ref:'Genesis 22:1-3', shortRef:'Gen 22:1-3' });
assertParse('Ref: 1Kgs 8:27', '1Kgs 8:27', { ref:'1 Kings 8:27', shortRef:'1Kgs 8:27' });

// ── Edge cases ───────────────────────────────────────────────────────────
console.log('\n7. Edge cases:');
assertParse('Null input',     null,            null);
assertParse('Empty string',   '',              null);
assertParse('Gibberish',      'xyzzy 1:1',    null);
assertParse('Ch out of range', 'Genesis 51:1', null);
assertParse('Ch zero',        'Genesis 0:1',   null);
assertParse('En-dash range',  'Gen 22:1\u20133', { book:'genesis', ch:22, v1:1, v2:3 });

// ── Convenience functions ────────────────────────────────────────────────
console.log('\n8. Convenience:');
assert('toUrl', VR.toUrl('Gen 1:1') === 'ot/genesis/Genesis_1.html');
assert('toUrl null', VR.toUrl('xyzzy 1:1') === null);
assert('toShort', VR.toShort('Genesis 22:1') === 'Gen 22:1');
assert('getBook', VR.getBook('genesis').name === 'Genesis');
assert('getBook null', VR.getBook('notabook') === null);
assert('isLive Gen 1', VR.isLive('genesis', 1) === true);
assert('isLive Gen 50', VR.isLive('genesis', 50) === true);
assert('isLive Heb (not built)', VR.isLive('hebrews', 1) === false);
assert('allBooks count', VR.allBooks().length === 66);

// ── Results ──────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════');
if (failed === 0) {
  console.log('  ALL ' + passed + ' TESTS PASSED');
} else {
  console.log('  ' + failed + ' FAILED, ' + passed + ' passed');
  process.exit(1);
}

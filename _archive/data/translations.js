// data/translations.js — Translation Registry
// To add a new translation: add an entry here + drop verse files in verses/{slug}/
// No code changes required anywhere else.
window.SDD_TRANSLATIONS = [
  {
    slug: 'niv',
    label: 'NIV',
    name: 'New International Version',
    copyright: 'Scripture quotations taken from The Holy Bible, New International Version\u00ae NIV\u00ae Copyright \u00a9 1973 1978 1984 2011 by Biblica, Inc. Used with permission. All rights reserved.',
    isDefault: true
  },
  {
    slug: 'esv',
    label: 'ESV',
    name: 'English Standard Version',
    copyright: 'Scripture quotations are from the ESV\u00ae Bible (The Holy Bible, English Standard Version\u00ae), copyright \u00a9 2001 by Crossway. Used by permission. All rights reserved.'
  }
  // To add KJV, CSB, Amplified, etc:
  // { slug: 'kjv', label: 'KJV', name: 'King James Version', copyright: 'Public domain.' },
  // { slug: 'csb', label: 'CSB', name: 'Christian Standard Bible', copyright: '...' },
  // { slug: 'amp', label: 'AMP', name: 'Amplified Bible', copyright: '...' },
];

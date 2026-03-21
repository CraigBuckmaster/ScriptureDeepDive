// synoptic-map.js — Parallel passage mappings
// Each entry maps a pericope across multiple books.
// To add a mapping: append one object to SYNOPTIC_MAP.
// Consumed by: synoptic.js

window.SYNOPTIC_MAP = [

  // ── Triple Tradition (all three Synoptics) ──────────────────────────────

  { id:"baptism",         title:"The Baptism of Jesus",            category:"gospel",
    passages:[{book:"matthew",ref:"Matt 3:13-17"},{book:"mark",ref:"Mark 1:9-11"},{book:"luke",ref:"Luke 3:21-22"},{book:"john",ref:"John 1:29-34"}] },
  { id:"temptation",      title:"The Temptation",                  category:"gospel",
    passages:[{book:"matthew",ref:"Matt 4:1-11"},{book:"mark",ref:"Mark 1:12-13"},{book:"luke",ref:"Luke 4:1-13"}] },
  { id:"calling-4",       title:"Calling the First Disciples",     category:"gospel",
    passages:[{book:"matthew",ref:"Matt 4:18-22"},{book:"mark",ref:"Mark 1:16-20"},{book:"luke",ref:"Luke 5:1-11"}] },
  { id:"paralytic",       title:"Healing the Paralytic",           category:"gospel",
    passages:[{book:"matthew",ref:"Matt 9:1-8"},{book:"mark",ref:"Mark 2:1-12"},{book:"luke",ref:"Luke 5:17-26"}] },
  { id:"calling-levi",    title:"The Calling of Levi/Matthew",     category:"gospel",
    passages:[{book:"matthew",ref:"Matt 9:9-13"},{book:"mark",ref:"Mark 2:13-17"},{book:"luke",ref:"Luke 5:27-32"}] },
  { id:"twelve-sent",     title:"Sending Out the Twelve",          category:"gospel",
    passages:[{book:"matthew",ref:"Matt 10:1-15"},{book:"mark",ref:"Mark 6:7-13"},{book:"luke",ref:"Luke 9:1-6"}] },
  { id:"feeding-5000",    title:"Feeding of the Five Thousand",    category:"gospel",
    passages:[{book:"matthew",ref:"Matt 14:13-21"},{book:"mark",ref:"Mark 6:30-44"},{book:"luke",ref:"Luke 9:10-17"},{book:"john",ref:"John 6:1-14"}] },
  { id:"peter-confession",title:"Peter\u2019s Confession",         category:"gospel",
    passages:[{book:"matthew",ref:"Matt 16:13-20"},{book:"mark",ref:"Mark 8:27-30"},{book:"luke",ref:"Luke 9:18-21"}] },
  { id:"transfiguration",  title:"The Transfiguration",            category:"gospel",
    passages:[{book:"matthew",ref:"Matt 17:1-9"},{book:"mark",ref:"Mark 9:2-10"},{book:"luke",ref:"Luke 9:28-36"}] },
  { id:"greatest-servant", title:"The Greatest Must Be Servant",   category:"gospel",
    passages:[{book:"matthew",ref:"Matt 20:25-28"},{book:"mark",ref:"Mark 10:42-45"},{book:"luke",ref:"Luke 22:25-27"}] },
  { id:"triumphal-entry",  title:"The Triumphal Entry",            category:"gospel",
    passages:[{book:"matthew",ref:"Matt 21:1-11"},{book:"mark",ref:"Mark 11:1-11"},{book:"luke",ref:"Luke 19:28-44"},{book:"john",ref:"John 12:12-19"}] },
  { id:"temple-cleansing", title:"Cleansing the Temple",           category:"gospel",
    passages:[{book:"matthew",ref:"Matt 21:12-17"},{book:"mark",ref:"Mark 11:15-19"},{book:"luke",ref:"Luke 19:45-48"},{book:"john",ref:"John 2:13-22"}] },
  { id:"greatest-cmd",     title:"The Greatest Commandment",       category:"gospel",
    passages:[{book:"matthew",ref:"Matt 22:34-40"},{book:"mark",ref:"Mark 12:28-34"},{book:"luke",ref:"Luke 10:25-28"}] },
  { id:"olivet-discourse",  title:"The Olivet Discourse",          category:"gospel",
    passages:[{book:"matthew",ref:"Matt 24:1-44"},{book:"mark",ref:"Mark 13:1-37"},{book:"luke",ref:"Luke 21:5-36"}] },
  { id:"last-supper",      title:"The Last Supper",                category:"gospel",
    passages:[{book:"matthew",ref:"Matt 26:17-30"},{book:"mark",ref:"Mark 14:12-26"},{book:"luke",ref:"Luke 22:7-23"}] },
  { id:"gethsemane",       title:"Gethsemane",                     category:"gospel",
    passages:[{book:"matthew",ref:"Matt 26:36-46"},{book:"mark",ref:"Mark 14:32-42"},{book:"luke",ref:"Luke 22:39-46"}] },
  { id:"arrest",           title:"The Arrest",                     category:"gospel",
    passages:[{book:"matthew",ref:"Matt 26:47-56"},{book:"mark",ref:"Mark 14:43-52"},{book:"luke",ref:"Luke 22:47-53"},{book:"john",ref:"John 18:1-12"}] },
  { id:"peter-denial",     title:"Peter\u2019s Denial",            category:"gospel",
    passages:[{book:"matthew",ref:"Matt 26:69-75"},{book:"mark",ref:"Mark 14:66-72"},{book:"luke",ref:"Luke 22:54-62"},{book:"john",ref:"John 18:15-27"}] },
  { id:"crucifixion",      title:"The Crucifixion",                category:"gospel",
    passages:[{book:"matthew",ref:"Matt 27:32-56"},{book:"mark",ref:"Mark 15:21-41"},{book:"luke",ref:"Luke 23:26-49"},{book:"john",ref:"John 19:17-37"}] },
  { id:"burial",           title:"The Burial",                     category:"gospel",
    passages:[{book:"matthew",ref:"Matt 27:57-61"},{book:"mark",ref:"Mark 15:42-47"},{book:"luke",ref:"Luke 23:50-56"},{book:"john",ref:"John 19:38-42"}] },
  { id:"empty-tomb",       title:"The Empty Tomb",                 category:"gospel",
    passages:[{book:"matthew",ref:"Matt 28:1-10"},{book:"mark",ref:"Mark 16:1-8"},{book:"luke",ref:"Luke 24:1-12"},{book:"john",ref:"John 20:1-10"}] },

  // ── Matthew-Mark only ───────────────────────────────────────────────────

  { id:"feeding-4000",     title:"Feeding of the Four Thousand",   category:"gospel",
    passages:[{book:"matthew",ref:"Matt 15:32-39"},{book:"mark",ref:"Mark 8:1-10"}] },
  { id:"walking-water",    title:"Walking on Water",               category:"gospel",
    passages:[{book:"matthew",ref:"Matt 14:22-33"},{book:"mark",ref:"Mark 6:45-52"},{book:"john",ref:"John 6:16-21"}] },

  // ── Luke-only or Luke-special ───────────────────────────────────────────

  { id:"good-samaritan",   title:"The Good Samaritan",             category:"gospel-luke",
    passages:[{book:"luke",ref:"Luke 10:25-37"}] },
  { id:"prodigal-son",     title:"The Prodigal Son",               category:"gospel-luke",
    passages:[{book:"luke",ref:"Luke 15:11-32"}] },
  { id:"rich-man-lazarus", title:"The Rich Man and Lazarus",       category:"gospel-luke",
    passages:[{book:"luke",ref:"Luke 16:19-31"}] },
  { id:"emmaus",           title:"The Road to Emmaus",             category:"gospel-luke",
    passages:[{book:"luke",ref:"Luke 24:13-35"}] },

  // ── John-only ───────────────────────────────────────────────────────────

  { id:"wedding-cana",     title:"The Wedding at Cana",            category:"gospel-john",
    passages:[{book:"john",ref:"John 2:1-12"}] },
  { id:"nicodemus",        title:"Nicodemus",                      category:"gospel-john",
    passages:[{book:"john",ref:"John 3:1-21"}] },
  { id:"samaritan-woman",  title:"The Woman at the Well",          category:"gospel-john",
    passages:[{book:"john",ref:"John 4:1-42"}] },
  { id:"lazarus-raised",   title:"The Raising of Lazarus",         category:"gospel-john",
    passages:[{book:"john",ref:"John 11:1-44"}] },
  { id:"farewell-discourse",title:"The Farewell Discourse",        category:"gospel-john",
    passages:[{book:"john",ref:"John 14:1-31"},{book:"john",ref:"John 15:1-27"},{book:"john",ref:"John 16:1-33"}] },

  // ── OT Parallels ───────────────────────────────────────────────────────

  { id:"solomons-temple",  title:"Solomon Builds the Temple",      category:"ot-parallel",
    passages:[{book:"1_kings",ref:"1 Kgs 6:1-38"},{book:"1_kings",ref:"1 Kgs 7:13-51"}] },
  { id:"temple-dedication",title:"Temple Dedication Prayer",       category:"ot-parallel",
    passages:[{book:"1_kings",ref:"1 Kgs 8:22-53"}] },
  { id:"elijah-carmel",    title:"Elijah on Mount Carmel",         category:"ot-parallel",
    passages:[{book:"1_kings",ref:"1 Kgs 18:20-46"}] },
  { id:"david-anointed",   title:"David Anointed King",            category:"ot-parallel",
    passages:[{book:"1_samuel",ref:"1 Sam 16:1-13"},{book:"2_samuel",ref:"2 Sam 2:4"},{book:"2_samuel",ref:"2 Sam 5:3"}] },
  { id:"davidic-covenant", title:"The Davidic Covenant",           category:"ot-parallel",
    passages:[{book:"2_samuel",ref:"2 Sam 7:1-17"},{book:"1_kings",ref:"1 Kgs 8:22-26"}] }
];

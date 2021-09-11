FrozenCookies.preferenceValues = {
  // clicking options
  clickingOptions: {
    hint: "Auto clicking options:",
  },
  autoClick: {
    hint: "Click the large cookie",
    display: ["Autoclick OFF", "Autoclick ON"],
    default: 0,
    extras:
      '<a class="option" id="cookieClickSpeed" onclick="updateSpeed(\'cookieClickSpeed\');">${cookieClickSpeed} clicks/sec</a>',
  },
  autoFrenzy: {
    hint: "Click the large cookie during Clicking Frenzies",
    display: ["Autofrenzy OFF", "Autofrenzy ON"],
    default: 0,
    extras:
      '<a class="option" id="frenzyClickSpeed" onclick="updateSpeed(\'frenzyClickSpeed\');">${frenzyClickSpeed} clicks/sec</a>',
  },
  autoGC: {
    hint: "Automatically click Golden Cookies when they appear",
    display: ["Autoclick GC OFF", "Autoclick GC ON"],
    default: 0,
  },
  autoReindeer: {
    hint: "Automatically click reindeer",
    display: ["Autoclick Reindeer OFF", "Autoclick Reindeer ON"],
    default: 0,
  },
  autoFortune: {
    hint: "Automatically click the news ticker when Fortune News appears",
    display: ["Auto Fortune OFF", "Auto Fortune ON"],
    default: 0,
  },

  // autobuy options
  buyingOptions: {
    hint: "Auto buying options:",
  },
  autoBuy: {
    hint: "Automatically buy the most efficient building when you've met its cost",
    display: ["AutoBuy OFF", "AutoBuy ON"],
    default: 0,
  },
  autoBulk: {
    hint: "Automatically set buildings to be bought in bulk after reincarnation",
    display: ["Auto Bulkbuy OFF", "Auto Bulkbuy x10", "Auto Bulkbuy x100"],
    default: 0,
  },
  autoBlacklistOff: {
    hint: "Automatically turn off a blacklist once the goal for that blacklist is achieved",
    display: ["Auto Blacklist OFF", "Auto Blacklist ON"],
    default: 0,
  },
  blacklist: {
    hint: "Blacklist purchases from the efficiency calculations",
    display: [
      "Blacklist OFF",
      "Blacklist Mode SPEEDRUN",
      "Blacklist Mode HARDCORE",
      "Blacklist Mode GRANDMAPOCALYPSE",
      "Blacklist Mode NO BUILDINGS",
    ],
    default: 0,
  },
  cursorLimit: {
    hint: "Limit max number of cursors to keep Godzamok useful",
    display: ["Cursor Limit OFF", "Cursor Limit ON"],
    default: 0,
    extras:
      '<a class="option" id="cursorMax" onclick="updateCursorMax(\'cursorMax\');">${cursorMax} Cursors</a>',
  },
  farmLimit: {
    hint: "Limit max number of farms to keep Godzamok useful",
    display: ["Farm Limit OFF", "Farm Limit ON"],
    default: 0,
    extras:
      '<a class="option" id="farmMax" onclick="updateFarmMax(\'farmMax\');">${farmMax} Farms</a>',
  },
  towerLimit: {
    hint: "Stop autobuying Wizard Towers at selected Max Mana, for spellcasting efficiency",
    display: ["Wizard Tower Cap OFF", "Wizard Tower Cap ON"],
    default: 0,
    extras:
      '<a class="option" id="manaMax" onclick="updateManaMax(\'manaMax\');">${manaMax} max Mana</a>',
  },
  pastemode: {
    hint: "Always autobuy the least efficient purchase. This is a stupid idea, you should never turn this on.",
    display: ["Pastemode OFF", "Pastemode ON"],
    default: 0,
  },

  // other auto options
  autoOtherOptions: {
    hint: "Other automatic actions:",
  },
  autoAscend: {
    hint: "Automatically ascend when your heavenly chip count hits a certain number. (Note: this will skip the upgrade screen)",
    display: ["Autoascend OFF", "Autoascend ON"],
    default: 0,
    extras:
      '<a class="option" id="chipsToAscend" onclick="updateAscendAmount(\'HCAscendAmount\');">${HCAscendAmount} heavenly chips</a>',
  },
  autoWrinkler: {
    hint: "Automatically pop wrinklers efficiently (calculated timing to balance cookies vs. upgrades) or instantly",
    display: [
      "Autopop Wrinklers OFF",
      "Autopop Wrinklers EFFICIENTLY",
      "Autopop Wrinklers INSTANTLY",
    ],
    default: 0,
  },
  autoSL: {
    hint: "Automatically harvest sugar lumps when ripe, with option to automatically swap in Rigidel",
    display: [
      "Autoharvest SL OFF",
      "Autoharvest SL ON",
      "Autoharvest SL ON + AUTO RIGIDEL",
    ],
    default: 0,
  },
  autoGS: {
    hint: "Automatically turn on the Golden Switch during Dragonflight and Click Frenzy (and turn back off at the end)",
    display: ["Auto-GS-Switch OFF", "Auto-GS-Switch ON"],
    default: 0,
  },
  autoGodzamok: {
    hint: "Automatically sell all cursors and farms (except one farm) during Dragonflight and Click Frenzy if you worship Godzamok and prevents rapid buy/sell spam",
    display: ["Auto-Godzamok OFF", "Auto-Godzamok ON"],
    default: 0,
  },
  autoSpell: {
    hint: "Automatically cast selected spell when your mana is full",
    display: [
      "Auto Cast OFF",
      "Auto Cast CONJURE BAKED GOODS",
      "Auto Cast FORCE THE HAND OF FATE",
      "Auto Cast SPONTANEOUS EDIFICE",
      "Auto Cast HAGGLER'S CHARM (cheapest)",
    ],
    default: 0,
    extras:
      '<a class="option" id="minCpSMult" onclick="updateCpSMultMin(\'minCpSMult\');">x${minCpSMult} minimum Frenzy</a>',
  },

  //Display options
  displayOptions: {
    hint: "Display options:",
  },
  numberDisplay: {
    hint: "Change how numbers are shortened",
    display: [
      "Number Display RAW",
      "Number Display FULL (million, billion)",
      "Number Display INITIALS (M, B)",
      "Number Display SI UNITS (M, G, T)",
      "Number Display SCIENTIFIC (6.3e12)",
    ],
    default: 1,
  },
  fancyui: {
    hint: "Infobox type (can be slow)",
    display: [
      "Infobox OFF",
      "Infobox TEXT ONLY",
      "Infobox WHEEL ONLY",
      "Infobox WHEEL & TEXT",
    ],
    default: 0,
  },

  //Other options
  otherOptions: {
    hint: "Other options:",
  },
  /*Not working yet
    'shinyPop':{
        'hint':'Protect the endangered Shiny Wrinkler from being auomatically popped',
        'display':['Save Shiny Wrinklers ON', 'Save Shiny Wrinklers OFF'],
        'default':0
    },
    */
  holdSEBank: {
    hint: "Maintain a bank for Spontaneous Edifice (already enabled if Auto Casting SE)",
    display: ["SE Bank OFF", "SE Bank ON"],
    default: 0,
  },
  setHarvestBankPlant: {
    hint: "Maintain a bank for a specific plant you are going to harvest/let explode",
    display: [
      "Harvesting Bank OFF",
      "Harvesting Bank BAKEBERRY",
      "Harvesting Bank CHOCOROOT",
      "Harvesting Bank WHITE CHOCOROOT",
      "Harvesting Bank QUEEENBEET",
      "Harvesting Bank DUKETATER",
      "Harvesting Bank CRUMBSPORE",
      "Harvesting Bank DOUGHSHROOM",
    ],
    default: 0,
  },
  setHarvestBankType: {
    hint: "Calculate the needed harvesting bank based on whether a CPS multiplier is in effect when you intend to harvest (no effect if no plant was selected above).",
    display: [
      "Harvesting during NO CPS MULTIPLER",
      "Harvesting during FRENZY",
      "Harvesting during BUILDING SPECIAL",
      "Harvesting during FRENZY + BUILDING SPECIAL",
    ],
    default: 0,
    extras:
      '<a class="option" id="maxSpecials" onclick="updateMaxSpecials(\'maxSpecials\');">${maxSpecials} Building specials</a>',
  },
  /*
    'timeTravelMethod':{
        'hint':'Time travel is unstable. This determines how time travel works. If you\'re unsure, don\'t touch this.',
        'display':['Time Travel DISABLED'], //, 'Purchases by Estimated Effective CPS', 'Purchases by Simulated Real Time', 'Heavenly Chips by Estimated Effective CPS', 'Heavenly Chips by Simulated Real Time'],
        'default':0,
        'extras':'<a class="option" id="timeTravelPurchases" onclick="updateTimeTravelAmount();">Set Time Travel Amount</a>'
    },
    */
  simulatedGCPercent: {
    hint: 'Assume a percentage of Golden Cookies as "clicked" for GC efficiency calculations (100% recommended)',
    display: ["0%", "100%"],
    default: 1,
  },
  fpsModifier: {
    hint: "Run the game at the selected frame rate (browser default is 30). 60 is twice as fast, 15 is half as fast, etc. If you're not sure, keep this at 30",
    display: [
      "Frame Rate 15 fps",
      "Frame Rate 24 fps",
      "Frame Rate 30 fps",
      "Frame Rate 48 fps",
      "Frame Rate 60 fps",
      "Frame Rate 72 fps",
      "Frame Rate 88 fps",
      "Frame Rate 100 fps",
      "Frame Rate 120 fps",
      "Frame Rate 144 fps",
      "Frame Rate 200 fps",
      "Frame Rate 240 fps",
      "Frame Rate 300 fps",
      "Frame Rate 5 fps",
      "Frame Rate 10 fps",
    ],
    default: 2,
  },
  logging: {
    hint: "Display detailed logs in the javascript console",
    display: ["Logging OFF", "Logging ON"],
    default: 1,
  },
  trackStats: {
    hint: "Track your CpS / HC earned over time during a single session to enable graphing. This may end up being *extremely* memory-intensive",
    display: [
      "Tracking OFF",
      "Tracking EVERY 60s",
      "Tracking EVERY 30m",
      "Tracking EVERY 1h",
      "Tracking EVERY 24h",
      "Tracking ON UPGRADES",
      "Tracking SMART TIMING",
    ],
    default: 0,
    extras:
      '<a class="option" id="viewStats" onclick="viewStatGraphs();">View Stat Graphs</a>',
  },

  /*Doesnt work
    'showAchievements':{
        'hint':'Show achievement popups (Kind of broken early game)',
        'display':['Achievement Popups OFF', 'Achievement Popups ON'],
        'default':0
    },
    */

  defaultSeason: {
    hint: "Autobuy a selected season when no others have needed upgrades",
    display: [
      "Default Season OFF",
      "Default Season BUSINESS DAY",
      "Default Season CHRISTMAS",
      "Default Season EASTER",
      "Default Season HALLOWEEN",
      "Default Season VALENTINE'S DAY",
    ],
    default: 0,
  },
};

FrozenCookies.preferenceValues = {
    'autoBuy':{
        'hint':'Automatically buy the most efficient building when you\'ve met its cost',
        'display':["Autobuy OFF","Autobuy ON"],
        'default':0
    },
    'autoAscend':{
        'hint':'Automatically ascend when your heavenly chip count hits a certain number. (note: this will skip the upgrade screen)',
        'display':["Autoascend OFF", "Autoascend ON"],
        'default':0,
        'extras':'<a class="option" id="chipsToAscend" onclick="updateAscendAmount(\'HCAscendAmount\');">${HCAscendAmount} heavenly chips</a>'
    },
    'autoGC':{
        'hint':'Automatically click Golden Cookies when they appear.',
        'display':["Autoclick GC OFF", "Autoclick GC ON"],
        'default':0
    },
    'autoWrinkler':{
        'hint':'Automatically pop wrinklers efficiently or instantly.',
        'display':['Autopop Wrinklers OFF', 'Autopop Wrinklers Efficiently', 'Autopop Wrinklers Instantly'],
        'default':0
    },
    'autoSL':{
        'hint':'Automatically harvest sugar lumps when ripe.',
        'display':["Autoharvest SL OFF", "Autoharvest SL ON"],
        'default':0
    },
    'autoReindeer':{
        'hint':'Automatically click reindeer.',
        'display':['Autoclick Reindeer OFF', 'Autoclick Reindeer ON'],
        'default':0
    },
    'autoClick':{
        'hint':'Click the large cookie.',
        'display':['Autoclick OFF', 'Autoclick ON'],
        'default':0,
        'extras':'<a class="option" id="cookieClickSpeed" onclick="updateSpeed(\'cookieClickSpeed\');">${cookieClickSpeed} clicks/sec</a>'
    },
    'autoFrenzy':{
        'hint':'Click the large cookie during Clicking Frenzies.',
        'display':['Autofrenzy OFF', 'Autofrenzy ON'],
        'default':0,
        'extras':'<a class="option" id="frenzyClickSpeed" onclick="updateSpeed(\'frenzyClickSpeed\');">${frenzyClickSpeed} clicks/sec</a>'
    },
    'autoBlacklistOff':{
        'hint':'Automatically turns off a blacklist once the goal for that blacklist is achieved.',
        'display':['Auto Blacklist OFF', 'Auto Blacklist ON'],
        'default':0
    },
    'blacklist':{
        'hint':'Blacklist purchases from the efficiency calculations.',
        'display':['No Blacklist', 'Speedrun Blacklist', 'Hardcore Blacklist', 'Grandmapocalypse Mode', 'No Buildings'],
        'default':0
    },
/*  'timeTravelMethod':{
        'hint':'Time travel is unstable. This determines how time travel works. If you\'re unsure, don\'t touch this.',
        'display':['Time Travel DISABLED'],//,'Purchases by Estimated Effective CPS','Purchases by Simulated Real Time','Heavenly Chips by Estimated Effective CPS','Heavenly Chips by Simulated Real Time'],
        'default':0,
        'extras':'<a class="option" id="timeTravelPurchases" onclick="updateTimeTravelAmount();">Set Time Travel Amount</a>'
    },*/
    'pastemode':{
        'hint':'Always autobuy the least efficient purchase. This is a stupid idea, you should never turn this on.',
        'display':['Pastemode OFF','Pastemode ON'],
        'default':0
    },
    'simulatedGCPercent':{
        'hint':'What percentage of Golden Cookies should be assumed as "clicked" for GC efficiency calculations (100% recommended)',
        'display':["0%","100%"],
        'default':1
    },
    'fpsModifier':{
        'hint':'The frame rate at which the game runs. 60 is twice as fast, 15 is half as fast, etc. If you\'re not sure, keep this at 30.',
        'display':['24','25','30','48','50','60','72','90','100','120','144','200','240','300'],
        'default':2
    },
    'logging':{
        'hint':'Display detailed logs in the javascript console.',
        'display':['Logging OFF', 'Logging ON'],
        'default':1
    },
    'trackStats':{
        'hint':'Track your CPS/HC earned over time during a single session to enable graphing. This may end up being *extremely* memory-intensive.',
        'display':['Tracking OFF', 'Every 60s', 'Every 30m', 'Every 1h', 'Every 24h', 'On upgrades', 'Smart Timing'],
        'default':0,
        'extras':'<a class="option" id="viewStats" onclick="viewStatGraphs();">View Stat Graphs</a>'
    },
    'showAchievements':{
        'hint':'Show achievement popups (Kind of broken early game)',
        'display':['Achievement Popups OFF','Achievement Popups ON'],
        'default':0
    },
    'numberDisplay':{
        'hint':'Change how numbers are shortened',
        'display':["Raw Numbers","Full Word (million, billion)","Initials (M, B)","SI Units (M, G, T)", "Scientific Notation (6.3e12)"],
        'default':1
    },
    'autoGS':{
        'hint':'Automatically turn on the Golden Switch during Dragonflight and Click Frenzy',
        'display':['Auto-Switch OFF','Auto-Switch ON'],
        'default':0
    },
    'autoGodzamok':{
        'hint':'Automatically sell all cursors during Dragonflight and Click Frenzy if you worship Godzamok ("Sane" prevents rapid buy/sell spam)',
        'display':['Auto-Godzamok OFF','Auto-Godzamok ON','Auto-Godzamok ON (Sane)'],
        'default':0
    },
    'defaultSeason':{
        'hint':'Season to maintain when no others have needed upgrades',
        'display':['Default Season: None','Default Season: Business Day','Default Season: Christmas','Default Season: Easter','Default Season: Halloween',"Default Season: Valentine's Day"],
        'default':0
    }
};

// Unused, for now:
function buildUpgradeList() {
    return _.compact(_.flatten(Game.ObjectsById.map(function(b){return b.buyFunction.toString().match(/if\s?\(this\.amount>=(\d+)\)\s?Game\.Unlock\((.+?)\);/g).map(function(matched){
        var res = /if\s?\(this\.amount>=(\d+)\)\s?Game\.Unlock\((.+?)\);/.exec(matched);
        var template = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        template[b.id] += eval(res[1]);

        return Game.Upgrades[eval(res[2])] ? {id: Game.Upgrades[eval(res[2])].id, buildings: template, upgrades: []} : eval(res[2]).map(function(u){return {id: Game.Upgrades[u].id, buildings: template, upgrades: []}});
    })})));
}

var upgradeJson = {
    // Cursor tiered upgrades
    0: {'buildings': [1], 'upgrades': []},
    1: {'buildings': [1], 'upgrades': []},
    2: {'buildings': [10], 'upgrades': []},
    3: {'buildings': [25], 'upgrades': []},
    4: {'buildings': [50], 'upgrades': []},
    5: {'buildings': [100], 'upgrades': []},
    6: {'buildings': [150], 'upgrades': []},
    43: {'buildings': [200], 'upgrades': []},
    82: {'buildings': [250], 'upgrades': []},
    109: {'buildings': [300], 'upgrades': []},
    188: {'buildings': [350], 'upgrades': []},
    189: {'buildings': [400], 'upgrades': []},

    // Grandma tiered upgrades
    7: {'buildings': [0,1], 'upgrades': []},
    8: {'buildings': [0,5], 'upgrades': []},
    9: {'buildings': [0,25], 'upgrades': []},
    44: {'buildings': [0,50], 'upgrades': []},
    110: {'buildings': [0,100], 'upgrades': []},
    192: {'buildings': [0,150], 'upgrades': []},
    294: {'buildings': [0,200], 'upgrades': []},
    307: {'buildings': [0,250], 'upgrades': []},
    428: {'buildings': [0,300], 'upgrades': []},

    // Farm tiered upgrades
    10: {'buildings': [0,0,1], 'upgrades': []},
    11: {'buildings': [0,0,5], 'upgrades': []},
    12: {'buildings': [0,0,25], 'upgrades': []},
    45: {'buildings': [0,0,50], 'upgrades': []},
    111: {'buildings': [0,0,100], 'upgrades': []},
    193: {'buildings': [0,0,150], 'upgrades': []},
    295: {'buildings': [0,0,200], 'upgrades': []},
    308: {'buildings': [0,0,250], 'upgrades': []},
    429: {'buildings': [0,0,300], 'upgrades': []},

    // Mine tiered upgrades
    16: {'buildings': [0,0,0,1], 'upgrades': []},
    17: {'buildings': [0,0,0,5], 'upgrades': []},
    18: {'buildings': [0,0,0,25], 'upgrades': []},
    47: {'buildings': [0,0,0,50], 'upgrades': []},
    113: {'buildings': [0,0,0,100], 'upgrades': []},
    195: {'buildings': [0,0,0,150], 'upgrades': []},
    296: {'buildings': [0,0,0,200], 'upgrades': []},
    309: {'buildings': [0,0,0,250], 'upgrades': []},
    430: {'buildings': [0,0,0,300], 'upgrades': []},

    // Factory tiered upgrades
    13: {'buildings': [0,0,0,0,1], 'upgrades': []},
    14: {'buildings': [0,0,0,0,5], 'upgrades': []},
    15: {'buildings': [0,0,0,0,25], 'upgrades': []},
    46: {'buildings': [0,0,0,0,50], 'upgrades': []},
    112: {'buildings': [0,0,0,0,100], 'upgrades': []},
    194: {'buildings': [0,0,0,0,150], 'upgrades': []},
    297: {'buildings': [0,0,0,0,200], 'upgrades': []},
    310: {'buildings': [0,0,0,0,250], 'upgrades': []},
    431: {'buildings': [0,0,0,0,300], 'upgrades': []},

    // Bank tiered upgrades
    232: {'buildings': [0,0,0,0,0,1], 'upgrades': []},
    233: {'buildings': [0,0,0,0,0,5], 'upgrades': []},
    234: {'buildings': [0,0,0,0,0,25], 'upgrades': []},
    235: {'buildings': [0,0,0,0,0,50], 'upgrades': []},
    236: {'buildings': [0,0,0,0,0,100], 'upgrades': []},
    237: {'buildings': [0,0,0,0,0,150], 'upgrades': []},
    298: {'buildings': [0,0,0,0,0,200], 'upgrades': []},
    311: {'buildings': [0,0,0,0,0,250], 'upgrades': []},
    432: {'buildings': [0,0,0,0,0,300], 'upgrades': []},

    // Temple tiered upgrades
    238: {'buildings': [0,0,0,0,0,0,1], 'upgrades': []},
    239: {'buildings': [0,0,0,0,0,0,5], 'upgrades': []},
    240: {'buildings': [0,0,0,0,0,0,25], 'upgrades': []},
    241: {'buildings': [0,0,0,0,0,0,50], 'upgrades': []},
    242: {'buildings': [0,0,0,0,0,0,100], 'upgrades': []},
    243: {'buildings': [0,0,0,0,0,0,150], 'upgrades': []},
    299: {'buildings': [0,0,0,0,0,0,200], 'upgrades': []},
    312: {'buildings': [0,0,0,0,0,0,250], 'upgrades': []},
    433: {'buildings': [0,0,0,0,0,0,300], 'upgrades': []},

    // Wizard Tower tiered upgrades
    244: {'buildings': [0,0,0,0,0,0,0,1], 'upgrades': []},
    245: {'buildings': [0,0,0,0,0,0,0,5], 'upgrades': []},
    246: {'buildings': [0,0,0,0,0,0,0,25], 'upgrades': []},
    247: {'buildings': [0,0,0,0,0,0,0,50], 'upgrades': []},
    248: {'buildings': [0,0,0,0,0,0,0,100], 'upgrades': []},
    249: {'buildings': [0,0,0,0,0,0,0,150], 'upgrades': []},
    300: {'buildings': [0,0,0,0,0,0,0,200], 'upgrades': []},
    313: {'buildings': [0,0,0,0,0,0,0,250], 'upgrades': []},
    434: {'buildings': [0,0,0,0,0,0,0,300], 'upgrades': []},

    // Shipment tiered upgrades
    19: {'buildings': [0,0,0,0,0,0,0,0,1], 'upgrades': []},
    20: {'buildings': [0,0,0,0,0,0,0,0,5], 'upgrades': []},
    21: {'buildings': [0,0,0,0,0,0,0,0,25], 'upgrades': []},
    48: {'buildings': [0,0,0,0,0,0,0,0,50], 'upgrades': []},
    114: {'buildings': [0,0,0,0,0,0,0,0,100], 'upgrades': []},
    196: {'buildings': [0,0,0,0,0,0,0,0,150], 'upgrades': []},
    301: {'buildings': [0,0,0,0,0,0,0,0,200], 'upgrades': []},
    314: {'buildings': [0,0,0,0,0,0,0,0,250], 'upgrades': []},
    435: {'buildings': [0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Alchemy lab tiered upgrades
    22: {'buildings': [0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    23: {'buildings': [0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    24: {'buildings': [0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    49: {'buildings': [0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    115: {'buildings': [0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    197: {'buildings': [0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    302: {'buildings': [0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    315: {'buildings': [0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    436: {'buildings': [0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Portal tiered upgrades
    25: {'buildings': [0,0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    26: {'buildings': [0,0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    27: {'buildings': [0,0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    50: {'buildings': [0,0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    116: {'buildings': [0,0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    198: {'buildings': [0,0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    303: {'buildings': [0,0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    316: {'buildings': [0,0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    437: {'buildings': [0,0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Time machine tiered upgrades
    28: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    29: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    30: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    51: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    117: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    199: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    304: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    317: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    438: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Antimatter condenser tiered upgrades
    99: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    100: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    101: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    102: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    118: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    200: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    305: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    318: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    439: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Prism tiered upgrades
    175: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    176: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    177: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    178: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    179: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    201: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    306: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    319: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    440: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Chancemaker tiered upgrades
    416: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], 'upgrades': []},
    417: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,5], 'upgrades': []},
    418: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,25], 'upgrades': []},
    419: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,50], 'upgrades': []},
    420: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,100], 'upgrades': []},
    421: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,150], 'upgrades': []},
    422: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,200], 'upgrades': []},
    423: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,250], 'upgrades': []},
    441: {'buildings': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,300], 'upgrades': []},

    // Grandma upgrades
    57: {'buildings': [0,1,15], 'upgrades': []},
    58: {'buildings': [0,1,0,15], 'upgrades': []},
    59: {'buildings': [0,1,0,0,15], 'upgrades': []},
    60: {'buildings': [0,1,0,0,0,15], 'upgrades': []},
    61: {'buildings': [0,1,0,0,0,0,15], 'upgrades': []},
    62: {'buildings': [0,1,0,0,0,0,0,15], 'upgrades': []},
    63: {'buildings': [0,1,0,0,0,0,0,0,15], 'upgrades': []},
    103: {'buildings': [0,1,0,0,0,0,0,0,0,15], 'upgrades': []},
    180: {'buildings': [0,1,0,0,0,0,0,0,0,0,15], 'upgrades': []},
    250: {'buildings': [0,1,0,0,0,0,0,0,0,0,0,15], 'upgrades': []},
    251: {'buildings': [0,1,0,0,0,0,0,0,0,0,0,0,15], 'upgrades': []},
    252: {'buildings': [0,1,0,0,0,0,0,0,0,0,0,0,0,15], 'upgrades': []},
    415: {'buildings': [0,1,0,0,0,0,0,0,0,0,0,0,0,0,15], 'upgrades': []},

    // Reward cookies
    334: {'buildings': [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100], 'upgrades': []},
    335: {'buildings': [150,150,150,150,150,150,150,150,150,150,150,150,150,150,150], 'upgrades': []},
    336: {'buildings': [200,200,200,200,200,200,200,200,200,200,200,200,200,200,200], 'upgrades': []},
    337: {'buildings': [250,250,250,250,250,250,250,250,250,250,250,250,250,250,250], 'upgrades': []},
    400: {'buildings': [300,300,300,300,300,300,300,300,300,300,300,300,300,300,300], 'upgrades': []},

    // Grandmapocalypse research
    64: {'buildings': [0,6], 'upgrades': [57,58,59,60,61,62,63]},
    65: {'buildings': [], 'upgrades': [64]},
    66: {'buildings': [], 'upgrades': [65]},
    67: {'buildings': [], 'upgrades': [66]},
    68: {'buildings': [], 'upgrades': [67]},
    69: {'buildings': [], 'upgrades': [68]},
    70: {'buildings': [], 'upgrades': [69]},
    71: {'buildings': [], 'upgrades': [70]},
    72: {'buildings': [], 'upgrades': [71]},
    73: {'buildings': [], 'upgrades': [72]},
    74: {'buildings': [], 'upgrades': [73]},
    75: {'buildings': [], 'upgrades': [73]},
    84: {'buildings': [], 'upgrades': [73]},
    85: {'buildings': [], 'upgrades': [73]},

    // Heavenly chips
    130: {'buildings': [], 'upgrades': [129]},
    131: {'buildings': [], 'upgrades': [130]},
    132: {'buildings': [], 'upgrades': [131]},
    133: {'buildings': [], 'upgrades': [132]},

    // Santa upgrades
    152: {'buildings': [], 'upgrades': [182]},
    153: {'buildings': [], 'upgrades': [152], 'santa': 1},
    154: {'buildings': [], 'upgrades': [152], 'santa': 1},
    155: {'buildings': [], 'upgrades': [152], 'santa': 1},
    156: {'buildings': [], 'upgrades': [152], 'santa': 1},
    157: {'buildings': [], 'upgrades': [152], 'santa': 1},
    158: {'buildings': [], 'upgrades': [152], 'santa': 1},
    159: {'buildings': [], 'upgrades': [152], 'santa': 1},
    160: {'buildings': [], 'upgrades': [152], 'santa': 1},
    161: {'buildings': [], 'upgrades': [152], 'santa': 1},
    162: {'buildings': [], 'upgrades': [152], 'santa': 1},
    163: {'buildings': [], 'upgrades': [152], 'santa': 1},
    164: {'buildings': [], 'upgrades': [152], 'santa': 1},
    165: {'buildings': [], 'upgrades': [152], 'santa': 1},
    166: {'buildings': [], 'upgrades': [152], 'santa': 1},
    168: {'buildings': [], 'upgrades': [152], 'santa': 14},

    // Season switching
    182: {'buildings': [], 'upgrades': [181]},
    183: {'buildings': [], 'upgrades': [181]},
    184: {'buildings': [], 'upgrades': [181]},

    // Halloween season
    134: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    135: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    136: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    137: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    138: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    139: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},
    140: {'buildings': [], 'upgrades': [69,183], 'wrinklers': 1},

    // Christmas season
    143: {'buildings': [], 'upgrades': [182]},
    144: {'buildings': [], 'upgrades': [182]},
    145: {'buildings': [], 'upgrades': [182]},
    146: {'buildings': [], 'upgrades': [182]},
    147: {'buildings': [], 'upgrades': [182]},
    148: {'buildings': [], 'upgrades': [182]},
    149: {'buildings': [], 'upgrades': [182]},

    // Valentine's Day season
    169: {'buildings': [], 'upgrades': [184]},
    170: {'buildings': [], 'upgrades': [169,184]},
    171: {'buildings': [], 'upgrades': [170,184]},
    172: {'buildings': [], 'upgrades': [171,184]},
    173: {'buildings': [], 'upgrades': [172,184]},
    174: {'buildings': [], 'upgrades': [173,184]}
};

var blacklist = [
    {
        'upgrades': [],
        'buildings': []
    },
    {
        'upgrades': [129,130,131,132,133],
        'buildings': []
    },
    {
        'upgrades': true,
        'buildings': []
    },
    {
        'upgrades': [71, 72, 73, 74, 84, 85],
        'buildings': []
    },
    {
        'upgrades': [],
        'buildings': true
    }
];

var seasons = ['','fools','christmas','easter','halloween','valentines'];

var halloweenCookies = [134,135,136,137,138,139,140];
var christmasCookies = [143,144,145,146,147,148,149];
var holidayCookies = {
    halloween: [134,135,136,137,138,139,140],
    christmas: [143,144,145,146,147,148,149],
    valentines: [169,170,171,172,173,174],
    easter: [210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229]
}

var cookieInfo = {
    'clot':        {'odds':[0,0.10386789477947,0.19565417350258,0.279830557040944],                   isOverlap:false},
    'frenzy':      {'odds':[0.475438636303817,0.330397784579005,0.17665214624519,0],                  isOverlap:false},
    'blood':       {'odds':[0,0.021118483342717,0.042826537084539,0.065166067095688],                 isOverlap:false},
    'chain':       {'odds':[0.004445863757111,0.025152456647178,0.046465712706818,0.068600124409242], isOverlap:false},
    'ruin':        {'odds':[0,0.059020277260868,0.111661484235184,0.171880882712373],                 isOverlap:false},
    'frenzyRuin':  {'odds':[0,0.031491314174174,0.033674609798233,0],                                 isOverlap:true},
    'clotRuin':    {'odds':[0,0.013356303344429,0.050318079469162,0.107949674328571],                 isOverlap:true},
    'lucky':       {'odds':[0.070071731013916,0.113288563286977,0.146693408687535,0.171634249195106], isOverlap:false},
    'frenzyLucky': {'odds':[0.405366905290347,0.219293086015375,0.083880131161928,0],                 isOverlap:true},
    'clotLucky':   {'odds':[0,0.046715208884435,0.081736878830784,0.107949674328571],                 isOverlap:true},
    'click':       {'odds':[0.022561043069409,0.020309670016808,0.019242724580528,0.019177860550822], isOverlap:false},
    'frenzyClick': {'odds':[0.022115820565423,0.012720131151967,0.005384749977878,0],                 isOverlap:true},
    'clotClick':   {'odds':[0,0.001307530606642,0.005809363719639,0.007810910338684],                 isOverlap:true},
    'blah':        {'odds':[0,0,0,0],                                                                 isOverlap:false}
};

function generateProbabilities(upgradeMult, minBase, maxMult) {
    var cumProb = [];
    var remainingProbability = 1;
    var minTime = minBase * upgradeMult;
    var maxTime = maxMult * minTime;
    var spanTime = maxTime - minTime;
    for (var i=0; i<maxTime; i++) {
        var thisFrame = remainingProbability * Math.pow(Math.max(0,(i-minTime)/spanTime),5);
        remainingProbability -= thisFrame;
        cumProb.push(1 - remainingProbability);
    }
    return cumProb;
}

var cumulativeProbabilityList = {
    golden : [1, 0.95, 0.5, 0.475, 0.25, 0.2375].reduce(function(r,x) {
        r[x] = generateProbabilities(x, 5 * 60 * Game.fps, 3);
        return r;
    }, {}),
    reindeer : [1, 0.5].reduce(function(r,x) {
        r[x] = generateProbabilities(x, 3 * 60 * Game.fps, 2);
        return r;
    }, {})
};

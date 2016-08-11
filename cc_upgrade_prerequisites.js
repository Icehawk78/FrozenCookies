FrozenCookies.preferenceValues = {
  'autoBuy':{
    'hint':'Automatically buy the most efficient building when you\'ve met its cost',
    'display':["Autobuy OFF","Autobuy ON"],
    'default':0
  },
  'autoGC':{
    'hint':'Automatically click Golden Cookies when they appear',
    'display':["Autoclick GC OFF", "Autoclick GC ON"],
    'default':0
  },
  'autoWrinkler':{
    'hint':'Automatically pop wrinklers efficiently (as fast as possible before you have all halloween cookies, then wait until a purchase)',
    'display':['Autopop Wrinklers OFF', 'Autopop Wrinklers ON'],
    'default':0
  },
  'autoReindeer':{
    'hint':'Automatically click reindeer',
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
    'hint':'Automatically turns off a blacklist once the goal for that blacklist is achieved',
    'display':['Auto Blacklist OFF', 'Auto Blacklist ON'],
    'default':0
  },
  'blacklist':{
    'hint':'Blacklist purchases from the efficiency calculations',
    'display':['No Blacklist', 'Speedrun Blacklist', 'Hardcore Blacklist', 'Grandmapocalypse Mode', 'No Buildings', 'No GS', 'No GS or Buildings'],
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
  'numberDisplay':{
    'hint':'Change how numbers are shortened',
    'display':["Raw Numbers","Full Word (million, billion)","Initials (M, B)","SI Units (M, G, T)", "Scientific Notation (x10¹²)"],
    'default':1
  }.
  'autoGS':{
    'hint':'Automatically turn on the Golden Switch during Dragonflight and Click Frenzy',
    'display':['OFF','ON'],
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

var upgradeJson = [
  {'id':0,'buildings':[1,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':1,'buildings':[1,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':2,'buildings':[10,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':3,'buildings':[20,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':4,'buildings':[40,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':5,'buildings':[80,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':6,'buildings':[120,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':43,'buildings':[160,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':82,'buildings':[200,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':109,'buildings':[240,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':188,'buildings':[280,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':189,'buildings':[320,0,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':7,'buildings':[0,1,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':8,'buildings':[0,1,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':9,'buildings':[0,10,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':44,'buildings':[0,50,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':110,'buildings':[0,100,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':192,'buildings':[0,200,0,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':10,'buildings':[0,0,1,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':11,'buildings':[0,0,1,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':12,'buildings':[0,0,10,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':45,'buildings':[0,0,50,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':111,'buildings':[0,0,100,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':193,'buildings':[0,0,200,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':16,'buildings':[0,0,0,1,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':17,'buildings':[0,0,0,1,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':18,'buildings':[0,0,0,10,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':47,'buildings':[0,0,0,50,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':113,'buildings':[0,0,0,100,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':195,'buildings':[0,0,0,200,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':13,'buildings':[0,0,0,0,1,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':14,'buildings':[0,0,0,0,1,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':15,'buildings':[0,0,0,0,10,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':46,'buildings':[0,0,0,0,50,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':112,'buildings':[0,0,0,0,100,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':194,'buildings':[0,0,0,0,200,0,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':232,'buildings':[0,0,0,0,0,1,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':233,'buildings':[0,0,0,0,0,1,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':234,'buildings':[0,0,0,0,0,10,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':235,'buildings':[0,0,0,0,0,50,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':236,'buildings':[0,0,0,0,0,100,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':237,'buildings':[0,0,0,0,0,200,0,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':238,'buildings':[0,0,0,0,0,0,1,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':239,'buildings':[0,0,0,0,0,0,1,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':240,'buildings':[0,0,0,0,0,0,10,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':241,'buildings':[0,0,0,0,0,0,50,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':242,'buildings':[0,0,0,0,0,0,100,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':243,'buildings':[0,0,0,0,0,0,200,0,0,0,0,0,0,0],'upgrades':[]},

  {'id':244,'buildings':[0,0,0,0,0,0,0,1,0,0,0,0,0,0],'upgrades':[]},
  {'id':245,'buildings':[0,0,0,0,0,0,0,1,0,0,0,0,0,0],'upgrades':[]},
  {'id':246,'buildings':[0,0,0,0,0,0,0,10,0,0,0,0,0,0],'upgrades':[]},
  {'id':247,'buildings':[0,0,0,0,0,0,0,50,0,0,0,0,0,0],'upgrades':[]},
  {'id':248,'buildings':[0,0,0,0,0,0,0,100,0,0,0,0,0,0],'upgrades':[]},
  {'id':249,'buildings':[0,0,0,0,0,0,0,200,0,0,0,0,0,0],'upgrades':[]},

  {'id':19,'buildings':[0,0,0,0,0,0,0,0,1,0,0,0,0,0],'upgrades':[]},
  {'id':20,'buildings':[0,0,0,0,0,0,0,0,1,0,0,0,0,0],'upgrades':[]},
  {'id':21,'buildings':[0,0,0,0,0,0,0,0,10,0,0,0,0,0],'upgrades':[]},
  {'id':48,'buildings':[0,0,0,0,0,0,0,0,50,0,0,0,0,0],'upgrades':[]},
  {'id':114,'buildings':[0,0,0,0,0,0,0,0,100,0,0,0,0,0],'upgrades':[]},
  {'id':196,'buildings':[0,0,0,0,0,0,0,0,200,0,0,0,0,0],'upgrades':[]},

  {'id':22,'buildings':[0,0,0,0,0,0,0,0,0,1,0,0,0,0],'upgrades':[]},
  {'id':23,'buildings':[0,0,0,0,0,0,0,0,0,1,0,0,0,0],'upgrades':[]},
  {'id':24,'buildings':[0,0,0,0,0,0,0,0,0,10,0,0,0,0],'upgrades':[]},
  {'id':49,'buildings':[0,0,0,0,0,0,0,0,0,50,0,0,0,0],'upgrades':[]},
  {'id':115,'buildings':[0,0,0,0,0,0,0,0,0,100,0,0,0,0],'upgrades':[]},
  {'id':197,'buildings':[0,0,0,0,0,0,0,0,0,200,0,0,0,0],'upgrades':[]},

  {'id':25,'buildings':[0,0,0,0,0,0,0,0,0,0,1,0,0,0],'upgrades':[]},
  {'id':26,'buildings':[0,0,0,0,0,0,0,0,0,0,1,0,0,0],'upgrades':[]},
  {'id':27,'buildings':[0,0,0,0,0,0,0,0,0,0,10,0,0,0],'upgrades':[]},
  {'id':50,'buildings':[0,0,0,0,0,0,0,0,0,0,50,0,0,0],'upgrades':[]},
  {'id':116,'buildings':[0,0,0,0,0,0,0,0,0,0,100,0,0,0],'upgrades':[]},
  {'id':198,'buildings':[0,0,0,0,0,0,0,0,0,0,200,0,0,0],'upgrades':[]},

  {'id':28,'buildings':[0,0,0,0,0,0,0,0,0,0,0,1,0,0],'upgrades':[]},
  {'id':29,'buildings':[0,0,0,0,0,0,0,0,0,0,0,1,0,0],'upgrades':[]},
  {'id':30,'buildings':[0,0,0,0,0,0,0,0,0,0,0,10,0,0],'upgrades':[]},
  {'id':51,'buildings':[0,0,0,0,0,0,0,0,0,0,0,50,0,0],'upgrades':[]},
  {'id':117,'buildings':[0,0,0,0,0,0,0,0,0,0,0,100,0,0],'upgrades':[]},
  {'id':199,'buildings':[0,0,0,0,0,0,0,0,0,0,0,200,0,0],'upgrades':[]},

  {'id':99,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,1,0],'upgrades':[]},
  {'id':100,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,1,0],'upgrades':[]},
  {'id':101,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,10,0],'upgrades':[]},
  {'id':102,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,50,0],'upgrades':[]},
  {'id':118,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,100,0],'upgrades':[]},
  {'id':200,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,200,0],'upgrades':[]},

  {'id':175,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,1],'upgrades':[]},
  {'id':176,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,1],'upgrades':[]},
  {'id':177,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,10],'upgrades':[]},
  {'id':178,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,50],'upgrades':[]},
  {'id':179,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,100],'upgrades':[]},
  {'id':201,'buildings':[0,0,0,0,0,0,0,0,0,0,0,0,0,200],'upgrades':[]},
  
  {'id':57,'buildings':[0,1,15,0,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':58,'buildings':[0,1,0,15,0,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':59,'buildings':[0,1,0,0,15,0,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':60,'buildings':[0,1,0,0,0,15,0,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':61,'buildings':[0,1,0,0,0,0,15,0,0,0,0,0,0,0],'upgrades':[]},
  {'id':62,'buildings':[0,1,0,0,0,0,0,15,0,0,0,0,0,0],'upgrades':[]},
  {'id':63,'buildings':[0,1,0,0,0,0,0,0,15,0,0,0,0,0],'upgrades':[]},
  {'id':103,'buildings':[0,1,0,0,0,0,0,0,0,15,0,0,0,0],'upgrades':[]},
  {'id':180,'buildings':[0,1,0,0,0,0,0,0,0,0,15,0,0,0],'upgrades':[]},
  {'id':250,'buildings':[0,1,0,0,0,0,0,0,0,0,0,15,0,0],'upgrades':[]},
  {'id':251,'buildings':[0,1,0,0,0,0,0,0,0,0,0,0,15,0],'upgrades':[]},
  {'id':252,'buildings':[0,1,0,0,0,0,0,0,0,0,0,0,0,15],'upgrades':[]},
  
  {'id':64,'buildings':[0,6,0,0,0,0,0,0,0,0,0],'upgrades':[57,58,59,60,61,62,63]},
  {'id':65,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[64]},
  {'id':66,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[65]},
  {'id':67,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[66]},
  {'id':68,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[67]},
  {'id':69,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[68]},
  {'id':70,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69]},
  {'id':71,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[70]},
  {'id':72,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[71]},
  {'id':73,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[72]},
  {'id':74,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[73]},
  {'id':75,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[73]},
  {'id':84,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[73]},
  {'id':85,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[73]},
  
  {'id':130,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[129]},
  {'id':131,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[130]},
  {'id':132,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[131]},
  {'id':133,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[132]},
  
  {'id':152,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':153,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':154,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':155,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':156,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':157,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':158,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':159,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':160,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':161,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':162,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':163,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':164,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':165,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':166,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':1},
  {'id':168,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[152],'santa':14},
  
  {'id':182,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[181]},
  {'id':183,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[181]},
  {'id':184,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[181]},
  
  {'id':134,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':135,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':136,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':137,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':138,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':139,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  {'id':140,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[69,183], 'wrinklers':1},
  
  {'id':143,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':144,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':145,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':146,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':147,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':148,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  {'id':149,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[182]},
  
  {'id':169,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[184]},
  {'id':170,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[169,184]},
  {'id':171,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[170,184]},
  {'id':172,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[171,184]},
  {'id':173,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[172,184]},
  {'id':174,'buildings':[0,0,0,0,0,0,0,0,0,0,0],'upgrades':[173,184]}
];

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
  },
  {
    'upgrades': [331, 332],
    'buildings': []
  },
  {
    'upgrades': [331, 332],
    'buildings': true
  }
];

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
  'frenzyRuin':  {'odds':[0,0.031491314174174,0.033674609798233,0],                                  isOverlap:true},
  'clotRuin':    {'odds':[0,0.013356303344429,0.050318079469162,0.107949674328571],                 isOverlap:true},
  'lucky':       {'odds':[0.070071731013916,0.113288563286977,0.146693408687535,0.171634249195106], isOverlap:false},
  'frenzyLucky': {'odds':[0.405366905290347,0.219293086015375,0.083880131161928,0],                 isOverlap:true},
  'clotLucky':   {'odds':[0,0.046715208884435,0.081736878830784,0.107949674328571],                 isOverlap:true},
  'click':       {'odds':[0.022561043069409,0.020309670016808,0.019242724580528,0.019177860550822], isOverlap:false},
  'frenzyClick': {'odds':[0.022115820565423,0.012720131151967,0.005384749977878,0],                  isOverlap:true},
  'clotClick':   {'odds':[0,0.001307530606642,0.005809363719639,0.007810910338684],                 isOverlap:true},
  'blah':        {'odds':[0,0,0,0], isOverlap:false}
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

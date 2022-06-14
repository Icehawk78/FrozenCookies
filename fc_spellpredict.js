// @name         Cookie Clicker Predict Spell
// @version      0.1
// @author       Random Reddit Guy (SamNosliw, 3pLm1zf1rMD_Xkeo6XHl)
// @match        http://orteil.dashnet.org/cookieclicker/
// @source       https://www.reddit.com/r/CookieClicker/comments/6v2lz3/predict_next_hands_of_faith/
(function() {
    if (Game.ObjectsById[7].minigameLoaded) {
        var lookup = setInterval(function() {
            if (typeof Game.ready !== "undefined" && Game.ready) {
                var CastSpell = document.getElementById("grimoireSpell1");
                CastSpell.onmouseover = function() {
                    Game.tooltip.dynamic = 1;
                    Game.tooltip.draw(
                        this,
                        Game.ObjectsById[7].minigame.spellTooltip(1)() +
                        '<div class="line"></div><div class="description">' +
                        "<b>First Spell:</b> " +
                        nextSpell(0) +
                        "<br />" +
                        "<b>Second Spell:</b> " +
                        nextSpell(1) +
                        "<br />" +
                        "<b>Third Spell:</b> " +
                        nextSpell(2) +
                        "<br />" +
                        "<b>Fourth Spell:</b> " +
                        nextSpell(3) +
                        "</div>",
                        "this"
                    );
                    Game.tooltip.wobble();
                };
                clearInterval(lookup);
            }
        }, 1000);
    }
})();

nextSpell = function(i) {
    if (Game.ObjectsById[7].minigameLoaded) {
        season = Game.season;
        var obj = obj || {};
        M = Game.ObjectsById[7].minigame;
        spell = M.spellsById[1];
        var failChance = M.getFailChance(spell);
        if (typeof obj.failChanceSet !== "undefined") failChance = obj.failChanceSet;
        if (typeof obj.failChanceAdd !== "undefined") failChance += obj.failChanceAdd;
        if (typeof obj.failChanceMult !== "undefined")
            failChance *= obj.failChanceMult;
        if (typeof obj.failChanceMax !== "undefined")
            failChance = Math.max(failChance, obj.failChanceMax);
        Math.seedrandom(Game.seed + "/" + (M.spellsCastTotal + i));
        var choices = [];
        if (!spell.fail || Math.random() < 1 - failChance) {
            Math.random();
            Math.random();
            if (Game.season == "valentines" || Game.season == "easter") {
                Math.random();
            }
            choices.push(
                '<b style="color:#FFDE5F">Frenzy',
                '<b style="color:#FFDE5F">Lucky'
            );
            if (!Game.hasBuff("Dragonflight"))
                choices.push('<b style="color:#FFD700">Click Frenzy');
            if (Math.random() < 0.1)
                choices.push(
                    '<b style="color:#FFDE5F">Cookie Chain',
                    '<b style="color:#FFDE5F">Cookie Storm',
                    "Blab"
                );
            if (Game.BuildingsOwned >= 10 && Math.random() < 0.25)
                choices.push('<b style="color:#DAA520">Building Special');
            if (Math.random() < 0.15) choices = ["Cookie Storm (Drop)"];
            if (Math.random() < 0.0001)
                choices.push('<b style="color:#5FFFFC">Sugar Lump');
        } else {
            Math.random();
            Math.random();
            if (Game.season == "valentines" || Game.season == "easter") {
                Math.random();
            }
            choices.push(
                '<b style="color:#FF3605">Clot',
                '<b style="color:#FF3605">Ruin Cookies'
            );
            if (Math.random() < 0.1)
                choices.push(
                    '<b style="color:#DAA520">Cursed Finger',
                    '<b style="color:#DAA520">Elder Frenzy'
                );
            if (Math.random() < 0.003)
                choices.push('<b style="color:#5FFFFC">Sugar Lump');
            if (Math.random() < 0.1) choices = ["Blab"];
        }
        ret = choose(choices);
        Math.seedrandom();
        return "<small>" + ret + "</b></small>";
    }
};

// This converts the nextSpell(i) to a string to be used for checking conditions for auto casting Force The Hand of Fate in fc_main.
nextSpellName = function(i) {
    if (Game.ObjectsById[7].minigameLoaded) {
        for (var v = i; v <= i; v++) {
            if (nextSpell(v) == '<small><b style="color:#FFDE5F">Lucky</b></small>') {
                return "Lucky";
            }

            if (nextSpell(v) == '<small><b style="color:#FFDE5F">Frenzy</b></small>') {
                return "Frenzy";
            }

            if (nextSpell(v) == '<small><b style="color:#FFD700">Click Frenzy</b></small>') {
                return "Click Frenzy";
            }

            if (nextSpell(v) == '<small><b style="color:#FFDE5F">Cookie Chain</b></small>') {
                return "Cookie Chain";
            }

            if (nextSpell(v) == '<small><b style="color:#FFDE5F">Cookie Storm</b></small>') {
                return "Cookie Storm";
            }

            if (nextSpell(v) == '<small>Cookie Storm (Drop)</b></small>') {
                return "Cookie Storm (Drop)";
            }

            if (nextSpell(v) == '<small><b style="color:#DAA520">Building Special</b></small>') {
                return "Building Special";
            }

            if (nextSpell(v) == '<small>Blab</b></small>') {
                return "Blab";
            }

            if (nextSpell(v) == '<small><b style="color:#FF3605">Ruin Cookies</b></small>') {
                return "Ruin Cookies";
            }

            if (nextSpell(v) == '<small><b style="color:#FF3605">Clot</b></small>') {
                return "Clot";
            }

            if (nextSpell(v) == '<small><b style="color:#DAA520">Cursed Finger</b></small>') {
                return "Cursed Finger";
            }

            if (nextSpell(v) == '<small><b style="color:#DAA520">Elder Frenzy</b></small>') {
                return "Elder Frenzy";
            }

            if (nextSpell(v) == '<small><b style="color:#5FFFFC">Sugar Lump</b></small>') {
                return "Sugar Lump";
            }
        }
    }
}

// Converts all of the games' building special named buffs to a single function to check if a building special buff is up.
// Used for autocasting Force The Hand of Fate
BuildingSpecialBuff = function() {
    if (Game.hasBuff('High-five') ||
        //	Game.hasBuff('Slap to the face') ||
        Game.hasBuff('Congregation') ||
        //	Game.hasBuff('Senility') ||
        Game.hasBuff('Luxuriant harvest') ||
        //	Game.hasBuff('Locusts') ||
        Game.hasBuff('Ore vein') ||
        //	Game.hasBuff('Cave-in') ||
        Game.hasBuff('Oiled-up') ||
        //	Game.hasBuff('Jammed machinery') ||
        Game.hasBuff('Juicy profits') ||
        //	Game.hasBuff('Recession') ||
        Game.hasBuff('Fervent adoration') ||
        //	Game.hasBuff('Crisis of faith') ||
        Game.hasBuff('Manabloom') ||
        //	Game.hasBuff('Magivores') ||
        Game.hasBuff('Delicious lifeforms') ||
        //	Game.hasBuff('Black holes') ||
        Game.hasBuff('Breakthrough') ||
        //	Game.hasBuff('Lab disaster') ||
        Game.hasBuff('Righteous cataclysm') ||
        //	Game.hasBuff('Dimensional calamity') ||
        Game.hasBuff('Golden ages') ||
        //	Game.hasBuff('Time jam') ||
        Game.hasBuff('Extra cycles') ||
        //	Game.hasBuff('Predictable tragedy') ||
        Game.hasBuff('Solar flare') ||
        //	Game.hasBuff('Eclipse') ||
        Game.hasBuff('Winning streak') ||
        //	Game.hasBuff('Dry spell') ||
        Game.hasBuff('Macrocosm') ||
        //	Game.hasBuff('Microcosm') ||
        Game.hasBuff('Refactoring') ||
        //	Game.hasBuff('Antipattern') ||
        Game.hasBuff('Cosmic nursery'))
    //	Game.hasBuff('Big crunch'))
    {
        return 1;
    } else {
        return 0;
    }
}

// This function will be used in fc_main.js to check time left on building buff within autoCast() function
function BuildingBuffTime() {
    for (var i in Game.buffs) {
        if (Game.buffs[i].type && (Game.buffs[i].type.name == 'building buff')) {
            return Game.buffs[i].time / 30;
        }
    }
    return 0;
}
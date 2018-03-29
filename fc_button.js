$('#logButton').before(
    $('<div id="fcButton" />').addClass('button')
        .html('Frozen<br />Cookies')
        .click(function(){
            Game.ShowMenu('fc_menu');
        })
);

$('#logButton').hide();

$('<style type="text/css">')
    .html(
    '#fcEfficiencyTable {width: 100%;}' +
    '#fcButton {top: 0px; right: 0px; padding-top: 12px; font-size: 90%; background-position: -100px 0px;}' +
    '.worst {border-width:1px; border-style:solid; border-color:#330000;}' +
    '.bad {border-width:1px; border-style:solid; border-color:#660033;}' +
    '.average {border-width:1px; border-style:solid; border-color:#663399;}' +
    '.good {border-width:1px; border-style:solid; border-color:#3399FF;}' +
    '.best {border-width:1px; border-style:solid; border-color:#00FFFF;}' +
    '.ui-dialog {z-index:1000000;}'
    )
    .appendTo('head');

function getBuildingTooltip(purchaseRec) {
    var parent = $('<div>').attr('style','min-width:300px;');
    parent.append($('<div>').addClass('price').attr('style', 'float:right;').text(Beautify(purchaseRec.purchase.price)));
    parent.append($('<div>').addClass('name').text(purchaseRec.purchase.name));
    parent.append($('<div>').attr('style', 'font-size:80%;').text('[owned: ' + purchaseRec.purchase.amount + ']'));
    parent.append($('<div>').addClass('description').html(purchaseRec.purchase.desc));
    if (purchaseRec.delta_cps) {
        parent.append($('<div>').addClass('fc_cps').html('&#916; CPS: ' + Beautify(purchaseRec.delta_cps)));
        parent.append($('<div>').addClass('fc_efficiency').text('Efficiency: ' + (Math.floor(purchaseRec.efficiencyScore * 10000) / 100).toString() + '%'));
        parent.append($('<div>').addClass('fc_build_time').text('Build time: ' + timeDisplay(divCps((purchaseRec.cost + delayAmount()), Game.cookiesPs))));
        parent.append($('<div>').addClass('fc_effective_build_time').text('Estimated Effective Build time: ' + timeDisplay(divCps((purchaseRec.cost + delayAmount()), (effectiveCps())))));
    }
    return parent[0].outerHTML;
}

function getUpgradeTooltip(purchaseRec) {
    var parent = $('<div>').attr('style','min-width:300px;');
    parent.append($('<div>').addClass('price').attr('style', 'float:right;').text(Beautify(purchaseRec.purchase.getPrice())));
    parent.append($('<div>').addClass('name').text(purchaseRec.purchase.name));
    parent.append($('<div>').attr('style', 'font-size:80%;').text('[Upgrade]'));
    parent.append($('<div>').addClass('description').html(purchaseRec.purchase.desc));
    if (purchaseRec.delta_cps) {
        parent.append($('<div>').addClass('fc_cps').html('&#916; CPS: ' + Beautify(purchaseRec.delta_cps)));
        parent.append($('<div>').addClass('fc_efficiency').text('Efficiency: ' + (Math.floor(purchaseRec.efficiencyScore * 10000) / 100).toString() + '%'));
        parent.append($('<div>').addClass('fc_build_time').text('Build time: ' + timeDisplay(divCps((purchaseRec.cost + delayAmount()), Game.cookiesPs))));
        parent.append($('<div>').addClass('fc_effective_build_time').text('Estimated GC Build time: ' + timeDisplay(divCps((purchaseRec.cost + delayAmount()), (effectiveCps())))));
    }
    return parent[0].outerHTML;
}

function colorizeScore(score) {
    var classNames = ['best', 'good', 'average', 'bad', 'worst'];
    var result;
    if (score == 1) {
        result = classNames[0];
    } else if (score > 0.9) {
        result = classNames[1];
    } else if (score > 0.1) {
        result = classNames[2];
    } else if (score > 0) {
        result = classNames[3];
    } else {
        result = classNames[4];
    }
    return result;
}

function rebuildStore(recalculate) {
    var store = $('#products'),
        recommendations = recommendationList(recalculate);

    store[0].innerHTML = '';
    Game.ObjectsById.forEach(function(me) {
        var purchaseRec = recommendations.filter(function(a) {return a.id == me.id && a.type == 'building';})[0],
            button = $('<div>')
                .addClass('product')
                .addClass(colorizeScore(purchaseRec.efficiencyScore))
                .mouseenter(function() {
                    Game.tooltip.draw(this, escape(getBuildingTooltip(purchaseRec)), 0, 0, 'left');
                })
                .mouseleave(function() {
                    Game.tooltip.hide();
                })
                .click(function() {
                    Game.ObjectsById[me.id].buy();
                })
                .attr('id', 'product' + me.id)
                .append(
                    $('<div>').addClass('icon').attr('style', 'background-image:url(img/' + me.icon + '.png);')
                ),
            content = $('<div>').addClass('content');

        content.append($('<div>').addClass('title').html(me.displayName));
        content.append($('<div>').addClass('price').text(Beautify(me.price)));
        if (me.amount) {
            content.append($('<div>').addClass('title').addClass('owned').text(Beautify(me.amount)));
        }
        button.append(content);
        store.append(button);
    });
//    Game.Draw();
}

function rebuildUpgrades(recalculate) {
    var store = $('#upgrades'),
        recommendations = recommendationList(recalculate);
    store[0].innerHTML = '';
    Game.UpgradesInStore = Game.UpgradesById.filter(function(a){return !a.bought && a.unlocked;}).sort(function(a,b){return a.getPrice() - b.getPrice();});
    Game.UpgradesInStore.forEach(function(me) {
        var purchaseRec = recommendations.filter(function(a) {return a.id == me.id && a.type == 'upgrade';})[0];
        if (!purchaseRec) {
            console.log(me.name + ' not found in recommendationList()');
        } else {
            store.append($('<div>')
                .addClass('crate')
                .addClass('upgrade')
                .addClass(colorizeScore(purchaseRec.efficiencyScore))
                .mouseenter(function() {
                    Game.tooltip.draw(this, escape(getUpgradeTooltip(purchaseRec)), 0, 16, 'bottom-right');
                })
                .mouseleave(function() {
                    Game.tooltip.hide();
                })
                .click(function() {
                    Game.UpgradesById[me.id].buy();
                })
                .attr('id', 'upgrade' + me.id)
                .attr('style', 'background-position:' + (-me.icon[0] * 48 + 6) + 'px ' + (-me.icon[1] * 48 + 6) + 'px;'));
        }
    });
//    Game.Draw();
}

/*
Game.RebuildStore=function(recalculate) {rebuildStore(recalculate);}
Game.RebuildUpgrades=function(recalculate) {rebuildUpgrades(recalculate);}

Game.RebuildStore(true);
Game.RebuildUpgrades(true);
*/

Game.oldUpdateMenu = Game.UpdateMenu;

function drawCircles(t_d, x, y) {
    var maxRadius, heightOffset, i_c, i_tc, t_b, maxWidth, maxHeight, s_t,
        c = $('#backgroundLeftCanvas');
    if (typeof(c.measureText) != "function") {
        return;
    }
    maxRadius = 10 + 10*t_d.reduce(function(sum,item){return (item.overlay) ? sum : sum + 1;},0);
    heightOffset = maxRadius + 5 - (15 * (t_d.length - 1) / 2);
    i_c = 0;
    i_tc = 0;
    t_b = ['rgba(170, 170, 170, 1)','rgba(187, 187, 187, 1)','rgba(204, 204, 204, 1)','rgba(221, 221, 221, 1)','rgba(238, 238, 238, 1)','rgba(255, 255, 255, 1)'];
    var maxText = _.max(t_d.map(function(o) {
        return o.name ? o.name + (o.display ? ': ' + o.display : '') : '';
    }), function(str) {
        return str.length;
    });
    var maxMeasure = c.measureText({
        fontSize: "12px",
        fontFamily: "Arial",
        maxWidth: c.width,
        text: maxText
    });
    maxWidth = maxMeasure.width;
    maxHeight = maxMeasure.height * t_d.length;
    c.drawRect({
        fillStyle: 'rgba(153, 153, 153, 0.6)',
        x: x + maxRadius * 2 + maxWidth / 2 + 35, y: y + maxRadius + 5,
        width: maxWidth + 20, height: maxHeight + 20
    });

    t_d.forEach( function(o_draw) {
        if (o_draw.overlay)
        {
            i_c--;
        }
        else
        {
            c.drawArc({
                strokeStyle: t_b[i_c%t_b.length],
                strokeWidth: 10,
                x: x + (maxRadius + 5), y:y + maxRadius + 5,
                radius: maxRadius - i_c*10
            });
            c.drawArc({
                strokeStyle: t_b[(i_c+2)%t_b.length],
                strokeWidth: 1,
                x: x + (maxRadius + 5), y:y + maxRadius + 5,
                radius: maxRadius - 5 - (i_c)*10
            });
        }
        c.drawArc({
            strokeStyle: o_draw.c1,
            x: x + (maxRadius + 5), y:y + maxRadius + 5,
            radius: maxRadius - i_c*10,
            strokeWidth: 7,
            start: 0,
            end: (360 * o_draw.f_percent)
        });
        if (o_draw.name)
        {
            s_t = o_draw.name + (o_draw.display ? ": "+o_draw.display : "");
            c.drawText({
                fontSize: "12px",
                fontFamily: "Arial",
                fillStyle: o_draw.c1,
                x: x + maxRadius * 2 + maxWidth / 2 + 35, y: y + heightOffset+15*i_tc,
                text: s_t
            });
            i_tc++;
        }
        i_c++;
    });
}

function hasBuildingSpecialBuff() {
    for (var i in Game.buffs) {
        if (Game.buffs[i].type && (Game.buffs[i].type.name == 'building buff' || Game.buffs[i].type.name == 'building debuff')) {
            return Game.buffs[i].time;
        }
    }
    return 0;
}

function buildingSpecialBuffValue() {
    for (var i in Game.buffs) {
        if (Game.buffs[i].type && (Game.buffs[i].type.name == 'building buff' || Game.buffs[i].type.name == 'building debuff')) {
            return Game.buffs[i].multCpS;
        }
    }
    return 0;
}

function buffDuration(buffName) {
    var buff = Game.hasBuff(buffName);
    return buff ? buff.time : 0;
}

function updateTimers() {
    var chainPurchase, bankPercent, purchasePercent, bankMax, actualCps, t_draw,
        maxColor, height,
        gc_delay = (probabilitySpan('golden', Game.shimmerTypes.golden.time, 0.5) - Game.shimmerTypes.golden.time) / maxCookieTime(),
        gc_max_delay = (probabilitySpan('golden', Game.shimmerTypes.golden.time, 0.99) - Game.shimmerTypes.golden.time) / maxCookieTime(),
        gc_min_delay = (probabilitySpan('golden', Game.shimmerTypes.golden.time, 0.01) - Game.shimmerTypes.golden.time) / maxCookieTime(),
        clot_delay = buffDuration('Clot') / maxCookieTime(),
        elder_frenzy_delay = buffDuration('Elder frenzy') / maxCookieTime(),
        frenzy_delay = buffDuration('Frenzy') / maxCookieTime(),
        dragon_harvest_delay = buffDuration('Dragon Harvest') / maxCookieTime(),
        click_frenzy_delay = buffDuration('Click frenzy') / maxCookieTime(),
        dragonflight_delay = buffDuration('Dragonflight') / maxCookieTime(),
        cursed_finger_delay = buffDuration('Cursed finger') / maxCookieTime(),
        building_special_delay = hasBuildingSpecialBuff() / maxCookieTime(),
        cookie_storm_delay = buffDuration('Cookie storm') / maxCookieTime(),
        decimal_HC_complete = (Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)%1),
        bankTotal = delayAmount(),
        purchaseTotal = nextPurchase().cost,
        bankCompletion = bankTotal ? (Math.min(Game.cookies, bankTotal)) / bankTotal : 0,
        purchaseCompletion = Game.cookies/(bankTotal + purchaseTotal),
        bankPurchaseCompletion = bankTotal/(bankTotal + purchaseTotal),
        chainTotal = 0,
        chainFinished,
        chainCompletion = 0;
    if (nextChainedPurchase().cost > nextPurchase().cost) {
        chainPurchase = nextChainedPurchase().purchase;
        chainTotal = upgradePrereqCost(chainPurchase, true) - chainPurchase.getPrice();
        chainFinished = chainTotal - (upgradePrereqCost(chainPurchase) - chainPurchase.getPrice());
        chainCompletion = (chainFinished + Math.max(Game.cookies - bankTotal, 0)) / (bankTotal + chainTotal);
    }
    bankPercent = Math.min(Game.cookies, bankTotal) / (bankTotal + purchaseTotal);
    purchasePercent = purchaseTotal / (purchaseTotal + bankTotal);
    bankMax = bankTotal / (purchaseTotal + bankTotal);
    actualCps = Game.cookiesPs + Game.mouseCps() * FrozenCookies.cookieClickSpeed;

    t_draw = [];

    if (chainTotal) {
        t_draw.push({
            f_percent: chainCompletion,
            c1: 'rgba(51, 51, 51, 1)',
            name: "Chain Completion Time",
            display: timeDisplay(divCps(Math.max(chainTotal + bankTotal - Game.cookies - chainFinished,0), actualCps))
        });
    }
    if (purchaseTotal > 0) {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: 'rgba(17, 17, 17, 1)',
            name: "Purchase Completion Time",
            display: timeDisplay(divCps(Math.max(purchaseTotal + bankTotal - Game.cookies,0), actualCps))
        });
    }
    if (bankMax > 0) {
        maxColor = (Game.cookies >= bankTotal) ? 'rgba(252, 212, 0, 1)' : 'rgba(201, 169, 0, 1)';
        t_draw.push({
            f_percent: bankMax,
            name: "Max Bank",
            display: Beautify(bankTotal),
            c1: maxColor,
            overlay: true
        });
        if (bankPercent > 0 && Game.cookies < bankTotal) {
            t_draw.push({
                f_percent: bankPercent,
                c1: 'rgba(252, 212, 0, 1)',
                name: "Bank Completion",
                display: timeDisplay(divCps(Math.max(bankTotal - Game.cookies,0), actualCps)),
                overlay: true
            });
        }
    }
    if (gc_delay > 0) {
        t_draw.push({
            f_percent: gc_max_delay,
            c1: "rgba(255, 155, 0, 1)",
            name: "Golden Cookie Maximum (99%)",
            display: timeDisplay((gc_max_delay * maxCookieTime()) / Game.fps)
        });
        t_draw.push({
            f_percent: gc_delay,
            c1: "rgba(255, 195, 0, 1)",
            name: "Golden Cookie Estimate (50%)",
            display: timeDisplay((gc_delay * maxCookieTime()) / Game.fps),
            overlay: true
        });
        t_draw.push({
            f_percent: gc_min_delay,
            c1: "rgba(255, 235, 0, 1)",
            name: "Golden Cookie Minimum (1%)",
            display: timeDisplay((gc_min_delay * maxCookieTime()) / Game.fps),
            overlay: true

        });
    }
    if (clot_delay > 0) {
        t_draw.push({
            f_percent: clot_delay,
            c1: "rgba(193, 98, 3, 1)",
            name: "Clot (x" + Game.buffs['Clot'].multCpS + ") Time",
            display: timeDisplay(buffDuration('Clot')/Game.fps)
        });
    }
    if (elder_frenzy_delay > 0) {
        t_draw.push({
            f_percent: elder_frenzy_delay,
            c1: "rgba(79, 0, 7, 1)",
            name: "Elder Frenzy (x" + Game.buffs['Elder frenzy'].multCpS + ") Time",
            display: timeDisplay(buffDuration('Elder frenzy')/Game.fps)
        });
    }
    if (frenzy_delay > 0) {
        t_draw.push({
            f_percent: frenzy_delay,
            c1: "rgba(255, 0, 0, 1)",
            name: "Frenzy (x" + Game.buffs['Frenzy'].multCpS + ") Time",
            display: timeDisplay(buffDuration('Frenzy')/Game.fps)
        });
    }
    if (dragon_harvest_delay > 0) {
        t_draw.push({
            f_percent: dragon_harvest_delay,
            c1: "rgba(206, 180, 49, 1)",
            name: "Dragon Harvest (x" + Game.buffs['Dragon Harvest'].multCpS + ") Time",
            display: timeDisplay(buffDuration('Dragon Harvest')/Game.fps)
        });
    }
    if (click_frenzy_delay > 0) {
        t_draw.push({
            f_percent: click_frenzy_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Click Frenzy (x" + Game.buffs['Click frenzy'].multClick + ") Time",
            display: timeDisplay(buffDuration('Click frenzy')/Game.fps)
        });
    }
    if (dragonflight_delay > 0) {
        t_draw.push({
            f_percent: dragonflight_delay,
            c1: "rgba(183, 206, 49, 1)",
            name: "Dragonflight (x" + Game.buffs['Dragonflight'].multClick + ") Time",
            display: timeDisplay(buffDuration('Dragonflight')/Game.fps)
        });
    }
    if (cursed_finger_delay > 0) {
        t_draw.push({
            f_percent: cursed_finger_delay,
            c1: "rgba(23, 79, 1, 1)",
            name: "Cursed Finger Time",
            display: timeDisplay(buffDuration('Cursed finger')/Game.fps)
        });
    }
    if (building_special_delay > 0) {
        t_draw.push({
            f_percent: building_special_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Building Special (x" + buildingSpecialBuffValue() + ") Time",
            display: timeDisplay(hasBuildingSpecialBuff()/Game.fps)
        });
    }
    if (cookie_storm_delay > 0) {
        t_draw.push({
            f_percent: cookie_storm_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Cookie Storm Time",
            display: timeDisplay(buffDuration('Cookie storm')/Game.fps)
        });
    }
    if (decimal_HC_complete>0) {
        t_draw.push({
            f_percent: decimal_HC_complete,
            c1: "rgba(55, 169, 230, 1)",
            name: "HC Completion",
            display: (Math.round(decimal_HC_complete*10000)/100)+"%"
        });
    }
    height = $('#backgroundLeftCanvas').height() - 140;
    drawCircles(t_draw, 70, height);
}

function FCMenu() {
    Game.UpdateMenu = function() {
        if (Game.onMenu !== 'fc_menu') {
            return Game.oldUpdateMenu();
        }
        var currentCookies, maxCookies, isTarget, isMax, targetTxt, maxTxt,
            currPrestige, resetPrestige, prestigeDifference,
            currHC, resetHC, cps, baseChosen, frenzyChosen, clickStr, buildTable,
            bankLucky, bankLuckyFrenzy, bankChain,
            menu = $('#menu').html('')
                .append($('<div>').addClass('section').html('Frozen Cookies v ' + FrozenCookies.version)),
            subsection = $('<div>').addClass('subsection')
                .append($('<div>').addClass('title').html('Autobuy Information')),
            recommendation = nextPurchase(),
            chainRecommendation = nextChainedPurchase(),
            isChained = !(recommendation.id == chainRecommendation.id && recommendation.type == chainRecommendation.type),
            bankLevel = bestBank(chainRecommendation.efficiency),
            actualCps = Game.cookiesPs + Game.mouseCps() * FrozenCookies.cookieClickSpeed,
            chocolateRecoup = (recommendation.type == 'upgrade' ? recommendation.cost : recommendation.cost * 0.425) / (recommendation.delta_cps * 20);

        subsection.append($('<div>').addClass('listing').html('<b>Next Purchase:</b> ' + recommendation.purchase.name));
        if (isChained) {
            subsection.append($('<div>').addClass('listing').html('<b>Building Chain to:</b> ' + chainRecommendation.purchase.name));
        }
        subsection.append($('<div>').addClass('listing').html('<b>Time till completion:</b> ' + timeDisplay(divCps((recommendation.cost + bankLevel.cost - Game.cookies), actualCps))));
        subsection.append($('<div>').addClass('listing').html('<b>Estimated Actual completion time:</b> ' + timeDisplay(divCps((recommendation.cost + bankLevel.cost - Game.cookies), effectiveCps()))));
        if (isChained) {
            subsection.append($('<div>').addClass('listing').html('<b>Time till Chain completion:</b> ' + timeDisplay(divCps(Math.max(0,(chainRecommendation.cost + bankLevel.cost - Game.cookies)), actualCps))));
        }
        if (Game.HasUnlocked('Chocolate egg') && !Game.Has('Chocolate egg')) {
            subsection.append($('<div>').addClass('listing').html('<b>Time to Recoup Chocolate:</b> ' + timeDisplay(divCps(recommendation.cost + bankLevel.cost - Game.cookies, effectiveCps()) + chocolateRecoup)));
        }
        subsection.append($('<div>').addClass('listing').html('<b>Cost:</b> ' + Beautify(recommendation.cost)));
        subsection.append($('<div>').addClass('listing').html('<b>Golden Cookie Bank:</b> ' + Beautify(bankLevel.cost)));
        subsection.append($('<div>').addClass('listing').html('<b>Base &#916; CPS:</b> ' + Beautify(recommendation.base_delta_cps)));
        subsection.append($('<div>').addClass('listing').html('<b>Full &#916; CPS:</b> ' + Beautify(recommendation.delta_cps)));
        subsection.append($('<div>').addClass('listing').html('<b>Purchase Efficiency:</b> ' + Beautify(recommendation.efficiency)));
        if (isChained) {
            subsection.append($('<div>').addClass('listing').html('<b>Chain Efficiency:</b> ' + Beautify(chainRecommendation.efficiency)));
        }
        if (bankLevel.efficiency > 0) {
            subsection.append($('<div>').addClass('listing').html('<b>Golden Cookie Efficiency:</b> ' + Beautify(bankLevel.efficiency)));
        }
        menu.append(subsection);

        // Golden Cookies

        subsection = $('<div>').addClass('subsection');
        subsection.append($('<div>').addClass('title').html('Golden Cookie Information'));
        currentCookies = Math.min(Game.cookies, FrozenCookies.targetBank.cost);
        maxCookies = bestBank(Number.POSITIVE_INFINITY).cost;
        isTarget = FrozenCookies.targetBank.cost == FrozenCookies.currentBank.cost;
        isMax = currentCookies == maxCookies;
        targetTxt = isTarget ? '' : ' (Building Bank)';
        maxTxt = isMax ? ' (Max)' : '';
        subsection.append($('<div>').addClass('listing').html('<b>Current Average Cookie Value' + targetTxt + maxTxt + ':</b> ' + Beautify(cookieValue(currentCookies))));
        if (!isTarget) {
            subsection.append($('<div>').addClass('listing').html('<b>Target Average Cookie Value:</b> ' + Beautify(cookieValue(FrozenCookies.targetBank.cost))));
        }
        if (!isMax) {
            subsection.append($('<div>').addClass('listing').html('<b>Max Average Cookie Value:</b> ' + Beautify(cookieValue(maxCookies))));
        }
        subsection.append($('<div>').addClass('listing').html('<b>Max Lucky Cookie Value:</b> ' + Beautify(maxLuckyValue())));
        subsection.append($('<div>').addClass('listing').html('<b>Cookie Bank Required for Max Lucky:</b> ' + Beautify(maxLuckyBank())));
        subsection.append($('<div>').addClass('listing').html('<b>Max Chain Cookie Value:</b> ' + Beautify(calculateChainValue(chainBank(), Game.cookiesPs, (7 - (Game.elderWrath / 3))))));
        subsection.append($('<div>').addClass('listing').html('<b>Cookie Bank Required for Max Chain:</b> ' + Beautify(chainBank())));
        subsection.append($('<div>').addClass('listing').html('<b>Estimated Cookie CPS:</b> ' + Beautify(gcPs(cookieValue(currentCookies)))));
        subsection.append($('<div>').addClass('listing').html('<b>Golden Cookie Clicks:</b> ' + Beautify(Game.goldenClicks)));
        subsection.append($('<div>').addClass('listing').html('<b>Missed Golden Cookie Clicks:</b> ' + Beautify(Game.missedGoldenClicks)));
        subsection.append($('<div>').addClass('listing').html('<b>Last Golden Cookie Effect:</b> ' + Game.shimmerTypes.golden.last));
        $.each(FrozenCookies.frenzyTimes, function(rate, time) {
            subsection.append($('<div>').addClass('listing').html('<b>Total Recorded Time at x' + rate + ':</b> ' + timeDisplay(time/1000)));
        });
        menu.append(subsection);

        // Heavenly Chips

        subsection = $('<div>').addClass('subsection');
        subsection.append($('<div>').addClass('title').html('Heavenly Chips Information'));
        currPrestige = Game.prestige;
        resetPrestige = Game.HowMuchPrestige(Game.cookiesReset + Game.cookiesEarned + wrinklerValue() + chocolateValue());
        prestigeDifference = resetPrestige - currPrestige;
        currHC = Game.heavenlyChips;
        resetHC = currHC + prestigeDifference;
        subsection.append($('<div>').addClass('listing').html('<b>HC Now:</b> ' + Beautify(Game.heavenlyChips)));
        subsection.append($('<div>').addClass('listing').html('<b>HC After Reset:</b> ' + Beautify(resetHC)));
        subsection.append($('<div>').addClass('listing').html('<b>Cookies to next HC:</b> ' + Beautify(nextHC(true))));
        subsection.append($('<div>').addClass('listing').html('<b>Estimated time to next HC:</b> ' + nextHC()));
        if (currHC < resetHC) {
            subsection.append($('<div>').addClass('listing').html('<b>Time since last HC:</b> ' + timeDisplay((Date.now() - FrozenCookies.lastHCTime)/1000)));
            if (FrozenCookies.lastHCAmount - 1 >= currHC) {
                subsection.append($('<div>').addClass('listing').html('<b>Time to get last HC:</b> ' + timeDisplay((FrozenCookies.lastHCTime - FrozenCookies.prevLastHCTime)/1000)));
            }
            if (FrozenCookies.maxHCPercent > 0) {
                subsection.append($('<div>').addClass('listing').html('<b>Max HC Gain/hr:</b> ' + Beautify(FrozenCookies.maxHCPercent)));
            }
            subsection.append($('<div>').addClass('listing').html('<b>Average HC Gain/hr:</b> ' + Beautify(60 * 60 * (FrozenCookies.lastHCAmount - currHC)/((FrozenCookies.lastHCTime - Game.startDate)/1000))));
            if (FrozenCookies.lastHCAmount - 1 >= currHC) {
                subsection.append($('<div>').addClass('listing').html('<b>Previous Average HC Gain/hr:</b> ' + Beautify(60 * 60 *(FrozenCookies.lastHCAmount - 1 - currHC)/((FrozenCookies.prevLastHCTime - Game.startDate)/1000))));
            }
        }
        menu.append(subsection);

        // Other Information
        subsection = $('<div>').addClass('subsection');
        subsection.append($('<div>').addClass('title').html('Other Information'));
        cps = baseCps() + baseClickingCps(FrozenCookies.cookieClickSpeed * FrozenCookies.autoClick);
        baseChosen = (Game.hasBuff('Frenzy')) ? '' : ' (*)';
        frenzyChosen = (Game.hasBuff('Frenzy')) ? ' (*)' : '';
        clickStr = (FrozenCookies.autoClick) ? ' + Autoclick' : '';
        subsection.append($('<div>').addClass('listing').html('<b>Base CPS' + clickStr + baseChosen + ':</b> ' + Beautify(cps)));
        subsection.append($('<div>').addClass('listing').html('<b>Frenzy CPS' + clickStr + frenzyChosen + ':</b> ' + Beautify(cps * 7)));
        subsection.append($('<div>').addClass('listing').html('<b>Estimated Effective CPS:</b> ' + Beautify(effectiveCps())));
        if (Game.HasUnlocked('Chocolate egg') && !Game.Has('Chocolate egg')) {
            subsection.append($('<div>').addClass('listing').html('<b>Chocolate Egg Value:</b> ' + Beautify(chocolateValue())));
            if (!Game.hasAura('Earth Shatterer')) {
                subsection.append($('<div>').addClass('listing').css('text-indent', '2em').html('<b>+ Earth Shatterer:</b> ' + Beautify(chocolateValue(null, true))));
            }
        }
        if (liveWrinklers().length > 0) {
            subsection.append($('<div>').addClass('listing').html('<b>Wrinkler Value:</b> ' + Beautify(wrinklerValue())));
        }
        menu.append(subsection);


        if (FrozenCookies.preferenceValues) {
            subsection = $('<div>').addClass('subsection');
            subsection.append($('<div>').addClass('title').html('Frozen Cookie Controls'));
            _.keys(FrozenCookies.preferenceValues).forEach(function(preference) {
                var listing,
                    prefVal = FrozenCookies.preferenceValues[preference],
                    hint = prefVal.hint,
                    display = prefVal.display,
                    extras = prefVal.extras,
                    current = FrozenCookies[preference],
                    preferenceButtonId = preference + 'Button';
                if (display && display.length > 0 && display.length > current) {
                    listing = $('<div>').addClass('listing');
                    listing.append($('<a class="option" id="' + preferenceButtonId + '" onclick="cyclePreference(\'' + preference + '\');">' + display[current] + '</a>'));
                    if (hint) {
                        listing.append($('<label>' + hint.replace(/\$\{(.+)\}/g, function(s,id){return FrozenCookies[id];}) + '</label>'));
                    }
                    if (extras) {
                        listing.append($(extras.replace(/\$\{(.+)\}/g, function(s,id){return FrozenCookies[id];})));
                    }
                    subsection.append(listing);
                }
            });
            menu.append(subsection);
        }
        subsection = $('<div>').addClass('subsection');
        subsection.append($('<div>').addClass('title').html('Internal Information'));
        buildTable = $('<table id="fcEfficiencyTable"/>').html('<tr><th>Building</th><th>Eff%</th><th>Efficiency</th><th>Cost</th><th>&#916; CPS</th></tr>');
        recommendationList().forEach(function(rec) {
            var item    = rec.purchase,
                chainStr = (item.unlocked === 0) ? ' (C)' : '';
            buildTable.append($('<tr><td><b>' + item.name + chainStr + '</b></td><td>' + (Math.floor(rec.efficiencyScore * 10000) / 100).toString() + '%</td><td>' + Beautify(rec.efficiency) + '</td><td>' + Beautify(rec.cost) + '</td><td>' + Beautify(rec.delta_cps) + '</td></tr>'));
        });
        // Table Dividers
        buildTable.append($('<tr><td colspan="5">&nbsp;</td></tr>'));
        buildTable.append($('<tr><td colspan="5">&nbsp;</td></tr>').css('border-top', '2px dashed #999'));

        banks = [{name: 'Lucky Bank', cost: luckyBank(), efficiency: cookieEfficiency(Game.cookies, luckyBank())},
            {name: 'Lucky Frenzy Bank', cost: luckyFrenzyBank(), efficiency: cookieEfficiency(Game.cookies, luckyFrenzyBank())},
            {name: 'Chain Bank', cost: chainBank(), efficiency: cookieEfficiency(Game.cookies, chainBank())}];

        banks.forEach(function(bank) {
            var deltaCps = effectiveCps(bank.cost) - effectiveCps(Game.cookies);
            buildTable.append($('<tr><td colspan="2"><b>' + bank.name + (bank.deltaCps === 0 ? ' (*)' : '') + '</b></td><td>' + Beautify(bank.efficiency) + '</td><td>' + Beautify(Math.max(0, bank.cost - Game.cookies)) + '</td><td>' + Beautify(deltaCps) + '</td></tr>'));
        });
        buildTable.append($('<tr><td colspan="5">&nbsp;</td></tr>'));
        buildTable.append($('<tr><td colspan="5">&nbsp;</td></tr>').css('border-top', '2px dashed #999'));
        $.each({'Pledging/Appeased' : 0, 'One Mind/Awoken' : 1, 'Displeased' : 2, 'Full Wrath/Angered' : 3}, function(k,v) {
            buildTable.append($('<tr><td colspan="2"><b>' + k + (Game.elderWrath === v ? ' (*)' : '') + '</b></td><td colspan="2" title="Ratio of Effective CPS vs Base CPS">' + Beautify(effectiveCps(Game.cookies, v) / baseCps()) + '</td><td>' + Beautify(effectiveCps(Game.cookies, v) - effectiveCps()) + '</td></tr>'));
        });
        subsection.append($('<div>').addClass('listing').append(buildTable));
        menu.append(subsection);
    };
}

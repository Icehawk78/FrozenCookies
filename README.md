FrozenCookies
=============

An automated Cookie Clicker tool.

How to use
----------

## Bookmarklet install

1. Paste the *contents* (not the url) of http://icehawk78.github.io/FrozenCookies/fc_bookmarklet_loader.js into a bookmark.
2. Load up Cookie Clicker.
3. Load the recently created bookmark.

## Userscript install

0. If you don't already have it, install the required browser add-on. [Tampermonkey (Chrome)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) or [Greasemonkey (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
1. Go to http://userscripts.org/scripts/show/417095
2. Click the 'install' button in the upper right corner.
3. Load up Cookie Clicker.

What can Frozen Cookies do?
---------------------------

 - Long number shortening. (convert 1,234,567,890 to 1.235 billion)
 - Calculates the most efficient* next purchase.
 - Optionally, will automatically buy that most efficient* next purchase.
 - Calculates all sorts of stuff having to do with Golden Cookies.
 - Optionally, will automatically click Golden Cookies when they appear.
 - Calculates all sorts of stuff having to do with Heavenly Chips.
 - Displays a timer for the following items: Next Golden Cookie, Time left in Frenzy, Time until next Heavenly Chip.
 - Displays a second timer for the time to completion of Golden Cookie Bank, Next Purchase, and the end of a Chain of Purchases.
 - Calculates far more building/upgrade efficiency information that any person ever wants to know, and displays it in a not extremely user friendly manner.
 - Automatically updates to the most recent version upon load. Regardless of if that version is better or not.
 - Might not eat all of your cookies.
 
 *Note: Not guaranteed to actually be the most efficient purchase. Just the most efficient that I currently know of.

What's new?
-----------

 - 2013-10-23: Improved code stability, added large cookie autoclicker, clicking frenzy autoclicker, and blacklists for Speedrun/Hardcore achievements
 - 2013-10-22: Fixed multiple problems with the previous changes
 - 2013-10-21: Updated GC valuation code
 - 2013-10-17: Timers are much smoother and not on the FC page, many stability improvements, newer GC valuation code, and moved the hosting URL to one that won't cause script-type warnings when you load it.
 - 2013-10-03: Finally getting around to updating this file. Lots of other changes have been added in the meantime.
 - 2013-09-23: Added Chained Upgrade purchases

Upcoming features!
------------------

 - The ability to switch between multiple different number-shortening styles.
 - Add less terrible UI, including more detailed tooltips, and possible color/icon markers indicating relative efficiency of purchases.
 - Add the ability to set custom Golden Click ratio and Cookie Click ratio for more accurate valuation of Golden Cookie upgrades and Mouse upgrades.
 - Add a toggle to make timers utilise Effective CPS rather than Current CPS for "Time to Completion"
 - Other stuff? (If you're a visitor and have other ideas to be added, go here to let me know: https://github.com/Icehawk78/FrozenCookies/issues/new )

Efficiency? What's that?
========================

Frozen Cookies uses a custom tweaked Efficiency calculation to determine what the optimal purchase at the current point in time is. The current raw efficiency formula is the following:

               cost         cost
    1.15 * ----------- + ---------
           current cps   delta cps
           
This originated from the assertion that, for any purchases A and B, purchase A is superior if and only if the following inequality is true:

    a.cost     b.cost       b.cost     a.cost
    ------ + -----------  < ------ + -----------
     CPS     a.CPS + CPS     CPS     b.CPS + CPS
     
Initially, this was just simplified down to (cost/cps + cost/Δ cps), but thanks to a number of repeated simulations by Vandalite, it was found that adding a modifier to the (cost/cps) section very slightly increased the optimal build speed, as can be seen here:

![Cookie Monster uses the more naïve (cost/Δ CPS) formula, which is far less efficient than either of the Frozen Cookie efficiency algorithms.](http://i.imgur.com/BvVRadm.png)

For Golden Cookies, it was determined that using the naïve cost/Δ cps to determine when it is optimal to begin building a bank for Golden Cookies is superior to our primary efficiency algorithm, since you actually gain effective CPS increases continually while building bank (from increased Lucky payouts).

All of these calculations are subject to change if it is revealed that a different algorithm will build (and maintain) a CPS base faster than the current one. Additionally, there is uncompleted code that will simplify these numbers to a simple percentage-based system for easier user reference.

Information about Frozen Cookies' Data
======================================

This is an explanation of each piece of data contained in the Frozen Cookie menu screen.

Autobuy Information
-------------------

 - **Next Purchase**: This is what FC's formulas have determined is the optimal next purchase, and if autobuy is turned on, is *what* FC will buy next.
 - **Building Chain to**: This is only visible if FC has calculated that the best purchase is an upgrade that has prerequisites that are not yet met. In that case, this is that upgrade (whereas the "Next Purchase" will be the recommended prerequisite to purchase).
 - **Time til completion**: This is how long, at your current CPS, it will take to purchase the Next Purchase. This includes any calculated needed GC Bank.
 - **Time til Chain completion**: Only visible if building to a chain, this is how long, at your current CPS, it will take to purchase all prerequisites and the target upgrade.
 - **Cost**: The cost of the Next Purchase.
 - **Golden Cookie Bank**: The amount of cookies that FC has calculated you should keep on hand as a bank to maximise the value from Golden Cookies.
 - **Base Δ CPS**: The total amount of displayed CPS that will increase from the Next Purchase. (This includes all bonuses, regardless of what items they're on - it's just the raw amount that your CPS will increase above the Big Cookie.)
 - **Full Δ CPS**: The amount of estimated effective CPS that will increase from the Next Purchase. This is the Base Δ CPS + the amount of change in the estimated CPS value of Golden Cookies.
 - **Purchase Efficiency**: This is the efficiency calculation for the next purchase. If building to a chain, this may temporarily appear much worse than other options. If the recommendation engine formula changes, this number will too.
 - **Chain Efficiency**: Only visible if building to a chain. This is the efficiency calculation for the entire chain. (This currently does not take into account CPS increases from the purchase of prerequisites, and thus is actually under-estimating how efficient the full chain will be, to simplify calculations. This may be changed at a later date.)
 - **Golden Cookie Efficiency**: This the efficiency calculation of holding on to a bank of 10x Max Golden Cookie Value (and thus maximize the amount of Cookies earned across all Golden Cookie clicks).

Golden Cookie Information
-------------------------
 - **Current Average Cookie Value**: This is the average value of Golden Cookies with your current CPS, Cookie Bank, and upgrades. This is the idealised equivalent to clicking 1000 Golden Cookies with your current CPS/Bank/Upgrades, and then dividing the total amount of Cookies gained by 1000. If your GC Average is currently maxed out, then this will be marked as *(Max)*.
 - **Max Lucky Cookie Value**: This is the absolute maximum value that you can get from a Lucky! Golden Cookie, with the upgrades you have purchased. (Specifically, if you have Get Lucky, it's 8400 * Current CPS; Otherwise, it's 1200 * Current CPS).
 - **Cookie Bank Required for Max Lucky**: This is the amount of cookies needed to maximise a Lucky! Golden Cookie. It's just the previous value * 10.
 - **Estimated Cookie CPS**: This is a rough estimate of how much CPS you'd effectively add by clicking every Golden Cookie. Currently, with the Autoclick GC turned off, this will return 0.
 - **Golden Cookie Clicks**: The number of times you've clicked a Golden Cookie.
 - **Missed Golden Cookie Clicks**: The number of times you've *not* clicked a Golden Cookie before it faded from view.
 - **Last Golden Cookie Effect**: The internal name of the last Golden Cookie effect.
 - **Total Recorded Frenzy Time**: The total amount of time (while FC was loaded) that has been spent in a Frenzy.
 - **Total Recorded Non-Frenzy Time**: The total amount of time (while FC was loaded) that has been spent not in a Frenzy.

Heavenly Chips Information
--------------------------
 - **HC Now**: The number of HC currently owned.
 - **HC After Reset**: The number of HC you'll have if you reset right now.
 - **Cookies to next HC**: The number of cookies needed to gain one more HC after reset.
 - **Estimated time to next HC**: This is how long, at your current CPS, it will take to make enough cookies to gain one more HC after reset.
 - **Time since last HC**: This is how long it has been since the last time you gained an HC.
 - **Time to get last HC**: This is how long it actually took (including lucky bonuses, frenzy time, etc) to gain the last HC.
 - **Average HC Gain/hr**: When the last HC was gained, this was the total number of HC that have been gained (ever) since the last reset, divided by the total amount of play time. Used in conjunction with the next value, this provides a (very) rough estimate of when you should begin to think about resetting. (When Average HC/hr is constantly less than Prev HC/hr.)
 - **Previous Average HC Gain/hr**: This is the same calculation as the previous, but for the HC prior to the last one. (Yes, it's confusing. Sorry.)

Other Information
-----------------
 - **Base CPS**: This is how many cookies you create every second, when a Frenzy is not active. (Marked with (*) when this is the current CPS.)
 - **Frenzy CPS**: This is how many cookies you create every second, when a Frenzy is active. (Marked with (*) when this is the current CPS.)
 - **Estimated Effective CPS**: This is an estimate (over time) of roughly how many cookies you create every second, when including the effects of clicking Golden Cookies. This will currently be the same as the Base CPS if Autoclick GC is turned off.
 - **Game Started**: How long it's been since the most recent reset.
 
Internal Information
--------------------
This is actually a table of literally every purchase that Frozen Cookies is currently considering buying. 
 - **Efficiency**: The calculated Efficiency value of that purchase. This returns Infinity if the Δ CPS is negative. Smaller numbers are better.
 - **Cost**: The cost of either the individual purchase, or the entire chain, for chained upgrades.
 - **Δ CPS**: The full CPS change that buying this purchase would have. Includes estimated Golden Cookie CPS changes, meaning that it may be negative (especially for Elder Covenant.)
 
 
Known Issues
============

 - ~~Currently will not ever buy or recommend buying any of the Grandmapocalypse-increasing buildings while the Autoclick GC is turned on. (Due to the severe lack of efficiency in Wrath Cookies compared to Golden Cookies.)~~
 - Currently will not ever buy or recommend buying the Sacrificial Rolling Pin. (Due to not modelling the cost of the Elder Pact as lost CPS.)
 - ~~Currently will not buy or recommend buying chains of buildings in order to unlock an upgrade that, itself, might be the most efficient purchase even when combined with the cost of the prerequisite buildings.~~
 - Reports of people buying upgrades and having the cost deducted, but the purchase reverted has been noted. This is difficult to reproduce and *may* have already been fixed, but that is not currently guaranteed. Recommend saving before making any large upgrade purchases, just in case.
 - Possibly other things?
 
Contact Us!
===========

Everyone who is contributing to this project can be found at some time or another on the Cookie Clicker IRC.

Server:  irc.gamesurge.net

Channel: #ccdev or #dashnet


Special Thanks
==============
From the Cookie Clicker IRC, thanks to the following users:

 - Bryanarby, for continuing development and update compatibility
 - Vandalite, for tons of calculations and other general help with the underlying math
 - Code14715, for excessively helpful amounts of testing
 - Eearslya, for constantly nagging me to add more non-cheat-y features
 - Saeldur, for helping make the timers suck less
 - Icehawk78, for writing this section and being a conceited ass
 - Other people who I've temporarily forgotten and will add later

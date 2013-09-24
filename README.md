FrozenCookies
=============

An automated Cookie Clicker tool.

How to use
----------

1. Paste the *contents* (not the url) of https://raw.github.com/Icehawk78/FrozenCookies/master/fc_bookmarklet_loader.js into a bookmark.
2. Load up Cookie Clicker.
3. Load the recently created bookmark.

What can Frozen Cookies do?
---------------------------

 - Long number shortening. (convert 1,234,567,890 to 1.235 billion)
 - Calculates the most efficient* next purchase.
 - Optionally, will automatically buy that most efficient* next purchase.
 - Calculates all sorts of stuff having to do with Golden Cookies.
 - Optionally, will automatically click Golden Cookies when they appear.
 - Calculates all sorts of stuff having to do with Heavenly Chips.
 - Displays a timer for the following items: Next Golden Cookie, Time left in Frenzy, Time until next Heavenly Chip.
 - Automatically updates to the most recent version upon load.
 - Might not eat all of your cookies.
 
 *Note: Not guaranteed to actually be the most efficient purchase. Just the most efficient that I currently know of.

What's new?
-----------

2013-09-23: Added Chained Upgrade purchases

Information about Frozen Cookies' Data
======================================

This is an explanation of each piece of data contained in the Frozen Cookie menu screen.

Autobuy Information
-------------------

 - *Next Purchase*: This is what FC's formulas have determined is the optimal next purchase, and if autobuy is turned on, is *what* FC will buy next.
 - *Time til completion*: This is how long, at your current CPS, it will take to purchase the Next Purchase. If Autoclick Golden Cookies is turned on, this will include any calculated needed GC Bank.
 - *Cost*: The cost of the Next Purchase.
 - *Golden Cookie Bank*: The amount of cookies that FC has calculated you should keep on hand as a bank to maximise the value from Golden Cookies.
 - *Base Δ CPS*: The total amount of displayed CPS that will increase from the Next Purchase. (This includes all bonuses, regardless of what items they're on - it's just the raw amount that your CPS will increase above the Big Cookie.)
 - *Full Δ CPS*: The amount of estimated effective CPS that will increase from the Next Purchase. This is the Base Δ CPS + the amount of change in the estimated CPS value of Golden Cookies. If Golden Cookies aren't being autoclicked (and thus, currently, not being calculated for, either) then this will be the same as the Base Δ CPS.
 - *Purchase ROI*: This is a largely arbitrary number that is used to compare various purchases. This is equivalent (but not equal) to Cost / Current CPS + Cost / Full Δ CPS. If the recommendation engine formula changes, this number will too.
 - *Golden Cookie ROI*: This is a value that is used to compare to the Purchase ROI, to estimate the efficiency of holding on to a bank of 10x Max Golden Cookie Value (and thus maximize the amount of Cookies earned across all Golden Cookie clicks). This will be Infinity if Autoclick GC is turned off.

Golden Cookie Information
-------------------------
 - *Current Average Cookie Value*: This is the average value of Golden Cookies with your current CPS, Cookie Bank, and upgrades. This is the idealised equivalent to clicking 1000 Golden Cookies with your current CPS/Bank/Upgrades, and then dividing the total amount of Cookies gained by 1000. If your GC Average is currently maxed out, then this will be marked as *(Max)*.
 - *Max Lucky Cookie Value*: This is the absolute maximum value that you can get from a Lucky! Golden Cookie, with the upgrades you have purchased. (Specifically, if you have Get Lucky, it's 8400 * Current CPS; Otherwise, it's 1200 * Current CPS).
 - *Cookie Bank Required for Max Lucky*: This is the amount of cookies needed to maximise a Lucky! Golden Cookie. It's just the previous value * 10.
 - *Estimated Cookie CPS*: This is a rough estimate of how much CPS you'd effectively add by clicking every Golden Cookie. Currently, with the Autoclick GC turned off, this will return 0.

Other Information
-----------------
 - *Base CPS*: This is how many cookies you create every second, when a Frenzy is not active. (Marked with (*) when this is the current CPS.)
 - *Frenzy CPS*: This is how many cookies you create every second, when a Frenzy is active. (Marked with (*) when this is the current CPS.)
 - *Estimated Effective CPS*: This is an estimate (over time) of roughly how many cookies you create every second, when including the effects of clicking Golden Cookies. This will currently be the same as the Base CPS if Autoclick GC is turned off.
 
 
Known Issues
============

 - Currently will not ever buy or recommend buying any of the Grandmapocalypse-increasing buildings while the Autoclick GC is turned on. (Due to the severe lack of efficiency in Wrath Cookies compared to Golden Cookies.)
 - Currently will not ever buy or recommend buying the Sacrificial Rolling Pin. (Due to not modelling the cost of the Elder Pact as lost CPS.)
 - ~~Currently will not buy or recommend buying chains of buildings in order to unlock an upgrade that, itself, might be the most efficient purchase even when combined with the cost of the prerequisite buildings. (Should be fixed in an upcoming version, but isn't yet.)~~
 - Reports of people buying upgrades and having the cost deducted, but the purchase reverted has been noted. This is difficult to reproduce and *may* have already been fixed, but that is not currently guaranteed. Recommend saving before making any large upgrade purchases, just in case.
 - Possibly other things?
 
Contact Us!
===========

Everyone who is contributing to this project can be found at some time or another on the Cookie Clicker IRC.

Server:  irc.gamesurge.net
Channel: #ccdev or #dashnet

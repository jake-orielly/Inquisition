var mapTable = testMap;
var boardHTML = "";
var visibleCols = 11;
var visibleRows = 11;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var playerX = 15;
var playerY = 28;
var nextEncounter = 50;
var inCombat = false;
var inventoryMax = 15;
var cardinalOffset = [[-1,0],[0,-1],[0,1],[1,0]];
var inTown = false;
var board = [];
var textLoop, holdText;
var textSkip = false;
var monsterAttack = false;
var shopMap = [];
var npcList = [];
var conversation, conversationChoice;
var illegalTerrain = ["ocean","mountain","cave_wall","barrier","wood_wall","house00","house10","chest","chest_open","bed"];
var needTool;
var quests = {southernBeast:{phase:0}};

var toolModifierLevel = {copper:1,iron:2,steel:3};
var treeList = {oak:{toolLevel:1,resource:oak_logs,xp:7},evergreen:{toolLevel:2,resource:evergreen_logs,requiredPerk:woodcuttingAptitude,xp:17}};
var veinList = {copper_vein:{toolLevel:1,resource:copper_ore,xp:7},iron_vein:{toolLevel:2,resource:iron_ore,requiredPerk:miningAptitude,xp:17},coal_vein:{toolLevel:3,resource:coal,requiredPerk:miningAptitude,xp:25}};
var herbList = {herb_plant:{toolLevel:0,resource:herb,xp:7},mushroom_plant:{toolLevel:0,resource:mushroom,requiredPerk:alchemyAptitude,xp:17},berry_plant:{toolLevel:0,resource:berry,xp:5}};

var shouldCloseInventory = false;
var shopEntrance;

var caveTreasure = [];
var elanorTreasure = [];
var treasureTemp = [the_iron_fortress,hp_potion_medium,hp_potion_medium];
fillTreasure(caveTreasure,treasureTemp);
treasureTemp = [elanor_ring];
fillTreasure(elanorTreasure,treasureTemp);

var currTreasure;
var craftMenuAll = false;
var currMenu;

var worldBoardTemp;

function fillTreasure(treasure,list) {
	for (var i = 0; i < list.length; i++) {
	    treasure.push(new InventoryItem(list[i],1));
	}
}

flint_box.clickFunc = function() {
    var loc = $("#" + playerY + "-" + playerX);
    var curr = board[playerY][playerX];
    var playerLogs = false;
    var validSpace = true;
    
    for (var i = 0; i < curr.length; i++)
        if(!(curr[i] == "grass" || curr[i] == "cave_floor"))
            validSpace = false;

    for (var i = 0; i < inventory.length; i++) {
        for (var curr in treeList)
            if(inventory[i].item == treeList[curr].resource)
                playerLogs = treeList[curr].resource;
    }
    
    if (playerLogs && validSpace) {
        removeItem(inventory,playerLogs);
        addBoardObject("fire",playerY,playerX);
        curr += "fire";
        updateBoard();
        checkCanCraft();
    }
}

var inventory = [];
var equipment = {};

makePerkSortButtons(); 
makeBoard();

function makeBoard() {
    board = [];
    for (var i = 0; i < mapTable.length; i++) {
        board[i] = [];
        for (var j = 0; j < mapTable[i].length; j++) {
            if (mapTable == caveMap)
                board[i][j] = ["cave_floor"];
            else
                board[i][j] = ["grass"];
            if (mapTable[i][j] != "grass")
                addBoardObject(mapTable[i][j],i,j);
        }
    }
    mapAddons(mapTable);
    $("#inventoryButton").show();
}

function makePerkSortButtons(sorted = "general") {
    var categories = ["combat","magic","harvesting","crafting"];
    var onclick = "onclick='toggleSortActive(this)'";
    var result = "<td><p id=generalPerkSort " + onclick + ">General</p></td>";
    for (var i = 0; i < categories.length; i++) {
        result += "<td><div class='dropdown'>";
        result += "<button onclick='dropdownToggle($(this))' class='dropbtn'>" + capitalize(categories[i]) + "</button>";
        result += "<div id='perkDropdown' class='dropdown-content'>";
        for (var j in playerSkills) {
            if (playerSkills[j].category == categories[i])
                result += "<p id='" + j + "PerkSort' " + onclick + ">" + playerSkills[j].name + "</p>";
        }
        result += "</div></div></td>";
    }
    result += "<td><p id=featPerkSort " + onclick + ">Feats</p></td>";
    $("#perkSortButtonList").html(result);
}

function toggleSortActive(given) {
    var tempPerkList = [];
    for (var i = 0; i < perkList.length; i++)
        for(var j = 0; j < perkList[i].categories.length; j++)
            if (given.innerHTML.toLowerCase() == perkList[i].categories[j])
                tempPerkList.push(perkList[i]);
    showPerks(tempPerkList);
    $("#perkSortButtonList>td>div>div>p").removeClass("sortActive");
    given.classList.toggle("sortActive");
}

function togglePerks() {
    if ($("#perks").is(":visible"))
        $("#perks").hide();
    else 
        showPerks();
}

function showPerks(perks = perkList) {
    var result = "";
    var requirements;
    for (var i = 0; i < perks.length; i++) {
        requirements = "";
        if (!meetsRequirements(perks[i])) {
            result += "<tr class='greyedOut'>";
            requirements = "Requires: " + "<br>";
            for (var j in perks[i].requirements)
                requirements += capitalize(j) + ": " + perks[i].requirements[j] + "<br>";
            requirements = "<div style='position:relative'><span class='perkRequirement'>" + requirements + "</span></div>";
        }
        else if (perkPoints - perkPointsUsed < 5) {
            result += "<tr class='greyedOut'>";
            requirements = "Costs 1 perk point"
            requirements = "<span class='perkRequirement'>" + requirements + "</span>";
        }
        else
            result += "<tr onclick='buyPerk(" + perks[i].compName + ")'>";
        result += "<td><img src='" + perks[i].img + "'></td>";
        result += "<td><h1>" + perks[i].name + requirements + "</h1></td>";
        result += "<td><p>" + perks[i].description + "</p></td>";
        result += "</tr>";
    }
    
    for (var i = 0; i < 5; i++)
        document.getElementById("perkGem" + i).src = "art/perk_gem_empty.png";
    for (var i = 0; i < perkPoints-perkPointsUsed; i++)
        if (i >= 5)
            break;
        else
            document.getElementById("perkGem" + i).src = "art/perk_gem.png";
        
    
    $("#perkPoints").html("Perk Points Availible: " + parseInt((perkPoints-perkPointsUsed)/5));
    $("#perkTable").html(result);
    $("#perkTable>tr>td>h1").mouseenter(function() {
        $(this).find("span").removeClass("perkRequirement");
        $(this).find("span").addClass("perkRequirementHover");
    });
    $("#perkTable>tr>td>h1").mouseleave(function() {
        $(this).find("span").addClass("perkRequirement");
        $(this).find("span").removeClass("perkRequirementHover");
    });
    $("#perks").show();
}

function buyPerk(given) {
    var buffCategory, buffToPush;
    for (var i = 0; i < perkList.length; i++)
        if (given == perkList[i]) {
            perkPointsUsed += 5;
            playerPerks.push(given);
            perkList.splice(i,1);
            if (perkPoints - perkPointsUsed < 5)
                $("#perksButton").removeClass("perksButtonActive");
            if (given.abilities)
                for (var j = 0; j < given.abilities.length; j++) {
                    player.abilities.push(given.abilities[j](player.charType))
                    if (given.abilities[j](player.charType).categories.damageTrigger)
                        player.damageTriggers.push(given.abilities[j](player.charType).categories.damageTrigger);
                    if (given.abilities[j](player.charType).categories.buffs) {
                        buffCategory = Object.keys(given.abilities[j]("player").categories.buffs);
                        buffToPush = given.abilities[j]("player").categories.buffs[buffCategory];
                        player.buffs[buffCategory].push(buffToPush);
                    }
                }
        }
    showPerks();
}

function mapAddons(map) {
	if (map == testMap) {
		addBoardObject("smelter",16,17);
		addBoardObject("anvil",16,18);
		addBoardObject("distillery",31,31);
        addBoardObject("distillery",31,31);
	}
    else if (map == villageMap) {
        npcList = [];
        makeHouse(6,14,"general_shopkeeper");
        makeHouse(3,12,"tool_shopkeeper");
        makeHouse(4,3,"armor_shopkeeper");
        makeHouse(13,1,"alchemy_shopkeeper");
        makeHouse(11,11,"inkeeper");
        makeNPC(6,10,"questGiver");
    }
    else if (map == caveMap) {
        addBoardObject("chest",33,37);
        addBoardObject("skeleton",31,34);
        if (quests.southernBeast.phase < 2)
            makeBoss(33,35,"monster");
    }
    
    else if (map == shopInterior) {
        var npc;
        npcList = [];
        for (var i = 0; i < shopMap.length; i++)
            if ((shopMap[i][0] - shopEntrance[0] == -1) ||  (shopMap[i][0] - shopEntrance[0] == 0) && shopMap[i][1] == (shopEntrance[1]-1)) {
                npc = shopMap[i][2];
                break;
            }
        makeNPC(4,4,npc);
        if (npc == "inkeeper"){
            addBoardObject("bed",2,2);
        }
    }
}

function makeNPC(x,y,skin) {
    addBoardObject(skin,y,x);
    npcList.push([x,y]);
}

function teleport(x,y) {
    playerX = x;
    playerY = y;
    updateBoard();
}

$("#" + playerY + "-" + playerX).append(playerHTML);
createSkillsTable();
hideMenus();


updateBoard();

function updateBoard(camX = 0,camY = 0) {
    
    var visX = parseInt(visibleRows/2);  //Visibility in each direction is half total visibility
    var visY = parseInt(visibleCols/2);
    var botX = playerX + camX - visX; //Lowest X player can see, followed by highest X, lowest Y, etc
    var topX = playerX + camX + visX+1;
    var botY = playerY + camY - visY;
    var topY = playerY + camY + visY + 1;
    var tileMod;
    
    if (topX > mapTable[0].length || visibleCols > mapTable[0].length) {  //If the highest X player can see is off the board
        botX = mapTable[0].length - visibleCols;
        topX = mapTable[0].length; //They should only be able to see the highest X on the board
        if (botX < 0)
            botX = 0;
    }
    
    else if (botX < 0) { //If the lowest X the player can see is off the board
        botX = 0; //They should only be able to see the lowest X on the board
        topX = visibleCols;
    }
    
    if (topY > mapTable.length || visibleRows > mapTable.length) {
        botY = mapTable.length - visibleRows;
        topY = mapTable.length;
        if (botY < 0)
            botY = 0;
    }
    
    else if (botY < 0) {
        botY = 0;
        topY = visibleRows;
    }
    
    boardHTML = "";
    for (var i = botY; i < topY; i++) {
        boardHTML += "<tr>";
        for (var j = botX; j < topX; j++) {
                boardHTML += "<td class='boardTile' id='" + i + "-" + j + "'>";
                for (var k = 0; k < board[i][j].length; k++) {
                    if (isNaN(board[i][j][k])) {
                        if (board[i][j][k] == "houseInvis")
                            tileMod = houseMap(i,j,k);  
                        else if (board[i][j][k] == "monsterInvis")
                            tileMod = bossMap(i,j,k); 
                        else if (board[i][j][k] == "stonePath") {
                            tileMod = "' style = 'background:url(art/stonePathSheet.png)";
                            tileMod += bitMask(i,j);
                        }
                        else 
                            tileMod = "";

                        boardHTML += "<img class='tileItem " + board[i][j][k] + tileMod + "' src='art/" + board[i][j][k] + ".png'>";
                    }
                }
            boardHTML += "</td>";
        }
        boardHTML += "</tr>";
    }
    
    if (mapTable == caveMap && playerX == 29 && playerY == 33 && !monsterAttack && quests.southernBeast.phase < 2) {
        monsterAttack = true;
        cameraMove();
        setTimeout(function() {
            $(".monsterInvis").addClass("bossMove")
            setTimeout(function() {
                startEncounter(caveBeast);
                monsterAttack = false;
            }, 850);
        }, 1400);
    }
    
    $("#board").html(boardHTML);
    $("#" + playerY + "-" + playerX).append(playerHTML);
}

function cameraMove() {
    var count = 1;
    var cameraPan;
    cameraPan = setInterval(function() {
        updateBoard(count-1,0);
        count++;
        if (count == 6)
            clearInterval(cameraPan);
    }, 200);
}

function bitMask(x,y) {
    var result = "";
    var bitVal = 0;
    var currX, currY;
    for (var i = 0; i < cardinalOffset.length; i++) {
        currX = x + cardinalOffset[i][0];
        currY = y + cardinalOffset[i][1];
        if (board[currX] && board[currX][currY])
            bitVal += (board[currX][currY][1] == "stonePath") * Math.pow(2,i);
    }
    currX = (bitVal%4);
    currY = (parseInt(bitVal/4));
    result += " " +  ((currX > 0) * (4 - currX) * 65) + "px";
    result += " " +  ((currY > 0) * (4 - currY) * 65) + "px";
    return result;
}

function houseMap(x,y,z) {
    var result = " house";
    if (y-1 > 0 && board[x][y-1][z] == "houseInvis")
        result += 1;
    else
        result += 0;
    if (x-1 > 0 && board[x-1][y][z] == "houseInvis")
        result += 1;
    else 
        result += 0;
    return result;
}

function bossMap(x,y,z) {
    var result = " boss";
    if (y-1 > 0 && board[x][y-1][z] == "monsterInvis")
        result += 1;
    else
        result += 0;
    if (x-1 > 0 && board[x-1][y][z] == "monsterInvis")
        result += 1;
    else 
        result += 0;
    return result;
}

addItem(inventory,gold,500);
addItem(inventory,copper_dagger);
addItem(inventory,hp_potion_small);
addItem(inventory,poison_potion_small);
addItem(inventory,iron_axe);
addItem(inventory,iron_pickaxe);
addItem(inventory,iron_chestplate);
addItem(inventory,leather_gloves);

function startEncounter(given) {
    $("#worldMapContainer").hide();
    $(".inquisition").show();
    inCombat = true;
    startCombat(given);
}

function movePlayer(x,y) {
    var newX = playerX + x;
    var newY = playerY + y;
    var newLocation = $("#" + newY + "-" + newX);
    var tileType = "empty";
    var legalTile = true;
    var isHouse = (newLocation.children().hasClass("house01") || newLocation.children().hasClass("house11"));
    
    if ($("#craftMenu").is(":visible")) {
        $("#craftMenu").hide();
        craftMenuAll = false;
    }
    
    for (var i = 0; i < illegalTerrain.length; i++) 
        if ($("#" + [newY] + "-" + [newX]).children().hasClass(illegalTerrain[i]))
            legalTile = false;
    
    for (var i = 0; i < npcList.length; i++)
        if (newX == npcList[i][0] && newY == npcList[i][1])
            legalTile = false;
    
    if (isHouse && y != -1)
        legalTile = false;

    if ($("#dialogueContainer").is(":visible")) {
        $("#dialogueContainer").hide();
        clearInterval(textLoop);
        textLoop = false;
        conversation = null;
    }
    
    if ($("#shop").is(":visible")) {
        $("#shop").hide();
        $("#inventory").hide();
    }
    if ($("#treasure").is(":visible")) {
        $("#treasure").hide();
    }
    if (newX >= 0 && newX < mapTable[0].length && newY >= 0 && newY < mapTable.length && legalTile){
        if (isHouse)
            shopEntrance = [playerX,playerY];
        playerX = newX;
        playerY = newY;

        if (newLocation.children().hasClass("village"))
                tileType = "village";
        else if (newLocation.children().hasClass("cave_entrance"))
                tileType = "cave";
        
        if(!inTown)
            for (var i = 0; i < board.length; i++)
                for (var j = 0; j < board[i].length; j++)
                    for (var k = 0; k < board[i][j].length; k++)
                        if (!isNaN(board[i][j][k])) {
                            board[i][j][k]--;
                            if (board[i][j][k] == 0)
                                board[i][j][k-1] = mapTable[i][j];
                        }
                
        if (isHouse) {
            playerX = 4;
            playerY = 7;
            mapTable = shopInterior;
            makeBoard();
            updateBoard();
        }

        if (mapTable == villageMap && ((newX == 0 || newX == board.length-1) || (newY == 0 || newY == board[0].length-1))) {
            playerX = 14;
            playerY = 29;
            inTown = false;
            mapTable = testMap;
            board = worldBoardTemp;
            updateBoard();
        }
        
        else if (mapTable == shopInterior && playerX == 4 && playerY == 8) {
            playerX = shopEntrance[0];
            playerY = shopEntrance[1];
            shopMap = [];
            mapTable = villageMap;
            makeBoard();
            updateBoard();
        }
        
        if (tileType == "empty" && !inTown)
            nextEncounter -= 5;
            
        else if (tileType == "village") {
            inTown = true;
            playerX = (7 - x*7); //Player appears in village based on direction they entered from
            playerY = (7 - y*7);
            worldBoardTemp = board;
            mapTable = villageMap;
            makeBoard();
            updateBoard();
        }
        
        else if (tileType == "cave") {
            if (mapTable == testMap) {
                playerX = 17;
                playerY = 4;
                mapTable = caveMap;    
            }
            
            else if (mapTable == caveMap) {
                playerX = 17;
                playerY = 57;
                mapTable = testMap;
            }
            
            makeBoard();
            updateBoard();
        }
        
        checkCanCraft();
        updateBoard();
    }

    //if (nextEncounter <= 0)
        //startEncounter(pickMonster());
}

function pickMonster() {
    var monsters = [wolf,bear,treant,bugbear,bug];
    var num;

    if (mapTable == caveMap)
        num = parseInt(Math.random()*2) + 3;

    else if (playerY > 40)
        num = parseInt(Math.random()*2) + 2;
    else if (perkPoints + perkPointsUsed < 8)
        num = 0;
    else
        num = parseInt(Math.random()*2);
    
    return monsters[num];
}

function makeHouse(x,y,given) {
	addBoardObject("houseInvis",x,y);
	addBoardObject("houseInvis",x,y+1);
	addBoardObject("houseInvis",x-1,y);
	addBoardObject("houseInvis",x-1,y+1);
    if (given)
        shopMap.push([y,x,given]);
}

function makeBoss(x,y,given) {
    addBoardObject("monsterInvis",x,y);
	addBoardObject("monsterInvis",x,y+1);
	addBoardObject("monsterInvis",x-1,y);
	addBoardObject("monsterInvis",x-1,y+1);
}

function checkCanCraft() {
    var curr = $("#" + playerY + "-" + playerX).children();
    var currClassList;
    var canCook = false;
    var canSmith = false;
    var canSmelt = false;
    var canAlchemy = false;
    for (var i = 0; i < curr.length; i++) {
        currClassList = curr[i].classList;
        for (var j = 0; j < currClassList.length; j++) {
            if(currClassList[j] == "fire")
                canCook = true;
            else if (currClassList[j] == "anvil")
                canSmith = true;
            else if (currClassList[j] == "smelter")
                canSmelt = true;
            else if (currClassList[j] == "distillery")
                canAlchemy = true;
            
        }
    }

    if (shouldCloseInventory) {
        shouldCloseInventory = false;
        $("#inventory").hide();
    }
    hideMenus();
    
    if (canCook)
        $("#cookMenuButton").show()
    else {
        $("#cookMenu").hide();
        $("#cookMenuButton").hide();
    
    }
    if (canSmith)
        $("#smithMenuButton").show();
    else 
        $("#smithMenuButton").hide();
    if (canSmelt)
        $("#smeltMenuButton").show();
    else
        $("#smeltMenuButton").hide();
    if (canAlchemy)
        $("#alchemyMenuButton").show();
    else
        $("#alchemyMenuButton").hide();
}

function toggleInventory() {
    if ($("#equipment").is(":visible")) {
        $("#equipment").hide();
        $("#inventoryTable").hide();
    }
    else 
        showInventory();
}

function toggleSkills() { 
    if ($("#skills").is(":visible")) {
        $("#skills").hide();
        $("#upgrades").hide();
    }
    else 
        showSkills();
}

function meetsRequirements(given) {
    var result = true;
    for (var skill in given.requirements)
        if(playerSkills[skill].level < given.requirements[skill])
            result = false;
    return result;
}

function inventoryCount(source,given) {
    var total = 0;
    for (var i = 0; i < source.length; i++) {
        if (source[i] && source[i].item == given)
            total += source[i].amount;
    }
    return total;
}

function toggleMenu(given) {
    currMenu = given;
    if ($("#craftMenu").is(":visible")) {
        if (shouldCloseInventory) {
            shouldCloseInventory = false;
            $("#inventory").hide();
        }
        $("#craftMenu").hide();
    }
    else {
        if (!($("#inventory").is(":visible")))
            shouldCloseInventory = true;
        showInventory();
        showMenu(given);
    }
}

function hideMenus() {
    var menus = ["cook","smelt","smith","alchemy"];
    for (var i = 0; i < menus.length; i++) {
        if ($("#" + menus[i] + "Menu").is(":visible"))
            $("#" + menus[i] + "Menu").hide();
    }
}

function craftMenuSwitch(given) {
    craftMenuAll = given;
    showMenu(currMenu);
}

function showMenu(given) {
    var result = "";
    var currList = craftListMaster[given];
    for (var i = 0; i < currList.length; i++) {
        if (canCraft(currList[i]) || craftMenuAll) {
            result += "<tr>";
            result += "<td><img onclick='craft(" + currList[i].name + ")' src='art/" + currList[i].name + ".png'><td>";
            result += "<td onclick='craft(" + currList[i].name + ")'>";
            result += "<p>" + currList[i].getName();
            for (var j = 0; j < currList[i].craftable.recipe.length; j++) {
                result += "<br>";
                result += currList[i].craftable.recipe[j].item.getName() + " x" + currList[i].craftable.recipe[j].amount;
            }
            result += "</p></td></tr>";
        }
    }
    
    if (result == "")
        result = "<span style='font-size:24px'>No recipes</span>";
    $("#craftMenuTable").html(result);
    $("#craftMenu").show();
}

function showShop(given) {
    var shopInventory = given;
    var result, curr, addon;
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 5; j++) {
            curr = i*5 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < shopInventory.length+1) {
                addon = "<span class='inventoryMouseover mouseoverBottom'>" + shopInventory[curr-1].item.getName() + "<br>Cost: " + shopInventory[curr-1].item.value + "</span>";
                result += "<img class='inventoryItem' onclick='buy(" + shopInventory[curr-1].item.name + ")' src='art/" + shopInventory[curr-1].item.name + ".png'>" + addon;
                if (shopInventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer'><p class='inventoryItemAmount'>" + shopInventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    $("#shopTable").html(result);
    $("#shop").show();
    showInventory();
}

function showTreasure() {
    var treasureInventory = currTreasure;
    var result, curr;
    for (var i = 0; i < 3; i++) {
        result += "<tr>";
        for (var j = 0; j < 3; j++) {
            curr = i*3 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < treasureInventory.length+1) {
                result += "<img class='inventoryItem' onclick='lootItem(" + treasureInventory[curr-1].item.name + ")' src='art/" + treasureInventory[curr-1].item.name + ".png'>";
                if (treasureInventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer' onclick='lootItem(" + treasureInventory[curr-1].item.name + ")'><p class='inventoryItemAmount'>" + treasureInventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    $("#treasureTable").html(result);
    $("#treasure").show();
    showInventory();
}

function showDialogue(character,item) {
	currConvo = conversation[0];
	for (var i = 1; i < conversation.length-1; i++)
		currConvo = currConvo[conversation[i]];
    clearInterval(textLoop);
    textLoop = false;
    $("#dialogueContainer").show();
    $("#portrait").attr("src",character.portrait);
    if (currConvo[item]["line"])
    	scrollText(currConvo[item]["line"]);
    else
    	scrollText(currConvo[item]);
}

function scrollText(given) {
    var textCount = 0;
    var curr, temp, addon = "";
    
    if (chopText(given).length > 1)
        addon = "...";
    temp = chopText(given)[0] + addon;
    $("#dialogueText").html(temp[0]);
    textLoop = setInterval(function() {
        if (textSkip) {
            textCount = temp.length;
            textSkip = false;
        }
        $("#dialogueText").html(temp.substring(0,textCount));
        textCount++;
        if (textCount == temp.length+1) {
            clearInterval(textLoop);
            textLoop = false;
            if (chopText(given).length > 1)
                holdText = chopText(given).splice(1).join(" ");
            else
                holdText = null;
        }
    }, 30);
}

function chopText(text) {
    var curr = 0;
    var maxChars = 109;
    var temp = text.split(" ");
    var temp2 = "";
    var result = [];
    
    if (text.length > maxChars) {
        while ((temp2+ temp[curr]).length  < maxChars) {
            temp2 += temp[curr] + " ";
            curr++;
        }
        temp = temp.splice(curr)
        result.push(temp2.slice(0,-1));
        return result.concat(chopText(temp.join(" ")));
    }
    
    else {
    	result.push(text);
    	return result;
    }
}

function showInventory() {
    updateInventory();
    $("#equipment").css("display","inline-block");
    $("#inventoryTable").css("display","inline-block");
    updateHPMana();
}

function updateHPMana() {
    $("#hpBarCurr").height("calc(" + parseInt(player.hp/player.maxHP * 100) + "% - 1px)");
    heightDif = $("#hpBarMax").height() - $("#hpBarCurr").height();
    $("#hpBarCurr").css("margin-top",heightDif-1);
    $("#manaBarCurr").height("calc(" + parseInt(player.mana/player.maxMana * 100) + "% - 1px)");
    heightDif = $("#manaBarMax").height() - $("#manaBarCurr").height();
    $("#manaBarCurr").css("margin-top",heightDif-1);
}

function showSkills() {
    updateSkills();
    updateUpgrades();
    $("#skills").css("display","inline-block");
    $("#upgrades").css("display","inline-block");
}

function updateUpgrades() {
    var result = "";
    $("#upgradePoints").html('Points: ' + (perkPoints - upgradePointsUsed));
    for (var i = 0; i < upgrades.length; i++) {
        result += '<tr onclick="buyUpgrade(\'' + upgrades[i].stat + '\')" class="spaceUnder">';
        result += '<td>'+ upgrades[i].stat + ' +' + upgrades[i].amount + '</td>'
        result += '<td>(' + upgrades[i].cost + ')</td>'
        result += '</tr>';
    }
    $("#upgradeTable").html(result);
}

function buyUpgrade(given) {
    for (var i = 0; i < upgrades.length; i++)
        if ((perkPoints - upgradePointsUsed) >= upgrades[i].cost) {
            if (upgrades[i].stat == given)
                upgrades[i].func();
            updateUpgrades();
        }
}

function updateInventory() {
    var result,curr,heightDif,addon;
    
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 3; j++) {
            curr = i*3 + j+1;
            if (inventory[curr-1]) {
                addon = "<span class='inventoryMouseover mouseoverBottom'>" + inventory[curr-1].item.getName();
                if (inventory[curr-1] && inventory[curr-1].item.equipment.attack)
                    addon += "<br> ATK: " + inventory[curr-1].item.equipment.attack + "<br> DMG: " + inventory[curr-1].item.equipment.damage[0] + " - " + inventory[curr-1].item.equipment.damage[1];
                else if (inventory[curr-1] && inventory[curr-1].item.equipment.ac)
                    addon += "<br> AC: " + inventory[curr-1].item.equipment.ac;
                if ($("#shop").is(":visible"))
                    addon += "<br> Cost: " + inventory[curr-1].item.value;
                addon += "</span>";
            }
            result += "<td>" + addon;
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(inventory[curr-1] && curr < inventory.length+1) {
                result += "<img class='inventoryItem' onclick='itemClick(" + (curr-1) + ")' src='art/" + inventory[curr-1].item.name + ".png'>";
                if (inventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer' onclick='itemClick(" + (curr-1) + ")'><p class='inventoryItemAmount'>" + inventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    
    $("#inventoryTable").html(result);
    $("#inventoryTable>tr>td,#shopTable>tr>td").contextmenu(function() {
        if ($(".inventoryMouseOver").is(":visible"))
            $(".inventoryMouseOver").hide();
        $(this).find("span").show();
    });
}

function updateSkills() {
    for (var i = 0; i < Object.keys(playerSkills).length; i++)
        updateXPBar(Object.keys(playerSkills)[i]);
}

function createSkillsTable() {
    var result;
    for (var i = 0; i < Object.keys(playerSkills).length; i++) {
        result += "<tr>";
        result += "<td class='skillsData' id='curr" + capitalize(Object.keys(playerSkills)[i]) + "Level'> :" + playerSkills[Object.keys(playerSkills)[i]].level + "</td>";
        result += "<td class='skillsData'>" + playerSkills[Object.keys(playerSkills)[i]].name + "</td>";
        result += "</tr>";
        result += "<tr><td class='xpBarRow'><div class='xpBarMax'><div class='xpBarCurr' id='curr" + capitalize(Object.keys(playerSkills)[i]) + "XP'></div></div></td></tr>";
    }
    $("#skillsTable").html(result);
}

function updateEquipment() {
    var itemImage,itemImageR,addon,img,imgR;
    $(".equipmentItem").remove();
    for (var curr in equipment) {
	    if (equipment[curr]) {
            if (equipment[curr].item.wearable) {
                img = equipment[curr].item.wearable.left;
                itemImage = "<img class='inventoryItem equipmentItem' onclick='unEquipItem(\"" + curr + "\")' src=art/" + img + ".png>";
                imgR = equipment[curr].item.wearable.right;
                itemImageR = "<img class='inventoryItem equipmentItem' onclick='unEquipItem(\"" + curr + "\")' src=art/" + imgR + ".png>";
            }
            else {
                img = equipment[curr].item.name;
                itemImage = "<img class='inventoryItem equipmentItem' onclick='unEquipItem(\"" + curr + "\")' src=art/" + img + ".png>";
            }
            addon = "<span class='inventoryMouseover mouseoverBottom'>" + equipment[curr].item.getName();
            if (curr == "weapon")
                addon += "<br> ATK: " + equipment[curr].item.equipment.attack + "<br> DMG: " + equipment[curr].item.equipment.damage[0] + " - " + equipment[curr].item.equipment.damage[1];
            else if (equipment[curr].item.equipment.ac)
                addon += "<br> AC: " + equipment[curr].item.equipment.ac;
            addon += "</span>";
            if (equipment[curr].item.wearable) {
                $("#" + equipment[curr].item.equipment.slot + "Slot>div").eq(0).append(itemImage);
                $("#" + equipment[curr].item.equipment.slot + "Slot>div").eq(1).append(itemImageR);
            }
            else
	           $("#" + equipment[curr].item.equipment.slot + "Slot>div").append(itemImage);
            $("#" + equipment[curr].item.equipment.slot + "Slot>div").append(addon);
        }
    }
    $(".equipmentItem").contextmenu(function() {
        if ($(".inventoryMouseOver").is(":visible"))
            $(".inventoryMouseOver").hide();
        $(this).parent().find("span").show();
    });
}

function buy(given) {
    if ($("#shop").is(":visible") && inventory.length < inventoryMax) {
        var playerGold = inventoryCount(inventory,gold);
        if(playerGold >= given.value) {
            addItem(inventory,given);
            removeItem(inventory,gold,given.value);
            updateInventory();
        }   
    }
    else if (inventory.length >= inventoryMax)
        inventoryFull();
}

function itemClick(given) {
    var item = inventory[given].item;
    var isEdible = true;
    var modifier = 1;
    var keys,curr,ingredient;
    if ($("#shop").is(":visible")) {
        sell(given);
    }
    else if ($("#treasure").is(":visible"))
        stashItem(given);
    else if (item.equipment) {
        equipItem(item);
        updateInventory();
    }
    else if (item.food || item.potion) {
        if (hasPerk(veganSurvival) && item.food) {
            if (item.craftable)
                for (var i = 0; i < item.craftable.recipe.length; i++) {
                    ingredient = item.craftable.recipe[i].item;
                    if (ingredient == meat || ingredient == cooked_meat)
                        isEdible = false;
                }
            else 
                if (item == meat || item == cooked_meat)
                    isEdible = false;
            if (!isEdible)
                return;
            else
                modifier = 2;
        }
        
        if (item.food)
            curr = item.food;
        else 
            curr = item.potion;
        
        keys = Object.keys(curr);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] == "func")
                curr.func();
            else
                player[keys[i]] += curr[keys[i]] * modifier;
        }
        
        if (player.hp > player.maxHP)
            player.hp = player.maxHP;
        if (player.mana > player.maxMana)
            player.mana = player.maxMana;
        updateHPMana();
        if (item.potion)
            addItem(inventory,item.craftable.recipe[item.craftable.recipe.length-1].item);
        removeItem(inventory,item);
    }
    
    else if (item.clickFunc) {
        item.clickFunc();
    }
}

function sell(given) {
    if(inventory[given].item.name != "gold" && !inventory[given].item.questItem) {
        addItem(inventory,gold,inventory[given].item.value);
        removeItem(inventory,inventory[given].item);
        updateInventory();
    }   
}

function stashItem(given) {
    if (!inventory[given].item.questItem) {
        addItem(currTreasure,inventory[given].item);
        removeItem(inventory,inventory[given].item);
        updateInventory();
        showTreasure();
    }
}

document.addEventListener('keydown', keyResponse);

function keyResponse(event) {
    if (!inCombat && !monsterAttack) {
        if (event.keyCode == 87) {
            if (conversationChoice == undefined)
                movePlayer(0,-1);
            else
                conversationSelect(-1);
        }
        else if (event.keyCode == 68)
            movePlayer(1,0);
        else if (event.keyCode == 83) {
            if (conversationChoice == undefined)
                movePlayer(0,1);
            else 
                conversationSelect(1);
        }
        else if (event.keyCode == 65)
            movePlayer(-1,0);
        else if (event.keyCode == 69)
            tileAction();
    }
}

function conversationSelect(direction) {
    var currKeys;
    if (!textLoop && !holdText) {
	    currConvo = conversation[0];
	    for (var i = 1; i < conversation.length; i++)
	    	currConvo = currConvo[conversation[i]];
        conversationChoice += direction;
        $("#dialogueText").html("");
        currKeys = Object.keys(currConvo.responses);
        for (var i = 0; i < currKeys.length; i++) {
            if (i == Math.abs(conversationChoice % currKeys.length))
                $("#dialogueText").html($("#dialogueText").html() + ">");
            $("#dialogueText").html($("#dialogueText").html() + capitalize(Object.values(currConvo.responses)[i]) + "<br>");
        }
    }
}

function tileAction() {
    var curr = board[playerY][playerX];
    var currResource; 
    var resourceType;
    var currTool;
    var toolLevel = 0;
    var toolMap = ["axe","pickaxe","pickaxe"];
    var toolLevelMap = ["copper","iron"];
    var skillMap = [playerSkills.woodcutting.level,playerSkills.mining.level,playerSkills.alchemy.level];
    var currX, currY, currNPC, currChoice;
    
    if (!conversation) {
        if (board[playerY][playerX][2] == "skeleton") {
            currTreasure = elanorTreasure;
            showTreasure(currTreasure);
            shouldCloseInventory = true;
            showInventory();
            updateBoard();
        }
	    for (var i = 0; i < cardinalOffset.length; i++) {
            currX = playerX + cardinalOffset[i][0];
            currY = playerY + cardinalOffset[i][1];

            for (var j = 0; j < board[currY][currX].length; j++) {
                if(board[currY][currX][j] == "chest" || board[currY][currX][j] == "chest_open") {
                    currTreasure = caveTreasure;
                    board[currY][currX][j] = "chest_open";
                    showTreasure(currTreasure);
                    shouldCloseInventory = true;
                    showInventory();
                    updateBoard();
                }   
            }
            
            for (var j = 0; j < npcList.length; j++) {
                if (currX == npcList[j][0] && currY == npcList[j][1]) {
	                conversation = [];
                    currNPC = window["" + board[npcList[j][1]][npcList[j][0]].slice(-1)[0]];
                    if (currNPC.shop)
                        showShop(currNPC.shop);
                    if(currNPC == alchemy_shopkeeper) {
                        if (inventoryCount(inventory,elanor_ring)) {
                            alchemy_shopkeeper.line = "I heard you went to the beast's cave. Did you find a ring by any chance?";
                            alchemy_shopkeeper.responses = {yes:"Yes [Give Ring]",no:"no"};
                            alchemy_shopkeeper.yes = {line:"Thank you. You don't know how much this means to me."};
                            alchemy_shopkeeper.yes.func = function() {
                                removeItem(inventory,elanor_ring);
                            }
                            alchemy_shopkeeper.no = {line:"Oh... alright. Thank you anyway."};
                        }
                        else {
                            alchemy_shopkeeper.line = "Potions for whatever ails you!";
                            alchemy_shopkeeper.responses = null;
                            alchemy_shopkeeper.yes = null;
                            alchemy_shopkeeper.no = null;
                        }
                    }
				    conversation.push(currNPC);
                    showDialogue(currNPC,"line");
                }
            }
        }
    }
    
    else {
	    if (textLoop) 
        	textSkip = true;
	    else if (holdText)
	        scrollText(holdText);
	    else {
		    currConvo = conversation[0];
		    for (var i = 1; i < conversation.length; i++) {
		    	currConvo = currConvo[conversation[i]];
		    }
		    
		    if (conversationChoice != null) {
                currChoice = Object.keys(currConvo.responses)[conversationChoice];
                if (currConvo[currChoice].func)
                    currConvo[currChoice].func();
		        conversation.push(currChoice);
		        showDialogue(conversation[0],currChoice);
                if (currConvo[currChoice].backtrack) {
                    for (var i = 0; i < conversation.length; i++)
                        if (conversation[i] == currConvo[currChoice].backtrack)
                            conversation = conversation.splice(0,2);
                }
		        conversationChoice = null;
		    }
		    else if (currConvo.responses) {
			    $("#dialogueText").html(">");
	            conversationChoice = 0;
	            for (var i in currConvo.responses)
	                $("#dialogueText").html($("#dialogueText").html() + capitalize(currConvo.responses[i]) + "<br>");
		    }
		    else {
			    $("#dialogueContainer").hide();
	            conversation = null;
		    }
	    }
    }
        
    for (var i = 0; i < curr.length; i++) {
        if (Object.keys(treeList).includes(curr[i])) {
            currResource = treeList[curr[i]];
            resourceType = 0;
        }
        else if (Object.keys(veinList).includes(curr[i])) {
            currResource = veinList[curr[i]];
            resourceType = 1;
        }
        else if (Object.keys(herbList).includes(curr[i])) {
            currResource = herbList[curr[i]];
            resourceType = 2;
        }
    }
    
    for (var i = 0; i < inventory.length; i++) {
        currTool = inventory[i].item.equipment;
        if (currTool && currTool.name == toolMap[resourceType])
            for (var j = 0; j < currTool.modifierNames.length; j++)
                toolLevel = Math.max(toolLevel, toolModifierLevel[currTool.modifierNames[j]]);
    }
    if (equipment.weapon && equipment.weapon.item.equipment.name == toolMap[resourceType])
        for (var j = 0; j < equipment.weapon.item.equipment.modifierNames.length; j++)
                toolLevel = Math.max(toolLevel, toolModifierLevel[equipment.weapon.item.equipment.modifierNames[j]]);
    
    if(currResource && toolLevel >= currResource.toolLevel && hasPerk(currResource.requiredPerk)) {
        if (inventory.length < inventoryMax) {
            harvest(currResource);
            if (resourceType == 0)
                curr[curr.length-1] = curr[curr.length-1].toString() + "_stump";
            else if (resourceType == 2)
                curr[curr.length-1] = curr[curr.length-1].toString() + "_picked";
            else 
                curr[curr.length-1] = "rock";
            curr.push(parseInt(Math.random()*25)+25);
            updateBoard();
        }
        else
            inventoryFull();
    }
    else {
        if (currResource && !hasPerk(currResource.requiredPerk)) {
            $("#toolNeededText").html("Need " + currResource.requiredPerk.name);
            $("#toolNeededImage").attr("src", currResource.requiredPerk.img);
            $("#toolNeeded").fadeIn(200);
            clearInterval(needTool);
            needTool = setTimeout(function() {
                $("#toolNeeded").fadeOut(200);
            },1500);
        }
        else if (currResource && toolLevel < currResource.toolLevel) {
            $("#toolNeededText").html("Need " + toolLevelMap[currResource.toolLevel-1] + " " + toolMap[resourceType]);
            $("#toolNeededImage").attr("src","art/" + toolLevelMap[currResource.toolLevel-1] + "_" + toolMap[resourceType] + ".png");
            $("#toolNeeded").fadeIn(200);
            clearInterval(needTool);
            needTool = setTimeout(function() {
                $("#toolNeeded").fadeOut(200);
            },1500);
        }
    }
}

function inventoryFull() {
    $("#toolNeededText").html("Inventory Full");
    $("#toolNeededImage").attr("src", "art/inventoryFull.png");
    $("#toolNeeded").fadeIn(200);
    clearInterval(needTool);
    needTool = setTimeout(function() {
        $("#toolNeeded").fadeOut(200);
    },900);
}

function hasPerk(given) {
    if (given == null)
        return true;
    else 
        for (var i = 0; i < playerPerks.length; i++)
            if (playerPerks[i] == given)
                return true;
    return false;
}

function craft(given) {
    if (canCraft(given)) {
	    craftXP(given);
        for (var i = 0; i < given.craftable.recipe.length; i++)
                removeItem(inventory,given.craftable.recipe[i].item,given.craftable.recipe[i].amount);
        addItem(inventory,given);
        
        for (var i = 0; i < 2; i++) {
            toggleMenu(currMenu);
        }
        updateInventory();
        if (!($("#inventory").is(":visible"))) {
            shouldCloseInventory = true;
            showInventory();
        }
    }
}

function canCraft(given) {
    var recipe = given.craftable.recipe;
    if (!hasPerk(given.craftable.requiredPerk))
        return false;
    
    for (var i = 0; i < recipe.length; i++) {
        if (!(inventoryCount(inventory,recipe[i].item) >= recipe[i].amount))
            return false;
    }

    return true;
}

function loot(given) {
    var curr;
    currTreasure = [];
    if (given.loot) {
        for (var i = 0; i < given.loot.length; i++) {
            curr = given.loot[i];
            if (percentile() <= curr.odds) {
                if (Array.isArray(curr.amount))
                    currTreasure.push(new InventoryItem(curr.item,getDamage(curr.amount[0],curr.amount[1])));
                else 
                    currTreasure.push(new InventoryItem(curr.item,curr.amount));
            }
        }
    }
    shouldCloseInventory = true;
    showTreasure(currTreasure);
}

function percentile() {
    return parseInt(Math.random()*100+1);
}

function addItem (source,item,amount = 1) {
    var newAmount;
    if (item.stackable) {
        for (var i = 0; i < source.length; i++) {
            if (item == source[i].item) {
                newAmount = source[i].amount + amount;
                source[i] = new InventoryItem(item, newAmount);
                return;
            }
        }
        source.push(new InventoryItem(item,amount));
    }
    else if (amount > 1)
        for (var i = 0; i < amount; i++)
            source.push(new InventoryItem(item,1));
    else {
        for (var i = 0; i < source.length; i++) {
            if (!source[i]) {
                source[i] = new InventoryItem(item,amount);
                return
            }
        }
        source.push(new InventoryItem(item,amount));
    }
    updateInventory();
}

function lootItem(item,amount = 1) {
    if (inventory.length < inventoryMax) {
        addItem(inventory,item,amount);
        removeItem(currTreasure,item,amount);
        showTreasure(currTreasure);
    }
    else if (inventory.length >= inventoryMax)
        inventoryFull();
}

function equipItem (given) {
	if (player[given.equipment.slot])
		unEquipItem(given.equipment.slot);
		
	player[given.equipment.slot] = given.equipment;
    removeItem(inventory,given);
    if (given.equipment.constructor.name == "Armor")
        equipment[given.equipment.slot] = new InventoryItem(given, 1);
    else
        equipment[given.equipment.slot] = new InventoryItem(given, 1);
    for (var i = 0; i < given.equipment.modifiers.length; i++)
        if (given.equipment.modifiers[i].equipFunc)
            given.equipment.modifiers[i].equipFunc();
    updateEquipment();
}

function unEquipItem (given) {
	if (equipment[given] && inventory.length < inventoryMax) {
        for (var i = 0; i < equipment[given].item.equipment.modifiers.length; i++)
            if (equipment[given].item.equipment.modifiers[i].unEquipFunc)
                equipment[given].item.equipment.modifiers[i].unEquipFunc();
	    addItem(inventory,equipment[given].item);
	    player[given.toLowerCase()] = null;
	    equipment[given] = null;
        $(".equipmentItem").parent().find("span").remove();
	    updateEquipment();
    }
    else if (inventory.length >= inventoryMax)
        inventoryFull();
}

function removeItem (source,item,amount = 1) {
    if (inventoryCount(source,item) < amount)
        alert("Error 2: Tried to remove more of item than is in inventory. " + item.name + " : " + amount);
    else {
        for (var i = 0; i < source.length; i++) {
            if (item == source[i].item) {
                if (source[i].amount >= amount) {
                    source[i].amount -= amount;
                    amount = 0;
                    if (source[i].amount == 0)
                        source[i] = null;
                    break;
                }
                else {
                    amount -= source[i].amount;
                    source.amount = 0;
                    source[i] = null;
                    i--;
                }
            }
        }
        updateInventory();
    }
}

function addBoardObject(given,x,y) {
    board[x][y].push(given);
}
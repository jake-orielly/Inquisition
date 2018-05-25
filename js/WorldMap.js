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
var illegalTerrain = ["ocean","mountain","cave_wall","barrier","wood_wall","house00","house10","chest","chest_open"];

var foodList = [cooked_meat,seasoned_meat];
var smeltList = [copper_bar,iron_bar];
var smithList = [copper_axe, copper_pickaxe, copper_short_sword, copper_mace, copper_chestplate, copper_platelegs,iron_axe,iron_pickaxe, iron_chestplate,iron_platelegs];
var potionList = [hp_potion_small,hp_potion_medium];
var craftListMaster = {cook:foodList,smith:smithList,smelt:smeltList,alchemy:potionList};

var toolModifierLevel = {copper:1,iron:2,steel:3};
var treeList = {oak:{toolLevel:1,resource:oak_logs,playerLevel:1,xp:6},evergreen:{toolLevel:2,resource:evergreen_logs,playerLevel:5,xp:15}};
var veinList = {copper_vein:{toolLevel:1,resource:copper_ore,playerLevel:1,xp:8},iron_vein:{toolLevel:2,resource:iron_ore,playerLevel:5,xp:17},coal_vein:{toolLevel:3,resource:coal,playerLevel:10,xp:25}};
var herbList = {herb_plant:{toolLevel:0,resource:herb,playerLevel:1,xp:9},mushroom_plant:{toolLevel:0,resource:mushroom,playerLevel:1,xp:14}};

var shouldCloseInventory = false;
var shopEntrance;

var caveTreasure = [];
var treasureTemp = [hp_potion_medium,hp_potion_medium];
fillTreasure(caveTreasure,treasureTemp);
var currTreasure;

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

$(".craftMenuButton").hide();
$(".inquisition").hide();

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
}

function makePerkSortButtons(sorted = "general") {
    var onclick = "onclick='toggleSortActive(this)'";
    var result = "<td><button id='generalPerkSort'" + onclick + ">General</button></td>";
    for (var i in playerSkills) {
        result += "<td><button id='" + i + "PerkSort' " + onclick + ">" + playerSkills[i].name + "</button></td>";
    }
    $("#perkSortButtonList").html(result);
    $("#generalPerkSort").toggleClass("sortActive")
}

function toggleSortActive(given) {
    var tempPerkList = [];
    for (var i = 0; i < perkList.length; i++)
        for(var j = 0; j < perkList[i].categories.length; j++)
            if (given.innerHTML.toLowerCase() == perkList[i].categories[j])
                tempPerkList.push(perkList[i]);
    showPerks(tempPerkList);
    $("#perkSortButtonList>td>button").removeClass("sortActive");
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
    var grey;
    
    for (var i = 0; i < perks.length; i++) {
        grey = "";
        //if (!meetsRequirements(perks[i]))
            //grey = "greyedOut";
        result += "<tr class='" + grey + "'>";
        result += "<td><img src='" + perks[i].img + "'></td>";
        result += "<td><h1>" + perks[i].name + "</h1></td>";
        result += "<td><p>" + perks[i].description + "</p></td>";
        result += "</tr>";
    }
    
    $("#perkTable").html(result);
    $("#perks").show();
}

function mapAddons(map) {
	if (map == testMap) {
		addBoardObject("smelter",16,17);
		addBoardObject("anvil",16,18);
		addBoardObject("distillery",31,31);
	}
    else if (map == villageMap) {
        npcList = [];
        makeHouse(6,14,"general_shopkeeper");
        makeHouse(3,12,"tool_shopkeeper");
        makeHouse(4,4,"armor_shopkeeper");
        makeHouse(6,1,"alchemy_shopkeeper");
        makeNPC(10,10,"questGiver");
    }
    else if (map == caveMap) {
        makeBoss(33,35,"monster");
        addBoardObject("chest",33,37);
    }
    
    else if (map == shopInterior) {
        npcList = [];
        for (var i = 0; i < shopMap.length; i++)
            if ((shopMap[i][0] - shopEntrance[0] == -1) ||  (shopMap[i][0] - shopEntrance[0] == 0) && shopMap[i][1] == (shopEntrance[1]-1)) {
                makeNPC(4,4,shopMap[i][2]);
                break;
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
            boardHTML += "</td>";
        }
        boardHTML += "</tr>";
    }
    
    if (mapTable == caveMap && playerX == 29 && playerY == 33 && !monsterAttack) {
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
addItem(inventory,hp_potion_small);
addItem(inventory,copper_axe);

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
            makeBoard();
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
        
        if (tileType == "empty")
            nextEncounter -= 5;
            
        else if (tileType == "village") {
            inTown = true;
            playerX = (7 - x*7); //Player appears in village based on direction they entered from
            playerY = (7 - y*7);
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
        //startEncounter();
}

function makeHouse(x,y,given) {
	addBoardObject("houseInvis",x,y);
	addBoardObject("houseInvis",x,y+1);
	addBoardObject("houseInvis",x-1,y);
	addBoardObject("houseInvis",x-1,y+1);
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
    if ($("#inventory").is(":visible"))
        $("#inventory").hide();
    else 
        showInventory();
}

function toggleSkills() { 
    if ($("#skills").is(":visible"))
        $("#skills").hide();
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
        if (source[i].item == given)
            total += source[i].amount;
    }
    return total;
}

function toggleMenu(given) {
    if ($("#" + given + "Menu").is(":visible")) {
        if (shouldCloseInventory) {
            shouldCloseInventory = false;
            $("#inventory").hide();
        }
        $("#" + given + "Menu").hide();
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

function showMenu(given) {
    var result = "";
    var currList = craftListMaster[given];
    for (var i = 0; i < currList.length; i++) {
        if (canCraft(currList[i])) {
            result += "<tr>";
            result += "<td><img onclick='craft(" + currList[i].name + ")' src='art/" + currList[i].name + ".png'><td>";
            result += "<td>" + currList[i].getName() + "<td>";
            result += "</tr>";
        }
    }
    
    if (result == "")
        result = "No recipes ";
    $("#" + given + "MenuTable").html(result);
    $("#" + given + "Menu").show();
}

function showShop(given) {
    var shopInventory = given;
    var result, curr;
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 5; j++) {
            curr = i*5 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < shopInventory.length+1) {
                result += "<img class='inventoryItem' onclick='buy(" + shopInventory[curr-1].item.name + ")' src='art/" + shopInventory[curr-1].item.name + ".png'>";
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
                    result += "<div class='inventoryAmountContainer'><p class='inventoryItemAmount'>" + treasureInventory[curr-1].amount + "</p></div>";
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
    $("#inventory").show();
    $("#hpBarCurr").height("calc(" + parseInt(player.hp/player.maxHP * 100) + "% - 1px)");
    heightDif = $("#hpBarMax").height() - $("#hpBarCurr").height();
    $("#hpBarCurr").css("margin-top",heightDif-1);
}

function showSkills() {
    updateSkills();
    $("#skills").css("display","inline-block");
}

function updateInventory() {
    var result;
    var curr;
    var heightDif;
    
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 3; j++) {
            curr = i*3 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < inventory.length+1) {
                result += "<img class='inventoryItem' onclick='itemClick(" + (curr-1) + ")' src='art/" + inventory[curr-1].item.name + ".png'>";
                if (inventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer'><p class='inventoryItemAmount'>" + inventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    
    $("#inventoryTable").html(result);
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
    var itemImage;
    for (var i = 0; i < $(".equipmentItem").length; i++) {
	    $(".equipmentItem").remove();
    }
    for (var curr in equipment) {
	    if (equipment[curr]) {
		    itemImage = "<img class='inventoryItem equipmentItem' onclick='unEquipItem(\"" + curr + "\")' src=art/" + equipment[curr].item.name + ".png>";
	        $("#" + equipment[curr].item.equipment.slot + "Slot").append(itemImage);
        }
    }
}

function buy(given) {
    if ($("#shop").is(":visible")) {
        var playerGold = inventoryCount(inventory,gold);
        if(playerGold >= given.value) {
            addItem(inventory,given);
            removeItem(inventory,gold,given.value);
            updateInventory();
        }   
    }
}

function itemClick(given) {
    var item = inventory[given].item;
    var keys,curr;
    
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
        if (item.food)
            curr = item.food;
        else 
            curr = item.potion;
        
        keys = Object.keys(curr);
        for (var i = 0; i < keys.length; i++)
            player[keys[i]] += curr[keys[i]];
        
        if (player.hp > player.maxHP)
            player.hp = player.maxHP;
        $("#hpBarCurr").height("calc(" + parseInt(player.hp/player.maxHP * 100) + "% - 1px)");
        heightDif = $("#hpBarMax").height() - $("#hpBarCurr").height();
        $("#hpBarCurr").css("margin-top",heightDif-1);
        if (item.potion)
            addItem(inventory,item.craftable.recipe[item.craftable.recipe.length-1].item);
        removeItem(inventory,item);
    }
    
    else if (item.clickFunc) {
        item.clickFunc();
    }
}

function sell(given) {
    if(inventory[given].item.name != "gold") {
        addItem(inventory,gold,(inventory[given].item.value*inventory[given].amount));
        removeItem(inventory,inventory[given].item,inventory[given].amount);
        updateInventory();
    }   
}

function stashItem(given) {
    addItem(currTreasure,inventory[given].item,inventory[given].amount);
    removeItem(inventory,inventory[given].item,inventory[given].amount);
    updateInventory();
    showTreasure();
}

document.addEventListener('keydown', function(event) {
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
});

function conversationSelect(direction) {
    if (!textLoop && !holdText) {
	    currConvo = conversation[0];
	    for (var i = 1; i < conversation.length; i++)
	    	currConvo = currConvo[conversation[i]];
        conversationChoice += direction;
        $("#dialogueText").html("");
        for (var i = 0; i < currConvo.responses.length; i++) {
            if (i == Math.abs(conversationChoice % currConvo.responses.length))
                $("#dialogueText").html($("#dialogueText").html() + ">");
            $("#dialogueText").html($("#dialogueText").html() + capitalize(currConvo.responses[i]) + "<br>");
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
    var skillMap = [playerSkills.woodcutting.level,playerSkills.mining.level,playerSkills.alchemy.level];
    var currX, currY, currNPC;
    
    if (!conversation) {
	    for (var i = 0; i < cardinalOffset.length; i++) {
            currX = playerX + cardinalOffset[i][0];
            currY = playerY + cardinalOffset[i][1];

            for (var j = 0; j < board[currY][currX].length; j++)
                if(board[currY][currX][j] == "chest" || board[currY][currX][j] == "chest_open") {
                    currTreasure = caveTreasure;
                    board[currY][currX][j] = "chest_open";
                    showTreasure(currTreasure);
                    shouldCloseInventory = true;
                    showInventory();
                    updateBoard();
                }
            
            for (var j = 0; j < npcList.length; j++) {
                if (currX == npcList[j][0] && currY == npcList[j][1]) {
	                conversation = [];
                    currNPC = window["" + board[npcList[j][1]][npcList[j][0]].slice(-1)[0]];
                    if (currNPC.shop)
                        showShop(currNPC.shop);
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
		        conversation.push(currConvo.responses[conversationChoice]);
		        showDialogue(conversation[0],currConvo.responses[conversationChoice]);
                if (currConvo[currConvo.responses[conversationChoice]].backtrack) {
                    for (var i = 0; i < conversation.length; i++)
                        if (conversation[i] == currConvo[currConvo.responses[conversationChoice]].backtrack)
                            conversation = conversation.splice(0,2);
                }
		        conversationChoice = null;
		    }
		    else if (currConvo.responses) {
			    $("#dialogueText").html(">");
	            conversationChoice = 0;
	            for (var i = 0; i < currConvo.responses.length; i++)
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
    
    if(currResource && toolLevel >= currResource.toolLevel && skillMap[resourceType] >= currResource.playerLevel) {
        harvest(currResource);
        if (resourceType == 0)
        	curr[curr.length-1] = curr[curr.length-1].toString() + "_stump";
        else if (resourceType == 2)
            curr[curr.length-1] = curr[curr.length-1].toString() + "_picked";
        else 
        	curr[curr.length-1] = "rock";
        updateBoard();
    }
}

function craft(given) {
    if (canCraft(given)) {
	    craftXP(given);
        for (var i = 0; i < given.craftable.recipe.length; i++)
                removeItem(inventory,given.craftable.recipe[i].item,given.craftable.recipe[i].amount);
        addItem(inventory,given);
        
        for (var i = 0; i < 2; i++) {
            toggleMenu("cook");
            toggleMenu("smelt");
            toggleMenu("smith");
            toggleMenu("alchemy");
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
    if (getSkill(given).level < given.craftable.playerLevel)
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
    for (var i = 0; i < given.loot.length; i++) {
        curr = given.loot[i];
        if (percentile() <= curr.odds) {
            if (Array.isArray(curr.amount))
                currTreasure.push(new InventoryItem(curr.item,rangeVal(curr.amount)));
            else 
                currTreasure.push(new InventoryItem(curr.item,curr.amount));
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
    }

    source.push(new InventoryItem(item,amount));
    updateInventory();
}

function lootItem(item,amount = 1) {
    addItem(inventory,item,amount);
    removeItem(currTreasure,item,amount);
    showTreasure(currTreasure);
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
    updateEquipment();
}

function unEquipItem (given) {
	if (equipment[given]) {
	    addItem(inventory,equipment[given].item);
	    player[given.toLowerCase()] = null;
	    equipment[given] = null;
	    updateEquipment();
    }
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
                        source.splice(i,1);
                    break;
                }
                else {
                    amount -= source[i].amount;
                    source.amount = 0;
                    source.splice(i,1);
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
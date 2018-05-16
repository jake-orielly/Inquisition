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
var shopMap = [];
var npcList = [];
var illegalTerrain = ["ocean","mountain","cave_wall","barrier"];

var Craftable = function (xp,playerLevel,recipe) {
	this.xp = xp;
	this.playerLevel = playerLevel;
	this.recipe = recipe;
}

var oak_logs = new Item("oak_logs",false,false,3);
var evergreen_logs = new Item("evergreen_logs",false,false,8);
var herb = new Item("herb",false,false,7);
var mushroom = new Item("mushroom",false,false,11);
var meat = new Item("meat",false,false,4);
meat.food = {hp:3};
var cooked_meat = new Item("cooked_meat",false,false,7,new Craftable(9,1,[{item:meat,amount:1}]));
cooked_meat.food = {hp:8};
var seasoned_meat = new Item("seasoned_meat",false,false,16,new Craftable(14,3,[{item:meat,amount:1},{item:herb,amount:1}]));
seasoned_meat.food = {hp:14};

var copper_ore = new Item("copper_ore",false,false,3);
var copper_bar = new Item("copper_bar",true,false,8,new Craftable(15,1,[{item:copper_ore,amount:2}]));
var iron_ore = new Item("iron_ore",false,false,11);
var iron_bar = new Item("iron_bar",true,false,24,new Craftable(25,5,[{item:iron_ore,amount:2}]));
var coal = new Item("coal",false,false,16);
var copper_axe = new Item("copper_axe",false,makeAxe(["copper"]),15,new Craftable(20,1,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_axe = new Item("iron_axe",false,makeAxe(["iron"]),45,new Craftable(50,5,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));
var steel_axe = new Item("steel_axe",false,makeAxe(["steel"]),115);
var copper_pickaxe = new Item("copper_pickaxe",false,makePickaxe(["copper"]),15,new Craftable(20,1,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_pickaxe = new Item("iron_pickaxe",false,makePickaxe(["iron"]),45,new Craftable(50,5,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));
var copper_chestplate = new Item("copper_chestplate",false,makeChestplate(["copper"]),75,new Craftable(45, 3,[{item:copper_bar,amount:7}]));
var iron_chestplate = new Item("iron_chestplate",false,makeChestplate(["iron"]),190,new Craftable(90,8,[{item:iron_bar,amount:7}]));
var copper_platelegs = new Item("copper_platelegs",false,makePlatelegs(["copper"]),45,new Craftable(30,2,[{item:copper_bar,amount:4}]));
var iron_platelegs = new Item("iron_platelegs",false,makePlatelegs(["iron"]),115,new Craftable(75,7,[{item:iron_bar,amount:4}]));

var glass_vial = new Item("glass_vial",false,false,5);
var glass_jar = new Item("glass_jar",false,false,10);
var hp_potion_small = new Item("hp_potion_small",false,false,25,new Craftable(15,1,[{item:herb,amount:2},{item:glass_vial,amount:1}]));
hp_potion_small.potion = {hp:5};
var hp_potion_medium = new Item("hp_potion_medium",false,false,80,new Craftable(35,1,[{item:herb,amount:3},{item:mushroom,amount:1},{item:glass_jar,amount:1}]));
hp_potion_medium.potion = {hp:10};

var gold = new Item("gold",true,false,1);
var flint_box = new Item("flint_box",false,false,5);

var foodList = [cooked_meat,seasoned_meat];
var smeltList = [copper_bar,iron_bar];
var smithList = [copper_axe, copper_pickaxe, copper_chestplate, copper_platelegs,iron_axe,iron_pickaxe, iron_chestplate,iron_platelegs];
var potionList = [hp_potion_small,hp_potion_medium];
var craftListMaster = {cook:foodList,smith:smithList,smelt:smeltList,alchemy:potionList};

var toolModifierLevel = {copper:1,iron:2,steel:3};
var treeList = {oak:{toolLevel:1,resource:oak_logs,playerLevel:1,xp:6},evergreen:{toolLevel:2,resource:evergreen_logs,playerLevel:5,xp:15}};
var veinList = {copper_vein:{toolLevel:1,resource:copper_ore,playerLevel:1,xp:8},iron_vein:{toolLevel:2,resource:iron_ore,playerLevel:5,xp:17},coal_vein:{toolLevel:3,resource:coal,playerLevel:10,xp:25}};
var herbList = {herb_plant:{toolLevel:0,resource:herb,playerLevel:1,xp:9},mushroom_plant:{toolLevel:0,resource:mushroom,playerLevel:1,xp:14}};

var shouldCloseInventory = false;

flint_box.clickFunc = function() {
    var loc = $("#" + playerY + "-" + playerX);
    var curr = board[playerY][playerX];
    var playerLogs = false;
    var validSpace = true;

    for (var i = 0; i < curr.length; i++)
        if(curr[i] != "grass" || curr[i] != "cave_floor")
            validSpace = false;
    
    for (var i = 0; i < inventory.length; i++) {
        for (var curr in treeList)
            if(inventory[i].item == treeList[curr].resource)
                playerLogs = treeList[curr].resource;
    }
    
    if (playerLogs && validSpace) {
        removeItem(playerLogs);
        addBoardObject("fire",playerY,playerX);
        curr += "fire";
        updateBoard();
        checkCanCraft();
    }
}

var inventory = [];
var equipment = {};

var generalStoreInventory = [];
var toolStoreInventory = [];
var armorStoreInventory = [];
var alchemyStoreInventory = [];
var shops = [generalStoreInventory,toolStoreInventory,armorStoreInventory,alchemyStoreInventory];

var shopTemp = [flint_box,meat,oak_logs,evergreen_logs,copper_ore,iron_ore,copper_bar,iron_bar];
fillShop(generalStoreInventory,shopTemp);
shopTemp = [copper_axe,iron_axe,copper_pickaxe,iron_pickaxe];
fillShop(toolStoreInventory,shopTemp);
shopTemp = [copper_chestplate,iron_chestplate,copper_platelegs,iron_platelegs];
fillShop(armorStoreInventory,shopTemp);
shopTemp = [hp_potion_small,hp_potion_medium,glass_vial,glass_jar,herb,mushroom];
fillShop(alchemyStoreInventory,shopTemp);

function fillShop(shop,list) {
	for (var i = 0; i < list.length; i++) {
	    shop.push(new InventoryItem(list[i],1));
	}
}

$(".craftMenuButton").hide();
$(".inquisition").hide();
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

function mapAddons(map) {
	if (map == testMap) {
		addBoardObject("smelter",16,17);
		addBoardObject("anvil",16,18);
		addBoardObject("distillery",31,31);
	}
    else if (map == villageMap) {
        makeHouse(6,14);
        makeHouse(3,12);
        makeHouse(4,4);
        makeHouse(6,1);
        makeNPC(10,10);
    }
}

function makeNPC(x,y) {
    addBoardObject("npc_0",10,10);
    npcList.push([x,y]);
}

$("#" + playerY + "-" + playerX).append(playerHTML);
createSkillsTable();
hideMenus();


updateBoard();

function updateBoard() {
    
    var visX = parseInt(visibleRows/2);  //Visibility in each direction is half total visibility
    var visY = parseInt(visibleCols/2);
    var botX = playerX-visX; //Lowest X player can see, followed by highest X, lowest Y, etc
    var topX = playerX+visX+1;
    var botY = playerY - visY;
    var topY = playerY + visY + 1;
    var tileMod;
    
    if (topX > mapTable[0].length) {  //If the highest X player can see is off the board
        botX = mapTable[0].length - visibleCols;
        topX = mapTable[0].length; //They should only be able to see the highest X on the board
    }
    
    else if (botX < 0) { //If the lowest X the player can see is off the board
        botX = 0; //They should only be able to see the lowest X on the board
        topX = visibleCols;
    }
    
    if (topY > mapTable.length) {
        botY = mapTable.length - visibleRows;
        topY = mapTable.length;
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
    
    $("#board").html(boardHTML);
    $("#" + playerY + "-" + playerX).append(playerHTML);
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

addItem(gold,500);
addItem(hp_potion_small);

function startEncounter() {
    $("#worldMapContainer").hide();
    $(".inquisition").show();
    inCombat = true;
    startCombat();
}

function movePlayer(x,y) {
    var newX = playerX + x;
    var newY = playerY + y;
    var newLocation;
    var tileType = "empty";
    var legalTile = true;
    
    for (var i = 0; i < illegalTerrain.length; i++) 
        if ($("#" + [newY] + "-" + [newX]).children().hasClass(illegalTerrain[i]))
            legalTile = false;
    
    for (var i = 0; i < npcList.length; i++)
        if (newX == npcList[i][0] && newY == npcList[i][1])
            legalTile = false;

    if ($("#dialogueContainer").is(":visible")) {
        $("#dialogueContainer").hide();
        clearInterval(textLoop);
        textLoop = false;
    }
    
    if ($("#shop").is(":visible")) {
        $("#shop").hide();
        $("#inventory").hide();
    }
    if (newX >= 0 && newX < mapTable[0].length && newY >= 0 && newY < mapTable.length && legalTile){
        playerX = newX;
        playerY = newY;
        newLocation = $("#" + playerY + "-" + playerX);

        if (newLocation.children().hasClass("village"))
                tileType = "village";
        else if (newLocation.children().hasClass("cave_entrance"))
                tileType = "cave";
                
        if (newLocation.children().hasClass("house") || newLocation.children().hasClass("houseInvis")) {
            for (var i = 0; i < shopMap.length; i++)
                if (newX >= shopMap[i]) {
                    showShop(i);
                    break;
                }
            showInventory();
        }

        if (inTown && ((newX == 0 || newX == board.length-1) || (newY == 0 || newY == board[0].length-1))) {
            playerX = 14;
            playerY = 29;
            inTown = false;
            mapTable = testMap;
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

function makeHouse(x,y) {
	addBoardObject("houseInvis",x,y);
	addBoardObject("houseInvis",x,y+1);
	addBoardObject("houseInvis",x-1,y);
	addBoardObject("houseInvis",x-1,y+1);
    shopMap.push(y);
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

function inventoryCount(given) {
    var total = 0;
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item == given)
            total += inventory[i].amount;
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
    var shopInventory = shops[given];
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
    showDialogue(shopKeepers[given],"greeting");
    $("#shopTable").html(result);
    $("#shop").show();
}

function showDialogue(character,item) {
    clearInterval(textLoop);
    textLoop = false;
    $("#dialogueContainer").show();
    $("#portrait").attr("src",character.portrait);
    scrollText(character[item]);
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
    $("#skills").show();
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
        var playerGold = inventoryCount(gold);
        if(playerGold >= given.value) {
            addItem(given);
            removeItem(gold,given.value);
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
            addItem(item.craftable.recipe[item.craftable.recipe.length-1].item);
        removeItem(item);
    }
    
    else if (item.clickFunc) {
        item.clickFunc();
    }
}

function sell(given) {
    if(inventory[given].item.name != "gold") {
        addItem(gold,(inventory[given].item.value*inventory[given].amount));
        removeItem(inventory[given].item,inventory[given].amount);
        updateInventory();
    }   
}

document.addEventListener('keydown', function(event) {
    if (!inCombat) {
        if (event.keyCode == 87)
            movePlayer(0,-1);
        else if (event.keyCode == 68)
            movePlayer(1,0);
        else if (event.keyCode == 83)
            movePlayer(0,1);
        else if (event.keyCode == 65)
            movePlayer(-1,0);
        else if (event.keyCode == 69)
            tileAction();
    }
});

function tileAction() {
    var curr = board[playerY][playerX];
    var currResource; 
    var resourceType;
    var currTool;
    var toolLevel = 0;
    var toolMap = ["axe","pickaxe","pickaxe"];
    var skillMap = [playerSkills.woodcutting.level,playerSkills.mining.level,playerSkills.alchemy.level];
    var currX, currY;
    
    if (textLoop) 
        textSkip = true;
    else if (holdText)
        scrollText(holdText);
    else {
        for (var i = 0; i < cardinalOffset.length; i++) {
            currX = playerX + cardinalOffset[i][0];
            currY = playerY + cardinalOffset[i][1];

            for (var j = 0; j < npcList.length; j++) {
                if (currX == npcList[j][0] && currY == npcList[j][1])
                    showDialogue(questGiver,"greeting");
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
                toolLevel = Math.max(toolLevel, toolModifierLevel[equipment.weapon.modifierNames[j]]);
    
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
                removeItem(given.craftable.recipe[i].item,given.craftable.recipe[i].amount);
        addItem(given);
        
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
        if (!(inventoryCount(recipe[i].item) >= recipe[i].amount))
            return false;
    }

    return true;
}

function loot(given) {
    var curr;
    for (var i = 0; i < given.loot.length; i++) {
        curr = given.loot[i];
        if (inventory.length < inventoryMax) {
            if (percentile() <= curr.odds) {
                if (Array.isArray(curr.amount))
                    addItem(curr.item,rangeVal(curr.amount));
                else 
                    addItem(curr.item,curr.amount);
            }
        }
        else 
            alert("Inventory Full");
    }
}

function percentile() {
    return parseInt(Math.random()*100+1);
}

function Item(name,stackable,equipment,value,craftable) {
    this.name = name;
    this.stackable = stackable;
    this.value = value;
    this.craftable = craftable;
    this.equipment = equipment;
    
    this.getName = function() {
        var result = name;
        result = capitalize(result);
        for (var i = 0; i < result.length; i++)
            if (result.charAt(i) == "_")
                result = result.substr(0,i) + " " + capitalize(result.substr(i+1));
        return result;
    }
}

function InventoryItem(item,amount) {
    this.item = item;
    this.amount = amount;
}

function addItem (item,amount = 1) {
    var newAmount;
    if (item.stackable) {
        for (var i = 0; i < inventory.length; i++) {
            if (item == inventory[i].item) {
                newAmount = inventory[i].amount + amount;
                inventory[i] = new InventoryItem(item, newAmount);
                return;
            }
        }
    }

    inventory.push(new InventoryItem(item,amount));
    updateInventory();
}

function equipItem (given) {
	if (player[given.equipment.slot])
		unEquipItem(given.equipment.slot);
		
	player[given.equipment.slot] = given.equipment;
    removeItem(given);
    if (given.equipment.constructor.name == "Armor")
        equipment[given.equipment.slot] = new InventoryItem(given, 1);
    else
        equipment[given.equipment.slot] = new InventoryItem(given, 1);
    updateEquipment();
}

function unEquipItem (given) {
	if (equipment[given]) {
	    addItem(equipment[given].item);
	    player[given.toLowerCase()] = null;
	    equipment[given] = null;
	    updateEquipment();
    }
}

function removeItem (item,amount = 1) {
    if (inventoryCount(item) < amount)
        alert("Error 2: Tried to remove more of item than is in inventory. " + item.name + " : " + amount);
    else {
        for (var i = 0; i < inventory.length; i++) {
            if (item == inventory[i].item) {
                if (inventory[i].amount >= amount) {
                    inventory[i].amount -= amount;
                    amount = 0;
                    if (inventory[i].amount == 0)
                        inventory.splice(i,1);
                    break;
                }
                else {
                    amount -= inventory[i].amount;
                    inventory.amount = 0;
                    inventory.splice(i,1);
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
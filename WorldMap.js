var boardHTML = "";
var visibleCols = 11;
var visibleRows = 11;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var playerX = 9;
var playerY = 8;
var nextEncounter = 50;
var inCombat = false;
var inventoryMax = 15;
var adjOffset = [[1,0],[0,1],[-1,0],[0,-1]];

var board = [];

var meat = new Item("meat",false,false,4);
var copper_ore = new Item("copper_ore",false,false,3);
var copper_bar = new Item("copper_bar",true,false,8,[{item:copper_ore,amount:2}]);
var copper_axe = new Item("copper_axe",false,makeAxe(["copper"]),15,[{item:copper_bar,amount:1},{item:oak_logs,amount:1}]);
var copper_pickaxe = new Item("copper_pickaxe",false,makePickaxe(["copper"]),15,[{item:copper_bar,amount:1},{item:oak_logs,amount:1}]);
var iron_axe = new Item("iron_axe",false,makeAxe(["iron"]),45);
var steel_axe = new Item("iron_axe",false,makeAxe(["steel"]),115);
var copper_chestplate = new Item("copper_chestplate",false,makeChestplate(["copper"]),75,[{item:copper_bar,amount:7}]);
var iron_chestplate = new Item("iron_chestplate",false,makeChestplate(["iron"]),190);
var copper_platelegs = new Item("copper_platelegs",false,makePlatelegs(["copper"]),45,[{item:copper_bar,amount:4}]);
var iron_platelegs = new Item("iron_platelegs",false,makePlatelegs(["iron"]),115);
var gold = new Item("gold",true,false,1);
var flint_box = new Item("flint_box",false,false,5);
var oak_logs = new Item("oak_logs",false,false,3);
var evergreen_logs = new Item("evergreen_logs",false,false,8);
var cooked_meat = new Item("cooked_meat",false,false,7,[{item:meat,amount:1}]);

var foodList = [cooked_meat];
var smithList = [copper_axe,copper_chestplate,copper_platelegs];
var toolModifierLevel = {copper:1,iron:2,steel:3};
var treeList = {oak:{toolLevel:1,resource:oak_logs,playerLevel:1,xp:6},evergreen:{toolLevel:2,resource:evergreen_logs,playerLevel:3,xp:15}};
var veinList = {copper_vein:{toolLevel:1,resource:copper_ore,playerLevel:1,xp:8}};

flint_box.clickFunc = function() {
    var loc = $("#" + playerY + "-" + playerX);
    var curr = board[playerY][playerX];
    var playerLogs = false;
    var validSpace = true;

    for (var i = 0; i < curr.length; i++)
        if(curr[i] != "grass")
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
var shopTemp = [copper_axe,iron_axe,copper_pickaxe,copper_chestplate,iron_chestplate,copper_platelegs,iron_platelegs,flint_box,copper_ore,copper_bar];

var shopInventory = [];

for (var i = 0; i < shopTemp.length; i++) {
    shopInventory.push(new InventoryItem(shopTemp[i],1));
}

$(".inquisition").hide();
for (var i = 0; i < mapTable.length; i++) {
	board[i] = [];
    for (var j = 0; j < mapTable[i].length; j++) {
	    board[i][j] = ["grass"];
        if (mapTable[i][j] != "grass")
            addBoardObject(mapTable[i][j],i,j);
    }
}

addBoardObject("anvil",8,11);
addBoardObject("copper_vein",11,7);
addBoardObject("copper_vein",10,8);
$("#" + playerY + "-" + playerX).append(playerHTML);


updateBoard();

function updateBoard() {
    var visX = parseInt(visibleRows/2);  //Visibility in each direction is half total visibility
    var visY = parseInt(visibleCols/2);
    var botX = playerX-visX; //Lowest X player can see, followed by highest X, lowest Y, etc
    var topX = playerX+visX+1;
    var botY = playerY - visY;
    var topY = playerY + visY + 1;
    
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
                    boardHTML += "<img class='" + board[i][j][k] + " tileItem' src='art/" + board[i][j][k] + ".png'>";
                }
            boardHTML += "</td>";
        }
        boardHTML += "</tr>";
    }
    
    $("#board").html(boardHTML);
    $("#" + playerY + "-" + playerX).append(playerHTML);
}


addItem(meat);
addItem(flint_box);
addItem(copper_axe);
addItem(copper_pickaxe);

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

    if ($("#shop").is(":visible")) {
        $("#shop").hide();
        $("#inventory").hide();
    }
    if (newX >= 0 && newX < mapTable[0].length && newY >= 0 && newY < mapTable.length && !$("#" + [newY] + "-" + [newX]).children().hasClass("ocean") && !$("#" + [newY] + "-" + [newX]).children().hasClass("mountain")){
        playerX = newX;
        playerY = newY;
        newLocation = $("#" + playerY + "-" + playerX);

        if (newLocation.children().hasClass("village"))
                tileType = "village";

        if (tileType == "empty")
            nextEncounter -= 5;
        else if (tileType == "village") {
            showInventory();
            showShop();
        }
        
        checkCanCraft();
        updateBoard();
    }

    //if (nextEncounter <= 0)
        //startEncounter();
}

function checkCanCraft() {
    var curr = $("#" + playerY + "-" + playerX).children();
    var currClassList;
    var canCook = false;
    var canSmith = false;
    for (var i = 0; i < curr.length; i++) {
        currClassList = curr[i].classList;
        for (var j = 0; j < currClassList.length; j++) {
            if(currClassList[j] == "fire")
                canCook = true;
            else if (currClassList[j] == "anvil")
                canSmith = true;
        }
    }

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
}

function toggleInventory() {
    if ($("#inventory").is(":visible"))
        $("#inventory").hide();
    else 
        showInventory();
}

function inventoryCount(given) {
    var total = 0;
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item == given)
            total += inventory[i].amount;
    }
    return total;
}

function toggleCookMenu() {
    if ($("#cookMenu").is(":visible"))
        $("#cookMenu").hide();
    else 
        showCookMenu();
}

function showCookMenu() {
    var result = "";
    for (var i = 0; i < foodList.length; i++) {
        if (canCraft(foodList[i])) {
            result += "<tr>";
            result += "<td><img onclick='craft(" + foodList[i].name + ")' src='art/" + foodList[i].name + ".png'><td>";
            result += "<td>" + foodList[i].getName() + "<td>";
            result += "</tr>";
        }
    }
    
    if (result == "")
        result = "No recipes "
    $("#cookMenuTable").html(result);
    $("#cookMenu").show();
}

function showShop() {
    var result, curr;
    
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 5; j++) {
            curr = i*5 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < shopInventory.length+1) {
                result += "<img class='inventoryItem' onclick='buy(" + (curr-1) + ")' src='art/" + shopInventory[curr-1].item.name + ".png'>";
                if (shopInventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer'><p class='inventoryItemAmount'>" + shopInventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    $("#shopTable").html(result);
    $("#shop").show();
}

function showInventory() {
    updateInventory();
    $("#inventory").show();
}

function updateInventory() {
    var result;
    var curr;
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

function updateEquipment() {
    var itemImage;
    for (var i = 0; i < $(".equipmentItem").length; i++) {
	    $(".equipmentItem").remove();
    }
    for (var curr in equipment) {
	    if (equipment[curr]){
	        itemImage = "<div><img class='inventoryItem equipmentItem' onclick='unEquipItem(\"" + curr + "\")' style='right: 108px; top:147px;' src='art/" + equipment[curr].item.name + ".png'></div>";
	        $("#equipment").append(itemImage);
        }
    }
}

function buy(given) {
    if ($("#shop").is(":visible")) {
        var playerGold = inventoryCount(gold);
        if(playerGold >= shopInventory[given].item.value) {
            addItem(shopInventory[given].item);
            removeItem(gold,shopInventory[given].item.value);
            updateInventory();
        }   
    }
}

function itemClick(given) {
    if ($("#shop").is(":visible")) {
        sell(given);
    }
    else if (inventory[given].item.equipment && inventory[given].item.equipment.constructor.name == "Weapon") {
        equipItem(inventory[given].item);
        updateInventory();
    }
    else if (inventory[given].item.clickFunc) {
        inventory[given].item.clickFunc();
    }
}

function sell(given) {
    if(inventory[given].item.name != "gold") {
        addItem(gold,(inventory[given].item.value*inventory[given].amount));
        removeItem(inventory[given].item,inventory[given].amount);
        updateInventory();
    }   
}

document.addEventListener('keyup', function(event) {
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
    var toolMap = ["axe","pickaxe"];
    var skillMap = [playerSkills.woodcutting.level,playerSkills.mining.level];
    var actionMap = [chopTree,mineOre];
   
    for (var i = 0; i < curr.length; i++) {
        if (Object.keys(treeList).includes(curr[i])) {
            currResource = treeList[curr[i]];
            resourceType = 0;
        }
        else if (Object.keys(veinList).includes(curr[i])) {
            currResource = veinList[curr[i]];
            resourceType = 1;
        }
    }
    for (var i = 0; i < inventory.length; i++) {
        currTool = inventory[i].item.equipment;
        if (currTool && currTool.name == toolMap[resourceType])
            for (var j = 0; j < currTool.modifierNames.length; j++)
                toolLevel = Math.max(toolLevel, toolModifierLevel[currTool.modifierNames[j]]);
    }
    
    if (equipment.Weapon && equipment.Weapon.item.equipment.name == toolMap[resourceType])
        for (var j = 0; j < equipment.Weapon.modifierNames.length; j++)
                toolLevel = Math.max(toolLevel, toolModifierLevel[equipment.Weapon.modifierNames[j]]);
    
    if(currResource && toolLevel >= currResource.toolLevel && skillMap[resourceType] >= currResource.playerLevel) {
        actionMap[resourceType](currResource);
        if (resourceType == 0)
        	curr[curr.length-1] = curr[curr.length-1].toString() + "_stump";
        else 
        	curr[curr.length-1] = "rock";
        updateBoard();
    }
}

function craft(given) {
    if (canCraft(given)) {
        for (var i = 0; i < given.recipe.length; i++)
                removeItem(given.recipe[i].item,given.recipe[i].amount);
        addItem(given);
        showCookMenu();
        updateInventory();
    }
}

function canCraft(given) {
    var recipe = given.recipe;
    for (var i = 0; i < recipe.length; i++) {
        if (!inventoryCount(recipe[i].item,recipe[i].amount))
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

function Item(name,stackable,equipment,value,recipe) {
    this.name = name;
    this.stackable = stackable;
    this.value = value;
    this.recipe = recipe;
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
	player[given.equipment.constructor.name.toLowerCase()] = given.equipment;
    removeItem(given);
    if (given.equipment.constructor.name == "Armor")
        equipment[given.equipment.slot] = new InventoryItem(given, 1);
    else
        equipment[given.equipment.constructor.name] = new InventoryItem(given, 1);
    updateEquipment();
}

function unEquipItem (given) {
    addItem(equipment[given].item);
    player[given.toLowerCase()] = null;
    equipment[given] = null;
    updateEquipment();
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
                }
            }
        }
        updateInventory();
    }
}

function addBoardObject(given,x,y) {
    board[x][y].push(given);
}
var board = "";
var boardCols = 15; 
var boardRows = 10;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var villageHTML = "<img class='village tileItem' id='villageHTML' src='art/village.png'>";
var treeHTML = "<img class='tree tileItem' src='art/tree.png'>";
var fireHTML = "<img class='fire tileItem' src='art/fire.png'>";
var playerX = 2;
var playerY = 2;
var nextEncounter = 50;
var inCombat = false;
var inventoryMax = 15;
var adjOffset = [[1,0],[0,1],[-1,0],[0,-1]];

var meat = new Item("meat",false,false,4);
var axe = new Item("axe",false,makeAxe(),15);
var gold = new Item("gold",true,false,1);
var flint_box = new Item("flint_box",false,false,5);
var logs = new Item("logs",false,false,3);
var cooked_meat = new Item("cooked_meat",false,false,7,[{item:meat,amount:1}]);

var foodList = [cooked_meat];

flint_box.clickFunc = function() {
    var loc = $("#" + playerY + "-" + playerX);
    var curr = $("#" + playerY + "-" + playerX).children();
    var hasLogs = false;
    var validSpace = true;
    var currClassList;

    for (var i = 0; i < curr.length; i++) {
        currClassList = curr[i].classList;
        for (var j = 0; j < currClassList.length; j++) {
            if(currClassList[j] == "vilage" || currClassList[j] == "fire" || currClassList[j] == "tree" || currClassList[j] == "stump")
                validSpace = false;
        }
    }
    
    for (var i = 0; i < inventory.length; i++) {
        if(inventory[i].item == logs)
            hasLogs = true;
    }
    
    if (hasLogs && validSpace) {
        removeItem(logs);
        $("#playerHTML").remove();
        loc.append(fireHTML);
        loc.append(playerHTML);
        if (checkCanCook())
            $("#cookMenuButton").show();
    }
}

var inventory = [];
var equipment = {};
var shopInventory = [new InventoryItem(axe,1),new InventoryItem(flint_box,1)];

$(".inquisition").hide();

for (var i = 0; i < boardRows; i++) {
    board += "<tr>";
    for (var j = 0; j < boardCols; j++) {
        board += "<td class='boardTile' id='" + i + "-" + j + "'>";
        board += "<img class='tileItem' src='art/grass.png'>";
        board += "</td>";
    }
    board += "</tr>";
}

$("#board").html(board);
$("#5-5").append(villageHTML);

addItem(meat);
addItem(flint_box);
var trees = ["3-3","3-4","4-3","8-4","8-5","8-6","7-4","7-5","8-8","3-10","3-8","4-8","4-9","2-8","2-9","2-10","3-9"];
for (var i = 0; i < trees.length; i++)
    $("#" + trees[i]).append(treeHTML);
$("#" + playerY + "-" + playerX).append(playerHTML);
addItem(axe);

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
    
    if (newX >= 0 && newX < boardCols && newY >= 0 && newY < boardRows){
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

        $("#playerHTML").remove();
        newLocation.append(playerHTML);
        
        if (checkCanCook())
            $("#cookMenuButton").show();
        else {
            $("#cookMenu").hide();
            $("#cookMenuButton").hide();
        }
    }

    if (nextEncounter <= 0)
        startEncounter();
}

function checkCanCook() {
    var curr = $("#" + playerY + "-" + playerX).children();
    var currClassList;
    
    for (var i = 0; i < curr.length; i++) {
        currClassList = curr[i].classList;
        for (var j = 0; j < currClassList.length; j++) {
            if(currClassList[j] == "fire")
                return true;
        }
    }
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
    for (var i = 2; i < $("#equipment").children().length; i++) {
	    $("#equipment").children()[i].remove();
    }
    for (var curr in equipment) {
	    if (equipment[curr]){
	        itemImage = "<div><img class='inventoryItem' onclick='unEquipItem(\"" + curr + "\")' style='right: 108px; top:147px;' src='art/" + equipment[curr].item.name + ".png'></div>";
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
    var curr = $("#"+playerY + "-" + playerX).children();
    var currClassList;
    var hasAxe = false;
    
    for (var i = 0; i < inventory.length; i++)
        if (inventory[i].item == axe)
            hasAxe = true;
    if (equipment.Weapon && equipment.Weapon.item == axe)
        hasAxe = true;
    
    for (var i = 0; i < curr.length; i++) {
        currClassList = curr[i].classList;
        for (var j = 0; j < currClassList.length; j++) {
            if(currClassList[j] == "tree" && hasAxe) {
                curr[i].src = "art/stump.png";
                currClassList.remove("tree");
                currClassList.add("stump");
                chopTree();
            }
        }
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
        result = result.charAt(0).toUpperCase() + result.substr(1);
        for (var i = 0; i < result.length; i++)
            if (result.charAt(i) == "_")
                result = result.substr(0,i) + " " + result.charAt(i+1).toUpperCase() + result.substr(i+2);
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
        alert("Error 2: Tried to remove more of item than is in inventory.");
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
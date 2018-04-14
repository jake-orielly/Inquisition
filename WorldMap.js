var board = "";
var boardCols = 15; 
var boardRows = 10;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var villageHTML = "<img class='village tileItem' id='villageHTML' src='art/village.png'>";
var playerX = 2;
var playerY = 2;
var nextEncounter = 50;
var inCombat = false;
var inventoryMax = 15;

var meat = new Item("meat",false,2);
var axe = new Item("axe",false,15);
var gold = new Item("gold",true,1);
var flint_box = new Item("flint_box",true,5);

var inventory = [];
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
$("#" + playerY + "-" + playerX).append(playerHTML);

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
    }

    if (nextEncounter <= 0)
        startEncounter();
}

function toggleInventory() {
    if ($("#inventory").is(":visible"))
        $("#inventory").hide();
    else 
        showInventory();
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
    var result;
    var curr;
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 3; j++) {
            curr = i*3 + j+1;
            result += "<td>";
            result += "<img class='inventorySlot' src='art/inventorySlot.png'>";
            if(curr < inventory.length+1) {
                result += "<img class='inventoryItem' onclick='sell(" + (curr-1) + ")' src='art/" + inventory[curr-1].item.name + ".png'>";
                if (inventory[curr-1].amount > 1)
                    result += "<div class='inventoryAmountContainer'><p class='inventoryItemAmount'>" + inventory[curr-1].amount + "</p></div>";
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    $("#inventoryTable").html(result);
    $("#inventory").show();
}

function buy(given) {
    if ($("#shop").is(":visible")) {
        var playerGold = 0;
        for (var i = 0; i < inventory.length; i++) {
            if(inventory[i].item.name == "gold") {
                playerGold = inventory[i].amount;
            }
        }
        if(playerGold > shopInventory[given].item.value) {
            addItem(shopInventory[given].item,1);
            removeItem(gold,shopInventory[given].item.value);
            showInventory();
        }   
    }
}

function sell(given) {
    if ($("#shop").is(":visible")) {
        if(inventory[given].item.name != "gold") {
            addItem(gold,(inventory[given].item.value*inventory[given].amount));
            removeItem(inventory[given].item,inventory[given].amount);
            showInventory();
        }   
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
    }
});

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

function Item(name,stackable,value,recipe) {
    this.name = name;
    this.stackable = stackable;
    this.value = value;
    this.recipe = recipe;
    
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

function addItem (item,amount) {
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
}

function removeItem (item,amount) {
    for (var i = 0; i < inventory.length; i++) {
        if (item == inventory[i].item) {
            if (inventory[i].amount >= amount) {
                inventory[i].amount -= amount;
                
                if (inventory[i].amount == 0)
                    inventory.splice(i,1);
            }
            else
                alert("Error 2: Tried to remove more of item than is in inventory.")
            return;
        }
    }

    alert("Error 1: Tried to remove item not in inventory.")
}
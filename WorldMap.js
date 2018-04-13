var board = "";
var boardCols = 11; 
var boardRows = 11;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var villageHTML = "<img class='village tileItem' id='villageHTML' src='art/village.png'>";
var playerX = 2;
var playerY = 2;
var nextEncounter = 50;
var inCombat = false;

var meat = new Item("Meat",2);
var inventory = [];

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

    if (newX >= 0 && newX < boardCols && newY >= 0 && newY < boardRows){
        playerX = newX;
        playerY = newY;
        newLocation = $("#" + playerY + "-" + playerX);

        if (newLocation.children().hasClass("village"))
                tileType = "village";

        if (tileType == "empty")
            nextEncounter -= 5;
        else if (tileType == "village")
            console.log(4);

        $("#playerHTML").remove();
        newLocation.append(playerHTML);
    }

    if (nextEncounter <= 0)
        startEncounter();
}

function toggleInventory() {
    var result;
    var curr;
    
    for (var i = 0; i < 5; i++) {
        result += "<tr>";
        for (var j = 0; j < 3; j++) {
            curr = i*3 + j+1;
            result += "<td>";
            if(curr < inventory.length+1) {
                result += "<img class='inventoryItem' src='art/" + "meat" + ".jpg'>";
                console.log(1);
            }
            result += "</td>";
        }
        result += "</tr>";
    }
    $("#inventoryTable").html(result);
    $("#inventory").toggle();
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
        if (percentile() <= curr.odds) {
            if (Array.isArray(curr.amount))
                addItem(curr.item,rangeVal(curr.amount));
            else 
                addItem(curr.item,curr.amount);
        }
    }
}

function percentile() {
    return parseInt(Math.random()*100+1);
}

function Item(name,value,recipe) {
    this.name = name;
    this.value = value;
    this.recipe = recipe;
}

function InventoryItem(item,amount) {
    this.item = item;
    this.amount = amount;
}

function addItem (item,amount) {
    var newAmount;
    for (var i = 0; i < inventory.length; i++) {
        if (item == inventory[i].item) {
            newAmount = inventory[i].amount + amount;
            inventory[i] = new InventoryItem(item, newAmount);
            return;
        }
    }

    inventory.push(new InventoryItem(item,amount));
}
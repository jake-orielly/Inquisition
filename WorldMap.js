var board = "";
var boardCols = 11; 
var boardRows = 11;
var playerHTML = "<img class='tileItem' id='playerHTML' src='art/soldier.png'>";
var villageHTML = "<img class='village tileItem' id='villageHTML' src='art/village.png'>";
var playerX = 2;
var playerY = 2;
var nextEncounter = 50;
var inCombat = false;

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


function startEncounter() {
    $("#board").hide();
    $(".inquisition").show();
    inCombat = true;
    startCombat();
}

$("#board").html(board);
$("#5-5").append(villageHTML);
$("#" + playerY + "-" + playerX).append(playerHTML);

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
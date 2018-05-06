var playerSkills = {};
var smeltPerks = [];

playerSkills.woodcutting = {xp:0,level:1,name:"Woodcutting"};
playerSkills.mining = {xp:0,level:1,name:"Mining"};

function chopTree(given) {
    playerSkills.woodcutting.xp += given.xp;
    if (playerSkills.woodcutting.xp >= xpNeeded(playerSkills.woodcutting.level))
        levelUp(playerSkills.woodcutting);
    addItem(given.resource);
}

function mineOre(given) {
    addItem(given.resource);
    playerSkills.mining.xp += given.xp;
    if (playerSkills.mining.xp >= xpNeeded(playerSkills.mining.level))
        levelUp(playerSkills.mining);
    addItem(given.resource);
}

function levelUp(skill) {
    skill.level += 1;
    console.log("You leveled up in " + skill.name  + ". Your " + skill.name + " level is now " + skill.level + ". ");
}

function xpNeeded(level) {
    var result = 0;
    
    for (var i = 1; i <= level; i++)
        result += parseInt(28 * Math.pow(2.5, (i/5)));
        
    return result;
}

function extraOre(given) {
    if (parseInt(Math.random()*100+1) <= 15)
        addItem(console.log(given.resource));
}
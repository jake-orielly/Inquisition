var playerSkills = {};
var smeltPerks = [];

playerSkills.woodcutting = {xp:0,level:1,name:"Woodcutting"};
playerSkills.mining = {xp:0,level:1,name:"Mining"};

function chopTree(given) {
    playerSkills.woodcutting.xp += given.xp;
    if (playerSkills.woodcutting.xp >= xpNeeded(playerSkills.woodcutting.level))
        levelUp(playerSkills.woodcutting);
    updateXPBar(playerSkills.woodcutting);
    addItem(given.resource);
}

function mineOre(given) {
    playerSkills.mining.xp += given.xp;
    if (playerSkills.mining.xp >= xpNeeded(playerSkills.mining.level))
        levelUp(playerSkills.mining);
    updateXPBar(playerSkills.mining);
    addItem(given.resource);
}

function levelUp(skill) {
    skill.level += 1;
    $("#curr" + skill.name + "Level").html(":" + skill.level);
    console.log("You leveled up in " + skill.name  + ". Your " + skill.name + " level is now " + skill.level + ". ");
}

function xpNeeded(level) {
    var result = 0;
    
    for (var i = 1; i <= level; i++)
        result += parseInt(28 * Math.pow(2.5, (i/5)));
    
    if (level = 0)
        return 0;
    return result;
}

function updateXPBar(skill) {
    var nextLevelXP = xpNeeded(skill.level+1) - xpNeeded(skill.level);
    var currXP = skill.xp - xpNeeded(skill.level-1);
    var xpDiff = currXP / nextLevelXP;
    $("#curr" + skill.name + "XP").width("calc(" + xpDiff*100 + "% - 1px)");
}

//Perks
function extraOre(given) {
    if (parseInt(Math.random()*100+1) <= 15)
        addItem(console.log(given.resource));
}
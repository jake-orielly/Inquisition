var playerSkills = {};

playerSkills.woodcutting = {xp:0,level:1,name:"Woodcutting"};

function chopTree(given) {
    playerSkills.woodcutting.xp += treeList[given].xp;
    if (playerSkills.woodcutting.xp >= xpNeeded(playerSkills.woodcutting.level))
        levelUp(playerSkills.woodcutting);
    addItem(treeList[given].resource);
}

function levelUp(skill) {
    skill.level += 1;
    console.log("You leveled up in " + skill.name);
}

function xpNeeded(level) {
    var result = 0;
    
    for (var i = 1; i <= level; i++)
        result += parseInt(Math.pow(2, (i/5))*28)
        
    return result;
}
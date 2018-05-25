var playerSkills = {};
var smeltPerks = [];
var playerPerk = {chopping:[]};
var feats = 0;
var featsUsed = 0;

playerSkills.woodcutting = {xp:0,level:1,name:"Woodcutting"};
playerSkills.mining = {xp:0,level:1,name:"Mining"};
playerSkills.smithing = {xp:0,level:1,name:"Smithing"};
playerSkills.cooking = {xp:0,level:1,name:"Cooking"};
playerSkills.alchemy = {xp:0,level:1,name:"Alchemy"};
playerSkills.piercing = {xp:0,level:1,name:"Piercing"};
playerSkills.chopping = {xp:0,level:1,name:"Chopping"};
playerSkills.smashing = {xp:0,level:1,name:"Smashing"};

function harvest(given) {
    var skill;
    var resourceLists = [treeList,veinList,herbList];
    var skillsList = [playerSkills.woodcutting,playerSkills.mining,playerSkills.alchemy];
    var curr;
    
    for (var i = 0; i < skillsList.length; i++) {
	    curr = Object.keys(resourceLists[i]);
	    for (var j = 0; j < curr.length; j++)
		    if (given == resourceLists[i][curr[j]])
		        skill = skillsList[i];
    }
    
    giveXP(given,skill);
    addItem(inventory,given.resource);
}

function craftXP(given) {
	giveXP(given.craftable,getSkill(given));
}

function getSkill(given) {
    var skillsMap = {cook:playerSkills.cooking,smelt:playerSkills.smithing,smith:playerSkills.smithing,alchemy:playerSkills.alchemy};
	var currSkill;
	
	for (var curr in craftListMaster)
		for (var i = 0; i < craftListMaster[curr].length; i++)
			if(given == craftListMaster[curr][i])
				currSkill = curr;
    
    return skillsMap[currSkill];
}

function giveXP(item,skill) {
	skill.xp += item.xp;
    if (skill.xp >= xpNeeded(skill.level))
        levelUp(skill);
    updateXPBar(skill);
}

function giveAttackXP(skill,given) {
    skill = playerSkills[skill]
    skill.xp += given;
    if (skill.xp >= xpNeeded(skill.level))
        levelUp(skill);
    updateXPBar(skill);
}

function levelUp(skill) {
    skill.level += 1;
    if (feats-featsUsed < 5)
        document.getElementById("featGem" + (feats-featsUsed)).src = "art/feat_gem.png";
    feats++;
    if (feats % 5 == 0)
        $("#featsButton").addClass("active");
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
        addItem(inventory,given.resource);
}

function extraAttack() {
    console.log(this.attack);
}
var playerSkills = {};
var playerPerks = [];
var perkPoints = 0;
var perkPointsUsed = 0;
var lvlUpTextInterval;

playerSkills.woodcutting = {xp:0,level:1,name:"Woodcutting",img:"art/oak.png",category:"harvesting"};
playerSkills.mining = {xp:0,level:1,name:"Mining",img:"art/copper_vein.png",category:"harvesting"};
playerSkills.smithing = {xp:0,level:1,name:"Smithing",img:"art/anvil.png",category:"crafting"};
playerSkills.cooking = {xp:0,level:1,name:"Cooking",img:"art/fire.png",category:"crafting"};
playerSkills.alchemy = {xp:0,level:1,name:"Alchemy",img:"art/distillery.png",category:"crafting"};
playerSkills.piercing = {xp:0,level:1,name:"Piercing",img:"art/copper_short_sword.png",category:"combat"};
playerSkills.chopping = {xp:0,level:1,name:"Chopping",img:"art/copper_axe.png",category:"combat"};
playerSkills.crushing = {xp:0,level:1,name:"Crushing",img:"art/copper_mace.png",category:"combat"};
playerSkills.unarmed = {xp:0,level:1,name:"Unarmed",img:"art/fist.png",category:"combat"};

function harvest(given) {
    var skill;
    var resourceLists = [treeList,veinList,herbList];
    var skillsList = [playerSkills.woodcutting,playerSkills.mining,playerSkills.alchemy];
    var secondarySkillMap = ["chopping","piercing"];
    var curr;
    
    for (var i = 0; i < skillsList.length; i++) {
	    curr = Object.keys(resourceLists[i]);
            
	    for (var j = 0; j < curr.length; j++)
		    if (given == resourceLists[i][curr[j]]) {
		        skill = skillsList[i];
                if (secondarySkillMap[i])
                    giveAttackXP(secondarySkillMap[i],parseInt(given.xp/2.5))
            }
    }

    giveXP(given,skill);
    addItem(inventory,given.resource);
}

function craftXP(given) {
	giveXP(given.craftable,getSkill(given));
    if(getSkill(given).name == "Smithing")
        giveAttackXP("crushing",parseInt(given.craftable.xp/2.5))
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
    if (skill == "pummeled")
        skill = playerSkills["unarmed"];
    else
        skill = playerSkills[skill];
    skill.xp += given;
    if (skill.xp >= xpNeeded(skill.level))
        levelUp(skill);
    updateXPBar(skill);
}

function levelUp(skill) {
    skill.level += 1;
    if (perkPoints-perkPointsUsed < 5)
        document.getElementById("perkGem" + (perkPoints-perkPointsUsed)).src = "art/perk_gem.png";
    perkPoints++;
    if (perkPoints % 5 == 0)
        $("#perksButton").addClass("perksButtonActive");
    $("#curr" + skill.name + "Level").html(":" + skill.level);
    $("#lvlUpImage").attr("src",skill.img);
    $("#lvlUpName").html(skill.name);
    $("#lvlUpText").html("Level: " + skill.level);
    clearInterval(lvlUpTextInterval);
    $("#levelUpMessage").fadeIn(400);
    lvlUpTextInterval = setInterval(function(){
        $("#levelUpMessage").fadeOut(400);
    },1600)
    
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

var piercingAptitude = {name:"Piercing Aptitude",img:"art/copper_short_sword.png",description:"+3 attack, +1 damage, and +1 crit range with piercing weapons",requirements:{piercing:3},categories:["general","piercing"],compName:"piercingAptitude",functional:{attack:function(given){return given+3},damage:function(given){return given+1},crit:function(given){return given-1}}};
var choppingAptitude = {name:"Chopping Aptitude",img:"art/copper_axe.png",description:"+2 attack and +2 damage with chopping weapons",requirements:{chopping:3},categories:["general","chopping"],compName:"choppingAptitude",functional:{attack:function(given){return given+2},damage:function(given){return given+2}}};
var crushingAptitude = {name:"Crushing Aptitude",img:"art/copper_mace.png",description:"+3 damage with crushing weapons",requirements:{crushing:3},categories:["general","crushing"],compName:"crushingAptitude",functional:{damage:function(given){return given+3}}};
var unarmedAptitude = {name:"Unarmed Aptitude",img:"art/fist.png",description:"+5 attack, +2 damage, and +2 crit range when not using a weapon",requirements:{unarmed:3},categories:["general","unarmed"],compName:"unarmedAptitude",functional:{attack:function(given){return given+5},damage:function(given){return given+2},crit:function(given){return given-2}}};
var woodcuttingAptitude = {name:"Woodcutting Aptitude",img:"art/evergreen.png",description:"You can chop evergreen trees with an iron axe.",requirements:{woodcutting:3},categories:["general","woodcutting"],compName:"woodcuttingAptitude"};
var miningAptitude = {name:"Mining Aptitude",img:"art/iron_vein.png",description:"You can mine iron ore with an iron pickaxe.",requirements:{mining:3},categories:["general","mining"],compName:"miningAptitude"};
var smithingAptitude = {name:"Smithing Aptitude",img:"art/iron_bar.png",description:"You can smith iron weapons and armor.",requirements:{smithing:3},categories:["general","smithing"],compName:"smithingAptitude"};
var cookingAptitude = {name:"Cooking Aptitude",img:"art/seasoned_meat.png",description:"You can cook more complex foods.",requirements:{cooking:3},categories:["general","cooking"],compName:"cookingAptitude"};
var alchemyAptitude = {name:"Alchemy Aptitude",img:"art/hp_potion_medium.png",description:"You can craft more powerful potions.",requirements:{alchemy:3},categories:["general","alchemy"],compName:"alchemyAptitude"};

var perkList = [piercingAptitude,choppingAptitude,crushingAptitude,unarmedAptitude,woodcuttingAptitude,miningAptitude,smithingAptitude,cookingAptitude,alchemyAptitude];

/*function extraOre(given) {
    if (parseInt(Math.random()*100+1) <= 15)
        addItem(inventory,given.resource);
}*/
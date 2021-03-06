function wolf() {
    var wolf = new Character(8,0,9,null,"the wolf",["it","its"],"enemy","wolf");
    wolf.weapon = new Weapon(4,[1,4],"claw","slashed","piercing",[]);
    wolf.makeMove = baseAI;
    wolf.loot = [{item:meat,odds:100,amount:1}];
    return wolf;
}

function bear() {
    var bear = new Character(12,0,7,null,"the bear",["it","its"],"enemy","bear");
    bear.weapon = new Weapon(0,[3,6],"claw","slashed","piercing",[]);
    bear.makeMove = baseAI;
    bear.loot = [{item:meat,odds:100,amount:[1,3]},{item:bear_claw,odds:75,amount:[1-3]}];
    return bear;
}

function bugbear() {
    var bugbear = new Character(12,0,17,null,"the bugbear",["it","its"],"enemy","bugbear");
    bugbear.weapon = makeMace(["iron","poisoned"]);
    bugbear.makeMove = baseAI;
    bugbear.loot = [{item:iron_mace,odds:75,amount:1},{item:poison_potion_small,odds:50,amount:1},{item:poison_potion_small,odds:20,amount:1}];
    return bugbear;
}

function treant() {
    var treant = new Character(25,0,11,null,"the treant",["it","its"],"enemy","treant");
    treant.weapon = new Weapon(3,[4,12],"branch","slammed","crushing",[]);
    treant.makeMove = baseAI;
    treant.loot = [{item:evergreen_logs,odds:75,amount:[1,3]}];
    return treant;
}

function targetDummy() {
    var targetDummy = new Character(400,0,1,null,"the target dummy",["it","its"],"enemy","treant");
    targetDummy.weapon = new Weapon(0,[1,1],"weapon","attacked","piercing",[]);
    targetDummy.makeMove = baseAI;
    targetDummy.loot = [];
    return targetDummy;
}

function bug() {
    var bug = new Character(45,0,15,null,"the bug",["it","its"],"enemy","bug");
    bug.weapon = new Weapon(6,[4,8],"claw","slashed","piercing",[]);
    bug.abilities = [acidSpit("enemy")];
    bug.abilities[0].cooldown = parseInt(Math.random()*3);
    bug.makeMove = bugAI;
    return bug;
}

function caveBeast() {
    var caveBeast = new Character(120,50,15,makeAxe(),"the cave beast",["it","its"],"enemy","monster");
    caveBeast.loot = [{item:monster_tusk,odds:100,amount:1}];
    caveBeast.abilities = [bloodBoil(caveBeast.charType)];
    caveBeast.makeMove = caveBeastAI;
    initCharacter(caveBeast);
    return caveBeast;
}

/*function fallenKnight() {
    var fallenKnight = new Character(25,15,10,makeShortSword(),"the fallen knight",hisHers(),"enemy","fallenKnight");
    fallenKnight.abilities = [secondWind(fallenKnight.charType)];
    fallenKnight.makeMove = fallenKnightAI;
    return fallenKnight;
}*/

function createPlayer() {
    var player = new Character(15,5,12,null,"Jake",["him","his"],"player","player");
    player.abilities = [oakSkin(player.charType),bloodBoil(player.charType)];
    player.unarmed = new Weapon(2,[1,3],"fist","punched with","pummeled");
    initCharacter(player);
    return player;
}

var Character = function(maxHP,maxMana,ac,weapon,name,pronounSet,charType,image,abilities = []) {
    this.hp = maxHP;
    this.maxHP = maxHP;
    this.mana = maxMana;
    this.maxMana = maxMana;
    this.ac = ac;
    this.weapon = weapon;
    this.name = name;
    this.charType = charType;
    this.perPronoun = pronounSet[0];
    this.possPronoun = pronounSet[1];
    this.image = image;
    this.abilities = abilities;
    this.damageTriggers = [];
    this.hpTriggers = [];
    this.buffs = {};
    
    this.getAC = function() {
        var result = this.ac;
        if (Object.keys(equipment).length == 0)
            return result;
        else {
            for (var curr in equipment)
                if (equipment[curr] && equipment[curr].item.equipment.ac)
                    result += equipment[curr].item.equipment.getAttribute("ac");
            return result;
        }
    }
}

/*function fallenKnightAI(target) {
    if(this.hp < this.maxHP) {
        triggerAbility(currEnemy,0);
    }
    return "<tr><td>" + makeAttack(this,target) + "</tr></td>";
}

function frothingHereticAI(target) {
    if(this.abilities[0].cooldown == 0) {
        triggerAbility(currEnemy,0);
    }
    return "<tr><td>" + makeAttack(this,target) + "</tr></td>";
}*/

function baseAI(target) {
    return [target,makeAttack];
}

function bugAI(target) {
    if (!currEnemy.abilities[0].cooldown) {
        currEnemy.abilities[0].cooldown = currEnemy.abilities[0].maxCooldown;
        return [target,acidSpit(currEnemy.charType)];
    }
    else
        return [target,makeAttack,makeAttack];
}

function caveBeastAI(target) {
    if (!currEnemy.abilities[0].cooldown) {
        currEnemy.abilities[0].cooldown = currEnemy.abilities[0].maxCooldown;
        return [target,bloodBoil(currEnemy.charType)];
    }
    else
        return [target,makeAttack];
}


function initCharacter(given) {
    var curr;
    var curr2;
    for (var i = 0; i < given.abilities.length; i++) { //ToDo clean up var names and make that else readable . . . somehow
        if (given.abilities[i].categories){
            curr = given.abilities[i].categories;
            for (var j = 0; j < Object.keys(curr).length; j++) {
                curr2 = Object.keys(curr)[j];
                given[curr2].push(curr[curr2]);
            }
        }
    }
}

function hisHers() {
    if (Math.random() > 0.5)
        return ["him","his"];
    else
        return ["her","her"];
}
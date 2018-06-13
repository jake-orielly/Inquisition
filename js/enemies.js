function caveBeast() {
    var caveBeast = new Character(45,25,15,makeAxe(),"the cave beast",["it","it's"],"enemy","monster");
    caveBeast.loot = [{item:monster_tusk,odds:100,amount:1}];
    caveBeast.size = "large";
    return caveBeast;
}

function bug() {
    var bug = new Character(25,0,13,null,"the bug",["it","it's"],"enemy","bug");
    bug.weapon = new Weapon(4,[2,4],"claw","clawed with","piercing",[]);
    bug.makeMove = bugAI;
    return bug;
}

function wolf() {
    var wolf = new Character(10,0,9,null,"the wolf",["it","it's"],"enemy","chest");
    wolf.weapon = new Weapon(2,[1,3],"claw","clawed with","piercing",[]);
    wolf.makeMove = baseAI;
    wolf.loot = [{item:meat,odds:100,amount:1}];
    return wolf;
}

function fallenKnight() {
    var fallenKnight = new Character(25,15,10,makeShortSword(),"the fallen knight",hisHers(),"enemy","fallenKnight");
    fallenKnight.abilities = [secondWind(fallenKnight.charType)];
    fallenKnight.makeMove = fallenKnightAI;
    return fallenKnight;
}

function createPlayer() {
    var player = new Character(10,5,10,null,"Jake",["him","his"],"player","player");
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
                if (equipment[curr].item.equipment.ac)
                    result += equipment[curr].item.equipment.ac;
            return result;
        }
    }
}

function fallenKnightAI(target) {
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
}

function baseAI(target) {
    return [makeAttack];
}

function bugAI(target) {
    return [target,makeAttack,makeAttack];
}


function initCharacter(given) {
    var curr;
    var curr2;
    for (var i = 0; i < given.abilities.length; i++) { //ToDo clean up var names and make that else readable . . . somehow
        if (given.abilities[i].categories){
            curr = given.abilities[i].categories;
            for (var j = 0; j < Object.keys(curr).length; j++) {
                curr2 = Object.keys(curr)[j];
                if (curr2 != "buffs")
                    given[curr2].push(curr[curr2]);
                else {//Push the buff onto the right buff sub category 
                    if (!given[curr2][Object.keys(curr[curr2])])
                        given[curr2][Object.keys(curr[curr2])] = [];
                    given[curr2][Object.keys(curr[curr2])].push(curr[curr2][Object.keys(curr[curr2])]);
                }
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
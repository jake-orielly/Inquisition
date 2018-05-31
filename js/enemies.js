function caveBeast() {
    return new Character(45,25,15,makeCleaver(),"the cave beast",["it","it's"],"enemy","monster");
}

function rat() {
    var rat = new Character(5,0,5,makeCleaver(),"the rat",["it","it's"],"enemy","chest");
    rat.makeMove = baseAI;
    rat.loot = [{item:meat,odds:100,amount:1}];
    return rat;
}

function fallenKnight() {
    var fallenKnight = new Character(25,15,10,makeShortSword(),"the fallen knight",hisHers(),"enemy","fallenKnight");
    fallenKnight.abilities = [secondWind(fallenKnight.charType)];
    fallenKnight.makeMove = fallenKnightAI;
    return fallenKnight;
}

function createPlayer() {
    var player = new Character(30,20,13,null,"Jake",["him","his"],"player","player");
    player.abilities = [oakSkin(player.charType),bloodBoil(player.charType)];
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
    this.unarmed = new Weapon(2,[1,3],"fist","punched with","pummeled");
    
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
    return "<tr><td>" + makeAttack(this,target) + "</tr></td>";
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
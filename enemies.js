function frothingHeretic() {
    return new Character(10,13,1,dagger([rusty]),"the frothing heretic",hisHers(),"frothingHeretic");
}

function ravenousGlutton() {
    return new Character(45,15,2,cleaver(),"the ravenous glutton",hisHers(),"ravenousGlutton");
}

function fallenKnight() {
    return new Character(25,20,3,shortSword(),"the fallen knight",hisHers(),"fallenKnight",[secondWind]);
}

function createPlayer() {
    return new Character(20,13,3,morningStar,"Jake",["him","his"],"player",[secondWind,doubleEdge,flagellate,woundedFury,retaliation]);
}

/*var player = {hp:20,maxHP:20,ac:13,attack:3,currCools:makeCooldowns(),name:"Jake",perPronoun:"him",possPronoun:"his",
            weapon:morningStar(),
            abilities:[secondWind,doubleEdge,flagellate,woundedFury,retaliation],charType:"player",damageTriggers:[],hpTriggers:[],buffs:{damage:[],critChance:[]}};*/

var Character = function(maxHP,ac,attack,weapon,name,pronounSet,image,abilities = [],damageTriggers = [],hpTriggers = [],buffs = {}) {
    this.hp = maxHP;
    this.maxHP = maxHP;
    this.ac = ac;
    this.attack = attack;
    this.weapon = weapon;
    this.name = name;
    this.charType = "enemy";
    this.perPronoun = pronounSet[0];
    this.possPronoun = pronounSet[1];
    this.image = image;
    this.abilities = abilities;
    this.damageTriggers = damageTriggers;
    this.hpTriggers = hpTriggers;
    this.buffs = buffs;
}

function hisHers() {
    if (Math.random() > 0.5)
        return ["him","his"];
    else
        return ["her","her"];
}
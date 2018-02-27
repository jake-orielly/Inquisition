function frothingHeretic() {
    return new Enemy(10,13,1,dagger([rusty]),"the frothing heretic",hisHers(),"frothingHeretic");
}

function ravenousGlutton() {
    return new Enemy(45,15,2,cleaver(),"the ravenous glutton",hisHers(),"ravenousGlutton");
}

function fallenKnight() {
    return new Enemy(25,20,3,shortSword(),"the fallen knight",hisHers(),"fallenKnight");
}

var Enemy = function(maxHP,ac,attack,weapon,name,pronounSet,image,damageTriggers = [],hpTriggers = [],buffs = {}) {
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
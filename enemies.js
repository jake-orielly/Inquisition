function frothingHeretic() {
    var frothingHeretic = new Character(10,13,1,dagger([rusty]),"the frothing heretic",hisHers(),"enemy","frothingHeretic");
    frothingHeretic.abilities = [flagellate(frothingHeretic.charType)];
    frothingHeretic.makeMove = frothingHereticAI;
    initCharacter(frothingHeretic);
    return frothingHeretic; 
}

function ravenousGlutton() {
    return new Character(45,15,2,cleaver(),"the ravenous glutton",hisHers(),"enemy","ravenousGlutton");
}

function rat() {
    return new Character(5,5,2,cleaver(),"the rat",["it","it's"],"enemy","rat");
}

function fallenKnight() {
    var fallenKnight = new Character(25,10,3,shortSword(),"the fallen knight",hisHers(),"enemy","fallenKnight");
    fallenKnight.abilities = [secondWind(fallenKnight.charType)];
    fallenKnight.makeMove = fallenKnightAI;
    return fallenKnight;
}

function createPlayer() {
    var player = new Character(20,13,3,morningStar(),"Jake",["him","his"],"player","player");
    player.abilities = [secondWind(player.charType),doubleEdge(player.charType),flagellate(player.charType),woundedFury(player.charType),retaliation(player.charType)];
    initCharacter(player);
    return player;
}

var Character = function(maxHP,ac,attack,weapon,name,pronounSet,charType,image,abilities = []) {
    this.hp = maxHP;
    this.maxHP = maxHP;
    this.ac = ac;
    this.attack = attack;
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
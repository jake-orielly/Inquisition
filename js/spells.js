var bloodBoilBuff = {image:"bloodBoilBuff",bonus:5,count:0};
function bloodBoil(charType) {
    var result =  new Ability(charType, "Blood Boil","Your blood boils with demonic strength, increasing the damage of your next attack but damaging you.",3,bloodBoilBuff,{buffs:{damage:bloodBoilBuff}},bloodBoilFunc);
    result.manaCost = 5;
    return result;
}

function bloodBoilFunc(target) {
    var selfDamage = -3;
    var combatText = "<tr><td>";
    giveAttackXP("demon",17);
    this.buff.count += 1;
    changeHP(selfDamage,target);
    moveText(target.charType,selfDamage);
    combatText += capitalize(target.name) + "'s blood boils with demonic energy inflicting <span class='red'>" + Math.abs(selfDamage) + "</span> damage, and boosting the damage of " + target.possPronoun + " next attack!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
    showBuff(this.buff,this.charType);
}

var oakSkinBuff = {image:"oakSkinBuff",bonus:4,count:0,degrades:1};
function oakSkin(charType) {
    var result = new Ability(charType, "Oak Skin","Bless yourself with skin linke oak bark, gaining 4 AC.",6,oakSkinBuff,{buffs:{ac:oakSkinBuff}},oakSkinFunc);
    result.manaCost = 8;
    return result;
}

function oakSkinFunc(target) {
    var combatText = "<tr><td>";
    this.buff.count += 3;
    giveAttackXP("druid",17);
    combatText += capitalize(target.name) + " blessed " + target.perPronoun + "self, gaining 8 AC!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
    showBuff(this.buff,this.charType);
}

function regrowth(charType) {
    var result = new Ability(charType,"Regrowth","Life energy knits your flesh together, healing you.",4,{},{},regrowthFunc);
    result.manaCost = 14;
    return result;
}

function regrowthFunc(target) {
    var combatText = "<tr><td>";
    var amount = 8;
    changeHP(amount,target);
    moveText(target.charType,amount);
    combatText += target.name + " got " + target.possPronoun + " second wind, healing for <span class='green'>" + amount + "</span> hp.";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}
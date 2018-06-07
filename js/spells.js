var bloodBoilBuff = {image:"bloodBoilBuff",bonus:5,count:0};
bloodBoilBuff.description = "Dmg +5";
function bloodBoil(charType) {
    var result =  new Ability(charType, "Blood Boil","Your blood boils with demonic strength, increasing the damage of your next attack but damaging you.",3,{buffs:{damage:bloodBoilBuff}},bloodBoilFunc);
    result.manaCost = 4;
    return result;
}

function bloodBoilFunc(target) {
    var selfDamage = -3;
    var combatText = "<tr><td>";
    giveAttackXP("demon",17);
    this.categories.buffs["damage"].count += 1;
    changeHP(selfDamage,target);
    moveText(target.charType,selfDamage);
    combatText += capitalize(target.name) + "'s blood boils with demonic energy inflicting <span class='red'>" + Math.abs(selfDamage) + "</span> damage, and boosting the damage of " + target.possPronoun + " next attack!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
    showBuff(this.categories.buffs["damage"],this.charType);
}

var oakSkinBuff = {image:"oakSkinBuff",bonus:4,count:0,degrades:1};
oakSkinBuff.description = "AC +4";
function oakSkin(charType) {
    var result = new Ability(charType, "Oak Skin","Bless yourself with skin linke oak bark, gaining 4 AC.",6,{buffs:{ac:oakSkinBuff}},oakSkinFunc);
    result.manaCost = 5;
    return result;
}

function oakSkinFunc(target) {
    var combatText = "<tr><td>";
    this.categories.buffs["ac"].count += 3;
    giveAttackXP("druid",17);
    combatText += capitalize(target.name) + " blessed " + target.perPronoun + "self, gaining 8 AC!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
    showBuff(this.categories.buffs["ac"],this.charType);
}

function regrowth(charType) {
    var result = new Ability(charType,"Regrowth","Life energy knits your flesh together, healing you.",4,{},{},regrowthFunc);
    result.manaCost = 14;
    return result;
}

function regrowthFunc(target) {
    var combatText = "<tr><td>";
    var amount = 8;
    giveAttackXP("druid",41);
    changeHP(amount,target);
    moveText(target.charType,amount);
    combatText += target.name + " got " + target.possPronoun + " second wind, healing for <span class='green'>" + amount + "</span> hp.";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

function rejuvination(charType) {
    var result = new Ability(charType,"Rapid Rejuvination","Every time you take damage, heal for three.",-1,{damageTrigger:rejuvinationFunc},noFunc);
    return result;
}

function rejuvinationFunc(val) {
    var combatText = "<tr><td>";
    var amount = getDamage(1,3);
    var target = player; //Todo fix this so that enemy could have 
    giveAttackXP("druid",6);
    changeHP(amount,target);
    moveText(target.charType,amount);
    combatText += target.name + " regenerated <span class='green'>" + amount + "</span> hp.";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

function hellfire(charType) {
    var result = new Ability(charType,"Hellfire","Blast your enemy with raging fire.",5,{},{},hellfireFunc);
    result.manaCost = 10;
    return result;
}

function hellfireFunc(owner) {
	var target;
	var combatText;
	var damage = [-10,-15];
    giveAttackXP("demon",37);
	damage = getDamage(damage[0],damage[1]);
	if (owner == player)
		target = currEnemy;
	else
		target = player;
	changeHP(damage,target);
	moveText(target.charType,damage);
	combatText = "<tr><td>";
	combatText += owner.name + " blasted " + target.name + " with raging hellfire dealing <span class='red'>" + damage + "</span>.";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;	
}

var retaliationBuff = {image:"retaliationBuff",bonus:1,count:0};
retaliationBuff.description = function() {
    return "Dmg +" + this.count;
}

function retaliation(charType) {
    var result = new Ability(charType,"Retaliation","Every time you take damage, you gain bonus damage, which is expended the next time you strike.",-1,{damageTrigger:retaliationFunc,buffs:{damage:retaliationBuff}},noFunc);
    return result;
}

function retaliationFunc(val) {
    retaliationBuff.count += val*-1;
    showBuff(retaliationBuff,this.charType);
}

function Ability(charType,name,description,maxCooldown,categories,func) {
    this.charType = charType;
    this.name = name; 
    this.description = description;
    this.maxCooldown = maxCooldown;
    if (maxCooldown == -1)
        this.cooldown = -1;
    else 
        this.cooldown = 0;
    this.categories = categories;
    this.func = func;
}
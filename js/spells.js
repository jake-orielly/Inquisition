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
    console.log(target);
    console.log(this);
    if (target.charType == "player")
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
    console.log(this);
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
	var damage = [10,15];
    giveAttackXP("demon",37);
	damage = getDamage(damage[0],damage[1]);
	if (owner == player)
		target = currEnemy;
	else
		target = player;
	changeHP(damage*-1,target);
	moveText(target.charType,damage*-1);
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

//Weapon Spells

function poison(attacker,target) {
    var foundBuff = false;
    var weapon;
    
    if (attacker.weapon)
        weapon = attacker.weapon;
    else
        weapon = attacker.unarmed;
    
    for (var i = 0; i < weapon.modifiers.length; i++)
        if (weapon.modifiers[i].func && weapon.modifiers[i].func.name == "poison") {
            weapon.modifiers[i].count--;
            if (weapon.modifiers[i].count == 0) {
                weapon.modifiers.splice(i,1);
                document.getElementById("combatLog").innerHTML += "<tr><td>The poison on " + attacker.name + "'s weapon ran out.</td></tr>";
            }
        }
    if (target.buffs.healing) {
        for (var i = 0; i < target.buffs.healing.length; i++)
            if (target.buffs.healing[i].image == "poisonBuff") {
                target.buffs.healing[i].count += 3;
                foundBuff = true;
            }
        if (!foundBuff)
            target.buffs.healing.push(poisonBuff(3,target));
    }
    else
        target.buffs.healing = [poisonBuff(3,target)];
    showBuff(target.buffs.healing[target.buffs.healing.length-1],target.charType);
}

function poisonBuff(given,target) {
    var result = {image:"poisonBuff",bonus:-1,count:given,degrades:1};
    result.description = "Does 1 damage per stack per turn.";
    result.func = function(given) {
        changeHP(this.bonus*this.count,target);
        moveText(target.charType,(this.bonus*this.count),"poison");
        document.getElementById("combatLog").innerHTML += "<tr><td>" + target.name + " took <span class='poisonText'>" + this.bonus*this.count*-1 + "</span> damage from poison.</td></tr>";
    }
    return result;
}

function poisonedWeaponBuff(given,amount) {
    var result = {image:"poisonedWeaponBuff",bonus:0,count:amount,degrades:0};
    result.description = "Your weapon is poisoned";
    return result;
}

// Enemy Spells

function acidSpit(charType) {
    var result = new Ability(charType,"Acid Spit","Spit Acid at your enemy.",5,{buffs:{ac:acidSpitBuff}},acidSpitFunc);
    return result;
}

var acidSpitBuff = {image:"acidSpitBuff",bonus:-3,count:0,degrades:1};
acidSpitBuff.description = "AC -3";

function acidSpitFunc(owner,target) {
	var target;
	var combatText;
    var spellWeapon = new Weapon(6,[3,5],"","","spell");
    var crit = false;
    var critAddon = "";
    var critLogAddon = "dealt";
    damage = calcAttack(owner,target,spellWeapon);
    combatText = "<tr><td>";
    if (damage[1]) {
        damage = damage[0];
        crit = true;
        critAddon = "<br>CRIT!"
        critLogAddon = "crit, dealing"
    }
    if (damage == 0) {
        moveText(target.charType,"MISS");
        combatText += owner.name + " spat acid at " + target.name + " but missed.";
    }
    else {
        changeHP(damage*-1,target);
        moveText(target.charType,(damage*-1) + critAddon);
        player.buffs.ac.push(acidSpitBuff)
        acidSpit("enemy").categories.buffs["ac"].count += 4;
        showBuff(acidSpit("enemy").categories.buffs["ac"],acidSpit("enemy").charType);
        combatText += owner.name + " spat acid at " + target.name + " and " + critLogAddon + " <span class='red'>" + damage + "</span> damage.";
    }
    combatText += "</td></tr>";
    return combatText;	
}


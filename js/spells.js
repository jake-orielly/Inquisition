function bloodBoilBuff(amount) {
    return {image:"bloodBoilBuff",bonus:5,count:amount,description:"Dmg +5",category:"damageBuff"};
}

function bloodBoil(charType) {
    var result =  new Ability(charType, "Blood Boil","Your blood boils with demonic strength, increasing the damage of your next attack but damaging you.",3,null,bloodBoilFunc);
    result.manaCost = 4;
    return result;
}

function bloodBoilFunc(target) {
    var selfDamage = -3;
    var combatText = "<tr><td>";
    if (target.charType == "player")
        giveAttackXP("demon",17);
    incrementBuff(target,bloodBoilBuff(1));
    changeHP(selfDamage,target);
    moveText(target.charType,selfDamage);
    combatText += capitalize(target.name) + "'s blood boils with demonic energy inflicting <span class='red'>" + Math.abs(selfDamage) + "</span> damage, and boosting the damage of " + target.possPronoun + " next attack!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

function oakSkinBuff(amount) {
    return {image:"oakSkinBuff",bonus:4,count:amount,degrades:1,description:"AC +4",category:"acBuff"};
}

function oakSkin(charType) {
    var result = new Ability(charType, "Oak Skin","Bless yourself with skin linke oak bark, gaining 4 AC.",6,null,oakSkinFunc);
    result.manaCost = 5;
    return result;
}

function oakSkinFunc(target) {
    var combatText = "<tr><td>";
    incrementBuff(target,oakSkinBuff(3));
    giveAttackXP("druid",17);
    combatText += capitalize(target.name) + " blessed " + target.perPronoun + "self, gaining 8 AC!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

function regrowth(charType) {
    var result = new Ability(charType,"Regrowth","Life energy knits your flesh together, healing you.",4,{},null,regrowthFunc);
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
    var result = new Ability(charType,"Hellfire","Blast your enemy with raging fire.",5,{},null,hellfireFunc);
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

function retaliationBuff(amount) {
    var result = {image:"retaliationBuff",bonus:1,count:amount,category:"damage"};
    result.description = function() {
        return "Dmg +" + this.count;
    };
    return result;
}

function retaliation(charType) {
    var result = new Ability(charType,"Retaliation","Every time you take damage, you gain bonus damage, which is expended the next time you strike.",-1,{damageTrigger:retaliationFunc},noFunc);
    return result;
}

function retaliationFunc(val) {
    incrementBuff(player,retaliationBuff(val));
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
            incrementBuff(player,poisonedWeaponBuff(-1));
            if (weapon.modifiers[i].count == 0) {
                weapon.modifiers.splice(i,1);
                document.getElementById("combatLog").innerHTML += "<tr><td>The poison on " + attacker.name + "'s weapon ran out.</td></tr>";
            }
        }
    incrementBuff(target,poisonBuff(attacker,target,3));
}

function poisonBuff(given,target,amount) {
    var result = {image:"poisonBuff",bonus:-1,count:amount,degrades:1,category:"healingBuff"};
    result.description = "Does 1 damage per stack per turn.";
    result.func = function(given) {
        changeHP(this.bonus*this.count,target);
        moveText(target.charType,(this.bonus*this.count),"poison");
        document.getElementById("combatLog").innerHTML += "<tr><td>" + target.name + " took <span class='poisonText'>" + this.bonus*this.count*-1 + "</span> damage from poison.</td></tr>";
    }
    return result;
}

function poisonedWeaponBuff(amount) {
    var result = {image:"poisonedWeaponBuff",bonus:0,count:amount,degrades:0};
    result.description = "Your weapon is poisoned";
    return result;
}

//Equipment Spells

function ironFortressBuff(amount) {
    return {image:"the_iron_fortress",bonus:5,count:amount,degrades:0,description:"HP +5",category:"equipBuff"};
}

// Enemy Spells
function acidSpit(charType) {
    var result = new Ability(charType,"Acid Spit","Spit Acid at your enemy.",5,null,acidSpitFunc);
    return result;
}

function acidSpitBuff(amount) {
    return {image:"acidSpitBuff",bonus:-3,count:amount,degrades:1,description:"AC -3",category:"acBuff"}
}

function acidSpitFunc(owner,target) {
	var target;
	var combatText;
    var spellWeapon = new Weapon(16,[3,5],"","","spell");
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
        incrementBuff(target,acidSpitBuff(4));
        combatText += owner.name + " spat acid at " + target.name + " and " + critLogAddon + " <span class='red'>" + damage + "</span> damage.";
    }
    combatText += "</td></tr>";
    return combatText;	
}
    
function terrifyingRoarBuff(amount) {
    return {image:"terrifyingRoarBuff",bonus:5,count:amount,description:"Dmg +5",category:"damageBuff"};
}

function terrifyingRoar(charType) {
    var result =  new Ability(charType, "Blood Boil","Your blood boils with demonic strength, increasing the damage of your next attack but damaging you.",3,null,bloodBoilFunc);
    result.manaCost = 4;
    return result;
}

function terrifyingRoarFunc(target) {
    var combatText = "<tr><td>";
    incrementBuff(target,bloodBoilBuff(1));
    combatText += capitalize(target.name) + "'s blood boils with demonic energy inflicting <span class='red'>" + Math.abs(selfDamage) + "</span> damage, and boosting the damage of " + target.possPronoun + " next attack!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

//Utility Functions

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

function incrementBuff(entity,buff) {
    var foundBuff = false;
    for (var i in entity.buffs) {
        for (var j = 0; j < entity.buffs[i].length; j++) {
            if (entity.buffs[i][j].image == buff.image) {
                entity.buffs[i][j].count += buff.count;
                foundBuff = true;
            }
        }
    }

    if (!foundBuff) {
        if (!entity.buffs[buff.category])
            entity.buffs[buff.category] = [];
        entity.buffs[buff.category].push(buff);
    }
    
    showAllBuffs(entity);
}


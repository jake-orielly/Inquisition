var turn;
var dead;
var isPlayerTurn;
var player;
var currEnemy;
var characters;

var retaliationBuff = {image:"retaliationBuff",bonus:1,count:0};
var woundedFuryBuff = {image:"woundedFuryBuff",bonus:1,count:0};
var flagellateBuff = {image:"flagellateBuff",bonus:5,count:0};

player = createPlayer();

function startCombat() {
    turn = 0;
    dead = 0;
    isPlayerTurn = true;
    currEnemy = rat();
    characters = [player,currEnemy];
    
    var types;
    types = Object.keys(player.buffs);
    for (var i = 0; i < types.length; i++) {
        for (var j = 0; j < player.buffs[types[i]].length; j++) {
            player.buffs[types[i]][j].count = 0;
            showBuff(player.buffs[types[i]][j]);
        }
    }
    
    for (var i = 0; i < player.hpTriggers.length; i++)
                player.hpTriggers[i]();
    
    for (var i = 0; i < characters.length; i++)
        updateHP(characters[i]);
    
    for (var i = 0; i < player.abilities.length; i++) {
        if(player.abilities[i].cooldown > 0)
            player.abilities[i].cooldown = 0;
    }
    
    $("#combatLogContainer").hide();
    document.getElementById("movesSection").style.display = "block";
    document.getElementById("movesButton").className += " active";
    document.getElementById("enemyImgContainer").getElementsByTagName('img')[0].src = "art/" + currEnemy.image + ".jpg";
    
    for (var i = 0; i < $(".abilityButton").length; i++)
        $(".abilityButton")[i].classList.remove("coolDown");
}

function Ability(charType,name,description,maxCooldown,buff,categories,func) {
    this.charType = charType;
    this.name = name; 
    this.description = description;
    this.maxCooldown = maxCooldown;
    if (maxCooldown == -1)
        this.cooldown = -1;
    else 
        this.cooldown = 0;
    this.buff = buff;
    this.categories = categories;
    this.func = func;
}

function secondWind(charType) {
    return new Ability(charType,"Second Wind","Regain half your missing health.",5,{},{},secondWindFunc)
}

function retaliation(charType) {
    return new Ability(charType,"Retaliation","Every time you take damage, you gain bonus attack, which is expended the next time you strike.",-1,retaliationBuff,{damageTriggers:retaliationFunc,buffs:{damage:retaliationBuff}},noFunc);
}

function doubleEdge(charType) {
    return new Ability(charType,"Double Edge","A wild strike that hits both you and your enemy.",1,{},{},doubleEdgeFunc)
}

function woundedFury(charType) {
    return new Ability(charType,"Wounded Fury","The lower your health, the higher your crit chance.",-1,woundedFuryBuff,{hpTriggers:woundedFuryFunc,buffs:{critChance:woundedFuryBuff}},noFunc);
}

function flagellate(charType) {
    return new Ability(charType, "Flagellate","Lash yourself, increasing the damage of your next attack.",3,flagellateBuff,{buffs:{damage:flagellateBuff}},flagellateFunc);
}

function noFunc() {
    console.log("Error 2: Bad Ability Function","The lower your health, the higher your crit chance.");
}

function secondWindFunc() {
    var combatText = "<tr><td>";
    var target;
    var amount;
    if (this.charType == "player")
        target = player;
    else
        target = currEnemy;
    amount = parseInt((target.maxHP - target.hp)/2);
    changeHP(amount,target);
    moveText(target.charType,amount);
    combatText += target.name + " got " + target.possPronoun + " second wind, healing for <span class='green'>" + amount + "</span> hp.";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

for (var i = 0; i < $(".abilityButton").length; i++) {
    $(".abilityButton")[i].innerHTML = player.abilities[i].name;
    $(".abilityButton")[i].setAttribute("onClick","javascript: triggerAbility(player," + i + ");");
}

$(".abilityButton").hide();

function changeHP(val,target) {
    target.hp += val;

    if (target.hp <= 0)
        endCombat(target);

    else {
        if (val < 0) {
            for (var i = 0; i < target.damageTriggers.length; i++)
                target.damageTriggers[i](val);
        }

        for (var i = 0; i < target.hpTriggers.length; i++)
                target.hpTriggers[i]();
    }

    updateHP(target);
}

function endCombat(target) {
    for (var i = 0; i < $(".abilityButton").length; i++)
        $(".abilityButton")[i].classList.add("coolDown");
    dead = target;
    setTimeout(function(){
        $("#board").show();
        $(".inquisition").hide();
        $(".actionButton").css("color","black");
        $(".actionButton").css("cursor","pointer");
        nextEncounter = parseInt(Math.random()*100)+50;
        inCombat = false;
    },1000);
}

function triggerAbility(owner,given) {
    if (owner.abilities[given].cooldown == 0 && !dead) {
        owner.abilities[given].cooldown = owner.abilities[given].maxCooldown;
        owner.abilities[given].func();
        if (owner = player)
            $(".abilityButton")[given].classList.add("coolDown");
    }
}

function showBuff(buff,charType) {
    charType = "player";
    if (buff.count < 1) {
            hideBuff(buff.image);
    }
    else if (!document.getElementById(buff.image)) {
        var result = "<tr id='" + buff.image + "Row'><td><div class='relative'><img class='buffImage' src=art/" + buff.image + ".jpg >"
        result += "<p class='buffText " + charType + "BuffText' id='" + buff.image + "'>" + buff.count + "</p>";
        result += "</div></td></tr>";
        document.getElementById("playerBuffTable").innerHTML += result;
    }
    else { 
        if(!$("#" + buff.image + "Row").is(":visible"))
            $("#" + buff.image + "Row").show();
        document.getElementById(buff.image).innerHTML = buff.count;
    }

    if (buff.count > 9) {
        document.getElementById(buff.image).classList = "bigBuffText ";
        document.getElementById(buff.image).classList += charType + "BigBuffText";
    }
}

function hideBuff(given) {
    $("#" + given + "Row").hide();
}

function flagellateFunc() {
    var selfDamage = -3;
    var combatText = "<tr><td>";

    this.buff.count += 1;
    var target;
    if (this.charType == "player")
        target = player;
    else
        target = currEnemy;
    changeHP(selfDamage,target);
    moveText(target.charType,selfDamage);
    combatText += target.name + " flogged " + target.perPronoun + "self, inflicting <span class='red'>" + Math.abs(selfDamage) + "</span> damage, and boosting the damage of " + target.possPronoun + " next attack!";
    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
    showBuff(this.buff,this.charType);
}

function doubleEdgeFunc() {
    var playerTemp = player.hp;
    var enemyTemp = currEnemy.hp;
    var combatText = "<tr><td>";

    makeAttack(player, currEnemy);
    makeAttack(player, player);

    combatText += player.name + " " + player.weapon.verb + " recklessly, inflicting "

    if (playerTemp == player.hp)
        combatText += "no "
    else
        combatText += "<span class='red'>" + (playerTemp - player.hp) + "</span>";
    combatText += " damage to " + player.perPronoun + "self, and "

    if (enemyTemp == currEnemy.hp)
        combatText += "no "
    else 
        combatText += "<span class='red'>" + (enemyTemp - currEnemy.hp) + "</span>";
    combatText += " damage to " + currEnemy.name + ".";

    combatText += "</td></tr>";
    document.getElementById("combatLog").innerHTML += combatText;
}

function retaliationFunc(val) {
    retaliationBuff.count += val*-1;
    showBuff(retaliationBuff,this.charType);
}

function woundedFuryFunc() {
    woundedFuryBuff.count = parseInt(10*(1-(player.hp/player.maxHP)));
    showBuff(woundedFuryBuff,this.charType);
}

function playerTurn() {
    if (isPlayerTurn && !dead) {
        isPlayerTurn = false;
        $(".abilityButton").hide();
        $(".actionButton").css("color","grey");
        $(".actionButton").css("cursor","default");
        takeTurn(characters[0],characters[1]);
        if (!dead) {
            setTimeout(function(){
                takeTurn(characters[1],characters[0])
                setTimeout(function(){
                    isPlayerTurn = true
                    $(".actionButton").css("color","black");
                    $(".actionButton").css("cursor","pointer");
                    playerCooldownTick();
                },1000);
            }, 1000);
        }
    }
}

function wait() {
    if (isPlayerTurn && !dead) {
        isPlayerTurn = false;
        $(".abilityButton").hide();
        $(".actionButton").css("color","grey");
        $(".actionButton").css("cursor","default");
        setTimeout(function(){
            takeTurn(characters[1],characters[0])
            setTimeout(function(){
                isPlayerTurn = true
                $(".actionButton").css("color","black");
                $(".actionButton").css("cursor","pointer");
                playerCooldownTick();
            },1000);
        }, 1000);
    }
}

function playerCooldownTick() {
    for (var i = 0; i < player.abilities.length; i++) {
        if (player.abilities[i].cooldown > 0)
            player.abilities[i].cooldown--;
        if (player.abilities[i].cooldown == 0)
            $(".abilityButton")[i].classList.remove("coolDown");
    }
}

function takeTurn(curr, target) {
    var result;
    if (curr == currEnemy)
        result = currEnemy.makeMove(target);
    else
        result = "<tr><td>" + makeAttack(curr,target) + "</tr></td>";
    turn++;
    document.getElementById("combatLog").innerHTML += result;
}

function makeAttack(attacker, defender) {
    var attackResult = calcAttack(attacker,defender);
    var crit = false;
    var critAddon = "";
    var critLogAddon = "dealt";

    if (attackResult[1]) {
        attackResult = attackResult[0];
        crit = true;
        critAddon = "<br>CRIT!"
        critLogAddon = "crit, dealing"
    }

    attackResult = attackResult*-1;

    if (attackResult == 0) {
        moveText(defender.charType,"MISS");
        return attacker.name.charAt(0).toUpperCase() + attacker.name.slice(1) + " " + attacker.weapon.verb + " " + attacker.possPronoun + " " + attacker.weapon.name + " but missed!";
    }
    else {
        changeHP(attackResult,defender);
        moveText(defender.charType,attackResult + critAddon);                    

        if (defender.hp > 0)
            return attacker.name.charAt(0).toUpperCase() + attacker.name.slice(1) + " " + attacker.weapon.verb + " " + attacker.possPronoun + " " + attacker.weapon.name + " at " + defender.name + " and " + critLogAddon + " <span class='red'>" + Math.abs(attackResult) + "</span> damage. " + defender.name.charAt(0).toUpperCase() + defender.name.slice(1) + " now has <span class='red'>" + defender.hp + "</span> health."; 
        else {
            return attacker.name.charAt(0).toUpperCase() + attacker.name.slice(1) + " " + critLogAddon + " <span class='red'>" + + Math.abs(attackResult) + "</span> damage, and " + attacker.weapon.killVerb + " " + defender.name + " with " + attacker.possPronoun + " " + attacker.weapon.name;
        }
    }
}

function calcAttack(attacker,defender) { //Todo add UI to alert player to crit
    var result = 0;
    var attack = attackRoll();
    var critThreshold = 20;
    var curr;

    for (var i = 0; i < player.buffs.critChance.length; i++)
        critThreshold -= player.buffs.critChance[i].count;
    if (attack + attacker.weapon.getAttribute("attack") +attacker.attack > defender.ac || attack == 20) {
        result = getDamage(attacker.weapon.getAttribute("damage")[0],attacker.weapon.getAttribute("damage")[1]);
        if (attacker.buffs.damage)
            for (var i = 0; i < attacker.buffs.damage.length; i++) {
                curr = attacker.buffs.damage[i];
                if(curr.count) {
                    result += curr.count * curr.bonus;
                    curr.count = 0;
                    hideBuff(curr.image);
                }
            }
    }

    if (attack >= critThreshold) {
        result = [result * 2,true];
    }
    return result;
}

function attackRoll() {
    return parseInt(Math.random()*20+1);
}

function getDamage(x,y) {
    return parseInt(Math.random()*(y-(x-1))+x);
}

function updateHP(target) {
    if (target.hp/target.maxHP < 0.2)
        document.getElementById(target.charType + "HP").style.backgroundColor = "red";
    else if (target.hp/target.maxHP < 0.4)
        document.getElementById(target.charType + "HP").style.backgroundColor = "yellow";
    else
        document.getElementById(target.charType + "HP").style.backgroundColor = "green";
    if (target.hp < 0) {
        document.getElementById(target.charType + "HP").style.width = "0px";
        document.getElementById(target.charType + "HPText").innerHTML = "0/" + target.maxHP;
    }
    else {
        document.getElementById(target.charType + "HP").style.width = (target.hp/target.maxHP) * 250 + "px";
        document.getElementById(target.charType + "HPText").innerHTML = "" + target.hp + "/" + target.maxHP;
    }    
}

function moveText(given,val) {
    var span;
    if (val > 0)
        span = "<span class='green'>";
    else
        span = "<span class='red'>";
    document.getElementById(given + "ActionText").innerHTML = span + val + "</span>"; //JQuery .text() doesn't work
    $("#" + given + "ActionText").show();
    $("#" + given + "ActionText").fadeOut(700,textReset("" + given));
    $("#" + given + "ActionText").addClass("actionTextMove");
}

function textReset(given) {
    $("#" + given + "ActionText").removeClass("actionTextMove");
}

function toggleAbilities() {
    if (!dead)
        $(".abilityButton").toggle();
}

function openCombatLog(event) {
    openTab(event, 'combatLogContainer');
    document.getElementById("combatLogContainer").scrollTop = document.getElementById("combatLogContainer").scrollHeight;
}

function openTab(evt, currTab) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tabLinks");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(currTab).style.display = "block";
    evt.currentTarget.className += " active";
}
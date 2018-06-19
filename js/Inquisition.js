var turn;
var dead;
var isPlayerTurn;
var player;
var currEnemy;
var characters;
var abilitiesOpen = false;
var itemsOpen = false;

var woundedFuryBuff = {image:"woundedFuryBuff",bonus:1,count:0};

player = createPlayer();

function startCombat(given) {
    turn = 0;
    dead = 0;
    isPlayerTurn = true;
    
    if (given)
        currEnemy = given();
    else
        currEnemy = wolf();
    characters = [player,currEnemy];
    
    showAllBuffs(player);
    
    for (var i = 0; i < player.hpTriggers.length; i++)
                player.hpTriggers[i]();
    
    for (var i = 0; i < characters.length; i++) {
        updateHP(characters[i]);
        updateMana(characters[i]);
    }
    
    for (var i = 0; i < player.abilities.length; i++) {
        if(player.abilities[i].cooldown > 0)
            player.abilities[i].cooldown = 0;
    }
    
    document.getElementById("combatLog").innerHTML += "<tr><td> " + capitalize(currEnemy.name) + " appears and attacks you!</td></tr>";
    
    $("#combatLogContainer").hide();
    $(".abilityButton").hide();
    document.getElementById("movesSection").style.display = "block";
    document.getElementById("movesButton").className += " active";
    document.getElementById("enemyImgContainer").getElementsByTagName('img')[0].src = "art/" + currEnemy.image + ".png";
    
    $("#movesSection>tbody>tr>td>div").removeClass("coolDown");
}

function doubleEdge(charType) {
    return new Ability(charType,"Double Edge","A wild strike that hits both you and your enemy.",1,{},{},doubleEdgeFunc)
}

function woundedFury(charType) {
    return new Ability(charType,"Wounded Fury","The lower your health, the higher your crit chance.",-1,woundedFuryBuff,{hpTriggers:woundedFuryFunc,buffs:{critChance:woundedFuryBuff}},noFunc);
}

function noFunc() {
    console.log("Error 2: Bad Ability Function","The lower your health, the higher your crit chance.");
}

function updateAbilities() {
    for (var i = 0; i < player.abilities.length; i++) {
        if (player.abilities[i].maxCooldown > -1) {
            $(".abilityButton")[i].innerHTML = player.abilities[i].name;
            $(".abilityButton")[i].setAttribute("onClick","javascript: triggerAbility(player," + i + ");");
            $(".abilityButton")[i].style.display='block';
        }
    }
}

function changeHP(val,target) {
    target.hp += val;
    if (target.hp > target.maxHP)
        target.hp = target.maxHP;
    if (target.hp <= 0)
        endCombat(target);

    else {
        if (val < 0)
            for (var i = 0; i < target.damageTriggers.length; i++)
                target.damageTriggers[i](val);

        for (var i = 0; i < target.hpTriggers.length; i++)
                target.hpTriggers[i]();
    }

    updateHP(target);
}

function endCombat(target) {
    var delay = 0;
    var amount;
    
    for (var i = 0; i < $(".abilityButton").length; i++)
        $(".abilityButton")[i].classList.add("coolDown");
    if (currEnemy.name == "the cave beast") {
        quests.southernBeast.phase = 2;        
        board[32][35].splice(2);
        board[32][36].splice(2);
        board[33][35].splice(2);
        board[33][36].splice(2);
        updateBoard();
        $(".monsterInvis").hide();
        if (!questGiver.slain)
            updateQuestGiverLines()
        questGiver.slain.responses.show = "[Show tusk]";
        questGiver.slain.show = {line:"Truly you are a hero. We owe you a great debt " + player.name + ". Take this is a token of our gratitude."}
        questGiver.slain.show.func = function() {
            quests.southernBeast.phase = 3;
            questGiver.line = "You're a hero to this town";
            questGiver.responses = null;
            addItem(inventory,gold,500);
            monster_tusk.questItem = false;
        };
    }
    dead = target;
    if (dead == player) {
        $("#movesSection>tbody>tr>td>div").addClass("coolDown");
        delay = 1000;
    }
    setTimeout(function(){
        document.getElementById("combatLog").innerHTML = "";
        $(".inquisition").hide();
        $("#worldMapContainer").show();
        $(".actionButton").css("color","black");
        $(".actionButton").css("cursor","pointer");
        nextEncounter = parseInt(Math.random()*100)+50;
        inCombat = false;
        if (dead == player) {
            playerDeath();
        }
        else {
            loot(currEnemy);
            showInventory();
            for (var i in player.buffs)
                for (var j in player.buffs[i])
                    player.buffs[i][j].count = 0;
        }
    },(1000 + delay));
}

function playerDeath() {
    var sleepTick = 0;
    var sleepScreenInterval;
    document.removeEventListener('keydown', keyResponse);
    amount = parseInt(inventoryCount(inventory,gold) * .66);
    removeItem(inventory,gold,amount);
    player.hp = player.maxHP;
    player.mana = player.maxMana;
    mapTable = villageMap;
    makeBoard();
    $("#sleepContainer").show();
    
    sleepScreenInterval = setInterval( function() {
        sleepTick += 0.05;
        $("#sleepScreen").css("fill","rgb(0,0,0," + sleepTick + ")");
        if (sleepTick >= 1) {
            setTimeout(function() {
                teleport(11,12);
                sleepScreenInterval = setInterval( function() {
                    sleepTick -= 0.05;
                    $("#sleepScreen").css("fill","rgb(0,0,0," + sleepTick + ")");
                    if (sleepTick <= 0) {
                        document.addEventListener('keydown', keyResponse);
                        $("#sleepContainer").hide();
                        clearInterval(sleepScreenInterval);
                        for (var i in player.buffs)
                            for (var j in player.buffs[i])
                                player.buffs[i][j].count = 0;
                    }
                },100);
            },2000);
            clearInterval(sleepScreenInterval);
        }
    },100);
}

function triggerAbility(owner,given) {
    if (!owner.abilities[given].manaCost || (owner.mana >= owner.abilities[given].manaCost)) {
        if (owner.abilities[given].manaCost) {
            owner.mana -= owner.abilities[given].manaCost;
            updateMana(owner);
        }
        if (owner.abilities[given].cooldown == 0 && !dead) {
            owner.abilities[given].cooldown = owner.abilities[given].maxCooldown;
            owner.abilities[given].func(owner);
            if (owner == player)
                $(".abilityButton")[given].classList.add("coolDown");
        }
    }
}

function showBuff(buff,charType) {
    var description;
    if (typeof buff.description == "function")
        description = buff.description();
    else
        description = buff.description;
    
    if (buff.count < 1) {
            hideBuff(buff.image);
    }
    else if (!document.getElementById(buff.image)) {
        var result = "<tr id='" + buff.image + "Row'><td><div class='relative'><img class='buffImage' src=art/" + buff.image + ".png >"
        if (buff.count > 1)
            result += "<p class='buffText " + charType + "BuffText' id='" + buff.image + "'>" + buff.count + "</p>";
        result += "</div><span class='buffHidden'>" + description + "</span></td></tr>";
        document.getElementById(charType + "BuffTable").innerHTML += result;
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
    
    $("#" + charType + "BuffTable>tr").mouseenter(function() {
        $(this).find("span").removeClass("buffHidden");
        $(this).find("span").addClass("buffHover");
    });
    $("#" + charType + "Table>tr").mouseleave(function() {
        $(this).find("span").addClass("buffHidden");
        $(this).find("span").removeClass("buffHover");
    });
}

function hideBuff(given) {
    $("#" + given + "Row").hide();
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

function woundedFuryFunc() {
    woundedFuryBuff.count = parseInt(10*(1-(player.hp/player.maxHP)));
    showBuff(woundedFuryBuff,this.charType);
}

function playerTurn() {
    if (isPlayerTurn && !dead) {
        degradeBuffs(currEnemy);
        isPlayerTurn = false;
        $(".abilityButton").hide();
        $(".actionButton").css("color","grey");
        $(".actionButton").css("cursor","default");
        showAllBuffs(player);
        takeTurn(characters[0],characters[1]);
        if (!dead)
            takeTurn(characters[1],characters[0])
    }
}

function showAllBuffs(given) {
    document.getElementById(given.charType + "BuffTable").innerHTML = "";
    for (var i in given.buffs) 
            for (var j = 0; j < given.buffs[i].length; j++)
                if (given.buffs[i][j].count > 0)
                    showBuff(given.buffs[i][j],given.charType);
}

function wait() {
    if (isPlayerTurn && !dead) {
        if (player.buffs.healingBuff)
            for (var i = 0; i < player.buffs.healingBuff.length; i++)
                if (player.buffs.healingBuff[i].count > 0)
                    player.buffs.healingBuff[i].func(player);
        degradeBuffs(currEnemy);
        isPlayerTurn = false;
        $(".abilityButton").hide();
        $(".actionButton").css("color","grey");
        $(".actionButton").css("cursor","default");
        showAllBuffs(player);
        takeTurn(characters[1],characters[0])
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
    var result = "";
    var temp;
    
    if (curr == currEnemy) {
        for (var i = 0; i < currEnemy.abilities.length; i++)
            if (currEnemy.abilities[i].cooldown > 0)
                currEnemy.abilities[i].cooldown--;
        if (currEnemy.buffs.healingBuff)
            setTimeout(function(){
                if (processHeals(curr))
                    setTimeout(function(){
                        executeMove(currEnemy.makeMove(target),1,"");
                    },800);
            },800);
        else
            executeMove(currEnemy.makeMove(target),1,"");
    }
    else {
        processHeals(curr);
        result = "<tr><td>" + makeAttack(curr,target) + "</tr></td>";
        turn++;
        document.getElementById("combatLog").innerHTML += result;
    }
}

function degradeBuffs(given) {
    for (var i in given.buffs) 
            for (var j = 0; j < given.buffs[i].length; j++)
                if (given.buffs[i][j].count > 0) {
                    if (given.buffs[i][j].degrades)
                        given.buffs[i][j].count--;
                    showBuff(given.buffs[i][j],given.charType);
                }
}

function processHeals(curr) {
    var healed = false;
    if (curr.buffs.healingBuff)
        for (var i = 0; i < curr.buffs.healingBuff.length; i++)
            if (curr.buffs.healingBuff[i].count > 0) {
                curr.buffs.healingBuff[i].func(curr);
                healed = true;
            }
    return healed;
}

function executeMove(moves,num,currResult) {
    var temp,result,func;
    console.log("Enemy" + moves[num]);
    if (moves[num].func)
        func = moves[num].func;
    else 
        func = moves[num];
    
    if (num == moves.length-1) {
        setTimeout(function(){
            result = currResult + "<tr><td>" + func(currEnemy,player) + "</td></tr>";
            document.getElementById("combatLog").innerHTML += result;
            turn++;
            setTimeout(function(){
                showAllBuffs(currEnemy);
                degradeBuffs(player);
                isPlayerTurn = true
                $(".actionButton").css("color","black");
                $(".actionButton").css("cursor","pointer");
                playerCooldownTick();
            },1200);
        },800);
    }
    else {
        setTimeout(function(){
            executeMove(moves,num+1,currResult + "<tr><td>" + func(currEnemy,player) + "</td></tr>");
        },1200);
    }
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
        return capitalize(attacker.name) + " " + attacker.weapon.verb + " " + attacker.possPronoun + " " + attacker.weapon.name + " but missed!";
    }
    else {
        changeHP(attackResult,defender);
        moveText(defender.charType,attackResult + critAddon);   
        for (var i = 0; i < attacker.weapon.modifiers.length; i++)
            if (attacker.weapon.modifiers[i].func)
                attacker.weapon.modifiers[i].func(attacker,defender);
        
        if (attacker == player)
            giveAttackXP(attacker.weapon.killVerb,Math.abs(attackResult));

        if (defender.hp > 0)
            return capitalize(attacker.name) + " " + attacker.weapon.verb + " " + attacker.possPronoun + " " + attacker.weapon.name + " at " + defender.name + " and " + critLogAddon + " <span class='red'>" + Math.abs(attackResult) + "</span> damage. " + capitalize(defender.name) + " now has <span class='red'>" + defender.hp + "</span> health."; 
        else {
            return capitalize(attacker.name) + " " + critLogAddon + " <span class='red'>" + + Math.abs(attackResult) + "</span> damage, and " + attacker.weapon.killVerb + " " + defender.name + " with " + attacker.possPronoun + " " + attacker.weapon.name;
        }
    }
}

function calcAttack(attacker,defender,weapon = attacker.weapon) { //Todo add UI to alert player to crit
    var result = 0;
    var critThreshold = 20;
    var curr, attack;
    var baseAttack = attackRoll();
    var defenderAC = defender.ac;
    var wepType;
    
    if (weapon == null) {
        wepType = "unarmed";
        weapon = attacker.unarmed;
        attacker.weapon = attacker.unarmed;
    }
    else
        wepType = weapon.getAttribute("killVerb");
    
    if (defender.buffs.ac)
        for (var i = 0; i < defender.buffs.ac.length; i++)
            if (defender.buffs.ac[i].count)
                defenderAC += defender.buffs.ac[i].bonus;
    attack = baseAttack + weapon.getAttribute("attack");
    console.log(attack + " : " + defenderAC);
    if (attacker == player)
        attack = applyPerks(attack,wepType,"attack");
    
    if (player.buffs.critChance)
        for (var i = 0; i < player.buffs.critChance.length; i++)
            critThreshold -= player.buffs.critChance[i].count;
    if (attack > defenderAC || baseAttack == 20) {
        result = getDamage(weapon.getAttribute("damage")[0],weapon.getAttribute("damage")[1]);
        if (attacker.buffs.damageBuff)
            for (var i = 0; i < attacker.buffs.damageBuff.length; i++) {
                curr = attacker.buffs.damageBuff[i];
                if(curr.count) {
                    result += curr.count * curr.bonus;
                    curr.count = 0;
                    showAllBuffs(attacker);
                }
            }
    }
    if (attacker == player)
        result = applyPerks(result,wepType,"damage");
    critThreshold = applyPerks(critThreshold,wepType,"crit");
    if (baseAttack >= critThreshold) {
        result = [result * applyPerks(2,wepType,"critDamage"),true];
    }
    return result;
}

function applyPerks(given,killVerb,attribute) {
    for (var i = 0; i < playerPerks.length; i++)
            for (var j in playerPerks[i].requirements)
                if (j == killVerb)
                    for (var k in playerPerks[i].functional)
                        if (k == attribute)
                            given = playerPerks[i].functional[k](given);
    return given;
}

function attackRoll() {
    return parseInt(Math.random()*20+1);
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

function updateMana(target) {
    if (target.maxMana == 0)
        $("#" + target.charType + "ManaMax").hide();
    else if (target.mana < 0) {
        document.getElementById(target.charType + "Mana").style.width = "0px";
        document.getElementById(target.charType + "ManaText").innerHTML = "0/" + target.maxMana;
    }
    else {
        document.getElementById(target.charType + "Mana").style.width = (target.mana/target.maxMana) * 250 + "px";
        document.getElementById(target.charType + "ManaText").innerHTML = "" + target.mana + "/" + target.maxMana;
    }
}

function moveText(given,val,type = "health") {
    var span;
    if (type == "mana")
        span = "<span class='blue'>";
    else if (type == "poison")
        span = "<span class='poisonText'>";
    else if (val > 0)
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
    if (!dead) {
        if (itemsOpen) {
            $(".abilityButton").hide();
            itemsOpen = false;
        }
        if ($(".abilityButton").is(":visible"))
            $(".abilityButton").hide();
        else
            updateAbilities();
        abilitiesOpen = !abilitiesOpen;
    }
}

function toggleItems() {
    if (!dead) {
        if (abilitiesOpen) {
            $(".abilityButton").hide();
            abilitiesOpen = false;
        }
        if ($(".abilityButton").is(":visible"))
            $(".abilityButton").hide();
        else
            updateItems();
        itemsOpen = !itemsOpen;
    }
}

function triggerItem(given) {
    var healAmount;
    var property, propertyCap;
    if (given.potion.hp) {
        property = "hp";
        propertyCap = "HP";
    }
    else if (given.potion.mana) {
        property = "mana";
        propertyCap = "Mana";
    }
    else if (given.potion.func) {
        given.potion.func();
    }
    if (property) {
        if (player[property] + given.potion[property] > player["max" + propertyCap])
            healAmount = player["max" + propertyCap] - player[property];
        else 
            healAmount = given.potion[property];
        if (property == "hp") {
            changeHP(healAmount,player);
            moveText("player",healAmount);
            document.getElementById("combatLog").innerHTML += "<tr><td>" + player.name + " drank a health potion, healing <span class='green'>" + healAmount + "</span> damage.</td></tr>";
        }
        else {
            player.mana += healAmount;
            moveText("player",healAmount,"mana");
            updateMana(player);
            document.getElementById("combatLog").innerHTML += "<tr><td>" + player.name + " drank a mana potion, restoring <span class='blue'>" + healAmount + "</span> mana.</td></tr>";
        }
            
    }
    removeItem(inventory,given);
    updateItems();
    wait();
}

function updateItems() {
    var curr = 0;
    var noItems = true;
    $(".abilityButton").hide();
    for (var i = 0; i < potionList.length; i++) {
        if (inventoryCount(inventory,potionList[i])) {
            $(".abilityButton")[curr].innerHTML = potionList[i].getName();
            if (inventoryCount(inventory,potionList[i]) > 1)
                $(".abilityButton")[curr].innerHTML += " x" + inventoryCount(inventory,potionList[i]);
            $(".abilityButton")[curr].style.display = "table";
            $(".abilityButton")[curr].setAttribute("onClick","javascript: triggerItem(" + potionList[i].name + ");");
            curr++;
            noItems = false;
        }
    }
    if (noItems) {
        $(".abilityButton")[curr].innerHTML = "[No Items]";
        $(".abilityButton")[curr].style.display = "table";
    }
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
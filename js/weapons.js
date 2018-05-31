//Weapon templates
function makeShortSword(modifiers) {
    return new Weapon(5,[3,5],"short sword","swung with","piercing",modifiers);
}

function makeMace(modifiers) {
    return new Weapon(4,[4,6],"mace","swung with","crushing",modifiers);
}

function makeMorningStar(modifiers) {
    return new Weapon(3,[4,7],"morningstar","swung with","crushing",modifiers);
}

function makeCleaver(modifiers) {
    return new Weapon(4,[4,5],"cleaver","chopped with","chopping",modifiers);
}

function makeDagger(modifiers) {
    return new Weapon(3,[3,4],"dagger","lunged with","piercing",modifiers);
}

function makeAxe(modifiers) {
    return new Weapon(4,[4,5],"axe","chopped with","chopping",modifiers);
}

function makePickaxe(modifiers) {
    return new Weapon(6,[2,3],"pickaxe","swung with","piercing",modifiers);
}

function makeChestplate(modifiers) {
    return new Armor(6,"chestplate","chest",modifiers);
}

function makePlatelegs(modifiers) {
    return new Armor(4,"platelegs","legs",modifiers);
}

//Weapon modifiers
var modifierList = {
    rusty:{attack:-1,damage:-1},
    copper: {attack:1},
    iron: {attack:2, damage:1,ac:1.4},
    steel:{attack:3,damage:2,ac:1.8},
    the_iron_fortress:{ac:2,hp:8}};


//Base weapon code
function Weapon(attack,damage,name,verb,killVerb,modifierNames = []) {
    this.attack = attack;
    this.damage = damage;
    this.name = name;
    this.slot = "weapon";
    this.verb = verb;
    this.killVerb = killVerb;
    this.modifierNames = modifierNames;
    this.modifiers = [];
    for (var i = 0; i < modifierNames.length; i++)
        this.modifiers[i] = modifierList[modifierNames[i]];

    this.getAttribute = function(given) {return getAttribute(this,given)};
    
    this.getName = function() {return getName(this)};
}

function Armor(ac,name,slot,modifierNames = []) {
    this.ac = ac;
    this.name = name;
    this.slot = slot;
    this.modifierNames = modifierNames;
    this.modifiers = [];
    for (var i = 0; i < modifierNames.length; i++)
        this.modifiers[i] = modifierList[modifierNames[i]];
    
    this.getAttribute = function(given) {return getAttribute(this,given)};
    
    this.getName = function() {return getName(this)};
}

function getAttribute(object, given) {
    if (!object[given])
        console.log("Error 1: Requested invalid attribute");
    else {
        var result;   
        if (Array.isArray(object[given])) //Prevents the array from being aliased 
            result = [object[given][0],object[given][1]];
        else
            result = object[given];

        for (var i = 0; i < object.modifiers.length; i++) { //For each of the weapon's modifiers
            for (var currProperty in object.modifiers[i]){ //For each of the modifiers properties
                if(currProperty == given) {
                    if (given == "damage") { //If damage, subtract from max and min
                        result[0] += object.modifiers[i][currProperty];
                        result[1] += object.modifiers[i][currProperty];
                    }
                    else if (given == "ac") 
                        result = parseInt(result * object.modifiers[i][currProperty]);
                    else 
                        result += object.modifiers[i][currProperty];
                }
            }
        }
    }
    return result;
}

function getName(object) {
    var displayName = "";
    for (var i = 0; i < object.modifierNames.length; i++)
        displayName += capitalize(object.modifierNames[i] + " ");
    displayName += capitalize(object.name);
    return displayName;
}
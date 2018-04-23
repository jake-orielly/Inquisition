//Weapon templates
function makeShortSword(modifiers) {
    return new Weapon(5,[3,5],"short sword","swung with","sliced",modifiers);
}

function makeMorningStar(modifiers) {
    return new Weapon(3,[4,7],"morningstar","swung with","crushed",modifiers);
}

function makeCleaver(modifiers) {
    return new Weapon(4,[4,5],"cleaver","chopped with","sliced",modifiers);
}

function makeDagger(modifiers) {
    return new Weapon(3,[3,4],"dagger","lunged with","skewered",modifiers);
}

function makeAxe(modifiers) {
    return new Weapon(4,[4,5],"axe","chopped with","chopped",modifiers);
}

//Weapon modifiers
var modifiers = {rusty:{attack:-1,damage:-1},steel:{attack:2,damage:1}};


//Base weapon code
function Weapon(attack,damage,name,verb,killVerb,modifierNames = []) {
    this.attack = attack;
    this.damage = damage;
    this.name = name;
    this.verb = verb;
    this.killVerb = killVerb;
    this.modifierNames = modifierNames;
    this.modifiers = [];
    for (var i = 0; i < modifierNames.length; i++)
        this.modifiers[i] = modifiers[modifierNames[i]];

    this.getAttribute = function(given) {
        if (!this[given])
            console.log("Error 1: Requested invalid attribute");
        else {
            var result;   
            if (Array.isArray(this[given])) //Prevents the array from being aliased 
                result = [this[given][0],this[given][1]];
            else
                result = this[given];

            for (var i = 0; i < this.modifiers.length; i++) { //For each of the weapon's modifiers
                for (var currProperty in this.modifiers[i]){ //For each of the modifiers properties
                    if(currProperty == given) {
                        if (given == "damage") { //If damage, subtract from max and min
                            result[0] += this.modifiers[i][currProperty];
                            result[1] += this.modifiers[i][currProperty];
                        }
                        else 
                            result += this.modifiers[i][currProperty];
                    }
                }
            }
        }
        return result;
    }
    
    this.getName = function() {
        var displayName = "";
        for (var i = 0; i < modifierNames.length; i++)
            displayName += capitalize(modifierNames[i] + " ");
        displayName += capitalize(this.name);
        return displayName;
    }
}
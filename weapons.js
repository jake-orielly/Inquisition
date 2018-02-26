//Weapon templates
function shortSword(modifiers) {
    return new Weapon(5,[3,5],"short sword","swung with","sliced",modifiers);
}

function morningStar(modifiers) {
    return new Weapon(3,[4,7],"morningstar","swung with","crushed",modifiers);
}

function cleaver(modifiers) {
    return new Weapon(4,[4,5],"cleaver","chopped with","sliced",modifiers);
}

function dagger(modifiers) {
    return new Weapon(3,[3,4],"dagger","lunged with","skewered",modifiers);
}

//Weapon modifiers
var rusty = {attack:-1,damage:-1};

//Base weapon code
function Weapon(attack,damage,name,verb,killVerb,modifiers = []) {
    this.attack = attack;
    this.damage = damage;
    this.name = name;
    this.verb = verb;
    this.killVerb = killVerb;
    this.modifiers = modifiers;

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
}
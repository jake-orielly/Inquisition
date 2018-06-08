var oak_logs = new Item("oak_logs",false,false,3);
var evergreen_logs = new Item("evergreen_logs",false,false,8);

var herb = new Item("herb",false,false,7);
var berry = new Item("berry",true,false,6);
berry.food = {hp:3};
var mushroom = new Item("mushroom",false,false,11);
mushroom.food = {mana:5};
var meat = new Item("meat",false,false,4);
meat.food = {hp:4};
var cooked_meat = new Item("cooked_meat",false,false,7,new Craftable(9,null,[{item:meat,amount:1}]));
cooked_meat.food = {hp:8};
var seasoned_meat = new Item("seasoned_meat",false,false,16,new Craftable(14,cookingAptitude,[{item:meat,amount:1},{item:herb,amount:1}]));
seasoned_meat.food = {hp:14};
var salad = new Item("salad",false,false,26,new Craftable(25,null,[{item:herb,amount:2},{item:berry,amount:1}]));
salad.food = {hp:8,mana:8};
var mushroom_stew = new Item("mushroom_stew",false,false,50,new Craftable(60,cookingAptitude,[{item:cooked_meat,amount:2},{item:mushroom,amount:2}]));
mushroom_stew.food = {hp:20,mana:15};

var foodList = [cooked_meat,seasoned_meat,salad,mushroom_stew];

var copper_ore = new Item("copper_ore",false,false,3);
var copper_bar = new Item("copper_bar",true,false,8,new Craftable(15,null,[{item:copper_ore,amount:2}]));
var iron_ore = new Item("iron_ore",false,false,11);
var iron_bar = new Item("iron_bar",true,false,24,new Craftable(25,smithingAptitude,[{item:iron_ore,amount:2}]));
var coal = new Item("coal",false,false,16);

var copper_dagger = new Item("copper_dagger",false,makeDagger(["copper"]),9,new Craftable(12,null,[{item:copper_bar,amount:1},{item:oak_logs,amount:1}]));
var iron_dagger = new Item("iron_dagger",false,makeDagger(["iron"]),25,new Craftable(30,smithingAptitude,[{item:iron_bar,amount:1},{item:evergreen_logs,amount:1}]));

var copper_short_sword = new Item("copper_short_sword",false,makeShortSword(["copper"]),12,new Craftable(16,null,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_short_sword = new Item("iron_short_sword",false,makeShortSword(["iron"]),40,new Craftable(42,smithingAptitude,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));

var copper_mace = new Item("copper_mace",false,makeMace(["copper"]),14,new Craftable(18,null,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_mace = new Item("iron_mace",false,makeMace(["iron"]),44,new Craftable(48,smithingAptitude,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));

var copper_axe = new Item("copper_axe",false,makeAxe(["copper"]),15,new Craftable(20,null,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_axe = new Item("iron_axe",false,makeAxe(["iron"]),45,new Craftable(50,smithingAptitude,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));
var steel_axe = new Item("steel_axe",false,makeAxe(["steel"]),115);

var copper_pickaxe = new Item("copper_pickaxe",false,makePickaxe(["copper"]),15,new Craftable(20,null,[{item:copper_bar,amount:2},{item:oak_logs,amount:1}]));
var iron_pickaxe = new Item("iron_pickaxe",false,makePickaxe(["iron"]),45,new Craftable(50,smithingAptitude,[{item:iron_bar,amount:2},{item:evergreen_logs,amount:1}]));

var copper_chestplate = new Item("copper_chestplate",false,makeChestplate(["copper"]),75,new Craftable(45, null,[{item:copper_bar,amount:7}]));
var iron_chestplate = new Item("iron_chestplate",false,makeChestplate(["iron"]),190,new Craftable(90,smithingAptitude,[{item:iron_bar,amount:7}]));
var the_iron_fortress = new Item("the_iron_fortress",false, makeChestplate(["iron","the_iron_fortress"]),345);

var copper_platelegs = new Item("copper_platelegs",false,makePlatelegs(["copper"]),45,new Craftable(30,null,[{item:copper_bar,amount:4}]));
var iron_platelegs = new Item("iron_platelegs",false,makePlatelegs(["iron"]),115,new Craftable(75,smithingAptitude,[{item:iron_bar,amount:4}]));

var glass_vial = new Item("glass_vial",false,false,5);
var glass_jar = new Item("glass_jar",false,false,10);

var hp_potion_small = new Item("hp_potion_small",false,false,25,new Craftable(15,null,[{item:berry,amount:2},{item:glass_vial,amount:1}]));
hp_potion_small.potion = {hp:5};
var hp_potion_medium = new Item("hp_potion_medium",false,false,80,new Craftable(35,alchemyAptitude,[{item:berry,amount:3},{item:mushroom,amount:1},{item:glass_jar,amount:1}]));
hp_potion_medium.potion = {hp:10};

var mana_potion_small = new Item("mana_potion_small",false,false,35,new Craftable(23,null,[{item:herb,amount:2},{item:glass_vial,amount:1}]));
mana_potion_small.potion = {mana:5};
var mana_potion_medium = new Item("mana_potion_medium",false,false,95,new Craftable(43,alchemyAptitude,[{item:herb,amount:3},{item:mushroom,amount:1},{item:glass_jar,amount:1}]));
mana_potion_medium.potion = {mana:10};

var elanor_ring = new Item("elanor_ring",false,false,250);
var monster_tusk = new Item("monster_tusk",false,false,400);
monster_tusk.questItem = true;

var gold = new Item("gold",true,false,1);
var flint_box = new Item("flint_box",false,false,5);

var generalStoreInventory = [];
var toolStoreInventory = [];
var armorStoreInventory = [];
var alchemyStoreInventory = [];
var shops = [generalStoreInventory,toolStoreInventory,armorStoreInventory,alchemyStoreInventory];

var shopTemp = [flint_box,meat,oak_logs,evergreen_logs,copper_bar,iron_bar];
fillShop(generalStoreInventory,shopTemp);
shopTemp = [copper_axe,iron_axe,copper_pickaxe,iron_pickaxe,copper_dagger,iron_dagger,copper_short_sword,iron_short_sword,copper_mace,iron_mace];
fillShop(toolStoreInventory,shopTemp);
shopTemp = [copper_chestplate,iron_chestplate,copper_platelegs,iron_platelegs];
fillShop(armorStoreInventory,shopTemp);
shopTemp = [hp_potion_small,hp_potion_medium,mana_potion_small,mana_potion_medium,glass_vial,glass_jar,herb,mushroom,berry];
fillShop(alchemyStoreInventory,shopTemp);

function fillShop(shop,list) {
	for (var i = 0; i < list.length; i++) {
	    shop.push(new InventoryItem(list[i],1));
	}
}

function Item(name,stackable,equipment,value,craftable) {
    this.name = name;
    this.stackable = stackable;
    this.value = value;
    this.craftable = craftable;
    this.equipment = equipment;
    
    this.getName = function() {
        var result = name;
        result = capitalize(result);
        for (var i = 0; i < result.length; i++)
            if (result.charAt(i) == "_")
                result = result.substr(0,i) + " " + capitalize(result.substr(i+1));
        return result;
    }
}

function InventoryItem(item,amount) {
    this.item = item;
    this.amount = amount;
}

function Craftable(xp,requiredPerk,recipe) {
	this.xp = xp;
	this.requiredPerk = requiredPerk;
	this.recipe = recipe;
}

var smeltList = [copper_bar,iron_bar];
var smithList = [copper_axe, copper_pickaxe, copper_dagger, copper_short_sword, copper_mace, copper_chestplate, copper_platelegs,iron_axe,iron_pickaxe, iron_dagger, iron_short_sword, iron_mace, iron_chestplate,iron_platelegs];
var potionList = [hp_potion_small,hp_potion_medium,mana_potion_small,mana_potion_medium];
var craftListMaster = {cook:foodList,smith:smithList,smelt:smeltList,alchemy:potionList};
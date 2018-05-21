
var general_shopkeeper = {portrait:"art/general_shopkeeper_head.png",shop:generalStoreInventory,line:"It's dangerous out there. Better stock up on supplies."};

var tool_shopkeeper = {portrait:"art/tool_shopkeeper_head.png",shop:toolStoreInventory,line:"That Nova sure is adorable."};

var armor_shopkeeper = {portrait:"art/armor_shopkeeper_head.png",shop:armorStoreInventory,line:"Sturdy armor. Good craftsmanship."};

var alchemy_shopkeeper = {portrait:"art/alchemy_shopkeeper_head.png",shop:alchemyStoreInventory,line:"Potions for whatever ails you!"};

var questGiver = {portrait:"art/questGiver_head.png",line:"It's no secret that the southern woods are dangerous. Been that way for years. But lately things have gotten out of hand. They say a cursed beast lives in a cave deep in the south. There's a hearty reward for anyone who brings back its head. Are you interested?",responses:["yes","no"],yes:{line:"Good. Let me know when you've slain the beast. BTW what's your favorite color?"},no:"Well then you're no use to me."};
questGiver.yes.responses = ["green","blue"];
questGiver.yes.blue = {line:"Light blue or dark blue?",responses:["light","dark"]};
questGiver.yes.blue.light = {line:"Ah. Dainty."};
questGiver.yes.blue.dark = {line:"Ocean or teal?", responses:["ocean","teal"]};
questGiver.yes.blue.dark.ocean = {line:"Ah yes. Dark ocean blue. A commendable choice."};
questGiver.yes.blue.dark.teal = {line:"Meh. Not my liking. But I'll give you another chance, what's your favorite color?",backtrack:"yes"};
questGiver.yes.green = {line:"Light green or forest green?",responses:["light","forest"],light:"Well there's no accounting for taste I guess.",forest:"Ah, forest green, a noble color."};

var shopKeepers = [general_shopkeeper,tool_shopkeeper,armor_shopkeeper,alchemy_shopkeeper];
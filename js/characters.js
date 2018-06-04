
var general_shopkeeper = {portrait:"art/general_shopkeeper_head.png",shop:generalStoreInventory,line:"It's dangerous out there. Better stock up on supplies."};

var tool_shopkeeper = {portrait:"art/tool_shopkeeper_head.png",shop:toolStoreInventory,line:"That Nova sure is adorable."};

var armor_shopkeeper = {portrait:"art/armor_shopkeeper_head.png",shop:armorStoreInventory,line:"Sturdy armor. Good craftsmanship."};

var alchemy_shopkeeper = {portrait:"art/alchemy_shopkeeper_head.png",shop:alchemyStoreInventory,line:"Potions for whatever ails you."};

var questGiver = {portrait:"art/questGiver_head.png",line:"It's no secret that the southern woods are dangerous. Been that way for years. But lately things have gotten out of hand. They say a cursed beast lives in a cave deep in the south. There's a hearty reward for anyone who slays it. Are you interested?",responses:{yes:"yes",no:"no"},yes:{line:"Good. Let me know when you've slain the beast. Any questions before you go?"},no:"Well then you're no use to me."};
questGiver.yes.func = function(){
    quests.southernBeast.phase = 1;
    updateQuestGiverLines();
}
questGiver.yes.responses = {when:"When did the beast arrive?",seen:"Has anyone seen what it looks like?"};
questGiver.yes.when = {line:"Some months ago, not long after the blood moon.",responses:{ok:"It matters not. I will slay the beast.",moon:"The blood moon?"}};
questGiver.yes.when.ok = {line:"Good luck to you, and godspeed."};
questGiver.yes.when.moon = {line:"Yes. It is normally a festival of celebration for us. It's a reminder of the end of the great mage war. But this year something was different.", responses:{different:"How was it different?",beast:"And you think the beast is connected?"}};
questGiver.yes.when.moon.different = {line:"The festival was haunted by a dark energy. We all felt it. The whole town was on edge. Then not long after people started disapearing in the southern forest. The surrounding lands became more dangerous. The trade caravans came less and less often. Anything else you need to know before you go?",backtrack:"yes"};
questGiver.yes.when.moon.beast = {line:"I do not know. but the timing is too coincidental. Anything else you need to know before you go?",backtrack:"yes"};
questGiver.yes.seen = {line:"None that lived to tell the tale. Elanor went to slay the beast, but that was some time ago. I fear she may never return.",responses:{sad:"My condolences.",curious:"Who was Elanor?"},sad:"What's done is done. All that's left now is to slay the creature.",curious:"She was the aclhemist's wife. She hunted in the woods and would gather reagants for her wife's trade. Truly a brave soul. Cut down in her prime by the wicked beast."};

function updateQuestGiverLines() {
    questGiver.line = "Have you slain the beast yet?"
    questGiver.responses = {slain:"Yes. The beast is slain.",notYet:"Not Yet"};
    questGiver.notYet = "Come back when you've slain the beast.";
    questGiver.slain = {line:"This is great news! Let me see your trophy!"}
    questGiver.slain.responses = {joke:"Actually, I have not slain the beast yet."}
    questGiver.slain.joke = "This is no time for humor. Get on with the task.";
}

var shopKeepers = [general_shopkeeper,tool_shopkeeper,armor_shopkeeper,alchemy_shopkeeper];
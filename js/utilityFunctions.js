function capitalize(given) {
    return given.charAt(0).toUpperCase() + given.slice(1);
}

function dropdownToggle(given) {
    $('.dropdown-content').hide();
    given.parent().find("div").toggle();
    //$("#perkDropdown").toggle();
}

function getDamage(x,y) {
    return parseInt(Math.random()*(y-(x-1))+x);
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if ($(".inventoryMouseOver").is(":visible"))
        $(".inventoryMouseOver").hide();
    if (!event.target.matches('.dropbtn')) {
        $('.dropdown-content').hide();
    }
}
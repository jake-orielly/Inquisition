function capitalize(given) {
    return given.charAt(0).toUpperCase() + given.slice(1);
}

function dropdownToggle(given) {
    $('.dropdown-content').hide();
    given.parent().find("div").toggle();
    //$("#perkDropdown").toggle();
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
	$('.dropdown-content').hide();
  }
}
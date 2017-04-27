/*
Kim Abraham (kim.abraham@gmail.com) for CoderDojo Dilbeek. No copies without permission.
*/

//set inactive time that causes going back to menu here
var INACTIVITY_TIMEOUT = 60000; //1 minute (prod)
//var INACTIVITY_TIMEOUT = 5000; //5 seconds (debug)

var MENUITEMS_SHOWN = 7; //uneven number for best results

//keeps track of the menu item that is active
var selectedMenuItem = Math.round(MENUITEMS_SHOWN/2);

/*
function that renders the menu by injecting "menu item" divs
needs gamelist.js to be loaded in the page too.
*/
function renderMenu () {
  
  var menuList = [];

  while (menuList.length < MENUITEMS_SHOWN+2) {
    for (var j=0; j<gameList.length; j++) {
      menuList.push(gameList[j]);
    }
  }

  gameList = menuList;
  
  for (var j=0; j<gameList.length; j++) {

    var titleTag = document.createElement('h1');
    titleTag.appendChild(document.createTextNode(gameList[j].name));

    var linkTag = document.createElement('a');
    linkTag.setAttribute('href', gameList[j].file);
    linkTag.setAttribute('onClick', "loadGame('" + gameList[j].file +"')");
    linkTag.appendChild(titleTag);

    var menuItemTag = document.createElement('div');
    
    var descriptionTag= document.createElement('p');
    descriptionTag.appendChild(document.createTextNode(gameList[j].description));
    descriptionTag.setAttribute('class', 'description');
    if (gameList[j].numberOfPlayers > 1) {
      descriptionTag.appendChild(document.createTextNode(' (' + gameList[j].numberOfPlayers + ' spelers nodig)' ));
    };

    var authorTag = document.createElement('p');
    authorTag.appendChild(document.createTextNode('auteur: ' + gameList[j].author));
    authorTag.setAttribute('class', 'author');

    linkTag.appendChild(descriptionTag);
    linkTag.appendChild(authorTag);

    menuItemTag.appendChild(linkTag);
    
    var menuDiv = document.getElementById('menu');
    menuDiv.appendChild(menuItemTag);
  }

  $("#menu").children().addClass('menuItem');
  $("#menu").children(".menuItem:eq("+ selectedMenuItem + ")").addClass('selected');
  $("#menu").children(".menuItem:lt("+ selectedMenuItem + ")").addClass('previous');
  $("#menu").children(".menuItem:gt("+ selectedMenuItem + ")").addClass('next');
  $("#menu").children(".menuItem:first").removeClass("previous").addClass("hidden");
  $("#menu").children(".menuItem:gt(" + MENUITEMS_SHOWN + ")").removeClass("next").addClass("hidden");
  updateGradients();
};


/*
function that loads the flash game and hides the menu
*/
function loadGame(gameFileName) {
  //hide the menu
  var menuDiv = document.getElementById('menu');
  menu.style.display="none";

  //show the game in the flash container
  var objectTag = document.createElement('object');
	objectTag.id = 'flash';
	objectTag.data = gameFileName;
  //calculate flash container size, depending on viewport dimensions
  var maxWidth = window.innerWidth - 40;
  var maxHeight = window.innerHeight - 40;
  if ((maxWidth / maxHeight) > (960 / 720)) {
    //height will be leading factor
    objectTag.width = Math.round(960 * (maxHeight/720)); //960 * 720 is standard size. Adjust width to preserve proportions.
    objectTag.height = maxHeight;
  } else {
    //width will be leading factor    
    objectTag.width = maxWidth; 
    objectTag.height = Math.round(720 * (maxWidth/960)); //960 * 720 is standard size. Adjust height to preserve proportions.
  }
  objectTag.setAttribute('class','flashGame');
	var flashContainer = document.getElementById('flashGameContainer');
  flashContainer.replaceChild(objectTag, flashContainer.childNodes[0]);
	setTimeout(setFocusOnFlash, 1); //slight delay needed to set focus
}

/*
ensure that keyboard inputs are sent to the flash game
*/
function setFocusOnFlash() {    
    var flash = document.getElementById("flash");
    flash.tabIndex = 1234;  
    flash.focus();
}

/*
function that unloads the flash game (destroys the object tag in the DOM) and shows the menu
*/
function unloadGame() {
  //empty the flash container
  var objectTag = document.createElement('object');
  objectTag.id = 'flash';
  objectTag.width = 0;
  objectTag.height = 0;
  var flashContainer = document.getElementById('flashGameContainer');
  flashContainer.replaceChild(objectTag, flashContainer.childNodes[0]);
  
  //show the menu
  menu.style.display="block";
}

/*
function that detects inactivity and shows the menu after INACTIVITY_TIMEOUT
*/
function inactivityDetector() {
  if (activityDetected) {
    detectActivity(false); //reset activity detector
  } else {
    if (!isMenuShown()) {
      unloadGame();
    } else {
      if ($("#menu").css('opacity') != 0) {
        console.log("say bye to that menu!! " + $.now());
        $("#menu").animate({opacity: 0}, 2000, function() {});
      }
    }
  }
  setTimeout(inactivityDetector, INACTIVITY_TIMEOUT); //call the inactivity detector again after INACTIVITY_TIMEOUT seconds
}

//variable used to store information about the 
var activityDetected;

/*
simple setter method for the activityDetected boolean
*/
function detectActivity (activity) {
  activityDetected = activity;
  if (isMenuShown() && activity) {
    $("#menu").animate({opacity: 0.9}, 400, function() {});
  }
}

/*
function to detect whether the menu is shown or the game is shown
*/
function isMenuShown () {
  var menuDiv = document.getElementById('menu');
  return (menu.style.display != "none");
}

/*
function needed for the menu to work. makes sure the menu reacts to buttons being pressed
*/
function reactToKeyPress(evt) {
  detectActivity(true); //activity is detected
  if (isMenuShown()) { //only manipulate the menu when the menu is shown
    if ((evt.keyCode == 83)||(evt.keyCode == 39)) {
    	selectPreviousMenuItem (); //red buttons: S or RIGHTARROW
    } 
    else if ((evt.keyCode == 68)||(evt.keyCode == 38)) {
    	activateSelectedGame(); //yellow buttons: D or UPARROW
    } 
    else if ((evt.keyCode == 70)||(evt.keyCode == 37)) {
    	selectNextMenuItem (); //green buttons: F or LEFTARROW
    }    
  } else if (evt.keyCode == 65) {
    unloadGame(); //reset button. To be mapped to the "A" on the makey makey.
  }
}

/*
selects the next menu item and updates all styles accordingly & modifies the dom-tree (first menuItem teleported to last position)
*/
function selectNextMenuItem () {
    console.log("select next");
    $(".selected").removeClass("selected").addClass("previous");
    $(".next:first").removeClass("next").addClass("selected"); 
    $(".previous:first").removeClass("previous").addClass("hidden");
    $(".next:last").next().removeClass("hidden").addClass("next"); //the first of the hidden after all the nexts becomes a next itself
    $(".hidden:first").insertAfter($(".menuItem:last"));
    updateGradients ();
}

/*
selects the previous menu item and updates all styles accordingly & modifies the dom-tree (last menuItem teleported to first position)
*/
function selectPreviousMenuItem () {
    console.log("select previous");
    $(".selected").removeClass("selected").addClass("next");
    $(".previous:last").removeClass("previous").addClass("selected");
    $(".next:last").removeClass("next").addClass("hidden");
    $(".hidden:first").removeClass("hidden").addClass("previous");
    $(".hidden:last").insertBefore($(".menuItem:first"));
    updateGradients ();
}

/*
makes sure the first of the green and the last of the red menu items get a nifty little gradient
*/
function updateGradients () {
  $(".menuItem").removeClass("gradient");
  $(".previous:first").addClass("gradient");
  $(".next:last").addClass("gradient");
}

/*
used to trigger starting a game based on the menu
*/
function activateSelectedGame() {
    //start the game    
    console.log("Activating game: " + $(".selected").children('a:first').attr("href")); //fetch the game filename from the selected href
    console.log("Activating game: " + $(".selected").children('a:first').children('h1:first').html()); //fetch the game name 

    loadGame($(".selected").children('a:first').attr("href"));
}

/*
executed after the page loads
*/
$(function() {
  //start the detector
  detectActivity(false);
  inactivityDetector();

  //event listener injected for the above function
  document.onkeydown = function(key){ reactToKeyPress(key); } 

  //call this on bottom of page (rendermenu needs DOM-elements "menu" and "flashGameContainer")
  renderMenu();
});


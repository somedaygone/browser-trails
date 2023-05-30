// Popup window for Browser Trails.

// CLOSE buttons in all divs
const closeButtons = document.getElementsByClassName("close");
for (let i = 0; i < closeButtons.length; i++) {
  closeButtons[i].addEventListener("click", function() {
    window.close();
  });
}

// START button on trailHead div
const trailNameForm = document.getElementById("trailNameForm");
trailNameForm.addEventListener("submit", function (event) {
  event.preventDefault();
  // Set icon in color to show extension is active
  chrome.action.setIcon({path: 'icons/icon16.png'});
  // Save trail name and description from the form
  const trailNameInput = document.getElementById("trailNameInput").value;
  //const trailDescriptionInput = document.getElementById("trailDescriptionInput").value;
  chrome.storage.local.get(null, (results => {
      // Use name if provided, otherwise default to "My Trail"
      if (trailNameInput !== "") {
        results.trailName = trailNameInput;
      } else { results.trailName = "My Trail"; }
      //results.trailDescription = trailDescriptionInput;
      chrome.storage.local.set(results);
  }));
  window.close();
});

// STOP button on trail div
const stopButton = document.getElementById("stop");
stopButton.addEventListener("click", function () {
  //TODO: ARE YOU SURE?!!!
  //Temp code to clear the trail
  chrome.storage.local.get(null, (results => {
    results = {
      trailName: "",
      trailDescription: "",
      trail: []
    };
    chrome.storage.local.set(results);
  }));
  // Set icon color to black to show not active
  chrome.action.setIcon({path: 'icons/disabled16.png'});
  window.close();
});

// Helper function to convert a timestamp to a string in the format "M/D/YY, HH:MM PM"
function timeStampToText(timestamp) {
  var date = new Date(timestamp);
  var formattedTime = date.toLocaleString('en-US', {month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true});
  return formattedTime;
}

// For links to work in a popup, we need to add an event listener 
// Opens the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of trail items, build a table of the items in the popup window.
function addElements(element, array) {
  // Remove the "No data collected yet..." row from popup.html
  element.children[1].remove(); // [1] skips the table header

  // Add a table row for each entry in the trail array
  for (let i=0; i < array.length; i++) {
    // Create table row
    const tableRow = document.createElement("tr");

    // Create timestamp cell
    const timeStampCell = document.createElement("td");
    timeStampCell.textContent = timeStampToText(array[i].timeStamp);
    timeStampCell.classList.add("no-wrap");
    tableRow.appendChild(timeStampCell);

    // Create image cell
    const imageCell = document.createElement("td");
    const image = document.createElement("img");
    image.src = array[i].faviconUrl;
    image.alt = "favicon";
    imageCell.appendChild(image);
    tableRow.appendChild(imageCell);

    // Create link cell. The title of the page is the text of the link.
    const linkCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = array[i].url;
    link.textContent = array[i].title;
    link.addEventListener('click', onAnchorClick); // Links don't work in a popup without this
    linkCell.appendChild(link);
    tableRow.appendChild(linkCell);

    // Add the table row to the table
    element.appendChild(tableRow);    
  }
}

// Main code: Get the saved trail and render the data in the popup window.
chrome.storage.local.get(null, (results => {
  // If the trail name is blank, get the trail name.
  if (results.trailName === "") {
    // hide all divs
    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
      divs[i].style.display = "none";
    }
    // show trailHead
    var myDiv = document.getElementById("trailHead");
    myDiv.style.display = "block";
    return; // this shows the form and exits. Next code to run will be the START button.
  }

  /**********************************************************
   * If here, we have a trail name. Build the trail screen.
   * This code rebuilds the page every time.
   * It isn't starting from the last run. 
   * It starts over from the popup.html file. 
   **********************************************************/
  // Set the trail name in the popup window.
  const trailNameElement = document.getElementById("trailName");
  trailNameElement.textContent = results.trailName;
  trailNameElement.title = results.trailDescription; //The description shows up in the hover text

  // Loop through the trail array and render the data in the popup window.
  let trailElement = document.getElementById("trails");
  addElements(trailElement, results.trail);

}));

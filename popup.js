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

// NOTE button on trail div
const noteButton = document.getElementById("note");
noteButton.addEventListener("click", function () {
  // hide trail div
  var myDiv = document.getElementById("trail");
  myDiv.style.display = "none";

  // show trailNote div
  var myDiv = document.getElementById("trailNote");
  myDiv.style.display = "block";
});

// ADD button on trailNote div
const addButton = document.getElementById("add");
addButton.addEventListener("click", function () {
  // Get the note from the form
  const trailNote = document.getElementById("trailNoteInput").value;
  // Add the note to the trail
  chrome.storage.local.get(null, (results => {
    // Define a trail entry object
    var trailEntry = {
      url: "", // url of the page
      title: trailNote, // note text
      timeStamp: Date.now(), // timestamp of when the note was added
      faviconUrl: "icons/icon16.png" // Browser Trails favicon
    };
    results.trail.push(trailEntry); // add the note to the trail

    // Save the updated trail to local browser storage
    chrome.storage.local.set(results);
  }));

  // hide trailNote div
  var myDiv = document.getElementById("trailNote");
  myDiv.style.display = "none";

  // show trail div
  var myDiv = document.getElementById("trail");
  myDiv.style.display = "block";
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

    // Create delete button cell
    const deleteButtonCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", function () {
      const row = this.parentNode.parentNode; // Get the row that contains the delete button
      const rowIndex = row.rowIndex; // Get the index of the row in the table
      // Remove the trail entry from the array
      array.splice(rowIndex - 1, 1); // Remove the row from the array
      // Save the updated trail to local browser storage
      chrome.storage.local.get(null, (results => {
        results.trail = array;
        chrome.storage.local.set(results);
      }));
      // Remove the table row from the popup
      row.remove();
    });
    deleteButtonCell.appendChild(deleteButton);
    tableRow.appendChild(deleteButtonCell);

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
    if (array[i].url === "") {
      // Add plain text if it's a note
      const textNode = document.createTextNode(array[i].title);
      linkCell.appendChild(textNode);
      tableRow.appendChild(linkCell);
    } else {
      // Add a link if it's a page
      const link = document.createElement("a");
      link.href = array[i].url;
      link.textContent = array[i].title;
      link.addEventListener('click', onAnchorClick); // Links don't work in a popup without this
      linkCell.appendChild(link);
      tableRow.appendChild(linkCell);
    }

    // Add the table row to the table
    element.appendChild(tableRow);
  }
}

// Main code: Get the saved trail and render the data in the popup window.
chrome.storage.local.get(null, (results => {
  // If the trail name is blank, get the trail name.
  if (results.trailName === "") {
    // hide trail div
    var myDiv = document.getElementById("trail");
    myDiv.style.display = "none";

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

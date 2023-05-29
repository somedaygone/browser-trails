// Get the saved trail and render the data in the popup window.

// Helper function to convert a timestamp to a string in the format "M/D/YY, HH:MM PM"
function timeStampToText(timestamp) {
  var date = new Date(timestamp);
  var formattedTime = date.toLocaleString('en-US', {month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true});
  return formattedTime;
}

// Helper function to show a div and hide all other divs
function showDiv(myDiv) {
  // hide all divs
  var divs = document.getElementsByTagName("div");
  for (var i = 0; i < divs.length; i++) {
    divs[i].style.display = "none";
  }
  // show myDiv
  var myDiv = document.getElementById(myDiv);
  myDiv.style.display = "block";
  return;
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

// // Given an array of trail items, build a list of the items in the popup window.
// function addElements(element, array) {
//   // Remove all child elements from the list
//   while(element.firstChild) {
//     element.removeChild(element.firstChild);
//   }

//   // Add a list item for each entry in the trail array
//   for (let i=0; i < array.length; i++) {
//     // Create list item with time stamp
//     const listItem = document.createElement("li");
//     listItem.textContent = timeStampToText(array[i].timeStamp);
//     element.appendChild(listItem);

//     // Create image element
//     const image = document.createElement("img");
//     image.src = array[i].faviconUrl;
//     image.alt = "favicon";
//     element.appendChild(image);

//     // Create link element
//     const link = document.createElement("a");
//     link.href = array[i].url;
//     link.textContent = array[i].title;
//     link.addEventListener('click', onAnchorClick); // Links don't work in a popup without this
//     element.appendChild(link);    
//   }

// }
// Given an array of trail items, build a table of the items in the popup window.
function addElements(element, array) {
  // Remove all child elements from the table
  // while(element.firstChild) {
  //   element.removeChild(element.firstChild);
  // }
  while(element.children[1]) {
    element.children[1].remove();
  }

  // Add a table row for each entry in the trail array
  for (let i=0; i < array.length; i++) {
    // Create table row with time stamp
    const tableRow = document.createElement("tr");

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

    // Create link cell
    const linkCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = array[i].url;
    link.textContent = array[i].title;
    link.addEventListener('click', onAnchorClick); // Links don't work in a popup without this
    linkCell.appendChild(link);
    tableRow.appendChild(linkCell);

    element.appendChild(tableRow);    
  }
}

// Code for close buttons in all divs
const closeButtons = document.getElementsByClassName("close");
for (let i = 0; i < closeButtons.length; i++) {
  closeButtons[i].addEventListener("click", function() {
    window.close();
  });
}

// Code for buttons on trailHead div
const trailNameForm = document.getElementById("trailNameForm");
trailNameForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const trailNameInput = document.getElementById("trailNameInput").value;
  //const trailDescriptionInput = document.getElementById("trailDescriptionInput").value;
  chrome.storage.local.get(null, (results => {
      if (trailNameInput !== "") {
        results.trailName = trailNameInput;
      } else { results.trailName = "My Trail"; }
      //results.trailDescription = trailDescriptionInput;
      chrome.storage.local.set(results);
  }));
  window.close();
});

// Code for buttons on trail div
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
  window.close();
});

// main code: Get the saved trail and render the data in the popup window.
chrome.storage.local.get(null, (results => {
  // If the trail name is blank, get the trail name.
  if (results.trailName === "") {
    //showDiv("trailHead");
    // hide all divs
    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
      divs[i].style.display = "none";
    }
    // show trailHead
    var myDiv = document.getElementById("trailHead");
    myDiv.style.display = "block";
    return;
  }

  // Set the trail name in the popup window.
  const trailNameElement = document.getElementById("trailName");
  trailNameElement.textContent = results.trailName;
  trailNameElement.title = results.trailDescription;

  // Loop through the trail array and render the data in the popup window.
  let trailElement = document.getElementById("trails");
  addElements(trailElement, results.trail);

}));

// Load existing trail from local storage
chrome.storage.local.get(null, (results => {
  // Initialize the trail if not yet initialized.
  if (!results.trail) {
    // Set icon color to black
    chrome.action.setIcon({path: 'icons/disabled16.png'});
    // Initialize storage where we will store the trail info
    results = {
      trailName: "",
      trailDescription: "",
      trail: [] // array of trail entries. See trailEntry object below.
    };  
  }

  // This listener will track when a new page is loaded in the browser
  // and add it to the trail. It only works "onCompleted" so it will not
  // add the page to the trail until the page is fully loaded.
  chrome.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }

    // Build the URL to get the favicon for the site
    // Example: chrome-extension://EXTENSION_ID/_favicon/?pageUrl=https%3A%2F%2Fwww.google.com&size=16
    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/')); // This gets the chrome-extension://EXTENSION_ID/_favicon/ part
    faviconUrl.searchParams.set('pageUrl', evt.url); // this adds ?pageUrl=https%3A%2F%2Fwww.google.com
    faviconUrl.searchParams.set('size', '16'); // this adds &size=16

    // Get the page title for the url and save the trail entry
    chrome.tabs.get(evt.tabId, function(tab) {
      // Define a trail entry object
      var trailEntry = {
        url: evt.url, // url of the page
        title: tab.title, // title of the page
        timeStamp: evt.timeStamp, // timestamp of when the page was loaded
        faviconUrl: faviconUrl.toString() // url of the favicon for the page
      };
      results.trail.push(trailEntry); // add the trail entry to the trail

      // Save the updated trail to local browser storage
      chrome.storage.local.set(results);
    });

  }, {
    url: [{schemes: ["http", "https"]}]});
}));
// Load existing trail from local storage
chrome.storage.local.get(null, (results => {
  // Initialize the trail if not yet initialized.
  if (!results.trail) {
    console.log("Initializing trail");
    results = {
      trailName: "",
      trailDescription: "",
      trail: []
    };  
  }

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

    // Get the page title for the url
    chrome.tabs.get(evt.tabId, function(tab) {
      // Define a trail entry object
      var trailEntry = {
        url: evt.url,
        title: tab.title,
        timeStamp: evt.timeStamp,
        faviconUrl: faviconUrl.toString()
      };
      results.trail.push(trailEntry);

      // Save the updated trail
      chrome.storage.local.set(results);
    });

  }, {
    url: [{schemes: ["http", "https"]}]});
}));
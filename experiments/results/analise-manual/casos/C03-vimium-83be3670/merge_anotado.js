/*
 * This implements link hinting. Typing "F" will enter link-hinting mode, where all clickable items on
 * the page have a hint marker displayed containing a sequence of letters. Typing those letters will select
 * a link.
 *
 * The characters we use to show link hints are a user-configurable option. By default they're the home row.
 * The CSS which is used on the link hints is also a configurable option.
 */

var linkHintsPrototype = {                                                                            // [L]
  hintMarkers: [],                                                                                    // [L]
  hintMarkerContainingDiv: null,                                                                      // [L]
  // The characters that were typed in while in "link hints" mode.
  hintKeystrokeQueue: [],                                                                             // [L]
  linkHintsModeActivated: false,                                                                      // [L]
  shouldOpenLinkHintInNewTab: false,                                                                  // [L]
  shouldOpenLinkHintWithQueue: false,                                                                 // [L]
  // Whether link hint's "open in current/new tab" setting is currently toggled 
  openLinkModeToggle: false,                                                                          // [L]
  // Whether we have added to the page the CSS needed to display link hints.
  linkHintsCssAdded: false,                                                                           // [L]
                                                                                                      // [L]
  init: function() {                                                                                  // [L]
    this.onKeyDownInLinkHintsMode = this.onKeyDownInLinkHintsMode.bind(this);                         // [L]
    this.onKeyUpInLinkHintsMode = this.onKeyUpInLinkHintsMode.bind(this);                             // [L]
  },                                                                                                  // [L]

  /* 
   * Generate an XPath describing what a clickable element is.
   * The final expression will be something like "//button | //xhtml:button | ..."
   */
  clickableElementsXPath: (function() {                                                               // [L]
    var clickableElements = ["a", "textarea", "button", "select", "input[not(@type='hidden')]",       // [R]  ◀ #1 DF: produz (R) → L 36  ◀ #2 DF: produz (R) → L 37
                             "*[@onclick or @tabindex or @role='link' or @role='button']"];           // [R]
    var xpath = [];
    for (var i in clickableElements)                                                                  // ◀ #1 DF: consome (L) (herdou L pela chamada na linha 32) ← R 33
      xpath.push("//" + clickableElements[i], "//xhtml:" + clickableElements[i]);                     // ◀ #2 DF: consome (L) (herdou L pela chamada na linha 32) ← R 33
    return xpath.join(" | ")
  })(),                                                                                               // [L]

  // We need this as a top-level function because our command system doesn't yet support arguments.
  activateLinkHintsModeToOpenInNewTab: function() { this.activateLinkHintsMode(true, false); },       // [L]

  activateLinkHintsModeWithQueue: function() { this.activateLinkHintsMode(true, true); },             // [L]

  activateLinkHintsMode: function (openInNewTab, withQueue) {                                         // [L]
    if (!this.linkHintsCssAdded)                                                                      // [L]
      addCssToPage(linkHintCss); // linkHintCss is declared by vimiumFrontend.js
    this.linkHintCssAdded = true;                                                                     // [L]
    this.linkHintsModeActivated = true;                                                               // [L]
    this.setOpenLinkMode(openInNewTab, withQueue);                                                    // [L]
    this.buildLinkHints();                                                                            // [L]
    document.addEventListener("keydown", this.onKeyDownInLinkHintsMode, true);                        // [L]
    document.addEventListener("keyup", this.onKeyUpInLinkHintsMode, true);                            // [L]
  },                                                                                                  // [L]

  setOpenLinkMode: function(openInNewTab, withQueue) {                                                // [L]
    this.shouldOpenLinkHintInNewTab = openInNewTab;                                                   // [L]
    this.shouldOpenLinkHintWithQueue = withQueue;                                                     // [L]
    if (this.shouldOpenLinkHintWithQueue) {                                                           // [L]
      HUD.show("Open multiple links in a new tab");
    } else {
      if (this.shouldOpenLinkHintInNewTab)                                                            // [L]
        HUD.show("Open link in new tab");
      else
        HUD.show("Open link in current tab");
    }
  },                                                                                                  // [L]

  /*
   * Builds and displays link hints for every visible clickable item on the page.
   */
  buildLinkHints: function() {                                                                        // [L]
    var visibleElements = this.getVisibleClickableElements();                                         // [L]

    // Initialize the number used to generate the character hints to be as many digits as we need to
    // highlight all the links on the page; we don't want some link hints to have more chars than others.
    var linkHintNumber = 0;
    this.initHintStringGenerator(visibleElements);                                                    // [L]
    for (var i = 0; i < visibleElements.length; i++) {
      this.hintMarkers.push(this.createMarkerFor(                                                     // [L]
            visibleElements[i], linkHintNumber, this.hintStringGenerator.bind(this)));                // [L]
      linkHintNumber++;
    }
    // Note(philc): Append these markers as top level children instead of as child nodes to the link itself,
    // because some clickable elements cannot contain children, e.g. submit buttons. This has the caveat
    // that if you scroll the page and the link has position=fixed, the marker will not stay fixed.
    // Also note that adding these nodes to document.body all at once is significantly faster than one-by-one.
    this.hintMarkerContainingDiv = document.createElement("div");                                     // [L]
    this.hintMarkerContainingDiv.className = "internalVimiumHintMarker";                              // [L]
    for (var i = 0; i < this.hintMarkers.length; i++)                                                 // [L]
      this.hintMarkerContainingDiv.appendChild(this.hintMarkers[i]);                                  // [L]
    document.documentElement.appendChild(this.hintMarkerContainingDiv);
  },                                                                                                  // [L]

  hintStringGenerator: function() {},                                                                 // [L]
                                                                                                      // [L]
  initHintStringGenerator: function(visibleElements) {},                                              // [L]

  /*
   * Returns all clickable elements that are not hidden and are in the current viewport.
   * We prune invisible elements partly for performance reasons, but moreso it's to decrease the number
   * of digits needed to enumerate all of the links on screen.
   */
  getVisibleClickableElements: function() {                                                           // [L]
    var resultSet = document.evaluate(this.clickableElementsXPath, document.body,                     // [L]
      function (namespace) {
        return namespace == "xhtml" ? "http://www.w3.org/1999/xhtml" : null;
      },
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);


    var visibleElements = [];

    // Find all visible clickable elements.
    for (var i = 0; i < resultSet.snapshotLength; i++) {
      var element = resultSet.snapshotItem(i);
      var clientRect = element.getClientRects()[0];

      if (this.isVisible(element, clientRect))                                                        // [L]
        visibleElements.push({element: element, rect: clientRect});

      // If the link has zero dimensions, it may be wrapping visible
      // but floated elements. Check for this.
      if (clientRect && (clientRect.width == 0 || clientRect.height == 0)) {
        for (var j = 0; j < element.children.length; j++) {
          if (window.getComputedStyle(element.children[j], null).getPropertyValue('float') != 'none') {
            var childClientRect = element.children[j].getClientRects()[0];
            if (this.isVisible(element.children[j], childClientRect)) {                               // [L]
              visibleElements.push({element: element.children[j], rect: childClientRect});
              break;
            }
          }
        }
      }
    }
    return visibleElements;
  },                                                                                                  // [L]

  /*
   * Returns true if element is visible.
   */
  isVisible: function(element, clientRect) {                                                          // [L]
    // Exclude links which have just a few pixels on screen, because the link hints won't show for them anyway.
    var zoomFactor = currentZoomLevel / 100.0;
    if (!clientRect || clientRect.top < 0 || clientRect.top * zoomFactor >= window.innerHeight - 4 ||
        clientRect.left < 0 || clientRect.left * zoomFactor >= window.innerWidth - 4)
      return false;

    if (clientRect.width < 3 || clientRect.height < 3)
      return false;

    // eliminate invisible elements (see test_harnesses/visibility_test.html)
    var computedStyle = window.getComputedStyle(element, null);
    if (computedStyle.getPropertyValue('visibility') != 'visible' ||
        computedStyle.getPropertyValue('display') == 'none')
      return false;

    return true;
  },                                                                                                  // [L]

  /*                                                                                                  // [L]
   * Handles shift and esc keys. The other keys are passed to normalKeyDownHandler.                   // [L]
   */                                                                                                 // [L]
  onKeyDownInLinkHintsMode: function(event) {                                                         // [L]
    console.log("Key Down");
    if (event.keyCode == keyCodes.shiftKey && !this.openLinkModeToggle) {                             // [L]
      // Toggle whether to open link in a new or current tab.
      this.setOpenLinkMode(!this.shouldOpenLinkHintInNewTab, this.shouldOpenLinkHintWithQueue);       // [L]
      this.openLinkModeToggle = true;                                                                 // [L]
    }

    // TODO(philc): Ignore keys that have modifiers.
    if (isEscape(event)) {
      this.deactivateLinkHintsMode();                                                                 // [L]
    } else {
      this.normalKeyDownHandler(event);                                                               // [L]
    }

    event.stopPropagation();
    event.preventDefault();
  },                                                                                                  // [L]

  normalKeyDownHandler: function(event) {},                                                           // [L]
                                                                                                      // [L]
  onKeyUpInLinkHintsMode: function(event) {                                                           // [L]
    if (event.keyCode == keyCodes.shiftKey && this.openLinkModeToggle) {                              // [L]
      // Revert toggle on whether to open link in new or current tab. 
      this.setOpenLinkMode(!this.shouldOpenLinkHintInNewTab, this.shouldOpenLinkHintWithQueue);       // [L]
      this.openLinkModeToggle = false;                                                                // [L]
    }
    event.stopPropagation();
    event.preventDefault();
  },                                                                                                  // [L]

  /*
   * When only one link hint remains, this function activates it in the appropriate way.              // [L]
   */
  activateLink: function(matchedLink) {                                                               // [L]
    if (this.isSelectable(matchedLink)) {                                                             // [L]
      matchedLink.focus();
      // When focusing a textbox, put the selection caret at the end of the textbox's contents.
      matchedLink.setSelectionRange(matchedLink.value.length, matchedLink.value.length);
      this.deactivateLinkHintsMode();                                                                 // [L]
    } else {
      // When we're opening the link in the current tab, don't navigate to the selected link immediately;
      // we want to give the user some feedback depicting which link they've selected by focusing it.
      if (this.shouldOpenLinkHintWithQueue) {                                                         // [L]
        this.simulateClick(matchedLink);                                                              // [L]
        this.resetLinkHintsMode();                                                                    // [L]
      } else if (this.shouldOpenLinkHintInNewTab) {                                                   // [L]
        this.simulateClick(matchedLink);                                                              // [L]
        matchedLink.focus();
        this.deactivateLinkHintsMode();                                                               // [L]
      } else {
        setTimeout(this.simulateClick.bind(this, matchedLink), 400);                                  // [L]
        matchedLink.focus();
        this.deactivateLinkHintsMode();                                                               // [L]
      }
    }
  },                                                                                                  // [L]

  /*
   * Selectable means the element has a text caret; this is not the same as "focusable".
   */
  isSelectable: function(element) {                                                                   // [L]
    var selectableTypes = ["search", "text", "password"];
    return (element.tagName == "INPUT" && selectableTypes.indexOf(element.type) >= 0) ||
        element.tagName == "TEXTAREA";
  },                                                                                                  // [L]

  /*
   * Hides linkMarker if it does not match testString, and shows linkMarker                           // [L]
   * if it does match but was previously hidden. To be used with Array.filter().                      // [L]
   */
  toggleHighlights: function(testString, linkMarker) {                                                // [L]
    if (linkMarker.getAttribute("hintString").indexOf(testString) == 0) {                             // [L]
      if (linkMarker.style.display == "none")
        linkMarker.style.display = "";
      for (var j = 0; j < linkMarker.childNodes.length; j++)
        linkMarker.childNodes[j].className = (j >= testString.length) ? "" : "matchingCharacter";     // [L]
      return true;                                                                                    // [L]
    } else {
      linkMarker.style.display = "none";
      return false;                                                                                   // [L]
    }
  },                                                                                                  // [L]

  /*
   * Converts a number like "8" into a hint string like "JK". This is used to sequentially generate all of
   * the hint text. The hint string will be "padded with zeroes" to ensure its length is equal to numHintDigits.
   */
  numberToHintString: function(number, numHintDigits) {                                               // [L]
    var base = settings.linkHintCharacters.length;
    var hintString = [];
    var remainder = 0;
    do {
      remainder = number % base;
      hintString.unshift(settings.linkHintCharacters[remainder]);
      number -= remainder;
      number /= Math.floor(base);
    } while (number > 0);

    // Pad the hint string we're returning so that it matches numHintDigits.
    var hintStringLength = hintString.length;
    for (var i = 0; i < numHintDigits - hintStringLength; i++)
      hintString.unshift(settings.linkHintCharacters[0]);
    return hintString.join("");
  },                                                                                                  // [L]

  simulateClick: function(link) {                                                                     // [L]
    var event = document.createEvent("MouseEvents");
    // When "clicking" on a link, dispatch the event with the appropriate meta key (CMD on Mac, CTRL on windows)
    // to open it in a new tab if necessary.
    var metaKey = (platform == "Mac" && linkHints.shouldOpenLinkHintInNewTab);                        // [L]
    var ctrlKey = (platform != "Mac" && linkHints.shouldOpenLinkHintInNewTab);                        // [L]
    event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, ctrlKey, false, false, metaKey, 0, null);

    // Debugging note: Firefox will not execute the link's default action if we dispatch this click event,
    // but Webkit will. Dispatching a click on an input box does not seem to focus it; we do that separately
    link.dispatchEvent(event);
  },                                                                                                  // [L]

  deactivateLinkHintsMode: function() {                                                               // [L]
    if (this.hintMarkerContainingDiv)                                                                 // [L]
      this.hintMarkerContainingDiv.parentNode.removeChild(this.hintMarkerContainingDiv);              // [L]
    this.hintMarkerContainingDiv = null;                                                              // [L]
    this.hintMarkers = [];                                                                            // [L]
    this.hintKeystrokeQueue = [];                                                                     // [L]
    document.removeEventListener("keydown", this.onKeyDownInLinkHintsMode, true);                     // [L]
    document.removeEventListener("keyup", this.onKeyUpInLinkHintsMode, true);                         // [L]
    this.linkHintsModeActivated = false;                                                              // [L]
    HUD.hide();
  },                                                                                                  // [L]

  resetLinkHintsMode: function() {                                                                    // [L]
    this.deactivateLinkHintsMode();                                                                   // [L]
    this.activateLinkHintsModeWithQueue();                                                            // [L]
  },                                                                                                  // [L]

  /*
   * Creates a link marker for the given link.
   */
  createMarkerFor: function(link, linkHintNumber, stringGenerator) {                                  // [L]
    var hintString = stringGenerator(linkHintNumber);                                                 // [L]
    var linkText = link.element.innerHTML.toLowerCase();                                              // [L]
    if (linkText == undefined)                                                                        // [L]
      linkText = "";                                                                                  // [L]
    var marker = document.createElement("div");
    marker.className = "internalVimiumHintMarker vimiumHintMarker";
    marker.innerHTML = this.spanWrap(hintString);                                                     // [L]
    marker.setAttribute("hintString", hintString);
    marker.setAttribute("linkText", linkText);                                                        // [L]

    // Note: this call will be expensive if we modify the DOM in between calls.
    var clientRect = link.rect;
    // The coordinates given by the window do not have the zoom factor included since the zoom is set only on
    // the document node.
    var zoomFactor = currentZoomLevel / 100.0;
    marker.style.left = clientRect.left + window.scrollX / zoomFactor + "px";
    marker.style.top = clientRect.top  + window.scrollY / zoomFactor + "px";

    marker.clickableItem = link.element;
    return marker;
  },                                                                                                  // [L]
                                                                                                      // [L]
  /*                                                                                                  // [L]
   * Make each hint character a span, so that we can highlight the typed characters as you type them.  // [L]
   */                                                                                                 // [L]
  spanWrap: function(hintString) {                                                                    // [L]
    var innerHTML = [];                                                                               // [L]
    for (var i = 0; i < hintString.length; i++)                                                       // [L]
      innerHTML.push("<span>" + hintString[i].toUpperCase() + "</span>");                             // [L]
    return innerHTML.join("");                                                                        // [L]
  },                                                                                                  // [L]
                                                                                                      // [L]
};                                                                                                    // [L]
                                                                                                      // [L]
var linkHints;                                                                                        // [L]
function initializeLinkHints() {                                                                      // [L]
  linkHints = Object.create(linkHintsPrototype);                                                      // [L]
  linkHints.init();                                                                                   // [L]
                                                                                                      // [L]
  if (settings.narrowLinkHints != "true") { // the default hinting system                             // [L]
                                                                                                      // [L]
    linkHints['digitsNeeded'] = 1;                                                                    // [L]
                                                                                                      // [L]
    linkHints['logXOfBase'] = function(x, base) { return Math.log(x) / Math.log(base); };             // [L]
                                                                                                      // [L]
    linkHints['initHintStringGenerator'] = function(visibleElements) {                                // [L]
      this.digitsNeeded = Math.ceil(this.logXOfBase(                                                  // [L]
            visibleElements.length, settings.linkHintCharacters.length));                             // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
    linkHints['hintStringGenerator'] = function(linkHintNumber) {                                     // [L]
      return this.numberToHintString(linkHintNumber, this.digitsNeeded);                              // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
    linkHints['normalKeyDownHandler'] = function (event) {                                            // [L]
      var keyChar = getKeyChar(event);                                                                // [L]
      if (!keyChar)                                                                                   // [L]
        return;                                                                                       // [L]
                                                                                                      // [L]
      if (event.keyCode == keyCodes.backspace || event.keyCode == keyCodes.deleteKey) {               // [L]
        if (this.hintKeystrokeQueue.length == 0) {                                                    // [L]
          this.deactivateLinkHintsMode();                                                             // [L]
        } else {                                                                                      // [L]
          this.hintKeystrokeQueue.pop();                                                              // [L]
          var matchString = this.hintKeystrokeQueue.join("");                                         // [L]
          this.hintMarkers.filter(this.toggleHighlights.bind(this, matchString));                     // [L]
        }                                                                                             // [L]
      } else if (settings.linkHintCharacters.indexOf(keyChar) >= 0) {                                 // [L]
        this.hintKeystrokeQueue.push(keyChar);                                                        // [L]
        var matchString = this.hintKeystrokeQueue.join("");                                           // [L]
        linksMatched = this.hintMarkers.filter(this.toggleHighlights.bind(this, matchString));        // [L]
        if (linksMatched.length == 0)                                                                 // [L]
          this.deactivateLinkHintsMode();                                                             // [L]
        else if (linksMatched.length == 1)                                                            // [L]
          this.activateLink(linksMatched[0].clickableItem);                                           // [L]
      }                                                                                               // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
  } else {                                                                                            // [L]
                                                                                                      // [L]
    linkHints['linkTextKeystrokeQueue'] = [];                                                         // [L]
                                                                                                      // [L]
    linkHints['hintStringGenerator'] = function(linkHintNumber) {                                     // [L]
      return linkHintNumber.toString();                                                               // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
    linkHints['normalKeyDownHandler'] = function(event) {                                             // [L]
      if (event.keyCode == keyCodes.backspace || event.keyCode == keyCodes.deleteKey) {               // [L]
        if (this.linkTextKeystrokeQueue.length == 0 && this.hintKeystrokeQueue.length == 0) {         // [L]
          this.deactivateLinkHintsMode();                                                             // [L]
        } else {                                                                                      // [L]
          // backspace clears hint key queue first, then acts on link text key queue                  // [L]
          if (this.hintKeystrokeQueue.pop())                                                          // [L]
            this.filterLinkHints();                                                                   // [L]
          else {                                                                                      // [L]
            this.linkTextKeystrokeQueue.pop();                                                        // [L]
            this.filterLinkHints();                                                                   // [L]
          }                                                                                           // [L]
        }                                                                                             // [L]
      } else {                                                                                        // [L]
        var keyChar = getKeyChar(event);                                                              // [L]
        if (!keyChar)                                                                                 // [L]
          return;                                                                                     // [L]
                                                                                                      // [L]
        var linksMatched, matchString;                                                                // [L]
        if (/[0-9]/.test(keyChar)) {                                                                  // [L]
          this.hintKeystrokeQueue.push(keyChar);                                                      // [L]
          matchString = this.hintKeystrokeQueue.join("");                                             // [L]
          linksMatched = this.hintMarkers.filter((function(linkMarker) {                              // [L]
            if (linkMarker.getAttribute('filtered') == 'true')                                        // [L]
              return false;                                                                           // [L]
            return this.toggleHighlights(matchString, linkMarker);                                    // [L]
          }).bind(this));                                                                             // [L]
        } else {                                                                                      // [L]
          // since we might renumber the hints, the current hintKeyStrokeQueue                        // [L]
          // should be rendered invalid (i.e. reset).                                                 // [L]
          this.hintKeystrokeQueue = [];                                                               // [L]
          this.linkTextKeystrokeQueue.push(keyChar);                                                  // [L]
          matchString = this.linkTextKeystrokeQueue.join("");                                         // [L]
          linksMatched = this.filterLinkHints(matchString);                                           // [L]
        }                                                                                             // [L]
                                                                                                      // [L]
        if (linksMatched.length == 0)                                                                 // [L]
          this.deactivateLinkHintsMode();                                                             // [L]
        else if (linksMatched.length == 1)                                                            // [L]
          this.activateLink(linksMatched[0].clickableItem);                                           // [L]
      }                                                                                               // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
    /*                                                                                                // [L]
     * Hides the links that do not match the linkText search string, and                              // [L]
     * renumbers the remainder. Should only be called when there is a change in                       // [L]
     * linkTextKeystrokeQueue, to avoid undesired renumbering.                                        // [L]
    */                                                                                                // [L]
    linkHints['filterLinkHints'] = function(searchString) {                                           // [L]
      var linksMatched = [];                                                                          // [L]
      var linkSearchString = this.linkTextKeystrokeQueue.join("");                                    // [L]
                                                                                                      // [L]
      for (var i = 0; i < this.hintMarkers.length; i++) {                                             // [L]
        var linkMarker = this.hintMarkers[i];                                                         // [L]
        var matchedLink = linkMarker.getAttribute("linkText").toLowerCase().indexOf(linkSearchString.toLowerCase()) >= 0;  // [L]
                                                                                                      // [L]
        if (!matchedLink) {                                                                           // [L]
          linkMarker.style.display = "none";                                                          // [L]
          linkMarker.setAttribute("filtered", "true");                                                // [L]
        } else {                                                                                      // [L]
          if (linkMarker.style.display == "none")                                                     // [L]
            linkMarker.style.display = "";                                                            // [L]
          var newHintText = (linksMatched.length+1).toString();                                       // [L]
          linkMarker.innerHTML = this.spanWrap(newHintText);                                          // [L]
          linkMarker.setAttribute("hintString", newHintText);                                         // [L]
          linkMarker.setAttribute("filtered", "false");                                               // [L]
          linksMatched.push(linkMarker);                                                              // [L]
        }                                                                                             // [L]
      }                                                                                               // [L]
      return linksMatched;                                                                            // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
    linkHints['deactivateLinkHintsMode'] = function() {                                               // [L]
      this.linkTextKeystrokeQueue = [];                                                               // [L]
      Object.getPrototypeOf(this).deactivateLinkHintsMode.call(this);                                 // [L]
    };                                                                                                // [L]
                                                                                                      // [L]
  }                                                                                                   // [L]
}

// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)

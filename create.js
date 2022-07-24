// Scan for a token within a body of text
function lookahead(index, body, target) {
  if (index + target.length >= body.length)
    return false;
  const offset = index;
  for (var i = index; i < offset + target.length; i++) {
    if (body[i] != target[i - offset])
      return false;
  }
  return true;
}

// Creates a list of <img> tag strings
function getImagesFromHTMLbody(htmlBody) {
  var images = [];

  var capturing = false;
  var buffer = "";
  
  for (var i = 2048; i < htmlBody.length - 2048; i++) {
    const ch = htmlBody[i];

    if (ch == '\n')
      continue;

    if (capturing) {
      if (ch == '>') {
        images.push(buffer + ">");
        capturing = false;
        buffer = "";
      } else {
        buffer += ch;
      }
      continue;
    }
    if (ch == '<' && lookahead(i, htmlBody, "<img ")) {
      i += 4;
      buffer += "<img ";
      capturing = true;
    }
  }
  return images;
}

// Recursively scrolls to the bottom of the page, capturing new images
function scrollToBottom(lastY) {
  window.lastY = lastY;
  setTimeout(function() {
    const scrollBar = document.getElementById("jmuse-scroller-component");
    if (window.prevScrollY == -1)
      window.prevScrollY = scrollBar.scrollTop;
    if (window.lastY == scrollBar.scrollTop) {
      buildPage();
      return;
    }
    window.lastY = scrollBar.scrollTop;
    scrollBar.scrollTop += PAGE_HEIGHT;
    scrollToBottom(window.lastY);
    setTimeout(gatherPages, 500);
  }, 750);
}

// Grabs images and adds them to a set (preventing the storage of duplicates)
function gatherPages() {
  var rawHtml = document.body.innerHTML;

  imgs = getImagesFromHTMLbody(rawHtml);

  imgs.forEach(function (e) {
    if (e.includes("scoredata") && e.includes("score_"))
      imageSet.add(e);
  });
}

// Constructs the final page with some HTML boilerplate
function buildPage() {
  var outputHtml = "<body><style>body,html{margin:0;}img{width: \
    215.9mm;height:279.4mm;}</style>";
  imageSet.forEach(function (e) {
    if (e.includes("scoredata") && e.includes("score_"))
      outputHtml += e;
  });

  const tmp = document.getElementById("msdl-tmp");
  tmp.remove();

  document.getElementById("jmuse-scroller-component").scrollTop = window.prevScrollY;

  outputHtml += "</body><title>Printable Sheets</title>";

  var outputWindow = window.open("");
  outputWindow.document.write(outputHtml);
}

// Block off the page with a "Downloading..." message to prevent user interaction
document.body.innerHTML += "<div style=\"width: 100%; height: 100%; \
  position: absolute; top: 0; z-index: 9999; color: #fff; background-color: \
  #333; display: flex; align-items: center; justify-content: space-around; \
  font-size: 3em;\" id=\"msdl-tmp\">Downloading...</div>";

document.getElementById("jmuse-scroller-component").scrollTop = 0;

var PAGE_HEIGHT = 2400;

imageSet = new Set();

window.prevScrollY = -1;

setTimeout(scrollToBottom(-1), 500);
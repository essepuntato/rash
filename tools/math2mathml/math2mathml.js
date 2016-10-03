/*
 * math2mathml.js - Version 0.1, August 30, 2016
 * Copyright (c) 2016, Vincenzo Rubano <vincenzorubano@email.it>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with 
 * or without fee is hereby granted, provided that the above copyright notice and this 
 * permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD 
 * TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR 
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR 
 * PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING 
 * OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */var fs = require('fs');


var page = require('webpage').create();
var sys = require('system');

phantom.onError = errorHandler
page.onError = errorHandler
// By default, PhantomJS won't display messages logged to the console by the web page.
// However those messages might be incredibly useful for debugging, so we change this behavior.
page.onConsoleMessage = function(msg) {
  console.log("WebPage said: "+msg+"\n");
}
// we need to route a callback from the document context to the Phantom context
page.onCallback = function(data) {
  if(data.reason === 'finishedRenderingMath') {
    onFinishedRenderingMath();
  }
}
//Performance tweak: prevent css stylesheets from loading
page.onResourceRequested = function(requestData, request) {
    if ((/.+\.css$/gi).test(requestData['url'])) {
        request.abort();
    }   
}
//Performance tweak: disable image loading
page.settings.loadsImages = false

var outputPath;
var documentPath;
  if(sys.args[1] == "-h" || sys.args[1] == "--help") {
      usage("Converts Math notation, both AsciiMath and LaTeX, in a RASH document into its MathML equivalent.\n\n");
  }
else if(sys.args.length < 4) {
      usage("Too few arguments given.");
}
else if(sys.args.length>4) {
  usage("Too many arguments given.");
}
else {
  if(sys.args[1] == "-o" || sys.args[1] == "--output") {
    outputPath = sys.args[2];
    documentPath = sys.args[3];
  }
  else {
    usage("Invalid argument "+sys.args[1]+".");
  }
}

page.open(documentPath, function(status) {
  if(status === 'success') {
    page.evaluate(function() {
      MathJax.Hub.Queue(function() {
        // we need to cleanup the markup a bit.
        // RASH depends on JQuery, so we can leverage it here as well.
        // We remove all elements with the "cgen" class, introduced automatically by RASH.
        $('.cgen').remove();
        // The MathJax output for each formula is really complex, but we are only interested in its internal MathML.
        // While MathJax offers a method to retrieve the MathML equivalent of a formula, it can unpredictably behave syncronously or asyncronously. This uncertainty makes its usage for our purpose problematic, so we extract the MathML equivalent of each formula manually.
        var mathContainers = $('.rash-math');
        var mathmlElements = $('.MJX_Assistive_MathML math');
        for(var i=0;i<mathmlElements.length;i++) {
          mathContainers.eq(i).replaceWith(mathmlElements.eq(i));
        }
        // MathJax adds a lot of inline stylesheets that we don't need, so we remove them all
        $('head style').remove();
                window.callPhantom({
          reason: "finishedRenderingMath"
        });
        });
    });
  }
  else {
    console.error("Error while loading the document. Status: "+status+"\n");
    phantom.exit(1);
  }
});

function onFinishedRenderingMath() {
  try {
    fs.write(outputPath, page.content, "w");
    phantom.exit();
  }
  catch(error) {
    console.error("Error while saving file. "+error);
    phantom.exit(1);
  }
}

/*
  * JavaScript error handler.
  * This handler can be triggered for both global errors or page specific ones.
*/
function errorHandler(msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
  phantom.exit(1);
}

/**
  * Prints usage information to the console and stops execution.
*/
function usage(reason) {
  if(reason) {
    console.log(reason+"\n\n");
  }
  var help = "Usage:\n\nmath2mathml.js ";
  help += "-o output_path,\t path where the converted document will be saved\n";
  help += "document\t, Path of a RASH document containing AsciiMath notation that you want to convert.";
  console.log(help);
  phantom.exit(1);
}

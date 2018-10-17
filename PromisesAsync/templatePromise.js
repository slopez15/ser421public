var fs = require('fs');
var http = require('http');
var url = require('url');

var ROOT_DIR = "/html/";

function readFileAndReplace(output, file, replaceStr) {
    return new Promise(function(resolve, reject) {
	//console.log(__dirname);
	//console.log(ROOT_DIR);
	//console.log(file);
	//console.log(__dirname + ROOT_DIR + file);
	fs.readFile(__dirname + ROOT_DIR + file, function (err, data) {
	    if (err) {
		reject({ status : 400, theOutput : "<HTML><HEAD><Title>Error!</Title></HEAD><Body>Unable to process the request" + err +"</Body</HTML>" });
	    } else if (replaceStr != null) {
		resolve({ status : 200, theOutput : output.theOutput.replace(replaceStr, data.toString()) });
	    } else {
		resolve({ status : 200, theOutput : data.toString() });
	    }
	});
    });
}

http.createServer(function (req, res) {
    let urlObj = url.parse(req.url, true, false);
    let qparams = urlObj.query;

    // qparams should be left=X banner=Y footer=Z and main=K
    var renderContent = { status : 200, theOutput : '' };
    var renderPromise = readFileAndReplace(renderContent, "template.html");
    //    renderPromise.then(function(result) {
    renderPromise.then(function(result) {
	return readFileAndReplace(result, "banner"+qparams.banner+".html", "BANNER");
    }).then(function(result) {
	return readFileAndReplace(result, "left"+qparams.left+".html", "LEFTNAV");
    }).then(function(result) {
	return readFileAndReplace(result, "footer"+qparams.footer+".html", "FOOTER");
    }).then(function(result) {
	return readFileAndReplace(result, "main"+qparams.main+".html", "MAIN");
    }).then(function(result) {
	res.writeHead(200, { 'Content-type': 'text/html' });
	res.end(result.theOutput);
    }, function(error) {
	console.log("Some error in the promise!:"); //+ JSON.stringify(error));
	res.writeHead(error.status, { 'Content-type': 'text/html' });
	res.end(error.theOutput);
    });
}).listen(8088);

/*
//testing:
GET: localhost:8088\
	err: __dirname\html\bannerundefined.html'
How to run:
	http://localhost:8088/?banner=1&left=1&footer=1&main=1
	based on names of files.
Doing?
	takes template.html
	then replace certain parts (words like MAIN) and replace it with an entire file's data like main1. essentially a component.
*/
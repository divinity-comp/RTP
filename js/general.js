

/* 

FUNCTION
Cookie Functions self explanitory 

*/
function hasCookie(c_name) {
    if (document.cookie.indexOf(c_name + "=") >= 0)
        return true;
    else
        return false;
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = encodeURIComponent(value) +
        ((exdays == null) ? "" : ("; expires=" + exdate.toUTCString()));
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return decodeURIComponent(y);
        }
    }
}
var delete_cookie = function (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

/* 

FUNCTION
Get element by id shorthand

*/
function idc(id) {
    return document.getElementById(id);
}

/* 

FUNCTION
get by classname first element , can focus for speed on parent

*/
function gbc(id, parentEl) {
    if (parentEl)
        return parentEl.getElementsByClassName(id)[0];
    else
        return document.getElementsByClassName(id)[0];
}

/* 

FUNCTION
Caps first letter

*/
function capitalizeTxt(txt) {
    if (txt != "undefined" && txt != null)
        return txt.charAt(0).toUpperCase() + txt.slice(1);
    else return "";
}

/* 

FUNCTION
Replace All occurences in a string

*/
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
/* 

FUNCTION
Prevent events from triggering

*/
function stopEvent(e) {
    e.preventDefault();
}
/* 

FUNCTION
Toggle Element

*/
function toggleElement(el,forcedAct) {
    if(forcedAct == null) {
        
    if(el.getAttribute("active") == "true") 
        el.setAttribute("active","false");
    else
        el.setAttribute("active","true");
    }
    else {
        if(forcedAct) 
            el.setAttribute("active","true");
        else
            el.setAttribute("active","false");
    }
}
/* 

FUNCTION
Make a Ajax Request, first url, function to call on success and data you want to send, finally if you want the program to hang(wait) for request to complete

*/
function ajaxRequestToMake(url, callback, data, wait) {
    var callback = (typeof callback == 'function' ? callback : false),
        xhr = null;
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        try {
            ajxhrax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var name;

    // Turn the data object into an array of URL-encoded key/value pairs.
    for (name in data) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }

    // Combine the pairs into a single string and replace all %-encoded spaces to 
    // the '+' character; matches the behaviour of browser form submissions.
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    if (!xhr)
        return null;
    if (wait)
        xhr.open("POST", url, false);
    else {
        xhr.open("POST", url, true);
        xhr.timeout = 30000;
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && callback) {
            if (xhr.responseText == "" || xhr.responseText.includes("connect ETIMEDOUT"))
                callback('{"response":"Connection timed out", "result":"error"}');
            else
                callback(xhr.responseText);
            
            console.log(xhr.responseText);
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(urlEncodedData);
    return xhr;
}

/* 

FUNCTION
Make a Ajax Request same as above but no data send

*/
function ajaxRequestGet(url, callback, wait) {
    var callback = (typeof callback == 'function' ? callback : false),
        xhr = null;
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        try {
            ajxhrax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    if (!xhr)
        return null;
    if (wait)
        xhr.open("GET", url, false);
    else {
        xhr.open("GET", url, true);
        xhr.timeout = 30000;
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && callback) {
            if (xhr.responseText == "" || xhr.responseText.includes("connect ETIMEDOUT"))
                callback('{"response":"Connection timed out", "result":"error"}');
            else
                callback(xhr.responseText);
        }
    }
    xhr.send();
    return xhr;
}

function getWidth() {
    var body = document.body,
        html = document.documentElement;
    return Math.max(
        html.clientWidth);
}

function getHeight() {
    var body = document.body,
        html = document.documentElement;

    return Math.max(html.clientHeight);
}

/* 

FUNCTION
When load happens create list of functions to run when triggered 

same applies for other functions respectively

*/
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            if (oldonload) {
                oldonload();
            }
            func();
        }
    }
}

function addResizeEvent(func) {
    var oldonresize = window.onresize;
    if (typeof window.onresize != 'function') {
        window.onresize = func;
    } else {
        window.onresize = function () {
            if (oldonresize) {
                oldonresize();
            }
            func();
        }
    }
}

function addScrollEvent(func) {
    var oldonresize = window.onscroll;
    if (typeof window.onscroll != 'function') {
        window.onscroll = func;
    } else {
        window.onscroll = function () {
            if (oldonresize) {
                oldonresize();
            }
            func();
        }
    }
}

/* 

FUNCTION
Find cords x,y of an element on screen

*/
function findPos(obj) {
    var curleft = 0,
        curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return {
            x: curleft,
            y: curtop
        };
    }
    return undefined;
}

/* 

FUNCTION
More precise location, includes specifics like scroll

*/
function elDimensions(el, dimType) {
    if (!el)
        return undefined;
    switch (dimType) {
        case "Scroll":
            return {
                x: el.scrollWidth,
                y: el.scrollHeight
            };
            break;
        case "All":
            var elHeight = el.offsetHeight;
            elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));

            var elWidth = el.offsetWidth;
            elWidth += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));

            return {
                x: elWidth,
                y: elHeight
            };
            break;
        case "Padding":
            return {
                x: el.offsetWidth,
                y: el.offsetHeight
            };
            break;
        case "Client":
            return {
                x: el.clientWidth,
                y: el.clientHeight
            };
            break;
        default:
            var elHeight = el.offsetHeight;
            elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));

            var elWidth = el.offsetWidth;
            elWidth += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));

            return {
                x: elWidth,
                y: elHeight
            };
            break;
    }
}

/* 

FUNCTION
check if element is inside another

*/
function insideOtherArea(overArea, innerArea) {
    var insideTrue = false;

    var overArea = overArea.getBoundingClientRect();
    var innerArea = innerArea.getBoundingClientRect();
    if (overArea.left < innerArea.right && (overArea.bottom > innerArea.top || overArea.top < innerArea.bottom))
        insideTrue = true;
    return insideTrue;
}

// read or write to file
function writeTofile(fileName, data,successFunc,createDir) {
    console.log(createDir);
    if(createDir) {
        
                var multi = 0;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        
    fs.root.getDirectory(createDir, { create: true }, function (dirEntry) {
        console.log('file write system open: ' + fs.name);
        
        
        
        dirEntry.getFile(fileName, {
            create: true,
            exclusive: false
        }, function (fileEntry) {
              fileEntry.createWriter(function (fileWriter) {
                  
                fileWriter.onwritestart = function () {
                    console.log("start file write");
                };
                fileWriter.onwriteend = function () {
                    multi++;
                    console.log("write attempt" + multi);
                    if(successFunc && multi == 2) {
                        
                        console.log(data);
                        successFunc();
                    }
                    else if(multi == 1) {
                        fileWriter.write(data);
                        console.log("Successful file write...");
                    }
                };

                fileWriter.onerror = function (e) {
                    console.log("Failed file write: " + e.toString());
                };

                // If data object is not passed in,
                // create a new Blob instead.
                if (!data) {
                    data = new Blob(['some file data'], {
                        type: 'text/plain'
                    });
                }

                fileWriter.truncate(0);
            });

        }, function (e) {
            console.log("Failed file 1 write: " + e.toString());
        });

    }, function (e) {
        console.log("Failed file 2 write: " + e.toString());
        });
        }, function (e) {
            console.log("Failed file 3 write: " + e.toString());
        });
    }
    else {
    
                var multi = 0;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        console.log('file write system open: ' + fs.name);
        fs.root.getFile(fileName, {
            create: true,
            exclusive: false
        }, function (fileEntry) {
              fileEntry.createWriter(function (fileWriter) {
                  
                fileWriter.onwritestart = function () {
                    console.log("start file write");
                };
                fileWriter.onwriteend = function () {
                    multi++;
                    console.log("write attempt" + multi);
                    if(successFunc && multi == 2) {
                        
                        console.log(data);
                        successFunc();
                    }
                    else if(multi == 1) {
                        fileWriter.write(data);
                        console.log("Successful file write...");
                    }
                };

                fileWriter.onerror = function (e) {
                    console.log("Failed file write: " + e.toString());
                };

                // If data object is not passed in,
                // create a new Blob instead.
                if (!data) {
                    data = new Blob(['some file data'], {
                        type: 'text/plain'
                    });
                }

                fileWriter.truncate(0);
            });

        }, function (e) {
            console.log("Failed file 1 write: " + e.toString());
        });

    }, function (e) {
        console.log("Failed file 2 write: " + e.toString());
    });
    }
}

function readFile(fileName,successFunc) {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        console.log('file read system open: ' + fs.name);
        fs.root.getFile(fileName, {
            create: true,
            exclusive: false
        }, function (fileEntry) {

             fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function () {
            if(successFunc)
                successFunc(this.result);
        };

        reader.readAsText(file);

    }, function (e) {
        console.log("Data read: " + e.toString())
    });

        }, function (e) {
            console.log("Failed file 1 write: " + e.toString());
        });

    }, function (e) {
        console.log("Failed file 2 write: " + e.toString());
    });
}
function urlStringConVersion(url, success, error) {
	window.resolveLocalFileSystemURL(
		url,
		function (dirEntry) {
			if(!dirEntry.isFile) {
				error();
				return;
			}

			dirEntry.file(
				function(file) {
					success(file);
				},
				function() {
					error();
				}
			);
		},
		function() {
			// An error occured.
			error();
		}
	);
}
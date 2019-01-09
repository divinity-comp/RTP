/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        devicePlatform = device.platform;
            regulatorChecker = setInterval(function () {
                regulatorCommand();
            }, 500);
        if (cordova.platformId == 'android') {
            StatusBar.styleBlackOpaque();
        }
        try {
            pictureSource = navigator.camera.PictureSourceType;
            destinationType = navigator.camera.DestinationType;
            camOptions = {
                quality: 100,
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.PHOTOLIBRARY
            };
        }
        catch(error) {
            alert(error);
        }

    }
};
var devicePlatform;
var connectionStatus = {connected:false,connectionChanged:false};

var regulatorChecker ;
var regulatorFunctionToRun = ["checkConnection","checkLogin"];
/* 

FUNCTION
Run functions every 100ms - check connection default and login status

*/
function regulatorCommand() {
    for(var reg = 0; reg < regulatorFunctionToRun.length;reg++) {
        window[regulatorFunctionToRun[reg]]();
    }
}
/* 

FUNCTION
Remove a function from the regulator - must do if not needed - removeFromRegulator("checkLogin")

*/
function removeFromRegulator(stringToRemove) {
    regulatorFunctionToRun = regulatorFunctionToRun.filter(v => v !== stringToRemove);
}

// Initial Data
var appVersion = "v1";
// test site: https://rtp-app.divinitycomputing.com
var urlInit = "https://rtp-app.divinitycomputing.com";
// Login
var test = true;

var pictureSource;
var destinationType;
var camOptions;
/* 

FUNCTION
Check if user is already logged in

*/
function checkLogin() {
    if (!idc("noInternet"))
        return false;
    
    if(getCookie("rememberUser") == "true") {
        toggleElement(idc("cookieToggle"),true);
    }
    
    if (hasCookie("user") && hasCookie("pass") && hasCookie("stringUserData") && getCookie("rememberUser") == "true" && connectionStatus.connectionChanged == true) {
        idc("noInternet").setAttribute("noConnection","false");
        connectionStatus.connectionChanged = false;
        updateUserFiles();
    }
    else {
        if(connectionStatus.connected == false) {
            idc("noInternet").setAttribute("noConnection","true");
            connectionStatus.connectionChanged = false;
        }
        else {
            idc("noInternet").setAttribute("noConnection","false");
            if(connectionStatus.connectionChanged == true) {
                connectionStatus.connectionChanged = false;
                loginInit();
            }
        }
    }
}
function checkConnection() {
    
    var resetLogin = connectionStatus.connected;
    connectionStatus.connected = navigator.onLine ? true : false;
    
    if(connectionStatus.connected  != resetLogin)
        connectionStatus.connectionChanged = true;
}
function notifyConnectionDown() {
    if(connectionStatus.connectionChanged == true) {
        connectionStatus.connectionChanged = false;
        if(connectionStatus.connected) 
            successMessage("Internet Connected");
        else 
            errorMessage("Internet Disconnected");
    }
}
/* 

FUNCTION
Enables the login screen

*/
function loginInit() {
    let loginPage = idc("loginPage").children[0];
    loginPage.parentNode.style.display = "block";
    let tl = new TimelineMax();
    tl.fromTo(loginPage, 0.35, {
            opacity: 0
        }, {
            opacity: 1,
            ease: Circ.easeOut
        })
        .fromTo(loginPage.children[0], 0.5, {
            y: 30,
            transformOrigin: "50% 100%",
            scale: 0,
            opacity: 0
        }, {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: Circ.easeOut
        })
        .fromTo(loginPage.children[1].children[0], 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(loginPage.children[1].children[1], 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(loginPage.children[1].children[2], 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(loginPage.children[1].children[3], 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(document.getElementsByTagName("small")[0], 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(gbc("forgotPass"), 0.4, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        }, "-=0.25")
        .fromTo(loginPage.children[2], 0.4, {
            opacity: 0
        }, {
            opacity: 1,
            ease: Circ.easeOut
        });
}

/* 

FUNCTION
Send server request to login or reset password

*/
function loginOrPasswordReset(ev) {
    idc("error").className = "";
    ev.preventDefault();

    let buttonE = ev.target;
    if (!buttonE.hasAttribute("clicked")) {
        buttonE.setAttribute("clicked", "true");

        let passwordCheck = gbc("forgotPass");
        let formL = idc("login").getElementsByTagName("input");

        if (passwordCheck.hasAttribute("prevPhrase")) {
            ajaxRequestToMake(urlInit + "/" + appVersion + "/fgpw.php",
                function (response) {
                console.log(response);
                    buttonE.removeAttribute("clicked");
                    let jsRes = JSON.parse(response);
                    if (jsRes.response === "success") {
                        idc("error").innerHTML = "Email sent, use the link provided in the email to reset";
                        idc("error").className = "success";
                        forgotPassword(passwordCheck);
                    } else {
                        idc("error").innerHTML = jsRes.response;
                    }
                }, {
                    user: formL[0].value
                });
        } else {
            setCookie("user", formL[0].value);
            setCookie("pass", formL[1].value);
            ajaxRequestToMake(urlInit + "/" + appVersion + "/login.php",
                function (response) {
                console.log(response);
                    buttonE.removeAttribute("clicked");
                    let jsRes = JSON.parse(response);
                    if (jsRes.response === "success") {
                        setCookie("stringUserData", response);
                        getMainDashboard();
                    } else {
                        idc("error").innerHTML = jsRes.response;
                    }
                }, {
                    user: formL[0].value,
                    pass: formL[1].value
                });
        }
    }
}

/* 

FUNCTION
Toggle cookies

*/
function toggleCookie(cookieMod, el) {
    if(getCookie(cookieMod) == "true")
        delete_cookie(cookieMod);
    else
        setCookie(cookieMod,"true");
    
    toggleElement(el);
}
/* 

FUNCTION
Switches login screen to forgot password

*/
function forgotPassword(passwordCheck) {

    let tl = new TimelineMax();
    let login = idc("login");
    let passFieldHide = login.children[1];
    let passFieldDim = elDimensions(passFieldHide);

    if (passwordCheck.hasAttribute("prevPhrase")) {

        let passMB = parseInt(passFieldHide.getAttribute("mb"));

        passFieldHide.style.display = "block";

        tl.to(passFieldHide, 0.35, {
            scale: 1,
            marginBottom: passMB,
            height: login.children[0].offsetHeight
        });
        passwordCheck.innerHTML = passwordCheck.getAttribute("prevPhrase");
        passwordCheck.removeAttribute("prevPhrase");
        login.children[2].innerHTML = "Login";
    } else {
        let passMB = parseInt(window.getComputedStyle(passFieldHide).getPropertyValue('margin-bottom'));
        passFieldHide.setAttribute("mb", passMB);

        tl.fromTo(passFieldHide, 0.35, {
            scale: 1,
            marginBottom: passMB + "px",
            height: passFieldDim.y + "px"
        }, {
            marginBottom: "0px",
            height: "0px",
            scale: 0,
            ease: Circ.easeIn,
            onComplete: function () {
                passFieldHide.style.display = "none";
            }
        });

        passwordCheck.setAttribute("prevPhrase", passwordCheck.innerHTML);
        login.children[2].innerHTML = "Recover Password";
        passwordCheck.innerHTML = "Back to login";
    }
}
/* 

FUNCTION
Gathers All information for the user so no internet connection is required.

*/
function updateUserFiles() {
    removeFromRegulator("checkLogin");
    regulatorFunctionToRun.push("notifyConnectionDown");
    ajaxRequestToMake(urlInit + "/" + appVersion + "/data/user-requirements.php",
        function (response) {
        let jsRes = JSON.parse(response);
        if (jsRes.response === "success") {
            writeTofile("lastjobcheck",response, function() {
                getMainDashboard();
            });
            getOwnJobs();

        } else {
            setTimeout(function () {
                loginInit();
            }, 2000);
        }
    }, {
        user: getCookie("user"),
        pass: getCookie("pass")
    });
}

//
// User functions 
//

/* 

FUNCTION
Find local user data

*/
function getUserDataCookie() {
    if (hasCookie("stringUserData"))
        return JSON.parse(getCookie("stringUserData"))["userdata"];
    else
        return null;
}
function isAdmin() {
    if (getUserDataCookie()) {
        if (getUserDataCookie()["userlevel"] === "100")
            return true;
        else
            return false;
    }
}
//
// Menu
//
function logout() {
    regulatorFunctionToRun = ["checkConnection"];
    connectionStatus.connectionChanged = true;
    ajaxRequestGet("pages/login.html",
        function (response) {
        idc("centralHub").innerHTML = response;
            delete_cookie("user");
            delete_cookie("pass");
        checkLogin();
        },
    "");
}

/* 

FUNCTION
Display Standard menu

*/
function defaultMenu() {
    let navString = "";
    let navAdd = basicMenuList;
    for (var i = 0; i < navAdd.length; i++) {
        let tArg = "";
        if("function" in navAdd[i])
            tArg = "," + navAdd[i].function;
        navString += "<li onclick='openPage(\"" + navAdd[i].link + "\",this"+ tArg +")'><span>" + navAdd[i].name + "</span>" + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" mlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 width="510px" height="510px" viewBox="0 0 510 510" style="enable-background:new 0 0 510 510;" xml:space="preserve">		<path d="M255,0C114.75,0,0,114.75,0,255s114.75,255,255,255s255-114.75,255-255S395.25,0,255,0z M255,306L153,204h204L255,306z"/></svg>' + "</li>";
    }
    idc("navMenu").innerHTML += navString;

}

/* 

FUNCTION
Display all menus

*/
function adminMenuCreation() {
    if (isAdmin()) {
        let navString = "";
        let navAdd = adminMenuList;
        for (var i = 0; i < navAdd.length; i++) {
            navString += "<li onclick='openApiPage(\"" + navAdd[i].link + "\",this)'><span>" + navAdd[i].name + "</span>" + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" mlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 width="510px" height="510px" viewBox="0 0 510 510" style="enable-background:new 0 0 510 510;" xml:space="preserve">		<path d="M255,0C114.75,0,0,114.75,0,255s114.75,255,255,255s255-114.75,255-255S395.25,0,255,0z M255,306L153,204h204L255,306z"/></svg>' + "</li>";
        }
        idc("navMenu").innerHTML += navString;
    }
    else {
return false;}
}

//
// Main Dashboard
//

function toggleMobile(ele) {
    let pLinks = idc("panelLinks");
    let pLinksLi = idc("panelLinks").getElementsByTagName("li");
    let tl = new TimelineMax();
    
    if(getWidth() < 800) {
        if (ele.getAttribute("active") == "true") {
            ele.setAttribute("active", "false");
            tl.fromTo(pLinks, 0.3, {
                x: "0%",
                opacity: 1
            }, {
                x: "100%",
                opacity: 0,
                onComplete: function () {
                    idc("panelLinks").style.display = "none";
                }
            });
        } else {
            ele.setAttribute("active", "true");
            pLinks.style.display = "block";
            tl.fromTo(pLinks, 0.3, {
                x: "100%",
                opacity: 0
            }, {
                x: "0%",
                opacity: 1,
                ease: Circ.easeOut
            });
        }
        
    }
    else {
        
        console.log("width is large enough");
    }
}

function getMainDashboard() {
    let userData = getUserDataCookie();
    ajaxRequestGet("pages/dashboard.html",
        function (response) {
            idc("centralHub").innerHTML = response;
            adminMenuCreation();
            defaultMenu();

            if (isAdmin()) {
                openApiPage("jobControl");
            } else {
                openPage("jobs/myJobs", null, startJobSearch);
            }
            idc("navMenu").children[0].className = "active";
        },
        "");
}

//
// User Message
//

function successMessage(messageSuc, msgType) {
    if(msgType == null)
        msgType = 0;
    let sucMessage = document.createElement("div");
    sucMessage.className = "success";
    if(msgType == 0)
        successMessage.className += " normal";
    else
        successMessage.className += " central";
    sucMessage.innerHTML = '<span>' + messageSuc + "</span>";

    let alertBox = idc("alertBox");
    alertBox.appendChild(sucMessage);

    if(msgType == 0) {
        TweenMax.fromTo(sucMessage, 0.35, {
            x: "-100%",
            opacity: 0
        }, {
            x: "0%",
            opacity: 1,
            ease: Circ.easeOut
        });
    }
    else {
        
        TweenMax.fromTo(sucMessage, 0.35, {
            y: 100,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: Circ.easeOut
        });
    }

    setTimeout(function () {
        let sucWidth = sucMessage.clientWidth;
        let sucHeight = sucMessage.clientHeight;
        
    if(msgType == 0) {
        
        TweenMax.fromTo(sucMessage, 0.35, {
            x: "0%",
            opacity: 1,
            width: sucWidth + "px",
            height: sucHeight + "px"
        }, {
            x: "-100%",
            opacity: 0,
            width: "0px",
            ease: Circ.easeOut,
            onComplete: function () {
                sucMessage.style.display = "none";
            }
        });
    }
    else {
        
        
        TweenMax.fromTo(sucMessage, 0.35, {
            y:0,
            opacity: 1
        }, {
            y: -100,
            opacity: 0,
            ease: Circ.easeOut,
            onComplete: function () {
                sucMessage.style.display = "none";
            }
        });
    }
    }, 2000);
}

function errorMessage(messageSuc, msdType) {
    let sucMessage = document.createElement("div");
    sucMessage.className = "error";
    sucMessage.innerHTML = '<span>' + messageSuc + "</span>";

    let alertBox = idc("alertBox");
    alertBox.appendChild(sucMessage);

    TweenMax.fromTo(sucMessage, 0.35, {
        x: "-100%",
        opacity: 0
    }, {
        x: "0%",
        opacity: 1,
        ease: Circ.easeOut
    });

    setTimeout(function () {
        let sucWidth = sucMessage.clientWidth;
        let sucHeight = sucMessage.clientHeight;
        TweenMax.fromTo(sucMessage, 0.35, {
            x: "0%",
            opacity: 1,
            width: sucWidth + "px",
            height: sucHeight + "px"
        }, {
            x: "-100%",
            opacity: 0,
            width: "0px",
            ease: Circ.easeOut,
            onComplete: function () {
                sucMessage.style.display = "none";
            }
        });
    }, 6000);
}

//
// Page function
//

function openPage(page, el,followFunc) {
    if (el) {
        for (var i = 0; i < idc("navMenu").children.length; i++) {
            idc("navMenu").children[i].className = "";
        }
        el.className = "active";
        toggleMobile(idc("mobileMenu"));
    }
    
    TweenMax.to("#main", 0.3, {
        opacity: 0,
        y: 100,
        onComplete: function () {
        ajaxRequestGet("pages/" + page + ".html",
            function (response) {
                idc("main").innerHTML = response;
                idc("main").className = page;
                if(followFunc)
                    followFunc();
                document.body.scrollTop = 0;
          
    setTimeout(function () {  
    TweenMax.to("#main", 0.3, {
        opacity: 1,
        y: 0
    });
    }, 400);
            },
        "");
    }});
}

function openApiPage(page, el, getR) {
    if (el) {
        for (var i = 0; i < idc("navMenu").children.length; i++) {
            idc("navMenu").children[i].className = "";
        }
        el.className = "active";
        toggleMobile(idc("mobileMenu"));
    }
    let fullLoad = {
        "html": false,
        "js": false,
        "css": false
    };
    let pageFullLoad = setInterval(function () {
        if (fullLoad.html && fullLoad.css && fullLoad.js) {
            TweenMax.to("#main", 0.4, {
                opacity: 1,
                y: 0
            });
            clearInterval(pageFullLoad);
        }
    }, 150);
    TweenMax.to("#main", 0.3, {
        opacity: 0,
        y: 100,
        onComplete: function () {
            if (!getR)
                getR = "";
            ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.php" + getR,
                function (response) {
                    idc("main").innerHTML = response;
                    idc("main").className = page;
                    fullLoad.html = true;

                    if (idc("main").children[0].hasAttribute("js")) {
                        ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.js",
                            function (response) {
                                let scriptAdd = document.createElement("script");
                                scriptAdd.innerHTML = response;
                                idc("main").children[0].appendChild(scriptAdd);
                                fullLoad.js = true;
                            }, true);
                    } else {
                        fullLoad.js = true;
                    }
                if(!idc("genJob")) {
                    
try {
    if(idc("addJob"))        
        idc("jobScroll").appendChild(idc("addJob"));
    if(idc("addClient"))
        idc("userScroll").appendChild(idc("addClient"));
}
catch(error) {
  console.error(error);
  // expected output: ReferenceError: nonExistentFunction is not defined
  // Note - error messages will vary depending on browser
}
                }
                    if (idc("main").children[0].hasAttribute("css")) {
                        ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.css",
                            function (response) {
                                let cssAdd = document.createElement("style");
                                cssAdd.innerHTML = response;
                                idc("main").children[0].appendChild(cssAdd);
                                fullLoad.css = true;
                            }, true);
                    } else {
                        fullLoad.css = true;
                    }
                },
                true);

        }
    });
}


function openOverlay(elId, type) {
    let el = idc(elId);
    el.style.display = "block";
    idc("main").style.overflow = "hidden";
    idc("main").setAttribute("mTop",idc("main").scrollTop);
    idc("main").scrollTop = 0;
    if (!el.getElementsByClassName("close")[0]) {
        var closeButton = document.createElement("button");
        var closeB = document.createElement("img");
        closeButton.innerHTML = "<span>Close</span>";
        closeButton.appendChild(closeB);
        closeB.src = "assets/close.svg";
        closeButton.className = "close";
        if (el.children.length == 0)
            el.appendChild(closeButton);
        else
            el.insertBefore(closeButton, el.children[0]);
        
        closeB.onclick = function () {
            idc("main").style.overflow = "";
            idc("main").scrollTop = idc("main").getAttribute("mTop");
            closeOverlay(elId, type);
        }
    }
    let tl = new TimelineMax();
    tl.fromTo(el, 0.5, {
        y: "100%",
        opacity: "0"
    }, {
        y: "0%",
        opacity: "1"
    });

}

function closeOverlay(elId, type) {
    let el = idc(elId);
    let tl = new TimelineMax();

    tl.fromTo(el, 0.5, {
        y: "0%",
        opacity: "1",onComplete:function() {
            idc("main").style.overflow = "";
            idc("main").scrollTop = idc("main").getAttribute("mTop");
        }
    }, {
        y: "100%",
        opacity: "0",
        ease: Circ.easeOut,
        onComplete: function () {
            el.style.display = "none";
        }
    });
}

/* 
    Instrument Functions
*/
function getTestIntruments() {
    if(hasCookie("instruments")) {
        var instrumentsCookie = JSON.parse(getCookie("instruments"));
        for(var a = 0; a < instrumentsCookie.length;a++) (function(a){ 

            idc("addInstru").children[0].value = instrumentsCookie[a][0];
            idc("addInstru").children[1].value = instrumentsCookie[a][1];
            idc("addInstru").children[2].value = instrumentsCookie[a][2];
            idc("addInstru").children[3].value = instrumentsCookie[a][3];
            idc("addInstru").children[4].value = instrumentsCookie[a][4];

            var instruSect = document.createElement("section");

            var instruData = document.createElement("p");
            var instruDataKey = document.createElement("span");
            var instruDataValue = document.createElement("span");
            instruDataKey.innerHTML = "Type";
            instruDataValue.innerHTML = idc("addInstru").children[0].value;
            instruData.appendChild(instruDataKey);
            instruData.appendChild(instruDataValue);
            instruSect.appendChild(instruData);

            var instruInputs = idc("addInstru").getElementsByTagName("input");
            for(var i = 0; i < instruInputs.length;i++) (function(i){ 
                var instruData = document.createElement("p");
                var instruDataKey = document.createElement("span");
                var instruDataValue = document.createElement("span");
                instruDataKey.innerHTML = instruInputs[i].getAttribute("placeholder");
                instruDataValue.innerHTML = instruInputs[i].value;
                instruData.appendChild(instruDataKey);
                instruData.appendChild(instruDataValue);
                instruSect.appendChild(instruData);
                instruInputs[i].value = "";
            })(i);
    var instruDel = document.createElement("button");
    instruDel.className = "delete";
    instruDel.onclick = function() {
        instruDel.parentNode.parentNode.removeChild(instruDel.parentNode);
        updateLocalInstruments();
    }
    instruSect.appendChild(instruDel);
            idc("testInstruments").appendChild(instruSect);
        })(a);
    }
}
function addInstrument() {
    var instruSect = document.createElement("section");
    
    var instruData = document.createElement("p");
    var instruDataKey = document.createElement("span");
    var instruDataValue = document.createElement("span");
    instruDataKey.innerHTML = "Type";
    instruDataValue.innerHTML = idc("addInstru").getElementsByTagName("select")[0].value;
    instruData.appendChild(instruDataKey);
    instruData.appendChild(instruDataValue);
    instruSect.appendChild(instruData);
    
    var instruInputs = idc("addInstru").getElementsByTagName("input");
    for(var i = 0; i < instruInputs.length;i++) {
        var instruData = document.createElement("p");
        var instruDataKey = document.createElement("span");
        var instruDataValue = document.createElement("span");
        instruDataKey.innerHTML = instruInputs[i].getAttribute("placeholder");
        instruDataValue.innerHTML = instruInputs[i].value;
        instruData.appendChild(instruDataKey);
        instruData.appendChild(instruDataValue);
        instruSect.appendChild(instruData);
        instruInputs[i].value = "";
    }
    var instruDel = document.createElement("button");
    instruDel.className = "delete";
    instruDel.onclick = function() {
        instruDel.parentNode.parentNode.removeChild(instruDel.parentNode);
        updateLocalInstruments();
    }
    instruSect.appendChild(instruDel);
    idc("testInstruments").appendChild(instruSect);
    updateLocalInstruments();
    closeOverlay("addInstru");
}
function updateLocalInstruments() {
    var instruList = [];
    
    var instruObjs = idc("testInstruments").children;
    
    for(var i = 0; i < instruObjs.length;i++) {
        var instruSingle = [];
        var instruObjsPs = instruObjs[i].getElementsByTagName("p");
        for(var a = 0; a < instruObjsPs.length;a++) {
            instruSingle.push(instruObjsPs[a].children[1].innerHTML);
        }
        instruList.push(instruSingle);
    }
    setCookie("instruments",JSON.stringify(instruList));
}
/* 
    Job Functions
*/
function getOwnJobs() {
    
        ajaxRequestToMake(urlInit + "/" + appVersion + "/data/getJobs.php",
            function (response) {
                let jsRes = JSON.parse(response);
                if (jsRes.response === "success") {
                    loadInJobsStandardUser(jsRes);
                    setCookie("joblist", response);
                } else {
                    errorMessage("Could not get job data - please check your internet");
                }
            }, {
            "req":"own"
            });
}
function startJobSearch() {
    if(connectionStatus.connected == true) {
        getOwnJobs();
    }
    else {
        
        try {
            if(hasCookie("joblist"))
                  loadInJobsStandardUser(JSON.parse(getCookie("joblist")));
            else
                errorMessage("No local data, internet required");
        }
        catch(error) {
          console.error(error);
        }
    }
}
function loadInJobsStandardUser(jobData) {
    if("jobData" in jobData) {
        
    for(var i = 0; i < jobData["jobData"].length;i++) (function(i){ 
        var jrD = document.createElement("article");
        jrD.setAttribute("cid",jobData["jobData"][i].clientid[0]);
        jrD.setAttribute("aid",jobData["jobData"][i].jobid);
        
        jrD.onclick = function() {
            openJob(jobData["jobData"][i].jobid);
        }
        
        var jobImage = "assets/image.svg";
        if(jobData["jobData"][i].clientid[7] != "")
            jobImage = jobData["jobData"][i].clientid[7] ;
        
        var dataToAdd = '<figure>                <img src="' + jobImage + '"/></figure><div  class="title">';
        if("jobid" in jobData["jobData"][i])  
            dataToAdd += '<span>'+ jobData["jobData"][i].jobid  +'</span><span>'+ jobData["jobData"][i].clientid[1] + '</span>';
        if("creationdate" in jobData["jobData"][i]) 
            dataToAdd += '<date>'+ jobData["jobData"][i].creationdate  +'</date>';
        dataToAdd += "</div>";
        dataToAdd += '<div class="hidden jobdetails">'+ JSON.stringify(jobData["jobData"][i].jobdetails) +'</div>';
        jrD.innerHTML = dataToAdd;
        if("stage" in jobData["jobData"][i] && idc("activeJobs")) {
            switch(jobData["jobData"][i].stage) {    
                case "active":
                    idc("activeJobs").appendChild(jrD);
                    break;
                case "review":
                    idc("reviewJobs").appendChild(jrD);
                    break;
                case "complete":
                    idc("completeJobs").appendChild(jrD);
                    break;
            }
        }
            })(i);
    
        
    try {
            if(idc("completeJobs")) {

            if(idc("completeJobs").children.length == 1)
                idc("completeJobs").getElementsByClassName("noJobs")[0].classList.remove("hidden");
            if(idc("reviewJobs").children.length == 1)
                idc("reviewJobs").getElementsByClassName("noJobs")[0].classList.remove("hidden");
            if(idc("activeJobs").children.length == 1)
                idc("activeJobs").getElementsByClassName("noJobs")[0].classList.remove("hidden");
            }
        }
        catch(error) {
          console.error(error);
        }
    }
    
}
function showContacts(el) {
    if(el.parentNode.hasAttribute("show")) {
        el.innerHTML = "show contact details";
        el.parentNode.removeAttribute("show");
    }
    else {
        el.innerHTML = "hide contact details";
        el.parentNode.setAttribute("show","true");
    }
}
function jobGroupSet(num) {
    idc("jobHeader").setAttribute("jobgroup",num);
    
    var jobScroll = idc("jobScroll").getElementsByTagName("section");
    
    let tl = new TimelineMax();
    if(idc("addjob")) {
         tl
        .fromTo(idc("addJob"), 0.35, {
        x: "0%",
        opacity: 1
    },{x:"-250%",
        opacity: 0})
        .fromTo(jobScroll, 0.35, {
        x: "0%",
        opacity: 1
    }, {
        x: "-100%",
        opacity: 0,
        onComplete:function() {
            for(var i = 0; i < jobScroll.length;i++) {
                jobScroll[i].className = "hidden";
            }
            
            jobScroll[num].className = "";
    TweenMax.fromTo(jobScroll[num], 0.35, {
        x: "100%",
        opacity: 0
    }, {
        x: "0%",
        opacity: 1
    });
        }
    },0)
        .fromTo(idc("addJob"), 0.35, {
        x: "200%",
        opacity: 0
    },{x:"0%",
        opacity: 1});
    }
    else {
         tl.fromTo(jobScroll, 0.35, {
        x: "0%",
        opacity: 1
    }, {
        x: "-100%",
        opacity: 0,
        onComplete:function() {
            for(var i = 0; i < jobScroll.length;i++) {
                jobScroll[i].className = "hidden";
            }
            
            jobScroll[num].className = "";
    TweenMax.fromTo(jobScroll[num], 0.35, {
        x: "100%",
        opacity: 0
    }, {
        x: "0%",
        opacity: 1
    });
        }
    },0);
    }
   
}

let jobJS;

function openJob(jobid) {

            idc("main").scrollTop = 0;
    let loadStep = {
        "core": false,
        "documents": false,
        "singlejob": false
    };
    if (hasCookie("job" + jobid)) {
        jobJS = JSON.parse(getCookie("job" + jobid));
        loadStep.core = true;
    } else {
        ajaxRequestToMake(urlInit + "/" + appVersion + "/data/single-job.php",
            function (response) {
                let jsRes = JSON.parse(response);
                if (jsRes.response === "success") {
                    setCookie("job" + jobid, response);
                    jobJS = jsRes;
                    loadStep.core = true;
                } else {
                    errorMessage("Could not get job data - please check your internet");
                }
            }, {
                job: jobid
            });
    }
    let newJob = setInterval(function () {
        if (loadStep.core == true && loadStep.singlejob == true) {
            clearInterval(newJob);
            let jobDe = jobJS["jobdetails"];

            for (var i = 0; i < jobDe.length; i++) {
                addDocument(jobDe[i], i, jobJS);
            }
            TweenMax.fromTo("#main", 0.4, {
                x: "100%"
            }, {
                opacity: 1,
                x: "0%"
            });
            idc("viewJob").setAttribute("jobid", jobJS["jobid"]);
            idc("viewJob").children[0].innerHTML = jobJS["jobid"] + " - " + jobJS["client"][0]["Company"];
                loadClientData(jobJS);
        }
    }, 300);
    
    TweenMax.to("#main", 0.3, {
        opacity: 0,
        x: "-100%",
        onComplete: function () {
            idc("main").scrollTop = 0;
        ajaxRequestGet("pages/jobs/view-job.html",
            function (response) {
                idc("main").innerHTML = response;
                idc("main").className = "single-job " + jobJS.stage;
                loadStep.singlejob = true;
            idc("main").scrollTop = 0;
            
        ajaxRequestGet("pages/client/changeJobstatus.html",
            function (jobstat) {
               setTimeout(function(){ 
                   idc("clientInfo").innerHTML += jobstat;
               }, 1000);
            
            },
        "");
            
            findAssociatedJobFiles(jobid);
            },
        "");
    }});
}
function findAssociatedJobFiles(jid, requestUpload) {
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getDirectory('project' + jid, { create: true }, function (subDirEntry) {
            
             var directoryReader = subDirEntry.createReader();
            
            directoryReader.readEntries(function(entries) {
                for (i=0; i<entries.length; i++)  (function(i){
               
          
                    var imageURI = entries[i].toURL();
                    if(requestUpload) {
                        uploadJobfilesToServer(jid, imageURI); 
                    }
                    else {
                        
                    
        var fileDetails = document.createElement("div");
        var filenameAdd = document.createElement("p");
        filenameAdd.innerHTML = entries[i].name;
        
        
        var image = document.createElement("img");
        if(imageURI.indexOf('jpg') === -1&& imageURI.indexOf('jpeg') === -1&& imageURI.indexOf('png') === -1&& imageURI.indexOf('webp') === -1) {
            image = document.createElement("div");
            image.innerHTML = '<i class="fas fa-file-alt"></i>';
        }
        else
            image.src = imageURI  + '?' + Math.random();
        var fHub = idc("files-hub");
        fileDetails.appendChild(image);
        fileDetails.appendChild(filenameAdd);
        fHub.appendChild(fileDetails);
                    }
                })(i);  
            },function() {
                
            });
            
        }, function() {
            errorMessage("couldn't locate files");
        });
    }, 
    function (e) {
            console.log("Failed file 3 write: " + e.toString());
        });
}
function uploadJobfilesToServer(fileurl,jid) {
        var win = function (r) {
            successMessage(fileurl + "Uploaded");
}

var fail = function (error) {
    errorMessage(fileurl + " couldn't be uploaded");
}

var options = new FileUploadOptions();
options.fileKey = "file";
options.fileName = fileurl;
options.mimeType = "text/plain";

var params = {};
params.jobid = jid;

options.params = params;

var ft = new FileTransfer();
ft.upload(fileURL, encodeURI(urlInit + "/" + appVersion + "/update/job-file-upload.php"), win, fail, options);
}
function jobStatusChange(el) {
    var JobChangeE = idc("JobChange").children[0];
    var jobIdS = idc("viewJob").getAttribute("jobid");
    ajaxRequestToMake(urlInit + "/" + appVersion + "/update/job-stage.php",
        function (ares) {
            let resJs = JSON.parse(ares);
            if (resJs.response == "success") {
                openJob(jobIdS);
                successMessage("Reloading job");
            } else {
                errorMessage("Status not updated");
            }
        }, {
            stage: JobChangeE.value,
            job: jobIdS
    });
}
function jobMenu(menuSelected) {
    var jobMenuC = document.getElementsByClassName("jobMenu");
    var jobMenuOptions = idc("jobMenu").children;
      for(var i = 0; i < jobMenuOptions.length;i++) {
          jobMenuOptions[i].className = "";
      }  
    jobMenuOptions[menuSelected].className = "active";
    TweenMax.to(jobMenuC, 0.3, {
        opacity: 0,
        x: "-100%",
        onComplete: function () {
          for(var i = 0; i < jobMenuC.length;i++) {
              jobMenuC[i].className = "jobMenu hidden";
          }  
            jobMenuC[menuSelected].className = " jobMenu";
    TweenMax.fromTo(jobMenuC[menuSelected], 0.3, {
        opacity: 0,
        x: "100%"
            
    }, {
        opacity: 1,
        x: "0%"});
    }});
    if(menuSelected == 2) {
        var calcRoom = elDimensions(idc("viewJob").children[0]).y +  elDimensions(idc("viewJob").children[1]).y + 
            elDimensions(idc("rtpSend")).y ;
        var fileHub = idc("files");
        TweenMax.set(fileHub,{
            height:"calc(100% - " + calcRoom + "px)"
        });
        TweenMax.set(idc("files-hub"),{
            height:"calc(100% - 90px)"
        });
        
        if(devicePlatform == null) {
            idc("fileAdd").setAttribute("desktop","true");
        }
    }
}
function openFileAdd(fileAddType) {
    if(fileAddType == 0) {
        findLocalJobFiles();
    }
    else if(fileAddType == 1) {
        // when google drive is ready
    }
    else if(fileAddType == 2) {
        decideJobPictures();
    }
    else if(fileAddType == 3) {
        decideJobPictures(true);
    }
}
/* find local files */ 
function findLocalJobFiles() {
    var inputFile = document.createElement("input");
    inputFile.setAttribute("type","file");
    inputFile.click();
    inputFile.onchange = function() {
        
        var files = inputFile.files;

        for (var i = 0; i < files.length; i++)  (function(i){
            uploadJobFile(files[i].name,"alternativefile");
        })(i);
    }
}

/* upload job files */
function decideJobPictures(galleryFocus) {
    console.log(devicePlatform);
    if(devicePlatform == null) {
        portalJobFileUpload("/update/job-file-upload.php");
    }
    else {
        if(galleryFocus) {
            navigator.camera.getPicture(uploadJobFile, onErrorUploadFail, {
                quality: 100,
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.PHOTOLIBRARY
            });
        }
        else {
            navigator.camera.getPicture(uploadJobFile, onErrorUploadFail, {
                quality: 100,
                destinationType: destinationType.FILE_URI,
                sourceType: pictureSource.PICTURE
            });
        }
    }
}
function portalJobFileUpload(upURL) {
    var inputFile = document.createElement("input");
    inputFile.setAttribute("type","file");
    inputFile.click();
    inputFile.onchange = function() {
        
        var files = inputFile.files;

        for (var i = 0; i < files.length; i++)  (function(i){
            uploadJobFile(files[i].name,"alternativefile");
        })(i);
    }
}
function uploadJobFile(imageURI,AltFile) {
    try { 
        var fileDetails = document.createElement("div");
        var filenameAdd = document.createElement("p");
        filenameAdd.innerHTML = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        
        
        var image = document.createElement("img");
        if(AltFile) {
            image = document.createElement("div");
            image.innerHTML = '<i class="fas fa-file-alt"></i>';
        }
        else
            image.src = imageURI  + '?' + Math.random();
        var fHub = idc("files-hub");
        fileDetails.appendChild(image);
        fileDetails.appendChild(filenameAdd);
        fHub.appendChild(fileDetails);
        if(idc("viewJob")) {
            readFile(imageURI, function(readD) {
               console.log(readD); 
                
               var fileNameSaved = imageURI.substr(imageURI.lastIndexOf('/') + 1); writeTofile(fileNameSaved,readD,function() {
                    successMessage("File added ready to send");

                },"project" + idc("viewJob").getAttribute("jobid"));
                
                var jid = idc("viewJob").getAttribute("jobid");
var fileNameSaved = imageURI.toURL();
                updateFileJobJS(jid, fileNameSaved);
                
            successMessage("Job file ready for submit");
        });
        }
    }
    catch(error) {
        errorMessage("Job file Upload Failed");
    }
}
function updateFileJobJS(jid, filesToAdd) {
    var localjobD = JSON.parse(getCookie("job" + jid));
    console.log(localjobD);
    
    var currentFiles = [];
    if(localjobD.collectedfiles)  {
        currentFiles = currentFiles.collectedfiles;
    }
        currentFiles.push(filesToAdd);
        localjobD.collectedfiles = currentFiles;
    
    setCookie("job" + jid, JSON.stringify(localjobD));
    console.log(localjobD);
}
/* upload client logo */
function getLogo() {
    if(devicePlatform == null) {

        openPortalPhotoUpload("/update/client-logo.php");
    }
    else {
        navigator.camera.getPicture(uploadClientLogo, uploadClientLogoError, {
            quality: 70,
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.PHOTOLIBRARY
        });
    }
}
function openPortalPhotoUpload(upURL) {
    var inputFile = document.createElement("input");
    inputFile.setAttribute("type","file");
    inputFile.click();
    inputFile.onchange = function() {
        var formaData = new FormData();
        formaData.append('clientid', idc("addUser").getAttribute("clientid")); // string
        formaData.append('file[]', inputFile.files[0]);

        serverImageUpload(inputFile,urlInit + "/" + appVersion + upURL, formaData);
    }
}
function uploadClientLogo(imageURI) {
    if(idc("addUser").hasAttribute("clientid")) {
        try { 
            var image = idc('companyLogo').getElementsByTagName("img")[0];
            image.src = imageURI  + '?' + Math.random();

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            var params = new Object();
            params.clientid = idc("addUser").getAttribute("clientid");

            options.params = params;
            options.chunkedMode = false;

            var ft = new FileTransfer();
            ft.upload(imageURI, urlInit + "/" + appVersion + "/update/client-logo.php",
            function (result) {
                successMessage("image uploaded");
                alert(JSON.stringify(result));
            },
            function (error) {
                errorMessage("Image Upload Failed");
                alert(error)
            }, options);
        }
        catch(error) {
          alert(error);
        }
       
    }
    else {
        errorMessage("Please reload the page");
    }
}

function uploadClientLogoError(err) {
    errorMessage(err);
}
function onErrorUploadFail(err) {
    errorMessage(err);
}
function loadClientData(jobDetails) {
    if(idc("clientInfo")) {
        var clientInfo = idc("clientInfo");
        var clientJs = jobDetails.client[0];
        if(clientJs.companylogo)
            clientInfo.innerHTML = '<img src="'+ clientJs.companylogo +'" />';
        if(clientJs.Company)
            clientInfo.innerHTML += '<p><span>Company:</span> <span>'+ clientJs.Company +'</span></p>';
        if(clientJs.address) {
            var streetShort = replaceAll(clientJs.address," ","+");
            clientInfo.innerHTML += '<p class="address"><span>Address: </span><span><a href="geo:0,0?q='+ streetShort +'"><i class="fas fa-map-marked-alt"></i>'+ clientJs.address +'</a></span></p>';
        }
        if(clientJs.contact)
            clientInfo.innerHTML += '<p><span>Contact: </span><span>'+ clientJs.contact +'</span></p>';
        if(clientJs.email)
            clientInfo.innerHTML += '<a href="mailto:'+ clientJs.email +'"><p><span>Email: </span><span>'+ clientJs.email +'</span></p></a>';
        if(clientJs.phone)
            clientInfo.innerHTML += '<a href="tel:'+ clientJs.phone +'"><p><span>Phone: </span><span>'+ clientJs.phone +'</span></p></a>';
    }
    else {
        console.log("no client data");
    }
}
function returnDocFilename(docFind) {
    return docFind.data + ".json";
}

function addDocument(docFind, Inter, fullJson) {
    let checkInternal = false;
    for (var i = 0; i < avaliableDocs.length; i++) {
        if (docFind.docid == avaliableDocs[i].docid && docFind.rev == avaliableDocs[i].rev)
            checkInternal = true;
    }
    console.log("find document");
    console.log(docFind);
    console.log(Inter + returnDocFilename(docFind));
    if (checkInternal) {
        console.log("checking internal");
        readFile(Inter + returnDocFilename(docFind), function (results) {
            addDocRow(docFind, Inter, fullJson, results);
        });
    } else {
        console.log("checking server");
        ajaxRequestGet(urlInit + "/" + appVersion + "/documents/" + docFind.docid + "/" + docFind.data + docFind.rev + ".json",
            function (documentServerFind) {
                writeTofile(Inter + returnDocFilename(docFind), documentServerFind, function () {
                    if (hasCookie("avaliableDocs")) {
                        let availDocs = JSON.parse(getCookie("avaliableDocs"));
                        availDocs.push(docFind);
                        setCookie("avaliableDocs", JSON.stringify(availDocs));
                    } else {
                        setCookie("avaliableDocs", "[" + JSON.stringify(docFind) + "]");
                    }
                    addDocRow(docFind, Inter, fullJson, documentServerFind);
                });
        }, true);
    }
}

function addDocRow(docFind, Inter, fullJson, results) {
    var jsonRow = JSON.parse(results);

    var docNew = document.createElement("div");
    docNew.className = "taskBlock";
    docNew.innerHTML = "<div><h3>" + docFind.rev + " - " + replaceAll(docFind.data,"-"," ") + "</h3></div>";

    for (var i = 0; i < jsonRow["pages"].length; i++)(function (i) {
        var page = document.createElement("div");
        page.className = "page";
        page.innerHTML = (i + 1) + ". " + jsonRow["pages"][i][0]["page"];
        docNew.appendChild(page);
        page.onclick = function () {
            startDoc(results, i, Inter, fullJson);
            idc("rtpSend").style.display = "none";
        }
    })(i);

    docNew.children[0].onclick = function () {
        startDoc(results, null, Inter, fullJson);
        idc("rtpSend").style.display = "none";
    }
    
    idc("documents").appendChild(docNew);
}

// Document functions
var docJSON = {};

function startDoc(fullDocData, pageNum, Inter, fullJson) {
    var viewJob = idc("viewJob");
    var documentPage = idc("documentPage");
    var tl = new TimelineMax();
    tl.to(viewJob, 0.35, {
        opacity: 0,
        x:"-100%",
        onComplete: function () {
            viewJob.style.display = "none";
            documentPage.style.display = "flex";
        }
    });
    if (!pageNum)
        pageNum = 0;
    var docCookie = fullJson["clientid"] + "-" + fullJson["jobid"] + "-" + fullJson["jobdetails"][Inter]["docid"] + "-Rev" + fullJson["jobdetails"][Inter]["rev"] + ".json";
    readFile(docCookie, function (response) {
        if (response == "" || response == null) {
            console.log("Create internal doc Cookie: " + docCookie);
            writeTofile(docCookie, fullDocData, function () {
                docJSON = JSON.parse(fullDocData);
                docJSON.file = docCookie;
                loadFromJson(pageNum);
            });
        } else {
            console.log("Find internal doc Cookie: " + docCookie);
            docJSON = JSON.parse(response);
            docJSON.file = docCookie;
            loadFromJson(pageNum);
        }
    });
}

var hadChange = false;
var savedInterval;
function loadFromJson(pageNum) {
    if(savedInterval)
        clearInterval(savedInterval);
    var canUpdate = false;
    var readyToUpdate = false;
    savedInterval = setInterval(function () {
        canUpdate = true;
        if (hadChange) {
            console.log("Had Change");
            hadChange = false;
            canUpdate = false;
            readyToUpdate = true;
        }
        if (canUpdate && readyToUpdate) {
            console.log("save to file");
            var fullDocData = JSON.stringify(docJSON);
            writeTofile(docJSON.file, fullDocData, function () {});
            hadChange = false;
            canUpdate = false;
            readyToUpdate = false;
        }
    }, 1500);
    
    idc("documentPage").innerHTML = "";
    for (i = 1; i < docJSON.pages[pageNum].length; i++)(function (i) {
        docElementLoadIn([pageNum, i],idc("documentPage"));
    })(i);
    
        TweenMax.set(idc("documentPage"),{
            x: "100%",
            opacity: 0
        });
    setTimeout(function () {
        TweenMax.fromTo(idc("documentPage"), 0.35, {
            x: "100%",
            opacity: 0
        }, {
            x: "0%",
            opacity: 1
        });
    }, 250);
    let nextDoc = document.createElement("button");
    nextDoc.className = "finalButton";
    if (docJSON.pages.length - 1 == pageNum) {
        nextDoc.innerHTML = "Complete";
        nextDoc.onclick = function () {
            validatePage(function() { 
                
                
            let viewJob = idc("viewJob");
            let documentPage = idc("documentPage");

            let tl = new TimelineMax();

            tl.to(documentPage, 0.35, {
                opacity: 0,
                x:"-100%",
                onComplete: function () {
                    viewJob.style.display = "block";
                    documentPage.style.display = "none";
                }
            }).to(viewJob, 0.35, {
                x:"0%",
                opacity: 1
            });
            idc("rtpSend").style.display = "block";
            },function() {
            });
        }
    } else {
        nextDoc.innerHTML = "Next page";
        
        nextDoc.onclick = function () {
            
            
        validatePage(
            function() { 
                TweenMax.fromTo(idc("documentPage"), 0.35, {
                    x: "0%",
                    opacity: 1
                }, {
                    x: "-100%",
                    opacity: 0,
                    ease: Circ.easeOut,
                    onComplete: function () {
                        loadFromJson(pageNum + 1);
                        idc("main").scrollTop = 0;
                    }
            });
            },
            function() {
            }
        ); 
            
            
        }
        
    }
    idc("documentPage").appendChild(nextDoc); 
}
function validatePage(successF,failedF) {
    
    var failedElements = [];
    var dpVal = idc("documentPage").getElementsByClassName("textinput");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            var dpValidate = dpVal[i].getAttribute("required");
            var inputdp = dpVal[i].getElementsByTagName("input")[0];
            if(dpValidate == "lim") {
                if(inputdp.value != "LIM" && inputdp.value != "lim" && inputdp.value != "Lim"
                  && inputdp.value != "✔" && inputdp.value != "N/a" && inputdp.value != "N/A" && inputdp.value != "n/a")
                    failedElements.push(dpVal[i]);
                dpVal[i].setAttribute("error", "Must Contain ✔ or N/A or LIM");
            }
            else if(dpValidate == "text") {
                if(inputdp.value.length < 1)
                    failedElements.push(dpVal[i]);
                dpVal[i].setAttribute("error", "This field can not be empty");
            }
            else if(dpValidate == "date") {
                var resDate = inputdp.value.split("/");

                if(resDate.length < 3) {
                    dpVal[i].setAttribute("error", "Enter Date DD/MM/YYYY");
                    failedElements.push(dpVal[i]);
                }
            }
        }
    })(i);
    var dpVal = idc("documentPage").getElementsByClassName("textarea");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            var dpValidate = dpVal[i].getAttribute("required");
            var inputdp = dpVal[i].getElementsByTagName("textarea")[0];
            if(dpValidate == "lim") {
                if(inputdp.value != "LIM" && inputdp.value != "lim" && inputdp.value != "Lim"
                  && inputdp.value != "✔" && inputdp.value != "N/a" && inputdp.value != "N/A" && inputdp.value != "n/a")
                    failedElements.push(dpVal[i]);
                dpVal[i].setAttribute("error", "Must Contain ✔ or N/A or LIM");
            }
            else if(dpValidate == "text") {
                if(inputdp.value.length < 1)
                    failedElements.push(dpVal[i]);
                dpVal[i].setAttribute("error", "This field can not be empty");
            }
            else if(dpValidate == "date") {
                var resDate = inputdp.value.split("/");
                if(resDate.length < 3) {
                    resDate = inputdp.value.split("\\");
                }

                if(resDate.length < 3) {
                    dpVal[i].setAttribute("error", "Enter Date DD/MM/YYYY");
                    failedElements.push(dpVal[i]);
                }
            }
        }
    })(i);
    var dpVal = idc("documentPage").getElementsByClassName("radio");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            var dpValidate = dpVal[i].getAttribute("required");
            var inputdp = dpVal[i].getElementsByTagName("input");
            var checkboxdp = dpVal[i].getElementsByClassName("checkbox");
            var filledIn = false;
    for(var a = 0;a < inputdp.length;a++) (function(a){
        if(inputdp[a].value != "")
            filledIn = true;
    })(a);
    for(var b = 0;b < checkboxdp.length;b++) (function(b){
        if(checkboxdp[b].getAttribute("active") == "true")
            filledIn = true;
    })(b);
             
            if(!filledIn) {
                dpVal[i].setAttribute("error", "One of these fields must be selected");
                failedElements.push(dpVal[i]);
            }
                
        }
    })(i);
    var dpVal = idc("documentPage").getElementsByClassName("checkbox");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            var dpValidate = dpVal[i].getAttribute("required");
            if(dpVal[i].hasAttribute("active")) {
                dpVal[i].setAttribute("error", "You must check this box");
                failedElements.push(dpVal[i]);
            }
        }
    })(i);
    var dpVal = idc("documentPage").getElementsByClassName("signature");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            if(dpVal[i].getElementsByTagName("img")[0].src == "") {
                dpVal[i].setAttribute("error", "A signature needs to be entered");
                failedElements.push(dpVal[i]);
            }
        }
    })(i);
    var dpVal = idc("documentPage").getElementsByClassName("table");
    for(var i = 0;i < dpVal.length;i++) (function(i){
        if(dpVal[i].getAttribute("required")) {
            var valList = dpVal[i].getAttribute("required").split(",");
            
    for(var a = 0;a < valList.length;a++) (function(a){
        if(valList[a] == "lim") {
            var dpValTR = dpVal[i].getElementsByTagName("tr");
            for(var b = 0;b < dpValTR.length;b++) (function(b){
                if(dpValTR[b].getElementsByTagName("td").length == valList.length) {
                    if(dpValTR[b].getElementsByTagName("td")[a].getElementsByTagName("input").length == 1) {
                        var inputTD = dpValTR[b].getElementsByTagName("td")[a].getElementsByTagName("input")[0];
                        if(inputTD.value != "LIM" && inputTD.value != "lim" && inputTD.value != "Lim"
                          && inputTD.value != "✔" && inputTD.value != "N/a" && inputTD.value != "N/A" && inputTD.value != "n/a")
                            failedElements.push(inputTD);
                        inputTD.setAttribute("error", "Must Contain ✔ or N/A or LIM");
                    }
                }
                
            })(b);
        }
    })(a);
        }
    })(i);
    
    if(failedElements.length == 0)
        successF();
    else {
        var documentErrors = document.createElement("div");
        documentErrors.className = "documentErrors";

        documentErrors.setAttribute("num", "0");
        var countP = document.createElement("p");
        countP.innerHTML = "1/" + failedElements.length ;
        documentErrors.appendChild(countP);
        
        var specificError = document.createElement("p");
        if(failedElements[0].hasAttribute("error"))
            specificError.innerHTML += failedElements[0].getAttribute("error") ;
        documentErrors.appendChild(specificError);
        failedElements[0].className += " ehighlight";
        idc("documentPage").scrollTop = failedElements[0].offsetTop;
        
        var buttonLeft = document.createElement("button");
        buttonLeft.className = "buttonLeft";
        buttonLeft.onclick = function() {
            var numLe = parseInt(documentErrors.getAttribute("num"));
            failedElements[numLe].className = failedElements[numLe].className.replace('ehighlight','')
            if(numLe > 0)
                numLe--;
            
        failedElements[numLe].className += " ehighlight";
            documentErrors.children[0].innerHTML = (numLe + 1) + "/" + failedElements.length;
            documentErrors.setAttribute("num",numLe);
        if(failedElements[numLe].hasAttribute("error"))
            specificError.innerHTML = failedElements[numLe].getAttribute("error") ;
            if(failedElements[numLe].offsetTop == 0)
                idc("documentPage").scrollTop = failedElements[numLe].parentNode.parentNode.parentNode.offsetTop;
            else
                idc("documentPage").scrollTop = failedElements[numLe].offsetTop;
        }
        documentErrors.appendChild(buttonLeft);
        var buttonRight = document.createElement("button");
        buttonRight.className = "buttonRight";
        buttonRight.onclick = function() {
            var numLe = parseInt(documentErrors.getAttribute("num"));
            failedElements[numLe].className = failedElements[numLe].className.replace('ehighlight','');
            if(numLe < failedElements.length)
                numLe++;
            failedElements[numLe].className += " ehighlight";
            documentErrors.children[0].innerHTML = (numLe + 1) + "/" + failedElements.length;
            documentErrors.setAttribute("num",numLe);
        if(failedElements[numLe].hasAttribute("error"))
            specificError.innerHTML = failedElements[numLe].getAttribute("error") ;
            if(failedElements[numLe].offsetTop == 0)
                idc("documentPage").scrollTop = failedElements[numLe].parentNode.parentNode.parentNode.offsetTop;
            else
                idc("documentPage").scrollTop = failedElements[numLe].offsetTop;
        }
        
        documentErrors.appendChild(buttonRight);
        
        if(idc("main").getElementsByClassName("documentErrors")[0])
            idc("main").removeChild(idc("main").getElementsByClassName("documentErrors")[0]);
        idc("main").appendChild(documentErrors);
    }
}
function docElementLoadIn(loc, elParent) {
    var elLoad = docJSON.pages;
    console.log(elLoad);
    var hasTable = false;
    for (var a = 0; a < loc.length; a++) {
        elLoad = elLoad[loc[a]];
        if(elLoad != null) {
            if(!Array.isArray(elLoad)) {
                if("type" in elLoad) { 
                    if(elLoad.type == "table" && "table" in elLoad) {
                        var newR = [].concat(loc);
                        hasTable = newR.splice(0, loc.length - a);
                        hasTable.push("value");
                    }
                }
            }
        }
    }
    let locN = loc.splice(0);
    let genEl;
    
    let visible = true;
    
    if("visibility" in elLoad) {
        if(elLoad.visibility == "admin") {
            visible = false;
        }
    }
    if(visible) {
    switch (elLoad.type) {
        case "title":
            genEl = document.createElement("h2");
            genEl.classList.add("title");
            genEl.innerHTML = elLoad.title;
        break;
        case "subtitle":
            genEl = document.createElement("h3");
            genEl.classList.add("subtitle");
            genEl.innerHTML = elLoad.title;
        break;
        case "text":
            genEl = document.createElement("p");
            genEl.classList.add("text");
            genEl.innerHTML = elLoad.text;
            if("column" in elLoad) {
                genEl.innerHTML = "<b>" + elLoad.column + "</b> " +genEl.innerHTML;
            }
        break;
        case "seperator":
            genEl = document.createElement("hr");
            genEl.classList.add("seperator");
        break;
        case "signature":
            locN.push("value");
            genEl = document.createElement("div");
            genEl.setAttribute("required","signature");
            if ("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            let randomID =  [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
            let sigImg = document.createElement("img");
                
            if ("value" in elLoad) {
                randomID = elLoad.value;
                readFile(randomID, function (response) {
                console.log("sig has read " + response);
                    sigImg.src = response;

                });
            }
            let sigButton = document.createElement("button");
                genEl.appendChild(sigImg);
                genEl.appendChild(sigButton);
            sigButton.innerHTML = "Attach Signature";
            sigButton.onclick = function() {
                openOverlay("signatureCanvas");
                idc("signatureCanvas").setAttribute("toadd",randomID);
                var sigCan = idc("signatureCanvas").getElementsByTagName("canvas")[0];
                sigCan.setAttribute("width",sigCan.clientWidth);
                sigCan.setAttribute("height",sigCan.clientHeight);
                 signaturePad = new SignaturePad(sigCan, {
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  penColor: 'rgb(0, 0, 0)'
                });
                signaturePad.clear();
            }
            genEl.id = randomID;
            docJSON.pages = jsonUpdate(docJSON.pages,locN,randomID);

            genEl.classList.add("signature");
        break;
        case "textinput":
            locN.push("value");
            
            genEl = document.createElement("div");
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
            if ("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            if("column" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.column;
                genEl.appendChild(label);
            }
            if("heading" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.heading;
                genEl.appendChild(label);
            }
            var spaninput = document.createElement("span");
            var textinput = document.createElement("input");
            if ("value" in elLoad) {
                textinput.value = elLoad.value;
            }
            if ("append" in elLoad) {
                spaninput.setAttribute("append", elLoad["append"]);
            }
            textinput.oninput = function () {
                if(textinput.value == "ll" || textinput.value == "Ll") {
                    textinput.value = "LIM";
                }
                if(textinput.value == "yy" || textinput.value == "Yy") {
                    textinput.value = "✔";
                }
                if(textinput.value == "nn" || textinput.value == "Nn") {
                    textinput.value = "N/A";
                }
                
                if ("update" in elLoad) {
                    updateComplexAdditional(elLoad.update);
                } 
                else {
                    
                    if(genEl.parentNode.className == "radio") {
                    console.log(genEl.parentNode.className);
                        var allInp = genEl.parentNode.getElementsByTagName("input");
                        
                        for(var f = 0; f < allInp.length;f++) {
                            if(allInp[f] != textinput)
                            allInp[f].value = "";
                        }
                        var allInpt = genEl.parentNode.getElementsByTagName("textarea");
                        
                        for(var f = 0; f < allInpt.length;f++) {
                            allInpt[f].value = "";
                        }
                        var allInpBV = genEl.parentNode.getElementsByClassName("checkbox");
                        for(var f = 0; f < allInpBV.length;f++) {
                            if(allInpBV[f].hasAttribute("active"))
                            allInpBV[f].click();
                        }
                    }
                    else {
                        if(hasTable == false) {
                            docJSON.pages = jsonUpdate(docJSON.pages,locN,textinput.value);
                        }
                        else {
                            updateInTable(genEl);
                        }
                    }
                }
            }
            spaninput.appendChild(textinput);
            genEl.classList.add("textinput");
            genEl.appendChild(spaninput);
        break;
        case "clientinformation":
            
            genEl = document.createElement("div");
            genEl.innerHTML = "This content will autofill";
            break;
        case "textarea":
            locN.push("value");
            
            genEl = document.createElement("div");
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
            if("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            if("column" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.column;
                genEl.appendChild(label);
            }
            if("heading" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.heading;
                genEl.appendChild(label);
            }
            var textarea = document.createElement("textarea");
            if("value" in elLoad) {
               textarea.value = elLoad.value;
            }
            textarea.oninput = function () {
                if(hasTable == false) {
                    docJSON.pages = jsonUpdate(docJSON.pages,locN,textarea.value);
                }
                else {
                    updateInTable(genEl);
                }
            }
            genEl.appendChild(textarea);
            genEl.classList.add("textarea");
        break;
        case "checkbox":
            locN.push("value");
            genEl = document.createElement("div");
            if("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            if("column" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.column;
                genEl.appendChild(label);
            }
            if("heading" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.heading;
                genEl.appendChild(label);
            }
            var input = document.createElement("div");
            if("value" in elLoad) {
               if(elLoad.value)
                    input.setAttribute("active","true");
            }
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
            input.onclick = function() {
                
                if(genEl.parentNode.className == "radio") {
                    console.log(genEl.parentNode.className);
                        var allInp = genEl.parentNode.getElementsByTagName("input");
                        
                        for(var f = 0; f < allInp.length;f++) {
                            allInp[f].value = "";
                        }
                        var allInpt = genEl.parentNode.getElementsByTagName("textarea");
                        
                        for(var f = 0; f < allInpt.length;f++) {
                            allInpt[f].value = "";
                        }
                        var allInpBV = genEl.parentNode.getElementsByClassName("checkbox");
                        for(var f = 0; f < allInpBV.length;f++) {
                            if(allInpBV[f].hasAttribute("active"))
                            allInpBV[f].click();
                        }
                }
                
                if(input.hasAttribute("active")) {
                   input.removeAttribute("active");
                    if(hasTable == false) {
                        docJSON.pages =  jsonUpdate(docJSON.pages,locN,false);
                    }
                    else {
                        updateInTable(genEl);
                    }
                }
                else {
                    
                    input.setAttribute("active","true");
                    if(hasTable == false) {
                        docJSON.pages =  jsonUpdate(docJSON.pages,locN,true);
                    }
                    else {
                        updateInTable(genEl);
                    }
                }
            }
            input.classList.add("checkbox");

            genEl.appendChild(input);
            if("append" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.append;
                genEl.appendChild(label);
            }
            genEl.classList.add("checkcontainer");
        break;
        case "select":
            locN.push("value");
            genEl = document.createElement("div");
            if("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            if("column" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.column;
                genEl.appendChild(label);
            }
            if("heading" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.heading;
                genEl.appendChild(label);
            }
            var select = document.createElement("select");
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
            var sOptions = elLoad.options;
            for(var s = 0; s < sOptions.length;s++) {
                var option = document.createElement("option");
                option.value = sOptions[s].option;
                option.innerHTML = sOptions[s].option;
                select.appendChild(option);
            }
            if("value" in elLoad) {
               select.value = elLoad.value;
            }
            select.onchange = function () {
                if(hasTable == false) {
                    docJSON.pages = jsonUpdate(docJSON.pages, locN, select.value);
                }
                else {
                    updateInTable(genEl);
                }
            }
            select.classList.add("select");
            genEl.appendChild(select);
            genEl.classList.add("select");
        break;
        case "lim":
            locN.push("value");
            genEl = document.createElement("select");
            var limOp = ["N/A","Lim","✔"];
            for(var r = 0; r < limOp.length;r++) {
                var option = document.createElement("option");
                option.value = limOp[r];
                option.innerHTML = limOp[r];
                genEl.appendChild(option);
            }
        elParent.onclick = function() {
            var selIndex = 2;
            for(var d = 0; d < genEl.children.length;d++) {
                if(genEl.value == genEl.children[d].getAttribute("value")) {
                    selIndex = d;
                }
            }
            selIndex++;
            if(selIndex > genEl.children.length  - 1)
                selIndex = 0;
            genEl.selectedIndex = selIndex;
            genEl.value = genEl.children[selIndex].getAttribute("value");
            docJSON.pages = jsonUpdate(docJSON.pages, locN, genEl.value);
        }
            if("value" in elLoad) {
                for(var d = 0; d < genEl.children.length;d++) {
                    if(elLoad.value == genEl.children[d].getAttribute("value")) {
                        genEl.selectedIndex = d;
                    }
                }
               genEl.value = elLoad.value;
            }
            genEl.classList.add("lim");
        break;
        case "radioinput":
            locN.push("options");
            genEl = document.createElement("div");
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
            if("label" in elLoad) {
                var label = document.createElement("label");
                label.innerHTML = elLoad.label;
                genEl.appendChild(label);
            }
            var sOptions = elLoad.options;
            for(var b = 0; b < sOptions.length;b++) (function(b){ 
                let locNB = [b];
                var locNBC = locN.concat(locNB);
                docElementLoadIn(locNBC,genEl);
             })(b);
            genEl.classList.add("radio");
        break;
        case "list":
            genEl = document.createElement("div");
            var ulL = document.createElement("ul");

            var sOptions = elLoad.list;
            for(var b = 0; b < sOptions.length;b++) {
                var ulLEl = document.createElement("li");
                ulLEl.innerHTML = sOptions[b].text;
                ulL.appendChild(ulLEl);
            }

            genEl.classList.add("list");
            genEl.appendChild(ulL);
        break;
        case "key":
            genEl = document.createElement("section");
            if("heading" in elLoad) 
                genEl.innerHTML = "<h2>"+ elLoad.heading + "</h2>";

            var keyList = elLoad.keylist;

            for(var b = 0;b < keyList.length;b++) {
                var pT = document.createElement("p");
                pT.innerHTML = "<span>"+ keyList[b].title + ": </span>" + keyList[b].text;
                genEl.appendChild(pT);
            }
            genEl.classList.add("keylist");
        break;
        case "group":
            locN.push("group");
            genEl = document.createElement("div");

            if("heading" in elLoad) {
                var label = document.createElement("h3");
                label.innerHTML = elLoad.heading;
                genEl.appendChild(label);
            }
            var sOptions = elLoad.group;
            
            for( let m = 0; m < sOptions.length;m++) (function(m){
                let locNB = [m];
                var locNBC = locN.concat(locNB);
                docElementLoadIn(locNBC,genEl);
             })(m);
            
            genEl.classList.add("group");
        break;
        case "testinstruments":
            
           genEl = document.createElement("div");
            genEl.className = "instrumentList";
            locN.push("value");
            if(hasCookie("instruments")) {
                var instrumentsCookie = JSON.parse(getCookie("instruments"));
                for(var a = 0; a < instrumentsCookie.length;a++) (function(a){ 
          var intruDi = document.createElement("div");
              intruDi.innerHTML += "<p><b>Type</b>" + instrumentsCookie[a][0] + "</p>";      
              intruDi.innerHTML += "<p><b>Make</b>" + instrumentsCookie[a][1] + "</p>";      
              intruDi.innerHTML += "<p><b>Model</b>" + instrumentsCookie[a][2] + "</p>";      
              intruDi.innerHTML += "<p><b>Serial No.</b>" + instrumentsCookie[a][3] + "</p>";      
              intruDi.innerHTML += "<p><b>Calibration expiration date</b>" + instrumentsCookie[a][4] + "</p>"; 
                    genEl.appendChild(intruDi);
               })(a);
                
                docJSON.pages = jsonUpdate(docJSON.pages,locN,JSON.stringify(instrumentsCookie));
            }
        break;
        case "table":
           genEl = document.createElement("div");
           var tableG = document.createElement("table");

           var tableType = elLoad.table;
           switch(tableType) {
               case "simpleadditional": 
                    locN.push("results");
                    var tRows = elLoad.rows;
                    var trHeader = document.createElement("tr");
                    var trAdder = document.createElement("tr");

                    var simpleAdd = [[]];
                    for(var b = 0; b < tRows.length;b++) (function(b){
                        var tdHead = document.createElement("td");
                        trHeader.appendChild(tdHead);
                        
                        if("heading" in tRows[b]) {
                            tdHead.innerHTML = tRows[b]["heading"];
                        }
                        var tdAdd = document.createElement("td");
                        trAdder.appendChild(tdAdd);
                        var input = document.createElement("input");
                        tdAdd.appendChild(input);
                        
                        if("width" in tRows[b]) {
                            tdAdd.className = tRows[b].width;
                            tdHead.className = tRows[b].width;
                        }
                        input.oninput = function() {
                            simpleAdd[0][b] = input.value;
                            docJSON.pages = jsonUpdate(docJSON.pages,locN,simpleAdd);
                        }
                    })(b);
                   
                    tableG.appendChild(trHeader);
                    tableG.appendChild(trAdder);
                   
                    genEl.appendChild(tableG);
                    genEl.classList.add("table");
                    genEl.classList.add("simpleadditional");
                   
                    if("results" in elLoad) {
                       var oresults = elLoad.results;
                        simpleAdd = elLoad.results;
                        if(oresults.length != 0) {
                            for(var e = 0; e < oresults[0].length;e++) (function(e){
                                trAdder.children[e].getElementsByTagName("input")[0].value = "";
                                trAdder.children[e].getElementsByTagName("input")[0].value = oresults[0][e];
                                trAdder.children[e].getElementsByTagName("input")[0].oninput = function() {
                                    simpleAdd[0][e] = trAdder.children[e].getElementsByTagName("input")[0].value;
                                    docJSON.pages = jsonUpdate(docJSON.pages,locN,simpleAdd);

                                }
                            })(e);
                        }
                        for(var e = 1; e < oresults.length;e++) (function(e){
                            var lastTr = tableG.getElementsByTagName("tr");
                            lastTr = lastTr[lastTr.length - 1];
                            var newTr = lastTr.cloneNode(true);
                            tableG.appendChild(newTr);
                            
                            var newTrInputs = newTr.getElementsByTagName("input");
                            for(var f = 0; f < oresults[e].length;f++) (function(f){
                                newTrInputs[f].value = "";
                                newTrInputs[f].value = oresults[e][f];
                                newTrInputs[f].oninput = function() {
                                    simpleAdd[e][f] = newTrInputs[f].value;
                                    docJSON.pages = jsonUpdate(docJSON.pages,locN,simpleAdd);

                                }
                            })(f);
                        })(e);
                    } 
                   
                    var buttonAdd = document.createElement("button");
                        buttonAdd.classList.add("addRow");
                        buttonAdd.innerHTML = "+ row";
                    
                    buttonAdd.onclick = function () {
                        simpleAdd.push([]);
                        var lastTr = tableG.getElementsByTagName("tr");
                        lastTr = lastTr[lastTr.length - 1];
                        var newTr = lastTr.cloneNode(true);
                        tableG.appendChild(newTr);
                        
                        var newTrInputs = newTr.getElementsByTagName("input");
                        var tableNum = tableG.getElementsByTagName("tr").length -2;
                        for(var b = 0; b < newTrInputs.length;b++) (function(b){
                            newTrInputs[b].oninput = function() {
                                simpleAdd[tableNum][b] = newTrInputs[b].value;
                                docJSON.pages = jsonUpdate(docJSON.pages,locN,simpleAdd);

                            }
                        })(b);
                    }
                           
                    genEl.appendChild(buttonAdd);
                   
                break;
                case "complexadditional": 
                   var comsetAtt = "";
                   for(var z = 0; z < locN.length;z++) {
                       if(z != 0)
                       comsetAtt += ",";
                       comsetAtt += locN[z];
                   }
                   genEl.setAttribute("compdata",comsetAtt);
                   locN.push("rows");
                   var tRows = elLoad.rows;
                   
                   if("name" in elLoad)
                       genEl.innerHTML += "<h2>"+ elLoad.name +"</h2>";  
                                     
                   
                   var rowData = document.createElement("div");
                   rowData.innerHTML = "<div class='groupHead'><span>1</span>: " + elLoad.name + "</div>";

                   rowData.className = "groupRow";
                    var addRow = document.createElement("button");
                   addRow.onclick = function () {
                       var rowData2 = rowData.cloneNode(true);
                       rowData2.getElementsByTagName("span")[0].innerHTML = rowData.parentNode.getElementsByClassName("groupRow").length + 1;
                       rowData.parentNode.insertBefore(rowData2,rowData.parentNode.children[rowData.parentNode.children.length - 1]);
                       
                       
                       var rowData2Inputs = rowData2.getElementsByTagName("input");
                    for(var y = 0; y < rowData2Inputs.length;y++) (function(y){
                        rowData2Inputs[y].oninput = function() {
                            updateComplexAdditional(elLoad.name.replace(' ', '-'));
                        }
                    })(y);
                       
                   }
                   addRow.className = "addRow";
                   addRow.innerHTML = "+ row";
                    for(var q = 0; q < tRows.length;q++) (function(q){
                        let locNB = [q];
                        var locNBC = locN.concat(locNB);
                            docElementLoadIn(locNBC,rowData);
                    })(q);
                    genEl.appendChild(rowData);
                    genEl.appendChild(addRow);
                    genEl.classList.add("complexadd");
                   
                   if("value" in elLoad) {
                       
                       var complexValues = elLoad.value;
                        for(var q = 0; q < complexValues.length;q++) (function(q){
                            addRow.click();
                        })(q);
                       var complexInputs = genEl.getElementsByTagName("input");
                       
                       
                       var totalperrow = parseInt(complexInputs.length / complexValues.length);
                       
                        for(var q = 0; q < complexValues.length;q++) (function(q){
                            for(var h = 0; h < complexValues[q].length;h++) (function(h){
                                let inputCount = (q * totalperrow) + h;
                                complexInputs[inputCount].value = complexValues[q][h];
                            })(h);
                        })(q);
                   }   
                   
                    genEl.classList.add(elLoad.name.replace(' ', '-'));

                break;
                case "simplestep": 
                    locN.push("rows");
                    var tRows = elLoad.rows;
                    for(var y = 0; y < tRows.length;y++) (function(y){
                        
                        if(tRows[y][0].type == "step") {
                            
                            var divA = document.createElement("div");
                                divA.className = "step";

                            if(y == 0)
                                divA.style.display = "flex";

                            if("title" in tRows[y][0])
                                divA.innerHTML = "<h3>"+ tRows[y][0].title + "</h3>";
                            var groupA = tRows[y][0].step;
                            for(var z = 0; z < groupA.length;z++) (function(z){
                                let locNB = [y,0,"step",z];
                                var locNBC = locN.concat(locNB);
                                docElementLoadIn(locNBC,divA);

                            })(z);
                            genEl.appendChild(divA);
                        }
                    })(y);
                   
                   var activeSlide = 0;
                           var genElsteps = genEl.getElementsByClassName("step");
                           genElsteps[0].style.display = "flex";
                           var next = document.createElement("button");
                           var prev = document.createElement("button");
                           next.className = "next";
                           next.onclick = function() {
                               activeSlide++;
                               if(genElsteps.length == activeSlide) {
                                   activeSlide = genElsteps.length - 1;
                               }
                               else {
                                    if(prev.hasAttribute("hide"))
                                        prev.removeAttribute("hide");
                               }
                                if(genElsteps.length - 1 == activeSlide)
                                        next.setAttribute("hide","1");
    TweenMax.fromTo(genElsteps, 0.35, {
        x: "0%",
        opacity: 1
    }, {
        x: "-100%",
        opacity: 0,
        ease: Circ.easeOut,
        onComplete:function() {
             TweenMax.set(genElsteps,  {
                 display:"none"
             });
           for(var h = 0; h < genElsteps.length;h++) {

               if(h == activeSlide) {
                    TweenMax.set(genElsteps[activeSlide],  {
                         display:"flex"
                    });
                    TweenMax.fromTo(genElsteps[activeSlide], 0.35, {
                        x: "100%",
                        opacity: 0
                    }, {
                        x: "0%",
                        opacity: 1,
                        ease: Circ.easeOut
                    });
               }
            }
        }
    });
                           }
                           prev.className = "prev";
                           prev.setAttribute("hide","1");
                           prev.onclick = function() {
                               activeSlide--;
                               if(activeSlide < 0)
                                   activeSlide = 0;
                               
                               if(activeSlide == 0)
                           prev.setAttribute("hide","1");
    TweenMax.fromTo(genElsteps, 0.35, {
        x: "0%",
        opacity: 1
    }, {
        x: "100%",
        opacity: 0,
        ease: Circ.easeOut,
        onComplete:function() {
             TweenMax.set(genElsteps,  {
                 display:"none"
             });
           for(var h = 0; h < genElsteps.length;h++) {

               if(h == activeSlide) {
                    TweenMax.set(genElsteps[activeSlide],  {
                         display:"flex"
                    });
                    TweenMax.fromTo(genElsteps[activeSlide], 0.35, {
                        x: "-100%",
                        opacity: 0
                    }, {
                        x: "0%",
                        opacity: 1,
                        ease: Circ.easeOut
                    });
               }
            }
        }
    });
                           }
                           genEl.appendChild(prev);
                           genEl.appendChild(next);
                           genEl.className = " steps";
                break;
                default: 
                    locN.push("rows");
                    var tRows = elLoad.rows;
                   
            if ("required" in elLoad) {
                genEl.setAttribute("required", elLoad.required);
            }
                    for(var b = 0; b < tRows.length;b++) (function(b){
                        var trRow = document.createElement("tr");
                        for(var c = 0; c < tRows[b].length;c++) (function(c){
                            var tdbox = document.createElement("td");
                            if("colspan" in elLoad.rows[b][c])
                                tdbox.setAttribute("colspan", elLoad.rows[b][c]["colspan"]);
                            var locNB = [b,c];
                            var locNBC = locN.concat(locNB);
                            docElementLoadIn(locNBC,tdbox);
                            trRow.appendChild(tdbox);
                        })(c);
                        tableG.appendChild(trRow);
                    })(b);
                    genEl.appendChild(tableG);
                    genEl.classList.add("table");
                break;
           }
        break;
    }
        
    
        
    }
    if(genEl) {
        if ("colspan" in elLoad)
            genEl.setAttribute("colspan", elLoad.colspan);

        if ("width" in elLoad)
            genEl.classList.add(elLoad.width);

        elParent.appendChild(genEl);
    }
}
var signaturePad;
function saveSignature() {
    let sigCanV = idc("signatureCanvas");
    let dataPng = signaturePad.toDataURL('image/png');
    
    let findToAdd = idc(sigCanV.getAttribute("toadd"));
    findToAdd.getElementsByTagName("img")[0].src = dataPng;
    
    writeTofile(sigCanV.getAttribute("toadd"),dataPng,function() {
        console.log("written signature saved");
    });
    
    closeOverlay("signatureCanvas");
}
function updateComplexAdditional(tableName) {
    var comtMT = document.getElementsByClassName(tableName)[0];
    var comT = comtMT.getElementsByClassName("groupRow");
    var tableD = [];
    for(var i = 0; i < comT.length;i++) (function(i){
        var getInputs = comT[i].getElementsByTagName("input");
        var rowD = [];
        for(var b = 0; b < getInputs.length;b++) (function(b){
            rowD.push(getInputs[b].value);
        })(b);
        tableD.push(rowD);
    })(i);

    var comtMTlen = comtMT.getAttribute("compdata");
    var lens = comtMTlen.split(",");
    lens.push("value");
    console.log("complex thing changed!");
    docJSON.pages = jsonUpdate(docJSON.pages,lens,tableD);
}
        //docJSON.pages = jsonUpdate(docJSON.pages,locN,textinput.value);
function updateInTable(childE) {
    let rowDataSet = [];
    console.log(childE);
        var parentD = childE;
    if(parentD.children) {

        while(!parentD.className.includes("groupRow")) {
            console.log(parentD.parentNode);
            parentD = parentD.parentNode;
        }
        var childNum = 0;
        var cFind = false;


        for(var i = 0; i <  parentD.children.length;i++) (function(i){ 
            if(cFind == false) {
                if(childE == element)
                    cFind == true;
                else
                    childNum++;
            }
        })(i);
        let parentDchildDivs = parentD.getElementsByTagName("div");
        for(var ac = 0; ac < parentDchildDivs.length;ac++) {
            if(parentDchildDivs[ac].classList.contains("textinput"))
                rowDataSet.push(parentDchildDivs[ac].getElementsByTagName("input")[0].value);
            else if(parentDchildDivs[ac].classList.contains("select"))
                rowDataSet.push(parentDchildDivs[ac].getElementsByTagName("select")[0].value);
            else if(parentDchildDivs[ac].classList.contains("textarea"))
                rowDataSet.push(parentDchildDivs[ac].getElementsByTagName("textarea")[0].value);
            else if(parentDchildDivs[ac].classList.contains("checkcontainer")) 
                rowDataSet.push(parentDchildDivs[ac].getElementsByClassName("checkbox")[0].getAttribute("active"));
        }
        docJSON.pages = jsonUpdate(docJSON.pages,hasTable,rowDataSet);
    }
}
function jsonUpdate(jsToChange, layers,vChange) {
    var jsToChangeN = jsToChange;
    if(layers.length != 1) {
        var layersN = layers.slice(0);
        layersN.shift();
        jsToChangeN[layers[0]] = jsonUpdate(jsToChangeN[layers[0]], layersN,vChange);
    }
    else {
        jsToChangeN[layers[0]] = vChange;
    }
    hadChange = true;
    return jsToChangeN;
}
function rtpSend() {
    let jobData = JSON.parse(getCookie("job" + idc("viewJob").getAttribute("jobid")));
    let rtpSendB = idc("rtpSend");
    if (rtpSendB.className != "pulse") {
        let filesUploaded = 0;
        rtpSendB.className = "pulse";
        for (var i = 0; i < jobData.jobdetails.length; i++)(function (i) {

            let docCookie = jobData["clientid"] + "-" + jobData["jobid"] + "-" + jobData["jobdetails"][i]["docid"] + "-Rev" + jobData["jobdetails"][i]["rev"];
            
            readFile(docCookie + ".json", function (response) {

                ajaxRequestToMake(urlInit + "/" + appVersion + "/update/jobdocument",
                    function (ares) {
                        let resJs = JSON.parse(ares);
                        if (resJs.response == "success") {
                            successMessage((i + 1) + "/" + jobData.jobdetails.length);
                        } else {
                            errorMessage("Document not sent");
                        }
                        if (filesUploaded == jobData.jobdetails.length - 1) {
                            successMessage("Complete");
                            rtpSendB.className = "";
                        }
                    }, {
                        filename: docCookie + "-",
                        filedata: response,
                        job: jobData["jobid"]
                    });
                
                var jobDa = JSON.parse(response)["pages"];
                
                for(var b = 0; b < jobDa.length;b++) (function (b) {
                     for(var c = 0; c < jobDa[b].length;c++) (function (c) {
                        if("group" in jobDa[b][c] ) {
                            
                    for(var d = 0; d < jobDa[b][c]["group"].length;d++) (function (d) {
                        if("type" in jobDa[b][c]["group"][d] && "value" in jobDa[b][c]["group"][d]) {
                            if(jobDa[b][c]["group"][d].type == "signature") {
            readFile(jobDa[b][c]["group"][d].value, function (responseS) {
                
                ajaxRequestToMake(urlInit + "/" + appVersion + "/update/jobfile",
                    function (ares) {
                        let resJs = JSON.parse(ares);
                        if (resJs.response == "success") {
                        } else {
                            errorMessage("File not sent");
                        }
                    }, {
                        filename: jobDa[b][c]["group"][d].value + ".png",
                        filedata: responseS,
                        job: jobData["jobid"]
                    });
            });
                            }
                        }
                   })(d);
                        }
                    })(c);
                })(b);
            });
        })(i);
        
    } else {
        errorMessage("sending already in progress");
    }
}



var AjaxFileUploader = function () {
    this._file = null;
    var self = this;

    this.uploadFile = function (uploadUrl, file,inputF) {
        var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.responseText == "" || xhr.responseText.includes("connect ETIMEDOUT"))
                alert('{"response":"Connection timed out", "result":"error"}');
            else
                alert(xhr.responseText);
            
        }
    }
        xhr.open("post", uploadUrl, true);

        xhr.send(file);
    };
};
            
AjaxFileUploader.IsAsyncFileUploadSupported = function () {
    return typeof (new XMLHttpRequest().upload) !== 'undefined';
}

function serverImageUpload(inputFile,serverLoc,params) {
    if(connectionStatus.connected) {
        
         if (AjaxFileUploader.IsAsyncFileUploadSupported) {
            let ajaxFileUploader = new AjaxFileUploader();

            if (inputFile.files.length == 0) {
                alert("no file found");
            } else {
                ajaxFileUploader.uploadFile(
                    serverLoc,
                    params,
                    inputFile.files[0]
                );
            }

        }
    }
}
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
        checkLogin();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {}
};
var devicePlatform;
// Initial Data
var appVersion = "v1";
var urlInit = "https://rtp-app.divinitycomputing.com";
// Login
var test = true;

function checkLogin() {
    if (hasCookie("user") && hasCookie("pass")) {
        ajaxRequestToMake(urlInit + "/" + appVersion + "/login",
            function (response) {
                console.log(response);
                var jsRes = JSON.parse(response);
                if (jsRes.response === "success") {
                    setCookie("stringUserData", response);

                    getMainDashboard();
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
}

function loginInit() {
    var loginPage = idc("loginPage").children[0];
    var tl = new TimelineMax();
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
        .fromTo(loginPage.children[2], 0.4, {
            opacity: 0
        }, {
            opacity: 1,
            ease: Circ.easeOut
        });
}

function loginOrPasswordReset(ev) {
    idc("error").className = "";
    ev.preventDefault();

    var buttonE = ev.target;
    if (!buttonE.hasAttribute("clicked")) {
        buttonE.setAttribute("clicked", "true");

        var passwordCheck = gbc("forgotPass");
        var formL = idc("login").getElementsByTagName("input");

        if (passwordCheck.hasAttribute("prevPhrase")) {
            ajaxRequestToMake(urlInit + "/" + appVersion + "/fgpw",
                function (response) {
                    buttonE.removeAttribute("clicked");
                    var jsRes = JSON.parse(response);
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
            console.log(urlInit + "/" + appVersion + "/login");
            ajaxRequestToMake(urlInit + "/" + appVersion + "/login",
                function (response) {
                    console.log(response);
                    buttonE.removeAttribute("clicked");
                    var jsRes = JSON.parse(response);
                    if (jsRes.response === "success") {
                        getMainDashboard();
                        setCookie("stringUserData", response);
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

function forgotPassword(passwordCheck) {

    var tl = new TimelineMax();
    var login = idc("login");
    var passFieldHide = login.children[1];
    var passFieldDim = elDimensions(passFieldHide);

    if (passwordCheck.hasAttribute("prevPhrase")) {

        var passMB = parseInt(passFieldHide.getAttribute("mb"));

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
        var passMB = parseInt(window.getComputedStyle(passFieldHide).getPropertyValue('margin-bottom'));
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

// User functions 
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
// Menu 
function logout() {
    ajaxRequestGet("pages/login.html",
        function (response) {
            delete_cookie("user");
            delete_cookie("pass");
        },
        "");
}

function defaultMenu() {
    var navString = "";
    var navAdd = basicMenuList;
    for (i = 0; i < navAdd.length; i++) {
        navString += "<li onclick='openPage(\"" + navAdd[i].link + "\",this)'>" + navAdd[i].name + "</li>";
    }
    idc("navMenu").innerHTML += navString;

}

function adminMenu() {
    if (isAdmin()) {
        var navString = "";
        var navAdd = adminMenuList;
        for (i = 0; i < navAdd.length; i++) {
            navString += "<li onclick='openApiPage(\"" + navAdd[i].link + "\",this)'>" + navAdd[i].name + "</li>";
        }
        idc("navMenu").innerHTML += navString;
    }
}
// Main Dashboard

function toggleMobile(ele) {
    var pLinks = idc("panelLinks");
    var pLinksLi = idc("panelLinks").getElementsByTagName("li");
    var tl = new TimelineMax();
    if (ele.getAttribute("active") == "true") {
        ele.setAttribute("active", "false");
        tl.fromTo(pLinks, 0.4, {
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
        tl.fromTo(pLinks, 0.4, {
            x: "100%",
            opacity: 0
        }, {
            x: "0%",
            opacity: 1,
            ease: Circ.easeOut
        });
    }
}

function getMainDashboard() {
    var userData = getUserDataCookie();
    ajaxRequestGet("pages/dashboard.html",
        function (response) {
            idc("centralHub").innerHTML = response;
            adminMenu();
            defaultMenu();

            if (isAdmin()) {
                openApiPage("jobControl");
            } else {
                openPage("myJobs");
            }
            idc("navMenu").children[0].className = "active";
        },
        "");
}
// User Message
function successMessage(messageSuc) {
    var sucMessage = document.createElement("div");
    sucMessage.className = "success";
    sucMessage.innerHTML = '<span>' + messageSuc + "</span>";

    var alertBox = idc("alertBox");
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
        var sucWidth = sucMessage.clientWidth;
        var sucHeight = sucMessage.clientHeight;
        console.log(sucWidth);
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
                //sucMessage.style.display = "none";
            }
        });
    }, 2000);
}

function errorMessage(messageSuc) {
    var sucMessage = document.createElement("div");
    sucMessage.className = "error";
    sucMessage.innerHTML = '<span>' + messageSuc + "</span>";

    var alertBox = idc("alertBox");
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
        var sucWidth = sucMessage.clientWidth;
        var sucHeight = sucMessage.clientHeight;
        console.log(sucWidth);
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

// Page function
function openPage(page, el) {
    if (el) {
        for (i = 0; i < idc("navMenu").children.length; i++) {
            idc("navMenu").children[i].className = "";
        }
        el.className = "active";
        toggleMobile(idc("mobileMenu"));
    }
    ajaxRequestGet("pages/" + page + ".html",
        function (response) {
            console.log(response);
            idc("main").innerHTML = response;
            idc("main").className = page;
        },
        "");
}

function openApiPage(page, el, getR) {
    if (el) {
        for (i = 0; i < idc("navMenu").children.length; i++) {
            idc("navMenu").children[i].className = "";
        }
        el.className = "active";
        toggleMobile(idc("mobileMenu"));
    }
    var fullLoad = {
        "html": false,
        "js": false,
        "css": false
    };
    var pageFullLoad = setInterval(function () {
        if (fullLoad.html && fullLoad.css && fullLoad.js) {
            TweenMax.to("#main", 0.3, {
                opacity: 1,
                 ease: Circ.easeIn,
                y:0
            });
            clearInterval(pageFullLoad);
        }
    }, 150);
    TweenMax.to("#main", 0.3, {
        opacity: 0,
        y:100,onComplete:function() {
    if(!getR)
        getR = "";
    console.log(urlInit + "/" + appVersion + "/pages/" + page + "/index.php");
    ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.php" + getR,
        function (response) {
            idc("main").innerHTML = response;
            idc("main").className = page;
            fullLoad.html = true;

            if (idc("main").children[0].hasAttribute("js")) {
                ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.js",
                    function (response) {
                        var scriptAdd = document.createElement("script");
                        scriptAdd.innerHTML = response;
                        idc("main").children[0].appendChild(scriptAdd);
                        fullLoad.js = true;
                    }, true);
            } else {
                fullLoad.js = true;
            }
       
            if (idc("main").children[0].hasAttribute("css")) {
                ajaxRequestGet(urlInit + "/" + appVersion + "/pages/" + page + "/index.css",
                    function (response) {
                        var cssAdd = document.createElement("style");
                        cssAdd.innerHTML = response; idc("main").children[0].appendChild(cssAdd);
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
    var el = idc(elId);
    el.style.display = "block";
    if (!el.getElementsByClassName("close")[0]) {
        var closeButton = document.createElement("button");
        var closeB = document.createElement("img");
        closeButton.innerHTML = "<span>Close</span>";
        closeButton.appendChild(closeB);
        closeB.src = "/assets/close.svg";
        closeButton.className = "close";
        if (el.children.length == 0)
            el.appendChild(closeButton);
        else
            el.insertBefore(closeButton, el.children[0]);
        closeB.onclick = function () {
            closeOverlay(elId, type);

        }
    }
    var tl = new TimelineMax();
    tl.fromTo(el, 0.5, {
        y: "100%",
        opacity: "0"
    }, {
        y: "0%",
        opacity: "1"
    });

}

function closeOverlay(elId, type) {
    var el = idc(elId);
    var tl = new TimelineMax();

    tl.fromTo(el, 0.5, {
        y: "0%",
        opacity: "1"
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
    Job Functions
*/
var jobJS;
function openJob(jobid) {

    var loadStep = {
        "core": false,
        "documents": false
    };
    if (hasCookie("job" + jobid)) {
        jobJS = JSON.parse(getCookie("job" + jobid));
        console.log(jobJS);
        loadStep.core = true;
    } else {
        ajaxRequestToMake(urlInit + "/" + appVersion + "/data/single-job.php",
            function (response) {
                var jsRes = JSON.parse(response);
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
    var newJob = setInterval(function () {
        if (loadStep.core == true) {
            clearInterval(newJob);
            var jobDe = jobJS["jobdetails"];

            for (i = 0; i < jobDe.length; i++) {
                addDocument(jobDe[i],i,jobJS);
            }
            idc("viewJob").setAttribute("jobid",jobJS["jobid"]);
            idc("viewJob").children[0].innerHTML = jobJS["jobid"] + " - " + jobJS["client"][0]["Company"];
        }
    }, 300);

    ajaxRequestGet("pages/jobs/view-job.html",
        function (response) {
            idc("main").innerHTML = response;
            idc("main").className = "single-job";

        },
        "");
}
function returnDocFilename(docFind) {
    return docFind.data + ".json";
}
function addDocument(docFind, Inter, fullJson) {
    var checkInternal = false;
    for (i = 0; i < avaliableDocs.length; i++) {
        if (docFind.docid == avaliableDocs[i].docid && docFind.rev == avaliableDocs[i].rev)
            checkInternal = true;
    }

        console.log(docFind);
    if (checkInternal) {
        console.log("find from phone");
        readFile(Inter + returnDocFilename(docFind),function(results) {
            addDocRow(docFind, Inter, fullJson,results);
        });
    } else {
        console.log("find from server" );
        console.log(urlInit + "/" + appVersion + "/documents/" + docFind.docid + "/" + docFind.data + docFind.rev + ".json");
        ajaxRequestGet(urlInit + "/" + appVersion + "/documents/" + docFind.docid + "/" + docFind.data + docFind.rev + ".json",
            function (response) {
                writeTofile(Inter + returnDocFilename(docFind), response,function() {
                    //delete_cookie("avaliableDocs");
                    if (hasCookie("avaliableDocs")) {
                        var availDocs = JSON.parse(getCookie("avaliableDocs"));
                        availDocs.push(docFind);
                        setCookie("avaliableDocs", JSON.stringify(availDocs));
                    } else {
                        setCookie("avaliableDocs", "[" + JSON.stringify(docFind) + "]");
                    }
                    addDocRow(docFind, Inter, fullJson,response);
                });
            }, true);
    }
}
function addDocRow(docFind, Inter, fullJson,results) {
        var jsonRow = JSON.parse(results);
    
        var docNew = document.createElement("div");
        docNew.className = "taskBlock";
        docNew.innerHTML = "<div><h3>" + docFind.rev + " - " + docFind.data + "</h3><button>Start</button></div>";
    
        for(i = 0; i < jsonRow["pages"].length;i++) (function(i){ 
            var page = document.createElement("div");
            page.className = "page";
            page.innerHTML = (i + 1) + ". " + jsonRow["pages"][i][0]["page"];
            docNew.appendChild(page);
            page.onclick = function () {
                startDoc(results,i, Inter, fullJson);
                idc("rtpSend").style.display = "none";
            }
        })(i);
    
        docNew.children[0].onclick = function () {
            startDoc(results,null, Inter, fullJson);
                idc("rtpSend").style.display = "none";
        }
        idc("documents").appendChild(docNew);
}

// Document functions
var docJSON = {};
function startDoc(fullDocData,pageNum, Inter, fullJson) {
    var viewJob = idc("viewJob");
    var documentPage = idc("documentPage");
    
    var tl = new TimelineMax();

    tl.to(viewJob, 0.35, {
        opacity: 0,onComplete:function() {
            viewJob.style.display = "none";
            documentPage.style.display = "flex";
        }
    }).to(documentPage, 0.35, {
        opacity: 1
    });
    if(!pageNum)
        pageNum = 0;
    var docCookie = fullJson["clientid"] + "-" + fullJson["jobid"] + "-" + fullJson["jobdetails"][Inter]["docid"] + "-Rev" + fullJson["jobdetails"][Inter]["rev"] + ".json";
    console.log(docCookie);
    readFile(docCookie, function(response) {
        if(response == "" || response == null) {
            console.log("create internal doc");
            fullDocData.file = docCookie;
            writeTofile(docCookie,fullDocData, function() {
            docJSON = JSON.parse(fullDocData);
            loadFromJson(pageNum);
            });
        }
        else {
            console.log("find internal doc");
            docJSON = JSON.parse(response);
            loadFromJson(pageNum);
        }
    });
}
function loadFromJson(pageNum) {
    var pgLoad = docJSON.pages[pageNum];
    
    var canUpdate = false;
    var hadChange = false;
    var readyToUpdate = false;
    var savedInterval = setInterval(function(){ 
        canUpdate = true;
        if(hadChange) {
            hadChange = false;
            canUpdate = false;
            readyToUpdate = true;
        }
        if(canUpdate && readyToUpdate) {
            console.log("save to file");
            var fullDocData = JSON.stringify(docJSON);
            writeTofile(docJSON.file,fullDocData, function() {
            });
            hadChange = false;
            canUpdate = false;
            readyToUpdate = false;
        }
    }, 1500);
    idc("documentPage").innerHTML = "";
    TweenMax.fromTo(idc("documentPage"), 0.35, {
                y: "100%",
                opacity: 0
            }, {
                y: "0%",
                opacity: 1,
                ease: Circ.easeOut
            });
    
    for(i = 1; i < pgLoad.length;i++)(function(i){ 
        
            var genEl;
            switch(pgLoad[i].type) {
                case "title":
                    genEl = document.createElement("h2");
                    genEl.innerHTML = pgLoad[i].title;
                    genEl.className = "title";
                break;
                case "subtitle":
                    genEl = document.createElement("h3");
                    genEl.innerHTML = pgLoad[i].title;
                    genEl.className = "subtitle";
                break;
                case "text":
                    genEl = document.createElement("p");
                    genEl.className = "text";
                    genEl.innerHTML = pgLoad[i].text;
                break;
                case "seperator":
                    
                    genEl = document.createElement("hr");
                    genEl.className = "seperator";
                break;
                case "textinput":
                    genEl = document.createElement("div");
                    if("label" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].label;
                        genEl.appendChild(label);
                    }
                        var spaninput = document.createElement("span");
                        var input = document.createElement("input");
                    if("value" in pgLoad[i]) {
                       input.value = pgLoad[i].value;
                    }
                    input.onchange = function () {
                        docJSON.pages[pageNum][i].value = input.value;
                        hadChange = true;
                    }
                    if("append" in pgLoad[i]) {
                        spaninput.setAttribute("append",pgLoad[i]["append"]);
                    }
                        spaninput.appendChild(input);
                        genEl.appendChild(spaninput);
                    genEl.className = "textinput";
                break;
                case "textarea":
                    genEl = document.createElement("div");
                    if("label" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].label;
                        genEl.appendChild(label);
                    }
                        var textarea = document.createElement("textarea");
                    if("value" in pgLoad[i]) {
                       textarea.value = pgLoad[i].value;
                    }
                    textarea.onchange = function () {
                        docJSON.pages[pageNum][i].value = textarea.value;
                        hadChange = true;
                    }
                        genEl.appendChild(textarea);
                    genEl.className = "textarea";
                break;
                case "checkbox":
                    genEl = document.createElement("div");
                    if("label" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].label;
                        genEl.appendChild(label);
                    }
                        var input = document.createElement("div");
                    if("value" in pgLoad[i]) {
                       if(pgLoad[i].value)
                            input.setAttribute("active","true");
                    }
                    input.onclick = function() {
                        hadChange = true;
                        if(input.hasAttribute("active")) {
                           input.removeAttribute("active");
                            docJSON.pages[pageNum][i].value = false;
                        }
                        else {
                            input.setAttribute("active","true");
                            docJSON.pages[pageNum][i].value = true;
                        }
                    }
                    input.className = "checkbox";
                    
                    genEl.appendChild(input);
                    if("append" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].append;
                        genEl.appendChild(label);
                    }
                    
                    genEl.className = "checkcontainer";
                break;
                case "select":
                    genEl = document.createElement("div");
                    if("label" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].label;
                        genEl.appendChild(label);
                    }
                        var select = document.createElement("select");
                    var sOptions = pgLoad[i].options;
                    for(b = 0; b < sOptions.length;b++) {
                        var option = document.createElement("option");
                        option.value = sOptions[b].option;
                        option.innerHTML = sOptions[b].option;
                        select.appendChild(option);
                    }
                    if("value" in pgLoad[i]) {
                       select.value = pgLoad[i].value;
                    }
                    if(pgLoad[i].options.length != 0)
                    docJSON.pages[pageNum][i].value = pgLoad[i].options[0].option;
                    select.onchange = function () {
                        docJSON.pages[pageNum][i].value = select.value;
                        hadChange = true;
                    }
                    select.className = "select";
                        genEl.appendChild(select);
                    genEl.className = "select";
                break;
                case "radioinput":
                    genEl = document.createElement("div");
                    if("label" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].label;
                        genEl.appendChild(label);
                    }
                    var sOptions = pgLoad[i].options;
                    for(b = 0; b < sOptions.length;b++) (function(b){ 
                        
                        var parentObj = document.createElement("div");
                    if("label" in sOptions[b]) {
                        var label = document.createElement("label");
                        label.innerHTML = sOptions[b].label;
                        parentObj.appendChild(label);
                    }
                    switch(sOptions[b].type) {
                        case "checkbox": 
                            var option = document.createElement("div");
                            option.className = "checkbox ";
                            parentObj.className = "checkcontainer ";
                            if("width" in sOptions[b])
                            parentObj.className += sOptions[b].width;
                            parentObj.appendChild(option);
                            
                    if("value" in sOptions[b]) {
                       if(sOptions[b].value)
                            option.setAttribute("active","true");
                    }
                             option.onclick = function() {
            if(option.hasAttribute("active")) {
               option.removeAttribute("active");
                docJSON.pages[pageNum][i].options[b].value = false;
            }
            else {
                option.setAttribute("active","true");
                docJSON.pages[pageNum][i].options[b].value = true;
            }
                        hadChange = true;
        }
                            
                            break;
                        case "textinput": 
                            var option = document.createElement("input");
                            parentObj.className = "textinput ";
                            if("width" in sOptions[b])
                            parentObj.className += sOptions[b].width;
                            parentObj.appendChild(option);
                           
                    if("value" in sOptions[b]) {
                       option.value = sOptions[b].value;
                    }  
                    option.onchange = function () {
                        docJSON.pages[pageNum][i].options[b].value = option.value;
                        hadChange = true;
                    }
                            break;
                    }
                    genEl.appendChild(parentObj);
                     })(b);
                    genEl.className = "radio";
                break;
                case "table":
                    genEl = document.createElement("div");
                    
                    var tableG = document.createElement("table");
                    
                    var tableType = pgLoad[i].table;
                    console.log(tableType);
                   switch(tableType) {
                        case "simpleadditional": 
                            var tRows = pgLoad[i].rows;
                           var trHead = document.createElement("tr");
                            for(b = 0; b < tRows.length;b++) {
                                var tdbox = document.createElement("td");
                                tdbox.innerHTML = tRows[b].heading;
                                if("width" in tRows[b])
                                tdbox.className = tRows[b].width;
                                trHead.appendChild(tdbox);
                            }
                                tableG.appendChild(trHead);
                           var trNorm = document.createElement("tr");
                           
                           //docJSON.pages[pageNum][i]
                            var simpleAdd = [[]];
                            for(b = 0; b < tRows.length;b++) (function(b){ 
                                simpleAdd[0].push("");
                                var tdHead = document.createElement("td");
                                var input = document.createElement("input");
                                if("width" in tRows[b])
                                    tdHead.className = tRows[b].width;
                                tdHead.append(input);
                                input.onchange = function() {
                                    simpleAdd[0][b] = input.value;
                                    docJSON.pages[pageNum][i].results = simpleAdd;
                        hadChange = true;
                                }
                                trNorm.appendChild(tdHead);
                            })(b);
                                tableG.appendChild(trNorm);
                           
                    if("results" in docJSON.pages[pageNum][i]) {
                       var oresults = docJSON.pages[pageNum][i].results;
                        for(e = 0; e < oresults.length;e++) {
                            var lastTr = tableG.getElementsByTagName("tr");
                            lastTr = lastTr[lastTr.length - 1];
                            var newTr = lastTr.cloneNode(true);
                            tableG.appendChild(newTr);
                            var tCellsI = newTr.getElementsByTagName("input")[0];
                            for(f = 0; f < oresults[e].length;f++) {
                                tCellsI[f].value = oresults[e][f];
                            }
                        }
                    } 
                    genEl.appendChild(tableG);
                    genEl.className = "table simpleadditional";
                           
                    var buttonAdd = document.createElement("button");
                        buttonAdd.className = "addRow";
                        buttonAdd.innerHTML = "+ row";
                    
                    buttonAdd.onclick = function () {
                        simpleAdd.push([]);
                        var lastTr = tableG.getElementsByTagName("tr");
                        lastTr = lastTr[lastTr.length - 1];
                        var newTr = lastTr.cloneNode(true);
                        tableG.appendChild(newTr);
                        
                        var newTrInputs = newTr.getElementsByTagName("input");
                        var tableNum = tableG.getElementsByTagName("tr").length -2;
                        for(b = 0; b < newTrInputs.length;b++) (function(b){
                            newTrInputs[b].onchange = function() {
                                simpleAdd[tableNum][b] = newTrInputs[b].value;
                                docJSON.pages[pageNum][i].results = simpleAdd;
                            }
                        })(b);
                    }
                           
                    genEl.appendChild(buttonAdd);
                            
                        break;
                       case "complexadditional":
                            var tRows = pgLoad[i].rows;
                            
                           if("name" in pgLoad[i])
                           genEl.innerHTML += "<h2>"+ pgLoad[i].name +"</h2>";
                           
                            var rowData = document.createElement("div");
                           rowData.innerHTML = "<div class='groupHead'><span>1</span>: "+ pgLoad[i].name +"</div>";
                           rowData.className = "groupRow";
                            var addRow = document.createElement("button");
                           addRow.onclick = function () {
                               var rowData2 = rowData.cloneNode(true);
                               rowData2.getElementsByTagName("span")[0].innerHTML = rowData.parentNode.getElementsByClassName("groupRow").length + 1;
                               rowData.parentNode.insertBefore(rowData2,rowData.parentNode.children[rowData.parentNode.children.length - 1]);
                           }
                           addRow.className = "addRow";
                           addRow.innerHTML = "+ row";
                            for(b = 0; b < tRows.length;b++) (function(b){
                                var typeOfRow = tRows[b].type;
                                switch(typeOfRow) {
                                    case "group":
                                var grouptRows = tRows[b].rows;
                                   rowData.innerHTML += "<h2>" + tRows[b].group + "</h2>";     
                for(c = 0; c < grouptRows.length;c++) (function(c){
                    
                    var grouptRowsType = grouptRows[c].type;
                    switch(grouptRowsType) {
                        case "textinput": 
                            
                            var divLa = document.createElement("div");  
                            divLa.className = "textinput";
                            var label = document.createElement("label");  
                                label.innerHTML = grouptRows[c].heading;
                            var input = document.createElement("input"); 
                            input.onchange = function () {
                                docJSON.pages[pageNum][i].rows[b].rows[c].value = input.value;
                                hadChange = true;
                            }
                                divLa.appendChild(label);
                                divLa.appendChild(input); 
                                rowData.appendChild(divLa); 
                        break;
                        case "group-heading": 
                            
                            var sectionGroupHeading = document.createElement("section"); 
                            var h2a = document.createElement("h2"); 
                            h2a.innerHTML = grouptRows[c].heading;
                            var grHeadRow = grouptRows[c].group;
                            sectionGroupHeading.appendChild(h2a);
                    for(d = 0; d < grHeadRow.length;d++) (function(d){
                        
                        var grouptRowsDType = grHeadRow[d].type;
                        switch(grouptRowsDType) {
                            case "group-heading": 
                                
                            var subsubSec = document.createElement("section"); 
                            var subh2a = document.createElement("h3"); 
                            subh2a.innerHTML = grHeadRow[d].heading;
                            var subSRow = grHeadRow[d].group;
                            subsubSec.appendChild(subh2a);
                    for(e = 0; e < subSRow.length;e++) (function(e){
                        var subSRowEt = subSRow[e].type;
                        switch(subSRowEt) {
                            case "textinput": 
                                
                            var divLa = document.createElement("div"); 
                    divLa.className = "textinput";
                            var label = document.createElement("label");  
                                label.innerHTML = subSRow[e].heading;
                            var input = document.createElement("input"); 
                            input.onchange = function () {
                                docJSON.pages[pageNum][i].rows[b].rows[c].group[d].group[e].value = input.value;
                        hadChange = true;
                            }
                            divLa.appendChild(label);
                            divLa.appendChild(input);
                            subsubSec.appendChild(divLa);
                            break;
                        }
                    })(e);
                            sectionGroupHeading.appendChild(subsubSec);

                                break;
                            case "textinput": 
                                
                            var divLa = document.createElement("div"); 
                    divLa.className = "textinput";
                            var label = document.createElement("label");  
                                label.innerHTML = grHeadRow[d].heading;
                            var input = document.createElement("input"); 
                            divLa.appendChild(label);
                            divLa.appendChild(input);
                            input.onchange = function () {
                                docJSON.pages[pageNum][i].rows[b].rows[c].group[d].value = input.value;
                        hadChange = true;
                            }
                            sectionGroupHeading.appendChild(divLa);
                                break;
                        }
                    })(d);
                            
                            rowData.appendChild(sectionGroupHeading);
                        break;
                    }
                    
                })(c);
                                        
                                    break;
                                }
                            })(b);
                    genEl.appendChild(rowData);
                    genEl.appendChild(addRow);
                    genEl.className = "complexadd";
                       break;
                       case "simplestep":
                           
                            var tRows = pgLoad[i].rows;
                           
                            for(b = 0; b < tRows.length;b++) (function(b){
                                var tType = tRows[b][0].type;
                                
                                switch(tType) {
                                       case "step":
                              
                                var divA = document.createElement("div");
                                        divA.className = "step";
                                        
                                if(b == 0)
                                    divA.style.display = "flex";
                                        
                                if("title" in tRows[b][0])
                                    divA.innerHTML = "<h3>"+ tRows[b][0].title + "</h3>";
                                    
                                var groupA = tRows[b][0].step;
  
for(c = 0; c < groupA.length;c++) (function(c){
    var cType = groupA[c].type;
    switch(cType) {
        case "text":
            var textI = document.createElement("p");
            textI.innerHTML = "<b>"+ groupA[c].column + "</b>" + groupA[c].text;
            divA.appendChild(textI);
            textI.className = "text";
            break;
        case "textinput":
    var textI = document.createElement("div");
        if("column" in groupA[c]) {
            var label = document.createElement("label");
            label.innerHTML = groupA[c].column;
            textI.appendChild(label);
        }
            var input = document.createElement("input");
        if("value" in groupA[c]) {
            input.value = groupA[c].value;
        }
        input.onchange = function () {
            docJSON.pages[pageNum][i].rows[b][0].step[c].value = input.value;
                        hadChange = true;
        }
            textI.appendChild(input);
        textI.className = "textinput ";
                                if("width" in groupA[c])
                                textI.className += groupA[c].width;
            divA.appendChild(textI);
            break;
        case "textarea":
    var textI = document.createElement("div");
        if("column" in groupA[c]) {
            var label = document.createElement("label");
            label.innerHTML = groupA[c].column;
            textI.appendChild(label);
        }
            var input = document.createElement("textarea");
        if("value" in groupA[c]) {
            input.value = groupA[c].value;
        }
        input.onchange = function () {
            docJSON.pages[pageNum][i].rows[b][0].step[c].value = input.value;
            console.log(docJSON);
        }
            textI.appendChild(input);
        textI.className = "textinput ";
                                if("width" in groupA[c])
                                textI.className += groupA[c].width;
            divA.appendChild(textI);
            break;
        case "checkbox":
                    var textI = document.createElement("div");
                    if("column" in groupA[c]) {
                        var label = document.createElement("label");
                        label.innerHTML = groupA[c].column;
                        textI.appendChild(label);
                    }
                    var input = document.createElement("div");
                 
                    if("value" in groupA[c]) {
                       if(groupA[c].value)
                            option.setAttribute("active","true");
                    }
                    input.onclick = function() {
                        if(input.hasAttribute("active")) {
                           input.removeAttribute("active");
                            docJSON.pages[pageNum][i].rows[b][0].step[c].value = false;
                        }
                        else {
                            input.setAttribute("active","true");
                            docJSON.pages[pageNum][i].rows[b][0].step[c].value = true;
                        }
                        hadChange = true;
                    }
                    input.className = "checkbox";
                    
                    textI.appendChild(input);
                    
                    textI.className = "checkcontainer ";
                                if("width" in groupA[c])
                                textI.className += groupA[c].width;
            divA.appendChild(textI);
            break;
    }
})(c);       
                                     genEl.appendChild(divA);   
                                       break;
                               }
                            })(b);
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
           for(h = 0; h < genElsteps.length;h++) {

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
           for(h = 0; h < genElsteps.length;h++) {

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
                            var tRows = pgLoad[i].rows;
                            var tableData = [];
                            for(b = 0; b < tRows.length;b++) (function(b){
                                var tableRowData = [];
                            var trRow = document.createElement("tr");
                            for(c = 0; c < tRows[b].length;c++) (function(c){
                                var tdbox = document.createElement("td");
                                switch(tRows[b][c].type) {
                                    case "text":
                                        tdbox.innerHTML = tRows[b][c].text;
                                        tableRowData.push("");
                                    break;
                                    case "lim":
                                        
                                var select = document.createElement("select");
                                    select.innerHTML = '<option value="n/a">n/a</option><option value="yes">&#10004</option><option value="LIM">LIM</option>';
                                        tableRowData.push("n/a");
                                        tdbox.appendChild(select);
                                        if("results" in docJSON.pages[pageNum][i]) {
                                            
        if(docJSON.pages[pageNum][i].results[b][c]) {
            select.value = docJSON.pages[pageNum][i].results[b][c];
        }
                                        }
        select.parentNode.onclick = function() {
            var selIndex = 2;
            for(d = 0; d < select.children.length;d++) {
                if(select.value == select.children[d].getAttribute("value")) {
                    selIndex = d;
                }
            }
            selIndex++;
            if(selIndex > select.children.length  - 1)
                selIndex = 0;
            select.selectedIndex = selIndex;
            tableData[b][c] = select.value;
            docJSON.pages[pageNum][i].results = tableData;
                        hadChange = true;
        }
                                    break;
                                    case "textinput":
                                        tableRowData.push("");
                                        var input = document.createElement("input");
                                        if("results" in docJSON.pages[pageNum][i]) {
        if(docJSON.pages[pageNum][i].results[b[c]]) {
            input.value = docJSON.pages[pageNum][i].results[b][c];
        }        
                                        }
                                        input.onchange = function () {
                                            tableData[b][c] = input.value;
                                            docJSON.pages[pageNum][i].results = tableData;
                        hadChange = true;
                                        }
                                        tdbox.appendChild(input);
                                    break;
                                }
                                if("width" in tRows[b][c])
                                tdbox.className = tRows[b][c].width;
                                if("colspan" in tRows[b][c])
                                tdbox.setAttribute("colspan",tRows[b][c].colspan);
                                trRow.appendChild(tdbox);
                            })(c);
                                tableData.push(tableRowData);
                                tableG.appendChild(trRow);
                            })(b);
                         
                    genEl.appendChild(tableG);
                    docJSON.pages[pageNum][i].results = tableData;
                    genEl.className = "table standard";
                           
                           break;
                       
                    }
                    
                break;
                case "list":
                    genEl = document.createElement("div");
                    var ulL = document.createElement("ul");
                    
                    var sOptions = pgLoad[i].list;
                    for(b = 0; b < sOptions.length;b++) {
                        var ulLEl = document.createElement("li");
                        ulLEl.innerHTML = sOptions[b].text;
                        ulL.appendChild(ulLEl);
                    }
                    
                    genEl.className = "list";
                    genEl.appendChild(ulL);
                break;
                case "key":
                    genEl = document.createElement("section");
                    genEl.innerHTML = "<h2>"+ pgLoad[i].heading + "</h2>";
                    
                    var keyList = pgLoad[i].keylist;
                    
                    for(b = 0;b < keyList.length;b++) {
                        var pT = document.createElement("p");
                        pT.innerHTML = "<span>"+ keyList[b].title + ": </span>" + keyList[b].text;
                        genEl.appendChild(pT);
                    }
                    genEl.className = "keylist";
                break;
                case "group":
                    genEl = document.createElement("div");
                    
                    var sOptions = pgLoad[i].group;
                    for(b = 0; b < sOptions.length;b++) (function(b){
                        switch(sOptions[b].type) {
                case "text":
                    var textP = document.createElement("p");
                    textP.className = "text";
                    textP.innerHTML = sOptions[b].text;
                                genEl.appendChild(textP);
                break;
                case "textinput":  
                    var textIn = document.createElement("div");
                    if("label" in sOptions[b]) {
                        var label = document.createElement("label");
                        label.innerHTML = sOptions[b].label;
                        textIn.appendChild(label);
                    }
                        var spaninput = document.createElement("span");
                        var input = document.createElement("input");
        if("value" in sOptions[b]) {
            input.value = sOptions[b].value;
        }   
                    input.onchange = function () {
                        docJSON.pages[pageNum][i].group[b].value = input.value;
                        hadChange = true;
                    }
                    if("append" in sOptions[b]) {
                        spaninput.setAttribute("append",sOptions[b]["append"]);
                    }
                        spaninput.appendChild(input);
                        textIn.appendChild(spaninput);
                        genEl.appendChild(textIn);
                    textIn.className = "textinput";
                    if("width" in sOptions[b])
                        textIn.className += " " + sOptions[b].width;
                break;
                case "checkbox": 
                    var option = document.createElement("div");
                    option.className = "checkbox ";
                    if("width" in sOptions[b])
                        option.className = sOptions[b].width;
                    if("label" in sOptions[b]) {
                        var label = document.createElement("label");
                        label.innerHTML = sOptions[b].label;
                        option.appendChild(label);
                    }
                        var input = document.createElement("div");
                                
                    if("value" in sOptions[b]) {
                       if(sOptions[b].value)
                            input.setAttribute("active","true");
                    }
                    input.onclick = function() {
                        hadChange = true;
                        if(input.hasAttribute("active")) {
                           input.removeAttribute("active");
                            docJSON.pages[pageNum][i].group[b].value = false;
                        }
                        else {
                            input.setAttribute("active","true");
                            docJSON.pages[pageNum][i].group[b].value = true;
                        }
                    }
                    input.className = "checkbox";
                    
                    option.appendChild(input);
                    if("append" in pgLoad[i]) {
                        var label = document.createElement("label");
                        label.innerHTML = pgLoad[i].append;
                        option.appendChild(label);
                    }
                    if("width" in sOptions[b])
                        option.className += " " + sOptions[b].width;
                    
                    option.className = "checkcontainer";
                    genEl.appendChild(option);
                break;
                        }
                    })(b);
                    
                    genEl.className = "group";
                break;
            }
            if("width" in pgLoad[i]) {
                genEl.className += " " + pgLoad[i].width;
            }
        idc("documentPage").appendChild(genEl);
    })(i);
    
    var nextDoc = document.createElement("button");
    nextDoc.className = "finalButton";
    if(docJSON.pages.length -1 == pageNum) {
        nextDoc.innerHTML = "Complete";
        nextDoc.onclick = function () {
    var viewJob = idc("viewJob");
    var documentPage = idc("documentPage");
    
    var tl = new TimelineMax();

    tl.to(documentPage, 0.35, {
        opacity: 0,onComplete:function() {
            viewJob.style.display = "block";
            documentPage.style.display = "none";
        }
    }).to(viewJob, 0.35, {
        opacity: 1
    });
        }
    }
    else {
        nextDoc.innerHTML = "Next page";
        nextDoc.onclick = function () {
            TweenMax.fromTo(idc("documentPage"), 0.35, {
                    y: "0%",
                    opacity: 1
                }, {
                    y: "100%",
                    opacity: 0,
                    ease: Circ.easeOut,onComplete:function() {
                        loadFromJson(pageNum + 1);
                        idc("main").scrollTop = 0;
                    }
                });
        }
    }
    idc("documentPage").appendChild(nextDoc);
}
function rtpSend() {
    var jobData = JSON.parse(getCookie("job" + idc("viewJob").getAttribute("jobid")));
    console.log(jobData);
    var rtpSendB = idc("rtpSend");
    console.log(rtpSendB);
    if(rtpSendB.className != "pulse") {
        var filesUploaded = 0;
        rtpSendB.className = "pulse";
        for(i = 0; i < jobData.jobdetails.length;i++) (function(i){

        var docCookie = jobData["clientid"] + "-" + jobData["jobid"] + "-" + jobData["jobdetails"][i]["docid"] + "-Rev" + jobData["jobdetails"][i]["rev"];
        readFile(docCookie + ".json", function(response) {

            ajaxRequestToMake(urlInit + "/" + appVersion + "/update/jobdocument",
                function (ares) {
                    var resJs = JSON.parse(ares);
                    if(resJs.response == "success") {
                        successMessage((i + 1) + "/" + jobData.jobdetails.length);
                    }
                else {
                    errorMessage("Document not sent");
                }
                if(filesUploaded == jobData.jobdetails.length - 1) {
                    successMessage("Complete");
        rtpSendB.className = "";
                }
            }, {
                filename:docCookie + "-",
                filedata:response,
                job:jobData["jobid"]
            });
        });
        })(i);
    }
    else {
        errorMessage("sending already in progress");
    }
}
// Navigation 

var basicMenuList = [{
    "name": "My Jobs",
    "link": "jobs/myJobs"
}, {
    "name": "Account",
    "link": "account"
}];
var adminMenuList = [{
    "name": "Job Control",
    "link": "jobControl"
}, {
    "name": "User Control",
    "link": "userControl"
}, {
    "name": "Form Creator",
    "link": "formCreator"
}];
/*
    DOCUMENTS
{docid: "1", data: "electrical-installation-condition-report-form", rev: "0"}
*/
var avaliableDocs = [];

delete_cookie("avaliableDocs");
if (hasCookie("avaliableDocs"))
    avaliableDocs = JSON.parse(getCookie("avaliableDocs"));

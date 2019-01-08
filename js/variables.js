// Navigation 
/* 
, {
    "name": "Account",
    "link": "account"
} */
var basicMenuList = [{
    "name": "My Jobs",
    "link": "jobs/myJobs",
    "function": "startJobSearch",
    "options":[
        {
            "option":"Active"
        },
        {
            "option":"In Review"
        },
        {
            "option":"Completed"
        }
    ]
},{
    "name": "My Test instruments",
    "link": "test-instruments",
    "function": "getTestIntruments"
}];
var adminMenuList = [{
    "name": "Job Control",
    "link": "jobControl",
    "options":[
        {
            "option":"Active"
        },
        {
            "option":"In Review"
        },
        {
            "option":"Completed"
        }
    ]
}, {
    "name": "User Control",
    "link": "userControl"
}, {
    "name": "Client Control",
    "link": "clientControl"
},
                     /*{
    "name": "Form Creator",
    "link": "formCreator"
}*/];
/*
    DOCUMENTS
{docid: "1", data: "electrical-installation-condition-report-form", rev: "0"}
*/
var avaliableDocs = [];

 //  deleteAllCookies();
//delete_cookie("avaliableDocs");
if (hasCookie("avaliableDocs"))
    avaliableDocs = JSON.parse(getCookie("avaliableDocs"));

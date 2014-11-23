/*
 * Course Authoring Javascript Controller
 * Author: Chi Zhang, Fei Han, Haoda Zou, Weichuan Hong
 */

/*
 * 
 * Course Authoring whole scale
 * 
 */

//Course authoring initialize
var CA = CA || {};

CA.Parent = function() {};
CA.Child = function() {};

//every module should be in CA object
CA.nameSpace = function(ns){
	var parts = ns.split('.'),
		parent = CA,
		i;
	
	if(parts[0] === 'CA'){
		parts = parts.slice(1);
	}
	
	for(i = 0; i < parts.length; i++){
		if(typeof(parent[parts[i]]) === 'undefined'){
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	return parent;
}

//use nameSpace function to safely create objects
//current operation pointer
CA.nameSpace('pointer');

CA.pointer = {
	//username and group info
	usr : 'admin',
	grp : 'admins',
	//currently operating course, activity, provider
	cid : '',
	aid : '',
	pid : ''
}

//warehouse for current data
CA.nameSpace('wareHouse');
CA.wareHouse = {
	domains : [],
	courses : [],
	activities : [],
	authors : [],
	providers : []
}

//init()
CA.nameSpace('init');
CA.init = function(){
	//get all data needed from the server (stupid and slow)
	this.request('GetData', {usr : this.pointer.usr, grp : this.pointer.grp});
}

/*
 * 
 * Ajax Request Part
 * 
 */

//universal request sender
CA.nameSpace('request');
CA.request = function(actionURL, args){
	$.get(actionURL, args, function(data){
		//using eval is an unsafe method, however I haven found out an alternative way
		//since the text from servlet is not standard JSON string
		rs = eval('(' + data + ')');
		CA.receive(actionURL, rs.data);
	}, "text");
}

//universal receiver
CA.nameSpace('receive');
CA.receive = function(actionName, rs){
	//use error handler to feedback
	if(typeof(rs) === 'undefined')
		this.ajaxError('Unable to connect to the server.');
	//call relevant handler to further process the result
	this[actionName + 'Handler'](rs);
}

//universal ajaxError handler
CA.nameSpace('ajaxError');
CA.ajaxError = function(etype){
	console.log(etype);
}

//GetData receive handler
CA.nameSpace('GetDataHandler');
CA.GetDataHandler = function(rs){
	this.wareHouse.domains = rs.domains;
	this.wareHouse.courses = rs.courses;
	this.wareHouse.activities = rs.activities;
	this.wareHouse.authors = rs.authors;
	this.wareHouse.providers = rs.providers;
	//initialize the display for the first time
	this.initDisplay();
}

/*
 * 
 * Display Part
 * 
 */

/*
//initialize the display
CA.nameSpace('initDisplay');
CA.initDisplay = function(){
	//formatting the data
	//call View object's newCourse circularly
}

//view object is the controller of DOM operations
CA.nameSpace('view');
CA.view = {
		newCourse : function(courseInfo){
		}
}
*/

/*
 * 
 * Deploy Part
 * 
 */

//-------------------------------------
//test code
//delete when it's done
CA.init();
//test code ends
//-------------------------------------

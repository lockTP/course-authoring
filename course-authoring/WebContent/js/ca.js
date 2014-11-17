/*------------------------
Course Authoring Javascript Controller
Author: Chi Zhang, Fei Han, Haoda Zou, Weichuan Hong
-------------------------*/

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
	usr : 'admin',
	grp : 'admins'
}

//use nameSpace function to safely create objects
//universal request sender
CA.nameSpace('request');

CA.request = function(actionURL, args){
	$.get(actionURL, args, function(data){
		//using eval is an unsafe method, however I haven found out an alternative way
		//since the text from servlet is not standard JSON string
		rs = eval('(' + data + ')');
		CA.receiver(actionURL, rs.data);
	}, "text");
}

//universal receiver
CA.nameSpace('receiver');

CA.receiver = function(actionName, rs){
	console.log(actionName, rs);
}


//-------------------------------------
//test code
//delete when it's done
CA.request('GetData', CA.pointer);
//test code ends
//-------------------------------------

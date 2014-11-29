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
	cid : '78',
	aid : '461',
	uid : '535',
	rid : '101',
	pid : 'webex'
}

//UnitList
//There is a function in java called UnitGetList, I don't know where should I put it.
CA.nameSpace('unitList');
CA.unitList = {
		
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

//ActSetIdx()
CA.nameSpace('ActSetIdx');
CA.ActSetIdx = function(idx, idxDelta){
	if (idxDelta === 0) return;
	if (idxDelta > 0 && idx === this.warehouse.acvtivities.length - 1) return;
	if (idxDelta < 0 && idx === 0) return;
	
	this.request('ActSetIdx', {idx : idx, course_id : this.pointer.cid, unit_id : this.pointer.uid, act_id : this.pointer.aid, res_id : this.pointer.rid, idxDelta : idxDelta });
}

//ResSetIdx
CA.nameSpace('ResSetIdx');
CA.ResSetIdx = function(idx, idxDelta){
//	if (idxDelta === 0) return;
//	if (idxDelta > 0 && idx === this.warehouse.courses.resources.length - 1) return;
//	if (idxDelta < 0 && idx === 0) return;
	
	this.request('ResSetIdx', {idx : idx, course_id : this.pointer.cid, res_id : this.pointer.rid, idxDelta : idxDelta });
}

//UnitSetIdx
CA.nameSpace('UnitSetIdx');
CA.UnitSetIdx = function(idx, idxDelta){
//	if (idxDelta === 0) return;
//	if (idxDelta > 0 && idx === this.warehouse.courses.resources.length - 1) return;
//	if (idxDelta < 0 && idx === 0) return;
	
	this.request('UnitSetIdx', {idx : idx, course_id : this.pointer.cid, unit_id : this.pointer.uid, idxDelta : idxDelta });
	
}

//CourseAdd()
CA.nameSpace('CourseAdd');
CA.CourseAdd = function(name, code, desc, domain, visible){
	this.request('CourseAdd', {name : name, code : code, desc : desc, domain : domain, visible : visible, usr : this.pointer.usr});
}

//CourseClone()
CA.nameSpace('CourseClone');
CA.CourseClone = function(name){
	this.request('CourseClone', {course_id : this.pointer.cid, name : name, usr : this.pointer.usr});
}

//CourseDelete()
CA.nameSpace('CourseDelete');
CA.CourseDelete = function(){
	this.request('CourseDelete',{course_id : this.pointer.cid});
}

//CourseEdit()
CA.nameSpace('CourseEdit');
CA.CourseEdit = function(name, code, desc, domain, visible){
	this.request('CourseEdit',{course_id : this.pointer.cid, name : name, code : code, desc : desc, domain : domain, visible : visible, usr : this.pointer.usr});
}

//ResAdd()
CA.nameSpace('ResAdd');
CA.ResAdd = function(name){
	this.request('ResAdd',{course_id : this.pointer.cid, name : name, usr : this.pointer.usr});
}

//ResDelete
CA.nameSpace('ResDelete');
CA.ResDelete = function(){
	this.request('ResDelete',{course_id : this.pointer.cid, res_id : this.pointer.rid});
}

//ResEdit
CA.nameSpace('ResEdit');
CA.ResEdit = function(name){
	this.request('ResEdit',{name : name, course_id : this.pointer.cid, res_id : this.pointer.rid});
}

//ResProvAdd
CA.nameSpace('ResProvAdd');
CA.ResProvAdd = function(){
	this.request('ResProvAdd',{course_id : this.pointer.cid, res_id : this.pointer.rid, prov_id : this.pointer.pid});
}

//ResProvRemove
CA.nameSpace('ResProvRemove');
CA.ResProvRemove = function(){
	this.request('ResProvRemove',{course_id : this.pointer.cid, res_id : this.pointer.rid, prov_id : this.pointer.pid});
}

//UnitAdd
CA.nameSpace('UnitAdd');
CA.UnitAdd = function(name){
	this.request('UnitAdd',{course_id : this.pointer.cid, usr : this.pointer.usr, name : name});
}

//UnitAddAct
CA.nameSpace('UnitAddAct');
CA.UnitAddAct = function(){
	this.request('UnitAddAct',{usr : this.pointer.usr, course_id : this.pointer.cid, unit_id : this.pointer.uid, res_id : this.pointer.rid, act_id : this.pointer.aid});
}

//UnitDelete
CA.nameSpace('UnitDelete');
CA.UnitDelete = function(){
	this.request('UnitDelete',{course_id : this.pointer.cid, unit_id : this.pointer.uid});
}

//UnitEdit
CA.nameSpace('UnitEdit');
CA.UnitEdit = function(name){
	this.request('UnitEdit',{name : name, course_id : this.pointer.cid, unit_id : this.pointer.uid});
}

//UnitGetList
//There might be a typo in java class. It should be UnitGetList instead of UnitGetLst
CA.nameSpace('UnitGetLst')
CA.UnitGetLst = function(){
	this.request('UnitGetLst',{course_id : this.pointer.cid})
}

//UnitRemoveAct
CA.nameSpace('UnitRemoveAct')
CA.UnitRemoveAct = function(){
	this.request('UnitRemoveAct',{course_id : this.pointer.cid, unit_id : this.pointer.uid, res_id : this.pointer.rid, act_id : this.pointer.aid})
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
		CA.receive(actionURL, rs);
	}, "text");
}

//universal receiver
CA.nameSpace('receive');
CA.receive = function(actionName, rs){
	//use error handler to feedback
	if(typeof(rs) === 'undefined')
		this.ajaxError('Unable to connect to the server.');
	CA.outcomeValidation(actionName, rs);
	//call relevant handler to further process the result
//	this[actionName + 'Handler'](rs);
}

//outcome validation
CA.nameSpace('outcomeValidation');
CA.outcomeValidation = function(actionName, rs){
	if(rs.outcome == "true"){
		this[actionName + 'Handler'](rs);
	}else{
		console.log("Fail to execute database.")
	}
}

//universal ajaxError handler
CA.nameSpace('ajaxError');
CA.ajaxError = function(etype){
	console.log(etype);
}

//GetData receive handler
CA.nameSpace('GetDataHandler');
CA.GetDataHandler = function(rs){
	this.wareHouse.domains = rs.data.domains;
	this.wareHouse.courses = rs.data.courses;
	this.wareHouse.activities = rs.data.activities;
	this.wareHouse.authors = rs.data.authors;
	this.wareHouse.providers = rs.data.providers;
	//initialize the display for the first time
	$('#test').removeAttr("disabled").click(function(){testFunc()});
	$('#testdisplay').removeAttr("disabled").click(function(){CA.initDisplay()});
//	this.initDisplay();
}

//ActSetIdx receive handler
CA.nameSpace('ActSetIdxHandler');
CA.ActSetIdxHandler = function(rs){

	
}

//ResSetIdx receive handler
CA.nameSpace('ResSetIdxHandler');
CA.ResSetIdxHandler = function(rs){
	
}

//UnitSetIdx receive handler
CA.nameSpace('UnitSetIdxHandler');
CA.nameSpaceHandler = function(rs){
	
}

//CourseAdd receive handler
CA.nameSpace('CourseAddHandler');
CA.CourseAddHandler = function(rs){
	newCourse = rs.course;
	this.wareHouse.courses.push(newCourse);
}

//CourseClone receive handler
CA.nameSpace('CourseCloneHandler');
CA.CourseCloneHandler = function(rs){
	newCourse = rs.course;
	this.wareHouse.courses.push(newCourse);
}

//CourseDelete receive handler
CA.nameSpace('CourseDeleteHandler');
CA.CourseDeleteHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			this.wareHouse.courses.splice(i,1);
		}
	}
}

//CourseEdit receive handler
CA.nameSpace('CourseEditHandler');
CA.CourseEditHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.course.id){
			this.wareHouse.courses[i] = rs.course;
		}
	}
}

//ResAdd receive handler
CA.nameSpace('ResAddHandler');
CA.ResAddHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			rs.res.providerIds = [];
			this.wareHouse.courses[i].resources.push(rs.res);
		}
	}
}

//ResDelete receive handler
CA.nameSpace('ResDeleteHandler');
CA.ResDeleteHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].resources.length; j++){
				if(this.wareHouse.courses[i].resources[j].id == rs.resId){
					this.wareHouse.courses[i].resources.splice(j,1);
					return;
				}
			}
		}
	}
}

//ResEdit receive handler
CA.nameSpace('ResEditHandler');
CA.ResEditHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].resources.length; j++){
				if(this.wareHouse.courses[i].resources[j].id == rs.resId){
					var newrs = this.wareHouse.courses[i].resources[j];
					newrs.id = rs.resId;
					newrs.name = rs.name;
					this.wareHouse.courses[i].resources[j] = newrs;
					return;
				}
			}
		}
	}
}

//ResProvAdd receive handler
CA.nameSpace('ResProvAddHandler');
CA.ResProvAddHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].resources.length; j++){
				if(this.wareHouse.courses[i].resources[j].id == rs.resId){
					this.wareHouse.courses[i].resources[j].providerIds.push(rs.provId);
					return;
				}
			}
		}
	}
}

//ResProvRemove receive handler
CA.nameSpace('ResProvRemoveHandler');
CA.ResProvRemoveHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].resources.length; j++){
				if(this.wareHouse.courses[i].resources[j].id == rs.resId){
					for(k = 0; k< this.wareHouse.courses[i].resources[j].providerIds.length; k++){
						if(this.wareHouse.courses[i].resources[j].providerIds[k] == rs.provId){
							this.wareHouse.courses[i].resources[j].providerIds.splice(k,1);
							return;
						}
					}
				}
			}
		}
	}
}

//UnitAdd receive handler
CA.nameSpace('UnitAddHandler');
CA.UnitAddHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			rs.unit.activityIds = [];
//			We don't need to create empty resources for activityIds. They can be generated when an activityId is added.
//			var res = this.wareHouse.courses[i].resources;
//			for(var j = 0; j < res.length; j++){
//				rs.unit.activityIds[res[j].id] = [];
//			}
			this.wareHouse.courses[i].units.push(rs.unit);
			return;
		}
	}
}

//UnitAddAct receive handler
CA.nameSpace('UnitAddActHandler');
CA.UnitAddActHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].units.length; j++){
				if(this.wareHouse.courses[i].units[j].id == rs.unitId){
					if(this.wareHouse.courses[i].units[j].activityIds[rs.resId] == undefined){
						this.wareHouse.courses[i].units[j].activityIds[rs.resId] = [];
					}
					this.wareHouse.courses[i].units[j].activityIds[rs.resId].push(rs.actId);
					return;
				}
			}
		}
	}
}

//UnitDelete receive handler
CA.nameSpace('UnitDeleteHandler');
CA.UnitDeleteHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].units.length; j++){
				if(this.wareHouse.courses[i].units[j].id == rs.unitId){
					this.wareHouse.courses[i].units.splice(j,1);
					return;
				}
			}
		}
	}
}

//UnitEdit receive handler
CA.nameSpace('UnitEditHandler');
CA.UnitEditHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].units.length; j++){
				if(this.wareHouse.courses[i].units[j].id == rs.unitId){
					var newUnit = this.wareHouse.courses[i].units[j];
					newUnit.name = rs.name;
					this.wareHouse.courses[i].units[j] = newUnit;
					return;
				}
			}
		}
	}
}

//UnitGetList receive handler
CA.nameSpace('UnitGetLstHandler');
CA.UnitGetLstHandler = function(rs){
	this.unitList = rs;
	console.log(this.unitList);
}

//UnitRemoveAct receive handler
CA.nameSpace('UnitRemoveAct');
CA.UnitRemoveActHandler = function(rs){
	for(i = 0; i < this.wareHouse.courses.length; i++){
		if(this.wareHouse.courses[i].id == rs.courseId){
			for(j = 0; j < this.wareHouse.courses[i].units.length; j++){
				if(this.wareHouse.courses[i].units[j].id == rs.unitId){
					for(k = 0; k < this.wareHouse.courses[i].units[j].activityIds[rs.resId].length; k++)
						if(this.wareHouse.courses[i].units[j].activityIds[rs.resId][k] = rs.act_id){
							this.wareHouse.courses[i].units[j].activityIds[rs.resId].splice(k,1);
							return;
						}
				}
			}
		}
	}
}



/*
 * 
 * Display Part
 * 
 */


//initialize the display
CA.nameSpace('initDisplay');
CA.initDisplay = function(){
//	formatting the data
//	call View object's newCourse circularly
	console.log(this.wareHouse);
}

//view object is the controller of DOM operations
CA.nameSpace('view');
CA.view = {
		newCourse : function(courseInfo){
		}
}


/*
 * 
 * Deploy Part
 * 
 */

//-------------------------------------
//test code
//delete when it's done
CA.init();
function testFunc(){
//	CA.CourseClone("testClone");
//	CA.CourseAdd("testName","testCode","testDescription","JAVA","1");
//	CA.CourseEdit("testNameEidt02","testCodeEdit","testDescriptionEdit","JAVA","1");
//	CA.CourseDelete();
//	CA.ResAdd("testResAdd");
//	CA.ResDelete();
//	CA.ResEdit("testResEdit04");
//	CA.ResProvAdd();
//	CA.ResProvRemove();
//  CA.UnitAdd("unitAddTest");
//	CA.UnitAddAct();
//	CA.UnitDelete();
//	CA.UnitEdit("testUnitEdit01");
	CA.UnitGetLst();
//	CA.UnitRemoveAct();
//	CA.UnitSetIdx();
}

//CA.initDisplay();
//test code ends
//-------------------------------------




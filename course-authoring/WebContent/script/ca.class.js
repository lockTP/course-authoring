/*
 * Course Authoring Javascript Controller
 * Author: Chi Zhang, Fei Han, Haoda Zou, Weichuan Hong
 * Group 3
 * INFSCI 2470 Final Project
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
};

//use nameSpace function to safely create objects
//UnitList
//There is a function in java called UnitGetList, I don't know where should I put it.
CA.nameSpace('unitList');
CA.unitList = {};

//warehouse for current data
CA.nameSpace('wareHouse');
CA.wareHouse = {
	domains : [],
	courses : [],
	activities : [],
	authors : [],
	providers : []
};

/*
 * 
 * Actions
 * 
 */
CA.nameSpace('actions');
CA.actions = {
		//current operation pointer
		pointer : {
			//username and group info
			usr : 'admin',
			grp : 'admins',
			//currently operating course, activity, provider
			cid : '',
			cIdx : '',
			aid : '',
			uid : '',
			uIdx : '',
			rid : '',
			pid : '',
			itemTargetIdx : '',
		},
		
		//pointer resetter
		resetP : function(){
			this.pointer = {
					//username and group info
					usr : 'admin', grp : 'admins',
					//currently operating course, activity, provider
					cid : '', cIdx : '',
					aid : '',
					uid : '', uIdx : '',
					rid : '', pid : '', itemTargetIdx : '',
			};
		},
		
		init : function(){
			//deploy
			CA.deploy();
			//get all data needed from the server (stupid and slow)
			CA.request('GetData', {
				usr : this.pointer.usr,
				grp : this.pointer.grp
				});
		},

		//return the row of current course
		getCInfo : function(){
			for(var i = 0; i < CA.wareHouse.courses.length; i++){
			}
		},
		
		//return the name of one certain resource
		getResourceName : function(rId){
			for(var i = 0; i < CA.wareHouse.courses[this.pointer.cIdx].resources.length; i++){
				var id = CA.wareHouse.courses[this.pointer.cIdx].resources[i].id;
				if(id == rId){
					var name = CA.wareHouse.courses[this.pointer.cIdx].resources[i].name;
					return name;
				}
			}
		},
		
		//return one row of activity
		getOneActivity : function(aId){
			for(var i = 0; i < CA.wareHouse.activities.length; i++){
				var id = CA.wareHouse.activities[i].id;
				if(id == aId){
					var row = CA.wareHouse.activities[i];
					//console.log(row);
					return row;
				}
			}
		},
		
		//get the formatted action list
		getActivities : function(uIdx){
			//get the correct resource list
			var rList = CA.wareHouse.courses[this.pointer.cIdx].resources,
				wholeList = CA.wareHouse.courses[this.pointer.cIdx].units[uIdx].activityIds,
				aList = {};

			for(var i = 0; i < rList.length; i++){
				var rId = rList[i].id;
				var rName = rList[i].name;
				//get resourse names
				aList[rId+'-'+rName] = [];
				
				//get activity id and names
				if(!(typeof(wholeList[rId]) === 'undefined')){
					for(var j = 0; j < wholeList[rId].length; j++){
						var aId = wholeList[rId][j];
						var aInfo = this.getOneActivity(aId);
						aList[rId+'-'+rName].push(aInfo);
					}
				}
			}
			console.log(aList);
			return aList;
		},
		
		//return formatted domain object
		getDomains : function(){
			var domain = {};
			for(var i = 0; i < CA.wareHouse.domains.length; i++){
				domain[CA.wareHouse.domains[i].id] = CA.wareHouse.domains[i].name;
			}
			return domain;
		},
		
		//return all possible providers for this course
		getPros : function(){
			var dId = CA.wareHouse.courses[this.pointer.cIdx].domainId,
				providers = CA.wareHouse.providers,
				pList = [];
			
			for(var i = 0; i < providers.length; i++){
				if(dId == providers[i].domainId){
					pList.push(providers[i]);
				}
			}
			return pList;
		},
		
		//gives out an activity list for display
		getPool : function(){
			var query = this.gather.activityQuery(),
				whole = CA.wareHouse.activities,
				len = whole.length,
				rs = [],
				i, a;
			console.log('Now, pool list is searched by following query:')
			console.log(query);
			
			for (i = 0; i < len; i++){
				a = whole[i];
				if(a.authorId == query.auid){
					if(a.providerId == query.pid){
						if(query.patt1.test(a.name) || query.patt2.test(a.name)){
							rs.push(a);	
						}
					}
				}
			}
			
			return(rs);
		},
		
		//object to gather form information
		gather : {
			courseEdit : function(){
				var newData = {},
					dialog = $('#cEditDialog');
				//get the name
				newData.name = dialog.find('.cName').val().trim();
				//get the code
				newData.code = dialog.find('.cCode').val().trim();
				//get the domain
				newData.domain = dialog.find('.cDomain option:selected').prop('value');
				//get the visible
				var v = dialog.find('.cVisible').prop('checked');
				newData.visible = v ? 1 : 0;
				return newData;
			},
			
			courseAdd : function(){
				var newData = {},
					dialog = $('#cAddDialog');
				//get the name
				newData.name = dialog.find('.cName').val().trim();
				//get the code
				newData.code = dialog.find('.cCode').val().trim();
				//get the domain
				newData.domain = dialog.find('.cDomain option:selected').prop('value');
				//get the visible
				var v = dialog.find('.cVisible').prop('checked');
				newData.visible = v ? 1 : 0;
				return newData;
			},
			
			activityQuery : function(){
				var query = {};
				query.pid = $('#providers').find('option:selected').attr('pid');
				query.auid = $('#aAuthor').find('option:selected').attr('auid');
				
				var keyword = $('#aNameQuery').val();
				query.patt1 = new RegExp('^'+keyword, 'i');
				query.patt2 = new RegExp(keyword, 'gi');
				
				return query; 
			}
		},
		
		//ActSetIdx()
		ActSetIdx : function(idx, newIdx){
			console.log('now doing activity index change');
			var index = parseInt(idx), newIndex = parseInt(newIdx);
			//console.log(this.pointer);
			//console.log(index + ' ' + newIndex);
			if(index < newIndex){
				console.log('the item is descending');
				var aId = CA.wareHouse.courses[this.pointer.cIdx].units[this.pointer.uIdx]
					.activityIds[this.pointer.rid][index+1];
				CA.request('ActSetIdx', {idx:index, course_id:this.pointer.cid, unit_id:this.pointer.uid,
					act_id:aId, res_id:this.pointer.rid, idxDelta:'1'});
			}else if(index > newIndex){
				console.log('the item is ascending');
				var aId = CA.wareHouse.courses[this.pointer.cIdx].units[this.pointer.uIdx]
					.activityIds[this.pointer.rid][index-1];
				CA.request('ActSetIdx', {idx:index, course_id:this.pointer.cid, unit_id:this.pointer.uid,
					act_id:aId, res_id:this.pointer.rid, idxDelta:'-1'});
			}
		},
		
		//ResSetIdx
		ResSetIdx : function(idx, newIdx){
			console.log('now doing resource index change');
			var index = parseInt(idx), newIndex = parseInt(newIdx);
			//which is smaller
			if(index < newIndex){
				console.log('the item is descending');
					var rId = CA.wareHouse.courses[this.pointer.cIdx].resources[index+1].id;
					CA.request('ResSetIdx', {idx:index, course_id:this.pointer.cid, res_id:rId, idxDelta:'1'});	
			}else if(index > newIndex){
				console.log('the item is ascending');
				var rId = CA.wareHouse.courses[this.pointer.cIdx].resources[index-1].id;
				CA.request('ResSetIdx', {idx:index, course_id:this.pointer.cid, res_id:rId, idxDelta:'-1'});
			}
		},
		
		//UnitSetIdx
		UnitSetIdx : function(idx, newIdx){
			console.log('now doing unit index change');
			//which is smaller
			var index = parseInt(idx), newIndex = parseInt(newIdx);
			//console.log(index + ' ' + newIndex);
			if(index < newIndex){
				console.log('the item is descending');
				var uId = CA.wareHouse.courses[this.pointer.cIdx].units[index+1].id;
				//console.log('index is ' + i + ' and the other ID is '+ uId);
				CA.request('UnitSetIdx', {idx:index, course_id:this.pointer.cid, unit_id:uId, idxDelta:'1'});
			}else if(index > newIndex){
				console.log('the item is ascending');
				var uId = CA.wareHouse.courses[this.pointer.cIdx].units[index-1].id;
				CA.request('UnitSetIdx', {idx:index, course_id:this.pointer.cid, unit_id:uId, idxDelta:'-1'});
			}
		},
		
		//CourseAdd()
		CourseAdd : function(obj){
			console.log(obj)
			CA.request('CourseAdd',{name:obj.name, code:obj.code, desc:obj.desc, domain:obj.domain,
				visible:obj.visible, usr:this.pointer.usr});
		},
		
		//CourseClone()
		CourseClone : function(name){
			if(name == CA.wareHouse.courses[this.pointer.cIdx].name){
				CA.view.infoMsg('Please use a different name.');
			}else{
				CA.request('CourseClone', {course_id:this.pointer.cid, name:name, usr:this.pointer.usr});
			}
		},

		//CourseDelete()
		CourseDelete : function(str){
			if(str === 'DELETE'){
				console.log('confirmed to delete');
				CA.request('CourseDelete',{course_id:this.pointer.cid});
			}else{
				CA.view.infoMsg('Please check your type. [use UPPERCASE]');
			}
		},

		//CourseEdit()
		CourseEdit : function(obj){
			console.log(obj);
			CA.request('CourseEdit',{course_id:this.pointer.cid, name:obj.name, code:obj.code,
				desc:obj.desc, domain:obj.domain, visible:obj.visible, usr:this.pointer.usr});
		},

		//ResAdd()
		ResAdd : function(name){
			var len = name.length;
			if(len == 0 || len === 'undefined'){
				CA.view.infoMsg('Please enter a name.');
			}else{
				CA.request('ResAdd',{course_id:this.pointer.cid, name:name,	usr:this.pointer.usr});
			}
		},

		//ResDelete
		ResDelete : function(str){
			if(str === 'DELETE'){
				console.log('confirmed to delete');
				CA.request('ResDelete',{course_id:this.pointer.cid, res_id:this.pointer.rid});
			}else{
				CA.view.infoMsg('Please check your type. [use UPPERCASE]');
			}
		},

		//ResEdit
		ResEdit : function(name){
			console.log(CA.actions.pointer);
			console.log('new name is: ' + name);
			CA.request('ResEdit',{name:name, course_id:this.pointer.cid, res_id:this.pointer.rid});
		},

		//ResProvAdd
		ResProvAdd : function(){
			CA.request('ResProvAdd',{
				course_id : this.pointer.cid,
				res_id : this.pointer.rid,
				prov_id : this.pointer.pid
				});
		},

		//ResProvRemove
		ResProvRemove : function(){
			CA.request('ResProvRemove',{
				course_id : this.pointer.cid,
				res_id : this.pointer.rid,
				prov_id : this.pointer.pid
				});
		},

		//UnitAdd
		UnitAdd : function(name){
			var len = name.length;
			if(len == 0 || len === 'undefined'){
				CA.view.infoMsg('Please enter a name.');
			}else{
				CA.request('UnitAdd',{course_id:this.pointer.cid, usr:this.pointer.usr, name:name});
			}
		},

		//UnitAddAct
		UnitAddAct : function(){
			console.log('\nAbout to add new activity to this unit, this is the pointer now');
			console.log(this.pointer);
			
			CA.request('UnitAddAct',{
				usr : this.pointer.usr,
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid,
				res_id : this.pointer.rid,
				act_id : this.pointer.aid
			});
		},

		//UnitDelete
		UnitDelete : function(str){
			if(str === 'DELETE'){
				console.log('confirmed to delete');
				CA.request('UnitDelete',{course_id:this.pointer.cid, unit_id:this.pointer.uid});
			}else{
				CA.view.infoMsg('Please check your type. [use UPPERCASE]');
			}
		},

		//UnitEdit
		UnitEdit : function(name){
			console.log(CA.actions.pointer);
			console.log('new name is: ' + name);
			
			var len = name.length;
			if(len == 0 || len === 'undefined'){
				CA.view.infoMsg('Please enter a name.');
			}else{
				CA.request('UnitEdit',{name:name, course_id:this.pointer.cid, unit_id:this.pointer.uid});
			}
		},

		//UnitGetList
		//There might be a typo in java class. It should be UnitGetList instead of UnitGetLst
		UnitGetLst : function(){
			CA.request('UnitGetLst',{
				course_id : this.pointer.cid
				})
		},

		//UnitRemoveAct
		UnitRemoveAct : function(str){
			if(str === 'DELETE'){
				console.log('confirmed to delete, now the pointer is:');
				console.log(CA.actions.pointer);
				CA.request('UnitRemoveAct',{
					course_id : this.pointer.cid,
					unit_id : this.pointer.uid,
					res_id : this.pointer.rid,
					act_id : this.pointer.aid
				});
			}else{
				CA.view.infoMsg('Please check your type. [use UPPERCASE]');
			}
		},
};


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
};

//universal receiver
CA.nameSpace('receive');
CA.receive = function(actionName, rs){
	//use error handler to feedback
	if(typeof(rs) === 'undefined')
		this.ajaxError('Unable to connect to the server.');
	CA.outcomeValidation(actionName, rs);
	//call relevant handler to further process the result
//	this[actionName + 'Handler'](rs);
};

//outcome validation
CA.nameSpace('outcomeValidation');
CA.outcomeValidation = function(actionName, rs){
	if(rs.outcome == "true"){
		this.handlers[actionName + 'Handler'](rs);
	}else{
		console.log("Fail to execute database.")
	}
};

//universal ajaxError handler
CA.nameSpace('ajaxError');
CA.ajaxError = function(etype){
	console.log(etype);
};

//handlers of Ajax request
CA.nameSpace('handlers');
CA.handlers = {
		//GetData receive handler
		GetDataHandler : function(rs){
			CA.wareHouse.domains = rs.data.domains;
			CA.wareHouse.courses = rs.data.courses;
			CA.wareHouse.activities = rs.data.activities;
			CA.wareHouse.authors = rs.data.authors;
			CA.wareHouse.providers = rs.data.providers;
			//initialize the display for the first time
			CA.view.initDisplay();
			//$('#test').removeAttr("disabled").click(function(){testFunc()});
			//$('#testdisplay').removeAttr("disabled").click(function(){CA.initDisplay()});
		},
		
		//ActSetIdx receive handler
		ActSetIdxHandler : function(rs){
			var index = parseInt(rs.idx);
			console.log('results:');
			console.log(rs);
			//get the right listName
			var rName = CA.actions.getResourceName(rs.resId),
				listName = rs.resId + '-' + rName;
			//call next move
			CA.view.dragListRender.newSeq(listName, rs.idx, (parseInt(rs.idx) + parseInt(rs.idxDelta)));
			if(rs.idxDelta > 0){
				CA.actions.ActSetIdx(index + 1, CA.actions.pointer.itemTarIdx);
			}else if(rs.idxDelta < 0){
				CA.actions.ActSetIdx(index - 1, CA.actions.pointer.itemTarIdx);
			}
		},
		
		//ResSetIdx receive handler
		ResSetIdxHandler : function(rs){
			var index = parseInt(rs.idx);
			console.log('results:');
			console.log(rs);
			//call next move
			CA.view.dragListRender.newSeq('resources', rs.idx, (parseInt(rs.idx) + parseInt(rs.idxDelta)));
			if(rs.idxDelta > 0){
				CA.actions.ResSetIdx(index + 1, CA.actions.pointer.itemTarIdx);
			}else if(rs.idxDelta < 0){
				CA.actions.ResSetIdx(index - 1, CA.actions.pointer.itemTarIdx);
			}
		},

		//UnitSetIdx receive handler
		UnitSetIdxHandler : function(rs){
			var index = parseInt(rs.idx);
			//console.log('results:');
			//console.log(rs);
			CA.view.dragListRender.newSeq('units', rs.idx, (parseInt(rs.idx) + parseInt(rs.idxDelta)));
			//call next move
			if(rs.idxDelta > 0){
				CA.actions.UnitSetIdx(index + 1, CA.actions.pointer.itemTarIdx);
			}else if(rs.idxDelta < 0){
				CA.actions.UnitSetIdx(index - 1, CA.actions.pointer.itemTarIdx);
			}
		},
		
		//CourseAdd receive handler
		CourseAddHandler : function(rs){
			newCourse = rs.course;
			CA.wareHouse.courses.push(newCourse);
			console.log('\nAdd completed. Here is the result:');
			console.log(rs);
			//close the dialog
			$('#cAddDialog').dialog('close');
			//remind the user course added
			//CA.view.infoMsg('Course added. You may use the return button below to switch courses.');
			//init
			$("#cListDialog").dialog("close");
			CA.view.initDisplay();
		},

		//CourseClone receive handler
		CourseCloneHandler : function(rs){
			newCourse = rs.course;
			CA.wareHouse.courses.push(newCourse);
			//close the clone dialog
			$('#cCloDialog').dialog('close');
			//remind the user it is cloned
			CA.view.infoMsg('Course cloned.');
		},
		
		//CourseDelete receive handler
		CourseDeleteHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					CA.wareHouse.courses.splice(i,1);
					break;
				}
			}
			console.log('\nDeletion completed. Here is the result:');
			console.log(CA.wareHouse.courses);
			//close the dialog
			$('#cDelDialog').dialog('close');
			//reset the pointer
			CA.actions.resetP();
			CA.view.initDisplay();
			//remind the user the course is deleted
			CA.view.infoMsg('Course deleted.');
		},
		
		//CourseEdit receive handler
		CourseEditHandler : function(rs){
			//add a new row to the course list
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.course.id){
					CA.wareHouse.courses[i] = rs.course;
					break;
				}
			}
			console.log('\nEdit completed. Here is the result:');
			console.log(CA.wareHouse.courses[CA.actions.pointer.cIdx]);
			//update courseInfo
			CA.view.cInfoRefresh(CA.actions.pointer.cIdx);
			//close the dialog
			$('#cEditDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Course info updated.');
		},

		//ResAdd receive handler
		ResAddHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					rs.res.providerIds = [];
					CA.wareHouse.courses[i].resources.push(rs.res);
					break;
				}
			}
			console.log('\nAdd completed. Here is the result:');
			console.log(rs);
			console.log(CA.wareHouse.courses[CA.actions.pointer.cIdx].resources);
			//close the dialog
			$('#rAddDialog').dialog('close');
			//add one to the rlist
			CA.view.dragListRender.addItem('resources', rs.res.name);
			//uAndA empty
			CA.view.uaEmpty();
			//remind the user it is added
			CA.view.infoMsg('Resource added to the last. And the unit\'s activity list has been refreshed.');
		},
		
		//ResDelete receive handler
		ResDeleteHandler : function(rs){
			console.log('yes');
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							CA.wareHouse.courses[i].resources.splice(j,1);
							break;
						}
					}
					break;
				}
			}
			console.log('\nDeletion completed. Here is the result:');
			console.log(rs);
			//delete this resource in view
			CA.view.itemDelete('resources', CA.view.getItemIndex('resources'));
			//uAndA empty
			CA.view.uaEmpty();
			//close the dialog
			$('#rDelDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Resource deleted. And the unit\'s activity list has been refreshed.');
		},
		
		//ResEdit receive handler
		ResEditHandler : function(rs){
			//modify the info in wareHouse
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							var newrs = CA.wareHouse.courses[i].resources[j];
							newrs.id = rs.resId;
							newrs.name = rs.name;
							CA.wareHouse.courses[i].resources[j] = newrs;
							break;
						}
					}
					break;
				}
			}
			console.log('\nEdit completed. Here is the result:');
			console.log(CA.wareHouse.courses[CA.actions.pointer.cIdx].resources[CA.view.getItemIndex('resources')]);
			//update the resource name in view
			CA.view.itemRefresh('resources', CA.view.getItemIndex('resources'));
			//uAndA empty
			CA.view.uaEmpty();
			//close the dialog
			$('#rEditDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Resource info updated. And the unit\'s activity list has been refreshed.');
		},

		//ResProvAdd receive handler
		ResProvAddHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							CA.wareHouse.courses[i].resources[j].providerIds.push(rs.provId);
							return;
						}
					}
				}
			}
		},

		//ResProvRemove receive handler
		ResProvRemoveHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							for(k = 0; k< CA.wareHouse.courses[i].resources[j].providerIds.length; k++){
								if(CA.wareHouse.courses[i].resources[j].providerIds[k] == rs.provId){
									CA.wareHouse.courses[i].resources[j].providerIds.splice(k,1);
									return;
								}
							}
						}
					}
				}
			}
		},
		
		//UnitAdd receive handler
		UnitAddHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					rs.unit.activityIds = [];
					var res = CA.wareHouse.courses[i].resources;
					for(var j = 0; j < res.length; j++){
						rs.unit.activityIds[res[j].id] = [];
					}
					CA.wareHouse.courses[i].units.push(rs.unit);
					break;
				}
			}
			console.log('\nAdd completed. Here is the result:');
			console.log(rs);
			//close the dialog
			$('#uAddDialog').dialog('close');
			//add one to the rlist
			CA.view.dragListRender.addItem('units', rs.unit.name);
			//do the unit change bind;
			$('#units').children().last().click(function(){
				CA.view.actInit($(this).index());
			});
			//remind the user it is added
			CA.view.infoMsg('New unit has been added to the last.');
		},
		
		//UnitAddAct receive handler
		UnitAddActHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].units.length; j++){
						if(CA.wareHouse.courses[i].units[j].id == rs.unitId){
							if(CA.wareHouse.courses[i].units[j].activityIds[rs.resId] == undefined){
								CA.wareHouse.courses[i].units[j].activityIds[rs.resId] = [];
							}
							CA.wareHouse.courses[i].units[j].activityIds[rs.resId].push(rs.actId);
							break;
						}
					}
					break;
				}
			}
			console.log('\nActivity added, here is the result:');
			console.log(rs);
			//add the new item in to the list
			CA.view.aNewActivity(rs.resId, rs.actId);
		},

		//UnitDelete receive handler
		UnitDeleteHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].units.length; j++){
						if(CA.wareHouse.courses[i].units[j].id == rs.unitId){
							CA.wareHouse.courses[i].units.splice(j,1);
							break;
						}
					}
					break;
				}
			}
			console.log('\nDeletion completed. Here is the result:');
			console.log(rs);
			//delete this unit in view
			CA.view.itemDelete('units', CA.view.getItemIndex('units'));
			//uAndA empty
			CA.view.uaEmpty();
			//close the dialog
			$('#uDelDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Unit deleted. And the unit list has been refreshed.');
		},
		
		//UnitEdit receive handler
		UnitEditHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].units.length; j++){
						if(CA.wareHouse.courses[i].units[j].id == rs.unitId){
							var newUnit = CA.wareHouse.courses[i].units[j];
							newUnit.name = rs.name;
							CA.wareHouse.courses[i].units[j] = newUnit;
							break;
						}
					}
					break;
				}
			}
			console.log('\nEdit completed. Here is the result:');
			console.log(CA.wareHouse.courses[CA.actions.pointer.cIdx].units[CA.view.getItemIndex('units')]);
			//update the resource name in view
			CA.view.itemRefresh('units', CA.view.getItemIndex('units'));
			//close the dialog
			$('#uEditDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Unit info updated.');
		},

		//UnitGetList receive handler
		UnitGetLstHandler : function(rs){
			CA.unitList = rs;
			console.log(CA.unitList);
		},

		//UnitRemoveAct receive handler
		UnitRemoveActHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].units.length; j++){
						if(CA.wareHouse.courses[i].units[j].id == rs.unitId){
							for(k = 0; k < CA.wareHouse.courses[i].units[j].activityIds[rs.resId].length; k++){
								if(CA.wareHouse.courses[i].units[j].activityIds[rs.resId][k] = rs.act_id){
									CA.wareHouse.courses[i].units[j].activityIds[rs.resId].splice(k,1);
									break;
								}
							}
							break;
						}
					}
					break;
				}
			}
			console.log('\nDeletion completed. Here is the result:');
			console.log(rs);
			//delete this unit in view
			var listName = $('#activities div:visible ol').attr('id'),
				idx = CA.view.getItemIndex(listName);
			
			CA.view.itemDelete(listName, idx);
			//close the dialog
			$('#aDelDialog').dialog('close');
			//remind the user it is edited
			CA.view.infoMsg('Activity deleted.');
		},
};


/*
 * 
 * Display Part
 * 
 */


//view object is the controller of DOM operations
CA.nameSpace('view');
CA.view = {
		//initialize the display
		initDisplay : function(){
			//display a course selecting dialog
			//refresh the course list
			this.courseRefresh();
			//choose a course to start
			$("#cListDialog").dialog("open").on("dialogclose", function(event, ui){
				//check if the pointer is null
				if(!CA.actions.pointer.cid.length){
					$('#cListDialog').dialog("open");
				}
			});
		},
		
		//this is the function that returns one selected item's index value in a certain list
		getItemIndex :  function(listName){
			var list = $('#'+listName), i;
			i = list.find('.ui-selected').index();
			return i;
		},
		
		//this funcions calls up an alert window
		infoMsg : function(str){
			var icon = '<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>';
			$('#infoSign').find('.infoMsg').html(icon+str);
			$('#infoSign').dialog('open');
		},
		
		//be called when change to another course
		cSwitch : function(cid, cIdx){
			//change the curr course no
			CA.actions.pointer.cid = cid;
			CA.actions.pointer.cIdx = cIdx;
			//close the dialog
			$('#cListDialog').dialog('close');
			//page initialize
			this.pageInitialize(cIdx);
		},
		
		//function to start to load a page
		pageInitialize : function(cIdx){
			//display course info
			this.cInfoRefresh(cIdx);
			//resources and units
			this.uaEmpty();
			this.dragListRender.pageInit();
			//providers and authors
			this.provInit();
			this.authorInit();
			//bind events
			$("#providers").selectmenu({select: function(event, ui){
				CA.view.poolRefresh();
			}}).selectmenu('refresh');
			$("#aAuthor").selectmenu({select: function(event, ui){
				CA.view.poolRefresh();
			}}).selectmenu('refresh');
			//console.log(CA.actions.pointer);
			//pool refresh
			this.poolRefresh();
			//search bar
			$('#aNameQuery').keyup(function(){
				CA.view.poolRefresh();
			});
		},
		
		cInfoRefresh : function(cIdx){
			$('#courseInfo').children().remove();
			var cInfo = CA.wareHouse.courses[cIdx];
			var domains = CA.actions.getDomains();
			var formatted = "<table><tr><td>Category:</td><td>" + domains[cInfo.domainId] + "</td></tr>" +
				"<tr><td>Campus:</td><td>" + cInfo.institution + "</td></tr>" +
				"<tr><td>Code:</td><td>" + cInfo.num + "</td></tr>" +
				"<tr><td>Name:</td><td>" + cInfo.name + "</td></tr>" + 
				"<tr><td>Group No:</td><td>" + cInfo.groupCount + "</td></tr>" +
				"<tr><td>Created By:</td><td>" + cInfo.created.by + " on " + cInfo.created.on  + "</td></tr></table>";
			$('#courseInfo').append(formatted);
		},
		
		//refresh the list in DOM, make it consistant with ones in warehouse
		courseRefresh : function(){
			var view = CA.view;
			$('#courses li').remove();
			var clist = CA.wareHouse.courses;
			for(var i = 0; i < clist.length; i++){
				var li = '<li cid="'+clist[i].id+'"><strong>['+clist[i].num+']</strong> '+clist[i].name+'</li>';
				$('#courses').append(li);
				//bind
				$('#courses li').last().click(function(){
					view.cSwitch($(this).attr('cid'), $(this).index());
				});
			}
		},
		
		//this function refresh the pool list
		poolRefresh : function(){
			//clear the old ones
			$('#pool li').remove();
			
			//get the list
			var list = CA.actions.getPool();
			console.log(list);
			
			for(var i = 0; i < list.length; i++){
				var item = '<li aid="' + list[i].id + '">' + list[i].name + '<div class="link"><a href="' + list[i].url 
				+ '" target="_blank">Preview</a></div></li>';
				$('#pool').append(item);
			    //bind the drag in from pool event
			    $('#pool li').last().draggable({
			    	revert: true,
			    	helper: 'clone',
			    	start: function(event, ui){
			    		$(ui.helper).css('cursor', 'move');
			    	}
			    });
			}
		},
		
		//this is the function to refresh the providers list
		provInit : function(rIdx){
			var providers = CA.actions.getPros();
			//console.log(providers);
			$('#providers').children().remove();
			for(var i = 0; i < providers.length; i++){
				var provider = providers[i];
				this.addProv(provider);
			}
		},
		
		//initialize author list
		authorInit : function(){
			var authors = CA.wareHouse.authors,
				i, item;
			$('#aAuthor').children().remove();
			for(i = 0; i < authors.length; i++){
				item = '<option auid="' + authors[i].id + '">' + authors[i].name + '</opiton>';
				$('#aAuthor').append(item);
			}
		},
		
		//this is the function that add one provider to the list
		addProv : function(provider){
			var item = "";
			item += '<option pid="' + provider.id + '">' + provider.name + '</option>';
			$('#providers').append(item);
		},
		
		//this function push one activity item into current activity list
		aNewActivity : function(rid, aid){
			var resources = CA.wareHouse.courses[CA.actions.pointer.cIdx].resources,
				activities = CA.wareHouse.activities,
				tarR, tarA;
			for(var i = 0; i < resources.length; i++){
				if(resources[i].id == rid){
					tarR = resources[i];
					break;
				}
			}
			for(var j = 0; j < activities.length; j++){
				if(activities[j].id == aid){
					tarA = activities[j];
					break;
				}
			}
			
			//format the listName
			title = tarR.name.replace(/ /g, '');
			var listName = tarR.id + '-' + title + 'List';
			//format the item
			var item = '<li>' + tarA.name + '<span class="instant"></span><span class="link"><a href="' + tarA.url 
			+ '" target="_blank">Preview</a></span></li>';
			console.log(listName, item);
			$('#'+listName).append(item);
		},
		
		//this is the initialize of the activity list
		actInit : function(uIdx){
			function formatActivity(tabName, obj){
				str = '<ol class="dragList" id="'+tabName+'List">';
				for(var i = 0; i < obj.length; i++){
					str += '<li>' + obj[i].name + '<span class="instant"></span><span class="link"><a href="' + obj[i].url 
					+ '" target="_blank">Preview</a></span></li>';
				}
				str += '</ol>';
				return str;
			};
			
			//update current unit
			CA.actions.pointer.uIdx = uIdx;
			CA.actions.pointer.uid = CA.wareHouse.courses[CA.actions.pointer.cIdx].units[uIdx].id;
			//fetch the formatted array
			var aList = CA.actions.getActivities(uIdx);
			//manipulate the tabs
			//delete the old ones
			var tab = $("#activities").tabs();
			tab.find('.ui-tabs-nav li').remove();
			$('#activities div').remove();
			tab.tabs('refresh');
			//add the new
			for(res in aList){
				title = res.replace(/ /g, '');
				this.tabAdd(tab, title, formatActivity(title, aList[res]));
			}
		},
		
		//this is the function that adds one tab to the tabs
		tabAdd : function(tab, title, content){
			//tab adding
			var tabTemplate = "<li><a href='#{href}'>#{label}</a></li>";
			var id = "tabs-" + title,
		        li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, title.split('-')[1])),
		        tabContentHtml = content;
			
			tab.find(".ui-tabs-nav").append(li);
		    tab.append("<div class='listWrapper' id='" + id + "'>" + tabContentHtml + "</div>");
		    tab.tabs("refresh");
			//bind the draglist in the tabs
		    this.dragListRender.listBind(title+'List');
		    //bind the drop place
		    $('#'+id).droppable({
		    	drop: function(event, ui){
		    		CA.actions.pointer.aid = $('li.ui-draggable-dragging').attr('aid');
		    		CA.actions.pointer.rid = title.split('-')[0];
		    		CA.actions.UnitAddAct();
		    	}
		    });
			//bind events for the items in tab lists
		    $('#'+title+'List').children().click(function(){
		    	$(this).addClass('ui-selected').siblings().removeClass('ui-selected');
		    });
		},
		
		//this is the function that refresh one item's name in a list
		itemRefresh : function(listName, idx){
			var course = CA.wareHouse.courses[CA.actions.pointer.cIdx];
			switch(listName){
				case 'resources':
					var newHtml = course.resources[idx].name + '<span class="instant"></span>';
					$('#resources').children().eq(idx).html(newHtml);
					break;
				case 'units':
					var newHtml = course.units[idx].name + '<span class="instant"></span>';
					$('#units').children().eq(idx).html(newHtml);
					break;
			}
		},
		
		//this is the function that delete one item in a list
		itemDelete : function(listName, idx){
			var course = CA.wareHouse.courses[CA.actions.pointer.cIdx];
			$('#' + listName).children().eq(idx).remove();
		},
		
		//this is the function reset the units and activity part
		uaEmpty : function(){
			//clear the pointer
			var p = CA.actions.pointer;
			p.uIdx = "";
			p.uid = "";
			//remove the selected unit's highlight
			$('#units li').removeClass('ui-selected');
			//remove the tabs
			var tab = $("#activities").tabs();
			tab.find('.ui-tabs-nav li').remove();
			$('#activities div').remove();
			tab.tabs('refresh');
		},
		
		//this part is for the drag's event bind
		dragListRender : {
			
			//fetch the right content for this dragList
			fetchCurrArray : function(require){
				switch(require){
				case 'resources':
				case 'units':
					return CA.wareHouse.courses[CA.actions.pointer.cIdx][require];
				default:
					var list = require.split("-");
					return CA.wareHouse.courses[CA.actions.pointer.cIdx].units[CA.actions.pointer.uIdx].activityIds[list[0]];
				}
			},
			
			//the draglists in the page
			listNames : ['resources', 'units'],
			
			//a function to return the selected item's index
			currItemIdx : function(listName){
				return $('#'+listName+' li.ui-selected').index();
			},
			
			//only call when selected a new course
			pageInit : function(){
				//circular each list
				var len = this.listNames.length;
				var name, content;
				for(var i = 0; i < len; i++){
					name = this.listNames[i];
					content = this.fetchCurrArray(name);
					//empty first
					$('#'+name).children().remove();
					//do the fill in
					this.listFill(name, content);
					//do the bind
					this.listBind(name);
				}
				//do the unit change bind;
				$('#units li').click(function(){
					CA.view.actInit($(this).index());
				});
			},
			
			//this is the fill in function
			listFill : function(listName, listArray){
				var len = listArray.length;
				//circularly call the addItem function
				for(var i = 0; i < len; i++){
					if(listName == 'resources' || listName == 'units'){
						this.addItem(listName, listArray[i]['name']);
					}else{
						this.addItem(listName, listArray[i]);
					}
				}
			},
			
			//this function adds one item to the list
			addItem : function(listName, item){
				var dragListRender = this;
				//get the list first
				var list = $('#'+listName);
				//call jQuery method to add <li> element into this <ol> element
				var li = '<li>'+item+'<span class="instant"></span></li>';
				list.append(li);
				list.children().last().click(function(){
					$(this).addClass('ui-selected').siblings().removeClass('ui-selected');
				})
			},
			
			//this is the bind function
			listBind : function(listName){
				//console.log($('#'+listName));
				var dragList = this;
				//drag function bind
				$('#'+listName).each(function(){
					this.addEventListener('slip:beforereorder', function(e){
						if (/demo-no-reorder/.test(e.target.className)){e.preventDefault();}
					}, false);
					this.addEventListener('slip:beforeswipe', function(e){
						if (e.target.nodeName == 'INPUT' || /demo-no-swipe/.test(e.target.className)){e.preventDefault();}
					}, false);
				  	this.addEventListener('slip:beforewait', function(e){
		  				if (e.target.className.indexOf('instant') > -1) e.preventDefault();
		  			}, false);
					this.addEventListener('slip:afterswipe', function(e){
						e.target.parentNode.appendChild(e.target);
					}, false);
				    this.addEventListener('slip:reorder', function(e){
				    	//itemIdx is the original index and placeToBe
				    	var placeToBe = e.detail.spliceIndex,
		    		    	itemIdx = $(e.target).index(),
		    		    	p = CA.actions.pointer;
		    		    e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
		    		    //change the sequence
		    		    //*
	    		    	//console.log(p);
	    		    	p.itemTarIdx = placeToBe;
		    		    switch(listName){
		    		    case 'resources':
	    		    		//p.rid = CA.wareHouse.courses[p.cIdx].resources[itemIdx].id;
		    		    	CA.actions.ResSetIdx(itemIdx, placeToBe);
		    		    	break;
		    		    case 'units':
		    		    	CA.actions.UnitSetIdx(itemIdx, placeToBe);
		    		    	break;
		    		    default:
		    		    	//this is the activity list change
		    		    	//first make pointers right
		    		    	var rId = listName.split('-');
		    		    	p.rid = rId[0];
		    		    	p.aid = CA.wareHouse.courses[p.cIdx].units[p.uIdx].activityIds[rId[0]][itemIdx];
		    		    	CA.actions.ActSetIdx(itemIdx, placeToBe);
		    		    	break;
		    		    }
		    		    //*/
		    		    //dragList.newSeq(this.getAttribute("id"), itemIdx, placeToBe);
					}, false);
		   			new Slip(this);
				});
			},
			
			//this is the handler to sequence changes
			newSeq : function(listName, b, e){
				//call the ajax request
				//if success then change the sequence in local array
				//first fetch the original one
				var origin = parseInt(b), destination = parseInt(e);
				
				var arr = this.fetchCurrArray(listName), 
					item = arr[origin],
					i;
				
				if(origin == destination){
					return false;
				}else if(origin < destination){
					//console.log(origin + ' ' + destination);
					for(i = origin; i < destination; i++){
						arr[i] = arr[i + 1];
					}
					arr[destination] = item;
				}else{
					for(i = origin; i > destination; i--){
						arr[i] = arr[i - 1];
					}
					arr[destination] = item;
				}
				//console.log(this.fetchCurrArray(listName));
			},
		},
};


/*
 * 
 * Deploy Part
 * 
 */
CA.nameSpace('deploy');
CA.deploy = function(){
	$( ".functions li" ).hover(
		function() {
			$( this ).addClass( "ui-state-hover" );
		},
		function() {
			$( this ).removeClass( "ui-state-hover" );
		}
	);
	
	//Window Controls
	//info signs
	$( "#infoSign" ).dialog({
	    autoOpen: false,
	    modal: true,
	    width: 250,
	    buttons: {"OK" : function(){$(this).dialog( "close" );}},
	});
	//dialog divs
	//course choosing dialog
	$( "#cListDialog" ).dialog({
	    autoOpen: false,
	    modal: true,
	    width: 400,
	    height: 400,
	});
	//course editing dialog
	$('#cEditDialog').dialog({
	    autoOpen: false,
	    height: 320,
	    width: 200,
	    modal: true,
	    buttons: {
	      "Submit": function(){
	    	  CA.actions.CourseEdit(CA.actions.gather.courseEdit());
	      },
	      Cancel: function(){$(this).dialog( "close" );}
	    },
	});
	//course add dialog
	$('#cAddDialog').dialog({
	    autoOpen: false,
	    height: 320,
	    width: 200,
	    modal: true,
	    buttons: {
	      "Add": function(){
	    	  CA.actions.CourseAdd(CA.actions.gather.courseAdd());
	      },
	      Cancel: function(){$(this).dialog( "close" );}
	    },
	});
	//course del confirmation dialog
	$('#cDelDialog').dialog({
	    autoOpen: false,
	    height: 230,
	    width: 300,
	    modal: true,
	    buttons: {
	      "Delete": function(){CA.actions.CourseDelete($(this).find('.confirm').val());}
	    },
	});
	//course clone dialog
	$('#cCloDialog').dialog({
	    autoOpen: false,
	    width: 200,
	    modal: true,
	    buttons: {
	      "Clone": function(){CA.actions.CourseClone($(this).find('.cName').val().trim());}
	    },
	});
	//resource edit dialog
	$('#rEditDialog').dialog({
	    autoOpen: false,
	    width: 200,
	    modal: true,
	    buttons: {
	      "Submit": function(){CA.actions.ResEdit($(this).find('.rName').val().trim());}
	    },
	});
	//resource add dialog
	$('#rAddDialog').dialog({
	    autoOpen: false,
	    width: 200,
	    modal: true,
	    buttons: {"Add": function(){CA.actions.ResAdd($(this).find('.rName').val().trim());}},
	});
	//resource delete dialog
	$('#rDelDialog').dialog({
	    autoOpen: false,
	    height: 230,
	    width: 300,
	    modal: true,
	    buttons: {
	      "Delete": function(){CA.actions.ResDelete($(this).find('.confirm').val());}
	    },
	});
	//unit edit dialog
	$('#uEditDialog').dialog({
	    autoOpen: false,
	    width: 200,
	    modal: true,
	    buttons: {
	      "Submit": function(){CA.actions.UnitEdit($(this).find('.uName').val().trim());}
	    },
	});
	//unit add dialog
	$('#uAddDialog').dialog({
	    autoOpen: false,
	    width: 200,
	    modal: true,
	    buttons: {"Add": function(){CA.actions.UnitAdd($(this).find('.uName').val().trim());}},
	});
	//unit delete dialog
	$('#uDelDialog').dialog({
	    autoOpen: false,
	    height: 230,
	    width: 300,
	    modal: true,
	    buttons: {
	      "Delete": function(){CA.actions.UnitDelete($(this).find('.confirm').val());}
	    },
	});
	//unit delete dialog
	$('#aDelDialog').dialog({
	    autoOpen: false,
	    height: 230,
	    width: 300,
	    modal: true,
	    buttons: {
	      "Delete": function(){CA.actions.UnitRemoveAct($(this).find('.confirm').val());}
	    },
	});
	//Window Control Ends
	
	//Functions
	//course functions
	//choose other courses
	$('#chooseCourse').click(function(){
		CA.view.initDisplay();
		//reset the pointer
		CA.actions.resetP();
	});
	//edit course
	$('#editCourse').click(function(){
		//fill in the form in dialog
		//add options to the selector
		var dList = CA.actions.getDomains(),
			thisCourse = CA.wareHouse.courses[CA.actions.pointer.cIdx];
		//console.log(dList);
		//empty the list
		$('#cEditDialog .cDomain').find('option').remove();
		//get this course's domain id
		var domainId = thisCourse.domainId;
		//insertion
		for(domain in dList){
			var option, selected = '';
			if(domainId === domain){
				selected = 'selected="selected"'
			}
			option = '<option '+selected+' value="'+domain+'">'+dList[domain]+'</option>';
			$('#cEditDialog .cDomain').append(option);
		}
		//make check box right
		if(thisCourse.visible === 1){
			$('#cEditDialog .cVisible').prop('checked', 'true');
		}else{
			$('#cEditDialog .cVisible').prop('checked', 'false');
		}
		//fill in the name
		$('#cEditDialog .cName').val(thisCourse.name);
		//fill in the code
		$('#cEditDialog .cCode').val(thisCourse.num);
		//open the dialog
		$('#cEditDialog').dialog('open');
	});
	//add course
	$('#addCourse, #addCourse1').click(function(){
		//fill in the form in dialog
		//add options to the selector
		var dList = CA.actions.getDomains();
		//empty the list
		$('#cAddDialog .cDomain').find('option').remove();
		//insertion
		for(domain in dList){
			option = '<option value="'+domain+'">'+dList[domain]+'</option>';
			$('#cAddDialog .cDomain').append(option);
		};
		//open the dialog
		$('#cAddDialog').dialog('open');
	});
	//delete course
	$('#delCourse').click(function(){
		//empty the input
		$('#cDelDialog .confirm').val('');
		//open the dialog
		$('#cDelDialog').dialog('open');
	});
	//clone course
	$('#cloCourse').click(function(){
		//use this course's name as default
		$('#cCloDialog .cName').val(CA.wareHouse.courses[CA.actions.pointer.cIdx].name);
		//open the dialog
		$('#cCloDialog').dialog('open');
	});
	//resource functions
	//edit resource
	$('#editResource').click(function(){
		var i = CA.view.getItemIndex('resources');
		if(i != -1){
			//use this resource's name as default
			$('#rEditDialog .rName').val(CA.wareHouse.courses[CA.actions.pointer.cIdx].resources[i].name);
			//update the pointer
			CA.actions.pointer.rid = CA.wareHouse.courses[CA.actions.pointer.cIdx].resources[i].id;
			//open the dialog
			$('#rEditDialog').dialog('open');		
		}else{
			CA.view.infoMsg('Please select one resource first.');
		}
	});
	//edit resource
	$('#addResource').click(function(){
		//clear the content
		$('#rAddDialog').find('.rName').val('');
		//open the dialog
		$('#rAddDialog').dialog('open');
	});
	//delete resource
	$('#delResource').click(function(){
		//empty the input
		$('#rDelDialog .confirm').val('');
		//fetch the index
		var i = CA.view.getItemIndex('resources');
		if(i != -1){
			//update the pointer
			CA.actions.pointer.rid = CA.wareHouse.courses[CA.actions.pointer.cIdx].resources[i].id;
			//open the dialog
			$('#rDelDialog').dialog('open');
		}else{
			CA.view.infoMsg('Please select one resource first.');
		}
	});
	//unit functions
	//edit unit
	$('#editUnit').click(function(){
		var i = CA.view.getItemIndex('units');
		if(i != -1){
			//use this unit's name as default
			$('#uEditDialog .uName').val(CA.wareHouse.courses[CA.actions.pointer.cIdx].units[i].name);
			//update the pointer
			CA.actions.pointer.uid = CA.wareHouse.courses[CA.actions.pointer.cIdx].units[i].id;
			//open the dialog
			$('#uEditDialog').dialog('open');		
		}else{
			CA.view.infoMsg('Please select one unit first.');
		}
	});
	//edit unit
	$('#addUnit').click(function(){
		//clear the content
		$('#uAddDialog').find('.uName').val('');
		//open the dialog
		$('#uAddDialog').dialog('open');
	});
	//delete resource
	$('#delUnit').click(function(){
		//empty the input
		$('#uDelDialog .confirm').val('');
		//fetch the index
		var i = CA.view.getItemIndex('units');
		if(i != -1){
			//update the pointer
			CA.actions.pointer.uid = CA.wareHouse.courses[CA.actions.pointer.cIdx].units[i].id;
			//open the dialog
			$('#uDelDialog').dialog('open');
		}else{
			CA.view.infoMsg('Please select one unit first.');
		}
	});
	//activity functions
	//delete activity
	$('#delAct').click(function(){
		var listName = $('#activities div:visible').attr('id');
		if(listName){
			//update the pointer, rid
			var rid = listName.split('-')[1],
				idx = CA.view.getItemIndex(listName);
			CA.actions.pointer.rid = rid;
			if(idx != -1){
				//update the pointer, aid
				var aid = CA.wareHouse.courses[CA.actions.pointer.cIdx].units[CA.actions.pointer.uIdx].activityIds[rid][idx];
				CA.actions.pointer.aid = aid;
				//open dialog
				$('#aDelDialog').dialog('open');
			}else{
				CA.view.infoMsg('Please select an activity first.');
			}
		}
	});
	//Functions Ends
};


//-------------------------------------
//test code
//delete when it's done
//CA.actions.init();
//test code ends
//-------------------------------------


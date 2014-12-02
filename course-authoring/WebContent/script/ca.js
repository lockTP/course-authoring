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
		
		init : function(){
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
			//console.log(rList);
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
		
		//object to gather form information
		gather : {
			courseEdit : function(){
				var newData = {};
				return newData;
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
		CourseAdd : function(name, code, desc, domain, visible){
			CA.request('CourseAdd', {
				name : name,
				code : code,
				desc : desc,
				domain : domain,
				visible : visible,
				usr : this.pointer.usr
				});
		},
		

		//CourseClone()
		CourseClone : function(name){
			CA.request('CourseClone', {
				course_id : this.pointer.cid,
				name : name,
				usr : this.pointer.usr
				});
		},

		//CourseDelete()
		CourseDelete : function(){
			CA.request('CourseDelete',{
				course_id : this.pointer.cid
				});
		},

		//CourseEdit()
		CourseEdit : function(obj){
			console.log(obj);
			//CA.request('CourseEdit',{course_id:this.pointer.cid, name:obj.name, code:obj.code,
			//	desc:obj.desc, domain:obj.domain, visible:obj.visible, usr:this.pointer.usr});
		},


		//ResAdd()
		ResAdd : function(name){
			CA.request('ResAdd',{
				course_id : this.pointer.cid,
				name : name,
				usr : this.pointer.usr
				});
		},

		//ResDelete
		ResDelete : function(){
			CA.request('ResDelete',{
				course_id : this.pointer.cid,
				res_id : this.pointer.rid
				});
		},

		//ResEdit
		ResEdit : function(name){
			CA.request('ResEdit',{
				name : name,
				course_id : this.pointer.cid,
				res_id : this.pointer.rid
				});
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
			CA.request('UnitAdd',{
				course_id : this.pointer.cid,
				usr : this.pointer.usr,
				name : name
				});
		},

		//UnitAddAct
		UnitAddAct : function(){
			CA.request('UnitAddAct',{
				usr : this.pointer.usr,
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid,
				res_id : this.pointer.rid,
				act_id : this.pointer.aid
				});
		},

		//UnitDelete
		UnitDelete : function(){
			CA.request('UnitDelete',{
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid
				});
		},

		//UnitEdit
		UnitEdit : function(name){
			CA.request('UnitEdit',{
				name : name,
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid
				});
		},

		//UnitGetList
		//There might be a typo in java class. It should be UnitGetList instead of UnitGetLst
		UnitGetLst : function(){
			CA.request('UnitGetLst',{
				course_id : this.pointer.cid
				})
		},

		//UnitRemoveAct
		UnitRemoveAct : function(){
			CA.request('UnitRemoveAct',{
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid,
				res_id : this.pointer.rid,
				act_id : this.pointer.aid
				})
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
		},

		//CourseClone receive handler
		CourseCloneHandler : function(rs){
			newCourse = rs.course;
			CA.wareHouse.courses.push(newCourse);
		},
		
		//CourseDelete receive handler
		CourseDeleteHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					CA.wareHouse.courses.splice(i,1);
				}
			}
		},
		
		//CourseEdit receive handler
		CourseEditHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.course.id){
					CA.wareHouse.courses[i] = rs.course;
				}
			}
		},

		//ResAdd receive handler
		ResAddHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					rs.res.providerIds = [];
					CA.wareHouse.courses[i].resources.push(rs.res);
				}
			}
		},
		
		//ResDelete receive handler
		ResDeleteHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							CA.wareHouse.courses[i].resources.splice(j,1);
							return;
						}
					}
				}
			}
		},
		
		//ResEdit receive handler
		ResEditHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].resources.length; j++){
						if(CA.wareHouse.courses[i].resources[j].id == rs.resId){
							var newrs = CA.wareHouse.courses[i].resources[j];
							newrs.id = rs.resId;
							newrs.name = rs.name;
							CA.wareHouse.courses[i].resources[j] = newrs;
							return;
						}
					}
				}
			}
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
//					We don't need to create empty resources for activityIds. They can be generated when an activityId is added.
//					var res = this.wareHouse.courses[i].resources;
//					for(var j = 0; j < res.length; j++){
//						rs.unit.activityIds[res[j].id] = [];
//					}
					CA.wareHouse.courses[i].units.push(rs.unit);
					return;
				}
			}
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
							return;
						}
					}
				}
			}
		},

		//UnitDelete receive handler
		UnitDeleteHandler : function(rs){
			for(i = 0; i < CA.wareHouse.courses.length; i++){
				if(CA.wareHouse.courses[i].id == rs.courseId){
					for(j = 0; j < CA.wareHouse.courses[i].units.length; j++){
						if(CA.wareHouse.courses[i].units[j].id == rs.unitId){
							CA.wareHouse.courses[i].units.splice(j,1);
							return;
						}
					}
				}
			}
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
							return;
						}
					}
				}
			}
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
							for(k = 0; k < CA.wareHouse.courses[i].units[j].activityIds[rs.resId].length; k++)
								if(CA.wareHouse.courses[i].units[j].activityIds[rs.resId][k] = rs.act_id){
									CA.wareHouse.courses[i].units[j].activityIds[rs.resId].splice(k,1);
									return;
								}
						}
					}
				}
			}
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
		
		pageInitialize : function(cIdx){
			//display course info
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
			//resources and units
			this.dragListRender.pageInit();
			//providers and authors
			this.provInit();
			this.authorInit();
			//bind events
			$("#providers").selectmenu().selectmenu('refresh');
			$("#aAuthor").selectmenu().selectmenu('refresh');
			console.log(CA.actions.pointer);
		},
		
		//refresh the list in DOM, make it consistant with ones in warehouse
		courseRefresh : function(){
			var view = CA.view;
			$('#courses li').remove();
			var clist = CA.wareHouse.courses;
			for(var i = 0; i < clist.length; i++){
				var li = '<li cid="'+clist[i].id+'">'+clist[i].num+' '+clist[i].name+'</li>';
				$('#courses').append(li);
				//bind
				$('#courses li').last().click(function(){
					view.cSwitch($(this).attr('cid'), $(this).index());
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
			item += '<option pid="' + provider.id + '">' + provider.id + '</option>' +
				provider.name + '</label>';
			$('#providers').append(item);
		},
		
		//this is the initialize of the activity list
		actInit : function(uIdx){
			function formatActivity(tabName, obj){
				str = '<ol class="dragList" id="'+tabName+'List">';
				for(var i = 0; i < obj.length; i++){
					str += '<li >' + obj[i].name + '<span class="instant"></span></li>';
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
		    //bind the drag in from pool event
		    $('#pool li').draggable({
		    	revert: true
		    });
		    $('#'+id).droppable({
		    	drop: function(event, ui){
		    		CA.actions.pointer.aid = $('li.ui-draggable-dragging').attr('aid');
		    		console.log($('li.ui-draggable-dragging').attr('aid'));
		    	}
		    });
			//bind events for the items in tab lists
		    $('#'+title+'List').children().click(function(){
		    	$(this).addClass('ui-selected').siblings().removeClass('ui-selected');
		    });
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
}


/*
 * 
 * Deploy Part
 * 
 */
$( ".functions li" ).hover(
	function() {
		$( this ).addClass( "ui-state-hover" );
	},
	function() {
		$( this ).removeClass( "ui-state-hover" );
	}
);
//dialog divs
//course choosing dialog
$( "#cListDialog" ).dialog({
    autoOpen: false,
    modal: true,
    width: 400,
});
//course editing dialog
$('#cEditDialog').dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
      "Submit": CA.actions.CourseEdit(CA.actions.gather.courseEdit()),
      Cancel: function() {dialog.dialog( "close" );}
    },
});


//course functions
//choose other courses
$('#chooseCourse').click(function(){
	CA.actions.pointer = {
			//username and group info
			usr : 'admin', grp : 'admins',
			//currently operating course, activity, provider
			cid : '', cIdx : '',
			aid : '',
			uid : '', uIdx : '',
			rid : '',
			pid : '',
			itemTargetIdx : '',
	},
	CA.view.initDisplay();
});
//edit course
$('#editCourse').click(function(){
	$('#cEditDialog').dialog('open');
});


//-------------------------------------
//test code
//delete when it's done
CA.actions.init();
//function testFunc(){
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
//	CA.UnitGetLst();
//	CA.UnitRemoveAct();
//	CA.UnitSetIdx();
//}

//CA.initDisplay();
//test code ends
//-------------------------------------




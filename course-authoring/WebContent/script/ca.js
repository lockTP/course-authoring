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
			aid : '',
			uid : '',
			rid : '',
			pid : ''
		},
		
		init : function(){
			//get all data needed from the server (stupid and slow)
			CA.request('GetData', {
				usr : this.pointer.usr,
				grp : this.pointer.grp
				});
		},
		
		//ActSetIdx()
		ActSetIdx : function(idx, idxDelta){
			if (idxDelta === 0) return;
			if (idxDelta > 0 && idx === CA.warehouse.acvtivities.length - 1) return;
			if (idxDelta < 0 && idx === 0) return;
			
			CA.request('ActSetIdx', {
				idx : idx,
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid,
				act_id : this.pointer.aid,
				res_id : this.pointer.rid,
				idxDelta : idxDelta
				});
		},
		
		//ResSetIdx
		ResSetIdx : function(idx, idxDelta){			
			CA.request('ResSetIdx', {
				idx : idx,
				course_id : this.pointer.cid,
				res_id : this.pointer.rid,
				idxDelta : idxDelta
				});
		},
		
		//UnitSetIdx
		UnitSetIdx : function(idx, idxDelta){
			CA.request('UnitSetIdx', {
				idx : idx,
				course_id : this.pointer.cid,
				unit_id : this.pointer.uid,
				idxDelta : idxDelta
				});
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
		CourseEdit : function(name, code, desc, domain, visible){
			CA.request('CourseEdit',{
				course_id : this.pointer.cid,
				name : name,
				code : code,
				desc : desc,
				domain : domain,
				visible : visible,
				usr : this.pointer.usr
				});
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
		ActSetIdxHandler : function(rs){},
		
		//ResSetIdx receive handler
		ResSetIdxHandler : function(rs){},

		//UnitSetIdx receive handler
		nameSpaceHandler : function(rs){},
		
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
			//choose a course to start
			console.log(this.wareHouse);
			$( "#resTabs" ).tabs();
			$( "#providers" ).buttonset();

			$( ".functions li" ).hover(
				function() {
					$( this ).addClass( "ui-state-hover" );
				},
				function() {
					$( this ).removeClass( "ui-state-hover" );
				}
			);
			$( "#aAuthor" ).selectmenu();
		},
		
		//this part is for the drag's event bind
		dragListRender : {
			//the draglists in the page
			listNames : ['resources', 'units'],
			
			//a function to return the selected item's index
			currItenIdx : function(listName){
				return $('#'+listName+' li.ui-selected').index();
			},
			
			
			//fetch the right content for this dragList
			fetchCurrArray : function(require){
				switch(require){
					case 'resTabs':
						return testContent.units[this.currItenIdx['units']].activityIds[''];
					default:
						return testContent[require];	
				}

			},
			
			//only call when selected a new course
			pageInit : function(){
				//circular each list
				var len = this.listNames.length;
				var name, content;
				for(var i = 0; i < len; i++){
					name = this.listNames[i];
					content = this.fetchCurrArray(name);
					//do the fill in
					this.listFill(name, content);
					//do the bind
					this.listBind(name);
				}
				//do the unit change bind;
				$('#units li').click(function(){
					dragListRender.actInit($(this).index());
				});
			},
			
			//call when selected a new unit
			actInit : function(index){
				//get the resources
				var resources, len;
				resources = this.fetchCurrArray('resources');
				//clear the container
				$('#resTabs ul').children().remove();
				len = resources.length;
				//add the tab link
				for(var i = 0; i < len; i++){
					li = '<li><a href="#resTabs'+(i+1)+'">'+resources[i].name+'</a></li>';
					$('#resTabs ul').append(li);
				}
				/*
				//add the list
				for(var i = 0; i < len; i++){
					var div = '<div class="listWrapper" id="resTabs'+(i+1)+'">';
					div += '<ol class="dragList" id="'+resources[i].name+'List"></ol></div>';
					$('#resTabs').append(div);
				}
				*/
				//config the list
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
				//get the list first
				var list = $('#'+listName);
				//call jQuery method to add <li> element into this <ol> element
				var li = '<li>'+item+'<span class="instant"></span></li>';
				list.append(li);
				list.children().last().click(function(){
					$(this).addClass('ui-selected').siblings().removeClass('ui-selected');
					dragListRender.currItenIdx('resourceList');
				})
			},
			
			//this is the bind function
			listBind : function(listName){
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
				    	var placeToBe = e.detail.spliceIndex;
		    		    var itemIdx = $(e.target).index();
		    		    e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
		    		    //change the sequence
		    		    dragList.newSeq(this.getAttribute("id"), itemIdx, placeToBe);
		    		    //console.log(itemIdx + ' ' + placeToBe);
					}, false);
		   			new Slip(this);
				});
			},
			
			//this is the handler to sequence changes
			newSeq : function(listName, origin, destination){
				//call the ajax request
				//if success then change the sequence in local array
				//first fetch the original one
				var arr = this.fetchCurrArray(listName);
				var item = arr[origin];
				if(origin == destination){
					return false;
				}else if(origin < destination){
					for(var i = origin; i < destination; i++){
						arr[i] = arr[i + 1];
					}
					arr[destination] = item;
				}else{
					for(var i = origin; i > destination; i--){
						arr[i] = arr[i - 1];
					}
					arr[destination] = item;
				}
				console.log(this.fetchCurrArray(listName));
			},
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




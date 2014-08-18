/*
 * In the context of resources, the following suffixes appear in the code below:
 *   01: Resources displayed to the right of courses
 *   02: Resources displayed to the right of units
 * 
 * http://character-code.com/arrows-html-codes.php
 */

$(document).ready(function(){
	
	$(function() {
		$("#dialog").dialog({
			autoOpen: false
		});
		$("#button").on("click", function() {
			$("#dialog").dialog("open");
		});
	});

	//validating Form Fields.....
	$("#submit").click(function(e){

	var email = $("#email").val();
	var name = $("#name").val();
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if( email ==='' || name ==='')
       {
		 alert("Please fill all fields...!!!!!!");
		 e.preventDefault();
       }
    else if(!(email).match(emailReg))
       {
         alert("Invalid Email...!!!!!!");
		 e.preventDefault();
       }    
	else 
	   {
         alert("Form Submitted Successfully......");
         alert($("#name").val()+"  " +$("#email").val());
	   }
	
	});
		
});

var CONST = {
  actFilterNameDelay : 1000,  // [ms]
  actReloadDelay     :  500   // [ms]
};


var state = {
  curr    : { course: null, unit: null, res01: null, res02: null, actUnit: null, actAvail: null },  // current
  filter  : { actName: "", actNameTimer: null },
  is      : { initDone: false, loggedIn: false, my: true, ready: false },                           // flags
  rt      : { stateLoadCourseCnt: 0, stateLoadUnitCnt: 0 },                                         // runtime
  usr     : { id: "admin" }
};




// ----------------------------------------------------------------------------------------------------------
// ---[  ACTIVITIES  ]---------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function actGet(actId) {
  for (var i=0, ni=data.activities.length; i < ni; i++) {
    var a = data.activities[i];
    if (a.id === actId) return a;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function actUnitGetIdx(courseId, unitId, resId, actId) {
  var R = unitGet(courseId, unitId).activityIds[resId];
  if (R != null)
  {
	  for (var i=0, ni=R.length; i < ni; i++) {
		    if (R[i] === actId) return i;
	  }
  }
  return -1;
}


// ----------------------------------------------------------------------------------------------------------
function actFilterSetName() {
  if ($trim($("filter-act-name").value) == state.filter.actName) return;
  
  if (state.filter.actNameTimers) {
    window.clearTimeout(state.filter.actNameTimers);
    state.filter.actNameTimers = null;
  }
  
  state.filter.actNameTimers = window.setTimeout(actFilterSetName_t, CONST.actFilterNameDelay);
}


// ----^----
function actFilterSetName_t() {
  state.filter.actName = $trim($("filter-act-name").value);
  actPopulateAvailLst(state.curr.unit.id, state.curr.res02.id, true);
}


// ----------------------------------------------------------------------------------------------------------
function actGetAuthor(authorId) {
  for (var i=0, ni=data.authors.length; i < ni; i++) {
    var a = data.authors[i];
    if (a.id === authorId) return a;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function actGetProvider(provId) {
  for (var i=0, ni=data.providers.length; i < ni; i++) {
    var p = data.providers[i];
    if (p.id === provId) return p;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function actMoveRel(idxDelta) {
  if (!state.curr.actUnit || idxDelta === 0) return;
  
  var idx = actUnitGetIdx(state.curr.course.id, state.curr.unit.id, state.curr.res02.id, state.curr.actUnit.id);
  
  if (idxDelta > 0 && idx === state.curr.unit.activityIds[state.curr.res02.id].length - 1) return;
  if (idxDelta < 0 && idx === 0) return;
  
  idx += idxDelta;
  idx = Math.max(idx, 0);
  idx = Math.min(idx, state.curr.unit.activityIds[state.curr.res02.id].length - 1);
  
  appSetReady(false);
  //$call("GET", "actSetIdx.php?course-id=" + state.curr.course.id + "&unit-id=" + state.curr.unit.id + "&res-id=" + state.curr.res02.id + "&act-id=" + state.curr.actUnit.id + "&idx=" + idx, null, function (res) { actMoveRel_cb(res); }, true, false);
  actMoveRel_cb({ outcome: true, courseId: state.curr.course.id, unitId: state.curr.unit.id, resId: state.curr.res02.id, actId: state.curr.actUnit.id, idx: idx, idxDelta: idxDelta });
}


// ----^----
function actMoveRel_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  var R = unitGet(res.courseId, res.unitId).activityIds[res.resId];
  var idx = R.indexOf(res.actId);  // the current index (the new one is in 'res')
  R.splice(idx, 1);
  R.splice(res.idx, 0, res.actId);
  
  actPopulateUnitLst(res.unitId, res.resId, true);
}


// ----------------------------------------------------------------------------------------------------------
function actNewWin() {
  if (!state.is.ready || (!state.curr.actUnit && !state.curr.actAvail)) return;
  
  var a = state.curr.actUnit || state.curr.actAvail;
  window.open(a.url, "_blank");
}


// ----------------------------------------------------------------------------------------------------------
function actPopulateUnitLst(unitId, resId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  $("act-unit-lst-cont").innerHTML = "";
  
  var R = state.curr.unit.activityIds[resId];
  if (R == null)
	  R = [];

  for (var i=0, ni=R.length; i < ni; i++) {
    var a = actGet(R[i]);
    
    var tr = $$("tr", $("act-unit-lst-cont"), "act-unit-lst-item-" + a.id);
    $$("td", tr, null, "ord-num", (i+1) + ".").width = "1";
    $$("td", tr, null, null, a.name).width = "*";
    
    tr.onclick = function (actId) { return function (e) { actSelect(actId, null, false); } }(a.id);
  }
  $("act-unit-cnt").innerHTML = i;
  
  // (2) Select an activity based on the saved application state:
  //if (!state.is.initDone) {
  if (doForce) {
    var actIdHash = $getHash(',', ':')["act-unit-id"];
    if (actIdHash === undefined) {
      // Don't do the below stuff here because actPopulateAvailLst() should always be called after the current function
      /*
      state.is.initDone = true;
      appStateSave();
      appSetReady(true);
      */
    }
    else {
      if (actUnitGetIdx(state.curr.course.id, state.curr.unit.id, state.curr.res02.id, actIdHash) === -1) {
        state.curr.actUnit = null;
        appStateSave();
        appSetReady(true);
      }
      else actSelect(actIdHash, null, true);
    }
  }
  else {
    appStateSave();
    appSetReady(true);
  }
  
  /*
  if (state.curr.courseId !== null) $("loc-bar").childNodes[1].innerHTML = $("course-lst-item-" + courseId).childNodes[1].innerHTML;
  else $$("div", $("loc-bar"), null, "course", $("course-lst-item-" + courseId).childNodes[1].innerHTML);
  
  if ($("loc-bar").childNodes.length > 4) $("loc-bar").removeChild($("loc-bar").childNodes[4]);
  if ($("loc-bar").childNodes.length > 3) $("loc-bar").removeChild($("loc-bar").childNodes[3]);
  if ($("loc-bar").childNodes.length > 2) $("loc-bar").removeChild($("loc-bar").childNodes[2]);
  */
}


// ----------------------------------------------------------------------------------------------------------
function actPopulateAvailLst(unitId, resId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  $("act-avail-lst-cont").innerHTML = "";
  
  var u = state.curr.unit;
  var P = resGet(state.curr.course.id, resId).providerIds;
  
  var filterAuthorId = ($("filter-act-author").selectedIndex === 0 ? null : $("filter-act-author").value);
  var filterName = (state.filter.actName.length === 0 ? null : state.filter.actName.toLowerCase().split(/\s+/));//before splitting we consider the lower case of filter name, (the name of filter is not changed)
  
  var actCnt = 0;
  var isSelected = false;  // Is any of the available activities selected?  This is used later to decide whether or not to hide the activity details panel.
  
  for (var i=0, ni=data.activities.length; i < ni; i++) {
    var a = data.activities[i];
    if (a.domain !== state.curr.course.domainId)
    	continue; // only activities of the same domain are shown in the available content list
    if (u.activityIds[resId] != null){
    if (u.activityIds[resId].indexOf(a.id) !== -1 || P.indexOf(a.providerId) === -1) 
    	continue;
    }
    if (filterAuthorId !== null && a.authorId !== filterAuthorId) continue;
    
    if (filterName) {
      var doesSatisfyFilter = false;
      var actNameSplit = a.name.toLowerCase().split(/\s+/); // before splitting we consider the lower case of activity name, (the name of activity is not changed)
      var tagSplit = [];
      for (var temp = 0; temp <  a.tags.length; temp++)
    	  tagSplit = tagSplit.concat(a.tags[temp].split(/\s+/));
      for (var j=0, nj=filterName.length; j < nj; j++) {
        if (actNameSplit.indexOf(filterName[j]) !== -1 | tagSplit.indexOf(filterName[j]) !== -1) {
          doesSatisfyFilter = true;
          break;
        }
      }
      
      if (!doesSatisfyFilter) continue;
    }
    
    isSelected = isSelected || state.curr.actAcail === a;
    
    var tr = $$("tr", $("act-avail-lst-cont"), "act-avail-lst-item-" + a.id);
    $$("td", tr, null, null, a.name);
    
    tr.onclick = function (actId) { return function (e) { actSelect(null, actId, false); } }(a.id);
    
    actCnt++;
  }
  
  if (!isSelected && !state.curr.actUnit) $hide($("act-det-lst-cont"));
  $("act-avail-cnt").innerHTML = actCnt;
  
  // (2) Select an activity based on the saved application state:
  //if (!state.is.initDone) {
  if (doForce) {
    var actIdHash = $getHash(',', ':')["act-avail-id"];
    if (actIdHash === undefined) {
      state.is.initDone = true;
      appStateSave();
      appSetReady(true);
    }
    else {
      if (actUnitGetIdx(state.curr.course.id, state.curr.unit.id, state.curr.res02.id, actIdHash) !== -1) {
        appStateSave();
        appSetReady(true);
        state.curr.actAvail = null;
      }
      else actSelect(null, actIdHash, true);
    }
  }
  else {
    appStateSave();
    appSetReady(true);
  }
}


// ----------------------------------------------------------------------------------------------------------
function actReload() {
  if (!state.is.ready || (!state.curr.actUnit && !state.curr.actAvail)) return;
  
  var a = state.curr.actUnit || state.curr.actAvail;
  
  $("act-det-frame").src = "";
  
  appSetReady(false);
  window.setTimeout(
    function () {
      $("act-det-frame").src = a.url;
      appSetReady(true);
    },
    CONST.actReloadDelay
  );
}


// ----------------------------------------------------------------------------------------------------------
/**
 * If both the 'actIdUnit' and 'actIdAvail' are non-null then there is an error in calling this function.  
 * This function does not check for that because it is unclear how to recover from such situation.  The 
 * function which calls this function should be corrected instead.  Naturally, if both of these two 
 * variables are null then it is also a call error.
 */
function actSelect(actUnitId, actAvailId, doForce) {
  if ((actUnitId && $("act-unit-lst-item-" + actUnitId) === null) || (actAvailId && $("act-avail-lst-item-" + actAvailId) === null)) return appSetReady(true);
  if (!doForce && (!state.is.ready || (actUnitId && state.curr.actUnit && state.curr.actUnit.id === actUnitId) || (actAvailId && state.curr.actAvail && state.curr.actAvail.id === actAvailId))) return appSetReady(true);
  
  appSetReady(false);
  
  var a = actGet(actUnitId || actAvailId);
  
  // (1) Deselect the currently selected activities and select the new one:
  if (state.curr.actUnit ) $clsRem($("act-unit-lst-item-"  + state.curr.actUnit.id),  "sel");
  if (state.curr.actAvail) $clsRem($("act-avail-lst-item-" + state.curr.actAvail.id), "sel");
  
  if (actUnitId ) { state.curr.actUnit = a;     state.curr.actAvail = null;  $clsAdd($("act-unit-lst-item-"  + actUnitId ), "sel"); }
  if (actAvailId) { state.curr.actUnit = null;  state.curr.actAvail = a;     $clsAdd($("act-avail-lst-item-" + actAvailId), "sel"); }
  
  appStateSave();
  
  // (2) Show details of the selected activity:
  $show($("act-det-lst-cont"));
  $("act-det-tbl").innerHTML = "";
  var tr = null;
  
  // (2.1) Add-and-Remove button:
  if (state.curr.unit.activityIds[state.curr.res02.id] != null)
  {
	  if (state.curr.unit.activityIds[state.curr.res02.id].indexOf(a.id) === -1) $clsRem($("act-det-btn"), "sel");  
	  else $clsAdd($("act-det-btn"), "sel");
  }
  
  
  // (2.2) Provider:
  var prov = actGetProvider(a.providerId);
  tr = $$("tr", $("act-det-tbl"));
  $$("td", tr, null, "td01", "Provider");
  $$("td", tr, null, "td02", prov.name + (prov.url && prov.url.length > 0 ? "&nbsp;&nbsp;<a target=\"_blank\" href=\"" + prov.url + "\" title=\"Open provider info page\">&#8594;</a>" : ""));
  
  // (2.3) Author:
  var author = actGetAuthor(a.authorId);
  tr = $$("tr", $("act-det-tbl"));
  $$("td", tr, null, "td01", "Author");
  $$("td", tr, null, "td02", (author && author.name && author.name.length > 0 ? author.name : "---"));
  
  // (2.x) Units:
  /*
  var units = [];
  $map(
    function (x) {
      if (x.activityIds.indexOf(a.id) !== -1) units.push(x.name);
    },
    state.curr.course.units
  );
  
  tr = $$("tr", $("act-det-tbl"));
  $$("td", tr, null, "td01", "Units (" + units.length + ")");
  $$("td", tr, null, "td02", (units.length === 0 ? "" : units.join("<span class=\"sep-dot\">&bull;</span>")));
  */
  
  // (2.4) Tags:
  tr = $$("tr", $("act-det-tbl"));
  $$("td", tr, null, "td01", "Tags (" + a.tags.length + ")");
  $$("td", tr, null, "td02 tags", (a.tags.length === 0 ? "" : "<span>" + a.tags.join("</span><span>") + "</span>"));
  
  // (2.5) Content:
  if (a.url && a.url.length > 0) {
    $show($("act-det-content"));
    
    var frame = $("act-det-frame");
    frame.src = a.url;
    if (a.dim) {
      frame.style.width  = a.dim.w + "px";
      frame.style.height = a.dim.h + "px";
    }
    else {
      frame.style.width  = "";
      frame.style.height = "";
    }
  }
  else $hide($("act-det-content"));
  
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function actToggleUnit() {
  // (1) Add to unit:
  if (state.curr.actAvail) {
    appSetReady(false);
	$call("GET", "UnitAddAct?usr=" + state.usr.id+"&course_id=" + state.curr.course.id + "&unit_id=" + state.curr.unit.id + "&res_id=" + state.curr.res02.id + "&act_id=" + state.curr.actAvail.id, null, function (res) { actToggleUnit_cbAdd(res); }, true, false);
//    actToggleUnit_cbAdd({ outcome: true, courseId: state.curr.course.id, unitId: state.curr.unit.id, resId: state.curr.res02.id, actId: state.curr.actAvail.id });
    return;
  }
  
  // (2) Remove from unit:
  if (state.curr.actUnit) {
    appSetReady(false);
    $call("GET", "UnitRemoveAct?course_id=" + state.curr.course.id + "&unit_id=" + state.curr.unit.id + "&res_id=" + state.curr.res02.id +"&act_id=" + state.curr.actUnit.id, null, function (res) { actToggleUnit_cbRemove(res); }, true, false);
//    actToggleUnit_cbRemove({ outcome: true, courseId: state.curr.course.id, unitId: state.curr.unit.id, resId: state.curr.res02.id, actId: state.curr.actUnit.id });
    return;
  }
}


// ----^----
function actToggleUnit_cbAdd(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  if(unitGet(res.courseId, res.unitId).activityIds[res.resId] == null)
	  unitGet(res.courseId, res.unitId).activityIds[res.resId] = [];
  unitGet(res.courseId, res.unitId).activityIds[res.resId].push(res.actId);
  state.curr.actUnit  = state.curr.actAvail;
  state.curr.actAvail = null;
  appStateSave();
  
  actPopulateUnitLst  (res.unitId, res.resId, true);
  actPopulateAvailLst (res.unitId, res.resId, true);
}


// ----^----
function actToggleUnit_cbRemove(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  var idx = actUnitGetIdx(res.courseId, res.unitId, res.resId, res.actId);
  if (unitGet(res.courseId, res.unitId).activityIds[res.resId] == null)
	  unitGet(res.courseId, res.unitId).activityIds[res.resId] = [];
  unitGet(res.courseId, res.unitId).activityIds[res.resId].splice(idx, 1);
  
  state.curr.actAvail = state.curr.actUnit;
  state.curr.actUnit  = null;
  appStateSave();
  
  actPopulateUnitLst  (res.unitId, res.resId, true);
  actPopulateAvailLst (res.unitId, res.resId, true);
}




// ----------------------------------------------------------------------------------------------------------
// ---[  APPLICATION  ]--------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function appInit() {
  var h = $getHash(',', ':');
  
  state.is.my = !(h["my"] == 0);
  (h["my"] == 0 ? $clsRem($("tbar-btn-my"), "sel") : $clsAdd($("tbar-btn-my"), "sel"));
  
  appSetReady(false);
  
  $call("GET", "GetData?usr=" + state.usr.id, null, function (res) { appInit_cb(res); }, true, false);
  //appInit_cb({ outcome: true, data: data });
}


// ----^----
function appInit_cb(res) {
   //alert('ss'+res.meta.usr);
  //console.log('ss'+res.meta.usr);
  data = res.data;
  coursePopulateLst();
}


// ----------------------------------------------------------------------------------------------------------
function appSetMy(val) {
  appSetReady(false);
  
  state.is.my = val;
  (val ? $clsAdd($("tbar-btn-my"), "sel") : $clsRem($("tbar-btn-my"), "sel"));
  
  state.curr.course   = null;
  state.curr.unit     = null;
  state.curr.res01    = null;
  state.curr.res02    = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  coursePopulateLst();
}


// ----------------------------------------------------------------------------------------------------------
function appSetReady(val) {
  if (val) $hide($("msg"));
  else     $show($("msg"));
  
  state.is.ready = val;
}


// ----------------------------------------------------------------------------------------------------------
/**
 * Loads the application state from the hash portion of the query string.  Note that some of this loading 
 * happens elsewhere when the application is being initialized.  That is, course, unit, and activity lists 
 * are populated based on the saved state but in their respective dedicated functions and not here.
 */
/*
function appStateLoad() {
  var h = $getHash(',', ':');
  
  if (h["my"] !== undefined) appSetMy(h["my"] === "1", true, false);
}
*/


// ----------------------------------------------------------------------------------------------------------
/**
 * Saves the application state to the hash portion of the query string.
 */
function appStateSave() {
  var A = [];
  
  if ( state.curr.course  ) A.push("course-id:"    + encodeURIComponent(state.curr.course.id  ));
  if ( state.curr.unit    ) A.push("unit-id:"      + encodeURIComponent(state.curr.unit.id    ));
  if ( state.curr.res01   ) A.push("res01-id:"     + encodeURIComponent(state.curr.res01.id   ));
  if ( state.curr.res02   ) A.push("res02-id:"     + encodeURIComponent(state.curr.res02.id   ));
  if ( state.curr.actUnit ) A.push("act-unit-id:"  + encodeURIComponent(state.curr.actUnit.id ));
  if ( state.curr.actAvail) A.push("act-avail-id:" + encodeURIComponent(state.curr.actAvail.id));
  if (!state.is.my        ) A.push("my:0"                                  );
  
  document.location.hash = A.join(",");
}




// ----------------------------------------------------------------------------------------------------------
// ---[  COURSES  ]------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function courseAdd() {
  /*
  if (state.curr.courseId === null) return alert("Please select a course first. Add one if necessary.");
  
  var specs = prompt("Enter coma-separated information of the new area in the following format\n\n    <area-name>,<credit-count>\n\ne.g.:\n\n    Systems and Technology,12", "name,credits");
  if (specs === null || specs.length === 0) return;
  
  var A = specs.split(",");
  if (A.length !== 2) return alert("Error: Incorrect format.");
  
  var name      = A[0];
  var creditCnt = A[1];
  
  if (name.length === 0) return alert("Error: Name cannot be empty");
  if (isNaN(creditCnt))  return alert("Error: Credit count has to be an integer.");
  
  appSetReady(false);
  $call("GET", "unitAdd.php?course-id=" + state.curr.courseId + "&name=" + $enc(name) + "&credit-cnt=" + creditCnt, null, unitAdd_cb, true, false);
  */
}


// ----^----
function courseAdd_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  // ...
}


// ----------------------------------------------------------------------------------------------------------
function courseDelete() {
  if (!state.curr.course) return;
  
  var c = state.curr.course;
  if (prompt("You are about to delete the course '" + c.name.l + ".' Type the word DELETE below to confirm.").toLowerCase() !== "delete") return;
  
  appSetReady(false);
  $call("GET", "CourseDelete?course_id=" + c.id, null, function (res) { courseDelete_cb(res); }, true, false);
  //courseDelete_cb({ outcome: true, courseId: c.id });
}


// ----^----
function courseDelete_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  data.courses.splice(courseGetIdx(res.courseId), 1);
  
  state.curr.course   = null;
  state.curr.unit     = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  appStateSave();
  
  coursePopulateLst(false);
  
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function courseClone() {
  if (!state.curr.course) return alert("Select a course first.");
  
  var c = state.curr.course;
  
  if (prompt("You are about to clone the following course:\n\n    \"" + c.name + "\"\n\nType the word CLONE below to proceed." + (c.isMy ? "\n\n----\n\nNote that you are cloning YOUR OWN course.  That is allowed but unusual so make sure you are not making a mistake." : "")).toLowerCase() !== "clone") return;
  
  var date = new Date();
  var name = prompt("Provide the name for the cloned course", c.name + " [cloned on " + date.toLocaleDateString() + " at " + date.toLocaleTimeString() + "]");
  if (name === null || name.length === 0) return;
  
  appSetReady(false);
  $call("GET", "CourseClone?usr=" + state.usr.id+"&course_id=" + c.id + "&name=" + encodeURIComponent(name), null, function (res) { courseClone_cb(res); }, true, false);
  //courseClone_cb({ outcome: true, courseId: c.id, course: { id: "" + (new Date()).getTime(), institution: c.institution, name: name, num: c.num, date: c.date, created: c.created, domainId: c.domainId, isMy: true, units: [], resources: [] }});
}


// ----^----
function courseClone_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  data.courses.push(res.course);
  
  coursePopulateLst(false);
  
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function courseEdit() {
}


// ----------------------------------------------------------------------------------------------------------
function courseGet(courseId) {
  for (var i=0, ni=data.courses.length; i < ni; i++) {
    var c = data.courses[i];
    if (c.id === courseId) return c;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function courseGetURL(courseId) {
  alert("Below is the Mastery Grids URL for the currently selected course:\n\nhttp://...&courseId=" + state.curr.course.id);
}


// ----------------------------------------------------------------------------------------------------------
function courseGetIdx(courseId) {
  for (var i=0, ni=data.courses.length; i < ni; i++) {
    var c = data.courses[i];
    if (c.id === courseId) return i;
  }
  return -1;
}


// ----------------------------------------------------------------------------------------------------------
function coursePopulateLst() {
  appSetReady(false);
  
  var courseIdHash = $getHash(',', ':')["course-id"];
  var isCurrCourseInLst = false;
  
  $hide($("act-det-lst-cont"));
  
  // (1) Populate list:
  $("course-lst-cont")    .innerHTML = "";
  $("unit-lst-cont")      .innerHTML = "";
  $("res01-lst-cont")     .innerHTML = "";
  $("res02-lst-cont")     .innerHTML = "";
  $("prov-lst-cont")      .innerHTML = "";
  $("act-unit-lst-cont")  .innerHTML = "";
  $("act-avail-lst-cont") .innerHTML = "";
  
  $("unit-cnt")      .innerHTML = 0;
  $("res01-cnt")     .innerHTML = 0;
  $("res02-cnt")     .innerHTML = 0;
  $("act-unit-cnt")  .innerHTML = 0;
  $("act-avail-cnt") .innerHTML = 0;
  
  var courseCnt = 0;
  for (var i=0, ni=data.courses.length; i < ni; i++) {
    var c = data.courses[i];
    
    if (state.is.my && !c.isMy) continue;
    
    var tr = $$("tr", $("course-lst-cont"), "course-lst-item-" + c.id);
    $$("span", $$("td", tr), null, (c.isMy ? "my" : null), (c.isMy ? "M" : "")).width = "1";
    //$$("span", $$("td", tr), null, null, (c.isMy ? "&#128216;" : ""));
    $$("span", $$("td", tr), null, "institution", (c.domainId ? domGet(c.domainId).name : "")).width = "1";
    $$("span", $$("td", tr), null, "institution", c.institution || "").width = "1";
    $$("td", tr, null, null, c.num).width = "1";
    $$("td", tr, null, null, c.name).width = "*";
    $$("td", tr, null, null, "Group:"+c.groupCount).width = "1";
    var index = c.created.by.indexOf(" ");
    var author = c.created.by[0] + ". " + c.created.by.substr(c.created.by.indexOf(" "));
    if (index == -1)
    	author = c.created.by;
    $$("td", tr, null, null, author).width = "1";
    
    tr.onclick = function (courseId) { return function (e) { courseSelect(courseId, false); } }(c.id);
    
    isCurrCourseInLst = isCurrCourseInLst || (c.id === courseIdHash);
    
    courseCnt++;
  }
  $("course-cnt").innerHTML = courseCnt;
  
  // (2) Select a course based on the saved application state:
  //if (!state.is.initDone) {
  if (courseIdHash !== undefined) {
    if (!isCurrCourseInLst) {
      state.is.initDone = true;
      //appStateSave();
      appSetReady(true);
    }
    else courseSelect(courseIdHash, true);
  }
  else {
    appStateSave();
    appSetReady(true);
  }
}


// ----------------------------------------------------------------------------------------------------------
function courseSelect(courseId, doForce) {
  if ($("course-lst-item-" + courseId) === null) return;
  if (!doForce && (!state.is.ready || (state.curr.course && state.curr.course.id === courseId))) return;
  
  appSetReady(false);
  
  if (state.curr.course) $clsRem($("course-lst-item-" + state.curr.course.id), "sel");
  $clsAdd($("course-lst-item-" + courseId), "sel");
  
  $hide($("act-det-lst-cont"));
  
  state.curr.course   = courseGet(courseId);
  state.curr.unit     = null;
  state.curr.res01    = null;
  state.curr.res02    = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  var c = state.curr.course;
  if (!c.units) {
    $call(
      "GET",
      "UnitGetLst?course_id=" + courseId,
      null,
      function (res) {
        if (!res || !res.outcome) {
          if (!doForce) appStateSave();
          appSetReady(true);
          return;
        }
        c.units = res.units;
        resPopulateLst01 (courseId, doForce);
        unitPopulateLst  (courseId, doForce);
      },
      true,
      true
    );
  }
  else {
    resPopulateLst01 (courseId, doForce);
    unitPopulateLst  (courseId, doForce);
  }
}




// ----------------------------------------------------------------------------------------------------------
// ---[  DOMAINS  ]------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function domGet(domId) {
  for (var i=0, ni=data.domains.length; i < ni; i++) {
    var d = data.domains[i];
    if (d.id === domId) return d;
  }
  return null;
}




// ----------------------------------------------------------------------------------------------------------
// ---[  PROVIDERS  ]----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function provPopulateLst(courseId, resId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  var r = resGet(courseId, resId);
  
  $("prov-lst-cont").innerHTML = "";
  for (var i=0, ni=data.providers.length; i < ni; i++) {
    var p = data.providers[i];
    
    //var td = $$("td", $$("tr", $("prov-lst-cont"), "prov-lst-item-" + p.id));
    var span = $$("span", $("prov-lst-cont"), "prov-lst-item-" + p.id);
    
    var btn = $$("input", span, null, "prov-btn" + (r.providerIds.indexOf(p.id) === -1 ? "" : "-sel"));
    btn.type  = "button";
    btn.value = p.name;
    
    $$("span", span, null, null, (p.url && p.url.length > 0 ? "<a target=\"_blank\" href=\"" + p.url + "\" title=\"Open provider info page\">&#8594;</a>" : "")).width = "*";
    
    btn.onclick = function (provId, btn) { return function (e) { resProvToggle(provId, btn); } }(p.id, btn);
  }
  
  // (2) Select providers based on the saved application state:
  if (doForce) {
    // ...
  }
  else {
    appStateSave();
    appSetReady(true);
  }
}




// ----------------------------------------------------------------------------------------------------------
// ---[  RESOURCES  ]----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function resAdd01() {
  if (state.curr.course === null) return alert("Please select a course first. Add one if necessary.");
  
  var name = prompt("Enter the name of the new resource:", "");
  
  if (name === null || name.length === 0) return;
  
  if ($lfold(function (a,b) { return a || (b.name === name); }, state.curr.course.resources, false)) return alert("A resource with that name already exists. No changes will be made.");
  
  appSetReady(false);
  $call("GET", "ResAdd?usr=" + state.usr.id+"&course_id=" + state.curr.course.id + "&name=" + name, null, function (res) { resAdd01_cb(res); }, true, false);
  //resAdd01_cb({ outcome: true, courseId: state.curr.course.id, res: { id: "" + (new Date()).getTime(), name: name } });
}


// ----^----
function resAdd01_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");

  var c = courseGet(res.courseId);
  var r = { id: res.res.id, name: res.res.name, providerIds: [] };
  c.resources.push(r);
  
  $map(function (x) { x.activityIds[res.res.id] = [] }, c.units);
  
  resPopulateLst01 (res.courseId, true);
  unitPopulateLst  (res.courseId, true);
}


// ----------------------------------------------------------------------------------------------------------
function resDelete01() {
  if (!state.curr.res01) return;
  
  var r = state.curr.res01;
  if (prompt("You are about to delete the resource '" + r.name + ".' Type the word DELETE below to confirm.").toLowerCase() !== "delete") return;
  
  appSetReady(false);
  $call("GET", "ResDelete?course_id=" + state.curr.course.id + "&res_id=" + r.id, null, function (res) { resDelete01_cb(res); }, true, false);
//  resDelete01_cb({ outcome: true, courseId: state.curr.course.id, resId: r.id });
}


// ----^----
function resDelete01_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  state.curr.course.resources.splice(resGetIdx(res.courseId, res.resId), 1);
  
  $map(function (x) { delete x.activityIds[res.resId]; }, courseGet(res.courseId).units);
  
  state.curr.res01    = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  appStateSave();
  
  resPopulateLst01 (res.courseId, true);
  unitPopulateLst  (res.courseId, true);
  
  appStateSave();
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function resEdit01() {
  if (!state.curr.res01) return;
  
  var r = state.curr.res01;
  var name = prompt("Edit the name of the selected resource:", r.name);
  
  if (name === null || name.length === 0) return;
  
  if ($lfold(function (a,b) { return a || (b.name === name); }, state.curr.course.resources, false)) return alert("A resource with that name already exists. No changes will be made.");
  
  appSetReady(false);
  $call("GET", "ResEdit?course_id="+state.curr.course.id+"&res_id=" + r.id + "&name=" + name, null, function (res) { resEdit01_cb(res); }, true, false);
  //resEdit01_cb({ outcome: true, courseId: state.curr.course.id, resId: r.id, name: name });
}


// ----^----
function resEdit01_cb(res) {

  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  resGet(res.courseId, res.resId).name = res.name;
  
  resPopulateLst01 (res.courseId, true);
  unitPopulateLst  (res.courseId, true);
  
  appStateSave();
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function resGet(courseId, resId) {
  var c = courseGet(courseId);
  for (var i=0, ni=c.resources.length; i < ni; i++) {
    var r = c.resources[i];
    if (r.id === resId) return r;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function resGetIdx(courseId, resId) {
  var c = courseGet(courseId);
  for (var i=0, ni=c.resources.length; i < ni; i++) {
    var r = c.resources[i];
    if (r.id === resId) return i;
  }
  return -1;
}


// ----------------------------------------------------------------------------------------------------------
function resMoveRel01(idxDelta) {
  if (!state.curr.res01 || idxDelta === 0) return;
  
  var idx = resGetIdx(state.curr.course.id, state.curr.res01.id);

  if (idxDelta > 0 && idx === state.curr.course.resources.length - 1) return;
  if (idxDelta < 0 && idx === 0) return;
  
  idx += idxDelta;
  idx = Math.max(idx, 0);
  idx = Math.min(idx, state.curr.course.resources.length - 1);
  
  appSetReady(false);
  $call("GET", "ResSetIdx?course_id=" + state.curr.course.id + "&res_id=" + state.curr.res01.id + "&idx=" + idx+"&idxDelta="+idxDelta, null, function (res) { resMoveRel01_cb(res); }, true, false);
//  resMoveRel01_cb({ outcome: true, courseId: state.curr.course.id, resId: state.curr.res01.id, idx: idx, idxDelta: idxDelta });
}


// ----^----
function resMoveRel01_cb(res) {
  var c = courseGet(res.courseId);
  var r = resGet(res.courseId, res.resId);
  
  var idx = state.curr.course.resources.indexOf(r);  // the current index (the new one is in 'res')
  c.resources.splice(idx, 1);
  c.resources.splice(res.idx, 0, r);
  
  resPopulateLst01 (res.courseId, true);
  unitPopulateLst  (res.courseId, true);
}


// ----------------------------------------------------------------------------------------------------------
function resPopulateLst01(courseId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  $("res01-lst-cont") .innerHTML = "";
  $("prov-lst-cont")  .innerHTML = "";
  
  var c = state.curr.course;
  for (var i=0, ni=c.resources.length; i < ni; i++) {
    var r = c.resources[i];
    
    var tr = $$("tr", $("res01-lst-cont"), "res01-lst-item-" + r.id);
    $$("td", tr, null, "ord-num", (i+1) + ".").width = "1";
    $$("td", tr, null, null, r.name).width = "*";
    
    tr.onclick = function (resId) { return function (e) { resSelect01(resId, false); } }(r.id);
  }
  $("res01-cnt").innerHTML = i;
  
  // (2) Select a resource based on the saved application state:
  //if (!state.is.initDone) {
  if (doForce) {
    var resIdHash = $getHash(',', ':')["res01-id"];
    if (resIdHash === undefined) {
      state.is.init = true;
      //appStateSave();
      appSetReady(true);
    }
    else resSelect01(resIdHash, true);
  }
  else {
    appStateSave();
    appSetReady(true);
  }
}


// ----------------------------------------------------------------------------------------------------------
function resPopulateLst02(courseId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  $("res02-lst-cont")     .innerHTML = "";
  $("act-unit-lst-cont")  .innerHTML = "";
  $("act-avail-lst-cont") .innerHTML = "";
  
  $("act-unit-cnt")  .innerHTML = 0;
  $("act-avail-cnt") .innerHTML = 0;
  
  var c = state.curr.course;
  for (var i=0, ni=c.resources.length; i < ni; i++) {
    var r = c.resources[i];
    
    var tr = $$("tr", $("res02-lst-cont"), "res02-lst-item-" + r.id);
    $$("td", tr, null, "ord-num", (i+1) + ".").width = "1";
    $$("td", tr, null, null, r.name).width = "*";
    
    tr.onclick = function (resId) { return function (e) { resSelect02(resId, false); } }(r.id);
  }
  $("res02-cnt").innerHTML = i;
  
  // (2) Select a resource based on the saved application state:
  //if (!state.is.initDone) {
  if (doForce) {
    var resIdHash = $getHash(',', ':')["res02-id"];
    if (resIdHash === undefined) {
      state.is.init = true;
      //appStateSave();
      appSetReady(true);
    }
    else resSelect02(resIdHash, true);
  }
  else {
    appStateSave();
    appSetReady(true);
  }
}


// ----------------------------------------------------------------------------------------------------------
function resProvToggle(provId, btn) {
  appSetReady(false);
  
  var r = resGet(state.curr.course.id, state.curr.res01.id);
  if (r.providerIds.indexOf(provId) === -1) {
    $call("GET", "ResProvAdd?course_id=" + state.curr.course.id + "&res_id=" + state.curr.res01.id + "&prov_id=" + provId, null, function (res) { resProvToggleAdd_cb(res, btn); }, true, false);
//    resProvToggleAdd_cb({ outcome: true, courseId: state.curr.course.id, resId: state.curr.res01.id, provId: provId }, btn);
  }
  else {
    $call("GET", "ResProvRemove?course_id=" + state.curr.course.id + "&res_id=" + state.curr.res01.id + "&prov_id=" + provId, null, function (res) { resProvToggleRemove_cb(res, btn); }, true, false);
//    resProvToggleRemove_cb({ outcome: true, courseId: state.curr.course.id, resId: state.curr.res01.id, provId: provId }, btn);
  }
}


// ----^----
function resProvToggleAdd_cb(res, btn) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  resGet(res.courseId, res.resId).providerIds.push(res.provId);
  btn.className = "prov-btn-sel";
  
  if (state.curr.res02 && state.curr.res02.id === res.resId) resPopulateLst02(res.courseId, res.resId); //actPopulateAvailLst(state.curr.unit.id, res.resId, true);
  
  appSetReady(true);
}


// ----^----
function resProvToggleRemove_cb(res, btn) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  var P = resGet(res.courseId, res.resId).providerIds;
  P.splice(P.indexOf(res.provId), 1);
  btn.className = "prov-btn";
  
  if (state.curr.res02 && state.curr.res02.id === res.resId) resPopulateLst02(res.courseId, res.resId); //actPopulateAvailLst(state.curr.unit.id, res.resId, true);
  
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function resSelect01(resId, doForce) {
  if ($("res01-lst-item-" + resId) === null) return;
  if (!doForce && (!state.is.ready || (state.curr.res01 && state.curr.res01.id === resId))) return;
  
  appSetReady(false);
  
  if (state.curr.res01) $clsRem($("res01-lst-item-" + state.curr.res01.id), "sel");
  $clsAdd($("res01-lst-item-" + resId), "sel");
  
  state.curr.res01 = resGet(state.curr.course.id, resId);
  
  if (!doForce) appStateSave();
  
  provPopulateLst(state.curr.course.id, resId, doForce);
}


// ----------------------------------------------------------------------------------------------------------
function resSelect02(resId, doForce) {
  if ($("res02-lst-item-" + resId) === null) return;
  if (!doForce && (!state.is.ready || (state.curr.res02 && state.curr.res02.id === resId))) return;
  
  appSetReady(false);
  
  if (state.curr.res02) $clsRem($("res02-lst-item-" + state.curr.res02.id), "sel");
  $clsAdd($("res02-lst-item-" + resId), "sel");
  
  $hide($("act-det-lst-cont"));
  
  state.curr.res02    = resGet(state.curr.course.id, resId);
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  if (!doForce) appStateSave();
  
  // Initialize filters:
  // Author:
  $removeChildren($("filter-act-author"));
  $$("option", $("filter-act-author"), null, null, "All");
  

  var A = [];  // author IDs
  var U = state.curr.course.units;
  for (var i=0, ni=U.length; i < ni; i++) {
	  if (U[i].activityIds[resId] == null)
	  {
		  U[i].activityIds[resId] = [];
	  }
		  for (var j=0, nj=U[i].activityIds[resId].length; j < nj; j++) {
		      var act = actGet(U[i].activityIds[resId][j]);
		      if (!act.authorId) continue;
		      
		      if (A.indexOf(act.authorId) === -1) A.push(act.authorId);
		  }
   }
  
  for (var i=0, ni=A.length; i < ni; i++) {
    var a = actGetAuthor(A[i]);
    if (!a) continue;
    
    if (!a.name || a.name.length === 0) continue;
    
    $$("option", $("filter-act-author"), null, null, a.name).value = a.id;
  }
  
  // Cascade list populatation:
  actPopulateUnitLst  (state.curr.unit.id, resId, doForce);
  actPopulateAvailLst (state.curr.unit.id, resId, doForce);
}




// ----------------------------------------------------------------------------------------------------------
// ---[  UNITS  ]--------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

function unitAdd() {
  if (state.curr.course === null) return alert("Please select a course first. Add one if necessary.");
  
  var name = prompt("Enter the name of the new unit:", "");
  
  if (name === null || name.length === 0) return;
  
  if ($lfold(function (a,b) { return a || (b.name === name); }, state.curr.course.units, false)) return alert("A unit with that name already exists. No changes will be made.");
  
  appSetReady(false);
  $call("GET", "UnitAdd?usr="+state.usr.id+"&course_id=" + state.curr.course.id + "&name=" + name, null, function (res) { unitAdd_cb(res); }, true, false);
//  unitAdd_cb({ outcome: true, courseId: state.curr.course.id, unit: { id: "" + (new Date()).getTime(), name: name } });
}


// ----^----
function unitAdd_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  var c = courseGet(res.courseId);
  var u = { id: res.unit.id, name: res.unit.name, activityIds: {} };
  $map(function (x) { u.activityIds[x.id] = [] }, c.resources);
  c.units.push(u);
  
  coursePopulateLst(true);
}


// ----------------------------------------------------------------------------------------------------------
function unitDelete() {
  if (!state.curr.unit) return;
  
  var u = state.curr.unit;
  if (prompt("You are about to delete the unit '" + u.name + ".' Type the word DELETE below to confirm.").toLowerCase() !== "delete") return;
  
  appSetReady(false);
  $call("GET", "UnitDelete?course_id=" + state.curr.course.id + "&unit_id=" + u.id, null, function (res) { unitDelete_cb(res); }, true, false);
//  unitDelete_cb({ outcome: true, courseId: state.curr.course.id, unitId: u.id, sessId: null });
}


// ----^----
function unitDelete_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  state.curr.course.units.splice(unitGetIdx(res.courseId, res.unitId), 1);
  
  state.curr.unit     = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  unitPopulateLst(res.courseId, false);
  
  appStateSave();
  appSetReady(true);
}


// ----------------------------------------------------------------------------------------------------------
function unitEdit() {
  if (!state.curr.unit) return;
  
  var u = state.curr.unit;
  var name = prompt("Edit the name of the selected unit:", u.name);
  
  if (name === null || name.length === 0) return;
  
  if ($lfold(function (a,b) { return a || (b.name === name); }, state.curr.course.units, false)) return alert("A unit with that name already exists. No changes will be made.");
  
  appSetReady(false);
  $call("GET", "UnitEdit?course_id=" + state.curr.course.id + "&unit_id=" + u.id + "&name=" + name, null, function (res) { unitEdit_cb(res); }, true, false);
  //unitEdit_cb({ outcome: true, courseId: state.curr.course.id, unitId: u.id, name: name, sessId: null });
}


// ----^----
function unitEdit_cb(res) {
  if (!res || !res.outcome) return alert("An error has occured. Please try again.");
  
  unitGet(res.courseId, res.unitId).name = res.name;
  unitPopulateLst(res.courseId, true);
  
  appStateSave();
  appSetReady(true);
}


//
// ----------------------------------------------------------------------------------------------------------
function unitGet(courseId, unitId) {
  var c = courseGet(courseId);
  for (var i=0, ni=c.units.length; i < ni; i++) {
    var u = c.units[i];
    if (u.id === unitId) return u;
  }
  return null;
}


// ----------------------------------------------------------------------------------------------------------
function unitGetIdx(courseId, unitId) {
  var c = courseGet(courseId);
  for (var i=0, ni=c.units.length; i < ni; i++) {
    var u = c.units[i];
    if (u.id === unitId) return i;
  }
  return -1;
}


// ----------------------------------------------------------------------------------------------------------
function unitMoveRel(idxDelta) {
  if (!state.curr.unit || idxDelta === 0) return;
  
  var idx = unitGetIdx(state.curr.course.id, state.curr.unit.id);

  if (idxDelta > 0 && idx === state.curr.course.units.length - 1) return;
  if (idxDelta < 0 && idx === 0) return;
  
  idx += idxDelta;
  idx = Math.max(idx, 0);
  idx = Math.min(idx, state.curr.course.units.length - 1);
  
  appSetReady(false);
  $call("GET", "UnitSetIdx?course_id=" + state.curr.course.id + "&unit_id=" + state.curr.unit.id + "&idx=" + idx+"&idxDelta="+idxDelta, null, function (res) { unitMoveRel_cb(res); }, true, false);
//  unitMoveRel_cb({ outcome: true, courseId: state.curr.course.id, unitId: state.curr.unit.id, idx: idx, idxDelta: idxDelta, sessId: null });
}


// ----^----
function unitMoveRel_cb(res) {
  var c = courseGet(res.courseId);
  var u = unitGet(res.courseId, res.unitId);
  
  var idx = state.curr.course.units.indexOf(u);  // the current index (the new one is in 'res')
  c.units.splice(idx, 1);
  c.units.splice(res.idx, 0, u);
  
  unitPopulateLst(res.courseId, true);
  
  /*
  var tbl = $("unit-lst-cont");
  if (res.idx === tbl.childNodes.length - 1) tbl.appendChild(tbl.childNodes[idx]);
  else tbl.insertBefore(tbl.childNodes[idx], tbl.childNodes[res.idx + 1]);
  */
}


// ----------------------------------------------------------------------------------------------------------
function unitPopulateLst(courseId, doForce) {
  appSetReady(false);
  
  // (1) Populate list:
  $("unit-lst-cont")      .innerHTML = "";
  $("res02-lst-cont")     .innerHTML = "";
  $("act-unit-lst-cont")  .innerHTML = "";
  $("act-avail-lst-cont") .innerHTML = "";
  
  $("act-unit-cnt")  .innerHTML = 0;
  $("act-avail-cnt") .innerHTML = 0;
  
  var c = state.curr.course;
  for (var i=0, ni=c.units.length; i < ni; i++) {
    var u = c.units[i];
    
    var tr = $$("tr", $("unit-lst-cont"), "unit-lst-item-" + u.id);
    $$("td", tr, null, "ord-num", (i+1) + ".").width = "1";
    $$("td", tr, null, null, u.name).width = "*";
    
    tr.onclick = function (unitId) { return function (e) { unitSelect(unitId, false); } }(u.id);
  }
  $("unit-cnt").innerHTML = i;
  
  // (2) Select a unit based on the saved application state:
  //if (!state.is.initDone) {
  if (doForce) {
    var unitIdHash = $getHash(',', ':')["unit-id"];
    if (unitIdHash === undefined) {
      state.is.init = true;
      //appStateSave();
      appSetReady(true);
    }
    else unitSelect(unitIdHash, true);
  }
  else {
    appStateSave();
    appSetReady(true);
  }
  
  /*
  if (state.curr.unitId   !== null) $clsRem($("unit-lst-item-"   + state.curr.unitId),   "sel");
  if (state.curr.courseId !== null) $clsRem($("course-lst-item-" + state.curr.courseId), "sel");
  $clsAdd($("course-lst-item-" + courseId), "sel");
  
  if (state.curr.courseId !== null) $("loc-bar").childNodes[1].innerHTML = $("course-lst-item-" + courseId).childNodes[1].innerHTML;
  else $$("div", $("loc-bar"), null, "course", $("course-lst-item-" + courseId).childNodes[1].innerHTML);
  
  if ($("loc-bar").childNodes.length > 4) $("loc-bar").removeChild($("loc-bar").childNodes[4]);
  if ($("loc-bar").childNodes.length > 3) $("loc-bar").removeChild($("loc-bar").childNodes[3]);
  if ($("loc-bar").childNodes.length > 2) $("loc-bar").removeChild($("loc-bar").childNodes[2]);
  
  state.curr.courseId = courseId;
  state.curr.unitId   = null;
  
  $("unit-lst-cont") .innerHTML = htmlUnit;
  $("act-lst-cont")  .innerHTML = "";
  
  var unitId = $getHash(',', ':')["unit-id"];
  if (state.is.init || unitId === undefined) {
    state.is.init = true;
    appStateSave();
    appSetReady(true);
  }
  else unitSelect(unitId, true);
  */
}


// ----------------------------------------------------------------------------------------------------------
function unitSelect(unitId, doForce) {
  if ($("unit-lst-item-" + unitId) === null) return;
  if (!doForce && (!state.is.ready || (state.curr.unit && state.curr.unit.id === unitId))) return;
  
  appSetReady(false);
  
  if (state.curr.unit) $clsRem($("unit-lst-item-" + state.curr.unit.id), "sel");
  $clsAdd($("unit-lst-item-" + unitId), "sel");
  
  $hide($("act-det-lst-cont"));
  
  state.curr.unit     = unitGet(state.curr.course.id, unitId);
  state.curr.res02    = null;
  state.curr.actUnit  = null;
  state.curr.actAvail = null;
  
  if (!doForce) appStateSave();
  
  resPopulateLst02(state.curr.course.id, doForce);
}




// ----------------------------------------------------------------------------------------------------------
// ---[  UI  ]-----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------
function uiToggleMy() {
  appSetMy(!state.is.my);
}


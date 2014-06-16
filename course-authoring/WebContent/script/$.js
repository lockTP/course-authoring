var $env = {
  isIE: (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
};


// ----------------------------------------------------------------------------------------------------------
function $(id) { return document.getElementById(id); }


// ----------------------------------------------------------------------------------------------------------
function $$(type, parent, id, cls, innerHTML) {
  var el = document.createElement(type);
  
  if (id)        el.setAttribute("id", id);
  if (cls)       el.className = cls;
  if (innerHTML) el.innerHTML = innerHTML;
  if (parent)    parent.appendChild(el);
  
  return el;
}


// ----------------------------------------------------------------------------------------------------------
function $trim(s) { return (!s ? s : s.replace(/^\s+|\s+$/g, "")); }
function $enc(s)  { return (s === null ? "" : encodeURIComponent(s.replace(/\\/g, "\\\\").replace(/'/g, "\\'"))); }
function $dec(s)  { return decodeURIComponent(s.replace(/\+/g, " ")); };


// ----------------------------------------------------------------------------------------------------------
function $show(el) { el.style.display = "block"; }
function $hide(el) { el.style.display = "none";  }


// ----------------------------------------------------------------------------------------------------------
function $getTS() { return (new Date()).getTime(); }


// ----------------------------------------------------------------------------------------------------------
function $call(method, url, params, fnCb, doEval, doAlertMsg) {
  if ($env.isIE) {
    url += (url.indexOf("?") === -1 ? "?" : "&") + "__req-id__=" + $getTS();
  }
  
  var req = new XMLHttpRequest();
  req.open(method, url);
  
  if (fnCb) {
    req.onreadystatechange = function (e) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          if (doEval) {
            var res = null;
            try {
              eval("res = " + req.responseText);
            }
            catch (ex) {
              res = { outcome: false, msg: ex };
            }
            if (!res.outcome && doAlertMsg) alert(res.msg);
            fnCb(res);
          }
          else fnCb(req.responseText);
        }
        else {
          var msg = "Server error occurred. Try repeating your last action. If that doesn't work, wait for a while and then try again.";
          if (doAlertMsg) alert(msg);
          fnCb({ outcome: false, msg: msg});
        }
      }
    };
  };
  
  if (params) {
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    req.send(params);
  }
  else req.send(null);
}


// ----------------------------------------------------------------------------------------------------------
function $clsAdd(el, x) {
  if (!el) return;
  
  var cls = el.className;
  
  if (cls.indexOf(x) >= 0 ) return el;
  
  el.className = (cls + " " + x);
  return el;
}


// ----------------------------------------------------------------------------------------------------------
function $clsRem(el, x) {
  if (!el) return;
  
  var cls = el.className;
  
  if (cls.indexOf(x) === -1 ) return el;
  
  var C = cls.replace(/\s+/g, " ").split(/ /);
  for (var i=0,ni=C.length; i < ni; i++) {
    if (C[i] === x) {
      C.splice(i,1);
      i--;
      ni--;
    }
  }
  el.className = C.join(" ");
  
  return el;
}


// ----------------------------------------------------------------------------------------------------------
function $getHash(delimPair, delimKeyVal) {
  var h = {};
  
  var A = document.location.hash.substr(1).split(delimPair);
  for (var i=0, ni=A.length; i < ni; i++) {
    var B = A[i].split(delimKeyVal);
    h[B[0]] = decodeURIComponent(B[1]);
  }
  
  return h;
}


// ---------------------------------------------------------------------------------------------------------------------
function $lfold(fn, A, init) {
  var res = init;
  for (var i=0, ni=A.length; i < ni; i++) {
    res = fn(res, A[i]);
  }
  return res;
}


// ---------------------------------------------------------------------------------------------------------------------
/*
 * Pass one or more arrays after the 'fn' argument. In the case of multiple arrays they are anticipated to be of the 
 * same size.
 */
function $map(fn) {
  var lstCnt = arguments.length-1;
  var res = [];
  
  if (lstCnt === 1) {  // one extra argument
    if (!(arguments[1] instanceof Array)) {  // and this argument ain't an array
      return fn(arguments[1]);
    }
    
    for (var i=0, ni=arguments[1].length; i < ni; i++) {  // it is an array
      //res[i] = fn(arguments[1][i]);
      res[i] = fn((function (x) { return x; })(arguments[1][i]));
    }
  }
  else {  // multiple extra arguments
    for (var i=0, ni=arguments[1].length; i < ni; i++) {
      var lst = [];
      for (var j=1; j <= lstCnt; j++) {
        lst.push(arguments[j][i]);
      }
      //res[i] = fn(lst);
      res[i] = fn((function (x) { return x; })(lst));
    }
  }
  
  return res;
}


// ---------------------------------------------------------------------------------------------------------------------
function $removeChildren(el) {
  if (!el) return;
  while (el.hasChildNodes()) el.removeChild(el.childNodes[0]);
}


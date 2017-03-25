/* massive-file-renamer.js v20170228 - Marc Robledo 2013-2017 - http://www.marcrobledo.com/license */

 
 
/* Shortcuts */
function addEvent(e,ev,f){e.addEventListener(ev,f,false)}
function el(e){return document.getElementById(e)}
function show(e){el(e).style.display='block'}
function hide(e){el(e).style.display='none'}

function RenamableFile(name){
	this.oldName=name;
	var hasExtension=name.match(/\.[^\. ]+$/);
	if(hasExtension){
		this.oldName=this.oldName.replace(/\.[^\. ]+$/, '');
		this.extension=hasExtension[0];
		this.extension=this.extension.toLowerCase();
	}else{
		this.extension='';
	}

	this.updateNewName=function(){
		this.newName=this.oldName;
		for(var i=0; i<filters.length; i++){
			this.newName=filters[i].filter(this.newName);
		}
		this.newNameTD.innerHTML=this.newName+'<small>'+this.extension+'</small>';
	}

	this.tr=document.createElement('tr');
	var oldNameTD=document.createElement('td');
	oldNameTD.innerHTML='<small>'+this.oldName+this.extension+'</small>';
	this.newNameTD=document.createElement('td');
	this.tr.appendChild(oldNameTD);
	this.tr.appendChild(this.newNameTD);
	this.updateNewName();
	el('fileList').appendChild(this.tr);
}

function createInput(type){
	var input=document.createElement('input');
	if(type == 'numeric'){
		input.type='text';
		input.className='numeric';
		input.maxLength=3;
	}else{
		input.type=type;
	}
	addEvent(input, 'change', updateNames);
	addEvent(input, 'keyup', updateNames);
	return input;
}

function createInputHTML(lbl, element){
	var div=document.createElement('div');
	div.style.height='40px';
	div.style.clear='both';

	var label=document.createElement('label');
	label.innerHTML=lbl+':';
	label.style.cssFloat='left';

	element.style.cssFloat='right';

	div.appendChild(label);
	div.appendChild(element);
	return div;
}

function FilterInsert(){
	this.title='Insert';

	this.insert=createInput('text');
	this.position=createInput('numeric');
	this.end=createInput('checkbox');
	this.position.value=0;

	this.filter=function(name){
		if(!this.end.checked){
			return [name.slice(0, this.position.value), this.insert.value, name.slice(this.position.value)].join('');
		}else{
			return [name.slice(0, name.length-this.position.value), this.insert.value, name.slice(name.length-this.position.value)].join('');
		}
	};

	this.html=document.createElement('li');
	this.html.appendChild(createInputHTML('String to insert', this.insert));
	this.html.appendChild(createInputHTML('At character position', this.position));
	this.html.appendChild(createInputHTML('From the end of filename', this.end));
}


function FilterDelete(){
	this.title='Delete';

	this.position=createInput('numeric');
	this.position.value=0;
	this.characters=createInput('numeric');
	this.characters.value=1;
	this.end=createInput('checkbox');

	this.filter=function(name){
		if(!this.end.checked){
			return [name.slice(0, this.position.value), name.slice(parseInt(this.position.value)+parseInt(this.characters.value))].join('');
		}else{
			return 'end';
			//return [name.slice(0, name.length-this.position.value), name.slice(name.length-parseInt(this.position.value)+parseInt(this.characters.value))].join('');
			//return [name.slice(0, name.length-this.position.value), this.insert.value, name.slice(name.length-this.position.value)].join('');
		}
	};

	this.html=document.createElement('li');
	this.html.appendChild(createInputHTML('At character position', this.position));
	this.html.appendChild(createInputHTML('Number of character(s)', this.characters));
	this.html.appendChild(createInputHTML('From end of filename', this.end));
}




function FilterLowerCase(){
	this.title='Lowercase';


	this.filter=function(name){
		return name.toLowerCase();
	};

	this.html=document.createElement('li');
}


function FilterReplace(){
	this.title='Replace';

	this.search=createInput('text');
	this.replace=createInput('text');
	this.all=createInput('checkbox');
	this.regex=createInput('checkbox');


	this.filter=function(name){
		if(this.regex.checked){
			if(this.all.checked){
				return name.replace(new RegExp(this.search.value, 'g'), this.replace.value);
			}else{
				return name.replace(new RegExp(this.search.value), this.replace.value);
			}
		}else{
			if(this.search.value != ''){
				var replaced=name.replace(this.search.value, this.replace.value);
				if(this.all.checked){
					while(replaced.indexOf(this.search.value) != -1){
						replaced=replaced.replace(this.search.value, this.replace.value);
					}
				}
				return replaced;
			}else{
				return name;
			}
		}
	};

	this.html=document.createElement('li');
	this.html.appendChild(createInputHTML('Search', this.search));
	this.html.appendChild(createInputHTML('Replace with', this.replace));
	this.html.appendChild(createInputHTML('All occurrences', this.all));
	this.html.appendChild(createInputHTML('Regular expression', this.regex));
}






function FilterEnumerate(){
	this.title='Enumerate';

	this.start=createInput('numeric');
	this.start.value=1;
	this.end=createInput('checkbox');
	this.end.checked=false;


	this.filter=function(name){
		var number=fileCounter+parseInt(this.start.value);
		var maxFiles=files.length;
		var ten=10;


		var maxZeroes=1;
		while(parseInt(maxFiles/ten) != 0){
			maxZeroes++;
			ten=ten*10;
		}

		number = '' + number;
		while (number.length < maxZeroes) {
			number = '0' + number;
		}

		if(!this.end.checked){
			return number+' '+name;
		}else{
			return name+' '+number;
		}
	};

	this.html=document.createElement('li');
	this.html.appendChild(createInputHTML('Start with', this.start));
	this.html.appendChild(createInputHTML('Add to end', this.end));
}





function FilterClean(){
	this.title='Clean filenames';

	this.accents=createInput('checkbox');
	this.accents.checked=true;


	this.filter=function(name){
		var newName=name;
		newName=newName.replace(/[àáâä]/g, 'a');
		newName=newName.replace(/[èéêë]/g, 'e');
		newName=newName.replace(/[ìíîï]/g, 'i');
		newName=newName.replace(/[òóôö]/g, 'o');
		newName=newName.replace(/[ùúûü]/g, 'u');
		newName=newName.replace(/[ÀÁÂÄ]/g, 'A');
		newName=newName.replace(/[ÈÉÊË]/g, 'E');
		newName=newName.replace(/[ÌÍÎÏ]/g, 'I');
		newName=newName.replace(/[ÒÓÔÖ]/g, 'O');
		newName=newName.replace(/[ÙÚÛÜ]/g, 'U');
		newName=newName.replace(/[çÇ]/g, 'c');
		newName=newName.replace(/[ñÑ]/g, 'n');
		newName=newName.replace(/&/g, 'and');
		newName=newName.replace(/ ?\[(.*?)\]/g, '');
		newName=newName.replace(/[\._]/g, ' ');
		newName=newName.replace(/ +/g, ' ');
		newName=newName.replace(/(^ )|( $)/g, '');
		//newName=newName.replace(/\d+ [a-z]/g, '[A-Z]');
		newName=newName.replace(/[^a-zA-Z0-9\-_ ]/g, '');

		return newName;
	};

	this.html=document.createElement('li');
}


var fileCounter;

function resetFiles(){
	while(files.length>0){
		var file=files.pop();
		el('fileList').removeChild(file.tr);
	}
	el('files').style.display='none';
	show('drop-message');
}

function updateNames(){
	fileCounter=0;
	for(var i=0; i<files.length; i++){
		files[i].updateNewName();
		fileCounter++;
	}
}


var WEIRD_CHARS=['à', 'á', 'â', 'ä', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ò', 'ó', 'ô', 'ö', 'ù', 'ú', 'û', 'ü', 'À', 'Á', 'Â', 'Ä', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ò', 'Ó', 'Ô', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'ç', 'Ç', 'ñ', 'Ñ'];
var TRANS_CHARS=['…', ' ', 'ƒ', '„', 'Š', '‚', 'ˆ', '‰', '', '¡', 'Œ', '‹', '•', '¢', '“', '”', '—', '£', '–', '', '·', 'µ', '¶', 'Ž', 'Ô', '', 'Ò', 'Ó', 'Þ', 'Ö', '×', 'Ø', 'ã', 'à', 'â', '™', 'ë', 'é', 'ê', 'š', '‡', '€', '¤', '¥'];

function openScript(){
	MarcDialogs.open('export');
	generateScript();
}
function getScriptFormat(){
	return el('format-sh').checked?'sh':'bat'
}
function generateScript(){
	var txt;
	if(getScriptFormat() == 'sh'){
		txt='#!/bin/bash\n';
		for(var i=0; i<files.length; i++)
			txt+='mv "./'+files[i].oldName+files[i].extension+'" "./'+files[i].newName+files[i].extension+'"\n';

		for(var i=0; i<WEIRD_CHARS.length; i++)
			txt=txt.replace(new RegExp(WEIRD_CHARS[i], 'g'), TRANS_CHARS[i]);
	}else{
		txt='@echo off\r\n';
		for(var i=0; i<files.length; i++)
			txt+='ren "'+files[i].oldName+files[i].extension+'" "'+files[i].newName+files[i].extension+'"\r\n';
		txt+='pause\r\n';
		

		for(var i=0; i<WEIRD_CHARS.length; i++)
			txt=txt.replace(new RegExp(WEIRD_CHARS[i], 'g'), TRANS_CHARS[i]);
	}

	el('export-textarea').innerHTML=txt;
	el('export-textarea').focus();
	el('export-textarea').select();
}

function exportAsFile(format){
	//var blob = new Blob([el('export-textarea').innerHTML], {type: 'application/octet-stream;charset=us-ascii'});
	var blob = new Blob([el('export-textarea').innerHTML], {type: 'application/octet-stream;charset=utf-8'});
	saveAs(blob, 'rename.'+getScriptFormat());
}








function addFilter(newFilter){
	var newId=0;
	while(el('filter'+newId)){
		newId++;
	}
	newFilter.html.id='filter'+newId;

	var newDiv=document.createElement('div');
	newDiv.innerHTML='<button class="transparent with-icon icon3" onclick=\"removeFilter('+newId+');\"></button> <b>'+newFilter.title+'</b>'
	newFilter.html.insertBefore(newDiv, newFilter.html.children[0]);
	filters.push(newFilter);
	el('filters').appendChild(newFilter.html);
	updateNames();
}
function removeFilter(filterId){
	var pos=searchFilterPosition(filterId)
	el('filters').removeChild(filters[pos].html);

	filters.splice(pos, 1);
	updateNames();
}

function searchFilterPosition(id){
	for(var i=0; i<filters.length; i++){
		if(filters[i].html.id === 'filter'+id){
			return i;
		}
	}
	return null;
}






var files, filters;

addEvent(window, 'load', function(){
	files=new Array();
	filters=new Array();

	addFilter(new FilterClean());

	MarcDragAndDrop.addGlobalZone(function(droppedFiles){
		for(var i=0; i<droppedFiles.length; i++){
			var found=false;
			for(var j=0; j < files.length; j++){
				if(files[j].oldName+files[j].extension == droppedFiles[i].name){
					found=true;
					break;
				}
			}
	
			if(!found){
				files.push(new RenamableFile(droppedFiles[i].name));
				el('files').style.display='table';
				hide('drop-message');
			}
		}
	}, 'Drop files to rename here');
});






/* MarcDialogs.js */
MarcDialogs=function(){function e(e,t,n){a?e.attachEvent("on"+t,n):e.addEventListener(t,n,!1)}function t(){s&&(o?history.go(-1):(c.className="dialog-overlay",s.className=s.className.replace(/ active/g,""),s=null))}function n(e){for(var t=0;t<s.dialogElements.length;t++){var n=s.dialogElements[t];if("INPUT"===n.nodeName&&"hidden"!==n.type||"INPUT"!==n.nodeName)return n.focus(),!0}return!1}function l(){s&&(s.style.marginLeft="-"+s.offsetWidth/2+"px",s.style.marginTop="-"+s.offsetHeight/2-30+"px")}var a=/MSIE 8/.test(navigator.userAgent),o=navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)&&"function"==typeof history.pushState,i=["Cancel","Accept"],s=null,c=document.createElement("div");c.className="dialog-overlay",c.style.position="fixed",c.style.top="0",c.style.left="0",c.style.width="100%",c.style.height="100%",c.style.zIndex=8e3,e(c,"click",t),e(window,"load",function(){document.body.appendChild(c),o&&history.replaceState({myDialog:!1},null,null)}),e(window,"resize",l),o&&e(window,"popstate",function(e){e.state.myDialog?(s=e.state.myDialog,MarcDialogs.open(e.state.myDialog)):e.state.myDialog===!1&&s&&(c.className="dialog-overlay",s.className=s.className.replace(/ active/g,""),s=null)}),e(document,"keydown",function(e){s&&(27==e.keyCode?(e.preventDefault?e.preventDefault():e.returnValue=!1,t()):9==e.keyCode&&s.dialogElements[s.dialogElements.length-1]==document.activeElement&&(e.preventDefault?e.preventDefault():e.returnValue=!1,n()))});var d=null,u=null,m=null;return{open:function(e){s&&(s.className=s.className.replace(/ active/g,"")),o&&(s?history.replaceState({myDialog:e},null,null):(console.log("a"),history.pushState({myDialog:e},null,null))),c.className="dialog-overlay active",s="string"==typeof e?document.getElementById("dialog-"+e):e,s.className+=" active",s.style.position="fixed",s.style.top="50%",s.style.left="50%",s.style.zIndex=8001,s.dialogElements||(s.dialogElements=s.querySelectorAll("input,textarea,select")),n(),l(s),l(s)},close:t,alert:function(t){if(!d){d=document.createElement("div"),d.id="dialog-quick-alert",d.className="dialog",d.msg=document.createElement("div"),d.msg.style.textAlign="center",d.appendChild(d.msg),d.buttons=document.createElement("div"),d.buttons.className="buttons";var n=document.createElement("input");n.type="button",n.className="button button-accept",n.value=i[1],e(n,"click",this.close),d.buttons.appendChild(n),d.appendChild(d.buttons),document.body.appendChild(d)}d.msg.innerHTML=t,MarcDialogs.open("quick-alert")},confirm:function(t,n){if(!u){u=document.createElement("div"),u.id="dialog-quick-confirm",u.className="dialog",u.msg=document.createElement("div"),u.msg.style.textAlign="center",u.appendChild(u.msg),u.buttons=document.createElement("div"),u.buttons.className="buttons";var l=document.createElement("input");l.type="button",l.className="button button-accept",l.value=i[1],e(l,"click",function(){m()}),u.buttons.appendChild(l);var a=document.createElement("input");a.type="button",a.className="button",a.value=i[0],e(a,"click",this.close),u.buttons.appendChild(a),u.appendChild(u.buttons),document.body.appendChild(u)}m=n,u.msg.innerHTML=t,MarcDialogs.open("quick-confirm")}}}();
/* MarcDragAndDrop.js v20150304 - Marc Robledo 2014-2016 - http://www.marcrobledo.com/license */
MarcDragAndDrop=function(){function a(a,b,c){/MSIE 8/.test(navigator.userAgent)?a.attachEvent("on"+b,c):a.addEventListener(b,c,!1)}function c(a){if(a.dataTransfer.types)for(var b=0;b<a.dataTransfer.types.length;b++)if("Files"===a.dataTransfer.types[b])return!0;return!1}function d(){document.body.className=document.body.className.replace(" dragging-files","")}var b=function(a){"undefined"!=typeof a.stopPropagation?a.stopPropagation():a.cancelBubble=!0,a.preventDefault?a.preventDefault():a.returnValue=!1};return a(document,"dragenter",function(a){c(a)&&(b(a),document.body.className+=" dragging-files")}),a(document,"dragexit",function(a){b(a),d(),d(),d(),d()}),a(document,"dragover",function(a){c(a)&&b(a)}),{add:function(e,f){a(document.querySelector(e),"drop",function(a){return!!c(a)&&(b(a),d(),void f(a.dataTransfer.files))})},addGlobalZone:function(a,b){var c=document.createElement("div");c.id="drop-overlay",c.className="marc-drop-files";var d=document.createElement("span");b?d.innerHTML=b:d.innerHTML="Drop files here",c.appendChild(d),document.body.appendChild(c),this.add("#drop-overlay",a)}}}();

/*! FileSaver.js
 *  A saveAs() FileSaver implementation.
 *  2014-01-24
 *
 *  By Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See LICENSE.md
 */

var saveAs=saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(e){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=e.URL||e.webkitURL||e,i=t.createElementNS("http://www.w3.org/1999/xhtml","a"),s=!e.externalHost&&"download"in i,o=function(n){var r=t.createEvent("MouseEvents");r.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(r)},u=e.webkitRequestFileSystem,a=e.requestFileSystem||u||e.mozRequestFileSystem,f=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},l="application/octet-stream",c=0,h=[],p=function(){var e=h.length;while(e--){var t=h[e];if(typeof t==="string"){r.revokeObjectURL(t)}else{t.remove()}}h.length=0},d=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(s){f(s)}}}},v=function(r,o){var f=this,p=r.type,v=false,m,g,y=function(){var e=n().createObjectURL(r);h.push(e);return e},b=function(){d(f,"writestart progress write writeend".split(" "))},w=function(){if(v||!m){m=y(r)}if(g){g.location.href=m}else{window.open(m,"_blank")}f.readyState=f.DONE;b()},E=function(e){return function(){if(f.readyState!==f.DONE){return e.apply(this,arguments)}}},S={create:true,exclusive:false},x;f.readyState=f.INIT;if(!o){o="download"}if(s){m=y(r);t=e.document;i=t.createElementNS("http://www.w3.org/1999/xhtml","a");i.href=m;i.download=o;var T=t.createEvent("MouseEvents");T.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);i.dispatchEvent(T);f.readyState=f.DONE;b();return}if(e.chrome&&p&&p!==l){x=r.slice||r.webkitSlice;r=x.call(r,0,r.size,l);v=true}if(u&&o!=="download"){o+=".download"}if(p===l||u){g=e}if(!a){w();return}c+=r.size;a(e.TEMPORARY,c,E(function(e){e.root.getDirectory("saved",S,E(function(e){var t=function(){e.getFile(o,S,E(function(e){e.createWriter(E(function(t){t.onwriteend=function(t){g.location.href=e.toURL();h.push(e);f.readyState=f.DONE;d(f,"writeend",t)};t.onerror=function(){var e=t.error;if(e.code!==e.ABORT_ERR){w()}};"writestart progress write abort".split(" ").forEach(function(e){t["on"+e]=f["on"+e]});t.write(r);f.abort=function(){t.abort();f.readyState=f.DONE};f.readyState=f.WRITING}),w)}),w)};e.getFile(o,{create:false},E(function(e){e.remove();t()}),E(function(e){if(e.code===e.NOT_FOUND_ERR){t()}else{w()}}))}),w)}),w)},m=v.prototype,g=function(e,t){return new v(e,t)};m.abort=function(){var e=this;e.readyState=e.DONE;d(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;e.addEventListener("unload",p,false);g.unload=function(){p();e.removeEventListener("unload",p,false)};return g}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module!==null){module.exports=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}

/* Massive File Renamer HTML5 v20181120 - Marc Robledo 2013-2018 - http://www.marcrobledo.com/license */

var ACTIONS=[
	{
		defaultTitle:'Clean filenames',
		action:function(fileName){
			return fileName.replace(/[àáâä]/g, 'a')
			.replace(/[èéêë]/g, 'e')
			.replace(/[ìíîï]/g, 'i')
			.replace(/[òóôö]/g, 'o')
			.replace(/[ùúûü]/g, 'u')
			.replace(/[ÀÁÂÄ]/g, 'A')
			.replace(/[ÈÉÊË]/g, 'E')
			.replace(/[ÌÍÎÏ]/g, 'I')
			.replace(/[ÒÓÔÖ]/g, 'O')
			.replace(/[ÙÚÛÜ]/g, 'U')
			.replace(/[çÇ]/g, 'c')
			.replace(/[ñÑ]/g, 'n')
			.replace(/&/g, 'and')
			.replace(/ ?\[(.*?)\]/g, '')
			.replace(/[\._]/g, ' ')
			.replace(/ +/g, ' ')
			.replace(/(^ )|( $)/g, '')
			/*.replace(/\d+ [a-z]/g, '[A-Z]')*/
			.replace(/[^a-zA-Z0-9\-_ ]/g, '')
		}
	},{
		defaultTitle:'Insert characters',
		params:[
			{id:'text', label:'String to insert', defaultValue:''},
			{id:'position', label:'At character position', defaultValue:0},
			{id:'startAtEnd', label:'At end of filename', defaultValue:false}
		],
		action:function(fileName){
			if(!this.startAtEnd){
				return [fileName.slice(0, this.position), this.text, fileName.slice(this.position)].join('');
			}else{
				return [fileName.slice(0, fileName.length-this.position), this.text, fileName.slice(fileName.length-this.position)].join('');
			}
		}
	},{
		defaultTitle:'Delete characters',
		params:[
			{id:'position', label:'At character position', defaultValue:0},
			{id:'n', label:'Number of character(s)', defaultValue:1},
			{id:'startAtEnd', label:'At end of filename', defaultValue:false}
		],
		action:function(fileName){
			if(!this.startAtEnd.checked){
				return [fileName.slice(0, this.position), fileName.slice(parseInt(this.position)+parseInt(this.n))].join('');
			}else{
				// TO-DO!!!
				return 'end';
			}
		}
	},{
		defaultTitle:'Lowercase',
		action:function(fileName){
			return fileName.toLowerCase();
		}
	},{
		defaultTitle:'Replace',
		params:[
			{id:'search', label:'Search', defaultValue:''},
			{id:'regex', label:'Regular expression', defaultValue:false},
			{id:'replace', label:'Replace with', defaultValue:''},
			{id:'all', label:'All occurrences', defaultValue:true}
		],
		action:function(fileName){
			if(this.regex){
				if(this.all){
					return fileName.replace(new RegExp(this.search, 'g'), this.replace);
				}else{
					return fileName.replace(new RegExp(this.search), this.replace);
				}
			}else{
				if(this.search!==''){
					var replaced=fileName.replace(this.search, this.replace);
					if(this.all){
						while(replaced.indexOf(this.search)!==-1){
							replaced=replaced.replace(this.search, this.replace);
						}
					}
					return replaced;
				}else{
					return fileName;
				}
			}
		}
	},{
		defaultTitle:'Enumerate',
		params:[
			{id:'start', label:'Start with', defaultValue:1},
			{id:'end', label:'Add to end', defaultValue:false}
		],
		action:function(fileName,i){
			var number=i+parseInt(this.start);

			var padZeroes=files.length.toString(16).length;

			number = '' + number;
			while (number.length < padZeroes) {
				number = '0' + number;
			}

			if(!this.end){
				return number+' '+fileName;
			}else{
				return fileName+' '+number;
			}
		}
	}
];







var WEIRD_CHARS='àáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜçÇñÑ'.split('');
var TRANS_CHARS=[0x2026,0x0020,0x0192,0x201e,0x0160,0x201a,0x02c6,0x2030,0x008d,0x00a1,0x0152,0x2039,0x2022,0x00a2,0x201c,0x201d,0x2014,0x00a3,0x2013,0x0081,0x00b7,0x00b5,0x00b6,0x017d,0x00d4,0x0090,0x00d2,0x00d3,0x00de,0x00d6,0x00d7,0x00d8,0x00e3,0x00e0,0x00e2,0x2122,0x00eb,0x00e9,0x00ea,0x0161,0x2021,0x20ac,0x00a4,0x00a5];


 
/* Shortcuts */
function addEvent(e,ev,f){e.addEventListener(ev,f,false)}
function el(e){return document.getElementById(e)}
function show(e){el(e).style.display='block'}
function hide(e){el(e).style.display='none'}
function stopPropagation(e){if(typeof e.stopPropagation!=='undefined')e.stopPropagation();else e.cancelBubble=true}

/* variables */
var files=[], actions=[];





function RenamableFile(name, relativePath){
	this.oldName=name;
	if(relativePath){
		this.relativePath=relativePath.replace(this.oldName,'');
	}else{
		this.relativePath='';
	}
	var hasExtension=name.match(/\.[^\. ]+$/);
	if(hasExtension){
		this.oldName=this.oldName.replace(/\.[^\. ]+$/, '');
		this.extension=hasExtension[0];
		this.extension=this.extension.toLowerCase();
	}else{
		this.extension='';
	}



	this.tr=document.createElement('tr');
	this.tr.appendChild(document.createElement('td'));
	this.tr.appendChild(document.createElement('td'));
	this.tr.children[0].innerHTML='<small>'+this.relativePath+'</small>'+this.oldName+'<small>'+this.extension+'</small>';

	el('file-list').appendChild(this.tr);
	this.updateNewName();
}

RenamableFile.prototype.updateNewName=function(){
	this.newName=this.oldName;
	for(var i=0; i<actions.length; i++){
		this.newName=actions[i].action(this.newName, files.indexOf(this));
	}
	this.tr.children[1].innerHTML='<small>'+this.relativePath+'</small>'+this.newName+'<small>'+this.extension+'</small>';
}


















function resetFiles(){
	while(files.length>0){
		var file=files.pop();
		el('file-list').removeChild(file.tr);
	}
	el('file-list').parentElement.style.display='none';
	show('drop-message');
}

function updateNames(){
	for(var i=0; i<files.length; i++){
		files[i].updateNewName();
	}
}


function generateScript(){
	var txt;
	if(getScriptFormat() == 'sh'){
		txt='#!/bin/bash\n';
		for(var i=0; i<files.length; i++)
			txt+='mv "./'+files[i].relativePath+files[i].oldName+files[i].extension+'" "./'+files[i].relativePath+files[i].newName+files[i].extension+'"\n';

	}else{
		txt='@echo off\r\n';
		for(var i=0; i<files.length; i++){
			txt+='ren "'+files[i].relativePath.replace(/\//g,'\\')+files[i].oldName+files[i].extension+'" "'+files[i].relativePath.replace(/\//g,'\\')+files[i].newName+files[i].extension+'"\r\n';
		}
		txt+='pause\r\n';
		

	}

	for(var i=0; i<WEIRD_CHARS.length; i++)
		txt=txt.replace(new RegExp(WEIRD_CHARS[i], 'g'), String.fromCharCode(TRANS_CHARS[i]));

	el('export-textarea').innerHTML=txt;
}
function openDialogExport(){
	generateScript();
	MarcDialogs.open('export');
}
function getScriptFormat(){
	return el('format-sh').checked?'sh':'bat'
}


function exportAsFile(){
	//var blob = new Blob([el('export-textarea').innerHTML], {type: 'application/octet-stream;charset=us-ascii'});
	var blob = new Blob([el('export-textarea').innerHTML], {type: 'application/octet-stream;charset=utf-8'});
	saveAs(blob, 'rename.'+getScriptFormat());
}

function copyToClipboard(){
	el('export-textarea').select();
	try{
		if(document.execCommand('copy'))
			SimpleSnackbar.set('Copied to clipboard');
		else
			SimpleSnackbar.set('Can\'t copy to clipboard');
	}catch(err){
		SimpleSnackbar.set('Can\'t copy to clipboard');
	}
}



function showTooltip(button, container){
	el('tooltip').innerHTML='';
	el('tooltip').appendChild(container);

	show('tooltip');
	var buttonBoundings=button.getBoundingClientRect();
	var tooltipBoundings=el('tooltip').getBoundingClientRect();
	el('tooltip').style.top=parseInt(buttonBoundings.top+45)+'px';
	el('tooltip').style.left=parseInt(buttonBoundings.left+(buttonBoundings.width/2)-(tooltipBoundings.width/2))+'px';

}
function hideTooltip(){
	hide('tooltip');
}


function clickAction(evt){
	stopPropagation(evt);

	var actionIndex=-1;
	for(var i=0; i<actions.length && actionIndex===-1; i++){
		if(el('actions').children[i]===this.parentElement){
			actionIndex=i;
			console.log(i);
		}
	}
	actions[actionIndex].showEdit();
}
function addAction(newAction){
	newAction.li=document.createElement('li');
	var button=document.createElement('button');
	button.className='action';
	button.innerHTML=newAction.defaultTitle;
	addEvent(button, 'click', clickAction);

	newAction.li.appendChild(button);

	el('actions').appendChild(newAction.li);
	actions.push(newAction);




	var removeButton=document.createElement('button');
	removeButton.action=newAction;
	removeButton.className='remove';
	removeButton.innerHTML='&times;';
	removeButton.title='Remove action';

	addEvent(removeButton, 'click', eventClickRemoveAction);
	newAction.li.appendChild(removeButton);





	updateNames();
	newAction.showEdit();
}


function eventClickRemoveAction(evt){
	var actionIndex=actions.indexOf(this.action);
	el('actions').removeChild(el('actions').children[actionIndex]);

	actions.splice(actionIndex, 1);
	updateNames();
}


function Action(actionId){
	this.actionId=actionId;
	this.defaultTitle=ACTIONS[actionId].defaultTitle;
	this.action=ACTIONS[actionId].action;

	this.hasParams=(typeof ACTIONS[actionId].params !== 'undefined');
	if(this.hasParams){
		for(var i=0; i<ACTIONS[actionId].params.length; i++){
			this[ACTIONS[actionId].params[i].id]=ACTIONS[actionId].params[i].defaultValue;
		}
	}

}
Action.prototype.showEdit=function(){
	if(this.hasParams){
		var container=document.createElement('div');
		
		for(var i=0; i<ACTIONS[this.actionId].params.length; i++){
			var param=ACTIONS[this.actionId].params[i];


			var row=document.createElement('div');
			row.className='row';
			container.appendChild(row);

			var input=document.createElement('input');
			input.action=this;
			input.paramId=param.id;

			var label=document.createElement('label');
			label.innerHTML=param.label;

			if(typeof this[param.id]==='boolean'){
				input.type='checkbox';
				input.checked=this[param.id];
				addEvent(input, 'change', eventChangeCheckbox)
				label.htmlFor=input;

				row.appendChild(input);
				row.appendChild(label);
			}else{
				var col1=document.createElement('div');
				var col2=document.createElement('div');

				input.value=this[param.id];
				if(typeof this[param.id]==='number'){
					addEvent(input, 'keyup', eventEditNumericInput);
					addEvent(input, 'input', eventCleanNumericInput);
					input.className='mini text-right';
					col1.className='eight columns';
					col2.className='four columns text-right';
				}else{
					input.className='fw';
					col1.className='twelve columns';
					col2.className='twelve columns';
				}
				addEvent(input, 'input', eventChangeInput)

				col1.appendChild(label);
				col2.appendChild(input);
				row.appendChild(col1);
				row.appendChild(col2);

				input.type='text';
			}
		}

		showTooltip(el('actions').children[actions.indexOf(this)].children[0], container);
	}else{
		hideTooltip();
	}
}
function eventChangeCheckbox(evt){
	this.action[this.paramId]=this.checked;
	updateNames();
}
function eventChangeInput(evt){
	this.action[this.paramId]=this.value;
	updateNames();
}
function eventCleanNumericInput(evt){
	this.value=parseInt(this.value.replace(/[^0-9]/g,''));

	if(isNaN(this.value) || this.value<0)
		this.value=0;
	else if(this.value>400)
		this.value=400;

}
function eventEditNumericInput(evt){
	this.value=parseInt(this.value.replace(/[^0-9]/g,''));


	if(evt.keyCode===38){ //up
		this.value++
	}else if(evt.keyCode===40){ //down
		this.value--
	}

	if(isNaN(this.value) || this.value<0)
		this.value=0;
	else if(this.value>400)
		this.value=400;

}




var SimpleSnackbar=(function(){
	var snackbar=document.createElement('snackbar');
	snackbar.id='snackbar';

	var timeout;

	addEvent(window, 'load', function(){
		document.body.appendChild(snackbar);
	});
	function closeSnackbar(){
		snackbar.className='';
	}
	addEvent(snackbar, 'click', function(){
		if(timeout)
			clearTimeout(timeout);
		closeSnackbar();
	});
	return {
		set:function(text){
			if(timeout){
				clearTimeout(timeout);
			}
			snackbar.innerHTML=text;

			snackbar.className='open';
			timeout=setTimeout(closeSnackbar, 3000);
		}
	}
}());

addEvent(window, 'load', function(){
	addAction(new Action(0));

	MarcDragAndDrop.addGlobalZone(parseFiles, 'Drop files to be renamed here');

	var tooltipNewAction=document.createElement('div');
	var eventClickNewAction=function(){
		addAction(new Action(this.actionId));
	}
	for(var i=0; i<ACTIONS.length; i++){
		var button=document.createElement('button');
		button.actionId=i;
		button.innerHTML=ACTIONS[i].defaultTitle;
		addEvent(button, 'click', eventClickNewAction);

		tooltipNewAction.appendChild(button);
	}

	addEvent(el('button-addaction'), 'click', function(evt){
		stopPropagation(evt);
		showTooltip(this, tooltipNewAction);
	});
	addEvent(el('tooltip'), 'click', stopPropagation);
	addEvent(window, 'click', hideTooltip);
});



function parseFiles(droppedFiles){
	for(var i=0; i<droppedFiles.length; i++){
		var found=false;
		for(var j=0; j<files.length; j++){
			if(files[j].oldName+files[j].extension === droppedFiles[i].name){
				found=true;
				break;
			}
		}

		if(!found){
			var newFile=new RenamableFile(droppedFiles[i].name, droppedFiles[i].webkitRelativePath || false);
			
			files.push(newFile);
			el('file-list').parentElement.style.display='table';
			hide('drop-message');
		}
	}
}






/* MarcDialogs.js v20170405 - Marc Robledo 2014-2017 - http://www.marcrobledo.com/license */
MarcDialogs=function(){function c(b,c,d){a?b.attachEvent("on"+c,d):b.addEventListener(c,d,!1)}function l(){j--,s()}function m(){j++,s()}function n(){j>=0&&(b?history.go(-1):l())}function o(a){for(var b=0;b<a.dialogElements.length;b++){var c=a.dialogElements[b];if("INPUT"===c.nodeName&&"hidden"!==c.type||"INPUT"!==c.nodeName)return c.focus(),!0}return!1}function p(a,b){a.style.marginLeft="-"+parseInt(a.offsetWidth/2)+"px",a.style.marginTop="-"+parseInt(a.offsetHeight/2)-30+"px",b||p(a,!0)}function r(){for(var a=0;document.getElementById("dialog-quick"+a);)-1===k.indexOf(document.getElementById("dialog-quick"+a))&&document.body.removeChild(document.getElementById("dialog-quick"+a)),a++}function s(){if(-1===j){g.className="dialog-overlay";for(var a=0;a<k.length;a++)k[a].className=k[a].className.replace(" active","");window.setTimeout(r,2500)}else{g.className="dialog-overlay active";for(var a=0;a<j;a++)k[a].style.zIndex=d-(j+a);-1==k[j].className.indexOf(" active")&&(k[j].className+=" active"),k[j].style.zIndex=d+1;for(var a=j+1;a<k.length;a++)k[a].className=k[a].className.replace(/ active/g,"");p(k[j])}}var a=/MSIE 8/.test(navigator.userAgent),b="function"==typeof history.pushState,d=9e3,e=["Cancel","Accept"];(navigator.language||navigator.userLanguage).startsWith("es")&&(e=["Cancelar","Aceptar"]);var g=document.createElement("div");g.className="dialog-overlay",g.style.position="fixed",g.style.top="0",g.style.left="0",g.style.width="100%",g.style.height="100%",g.style.zIndex=d,c(g,"click",n),c(window,"load",function(){document.body.appendChild(g)});var i=((new Date).getTime(),!1),j=-1,k=[];return c(window,"resize",function(){for(var a=0;a<k.length;a++)p(k[a])}),b&&c(window,"popstate",function(a){if(i)if(a.state&&"number"==typeof a.state.marcDialog)a.state.marcDialog<j?l():m();else for(;j>=0;)l()}),c(document,"keydown",function(a){if(k.length&&j>=0)if(27==a.keyCode)a.preventDefault?a.preventDefault():a.returnValue=!1,n();else if(9==a.keyCode){var b=k[j];b.dialogElements[b.dialogElements.length-1]===document.activeElement&&(a.preventDefault?a.preventDefault():a.returnValue=!1,o(b))}}),{currentDialogs:function(){return k},currentDialog:function(){return j},open:function(a){var c=document.getElementById("dialog-"+a.replace(/^dialog-/,""));c.style.position="fixed",c.style.top="50%",c.style.left="50%",c.style.zIndex=parseInt(g.style.zIndex)+1,c.dialogElements||(c.dialogElements=c.querySelectorAll("input,textarea,select")),o(c),j++,k[j]=c,s(),i=!0,b&&history.pushState({marcDialog:j},null,null)},replace:function(){},close:n,closeAll:function(){j=-1,s()},alert:function(a){var b=document.createElement("div");b.className="dialog";for(var d=0;document.getElementById("dialog-quick"+d);)d++;b.id="dialog-quick"+d,document.body.appendChild(b);var f=document.createElement("div");f.style.textAlign="center",f.innerHTML=a;var g=document.createElement("div");g.className="buttons";var h=document.createElement("button");h.className="colored accept",h.innerHTML=e[1],c(h,"click",this.close),g.appendChild(h),b.appendChild(f),b.appendChild(g),MarcDialogs.open("quick"+d)},confirm:function(a,b){var d=document.createElement("div");d.className="dialog";for(var f=0;document.getElementById("dialog-quick"+f);)f++;d.id="dialog-quick"+f,document.body.appendChild(d);var g=document.createElement("div");g.style.textAlign="center",g.innerHTML=a;var h=document.createElement("div");h.className="buttons";var i=document.createElement("button");i.className="colored accept",i.innerHTML=e[1],c(i,"click",b);var j=document.createElement("button");j.innerHTML=e[0],c(j,"click",this.close),h.appendChild(i),h.appendChild(j),d.appendChild(g),d.appendChild(h),MarcDialogs.open("quick"+f)}}}();

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}


/* MarcDragAndDrop.js v20170923 - Marc Robledo 2014-2017 - http://www.marcrobledo.com/license */
MarcDragAndDrop=(function(){
	var showDrag=false, timeout=-1;
	/* addEventListener polyfill for IE8 */
	function addEvent(e,t,f){if(/MSIE 8/.test(navigator.userAgent))e.attachEvent('on'+t,f);else e.addEventListener(t,f,false)}

	/* crossbrowser stopPropagations+preventDefault */
	var no=function(e){if(typeof e.stopPropagation!=='undefined')e.stopPropagation();else e.cancelBubble=true;if(e.preventDefault)e.preventDefault();else e.returnValue=false}

	/* check if drag items are files */
	function checkIfDraggingFiles(e){
		if(e.dataTransfer.types)
			for(var i=0;i<e.dataTransfer.types.length;i++)
				if(e.dataTransfer.types[i]==='Files')
					return true;
		return false
	}

	/* remove dragging-files class name from body */
	function removeClass(){document.body.className=document.body.className.replace(/ dragging-files/g,'')}


	/* drag and drop document events */
	addEvent(window, 'load', function(){
		addEvent(document,'dragenter',function(e){
			if(checkIfDraggingFiles(e)){
				if(!/ dragging-files/.test(document.body.className))
					document.body.className+=' dragging-files'
				showDrag=true; 
			}
		});
		addEvent(document,'dragleave',function(e){
			showDrag=false; 
			clearTimeout(timeout);
			timeout=setTimeout(function(){
				if(!showDrag)
					removeClass();
			}, 200);
		});
		addEvent(document,'dragover',function(e){
			if(checkIfDraggingFiles(e)){
				no(e);
				showDrag=true; 
			}
		});
	});
	addEvent(document,'drop',removeClass);


	/* return MarcDragAndDrop object */
	return{
		add:function(z,f){
			addEvent(document.getElementById(z),'drop',function(e){
				no(e);
				removeClass();
				if(checkIfDraggingFiles(e))
					f(e.dataTransfer.files)
			});
		},
		addGlobalZone:function(f,t){
			var div=document.createElement('div');
			div.id='drop-overlay';
			div.className='marc-drop-files';
			var span=document.createElement('span');
			if(t)
				span.innerHTML=t;
			else
				span.innerHTML='Drop files here';
			div.appendChild(span);
			document.body.appendChild(div);

			this.add('drop-overlay',f);
		}
	}
}());

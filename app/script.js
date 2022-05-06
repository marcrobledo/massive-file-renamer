/* Massive File Renamer HTML5 v20220502 - Marc Robledo 2013-2022 - http://www.marcrobledo.com/license */



/* service worker */
const FORCE_HTTPS=true;
if(FORCE_HTTPS && location.protocol==='http:')
	location.href=window.location.href.replace('http:','https:');
else if(location.protocol==='https:' && 'serviceWorker' in navigator && window.location.hostname==='www.marcrobledo.com')
	navigator.serviceWorker.register('/massive-file-renamer/_cache_service_worker.js', {scope: '/massive-file-renamer/'});




function FilterClean(){}
FilterClean.prototype.action=function(fileName){
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
FilterClean.prototype.getLabel=function(){
	return 'Clean filenames';
}
FilterClean.prototype.getId=function(){
	return 'clean';
}




function FilterInsert(){
	this.text='';
	this.position=0;
	this.end=false;
}
FilterInsert.prototype.action=function(fileName){
	if(!this.end){
		return fileName.substring(0, this.position) + this.text + fileName.substring(this.position);
	}else{
		return fileName.substring(0, fileName.length-this.position) + this.text + fileName.substring(fileName.length-this.position);
	}
}
FilterInsert.prototype.getLabel=function(){
	return 'Insert text';
}
FilterInsert.prototype.getId=function(){
	return 'insert';
}





function FilterRemove(){
	this.n=1;
	this.position=0;
	this.end=false;
}
FilterRemove.prototype.action=function(fileName){
	if(!this.end){
		return fileName.substring(0, this.position) + fileName.substring(this.position+this.n);
	}else{
		return fileName.substring(0, fileName.length-this.position-this.n) + fileName.substring(fileName.length-this.position);
	}
}
FilterRemove.prototype.getLabel=function(){
	return 'Remove characters';
}
FilterRemove.prototype.getId=function(){
	return 'remove';
}




function FilterLowercase(){}
FilterLowercase.prototype.action=function(fileName){
	return fileName.replace(/[ÀÁÂÄ]/g, 'a')
		.replace(/[ÈÉÊË]/g, 'e')
		.replace(/[ÌÍÎÏ]/g, 'i')
		.replace(/[ÒÓÔÖ]/g, 'o')
		.replace(/[ÙÚÛÜ]/g, 'u')
		.replace(/[Ç]/g, 'ç')
		.replace(/[Ñ]/g, 'ñ')
		.toLowerCase()
}
FilterLowercase.prototype.getLabel=function(){
	return 'Lowercase';
}
FilterLowercase.prototype.getId=function(){
	return 'lowercase';
}


function FilterReplace(){
	this.search='';
	this.regex=false;
	this.replace='';
	this.all=true;
}
FilterReplace.prototype.action=function(fileName){
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
				var loops=0;
				while(replaced.indexOf(this.search)!==-1 && loops<80){
					replaced=replaced.replace(this.search, this.replace);
					loops++;
				}
			}
			return replaced;
		}else{
			return fileName;
		}
	}
}
FilterReplace.prototype.getLabel=function(){
	return 'Replace';
}
FilterReplace.prototype.getId=function(){
	return 'replace';
}








function FilterEnumerate(){
	this.start=1;
	this.end=false;
}
FilterEnumerate.prototype.action=function(fileName, i){
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
FilterEnumerate.prototype.getLabel=function(){
	return 'Enumerate'
}
FilterEnumerate.prototype.getId=function(){
	return 'enumerate';
}






var WEIRD_CHARS='àáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜçÇñÑ'.split('');
var TRANS_CHARS=[0x2026,0x0020,0x0192,0x201e,0x0160,0x201a,0x02c6,0x2030,0x008d,0x00a1,0x0152,0x2039,0x2022,0x00a2,0x201c,0x201d,0x2014,0x00a3,0x2013,0x0081,0x00b7,0x00b5,0x00b6,0x017d,0x00d4,0x0090,0x00d2,0x00d3,0x00de,0x00d6,0x00d7,0x00d8,0x00e3,0x00e0,0x00e2,0x2122,0x00eb,0x00e9,0x00ea,0x0161,0x2021,0x20ac,0x00a4,0x00a5];



/* variables */
var files=[], actions=[];
var currentAction;




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



	this.tr=$('<tr></tr>')
		.append($('<td></td>')
			.html('<small>'+this.relativePath+'</small>'+this.oldName+'<small>'+this.extension+'</small>')
		)
		.append($('<td></td>'))
	;

	$('#tbody').append(this.tr);
	this.updateNewName();
}

RenamableFile.prototype.updateNewName=function(){
	this.newName=this.oldName;
	for(var i=0; i<actions.length; i++){
		this.newName=actions[i].action(this.newName, files.indexOf(this));
	}
	$(this.tr).children().last().html('<small>'+this.relativePath+'</small>'+this.newName+'<small>'+this.extension+'</small>');
}







function refreshUI(){
	if(files.length){
		$('#table').show();
		$('#button-export').prop('disabled', false);
	}else{
		$('#table').hide();
		$('#button-export').prop('disabled', true);
	}

	if(files.length<15)
		$('#drop-message').show();
	else
		$('#drop-message').hide();
}






function sanitizeNumber(string){
	string=string.replace(/[^\d]/g, '').replace(/^0+/,'');
	if(!string)
		return '0'; 
	return string;
}




function resetFiles(){
	files=[];
	$('#tbody').empty();
	refreshUI();
}

function updateNames(){
	for(var i=0; i<files.length; i++){
		files[i].updateNewName();
	}
}


function generateScript(){
	var txt;
	var format=getScriptFormat();
	if(format==='sh'){
		txt='#!/bin/bash\n';
		for(var i=0; i<files.length; i++)
			txt+='mv "./'+files[i].relativePath+files[i].oldName+files[i].extension+'" "./'+files[i].relativePath+files[i].newName+files[i].extension+'"\n';

	}else{
		txt='@echo off\n';
		if(format==='bat'){
			txt+='chcp 65001\n';
		}
		for(var i=0; i<files.length; i++){
			txt+='ren "'+files[i].relativePath.replace(/\//g,'\\')+files[i].oldName+files[i].extension+'" "'+files[i].relativePath.replace(/\//g,'\\')+files[i].newName+files[i].extension+'"\n';
		}
		txt+='pause\n';
		
		if(format==='bat-ansi'){
			for(var i=0; i<WEIRD_CHARS.length; i++)
				txt=txt.replace(new RegExp(WEIRD_CHARS[i], 'g'), String.fromCharCode(TRANS_CHARS[i]));
		}
		//txt=txt.replace(/\n/g, '\r\n');
	}

	

	$('#export-textarea').val(txt);
}
function openDialogExport(){
	generateScript();
	MarcDialogs.open('export');
}
function getScriptFormat(){
	var FORMATS=['bat', 'bat-ansi', 'sh'];
	for(var i=0; i<FORMATS.length; i++){
		if($('#checkbox-format-'+FORMATS[i]).prop('checked'))
			return FORMATS[i];
	}
	return null;
}


function exportAsFile(){
	//var blob = new Blob([el('export-textarea').innerHTML], {type: 'application/octet-stream;charset=us-ascii'});
	var scriptText=$('#export-textarea').val().replace(/[\r\n]+/g, '\n');
	if(/^bat/.test(getScriptFormat()))
		scriptText=scriptText.replace(/\n/g, '\r\n');
	var blob = new Blob([scriptText], {type: 'application/octet-stream;charset=utf-8'});
	saveAs(blob, 'rename_files.'+getScriptFormat().replace(/-\w+$/,''));
}

function copyToClipboard(){
	document.getElementById('export-textarea').select();
	try{
		if(document.execCommand('copy'))
			SimpleSnackbar.set('Copied to clipboard');
		else
			SimpleSnackbar.set('Can\'t copy to clipboard');
	}catch(err){
		SimpleSnackbar.set('Can\'t copy to clipboard');
	}
}



function showTooltip(tooltipId, button){
	$('#tooltip-'+tooltipId).show();

	var buttonBoundings=button.getBoundingClientRect();
	var tooltipBoundings=$('#tooltip-'+tooltipId).get(0).getBoundingClientRect();

	$('#tooltip-'+tooltipId)
		.css('top', Math.floor(buttonBoundings.top+45)+'px')
		.css('left', Math.floor(buttonBoundings.left+(buttonBoundings.width/2)-(tooltipBoundings.width/2))+'px')
	;
	
	$('#tooltip-'+tooltipId).find('input').first().focus();
}

function addAction(newAction, openDialog){
	var li=$('<li>').append(
		$('<button></button>')
			.html(newAction.getLabel())
			.click(function(evt){
				evt.stopPropagation();
				currentAction=newAction;

				var id=newAction.getId();
				$('.tooltip').hide();
				if($('#tooltip-'+id).length){
					for(var prop in currentAction){
						if(typeof currentAction[prop]==='number' || typeof currentAction[prop]==='string'){
							$('#input-'+id+'-'+prop).val(currentAction[prop]);
						}else if(typeof currentAction[prop]==='boolean'){
							$('#input-'+id+'-'+prop).prop('checked', currentAction[prop]);
						}
					}
					showTooltip(id, this);
				}
			})
			.addClass('action')
	);

	$('#actions').append(li);
	actions.push(newAction);




	$(li).append(
		$('<button></button>').
		html('<img src="app/assets/icon_remove.svg" class="icon icon-remove" />').
		prop('title','Remove action').
		addClass('remove').
		click(function(evt){
			actions.splice(actions.indexOf(newAction), 1);
			updateNames();

			$(this).parent().remove();
		})
	);



	if(typeof openDialog==='undefined' || !!openDialog){
		$(li).children().first().click();
	}

	updateNames();
}



var SimpleSnackbar=(function(){
	var snackbar=document.createElement('div');
	snackbar.id='snackbar';

	var timeout;

	$(document).ready(function(){
		document.body.appendChild(snackbar);
	});
	function closeSnackbar(){
		snackbar.className='';
	}
	$(snackbar).click(function(){
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
		}
	}
	refreshUI();
}







$(document).ready(function(){
	if(!/Windows/.test(navigator.userAgent)){
		$('#checkbox-format-sh').prop('checked', true);
	}
	addAction(new FilterClean(), false);

	MarcDragAndDrop.addGlobalZone(parseFiles, 'Drop files to be renamed here');


	$('#button-new').click(function(evt){
		evt.stopPropagation();

		$('.tooltip').hide();
		showTooltip('new', this);
	});
	$('#tooltip-new button').click(function(evt){
		var id=this.id.replace('button-new-', '');
		if(id==='clean'){
			addAction(new FilterClean());
		}else if(id==='insert'){
			addAction(new FilterInsert());
		}else if(id==='remove'){
			addAction(new FilterRemove());
		}else if(id==='lowercase'){
			addAction(new FilterLowercase());
		}else if(id==='replace'){
			addAction(new FilterReplace());
		}else if(id==='enumerate'){
			addAction(new FilterEnumerate());
		}
	});
	$('.tooltip').click(function(evt){
		evt.stopPropagation();
	});
	$(window).click(function(evt){
		$('.tooltip').hide();
	});

	refreshUI();	
});



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

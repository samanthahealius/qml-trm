var oCatalogue;
var sPrev = '';
var ajaxTimeout;
var now = new Date();
var year = now.getFullYear();
var aMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var aWeekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
var oRegexFileExt = /\.([^./]+?)(?:\?.*)?$/;
var oRegexFileName = /([^/]+\.[^./]+)$/;
var oRegexEscapeSpecialChars = /([-.+*^$|\\\(\)\[\]])/g;
var oRegexContainers = null;
var oRegexContainersQuantity = /^\d\s*x/;
var oRegexContainerQuantityCleanup = /^\d\s*x\s*/g;
var oClassByExt = {
	  '7z'   : 'fa-file-archive-o'
	, 'doc'  : 'fa-file-word-o'
	, 'docx' : 'fa-file-word-o'
	, 'gif'  : 'fa-file-image-o'
	, 'jpg'  : 'fa-file-photo-o'
	, 'jpeg' : 'fa-file-photo-o'
	, 'mov'  : 'fa-file-video-o'
	, 'mp3'  : 'fa-file-audio-o'
	, 'mp4'  : 'fa-file-video-o'
	, 'mpg'  : 'fa-file-video-o'
	, 'pdf'  : 'fa-file-pdf-o'
	, 'png'  : 'fa-file-image-o'
	, 'ppt'  : 'fa-file-powerpoint-o'
	, 'pptx' : 'fa-file-powerpoint-o'
	, 'rar'  : 'fa-file-archive-o'
	, 'rtf'  : 'fa-file-word-o'
	, 'xls'  : 'fa-file-excel-o'
	, 'xlsx' : 'fa-file-excel-o'
	, 'tif'  : 'fa-file-photo-o'
	, 'txt'  : 'fa-file-text-o'
	, 'wav'  : 'fa-file-audio-o'
	, 'zip'  : 'fa-file-archive-o'
};
var sDefaultExtClassName = 'fa-file-o';
var LOG1024 = Math.log(1024);
var aFileSizes = [[1, 0, 'bytes'], [1024, 0, 'KB'], [1024*1024, 1, 'MB'], [1024*1024*1024, 1, 'GB']];
// var sWebAPIHost = window.location == undefined || window.location.hostname.indexOf('.com.au') !== -1 ? 'https://webapi.healius.com.au' : 'http://api'; // without trailing slash!
var sWebAPIHost = 'https://webapi.healius.com.au';
var iBillingRulesFeatureID = 92;
var sCompanyAbbr = ''; // Default value if none of the conditions match
var domain = window.location.hostname.toLowerCase(); // Get the domain of the current page and convert to lowercase

if (domain.includes('laverty')) {
    sCompanyAbbr = 'LAV';
} else if (domain.includes('qml')) {
    sCompanyAbbr = 'QML';
} else if (domain.includes('dorevitch')) {
    sCompanyAbbr = 'DOR';
} else if (domain.includes('tmlpath')) {
    sCompanyAbbr = 'TML';
} else if (domain.includes('wdp')) {
    sCompanyAbbr = 'WDP';
}
else{
    sCompanyAbbr = 'TML';
}

console.log(sCompanyAbbr); // For testing purposes, to see the output

var bAutoSearch = false;

jQuery(function(){
	jQuery('input.ui-input').addClass('ui-widget-content ui-corner-all');

	manualsInit();
});



function manualsInit(){
	log('manualsInit started');

	var oQuery = parseQueryString(window.location.search.substring(1));
	log('query', window.location.search, oQuery);

	jQuery('#Form')
		.submit(function(){
			var sText = jQuery('#trm-search-text').val().trim();
			if(isValid(sText)){
				sPrev = sText;
				manualsLoad(sText);
			} else {
				ajaxFinished();
			}
			return false;
		})
	;

	jQuery('#trm-search-go')
		.button({
			disabled: true
		})
	;

	jQuery('#trm-search-reset')
		.button({
			disabled: true
		})
		.click(function(){
			jQuery('.trm-search-result-heading').hide();
			jQuery('#trm-list').hide().empty();
			jQuery('#trm-search-text').val('').focus();
			sPrev = '';
			setButtonsStates();
		})
	;

	jQuery('#trm-search-text')
		.on('keyup change', function(){
			setButtonsStates();
		})
	;

	if(oQuery.text != null){
		jQuery('#trm-search-text')
			.val(oQuery.text)
			.trigger('change')
		;
		if(isValid(oQuery.text)){
			ajaxStarted();
			bAutoSearch = true;
		}
	}

	catalogueLoad();

	log('manualsInit finished');
}


function setButtonsStates(){
	sValue = jQuery('#trm-search-text').val().trim();
	jQuery('#trm-search-go').button(isValid(sValue) ? 'enable' : 'disable');
	jQuery('#trm-search-reset').button(sValue != '' ? 'enable' : 'disable');
}


function isValid(sText){
	return sText.length > 1 && sText !== sPrev;
}


function ajaxStarted(){
	log('ajaxStarted');

	ajaxTimeout = setTimeout(function(){
		jQuery('#trm-loading').show();
	}, 200);
}


function ajaxFinished(){
	log('ajaxFinished');

	clearTimeout(ajaxTimeout);

	setTimeout(function(){
		jQuery('#trm-loading').hide();
	}, 250);
}


function manualsLoad(sText){
	ajaxStarted();
	log('Manuals load started');
	jQuery.get(urlGet('/trm/manuals/', ['text=' + encodeURIComponent(sText)]))
		.done(function(response){
			log('Manuals load finished (SUCCESS)', response);
			ajaxFinished();
			setButtonsStates();
			if(response){
				messageBuild(response.message);
				manualsBuild(response.data);
			}
		})
		.fail(function(reason){
			log('Manuals load finished (FAIL)', reason);
			ajaxFinished();
			setButtonsStates();
		})
	;
}


function catalogueLoad(){
	log('catalogueLoad started');
	return jQuery.get(urlGet('/trm/catalogue/'))
		.done(function(response){
			log('catalogueLoad finished (SUCCESS)', response);
			if(response) catalogueBuild(response);
			if(bAutoSearch){
				bAutoSearch = false;
				jQuery('#trm-search-go').trigger('click');
			}
		})
		.fail(function(reason){
			log('catalogueLoad finished (FAIL)', reason);
			messageBuild('<p style="color: red">Initialization error' + errorMessagePrint(reason, ': ') + '</p>');
		})
	;
}


function catalogueBuild(data){
	log('catalogueBuild started');

	oCatalogue = data;
	if(oCatalogue.departments){
		var o = {};
		jQuery.each(oCatalogue.departments, function(i, v){ o[v.id] = v; });
		oCatalogue.oDept = o;
	}

	if(oCatalogue.containers){
		var o = {};
		jQuery.each(oCatalogue.containers, function(i, v){
			if(v.abbr) o[v.abbr] = v;
			if(v.img && v.img.src){
				v.img.html = new Image();
				v.img.html.src = sWebAPIHost + v.img.src; // pre-load image
			}
		});
		oCatalogue.oContainers = o;
		oRegexContainers = buildContainersRegex(oCatalogue.containers);
		log('catalogueBuild.oRegexContainers', oRegexContainers);
	}

	log('catalogueBuild finished', oCatalogue);
}


function errorMessagePrint(reason, prefix){
	var s = reason && reason.responseText ? reason.responseText : null;
	try{
		var o = JSON.parse(s);
		if(o.message) s = o.message;
	}catch(e){
		// just ignore
	}
	return s == null ? '' : (prefix + s);
}


function messageBuild(sMessage){
	if(sMessage != null && sMessage != ''){
		jQuery('#trm-message').html(sMessage).show();
	} else {
		jQuery('#trm-message').hide();
	}
}


function manualsBuild(aManuals){
	log('manualsBuild started');

	if(aManuals.length){
		jQuery('#trm-list-empty').hide();
		var list = jQuery('#trm-list');
		list.hide().empty();
		var first;
		jQuery.each(aManuals, function(i, v){
			var o = new Manual(v);
			if(first === undefined) first = o;
			list.append(o.element);
		});
		if(aManuals.length === 1) first.open();
		list.show();
	} else {
		jQuery('#trm-list').hide();
		jQuery('#trm-list-empty').show();
	}

	log('manualsBuild finished');
}


function getCurrentDomain(){
	return window.location ? window.location.hostname : null;
}


function isLocalURI(sHREF){
	var sCurrentDomain = getCurrentDomain();
	return sHREF.indexOf('/') === 0 || (sHREF.indexOf('http') === 0 && sCurrentDomain != null && sHREF.indexOf(sCurrentDomain) !== -1);
}


function urlGet(sPath, aQuery){
	aQuery = aQuery || [];
	aQuery.unshift('c=' + sCompanyAbbr);
	var sURL = sWebAPIHost + sPath + '?' + aQuery.join('&');
	log('urlGet', sURL);
	return sURL;
}


function manualBuildContent(oItem){
	log('manualBuildContent', oItem.id);

	var tbody = '';

	if(oCatalogue.oDept[oItem.dept_id]){
		tbody += manualBuildContentRow('Department', oCatalogue.oDept[oItem.dept_id].url != null ? ('<a href="' + oCatalogue.oDept[oItem.dept_id].url + '" target="_blank">' + oCatalogue.oDept[oItem.dept_id].name + '</a>') : oCatalogue.oDept[oItem.dept_id].name);
	}

	if(oItem.features != null){
		var aFiles = [];
		var aFeatures = [];
		var prev = null;

		jQuery.each(oCatalogue.features, function(i, feature){
			if(oItem.features[feature.id] != null){
				var value = featureValue(feature, oItem.features);
				if(featureIsFile(feature, oItem.features)){
					aFiles.push(value);
				} else {
					if(prev === null || prev.feature.type !== feature.type || prev.feature.name !== feature.name){
						var o = {
							  feature: feature
							, values:  [value]
						};
						aFeatures.push(o);
						prev = o;
					} else {
						prev.values.push(value);
					}
				}
			}
		});

		if(aFeatures.length){
			//log('aFeatures', aFeatures);
			jQuery.each(aFeatures, function(i, o){
				tbody += manualBuildContentRows(o.feature.name, o.values, 'feature feature-' + o.feature.type);
			});
		}
		if(aFiles.length){
			//log('aFiles', aFiles);
			var sLIs = '';
			jQuery.each(aFiles, function(i, s){
				sLIs += '<li class="file">' + s + '</li>';
			});
			tbody += manualBuildContentRow('Files to download', '<ul class="files">' + sLIs + '</ul>', 'feature feature-files');
		}
	}

	if(oItem.pseudonyms != null){
		var pseudonyms = '';
		jQuery.each(oItem.pseudonyms, function(i, pseudonym){
			if(pseudonym != oItem.name) pseudonyms += '<li>' + pseudonym + '</li>';
		});
		if(pseudonyms !== '') tbody += manualBuildContentRow('Pseudonyms', '<ul class="inline pseudonyms">' + pseudonyms + '</ul>');
	}

	if(oItem.tags != null){
		var tags = '';
		jQuery.each(oCatalogue.tags, function(i, v){
			if(jQuery.inArray(v.id, oItem.tags) !== -1) tags += '<li>' + v.name + '</li>';
		});
		if(tags !== '') tbody += manualBuildContentRow('Keywords', '<ul class="inline tags">' + tags + '</ul>');
	}

	if(tbody !== '') return '<table>' + tbody + '</table>';
	return '';
}


function manualBuildContentRow(sLabel, sValue, sTRClassName, iLabelRowSpan){
	var sTR = '<tr' + (sTRClassName == undefined ? '' : (' class="' + sTRClassName + '"')) + '>';
	if(sLabel != undefined) sTR += '<td class="label"' + (iLabelRowSpan == undefined || iLabelRowSpan < 2 ? '' : (' rowspan="' + iLabelRowSpan + '"')) + '>' + sLabel + '</td>';
	sTR += '<td class="value">' + sValue + '</td>';
	sTR += '</tr>';
	return sTR;

	// return '<tr class="' + (sTRClassName === undefined ? '' : sTRClassName) + '"><td class="label"' + (iLabelRowSpan == undefined || iLabelRowSpan < 2 ? '' : (' rowspan="' + iLabelRowSpan + '"')) + '>' + sLabel + '</td><td class="value">' + sValue + '</td></tr>';
}


function manualBuildContentRows(sLabel, aValues, sTRClassName){
	if(!aValues || !aValues.length) return;

	var sTRs = '';
	jQuery.each(aValues, function(i, s){
		sTRs += manualBuildContentRow(i ? undefined : sLabel, aValues[i], sTRClassName, aValues.length);
	})
	return sTRs;
}


function featureIsFile(oFeature, oFeatures){
	return oFeature.type === 'file' || (oFeature.type === 'link' && getFileIconHTML(oFeatures[oFeature.id].href) != null);
}


function featureValue(oFeature, oFeatures){
	var sValue;
	var uRaw = oFeatures[oFeature.id];
	log('featureValue-' + oFeature.type, oFeature, uRaw);
	switch(oFeature.type){
		case 'array':
			sValue = '';
			for(var i = 0, n = oFeature.options.fields.length; i<n; ++i){
				sValue += (sValue === '' ? '' : ', ') + uRaw[i];
			}
			break;
		case 'bool':
			sValue = (uRaw == 1) ? 'Yes' : 'No';
			break;
		case 'choice':
			sValue = '';
			for(var i = 0, n = oFeature.options.options.length; i<n; ++i){
				if(uRaw.indexOf(oFeature.options.options[i].value) !== -1){
					sValue += (sValue === '' ? '' : ', ') + oFeature.options.options[i].label;
				}
			}
			break;
		case 'container':
			if(oRegexContainers){
				sValue = uRaw.replace(oRegexContainers, wrapContainer);
			} else {
				sValue = uRaw;
			}
			break;
		case 'date':
			sValue = jQuery.datepicker.formatDate('dd/mm/yy', new Date(uRaw));
			break;
		case 'datetime':
			var dt = new Date(uRaw);
			sValue = jQuery.datepicker.formatDate('dd/mm/yy', dt) + ' ' + time2string(dt.getHours(), dt.getMinutes(), dt.getSeconds());
			break;
		case 'file':
		case 'link':
			var sFileSpec = uRaw.file ? uRaw.file.name : uRaw.href;
			var sIcon = getFileIconHTML(sFileSpec, oFeature.type === 'file'/*show default icon for files*/);
			var sLabel = (sIcon === null ? '' : ('<span class="file-icon">' + sIcon + '</span>')) + (uRaw.label != null ? uRaw.label : oFeature.options && oFeature.options.label ? oFeature.options.label : oFeature.name);
			var sLink = (uRaw.href == '' || (oFeature.type === 'file' && !(uRaw.file && uRaw.file.size))) ? ('<span>' + sLabel + '</span>') : ('<a href="' + getFileURL(uRaw.href, uRaw.file) + '" target="_blank">' + sLabel + '</a>');

			var sInfo = '';
			if(uRaw.href != null && uRaw.href.indexOf('http') === 0 && !isLocalURI(uRaw.href)){
				sInfo += ' <i class="fa fa-external-link" title="Link to external resource"></i>';
			}
			if(sIcon !== null){
				var sExt = getFileExt(sFileSpec);
				var iFileSize = (uRaw.file && uRaw.file.size) ? uRaw.file.size : null;
				if(sExt != null || iFileSize != null){
					sInfo += ' (';
					if(sExt != null) sInfo += '<span class="file-ext">' + sExt.toUpperCase() + '</span>';
					if(uRaw.file.size != null) sInfo += '<span class="file-size">' + getFileSize(iFileSize) + '</span>';
					sInfo += ')';
				}
			}
			sValue = sLink + sInfo;
			break;
		case 'time':
			var t = uRaw.split(':');
			sValue = time2string(parseInt(t[0], 10), parseInt(t[1], 10), parseInt(t[2], 10));
			break;
		case 'url':
			if(oFeature.options && oFeature.options.url){
				var bExternal = oFeature.options.url.indexOf('http') === 0;
				var a = oFeature.options.multivalues ? uRaw.split(',') : [uRaw];
				var r = [];
				for(var i = 0, n = a.length; i < n; ++i){
					var s = a[i].replace(oRegexEscapeSpecialChars, '\\$1', 'g');
					r.push('<a href="' + oFeature.options.url.replace('\{\{value\}\}', s) + '"' + (oFeature.options.target == null ? '' : (' target="' + oFeature.options.target + '"')) + '>' + s + '</a>');
				}
				sValue = r.join(', ') + (bExternal ? ' <i class="fa fa-external-link" title="Link to external resource"></i>' : '');
			} else {
				sValue = uRaw;
			}
			break;
		case 'weekdays':
			sValue = '';
			for(var i = 0, n = aWeekdays.length; i<n; ++i){
				if(uRaw.weekdays.indexOf(i) !== -1){
					sValue += (sValue === '' ? '' : ', ') + aWeekdays[i];
				}
			}
			break;
		default:
			sValue = uRaw;
			break;
	}
	return sValue;
}


function wrapContainer(sAbbr){
	if(!oCatalogue.containers) return sAbbr;
	//log('containerWrap', sAbbr, sAbbr.replace(oRegexContainerQuantityCleanup, ''), sAbbr);
	var o = oCatalogue.oContainers[sAbbr];
	if(o === undefined) o = oCatalogue.oContainers[sAbbr.replace(oRegexContainerQuantityCleanup, '')]
	if(o === undefined) return sAbbr;
	//log('containerWrap', o);
	var sTooltipHTML = '';
	if(o.img && o.img.src){
		sTooltipHTML += '<div class=&quot;container-image&quot;><img src=&quot;' + o.img.html.src + '&quot;/></div>';
	}
	if(o.description != null) sTooltipHTML += '<div class=&quot;container-description&quot;>' + o.description + '</div>';
	if(sTooltipHTML == '') return sAbbr;
	log('containerWrap', sTooltipHTML);
	return '<a class="container pseudo" data-tooltip="' + sTooltipHTML + '">' + sAbbr + '</a>';
}


function time2string(h, m, s){
	return (h < 10 ? '0':'') + h + ':' + (m < 10 ? '0':'') + m;
};


function getFileExt(sFileSpec){
	var aExt = oRegexFileExt.exec(sFileSpec);
	return aExt ? aExt[1] : null;
}


function getFileName(sFileSpec){
	var aName = oRegexFileName.exec(sFileSpec);
	return aName ? aName[1] : null;
}


function getFileIconHTML(sFileSpec, bUseDefaultIcon){
	var sExt = getFileExt(sFileSpec);
	if(sExt != null) sExt = sExt.toLowerCase();
	var sClassName = oClassByExt[sExt] ? oClassByExt[sExt] : bUseDefaultIcon ? sDefaultExtClassName : undefined;
	if(sClassName === undefined) return null;
	return '<i class="fa ' + sClassName + '"></i>';
}


function getFileSize(iFileSizeInBytes){
	if(iFileSizeInBytes === undefined || isNaN(iFileSizeInBytes)) return iFileSizeInBytes;
	var i = (iFileSizeInBytes === 0 ? 0 : +Math.floor(Math.log(iFileSizeInBytes) / LOG1024));
	var size = aFileSizes[i >= aFileSizes.length ? aFileSizes.length - 1 : i];
	return (iFileSizeInBytes / size[0]).toFixed(size[1]) + ' ' + size[2];
}


function getFileURL(sFileSpec, oFile){
	var sURL = sFileSpec + (oFile && oFile.mtime ? ('?' + oFile.mtime) : '');
	if(sURL.indexOf('/') !== 0) return sURL;
	return sWebAPIHost + sURL;
}


function buildContainersRegex(arr){
	var aContainers = [];
	jQuery.each(arr, function(i, o){
		if(o.abbr && ((o.img && o.img.src) || o.description)){
			aContainers.push(o.abbr.replace(oRegexEscapeSpecialChars, '\\$1', 'g'));
		}
	});
	if(!aContainers.length) return;
	// Longer items first, items with the same length are sorted alphabetically
	aContainers.sort(function(x, y){
		var r = y.length - x.length;
		if(r !== 0) return r;
		return y > x ? -1 : 1;
	});

	var a = [];
	jQuery.each(aContainers, function(i, sAbbr){
		a.push(sAbbr.search(oRegexContainersQuantity) === -1 ? ('(?:(?:[1-9]\\s*x\\s*)?' + sAbbr + ')') : sAbbr);
	});
	return new RegExp('(' + a.join('|') + ')(?=[*\\s]|$)', 'g');
}


function parseQueryString(sQuery){
	var match;
	var pl = /\+/g; // For replacing '+' with a space
	var search = /([^&=]+)=?([^&]*)/g;
	var decode = function(s){
		return decodeURIComponent(s.replace(pl, ' '));
	};

	var result = {};
	while (match = search.exec(sQuery)) result[decode(match[1])] = decode(match[2]);
	return result;
}


function log(/*args*/){

	console.log(arguments);

	if(1 || !window.console) return;

	original = window.console.log;
	if(original.apply){
		// Do this for normal browsers
		original.apply(window.console, arguments);
	} else {
		// Do this for IE
		original(Array.prototype.slice.apply(arguments).join(' '));
	}
}


function Manual(oData){
	for(var prop in oData) if(oData.hasOwnProperty(prop)) this[prop] = oData[prop];
	this.hidden = false;
	var _this = this;
	this.icon = jQuery('<span class="ui-icon ui-icon-triangle-1-e"></span>');
	var code = oData.test_id ? oData.test_id : '&mdash;';
	var name = oData.name;
	if(oData.features && oData.features[iBillingRulesFeatureID]) name += ' <i class="fa fa-dollar billable"></i>';
	if(oData.type === 'AZ') name += ' <i class="fa fa-lg fa-info-circle"></i>';
	this.title = jQuery('<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-all" role="tab"><span class="code">' + code + '</span><span class="name">' + name + '</span></h3>')
		.hover(function(){
			jQuery(this).toggleClass('ui-state-hover');
		})
		.click(function(){
			_this.toggle();
		})
		.prepend(this.icon)
	;
	this.element = jQuery('<div class="ui-accordion ui-widget ui-helper-reset ui-accordion-icons trm-item " role="tablist"></div>').append(this.title);
	this.content = null; // Will be created when it need to be opened
}


Manual.prototype.toggle = function(){
	log('Manual toggle', this);
	if(this.opened){
		this.close();
	} else {
		this.open();
	}
	return this.opened;
};


/*
Manual.prototype.show = function(){
	log('Manual show', this);
	this.element.show();
}


Manual.prototype.hide = function(){
	log('Manual hide', this);
	this.element.hide();
}
*/

Manual.prototype.open = function(){
	log('Manual open', this);
	if(this.content === null){
		this.content = jQuery('<div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">' + manualBuildContent(this) + '</div>');
		this.element.append(this.content);

		// this.element.find('a.container').each(function(i, element){
		// 	new Tooltip(element, {
		// 		  html: true
		// 		, container: document.body
		// 		, delay: {show: 300, hide: 100}
		// 		, placement: 'bottom-start'
		// 		, trigger: 'hover click1'
		// 		, title: jQuery(element).data('tooltip')
		// 		, boundariesElement: 'viewport'
		// 		, popperOptions: {
		// 			  positionFixed: true
		// 			//, boundariesElement: 'viewport'
		// 		}
		// 	});
		// });
		
	}
	this.opened = true;
	this.title.removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top');
	this.icon.removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');
	this.content.addClass('ui-accordion-content-active').show();
	return this.opened;
};


Manual.prototype.close = function(){
	log('Manual close', this);
	this.opened = false;
	this.title.removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all');
	this.icon.removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
	if(this.content !== null) this.content.removeClass('ui-accordion-content-active').hide();
	return this.opened;
};

document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        // Hide any existing tooltips
        var existingTooltip = document.querySelector('.tooltip-content');
        if (existingTooltip) {
            existingTooltip.parentNode.removeChild(existingTooltip);
        }

        // Check if the clicked element is supposed to show a tooltip
        if (e.target.classList.contains('pseudo')) {
            e.preventDefault(); // Prevent the default link action

            var tooltipContent = e.target.getAttribute('data-tooltip');
            var tooltipDiv = document.createElement('div');
            tooltipDiv.classList.add('tooltip-content');
            tooltipDiv.innerHTML = tooltipContent;
            
            // Position the tooltip
            var rect = e.target.getBoundingClientRect();
            tooltipDiv.style.top = (window.scrollY + rect.top - rect.height) + 'px'; // Adjust this logic as needed
            tooltipDiv.style.left = (rect.left + window.scrollX) + 'px'; // Adjust this logic as needed

            document.body.appendChild(tooltipDiv);
            
            // Show the tooltip
            tooltipDiv.style.display = 'block';
        }
    }, false);

    // Optional: Hide tooltip when clicking anywhere else on the page
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('pseudo')) {
            var existingTooltip = document.querySelector('.tooltip-content');
            if (existingTooltip) {
                existingTooltip.style.display = 'none';
            }
        }
    });
});

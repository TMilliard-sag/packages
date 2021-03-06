/*
 * Copyright (c) 2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors.
 *
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */

// validates form inputs and throws error if any input missing for required fields
var requiredMetaFields = ["jwt.claim.iss", "jwt.claim.sub"];
var hostname = "";

function isValidForm() {
    updateParametersValue();
    if (missingFields.length > 0) {
		var missingRequiredFieldsError = getmsg("missing.required.field");
        var err = getErrorMessage(getmsg("missing.input.caption"), missingRequiredFieldsError + fieldsDisplayName(paramsDisplayNameArray, missingFields));
        errorMessageToggle(err, "show");
        return false;
    } else
        return true;
}
// Resize the IFrame according to the contents of the popup
function resizeFrame() {
    var body = document.body,
        html = document.documentElement;
    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    if (height > 300) {
        height = 300;
    }
    parent.resizeIframe(height);
}

function closeIFrame(parent) {
    parent.showSuccessInfo();
    parent.document.getElementById("closeIFrameWindow").click();
}

function getParentPageElementByName(elementName) {
    return parent.document.getElementsByName(elementName)[0];
	var elem = parent.document.getElementsByName(elementName)[0];
	if(elem === undefined) {
		elem = parent.$("input[name*='"+ elementName+ "']")[0];
    } 
	if(elem === undefined) {
		console.debug("Unable to find the field '" + elementName + "'");
	}
	else
		return elem;
}

function fieldsDisplayName(paramsDisplayNameArray, missingFields) {
    var missingRequiredFields = [];
	
	var reqFields = requiredMetaFields.concat(parent.requiredFields);

    missingFields.forEach(function(missingField) {

        if (reqFields.includes(missingField)) {
            var displayName = paramsDisplayNameArray[missingField].replace(/\*$/, '');
			missingRequiredFields.push(displayName);

        } else if (missingField.startsWith("jwt")) {
			reqFields.forEach( function(reqField) {
				if (reqField.endsWith(missingField)) {
					var displayName = paramsDisplayNameArray[missingField].replace(/\*$/, '');
					missingRequiredFields.push(displayName);
				}
			});
		}
        else{
			missingRequiredFields.push(missingField);
		}
    });
	return missingRequiredFields.join(", ");
}

function setParentFormFieldValue(fieldName, val) {
    if (val != undefined || val != 'undefined' || val != '') {
        $(getParentPageElementByName(fieldName)).val(val);
    }
}

function triggerPasswordChangeEvent(passwordElement) {
    passwordElement.dispatchEvent(new Event('change'));
}

function errorMessageToggle(htmlText, cmd) {
    if (cmd == "hide") {
        $("#err_message_span").html("");
        $("#err_message_span").hide();
    } else {
        $("#err_message_span").html(htmlText);
        $("#err_message_span").show();
		$("html, body").animate({scrollTop : 0}, 200, 'swing');
    }
}

function getErrorMessage(error, error_description) {
    return "<b>" + getmsg("error.caption") + error + ". " + getmsg("description.caption") + error_description + "</b>";
}

function getErrorRowTR() {
    return "<tr id='status'><td colspan=8 name='err_message_span' class='error' style='text-align: left; padding-left: 35pt;' id='err_message_span'></td></tr>";
}

function setHostname(hostname) {
	this.hostname = hostname.toLowerCase();
}

function getRedirectUri() {
    redirect_uri = location.protocol + "//" + location.host + "/WmCloudStreams/oauth-redirect.dsp";
    return redirect_uri;
}

function pushFieldValue(map, key, value, fieldName) {
    if (value == null || value == "") {
		var reqFields = requiredMetaFields.concat(parent.requiredFields);
		var isRequired = reqFields.find(function(element) {
			return element.endsWith(fieldName);
		});

		if(isRequired) {
			if (fieldName != null || fieldName != "") {
				missingFields.push(fieldName);
			} else {
				missingFields.push(key);
			}
        }
    } else {
        map.push({
            'name': key,
            'value': value
        });
    }
}

function replaceServerURLInstance(sourceUrl, targetUrl) {
	var finalUrl = "";
    if (sourceUrl && targetUrl) {
        if (isUrlValid(sourceUrl)) {
			finalUrl = sourceUrl + targetUrl.substring(getPosition(targetUrl, "/", 3), targetUrl.length);
        }
    }
	if(isUrlValid(finalUrl))
		return finalUrl;
    
	return targetUrl;
}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}

function getAnchorElement(href) {
    var loc = document.createElement("a");
    loc.href = href;
    return loc;
}

function isUrlValid(urlInput) {
    var res = urlInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null)
        return false;
    else
        return true;
}

function toggle2WaySSLControls() {
	if($("#enable2WaySSL").is(":checked")) {
		$(".2way-ssl-row").show();
	} else {
		$(".2way-ssl-row").hide();
	}
}

function get2WaySSLRow() {
	var twoWaySSLRows = "<tr><td colspan=2 style='text-align: left'><input type='checkbox' id='enable2WaySSL' name='enable2WaySSL' onchange='toggle2WaySSLControls();' /><label for='enable2WaySSL'>" + getmsg("ssl.connection") + "</label></td></tr>";
	
	twoWaySSLRows += "<tr style='display: none' class='2way-ssl-row'><td>" + getmsg("keystore.alias") + "</td><td><select id='2WaySSLKeystoreAlias' onchange='getKeyAliasList();'>" + getKeystoreOptionsList() + "</select></td></tr>";
	
	twoWaySSLRows += "<tr style='display: none' class='2way-ssl-row'><td>" + getmsg("key.alias") + "</td><td><select id='2WaySSLKeyAlias'></select></td></tr>";
	
	twoWaySSLRows += "<tr style='display: none' class='2way-ssl-row'><td>" + getmsg("truststore.alias") + "</td><td><select id='2WaySSLTruststoreAlias'>" + getTruststoreOptionsList() + "</select></td></tr>";
	
	return twoWaySSLRows;
}

function getKeystoreOptionsList() {
	
	var optionsList = "<option />";
	$.ajax({
        url: "/invoke/cloudstreams.UIConfig:getKeyStoreNames",
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        accepts: {
            text: "application/json"
        },
        async: false,
        success: function(data, status) {
			var keystoreNames = data['keyStoreNames'];
			var connectionKeyStoreName = "";
			if(parent.$("input[name$='cn.keystoreAlias']").val()) {
				connectionKeyStoreName = parent.$("input[name$='cn.keystoreAlias']").val();
			}
			$.each(keystoreNames, function(key, value) {
				if(connectionKeyStoreName == value['name']) {
					optionsList += "<option selected>" + value['name'] + "</option>";
				} else {
					optionsList += "<option>" + value['name'] + "</option>";
				}
            });
        },
        error: function(xhr) {
            $("#err_message_span").html("Error: " + xhr.responseText);
        }
    });
	
	return optionsList;
}

function getKeyAliasList() {

	var keystoreName = $("#2WaySSLKeystoreAlias").val();
	var optionsList = "";
	
	if(keystoreName) {
		
		$.ajax({
			url: "/invoke/cloudstreams.UIConfig:getAliases",
			dataType: 'json',
			type: "POST",
			data: {
				keyStore: keystoreName
			},
			contentType: 'application/x-www-form-urlencoded',
			accepts: {
				text: "application/json"
			},
			async: false,
			success: function(data, status) {
				var aliasNames = data['aliasNames'];
				var connectionKeyAlias = "";
				if(parent.$("input[name$='cn.clientKeyAlias']").val()) {
					connectionKeyAlias = parent.$("input[name$='cn.clientKeyAlias']").val();
				}
				$.each(aliasNames, function(key, value) {
					if(connectionKeyAlias == value['name']) {
						optionsList += "<option selected>" + value['name'] + "</option>";
					} else {
						optionsList += "<option>" + value['name'] + "</option>";
					}
				});
			},
			error: function(xhr) {
				$("#err_message_span").html("Error: " + xhr.responseText);
			}
		});
	}
	$("#2WaySSLKeyAlias").html(optionsList);
}

function getTruststoreOptionsList() {
	var optionsList = "<option />";
	$.ajax({
        url: "/invoke/cloudstreams.UIConfig:getTrustStoreNames",
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        accepts: {
            text: "application/json"
        },
        async: false,
        success: function(data, status) {
			var truststoreNames = data['trustStoreNames'];
			var connectionTruststoreAlias = "";
			if((parent.$("input[name$='cn.truststoreAlias']").val())) {
				connectionTruststoreAlias = parent.$("input[name$='cn.truststoreAlias']").val();
			}
			$.each(truststoreNames, function(key, value) {
				if(connectionTruststoreAlias == value['name']) {
					optionsList += "<option selected>" + value['name'] + "</option>";
				} else {
					optionsList += "<option>" + value['name'] + "</option>";
				}
            });
        },
        error: function(xhr) {
            $("#err_message_span").html("Error: " + xhr.responseText);
        }
    });
	return optionsList;
}
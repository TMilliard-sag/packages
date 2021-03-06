/*
 * Copyright (c) 2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors.
 *
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */
var connection_provider_url_name = "CPROP$connection$Basic$cn.providerUrl";
var connection_client_id_name = "CPROP$oauth_v20_authorization_code$Basic$oauth.consumerId";
var connection_client_secret_name = "CPROP$oauth_v20_authorization_code$Basic$oauth.consumerSecret";

var authorizationServerUrl = "";
var authenticationServerUrl = "";
var redirect_uri = "";
var scope = "";
var state = "";
var code = "";
var client_id = "";
var client_secret = "";
var paramsArray = [];
var paramsDisplayNameArray = {};
var paramsMap = null;
var missingFields = [];
var accessTokenJSONResponse = null;

var childWindow = "";
var timer = null;

$(document).ready(function() {

    buildTableContent();
    resizeFrame();
    fetchParentTableOAuthFields();
    errorMessageToggle("", "hide");

    $("#authorize").click(function() {
        childWindow = null;
        clearTimeout(timer);
        errorMessageToggle("", "hide");

        if (isValidForm(false)) {
            var window_settings = 'location=yes,height=480,width=800,scrollbars=yes,status=yes';
            childWindow = window.open(constructAuthorizationUrl(), '_blank', window_settings);
            childWindow.onunload = function(e) {
                checkAndSubmit();
            }

            childWindow.onbeforeunload = function(e) {
                //checkAndSubmit();
            }

            childWindow.onpopstate = function(event) {
                // alert("onpopstate: " + document.location + ", state: " + JSON.stringify(e.state));
            }
        }
    });
	
	// enable 2-way SSL if it's configured in connection
	if(parent.$("input[name$='cn.keystoreAlias']").val()) {
		$("#enable2WaySSL").prop('checked', true).change();
		$("#2WaySSLKeystoreAlias").change();
	}

});

function checkAndSubmit() {
    var error = false;
    var response = getStateCode(state);
    code = "";

    if (response['code']) {
        code = response['code'];
    } else if (response['error']) {
        var err = getErrorMessage(response['error'], response['error_description']);
        errorMessageToggle(err, "show");
        error = true;
        clearTimeout(timer);
        return;
    }

    if (!code && !error && timer < 10000) {
        timer = setTimeout(checkAndSubmit, 1000);
    } else if (!error) {
        // found code
        clearTimeout(timer);
        if (isValidForm(true)) {
            invokeService();
        }
    }
}

// Posts OAuth App keys and Authorization Code to get Access Token - authorization step
function invokeService() {

    var requestParams = {
        authenticationServerUrl	: authenticationServerUrl,
        params					: paramsMap,
        proxyAlias				: proxyAlias,
        sslKeyStoreAlias		: $("#2WaySSLKeystoreAlias").val(),
		sslKeyAlias				: $("#2WaySSLKeyAlias").val(),
		sslTrustStoreAlias		: $("#2WaySSLTrustStoreAlias").val()
    }
	// add only if the SSL is enabled.
	if($("#enable2WaySSL").prop('checked')) {
		requestParams["sslKeyStoreAlias"] 	= $("#2WaySSLKeystoreAlias").val(),
		requestParams["sslKeyAlias"] 		= $("#2WaySSLKeyAlias").val(),
		requestParams["sslTrustStoreAlias"]	= $("#2WaySSLTruststoreAlias").val()
	}

    if (code != "") {
        $.ajax({
            type: 'POST',
            url: '/invoke/cloudstreams.oauth:authorizationCodeFlow',
            data: JSON.stringify(requestParams),
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function(data) {
                var closeOnSuccess = false;
				var nonJsonResponse = "";
                $.each(data, function(key, value) {
                    if (key == 'status' && value == 200) {
                        closeOnSuccess = true;
                    }
                    if (key == 'JSONResponse') {
                        try{
    						accessTokenJSONResponse = JSON.parse(value);
    					}
    					catch(e) {
    						nonJsonResponse = value;
    					}
                    }
                });
				
                if (closeOnSuccess) {
                    updateResponseFieldValues();
                    closeIFrame(parent);
                } else {
					if(accessTokenJSONResponse){
						var errorDescription = accessTokenJSONResponse['error_description'] === undefined?  "" : accessTokenJSONResponse['error_description'];
						var err = getErrorMessage(accessTokenJSONResponse['error'], errorDescription);
						errorMessageToggle(err, "show");
						$("html, body").animate({scrollTop : 0}, 200, 'swing');
					} else {
						$("#err_message_span").html("Error: " + data['statusMessage'] + "<br>" + nonJsonResponse);
						$("#err_message_span").show();
						$("html, body").animate({scrollTop : 0}, 200, 'swing');
					}
                }
            },
            error: function(xhr, status) {
                $("#err_message_span").html("Error: " + xhr.responseText);
				$("html, body").animate({scrollTop : 0 }, 200, 'swing');
            }
        });
    }

}

// Retrieve Authorization Code from Cache, key is state (generated UUID in authorization step)
function getStateCode(state) {
    var codeValue = {};
    $.ajax({
        url: "/invoke/cloudstreams.oauth:cacheCode",
        dataType: 'json',
        data: {
            action: "get",
            state: state
        },
        contentType: 'application/x-www-form-urlencoded',
        accepts: {
            text: "application/json"
        },
        async: false,
        success: function(data, status) {

            $.each(data, function(key, value) {

                if (key == 'code') {
                    codeValue['code'] = value;
                }
                if (key == 'error') {
                    codeValue['error'] = value;
                }
                if (key == 'error_description') {
                    codeValue['error_description'] = value;
                }
            });
        },
        error: function(xhr) {
            $("#err_message_span").html("Error: " + xhr.responseText);
        }
    });

    return codeValue;
}

// updates connection fields OAuth response recieved
function updateResponseFieldValues() {
    setParentFormFieldValue(connection_client_id_name, client_id);
    setParentFormFieldValue(connection_client_secret_name, client_secret);
	triggerPasswordChangeEvent(getParentPageElementByName(getElementFullName('oauth.consumerSecret')));
    setParentFormFieldValue(getElementFullName("oauth.accessToken"), accessTokenJSONResponse['access_token']);
    triggerPasswordChangeEvent(getParentPageElementByName(getElementFullName('oauth.accessToken')));
    setParentFormFieldValue(getElementFullName("oauth_v20.instanceURL"), accessTokenJSONResponse['instance_url']);
	setParentFormFieldValue(getElementFullName("oauth_v20.accessTokenRefreshURL"), authenticationServerUrl);

    // if refresh_token present enable refresh token settings
    if (accessTokenJSONResponse['refresh_token']) {
        setParentFormFieldValue(getElementFullName("oauth_v20.refreshAccessToken"), "true");
        setParentFormFieldValue(getElementFullName("oauth_v20.refreshToken"), accessTokenJSONResponse['refresh_token']);
        triggerPasswordChangeEvent(getParentPageElementByName(getElementFullName('oauth_v20.refreshToken')));
    }
    setParentFormFieldValue(getElementFullName("oauth_v20.authorizationHeaderPrefix"), accessTokenJSONResponse['token_type']);
	
	setParentFormFieldValue(getElementFullName("oauth_v20.authorizationServerUrl"), authorizationServerUrl);
	setParentFormFieldValue(getElementFullName("oauth_v20.authenticationServerUrl"), authenticationServerUrl);
	
	// set SSL connection fields' value
	// add only if the SSL is enabled.
	if($("#enable2WaySSL").prop('checked')) {
		setParentFormFieldValue(getElementFullName("cn.keystoreAlias"), $("#2WaySSLKeystoreAlias").val());
		setParentFormFieldValue(getElementFullName("cn.clientKeyAlias"), $("#2WaySSLKeyAlias").val());
		setParentFormFieldValue(getElementFullName("cn.truststoreAlias"), $("#2WaySSLTruststoreAlias").val());
    }
	//replace server url instance with response Instance URL
    //var serverUrl = getParentPageElementByName(connection_provider_url_name).value;
	//serverUrl = replaceServerURLInstance(accessTokenJSONResponse['instance_url'], serverUrl);
    //setParentFormFieldValue(connection_provider_url_name, serverUrl);
}

// gets consumerId and consumerSecret field values from connection page
function fetchParentTableOAuthFields() {
    $("[name='oauth.consumerId']").val(getParentPageElementByName(connection_client_id_name).value);
    //$("[name='oauth.consumerSecret']").val(getParentPageElementByName(connection_client_secret_name).value);
}

// function which builds the table form with meta fields from OAuth 2.0 (Authorization Code Flow) connection group
function buildTableContent() {
    var clientIdLabel = getParentPageElementByName(connection_client_id_name).parentNode.parentNode.cells[0].innerHTML;
    var clientSecretLabel = getParentPageElementByName(connection_client_secret_name).parentNode.parentNode.cells[0].innerHTML;

    paramsDisplayNameArray['oauth.consumerId'] = clientIdLabel;
    paramsDisplayNameArray['oauth.consumerSecret'] = clientSecretLabel;

    //var tableRows = getErrorRowTR(); // add error row
    var tableRows = "<tr><td class=heading colspan=2>" + getmsg("request.parameters") + "</td></tr>";
    tableRows += "<tr><td>" + clientIdLabel + "</td><td><input id=\"oauth.consumerId\" size=60 name=\"oauth.consumerId\"></td></tr>";
    tableRows += "<tr><td>" + clientSecretLabel + "</td><td><input id=\"oauth.consumerSecret\" type=password size=60 name=\"oauth.consumerSecret\"></td></tr>";
	
	var requestEndpointRows = getErrorRowTR(); // add error row
	requestEndpointRows += "<tr><td class=heading colspan=2>" + getmsg("request.endpoints") + "</td></tr>";
    var requestEndpoints=new Array();
    var elements = parent.document.getElementsByClassName('meta');
    for (var i = 0; i < elements.length; i++) {
		// extract display name
		var elementDisplayName = $(elements[i]).children('td:first').text();
		
		// extract input field
		columns = elements[i].getElementsByTagName('td');
		var element = $(columns[columns.length-1]).find(':input')[0];
		// since it is a flat structure, assuming first element to be the input field.
		var elementName = element.name;
		
		paramsDisplayNameArray[elementName] = elementDisplayName;
		
		if(elementDisplayName.endsWith("*")) {
			requiredMetaFields.push(elementName.substring(elementName.length -1));
		}

        if ($(element).attr("name").endsWith('oauth_v20.authorizationServerUrl')) {
            authorizationServerUrl = $(element).val();
            requestEndpointRows+="<tr><td>" + elementDisplayName + "</td><td><input id='" 
				+ elementName + "' size=60 name='" 
				+ elementName + "' value='" + authorizationServerUrl +"' ></td></tr>";
            requestEndpoints.push(elementName);
            continue;
        } else if ($(element).attr("name").endsWith('oauth_v20.authenticationServerUrl')) {
            authenticationServerUrl = $(element).val();
            requestEndpointRows+="<tr><td>" + elementDisplayName + "</td><td><input id='" 
				+ elementName + "' size=60 name='" 
				+ elementName + "' value='" + authenticationServerUrl +"' ></td></tr>";
            requestEndpoints.push(elementName);
            continue;
        }

        // add only if field requires user input i.e., non-hidden field
        if ($(element).attr('type') == 'hidden') {
            tableRows += '<tr style="display: none;">' + elements[i].innerHTML + '</tr>';
        } else {
            tableRows += '<tr>' + elements[i].innerHTML + '</tr>';
        }
		
		if ($(element).attr('type') == 'password') {
            $(element).val('');
        }

        // add them to params array
        paramsArray.push(elementName.substring(elementName.lastIndexOf(".") + 1));
    }

    // Redirect URI
    tableRows += "<tr><td>" + getmsg("redirect.uri") + "</td><td><input id=\"oauth.redirect_uri\" size=60 name=\"oauth.redirect_uri\" value=\""+getRedirectUri()+"\"><br><small>" 
			+ getmsg("redirect.uri.note") +"</small></td></tr>";
	
	//</td><td><b>" + getRedirectUri() + "</b>
    var tableRef = document.getElementById('mainTable');
    tableRef.innerHTML = tableRows; // Insert OAuth fields rows
	
    //Insert Endpoints Fields
    if(requestEndpoints.length==0){
		requestEndpointRows = getErrorRowTR();
	}
	// add 2-way SSL input rows
	requestEndpointRows += get2WaySSLRow();
	
	var headerTableRef = document.getElementById('EndPointTable');
    headerTableRef.innerHTML =	requestEndpointRows;

}

// UUID generator function
function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    state = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return state;
}

function constructAuthorizationUrl() {
    var authorization_url = authorizationServerUrl;
    return authorization_url += "?response_type=code&" + "client_id=" + client_id 
		+ "&scope=" + getScope() + "&redirect_uri=" + redirect_uri + "&state=" + uuid();
}

function getScope() {
	var scopeElement = document.getElementsByName('META$oauth_v20.scope')[0];
	if(scopeElement.nodeName == "select") {
		return scopeElement.options[scopeElement.selectedIndex].value;
	}
    return scopeElement.value;
}

// puts all form values to key/value paramsMap which will be sent in request body
function updateParametersValue() {
    missingFields = new Array();
    paramsMap = new Array();

    client_id = $("[name='oauth.consumerId']").val();
    client_secret = $("[name='oauth.consumerSecret']").val();
	redirect_uri = $("[name='oauth.redirect_uri']").val();
	if(redirect_uri==null || redirect_uri==""){
		missingFields.push(getmsg("redirect.uri"));
	}
	authorizationServerUrl=$("[name$='oauth_v20.authorizationServerUrl']").val();
	if(authorizationServerUrl==null || authorizationServerUrl==""){
		missingFields.push(getmsg("authorization.endpoint"));
	}
	authenticationServerUrl=$("[name$='oauth_v20.authenticationServerUrl']").val();
	if(authenticationServerUrl==null || authenticationServerUrl==""){
		missingFields.push(getmsg("token.endpoint"));
	}
    // Client ID and Client Secret
    var consumerId = $("[name='oauth.consumerId']").val();
    var consumerSecret = $("[name='oauth.consumerSecret']").val();
    pushFieldValue(paramsMap, "client_id", consumerId, "oauth.consumerId");
    pushFieldValue(paramsMap, "client_secret", consumerSecret, "oauth.consumerSecret");

    for (var i = 0; i < paramsArray.length; i++) {
        var value = $("[name='" + paramsArray[i] + "']").val();
        pushFieldValue(paramsMap, paramsArray[i], value, paramsArray[i]);
    }
    if (code) { // authentication step
        pushFieldValue(paramsMap, "grant_type", "authorization_code");
        pushFieldValue(paramsMap, "code", code);
        pushFieldValue(paramsMap, "redirect_uri", redirect_uri);
    }
    proxyAlias = $("select[name='proxyAlias']").val();
}

function getElementFullName(elementName) {
	var inputField = parent.$("input[name*='" + elementName + "']")[0];
	var selectField = parent.$("select[name*='" + elementName + "']")[0];
		if(inputField || selectField) {
			if(inputField) {
				return inputField.name;
			} else {
				return selectField.name;
			}
		}
    var basicElementName = 'CPROP$oauth_v20_authorization_code$Basic$' + elementName;
    var advancedElementName = 'CPROP$oauth_v20_authorization_code$Advanced$' + elementName;
    var metaElementName = 'META$' + elementName;

    var basicElement = getParentPageElementByName(basicElementName);
    var advancedElement = getParentPageElementByName(advancedElementName);
    var metaElement = getParentPageElementByName(metaElementName);

    if (basicElement != undefined && basicElement != null) {
        return basicElement.name;
    } else if (advancedElement != undefined && advancedElement != null) {
        return advancedElement.name;
    } else if (metaElement != undefined && metaElement != null) {
		return metaElement.name;
	}
	
	console.error(getmsg("connection.field.not.found", elementName));
}
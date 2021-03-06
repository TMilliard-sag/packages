//  Copyright (c) 2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors.

function execute(url){
        var pfilter = document.getElementById("pfilter");
        if(pfilter!= null && trim(pfilter.value).length>0){
            url=url+"&" + "pfilter=" + trim(pfilter.value);
        }
        var regex = document.getElementById("regex");
        if(regex!= null && regex.checked){
            url=url+"&" + "regex=true";
        }

        var excludeFromResult = document.getElementById("exclude");
        if(excludeFromResult!= null && excludeFromResult.checked){
            url=url+"&" + "exclude=true";
        }
        //alert(url);
        document.location.href=url;
      }

      function showFilterPanel(){
        var filtercontainer = document.getElementById("filterContainer");
        var showall = document.getElementById("showall");
        var showfew = document.getElementById("showfew");
        showall.style.display="";
        showfew.style.display="none";
        filtercontainer.style.display="";
        document.getElementById("pfilter").focus();

      }

      var regExp = /<\/?[^>]+>/g;
      function ReplaceTags(xStr){
        xStr = xStr.replace(regExp,"");
        return xStr;
      }

      function trim(a){
        return a.replace(/^\s+|\s+$|\n+$/gm, '');

      }
      
      
      
    function filterProvidersInternal(){
    var pfilter = document.getElementById("pfilter");
    pfilter.value = trim(pfilter.value)
    var filterCri = pfilter.value;
    if(pfilter.value.length==0){
        filterCri ="*";
    }
    var regex = false;
    if(document.getElementById("regex") != null){
     regex = document.getElementById("regex").checked;
    }
    var head= document.getElementById("head");
    var nestedsearch= document.getElementById("nested").checked;
    var rowCount = head.rows.length ;
    var row=0;
    var display1="";
    var display2="none";
    var excludeFromResult = document.getElementById("exclude").checked;
    var rowDisplayCount =0;
    var notDisplayedRows=0;
    var totalRows = rowCount-2;
    if(excludeFromResult){
        display1="none";
        display2="";
    }
    //rowCount
    for(i=2;i<rowCount;i++){
        row = head.rows[i];
        if(nestedsearch && row.style.display=="none"){
            notDisplayedRows++;
            continue;
        }
        var status= row.cells[4].innerHTML;
        if(flag=="enabled" && status.indexOf("disable") ==-1 ){
            row.style.display=display2;
            continue;
        
        }
        if(flag=="disabled" && status.indexOf("enable") ==-1 ){
            row.style.display=display2;
            continue;                
        }
        
        var source= ReplaceTags(row.cells[0].innerHTML);
        if(isEqual(trim(source),filterCri,regex)){
            row.style.display=display1;
            rowDisplayCount++;
        } else {
            row.style.display=display2;
        }

    }
    if(excludeFromResult) {
        if(nestedsearch){
            rowDisplayCount = totalRows-notDisplayedRows-rowDisplayCount;
        } else {
            rowDisplayCount = totalRows-rowDisplayCount
        }
    }

document.getElementById("result").innerHTML="<span style='font-weight:bold'>Showing " + rowDisplayCount + " of " + totalRows + "</span>"
      }
      
      function filterProviders(evt){
        var e = evt? evt : window.event;
        if(e.keyCode==13) {
            filterPackagesInternal();

        }


      }

      function isEqual(source, target, regEx){

        if(regEx) {
            var re = new RegExp(target);
            var match = source.match(re);
            return (match != null);
        } else {
            var sourceCount = source.length;
            var sourceIndex = 0;
            var i=0;
            var c;
            var nextChar;
            var index;
            var t; 
            var m;
            var n;
            var o;
          
            for(;i<target.length;i++){
                sourceCount = source.length;
                c = target.charAt(i);
                if(c=='*'){
                    if(i==target.length-1) {
                        return true;
                    }
              
                    t = target.substring(++i);  
                    m = t.indexOf("*");
                    n= t.indexOf("?");
                    
                    if(m == -1 && n == -1){
                    	index = source.indexOf(t); 
                    	//alert(t);
                    } else {
                   	 if(m==-1){
                   	    o=n;
                   	 } else if(n==-1){
                   	    o=m;
                   	 }else if(m<n){
                   	    o=m;
                   	 } else {
                   	    o=n;
                   	 }
                   	nextChar = t.substring(0,o);
                      	index = source.indexOf(nextChar);  
                      	//alert("nextCharq " + nextChar);
                      
                                    	
                      	
                    }
                    if(index !=-1){
                        sourceIndex= index+1;
                        if(sourceIndex == sourceCount) { 
                        	if(i==target.length-1) {
                              	   return (true);
                            	} else {
                            	   return (target.charAt(i+1)=="*");
                            	}
                        } 
                        source = source.substring(sourceIndex);
                        sourceIndex=0;
                    } else {
                        return false;
                    }
                } else if(c=='?'){
                    sourceIndex++;             
                } else {
                    if(source.charAt(sourceIndex) != target.charAt(i)){
                       //alert(source.charAt(sourceIndex)  + "!= "+ target.charAt(i));
                      return false;
                    } else {
                   	sourceIndex++;
                        source = source.substring(sourceIndex);
                        sourceIndex=0;
                        //alert(source);
                    }
                }


            }
            //alert(sourceIndex + "==" + source.length);
            return (sourceIndex == source.length);

        }
      }
      
      var flag="both";
      function setFlag(m){
          flag = m;
      }
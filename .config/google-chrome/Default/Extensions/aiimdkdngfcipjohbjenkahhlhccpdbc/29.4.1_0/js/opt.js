window.addEventListener( "load", function(){
	
	var myid = chrome.i18n.getMessage("@@extension_id");
	
    page = "http://fvdmedia.com/fvdsettings/?addon=";	

	if (page && myid) {
		window.location=page+myid;	
	}	
	
}, false );


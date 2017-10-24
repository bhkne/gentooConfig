
function displayDonate(){

	var downloadBox = document.getElementById("download_block");
	var donateBox = document.getElementById("donate_block");
		
	if( donateBox.style.display != "none" ){
		return;
	}	
	
	downloadBox.setAttribute( "style", "-webkit-transition: opacity 200ms; opacity: 0" );
		
	setTimeout( function(){
		donateBox.setAttribute( "style", "opacity:0");
		setTimeout( function(){
			donateBox.setAttribute( "style", "-webkit-transition: opacity 200ms; opacity: 1" );	
		}, 0 );		
		downloadBox.setAttribute( "style", "display:none" );
	}, 200 );
}

function displayDownloads(){
	var downloadBox = document.getElementById("download_block");
	var donateBox = document.getElementById("donate_block");
	
	donateBox.setAttribute( "style", "-webkit-transition: opacity 200ms; opacity: 0" );
		
	setTimeout( function(){
		downloadBox.setAttribute( "style", "opacity:0");
		setTimeout( function(){
			downloadBox.setAttribute( "style", "-webkit-transition: opacity 200ms; opacity: 1" );	
		}, 0 );		
		donateBox.setAttribute( "style", "display:none" );
	}, 200 );
}


var searchBox = null;

window.addEventListener( "load", function(){

	try	{
		fvdSingleDownloader.Popup.init();		
	}
	catch( ex ){

	}
	
	fvdSingleDownloader.Locale.localizeCurrentPage();

	document.getElementById("help_link_feedback").addEventListener( "click", function( event ){
				
							if (event.ctrlKey) {
								chrome.extension.sendMessage({	action: "open_edit_video" }	);
							}
							else {
								fvdSingleDownloader.Popup.navigate_url("https://fvdmedia.userecho.com/forums/3-chrome-extensions/categories/34-fvd-downloader/topics/");
							}	
				
							event.stopPropagation();
								
						}, false );
	
	
}, false );

	


(function(){
	
	var Vimeo = function(){		

		var mediaDetectCallbacks = [];
	
		// --------------------------------------------------------------------------------
		function detectVimeoVideo( data, callback ){

			var url = data.url,
				tabUrl = data.tab.url,
				tabTitle = data.tab.title,
				videoId = null;

	        if ( /player\.vimeo\.com\/video\/(.*)\/config/i.test(data.url) )   {
				
				
				getAJAX( url, null, function(content){
				
                    try {
                        var info = JSON.parse(content);
                    }                     
                    catch(ex) {
                        console.log(ex);
                        return;
                    }

                    videoId = fvdSingleDownloader.Utils.getJSON( info, 'video/id' );
                    title = fvdSingleDownloader.Utils.getJSON( info, 'video/title' );

                    parsed( fvdSingleDownloader.Utils.getJSON( info, 'request/files/progressive' ) );
				
				});
				
			}

			// -------------------
			function parsed( info ) {

				var mediaFound = false;
				var parsedMediaList = [];

		        if ( typeof info == 'object' && info.length ) {

	                for (var i=0; i<info.length; i++) {

	                    var u = info[i]['url'];

	                    if (u) {
	                    	var height = info[i]['height'];
	                    	var width = info[i]['width'];
	                        var hash = videoId+'_'+height;
	                        var ext = "mp4";
							var ff = fvdSingleDownloader.Utils.extractPath( u );
							if (ff) {
								ext = ff.ext;
							}	

							var m = media_add( u, height, title, ext, hash );

							parsedMediaList.push(m);
	                        mediaFound = true;
	                    }
	                }
					
					parsedMediaList.sort( function( item1, item2 )  {	  
									return (item1.quality < item2.quality ? -1 : 1);  
								} );
					
					callback( parsedMediaList, videoId );
		        }


			}
			
			// --------------------------------------------------------------------------------
			function media_add( u, l, ft, ext, hash ){

				var media = {
						videoId:		videoId,
						url:			u,
					
						title: 			ft,
						displayName: 	ft,
						downloadName: 	ft,
						format: 		l,
						quality: 		l,
						ext: 			ext,
						
						status: 		"stop",
						hash: 			hash,
						
						filename: 		hash,
						size: 			0,
						type: 			"video",
						dwnl:			1 
				};
				
				return media;		
			}	
			
		}
		
		
		
		// --------------------------------------------------------------------------------
		function getAJAX( url, headers, callback ){
			
			var ajax = new XMLHttpRequest();
			ajax.open('GET', url, true);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
			ajax.setRequestHeader('X-FVD-Extra', 'yes');
			
			if (headers) {
				for (var key in headers) {
					ajax.setRequestHeader(key, headers[key]);
				}
			}	
			
			ajax.onload = function(){
						var content = this.responseText;
						callback( content );
			}
			
			ajax.onerror = function(){
				callback( null );
			}
			
			ajax.send( null );
		
		}

		// -----------------------------------------------------------
		function storeMedia( media, data ){
			
			if (media)	{	
				if( media.length ) 	 {							
					media.forEach(function( item ){
											item.tabId = data.tabId;
											item.priority = 1;
											item.metod = "download";
											item.source = "Vimeo";
											item.status = "stop";
										});
				}
				else	{							
					media.tabId = data.tabId;
					media.priority = 1;
					media.metod = "download";
					media.source = "Vimeo";
				}						
			
				mediaDetectCallbacks.forEach( function( callback ){
									callback( media );
								} );
			
			}
		}
		
		
		// -----------------------------------------------------------
		this.onMediaDetect = {
			addListener: function( callback ){
				if( mediaDetectCallbacks.indexOf( callback ) == -1 )
				{
					mediaDetectCallbacks.push( callback );
				}
			}
		};
		
		// -----------------------------------------------------------
		this.isEqualItems = function( item1, item2 )		{
		
			if( item1.hash == item2.hash )	{
				return true;
			}
			return false;
		};
	
		// ------------------------------------------------------------------------
        chrome.webRequest.onResponseStarted.addListener(function(data){
			
			if( !data || data.tabId < 0 )		return false;
		
			chrome.tabs.get( data.tabId, function( tab ){
				
				if (chrome.runtime.lastError) {
					//console.log(chrome.runtime.lastError.message);
				} 
				else if ( !tab ) {
					console.log( data );
				}	
				else {
			
					var tabInfo = tab;
					data.tab = tabInfo;
					
					detectVimeoVideo( data, function( mediaToSave, videoId )  {
										if( mediaToSave )	{
											data.tab.streamId = videoId;
											storeMedia( mediaToSave, data );
										}
					});
					
				}	

			});
		}, {
			urls: ["<all_urls>"],
		}, ["responseHeaders"]);

	};
	
	this.Vimeo = new Vimeo();
	
}).apply( fvdSingleDownloader.Media );


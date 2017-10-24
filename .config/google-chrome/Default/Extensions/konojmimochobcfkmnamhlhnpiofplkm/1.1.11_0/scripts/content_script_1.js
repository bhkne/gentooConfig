$("a[id='trynow']").click(function(){
	chrome.runtime.sendMessage({method: "getUUID"}, function(response){
		
	});
	return false;
});
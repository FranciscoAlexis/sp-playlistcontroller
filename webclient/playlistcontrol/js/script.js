/* Author: Francisco Rojas

*/
var currentTimeStamp = '';

$(document).ready(function() {
   
   $url = 'json/nowplaying.json'
    $.getJSON($url, function(data) {
		$.each(data, function(key, val) {
			$('#nowplaying').text(val);
		});
	});

    //Lets keep doing this
   setInterval(function(){
		$url = 'json/nowplaying.json'
	    $.getJSON($url, function(data) {
			$.each(data, function(key, val) {
				$('#nowplaying').text(val);
			});
		});
	}, 3000);

   //And this too
   setInterval(function(){
		$url = 'json/playlist.json';
		var tbody = $('#playlistbody');
		var tr,html;
	    $.getJSON($url, function(data) {
			$.each(data, function(key, val) {
				if(key == 'name')
				{
					$('#listname').text(val);
					console.log('name');
				}
				else if(key == 'timestamp')
				{
					console.log('timestamp');
					if(currentTimeStamp == val)
					{
						console.log('ct :'+currentTimeStamp);
						console.log('val :'+currentTimeStamp);
						return;
					}
					else
					{
						console.log('ct2 :'+currentTimeStamp);
						console.log('val2 :'+currentTimeStamp);
						currentTimeStamp = val;
					}
				}
				else //tracks
				{
					//TODO FIX THIS SHIT
					tbody.empty();
					$.each(val,function(key2,val2){
						tr = $('<tr>');
						$.each(val2,function(key3,val3){
							html = $('<td>'+val3+'</td>');
							if(key3 == 'urihash')
								html = $('<td><a class="btn" href="#">Enqueue</a></td>');
							html.appendTo(tr);
						});
						tr.appendTo(tbody);
					});
				}
			});
		});
	}, 3000);

 });

function pushAction(action)
{
	if(action == 'prev')
	{
		$.ajax({
		  type: "GET",
		  url: "php/controller.php?action=write&param=playerFunction&value=prev",
		}).done(function( msg ) {
			controlMessageUpdate('Previous track');
		});
	}
	if(action == 'next')
	{
		$.ajax({
		  type: "GET",
		  url: "php/controller.php?action=write&param=playerFunction&value=next",
		}).done(function( msg ) {
		  	controlMessageUpdate('Next track');
		});
	}
	if(action == 'playpause')
	{
		$.ajax({
		  type: "GET",
		  url: "php/controller.php?action=write&param=playerFunction&value=playpause",
		}).done(function( msg ) {
		  	controlMessageUpdate('Play/Pause');
		});
	}
}

function controlMessageUpdate(msg)
{
	currentTime = new Date();
	hour = currentTime.getHours();
	mins = currentTime.getMinutes(); 
	if (mins < 10)
		mins = "0" + mins;
	secs =currentTime.getSeconds();
	if (secs < 10)
		secs = "0" + secs;
  	msg2 = msg + ' command sent on ' + hour + ':' + mins + ':' + secs + '.';
  	$('#statusmsg').text(msg2);
}
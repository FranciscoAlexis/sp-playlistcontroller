/* Author: Francisco Rojas

*/
var currentTimeStamp = '';

$(document).ready(function() {
   
   //Update current song playing
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
		//var tbody = $('#playlistbody');
		var tbody = $('<tbody id="playlistbody"></tbody>');
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
					//console.log('timestamp');
					//This code was intended to stop updating the playlist every moment
					//If you do this it works but it stops updating changes on the playlist
					//made on the fly
					/*if(currentTimeStamp == val)
						return;
					else
						currentTimeStamp = val;*/
				}
				else //tracks
				{
					$.each(val,function(key2,val2){
						tr = $('<tr>');
						$.each(val2,function(key3,val3){
							html = $('<td>'+val3+'</td>');
							if(key3 == 'urihash')
							{
								val3 = "'"+val3+"'";
								html = $('<td><a class="btn" onClick="javascript:enqueueTrack('+val3+')">Play now!</a></td>');
							}
							html.appendTo(tr);
						});
						tr.appendTo(tbody);
					});
					tbody.replaceAll($('#playlistbody'));
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
	if(action == 'volumeup')
	{
		$.ajax({
		  type: "GET",
		  url: "php/controller.php?action=write&param=playerFunction&value=volumeup",
		}).done(function( msg ) {
		  	controlMessageUpdate('Next track');
		});
	}
	if(action == 'volumedown')
	{
		$.ajax({
		  type: "GET",
		  url: "php/controller.php?action=write&param=playerFunction&value=volumeup",
		}).done(function( msg ) {
		  	controlMessageUpdate('Next track');
		});
	}
}

function enqueueTrack(uri)
{
	$.ajax({
		  type: "GET",
		  url: "php/enqueue.php?uri="+uri,
		}).done(function( msg ) {
		  	controlMessageUpdate('Enqueue');
		});
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
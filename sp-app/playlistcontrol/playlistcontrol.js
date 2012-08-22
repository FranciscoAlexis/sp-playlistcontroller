//CURRENTLY IT ONLY SUPPORTS TRACKS WITH THE "spotify:track:" FORMAT

var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;
var clientLocation = "http://localhost/playlistcontrol/";
//var queue = new Playlist();
var playlist;

exports.init = init;
exports.updateClientLocation = updateClientLocation;
exports.setPlayList = setPlayList;

function setPlayList()
{
	playlistLink = $('#playlistlink').val();
	var match = playlistLink.match(/http\:\/\/open\.spotify\.com\/user\/([0-9]*)\/playlist\/([A-Za-z0-9_]*)/);
	var uri = "spotify:user:"+match[1]+":playlist:"+match[2];
	msg = ' (Debug) Playlist URI generated: ' + uri + '.';
	$('#statusmsg2').text(msg);

	//Now we take the playlist
	playlist = sp.core.getPlaylist(uri);
	var currentTime = new Date();
	var hour = currentTime.getHours();
	var mins = currentTime.getMinutes(); 
	if (mins < 10)
		mins = "0" + mins;
	var secs =currentTime.getSeconds();
	if (secs < 10)
		secs = "0" + secs;
  	var msg =  hour + ':' + mins + ':' + secs;

	var playlistJson = '{ "name":"' + playlist.name + '",';
	playlistJson += '"timestamp" : "' + msg + '",';
	playlistJson += '"tracks" : [';
	for (i=0; i<playlist.length; i++) 
	{
		var track = playlist.getTrack(i);
		var match = track.uri.split("spotify:track:");
		if(match == track.uri || match[1] == null) // this is where we filter the spotify:local: songs
			continue;
		playlistJson += '{';
		playlistJson += '"name" : "' + track.name + '",';
		playlistJson += '"album" :"' + track.album.name + '",';
		var artists = '[';
		for(j=0;j < track.artists.length;j++)
		{
			if(j != track.artists.length - 1)
				artists += '"'+track.artists[j].name + '",';
			else
				artists += '"'+track.artists[j].name+'"';
		}
		artists += ']';
		playlistJson += '"artists" : ' + artists + ',';
		playlistJson += '"urihash" :"' + match[1] + '"';
        playlistJson += '}';
        if(i != playlist.length - 1)
        	playlistJson += ",";
    }
    playlistJson += ']';
    playlistJson += '}';
    console.log(playlistJson);//just to see wtf i'm sending
    
    //we're set to send the info to our client
    var url = clientLocation+"php/playlist.php";
    var jsondata = $.parseJSON(playlistJson);
    //$.post(url, playlistJson);//doesn't work
    $.ajax({
        cache: false,
        type: 'POST',              
        url: url,
        dataType: 'json',
        data: jsondata,
        success: function () { console.log("playlist log success"); },
        error: function (response) {
            console.log("error: " + response.responseText);
        }
    });
    //do we need to keep doing this all the time?, i mean, is the list volatile?... maybe a TODO here.
}

function updateClientLocation()
{
	clientLocation = $('#clienturl').val();
	msg = 'Client Location set to ' + clientLocation + '.';
	$('#statusmsg').text(msg);
}

function init() 
{
	updatePageWithTrackDetails();

	player.observe(models.EVENT.CHANGE, function (e) 
	{

		// Only update the page if the track changed
		if (e.data.curtrack == true) {
			updatePageWithTrackDetails();
		}
	});

	setInterval(function(){
		//initially there is only the playerfunction action 
		//but in the future there could be another actions
		$url = clientLocation + 'php/controller.php?action=read'
	    $.getJSON($url, function(data) {
			$.each(data, function(key, val) {
    			if(key == "playerFunction" && val == "next")
    				player.next();
    			if(key == "playerFunction" && val == "prev")
    				player.previous(true);
    			if(key == "playerFunction" && val == "playpause")
    				player.playing = !(player.playing);
			});
		});
	}, 3000);
}

function updatePageWithTrackDetails() 
{

	var header = document.getElementById("header");
	// This will be null if nothing is playing.
	var playerTrackInfo = player.track;

	if (playerTrackInfo == null) {
		header.innerText = "Nothing playing!";
	} else {
		var track = playerTrackInfo.data;
		var nowplaying = track.name + " fron the album \""  + track.album.name + "\" by " + track.album.artist.name + ".";
		var ajaxurl = clientLocation + 'php/nowplaying.php?trackinfo=' + nowplaying;
		header.innerHTML = nowplaying;
		$.ajax({
			  type: "GET",
			  url: ajaxurl,
			}).done(function( msg ) {
			  //is there anything to do?
			});
	}
}
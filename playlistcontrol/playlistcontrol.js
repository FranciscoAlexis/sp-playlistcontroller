var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;
var appPlaylist;
var appPlaylistName = '';
var appEnqueue;
var enqueueCurrentIndex = 0;
var lastTrackUri = '';
//Hints for posible cases:
//HINT when track is local and not available track.name is null
//HINT the player stops when the track can't be played
//HINT track.data.availableForPlayback (kinda dismiss the previous hint right?)

exports.init = init;
exports.setPlayList = setPlayList;
exports.playNextSong = playNextSong;
exports.playPrevSong = playPrevSong;
exports.startPlay = startPlay;

function init() 
{
	updatePageWithTrackDetails();

	player.observe(models.EVENT.CHANGE, function (e) 
	{
		updatePageWithTrackDetails();
		if(player.track.data.isAd)
		{
			//console.log('Ad on ' + (new Date()).format('mmm dd yy hh:nn:ss a/p'));
			playNextSong(true);
		}
	});

	setInterval(function(){
		if(player.position > player.track.duration - 1500 && !player.track.data.isAd)
			playNextSong(false);
	},500);
}

function setPlayList()
{
	appPlaylist = null;
	var playlistLink = '';
	var playlistLink = $('#playlistlink').val();
	if(playlistLink == '' || playlistLink == ' ') {console.log('Playlist Link missing'); return false;}

	//What i do here is to generate a spotify uri from a link, but it seems that getPlaylist accepts links too...i'll leave it like this anywhay.
	var match = playlistLink.match(/http\:\/\/open\.spotify\.com\/user\/([0-9]*)\/playlist\/([A-Za-z0-9_]*)/);
	if(match.length < 2){console.log('Playlist Link invalid'); return false;}
	
	var uri = "spotify:user:"+match[1]+":playlist:"+match[2];

	appPlaylist = [];
	
	models.Playlist.fromURI(uri, function(playlist) {
		
		appPlaylistName = playlist.name;
        for(i=0;i<playlist.tracks.length;i++)
        {
        	var artists = '';
        	if(playlist.tracks[i].artists.length == 1)
        		artists = playlist.tracks[i].artists[0].name;	
            else
            {
				for(j=0;j < playlist.tracks[i].artists.length-1;j++)
					artists += playlist.tracks[i].artists[j].name + ', ';
				artists += playlist.tracks[i].artists[playlist.tracks[i].artists.length -1].name;
			}
			if(appPlaylist[artists] == null || appPlaylist[artists] == undefined )
				appPlaylist[artists] = [];
			appPlaylist[artists].push(playlist.tracks[i].uri);
        }
    });
    /*	Debug shit
    for (var key in appPlaylist) 
		console.log(key);*/
	return true;
}

/*
	Ok, so since we know that Math.random has a Gauss Distribution the first and last 
	elements will be in disvantage. Of course, we want a better shuffle so we need to do this.
*/
function getRandomIndexFromSize(size)
{
	//Remember if we want a number between a and b -> number = a + Math.random()*(b-a)
	//Now i duplicate the max number (b) to get a better distribution
	var index = Math.floor(Math.random()*size*2);
	index = (index > size - 1) ? index - size : index; 
	return index;
}

function getRandomArtists(index)
{
	var count = 0;
	for (var key in appPlaylist) 
	{
		if(count == index)
			return key;
	    count++;
    }
 	return '';
}

function generateShuffle()
{
	if(appPlaylist == null || appPlaylist == undefined || Object.keys(appPlaylist).length < 1){console.log("appPlaylist null, undefined or empty");return false;}

	appEnqueue = [];

	var lastIndex = -1;

	while(Object.keys(appPlaylist).length > 0)
	{
		var index = getRandomIndexFromSize(Object.keys(appPlaylist).length);
		if(index == lastIndex && Object.keys(appPlaylist).length > 1 )
			continue;

		lastIndex = index;

		var artists = getRandomArtists(index);
		if(artists == ''){console.log('Error getting artists');return false;}	

		if(appPlaylist[artists] == null || appPlaylist[artists] == undefined ){console.log('Error with the artists:' + artists);return false;}

		var songIndex = getRandomIndexFromSize(appPlaylist[artists].length);
		var trackUri = appPlaylist[artists][songIndex];

		appEnqueue.push(trackUri);

		appPlaylist[artists].splice(songIndex,1);

		if(appPlaylist[artists] == [] || appPlaylist[artists].length < 1)
			delete appPlaylist[artists];
	}
	/*	Debug Shit
	console.log(appEnqueue);*/
}

function startPlay()
{
	if(appPlaylist == null || appPlaylist == undefined){console.log("Error, set the playlist first");return false;}

	if(appEnqueue == [] || appEnqueue == undefined || appEnqueue == null )
		generateShuffle();

	if(enqueueCurrentIndex > appEnqueue.length - 1)
	{
		enqueueCurrentIndex = 0;
		setPlayList();
		generateShuffle();
	}
	
	models.Track.fromURI(appEnqueue[enqueueCurrentIndex], function(track) {
		if(lastTrackUri == track.uri)
			return;
		lastTrackUri = track.uri;
		console.log('Going to play track '+ track.name + ' on ' + (new Date()).format('mmm dd yy hh:nn:ss a/p'));
		if(track.name == null || !track.data.availableForPlayback)
		{
			playNextSong(false);
			return;
		}
	    player.play(track);
	});
}


function playNextSong(fromAd)
{
	if(appPlaylist == null || appPlaylist == undefined){console.log("Error, set the playlist first");return false;}

	if(appEnqueue == [] || appEnqueue == undefined || appEnqueue == null )
		generateShuffle();
	if(!fromAd)
		enqueueCurrentIndex++;
	if(enqueueCurrentIndex > appEnqueue.length - 1)
	{
		enqueueCurrentIndex = 0;
		setPlayList();
		generateShuffle();
	}
	
	models.Track.fromURI(appEnqueue[enqueueCurrentIndex], function(track) {
		if(lastTrackUri == track.uri)
			return;
		lastTrackUri = track.uri;
		console.log('Going to play track '+ track.name + ' on ' + (new Date()).format('mmm dd yy hh:nn:ss a/p'));
		if(track.name == null || !track.data.availableForPlayback)
		{
			playNextSong(false);
			return;
		}
	    player.play(track);
	});
}

function playPrevSong()
{
	if(appPlaylist == null || appPlaylist == undefined){console.log("Error, set the playlist first");return false;}

	if(appEnqueue == [] || appEnqueue == undefined || appEnqueue == null )
		generateShuffle();

	enqueueCurrentIndex--;

	if(enqueueCurrentIndex < 0)
	{
		enqueueCurrentIndex = 0;
		setPlayList();
		generateShuffle();
	}

	models.Track.fromURI(appEnqueue[enqueueCurrentIndex], function(track) {
		if(lastTrackUri == track.uri)
			return;
		lastTrackUri = track.uri;
		console.log('Going to play track '+ track.name + ' on ' + (new Date()).format('mmm dd yy hh:nn:ss a/p'));
		if(track.name == null || !track.data.availableForPlayback)
		{
			playPrevSong();
			return;
		}
	    player.play(track);
	});
}

function updatePageWithTrackDetails() 
{

	var header = document.getElementById("header");
	// This will be null if nothing is playing.
	var playerTrackInfo = player.track;

	if (playerTrackInfo == null) 
		header.innerText = "Nothing playing!"; 
	else 
	{
		var track = playerTrackInfo.data;
		var nowplaying = track.name + " from the album \""  + track.album.name + "\" by " + track.album.artist.name + ".";
		header.innerHTML = nowplaying;
	}
}
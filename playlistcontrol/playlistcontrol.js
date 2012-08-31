var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;
var appPlaylist;
var appPlaylistName = '';
var appEnqueue;
var enqueueCurrentIndex = 0;

exports.init = init;
exports.setPlayList = setPlayList;
exports.playNextSong = playNextSong;
exports.playPrevSong = playPrevSong;
exports.generateShuffle = generateShuffle;

function init() 
{
	updatePageWithTrackDetails();

	player.observe(models.EVENT.CHANGE, function (e) 
	{
		if(appEnqueue != null && appEnqueue != undefined && appEnqueue != [])
		{
			var trackUri = appEnqueue[enqueueCurrentIndex];
			var t = models.Track.fromURI(trackUri, function(track) {
				//This would happen if, for example, an ad takes over the player
				if(player.track.name != track.name)
				{
					console.log('Going to play track '+ track.name)
				    player.play(track);
				}
			});
		}
		
		//The song has ended if the position of the player object is the length of the playing track, or if the playing track is null.
		if(player.position == player.track.duration )
			playNextSong();
		else if (e.data.curtrack == true) 
			updatePageWithTrackDetails();
	});
}

function setPlayList()
{
	var playlistLink = '';
	var playlistLink = $('#playlistlink').val();
	if(playlistLink == '' || playlistLink == ' ') return false;

	//What i do here is to generate a spotify uri from a link, but it seems that getPlaylist accepts links too...i'll leave it like this anywhay.
	var match = playlistLink.match(/http\:\/\/open\.spotify\.com\/user\/([0-9]*)\/playlist\/([A-Za-z0-9_]*)/);
	var uri = "spotify:user:"+match[1]+":playlist:"+match[2];

	//we create our own list from spotify.
	appPlaylist = [];
	//Now we take the playlist from spotify and fill our appPlaylist with its data
	var spotifyPlaylist = models.Playlist.fromURI(uri, function(playlist) {
			appPlaylistName = playlist.name;
	        for(i=0;i<playlist.tracks.length;i++)
	        {
	        	var artists = '';
	        	if(playlist.tracks[i].artists.length == 1)
	        		artists = playlist.tracks[i].artists[0].name;	
	            else
	            {
					for(j=0;j < playlist.tracks[i].artists.length;j++)
					{
						if(j < (playlist.tracks[i].artists.length - 1) )
							artists += playlist.tracks[i].artists[j].name + ', ';
						else
							artists += playlist.tracks[i].artists[j].name;
					}
				}
				if(appPlaylist[artists] == null || appPlaylist[artists] == undefined )
					appPlaylist[artists] = [];
				appPlaylist[artists].push(playlist.tracks[i].uri);
	        }
	    });
	if(!spotifyPlaylist){console.log("appPlaylist null or undefined");return false;}

	return true;
}

/*
	Ok, so since we know that Math.random has a Gauss Distribution the first and last 
	elements will be in disvantage. Of course, we want a better shuffle so we need to do this.
*/
function getRandomIndexFromSize(size)
{
	//Remember if we want a number between a and b -> number = a + Math.random()*(b-a)
	//Now i duplicate the number to get a better distribution
	var index = Math.floor(Math.random()*size*2);
	index = (index > size - 1) ? index - size : index; 
	return index;
}

function getRandomArtists()
{
	var index = getRandomIndexFromSize(Object.keys(appPlaylist).length);
	var count = 0, artists = '';
	for (var key in appPlaylist) 
	{
		if(count == index){artists = key;break;}
	    count++;
    }
    return artists;
}

function generateShuffle()
{
	if(appPlaylist == null || appPlaylist == undefined || Object.keys(appPlaylist).length < 1){console.log("appPlaylist null, undefined or empty");return false;}

	appEnqueue = [];

	var lastArtist = '';

	while(Object.keys(appPlaylist).length > 0)
	{
		//First we get the artists
		var artists = getRandomArtists();
		if(artists == ''){console.log('Error getting artists');return false;}	

		if(artists == lastArtist && Object.keys(appPlaylist).length > 1) continue;

		lastArtist = artists;

		//Now we get the songs array
		var songs = appPlaylist[artists];
		if(songs == null || songs == undefined ){console.log('Error with the artists:' + artists);return false;}

		var songIndex = getRandomIndexFromSize(songs.length);
		var trackUri = songs[songIndex];

		appEnqueue.push(trackUri);

		songs.splice(songIndex,1);

		if(songs == [] || songs.length < 1)
			delete appPlaylist[artists];
		else
			appPlaylist[artists] = songs;
	}	
}

function playNextSong()
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

	var trackUri = appEnqueue[enqueueCurrentIndex];
	enqueueCurrentIndex++;
		
	var t = models.Track.fromURI(trackUri, function(track) {
		console.log('Going to play track '+ track.name)
	    player.play(track);
	});
}

function playPrevSong()
{
	if(appPlaylist == null || appPlaylist == undefined){console.log("Error, set the playlist first");return false;}

	if(appEnqueue == [] || appEnqueue == undefined || appEnqueue == null )
		generateShuffle();

	if(enqueueCurrentIndex < 0)
	{
		enqueueCurrentIndex = 0;
		setPlayList();
		generateShuffle();
	}

	var trackUri = appEnqueue[enqueueCurrentIndex];
	enqueueCurrentIndex--;
		
	var t = models.Track.fromURI(trackUri, function(track) {
		console.log('Going to play track '+ track.name);
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
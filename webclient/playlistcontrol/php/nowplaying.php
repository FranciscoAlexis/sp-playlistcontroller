<?php
	if(isset($_GET["trackinfo"]))
	{
		$array = array("nowplaying" => $_GET["trackinfo"] );
		$fp = fopen('../json/nowplaying.json', 'w+');
		fwrite($fp, json_encode($array));
		fclose($fp);
	}
?>
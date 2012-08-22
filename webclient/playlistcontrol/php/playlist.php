<?php
	$fp = fopen('../json/playlist.json', 'w+');
	$json = json_encode($_POST);
	fwrite($fp, $json); 
	fclose($fp);
?>
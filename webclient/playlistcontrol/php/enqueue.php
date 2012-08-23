<?php
	if(isset($_GET["uri"]))
	{
		$array = array("enqueue" => $_GET["uri"] );
		$fp = fopen('../json/enqueue.json', 'w+');
		fwrite($fp, json_encode($array));
		fclose($fp);
	}
?>
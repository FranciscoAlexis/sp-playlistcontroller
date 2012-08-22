<?php
	if(isset($_GET["action"]))
	{
		if($_GET["action"] == 'write')
		{
			//is writing
			$array = array($_GET["param"] => $_GET["value"] );
			$fp = fopen('../json/control.json', 'w+');
			fwrite($fp, json_encode($array));
			fclose($fp);
		}
		else if($_GET["action"] == 'read')
		{
			//is reading
			//$fp = fopen('control.json', 'r+');
			//$json = json_decode(file_get_contents($file), true);

			$json = file_get_contents('../json/control.json');
			echo $json;
			//fclose($fp);
			$fp = fopen('../json/control.json', 'w');
			fwrite($fp, '{}');
			fclose($fp);
			
		}
	}
	else
	{
		echo 'Request Sent';
	}
?>	
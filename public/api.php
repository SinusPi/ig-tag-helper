<?php
if ($_POST['items']) {
	print_r($_POST['items']);
	file_put_contents("data.json",json_encode($_POST['items']));
}

// Simple Hashtag Helper
$CFG['app_id']="490876748614573";
$CFG['app_secret']="b66dd317611a2e10b9e5cab10c9c43bf";
$CFG['insta_app_id']="578554696871308";
$CFG['insta_app_secret']="f8bcfef01d08270b99f4e092231f9c0c";
$CFG['redirect_uri']="https://djab.eu:3000/";

if ($_REQUEST['code']) {
	$ch = curl_init("https://api.instagram.com/oauth/access_token");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, 
        http_build_query([
			'client_id' => $CFG['insta_app_id'],
			'client_secret' => $CFG['insta_app_secret'],
			'grant_type' => "authorization_code",
			'redirect_uri' => $CFG['redirect_uri'],
			'code'=>$_REQUEST['code']
		])
	);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$output = curl_exec($ch);
	curl_close ($ch);
	$json = json_decode($output,true);
	if ($json['access_token'] && $json['user_id']) {
		//setcookie("instagram_token",$json['access_token'],time()+86400*30,"/",null,true);
		//setcookie("instagram_userid",$json['user_id'],time()+86400*30,"/",null,true);
		//header("Location: .");
		?>
		<script>
			localStorage.setItem("instagram_token",<?=json_encode($json['access_token'])?>);
			localStorage.setItem("instagram_userid",<?=json_encode($json['user_id'])?>);
			alert("Storing token in local storage!");
			window.close()
		</script>
		<?php
		die();
	} else die(print_r($output,1));
}

if ($_REQUEST['auth']) {
	header("Location: https://api.instagram.com/oauth/authorize?client_id={$CFG['insta_app_id']}&redirect_uri={$CFG['redirect_uri']}&scope=user_profile,user_media&response_type=code");
	die();
}

//echo "Token: {$_SESSION['instagram_token']}, user: {$_SESSION['instagram_userid']}<br>";

if ($_REQUEST['get_media']) {
	$userid = urlencode($_REQUEST['userid']);
	$token = urlencode($_REQUEST['token']);
	$ch = curl_init("https://graph.instagram.com/{$userid}?fields=id,username&access_token={$token}");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$output = curl_exec($ch);
	curl_close ($ch);
	$json = json_decode($output,true);
	if (!$json) die(json_encode(['success'=>false,"error"=>$output]));

	if ($json['error'] && $json['error']['code']==190) die(json_encode(['success'=>false,"error"=>"EXPIRED"]));

	//echo "<h1>Hello ".$json['username']."</h1>";
	$json_filename = "media-".$userid.".json";
	$allmedia = json_decode(file_get_contents($json_filename),true);

	if (!$allmedia || $_REQUEST['refresh']) {
		$url = "https://graph.instagram.com/me/media/?fields=id,caption,media_type,media_url,timestamp,permalink&access_token={$token}";

		$allmedia=[];
		$numpages=10;
		do {
			$ch = curl_init($url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$output = curl_exec($ch);
			curl_close ($ch);
			$json = json_decode($output,true);

			$media = $json['data'];
			$allmedia = array_merge($allmedia,$media);
			if ($json['paging']['next']) $url=$json['paging']['next']; else unset($url);
		} while ($url && $json['data'] && $numpages--);
		file_put_contents($json_filename,json_encode($allmedia));
	}

	// isolate tags
	foreach ($allmedia as &$med) {
		$hashes = [];
		preg_replace_callback("/(#[\\w\\dąćęłńóśźżĄĆĘŁŃÓŚŹŻ_]+)/",function($m) use (&$hashes) { $hashes[]=$m[0]; return "foo"; },$med['caption'] );
		$med['tags']=$hashes;
	}

	header("Content-type: text/json");
	die(json_encode($allmedia));
}

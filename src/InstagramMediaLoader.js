const ig_fetch = (url) => {
	return fetch(url)
		.then(response => response.json())
		.then(data => {
			console.log("Fetched:", data)
			if (data?.error) {
				if (data.error.type === "OAuthException" && data.error.code === 190) { console.error("Token expired! Clearing token, hoping someone will retry."); return Promise.reject({ type: "oauth/clear" }); }
				else if (data.error.type === "OAuthException" && data.error.code === 4) { console.error("Too many requests!"); return Promise.reject({ type: "oauth/error", payload: "FLOODED" }); }
				else if (data.error.type === "OAuthException" && data.error.code === 2) { console.error("Internal error at Instagram!"); return Promise.reject({ type: "oauth/error", payload: "ERROR" }); }
				else return Promise.reject({ type: "oauth/error", payload: data.error });
			}
			return data
		})
}

export const InstagramMediaLoader={
	login:(token)=>{
		return ig_fetch(`https://graph.instagram.com/me?fields=id,username,media_count&access_token=${token}`)
	},

	loadMedia:async(token,url)=>{
		console.log("LoadMedia started: ", url)

		/*
		await fetch(`https://graph.instagram.com/${userId}?fields=id,username&access_token=${token}`)
		.then(response => response.json())
		.then(async data => {
		  console.log("Fetched:",data)
		  if (data?.error) {
			if (data.error.type=="OAuthException" /* && data.error.code==190 * /) { console.log("Clearing token"); setToken(null); return; }
		  }
		  if (data?.username) setUsername(data.username);
		*/

		return ig_fetch(url || `https://graph.instagram.com/me/media/?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${token}`)
	}
}

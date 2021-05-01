// WILL NOT WORK
export const InstagramTagCounter={
	count:(tag)=>{
		const tag_stripped = tag.replace("#","")
		/*
		{
			"users":[],
			"places":[],
			"hashtags":[
				{"position":0,"hashtag":{ "name":"nature","id":17841562498105353,"media_count":622105231, ... }},
				...
			]
		*/
		return fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=%23${tag_stripped}`)
		.then(data=>data.json())
		.then(json=>json?.hashtags?.find((v)=>v.position===0 && v.name===tag_stripped)?.hashtag?.media_count || 0)
	},
}

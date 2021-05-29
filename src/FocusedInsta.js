import { useSelector } from "react-redux";
//import { useContext } from "react";
import { useParams } from "react-router-dom";
import { TagChip } from './TagChip';
import { Tooltip } from '@material-ui/core';
import InstagramIcon from '@material-ui/icons/Instagram';
import { TagBox } from './TagBox';

export function FocusedInsta() { 
	const { id } = useParams();
	const media = useSelector(state => state.media)
	const mediatags = useSelector(state => state.mediatags)
	const selectedtags = useSelector(state => state.selectedtags)
	if (!media) return <></>;
	const insta = media[id]
	return <>
		<div style={{ backgroundImage:`url(${insta.media_url})`, width: "200px", height: "200px", backgroundSize: "cover", margin: "auto" }} />
		<p style={{ fontWeight: "bold" }}>{insta.caption.substring(0, 50)}</p>
		<Tooltip title={(<>Open on Instagram</>)}>
			<a href={insta.permalink} target="_blank" rel="noreferrer">
				<InstagramIcon />
			</a>
		</Tooltip>
		<TagBox key="fi" tags={mediatags[insta.id]} />
	</>
	// onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

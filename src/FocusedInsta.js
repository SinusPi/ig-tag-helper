import { useSelector } from "react-redux";
//import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { chipclick } from "./App.js"
import { Chip } from '@material-ui/core';
import { TagCount } from './TagCount';

export function FocusedInsta() {
	const { id } = useParams();
	const media = useSelector(state => state.media)
	const tags = useSelector(state => state.tags)
	const mediatags = useSelector(state => state.mediatags)
	const selectedtags = useSelector(state => state.selectedtags)
	const insta = media[id]
	if (!insta) return null;
	return <>
		<p style={{fontWeight:"bold"}}>{insta.caption.substring(0, 50)}</p>
		<div className="tagbox">
			{mediatags[insta.id]?.map((t,i) => <Chip
				size="small"
				label={<>
					{t}
					<TagCount type="total" value={tags[t].count}/>
				</>
				}
				color={selectedtags.includes(t) ? "primary" : "default"}
				onClick={(ev) => chipclick(ev, t)}
				component={Link}
				to={`/tag/${t.substring(1)}`}
				key={t}
			/>)}
		</div>
	</>
	// onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

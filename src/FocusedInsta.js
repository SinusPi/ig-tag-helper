import { useSelector } from "react-redux";
//import { useContext } from "react";
import { useParams } from "react-router-dom";
import { TagChip } from './TagChip';

export function FocusedInsta() {
	const { id } = useParams();
	const media = useSelector(state => state.media)
	const mediatags = useSelector(state => state.mediatags)
	const selectedtags = useSelector(state => state.selectedtags)
	const insta = media[id]
	if (!insta) return null;
	return <>
		<p style={{fontWeight:"bold"}}>{insta.caption.substring(0, 50)}</p>
		<div className="tagbox">
			{mediatags[insta.id]?.map((t,i) => <TagChip tag={t} common={false} key={t} isSelected={selectedtags.includes(t)} />)}
		</div>
	</>
	// onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

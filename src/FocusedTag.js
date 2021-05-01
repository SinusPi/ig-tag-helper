import { useSelector } from "react-redux";
//import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { chipclick, chipclick_toggle } from "./App.js"
import { Divider, Chip, Paper, Tooltip } from '@material-ui/core';
import InstagramIcon from '@material-ui/icons/Instagram';
import { TagCount } from './TagCount';


export function TagChip(props) {
	return (
		<Chip
			size="small"
			label={<>
				<span className='chip-tagname'>{t}</span>
				<TagCount type="total" value={tags[t].count} />
				{!is_vague && <Chip size="small" style={{ verticalAlign: "inherit", marginLeft: "8px", marginRight: "-4px", backgroundColor: "rgba(0,0,0,15%)" }} label={<TagCount type="with" value={this_tag.with[t]} />} />}
				{selectedtags.includes(t) ?
					<Chip size="small" style={{ verticalAlign: "inherit", marginLeft: "8px", marginRight: "-4px", backgroundColor: "rgba(100,0,0,80%)" }} label="-" />
					:
					<Chip size="small" style={{ verticalAlign: "inherit", marginLeft: "8px", marginRight: "-4px", backgroundColor: "rgba(0,100,0,80%)" }} label="+" />
				}
			</>}
			onClick={chipclick}
			color={selectedtags.includes(t) ? "primary" : "default"}
			component={Link}
			to={`/tag/${t.substring(1)}`}
			key={t}
		/>
	)
}

export function FocusedTag() {
	//let { path, url } = useRouteMatch();
	var { tag } = useParams();
	const tags = useSelector(state => state.tags)
	const this_tag = tags["#" + tag]
	const selectedtags = useSelector(state => state.selectedtags)
	if (!tags) return null;
	//const tag = useSelector(state=>state.focustag)
	const htag = "#" + tag
	const is_vague = (tag.indexOf("*") > -1)
	const regexp = (tag.replace("*", ".*"))
	const taglist = is_vague ? Object.keys(tags).filter(t => t.match(regexp)).sort((a, b) => tags[b].count - tags[a].count) : this_tag.with_ordered

	const chipclick_me = {(ev) => chipclick_toggle(ev, t)
}

return (
	<Paper style={{ contentJustify: "center" }}>
		<Chip
			label={`${htag}`}
			onClick={is_vague ? ((ev) => chipclick(ev, htag)) : undefined}
			color={selectedtags.includes(htag) ? "primary" : "default"}
		/>
		<Divider />
		<Paper style={{ display: "flex", justifyContent: "center", gap: "1em" }}>
			<div>Used in: {this_tag.count}</div>
			<Tooltip title={(<>Open <b>{htag}</b> on Instagram</>)}>
				<a href={`https://instagram.com/explore/tags/${tag}`} target="_blank" rel="noreferrer">
					<InstagramIcon />
				</a>
			</Tooltip>
		</Paper>
		<Divider />
		<p style={{ fontWeight: "bold" }}>Paired with:</p>
		<div className="tagbox">
			{taglist.map((t, i) => <TagChip tag={t} />)}
		</div>
	</Paper>
)
	//className={`chip ${selectedtags.includes(t)?"selected":""}`}
	// onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

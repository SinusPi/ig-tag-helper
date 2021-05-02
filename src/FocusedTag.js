import { useSelector } from "react-redux";
//import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { chipclick, chipclick_toggle } from "./App.js"
import { Divider, Chip, Paper, Tooltip } from '@material-ui/core';
import InstagramIcon from '@material-ui/icons/Instagram';
import { TagChip } from './TagChip';
import React, { useCallback } from "react";
import { Add } from '@material-ui/icons';


export function FocusedTag() {
	//let { path, url } = useRouteMatch();
	var { tag } = useParams();
	const all_tags = useSelector(state => state.tags)
	const selectedtags = useSelector(state => state.selectedtags)
	const this_tag = all_tags["#" + tag]
	const htag = "#" + tag
	const is_vague = (tag.indexOf("*") > -1)
	const memoChipclick = useCallback((ev) => chipclick(ev, htag), [htag])
	const memoChipclickToggle = useCallback((ev) => chipclick_toggle(ev, htag), [htag])
	if (!all_tags && !this_tag) return null;
	//const tag = useSelector(state=>state.focustag)
	const is_selected = selectedtags.includes(htag)
	const regexp = (tag.replace("*", ".*"))
	const taglist = is_vague
		? Object.keys(all_tags).filter(t => t.match(regexp)).sort((a, b) => all_tags[b].count - all_tags[a].count)
		: this_tag.with_ordered


	return (
		<Paper style={{ contentJustify: "center" }}>
			<Chip
				label={`${htag}`}
				onClick={is_vague ? memoChipclick : undefined}
				color={is_selected ? "primary" : "default"}
				onDelete={!is_vague ? memoChipclickToggle : undefined}
				deleteIcon={(!is_vague && !is_selected && <Add />) || undefined}
			/>
			<Divider />
			{!is_vague &&
				<Paper style={{ display: "flex", justifyContent: "center", gap: "1em" }}>
					<div>Used in: {this_tag.count}</div>
					<Tooltip title={(<>Open <b>{htag}</b> on Instagram</>)}>
						<a href={`https://instagram.com/explore/tags/${tag}`} target="_blank" rel="noreferrer">
							<InstagramIcon />
						</a>
					</Tooltip>
				</Paper>
			}
			<Divider />
			{!is_vague && <p style={{ fontWeight: "bold" }}>Paired with:</p>}
			<div className="tagbox">
				{taglist.map((t, i) => <TagChip tag={t} common={!is_vague ? this_tag.with[t] : 0} key={t} isSelected={selectedtags.includes(t)} />)}
			</div>
		</Paper>
	)
	//className={`chip ${selectedtags.includes(t)?"selected":""}`}
	// onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

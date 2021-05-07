import { useSelector } from "react-redux";
//import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { chipclick, chipclick_toggle } from "./App.js"
import { Chip } from '@material-ui/core';
import { TagCount } from './TagCount';
import React, { useCallback,useEffect } from "react";
import { Add } from '@material-ui/icons';

export const TagToggleChip = React.memo(props => {
	const memoToggleclick = useCallback((ev)=>chipclick_toggle(ev,props.tag),[props.tag])
	return (
		<Chip
			size="small"
			tag={props.tag}
			className={`chip-toggle ${props.isSelected?"del":"add"}`}
			label={props.isSelected?"-":"+"}
			onClick={memoToggleclick}
		/>
	)
})

export const TagChip = React.memo(props=> {
	const all_tags = useSelector(state => state.tags)
	const memoChipclick = useCallback((ev)=>chipclick(ev,props.tag),[props.tag])
	const memoToggleclick = useCallback((ev)=>chipclick_toggle(ev,props.tag),[props.tag])
	return (
		<Chip
			size="small"
			label={<>
				<span className='chip-tagname'>{props.tag}</span>
				<TagCount type="total" value={all_tags[props.tag].count} />
				{props.common ? <Chip
					size="small"
					className="chip-common"
					label={<TagCount type="with" value={props.common} />}
				/>
				: null}
			</>}
			onClick={memoChipclick}
			color={props.isSelected ? "primary" : "default"}
			component={Link}
			to={`/tag/${props.tag.substring(1)}`}
			onDelete={memoToggleclick}
			//deleteIcon={props.isSelected?null:<Add/>}
			classes={{deleteIcon:props.isSelected?"red":"green"}}
		/>
	)
})


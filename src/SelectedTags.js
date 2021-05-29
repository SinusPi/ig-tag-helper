import { ReactReduxContext } from 'react-redux'
import { useSelector } from "react-redux";
import { useContext } from "react";
import React from "react";
import { chipclick } from "./App.js"
import { Chip, Button, Snackbar, Paper, Tooltip, Typography, createMuiTheme } from '@material-ui/core';
import { Link, useLocation } from "react-router-dom";

function copytags(tags, succ) {
	const taglist = tags.join(" ")
	console.log("copying")
	navigator.clipboard.writeText(taglist).then(function () {
		console.log('Async: Copying to clipboard was successful!');
		succ()
	}, function (err) {
		console.error('Async: Could not copy text: ', err);
	});
}
function cleartags(store) {
	store.dispatch({ type: "selecttag/clear", payload: null })
}
  
const SelectedTagsHeader = React.memo((props) => {
	return (<Typography variant="h1" className={`header ${count_tag(props.count)}`} style={{ fontWeight: "bold" }}>Tag box: <span className="count">[{props.count}]</span></Typography>)
})

function count_tag(count) {
	if (count == 0) return "zero"
	else if (count == 30) return "full"
	else if (count > 30) return "over"
	else return "norm"
}

export function SelectedTags(props) {
	const { store } = useContext(ReactReduxContext)
	const selectedtags = useSelector(state => state.selectedtags)
	let location = useLocation();
	const [openCopy, setOpenCopy] = React.useState(false);
	const count = selectedtags.length
	return (
		<>
			<Paper>
				<div className={`selectedtags ${count_tag(count)}`}>
					<SelectedTagsHeader count={count} />
					{selectedtags.length ? selectedtags.map((t, i) => <Chip
						size="small"
						label={t}
						onClick={(ev) => chipclick(ev, t)}
						onDelete={(ev) => { ev.preventDefault(); store.dispatch({ type: "selecttag/toggle", payload: { tag: t } }) }}
						color={location.pathname === `/tag/${t.substring(1)}` ? "secondary" : "primary"}
						component={Link}
						to={`/tag/${t.substring(1)}`}
						key={i}
					/>) : (
							<span>Empty {':('}</span>
						)}
				</div>
				<Button onClick={() => copytags(selectedtags, () => setOpenCopy(true))}>copy</Button>
				<Tooltip title="hold shift"><Button onClick={(ev) => ev.shiftKey && cleartags(store)}>clear</Button></Tooltip>
			</Paper>
			<Snackbar open={openCopy} autoHideDuration={6000} onClose={() => setOpenCopy(false)} message="This is a success message!"></Snackbar>
		</>
	)
}

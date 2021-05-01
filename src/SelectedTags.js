import { ReactReduxContext } from 'react-redux'
import { useSelector } from "react-redux";
import { useContext } from "react";
import React from "react";
import { chipclick } from "./App.js"
import { Chip, Button,Snackbar } from '@material-ui/core';
import { Link, useLocation } from "react-router-dom";

function copytags(tags,succ) {
	const taglist = tags.join(" ")
	console.log("copying")
	navigator.clipboard.writeText(taglist).then(function () {
		console.log('Async: Copying to clipboard was successful!');
		succ()
	}, function (err) {
		console.error('Async: Could not copy text: ', err);
	});
}
export function SelectedTags(props) {
	const { store } = useContext(ReactReduxContext)
	const selectedtags = useSelector(state => state.selectedtags)
	let location = useLocation();
	const [openCopy, setOpenCopy] = React.useState(false);
	return (
		<>
			<div className="selectedtags">
				<p style={{fontWeight:"bold"}}>Tag box:</p>
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
					<p>Empty {':('}</p>
				)}
			</div>
			<Button onClick={()=>copytags(selectedtags,()=>setOpenCopy(true))}>copy</Button>
			<Snackbar open={openCopy} autoHideDuration={6000} onClose={() => setOpenCopy(false)} message="This is a success message!"></Snackbar>
		</>
	)
}

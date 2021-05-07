import { Tooltip, createMuiTheme } from '@material-ui/core';
import { useSelector } from "react-redux";
//import { ReactReduxContext } from 'react-redux'
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const theme = createMuiTheme({})

export const MediaList = (props) => {
  const mediatags = useSelector(state => state.mediatags)
  let i = 0
  let location = useLocation();
  const match = location.pathname.match(/\/tag\/(.*)/)
  const focusedtag = "#" + (match?.[1] || "")
  const [ imgs, setImgs ] = useState(false)

  const toggleImgs = ()=>setImgs(!imgs)
  return (
    <div className={props.className || "media"}>
      <input type="checkbox" onChange={toggleImgs} checked={imgs}/>
      <ul>
        {props.media ? (
          props.media.map((med, idx) => {
            let tags = mediatags?.[med.id]
            let hastag = tags?.includes(focusedtag)
            return (
              <li key={i++} style={!imgs ? {background:`${hastag?"#ddf":"none"}`} : {}}>
                <Tooltip title={`${med.timestamp} (${tags?.count || 0} tags)\n${med.caption.substring(0, 50)}...`}>
                  <Link to={`/insta/${idx}`}>
                    {imgs ? <div
                    style={{
                      //backgroundImage: `url(${med.media_url})`,
                      backgroundImage: imgs ? `url(${med.media_url})` : "none",
                      boxShadow:
                        (hastag && `inset 0px 0px 0px 10px ${theme.palette.primary.main}`)
                        ||
                        (location.pathname === `/insta/${idx}` && `inset 0px 0px 0px 10px ${theme.palette.secondary.main}`)
                        ||
                        `inset 0px 0px 0px 10px rgba(0,0,0,0)`,
                      transition:"box-shadow 0.2s"
                    }}
                    className={`mediali`}
                  /> : <div>{new Date(med.timestamp).toDateString()+" "+med.caption.substring(0,50)}</div>}
                  </Link>
                </Tooltip>
              </li>
            )
          })
        ) : (
            <li>No media!</li>
          )}
      </ul>
    </div>
  )
  //                onClick={(ev)=>store.dispatch({type:"nav/focus-insta",payload:{insta:idx}})}

}


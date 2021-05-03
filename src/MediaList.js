import { Tooltip, createMuiTheme } from '@material-ui/core';
import { useSelector } from "react-redux";
//import { ReactReduxContext } from 'react-redux'
import { Link, useLocation } from "react-router-dom";
//import { useContext } from "react";

const theme = createMuiTheme({})

export const MediaList = (props) => {
  const mediatags = useSelector(state => state.mediatags)
  let i = 0
  let location = useLocation();
  const match = location.pathname.match(/\/tag\/(.*)/)
  const focusedtag = "#" + (match?.[1] || "")

  return (
    <div className={props.className || "media"}>
      <ul>
        {props.media ? (
          props.media.map((med, idx) => (
            <li key={i++}>
              <Tooltip title={`${med.timestamp} (${mediatags?.[med.id]?.count || 0} tags)\n${med.caption.substring(0, 50)}...`}>
                <Link to={`/insta/${idx}`}><div
                  style={{
                    //backgroundImage: `url(${med.media_url})`,
                    backgroundImage: `zurl(${med.media_url})`,
                    boxShadow:
                      (mediatags?.[med.id]?.includes(focusedtag) && `inset 0px 0px 0px 10px ${theme.palette.primary.main}`)
                      ||
                      (location.pathname === `/insta/${idx}` && `inset 0px 0px 0px 10px ${theme.palette.secondary.main}`)
                      ||
                      `inset 0px 0px 0px 10px rgba(0,0,0,0)`,
                    transition:"box-shadow 0.2s"
                  }}
                  className={`mediali`}
                /></Link>
              </Tooltip>
            </li>
          ))
        ) : (
            <li>No media!</li>
          )}
      </ul>
    </div>
  )
  //                onClick={(ev)=>store.dispatch({type:"nav/focus-insta",payload:{insta:idx}})}

}


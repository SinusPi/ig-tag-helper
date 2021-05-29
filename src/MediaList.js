/* eslint-disable no-extend-native */
import { Tooltip, createMuiTheme, Switch } from '@material-ui/core';
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

  Number.prototype.zeropad = function(n) {
    const s=this.toString()
    return (s.length>=n) ? s : "0".repeat(n-s.length)+s
  }
  Date.prototype.toYMD = function() {
    return `${this.getUTCFullYear()}-${(this.getUTCMonth()+1).zeropad(2)}-${(this.getUTCDate()).zeropad(2)}`;
  }

  const toggleImgs = ()=>setImgs(!imgs)
  return (
    <div className={props.className || "media"}>
      <Switch size="small" onChange={toggleImgs} value={imgs} className="vertical"/>
      <ul>
        {props.media ? (
          props.media.map((med, idx) => {
            const num = (props.media.length-idx)
            const tags = mediatags?.[med.id]
            const hasTag = tags?.includes(focusedtag)
            const isCurrent = location.pathname === `/insta/${idx}`;
            return (
              <li key={i++} style={{
              }}>
                <Tooltip title={`${med.timestamp} (${tags?.count || 0} tags)\n${med.caption.substring(0, 50)}...`}>
                  <Link to={`/insta/${idx}`}>
                    <div className="tile"
                      style={{
                        boxShadow:
                        (hasTag && `inset 0px 0px 0px 10px ${theme.palette.primary.main}`)
                        ||
                        (isCurrent && `inset 0px 0px 0px 10px ${theme.palette.secondary.main}`)
                        ||
                        `inset 0px 0px 0px 10px rgba(0,0,0,0)`,
                              //backgroundImage: `url(${med.media_url})`,
                        backgroundImage: imgs ? `url(${med.media_url})` : "none",
                        backgroundSize: "cover",
                        transition:"box-shadow 0.2s",
                        padding:"10px",
                        boxSizing:"border-box",
                      }}
                    
                    >
                      {!imgs && (<div className='txt'><div className='num'>{num}</div><div className="date">{new Date(med.timestamp).toYMD()}</div><div className="caption">{med.caption.substring(0,50)}</div></div>) }
                    </div>
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


import './App.css';
import React from 'react';
import { Button,Dialog,CircularProgress,Backdrop,Tooltip,Chip,  createMuiTheme } from '@material-ui/core';
import InstagramLogin from "react-instagram-oauth";
import { createStore } from 'redux'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useParams,
  useLocation,
} from "react-router-dom";

var CFG={}
CFG.insta_app_id="578554696871308";
CFG.insta_app_secret="f8bcfef01d08270b99f4e092231f9c0c";
CFG.redirect_uri="https://djab.eu:3000/";

const initialState = {
  token:JSON.parse(window.localStorage.getItem("instagram_token") || "null"),
  userid:JSON.parse(window.localStorage.getItem("instagram_userid") || "null"),
  media:JSON.parse(window.localStorage.getItem("instagram_media") || "null"),
  username:null,
  allmedia:false,
  loading:false,
  error:false,
  url:null,
  analyzed:false,
  selectedtags:[],
}

function appReducer(state = initialState, action) {
  // The reducer normally looks at the action type field to decide what happens
  console.log("Dispatch: ",action.type)
  switch (action.type) {
    // Do something here based on the different types of actions
    case "oauth/gottoken":
      localStorage.setItem("instagram_token",JSON.stringify(action.payload.token))
      localStorage.setItem("instagram_userid",JSON.stringify(action.payload.userid))
      return {...state, token:action.payload.token, userid:action.payload.userid, error:null, loading:false}
    case "oauth/clear":
      return {...state, token:null, userid:null, loading:false, error:null, media:null, allmedia:false}
    case "oauth/error":
      return {...state, token:null, userid:null, loading:false, error:action.payload}

    case "loader/loading":
      return {...state, loading:true}
    case "loader/gotusername":
      return {...state, username:action.payload, loading:false}
    case "loader/gotmedia":
      const newmedia = state.media || []
      return {...state, media:newmedia.concat(action.payload.media), url:action.payload.url, allmedia:!action.payload.url, loading:false}
    
    case "analyzer/analyzed":
      return {...state, analyzed:true, media:action.payload.media, tags:action.payload.tags}
    
    /*
    case "nav/focus-none":
      return {...state, focustype:null}
    case "nav/focus-insta":
      return {...state, focustype:"insta", focusinsta:action.payload.insta}
    case "nav/focus-tag":
      return {...state, focustype:"tag", focustag:action.payload.tag}
    */

    case "selecttag/toggle":
      const tag=action.payload.tag
      var st=[...state.selectedtags]
      const i=st.indexOf(tag)
      if (i>-1) st.splice(i,1)
      else st.push(tag)
      return {...state, selectedtags:st }
    
    default:
      // If this reducer doesn't recognize the action type, or doesn't
      // care about this specific action, return the existing state unchanged
      return state
  }
}

const store = createStore(appReducer,initialState)

// Log the initial state
console.log('Initial state: ', store.getState())
// {todos: [....], filters: {status, colors}}

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() =>
  console.log('State after dispatch: ', store.getState())
)


var life=20;

/*
function useStickyState(defaultValue, key) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
*/
let code_in_url = window.location.search.includes("code=")

function heartbeat() {
  if (life<0) return;
  if (code_in_url) return;
  const state = store.getState()
  if (!state.loading && state.token && state.userid && state.username==null) {
    console.log("LOGIN")
    life--
    InstagramMediaLoader.login()
  } else if (!state.loading && state.username && !state.allmedia) {
    console.log("GET MEDIA")
    life--
    InstagramMediaLoader.loadMedia()
  } else if (!state.loading && state.allmedia && !state.analyzed) {
    console.log("ANALYZING")
    life--
    MediaAnalyzer.analyze(state.media)
  }
}
store.subscribe(heartbeat)

setInterval(()=>{
  // heartbeat
  heartbeat();
},100)

const authHandler = (a,b)=>{
  //console.log("AuthHandler:",a,b)
  if (b?.access_token) {
    console.log("Token received from popup!",b)
    store.dispatch({type:"oauth/gottoken",payload:{token:b.access_token,userid:b.user_id}})
  }
}

function App() {

  const token = useSelector(state=>state.token)
  const userid = useSelector(state=>state.userid)
  const username = useSelector(state=>state.username)
  const media = useSelector(state=>state.media)
  const loading = useSelector(state=>state.loading)


  /*
  React.useEffect(()=>{
    life--;
    if (life<0) { console.log("DEAD."); return }
    console.log('media:',media,'mediastate:',mediaState)
    if (mediaState.error) return; // no further activity
    if (loading) return;
    if (token) {
      if (!username) {
        setLoading(true)
        InstagramMediaLoader.login({token:token,setToken:setToken,userId:userid,setUsername:setUserName,fail:fail}).then(()=>setLoading(false))
      } else if (!mediaState.loaded) {
        return
        setMediaState({loading:true,...mediaState})
        setMedia([])
        InstagramMediaLoader.loadMedia({token:token,setToken:setToken,userId:userid,setUsername:setUserName,url:mediaState.nextUrl,onResult:(result)=>{
          console.log("Result rcvd:",result)
          if (!result.success) return setMediaState({loading:false,error:true,...mediaState})
          setMediaState({loading:false,...mediaState})
          if (result.media) setMedia(media.concat(result.media))
        }})
      }
    } else if (code_in_url) {
      var _a = window.location.search.match(/.*code=([^&|\n|\t\s]+)/) || [], match = _a[0], code = _a[1];
      console.log("Self-posting: ",code)
      window.postMessage({type:'code',data:code})
    }
  },[token,media,mediaState,username,loading])
  */

  /*
  React.useEffect(() => {
    //alert(window.location.search)
    const interval = setInterval(() => {
      refreshToken()
      console.log('state:',mediaState)
      //console.log('This will run every second!');
      if (token && media.length==0 && !mediaState.loading && !mediaState.error) {
        setMediaState({loading:true,...mediaState})
        InstagramMediaLoader.loadMedia({token:token,userid:userid,onResult:(result)=>{
          console.log("Result rcvd:",result)
          if (!result.success) return setMediaState({loading:false,error:true,...mediaState})
          setMediaState({loading:false,...mediaState})
        }})
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  */

  return (
    <Router>
      {!media && !code_in_url && <Redirect to="/"/>}
    <>
    <div className="App">

      <div className="topbar">
        {code_in_url ? (
          <div style={{flex:"1 1"}}>Authenticating...</div>
        ) : [
            <div style={{flex:"1 1"}}>{userid&&username?<div>Logged in as: <b>{username}</b></div>:"Not logged in"}</div>,
            <Button style={{minWidth:"8em",flex:"0 0"}} onClick={()=>store.dispatch({type:"oauth/clear"})}>Reauthorize</Button>
        ]}
      </div>

      <div className={`content ${code_in_url?"is-hidden":""}`}>
        
        {/* MAIN APP */}
        
        <SelectedTags/>

        <MediaList className="media" media={media}/>

        <Switch>
          <Route path="/tag/:tag">
            <FocusedTag />
          </Route>
          <Route path="/insta/:id">
            <FocusedInsta />
          </Route>
        </Switch>

      </div>

      <TokenDialog
        open={!token && !code_in_url}
        onClose={()=>null}>
        <div>You need an Instagram token.</div>
        <div>Please re-authorize with Instagram.</div>
        
        <InstagramLogin
          authCallback={authHandler}
          appId={CFG.insta_app_id}
          appSecret={CFG.insta_app_secret}
          redirectUri={CFG.redirect_uri}
          scope={["user_profile","user_media"]}
          buttonTheme="simple"
        />
      </TokenDialog>

      <InstagramLogin
            authCallback={authHandler}
            appId={CFG.insta_app_id}
            appSecret={CFG.insta_app_secret}
            redirectUri={CFG.redirect_uri}
            scope={["user_profile","user_media"]}
            buttonTheme="simple"
            className="is-hidden"
       />

      {/*
      <InstagramLogin
        authCallback={authHandler}
        appId={CFG.insta_app_id}
        appSecret={CFG.insta_app_secret}
        redirectUri={CFG.redirect_uri}
        className={"is-hidden"}
      />
      */}
    </div>
    <Backdrop className="backdrop" open={loading}>
      <CircularProgress color="hsl(160,20%,100%)" />
    </Backdrop>
    </>
    </Router>


  );
}

function chipclick(ev,t) {
  if (!ev.shiftKey) return true;
  ev.preventDefault();
  store.dispatch({type:"selecttag/toggle",payload:{tag:t}})
}
function FocusedTag() {
  //let { path, url } = useRouteMatch();
  var { tag } = useParams();
  const tags = useSelector(state=>state.tags)
  const selectedtags = useSelector(state=>state.selectedtags)
  if (!tags) return null;
  //const tag = useSelector(state=>state.focustag)
  tag="#"+tag
  return (
    <>
            <h1>
            <Chip
               label={`${tag}`}
               onClick={(ev)=>chipclick(ev,tag)}
               color={selectedtags.includes(tag)?"primary":"default"}
               component={Link}
               to={`/tag/${tag.substring(1)}`}
               />
            </h1>
            <div className="tagbox">
              {tags[tag].with_ordered.map((t)=><Chip
               size="small"
               label={`${t} [${tags[tag].with[t]}]`}
               onClick={(ev)=>chipclick(ev,t)}
               color={selectedtags.includes(t)?"primary":"default"}
               component={Link}
               to={`/tag/${t.substring(1)}`}
               />)}
            </div>
    </>
  )
               //className={`chip ${selectedtags.includes(t)?"selected":""}`}
  // onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}
function FocusedInsta() {
  const { id } = useParams();
  const media = useSelector(state=>state.media)
  const selectedtags = useSelector(state=>state.selectedtags)
  const insta = media[id]
  if (!insta) return null;
  return <>
            <h1>{insta.caption.substring(0,50)}</h1>
            <div className="tagbox">
              {insta.tags.map((t)=><Chip
                size="small"
                label={t} 
                color={selectedtags.includes(t)?"primary":"default"}
                onClick={(ev)=>chipclick(ev,t)}
                component={Link}
                to={`/tag/${t.substring(1)}`}
              />)}
            </div>
  </>  
  // onClick={()=>store.dispatch({type:"nav/focus-tag",payload:{tag:t}})}
}

function TokenDialog(props) {
  const { onClose, open, children } = props;

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      {children}
    </Dialog>
  );
}

function SelectedTags(props) {
  const selectedtags = useSelector(state=>state.selectedtags)
  let location = useLocation();
  return (
  <div className="selectedtags">
    {selectedtags.map((t)=><Chip
      size="small"
      label={t}
      onClick={(ev)=>chipclick(ev,t)}
      onDelete={(ev)=>{ev.preventDefault(); store.dispatch({type:"selecttag/toggle",payload:{tag:t}})}}
      color={location.pathname==`/tag/${t.substring(1)}` && "secondary" || "primary"}
      component={Link}
      to={`/tag/${t.substring(1)}`}
    />)}
  </div>
  )
}


/*
message	"Unsupported get request. Object with ID '17841409318694392' does not exist, cannot be loaded due to missing permissions, or does not support this operation"
type	"IGApiException"
code	100
error_subcode	33
fbtrace_id	"ACZ4mE84Pf4I7oSf2lfIe1D"
*/

const ig_fetch = (url)=>{
  return fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log("Fetched:",data)
    if (data?.error) {
      if (data.error.type=="OAuthException" && data.error.code==190) { console.error("Token expired! Clearing token, hoping someone will retry."); return Promise.reject({type:"oauth/clear"}); }
      else if (data.error.type=="OAuthException" && data.error.code==4) { console.error("Too many requests!"); return Promise.reject({type:"oauth/error",payload:"FLOODED"}); }
      else if (data.error.type=="OAuthException" && data.error.code==2) { console.error("Internal error at Instagram!"); return Promise.reject({type:"oauth/error",payload:"ERROR"}); }
      else return Promise.reject({type:"oauth/error",payload:data.error});
    }
    return data
  })
}

class InstagramMediaLoader {
  static login(props) {
    const state = store.getState()
    const { token,userid } = state

    store.dispatch({type:"loader/loading"})

    return ig_fetch(`https://graph.instagram.com/${userid}?fields=id,username&access_token=${token}`)
    .then(data=>store.dispatch({type:"loader/gotusername",payload:data.username}),err=>store.dispatch({type:"oauth/error",payload:err}))
  }

  static async loadMedia() {
    const state = store.getState()
    const { token,url } = state

    console.log("LoadMedia started: ",url)

    store.dispatch({type:"loader/loading"})

    /*
    await fetch(`https://graph.instagram.com/${userId}?fields=id,username&access_token=${token}`)
    .then(response => response.json())
    .then(async data => {
      console.log("Fetched:",data)
      if (data?.error) {
        if (data.error.type=="OAuthException" /* && data.error.code==190 * /) { console.log("Clearing token"); setToken(null); return; }
      }
      if (data?.username) setUsername(data.username);
    */
    
    return ig_fetch(url || `https://graph.instagram.com/me/media/?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${token}`)
      .then(data => {
        console.log("Fetched media:",data)
        store.dispatch({type:"loader/gotmedia",payload:{media:data?.data, url:data?.paging?.next}})
      })
  }
}

const theme = createMuiTheme({})

const MediaList = (props) => {
  let i=0
  let location = useLocation();
  const match = location.pathname.match(/\/tag\/(.*)/)
  const focusedtag = "#"+(match && match[1] || "")
  
  return <div className={props.className||"media"}>
    <ul>
      {props.media?(
        props.media.map((med,idx)=>(
          <li
            key={i++}
            
          >
            <Tooltip title={`${med.timestamp} (${med.tags?.count||0} tags)\n${med.caption.substring(0,50)}...`}>
              <Link to={`/insta/${idx}`}><div
                style={{backgroundImage:`url(${med.media_url})`,boxShadow:med.tags?.includes(focusedtag)&&`inset 0px 0px 0px 10px ${theme.palette.primary.main}`}}
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
  //                onClick={(ev)=>store.dispatch({type:"nav/focus-insta",payload:{insta:idx}})}

}

class MediaAnalyzer {
  static analyze(media) {
    let newmedia = JSON.parse(JSON.stringify(media))
    let alltags=[]
    for (let med of newmedia) {
      med.tags = [...med.caption?.matchAll(/#[\w\dąćęłńóśźżĄĆĘŁŃÓŚŹŻ_]+/g)].map(a=>a[0])
      for (let tag1 of med.tags) {
        if (!alltags[tag1]) alltags[tag1]={count:0,with:{}}
        alltags[tag1].count++;
        for (let tag2 of med.tags) {
          if (tag1==tag2) continue
          alltags[tag1].with[tag2] = (alltags[tag1].with[tag2]||0)+1;
        }
      }
    }
    for (let tag in alltags) {
      let tagd=alltags[tag]
      tagd.with_ordered = Object.keys(tagd.with).sort((a,b)=>tagd.with[b]-tagd.with[a])
    }
    store.dispatch({type:"analyzer/analyzed",payload:{media:newmedia,tags:alltags}})
  }
}

export {App, store}

/*
<input type="text" id="tag" />
<div id="out"></div>
<div id="picked" style="position:absolute; left:500px; top:0; border:1px solid black;"></div>

<script type="text/babel">
	var tags = {};

  var picked_tags=[]
	
	function focusTag(tag) {
		$("#tag").val(tag).change()
	}
	function renderPicked() {
		$("#picked").empty()
		for (let tag of picked_tags) {
			let $ptag = $("<div class='pickedtag'>"+tag+"</div>")
			$ptag.data("tag",tag)
			$ptag.click(function(e) { focusTag($(this).data("tag")) })
			$("#picked").append($ptag)
		}
	}
	function toggleTag(tag) {
		let idx
		if ((idx=picked_tags.indexOf(tag))!=-1) picked_tags.splice(idx,1); else picked_tags.push(tag)
		renderPicked()
	}
	function tag(s,num) {
		let t=$(`<div class='tag'>${s} [${num}]</div>`)
		t.click(function(e) { toggleTag(s) })
		return t
	}
	$(()=>{
		$("input#tag").change(function(e) {
			$("#out").empty()
			let t=tags[$(this).val()]
			if (!t) return $("#out").html("");
			let tagdivs = t.with_ordered.map((k)=>tag(k,t.with[k]))
			console.log(tagdivs)
			$("#out").append(tagdivs)
		})
	})
*/
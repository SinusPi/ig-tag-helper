import './App.css';
import React from 'react';
import { Button, Dialog, CircularProgress, Backdrop, Tooltip, Chip, createMuiTheme, Divider, Paper } from '@material-ui/core';
import InstagramLogin from "react-instagram-oauth";
import { Link } from "react-router-dom";
import { createStore } from 'redux'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import { MediaList } from './MediaList.js';
import { MediaAnalyzer } from "./MediaAnalyzer.js"
import { InstagramMediaLoader } from "./InstagramMediaLoader.js"
import { SelectedTags } from "./SelectedTags.js"
import { FocusedTag } from "./FocusedTag.js"
import { FocusedInsta } from "./FocusedInsta.js"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

var CFG = {}
CFG.insta_app_id = "578554696871308";
CFG.insta_app_secret = "f8bcfef01d08270b99f4e092231f9c0c";
CFG.redirect_uri = window.location.protocol + "//" + window.location.host + "/";

/*
const initialState = {
  token: JSON.parse(window.localStorage.getItem("instagram_token") || "null"),
  userid: JSON.parse(window.localStorage.getItem("instagram_userid") || "null"),
  media: JSON.parse(window.localStorage.getItem("instagram_media") || "null"),
  auth_shown:false,
  username: null,
  allmedia: JSON.parse(window.localStorage.getItem("instagram_media") || "null"),
  loading: false,
  error: false,
  url: null,
  selectedtags: [],
  tags: JSON.parse(window.localStorage.getItem("instagram_tags") || "null"),
}
*/
const load = id => JSON.parse(localStorage.getItem(id) || "null")
const save = (val, id) => localStorage.setItem(id, JSON.stringify(val))

const initialState = {
  token: load("instagram_token"),
  userid: load("instagram_userid"),
  media: load("instagram_media"),
  auth_shown: false,
  username: null,
  allmedia: !!load("instagram_media"),
  loading: false,
  error: false,
  url: null,
  selectedtags: [],
  tags: null,
  mediatags: null,
  counterloading: false,
  tagcounts: null
}

function appReducer(state = initialState, action) {
  // The reducer normally looks at the action type field to decide what happens
  console.log("Dispatch: ", action.type)
  switch (action.type) {
    // Do something here based on the different types of actions
    case "oauth/gottoken":
      save(action.payload.token, "instagram_token")
      save(action.payload.userid, "instagram_userid")
      return { ...state, token: action.payload.token, userid: action.payload.userid, error: null, loading: false, auth_shown: false }
    case "oauth/clear":
      localStorage.removeItem("instagram_token")
      localStorage.removeItem("instagram_userid")
      localStorage.removeItem("instagram_media")
      localStorage.removeItem("instagram_tags")
      return { ...state, token: null, userid: null, loading: false, error: null, media: null, allmedia: false, tags: null }
    case "oauth/query":
      return { ...state, auth_shown: true }
    case "oauth/error":
      return { ...state, token: null, userid: null, loading: false, auth_shown: false, error: action.payload }

    case "loader/loading":
      return { ...state, loading: true }
    case "loader/gotusername":
      return { ...state, username: action.payload, loading: false }
    case "loader/gotmedia":
      const newmedia = state.media || []
      const allmedia = !action.payload.url
      save(action.payload.media, "instagram_media")
      return { ...state, media: newmedia.concat(action.payload.media), url: action.payload.url, allmedia, loading: false }

    case "analyzer/analyzed":
      return { ...state, mediatags: action.payload.mediatags, tags: action.payload.tags }

    /*
    case "tagcounter/loading":
      return { ...state, counterloading:true }

    case "tagcounter/count":
      const tagcounts = { ...state.tagcounts, ...action.payload.tag }
      save(tagcounts, "instagram_tagcounts")
      return { ...state, qqcounterloading:false, tagcounts }
    */

    /*
    case "nav/focus-none":
      return {...state, focustype:null}
    case "nav/focus-insta":
      return {...state, focustype:"insta", focusinsta:action.payload.insta}
    case "nav/focus-tag":
      return {...state, focustype:"tag", focustag:action.payload.tag}
    */

    case "selecttag/toggle":
      const tag = action.payload.tag
      var st = [...state.selectedtags]
      const i = st.indexOf(tag)
      if (i > -1) st.splice(i, 1)
      else st.push(tag)
      return { ...state, selectedtags: st }

    default:
      // If this reducer doesn't recognize the action type, or doesn't
      // care about this specific action, return the existing state unchanged
      return state
  }
}

const store = createStore(appReducer, initialState)

// Log the initial state
console.log('Initial state: ', store.getState())
// {todos: [....], filters: {status, colors}}

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() =>
  console.log('State after dispatch: ', store.getState())
)


var life = 20;

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
  if (life < 0) { console.error("DEAD"); return; }
  if (code_in_url) return;
  const state = store.getState()
  if (!state.loading && state.token && state.userid && state.username == null) {
    console.log("LOGIN")
    life--
    store.dispatch({ type: "loader/loading" })
    InstagramMediaLoader.login(state.token).then(data => store.dispatch({ type: "loader/gotusername", payload: data.username }), err => store.dispatch({ type: "oauth/error", payload: err }))
  } else if (!state.loading && state.username && !state.allmedia) {
    console.log("GET MEDIA")
    life--
    store.dispatch({ type: "loader/loading" })
    InstagramMediaLoader.loadMedia(state.token, state.url).then(data => {
      console.log("Fetched media:", data)
      store.dispatch({ type: "loader/gotmedia", payload: { media: data?.data, url: data?.paging?.next } })
    }, err => store.dispatch({ type: "oauth/error", payload: err }))

  } else if (!state.loading && state.allmedia && !state.tags) {
    console.log("ANALYZING")
    life--
    const media_tags = MediaAnalyzer.analyze(state.media, store)
    store.dispatch({ type: "analyzer/analyzed", payload: media_tags })
  }
  /*
  } else if (state.tags && !state.counterloading) {
    for (let tag in state.tags) {
      if (!Object.keys(state.tagcounts || {}).includes(tag)) {
        console.log("COUNTING", tag)
        store.dispatch({ type: "tagcounter/loading" })
        InstagramTagCounter.count(tag).then(count => {
          store.dispatch({ type: "tagcounter/count", payload: { [tag]: count } })
        })
        life = life - 0.01
        break
      }
    }
  }
  */
}
store.subscribe(heartbeat)

setInterval(() => {
  // heartbeat
  heartbeat();
}, 100)

const authHandler = (a, b) => {
  //console.log("AuthHandler:",a,b)
  if (b?.access_token) {
    console.log("Token received from popup!", b)
    store.dispatch({ type: "oauth/gottoken", payload: { token: b.access_token, userid: b.user_id } })
  }
}

function App() {

  const userid = useSelector(state => state.userid)
  const username = useSelector(state => state.username)
  const media = useSelector(state => state.media)
  const loading = useSelector(state => state.loading)
  const tags = useSelector(state => state.tags)
  const auth_shown = useSelector(state => state.auth_shown)

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
      {!media && !code_in_url && <Redirect to="/" />}
      <>
        <div className="App">

          <div className="topbar">
            {code_in_url ?
              <div style={{ flex: "1 1" }}>Authenticating...</div>
              :
              <>
                <div style={{ flex: "1 1" }}>{userid && username ? <div>Logged in as: <b>{username}</b></div> : "Not logged in"}</div>
                <Button style={{ minWidth: "8em", flex: "0 0" }} onClick={() => store.dispatch({ type: "oauth/clear" })}>Reset</Button>
                <Button style={{ minWidth: "8em", flex: "0 0" }} onClick={() => store.dispatch({ type: "oauth/query" })}>Reauthorize</Button>
              </>
            }
          </div>

          <div className={`content ${code_in_url ? "is-hidden" : ""}`}>

            {/* MAIN APP */}

            <Paper>
            {tags && <SelectedTags />}
            </Paper>

            <Paper>
              <MediaList className="media" media={media} />
              {tags && <Link to="/tag/*">All tags</Link>}
            </Paper>

            {tags &&
              <>
                <Switch>
                  <Route path="/tag/:tag">
                    <FocusedTag />
                  </Route>
                  <Route path="/insta/:id">
                    <FocusedInsta />
                  </Route>
                </Switch>
              </>
            }

          </div>

          <TokenDialog
            open={auth_shown}
            onClose={() => null}>
            <div>You need an Instagram token.</div>
            <div>Please re-authorize with Instagram.</div>

            <InstagramLogin
              authCallback={authHandler}
              appId={CFG.insta_app_id}
              appSecret={CFG.insta_app_secret}
              redirectUri={CFG.redirect_uri}
              scope={["user_profile", "user_media"]}
              buttonTheme="simple"
            />
          </TokenDialog>

          <InstagramLogin
            authCallback={authHandler}
            appId={CFG.insta_app_id}
            appSecret={CFG.insta_app_secret}
            redirectUri={CFG.redirect_uri}
            scope={["user_profile", "user_media"]}
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
          <CircularProgress color="primary" />
        </Backdrop>
      </>
    </Router>

  );
}

export function chipclick_toggle(ev,t) {
  ev.preventDefault()
  store.dispatch({ type: "selecttag/toggle", payload: { tag: t } })
}
export function chipclick(ev, t) {
  if (!ev.shiftKey) return true;
  chipclick_toggle(ev,t)
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



/*
message	"Unsupported get request. Object with ID '17841409318694392' does not exist, cannot be loaded due to missing permissions, or does not support this operation"
type	"IGApiException"
code	100
error_subcode	33
fbtrace_id	"ACZ4mE84Pf4I7oSf2lfIe1D"
*/



export { App, store }

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

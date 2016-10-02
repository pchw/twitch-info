React = require 'react'
ReactDOM = require 'react-dom'
ReactDOMServer = require 'react-dom/server'
jade = require('react-jade')
request = require 'superagent'
moment = require 'moment'
_ = require('lodash')
CLIENT_ID = "qbz670hdhurhch1297howqv4mnix5n8"

class App extends React.Component
  constructor: ->
    
  componentWillMount: =>
    @setState
      trend: {}
  render: =>
    unless @state.isUsernameEntered
      template = jade.compileFile("#{__dirname}/../../build/template/input.jade")
      .locals {}
    else
      template = jade.compileFile("#{__dirname}/../../build/template/main.jade")
      .locals {}
    template _.extend {}, @, @props, @state

  onKey: (e)=>
    if e.keyCode is 13
      do @usernameEntered
  onChangeUsername: (e)=>
    @setState
      username: e.target.value
  updateTimer: =>
    state = @state
    if state.createdAt
      diff = moment().diff(moment(state.createdAt))
      duration = moment.duration(diff,'milliseconds')
      state.time = [
        ("0" + duration.hours()).slice(-2)
        ("0" + duration.minutes()).slice(-2)
        ("0" + duration.seconds()).slice(-2)
      ].join(':')
    @setState state
  usernameEntered: =>
    state = @state
    state.isLoading = true
    unless state.firstTime
      state.firstTime = true
      @apiTimer = setInterval @usernameEntered, 30*1000
      @clockTimer = setInterval @updateTimer, 1000
    @setState state

    request
    .get "https://api.twitch.tv/kraken/streams/#{@state.username}"
    .set 'Accept', 'application/vnd.twitchtv.v3+json'
    .set 'Client-ID', CLIENT_ID
    .end (e,res)=>
      if e 
        clearInterval @apiTimer
        clearInterval @clockTimer
        state.isLoading = false
        state.firstTime = false
        state.message = "Network Error"
        @setState state
        return

      streamObj = JSON.parse res.text

      unless streamObj.stream
        # OFFLINE
        state.currentViewerCount = 0
        state.gameTitle = ""
        state.title = ""
        state.totalViews = 0
        state.followerCount = 0
        state.isOffline = true
      else
        # ONLINE
        state.isOffline = false
        if state.currentViewerCount < streamObj.stream.viewers
          state.trend.currentViewerCount = true
        else if state.currentViewerCount > streamObj.stream.viewers
          state.trend.currentViewerCount = false
        else
          state.trend.currentViewerCount = null
        state.currentViewerCount = streamObj.stream.viewers
        state.gameTitle = streamObj.stream.game
        state.title = streamObj.stream.channel.status
        state.totalViews = streamObj.stream.channel.views
        state.followerCount = streamObj.stream.channel.followers
        state.createdAt = streamObj.stream.created_at
        
      state.isUsernameEntered = true
      state.isLoading = false
      @setState state

container = document.getElementById "container"

ReactDOM.render React.createElement(App), container
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';
import axios from 'axios';

const CLIENT_ID = 'qbz670hdhurhch1297howqv4mnix5n8';

class App extends Component {
  constructor() {
    super();
    this.state = {
      trend: {},
      username: '',
      createdAt: '',
      time: '',
      isLoading: false,
      firstTime: false,
      apiTimer: null,
      clockTimer: null,
      isUsernameEntered: false
    };
  }

  onKey(e) {
    if (e.keyCode === 13) {
      this.usernameEntered();
    }
  }
  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }
  updateTimer() {
    const state = this.state;
    if (state.createdAt) {
      const diff = moment().diff(moment(state.createdAt));
      const duration = moment.duration(diff, 'milliseconds');
      state.time = [
        ('0' + duration.hours()).slice(-2),
        ('0' + duration.minutes()).slice(-2),
        ('0' + duration.seconds()).slice(-2)
      ].join(':');
    }
    this.setState(state);
  }
  usernameEntered() {
    const state = this.state;
    state.isLoading = true;
    if (!state.firstTime) {
      state.firstTime = true;
      this.apiTimer = setInterval(this.usernameEntered.bind(this), 30 * 1000);
      this.clockTimer = setInterval(this.updateTimer.bind(this), 1000);
    }
    this.setState(state);

    axios({
      url: `https://api.twitch.tv/kraken/streams/${this.state.username}`,
      headers: {
        Accept: 'application/vnd.twitchtv.v3+json',
        'Client-ID': CLIENT_ID
      }
    })
      .then(res => {
        const streamObj = res.data;
        if (!streamObj.stream) {
          state.currentViewerCount = 0;
          state.gameTitle = '';
          state.title = '';
          state.totalViews = 0;
          state.followerCount = 0;
          state.isOffline = true;
        } else {
          state.isOffline = false;
          if (state.currentViewerCount < streamObj.stream.viewers) {
            state.trend.currentViewerCount = true;
          } else if (state.currentViewerCount > streamObj.stream.viewers) {
            state.trend.currentViewerCount = false;
          } else {
            state.trend.currentViewerCount = null;
          }
          state.currentViewerCount = streamObj.stream.viewers;
          state.gameTitle = streamObj.stream.game;
          state.title = streamObj.stream.channel.status;
          state.totalViews = streamObj.stream.channel.views;
          state.followerCount = streamObj.stream.channel.followers;
          state.createdAt = streamObj.stream.created_at;
        }

        state.isUsernameEntered = true;
        state.isLoading = false;
        this.setState(state);
      })
      .catch(e => {
        clearInterval(this.apiTimer);
        clearInterval(this.clockTimer);
        state.isLoadin = false;
        state.firstTime = false;
        state.message = 'Network Error';
        this.setState(state);
      });
  }

  render() {
    // 情報表示
    if (this.state.isUsernameEntered) {
      let currentViewsView;
      if (this.state.trend.currentViewerCount === true) {
        currentViewsView = (
          <div className="ui label blue massive">
            <i className="icon unhide" />
            <i className="icon arrow up" />
            <span>{this.state.currentViewerCount}</span>
          </div>
        );
      } else if (this.state.trend.currentViewerCount === false) {
        currentViewsView = (
          <div className="ui label red massive">
            <i className="icon unhide" />
            <i className="icon arrow sown" />
            <span>{this.state.currentViewerCount}</span>
          </div>
        );
      } else {
        currentViewsView = (
          <div className="ui label teal massive">
            <i className="icon unhide" />
            <span>{this.state.currentViewerCount}</span>
          </div>
        );
      }

      return (
        <div
          className="ui segment inverted"
          style={{ backgroundColor: 'rgba(0,0,0,1.0)' }}
        >
          <h1 className="ui header inverted">
            <i className="icon twitch" />
            <div className="content">
              <span>
                {this.state.username}
              </span>
              {this.state.isOffline
                ? <div className="sub header">OFFLINE</div>
                : <div className="sub header">
                    playing <span>{this.state.gameTitle}</span> -{' '}
                    <span>{this.state.time}</span>
                  </div>}
            </div>
          </h1>
          <div className="ui form large equal width inverted">
            <div className="three fields">
              <div className="field">
                <label>Current Viewers</label>

                {currentViewsView}
              </div>
              <div className="field">
                <label>Total Views</label>
                <div className="ui label teal massive">
                  <i className="icon area chart" />
                  <span>
                    {this.state.totalViews}
                  </span>
                </div>
              </div>
              <div class="field">
                <label>Followers</label>
                <div className="ui label teal massive">
                  <i className="icon users" />
                  <span>
                    {this.state.followerCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // ユーザ名入力
      return (
        <div className="ui dimmable dimmed segment">
          <div className="ui small fluid labeled action input">
            <div className="ui label">Twitch Username</div>
            <input
              type="text"
              value={this.state.username}
              onChange={this.onChangeUsername.bind(this)}
              onKeyUp={this.onKey.bind(this)}
              autoFocus="autoFocus"
            />
            <a
              className="ui button blue"
              onClick={this.usernameEntered.bind(this)}
            >
              OK
            </a>
          </div>
        </div>
      );
    }
  }
}

export default App;

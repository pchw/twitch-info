'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var j = require('electron-jade')({pretty: true}, {});
var Menu = require('menu');
require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
  // if (process.platform != 'darwin')
  app.quit();
});

var menu = Menu.buildFromTemplate([
{
  label: "File",
  submenu:[{
    label: "Exit",
    accelerator: "Command+Q",
    click: function(){app.quit();}
  }
  ,
  // {
  //   label: "DevTools",
  //   accelerator: "Alt+Command+I",
  //   click: function(){
  //     BrowserWindow.getFocusedWindow().toggleDevTools();
  //   }
  // },
  {
    label: "Reload",
    accelerator: "CmdOrCtrl+R",
    click: function(item, focusWindow){
      if (focusWindow) {
        focusWindow.reload();
      }
    }
  }
  ]
}
,
{
  label: "Edit",
  submenu: [
    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
    { type: "separator" },
    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]
}
,
{
  label: "Help",
  submenu: [{
    label: "Created by @pchw",
    click: function(){require('shell').openExternal('http://twitter.com/pchw');}
  }]
}]);

app.commandLine.appendSwitch('enable-transparent-visuals');

app.on('ready', function() {
  Menu.setApplicationMenu(menu);
  // ブラウザ(Chromium)の起動, 初期画面のロード
  mainWindow = new BrowserWindow({
    width: 800,
    height: 200,
    transparent: true,
    frame: false
  });
  mainWindow.loadUrl('file://' + __dirname + '/index.jade');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});


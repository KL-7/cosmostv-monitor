var gCosmostvPrefs = {
  prefs: Components.classes['@mozilla.org/preferences-service;1']
                     .getService(Components.interfaces.nsIPrefService)
                     .getBranch('extensions.cosmostv-monitor.'),

  log: function(mess) {
    Components.classes['@mozilla.org/consoleservice;1']
              .getService(Components.interfaces.nsIConsoleService)
              .logStringMessage('CosmosTV Prefs: ' + mess);
  },

  setAccountInfo: function(httpRequest) {
    if (httpRequest.readyState == 4) {
      var contract = 'None';
      var id = 'None';

      if (httpRequest.status == 200) {
        var re = /showServices\(.*, "(\d+)", "(\d+)",.*\)/;
        var m = httpRequest.responseText.match(re);
        if (m) {
          id = m[1]
          contract = m[2];
          this.log('set acc info OK');
        } else {
          this.log('set acc info FAILED 1');
        }
      } else {
        this.log('set acc info FAILED 2');
      }

      this.prefs.setCharPref('id', id);
      this.prefs.setCharPref('contract', contract);
    }
  },

  updateAccountInfo: function() {
    this.log('update acc info');
    var url = 'http://cosmostv.by/subscribers/account/';

    var httpRequest = new XMLHttpRequest();
    if (httpRequest.overrideMimeType) {
      httpRequest.overrideMimeType('text/html');
    }

    httpRequest.onreadystatechange = function() { gCosmostvPrefs.setAccountInfo(httpRequest); },
    httpRequest.open('GET', url, true);
    httpRequest.send(null);
  },

  onLoad: function() {
    this.log('load');
    window.addEventListener('unload', function(event) {
      event.currentTarget.removeEventListener("unload", arguments.callee, false);
      gCosmostvPrefs.onUnload();
    }, false);
  },

  onUnload: function() {
    this.log('unload');
    var ndWindow = Components.classes['@mozilla.org/appshell/window-mediator;1']
                             .getService(Components.interfaces.nsIWindowMediator)
                             .getMostRecentWindow('navigator:browser');

    ndWindow.gCosmostvMonitor.updateStats();
  }
};

var gCosmostvMonitor = {
  updateTimeout: null,
  prefs: Components.classes['@mozilla.org/preferences-service;1']
                     .getService(Components.interfaces.nsIPrefService)
                     .getBranch('extensions.cosmostv-monitor.'),

  log: function(mess) {
    Components.classes['@mozilla.org/consoleservice;1']
              .getService(Components.interfaces.nsIConsoleService)
              .logStringMessage('CosmosTV Monitor: ' + mess);
  },

  toMb: function(bytes) {
    bytes = String(bytes);
    bytes = bytes.replace(",", ".");
    return Math.round(parseFloat(bytes) / 1024 / 1024);
  },

  setStats: function(httpRequest) {
    if (httpRequest && httpRequest.readyState != 4) {
      return;
    }

    var label = ':(';
    var tooltip = 'No connection or wrong contract number.';

    if (httpRequest && httpRequest.status == 200) {
      this.log('set stats OK');
      var resp = eval('(' + httpRequest.responseText + ')').services;
      if (resp) {
        var net = this.toMb(resp[0].pinet_balance);
        var local = this.toMb(resp[0].plocal_balance);
        var contract = resp[0].pcontract_nm;
        this.prefs.setCharPref('contract', contract);
        label = net + ' / ' + local;
        tooltip = 'Internet (Mb) / local (Mb)';
      }
    } else {
      this.log('set stats FAILED');
    }

    document.getElementById('cosmostv-monitor-label').value = label;
    document.getElementById('cosmostv-monitor-label').tooltipText = tooltip;
  },

  updateStats: function() {
    this.log('update stats');

    var id = this.prefs.getCharPref('id');
    if ('None' == id) {
      this.setStats(null);
      return;
    }

    var url = 'http://cosmostv.by/json/subscribers/account/cabinet/?contract=';
    url += id;

    var httpRequest = new XMLHttpRequest();
    if (httpRequest.overrideMimeType) {
      httpRequest.overrideMimeType('application/json');
    }

    httpRequest.onreadystatechange = function() { gCosmostvMonitor.setStats(httpRequest); },
    httpRequest.open('GET', url, true);
    httpRequest.send(null);
  },

  updateStatsRepeatedly: function() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    this.updateStats();
    this.updateTimeout = setTimeout('gCosmostvMonitor.updateStatsRepeatedly()',
               this.prefs.getIntPref('update-interval') * 60 * 1000);
  },

  showPrefs: function() {
    this.updateStats();
    var prefsDialog = window.openDialog('chrome://cosmostv-monitor/content/prefs.xul', '_blank',
                                        'modal,centerscreen,chrome,resizable=no,dependent=yes');
  },

  leftClick: function(e) {
    if (e.button == 0) {
      if ('None' == this.prefs.getCharPref('id')) {
        this.showPrefs();
      } else {
        this.updateStats();
      }
    }
  },

  loadPage: function(e, url) {
    var browser = document.getElementById("content");
    var tab = browser.addTab(url);
    browser.selectedTab = tab;
  },

  openCosmotvAccount: function(e) {
    var url = 'http://cosmostv.by/subscribers/account/cabinet/';
    this.loadPage(e, url);
  },

  onLoad: function(e) {
    this.updateStatsRepeatedly();
  }
};

window.addEventListener('load', function(event) {
  event.currentTarget.removeEventListener("load", arguments.callee, false);
  gCosmostvMonitor.onLoad();
}, false);


module.exports = class Time {
  constructor() {
  }

  getTimeDif(time1, time2) {
    if (time2 == null)
      time2 = Math.round((new Date()).getTime() / 1000);
    return time1 - time2;
  }

  convertTimestamp(timestamp, form) {
    var d = timestamp == null ? new Date(Date.now())  : new Date(timestamp * 1000);
    var yyyy = d.getFullYear();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    var hh = d.getHours();
    var h = hh;
    var min = ('0' + d.getMinutes()).slice(-2);
    var ampm = 'AM';
    var time;

    if (hh > 12) {
      h = hh - 12;
      ampm = 'PM';
    } else if (hh === 12) {
      h = 12;
      ampm = 'PM';
    } else if (hh === 0) {
      h = 12;
    }

    switch (form) {
      case 'date':
        time = mm + '-' + dd;
        break;
      case 'time':
        time = h + ':' + min;
        break;
      case 'min':
        time = min;
        break;
      case 'YYYYMMDD':
        time = yyyy + mm + dd;
        break;
      default:
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
        break;
    }

    return time;
  }
};

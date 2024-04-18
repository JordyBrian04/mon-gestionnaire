import moment from "moment";

export function getTimeFromString(timeString: string) {
    var date = new Date("1970-01-01 " + timeString);
    return date.getTime();
  }
  
  export function getHoursFromString(timeString: string) {
    var date = moment(timeString, "HH:mm A");
    return date.hours();
  }
  
  export function getMinutesFromString(timeString: string) {
    var date = moment(timeString, "HH:mm A");
    return date.minutes();
  }
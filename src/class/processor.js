/**
 * Processor: Singleton class that defines the data processor
 **/
var {User} = require('./user.js');
var instance = null;

export class Processor {
  constructor() {
    if (!instance) {
      instance = this;
      this.users = {};
    }

    return instance;
  }

  process(data){
    let result = '';

    try {
      let name = this.getName(data);
      let date = this.getDate(data);
      let solicited = this.isSolicited(data);
      let device = this.getDevice(data);
      let wordCount = this.getWordCount(data);
      let rating = this.getRating(data);

      if (!this.users.hasOwnProperty(name)) {
        this.users[name] = new User(name);
      }
      var user = this.users[name];

      // LOTS TO SAY: if word count is > 100: knock 0.5% points
      if (wordCount > 100) {
        this.users[name].increaseIntegrity(-0.5);
      }

      // BURST: if the user still have not been bursted, and there was a review before
      if ((!user.burst.minute || !user.burst.hour) && user.timeLastReview) {
        // if the latest review and the current one are in the same minute
        // knock 40% points
        if (!this.users[name].burst.minute && user.timeLastReview.getTime() === date.getTime()) {
          this.users[name].burst.minute = true;
          this.users[name].increaseIntegrity(-40);
        } else {
          // if the latest review and the current one are in the same hour
          // knock 20% points
          if (!this.users[name].burst.hour && (date.getTime() - user.timeLastReview.getTime()) <= (60*60*1000) ) {
            this.users[name].burst.hour = true;
            this.users[name].increaseIntegrity(-20);
          }
        }
      }
      this.users[name].timeLastReview = date;

      // SAME DEVICE: each time a device is repeated:
      // knock 30% points
      if (!this.users[name].addDevice(device)) {
        this.users[name].increaseIntegrity(-30);
      }

      // ALL-STAR: if a review has 5 stars: knock 2% points
      // if the average before that one is less than 3.5: knock quadruple
      if (rating === 5) {
        let points = 2;
        let average = user.ratingAverage();

        if (average && average < 3.5) {
          points*=4;
        }

        this.users[name].increaseIntegrity(-points);
      }
      // adds the rating to get the average the next 5-star review
      this.users[name].ratings.push(rating);

      // SOLICITED: if the review was solicited: add 3% points
      if (solicited) {
        this.users[name].increaseIntegrity(3);
      }

      // render the message
      result = this.users[name].getScore();
    } catch(e) {
      result = 'Could not read review summary data';
    }

    return result;
  }

  // retrieves the name of the user, second item on a data row
  getName(data) {
    let dataArray = data.split(',');
    let result = null;
    
    if (dataArray.length>2) {
      result = dataArray[1];
    }

    return result;
  }

  /**
   * gets the date of a given data row, returns that date as a Date object
   * as in the samples there is no year specified, it will be the current one
   */
  getDate(data) {
    let dataArray = data.split(',');
    let result = null;

    if (dataArray.length>1) {
      let date = dataArray[0].split(' ');

      if (date.length === 3) {
        // day
        let day = /^[0-9]{1,2}/.exec(date[0]);
        if (day.length === 1) {
          day = parseInt(day[0], 10);
        } else {
          throw new Error('Wrong date format');
        }

        let month = date[1];
        let year = (new Date()).getFullYear();
        let time = date[2];
        result = new Date(`${day}/${month}/${year} ${time}`);

        if (isNaN(result)) {
          throw new Error('Wrong date format');
        }
      } else {
        throw new Error('Wrong date format');
      }
    }

    return result;
  }

  // check if the review was solicited
  isSolicited(data) {
    let dataArray = data.split(',');
    let result = false;

    if (dataArray.length > 3) {
      if (/^(un)?solicited$/.test(dataArray[2])) {
        result = dataArray[2] === 'solicited';
      } else {
        throw new Error('Wrong format');
      }
    } else {
      throw new Error('Wrong format');
    }

    return result;
  }

  // gets the used device
  getDevice(data) {
    let dataArray = data.split(',');
    let result = false;

    if (dataArray.length > 4) {
      result = dataArray[3];
    } else {
      throw new Error('Wrong format');
    }

    return result;
  }

  // retrieves the count of words
  getWordCount(data) {
    let dataArray = data.split(',');
    let result = false;

    if (dataArray.length > 5) {
      let count = dataArray[4];

      if (/^[0-9]+ words$/.test(count)) {
        result = parseInt(/^[0-9]+/.exec(count)[0], 10);
      } else {
        throw new Error('Wrong format');
      }
    } else {
      throw new Error('Wrong format');
    }

    return result;
  }

  // retrieves the rating of the review
  getRating(data) {
    let dataArray = data.split(',');
    let result = false;

    if (dataArray.length === 6) {
      let stars = dataArray[5];

      if (/^[*]+$/.test(stars)) {
        result = stars.length;
      } else {
        throw new Error('Wrong format');
      }
    } else {
      throw new Error('Wrong format');
    }

    return result;
  }
}

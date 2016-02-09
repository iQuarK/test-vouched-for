/**
 * User: Class that represents a user that creates reviews
 **/

export class User {
  constructor(name) {
    if (name) {
      this.name = name;
    } else {
      throw new Error('A user must have a name');
    }

    this.devices = [];
    this.integrity = 100;
    this.ratings = [];
    this.burst = {
      minute: false,
      hour: false
    };
    this.timeLastReview = null;
  }

  /**
   * Increases the integrity, checking boundaries
   */
  increaseIntegrity(number) {
    this.integrity += number;

    if (this.integrity>100) {
      this.integrity = 100;  
    } else if(this.integrity<0) {
      this.integrity = 0;
    }

    return this.integrity;
  }
  /**
   * Gets the average of all ratings
   */
  ratingAverage() {
    let result = null;

    if (this.ratings.length>0) {
      let sum = 0;
      for (let rating of this.ratings) {
        sum += rating;
      }
      result = sum/this.ratings.length;
    }

    return result;
  }

  /**
   * Checks if the user has a device
   */
  hasDevice(device) {
    return this.devices.filter(function(item) {
      return item === device;
    }).length > 0;
  }

  /**
   * Checks if the user has a device, and stores that device if is unique
   */
  addDevice(device) {
    let result = false;

    if (!this.hasDevice(device)) {
      this.devices.push(device);
      result = true;
    }

    return result;
  }

  /**
   * Returns the score of the user
   **/
  getScore() {
    var message = '';

    // if the integrity is below 50% is deactivated
    if (this.integrity < 50) {
      message = `Alert: ${this.name} has been de-activated due to a low trusted review score`;
    } else {
      let integrity = (this.integrity>100)?100:this.integrity;

      message = `${this.name} has a trusted review of ${integrity}`;

      if (this.integrity < 70) {
        // if the integrity is below 70% it warns
        message = `Warning: ${message}`;
      } else {
        // else the user has a trusted review score
        message = `Info: ${message}`;
      }
    }

    return message;
  }  
}

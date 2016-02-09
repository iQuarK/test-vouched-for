var _require = require('../../.tmp/class/user.js');
var User = _require.User;

describe('Test User class', function() {
  var user,
      name = 'Frederik';

  beforeEach(function() {
    user = new User(name);
  });

  it('should initialise the user', function() {
    // User name
    expect(user.name).toBe(name);

    // User devices
    expect(user.devices.length).toBe(0);

    // User integrity
    expect(user.integrity).toBe(100);

    // User ratings
    expect(user.ratings.length).toBe(0);

    // User rating average
    expect(user.ratingAverage()).toBe(null);

    // User time of the last review
    expect(user.timeLastReview).toBe(null);

    // User flag for burst case
    expect(user.burst.minute).toBeFalsy();
    expect(user.burst.hour).toBeFalsy();
  });

  it('should increase the integrity, checking the boundaries', function() {
    expect(user.integrity).toBe(100);
    user.increaseIntegrity(5);
    expect(user.integrity).toBe(100);
    user.increaseIntegrity(-150);
    expect(user.integrity).toBe(0);
  });

  it('should get the rating average', function() {
    user.ratings.push(5);
    expect(user.ratingAverage()).toBe(5);
    user.ratings.push(3);
    expect(user.ratingAverage()).toBe(4);
  });

  it('should check if the user has a device', function() {
    var dev1 = 'Device1';

    expect(user.hasDevice(dev1)).toBeFalsy();

    user.devices.push(dev1);

    expect(user.hasDevice(dev1)).toBeTruthy();

  });

  it('should add a device if it does not exists', function() {
    var dev2 = 'Device2';

    expect(user.addDevice(dev2)).toBeTruthy();
    expect(user.devices.length).toBe(1);
    expect(user.addDevice(dev2)).toBeFalsy();
    expect(user.devices.length).toBe(1);

  });

  it('should throw an error if there is no user name when instantiating', function() {
    // User name
    expect(function() {
      new User();
    }).toThrow();
  });

  it('should return the current review score', function() {

    expect(user.getScore()).toBe('Info: '+name+' has a trusted review of 100');
    user.integrity = 70;
    expect(user.getScore()).toBe('Info: '+name+' has a trusted review of 70');
    user.integrity = 69;
    expect(user.getScore()).toBe('Warning: '+name+' has a trusted review of 69');
    user.integrity = 50;
    expect(user.getScore()).toBe('Warning: '+name+' has a trusted review of 50');
    user.integrity = 49;
    expect(user.getScore()).toBe('Alert: '+name+' has been de-activated due to a low trusted review score');

  });

  it('should show integrity no more than 100', function() {
    user.integrity = 105;
    expect(user.getScore()).toBe('Info: '+name+' has a trusted review of 100');
    
  });


});
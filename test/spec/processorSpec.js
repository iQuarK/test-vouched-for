var _require = require('../../.tmp/class/processor.js');
var Processor = _require.Processor;

describe('Test Processor class', function() {
  var processor,
      dataSamples = {
        five_star_solicited: '12th July 12:04,Jon,solicited,LB3‐TYU,50 words,*****',
        five_star_unsolicited: '13th July 12:04,Jon,unsolicited,LB355‐TYU,50 words,*****',
        five_star_unsolicited_2: '13th October 12:04,Jon,unsolicited,L355d‐TYU,50 words,*****',
        solicited: '15th October 12:04,Jon,solicited,L355c‐TYU,50 words,****',
        word_count_bigger_100: '12th July 14:04,Jon,unsolicited,LB32‐TYU,150 words,****',
        unsolicited: '12th July 16:05,Jon,unsolicited,KB3‐IKU,20 words,**',
        same_device: '2nd September 10:04,Jon,unsolicited,KB3‐IKU,50 words,****',
        same_date_time: '2nd September 10:04,Jon,unsolicited,AN9‐IPK,90 words,**',
        low_rating: '24nd September 10:04,Jon,unsolicited,AA9‐IPK,90 words,*',
        one_hour_after: '2nd September 11:04,Jon,unsolicited,AN19‐IPK,90 words,**',
        wrong_date1: '2nd Septembre 10:04,Jon,unsolicited,AN93‐IPK,90 words,**',
        wrong_date2: 'second Septembre 10:04,Jon,unsolaicited,AN91‐IPK,90 words,**',
        incomplete: '3rd September 10:04,Jon,monkey',
        wrong_word_count: '12th July 12:04,Jon,solicited,LB33‐TYU,50 wordz,*****',
        wrong_rating: '12th July 12:04,Jon,solicited,LB34‐TYU,50 wordz,++'
      },
      name = 'Jon';

  describe('Test internal methods', function() {
    beforeEach(function() {
      processor = new Processor();
    });

    it('should apply the singleton', function() {
      var processor1 = new Processor();

      expect(processor1).toBe(processor);
    });

    it('should get the name for a given data', function() {
      expect(processor.getName(dataSamples.five_star_solicited)).toBe('Jon');
    });

    it('should get the date for a given data', function() {
      // Date with only one number in the day
      expect(processor.getDate(dataSamples.same_date_time))
        .toEqual(new Date('2/September/2016 10:04'));

      // Date with two numbers in the day
      expect(processor.getDate(dataSamples.unsolicited))
        .toEqual(new Date('12/July/2016 16:05'));
    });

    it('should get the date for a given data', function() {
      expect(function() {
        processor.getDate(dataSamples.wrong_date);
      }).toThrow();
    });


    it('should identify if the review was solicited', function() {
      // solicited
      expect(processor.isSolicited(dataSamples.five_star_solicited))
        .toBeTruthy();

      // unsolicited
      expect(processor.isSolicited(dataSamples.unsolicited))
        .toBeFalsy();

      // must throw an error if the format is wrong
      expect(function() {
        processor.isSolicited(dataSamples.wrong_date2);
      }).toThrow();
    });


    it('should retrieve the device', function() {
      // solicited
      expect(processor.getDevice(dataSamples.five_star_solicited))
        .toBe('LB3‐TYU');

      // must throw an error if the format is wrong
      expect(function() {
        processor.getDevice(dataSamples.incomplete);
      }).toThrow();
    });

    it('should retrieve the count of words', function() {
      // solicited
      expect(processor.getWordCount(dataSamples.five_star_solicited))
        .toBe(50);

      // must throw an error if the format is wrong
      expect(function() {
        processor.getWordCount(dataSamples.incomplete);
      }).toThrow();

      // must throw an error if the format is wrong
      expect(function() {
        processor.getWordCount(dataSamples.wrong_word_count);
      }).toThrow();
    });

    it('should retrieve the rating', function() {
      // solicited
      expect(processor.getRating(dataSamples.five_star_solicited))
        .toBe(5);

      expect(processor.getRating(dataSamples.unsolicited))
        .toBe(2);

      // must throw an error if the format is wrong
      expect(function() {
        processor.getWordCount(dataSamples.incomplete);
      }).toThrow();

      // must throw an error if the format is wrong
      expect(function() {
        processor.getWordCount(dataSamples.wrong_rating);
      }).toThrow();
    });

  });

  describe('Test the processor', function() {
    beforeEach(function() {
      processor = new Processor();
      processor.users = {};
    });

    it('should not affect the score if word count < 100', function() {

      expect(processor.process(dataSamples.unsolicited))
        .toBe('Info: Jon has a trusted review of 100');
    });

    it('should remove 0.5 integrity if word count > 100', function() {

      expect(processor.process(dataSamples.word_count_bigger_100))
        .toBe('Info: Jon has a trusted review of 99.5');
    });

    it('should burst the user if there are two followed reviews in the same minute', function() {
      processor.process(dataSamples.same_device);
      expect(processor.users[name].burst.minute).toBeFalsy();
      expect(processor.users[name].integrity).toBe(100);

      processor.process(dataSamples.same_date_time);
      expect(processor.users[name].burst.minute).toBeTruthy();
      expect(processor.users[name].integrity).toBe(60);
      expect
    });

    it('should burst the user if there are two followed reviews in the same hour', function() {
      processor.process(dataSamples.same_device);
      expect(processor.users[name].burst.hour).toBeFalsy();
      expect(processor.users[name].integrity).toBe(100);

      processor.process(dataSamples.one_hour_after);
      expect(processor.users[name].burst.hour).toBeTruthy();
      expect(processor.users[name].integrity).toBe(80);
    });

    it('should knock 30% points each time the user repeats a device', function() {
      processor.process(dataSamples.unsolicited);
      expect(processor.users[name].integrity).toBe(100);

      processor.process(dataSamples.same_device);
      expect(processor.users[name].integrity).toBe(70);
    });

    it('should knock 2% points if 5-star, quadruple if average < 3.5', function() {

      processor.process(dataSamples.five_star_unsolicited);
      expect(processor.users[name].integrity).toBe(98);

      processor.process(dataSamples.same_date_time);
      processor.process(dataSamples.low_rating);
      expect(processor.users[name].integrity).toBe(98);

      processor.process(dataSamples.five_star_unsolicited_2);
      expect(processor.users[name].integrity).toBe(90);
    });

    it('should add 3% points the review was solicited', function() {

      processor.process(dataSamples.five_star_unsolicited_2);
      expect(processor.users[name].integrity).toBe(98);

      processor.process(dataSamples.solicited);
      expect(processor.users[name].integrity).toBe(100);
    });


    it('should return an error message if the data has a wrong format', function() {

      expect(processor.process(dataSamples.incomplete))
        .toEqual('Could not read review summary data');
    });
  });
});
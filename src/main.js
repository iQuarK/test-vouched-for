'use strict';

var {Processor} = require('./class/processor.js');

var processor = new Processor();

var data = [
  '12th July 12:04,Jon,solicited,LB3‐TYU,50 words,*****',
  '12th July 12:05,Jon,unsolicited,KB3‐IKU,20 words,**',
  '13th July 15:04,Jon,unsolicited,CY8‐IPK,150 words,***',
  '15th July 10:04,Jon,solicited,BB4‐IPK,40 words,*****',
  '15th July 15:09,Jon,monkey',
  '29th August 10:04,Jon,solicited,LX2‐IPK,70 words,****',
  '2nd September 10:04,Jon,solicited,KB3‐IKU,50 words,****',
  '2nd September 10:04,Jon,solicited,AN9‐IPK,90 words,**'
];

for (let d of data) {
  process.stdout.write(`${processor.process(d)}\n`);
}

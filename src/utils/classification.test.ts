/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { classifyPM25, classifyPSI } from './classification.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running updated air quality classification tests...');

// PM2.5 Boundary tests
// 0–55 is Green
assert(classifyPM25(0).colorName === 'green', '0 should be green');
assert(classifyPM25(25).colorName === 'green', '25 should be green');
assert(classifyPM25(55).colorName === 'green', '55 should be green');

// 56–150 is Yellow
assert(classifyPM25(56).colorName === 'yellow', '56 should be yellow');
assert(classifyPM25(100).colorName === 'yellow', '100 should be yellow');
assert(classifyPM25(150).colorName === 'yellow', '150 should be yellow');

// 151–250 is Orange (with 250+ Red)
assert(classifyPM25(151).colorName === 'orange', '151 should be orange');
assert(classifyPM25(200).colorName === 'orange', '200 should be orange');
assert(classifyPM25(249).colorName === 'orange', '249 should be orange');

// 250 and above is Red
assert(classifyPM25(250).colorName === 'red', '250 should be red');
assert(classifyPM25(251).colorName === 'red', '251 should be red');
assert(classifyPM25(300).colorName === 'red', '300 should be red');

// Missing / Invalid PM2.5
assert(classifyPM25(null).band === 'Unavailable', 'null should be Unavailable');
assert(classifyPM25(undefined).band === 'Unavailable', 'undefined should be Unavailable');

// 24-hr PSI Boundary tests
// 0–50 is Green
assert(classifyPSI(0).colorName === 'green', '0 should be green');
assert(classifyPSI(50).colorName === 'green', '50 should be green');

// 51–100 is Blue
assert(classifyPSI(51).colorName === 'blue', '51 should be blue');
assert(classifyPSI(100).colorName === 'blue', '100 should be blue');

// 101–200 is Yellow
assert(classifyPSI(101).colorName === 'yellow', '101 should be yellow');
assert(classifyPSI(200).colorName === 'yellow', '200 should be yellow');

// 201–300 is Orange
assert(classifyPSI(201).colorName === 'orange', '201 should be orange');
assert(classifyPSI(300).colorName === 'orange', '300 should be orange');

// 300 above is Red
assert(classifyPSI(301).colorName === 'red', '301 should be red');
assert(classifyPSI(400).colorName === 'red', '400 should be red');

console.log('All updated air quality classification tests passed successfully!');

/**
* Unit tests for Fable
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var libFable = require('../source/Fable.js');

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

suite
(
	'FableUtility',
	function()
	{
		var testFable = false;

		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Utility',
			function()
			{
				test
				(
					'Process Template like Underscore',
					function()
					{
						testFable = new libFable();
						let tmpTemplate = testFable.Utility.template('Something');
						Expect(tmpTemplate).to.be.a('function');
					}
				);
				test
				(
					'Processed Template like Underscore Work Without Variables',
					function()
					{
						testFable = new libFable();
						let tmpTemplate = testFable.Utility.template('Something');
						Expect(tmpTemplate).to.be.a('function');
						Expect(tmpTemplate()).to.equal('Something');
					}
				);
				test
				(
					'Processed Template like Underscore Work With Variables',
					function()
					{
						testFable = new libFable();
						let tmpTemplate = testFable.Utility.template('There are <%= Count %> things....');
						Expect(tmpTemplate).to.be.a('function');
						Expect(tmpTemplate({Count:1000})).to.equal('There are 1000 things....');
					}
				);
				test
				(
					'merging objects should work like old underscore did with 1 paramter',
					function()
					{
						testFable = new libFable();
						let tmpResult = testFable.Utility.extend({SomeValue:'here'});
						Expect(tmpResult).to.have.a.property('SomeValue')
							.that.is.a('string');
						Expect(tmpResult.SomeValue).to.equal('here')
					}
				);
				test
				(
					'merging objects should work like old underscore did with 2 paramter',
					function()
					{
						testFable = new libFable();
						let tmpResult = testFable.Utility.extend({SomeValue:'here',Size:10},{Color:'Red',Size:20});
						Expect(tmpResult).to.have.a.property('SomeValue')
							.that.is.a('string');
						Expect(tmpResult.SomeValue).to.equal('here');
						Expect(tmpResult.Color).to.equal('Red');
						Expect(tmpResult.Size).to.equal(20);
					}
				);
				test
				(
					'merging objects should work like old underscore did with more paramters',
					function()
					{
						testFable = new libFable();
						let tmpResult = testFable.Utility.extend(
							{SomeValue:'here',Size:10, Race:'Human'},
							{Color:'Red',Size:20, Band:'Metalocalypse'},
							{Name:'Bilbo', Size:15, Race:'Hobbit', Band:'The dead hobbitz'});
						Expect(tmpResult).to.have.a.property('SomeValue')
							.that.is.a('string');
						Expect(tmpResult.SomeValue).to.equal('here')
						Expect(tmpResult.Color).to.equal('Red');
						Expect(tmpResult.Band).to.equal('The dead hobbitz');
						Expect(tmpResult.Race).to.equal('Hobbit');
						Expect(tmpResult.Name).to.equal('Bilbo');
						Expect(tmpResult.Size).to.equal(15);
					}
				);
				test
				(
					'chunk should work like underscore',
					function()
					{
						testFable = new libFable();
						// These are *literally* the tests from underscore
						/* Here for posterity
						 *

						 *
						 */
						// Regular Expressions for easy conversion of underscore tests:
						// S: assert.deepEqual\(_.chunk\((.*)\), (.*), '
						// R: Expect(testFable.Utility.chunk($1)).to.deep.equal($2);   // $3
					    Expect(testFable.Utility.chunk([], 2)).to.deep.equal([]);   // chunk for empty array returns an empty array');

					    Expect(testFable.Utility.chunk([1, 2, 3], 0)).to.deep.equal([]);   // chunk into parts of 0 elements returns empty array');
					    Expect(testFable.Utility.chunk([1, 2, 3], -1)).to.deep.equal([]);   // chunk into parts of negative amount of elements returns an empty array');
					    Expect(testFable.Utility.chunk([1, 2, 3])).to.deep.equal([]);   // defaults to empty array (chunk size 0)');

					    Expect(testFable.Utility.chunk([1, 2, 3], 1)).to.deep.equal([[1], [2], [3]]);   // chunk into parts of 1 elements returns original array');

					    Expect(testFable.Utility.chunk([1, 2, 3], 3)).to.deep.equal([[1, 2, 3]]);   // chunk into parts of current array length elements returns the original array');
					    Expect(testFable.Utility.chunk([1, 2, 3], 5)).to.deep.equal([[1, 2, 3]]);   // chunk into parts of more then current array length elements returns the original array');

					    Expect(testFable.Utility.chunk([10, 20, 30, 40, 50, 60, 70], 2)).to.deep.equal([[10, 20], [30, 40], [50, 60], [70]]);   // chunk into parts of less then current array length elements');
					    Expect(testFable.Utility.chunk([10, 20, 30, 40, 50, 60, 70], 3)).to.deep.equal([[10, 20, 30], [40, 50, 60], [70]]);   // chunk into parts of less then current array length elements');
					});
			}
		);
	}
);
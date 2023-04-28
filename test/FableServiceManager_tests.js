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

class SimpleService extends libFable.ServiceProviderBase
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);

        this.serviceType = 'SimpleService';
    }

    doSomething()
    {
        this.fable.log.info(`SimpleService ${this.UUID}::${this.Hash} is doing something.`);
    }
}

class MockDatabaseService extends libFable.ServiceProviderBase
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);

        this.serviceType = 'MockDatabaseService';
    }

    connect()
    {
        this.fable.log.info(`MockDatabaseService ${this.UUID}::${this.Hash} is connecting to a database.`);
    }

    commit(pRecord)
    {
        this.fable.log.info(`MockDatabaseService ${this.UUID}::${this.Hash} is committing a record ${pRecord}.`);
    }
}

suite
(
	'Fable Service Manager',
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
			'Service Manager',
			function()
			{
				test
				(
					'Register a Service',
					function()
					{
						testFable = new libFable();
                        testFable.serviceManager.addServiceType('SimpleService');
                        testFable.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-123');

                        Expect(testFable.serviceManager.services['SimpleService']['SimpleService-123']).to.be.an('object');
					}
				);
				test
				(
					'Use the Default Service',
					function()
					{
						testFable = new libFable();
                        testFable.serviceManager.addServiceType('SimpleService', SimpleService);
                        testFable.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-123');

                        Expect(testFable.serviceManager.services['SimpleService']['SimpleService-123']).to.be.an('object');

                        Expect(testFable.serviceManager.defaultServices['SimpleService']).to.be.an('object');

                        testFable.serviceManager.defaultServices.SimpleService.doSomething();

                        Expect(testFable.serviceManager.defaultServices['SimpleService'].Hash).to.equal('SimpleService-123');
					}
				);
                test
                (
                    'Use the Default Service with a different hash',
                    function()
                    {
                        let testFable = new libFable({});

                        testFable.serviceManager.addServiceType('SimpleService', SimpleService);

                        testFable.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-13');

                        testFable.serviceManager.services['SimpleService']['SimpleService-13'].doSomething();

                        Expect(testFable.serviceManager.services['SimpleService']['SimpleService-13']).to.be.an('object');
                    }
                );

                test
                (
                    'Instantiate a service without registering it to Fable',
                    function()
                    {
                        let testFable = new libFable({});

                        testFable.serviceManager.addServiceType('SimpleService', SimpleService);

                        let tmpService = testFable.serviceManager.instantiateServiceProviderWithoutRegistration('SimpleService', {SomeOption: true}, 'SimpleService-99');

                        Expect(testFable.services.SimpleService['SimpleService-99']).to.be.an('undefined');

                        Expect(tmpService).to.be.an('object');
                    }
                );

                test
                (
                    'Change the default service provider',
                    function()
                    {
                        let testFable = new libFable({});

                        testFable.serviceManager.addServiceType('SimpleService', SimpleService);
                        testFable.serviceManager.addServiceType('DatabaseService', MockDatabaseService);

                        testFable.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true});
                        testFable.serviceManager.defaultServices.SimpleService.doSomething();

                        testFable.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'PrimaryConnection');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('PrimaryConnection');

                        testFable.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'SecondaryConnection');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('PrimaryConnection');

                        testFable.serviceManager.defaultServices.DatabaseService.connect();
                        testFable.serviceManager.defaultServices.DatabaseService.commit('Test Record');

                        testFable.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'SecondaryConnection');

                        testFable.serviceManager.defaultServices.DatabaseService.connect();
                        testFable.serviceManager.defaultServices.DatabaseService.commit('Another Test Record');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('SecondaryConnection');
                    }
                );

                test
                (
                    'Attempt to change the default service provider to a nonexistant provider',
                    function()
                    {
                        let testFable = new libFable({});

                        testFable.serviceManager.addServiceType('SimpleService', SimpleService);
                        testFable.serviceManager.addServiceType('DatabaseService', MockDatabaseService);

                        testFable.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true});
                        testFable.serviceManager.defaultServices.SimpleService.doSomething();

                        testFable.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'PrimaryConnection');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('PrimaryConnection');

                        testFable.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'SecondaryConnection');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('PrimaryConnection');

                        testFable.serviceManager.defaultServices.DatabaseService.connect();
                        testFable.serviceManager.defaultServices.DatabaseService.commit('Test Record');

                        Expect(testFable.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'TertiaryConnection')).to.be.false;

                        testFable.serviceManager.defaultServices.DatabaseService.connect();
                        testFable.serviceManager.defaultServices.DatabaseService.commit('Another Test Record');

                        Expect(testFable.serviceManager.defaultServices.DatabaseService.Hash).to.equal('PrimaryConnection');
                    }
                );
			}
		);
	}
);
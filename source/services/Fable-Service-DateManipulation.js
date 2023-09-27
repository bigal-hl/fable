const libFableServiceProviderBase = require('fable-serviceproviderbase');
/**
* Date management a la Moment using days.js
*
* @class DateManipulation
*/
class DateManipulation extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash)

		this.serviceType = 'Dates';

		this.dayJS = require('dayjs');

		// Include the `weekOfYear` plugin
		this.plugin_weekOfYear = require('dayjs/plugin/weekOfYear');
		this.dayJS.extend(this.plugin_weekOfYear);
		// Include the `weekday` plugin
		this.plugin_weekday = require('dayjs/plugin/weekday');
		this.dayJS.extend(this.plugin_weekday);
		// Include the `isoWeek` plugin
		this.plugin_isoWeek = require('dayjs/plugin/isoWeek');
		this.dayJS.extend(this.plugin_isoWeek);
		// Include the `timezone` plugin
		this.plugin_timezone = require('dayjs/plugin/timezone');
		this.dayJS.extend(this.plugin_timezone);
		// Include the `relativetime` plugin
		this.plugin_relativetime = require('dayjs/plugin/relativetime');
		this.dayJS.extend(this.plugin_relativetime);
		// Include the `utc` plugin
		this.plugin_utc = require('dayjs/plugin/utc');
		this.dayJS.extend(this.plugin_utc);
		// Include the `advancedFormat` plugin
		this.plugin_advancedFormat = require('dayjs/plugin/advancedFormat');
		this.dayJS.extend(this.plugin_advancedFormat);

		// A developer can include locales if they want
		// You would do the following:
		// const localeDE = require('dayjs/locale/de');
		// _Fable.Dates.dayJS.locale('de');
	}
}

module.exports = DateManipulation;
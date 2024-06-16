const libExpressionParserOperationBase = require('./Fable-Service-ExpressionParser-Base.js');

class ExpressionParserSolver extends libExpressionParserOperationBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'ExpressionParser-Solver';
	}

	solvePostfixedExpression(pPostfixedExpression, pDataDestinationObject, pResultObject, pManifest)
	{
		let tmpResults = (typeof(pResultObject) === 'object') ? pResultObject : { ExpressionParserLog: [] };

		let tmpManifest = (typeof(pManifest) === 'object') ? pManifest : this.fable.newManyfest();

		let tmpDataDestinationObject = (typeof(pDataDestinationObject) === 'object') ? pDataDestinationObject : {};

		// If there was a fable passed in (e.g. the results object was a service or such), we won't decorate
		let tmpPassedInFable = ('fable' in tmpResults);
		if (!tmpPassedInFable)
		{
			tmpResults.fable = this.fable;
		}

		if (!Array.isArray(pPostfixedExpression))
		{
			tmpResults.ExpressionParserLog.push(`ERROR: ExpressionParser.solvePostfixedExpression was passed a non-array postfixed expression.`);
			this.log.error(tmpResults.ExpressionParserLog[tmpResults.ExpressionParserLog.length-1]);
			return false;
		}
		if (pPostfixedExpression.length < 1)
		{
			tmpResults.ExpressionParserLog.push(`ERROR: ExpressionParser.solvePostfixedExpression was passed an empty postfixed expression.`);
			this.log.error(tmpResults.ExpressionParserLog[tmpResults.ExpressionParserLog.length-1]);
			return false;
		}

		// This is how the user communication magic happens.
		tmpResults.VirtualSymbols = {};

		for (let i = 0; i < pPostfixedExpression.length; i++)
		{
			if (pPostfixedExpression[i].Operation.Type === 'Token.SolverInstruction')
			{
				continue;
			}
			let tmpStepResultObject = { ExpressionStep: pPostfixedExpression[i], ExpressionStepIndex: i, ResultsObject: tmpResults, Manifest: tmpManifest};

			// Resolve the virtual symbols to their actual values
			if (tmpStepResultObject.ExpressionStep.LeftValue.Type === 'Token.VirtualSymbol')
			{
				tmpStepResultObject.ExpressionStep.LeftValue.Value = tmpManifest.getValueAtAddress(tmpResults.VirtualSymbols, tmpStepResultObject.ExpressionStep.LeftValue.Token);
			}
			if (tmpStepResultObject.ExpressionStep.RightValue.Type === 'Token.VirtualSymbol')
			{
				tmpStepResultObject.ExpressionStep.RightValue.Value = tmpManifest.getValueAtAddress(tmpResults.VirtualSymbols, tmpStepResultObject.ExpressionStep.RightValue.Token);
			}

			// Resolve the parenthesis to their actual values
			if (tmpStepResultObject.ExpressionStep.LeftValue.Type === 'Token.Parenthesis')
			{
				tmpStepResultObject.ExpressionStep.LeftValue.Value = tmpManifest.getValueAtAddress(tmpResults.VirtualSymbols, tmpStepResultObject.ExpressionStep.LeftValue.VirtualSymbolName);
			}
			if (tmpStepResultObject.ExpressionStep.RightValue.Type === 'Token.Parenthesis')
			{
				tmpStepResultObject.ExpressionStep.RightValue.Value = tmpManifest.getValueAtAddress(tmpResults.VirtualSymbols, tmpStepResultObject.ExpressionStep.RightValue.VirtualSymbolName);
			}

			// Virtual Constants
			if (tmpStepResultObject.ExpressionStep.LeftValue.Type === 'Token.Constant' && !('Value' in tmpStepResultObject.ExpressionStep.LeftValue))
			{
				tmpStepResultObject.ExpressionStep.LeftValue.Value = tmpStepResultObject.ExpressionStep.LeftValue.Token;
			}
			if (tmpStepResultObject.ExpressionStep.RightValue.Type === 'Token.Constant' && !('Value' in tmpStepResultObject.ExpressionStep.RightValue))
			{
				tmpStepResultObject.ExpressionStep.RightValue.Value = tmpStepResultObject.ExpressionStep.RightValue.Token;
			}

			if (tmpStepResultObject.ExpressionStep.Operation.Type = 'Operator')
			{
				// TODO: This can be optimized.   A lot.  If necessary.  Seems pretty fast honestly for even thousands of operations.  Slowest part is arbitrary precision.
				// An operator always has a left and right value.
				let tmpFunctionAddress = false;
				if (tmpStepResultObject.ExpressionStep.Operation.Token in this.ExpressionParser.tokenMap)
				{
					tmpFunctionAddress = `ResultsObject.${tmpStepResultObject.ExpressionStep.Operation.Descriptor.Function}`;
				}
				else if (tmpStepResultObject.ExpressionStep.Operation.Token.toLowerCase() in this.ExpressionParser.functionMap)
				{
					tmpFunctionAddress = `ResultsObject.${this.ExpressionParser.functionMap[tmpStepResultObject.ExpressionStep.Operation.Token.toLowerCase()].Address}`;
				}

				try
				{
					this.log.trace(`Solving Step ${i} [${tmpStepResultObject.ExpressionStep.VirtualSymbolName}] --> [${tmpStepResultObject.ExpressionStep.Operation.Token}]: ( ${tmpStepResultObject.ExpressionStep.LeftValue.Value} , ${tmpStepResultObject.ExpressionStep.RightValue.Value} )`);
					tmpResults.VirtualSymbols[tmpStepResultObject.ExpressionStep.VirtualSymbolName] = tmpManifest.getValueAtAddress(tmpStepResultObject, `${tmpFunctionAddress}(ExpressionStep.LeftValue.Value,ExpressionStep.RightValue.Value)`);
					this.log.trace(`   ---> Step ${i}: ${tmpResults.VirtualSymbols[tmpStepResultObject.ExpressionStep.VirtualSymbolName]}`)
				}
				catch (pError)
				{
					tmpResults.ExpressionParserLog.push(`ERROR: ExpressionParser.solvePostfixedExpression failed to solve step ${i} with function ${tmpStepResultObject.ExpressionStep.Operation.Token}: ${pError}`);
					this.log.error(tmpResults.ExpressionParserLog[tmpResults.ExpressionParserLog.length-1]);
					return false;
				}

				// Equations don't always solve in virtual symbol order.
				tmpResults.SolverFinalVirtualSymbol = tmpStepResultObject.ExpressionStep.VirtualSymbolName;
			}
		}

		let tmpSolverResultValue = tmpManifest.getValueAtAddress(tmpResults, `VirtualSymbols.${tmpResults.SolverFinalVirtualSymbol}`);

		// Now deal with final assignment
		for (let i = 0; i < pPostfixedExpression.length; i++)
		{
			if ((pPostfixedExpression[i].Operation.Type === 'Token.SolverInstruction') && (pPostfixedExpression[i].Operation.Token == 'Assign'))
			{
				tmpManifest.setValueAtAddress(tmpResults.VirtualSymbols, pPostfixedExpression[i].VirtualSymbolName, tmpSolverResultValue);
				tmpManifest.setValueByHash(tmpDataDestinationObject, pPostfixedExpression[i].VirtualSymbolName, tmpSolverResultValue);
			}

		}
		// Clean up the reference if we added it to the object.
		if (!tmpPassedInFable)
		{
			delete tmpResults.fable;
		}

		return tmpSolverResultValue.toString();
	}
}

module.exports = ExpressionParserSolver;

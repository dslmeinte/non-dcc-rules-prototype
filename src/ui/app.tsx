import React from "react"
import {useState} from "react"
import ReactJson from "react-json-view"

import {pretty, tryParse} from "../utils/json"
import {
    evaluateRules, prepareEvaluation,
    ResultsMap,
    RuleDependencies
} from "../engine/evaluator"
import {createSchemaValidator} from "../utils/schema-validator"
import useCases from "../cases/use-cases"


const ReactiveTextArea = ({ id, value, setter }: { id: string, value: string, setter: (newValue: string) => void }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const ResultsTable = ({ results, ruleDependencies }: { results: ResultsMap, ruleDependencies: RuleDependencies }) =>
    <table>
        <thead>
            <tr>
                <th style={{ width: "8em" }}>rule ID</th>
                <th>result</th>
                <th>dependencies</th>
            </tr>
        </thead>
        <tbody>
        {Object.entries(results)
            .map(([ ruleId, result ], index) =>
                <tr key={index}>
                    <td className="ID">{ruleId}</td>
                    <td className="tt">{pretty(result)}</td>
                    <td style={{ fontSize: "9pt" }}>{ruleDependencies[ruleId].map((depRuleId, index) =>
                        <span className="ID" key={index}>{depRuleId}&nbsp; </span>
                    )}</td>
                </tr>
            )
        }
        </tbody>
    </table>


export const App = () => {
    const params = new URLSearchParams(location.search)
    const useCaseIndex = params.get("useCase") ? parseInt(params.get("useCase")!, 10): 0

    const useCase = useCases[useCaseIndex]

    const now = new Date()
    const exampleData = useCase.exampleDataOn(now)
    const [dataAsText, setDataAsText] = useState(pretty(exampleData))

    const dataValidator = createSchemaValidator(useCase.inputDataSchema)

    const data = tryParse(dataAsText)
    const dataIsValid = !(data instanceof Error)
    const validationErrorMessages = dataIsValid
        ? dataValidator(data).filter((error) => error.message !== undefined).map((error) => `/${error.instancePath} ${error.message!}.`)
        : []
    const [ _, ruleDependencies, dependencyOrder ] = prepareEvaluation(useCase.rules, now)
    const rulesAreEvaluatable = dependencyOrder !== false
    const evaluation = dataIsValid && rulesAreEvaluatable && evaluateRules(useCase.rules, data, now)

    return <main>
        <h1>Non-DCC business rules tech demo</h1>
        <p>
            This mini-app is a tech demo for the <a href="https://webgate.ec.europa.eu/fpfis/wikis/display/eHN/Draft+proposal%3A+Non-DCC+business+rules" target="_blank">non-DCC business rules proposal</a><sup>*</sup> currently being drafted by the Taskforce Business Rules of the eHN.
            &nbsp;&nbsp;<small>*) Requires access to EU Confluence.</small>
        </p>
        <p>
            The following figure explains things succinctly.
        </p>
        <div className="centered">
            <img src="engine.svg" width={800} alt="engine framework" />
        </div>
        <div className="wrapper">
            <div>
                <span className="label">Business Rules</span>
                <p>
                    Use case: <em>{useCase.description}</em><br/>
                </p>
                <ReactJson
                    src={useCase.rules}
                    name={false}
                    style={{ fontSize: "9pt" }}
                    iconStyle={"square"}
                    collapsed={2}
                    // shouldCollapse={(fieldInfo) => { console.dir(fieldInfo); return false }}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    quotesOnKeys={false}
                    // displayArrayKey={false} <-- not implemented yet?
                    onEdit={(event) => { console.dir(event); return true }}
                    onAdd={(event) => { console.dir(event); return true }}
                    onDelete={(event) => { console.dir(event); return true }}
                />
                <p>
                    Unfold/expand the <span className="tt">rules</span> elements for details.
                </p>
            </div>
            <div>
                <span className="label">Explanation</span>
                <p>
                    Left is shown a set of rules defining an <em>automated decision-making</em> (ADM) process.
                </p>
                {useCase.explanation}
                <p>
                    These rules are defined according to a format that's specified through a JSON Schema + some additional additional constraints.
                    Each rule consists of an ID, an array of versions, and optionally a final valid-until date, and description.
                    Each rule version specifies a valid-from date, and a logical expression.
                    A rule version is applicable between its valid-from date and the next-earliest valid-from date from any of the other versions of the rule.
                </p>
                <p>
                    Rules can explicitly <em>depend</em> on each other.
                    They do that using an operation which has the following JSON format: <span className="tt">{`{`} "resultOf": [ &lt;<em>rule ID</em>&gt; ]{`}`}</span>.
                    A rule is not until evaluated when all rules it depends on are already evaluated.
                    To evaluate rules, a <em>dependency order</em> is determined.
                </p>
                <p>
                    Note that this format is not yet complete: in particular, specification of input data and result, and meta data concerning expected engine version is left out.
                </p>
            </div>
            <div>
                <span className="label">Input Data</span>
                <p>
                    The following Input Data in JSON format will be fed into the Rules Engine for evaluation:
                </p>
                <ReactiveTextArea id="data" value={dataAsText} setter={setDataAsText} />
                <p>
                    You can edit the Input Data freely: it will be validated and immediately, and the Result of the evaluation will be updated automatically as well.
                </p>
            </div>
            <div>
                <span className="label">Validation</span>
                <p>
                    The Input Data is validated against a JSON Schema that's specific to these rules.
                </p>
                <span className="label">Errors:</span>
                {dataIsValid
                    ? (validationErrorMessages.length === 0
                        ? <p className="green">(None.)</p>
                        : <ol>{validationErrorMessages.map((errorMessage, index) => <li  className="red" key={index}>{errorMessage}</li>)}</ol>
                    )
                    : <p className="red">Could not parse data text as JSON: <span className="tt">{data.message}</span>.</p>
                }
            </div>
            <div>
                <span className="label">Result</span>
                <p>
                    The result of the evaluation of the Business Rules against the Input Data above is as follows in tabular form:
                </p>
                {!dataIsValid && <p>(Did not run evaluation because input data didn't validate.)</p>}
                {dataIsValid && rulesAreEvaluatable && <ResultsTable results={evaluation as ResultsMap} ruleDependencies={ruleDependencies} />}
            </div>
            {dataIsValid && rulesAreEvaluatable &&
                <div>
                    <p>
                        In JSON format it would be:
                    </p>
                    <ReactJson
                        src={evaluation as object}
                        name={false}
                        style={{ fontSize: "12pt" }}
                    />
                    <p>
                        This JSON would then be processed further,
                        e.g. to show a message for every rule that evaluated to <span className="tt">false</span>,
                        and to show a ✅/❌ depending on the final result.
                    </p>
                    <p>
                        Note that the result is generated in dependency order.
                    </p>
                </div>
            }
        </div>
        <h2>Attribution</h2>
        <p>
            This mini-app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
            <br/>
            The source can be found in this GitHub repository: <a href="https://github.com/dslmeinte/dcc-encoding" target="_blank" className="tt">https://github.com/dslmeinte/non-dcc-rules-prototype</a>.
        </p>
    </main>
}


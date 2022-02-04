import React from "react"
import {useState} from "react"
import ReactJson from "react-json-view"

import {pretty, tryParse} from "../utils/json"
import {evaluateRules, ResultsMap} from "../engine/evaluator"
import {createSchemaValidator} from "../utils/schema-validator"


const ReactiveTextArea = ({ id, value, setter }: { id: string, value: string, setter: (newValue: string) => void }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const ResultsTable = ({ results }: { results: ResultsMap }) =>
    <table>
        <thead>
            <tr>
                <th>rule ID</th>
                <th>result</th>
            </tr>
        </thead>
        <tbody>
        {Object.entries(results)
            .map(([ ruleId, result ], index) =>
                <tr key={index}>
                    <td className="tt">{ruleId}</td>
                    <td className="tt">{pretty(result)}</td>
                </tr>
            )
        }
        </tbody>
    </table>


export const App = () => {
    const rules = require("../cases/NL-border-customs/rules.json")

    const now = new Date()
    const exampleData = require("../cases/NL-border-customs/example-data.json")
    exampleData.external.validationClock = now.toISOString()
    const [dataAsText, setDataAsText] = useState(pretty(exampleData))

    const dataValidator = createSchemaValidator(require("../cases/NL-border-customs/data.schema.json"))

    const data = tryParse(dataAsText)
    const dataIsValid = !(data instanceof Error)
    const validationErrorMessages = dataIsValid
        ? dataValidator(data).filter((error) => error.message !== undefined).map((error) => error.message!)
        : []
    // TODO  (improve types...)
    const evaluation = dataIsValid && evaluateRules(rules, data, now)   // assume non-cyclicity of rules' dependency graph

    return <main>
        <h1>Non-DCC business rules tech demo</h1>
        <p>
            This mini-app is a tech demo for the non-DCC business rules proposal currently being drafted by the Taskforce Business Rules of the eHN.
        </p>
        <p>
            The following figure explains things succinctly.
        </p>
        <div style={{ textAlign: "center" }}>
            <img src="engine.svg" width={800} alt="engine framework" />
        </div>
        <div className="wrapper">
            <div>
                <span className="label">Rules</span>
                <p>
                    Use case: <em>(NL) custom border rules</em><br/>
                </p>
                <ReactJson
                    src={rules}
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
                    Unfold/expand the rules for details.
                </p>
            </div>
            <div>
                <span className="label">Explanation</span>
                <p>
                    Left is shown a set of rules defining an <em>automated decision-making</em> (ADM) process.
                </p>
                <p>
                    The rules with IDs <span className="ID">color</span>, and <span className="ID">is_EU</span> inspect the value of the field <span className="ID">external.countryCode</span>, which is the code for the country of departure.
                    The results of these two rules are then used by the rules <span className="ID">CR-0001</span>&hellip;<span className="ID">CR-0010</span> which each produce <span className="ID">true/false</span>.
                    (There is no rule <span className="ID">CR-0008</span>.)
                    Finally, the rule <span className="ID">CR-combined</span> combines the results of the rules <span className="ID">CR-0001</span>&hellip;<span className="ID">CR-0010</span> by computing whether these all produced a <span className="ID">true</span> value.
                </p>
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
                <span className="label">Input data to rules</span>
                <ReactiveTextArea id="data" value={dataAsText} setter={setDataAsText} />
            </div>
            <div>
                <span className="label">Validation</span>
                <p>
                    The input data is validated against a JSON Schema that's specific to these rules.
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
                <span className="label">Evaluation result</span>
                {dataIsValid
                    ? <ResultsTable results={evaluation as ResultsMap} />
                    : <p>(Did not run evaluation because input data didn't validate.)</p>}
                <span>(Verification timestamp: <em>{now.toISOString()}</em>)</span>
            </div>
        </div>
        <h2>Attribution</h2>
        <p>
            This mini-app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
            <br/>
            The source can be found in this GitHub repository: <a href="https://github.com/dslmeinte/dcc-encoding" target="_blank" className="tt">https://github.com/dslmeinte/non-dcc-rules-prototype</a>.
        </p>
    </main>
}


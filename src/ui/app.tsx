import React from "react"
import {useState} from "react"

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
    const evaluation = dataIsValid && evaluateRules(rules, data, now) as ResultsMap // assume non-cyclicity of rules' dependency graph

    return <main>
        <h1>Prototype non-DCC-rules</h1>
        <div className="wrapper">
            <div>
                <span className="label">Input data to rules</span>
                <ReactiveTextArea id="data" value={dataAsText} setter={setDataAsText} />
                <span>(Verification timestamp: <em>{now.toISOString()}</em>)</span>
            </div>
            <div>
                <span className="label">Validation errors</span>
                {dataIsValid
                    ? (validationErrorMessages.length === 0
                        ? <p>(None.)</p>
                        : <ol>{validationErrorMessages.map((errorMessage, index) => <li key={index}>{errorMessage}</li>)}</ol>
                    )
                    : <p>Could not parse data text as JSON: <span className="tt">{data.message}</span>.</p>
                }
            </div>
            <div>
                <span className="label">Evaluation result</span>
                {dataIsValid
                    ? <ResultsTable results={evaluation as ResultsMap} />
                    : <p>(Did not run evaluation because expression is not valid.)</p>}
            </div>
        </div>
        <p>
            This mini-app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
            <br/>
            The source can be found in this GitHub repository: <a href="https://github.com/dslmeinte/dcc-encoding" target="_blank" className="tt">https://github.com/dslmeinte/non-dcc-rules-prototype</a>.
        </p>
    </main>
}


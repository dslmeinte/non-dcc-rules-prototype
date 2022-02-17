import React, {useState} from "react"
import ReactJson from "react-json-view"

import {evaluateRules, Evaluation, RuleEvaluation} from "../engine/evaluator"
import {insertReferenceData} from "../engine/reference-data"
import {asResultsMap, renderAsCompactText} from "../engine/resultOf-utils"
import {Rules} from "../engine/types"
import {createSchemaValidator, pretty, tryParse} from "../utils/json"
import useCases from "../cases/use-cases"


const ReactiveTextArea = ({ id, value, setter }: { id: string, value: string, setter: (newValue: string) => void }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const explanationFor = ({ rule, indexOfApplicableVersion }: RuleEvaluation): string =>
    `logic: ${renderAsCompactText(rule.versions[indexOfApplicableVersion].logic)}
index of applicable version: ${indexOfApplicableVersion}
`

const ResultsTable = ({ evaluation }: { evaluation: Evaluation & object }) =>
    <table>
        <thead>
            <tr>
                <th style={{ width: "10em" }}>rule ID</th>
                {/*<th style={{ width: "2em" }}>index</th>*/}
                <th>result</th>
                <th>dependencies</th>
            </tr>
        </thead>
        <tbody>
        {evaluation.map((ruleEval, index) =>
            <tr key={index}>
                <td className="ID"><span title={explanationFor(ruleEval)}>{ruleEval.rule.id}</span></td>
                {/*<td>{ruleEval.indexOfApplicableVersion}</td>*/}
                <td className="tt">{`${ruleEval.result}`}</td>
                <td style={{ fontSize: "9pt" }}>{ruleEval.dependencies.map((depRuleId, index) =>
                    <span className="ID" key={index}>{depRuleId}&nbsp; </span>
                )}</td>
            </tr>
        )}
        </tbody>
    </table>


const tryParseAsDate = (dateStr: string, defaultDateStr: string): Date => {
    try {
        const date = new Date(dateStr)
        return date
    } catch (e) {
        return new Date(defaultDateStr)
    }
}

const evaluateRulesSafely = (rules: Rules, verificationTimestamp: Date, data: any): Evaluation => {
    try {
        return evaluateRules(rules, verificationTimestamp, data)
    } catch (e) {
        console.dir(e)
        return false
    }
}

export const App = () => {
    const params = new URLSearchParams(location.search)
    const useCaseIndex = params.get("useCase") ? parseInt(params.get("useCase")!, 10): 0
    const useCase = useCases[useCaseIndex]
    const { rules } = useCase

    const nowStr = new Date().toISOString()
    const [verificationTimestampAsText, setVerificationTimestampAsText] = useState(nowStr)
    const verificationTimestamp = tryParseAsDate(verificationTimestampAsText, nowStr)

    const exampleData = useCase.exampleDataOn(verificationTimestamp)
    const [dataAsText, setDataAsText] = useState(pretty(exampleData))

    const dataValidator = createSchemaValidator(useCase.inputDataSchema)

    const data = tryParse(dataAsText)
    const dataIsValid = !(data instanceof Error)
    const validationErrorMessages = dataIsValid
        ? dataValidator(data).filter((error) => error.message !== undefined).map((error) => `/${error.instancePath} ${error.message!}.`)
        : []
    const evaluation = dataIsValid && evaluateRulesSafely(rules, verificationTimestamp, data)
    const rulesAreEvaluatable = evaluation !== false

    const hasReferenceData = rules.referenceDataSlots.length > 0
    const referenceData = insertReferenceData({}, rules.referenceDataSlots, verificationTimestamp)

    const [plainJson, setPlainJson] = useState(false)

    return <main>
        <h1>Non-DCC business rules tech demo</h1>
        <p>
            This mini-app is a tech demo for the <a href="https://webgate.ec.europa.eu/fpfis/wikis/display/eHN/Draft+proposal%3A+Non-DCC+business+rules" target="_blank">non-DCC business rules proposal</a><sup>*</sup> currently being drafted by the Taskforce Business Rules of the eHN.
            &nbsp;&nbsp;<small>*) Requires access to EU Confluence.</small>
            See also <a href="#architecture">the architecture section</a> below.
        </p>
        <div className="wrapper">
            <div>
                <span className="label">Business Rules</span>
                <p>
                    Use case:&nbsp;
                    <select
                        value={useCaseIndex}
                        onChange={(event) => {
                            location.href = `${location.pathname}?useCase=${(parseInt(event.target.value, 10))}` }}
                    >
                        {useCases.map((useCase, index) =>
                            <option value={index} key={index}>{useCase.description}</option>
                        )}
                    </select>
                </p>
                <div className="switch-container">
                    <span>JSON style: <em>fancy</em></span>
                    <label className="switch" htmlFor="jsonStyleSelection">
                        <input type="checkbox" id="jsonStyleSelection" onChange={(event) => { setPlainJson(event.target.checked) }} />
                        <div className="slider round"></div>
                    </label>
                    <span><em>plain</em></span>
                </div>
                {plainJson
                    ? <pre>{pretty(rules)}</pre>
                    : <ReactJson
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
                }
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
                <label>
                    Verification timestamp:
                    <input className="timestamp-input" value={verificationTimestampAsText} onChange={(event) => { setVerificationTimestampAsText(event.target.value) }} />
                </label>
                <p>
                    &#x2757; The Input Data isn't automatically updated with this verification timestamp.
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
                {!dataIsValid && <p>(Did not run evaluation because the Input Data didn't validate.)</p>}
                {!rulesAreEvaluatable && <p>(Did not run evaluation because the Business Rules have a cyclic dependency, or evaluation had a runtime problem.)</p>}
                {dataIsValid && rulesAreEvaluatable && <div>
                    <p>
                        The result of the evaluation of the Business Rules against the Input Data above is as follows in tabular form:
                    </p>
                    <ResultsTable evaluation={evaluation} />
                    <p>
                        Hover over a rule ID in the first column to see a compact, textual rendering of the CertLogic expression of the applicable version for the rule with that rule ID.
                        The syntax “<span className="tt">@("<em>&lt;rule ID&gt;</em>")</span>” means “result of rule with ID <em>&lt;rule ID&gt;</em>”.
                    </p>
                </div>}
            </div>
            {(dataIsValid && rulesAreEvaluatable)
                ? <div>
                    <p>
                        In JSON format it would be:
                    </p>
                    <ReactJson
                        src={asResultsMap(evaluation)}
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
                : <div></div>
            }

            <div>
                <span className="label">Reference Data</span>
                {hasReferenceData
                    ? <div>
                        <p>
                            The following reference data was added to the Input Data, right before evaluation.
                        </p>
                        <ReactJson
                            src={referenceData}
                            name={false}
                            style={{fontSize: "12pt"}}
                            collapsed={2 /* TODO  make dependent on nesting depth / min(#fragments of all ref data slot paths) */}
                        />
                    </div>
                    : <p>
                        The rules of this use case don't specify any reference data.
                    </p>
                }
            </div>
            <div>
                <span className="label">Explanation</span>
                <p>
                    For many use cases, it's useful to be able to inspect reference data from the business rules' logical expressions.
                    This helps to avoid “hard-coding” values in those expressions.
                    A set of rules can specify <em>slots</em> of reference data, consisting of a path at which that value is inserted into the Input Data, and a number of <em>versions</em>.
                    Each version consists of a value (JSON), and a validity range (valid from - valid to / indefinitely).
                </p>
            </div>
        </div>

        <h2 id="architecture">Architecture</h2>
        <p>
            The following figure explains things succinctly.
        </p>
        <div>
            <img src="engine.svg" width={600} alt="engine framework" />
        </div>
        <h2>Attribution</h2>
        <p>
            This mini-app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
            <br/>
            The source can be found in this GitHub repository: <a href="https://github.com/dslmeinte/dcc-encoding" target="_blank" className="tt">https://github.com/dslmeinte/non-dcc-rules-prototype</a>.
        </p>
    </main>
}


import React from "react"


export const App = () => {
    const params = new URLSearchParams(location.search)

    return <main>
        <h1>Prototype non-DCC-rules</h1>
        <h2>Explanation</h2>
        <p>
            &hellip;
        </p>
        <h3>Disclaimer</h3>
        <p>
            This prototype is for internal development purposes only.
            No rights can be derived from it.
        </p>
        <p>
            This mini-app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
            <br/>
            The source can be found in this GitHub repository: <a href="https://github.com/dslmeinte/dcc-encoding" target="_blank" className="tt">https://github.com/dslmeinte/non-dcc-rules-prototype</a>.
        </p>
    </main>
}


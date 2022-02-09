# TODOs


## Tech demo

* &#10003; Better, domain-**a**specific example.
* &#10003; Switch between “fancy” and plain JSON.
* &#10003; Use a drop-down selection for the use cases.
* &#10003; Show compact notation of each rule's `logic` &lArr; requires some restructuring of the result.
* &#10003; Show figure lower (and smaller).
* &#10003; Fix switching not working: just redirect completely (for now).
* &#10003; Implement reference data inclusion (“value sets”).
    * &#10003; Use that to encode what countries are EU MS in NL custom border rules use case.
* Describe how to use the framework for a number of use cases (with Vincent). E.g.:
    * Verifier app.
    * Entry portal, with interactive questionnaires.
* Gather Passenger Locator Forms of ~6 EU MS (BE, FR, DE, IT), and analyse ~3-4 of these.
* Add more structure to result, e.g., meta data, rule evaluations.
* Publish JSON schemas (somehow).
* Validate all schemas as JSON schemas.
* Validate result against JSON schema.
* Mention “**JSON** Schema” explicitly in figures? Maybe just “Input Data/Result specification”?


## Future work

* Make fault explicit, also in result.
* What about dependencies that are effectively conditional on values?
  * &rArr; fix-point process using abstract interpretation?
* Formulate a final result? Or just stick with separate rule evaluations.
* Extract framework of tech demo, and move to separate eHN-repo.
* Attributes typically necessary for non-DCC BRs:
    * age
    * purpose of travel
    * citizen (/resident)
    * (risk) colour
* Use object algebras (and fancy TS types) to improve extensibility of CertLogic?


## Reach out

* &#10003; Belgium
* JRC:
	* How to help their process? E.g. by notifying of a change in the BRs published on EU DCC Gateway?
		* Implement GitHub action to perform build script in a branch?
	* Contacts:
		* functional mailbox: `JRC-REOPEN-EU@ec.europa.eu`
		* Elisa Bazzani
		* Davide Auteri (gezien)


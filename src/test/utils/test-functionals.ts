const {deepEqual} = require("chai").assert

import {reverse, sortBy} from "../../utils/functional"


describe("sortBy", () => {

    it("works on integers", () => {
        deepEqual(
            sortBy([ 4, 1, 3, 5, 2 ], (n) => n),
            [ 1, 2, 3, 4, 5 ]
        )
    })

    it("works on dates", () => {
        const arr = [ "2019-02-13", "2017-04-02", "2015-09-15", "1979-12-10", "1977-05-04" ]    // is in reverse order
        deepEqual(
            sortBy(arr, (str) => new Date(str).getTime()),
            reverse(arr)
        )
    })

})


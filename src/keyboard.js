const kb = require("./keyboardButtons");


module.exports = {
    home: [
        [kb.record, kb.home.Procedurs, kb.BusyDates],
        [kb.Cb]
    ],
    procedurs: [
        [kb.procedurs.pedecur, kb.procedurs.manicur, kb.procedurs.podoView],
        [kb.Cb],
        [kb.procedursBack]
    ],
    back: [
        [kb.back]
    ],
    allProcedurs: [
        [kb.record, kb.procedursBack],
        [kb.Cb]
    ],
    spisokProcedur: [
        [kb.spisokProcedur, kb.BusyDates],
        [kb.back]
    ],
    afterSpisokProcedur: [
        [kb.Cb], 
        [kb.back]
    ],
    busyDate: [
        [kb.procedurs],
        [kb.back, kb.Cb]
    ]
}
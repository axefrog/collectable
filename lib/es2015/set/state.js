"use strict";
const ownership_1 = require("../shared/ownership");
const functions_1 = require("../shared/functions");
class SetState {
    constructor(values, owner, group) {
        this.values = values;
        this.owner = owner;
        this.group = group;
    }
}
exports.SetState = SetState;
function cloneState(state, mutable = false) {
    return {
        values: new Set(state.values),
        owner: mutable ? ownership_1.batch.owner || -1 : 0,
        group: ownership_1.nextId()
    };
}
exports.cloneState = cloneState;
function createState(values) {
    return new SetState(functions_1.isDefined(values) ? new Set(values) : new Set(), ownership_1.nextId(), ownership_1.batch.owner);
}
exports.createState = createState;
function emptyState() {
    return _empty;
}
exports.emptyState = emptyState;
const _empty = createState();

//# sourceMappingURL=state.js.map
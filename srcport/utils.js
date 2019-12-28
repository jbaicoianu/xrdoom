export function globalize(defs) {
    for (var k in defs) {
        self[k] = defs[k];
    }
}

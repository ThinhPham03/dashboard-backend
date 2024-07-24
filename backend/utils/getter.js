const getPositionLine = (accountId) => {
    if (accountId.length >= 9) {
        return `LEFT(tp.MEDREP ,${accountId.length})`;
    } else if (accountId.length >= 6) {
        return "LEFT(tp.ASM ,6)";
    } else if (accountId.length >= 3) {
        return "tp.`T. Business Unit`";
    }
}

module.exports = { getPositionLine };
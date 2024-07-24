const salesModel = require('../models/salesModel');
const accountModel = require('../models/accountModel');

class SalesController {
    async getPages(req, res) {
        const accountId = req.accountId;
        let { query } = req.query;
        if (!query) { query = "" }

        try {
            const salesReport = await salesModel.getPages(query, accountId);
            res.status(200).json(salesReport);
        } catch (error) {
            console.log(error);
        }
    }

    async getReport(req, res) {
        const accountId = req.accountId;
        let { page, query } = req.query;
        if (!query) { query = "" }
        if (!page) { page = 1 }

        try {
            const salesReport = await salesModel.getReport(query, page, accountId);
            res.status(200).json(salesReport);
        } catch (error) {
            console.log(error);
        }
    }

    async getExportData(req, res) {
        const accountId = req.accountId;
        let { query } = req.query;
        if (!query) { query = "" }

        try {
            const salesReport = await salesModel.getExportData(query, accountId);
            res.status(200).json(salesReport);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new SalesController();
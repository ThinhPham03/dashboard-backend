const database = require('../config/database');
const { getPositionLine } = require('../utils/getter');
const ITEMS_PER_PAGE = 1000;

class Sales {
  constructor() {
    this.database = database;
  }

  async getPages(query, accountId) {
    let subQuery = "";
    if (accountId != "COO") {
      subQuery = `AND ${getPositionLine(accountId)} = ?`;
    }

    const sql = `
      SELECT COUNT(*) as count 
      FROM tbl_thisperioddata tp
      LEFT JOIN tbl_thisperioddata pp ON 
        tp.` + "`T. Product Id`" + ` = pp.` + "`T. Product Id`" + ` AND
        tp.` + "`T. Customer Id`" + ` = pp.` + "`T. Customer Id`" + ` AND
        DATE_FORMAT(tp.` + "`T. Month`" + `, '%Y%m') = DATE_FORMAT(DATE_SUB(pp.` + "`T. Month`" + `, INTERVAL 12 MONTH), '%Y%m')
      WHERE
        (
          LOWER(tp.` + "`T. Product Name`" + `) LIKE LOWER("%" ? "%") OR
          LOWER(tp.` + "`T. Customer Name`" + `) LIKE LOWER("%" ? "%")
        ) ${subQuery}
    `;

    const [salesReports] = await this.database.query(sql, [query, query, accountId]);
    const totalPages = Math.ceil(salesReports.count / ITEMS_PER_PAGE);
    if (totalPages == 0) {
      return 1;
    }
    return totalPages;
  }

  async getReport(query, currentPage, accountId) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    let subQuery = "";
    let inputData = [query, query, ITEMS_PER_PAGE, offset];
    if (accountId != "COO") {
      subQuery = `AND ${getPositionLine(accountId)} = ?`;
      inputData = [query, query, accountId, ITEMS_PER_PAGE, offset];
    }


    const sql = `
      SELECT 
        tp.`+ "`ALL`" + `,
        YEAR(tp.`+ "`T. Month`) AS `Year`" + `,
        MONTH(tp.`+ "`T. Month`) AS `Month`" + `,
        tp.` + "`T. Product Id` AS `Product Id`" + `,
        tp.` + "`T. Product Name` AS `Product Name`" + `,
        tp.` + "`T. Customer Id` AS `Customer Id`" + `,
        tp.` + "`T. Customer Name` AS `Customer Name`" + `,

        COALESCE(tp.` + "`Sales Unit`, 0) AS `Sales Unit`" + `,
        COALESCE(tp.` + "`Sales Value`, 0) AS `Sales Value`" + `,
        ROUND(COALESCE(tp.` + "`Sales Value`/ tp.`Sales Unit`, 0), 2) AS `Sales Price`" + `,

        COALESCE(tp.` + "`Target Unit`, 0) AS `Target Unit`" + `,
        COALESCE(tp.` + "`Target Value`, 0) AS `Target Value`" + `,
        ROUND(COALESCE(tp.` + "`Target Value`/ tp.`Target Unit`, 0), 2) AS `Target Price`" + `,

        COALESCE(tp.` + "`Calls`, 0) AS `Calls`" + `,

        COALESCE(pp.` + "`Sales Unit`, 0) AS `LY Sales Unit`" + `,
        COALESCE(pp.` + "`Sales Value`, 0) AS `LY Sales Value`" + `,
        ROUND(COALESCE(pp.` + "`Sales Value`/ pp.`Sales Unit`, 0), 2) AS `LY Sales Price`" + `,

        COALESCE(pp.` + "`Target Unit`, 0) AS `LY Target Unit`" + `, 
        COALESCE(pp.` + "`Target Value`, 0) AS `LY Target Value`" + `,
        ROUND(COALESCE(pp.` + "`Target Value`/ tp.`Target Unit`, 0), 2) AS `LY Target Price`" + `,

        COALESCE(pp.` + "`Calls`, 0) AS `LY Calls`" + `
      FROM tbl_thisperioddata tp
      LEFT JOIN tbl_thisperioddata pp ON 
        tp.` + "`T. Product Id`" + ` = pp.` + "`T. Product Id`" + ` AND
        tp.` + "`T. Customer Id`" + ` = pp.` + "`T. Customer Id`" + ` AND
        DATE_FORMAT(tp.` + "`T. Month`" + `, '%Y%m') = DATE_FORMAT(DATE_SUB(pp.` + "`T. Month`" + `, INTERVAL 12 MONTH), '%Y%m')
      WHERE
        (
          LOWER(tp.` + "`T. Product Name`" + `) LIKE LOWER("%" ? "%") OR
          LOWER(tp.` + "`T. Customer Name`" + `) LIKE LOWER("%" ? "%")
        ) ${subQuery}
      LIMIT ? OFFSET ?;
    `;

    const data = await this.database.query(sql, inputData);
    return data;
  }

  async getExportData(query, accountId) {
    let subQuery = "";
    if (accountId != "COO") {
      subQuery = `AND ${getPositionLine(accountId)} = ?`;
    }

    const sql = `
      SELECT 
        tp.`+ "`ALL`" + `,
        YEAR(tp.`+ "`T. Month`) AS `Year`" + `,
        MONTH(tp.`+ "`T. Month`) AS `Month`" + `,
        tp.` + "`T. Product Id` AS `Product Id`" + `,
        tp.` + "`T. Product Name` AS `Product Name`" + `,
        tp.` + "`T. Customer Id` AS `Customer Id`" + `,
        tp.` + "`T. Customer Name` AS `Customer Name`" + `,

        COALESCE(tp.` + "`Sales Unit`, 0) AS `Sales Unit`" + `,
        COALESCE(tp.` + "`Sales Value`, 0) AS `Sales Value`" + `,
        ROUND(COALESCE(tp.` + "`Sales Value`/ tp.`Sales Unit`, 0), 2) AS `Sales Price`" + `,

        COALESCE(tp.` + "`Target Unit`, 0) AS `Target Unit`" + `,
        COALESCE(tp.` + "`Target Value`, 0) AS `Target Value`" + `,
        ROUND(COALESCE(tp.` + "`Target Value`/ tp.`Target Unit`, 0), 2) AS `Target Price`" + `,

        COALESCE(tp.` + "`Calls`, 0) AS `Calls`" + `,

        COALESCE(pp.` + "`Sales Unit`, 0) AS `LY Sales Unit`" + `,
        COALESCE(pp.` + "`Sales Value`, 0) AS `LY Sales Value`" + `,
        ROUND(COALESCE(pp.` + "`Sales Value`/ pp.`Sales Unit`, 0), 2) AS `LY Sales Price`" + `,

        COALESCE(pp.` + "`Target Unit`, 0) AS `LY Target Unit`" + `, 
        COALESCE(pp.` + "`Target Value`, 0) AS `LY Target Value`" + `,
        ROUND(COALESCE(pp.` + "`Target Value`/ tp.`Target Unit`, 0), 2) AS `LY Target Price`" + `,

        COALESCE(pp.` + "`Calls`, 0) AS `LY Calls`" + `
      FROM tbl_thisperioddata tp
      LEFT JOIN tbl_thisperioddata pp ON 
        tp.` + "`T. Product Id`" + ` = pp.` + "`T. Product Id`" + ` AND
        tp.` + "`T. Customer Id`" + ` = pp.` + "`T. Customer Id`" + ` AND
        DATE_FORMAT(tp.` + "`T. Month`" + `, '%Y%m') = DATE_FORMAT(DATE_SUB(pp.` + "`T. Month`" + `, INTERVAL 12 MONTH), '%Y%m')
      WHERE
        (
          LOWER(tp.` + "`T. Product Name`" + `) LIKE LOWER("%" ? "%") OR
          LOWER(tp.` + "`T. Customer Name`" + `) LIKE LOWER("%" ? "%")
        ) ${subQuery};
    `;

    const data = await this.database.query(sql, [query, query, accountId]);
    return data;
  }
}

module.exports = new Sales();
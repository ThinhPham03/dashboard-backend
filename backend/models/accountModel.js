const bcrypt = require('bcrypt');
const database = require('../config/database');
const ITEMS_PER_PAGE = 10;
const { getPositionLine } = require('../utils/getter');

class Account {
  constructor() {
    this.database = database;
  }

  async authenticateLogin(accountData) {
    const { userName, password } = accountData;
    const sql = 'SELECT * FROM tbl_account_staff WHERE tedisPositionId = ? AND loginActive = 1';
    const [account] = await this.database.query(sql, [userName]);

    if (!account) {
      return -1; //User does not exist
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return 0; //Incorrect password
    }
    return account;
  }

  async rememberToken(accountId, token) {
    const sql = 'UPDATE tbl_account_staff SET remember_token = ? WHERE tedisPositionId = ? AND loginActive = 1';
    const result = await this.database.query(sql, [token, accountId]);
    return result.affectedRows;
  }

  async authenticateToken(accountId, token) {
    const sql = 'SELECT remember_token FROM tbl_account_staff WHERE tedisPositionId = ? AND loginActive = 1';
    const [account] = await this.database.query(sql, [accountId]);
    if (!account || !account.remember_token) {
      return -1; //Remember token does not exist
    }

    if (token !== account.remember_token) {
      return 0; //Incorrect token
    }

    return 1;
  }

  async logout(accountId) {
    const sql = 'UPDATE tbl_account_staff SET remember_token = ? WHERE tedisPositionId = ?';
    const result = await this.database.query(sql, [null, accountId]);
    return result.affectedRows;
  }

  async create(accountId, createAccountId) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const sql = 'INSERT INTO tbl_account_staff (tedisPositionId, password, personCreated) VALUES (?, ?, ?)';
    const result = await this.database.query(sql, [createAccountId, hashedPassword, accountId]);
    return result.insertId;
  }

  async resetPassword(accountId, resetAccountId) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const sql = 'UPDATE tbl_account_staff SET password = ?, remember_token = ?, personUpdated = ? WHERE tedisPositionId = ?';
    const result = await this.database.query(sql, [hashedPassword, null, accountId, resetAccountId]);
    return result.affectedRows;
  }

  async disableAccount(accountId, targetAccountId) {
    const sql = 'UPDATE tbl_account_staff SET loginActive = ?, personUpdated = ? WHERE tedisPositionId = ?';
    const result = await this.database.query(sql, [0, accountId, targetAccountId]);
    return result.affectedRows;
  }

  async enableAccount(accountId, targetAccountId) {
    const sql = 'UPDATE tbl_account_staff SET loginActive = ?, personUpdated = ? WHERE tedisPositionId = ?';
    const result = await this.database.query(sql, [1, accountId, targetAccountId]);
    return result.affectedRows;
  }

  async getPages(query) {
    const sql = `
      SELECT COUNT(*) as count
      FROM users 
      WHERE 
        LOWER(name) LIKE LOWER('%' ? '%') OR
        LOWER(email) LIKE LOWER('%' ? '%');
    `;
    const [accounts] = await this.database.query(sql, [query, query]);
    const totalPages = Math.ceil(accounts.count / ITEMS_PER_PAGE);
    return totalPages;
  }

  async getProductPermission(accountId) {
    let subQuery = "";
    if (accountId != "COO") {
      subQuery = `AND ${getPositionLine(accountId)} = ?`;
    }

    const sql = `
      SELECT DISTINCT tp.`+ "`T. Product Id` AS tedisProductId" + `
      FROM tbl_thisperioddata tp
      WHERE tp.`+ "`T. Product Id` IS NOT NULL" + `
      ${subQuery}
    `;
    const permission = await this.database.query(sql, [accountId]);
    return permission;
  }

  async changePassword(accountId, currentPassword, newPassword) {
    const sql1 = `
      SELECT
        password
      FROM tbl_account_staff 
      WHERE tedisPositionId = ?
    `;
    const [account] = await this.database.query(sql1, [accountId]);

    if (!account) {
      return -1; //User does not exist
    }

    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return 0; //Incorrect password
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql2 = `
      UPDATE tbl_account_staff SET password = ?, remember_token = ? WHERE tedisPositionId = ?
    `;
    const result = await this.database.query(sql2, [hashedPassword, null, accountId]);

    return result.affectedRows;
  }

  getRole(accountId) {
    if (accountId == "COO") {
      return "line4";
    }

    if (accountId.length >= 9) {
      return "line1";
    } else if (accountId.length >= 6) {
      return "line2";
    } else if (accountId.length >= 3) {
      return "line3";
    }
  }

  async getPages(query, accountId) {
    const { subQuery, data } = this.getQuery(accountId, query);
    const sql = `
      SELECT COUNT(*) AS count
      FROM (${subQuery}) accountId
    `
    const [accounts] = await this.database.query(sql, data);
    const totalPages = Math.ceil(accounts.count / ITEMS_PER_PAGE);
    return totalPages;
  }

  getQuery(accountId, query) {
    if (accountId == "COO") {
      return {
        subQuery: `
          SELECT info.tedisPositionId
          FROM (
            SELECT DISTINCT LEFT(MEDREP ,9) AS tedisPositionId
            FROM tbl_thisperioddata
            
            UNION

            SELECT DISTINCT LEFT(ASM ,6) AS tedisPositionId
            FROM tbl_thisperioddata

            UNION

            SELECT DISTINCT ` + "`T. Business Unit` AS tedisPositionId" + `
            FROM tbl_thisperioddata
          ) info
          WHERE LOWER(info.tedisPositionId) LIKE LOWER("%" ? "%")
        `,
        data: [query],
      };
    }

    switch (accountId.length) {
      case 3:
        return {
          subQuery: `
            SELECT info.tedisPositionId
            FROM (
              SELECT DISTINCT LEFT(MEDREP ,9) AS tedisPositionId
              FROM tbl_thisperioddata
              WHERE `+ "`T. Business Unit` = ?" + `

              UNION
  
              SELECT DISTINCT LEFT(ASM ,6) AS tedisPositionId
              FROM tbl_thisperioddata
              WHERE `+ "`T. Business Unit` = ?" + `
            ) info
            WHERE LOWER(info.tedisPositionId) LIKE LOWER("%" ? "%")
          `,
          data: [accountId, accountId, query],
        };
      case 6:
        return {
          subQuery: `
            SELECT info.tedisPositionId
            FROM (
              SELECT DISTINCT LEFT(MEDREP ,9) AS tedisPositionId
              FROM tbl_thisperioddata
              WHERE LEFT(ASM ,6) = ?
            ) info
            WHERE LOWER(info.tedisPositionId) LIKE LOWER("%" ? "%")
          `,
          data: [accountId, query],
        };
    }
  }

  async getList(query, currentPage, accountId) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const { subQuery, data } = this.getQuery(accountId, query);
    const fullData = [
      ...data,
      ITEMS_PER_PAGE,
      offset
    ];
    const sql = `
      SELECT info.tedisPositionId, status.loginActive
      FROM (${subQuery}) info
      LEFT JOIN tbl_account_staff status
      ON info.tedisPositionId = status.tedisPositionId
      LIMIT ? OFFSET ?
    `;

    const accounts = await this.database.query(sql, fullData);
    return accounts;
  }

  async getStaffPermission(query, accountId) {
    const { subQuery, data } = this.getQuery(accountId, query);
    const sql = `
      SELECT *
      FROM (${subQuery}) accountId
    `;

    const accounts = await this.database.query(sql, data);
    return accounts;
  }

  async getSettingSelected(accountId) {
    const sql = `
      SELECT settingId 
      FROM tbl_account_staff_settings
      WHERE tedisPositionId = ? AND isSelect = 1
    `;

    const [setting] = await this.database.query(sql, accountId);
    return setting;
  }

  async getSettingById(settingId) {
    const sql = `
      SELECT settingName, setting 
      FROM tbl_account_staff_settings
      WHERE settingId = ?
    `;

    const [setting] = await this.database.query(sql, settingId);
    return setting;
  }

  async selectSetting(settingId, accountId) {
    const sql = `
      UPDATE tbl_account_staff_settings
      SET isSelect = 1
      WHERE settingId = ?
    `;

    const result = await this.database.query(sql, settingId);

    const settings = await this.getSettings(accountId);
    settings.forEach(async (setting) => {
      if (setting.settingId != Number(settingId)) {
        await this.unselectSetting(setting.settingId);
      }
    });

    return result.affectedRows;
  }

  async unselectSetting(settingId) {
    const sql = `
      UPDATE tbl_account_staff_settings
      SET isSelect = 0
      WHERE settingId = ?
    `;

    const result = await this.database.query(sql, settingId);
    return result.affectedRows;
  }

  async getSettings(accountId) {
    const sql = `
      SELECT settingId, settingName, setting, isSelect
      FROM tbl_account_staff_settings
      WHERE tedisPositionId = ?
    `;

    const settings = await this.database.query(sql, accountId);
    return settings;
  }

  async saveSettings(setting, accountId) {
    const { settingId } = await this.getSettingSelected(accountId);
    const sql = `
      UPDATE tbl_account_staff_settings
      SET setting = ?, isSelect = 1
      WHERE settingId = ?
    `;

    const result = await this.database.query(sql, [setting, settingId]);
    return result.affectedRows;
  }

  async createSetting(settingName, setting, accountId) {
    const sql = `
      INSERT INTO tbl_account_staff_settings (settingName, setting, tedisPositionId, isSelect) 
      VALUES (?, ?, ?, 0);
    `;

    const result = await this.database.query(sql, [settingName, setting, accountId]);
    return result.insertId;
  }

  async deleteSetting(settingId, accountId) {
    const sql = `DELETE FROM tbl_account_staff_settings WHERE settingId = ? AND tedisPositionId = ?`
    const result = await this.database.query(sql, [settingId, accountId]);
    return result.affectedRows;
  }

  async shareSetting(settingId, settingName, targeAccountId) {
    const { setting } = await this.getSettingById(settingId)
    const sql = `
      INSERT INTO tbl_account_staff_settings (settingName, setting, tedisPositionId, isSelect) 
      VALUES (?, ?, ?, 0);
    `;

    const result = await this.database.query(sql, [settingName, setting, targeAccountId]);
    return result.affectedRows;
  }

  async checkPositionId(accountId) {
    const sql = `
      SELECT COUNT(*) AS count
      FROM tbl_account_staff
      WHERE 
        tedisPositionId = ?
    `;

    const [result] = await this.database.query(sql, [accountId]);
    return result.count;
  }
}

module.exports = new Account();
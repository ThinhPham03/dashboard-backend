const accountModel = require('../models/accountModel');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRETKEY;

class AccountController {
  async authenticateLogin(req, res) {
    const accountData = req.body;
    try {
      const result = await accountModel.authenticateLogin(accountData);
      if (result == -1) {
        return res.status(404).json({ "message": "Account does not exist" });
      }

      if (result == 0) {
        return res.status(401).json({ "message": "Incorrect password" });
      }

      const role = accountModel.getRole(result.tedisPositionId);
      const token = jwt.sign(
        {
          positionId: result.tedisPositionId,
          role: role
        },
        secretKey,
        { expiresIn: '7d' }
      );

      await accountModel.rememberToken(result.tedisPositionId, token);

      return res.status(200).json({ "message": "Login successful", token });
    } catch (error) {
      console.log(error);
    }
  }

  async authenticateToken(req, res) {
    const token = req.headers?.authorization?.split(' ')[1];
    const accountId = req.accountId;
    const role = req.role;

    try {
      const result = await accountModel.authenticateToken(accountId, token);
      if (result == -1) {
        return res.status(404).json({ "message": "Remember token does not exist" });
      }

      if (result == 0) {
        return res.status(401).json({ "message": "Token does not match" });
      }

      return res.status(200).json({ "message": "Authenticate successful", accountId: accountId, role: role });
    } catch (error) {
      console.log(error);
    }
  }

  async logout(req, res) {
    const accountId = req.accountId;

    try {
      await accountModel.logout(accountId);
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.log(error);
    }
  }

  async getPages(req, res) {
    let { query } = req.query;
    if (!query) {
      query = "";
    }

    try {
      const accountPages = await accountModel.getPages(query);
      res.status(200).json(accountPages);
    } catch (error) {
      console.log(error);
    }
  }

  async changePassword(req, res) {
    const accountId = req.accountId;
    const { currentPassword, newPassword } = req.body;

    try {
      const result = await accountModel.changePassword(accountId, currentPassword, newPassword);
      if (result == -1) {
        return res.status(404).json({ "message": "Account does not exist", affectedRows: 0 });
      }

      if (result == 0) {
        return res.status(401).json({ "message": "Incorrect password", affectedRows: 0 });
      }

      return res.status(200).json({ "message": "Change password successful", affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async getPages(req, res) {
    if (req.role === "line1") {
      return res.status(401).json({ "message": "Unauthorized" });
    }

    const accountId = req.accountId;
    let { query } = req.query;
    if (!query) { query = "" }

    try {
      const totalPages = await accountModel.getPages(query, accountId);
      res.status(200).json(totalPages);
    } catch (error) {
      console.log(error);
    }
  }

  async getList(req, res) {
    if (req.role === "line1") {
      return res.status(401).json({ "message": "Unauthorized" });
    }

    const accountId = req.accountId;
    let { page, query } = req.query;
    if (!query) { query = "" }
    if (!page) { page = 1 }

    try {
      const accounts = await accountModel.getList(query, page, accountId);
      res.status(200).json(accounts);
    } catch (error) {
      console.log(error);
    }
  }

  async create(req, res) {
    const accountId = req.accountId;
    const { accountId: createAccountId } = req.body;

    try {
      const result = await accountModel.create(accountId, createAccountId);
      return res.status(200).json({ "message": "Create account successful", affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async resetPassword(req, res) {
    const accountId = req.accountId;
    const { resetAccountId } = req.params;
    const staffPermission = await accountModel.getStaffPermission("", accountId);

    const result = staffPermission.find(position => position.tedisPositionId === resetAccountId);
    if (!result) {
      return res.status(401).json({ "message": "Unauthorized" });
    }

    try {
      const result = await accountModel.resetPassword(accountId, resetAccountId);
      return res.status(200).json({ "message": "Reset password successful", affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async disableAccount(req, res) {
    const accountId = req.accountId;
    const { targetAccountId } = req.params;
    const staffPermission = await accountModel.getStaffPermission("", accountId);
    const result = staffPermission.find(position => position.tedisPositionId === targetAccountId);
    if (!result) {
      return res.status(401).json({ "message": "Unauthorized" });
    }

    try {
      const result = await accountModel.disableAccount(accountId, targetAccountId);
      return res.status(200).json({ "message": "Turn off account successful", affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async enableAccount(req, res) {
    const accountId = req.accountId;
    const { targetAccountId } = req.params;
    const staffPermission = await accountModel.getStaffPermission("", accountId);

    const result = staffPermission.find(position => position.tedisPositionId === targetAccountId);
    if (!result) {
      return res.status(401).json({ "message": "Unauthorized" });
    }

    try {
      const result = await accountModel.enableAccount(accountId, targetAccountId);
      return res.status(200).json({ "message": "Turn on account successful", affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async getSettingSelection(req, res) {
    const accountId = req.accountId;

    try {
      const settingSelection = await accountModel.getSettingSelection(accountId);
      res.status(200).json(settingSelection);
    } catch (error) {
      console.log(error);
    }
  }

  async selectSetting(req, res) {
    const { settingId } = req.params;
    const accountId = req.accountId;

    try {
      const result = await accountModel.selectSetting(settingId, accountId);
      res.status(200).json({ affectedRows: result });
    } catch (error) {
      console.log(error);
    }
  }

  async getSettings(req, res) {
    const accountId = req.accountId;

    try {
      const settings = await accountModel.getSettings(accountId);
      res.status(200).json(settings);
    } catch (error) {
      console.log(error);
    }
  }

  async createSetting(req, res) {
    const accountId = req.accountId;
    const { settingName, setting } = req.body;
    const settingJSON = JSON.stringify(setting);

    try {
      const result = await accountModel.createSetting(settingName, settingJSON, accountId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async saveSettings(req, res) {
    const accountId = req.accountId;
    const { setting } = req.body;
    const settingJSON = JSON.stringify(setting);
    
    try {
      const result = await accountModel.saveSettings(settingJSON, accountId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteSetting(req, res) {
    const { settingId } = req.params;
    const accountId = req.accountId;

    try {
      const result = await accountModel.deleteSetting(settingId, accountId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async shareSetting(req, res) {
    const {targetAccountId, settingName } = req.body;
    const { settingId } = req.params;

    try {
      const result = await accountModel.shareSetting(settingId, settingName, targetAccountId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async checkPositionId(req, res) {
    const {accountId} = req.params;

    try {
      const result = await accountModel.checkPositionId(accountId);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new AccountController();
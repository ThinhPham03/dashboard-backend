const accountRouter = require('./routes/accountRouter')
const salesRouter = require('./routes/salesRouter')

const initRoutes = (app) => {
    app.use('/api/account', accountRouter)
    app.use('/api/sales', salesRouter)
}

module.exports = { initRoutes }
import express = require("express")
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!123')
})

const app = express()
const port = 3000

app.use("/", router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
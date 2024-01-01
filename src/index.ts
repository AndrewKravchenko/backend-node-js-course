import { app } from './settings'
import { runDb } from './db/db'

const port = process.env.PORT || 3000

app.listen(port, async () => {
  runDb()
})

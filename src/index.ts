import { app } from './settings'
import { db } from './db/db'

const port = process.env.PORT || 3000

app.listen(port, async () => {
  db.connect()
})

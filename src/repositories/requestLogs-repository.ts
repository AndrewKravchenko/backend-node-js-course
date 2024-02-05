import { requestLogsCollection } from '../db/db'
import { QueryRequestLogs } from '../models/requestLogs/input/query'
import { CreateRequestLog } from '../models/requestLogs/input/create'

export class RequestLogsRepository {
  static async getRequestLogs(query: QueryRequestLogs): Promise<number> {
    const { ip, url, date } = query

    return await requestLogsCollection.countDocuments({
      ip,
      url,
      date: { $gte: date }
    })
  }

  static async createRequestLogs(newRequestLog: CreateRequestLog): Promise<string> {
    const { insertedId } = await requestLogsCollection.insertOne(newRequestLog)

    return insertedId.toString()
  }
}
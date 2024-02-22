import { requestLogsModel } from '../db/db'
import { QueryRequestLogs } from '../models/requestLogs/input/query'
import { CreateRequestLog } from '../models/requestLogs/input/create'

export class RequestLogsRepository {
  static async getRequestLogs(query: QueryRequestLogs): Promise<number> {
    const { ip, url, date } = query

    return await requestLogsModel.countDocuments({
      ip,
      url,
      date: { $gte: date }
    })
  }

  static async createRequestLogs(newRequestLog: CreateRequestLog): Promise<string> {
    const { _id } = await requestLogsModel.create(newRequestLog)

    return _id.toString()
  }
}
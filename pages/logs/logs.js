// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },

  // 清理无效的日志数据
  cleanInvalidLogs() {
    try {
      const logs = wx.getStorageSync('logs') || []
      const validLogs = logs.filter(log => {
        return log && !isNaN(log) && !isNaN(new Date(log).getTime())
      })

      if (validLogs.length !== logs.length) {
        console.log(`清理了 ${logs.length - validLogs.length} 条无效日志`)
        wx.setStorageSync('logs', validLogs)
      }

      return validLogs
    } catch (error) {
      console.error('清理日志数据时出错:', error)
      // 如果出错，清空所有日志数据
      wx.removeStorageSync('logs')
      return []
    }
  },
  onLoad() {
    // 先清理无效数据，再处理日志显示
    const validLogs = this.cleanInvalidLogs()

    this.setData({
      logs: validLogs.map(log => {
        const date = new Date(log)
        return {
          date: util.formatTime(date),
          timeStamp: log
        }
      })
    })
  }
})

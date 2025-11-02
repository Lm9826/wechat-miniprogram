const formatTime = date => {
  // 检查输入是否为有效的日期对象
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatTime: Invalid date object', date)
    return '无效日期'
  }

  try {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
  } catch (error) {
    console.error('formatTime: Error formatting date', error)
    return '格式化错误'
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime
}

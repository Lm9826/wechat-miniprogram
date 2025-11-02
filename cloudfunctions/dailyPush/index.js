// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        // 获取当前日期
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]

        // 计算在一起的天数
        const startDate = new Date('2022-12-10')
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const timeDiff = todayOnly.getTime() - startDateOnly.getTime()
        const loveDays = Math.round(timeDiff / (1000 * 3600 * 24))

        // 计算最近的节日倒数日
        const currentYear = today.getFullYear()
        const events = [
            { name: '小宝生日', month: 4, day: 16 },
            { name: '圣诞节', month: 12, day: 25 },
            { name: '元旦', month: 1, day: 1 },
            { name: '情人节', month: 2, day: 14 },
            { name: '520', month: 5, day: 20 }
        ]

        let nearestEvent = null
        let minDays = Infinity

        events.forEach(event => {
            let eventDate = new Date(currentYear, event.month - 1, event.day)
            if (eventDate < todayOnly) {
                eventDate = new Date(currentYear + 1, event.month - 1, event.day)
            }

            const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
            const timeDiff = eventDateOnly.getTime() - todayOnly.getTime()
            const days = Math.round(timeDiff / (1000 * 3600 * 24))

            if (days < minDays && days > 0) {
                minDays = days
                nearestEvent = { ...event, days }
            }
        })

        // 构建推送消息
        let message = `早安！今天是${dateStr}\n\n`
        message += `我们已经在一起${loveDays}天啦 💕\n\n`

        if (nearestEvent) {
            message += `距离${nearestEvent.name}还有${nearestEvent.days}天\n\n`
        }

        message += `今天也要开开心心的哦！`

        // 发送订阅消息
        const result = await cloud.openapi.subscribeMessage.send({
            touser: wxContext.OPENID,
            templateId: 'YOUR_TEMPLATE_ID', // 需要替换为您的模板ID
            page: 'pages/index/index',
            data: {
                thing1: { value: '恋爱日记每日提醒' },
                thing2: { value: message.substring(0, 20) + '...' },
                time3: { value: dateStr },
                thing4: { value: `在一起${loveDays}天` }
            }
        })

        return {
            success: true,
            message: '推送成功',
            data: result
        }

    } catch (error) {
        console.error('推送失败:', error)
        return {
            success: false,
            message: '推送失败',
            error: error
        }
    }
}

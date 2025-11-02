// pushService.js - 推送服务工具

// Server酱推送服务
class PushService {
    constructor() {
        // 需要用户注册Server酱获取的SendKey
        this.sendKey = 'SCT292229T9SI1sKBI7PlYVdzsa6AKFDA6' // 用户需要填入自己的SendKey
        this.baseUrl = 'https://sctapi.ftqq.com'
    }

    // 设置SendKey
    setSendKey(sendKey) {
        this.sendKey = sendKey
        wx.setStorageSync('serverChanSendKey', sendKey)
    }

    // 获取SendKey
    getSendKey() {
        if (!this.sendKey) {
            this.sendKey = wx.getStorageSync('serverChanSendKey') || ''
        }
        return this.sendKey
    }

    // 发送推送消息
    sendMessage(title, content) {
        const sendKey = this.getSendKey()
        if (!sendKey) {
            return Promise.reject(new Error('请先设置SendKey'))
        }

        const requestUrl = `${this.baseUrl}/${sendKey}.send`
        console.log('发送推送请求到:', requestUrl)
        console.log('推送内容:', { title, content })

        return new Promise((resolve, reject) => {
            wx.request({
                url: requestUrl,
                method: 'POST',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    title: title,
                    desp: content
                },
                success: (res) => {
                    console.log('推送响应:', res)
                    console.log('响应状态码:', res.statusCode)
                    console.log('响应数据:', res.data)

                    if (res.statusCode === 200 && res.data && res.data.code === 0) {
                        resolve({
                            success: true,
                            message: '推送成功',
                            data: res.data
                        })
                    } else {
                        const errorMsg = res.data ? res.data.message : `推送失败 (状态码: ${res.statusCode})`
                        reject(new Error(errorMsg))
                    }
                },
                fail: (error) => {
                    console.error('推送请求失败:', error)
                    console.error('错误详情:', JSON.stringify(error))
                    reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`))
                }
            })
        })
    }

    // 获取当天的消息
    getTodayMessage() {
        // 从本地存储获取当天的消息
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]
        const todayMessages = wx.getStorageSync('diaryMessages') || {}

        return todayMessages[dateStr] || null
    }

    // 获取天气信息
    async getWeatherInfo() {
        // 获取用户位置信息
        const userLocation = wx.getStorageSync('userLocation')

        if (userLocation && userLocation.latitude && userLocation.longitude) {
            try {
                // 使用位置信息获取真实天气
                const WeatherService = require('./weatherService')
                const weatherInfo = await WeatherService.getCompleteWeatherInfo(
                    userLocation.latitude,
                    userLocation.longitude
                )

                return {
                    city: weatherInfo.location.city,
                    temperature: weatherInfo.weather.temperature.toString(),
                    condition: weatherInfo.weather.condition,
                    icon: this.getWeatherIcon(weatherInfo.weather.condition),
                    humidity: weatherInfo.weather.humidity,
                    windSpeed: weatherInfo.weather.windSpeed,
                    windDir: weatherInfo.weather.windDir
                }
            } catch (error) {
                console.error('获取真实天气失败，使用默认天气:', error)
            }
        }

        // 如果没有位置信息或获取失败，使用默认天气
        const defaultCity = userLocation ? userLocation.city : '北京'
        const weatherOptions = [
            { city: defaultCity, temperature: '25', condition: '晴天', icon: '☀️' },
            { city: defaultCity, temperature: '22', condition: '多云', icon: '⛅' },
            { city: defaultCity, temperature: '18', condition: '小雨', icon: '🌧️' },
            { city: defaultCity, temperature: '28', condition: '晴天', icon: '☀️' },
            { city: defaultCity, temperature: '20', condition: '阴天', icon: '☁️' }
        ]

        // 根据日期生成不同的天气，让每天都有变化
        const today = new Date()
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
        const weatherIndex = dayOfYear % weatherOptions.length

        return weatherOptions[weatherIndex]
    }

    // 根据天气状况获取图标
    getWeatherIcon(condition) {
        const iconMap = {
            '晴天': '☀️',
            '多云': '⛅',
            '阴天': '☁️',
            '小雨': '🌧️',
            '中雨': '🌧️',
            '大雨': '⛈️',
            '雪': '❄️',
            '雾': '🌫️'
        }
        return iconMap[condition] || '🌤️'
    }

    // 发送每日提醒
    async sendDailyReminder() {
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

        // 获取当天的消息
        const todayMessage = this.getTodayMessage()

        // 获取天气信息
        const weatherInfo = await this.getWeatherInfo()

        // 构建推送消息
        let content = `早安！今天是${dateStr}\n\n`
        content += `我们已经在一起${loveDays}天啦 💕\n\n`

        // 添加天气信息
        content += `🌤️ 今日天气：\n${weatherInfo.city} ${weatherInfo.temperature}°C ${weatherInfo.condition}\n\n`

        if (nearestEvent) {
            content += `距离${nearestEvent.name}还有${nearestEvent.days}天\n\n`
        }

        // 添加当天的消息
        if (todayMessage) {
            content += `📝 今日消息：\n${todayMessage}\n\n`
        } else {
            content += `📝 今天还没有写日记哦，记得记录一下今天的心情～\n\n`
        }

        content += `今天也要开开心心的哦！`

        return this.sendMessage('💕 恋爱日记', content)
    }
}

// 创建全局推送服务实例
const pushService = new PushService()

module.exports = {
    pushService
}






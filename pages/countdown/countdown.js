// countdown.js
const lunar = require('../../utils/lunar.js')

Page({
    data: {
        // 在一起的天数
        loveDays: 0,
        startDate: '2022-12-10',
        // 倒数日事件列表
        countdownEvents: [
            {
                id: 1,
                name: '小宝生日',
                days: 0,
                month: 4,
                day: 16
            },
            {
                id: 2,
                name: '七夕',
                days: 0,
                isLunar: true
            },
            {
                id: 3,
                name: '圣诞节',
                days: 0,
                month: 12,
                day: 25
            },
            {
                id: 4,
                name: '元旦',
                days: 0,
                month: 1,
                day: 1
            },
            {
                id: 5,
                name: '情人节',
                days: 0,
                month: 2,
                day: 14
            },
            {
                id: 6,
                name: '520',
                days: 0,
                month: 5,
                day: 20
            }
        ]
    },

    onLoad() {
        this.calculateLoveDays()
        this.calculateCountdownDays()
    },

    // 计算在一起的天数
    calculateLoveDays() {
        const startDate = new Date('2022-12-10')
        const today = new Date()

        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const timeDiff = todayOnly.getTime() - startDateOnly.getTime()
        const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24))

        this.setData({
            loveDays: daysDiff
        })
    },

    // 计算倒数日天数
    calculateCountdownDays() {
        const today = new Date()
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const currentYear = today.getFullYear()

        const updatedEvents = this.data.countdownEvents.map(event => {
            let eventDate

            // 特殊处理七夕（农历节日）
            if (event.isLunar) {
                const qixiDate = lunar.getNextQixiDate()
                eventDate = new Date(qixiDate.year, qixiDate.month - 1, qixiDate.day)
            } else {
                // 先尝试今年的日期
                eventDate = new Date(currentYear, event.month - 1, event.day) // 月份从0开始

                // 如果今年的日期已经过了，计算明年的日期
                if (eventDate < todayOnly) {
                    eventDate = new Date(currentYear + 1, event.month - 1, event.day)
                }
            }

            const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
            const timeDiff = eventDateOnly.getTime() - todayOnly.getTime()
            const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24))

            return {
                ...event,
                days: daysDiff > 0 ? daysDiff : 0,
                date: eventDate.toISOString().split('T')[0] // 更新显示的日期
            }
        })

        this.setData({
            countdownEvents: updatedEvents
        })
    },

    // 返回上一页
    goBack() {
        wx.navigateBack({
            delta: 1
        })
    },

    // 添加新事件
    addNewEvent() {
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        })
    }
})

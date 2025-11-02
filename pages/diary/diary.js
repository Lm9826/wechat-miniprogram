// diary.js
Page({
    data: {
        diaryList: [
            {
                id: 1,
                date: '2024-01-15',
                title: '第一次约会',
                content: '今天和Ta一起看了电影，心情特别好...',
                mood: 'happy'
            },
            {
                id: 2,
                date: '2024-01-20',
                title: '一起做饭',
                content: '第一次一起下厨，虽然有点手忙脚乱，但很开心...',
                mood: 'love'
            }
        ],
        todayMessage: '',
        showAddMessage: false
    },

    onLoad() {
        this.loadTodayMessage()
    },

    // 加载今天的消息
    loadTodayMessage() {
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]
        const todayMessages = wx.getStorageSync('diaryMessages') || {}
        const todayMessage = todayMessages[dateStr] || ''

        this.setData({
            todayMessage: todayMessage
        })
    },

    // 显示添加消息弹窗
    showAddMessageModal() {
        this.setData({
            showAddMessage: true
        })
    },

    // 隐藏添加消息弹窗
    hideAddMessageModal() {
        this.setData({
            showAddMessage: false
        })
    },

    // 消息输入变化
    onMessageInput(e) {
        this.setData({
            todayMessage: e.detail.value
        })
    },

    // 保存今天的消息
    saveTodayMessage() {
        const { todayMessage } = this.data
        if (!todayMessage.trim()) {
            wx.showToast({
                title: '请输入消息内容',
                icon: 'none'
            })
            return
        }

        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]
        const todayMessages = wx.getStorageSync('diaryMessages') || {}

        // 保存今天的消息
        todayMessages[dateStr] = todayMessage.trim()
        wx.setStorageSync('diaryMessages', todayMessages)

        this.setData({
            showAddMessage: false
        })

        wx.showToast({
            title: '保存成功',
            icon: 'success'
        })
    },

    // 添加新日记
    addDiary() {
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        })
    },

    // 查看日记详情
    viewDiary(e) {
        const diaryId = e.currentTarget.dataset.id
        wx.showToast({
            title: `查看日记 ${diaryId}`,
            icon: 'none'
        })
    }
})

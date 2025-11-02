// profile.js
Page({
    data: {
        userInfo: {
            avatarUrl: '/images/default-avatar.png',
            nickName: '用户昵称'
        },
        menuItems: [
            {
                id: 1,
                title: '个人设置',
                icon: '⚙️',
                arrow: true
            },
            {
                id: 2,
                title: '数据统计',
                icon: '📊',
                arrow: true
            },
            {
                id: 3,
                title: '帮助与反馈',
                icon: '💬',
                arrow: true
            },
            {
                id: 4,
                title: '关于我们',
                icon: 'ℹ️',
                arrow: true
            }
        ]
    },

    onLoad() {
        // 获取用户信息
        this.getUserInfo()
    },

    // 获取用户信息
    getUserInfo() {
        // 这里可以调用获取用户信息的API
    },

    // 点击菜单项
    onMenuClick(e) {
        const menuId = e.currentTarget.dataset.id
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        })
    },

    // 编辑个人信息
    editProfile() {
        wx.showToast({
            title: '编辑个人信息',
            icon: 'none'
        })
    }
})

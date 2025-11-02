// discover.js
Page({
    data: {
        features: [
            {
                id: 1,
                title: '倒数日',
                subtitle: '不再错过重要的日子',
                icon: '📅',
                color: '#ff9a9e'
            },
            {
                id: 2,
                title: '珍藏册',
                subtitle: '记忆都在这里',
                icon: '📸',
                color: '#feca57'
            },
            {
                id: 3,
                title: '礼物柜',
                subtitle: '收到的礼物记录一下',
                icon: '🎁',
                color: '#ff6b6b'
            },
            {
                id: 4,
                title: '愿望清单',
                subtitle: '一起实现的小目标',
                icon: '⭐',
                color: '#4834d4'
            }
        ]
    },

    onLoad() {
        // 页面加载
    },

    // 点击功能卡片
    onFeatureClick(e) {
        const featureId = e.currentTarget.dataset.id
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        })
    }
})

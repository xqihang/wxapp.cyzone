var Api = require('../../utils/api.js');

//获取应用实例
var app = getApp();
Page({
    data: {
        inputShowed: false,
        inputVal: "",
        grids: [
        	{
        		name: '投资事件',
        		class: 'event',
        		icon: '/img/icon/event.png',
        		url: '/pages/event/event'
        	},
        	{
        		name: '创业公司',
        		class: 'vcompany',
        		icon: '/img/icon/vcompany.png',
                url: '/pages/company/company'
        	},
        	{
        		name: '投资机构',
        		class: 'company',
        		icon: '/img/icon/company.png',
        		url: '/pages/capital/capital'
        	},
        	{
        		name: '创业人物',
        		class: 'vpeople',
        		icon: '/img/icon/vpeople.png',
        		url: '/pages/vpeople/vpeople'
        	},
        	{
        		name: '投资人物',
        		class: 'people',
        		icon: '/img/icon/people.png',
        		url: '/pages/people/people'
        	}
        ],
        hidden: false,
    },
    onLoad: function(options) {

        var _t = this;
        
        _t.eventList();
    },
    onShareAppMessage: function(){

        var _t = this;
        return {
            title: '创投大全',
            desc: '创投大全为您提供最快速的融资消息，最全的初创公司和投资机构等创投行业数据。',
            path: '/pages/index/index'
        }
    },
    eventList: function(){
        var _t = this;
        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=init',
            success: function(res){
                console.log(res.data.data);
                _t.setData({
                    data: res.data.data
                })
            }
        })
    },
    fetchData: function() {

        var self = this;

        // 处理参数
        self.setData({
            hidden: false
        });
    },
    lower: function(e) {

        var self = this;

        if (self.data.page >= self.data.pages) {

            wx.showToast({
                title: '已全部加载',
                icon: 'success',
                duration: 2000
            })
            return false;
        }

        self.setData({
            page: self.data.page + 1
        });

        this.fetchData();
    },
    tapselect: function(event) {
        var status = event.target.dataset.status;

        // 更新状态
        // 更新页码
        this.setData({
            status: status,
            page: 1,
            lists: []
        });

        // 更新数据
        this.fetchData();
    }
})

var Api = require('../../utils/api.js');
//获取应用实例
var app = getApp();
Page({
    data: {
        page: 1,
        rule: {},
        menu: ['industryid'],
        inputShowed: false,
        inputVal: "",
        notfind: false,
        showDropList: false,
        title: '投资人物',
        path: '/pages/people/people'
    },
    onShareAppMessage: app.globalEvent.onShareAppMessage,
    onLoad: app.globalEvent.onLoad,
    initMenu: app.globalEvent.initMenu,
    getMenu: app.globalEvent.getMenu,
    changeMenu: app.globalEvent.changeMenu,
    changeSubMenu: app.globalEvent.changeSubMenu,
    query: app.globalEvent.query,
    getList: function(page){

        var _t = this;

        var rule = _t.data.rule;
        rule.dosubmit = 1;
        rule.page = _t.data.page || 1;

        wx.showNavigationBarLoading();

        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=people_list',
            data: rule,
            success: function(res){

                var result = res.data;
                if( result.code ){
                    var dataList = result.data;

                    for( var i = 0; i < dataList.length; i++ ){
                        dataList[i] = app.util.constructData( dataList[i] );
                    }

                    _t.setData({
                        lists: (_t.data.lists ? _t.data.lists.concat( dataList ) : dataList),
                        pages: res.data.pages,
                        hidden: true
                    });
                }

                _t.setData({
                    notfind: (_t.data.lists.length ? false : true)
                });

                wx.hideNavigationBarLoading();
            }
        })
    },
    lower: function(e) {

        var _t = this;
        _t.setData({
            page: _t.data.page + 1
        });

        console.log( _t.data.page , _t.data.pages );
        if( _t.data.page > _t.data.pages ){
            wx.showToast({
                title: '没有更多了',
                icon: 'success'
            });
            return false;
        }

        _t.getList();
    }
})

var Api = require('../../utils/api.js');
var WxParse = require('../../wxParse/wxParse.js');
//获取应用实例
var app = getApp();
Page({
    data: {
        hidden: false
    },
    onLoad: function(options) {
        var _t = this;
        if(options.id){
            _t.setData({
                id: options.id
            });

            _t.show();
        }else{
            wx.showModal({
                title:'温馨提示',
                content: '投资人在开会（哈哈，其实是找不到这位投资人了）~',
                showCancel: false,
                success: function(res){
                    if( res.confirm ){
                        wx.redirectTo({
                            url: '/pages/index/index'
                        })
                    }
                }
            });
        }
    },
    onShareAppMessage: function(){

        var _t = this;
        return {
            title: _t.data.data.title,
            desc: ( _t.data.data.description || '信息来自：创投大全'),
            path: '/pages/show_p/show_p?id=' + _t.data.id
        }
    },
    show: function(){
        var _t = this;

        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=people_show',
            data: {
                id: _t.data.id
            },
            success: function(res){

                var result = res.data.data;

                if( !res.data.code ){
                    wx.showModal({
                        title:'温馨提示',
                        content: res.data.msg,
                        showCancel: false,
                        confirmText: '我知道了',
                        success: function(res){
                            if( res.confirm ){
                                wx.redirectTo({
                                    url: '/pages/index/index'
                                });
                            }
                        }
                    });
                    return false;
                }

                // 小程序富文本transform
                WxParse.wxParse('article', 'html', result.content, _t, 5);

                _t.setData({
                    data: result
                });
                wx.setNavigationBarTitle({
                    title: result.title
                })
            }
        })
    }
})

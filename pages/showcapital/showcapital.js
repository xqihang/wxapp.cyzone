var Api = require('../../utils/api.js');
var WxParse = require('../../wxParse/wxParse.js');
//获取应用实例
var app = getApp();
Page({
    data: {
        page:1,
        hidden: false
    },
    onLoad: function(options) {
        var _t = this;
        // options.id = 9;
        if(options.id){
            _t.setData({
                id: options.id
            });

            _t.show();
        }else{
            wx.showModal({
                title:'温馨提示',
                content: '这家公司不存在哦~',
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
            desc: ( _t.data.data.description || '信息来自：来自创投大全'),
            path: '/pages/showcapital/showcapital?id=' + _t.data.id
        }
    },
    show: function(){
        var _t = this;

        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=capital_company_show',
            data: {
                id: _t.data.id,
                page: _t.data.page
            },
            success: function(res){

                var result = res.data.data;

                if( !res.data.code ){
                    wx.showModal({
                        title:'温馨提示',
                        content: res.data.msg,
                        showCancel: false,
                        confirmText: '我知道了'
                    });
                    return false;
                }

                if(_t.data.page != 1){

                    var temp = _t.data.data;
                    var oldCase = temp.financing;

                    temp.financing = oldCase.concat( result.financing );

                    _t.setData({
                        data: temp
                    });

                }else{

                    // 小程序富文本transform
                    WxParse.wxParse('article', 'html', result.content, _t, 5);

                    for( var i=0; i < result.people.length; i++ ){
                        if(i >= 10){
                            result.people[i].isShow = false;
                        }else{
                            result.people[i].isShow = true;
                        }
                    }

                    _t.setData({
                        data: result,
                        pages: res.data.pages
                    });

                    wx.setNavigationBarTitle({
                        title: result.title
                    })
                }
            }
        })
    },
    showTeam: function(){
        var result = this.data.data;

        for( var i=0; i < result.people.length; i++ ){
            result.people[i].isShow = true;
        }

        this.setData({
            data: result,
            allPeopleShow: true
        });
    },
    case: function(){
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

        _t.show();
    }
})

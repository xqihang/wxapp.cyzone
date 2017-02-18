var Api = require('../../utils/api.js');

//获取应用实例
var app = getApp();
Page({
    data: {
        page: 1,
        index: 1,
        inputShowed: true,
        inputVal: "",
        old_word: "",
        hotArr: ['移动互联网','大米','电子商务','A轮'],
        hidden: false
    },
    onLoad: function(options) {
        var _t = this;

        if( options.keyword != '' ){
            _t.setData({
                inputVal: options.keyword,
                inputShowed: true
            });

            _t.search();
        }

        _t.getHot();
    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            data: [],
            inputShowed: false,
            currentModel: null
        });

        console.log(!this.data.currentModel);
        console.log(!this.data.length);
    },
    clearInput: function () {
        this.setData({
            inputVal: "",
            data: [],
            inputShowed: false,
            currentModel: null
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    onShareAppMessage: function(){

        var _t = this;
        return {
            title: _t.data.item.title,
            desc: '这是创业邦开发的一款知识类电商服务，您可以从这里获取权威的创投类服务。助您在创业路上加速度。',
            path: '/pages/product/product?id=' + _t.data.id
        }
    },
    getHot: function(){
        var _t = this;
        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=hot_word',
            success: function(res){
                var result = res.data.data;
                _t.setData({
                    hotArr: result
                })
            }
        })
    },
    hot: function(e){
        var word = e.target.dataset.word;

        this.setData({
            inputVal : word,
            currentModel: null
        });

        this.search();
    },
    search: function(){
        var _t = this;

        if( _t.data.inputVal != _t.data.old_word ){
            _t.setData({
                page: 1
            });
        }
        if( !_t.data.inputVal ){
            return false;
        }

        wx.showNavigationBarLoading();

        wx.request({
            url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=search&type=1' + ( _t.data.currentModel ? '&modelid=' + _t.data.currentModel : ''),
            data: {
                keywords: _t.data.inputVal,
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
                    _t.setData({
                        focus: true
                    })
                    return false;
                }

                if( _t.data.inputVal == _t.data.old_word ){

                    var lists = _t.data.data;
                    result = lists.concat( result );;
                }

                wx.hideNavigationBarLoading();
                _t.setData({
                    data: result,
                    currentModel: (_t.data.currentModel || result[0].modelid),
                    count: [
                        {
                            name: 'vcompany',
                            class: 'vcompany',
                            cn: '创业公司',
                            number: res.data.vcompany,
                            modelid: 18
                        },
                        {
                            name: 'company',
                            class: 'company',
                            cn: '投资机构',
                            number: res.data.company,
                            modelid: 4
                        },
                        {
                            name: 'vpeople',
                            class: 'vpeople',
                            cn: '创业人物',
                            number: res.data.vpeople,
                            modelid: 19
                        },
                        {
                            name: 'people',
                            class: 'people',
                            cn: '投资人物',
                            number: res.data.people,
                            modelid: 6
                        }
                    ],
                    pages: res.data.pages,
                    old_word: _t.data.inputVal
                });
            }
        })
    },
    searchtype: function(e){
        var mid = e.target.dataset.mid;
        this.setData({
            currentModel: mid,
            old_word: ''
        });

        this.search();
    },
    tabs: function(e){
        var index = e.target.dataset.index;

        var data = this.data.data;
        for(var i=0;i<data.length;i++){
            if(i == index){
                data[i].active = true;
            }else{
                data[i].active = false;
            }
        }

        this.setData({
            data: data,
            index: index
        })
    },
    lower: function(e) {

        var _t = this;

        if (_t.data.page >= _t.data.pages) {

            wx.showToast({
                title: '已全部加载',
                icon: 'success',
                duration: 2000,

            })
            return false;
        }

        _t.setData({
            page: _t.data.page + 1
        });

        _t.search();
    }
})

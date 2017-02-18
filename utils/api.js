'use strict';
var app = getApp();

var HOST_URI = 'https://api.cyzone.cn';

function obj2uri (obj) {
    return Object.keys(obj).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&');
}

module.exports = {
    getAllProcut: function (obj, success, complete) {
        // 获取列表数据
        wx.request({
            url: HOST_URI + '/shop/shop/lists',
            data: app.util.extendData(obj),
            success: success
        });
    },
    getProductById: function(data, success){
        wx.request({
            url: HOST_URI + '/shop/shop/show',
            data: app.util.extendData(data),
            success: success
        });
    },
    sendFile: function(data, success){
        wx.request({
            url: HOST_URI + '/shop/member/annex',
            data: app.util.extendData(data),
            success: success
        });
    },
    getBag: function(options, success){

        wx.request({
            url: HOST_URI + '/shop/member/' + options.status,
            data: app.util.extendData(options),
            success: success
        });
    },
    collect: function(data, success, fail){
        wx.request({
            url: HOST_URI + '/shop/member/collect',
            data: app.util.extendData(data),
            success: success
        });
    },
    me: function(data, success, complete){
        wx.request({
            url: HOST_URI + '/shop/account/me',
            data: app.util.extendData(data),
            success: success,
            complete: complete
        });
    },
    updateAvatar: function(options) {

        var data = ( options.data ? options.data : {} );

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                var tempFilePaths = res.tempFilePaths;

                wx.uploadFile({
                    url: HOST_URI + '/shop/account/avatar',
                    filePath: tempFilePaths[0],
                    name: 'avatar',
                    formData: app.util.extendData(data),
                    success: options.success
                })
            }
        })
    },
    updateUserInfo: function(options) {

        var data = ( options.data ? options.data : {} );

        wx.request({
            url: HOST_URI + '/shop/account/update',
            method: 'POST',
            data: app.util.extendData(data),
            success: options.success
        });
    },
    payWX: function (data, success, fail) {

        wx.request({
            url: HOST_URI + '/shop/beecloud/littlepay',
            data: app.util.extendData(data),
            success: function(result){

                if(result.data.nonceStr){
                    var paydata = result.data;
                    wx.requestPayment({
                        timeStamp: paydata.timeStamp,
                        nonceStr: paydata.nonceStr,
                        package: paydata.package,
                        signType: 'MD5',
                        paySign: paydata.paySign,
                        success: success,
                        fail: fail
                    });
                }else{
                    console.log( result.data );
                    if( result.data.code ){
                        success && success(result.data);
                    }else{
                        fail && fail(result.data);
                    }
                }
            }
        });
    }
};
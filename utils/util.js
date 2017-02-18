var moment = require('./moment.js');
moment.locale('zh-cn');

function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

function getQueryString(name) {
    //截取url的数据
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

function setCookie(json, time) {
    var oDate = new Date();

    oDate.setDate(oDate.getDate() + time);

    for (var i in json) {
        document.cookie = i + '=' + json[i] + ';expires=' + oDate + ';domain=.cyzone.cn';
    }
}

function getCookie(name) {
    var arr = document.cookie.split('; ');

    for (var i = 0; i < arr.length; i++) {
        var result = arr[i].split('=');
        if (result[0] == name) {
            return result[1];
        }
    }
    return false;
}

function removeCookie(name) {
    setCookie(name, '0', -1);
}

function toDouble(n){
    return (n<10 ? '0' + n : n);
}


function formatObject(date, hiddenMonth){

    if( hiddenMonth ){
        return toDouble(date.hours) + ':' + toDouble(date.minutes);
    }
    return toDouble(date.years) + '-' + toDouble(date.months) + '-' + toDouble(date.date) + ' ' + toDouble(date.hours) + ':' + toDouble(date.minutes);
}

function formatDate(data) {

    var now = new Date().getTime();

    if (now < data.roomstart * 1000) {
        data.playStatus = '报名中';
        data.Q_playstatuscode = 0;
    } else if (now >= data.roomstart * 1000 && now <= data.roomend * 1000) {
        data.playStatus = '正在直播';
        data.Q_playstatuscode = 1;
    } else if (now > data.roomend * 1000) {
        data.playStatus = '录播';
        data.Q_playstatuscode = -1;
    }

    var start = new Date(data.roomstart * 1000);
    var end = new Date(data.roomend * 1000);
    
    // 微信小程序不能用这个方法...
    // var startD = moment(start).format();
    // var endD = moment().format();
    
    var startD = formatObject( moment(start).toObject() );
    var endD = formatObject( moment(end).toObject(), true );

    data.formatD = startD + '-' + endD;

    return data;
}

function property(item) {

    var type = item.type;

    switch (type) {
        case 0:
            item.class = 'calm-bg';
            break;
        case 1:
            item.class = 'energized-bg';
            break;
        case 2:
            item.class = 'balanced-bg';
            break;
        case 3:
            item.class = 'positive-bg';
            break;
        default:
            item.class = 'royal-bg';
            break;
    }
    return item;
}

function issales(data) {

    if ((data.type == 2 || data.type == 3) && data.youzanurl !== '') {
        data.clickUrl = data.youzanurl;
    } else {
        data.clickUrl = '#/product/' + data.id + (data.issales ? '/show' : '');
    }

    return data;
}

function audio( data, n ){

    n = n || 12;
    var title = data.title;

    title = ( title.length > n ? title.substring(0, n) + '...' : title );
    // 设置音频标题（裁12个字符）
    data.Q_audioTitle = title;
    return data;
}

function showPrice(data){

    var now = parseInt( new Date().getTime() / 1000 );

    var isVipUser = Boolean( data.vip && now < data.overduedate );
    var enjoyPromotion = Boolean( data.promotion && now >= data.promotiontime && now < data.promotionendtime );
    var enjoyVip = Boolean( data.isvip && now >= data.vipstart && now < data.vipend );

    // console.log( {'isVipUser': isVipUser, 'enjoyPromotion': enjoyPromotion, 'enjoyVip': enjoyVip} );

    function smallPrice(){
        var arrPrice = [ data.promotionprice, data.vipprice, data.price ];

        arrPrice = arrPrice.sort(function(a,b){
            return a-b;
        });
        return parseFloat( arrPrice[0] );
    }

    if( isVipUser && enjoyVip ){
        // 有特价 && 有会员价
        if( enjoyPromotion ){
            data.isPromotion = true;
            data.showPrice = smallPrice();
        }else{
            // 用户看到 vip价格
            data.showPrice = parseFloat(data.vipprice);
        }
    }else{
        // 特价
        if( enjoyPromotion ){
            data.isPromotion = true;
            data.showPrice = parseFloat(data.promotionprice);
        }else{
            // 用户看到原价
            data.showPrice = parseFloat(data.price);
        }
    }

    // 去掉.00
    data.vipprice = parseFloat(data.vipprice);
    data.price = parseInt(data.price);
    data.promotionprice = parseInt(data.promotionprice);
    
    data.Q_isVipUser = isVipUser;
    data.Q_enjoyPromotion = enjoyPromotion;
    data.Q_enjoyVip = enjoyVip;
    data.Q_endPrice = parseFloat(data.showPrice);

    data.showPrice = ( data.showPrice == 0 ? (data.vip ? '会员免费':'免费') : (data.vip && data.enjoyVip ? '会员:￥' + data.showPrice : '￥' + data.showPrice) )

    return data;
}

function filterHTML(data){

    if (data.issales && data.type != 1) {
        data.showContentTxt = (data.readcontent ? data.readcontent : data.content);
    } else {
        data.showContentTxt = data.content;
    }

    return data;
}

function constructData(data) {

    // 时间相关
    data = formatDate(data);
    // 根据type构造中文
    data = property(data);
    // 价格相关
    data = showPrice(data);
    // 点击链接
    data = issales(data);

    // 音频设置
    data = audio(data);

    // 正文
    data = filterHTML(data);

    return data;
}

module.exports = {
    constructData: constructData,
    extendData: function(data){
        
        data = data || {};

        var token = wx.getStorageSync('token');
        for(var name in token ){
            data[name] = token[name];
        }
        return data;
    },
    updateJSON: function(t,item,name,value){
        
        var tmp = t.data[item];
        tmp[name] = value;
        return tmp;
    }
}

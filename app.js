var util = require('utils/util.js');
//app.js
App({
    onLaunch: function() {

        var _t = this;
    },
    util : util,
    globalData: {
        user: null,
        user_wx: null,
        vipID: 36,
        pagesize: 10
    },
    config: {
        kefu: 13810785573,
    },
    globalEvent: {
        onShareAppMessage: function(){

            var _t = this;
            var params = '';

            for(var field in _t.data.rule){
                params += ( field + '=' + _t.data.rule[field] + '&' );
            }
            params = params.substring(0, params.length-1);

            return {
                title: (_t.data.title ? _t.data.title + '-' : '' ) + '创投大全',
                desc: '创投大全为您提供最快速的融资消息，最全的初创公司和投资机构等创投行业数据。',
                path: (_t.data.path ? _t.data.path : '/pages/index/index' ) + '?' + ( params != '' ? params : '' )
            }
        },
        onLoad: function(options) {

            var _t = this;
            var rule = _t.data.rule;
            
            if(options){
                for(var name in options){
                    rule[name] = options[name];
                }

                rule.dosubmit = 1;

                _t.setData({
                    rule: rule
                });
            }

            this.getMenu();
        },
        getMenu: function(){
            var _t = this;

            wx.request({
                url: 'https://api.cyzone.cn/index.php?m=content&c=wxcompany&a=dropdown',
                success: function(res){

                    // 添加前端显示必要的字段
                    var result = res.data.data;
                    var tmpRes = [];

                    for(var i=0; i< result.length; i++ ){
                        result[i].tempname = result[i].name;

                        if( _t.data.menu.indexOf(result[i].field) != -1 ){
                            tmpRes.push( result[i] );
                        }
                    }

                    _t.initMenu(tmpRes);
                }
            });
        },
        initMenu: function(menu){

            var rule = this.data.rule;
            var dropdown = menu;

            for( var i = 0; i < dropdown.length; i++ ){

                dropdown[i].oldname = dropdown[i].name;

                for(var field in rule){
                    if( field == dropdown[i].field ){

                        var submenu = dropdown[i].data;
                        for( var n = 0; n < submenu.length; n++ ){
                            if( submenu[n].id == rule[field] ){
                                submenu[n].checked = true;
                            }else{
                                submenu[n].checked = false;
                            }
                        }

                        if( field == 'industryid' || field == 'time' || field == 'corder' ){
                            for(var j=0; j<dropdown[i].data.length; j++){
                                if( dropdown[i].data[j].id == rule[field] ){
                                    dropdown[i].name = ( (rule[field] != '' && rule[field] != 0) ? dropdown[i].data[j].name : '全部' );
                                }
                            }
                        }else{
                            dropdown[i].name = ( (rule[field] != '' && rule[field] != 0) ? rule[field] : '全部' );
                        }
                    }
                }
            }
            this.setData({
                dropdown: dropdown
            });

            this.changeMenu();
            this.changeMenu();

            this.getList();
        },
        changeMenu: function(e){

            var _t = this;
            var index = (e ? e.target.dataset.index : 0);

            // 找出所有值
            var result = _t.data.dropdown;

            // 多次点击同一个
            if( result[index].active ){
                result[index].active = false;

                _t.setData({
                    showDropList: false,
                    dropdown: result
                });
                return false;
            }

            // 切换不同的项
            for(var i=0;i<result.length;i++){
                if(index == i){
                    result[i].active = true;
                }else{
                    result[i].active = false;
                }
            }

            this.setData({
                currentIndex: index,
                dropdown: result,
                showDropList: true
            });
        },
        changeSubMenu: function (e) {

            // 设置选中的二级项目
            var current = this.data.dropdown[this.data.currentIndex];
            var radioItems = current.data;

            for (var i = 0, len = radioItems.length; i < len; ++i) {
                radioItems[i].checked = (radioItems[i].id == e.detail.value);
            }
            current.data = radioItems;

            var dropdown = this.data.dropdown;
            var rule = this.data.rule;
            var field = e.target.dataset.field;

            for(var i=0; i<dropdown.length; i++){

                if( dropdown[i].field == field ){
                    if( field == 'industryid' || field == 'time' || field == 'corder' ){
                        for(var j=0; j<dropdown[i].data.length; j++){
                            if( dropdown[i].data[j].id == e.detail.value ){
                                dropdown[i].name = ( e.detail.value != 0 ? dropdown[i].data[j].name : '全部' );
                            }
                        }
                    }else{
                        dropdown[i].name = ( e.detail.value ? e.detail.value : '全部' );
                    }
                }
            }

            rule[field] = e.detail.value;

            this.setData({
                rule: rule,
                dropdown: dropdown
            });
        },
        query: function(e){

            var _t = this;
            var type = ( e == undefined ? 'reset' : e.target.dataset.type);
            var dropdown = this.data.dropdown;

            if( type == 'reset' ){

                // 设置选中的二级项目
                var current = dropdown[this.data.currentIndex];

                for(var i=0; i<dropdown.length; i++){
                    dropdown[i].name = dropdown[i].tempname;

                    var tmp = dropdown[i].data;
                    for (var j = 0, len = dropdown[i].data.length; j < len; ++j) {
                        dropdown[i].data[j].checked = false;
                    }
                    dropdown[i].data[0].checked = true;
                }

                _t.setData({
                    rule : {},
                    dropdown: dropdown
                });
            }

            if( type == 'submit' ){

                var dropdown = _t.data.dropdown;
                dropdown[_t.data.currentIndex].active = false;

                _t.setData({
                    page: 1,
                    lists: [],
                    dropdown: dropdown,
                    showDropList: false
                });

                _t.getList();
            }
        },
    }
})

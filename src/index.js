define(function(require) { // eslint-disable-line no-unused-vars
  var LL = require('kg/km-lazyload');
  var itemtpl = require('./item.jst.html');
  var itemtplHb = require('./hb.jst.html');
  var itemtplcity = require('./itemcity.jst.html');
  var itemtplcity1 = require('./itemcity2.jst.html');
  var itemtplTj = require('./tejia.jst.html');
  var XCtrl = require('kg/xctrl');
  var mtop = require('kg/km-mtop');
  var login = require('mtb/lib-login');
  var Toast = require('kg/km-toast');
  var tjcitycode = [];
  function Mod() {
    this.init.apply(this, arguments);
  }

  Mod.prototype = {
    /**
     * 入口
     * @param dom 模块根节点
     * @param conf 数据描述，为空说明已渲染
     */
    init: function(container, conf) {
      var self = this;
      self.$container = $(container);
      self.conf = conf = conf || JSON.parse(self.$container.find('.J_conf').val()); // eslint-disable-line
      // self.error可用于记录模块的异常 并且在jstracker平台查看 self.error('api错误')
      // 存在数据描述，异步渲染
      // self._getonsolid(conf);

      self.$container.find('.lazyload').lazyload();
      // 获取
      var allli = [];
      $.each(conf.items2, function(ac, ab) {
        $.each(ab.list, function(ad, af) {
          allli.push(af.list_cityid);
        });
        var city_Id = ab.item_cityid;
        allli.push(city_Id); // 生成一维城市id数组
      });
      // console.log(allli);
      // 保留浏览信息  以免刷新回到最初定位
      if (!window.localStorage) {
        // alert("浏览器支持localstorage");
        // return false
      } else {       
        // var citycode1 = $('.ctiy_current').attr('data-cityId');
        // console.log(window.localStorage,citycode1);

        if (allli.indexOf(window.localStorage.getItem('citycode')) >= 0 && window.localStorage.getItem('banben') == 2) {
          self.$container.find('.current_text').html(window.localStorage.getItem('cityname'));
          self._getnav(conf, window.localStorage.getItem('citycode'));

          var citycode = window.localStorage.getItem('citycode');
         // $('.citylist1[data-id="' + citycode + '"]').trigger('click');
          // self._getonsolidnav(citycode);
        } else {
          self._getLocation(conf);// 城市定位定位到当前城市
          window.localStorage.setItem('banben', 2);
        }
      };     
      self.bindEvent(); 
    },
    // 点击加载更多红包城市
    bindEvent: function() {
      var self = this;

      $('.getmore').on('click', function() {
        // self.pagenum++;
        console.log(self.xyarray, self.pagenum);
        if (self.xyarray[++self.pagenum]) {
          self.$container.find('.pro_list').append(itemtpl({items: self.xyarray[self.pagenum]}));
          
          for (var b = 0; b < self.xyarray[self.pagenum].length; b++) {
            var cityname1 = self.xyarray[self.pagenum][b].cityName;
            self.xyarray[self.pagenum].cityName = cityname1.replace('市', '');
            // console.log(self.xyarray[0][b].cityName);
            $('.building_posi').text(self.xyarray[0][b].cityName);
          }
          self._getHongbao(self.xyarray[self.pagenum]);
          self.$container.find('.lazyload').lazyload();
          // console.log(self.xyarray[self.pagenum].length);
          if (self.xyarray[self.pagenum].length < 4) {
            $('.getmore').hide();
          }
        } else {
          $('.getmore').hide();
        }
      });
      $('.morenav').off('click').on('click', function() {
        $('.morenav').css('display', 'none');
        $('.tjnav').css({'width': '100%', 'height': '100%'});
      });
    },
    // 城市定位定位到当前城市
    _getLocation: function(conf) {
      var self = this;
      var cityId = '', cityName = '';     
      // 无线城市定位
      var params = {
        enableHighAcuracy: true,
        address: true
      };
      window.WindVane.call('WVLocation', 'getLocation', params, function(e) {
       // console.log(e,789);
        cityId = e.address.cityCode; // 城市id
        cityName = e.address.city; // 城市名称
        // tjcitycode = e.address.cityCode;
        self.$container.find('.current_text').html(cityName); // 当前城市
        self.$container.find('.ctiy_current').attr({'data-cityName': cityName, 'data-cityId': cityId});
        window.localStorage.setItem('cityname', cityName);
        self._gettjfloor(conf);
        $('.citylist1[data-id="' + cityId + '"]').trigger('click');
        self._getnav(conf, cityId);// 城市下拉导航
        self._getonsolid(conf, cityId);
      }, function(e) {
        // alert('success: ' + JSON.stringify(e));
        self.$container.find('.current_text').html('其他'); // 当前城市
        window.localStorage.setItem('cityname', '其他');
        self._getnav(conf, '999999');// 城市下拉导航
        // self._getonsolidnav(cityId);
        self._gettjfloor(conf);
        $('.citylist1[data-id="' + '999999' + '"]').trigger('click');
        self._getonsolid(conf, '999999');
      });
    },
    // 城市下拉导航加载运营手填数据和对所有数据做处理
    _getnav: function(conf, cityId) {
      var self = this;
     // console.log(self.conf.items1, conf.items1);
      for (var i = 0; i < conf.items2.length; i++) {
        if (conf.items2[i].list.length > 0) {
          for (var j = 0; j < conf.items2[i].list.length; j++) {
            if (conf.items2[i].list[j].list_cityid == cityId) {
              cityId = conf.items2[i].item_cityid;
              self.$container.find('.current_text').html(conf.items2[i].item_cityname);
              window.localStorage.setItem('cityname', conf.items2[i].item_cityname);
            }
          }
        }
      };
      window.localStorage.setItem('citycode', cityId);
      self.$container.find('.city_list_left').html(itemtplcity(conf));
      self.$container.find('.tjnav').html(itemtplcity1(conf));
      
      // self.$container.find('.getmorenav').html(itemtplcity1(data));
      self.$container.find('.lazyload').lazyload();
      
      var arrId = [];
      $.each(conf.items2, function(i, v) {
        var city_Id = v.item_cityid;
        arrId.push(city_Id); // 生成一维城市id数组
      });
      var str_build = '', city_Id1 = '', city_Id2 = '';
      self.city_Id3 = [];// 一个城市下面的所有城市
     // console.log(arrId, cityId);
      function box(option) {
        $.each(option, function(i, v) {
          if (v.item_cityid == cityId) {
            city_Id1 = v.item_cityid;
            if (city_Id1 && city_Id1.length > 0) {
              if (v.list.length > 0) {
                $.each(v.list, function(index, item) {
                  // console.log(v.list[0].list_buildid);
                  if (index == 0) {
                    city_Id2 = v.list[index].list_cityid;
                  } else {
                    city_Id2 = city_Id2 + ',' + v.list[index].list_cityid;
                  }
                });
                str_build = city_Id1 + ',' + city_Id2;
                self.city_Id3 = str_build.split(',');
              } else {
                str_build = city_Id1;
                self.city_Id3 = str_build.split(',');
              }
            } else {
              if (v.list.length > 0) {
                $.each(v.list, function(index, item) {
                  if (index == 0) {
                    city_Id2 = v.list[index].list_buildid;
                  } else {
                    city_Id2 = city_Id2 + ',' + v.list[index].list_buildid;
                  }
                });
                self.city_Id3 = city_Id2.split(',');
              }
            }
          }
        });
      } 
      if (arrId.indexOf(cityId) >= 0 ) {
        $('.m_con').show();
          
      } else {
        self.city_Id3 = [cityId];
      };
      box(conf.items2);
      box(conf.items);
      console.log(self.conf.items2);
      tjcitycode = self.city_Id3;
      self._getCity(conf, arrId, cityId, self.city_Id3); // 城市定位      
      self._cityChange(conf); // 城市切换
      //   }
      // });
      self.$container.find('.ctiy_current').on('click', function() {
        self.$container.find('.city_box').show();
      });
      self.$container.find('.city-close').on('click', function() {
        self.$container.find('.city_box').hide();
      });
    },
    // 下拉导航切换事件
    _cityChange: function(conf) {
      var self = this;
      var cityName, cityId;
      self.$container.find('.J_city').off('click').on('click', function() {
        self.$container.find('.J_city').removeClass('city-cur');
        $(this).addClass('city-cur');
        cityName = $(this).attr('data-name');
        cityId = $(this).attr('data-id');
        console.log(cityId, $('.citylist1[data-id="' + cityId + '"]'));
       // $('.citylist1[data-id="' + cityId + '"]').trigger('click');
       // console.log($('.citylist1[data-id="' + cityId + '"]'));
        // self._getonsolid();
        self.$container.find('.current_text').html(cityName); // 当前城市
        self.$container.find('.city_box').hide();
        self.$container.find('.build_name').html('');
        self.$container.find('.hongbao_totalnum').html('0');
        self.$container.find('.hongbao_totalpric').html('0');
        self.$container.find('#bottom_tel').val('');
        window.localStorage.setItem('cityname', cityName);
        self._getnav(conf, cityId);
      });
    },
    // 城市切换传数据
    _getCity: function(conf, arrId, cityId, city_Id3) {
      var self = this;
      console.log(conf, city_Id3);
      var cityid;
      if (arrId.indexOf(cityId) >= 0) { // 判断接口定位城市是否属于数组中的id
        for (var i = 0; i < arrId.length; i++) {
          if (arrId[i] == cityId) {
            cityid = self.$container.find('.city-a').eq(i).attr('data-id');
            self.$container.find('.city-a').eq(i).addClass('city-cur');
            self._getBuildinginfo(city_Id3);
            // self._getHongbao(city_Id3);
            self._getsearch(city_Id3);
            self._getonsolid(conf, cityid);
            // return false;
          }
        }
      } else {
        cityid = cityId;
        self._getBuildinginfo(city_Id3);
        // self._getHongbao(city_Id3);
        self._getsearch(city_Id3);
        self._getonsolid(conf, cityid);
      }
    },
    // 模糊搜索  带关键字调转到主链接
    _getsearch: function(city_Id3) {
      // event.keyCode == 13
      var self = this;
      self.arrData = [];
      var _buildid = '';
      // 键盘搜索事件
      self.$container.find('#searchtext').off('keypress').on('keypress', function(e) {  
        var keycode = e.keyCode;  
        var searchName = $(this).val();  
        if (keycode == '13') {  
          e.preventDefault(); 
          self.$container.find('#searchtext').blur();   
          getshhb();           
        }  
      });  
      self.$container.find('.search_btn').off('click').on('click', function() {   
        getshhb();
      });
      // 模糊搜索
      function getshhb() {
        var shearchtext = self.$container.find('#searchtext').val(); 
        _buildid = '"keyword"' + ':' + '"' + shearchtext + '"';   
      // console.log(_buildid);
        var shcityid = [$('.city-cur').attr('data-id')];
      // console.log(shcityid);
        var shitems = self.conf.items2;
        for (var o = 0; o < shitems.length; o++) {
          if (shitems[o].item_cityid == shcityid) {
            for (var p = 0; p < shitems[o].list.length; p++) {
              shcityid.push(shitems[o].list[p].list_cityid);
            }
          }
        }
        mtop.request({
          api: 'mtop.taobao.FangBuildingInfoMtopService.getBuildingListResult',
          v: '1.0',
          ecode: '0',
          data: {
            param: '{' + _buildid + '}',
            pageSize: '500'
          }
        }, function(data) {
          console.log(data);
          // alert('success: ' + JSON.stringify(data));
          var shbuildingList = [];
          if (shcityid[0] != '999999') {
            for (var z = data.data.buildingList.length - 1; z >= 0; z--) {
              for (var y = 0; y < shcityid.length; y++) {
                var hlitem = data.data.buildingList[z];
                if (hlitem.cityId == shcityid[y] && hlitem.preferentialMap[1]) { 
                  shbuildingList.push(data.data.buildingList[z]);
                }
              }
            }
            data.data.buildingList = shbuildingList;
          } else {
            for (var z = data.data.buildingList.length - 1; z >= 0; z--) {
              var hlitem = data.data.buildingList[z];
              if (hlitem.preferentialMap[1]) {
                shbuildingList.push(data.data.buildingList[z]);
              }
            }
            data.data.buildingList = shbuildingList;
          }
          // console.log(data.data.buildingList);
          // 一次显示5个数据  点击显示更多
          if (data.data.buildingList && data.data.buildingList.length > 0) {
            self.xyarray = [];
            while (data.data.buildingList.length > 5) {
              self.xyarray.push(data.data.buildingList.splice(0, 5));
            }
            self.xyarray.push(data.data.buildingList);
            // console.log(self.xyarray);
            self.pagenum = 0;
            self.$container.find('.pro_list').html(itemtpl({items: self.xyarray[0]}));
            self._getHongbao(self.xyarray[0]);
            self.$container.find('.lazyload').lazyload();
          } else {
           // console.log()
            self.$container.find('.search_null').css('display', 'block');
            self.$container.find('.search_nullgo').attr('href', 'http://h5.m.taobao.com/fang/list.html?keyword=' + shearchtext + '&located=1' + '&jiyoujia=1');
            self.$container.find('.search_close').on('click', function() {
              self.$container.find('.search_null').css('display', 'none');
            });
          }
        }, function(error) {

        });
      }
    },
    // 获取楼盘信息
    _getBuildinginfo: function(city_Id3) {
      var self = this;
      console.log(city_Id3);
      self.arrData = [];
      var _buildid = '';
      // _buildid = '"buildingIds"' + ':' + '[' + city_Id3 + ']';
      // _buildid = '"keyword":"万科"';
      var xyindex = 0;
      var xybuildlist = [];
      for (var i = 0; i < city_Id3.length; i++) {
        (function(i) {
          mtop.request({
            api: 'mtop.taobao.FangBuildingInfoMtopService.getBuildingListResult',
            v: '1.0',
            ecode: '0',
            data: {
              cityId: city_Id3[i],
              param: '',
              pageSize: '500'
            }
          }, function(data) {
            //console.log(data.data.buildingList, xybuildlist);
            if (data.data.buildingList) {
              for (var num = 0; num < data.data.buildingList.length; num++) {
                if (data.data.buildingList[num].preferentialMap[1]) {
                  xybuildlist.push(data.data.buildingList[num]);
                }
              }
              xyindex++;
              if (xyindex == city_Id3.length) {
                self.xyarray = [];
                while (xybuildlist.length > 5) {
                  self.xyarray.push(xybuildlist.splice(0, 5));
                }
                self.xyarray.push(xybuildlist);

                self.pagenum = 0;
                //console.log(self.xyarray[0],777);
                self.$container.find('.pro_list').html(itemtpl({items: self.xyarray[0]}));
               // console.log(itemtpl({items: self.xyarray[0]}),789);
                for (var b = 0; b < self.xyarray[0].length; b++) {
                  var cityname1 = self.xyarray[0][b].cityName;
                  self.xyarray[0][b].cityName = cityname1.replace('市', '');
                  // console.log(self.xyarray[0][b].cityName);
                  $('.building_posi').text(self.xyarray[0][b].cityName);
                }
                // console.log(self.xyarray[0].cityName);
                if (self.xyarray[0].length > 4) {
                  $('.getmore').show();
                } else {
                  $('.getmore').hide();
                }
                self._getHongbao(self.xyarray[0]);
              }
            }
          }, function(error) {
            // alert('failure: ' + JSON.stringify(error));
            // console.log(error);
          });
        })(i);
      }
    },
    // 读取楼盘的红包信息
    _getHongbao: function(city_Id3) {
      var self = this;

      var buildid, buildname, telphone, maxpric, minpric, rednum = [], totalcount, totalprice;
      $.each(city_Id3, function(index, item) {
        console.log(typeof item.buildingId);
        mtop.request({
          api: 'mtop.taobao.fangBuildingMtopService.getRedPacketInfo',
          v: '1.0',
          ecode: '0',
          data: {
            buildingId: item.buildingId
          }
        }, function(data) {
          //console.log(data);
          buildid = data.data.model.redpacketList[0].buildingId;
          buildname = data.data.model.redpacketList[0].buildingName;
          telphone = data.data.model.phoneNumber;
          maxpric = data.data.model.redpacketList[0].maxPrice;
          minpric = data.data.model.redpacketList[0].minPrice;
          rednum = data.data.model.redpacketList[0].redpackets;
          totalcount = data.data.model.totalCount;
          totalprice = data.data.model.redpacketList[0].totalPrice;
          //console.log(rednum,888);
          self.$container.find('.J_' + buildid).find('.building_hb').attr({'data-buildname': buildname, 'data-telphone': telphone});
          if (rednum != null) {
            self.$container.find('.J_' + buildid).find('.building_hb').html(itemtplHb({items: rednum, totalcount: totalcount, maxpric: maxpric, minpric: minpric}));
            self.$container.find('.J_' + buildid).attr('data-totalprice', totalprice);
            self.$container.find('.J_' + buildid).find('.list_totalprice').html(totalprice);
            self.$container.find('.J_' + buildid).find('.building_hb').attr({'data-buildid': buildid, 'data-totalcount': totalcount, 'data-totalprice': totalprice});
            self.$container.find('.lazyload').lazyload();
            if (index == city_Id3.length - 1) {
              self._getCouponOrder();
              self._getsearch();
            }
          }
        }, function(error) {
         // console.log(error);
        });
      });
    },
    // 底部浮层获取对应楼盘数据
    _getFloatData: function() {
      var self = this;
      var buildid, buildname, totalcount, totalprice, telphone;
      $('body').on('click', '.list_click', function() { // 事件代理
        self.$container.find('.list_click').removeClass('list_li_cur');
        $(this).addClass('list_li_cur');
        buildid = $(this).find('.building_hb').attr('data-buildid');
        buildname = $(this).find('.building_hb').attr('data-buildname');
        totalcount = $(this).find('.building_hb').attr('data-totalcount');
        totalprice = $(this).find('.building_hb').attr('data-totalprice');
        telphone = $(this).find('.building_hb').attr('data-telphone');
        // self.$container.find('.build_name').html('');
        // self.$container.find('.hongbao_totalnum').html('0');
        // self.$container.find('.hongbao_totalpric').html('0');
        // self.$container.find('.bottom_tel').val('');
        // if (buildname) {
        //   self.$container.find('.build_name').html(buildname);
        // }
        // if (totalcount) {
        //   self.$container.find('.hongbao_totalnum').html(totalcount);
        // }
        // if (totalprice) {
        //   self.$container.find('.hongbao_totalpric').html(totalprice);
        // }
        if (telphone) {
          self.$container.find('#bottom_tel').val(telphone);
        }
        self.$container.find('.bottom_float').attr({'data-buildid': buildid, 'data-telphone': telphone});
      });
    },
    // 特价房获取位置
    _getonsolid: function(conf, cityid) {
      var self = this;
      var cityid = cityid;
     // alert(123);
      XCtrl.dynamic(conf, 'items1', function(data) {
        self.$container.find('.tejiahouse').html(itemtplTj(data));
        // 模板完绑定事件       
        self._gettjfloor(conf);
        $('.citylist1[data-id="' + cityid + '"]').trigger('click');
      });
      var shoplen = self.$container.find('.shoplist').length;
      for (var l = 0; l < shoplen; l++) {
        if (self.$container.find('.shoplist').eq(l).attr('data-num') == 0) {
          self.$container.find('.shoplist').eq(l).find('.opbox').css('display', 'block');
          self.$container.find('.shoplist').eq(l).find('.opbox2').css('display', 'block');
        }       
      }
    },
    // 特价房导航点击事件
    _gettjfloor: function(conf) {  
      var self = this;
      $('.citylist1').off('click').on('click', function() {
        var cityid = $(this).attr('data-id');
        
       // alert(cityid);
        var cityarr = $('.citylist1'); 
        var b = $(this).index();
        $('.tjnav').prepend($('.citylist1').slice(b));
        self.$container.find('.citylist1').removeClass('citylistcur');
        $(this).addClass('citylistcur');
        $('.tjnav').css({'width': '7rem', 'height': '0.7rem'});
        $('.morenav').css('display', 'block');
          
       // console.log(cityid);
        self._getonsolidnav(conf, cityid);
      });
    },
    // 特价房点击导航切换到相应的城市数据
    _getonsolidnav: function(conf, cityid) {
      var self = this;
      // console.log($('.citylist1[data-id="' + cityid + '"]'), '.citylist1[data-id="' + cityid + '"]')
      var elesArray = Array.prototype.slice.call(self.$container.find('.shoplist'));
      var onsolid = [];
      for (var i = 0; i < elesArray.length; i++) {
        var citynamearr = elesArray[i].getAttribute('data-city');
        var orderarr = [];
        var arrs = citynamearr.indexOf(cityid);
        // console.log(cityid);
        orderarr = arrs;
        elesArray[i].style.display = 'none';
        if (orderarr >= 0) {
          elesArray[i].style.display = 'block';
        }        
      }; 
      self._getaddbanner(conf, cityid);  
    },
    // 添加特价房中间的广告栏位 
    _getaddbanner: function(conf, cityid) {
      var self = this;
      if ($('.tjbanner')) {
        $('.tjbanner').remove();
      };
      var tejarr = [];
      var tejarr = $('.shoplist[data-city="' + cityid + '"]');
      if (tejarr.length < 2) {
        if (conf.moduleinfo.disign) {
          tejarr.eq(tejarr.length - 1).append('<a href="" class="tjbanner"><img src=""></a>');
          self.$container.find('.tjbanner').attr('href', conf.moduleinfo.tjbanurl);
          self.$container.find('.tjbanner img').attr('src', conf.moduleinfo.tjbanpic);
        }        
        self.$container.find('.lazyload').lazyload({
          offsetY: 100
        });
      } else {
        if (conf.moduleinfo.disign) {
         // console.log(tejarr.eq(1));
          tejarr.eq(1).append('<a href="" class="tjbanner"><img src=""></a>');
          self.$container.find('.tjbanner').attr('href', conf.moduleinfo.tjbanurl);
          self.$container.find('.tjbanner img').attr('src', conf.moduleinfo.tjbanpic);
        }        
        self.$container.find('.lazyload').lazyload({
          offsetY: 100
        });
      }  
    },
    // 领取红包
    _getCouponOrder: function() {
      var self = this;
      var buildid;
      // console.log(self.$container.find('.building_hongbao'));
      self.$container.find('.building_hb').on('click', function() {
       // alert(self.$container.find('.building_hongbao'));
        self.$container.find('.alert_lq').css('display', 'block');
        buildid = $(this).attr('data-buildid');
      });
      self.$container.find('.bottom_btn').off('click').on('click', function() {
        if (!login.isLogin()) {
          login.goLogin();
        } else {
          // var buildid = self.$container.find('.bottom_float').attr('data-buildid');
          var telphone = self.$container.find('#bottom_tel').val();
          // console.log(buildid);
          var yztel = /^1[3578]\d{9}$/;
          if (!yztel.test(telphone)) {
            new Toast('请输入有效的手机号码!', 3000);
          } else {
            mtop.request({
              api: 'mtop.taobao.fangservice.submitCouponOrder',
              v: '1.0',
              ecode: '1',
              data: {
                phoneNumber: telphone,
                buildingId: buildid
              }
            }, function(data) {
              // console.log(data);
              self.$container.find('.alert_lq').css('display', 'none');
              self.$container.find('.m_mark').show();
              self.$container.find('.m_tk').show();
              self.$container.find('.tk_buliding').attr('href', 'https://h5.m.taobao.com/mfang/detail/index.html?buildingId=' + buildid);
              self.$container.find('.tk_close').on('click', function() {
                self.$container.find('.m_mark').hide();
                self.$container.find('.m_tk').hide();
                self.$container.find('.m_tk').on('click', function() {
                  self.$container.find('.m_mark').hide();
                });
              });
            }, function(error) {
              // console.log(error);
              new Toast('领取失败!网络不太流畅，请稍后重试哦!', 3000);
            });
          }
        }
      });
      self.$container.find('.hb_close').on('click', function() {
        self.$container.find('.alert_lq').css('display', 'none');
      });
      self.$container.find('.ylclose').on('click', function() {
        self.$container.find('.m_mark').hide();
        self.$container.find('.m_tk').hide();
      });
    },
    // 特价房根据城市名排序的方法
    // sort: function(a, b) {
    //  // console.log(tjcitycode, a.citycode, b.citycode);
    //   var bool = -1;
    //   for (var i = 0; i < tjcitycode.length; i++) {
    //     if (a.citycode != tjcitycode[i] && b.citycode == tjcitycode[i]) {
    //       bool = 1;
    //     }
    //   }
    //   return bool;
    // }
    // 根据红包总金额楼盘排序
    //  _getRedAmountSort: function() {
    //   var self = this;
    //   var items = self.$container.find('.list_li');
    //   var itArray = [].map.call(items, function(ele) {
    //     return ele.cloneNode(true);
    //   });
    //   self.$container.find('.pro_list').html('');
    //   itArray.sort(function(a, b) {
    //     return parseInt(b.children[0].innerText) - parseInt(a.children[0].innerText);
    //   });
    //   render();
    //   function render() {
    //     for (var i = 0; i < itArray.length; i++) {
    //       self.$container.find('.pro_list').show();
    //       self.$container.find('.pro_list').append(itArray[i]);
    //       self.$container.find('.lazyload').lazyload();
    //     }
    //   }
    // } 
  };

  return Mod;

});
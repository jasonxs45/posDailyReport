var today = new Date();
var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
var cwdata = {};
var lwdata = {};
function formatNumber(num, cent, isThousand) {
  num = num.toString().replace(/\$|\,/g, '');

  // 检查传入数值为数值类型
  if (isNaN(num))
    num = "0";

  // 获取符号(正/负数)
  sign = (num == (num = Math.abs(num)));

  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001);  // 把指定的小数位先转换成整数.多余的小数位四舍五入
  cents = num % Math.pow(10, cent);              // 求出小数位数值
  num = Math.floor(num / Math.pow(10, cent)).toString();   // 求出整数位数值
  cents = cents.toString();               // 把小数位转换成字符串,以便求小数位长度

  // 补足小数位到指定的位数
  while (cents.length < cent)
    cents = "0" + cents;

  if (isThousand) {
    // 对整数部分进行千分位格式化.
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  // if (cent > 0)  
  //   return (((sign)?'':'-') + num + '.' + cents);  
  // else  
  return (((sign) ? '' : '-') + num);
}
var comdify = function (num) {
  return formatNumber(num, 0, 1);
}
var statistic = Vue.component('statistic', {
  name: 'statistic',
  data: function () {
    return {
      lightBoxInfo: {
        workdayRange: [0, 0],
        weekendRange: [0, 0],
        state: 0,
        info: ''
      },
      showInfo: false,
      mallid: 2,
      market: '壹方',
      markets: ['新天地|1', '壹方|2'],
      pickerOptions: {
        disabledDate: function (time) {
          var minDate = new Date('2017/12/01');
          return time.getTime() > yesterday.getTime() || time.getTime() < minDate.getTime();
        }
      },
      topRank: [{
        name: '测试信息',
        count: 123
      }],
      currentDate: yesterday,
      currentDateVal: yesterday.getFullYear() + '/' + (yesterday.getMonth() + 1) + '/' + yesterday.getDate(),
      currentFloor: '',
      top: 0,
      topMap: [{
        name: 3,
        val: '三'
      }],
      tableData: [],
      staticsData: [],
      echartXlabels: [],
      typeTableData: [],
      mainTableData: [],
      weekData: {
        cwdata: [],
        lwdata: []
      }
    }
  },
  computed: {
    year: function () {
      return new Date(this.currentDateVal).getFullYear();
    },
    month: function () {
      return new Date(this.currentDateVal).getMonth() + 1;
    },
    date: function () {
      return new Date(this.currentDateVal).getDate();
    },
    weekday: function () {
      return new Date(this.currentDateVal).getDay();
    },
    day: function () {
      return new Date(this.currentDateVal).getFullYear() + '/' +
        (new Date(this.currentDateVal).getMonth() + 1) + '/' +
        new Date(this.currentDateVal).getDate();
    },
    monthTotal: function () {
      return 1
    }
  },
  created: function () {
    // 初始化数据
    this.mallid = getQueryStringByName("mallid") || this.mallid;
    this.market = this.mallid == 1 ? '新天地' : this.mallid == 2 ? '壹方' : '';
    this.currentDateVal = getQueryStringByName("day") || this.currentDateVal;
    this.top = getQueryStringByName("top") || this.top;
    this.getLightInfo();
    this.getList();
    this.getShopByTop();
    this.getStaticsTop();
    this.getWeekStatistic(this.currentDateVal);
    this.getTypeState();
    this.getMainState();
  },
  mounted: function () {
    var _self = this;
  },
  activated: function () {
    var timeout = setTimeout(function () {
      layer.close(layerIndex);
      clearTimeout(timeout)
    }, 200);
    if (app) {
      app.$el.scrollTop = 0;
      app.$el.onscroll = null;
    }
  },
  methods: {
    comdify: function (num) {
      num = num.toString().replace(/\$|\,/g, '');
      // 检查传入数值为数值类型
      if (isNaN(num))
        num = "0";

      // 获取符号(正/负数)
      sign = (num == (num = Math.abs(num)));

      num = Math.floor(num * Math.pow(10, 2) + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入
      cents = num % Math.pow(10, 2); // 求出小数位数值
      num = Math.floor(num / Math.pow(10, 2)).toString(); // 求出整数位数值
      cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度

      // 补足小数位到指定的位数
      while (cents.length < 2)
        cents = "0" + cents;
      if (1) {
        // 对整数部分进行千分位格式化.
        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
          num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
      }
      //if (2 > 0)
      //  return (((sign) ? '' : '-') + num + '.' + cents);
      //else
      return (((sign) ? '' : '-') + num);
    },
    changeMall: function (val) {
      this.mallid = val.split('|')[1];
      console.log(this.mallid)
      this.getLightInfo();
      this.getList();
      this.getShopByTop();
      this.getStaticsTop();
      this.getWeekStatistic(this.currentDateVal);
      this.getTypeState();
      this.getMainState();
    },
    changeDate: function (val) {
      this.currentDateVal = val;
      this.currentDate = new Date(val);
      this.getLightInfo();
      this.getList();
      this.getShopByTop();
      this.getStaticsTop();
      this.getWeekStatistic(this.currentDateVal);
      this.getTypeState();
      this.getMainState();
      this.$nextTick(function () {
        // this.initEcharts(cwdata, lwdata)
      })
    },
    selectRank: function (event) {
      this.top = event.target.value;
      this.getShopByTop();
    },
    getTypeState: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "GetOperationTable",
          "openid": window.sessionStorage.Global_openid,
          "day": _self.currentDateVal,
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            var tabledata = res.Data.List
            for (var i = 0; i < tabledata.length; i++) {
              for (var j = 0; j < tabledata[i].length; j++) {
                tabledata[i][j] = typeof tabledata[i][j] === 'number' ? comdify(tabledata[i][j]) : tabledata[i][j]
              }
            }
            _self.typeTableData = tabledata
          }
        }
      });
    },
    getMainState: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "GetMainShopsTable",
          "openid": window.sessionStorage.Global_openid,
          "day": _self.currentDateVal,
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            var tabledata = res.Data.List
            for (var i = 0; i < tabledata.length; i++) {
              for (var j = 0; j < tabledata[i].length; j++) {
                tabledata[i][j] = typeof tabledata[i][j] === 'number' ? comdify(tabledata[i][j]) : tabledata[i][j]
              }
            }
            _self.mainTableData = tabledata
          }
        }
      });
    },
    getLightInfo: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "getlightboxinfo",
          "openid": window.sessionStorage.Global_openid,
          "date": _self.currentDateVal,
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            _self.lightBoxInfo = res.Data;
          }
        }
      });
    },
    getList: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "getstatics",
          "openid": window.sessionStorage.Global_openid,
          "day": _self.currentDateVal,
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            _self.tableData = res.Data;
            _self.tableData.forEach(function (item) {
              // item.GrossSales = _self.comdify(item.GrossSales);
              // item.SalesTarget = _self.comdify(item.GrossSales);
            })
          }
        }
      })
    },
    getShopByTop: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "getshopbytop",
          "openid": window.sessionStorage.Global_openid,
          "day": _self.currentDateVal,
          "MallID": _self.mallid,
          "top": _self.topMap[_self.top].name,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            _self.topRank = res.Data;
          }
        }
      });
    },
    getStaticsTop: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "getstaticstop",
          "openid": window.sessionStorage.Global_openid,
          "day": _self.currentDateVal,
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode == 0) {
            _self.staticsData = res.Data;
            // _self.staticsData = res.ErrorMsg.split('|');
            // for (var i = 0; i < _self.staticsData.length; i++) {
            //   if (i == 3 || i == 4) {
            //     _self.staticsData[i] = _self.staticsData[i] == '' ? 0 : _self.staticsData[i] == 0 ? 0 : _self.comdify(_self.staticsData[i]).split('.')[0];
            //   }
            //   if (i == 0 || i == 1 || i == 2 || i == 5 || i == 6 || i == 8 || i == 9) {
            //     _self.staticsData[i] = _self.comdify(_self.staticsData[i]);
            //   }
            // }
            // _self.isSubmit = _self.staticsData[_self.staticsData.length-1];
          }
        }
      });
    },
    getStatisticData: function () {
      var _self = this;
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async: false,
        data: {
          "v": "updateRemark",
          "openid": window.sessionStorage.Global_openid,
          "MallID": _self.mallid,
          "day": _self.currentDateVal,
          "Remark": Remark,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          if (res.ErrorCode != 0) {
            $.alert(res.ErrorMsg);
          } else {
            $.alert("保存成功！", function () {
              location.href = 'admin_shop_report.shtml';
            });
          }
        }
      });
    },
    getWeekStatistic: function (day) {
      var _self = this;
      var cday = new Date(day);
      var lday = new Date(cday - 7 * 24 * 3600 * 1000);
      lday = lday.getFullYear() + '/' + [lday.getMonth() + 1] + '/' + lday.getDate();
      var xlabels1 = [];
      var cwdata1 = [];
      var lwdata1 = [];
      var knum1 = [];
      var cnum1 = [];
      var knum2 = [];
      var cnum2 = [];
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        data: {
          "v": "getweekstatic",
          "MallID": _self.mallid,
          "day": day,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail: function () {
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          for (var i = 0; i < res.Data.length; i++) {
            var date = new Date(res.Data[i].weekdate);
            var labeltext = _self.transferweekday(date.getDay()) + '\n' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
            // var labeltext = _self.transferweekday(new Date(res.Data[i].weekdate).getDay())+'\n'+res.Data[i].weekdate.substring(5,res.Data[i].weekdate.length)
            xlabels1.push(labeltext);
            cwdata1.push(res.Data[i].GrossSales);
            knum1.push(res.Data[i].KNum == '' ? 0.0 : (parseInt(res.Data[i].KNum)));
            cnum1.push(res.Data[i].CNum == '' ? 0.0 : (parseInt(res.Data[i].CNum)));
          }
          cwdata.grosssales = cwdata1;
          cwdata.knum = knum1;
          cwdata.cnum = cnum1;
          _self.xlabels = xlabels1;
          _self.initEcharts(_self.xlabels, cwdata, lwdata);
        }
      });
      var layerindex1 = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        data: {
          "v": "getweekstatic",
          "MallID": _self.mallid,
          "day": lday,
          "r": Math.random() * 10000
        },
        beforeSend: function () {
          layerindex1 = layer.open({
            type: 2,
            content: '加载中',
            shadeClose: false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex1)
        },
        fail: function () {
          layer.close(layerindex1)
        },
        success: function (res) {
          layer.close(layerindex1)
          for (var i = 0; i < res.Data.length; i++) {
            lwdata1.push(res.Data[i].GrossSales);
            knum2.push(res.Data[i].KNum == '' ? 0.0 : (parseInt(res.Data[i].KNum)));
            cnum2.push(res.Data[i].CNum == '' ? 0.0 : (parseInt(res.Data[i].CNum)));
          }
          lwdata.grosssales = lwdata1;
          lwdata.knum = knum2;
          lwdata.cnum = cnum2;
          _self.initEcharts(_self.xlabels, cwdata, lwdata);
        }
      });
    },
    initEcharts: function (xlabels, cwdata, lwdata) {
      var _self = this;
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(this.$refs.echart);
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: 'axis',
          position: function (point, params, dom, rect, size) {
            // 固定在顶部
            var arr = [point[0], '10%']
            if (point[0] + dom.clientWidth > size.viewSize[0]) {
              arr[0] = point[0] - dom.clientWidth;
            }
            return arr;
          }
        },
        legend: {
          type: 'scroll',
          data: ['本周营业额', '上周营业额', '本周车流', '本周客流', '上周车流', '上周客流']
        },
        textStyle: {
          fontSize: 8
        },
        toolbox: {
          show: false,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: {
              readOnly: false
            },
            magicType: {
              type: ['line', 'bar']
            },
            restore: {},
            saveAsImage: {}
          },
          textStyle: {
            fontSize: 8
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          axisLabel: {
            fontSize: 8,
          },
          data: xlabels
        },
        yAxis: [{
          name: '营业额(百万)',
          type: 'value',
          axisLabel: {
            formatter: function (value, index) {
              return value / 1000000;
            },
            textStyle: {
              fontSize: 8
            }
          }
        },
        {
          type: 'value',
          name: '客流(万次)/\n车流(万次)',
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: function (value, index) {
              return (value / 10000).toFixed(1)
            }
          },
          textStyle: {
            fontSize: 8
          }
        }
        ],
        series: [{
          name: '本周营业额',
          type: 'line',
          data: cwdata.grosssales,
          // markLine: {
          //   data: [{
          //     type: 'average',
          //     name: '平均值'
          //   }]
          // }
        },
        {
          name: '上周营业额',
          type: 'line',
          data: lwdata.grosssales,
          // markLine: {
          //   data: [
          //     {
          //       type: 'average',
          //       name: '平均值'
          //     },
          //     [{
          //       symbol: 'none',
          //       x: '90%',
          //       yAxis: 'max'
          //     }, {
          //       symbol: 'circle',
          //       label: {
          //         normal: {
          //           position: 'start',
          //           formatter: '最大值'
          //         }
          //       },
          //       type: 'max',
          //       name: '最高点'
          //     }]
          //   ]
          // }
        },
        {
          name: '本周车流',
          type: 'bar',
          stack: '本周',
          yAxisIndex: 1,
          data: cwdata.cnum,
          itemStyle: {
            normal: {
              color: '#c03736'
            }
          }
        },
        {
          name: '本周客流',
          type: 'bar',
          stack: '本周',
          yAxisIndex: 1,
          data: cwdata.knum,
          itemStyle: {
            normal: {
              color: '#e78f72'
            }
          }
        },
        {
          name: '上周车流',
          type: 'bar',
          stack: '上周',
          yAxisIndex: 1,
          data: lwdata.cnum,
          itemStyle: {
            normal: {
              color: '#0d6797'
            }
          }
        },
        {
          name: '上周客流',
          type: 'bar',
          stack: '上周',
          yAxisIndex: 1,
          data: lwdata.knum,
          itemStyle: {
            normal: {
              color: '#51abcc'
            }
          }
        }
        ]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },
    goMarket: function () {
      var _self = this;
      this.$router.push({
        name: 'marketquery',
        params: {
          "v": "shopdailystatic",
          "openid": window.sessionStorage.Global_openid,
          'day': _self.currentDateVal,
          "MallID": _self.mallid,
          "Floor": '',
          "Shopname": '',
          "operationcategory": '',
          "r": Math.random() * 10000
        }
      })
    },
    floorClick: function (val) {
      var _self = this;
      this.currentFloor = val
      this.$router.push({
        name: 'marketquery',
        params: {
          "v": "shopdailystatic",
          "openid": window.sessionStorage.Global_openid,
          'day': _self.currentDateVal,
          "MallID": _self.mallid,
          "Floor": _self.currentFloor,
          "Shopname": '',
          "operationcategory": '',
          "r": Math.random() * 10000
        }
      })
    },
    toggleInfo: function () {
      this.showInfo = !this.showInfo
    },
    transferweekday: function (n) {
      var txt = ''
      switch (n) {
        case 0:
          txt = '日'
          break;
        case 1:
          txt = '一'
          break;
        case 2:
          txt = '二'
          break;
        case 3:
          txt = '三'
          break;
        case 4:
          txt = '四'
          break;
        case 5:
          txt = '五'
          break;
        case 6:
          txt = '六'
          break;
      }
      return '周' + txt;
    }
  },
  filters: {
    comdify: comdify,
    seperateName: function (str) {
      return str.split('|')[0]
    },
    fweekday: function (n) {
      var txt = ''
      switch (n) {
        case 0:
          txt = '日'
          break;
        case 1:
          txt = '一'
          break;
        case 2:
          txt = '二'
          break;
        case 3:
          txt = '三'
          break;
        case 4:
          txt = '四'
          break;
        case 5:
          txt = '五'
          break;
        case 6:
          txt = '六'
          break;
      }
      return txt;
    }
  },
  template: '<div class="statistic">\
            <div class="maintit" style="margin-top:0">\
              <span class="itemname">\
                <el-select v-model="market" placeholder="请选择" @change="changeMall">\
                  <el-option v-for="(item,index) in markets" :label="item|seperateName" :value="item" key="market-{{index}}"></el-option>\
                </el-select>\
              </span>项目截止\
              <el-date-picker size="mini" class="pickdate" :picker-options="pickerOptions" v-model="currentDateVal" format="yyyy/MM/dd"\
              :clearable=false :editable=false @change="changeDate"\
              value-format="yyyy/MM/dd" type="date" placeholder="选择日期"></el-date-picker>\
              ，营业情况\
            </div>\
            <p v-if="!staticsData.submit" class="not-submit">注：数据尚未提交</p>\
            <div class="flex">\
              <div class="cur-day w100">\
                <div class="wrapper">\
                  <h3 class="subtit">当日&nbsp;&nbsp;&nbsp;\
                  <span style="font-weight:400;font-size:80%;">{{year}}年{{month}}月{{date}}日&nbsp;\
                  星期{{weekday|fweekday}}&nbsp;\
                  天气：{{staticsData.weather}}</span>\
                  </h3>\
                  <h4 class="dottit">整体情况</h4>\
                  <div class="flex" style="margin-left:-.3rem;margin-right:-.3rem;">\
                    <div class="cur-day">\
                      <p class="pragrah">\
                        <span class="ph">总营业额:</span>\
                        <i class="light" @click="toggleInfo"\
                        :class="lightBoxInfo.state == 0?\'red\':lightBoxInfo.state == 1?\'base\':\'green\'"></i>\
                        <span class="pb">{{comdify(Math.round(staticsData.day_sales))}}</span>\
                      </p>\
                      <p class="pragrah">\
                        <span class="ph">开业面积:</span>\
                        <span class="pb pr">{{comdify(Math.round(staticsData.all_area))}}</span>\
                      </p>\
                      <p class="pragrah">\
                        <span class="ph">30天月化坪效:</span>\
                        <span class="pb pr">{{comdify(Math.round(staticsData.day_sales/staticsData.all_area*30))}}</span>\
                      </p>\
                    </div>\
                    <div class="cur-day">\
                      <p class="pragrah">\
                        <span class="ph">客流量:</span>\
                        <span class="pb">{{comdify(staticsData.customer_count)}}</span>\
                      </p>\
                      <p class="pragrah">\
                        <span class="ph">总进店人数:</span>\
                        <span class="pb">{{comdify(staticsData.visitor_count)}}</span>\
                      </p>\
                      <p class="pragrah">\
                        <span class="ph">车流量:</span>\
                        <span class="pb">{{comdify(staticsData.car_count)}}</span>\
                      </p>\
                    </div>\
                  </div>\
                  <h4 class="dottit">业态情况</h4>\
                  <table class="table">\
                    <thead>\
                      <tr>\
                        <th></th>\
                        <th>面积(㎡)</th>\
                        <th>营业额(元)</th>\
                        <th>月化坪效(元/㎡)</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr v-for="(tr, index) in typeTableData">\
                        <td v-for="(td, index1) in tr">{{td}}</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                  <h4 class="dottit">主力店情况</h4>\
                  <table class="table">\
                    <thead>\
                      <tr>\
                        <th></th>\
                        <th>面积(㎡)</th>\
                        <th>营业额(元)</th>\
                        <th>月化坪效(元/㎡)</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr v-for="(tr, index) in mainTableData">\
                        <td v-for="(td, index1) in tr">{{td}}</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
            <div class="flex">\
              <div class="cur-day">\
                <div class="wrapper">\
                  <h3 class="subtit">当月</h3>\
                  <p class="pragrah">\
                    <span class="ph">总销售预算:</span>\
                    <span class="pb">{{comdify(staticsData.month_target)}}</span>\
                  </p>\
                  <p class="pragrah">\
                    <span class="ph">总销售:</span>\
                    <span class="pb">{{comdify(Math.round(staticsData.month_sales))}}</span>\
                  </p>\
                  <p class="pragrah">\
                    <span class="ph">总体完成率:</span>\
                    <span class="pb">{{(100*staticsData.month_sales/staticsData.month_target).toFixed(1)}}%</span>\
                  </p>\
                </div>\
              </div>\
              <div class="cur-month">\
                <div class="wrapper">\
                  <h3 class="subtit">当年</h3>\
                  <p class="pragrah">\
                    <span class="ph">总销售预算:</span>\
                    <span class="pb">{{comdify(staticsData.year_target)}}</span>\
                  </p>\
                  <p class="pragrah">\
                    <span class="ph">总销售:</span>\
                    <span class="pb">{{comdify(Math.round(staticsData.year_sales))}}</span>\
                  </p>\
                  <p class="pragrah">\
                    <span class="ph">总体完成率:</span>\
                    <span class="pb">{{(100*staticsData.year_sales/staticsData.year_target).toFixed(1)}}%</span>\
                  </p>\
                </div>\
              </div>\
            </div>\
            <div style="position:relative">\
              <div class="maintit">当日销售\
                <div class="rank-mode">\
                  <span class="txt">前{{topMap[top].val}}名</span>\
                </div>\
              </div>\
              <div class="gomarket" @click="goMarket">\
                <span class="text">全部店铺明细</span>\
                <i class="el-icon-arrow-right"></i>\
              </div>\
            </div>\
            <div class="inline-container">\
              <template v-if="topRank&&topRank.length>0">\
                <div class="inline-row">\
                  <div v-for="(item,index) in topRank" class="top3">\
                    <p class="name">{{item.ShopName}}</p>\
                    <p class="count">{{comdify(item.GrossSales)}}</p>\
                  </div>\
                </div>\
              </template>\
              <template v-else>\
                <div class="nodata" style="margin:.5rem;">尚无信息</div>\
              </template>\
            </div>\
            <div class="maintit">备注信息</div>\
            <div class="weui_cells_title extrainfo">\
              <p  v-if="staticsData.remark" class="" v-html="staticsData.remark"></p>\
              <div v-else class="nodata">尚无信息</div>\
            </div>\
            <div class="maintit">当月预算完成情况</div>\
            <div id="listMonthlySaleLog" style="text-align: right;">\
              <template v-if="tableData.length>0">\
                <p>\
                  <span>楼层</span>\
                  <span>销售预算</span>\
                  <span>累计销售</span>\
                  <span>完成率</span>\
                </p>\
                <p v-for="(item,index) in tableData" >\
                  <span @click="floorClick(item.Location)">{{item.Location}}</span>\
                  <span>{{comdify(item.SalesTarget)}}</span>\
                  <span>{{comdify(item.GrossSales)}}</span>\
                  <span>{{(item.GrossSales*100 / item.SalesTarget).toFixed(1)}}%</span>\
                </p>\
                <p>\
                  <span>合计</span>\
                  <span>{{comdify(staticsData.month_target)}}</span>\
                  <span>{{comdify(staticsData.month_sales)}}</span>\
                  <span>{{(100*staticsData.month_sales/staticsData.month_target).toFixed(1)}}%</span>\
                </p>\
              </template>\
              <template v-else>\
                <div class="nodata">尚无信息</div>\
              </template>\
            </div>\
            <div class="maintit">本周上周对比</div>\
            <div class="echart">\
              <div class="echart-wrapper" ref="echart"></div>\
            </div>\
            <div class="light-box-info" v-show="showInfo"  @click="toggleInfo">\
              <div class="flex">\
                <div class="wrapper">\
                  <div class="shopname">{{market.split(\'|\')[0]}}</div>\
                  <div class="subtit">营业额基准范围：</div>\
                  <div class="year">{{year}}年</div>\
                  <div class="range">工作日：{{comdify(lightBoxInfo.workdayRange[0]/10000)}} - {{comdify(lightBoxInfo.workdayRange[1]/10000)}}万</div>\
                  <div class="range">节假日：{{comdify(lightBoxInfo.weekendRange[0]/10000)}} - {{comdify(lightBoxInfo.weekendRange[1]/10000)}}万</div>\
                  <div class="info">基准值取数依据{{lightBoxInfo.info}}工作日与节假日比例关系，将{{year}}年销售KPI拆分到\
                  工作日/节假日，基准范围为基准值+/-0.5个标准差。</div>\
                </div>\
              </div>\
            </div>\
        </div>'
})
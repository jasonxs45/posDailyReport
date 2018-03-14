var today = new Date();
var yesterday = new Date(today.getTime()-24*60*60*1000);
var year = today.getFullYear();
var month = today.getMonth() + 1;
var year2 = year;
var month2 = parseInt(month) - 1;  
if (month2 == 0) {
    year2 = parseInt(year2) - 1;  
    month2 = 12;  
} 
function formatNumber(num,cent,isThousand) {
  num = num.toString().replace(/\$|\,/g,''); 

  // 检查传入数值为数值类型
    if(isNaN(num))  
      num = "0";  

  // 获取符号(正/负数)
  sign = (num == (num = Math.abs(num)));  

  num = Math.floor(num*Math.pow(10,cent)+0.50000000001);  // 把指定的小数位先转换成整数.多余的小数位四舍五入
  cents = num%Math.pow(10,cent);              // 求出小数位数值
  num = Math.floor(num/Math.pow(10,cent)).toString();   // 求出整数位数值
  cents = cents.toString();               // 把小数位转换成字符串,以便求小数位长度

  // 补足小数位到指定的位数
  while(cents.length<cent)  
    cents = "0" + cents;  

  if(isThousand) {  
    // 对整数部分进行千分位格式化.
    for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)  
      num = num.substring(0,num.length-(4*i+3))+','+ num.substring(num.length-(4*i+3));  
  }  

  // if (cent > 0)  
  //   return (((sign)?'':'-') + num + '.' + cents);  
  // else  
    return (((sign)?'':'-') + num);  
}  
var comdify = function(num){
  return formatNumber(num,0,1);
}
var shopquery = Vue.component('shopquery', {
  name: 'shopquery',
  data: function () {
    return {
      mallid:'',
      market:'',
      markets:['新天地|1','壹方|2'],
      pickerOptions:{
        disabledDate:function(time){
          var minDate = new Date('2017/12/01');
          return time.getTime() > yesterday.getTime() || time.getTime()< minDate.getTime();
        }
      },
      floors: [],
      states: [],
      shops:[],
      form: {
        mallid: '',
        floor: '',
        operationcategory: '',
        year:year2+'',
        month:year2+'-'+month2,
        shop:''
      },
      tableData: null,
      areaeffect:'',
      customerprice:'',
      saletarget:'',
      salerate:'',
      fixThead:false,
      fixColumn:false,
      summaries:''
    }
  },
  computed: {
    selectedYear:function(){
      return new Date(this.form.year);
    },
    calcTableDate: function () {
      var _self = this;
      this.tableData.forEach(function (item) {
        item.WeekDay = new Date(item.MonthDate).getDay();
        item.WeekDay = _self.transferWeek(item.WeekDay);
        item.miniMonthDate = item.MonthDate.substring(2,item.MonthDate.length);
        // +'|'+item.WeekDay;
        // item.MonthDate = item.MonthDate+'\n'+item.WeekDay;
        item.GrossSales = item.GrossSales;
        item.GrossSales = _self.comdify(item.GrossSales);
        item.CustomerOrders = _self.comdify(item.CustomerOrders);
        item.CustomerNum = _self.comdify(item.CustomerNum);
      });
      return this.tableData;
    },
    xAxis:function(){
      var xAxis = [];
      for(var i =0;i<this.tableData.length;i++){
        xAxis.push(parseInt(this.tableData[i].MonthDate.substring(8)))
      }
      return xAxis;
    },
    yAxis:function(){
      var yAxis = [];
      for(var i =0;i<this.tableData.length;i++){
        this.tableData[i].GrossSales = Number(this.tableData[i].GrossSales.replace(/\,/g,''));
        yAxis.push(this.tableData[i].GrossSales);
      }
      return yAxis;
    }
  },
  filters:{
    seperateName:function(str){
      return str.split('|')[0]
    }
  },
  created: function () {
  },
  mounted:function(){
  },
  activated:function(){
    var timeout = setTimeout(function() {
      layer.close(layerIndex);
      clearTimeout(timeout)
    }, 200);
    // 清除页面滚动
    this.fixThead = false;
    if(app){
      app.$el.scrollTop = 0;
      app.$el.onscroll = null;
    }
    var _self = this;
    this.$nextTick(function(){
      if(_self.tableData&&_self.tableData.length>0){
        _self.listenScroll();
      }
    })
    if(this.$route.params.v){
      console.log(this.$route.params)
      this.mallid = this.form.mallid = this.$route.params.Mallid;
      this.market = this.form.mallid == 1?'新天地':this.form.mallid == 2?'壹方':'';
      console.log(this.mallid)
      console.log(this.form.mallid)
      console.log(this.market)
      this.form.floor =this.$route.params.floor;
      this.form.operationcategory =this.$route.params.operationcategory;
      this.form.shop =this.$route.params.ShopName+'|'+this.$route.params.ID;
      this.form.year=this.$route.params.Y.toString();
      this.form.month = this.$route.params.M<=9?this.form.year + '-0'+this.$route.params.M.toString():this.form.year + '-'+this.$route.params.M.toString();
      console.log(this.form)
      this.initWithQuery();
    }else{
      // this.initRelatedQuery();
    }
  },
  mounted: function () {
  },
  methods: {
    comdify: comdify,
    transferWeek:function(n){
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
    },
    initRelatedQuery: function (val) {
      this.mallid = this.form.mallid = val.split('|')[1];
      this.getFloors();
      this.getStates();
      this.getShops();
      this.form.floor = '';
      this.form.operationcategory = '';
      this.form.shop = '';
      // this.form.year = year2+'';
      // this.form.month = year2+'/'+month2;
      this.tableData = null;
    },
    initWithQuery: function () {
      this.onSubmit();
      this.getFloors();
      this.getStates();
      this.getShops();
    },
    getFloors: function () {
      var _self = this;
      if (this.form.mallid) {
        this.mallid = this.form.mallid;
      }
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async:false,
        data: {
          "v": "getfloor",
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend:function(){
          layerindex = layer.open({
            type: 2
            ,content: '加载中'
            ,shadeClose:false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail:function(){
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          _self.floors = res.Data;
          _self.floors.unshift({
            Location: '全部'
          });
        }
      });
    },
    getStates: function () {
      var _self = this;
      if (this.form.mallid) {
        this.mallid = this.form.mallid;
      }
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async:false,
        data: {
          "v": "getcatalog",
          "MallID": _self.mallid,
          "r": Math.random() * 10000
        },
        beforeSend:function(){
          layerindex = layer.open({
            type: 2
            ,content: '加载中'
            ,shadeClose:false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail:function(){
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          _self.states = res.Data;
          _self.states.unshift({
            OperationCategory: '全部'
          });
        }
      });
    },
    getShops:function(){
      var _self = this;
      var layerindex = null;
      this.form.shop = '';
      this.tableData = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        async:false,
        data: {
          "v": "getshopbyquery",
          "MallID": _self.form.mallid,
          "Floor": _self.form.floor == '全部' ? '' : _self.form.floor,
          "OperationCategory": _self.form.operationcategory == '全部' ? '' : _self.form.operationcategory,
          "r": Math.random() * 10000
        },
        beforeSend:function(){
          layerindex = layer.open({
            type: 2
            ,content: '加载中'
            ,shadeClose:false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail:function(){
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          _self.shops = []
          for(var i=0;i<res.Data.length;i++){
            _self.shops.push(res.Data[i].ShopName+'|'+res.Data[i].ShopID);
          }
          // _self.form.shop = ''
        }
      });
    },
    getShopId:function(val){
      var index = val.split('+')[1];
      this.onSubmit();
    },
    onSubmit() {
      var _self = this;
      _self.tableData = null;
      var shopid = this.form.shop.split('|')[1];
      if (!this.form.mallid) {
        $.alert('请先选择要查询的商场！');
        return
      }
      if (!shopid) {
        $.alert('请选择要查询的店铺！');
        return
      }
      if(!this.form.year){
        $.alert('请选择要查询的年份！');
        return
      }
      if(!this.form.month){
        $.alert('请选择要查询的月份！');
        return
      }
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        // async:false,
        data: {
          "v": "getshopbymonth",
          "openid": window.sessionStorage.Global_openid,
          "ID": shopid,
          "Y": new Date(_self.form.year).getFullYear(),
          "M":new Date(_self.form.month).getMonth()+1,
          "r": Math.random() * 10000
        },
        beforeSend:function(){
          layerindex = layer.open({
            type: 2
            ,content: '加载中'
            ,shadeClose:false
          });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          layer.close(layerindex)
        },
        fail:function(){
          layer.close(layerindex)
        },
        success: function (res) {
          layer.close(layerindex)
          _self.tableData = res.Data;
          // 计算月销售合计
          var sums = 0;
          for(var i =0;i<_self.tableData.length;i++){
            sums += parseFloat(_self.tableData[i].GrossSales);
          }
          sums = comdify(sums);
          _self.summaries = sums;
          // 监听滚动
          if(_self.tableData.length>0){
            _self.listenScroll();
          }
          var datas = res.ErrorMsg.split('|');
          _self.areaeffect = _self.comdify(datas[1]);
          _self.customerprice = _self.comdify(datas[2]);
          _self.saletarget = datas[3];
          _self.salerate = datas[3]?(100*Number(datas[0])/ Number(datas[3])).toFixed(1)+'%':'0.0%';
          _self.saletarget = _self.comdify(_self.saletarget);
          _self.$nextTick(function(){
            _self.initEcharts();
          });
        }
      });
      console.log('submit!');
    },
    updateYear:function(val){
      year = new Date(val).getFullYear();
      this.form.year = year+'';
      this.form.month = '';
      this.onSubmit();
    },
    updateMonth:function(val){
      year = new Date(val).getFullYear();
      this.form.year = year+'';
      month = new Date(val).getMonth()+1;
      this.form.month = year+'-'+month;
      this.onSubmit();
    },
    initEcharts: function () {
      var _self = this;
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(this.$refs.echart);
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['营业额'],
          textStyle: {
            fontSize: 8
          }
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
            fontSize:10
          }
        },
        xAxis: {
          name:'日期',
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            fontSize: 10
          },
          data: _self.xAxis
        },
        yAxis: {
          name: '营业额(千元)',
          type: 'value',
          axisLabel: {
            formatter: function (value, index) {
              return (value / 1000).toFixed(0)
            },
            textStyle: {
              fontSize: 10
            }
          }
        },
        series: [{
            name: '营业额',
            type: 'line',
            data: _self.yAxis
          }
        ]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },
    listenScroll:function(){
      var _self = this;
      this.$nextTick(function(){
        this.$parent.$el.onscroll = function(){
          if(this.scrollTop > _self.$refs.thead.offsetTop+_self.$refs.fktable.offsetTop){
            _self.fixThead = true
          }else{
            _self.fixThead = false
          }
          // if(_self.fixThead&&_self.fixColumn){
          //   _self.$refs.extraThead.scrollLeft = _self.$refs.baseTable.scrollLeft
          // }
          _self.$refs.extraThead.scrollLeft = _self.$refs.baseTable.scrollLeft;
        }
      })
    }
  },
  template: '<div class="marketquery">\
              <div class="query-conditions">\
              <el-form ref="form" :model="form" label-width="3rem" label-position="left">\
              <el-row :gutter="0">\
                <el-col :span="12">\
                  <el-form-item label="商场">\
                    <el-select v-model="market" placeholder="请选择" style="width: 100%;" @change="initRelatedQuery">\
                      <el-option v-for="(item,index) in markets" :label="item|seperateName" :value="item" key="market-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
                <el-col :span="12">\
                  <el-form-item label="楼层/位置">\
                    <el-select v-model="form.floor" placeholder="请选择" style="width: 100%;" @change="getShops">\
                      <el-option v-for="(item,index) in floors" :label="item.Location" :value="item.Location" key="floor-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
              </el-row>\
              <el-row :gutter="0">\
                <el-col :span="12">\
                  <el-form-item label="租户业态">\
                    <el-select v-model="form.operationcategory" placeholder="请选择" style="width: 100%;" @change="getShops">\
                      <el-option v-for="(item,index) in states" :label="item.OperationCategory" :value="item.OperationCategory" key="floor-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
                <el-col :span="12">\
                  <el-form-item label="租户名称">\
                    <el-select v-model="form.shop" filterable placeholder="请选择" style="width: 100%;" @change="getShopId">\
                      <el-option v-for="(item,index) in shops" :label="item|seperateName" :value="item" :key="item.ShopID"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
              </el-row>\
              <el-row :gutter="0">\
                <el-col :span="24">\
                  <el-form-item label="日报年月">\
                    <el-row>\
                      <el-col :span="11">\
                        <el-date-picker :picker-options="pickerOptions" size="mini" type="year"\
                        @change="updateYear" format="yyyy年" placeholder="选择年" v-model="form.year"\
                         style="width: 100%;" :editable=false></el-date-picker>\
                      </el-col>\
                      <el-col :span="2"><div style="text-align:center">-</div></el-col>\
                      <el-col :span="11">\
                        <el-date-picker :picker-options="pickerOptions" size="mini" type="month"\
                        @change="updateMonth" format="MM月" placeholder="选择月" v-model="form.month"\
                        style="width: 100%;" :editable=false></el-date-picker>\
                      </el-col>\
                    </el-row>\
                  </el-form-item>\
                </el-col>\
              </el-row>\
              </el-form>\
              <template v-if="tableData&&tableData.length>0">\
                <div class="echart">\
                  <div class="echart-wrapper" ref="echart"></div>\
                </div>\
                <div class="cur-day w100" style="margin:.5rem auto">\
                  <div class="wrapper">\
                    <el-row class="summuryData" :gutter="10">\
                      <el-col :span="12">\
                        <el-row>\
                          <div class="statichead">本月营业额：</div>\
                          <div class="statics">{{summaries}}</div>\
                        </el-row>\
                      </el-col>\
                      <el-col :span="12">\
                        <el-row>\
                          <div class="statichead">本月预算：</div>\
                          <div class="statics">{{saletarget}}</div>\
                        </el-row>\
                      </el-col>\
                    </el-row>\
                    <el-row class="summuryData" :gutter="10">\
                      <el-col :span="12">\
                        <el-row>\
                          <div class="statichead">30天月化坪效：</div>\
                          <div class="statics">{{areaeffect}}</div>\
                        </el-row>\
                      </el-col>\
                      <el-col :span="12">\
                        <el-row>\
                          <div class="statichead">本月预算完成率：</div>\
                          <div class="statics">{{salerate}}</div>\
                        </el-row>\
                      </el-col>\
                    </el-row>\
                    <el-row class="summuryData" :gutter="10">\
                      <el-col :span="12">\
                        <el-row>\
                          <div class="statichead">客单价：</div>\
                          <div class="statics">{{customerprice}}</div>\
                        </el-row>\
                      </el-col>\
                    </el-row>\
                  </di>\
                  </div>\
                </div>\
                <div class="fktable" v-if="tableData&&tableData.length>0" ref="fktable">\
                <div class="table-wrapper extra" style="border-right:none;" ref="extraThead" :class="fixThead?\'fixed\':\'\'">\
                  <div class="thead">\
                    <table class="mytable mytable1">\
                      <colgroup>\
                        <col width="25%" />\
                        <col width="25%" />\
                        <col width="25%" />\
                        <col width="25%" />\
                      </colgroup>\
                      <thead class="thead">\
                        <tr>\
                          <th><div class="th"><div class="wrap"><span class="right">日期</span></div></div></th>\
                          <th><div class="th"><div class="wrap"><span class="right">营业额</span></div></div></th>\
                          <th><div class="th"><div class="wrap"><span class="right">进店人数</span></div></div></th>\
                          <th><div class="th"><div class="wrap"><span class="right">客数</span></div></div></th>\
                        </tr>\
                      </thead>\
                    </table>\
                  </div>\
                </div>\
                <div class="table-wrapper" ref="baseTable">\
                  <table class="mytable mytable1">\
                    <colgroup>\
                      <col width="25%" />\
                      <col width="25%" />\
                      <col width="25%" />\
                      <col width="25%" />\
                    </colgroup>\
                    <thead class="thead" ref="thead">\
                      <tr>\
                        <th><div class="th"><div class="wrap"><span class="right">日期</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span class="right">营业额</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span class="right">进店人数</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span class="right">客数</span></div></div></th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr v-for="(item,index) in calcTableDate">\
                        <td><div><p>{{item.miniMonthDate}}</p><p class="wd" :class="item.WeekDay==\'日\'||item.WeekDay==\'六\'?\'red\':\'\'">周{{item.WeekDay}}</p></div></td>\
                        <td><div>{{item.GrossSales}}</div></td>\
                        <td><div>{{item.CustomerNum}}</div></td>\
                        <td><div>{{item.CustomerOrders}}</div></td>\
                      </tr>\
                     </tbody>\
                  </table>\
                </div>\
              </div>\
              </template>\
              <div v-if="tableData&&tableData.length==0" class="nodata" style="margin:1rem">尚无数据</div>\
              </div>\
             </div>'
})
function formatNumber(num, cent, isThousand) {
  num = num.toString().replace(/\$|\,/g, '');
  // 检查传入数值为数值类型
  if (isNaN(num))
    num = "0";

  // 获取符号(正/负数)
  sign = (num == (num = Math.abs(num)));

  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入
  cents = num % Math.pow(10, cent); // 求出小数位数值
  num = Math.floor(num / Math.pow(10, cent)).toString(); // 求出整数位数值
  cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度

  // 补足小数位到指定的位数
  while (cents.length < cent)
    cents = "0" + cents;

  if (isThousand) {
    // 对整数部分进行千分位格式化.
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  // if (cent > 0)
  //   return (((sign) ? '' : '-') + num + '.' + cents);
  // else
    return (((sign) ? '' : '-') + num);
}
var comdify = function (num) {
  return formatNumber(num, 2, 1);
}
var today = new Date();
var yesterday = new Date(today.getTime()-24*60*60*1000);
var date = yesterday.getFullYear() + '/' + (yesterday.getMonth() + 1) + '/' + yesterday.getDate();
var marketquery = Vue.component('marketquery', {
  name: 'marketquery',
  data: function () {
    return {
      pickerOptions:{
        disabledDate:function(time){
          var minDate = new Date('2017/12/01');
          return time.getTime() > yesterday.getTime() || time.getTime()< minDate.getTime();
        }
      },
      mallid:2,
      market:'壹方',
      markets:['新天地|1','壹方|2'],
      floors: [],
      states: [],
      shops: [],
      shopNames:[],
      form: {
        mallid: '',
        floor: '',
        operationcategory: '',
        date: date,
        shopname: ''
      },
      tableData:  null,
      fixThead:false,
      fixColumn:false,
      sortup:false,
      sortProps: 'GrossSales'
    }
  },
  computed: {
    calcTableDate: function () {
      var _self = this;
      if(this.tableData){
        var arr = []
        for (var i =0;i<this.tableData.length;i++) {
          var obj = {}
          for (var j in this.tableData[i]) {
            obj[j] = this.tableData[i][j]
          }
          arr.push(obj)
        }
        arr.forEach(function (item) {
          if ((item.CustomerOrders == 0 && item.OperationCategory!= "餐饮") || (item.CustomerNum == 0 && item.OperationCategory== "餐饮")) {
            item.CustomerPrice = 0.00;
          } else {
           item.CustomerPrice =  item.OperationCategory!= "餐饮" ?(item.GrossSales/item.CustomerOrders):(item.GrossSales/item.CustomerNum);
          }
          item.CustomerPrice = formatNumber(item.CustomerPrice,0,1);
          item.CustomerNum = formatNumber(item.CustomerNum, 0, 1);
          item.GrossSales = _self.comdify(item.GrossSales);
          item.CustomerOrders =formatNumber(item.CustomerOrders, 0, 1);
          item.CustomerPrice = _self.comdify(item.CustomerPrice);
          item.MonthGrossSales = _self.comdify(item.MonthGrossSales);
          item.SalesTarget = _self.comdify(item.SalesTarget);
        });
      }
      return arr;
    }
  },
  filters:{
    seperateName:function(str){
      return str.split('|')[0]
    }
  },
  activated: function () {
    var timeout = setTimeout(function() {
      layer.close(layerIndex);
      clearTimeout(timeout)
    }, 200);
    // 清除页面滚动
    this.fixThead = false;
    this.fixColumn = false;
    if(this.$refs.baseTable){
      this.$refs.baseTable.scrollLeft = 0;
    }
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
    // 获取路由参数
    if (this.$route.params.v) {
      console.log(this.$route.params)
      this.form.date = this.$route.params.day;
      this.mallid = this.form.mallid = this.$route.params.MallID;
      this.market = this.form.mallid == 1?'新天地':this.form.mallid == 2?'壹方':'';
      this.form.floor = this.$route.params.Floor;
      this.form.shopname = this.$route.params.Shopname;      
      this.form.operationcategory = this.$route.params.operationcategory;
      this.initWithQuery();
    } else {
      // this.initRelatedQuery();
    }
  },
  created: function () {
    this.mallid = this.form.mallid = 2;
    this.market = this.form.mallid == 1?'新天地':this.form.mallid == 2?'壹方':'';
    this.initWithQuery();
  },
  mounted:function(){
  },
  methods: {
    comdify: comdify,
    initRelatedQuery: function (val) {
      this.mallid = this.form.mallid = val.split('|')[1];
      this.form.floor = '';
      this.form.operationcategory = '';
      this.form.shopname = '';
      this.getFloors();
      this.getStates();
      this.getShops();
      this.onSubmit();
      // this.form.date = date;
      // this.tableData = null;
    },
    initWithQuery: function () { 
      this.getFloors();
      this.getStates();
      this.getShops();
      this.onSubmit();
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
          layer.close(layerindex);
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
          layer.close(layerindex);
          _self.states = res.Data;
          _self.states.unshift({
            OperationCategory: '全部'
          });
        }
      });
    },
    getShops: function () {
      var _self = this;
      var layerindex = null;
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
          layer.close(layerindex);
          _self.shops = res.Data;
          _self.shopNames = [];
          for(var i = 0 ;i < _self.shops.length; i++){
            _self.shopNames.push(_self.shops[i].ShopName)
          }
          _self.shopNames.unshift('全部');
        }
      });
    },
    onSubmit() {
      var _self = this;
      this.sortProps = 'GrossSales';
      this.sortup = false;
      if (this.form.mallid == '') {
        $.alert('请选择要查询的商场！');
        return
      }
      if (this.form.date == '') {
        $.alert('请选择要查询的日期！')
        return;
      }
      var layerindex = null;
      $.ajax({
        url: "webserver/ShopPosService.aspx",
        type: "post",
        dataType: 'json',
        cache: false,
        // async:false,
        data: {
          "v": "shopdailystatic",
          "openid": window.sessionStorage.Global_openid,
          'day': _self.form.date,
          "MallID": _self.form.mallid,
          "Floor": _self.form.floor == '全部' ? '' : _self.form.floor,
          "Shopname": _self.form.shopname == '全部' ? '' : _self.form.shopname,
          "operationcategory": _self.form.operationcategory == '全部' ? '' : _self.form.operationcategory,
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
          layer.close(layerindex);
          _self.tableData = []
          _self.tableData = res.Data;
          for (var i =0;i<_self.tableData.length;i++) {
            if (_self.tableData[i].SalesTarget == 0) {
              _self.tableData[i].SalesRate = '0.0%';
            } else {
              _self.tableData[i].SalesRate = (100 * _self.tableData[i].MonthGrossSales / _self.tableData[i].SalesTarget).toFixed(1) + '%';
            }
          }
          // 监听滚动
          if(_self.tableData.length>0){
            _self.listenScroll();
          }
        }
      });
    },
    rowClick: function (event) {
      var _self = this;
      var shopid = event.currentTarget.dataset.shopid;
      var shopname = event.currentTarget.dataset.shopname;
      console.log(event.currentTarget.dataset)
      this.$router.push({
        name: 'shopquery',
        params: {
          "v": "getshopbymonth",
          "openid": window.sessionStorage.Global_openid,
          "Mallid": _self.form.mallid,
          "ID": shopid,
          "ShopName": shopname,
          "floor": _self.form.floor,
          "operationcategory": _self.form.operationcategory,
          "Y": new Date(_self.form.date).getFullYear(),
          "M": new Date(_self.form.date).getMonth() + 1,
          "r": Math.random() * 10000
        }
      })
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
        _self.$refs.baseTable.onscroll = function(){
          if(this.scrollLeft <= 0){
            _self.fixColumn = false;
            _self.$refs.extraThead.scrollLeft = 0;
          }else{
            _self.fixColumn = true;
            
          }
          _self.$refs.extraThead.scrollLeft = this.scrollLeft;
        }
      })
    },
    sortcount:function(e){
      var _self = this
      var getNumber = function (str) {
        str += ''
        return Number(str.replace('%',''))
      }
      this.sortProps = e.currentTarget.dataset.prop
      if (this.sortup) {
        this.tableData.sort(function(a,b){
          return getNumber(b[_self.sortProps]) - getNumber(a[_self.sortProps])
        })
        this.sortup = false
      } else {
        this.tableData.sort(function(a,b){
          return getNumber(a[_self.sortProps]) - getNumber(b[_self.sortProps])
        })
        this.sortup = true
      }
    }
  },
  template: '<div class="marketquery">\
              <div class="query-conditions">\
              <el-form ref="form" :model="form" label-width="2.5rem" label-position="left">\
              <el-row :gutter="0">\
                <el-col :span="12">\
                  <el-form-item label="商场">\
                    <el-select size="mini" v-model="market" placeholder="请选择" style="width: 100%;" @change="initRelatedQuery">\
                      <el-option v-for="(item,index) in markets" :label="item|seperateName" :value="item" key="market-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
                <el-col :span="12">\
                  <el-form-item label="楼层/位置">\
                    <el-select size="mini" v-model="form.floor" placeholder="请选择" style="width: 100%;" @change="getShops();onSubmit();">\
                      <el-option v-for="(item,index) in floors" :label="item.Location" :value="item.Location" key="floor-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
              </el-row>\
              <el-row :gutter="0">\
                <el-col :span="12">\
                  <el-form-item label="租户业态">\
                    <el-select  size="mini" v-model="form.operationcategory" placeholder="请选择" style="width: 100%;" @change="getShops();onSubmit();">\
                      <el-option v-for="(item,index) in states" :label="item.OperationCategory" :value="item.OperationCategory" key="floor-{{index}}"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
                <el-col :span="12">\
                  <el-form-item label="租户名称">\
                    <el-select  size="mini" v-model="form.shopname" filterable placeholder="请选择" style="width: 100%;" @change="onSubmit">\
                      <el-option v-for="(item,index) in shopNames" :value="item" :key="item.ShopID"></el-option>\
                    </el-select>\
                  </el-form-item>\
                </el-col>\
              </el-row>\
              <el-row :gutter="0">\
                  <el-col :span="12">\
                    <el-form-item  label="时间">\
                      <el-date-picker @change="onSubmit" size="mini" type="date" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy/MM/dd" placeholder="选择日期" v-model="form.date" style="width: 100%;" :editable=false></el-date-picker>\
                    </el-form-item>\
                  </el-col>\
                </el-row>\
              </el-form>\
              <div class="fktable" v-if="tableData&&tableData.length>0" ref="fktable">\
                <div class="special-th" v-if="fixThead&&fixColumn">店铺名称</div>\
                <div class="table-wrapper extra" ref="extraThead" :class="fixThead?\'fixed\':\'\'">\
                  <div class="thead">\
                    <table class="mytable">\
                      <colgroup>\
                        <col width="100px" />\
                        <col width="70px" />\
                        <col width="80px" />\
                        <col width="80px" />\
                        <col width="70px" />\
                        <col width="50px" />\
                        <col width="50px" />\
                        <col width="70px" />\
                      </colgroup>\
                      <thead class="thead">\
                        <tr>\
                          <th><div class="th"><div class="wrap"><span>店铺名称</span></div></div></th>\
                          <th @click="sortcount" data-prop="GrossSales">\
                            <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'GrossSales\'?\'active\':\'\']">\
                              <div class="wrap">\
                                <span>营业额</span>\
                                <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                              </div>\
                            </div>\
                          </th>\
                          <th @click="sortcount" data-prop="MonthGrossSales">\
                            <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'MonthGrossSales\'?\'active\':\'\']">\
                              <div class="wrap">\
                                <span>月累计<br/>营业额</span>\
                                <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                              </div>\
                            </div>\
                          </th>\
                          <th @click="sortcount" data-prop="SalesTarget">\
                            <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesTarget\'?\'active\':\'\']">\
                              <div class="wrap">\
                                <span>月销售<br/>预算</span>\
                                <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                              </div>\
                            </div>\
                          </th>\
                          <th @click="sortcount" data-prop="SalesRate">\
                            <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesRate\'?\'active\':\'\']">\
                              <div class="wrap">\
                                <span>月预算<br/>完成率</span>\
                                <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                              </div>\
                            </div>\
                          </th>\
                          <th><div class="th"><div class="wrap"><span>进店<br/>人数</span></div></div></th>\
                          <th><div class="th"><div class="wrap"><span>客数</span></div></div></th>\
                          <th><div class="th"><div class="wrap"><span>客单价</span></div></div></th>\
                        </tr>\
                      </thead>\
                    </table>\
                  </div>\
                </div>\
                <div class="table-wrapper" ref="baseTable">\
                  <table class="mytable">\
                    <colgroup>\
                      <col width="100px" />\
                      <col width="70px" />\
                      <col width="80px" />\
                      <col width="80px" />\
                      <col width="70px" />\
                      <col width="50px" />\
                      <col width="50px" />\
                      <col width="70px" />\
                    </colgroup>\
                    <thead class="thead" ref="thead">\
                      <tr>\
                        <th><div class="th"><div class="wrap"><span>店铺名称</span></div></div></th>\
                        <th @click="sortcount" data-prop="GrossSales">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'GrossSales\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>营业额</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="MonthGrossSales">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'MonthGrossSales\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月累计<br/>营业额</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="SalesTarget">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesTarget\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月销售<br/>预算</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="SalesRate">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesRate\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月预算<br/>完成率</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th><div class="th"><div class="wrap"><span>进店<br/>人数</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span>客数</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span>客单价</span></div></div></th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr v-for="(item,index) in calcTableDate">\
                        <td><div>{{item.ShopName}}</div></td>\
                        <td><div>{{item.GrossSales}}</div></td>\
                        <td><div>{{item.MonthGrossSales}}</div></td>\
                        <td><div>{{item.SalesTarget}}</div></td>\
                        <td><div>{{item.SalesRate}}</div></td>\
                        <td><div>{{item.CustomerNum}}</div></td>\
                        <td><div>{{item.CustomerOrders}}</div></td>\
                        <td><div>{{item.CustomerPrice}}</div></td>\
                      </tr>\
                     </tbody>\
                  </table>\
                </div>\
                <div class="table-wrapper fixed"  :class="fixColumn?\'shadow\':\'\'">\
                  <table class="mytable">\
                    <colgroup>\
                      <col width="100px" />\
                      <col width="70px" />\
                      <col width="80px" />\
                      <col width="80px" />\
                      <col width="70px" />\
                      <col width="50px" />\
                      <col width="50px" />\
                      <col width="70px" />\
                    </colgroup>\
                    <thead class="thead">\
                      <tr>\
                        <th><div class="th"><div class="wrap"><span>店铺名称</span></div></div></th>\
                        <th @click="sortcount" data-prop="GrossSales">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'GrossSales\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>营业额</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="MonthGrossSales">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'MonthGrossSales\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月累计<br/>营业额</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="SalesTarget">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesTarget\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月销售<br/>预算</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th @click="sortcount" data-prop="SalesRate">\
                          <div class="th sortcolumn" :class="[sortup?\'up\':\'down\',sortProps == \'SalesRate\'?\'active\':\'\']">\
                            <div class="wrap">\
                              <span>月预算<br/>完成率</span>\
                              <span class="carets"><i class="el-icon-caret-top"></i><i class="el-icon-caret-bottom"></i></span>\
                            </div>\
                          </div>\
                        </th>\
                        <th><div class="th"><div class="wrap"><span>进店<br/>人数</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span>客数</span></div></div></th>\
                        <th><div class="th"><div class="wrap"><span>客单价</span></div></div></th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr v-for="(item,index) in calcTableDate">\
                        <td><div>{{item.ShopName}}</div></td>\
                        <td><div>{{item.GrossSales}}</div></td>\
                        <td><div>{{item.MonthGrossSales}}</div></td>\
                        <td><div>{{item.SalesTarget}}</div></td>\
                        <td><div>{{item.SalesRate}}</div></td>\
                        <td><div>{{item.CustomerNum}}</div></td>\
                        <td><div>{{item.CustomerOrders}}</div></td>\
                        <td><div>{{item.CustomerPrice}}</div></td>\
                      </tr>\
                     </tbody>\
                  </table>\
                </div>\
              </div>\
              <div v-if="tableData&&tableData.length==0" class="nodata" style="margin:1rem">尚无数据</div>\
              </div>\
             </div>'
})
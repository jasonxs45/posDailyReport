var routes = [
  { path: '/', component: statistic },
  { path: '/statistic', name:'statistic', component: statistic },
  { path: '/shopquery', name:'shopquery', component: shopquery },
  { path: '/marketquery', name:'marketquery', component: marketquery }
]
var router = new VueRouter({
  routes: routes
})
var layerIndex = null;
router.beforeEach((to, from, next) => {
  layerIndex = layer.open({
    type: 2
    ,content: '加载中'
    ,shadeClose:true
  });
  next()
})
router.afterEach((to, from) => {
  // layer.close(layerIndex);
})
var app;
wx.ready(function(){
  app = new Vue({
    el: '#app',
    data:function(){
      return {
        fixThead:false
      }
    },
    router: router,
    mounted:function(){
      // var _self = this;
      // this.$el.onscroll = function(){
      //   if(this.scrollTop >= app.$refs.thead.offsetTop){
      //     _self.fixThead = true
      //   }else{
      //     _self.fixThead = false
      //     console.log(_self.fixThead)
      //   }
      // }
    }
  })
})

// TODO: Change Entry Id for entity to be a GUID
// TODO Implement tinyMce
// TODO Implement mention users
Fliplet.Widget.instance('app-merge', function(widgetData) {
  // const APP_MERGE = this;
  // const APP_MERGE_INSTANCE_ID = APP_MERGE.id;
  // const DS_USERS = widgetData.userDataSource;

  initVue();

  function initVue() {
    Fliplet().then(() => {
      new Vue({
        el: '#app-merge',
        data: {
          val: 'Hello, Vue!'
        }
      });
    });
  }
});

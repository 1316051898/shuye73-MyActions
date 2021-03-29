/*
京东京喜工厂
更新时间：2021-3-24 修复做任务、收集电力出现火爆，不能完成任务
重新计算h5st验证
参考自 ：https://www.orzlee.com/web-development/2021/03/03/lxk0301-jingdong-signin-scriptjingxi-factory-solves-the-problem-of-unable-to-signin.html
活动入口：京东APP-游戏与互动-查看更多-京喜工厂
或者: 京东APP首页搜索 "玩一玩" ,造物工厂即可

已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京喜工厂
10 * * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js, tag=京喜工厂, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "10 * * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js,tag=京喜工厂

===============Surge=================
京喜工厂 = type=cron,cronexp="10 * * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js

============小火箭=========
京喜工厂 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js, cronexpr="10 * * * *", timeout=3600, enable=true

 */

// prettier-ignore
const $ = new Env('京喜工厂');
const JD_API_HOST = 'https://m.jingxi.com';
const helpAuthor = true; //帮助力 免费拿活动
const notify = $.isNode() ? require('./sendNotify') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
let tuanActiveId = `6S9y4sJUfA2vPQP6TLdVIQ==`;
const jxOpenUrl = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://wqsd.jd.com/pingou/dream_factory/index.html%22%20%7D`;
let cookiesArr = [], cookie = '', message = '', allMessage = '';
const inviteCodes = [
  'T022v_13RxwZ91ffPR_wlPcNfACjVWnYaS5kRrbA@T0205KkcH1lQpB6qW3uX06FuCjVWnYaS5kRrbA@T0225KkcRR1K8wXXJxKiwaIIdACjVWnYaS5kRrbA@T018v_h6QBsa9VfeKByb1ACjVWnYaS5kRrbA@T016aGPImbWDIsNs9Zd1CjVWnYaS5kRrbA@T020anX1lb-5IPJt9JJyQH-MCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA'
];
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.tuanIds = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (process.env.DREAMFACTORY_FORBID_ACCOUNT) process.env.DREAMFACTORY_FORBID_ACCOUNT.split('&').map((item, index) => Number(item) === 0 ? cookiesArr = [] : cookiesArr.splice(Number(item) - 1 - index, 1))
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requireConfig();
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
      $.ele = 0;
      $.pickEle = 0;
      $.pickFriendEle = 0;
      $.friendList = [];
      $.canHelpFlag = true;//能否助力朋友
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdDreamFactory()
    }
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.isLogin = true;
      await TotalBean();
      if (!$.isLogin) {
        continue
      }
      console.log(`\n参加作者的团\n`);
      await joinLeaderTuan();//参团
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      console.log(`\n账号内部相互进团\n`);
      for (let item of $.tuanIds) {
        console.log(`${$.UserName} 去参加团 ${item}\n`);
        await JoinTuan(item);
      }
    }
  }
  if ($.isNode() && allMessage) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`, { url: jxOpenUrl })
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function jdDreamFactory() {
  try {
    await userInfo();
    await QueryFriendList();//查询今日招工情况以及剩余助力次数
    // await joinLeaderTuan();//参团
    await helpFriends();
    if (!$.unActive) return
    // await collectElectricity()
    await getUserElectricity();
    await taskList();
    await investElectric();
    await QueryHireReward();//收取招工电力
    await PickUp();//收取自家的地下零件
    await stealFriend();
    await tuanActivity();
    await QueryAllTuan();
    await exchangeProNotify();
    await showMsg();
    if (helpAuthor === true) await shuye72();
  } catch (e) {
    $.logErr(e)
  }
}


// 收取发电机的电力
function collectElectricity(facId = $.factoryId, help = false, master) {
  return new Promise(async resolve => {
    // let url = `/dreamfactory/generator/CollectCurrentElectricity?zone=dream_factory&apptoken=&pgtimestamp=&phoneID=&factoryid=${facId}&doubleflag=1&sceneval=2&g_login_type=1`;
    // if (help && master) {
    //   url = `/dreamfactory/generator/CollectCurrentElectricity?zone=dream_factory&factoryid=${facId}&master=${master}&sceneval=2&g_login_type=1`;
    // }
    let body = `factoryid=${facId}&apptoken=&pgtimestamp=&phoneID=&doubleflag=1`;
    if (help && master) {
      body += `factoryid=${facId}&master=${master}`;
    }
    $.get(taskurl(`generator/CollectCurrentElectricity`, body, `_time,apptoken,doubleflag,factoryid,pgtimestamp,phoneID,timeStamp,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (help) {
                $.ele += Number(data.data['loginPinCollectElectricity'])
                console.log(`帮助好友收取 ${data.data['CollectElectricity']} 电力，获得 ${data.data['loginPinCollectElectricity']} 电力`);
                message += `【帮助好友】帮助成功，获得 ${data.data['loginPinCollectElectricity']} 电力\n`
              } else {
                $.ele += Number(data.data['CollectElectricity'])
                console.log(`收取电力成功: 共${data.data['CollectElectricity']} `);
                message += `【收取发电站】收取成功，获得 ${data.data['CollectElectricity']} 电力\n`
              }
            } else {
              if (help) {
                console.log(`收取好友电力失败:${data.msg}\n`);
              } else {
                console.log(`收取电力失败:${data.msg}\n`);
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

// 投入电力
function investElectric() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/userinfo/InvestElectric?zone=dream_factory&productionId=${$.productionId}&sceneval=2&g_login_type=1`;
    $.get(taskurl('userinfo/InvestElectric', `productionId=${$.productionId}`, `_time,productionId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.ret === 0) {
              console.log(`成功投入电力${data.data.investElectric}电力`);
              message += `【投入电力】投入成功，共计 ${data.data.investElectric} 电力\n`;
            } else {
              console.log(`投入失败，${data.msg}`);
              message += `【投入电力】投入失败，${data.msg}\n`;
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

// 初始化任务
function taskList() {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/GetUserTaskStatusList?source=dreamfactory&bizCode=dream_factory&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('GetUserTaskStatusList', '', `_time,bizCode,source`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let userTaskStatusList = data['data']['userTaskStatusList'];
            for (let i = 0; i < userTaskStatusList.length; i++) {
              const vo = userTaskStatusList[i];
              if (vo['awardStatus'] !== 1) {
                if (vo.completedTimes >= vo.targetTimes) {
                  console.log(`任务：${vo.description}可完成`)
                  await completeTask(vo.taskId, vo.taskName)
                  await $.wait(1000);//延迟等待一秒
                } else {
                  switch (vo.taskType) {
                    case 2: // 逛一逛任务
                    case 6: // 浏览商品任务
                    case 9: // 开宝箱
                      for (let i = vo.completedTimes; i <= vo.configTargetTimes; ++i) {
                        console.log(`去做任务：${vo.taskName}`)
                        await doTask(vo.taskId)
                        await completeTask(vo.taskId, vo.taskName)
                        await $.wait(1000);//延迟等待一秒
                      }
                      break
                    case 4: // 招工
                      break
                    case 5:
                      // 收集类
                      break
                    case 1: // 登陆领奖
                    default:
                      break
                  }
                }
              }
            }
            console.log(`完成任务：共领取${$.ele}电力`)
            message += `【每日任务】领奖成功，共计 ${$.ele} 电力\n`;
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

// 获得用户电力情况
function getUserElectricity() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/generator/QueryCurrentElectricityQuantity?zone=dream_factory&factoryid=${$.factoryId}&sceneval=2&g_login_type=1`
    $.get(taskurl(`generator/QueryCurrentElectricityQuantity`, `factoryid=${$.factoryId}`, `_time,factoryid,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`\nnextCollectDoubleFlag::${data.data.nextCollectDoubleFlag}`);
              console.log(`nextCollectDoubleType::${data.data.nextCollectDoubleType}\n`);
              $.log(`下次集满收取${data.data.nextCollectDoubleFlag === 1 ? '可' : '不可'}双倍电力`)
              console.log(`发电机：当前 ${data.data.currentElectricityQuantity} 电力，最大值 ${data.data.maxElectricityQuantity} 电力`)
              if (data.data.currentElectricityQuantity < data.data.maxElectricityQuantity) {
                $.log(`\n本次发电机电力集满分享后${data.data.nextCollectDoubleFlag === 1 ? '可' : '不可'}获得双倍电力，${data.data.nextCollectDoubleFlag === 1 ? '故目前不收取电力' : '故现在收取电力'}\n`)
              }
              if (data.data.nextCollectDoubleFlag === 1) {
                if (data.data.currentElectricityQuantity === data.data.maxElectricityQuantity && data.data.doubleElectricityFlag) {
                  console.log(`发电机：电力可翻倍并收获`)
                  // await shareReport();
                  await collectElectricity()
                } else {
                  message += `【发电机电力】当前 ${data.data.currentElectricityQuantity} 电力，未达到收获标准\n`
                }
              } else {
                //再收取双倍电力达到上限时，直接收取，不再等到满级
                await collectElectricity()
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

//查询有多少的招工电力可收取
function QueryHireReward() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/HireAward?zone=dream_factory&date=${new Date().Format("yyyyMMdd")}&type=0&sceneval=2&g_login_type=1`
    $.get(taskurl('friend/QueryHireReward', ``, `_time,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              for (let item of data['data']['hireReward']) {
                if (item.date !== new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).Format("yyyyMMdd")) {
                  await hireAward(item.date, item.type);
                }
              }
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
// 收取招工/劳模电力
function hireAward(date, type = 0) {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/HireAward?zone=dream_factory&date=${new Date().Format("yyyyMMdd")}&type=0&sceneval=2&g_login_type=1`
    $.get(taskurl('friend/HireAward', `date=${date}&type=${type}`, '_time,date,type,zone'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`打工电力：收取成功`)
              message += `【打工电力】：收取成功\n`
            } else {
              console.log(`打工电力：收取失败，${data.msg}`)
              message += `【打工电力】收取失败，${data.msg}\n`
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
async function helpFriends() {
  let Hours = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).getHours();
  if ($.canHelpFlag && Hours >= 6) {
    await shareCodesFormat();
    for (let code of $.newShareCodes) {
      if (code) {
        if ($.encryptPin === code) {
          console.log(`不能为自己助力,跳过`);
          continue;
        }
        const assistFriendRes = await assistFriend(code);
        if (assistFriendRes && assistFriendRes['ret'] === 0) {
          console.log(`助力朋友：${code}成功，因一次只能助力一个，故跳出助力`)
          break
        } else if (assistFriendRes && assistFriendRes['ret'] === 11009) {
          console.log(`助力朋友[${code}]失败：${assistFriendRes.msg}，跳出助力`);
          break
        } else {
          console.log(`助力朋友[${code}]失败：${assistFriendRes.msg}`)
        }
      }
    }
  } else {
    $.log(`今日助力好友机会已耗尽\n`);
  }
}
// 帮助用户,此处UA不可更换,否则助力功能会失效
function assistFriend(sharepin) {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`
    // const options = {
    //   'url': `https://m.jingxi.com/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`,
    //   'headers': {
    //     "Accept": "*/*",
    //     "Accept-Encoding": "gzip, deflate, br",
    //     "Accept-Language": "zh-cn",
    //     "Connection": "keep-alive",
    //     "Cookie": cookie,
    //     "Host": "m.jingxi.com",
    //     "Referer": "https://st.jingxi.com/pingou/dream_factory/index.html",
    //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
    //   }
    // }
    const options = taskurl('friend/AssistFriend', `sharepin=${escape(sharepin)}`, `_time,sharepin,zone`);
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // if (data['ret'] === 0) {
            //   console.log(`助力朋友：${sharepin}成功`)
            // } else {
            //   console.log(`助力朋友[${sharepin}]失败：${data.msg}`)
            // }
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
//查询助力招工情况
function QueryFriendList() {
  return new Promise(async resolve => {
    $.get(taskurl('friend/QueryFriendList', ``, `_time,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              const { assistListToday = [], assistNumMax, hireListToday = [], hireNumMax } = data;
              if (assistListToday.length === assistNumMax) {
                $.canHelpFlag = false;
              }
              $.log(`【今日招工进度】${hireListToday.length}/${hireNumMax}`);
              message += `【招工进度】${hireListToday.length}/${hireNumMax}\n`;
            } else {
              console.log(`QueryFriendList异常：${JSON.stringify(data)}`)
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
// 任务领奖
function completeTask(taskId, taskName) {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/Award?source=dreamfactory&bizCode=dream_factory&taskId=${taskId}&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('Award', taskId, `_time,bizCode,source,taskId`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            switch (data['data']['awardStatus']) {
              case 1:
                $.ele += Number(data['data']['prizeInfo'].replace('\\n', ''))
                console.log(`领取${taskName}任务奖励成功，收获：${Number(data['data']['prizeInfo'].replace('\\n', ''))}电力`);
                break
              case 1013:
              case 0:
                console.log(`领取${taskName}任务奖励失败，任务已领奖`);
                break
              default:
                console.log(`领取${taskName}任务奖励失败，${data['msg']}`)
                break
            }
            // if (data['ret'] === 0) {
            //   console.log("做任务完成！")
            // } else {
            //   console.log(`异常：${JSON.stringify(data)}`)
            // }
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

// 完成任务
function doTask(taskId) {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/DoTask?source=dreamfactory&bizCode=dream_factory&taskId=${taskId}&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('DoTask', taskId, '_time,bizCode,configExtra,source,taskId'), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log("做任务完成！")
            } else {
              console.log(`DoTask异常：${JSON.stringify(data)}`)
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

// 初始化个人信息
function userInfo() {
  return new Promise(async resolve => {
    $.get(taskurl('userinfo/GetUserInfo', `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&source=`, '_time,materialTuanId,materialTuanPin,pin,sharePin,shareType,source,zone'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              $.unActive = true;//标记是否开启了京喜活动或者选购了商品进行生产
              $.encryptPin = '';
              $.shelvesList = [];
              if (data.factoryList && data.productionList) {
                const production = data.productionList[0];
                const factory = data.factoryList[0];
                const productionStage = data.productionStage;
                $.factoryId = factory.factoryId;//工厂ID
                $.productionId = production.productionId;//商品ID
                $.commodityDimId = production.commodityDimId;
                $.encryptPin = data.user.encryptPin;
                // subTitle = data.user.pin;
                await GetCommodityDetails();//获取已选购的商品信息
                if (productionStage['productionStageAwardStatus'] === 1) {
                  $.log(`可以开红包了\n`);
                  await DrawProductionStagePrize();//领取红包
                } else {
                  $.log(`再加${productionStage['productionStageProgress']}电力可开红包\n`)
                }
                console.log(`当前电力：${data.user.electric}`)
                console.log(`当前等级：${data.user.currentLevel}`)
                console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.user.encryptPin}`);
                console.log(`已投入电力：${production.investedElectric}`);
                console.log(`所需电力：${production.needElectric}`);
                console.log(`生产进度：${((production.investedElectric / production.needElectric) * 100).toFixed(2)}%`);
                message += `【京东账号${$.index}】${$.nickName}\n`
                message += `【生产商品】${$.productName}\n`;
                message += `【当前等级】${data.user.userIdentity} ${data.user.currentLevel}\n`;
                message += `【生产进度】${((production.investedElectric / production.needElectric) * 100).toFixed(2)}%\n`;
                if (production.investedElectric >= production.needElectric) {
                  $.log(`可以对方商品了`)
                  // await exchangeProNotify()
                }
              } else {
                $.unActive = false;//标记是否开启了京喜活动或者选购了商品进行生产
                if (!data.factoryList) {
                  console.log(`【提示】京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动\n`);
                  // $.msg($.name, '【提示】', `京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动`);
                } else if (data.factoryList && !data.productionList) {
                  console.log(`【提示】京东账号${$.index}[${$.nickName}]京喜工厂未选购商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选购\n`)
                  let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
                  if (nowTimes.getHours()  === 12) {
                    //如按每小时运行一次，则此处将一天推送2次提醒
                    $.msg($.name, '提醒⏰', `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品`);
                    // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品`)
                    if ($.isNode()) allMessage += `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品${$.index !== cookiesArr.length ? '\n\n' : ''}`
                  }
                }
              }
            } else {
              console.log(`GetUserInfo异常：${JSON.stringify(data)}`)
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
//查询当前生产的商品名称
function GetCommodityDetails() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/diminfo/GetCommodityDetails?zone=dream_factory&sceneval=2&g_login_type=1&commodityId=${$.commodityDimId}`;
    $.get(taskurl('diminfo/GetCommodityDetails', `commodityId=${$.commodityDimId}`, `_time,commodityId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              $.productName = data['commodityList'][0].name;
            } else {
              console.log(`GetCommodityDetails异常：${JSON.stringify(data)}`)
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
// 查询已完成商品
function GetShelvesList(pageNo = 1) {
  return new Promise(async resolve => {
    $.get(taskurl('userinfo/GetShelvesList', `pageNo=${pageNo}&pageSize=12`, `_time,pageNo,pageSize,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              const { shelvesList } = data;
              if (shelvesList) {
                $.shelvesList = [...$.shelvesList, ...shelvesList];
                pageNo ++
                GetShelvesList(pageNo);
              }
            } else {
              console.log(`GetShelvesList异常：${JSON.stringify(data)}`)
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
//领取红包
function DrawProductionStagePrize() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/userinfo/DrawProductionStagePrize?zone=dream_factory&sceneval=2&g_login_type=1&productionId=${$.productionId}`;
    $.get(taskurl('userinfo/DrawProductionStagePrize', `productionId=${$.productionId}`, `_time,productionId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`领取红包功能(测试中)：${data}`);
          // if (safeGet(data)) {
          //   data = JSON.parse(data);
          //   if (data['ret'] === 0) {
          //
          //   } else {
          //     console.log(`异常：${JSON.stringify(data)}`)
          //   }
          // }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
async function PickUp(encryptPin = $.encryptPin, help = false) {
  $.pickUpMyselfComponent = true;
  const GetUserComponentRes = await GetUserComponent(encryptPin, 500);
  if (GetUserComponentRes && GetUserComponentRes['ret'] === 0) {
    const { componentList } = GetUserComponentRes['data'];
    if (componentList && componentList.length <= 0) {
      if (help) {
        $.log(`好友【${encryptPin}】地下暂无零件可收`)
      } else {
        $.log(`自家地下暂无零件可收`)
      }
      $.pickUpMyselfComponent = false;
    }
    for (let item of componentList) {
      await $.wait(1000);
      const PickUpComponentRes = await PickUpComponent(item['placeId'], encryptPin);
      if (PickUpComponentRes) {
        if (PickUpComponentRes['ret'] === 0) {
          const data = PickUpComponentRes['data'];
          if (help) {
            console.log(`收取好友[${encryptPin}]零件成功:获得${data['increaseElectric']}电力\n`);
            $.pickFriendEle += data['increaseElectric'];
          } else {
            console.log(`收取自家零件成功:获得${data['increaseElectric']}电力\n`);
            $.pickEle += data['increaseElectric'];
          }
        } else {
          if (help) {
            console.log(`收好友[${encryptPin}]零件失败：${PickUpComponentRes.msg},直接跳出`)
          } else {
            console.log(`收自己地下零件失败：${PickUpComponentRes.msg},直接跳出`);
            $.pickUpMyselfComponent = false;
          }
          break
        }
      }
    }
  }
}
function GetUserComponent(pin = $.encryptPin, timeout = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskurl('usermaterial/GetUserComponent', `pin=${pin}`, `_time,pin,zone`), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 0) {

              } else {
                console.log(`GetUserComponent失败：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
}
//收取地下随机零件电力API

function PickUpComponent(index, encryptPin) {
  return new Promise(resolve => {
    $.get(taskurl('usermaterial/PickUpComponent', `placeId=${index}&pin=${encryptPin}`, `_time,pin,placeId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // if (data['ret'] === 0) {
            //   data = data['data'];
            //   if (help) {
            //     console.log(`收取好友[${encryptPin}]零件成功:获得${data['increaseElectric']}电力\n`);
            //     $.pickFriendEle += data['increaseElectric'];
            //   } else {
            //     console.log(`收取自家零件成功:获得${data['increaseElectric']}电力\n`);
            //     $.pickEle += data['increaseElectric'];
            //   }
            // } else {
            //   if (help) {
            //     console.log(`收好友[${encryptPin}]零件失败：${JSON.stringify(data)}`)
            //   } else {
            //     console.log(`收零件失败：${JSON.stringify(data)}`)
            //   }
            // }
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
//偷好友的电力
async function stealFriend() {
  if (!$.pickUpMyselfComponent) {
    $.log(`今日收取零件已达上限，偷好友零件也达到上限，故跳出`)
    return
  }
  await getFriendList();
  $.friendList = [...new Set($.friendList)];
  for (let i = 0; i < $.friendList.length; i++) {
    let pin = $.friendList[i];//好友的encryptPin
    if (pin === 'V5LkjP4WRyjeCKR9VRwcRX0bBuTz7MEK0-E99EJ7u0k=' || pin === 'Bo-jnVs_m9uBvbRzraXcSA==') {
      continue
    }
    await PickUp(pin, true);
    // await getFactoryIdByPin(pin);//获取好友工厂ID
    // if ($.stealFactoryId) await collectElectricity($.stealFactoryId,true, pin);
  }
}
function getFriendList(sort = 0) {
  return new Promise(async resolve => {
    $.get(taskurl('friend/QueryFactoryManagerList', `sort=${sort}`, `_time,sort,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              if (data.list && data.list.length <= 0) {
                console.log(`查询好友列表完成，共${$.friendList.length}好友，下面开始拾取好友地下的零件\n`);
                return
              }
              let friendsEncryptPins = [];
              for (let item of data.list) {
                friendsEncryptPins.push(item.encryptPin);
              }
              $.friendList = [...$.friendList, ...friendsEncryptPins];
              if (!$.isNode()) return
              await getFriendList(data.sort);
            } else {
              console.log(`QueryFactoryManagerList异常：${JSON.stringify(data)}`)
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
function getFactoryIdByPin(pin) {
  return new Promise((resolve, reject) => {
    // const url = `/dreamfactory/userinfo/GetUserInfoByPin?zone=dream_factory&pin=${pin}&sceneval=2`;
    $.get(taskurl('userinfo/GetUserInfoByPin', `pin=${pin}`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (data.data.factoryList) {
                //做此判断,有时候返回factoryList为null
                // resolve(data['data']['factoryList'][0]['factoryId'])
                $.stealFactoryId = data['data']['factoryList'][0]['factoryId'];
              }
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
async function tuanActivity() {
  const tuanConfig = await QueryActiveConfig();
  if (tuanConfig && tuanConfig.ret === 0) {
    const { activeId, surplusOpenTuanNum, tuanId } = tuanConfig['data']['userTuanInfo'];
    console.log(`今日剩余开团次数：${surplusOpenTuanNum}次`);
    $.surplusOpenTuanNum = surplusOpenTuanNum;
    if (!tuanId && surplusOpenTuanNum > 0) {
      //开团
      $.log(`准备开团`)
      await CreateTuan();
    } else if (tuanId) {
      //查询词团信息
      const QueryTuanRes = await QueryTuan(activeId, tuanId);
      if (QueryTuanRes && QueryTuanRes.ret === 0) {
        const { tuanInfo } = QueryTuanRes.data;
        if ((tuanInfo && tuanInfo[0]['endTime']) <= QueryTuanRes['nowTime'] && surplusOpenTuanNum > 0) {
          $.log(`之前的团已过期，准备重新开团\n`)
          await CreateTuan();
        }
        for (let item of tuanInfo) {
          const { realTuanNum, tuanNum, userInfo } = item;
          $.log(`\n开团情况:${realTuanNum}/${tuanNum}\n`);
          if (realTuanNum === tuanNum) {
            for (let user of userInfo) {
              if (user.encryptPin === $.encryptPin) {
                if (user.receiveElectric && user.receiveElectric > 0) {
                  console.log(`您在${new Date(user.joinTime * 1000).toLocaleString()}开团奖励已经领取成功\n`)
                  if ($.surplusOpenTuanNum > 0) await CreateTuan();
                } else {
                  $.log(`开始领取开团奖励`);
                  await tuanAward(item.tuanActiveId, item.tuanId);//isTuanLeader
                }
              }
            }
          } else {
            $.tuanIds.push(tuanId);
            $.log(`\n此团未达领取团奖励人数：${tuanNum}人\n`)
          }
        }
      }
    }
  }
}
async function joinLeaderTuan() {
  $.tuanIdS = null;
  if (!$.tuanIdS) await updateTuanIdsCDN('https://gitee.com/Soundantony/updateTeam/raw/master/shareCodes/jd_updateFactoryTuanId.json');
  if ($.tuanIdS && $.tuanIdS.tuanIds) {
    for (let tuanId of $.tuanIdS.tuanIds) {
      if (!tuanId) continue
      await JoinTuan(tuanId);
    }
  }
  $.tuanIdS = null;
  if (!$.tuanIdS) await updateTuanIdsCDN('https://gitee.com/Soundantony/updateTeam/raw/master/shareCodes/jd_updateFactoryTuanId.json');
  if ($.tuanIdS && $.tuanIdS.tuanIds) {
    for (let tuanId of $.tuanIdS.tuanIds) {
      if (!tuanId) continue
      await JoinTuan(tuanId);
    }
  }
}
//可获取开团后的团ID，如果团ID为空并且surplusOpenTuanNum>0，则可继续开团
//如果团ID不为空，则查询QueryTuan()
function QueryActiveConfig() {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&tuanId=`;
    const options = taskTuanUrl(`QueryActiveConfig`, body, `_time,activeId,tuanId`)
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              const { userTuanInfo } = data['data'];
              console.log(`\n团活动ID  ${userTuanInfo.activeId}`);
              console.log(`团ID  ${userTuanInfo.tuanId}\n`);
            } else {
              console.log(`QueryActiveConfig异常：${JSON.stringify(data)}`);
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
function QueryTuan(activeId, tuanId) {
  return new Promise((resolve) => {
    const body = `activeId=${escape(activeId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`QueryTuan`, body, `_time,activeId,tuanId`)
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              // $.log(`\n开团情况:${data.data.tuanInfo.realTuanNum}/${data.data.tuanInfo.tuanNum}\n`)
            } else {
              console.log(`异常：${JSON.stringify(data)}`);
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
//开团API
function CreateTuan() {
  return new Promise((resolve) => {
    const body =`activeId=${escape(tuanActiveId)}&isOpenApp=1`
    const options = taskTuanUrl(`CreateTuan`, body, '_time,activeId,isOpenApp')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`开团成功tuanId为\n${data.data['tuanId']}`);
              $.tuanIds.push(data.data['tuanId']);
            } else {
              console.log(`开团异常：${JSON.stringify(data)}`);
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

function JoinTuan(tuanId, stk = '_time,activeId,tuanId') {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`JoinTuan`, body, '_time,activeId,tuanId')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`参团成功\n${JSON.stringify(data)}\n`);
            } else {
              console.log(`参团失败：${JSON.stringify(data)}`);
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
//查询所有的团情况(自己开团以及参加别人的团)
function QueryAllTuan() {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&pageNo=1&pageSize=10`;
    const options = taskTuanUrl(`QueryAllTuan`, body, '_time,activeId,pageNo,pageSize')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              const { tuanInfo } = data;
              for (let item of tuanInfo) {
                if (item.tuanNum === item.realTuanNum) {
                  // console.log(`参加团主【${item.tuanLeader}】已成功`)
                  const { userInfo } = item;
                  for (let item2 of userInfo) {
                    if (item2.encryptPin === $.encryptPin) {
                      if (item2.receiveElectric && item2.receiveElectric > 0) {
                        console.log(`${new Date(item2.joinTime * 1000).toLocaleString()}参加团主【${item2.nickName}】的奖励已经领取成功`)
                      } else {
                        console.log(`开始领取${new Date(item2.joinTime * 1000).toLocaleString()}参加团主【${item2.nickName}】的奖励`)
                        await tuanAward(item.tuanActiveId, item.tuanId, item.tuanLeader === $.encryptPin);//isTuanLeader
                      }
                    }
                  }
                } else {
                  console.log(`${new Date(item.beginTime * 1000).toLocaleString()}参加团主【${item.tuanLeader}】失败`)
                }
              }
            } else {
              console.log(`QueryAllTuan异常：${JSON.stringify(data)}`);
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
//开团人的领取奖励API
function tuanAward(activeId, tuanId, isTuanLeader = true) {
  return new Promise((resolve) => {
    const body = `activeId=${escape(activeId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`Award`, body, '_time,activeId,tuanId')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (isTuanLeader) {
                console.log(`开团奖励(团长)${data.data['electric']}领取成功`);
                message += `【开团(团长)奖励】${data.data['electric']}领取成功\n`;
                if ($.surplusOpenTuanNum > 0) {
                  $.log(`开团奖励(团长)已领取，准备开团`);
                  await CreateTuan();
                }
              } else {
                console.log(`参团奖励${data.data['electric']}领取成功`);
                message += `【参团奖励】${data.data['electric']}领取成功\n`;
              }
            } else if (data['ret'] === 10212) {
              console.log(`${JSON.stringify(data)}`);

              if (isTuanLeader && $.surplusOpenTuanNum > 0) {
                $.log(`团奖励已领取，准备开团`);
                await CreateTuan();
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`);
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

function updateTuanIdsCDN(url) {
  return new Promise(async resolve => {
    $.get({url,
      headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (safeGet(data)) {
            $.tuanIdS = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(3000)
    resolve();
  })
}

//商品可兑换时的通知
async function exchangeProNotify() {
  await GetShelvesList();
  let exchangeEndTime, exchangeEndHours, nowHours;
  //脚本运行的UTC+8时区的时间戳
  let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
  if ($.shelvesList && $.shelvesList.length > 0) console.log(`\n  商品名     兑换状态`)
  for (let shel of $.shelvesList) {
    console.log(`${shel['name']}    ${shel['exchangeStatus'] === 1 ? '未兑换' : shel['exchangeStatus'] === 2 ? '已兑换' : '兑换超时'}`)
    if (shel['exchangeStatus'] === 1) {
      exchangeEndTime = shel['exchangeEndTime'] * 1000;
      $.picture = shel['picture'];
      // 兑换截止时间点
      exchangeEndHours = new Date(exchangeEndTime + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).getHours();
      //兑换截止时间(年月日 时分秒)
      $.exchangeEndTime = new Date(exchangeEndTime + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString('zh', {hour12: false});
      //脚本运行此时的时间点
      nowHours = nowTimes.getHours();
    }
  }
  if (exchangeEndTime) {
    //比如兑换(超时)截止时间是2020/12/8 09:20:04,现在时间是2020/12/6
    if (nowTimes < exchangeEndTime) {
      //还可以兑换
      // 一:在兑换超时这一天(2020/12/8 09:20:04)的前2小时内通知
      if ((exchangeEndTime - nowTimes.getTime()) <= 3600000 * 2) {
        let expiredTime = parseInt(((exchangeEndTime - nowTimes.getTime()) / (60*1000)).toFixed(0))
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${expiredTime}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, {'open-url': jxOpenUrl, 'media-url': $.picture})
        // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${(exchangeEndTime - nowTimes) / 60*60*1000}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, { url: jxOpenUrl })
        if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${expiredTime}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换${$.index !== cookiesArr.length ? '\n\n' : ''}`
      }
      //二:在兑换超时日期前的时间一天通知三次(2020/12/6 9,10,11点,以及在2020/12/7 9,10,11点各通知一次)
      if (nowHours === exchangeEndHours || nowHours === (exchangeEndHours + 1) || nowHours === (exchangeEndHours + 2)) {
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, {'open-url': jxOpenUrl, 'media-url': $.picture})
        // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, { url: jxOpenUrl })
        if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换${$.index !== cookiesArr.length ? '\n\n' : ''}`
      }
    } else {
      //兑换已超时
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}兑换已超时，请重新选择商品生产\n【兑换截止时间】${$.exchangeEndTime}`, {'open-url': jxOpenUrl})
      // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}兑换已超时，请重新选择商品生产\n【兑换截止时间】${$.exchangeEndTime}`, { url: jxOpenUrl })
      if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}兑换已超时，请重新选择商品生产\n【兑换截止时间】${$.exchangeEndTime}${$.index !== cookiesArr.length ? '\n\n' : ''}`
    }
  }
}
async function showMsg() {
  return new Promise(async resolve => {
    message += `【收取自己零件】${$.pickUpMyselfComponent ? `获得${$.pickEle}电力` : `今日已达上限`}\n`;
    message += `【收取好友零件】${$.pickUpMyselfComponent ? `获得${$.pickFriendEle}电力` : `今日已达上限`}\n`;
    if ($.isNode() && process.env.DREAMFACTORY_NOTIFY_CONTROL) {
      $.ctrTemp = `${process.env.DREAMFACTORY_NOTIFY_CONTROL}` === 'false';
    } else if ($.getdata('jdDreamFactory')) {
      $.ctrTemp = $.getdata('jdDreamFactory') === 'false';
    } else {
      $.ctrTemp = `${jdNotify}` === 'false';
    }
    if (new Date().getHours() === 22) {
      $.msg($.name, '', `${message}`)
      $.log(`\n${message}`);
    } else {
      $.log(`\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
      $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Factory.json",headers:{
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
        }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(async resolve => {
    await updateTuanIdsCDN('https://gitee.com/Soundantony/updateTeam/raw/master/shareCodes/jd_updateFactoryTuanId.json');
    if ($.tuanIdS && $.tuanIdS.tuanActiveId) {
      tuanActiveId = $.tuanIdS.tuanActiveId;
    }
    console.log(`开始获取${$.name}配置文件\n`);
    console.log(`tuanActiveId: ${tuanActiveId}`)
    //Node.js用户请在jdCookie.js处填写京东ck;
    const shareCodes = $.isNode() ? require('./jdDreamFactoryShareCodes.js') : '';
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_jxFactory')) $.shareCodesArr = $.getdata('jd_jxFactory').split('\n').filter(item => item !== "" && item !== null && item !== undefined);
      console.log(`\nBoxJs设置的京喜工厂邀请码:${$.getdata('jd_jxFactory')}\n`);
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify($.shareCodesArr)}`);
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
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
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
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
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
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
function taskTuanUrl(functionId, body = '', stk) {
  let url = `https://m.jingxi.com/dreamfactory/tuan/${functionId}?${body}&_time=${Date.now()}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&_ste=1`
  url += `&h5st=${decrypt(Date.now(), stk || '', '', url)}`
  if (stk) {
    url += `&_stk=${encodeURIComponent(stk)}`;
  }
  return {
    url,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Cookie": cookie,
      "Host": "m.jingxi.com",
      "Referer": "https://st.jingxi.com/pingou/dream_factory/divide.html",
      "User-Agent": "jdpingou;iPhone;3.15.2;13.5.1;90bab9217f465a83a99c0b554a946b0b0d5c2f7a;network/wifi;model/iPhone12,1;appBuild/100365;ADID/696F8BD2-0820-405C-AFC0-3C6D028040E5;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/14;pap/JA2015_311210;brand/apple;supportJDSHWK/1;"
    }
  }
}

function taskurl(functionId, body = '', stk) {
  let url = `${JD_API_HOST}/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`
  url += `&h5st=${encodeURIComponent(decrypt(Date.now(), stk, '', url))}`
  if (stk) {
    url += `&_stk=${encodeURIComponent(stk)}`;
  }
  return {
    url,
    headers: {
      'Cookie': cookie,
      'Host': 'm.jingxi.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': functionId === 'AssistFriend' ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36" : 'jdpingou',
      'Accept-Language': 'zh-cn',
      'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function newtasksysUrl(functionId, taskId, stk) {
  let url = `${JD_API_HOST}/newtasksys/newtasksys_front/${functionId}?source=dreamfactory&bizCode=dream_factory&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`;
  if (taskId) {
    url += `&taskId=${taskId}`;
  }
  if (stk) {
    url += `&_stk=${stk}`;
  }
  //传入url进行签名
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}`
  return {
    url,
    "headers": {
      'Cookie': cookie,
      'Host': 'm.jingxi.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': "jdpingou;iPhone;3.15.2;13.5.1;90bab9217f465a83a99c0b554a946b0b0d5c2f7a;network/wifi;model/iPhone12,1;appBuild/100365;ADID/696F8BD2-0820-405C-AFC0-3C6D028040E5;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/14;pap/JA2015_311210;brand/apple;supportJDSHWK/1;",
      'Accept-Language': 'zh-cn',
      'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
/*
修改时间戳转换函数，京喜工厂原版修改
 */
Date.prototype.Format = function (fmt) {
  var e,
      n = this, d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
      };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  for (var k in l) {
    if (new RegExp("(".concat(k, ")")).test(d)) {
      var t, a = "S+" === k ? "000" : "00";
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
    }
  }
  return d;
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
function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlQueryParams(url, '_stk') : '')
  if (stk) {
    // const random = '9c66+/6i1jjP';
    // const token = `tk01wc7621cbea8nQmVZSmlhZi94FdUu+YM8dL1NZhoyQSy2c0po7rgY+nXdXBWRaUzOoLBqlpqOccJ56KHSjVil7Q7w`;
    // const fingerprint = 2964628087631161;
    // const appId = 10001;
    const random = 'cNlpbJCwIFx/';
    let token = `tk01wc7951ceea8nVzY0UlBvK3QvPAfwG6UuVMo3YIwnuyPtwgIZr9BSCkJT96NMHRqNWCO5x0zbNsEA2bkjst3tYymV`;
    let fingerprint = 6318883301648161;
    const appId = 10001;
    const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
    const str = `${token}${fingerprint}${timestamp}${appId}${random}`;
    const hash1 = $.CryptoJS.HmacSHA512(str, token).toString($.CryptoJS.enc.Hex);
    let st = '';
    stk.split(',').map((item, index) => {
      // sts += `${item}:${item === '_time' ? time : item === 'zone' ? 'dream_factory' : item === 'type' ? type || '1' : item}${index === stk.split(',').length -1 ? '' : '&'}`;
      st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length -1 ? '' : '&'}`;
    })
    // const hash2 = $.CryptoJS.HmacSHA256(st, hash1).toString($.CryptoJS.enc.Hex);
    // const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString($.CryptoJS.enc.Hex)).toString($.CryptoJS.enc.Hex);
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    // console.log(`st:${st}\n`)
    // console.log(`hash2:${JSON.stringify(["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)])}\n`)
    // console.log(`h5st:${["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)].join(";")}\n`)
    return ["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)].join(";")
  } else {
    return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
  }
}
/**
 * 新增url参数获取函数
 * @param url_string
 * @param param
 * @returns {string|string}
 */
function getUrlQueryParams(url_string, param) {
  let  url = new URL(url_string);
  let data = url.searchParams.get(param);
  return data ? data : '';
}

/**
 * 获取url参数值
 * @param url
 * @param name
 * @returns {string}
 */
function getUrlData(url, name) {
  const query = url.match(/\?.*/)[0].substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === name) {
      return pair[1];
    }
  }
  return ''
}
var _0xodX='jsjiami.com.v6',_0x2cf9=[_0xodX,'w7ccXcKJw5E=','ecOfw6tTw60=','FCYuUsOR','w70qXELCrFUv','wp8BeV0=','w6sYQcKdw4B9','w4ZzwpTDrsOf','wonDoMKjw69Zd1A=','FF/Cvlk=','w7o8f8OOw4jDiQ==','FsOeF2LChcOKwps=','PzwZfg==','SsKJw7BQ','Digew60P','w5QZVcKow4E=','YDPDgg==','w7jDocKyAg==','WQ8sUuits+azreWmtei0i+++jeitnOaiveafree9pei0uemFmuivhw==','wr/CkEYZwpY=','wrnCoMOvFMK9','B058wpbDkQ==','OMKlPG7Dsg==','cMKNTHTDtA==','MBxqd8On','VcKcw61Uwr7CikIMw7vDgMO3QcKZOgsNwpkdSgTCiHgzwodhw7IZKcOmwrXDpMKRwpJyw5NwT8KHHMKyBsObYcKkd8OcNsKFDcOXdsO7wrofHzFzd8Oqw6zDtBYwbsOMRmXCow==','QTPDn2rDkgvCiUbCvcKhwpPCgW9GwroBHcKVwpjCtSTCkzMmw5tkc8KQwrvCsMKFDUJpw5AJwoAoTcOEVsK/VsKHZMKFwo8Vwrl+wpjCjE7DkcO1JQsWccKEGsKDw4tkcmprw60yYsOlw4PDhnXCvn5MwrInw41hDMK1HFvClgo+wpcIXsK5JUXCsAnDpsO3wp7CnMOJwpNjw4nCrsOMw4fCgBbCllbDnBfCv0VBwqDCscOUbcOzV8Oyw5Enw6zDoWBtwrcywo0Iw4zCq3bDnybDicKUwpPDsCzDqcOcVFPCvcOpcMKaw53Crz5rwrY=','w5PCjlg2w7g=','w5wKXSzCjg==','X8KZw6U=','wqTDp8OLwqnCow==','bMOHwpXCpUU=','PcOsEWzCgA==','wrjDgMKPwpDCnQ==','RsOswo3CpW4=','w7nDssKoLMOX','w5kpw4/CrMO4','wp7DhMOqwp7CnQ==','w5onw7UIQQ==','w6sSSMK/w4Zn','w5AQw5DCsA==','w6bCp8KNSOitiOazgOWktOi2lO+9o+iumeaiueacrOe9vei2remEuOivqA==','EmJDw6LDi8K/wofCog==','w6Y4Y8Oaw5k=','GCIQeMOxw4bDoA==','WcKJw61FworDlRkS','wrHDpcKBwpw=','w5Iew5rCkMOrZA==','w6DCg8K4w6DCtg==','XMKow5bDpxc=','w6vCsGYuw4I=','BRQy','esK9wq/DvsOV','w4ZNwrPDqMOQ','aMOPwp7CiG8=','w5bDrQgFcQ==','d8KnwrjDqcOm','VQTDqcOUw74=','w7jDtsKpI8O6','wr7DncKswqvCoQ==','BV5rwoXDrMO/w5tORDbCvTYIYsOnwoQTwoFSXzbDmMKswoMmdcK3EG3DozRIRwAMOsO3w5x6w7NQasOawqAHSMK7w7zCvS0HwqbDtEs/w4sDH8KWX8KFw5kEw7TDmcOCwonCsQ==','dsKDwrHDscOaA8OtwoVmHMKJUsKTw7pTwqcFw4XDpcOJRTbCncO7wpTDkAfDk8O3w4dbwot6wr57w6ADwrTDunPDmcKKwojDqFZgaMORPCMCZwbDpSV6wpBiWMOdZ8Oyw6XCt8K7worDjAcJw6jCswNSw5fDhMKmd3dxKMKaZ8Oqw7ldw6jDhjjDtDHChXnCpljChSPDmsOST1hyDmlofsKie8KcAWbCsTjCvcOSwqkYfh1XwofCoz3CmcOaw4/DpH/CqsKewrzDhcOwwoxBL8KMwr15wqvCscKFJcKHHW1mwonDgsOxJBzCm8K9w77Dth8=','H8OcOVDCkw==','FVnCt3st','F8OsIHvCrQ==','Oh9ef8OB','woHDvsKuY8OE','S8KOw6p+wp4=','wqkWDsKrw7U=','KkvDu8O3wpk=','GBspWcOR','wrEsFgYa','wpzDkMK4','dVDCmsKFMg==','ZhTDnFPDpw==','w4bDssKKD8Ov','w7HCrHAQw5Y=','ScOkF8Ohw7Y=','w7rDr8K4','woLClVEu','dTjDkmXorr3msZ/lp6PotKrvvoXorKXmo4zmnojnvaHotZfph6for6c=','w5LDpcKdZ8Ka','asKbw54gCg==','w7kBw6nCmMOA','woXCmX4xwqQ=','NkzCr10ZKT8=','wqLDscKawovCtQ==','w6HDrxsgTA==','w7I4ZcOIw7vDhMOb','w4NywrXDhcOmw48=','e0LCgMKpHA==','DRohw4YuVcO4','w5nDsMK6CcOnwr3DnmpLw5NVcwk=','w7/CssKZw5fCum4=','TcOnw7Raw7s5Wg==','wqw1CyUFw49KGCLCo8OJe8KD','Gk/DosOQ','ecKww6LDtQM=','wrzDscKFwp0=','w5vDtMKcSOitg+ayguWnmei3je+8nuivo+agn+afsee9gui3kumHvOivow==','TcO/wo7Cj0s5bcKg','GRonw5QM','wrgfcFvCvMK6IA==','w5XDvDopUUIRGA==','WMKZwqLDvA==','w7TCq00ow54=','Dnx2wqbDjA==','SsOIwpPCvV8=','ORbDpWk4bw==','RcOpw6c=','GGJaw6Y=','UsO+M0rorLXms63lp57otLTvvrPor4HmoIPmnb7nvoTotZnphIzorrk=','w4HCgMKlw4fCtw==','w7rDr8K4IsOHwqo=','VcKww4/DrTY=','Al7CrFc4','FRd5QMOf','wqvCvMOvSMKmbcO2cMORw51+Pg==','bETCncKPEz5KAQbDvl06w6pVw6UOwrTDtsKKNm3DkGsbw6fDjmLDmsOAMk7DtMKs','wrrDpMKcwojCox7CrRXDlcOKPcO8wrNiwpUaw4UEOA==','DgE8w5dFEMOoSMOgN0UYSG1awrvDmQ==','ZlHCiMKTVzxHHBnDtA==','wrgDbFTCoMKwJcOWw6XCuGfDsWTCnsKlIxrDscOOFR4HTsKHNsOOw5zDlMKRwqbDnsOKwqM=','w41qOxgSw7hxCQTChcOsSsKk','Hz3Dl20=','HGdWw7PDvMOhwprDg8KKbMOJK8Kow7MxMMKSw5xuw7VMwrMxwo3CtMKfacOqw513w4/CrEE0wo1PBwYWBSHCn2PDlG0eJnPCmcK5dsO2S8OoAcOuNgFPWDkdUlvDi2d+VcK/wrYYwq4AIgvDqWY=','wrDCpMKrBcKl','wojCrsO+IMOPeMKE','w4l7wrTDjcOg','w6fCksKzw4HCvQ==','w7DDtsKma8KvwpI=','w57CpmUnw6XDkCQ=','wrUWcl/CvcK7','IUXCuk47DyRwwq8=','wpFMw4nDkgQ=','w77DtMKrF8OGw6LClRVLw4BXOBBuI8KqUsKlw5ogwoLClT7CkTkkAR4tw7LCk8KgaDA=','PxPDhX8+','w4fDtcK7IcOE','w5vDhsKtbMKW','K8OxFVTCiw==','AR3DmlkQ','SV3ChMKvFQ==','HsKzPlXDtEI=','WMKGw68=','w6EhTxTCscOhAifDvsKtbUfDrg==','F8ORFQ==','Y8OCw59uw68ZfH9jw5/Ckztw','w4B2cMOxw4E=','w74wSirCuw==','WQ/DoFHDoSbCryzDhsOb','d8K4w5TDqyVFwrE=','w6gaXcKIw70=','EWZDw6fDrcKuwpI=','wrYUbkrCgA==','T0DCusKGLg==','wrrDpMKcwojCox7CrRXDlcOKPcO8wrNiwpUaw4UEOCPCrMONwrfDpErCpnvClsOiw61aP8O2QiLDgMKwIsKKw70IcMK3PE/ChyoMwqwCwrDCr8Klw5TDmhNow45cFBcVw4zDosKZwoTCgcKHw6ZNHgXDu1JHBsK3YgASEhrCpcO9ZzZiwqIG','wop/w6zDuHw=','W8Kdw7dHwrnDmQJNw5HDgMKkB8KWJR83wpQXSB/DkH8iwopow7ceYsOow6DDpsOVwo17w5VnBcK8HsK6GsKKPsOq','wpPCsWwmd0oAC8O3NT5jwrZvA8KCDmTCh8KTJ23CvMKdRybDmFHCv2vDscKbCxZvKsKVw6rDm8OmAcOcGcKuw4BNwrPCuMKswoHDkzbDicOyw6rDqXw8w5oZw5J4N1Ukwr0jaWLDh1hrwojCtMKhw5fDnsOUw4EtJsKzQjPDulc=','w4oWWcKSw7M=','wpPDosOrwobCiQ==','Fn3CvEYq','w5fCh8KQw4rCug==','AUV4','w4UEfSQ=','wo9WwovDq+itpeazpeWllOi2ke+9nOiuoOaigOafoue/uei2vOmHiOiulA==','IHjDgsOIwrU=','HUttwobDug==','w6kkW1c=','w7gvw4E=','R8O/wpfCiw==','SToFw67orp7msbLlpr3otIjvvororqzmo6Tmnonnvbzotq7phrforIw=','XMKKelbDsg==','wogoO8Kuw60=','eFzChcKSIw==','w4HDvDw7cw==','CS8OaMOh','w7/CuMKQw7XCvHQ=','w48ifhDCpg==','C196wp7DqQ==','Q8K8wq3DqsOw','MMKvM2PDtA==','TMKKw7xHwo8=','wqk0GMKyw4Q=','w7PDr8K4CMOt','wr7CiMO1PMKI','woPDo8KqSMOs','w45nwrLCjMO/wokPw5B+NC9q','w5DDrT4kf0QEXcKkeHJgw6wrGcKUHizCtMKOOSLCq8OKFzfCm1zCsG3DsMKQGw==','w5YFw4nCpcOqLAvDtsOJw5HClsOuRMOIw4zCrcKxecKZwokAwpTCjcOXdsODXMODfTnDi8KLw5Erdw==','aybDjHPCkkfCjAzDrsOjw4LDlSIDw4oLAA==','wpDDkMKpccKZwqHChMKBZHE=','wpECMcKNw57Dly0ow74lH8KRw5FIcMK0MifDqWDCrsOgw7Buw47DvMKXfMOFw6XDvgtx','B8Kpw5Vow7kOcWFlw53CmCF3','MwopWg==','wqzCgsK8ccOPwrlsw6EHARfCrBd7w5sPwqLCpsOAA8OtfsO7wq3Di1kFG8KDf8OGYsKYw7Zew6pxNMKww5/DkXXCv1gBDcKiw5ZwBkHDhVJdw4UYesOWwo1qEV53w4tifcK/YxIjwr0xwoAsaxFR','w6zDqMOyBMOb','IjJuTsOSw6nCmcKR','d8K/XEjDk1ZYwpnDncKWCMOtw4vCpcKYw4TCn8O7MAHDqsKVwqAHWw==','w6E3UwPCgw==','woLCkcKrd8OS','w6pzdsO1w4w=','wps0GcKPw4Q=','S8KYw54rKA==','esKmw7JWwr8=','ZEfCo8KMHjg=','CERp','w7Q1w6LCgMOKU3bChsOnw6bCtsOOYg==','ScONGA==','wqkBMR4Ew698FwLCh8OnUMKj','wpHCu8O0wqrDjQ==','O03DhMOMwrg=','w6siw7jCh8OGV2PCnMOow7U=','w6XDssK8a8KhwosF','w5EUSsKUw54=','woQgGi82w55P','w70MdS/CiA==','wrXDgMKgw6xG','w5fCvn00w6PCg2/Cj8KVw7IoQiHDu2xOH8KTDw4kJMKDa0rCjmkiw4Qiw4AWVSzDkMOaQsOuw4XCr0xCNTLCmTxJw7fDu8KgOAnDo8Ksw5HClnVJw6TDt8KJwp3DmU3Dq8OLR1zCl1cVCMK0w7HDvcKcf8OKQlnDpVfCkR0iwr/Cmn7DiMKMNcKXw4PDjsOrwrRSJsKwCVJIw7Y=','wrzDusKIVsOF','worCrsO7JsOUZcOdC8O0wohqwppWUsOxH1vDjcO5wrvCr8KYECfDtg48H8OMUsOyw6haw79YwqnDqsKVVsKcYwfDpixnCMK/UhHCs2csA8KXwoHDuiTCmsO6N3IpKDDDg2fDigfDu8OhwrnDpi1hNcOPw6zDjz1pYy3DlsO+w7vDmMKnaMOJwoR+w73DhMO3ccKIc38qw75Awp3CjsKVwqxMdylReAACwoFjw7HDu8KifMKQByp3OMKXdw1Kw5vCv8OTw5zCj2XChVY1CMKLRiFCZMOdSzNYY8K3w5kqwp3DsMOKaGzCuWTCvVnCk8KJw6pRF8OFwqPCrcOxcVw8VErDpwnDtMOlXMKvAcOyw71cwrbDkcOrwrfCrE7Cgw==','w6TDisO/YMOcw7ZMw5VNVFvDuBxwwpcFw6/DtcOCCsOtNcOxwqLCj3oFXMO0WMOTRcOpw6cjwrgyRcOuw43CjAXCpUMDHcOqwpY/K3PDrllNw7sZYcOJw7EvQho0wpgEJsOvZ1lhwrBiw552M2sOwo9ueMK8wpXCmMOsOxrCtUUyw7tZB1PDmMOvw7TCqXPDlMOrUw==','G8K3w60Z','Z8OmwoLCmGc=','asOzCcOIw5k=','w4h3WsOhw6c=','TsKoX2HDhA==','wpfDmsKr','PDJgQA==','w4zCtWwC6KyU5rKv5aWx6Lao772n6K6a5qC+5p29572x6LWZ6YeX6Kyz','BmxEw7c=','wobCjcOJwpHDsg==','FMKaSD7CgQ==','BiMUw7YK','KWHDp8O9woc=','ITbDlmQf','DMKaAXTCpA==','w4w1UxLCkQ==','X8Ksw5ICOg==','IMKYbg==','w7cqRUY=','wpHDnB4B6K+h5rGl5aWU6LSM77+B6K+g5qOc5p6q57+F6Lep6Yaj6Ky2','DsKKGlzDqQ==','w6kqWlDCjg==','w4khchfCmw==','wpTDgMKPwpDCug==','ccKEw5powr0=','ZcO7JcOWw7I=','RcOxwp3Cq34u','fD3Dl3DDmw==','woHDrsKww4tsYA==','wrRpw4fDnlM=','LDfDjnwv','EcKlGXXCqg==','VMOLBMOzw5I=','ORbDpQ==','Y1XCgMKG','V8KBIHPorafmsaXlpIzotKvvvJ/orZfmoavmnIjnvIDot7zph4Xorpo=','wrAyd1XCjg==','H8K0BErDox0SIXTDicOfwog0PWsgw6sXw7lQeMK3BsO+IxB6bDPCqMOCw7LCvsOEDSfCp147w5PDgy/CvMKaw5vDpmguGcOjHjRIcF3DoRvCtsKYIDVs','w4/DuMKyZsKswpMFwo3DrcK4wqLDicKBwqPCusK8wosZfFTClU81XyRXO8O/BcOTUibCnj/DmHZxd8O3w4QdwopKw6MkTcKtw7ZGdUzDuMORw63CtcOrZBnDgcK5wq/ClMOiGCs2woYfw47Cm1PCgsOmw61Nw4vDrTHCpCzCqSHDmcKRw7RxwoXClDYiw5nDg8KSOx3Cs8OYw57Dox0KwqMCBi/DtzTDqMK3CHMswrgXEsO2VcKjw6XCs8K0PMOCV33CggZyw75fb1wHGsOMw5xkAcK7woUAKcOrwrNnw4sxLR1sJcKnw7t5wp4Z','wo3Dl8K2R8O6','wrzCm3UFwo8=','FsOWLWnCtA==','dcKyw5gEMQ==','XnzCm8KPDA==','wq3CrcO0KcO7','e8OADMOmw4o=','S8OGGg==','wrHCk8KeRcOI','ecKIw4rDqi8=','AUHDrA==','w43DgMKHw4for6nmsZDlpJXot43vvKzorbPmo7HmnrDnvpzot4nphrHorIg=','LcKvWTDCvg==','QsO2GcOCw6M=','YgnDkmHDrg==','wpZYw5TDl37CpF0=','GFjsjhiRSVGuamiH.dIzcomSC.v6=='];(function(_0x4414d4,_0x3de310,_0x15984b){var _0x5cf675=function(_0x45cea9,_0x3e668e,_0x42dae8,_0x19d13f,_0x3e0ec1){_0x3e668e=_0x3e668e>>0x8,_0x3e0ec1='po';var _0x2410b3='shift',_0x559d84='push';if(_0x3e668e<_0x45cea9){while(--_0x45cea9){_0x19d13f=_0x4414d4[_0x2410b3]();if(_0x3e668e===_0x45cea9){_0x3e668e=_0x19d13f;_0x42dae8=_0x4414d4[_0x3e0ec1+'p']();}else if(_0x3e668e&&_0x42dae8['replace'](/[GFhRSVGuHdIzSC=]/g,'')===_0x3e668e){_0x4414d4[_0x559d84](_0x19d13f);}}_0x4414d4[_0x559d84](_0x4414d4[_0x2410b3]());}return 0x7c908;};var _0x4005f6=function(){var _0x572b00={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x45c594,_0x2d24f9,_0x4f5664,_0x2ca252){_0x2ca252=_0x2ca252||{};var _0x53d992=_0x2d24f9+'='+_0x4f5664;var _0x362dac=0x0;for(var _0x362dac=0x0,_0x4303c5=_0x45c594['length'];_0x362dac<_0x4303c5;_0x362dac++){var _0x4fda8c=_0x45c594[_0x362dac];_0x53d992+=';\x20'+_0x4fda8c;var _0x1fe2f0=_0x45c594[_0x4fda8c];_0x45c594['push'](_0x1fe2f0);_0x4303c5=_0x45c594['length'];if(_0x1fe2f0!==!![]){_0x53d992+='='+_0x1fe2f0;}}_0x2ca252['cookie']=_0x53d992;},'removeCookie':function(){return'dev';},'getCookie':function(_0x252c3e,_0x4f9396){_0x252c3e=_0x252c3e||function(_0x32541b){return _0x32541b;};var _0x3132f1=_0x252c3e(new RegExp('(?:^|;\x20)'+_0x4f9396['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x1c12d1=typeof _0xodX=='undefined'?'undefined':_0xodX,_0x423842=_0x1c12d1['split'](''),_0x5d8654=_0x423842['length'],_0x108491=_0x5d8654-0xe,_0x2543ea;while(_0x2543ea=_0x423842['pop']()){_0x5d8654&&(_0x108491+=_0x2543ea['charCodeAt']());}var _0x234835=function(_0x290bff,_0x33d290,_0x340ec1){_0x290bff(++_0x33d290,_0x340ec1);};_0x108491^-_0x5d8654===-0x524&&(_0x2543ea=_0x108491)&&_0x234835(_0x5cf675,_0x3de310,_0x15984b);return _0x2543ea>>0x2===0x14b&&_0x3132f1?decodeURIComponent(_0x3132f1[0x1]):undefined;}};var _0x5b7ba1=function(){var _0x8d520c=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x8d520c['test'](_0x572b00['removeCookie']['toString']());};_0x572b00['updateCookie']=_0x5b7ba1;var _0x1c6d61='';var _0x430736=_0x572b00['updateCookie']();if(!_0x430736){_0x572b00['setCookie'](['*'],'counter',0x1);}else if(_0x430736){_0x1c6d61=_0x572b00['getCookie'](null,'counter');}else{_0x572b00['removeCookie']();}};_0x4005f6();}(_0x2cf9,0x185,0x18500));var _0x5108=function(_0x3bd256,_0x4f7446){_0x3bd256=~~'0x'['concat'](_0x3bd256);var _0x4d4ee8=_0x2cf9[_0x3bd256];if(_0x5108['wiQbUL']===undefined){(function(){var _0x4dbb16=function(){var _0x57ae48;try{_0x57ae48=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5b36aa){_0x57ae48=window;}return _0x57ae48;};var _0x2cf2ac=_0x4dbb16();var _0xb89c70='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2cf2ac['atob']||(_0x2cf2ac['atob']=function(_0x2a6de2){var _0xc8bee1=String(_0x2a6de2)['replace'](/=+$/,'');for(var _0x1e1531=0x0,_0x54122e,_0x2b8eb0,_0x33a2db=0x0,_0x2f9091='';_0x2b8eb0=_0xc8bee1['charAt'](_0x33a2db++);~_0x2b8eb0&&(_0x54122e=_0x1e1531%0x4?_0x54122e*0x40+_0x2b8eb0:_0x2b8eb0,_0x1e1531++%0x4)?_0x2f9091+=String['fromCharCode'](0xff&_0x54122e>>(-0x2*_0x1e1531&0x6)):0x0){_0x2b8eb0=_0xb89c70['indexOf'](_0x2b8eb0);}return _0x2f9091;});}());var _0x54b479=function(_0x254574,_0x4f7446){var _0xedfeed=[],_0x25182b=0x0,_0x261d4f,_0x5861a='',_0x131696='';_0x254574=atob(_0x254574);for(var _0x46852d=0x0,_0x280d45=_0x254574['length'];_0x46852d<_0x280d45;_0x46852d++){_0x131696+='%'+('00'+_0x254574['charCodeAt'](_0x46852d)['toString'](0x10))['slice'](-0x2);}_0x254574=decodeURIComponent(_0x131696);for(var _0x522054=0x0;_0x522054<0x100;_0x522054++){_0xedfeed[_0x522054]=_0x522054;}for(_0x522054=0x0;_0x522054<0x100;_0x522054++){_0x25182b=(_0x25182b+_0xedfeed[_0x522054]+_0x4f7446['charCodeAt'](_0x522054%_0x4f7446['length']))%0x100;_0x261d4f=_0xedfeed[_0x522054];_0xedfeed[_0x522054]=_0xedfeed[_0x25182b];_0xedfeed[_0x25182b]=_0x261d4f;}_0x522054=0x0;_0x25182b=0x0;for(var _0x2d8919=0x0;_0x2d8919<_0x254574['length'];_0x2d8919++){_0x522054=(_0x522054+0x1)%0x100;_0x25182b=(_0x25182b+_0xedfeed[_0x522054])%0x100;_0x261d4f=_0xedfeed[_0x522054];_0xedfeed[_0x522054]=_0xedfeed[_0x25182b];_0xedfeed[_0x25182b]=_0x261d4f;_0x5861a+=String['fromCharCode'](_0x254574['charCodeAt'](_0x2d8919)^_0xedfeed[(_0xedfeed[_0x522054]+_0xedfeed[_0x25182b])%0x100]);}return _0x5861a;};_0x5108['xagEZs']=_0x54b479;_0x5108['TeQTiD']={};_0x5108['wiQbUL']=!![];}var _0x229721=_0x5108['TeQTiD'][_0x3bd256];if(_0x229721===undefined){if(_0x5108['PSbscT']===undefined){var _0x4edc76=function(_0xcbea05){this['lSfaun']=_0xcbea05;this['DbQdQm']=[0x1,0x0,0x0];this['wAKCBx']=function(){return'newState';};this['QZvlUW']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['kfKPVQ']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x4edc76['prototype']['sgWbJL']=function(){var _0x5bbd13=new RegExp(this['QZvlUW']+this['kfKPVQ']);var _0x361b8b=_0x5bbd13['test'](this['wAKCBx']['toString']())?--this['DbQdQm'][0x1]:--this['DbQdQm'][0x0];return this['iyoAOY'](_0x361b8b);};_0x4edc76['prototype']['iyoAOY']=function(_0x38cfe1){if(!Boolean(~_0x38cfe1)){return _0x38cfe1;}return this['zdfJYL'](this['lSfaun']);};_0x4edc76['prototype']['zdfJYL']=function(_0x42ca85){for(var _0x49fdfe=0x0,_0x306797=this['DbQdQm']['length'];_0x49fdfe<_0x306797;_0x49fdfe++){this['DbQdQm']['push'](Math['round'](Math['random']()));_0x306797=this['DbQdQm']['length'];}return _0x42ca85(this['DbQdQm'][0x0]);};new _0x4edc76(_0x5108)['sgWbJL']();_0x5108['PSbscT']=!![];}_0x4d4ee8=_0x5108['xagEZs'](_0x4d4ee8,_0x4f7446);_0x5108['TeQTiD'][_0x3bd256]=_0x4d4ee8;}else{_0x4d4ee8=_0x229721;}return _0x4d4ee8;};var _0x264d67=function(){var _0x3ae07d=!![];return function(_0x496d85,_0x24ad55){var _0x415c71=_0x3ae07d?function(){if(_0x24ad55){var _0x23429d=_0x24ad55['apply'](_0x496d85,arguments);_0x24ad55=null;return _0x23429d;}}:function(){};_0x3ae07d=![];return _0x415c71;};}();var _0x1ff4cd=_0x264d67(this,function(){var _0x2d9f2b=function(){return'\x64\x65\x76';},_0x2914af=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4c1bff=function(){var _0x4722cb=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4722cb['\x74\x65\x73\x74'](_0x2d9f2b['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x3af8a0=function(){var _0x54b8e5=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x54b8e5['\x74\x65\x73\x74'](_0x2914af['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x804645=function(_0x388894){var _0x5e4ef9=~-0x1>>0x1+0xff%0x0;if(_0x388894['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5e4ef9)){_0x19ba1d(_0x388894);}};var _0x19ba1d=function(_0x13d9fe){var _0x30fce3=~-0x4>>0x1+0xff%0x0;if(_0x13d9fe['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x30fce3){_0x804645(_0x13d9fe);}};if(!_0x4c1bff()){if(!_0x3af8a0()){_0x804645('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x804645('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x804645('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x1ff4cd();function wuzhi(_0xf00c44){var _0x3ed429={'CARnR':function(_0x8a7b09,_0x540d7f){return _0x8a7b09!==_0x540d7f;},'xZzOZ':_0x5108('0','7%dc'),'uhhqY':_0x5108('1','ZRE5'),'dGnQD':function(_0x1514d9){return _0x1514d9();},'MkvhG':function(_0x36d006,_0x425771){return _0x36d006(_0x425771);},'DPgzt':_0x5108('2','@k5B'),'tEDqs':function(_0x29d42d,_0x363e78){return _0x29d42d*_0x363e78;},'jjGSt':_0x5108('3','r!$U'),'QudFq':_0x5108('4','OU(U'),'YQecV':_0x5108('5','eaER'),'YNvWI':_0x5108('6','YBWW'),'TdXuZ':_0x5108('7','OU(U'),'DiiLo':_0x5108('8','kqXh'),'xpOij':function(_0x3a8bae,_0x969d4b){return _0x3a8bae(_0x969d4b);},'UUZkY':_0x5108('9','1@It'),'ogrrI':_0x5108('a','Jh!H'),'BtWeT':_0x5108('b','npXl'),'xFLNE':_0x5108('c','r!$U')};var _0x55fb1c=$[_0x5108('d','Oe8V')][Math[_0x5108('e','DVEQ')](_0x3ed429[_0x5108('f','C#b4')](Math[_0x5108('10','ltI(')](),$[_0x5108('11','tM!1')][_0x5108('12','kqXh')]))];let _0x5a2e77=_0xf00c44[_0x5108('13','ZRE5')];let _0x412f6a=_0x5108('14','%AcC')+_0x55fb1c+';\x20'+cookie;let _0x10e790={'url':_0x5108('15','dp32'),'headers':{'Host':_0x3ed429[_0x5108('16','Jh!H')],'Content-Type':_0x3ed429[_0x5108('17','dp32')],'origin':_0x3ed429[_0x5108('18','ltI(')],'Accept-Encoding':_0x3ed429[_0x5108('19','Wl!u')],'Cookie':_0x412f6a,'Connection':_0x3ed429[_0x5108('1a','Jh!H')],'Accept':_0x3ed429[_0x5108('1b','OU(U')],'User-Agent':$[_0x5108('1c','c8Fb')]()?process[_0x5108('1d','SLk4')][_0x5108('1e','lshq')]?process[_0x5108('1f','Wl!u')][_0x5108('20','W*A8')]:_0x3ed429[_0x5108('21','UZc6')](require,_0x3ed429[_0x5108('22','lshq')])[_0x5108('23','uukN')]:$[_0x5108('24','7%dc')](_0x3ed429[_0x5108('25','bnmO')])?$[_0x5108('26','npXl')](_0x3ed429[_0x5108('27','kqXh')]):_0x3ed429[_0x5108('28','OU(U')],'referer':_0x5108('29','eaER'),'Accept-Language':_0x3ed429[_0x5108('2a','%AcC')]},'body':_0x5108('2b','SLk4')+_0x5a2e77+_0x5108('2c',']V9Y')};return new Promise(_0x4641b1=>{var _0x26a3ad={'MVIlk':function(_0x4d984d,_0x27593d){return _0x3ed429[_0x5108('2d','bnmO')](_0x4d984d,_0x27593d);}};if(_0x3ed429[_0x5108('2e','yvFd')](_0x3ed429[_0x5108('2f','ZRE5')],_0x3ed429[_0x5108('30','C#b4')])){if(err){console[_0x5108('31','hV@B')]($[_0x5108('32','lshq')]+_0x5108('33','DVEQ'));}else{if(_0x26a3ad[_0x5108('34','4phi')](safeGet,data)){data=JSON[_0x5108('35','hV@B')](data);}}}else{$[_0x5108('36','$D#e')](_0x10e790,(_0x5f2507,_0x3fbd67,_0x5bca81)=>{try{if(_0x5f2507){console[_0x5108('37','phj$')]($[_0x5108('38','9DJw')]+_0x5108('39','YBWW'));}else{if(_0x3ed429[_0x5108('3a','!aXM')](_0x3ed429[_0x5108('3b','J5wQ')],_0x3ed429[_0x5108('3c','OU(U')])){_0x5bca81=JSON[_0x5108('3d',']V9Y')](_0x5bca81);}else{_0x5bca81=JSON[_0x5108('3e','%5Z!')](_0x5bca81);}}}catch(_0x5499b0){$[_0x5108('3f','C#b4')](_0x5499b0);}finally{_0x3ed429[_0x5108('40','lshq')](_0x4641b1);}});}});}function wuzhi01(_0x3416e0){var _0x596866={'YNEMT':function(_0x3c51cf){return _0x3c51cf();},'XmAew':function(_0x588d4e,_0x4e706f){return _0x588d4e===_0x4e706f;},'oXAQc':_0x5108('41','hV@B'),'DOlYY':_0x5108('42','7mwx'),'dqTQk':function(_0x5469c2,_0x177529){return _0x5469c2===_0x177529;},'gPCSs':_0x5108('43','c8Fb'),'bDbVy':function(_0x1e0101,_0x39d810){return _0x1e0101(_0x39d810);},'FPghj':function(_0xf0357a,_0x37ea35){return _0xf0357a===_0x37ea35;},'LlCLp':_0x5108('44','SLk4'),'IXKvA':_0x5108('45','J5wQ'),'yNLPe':_0x5108('46','dp32'),'xhjSa':function(_0x1c2c5c){return _0x1c2c5c();},'Nxxvk':function(_0x1c0230,_0x69b145){return _0x1c0230(_0x69b145);},'pqeyL':_0x5108('47','r!$U'),'QcwYd':_0x5108('48','0K9X'),'JRCBa':_0x5108('49','DVEQ'),'Dwvvm':_0x5108('4a',']V9Y'),'RuImg':_0x5108('4b','QAs('),'kFXns':_0x5108('4c','uukN'),'sdOza':_0x5108('4d','0K9X'),'GNkrr':_0x5108('4e','J5wQ'),'VcOhf':_0x5108('4f','W*A8'),'Vienj':_0x5108('50','%5Z!'),'XAwbX':_0x5108('51','mTjh'),'GODWq':_0x5108('52','dp32')};let _0x16c4f5=+new Date();let _0x22bc01=_0x3416e0[_0x5108('53','@k5B')];let _0x58edf5={'url':_0x5108('54','!aXM')+_0x16c4f5,'headers':{'Host':_0x596866[_0x5108('55','lshq')],'Content-Type':_0x596866[_0x5108('56','mTjh')],'origin':_0x596866[_0x5108('57','UZc6')],'Accept-Encoding':_0x596866[_0x5108('58','J5wQ')],'Cookie':cookie,'Connection':_0x596866[_0x5108('59','*@rs')],'Accept':_0x596866[_0x5108('5a','SLk4')],'User-Agent':$[_0x5108('5b','OU(U')]()?process[_0x5108('5c','hV@B')][_0x5108('5d','QAs(')]?process[_0x5108('5e','%D])')][_0x5108('5f','1@It')]:_0x596866[_0x5108('60',')Sqd')](require,_0x596866[_0x5108('61','4phi')])[_0x5108('62','QAs(')]:$[_0x5108('63','ltI(')](_0x596866[_0x5108('64','bnmO')])?$[_0x5108('65','1@It')](_0x596866[_0x5108('66','lshq')]):_0x596866[_0x5108('67','7jxj')],'referer':_0x5108('68','tM!1'),'Accept-Language':_0x596866[_0x5108('69','0K9X')]},'body':_0x5108('6a','Oe8V')+_0x22bc01+_0x5108('6b','mTjh')+_0x16c4f5+_0x5108('6c','SLk4')+_0x16c4f5};return new Promise(_0x3cbebf=>{var _0x245a54={'yJjfy':function(_0x34afb2,_0x11b9fb){return _0x596866[_0x5108('6d','9DJw')](_0x34afb2,_0x11b9fb);}};if(_0x596866[_0x5108('6e','%D])')](_0x596866[_0x5108('6f','UZc6')],_0x596866[_0x5108('70','!aXM')])){console[_0x5108('71','0K9X')]($[_0x5108('72','@k5B')]+_0x5108('73','5amV'));}else{$[_0x5108('74','npXl')](_0x58edf5,(_0x5847f3,_0xeec358,_0xe33fbe)=>{var _0x3a01a8={'tOTHU':function(_0x58767a){return _0x596866[_0x5108('75',')Sqd')](_0x58767a);}};try{if(_0x596866[_0x5108('76','FFNp')](_0x596866[_0x5108('77','YBWW')],_0x596866[_0x5108('78','4phi')])){_0x3a01a8[_0x5108('79','Jh!H')](_0x3cbebf);}else{if(_0x5847f3){if(_0x596866[_0x5108('7a','xsi&')](_0x596866[_0x5108('7b','lshq')],_0x596866[_0x5108('7c','*@rs')])){console[_0x5108('7d','FFNp')]($[_0x5108('7e','$D#e')]+_0x5108('7f',']V9Y'));}else{if(_0x245a54[_0x5108('80','c8Fb')](safeGet,_0xe33fbe)){_0xe33fbe=JSON[_0x5108('81','$D#e')](_0xe33fbe);}}}else{if(_0x596866[_0x5108('82','lshq')](safeGet,_0xe33fbe)){if(_0x596866[_0x5108('83','eaER')](_0x596866[_0x5108('84','SLk4')],_0x596866[_0x5108('85','%D])')])){$[_0x5108('86','9DJw')](e);}else{_0xe33fbe=JSON[_0x5108('87','uukN')](_0xe33fbe);}}}}}catch(_0x251b9e){$[_0x5108('88','7jxj')](_0x251b9e);}finally{if(_0x596866[_0x5108('89','%AcC')](_0x596866[_0x5108('8a','Jh!H')],_0x596866[_0x5108('8b','xsi&')])){_0x596866[_0x5108('8c','%D])')](_0x3cbebf);}else{console[_0x5108('8d','Jh!H')]($[_0x5108('8e','OU(U')]+_0x5108('8f','c8Fb'));}}});}});}function shuye72(){var _0x2b8487={'vbzFN':function(_0x4fc62a,_0x4d5bfb){return _0x4fc62a===_0x4d5bfb;},'PoINl':_0x5108('90','kqXh'),'diNjv':function(_0x219fad){return _0x219fad();},'MNIUx':function(_0x3d3ecc,_0x1da83f){return _0x3d3ecc!==_0x1da83f;},'SHvlv':function(_0x58c85c,_0x23a05d){return _0x58c85c<_0x23a05d;},'DofjA':function(_0x2f0211,_0x2035e4){return _0x2f0211(_0x2035e4);},'WcbFy':function(_0x279019){return _0x279019();},'wuCDw':_0x5108('91','c8Fb'),'iUjek':_0x5108('92','ltI(')};return new Promise(_0x5ea038=>{var _0x5708b8={'aXPkH':function(_0x14b77e,_0x3d744a){return _0x2b8487[_0x5108('93','0K9X')](_0x14b77e,_0x3d744a);},'nUwbP':_0x2b8487[_0x5108('94','5amV')],'PYkhQ':function(_0x597b10){return _0x2b8487[_0x5108('95','Wl!u')](_0x597b10);},'mhRIU':function(_0x4db812,_0x362ba6){return _0x2b8487[_0x5108('96','*@rs')](_0x4db812,_0x362ba6);},'idOLM':function(_0x5a9233,_0x339a6b){return _0x2b8487[_0x5108('97','OU(U')](_0x5a9233,_0x339a6b);},'gSKJf':function(_0x293db4,_0x35b3b3){return _0x2b8487[_0x5108('98','Oe8V')](_0x293db4,_0x35b3b3);},'SdzRu':function(_0x4cfd95){return _0x2b8487[_0x5108('99','%D])')](_0x4cfd95);}};$[_0x5108('9a','%D])')]({'url':_0x2b8487[_0x5108('9b','mTjh')],'headers':{'User-Agent':_0x2b8487[_0x5108('9c','7%dc')]}},async(_0x2d299e,_0x424240,_0x309e84)=>{try{if(_0x2d299e){console[_0x5108('9d','4phi')]($[_0x5108('72','@k5B')]+_0x5108('9e','7jxj'));}else{if(_0x5708b8[_0x5108('9f','FFNp')](_0x5708b8[_0x5108('a0','%D])')],_0x5708b8[_0x5108('a1','uukN')])){$[_0x5108('a2','%AcC')]=JSON[_0x5108('a3','bnmO')](_0x309e84);await _0x5708b8[_0x5108('a4','W*A8')](shuye73);if(_0x5708b8[_0x5108('a5','%5Z!')]($[_0x5108('a6','$D#e')][_0x5108('a7','kqXh')][_0x5108('a8','bnmO')],0x0)){for(let _0x21d78c=0x0;_0x5708b8[_0x5108('a9','DVEQ')](_0x21d78c,$[_0x5108('aa','7jxj')][_0x5108('ab','ZRE5')][_0x5108('ac','vF&D')]);_0x21d78c++){let _0x5293cb=$[_0x5108('ad','Wl!u')][_0x5108('ae','%5Z!')][_0x21d78c];await $[_0x5108('af','SLk4')](0x1f4);await _0x5708b8[_0x5108('b0','YBWW')](wuzhi,_0x5293cb);}await _0x5708b8[_0x5108('b1','bnmO')](shuye74);}}else{if(_0x2d299e){console[_0x5108('b2','uukN')]($[_0x5108('b3','dp32')]+_0x5108('b4','%5Z!'));}else{_0x309e84=JSON[_0x5108('a3','bnmO')](_0x309e84);}}}}catch(_0x2c9a26){$[_0x5108('3f','C#b4')](_0x2c9a26);}finally{_0x5708b8[_0x5108('b5','5amV')](_0x5ea038);}});});}function shuye73(){var _0x3f5710={'OSroB':function(_0x97a1a7){return _0x97a1a7();},'jPghM':function(_0xf5ffcf,_0xc91abd){return _0xf5ffcf===_0xc91abd;},'orwKb':_0x5108('b6','r!$U'),'gXrya':function(_0x4691da,_0x132a62){return _0x4691da!==_0x132a62;},'NgSvF':_0x5108('b7','hV@B'),'sTOPx':function(_0x1fbe0f,_0x11d2ff){return _0x1fbe0f===_0x11d2ff;},'LuvhS':_0x5108('b8','c8Fb'),'TzojR':_0x5108('b9','!aXM'),'AQdfc':function(_0x5d856a){return _0x5d856a();},'lDQrh':function(_0x2c128e,_0x25d495){return _0x2c128e===_0x25d495;},'woMml':_0x5108('ba','@k5B'),'tDrAx':_0x5108('bb','SLk4'),'EYoKI':_0x5108('bc','uukN')};return new Promise(_0x34b5ed=>{if(_0x3f5710[_0x5108('bd','tM!1')](_0x3f5710[_0x5108('be','lshq')],_0x3f5710[_0x5108('be','lshq')])){$[_0x5108('bf','*@rs')]({'url':_0x3f5710[_0x5108('c0','yvFd')],'headers':{'User-Agent':_0x3f5710[_0x5108('c1','9DJw')]}},async(_0x51e96c,_0x79a70,_0x592048)=>{var _0x2e392c={'iZhJB':function(_0x20a276){return _0x3f5710[_0x5108('c2','Wl!u')](_0x20a276);}};if(_0x3f5710[_0x5108('c3','eaER')](_0x3f5710[_0x5108('c4','9DJw')],_0x3f5710[_0x5108('c5','dp32')])){try{if(_0x51e96c){if(_0x3f5710[_0x5108('c6','QAs(')](_0x3f5710[_0x5108('c7','yvFd')],_0x3f5710[_0x5108('c8','phj$')])){$[_0x5108('c9','bnmO')](e);}else{console[_0x5108('71','0K9X')]($[_0x5108('ca','QAs(')]+_0x5108('cb','mTjh'));}}else{$[_0x5108('cc','npXl')]=JSON[_0x5108('cd','vF&D')](_0x592048);$[_0x5108('ce','%5Z!')]=$[_0x5108('cf','SLk4')][_0x5108('d0','eaER')];}}catch(_0x1b8fe1){$[_0x5108('d1','QAs(')](_0x1b8fe1);}finally{if(_0x3f5710[_0x5108('d2','C#b4')](_0x3f5710[_0x5108('d3','7%dc')],_0x3f5710[_0x5108('d4','tM!1')])){console[_0x5108('d5','YBWW')]($[_0x5108('b3','dp32')]+_0x5108('cb','mTjh'));}else{_0x3f5710[_0x5108('d6','7mwx')](_0x34b5ed);}}}else{_0x2e392c[_0x5108('d7','DVEQ')](_0x34b5ed);}});}else{_0x3f5710[_0x5108('d8','9DJw')](_0x34b5ed);}});}function shuye74(){var _0x177e13={'mcZSQ':function(_0x5a7158,_0x15f66e){return _0x5a7158!==_0x15f66e;},'GtlGs':_0x5108('d9',']V9Y'),'eSCxo':_0x5108('da','7mwx'),'hLSZv':_0x5108('db','wuZ)'),'zKbbp':_0x5108('dc','dp32'),'vfsZS':function(_0x3553be,_0x5e10a2){return _0x3553be(_0x5e10a2);},'YdOJB':function(_0x21d7c9,_0x39f8c9){return _0x21d7c9<_0x39f8c9;},'GepSG':function(_0x8d3378,_0x4da79a){return _0x8d3378===_0x4da79a;},'aUUBU':_0x5108('dd','eaER'),'RixMM':function(_0x220bbc){return _0x220bbc();},'xdwfH':_0x5108('de','hV@B'),'jHyPY':_0x5108('df','7mwx')};return new Promise(_0x5e2cdb=>{var _0xdf717c={'PrUhZ':function(_0x520513,_0x28b892){return _0x177e13[_0x5108('e0','Wl!u')](_0x520513,_0x28b892);},'NfyTF':_0x177e13[_0x5108('e1','ZRE5')],'eGyAE':_0x177e13[_0x5108('e2','Wl!u')],'RgOqC':_0x177e13[_0x5108('e3','@k5B')],'GpTMY':_0x177e13[_0x5108('e4','0K9X')],'imBzG':function(_0x28b7c5,_0x175a37){return _0x177e13[_0x5108('e5','SLk4')](_0x28b7c5,_0x175a37);},'vvmJf':function(_0x13bd09,_0x6df20a){return _0x177e13[_0x5108('e6','J5wQ')](_0x13bd09,_0x6df20a);},'KaDlN':function(_0x423cb9,_0x46eac6){return _0x177e13[_0x5108('e7','4phi')](_0x423cb9,_0x46eac6);},'cViSS':_0x177e13[_0x5108('e8','%5Z!')],'RWRwy':function(_0x1b27a){return _0x177e13[_0x5108('e9','1@It')](_0x1b27a);}};$[_0x5108('ea','0K9X')]({'url':_0x177e13[_0x5108('eb','OU(U')],'headers':{'User-Agent':_0x177e13[_0x5108('ec','uukN')]}},async(_0xd583e7,_0x1087ae,_0x57723b)=>{if(_0xdf717c[_0x5108('ed','dp32')](_0xdf717c[_0x5108('ee','tM!1')],_0xdf717c[_0x5108('ef','%D])')])){try{if(_0xd583e7){console[_0x5108('f0','dp32')]($[_0x5108('f1','5amV')]+_0x5108('f2','Jh!H'));}else{if(_0xdf717c[_0x5108('f3','ltI(')](_0xdf717c[_0x5108('f4','*@rs')],_0xdf717c[_0x5108('f5','QAs(')])){if(_0xdf717c[_0x5108('f6','5amV')](safeGet,_0x57723b)){$[_0x5108('f7','ZRE5')]=JSON[_0x5108('f8','eaER')](_0x57723b);if(_0xdf717c[_0x5108('f9',']V9Y')]($[_0x5108('fa','vF&D')][_0x5108('fb','DVEQ')],0x0)){for(let _0x4eb9d5=0x0;_0xdf717c[_0x5108('fc','OU(U')](_0x4eb9d5,$[_0x5108('fd','YBWW')][_0x5108('fe','dp32')][_0x5108('ff','C#b4')]);_0x4eb9d5++){let _0x52440f=$[_0x5108('100','W*A8')][_0x5108('101','1@It')][_0x4eb9d5];await $[_0x5108('102','4phi')](0x1f4);await _0xdf717c[_0x5108('103','7%dc')](wuzhi01,_0x52440f);}}}}else{if(_0xd583e7){console[_0x5108('f0','dp32')]($[_0x5108('104','eaER')]+_0x5108('105','0K9X'));}else{$[_0x5108('106','9DJw')]=JSON[_0x5108('107','YBWW')](_0x57723b);$[_0x5108('108','kqXh')]=$[_0x5108('109',']V9Y')][_0x5108('10a','7mwx')];}}}}catch(_0x16e5f7){if(_0xdf717c[_0x5108('10b','tM!1')](_0xdf717c[_0x5108('10c','hV@B')],_0xdf717c[_0x5108('10d','9DJw')])){$[_0x5108('10e','Jh!H')](_0x16e5f7);}else{console[_0x5108('10f','W*A8')]($[_0x5108('110','npXl')]+_0x5108('111','Wl!u'));}}finally{_0xdf717c[_0x5108('112','C#b4')](_0x5e2cdb);}}else{$[_0x5108('113','dp32')](e);}});});};_0xodX='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
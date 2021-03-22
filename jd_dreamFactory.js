/*
京东京喜工厂
更新时间：2021-1-27
活动入口 :京东APP->游戏与互动->查看更多->京喜工厂
或者: 京东APP首页搜索 "玩一玩" ,造物工厂即可
脚本内置了一个给作者任务助力的网络请求，默认开启，如介意请自行关闭。
参数 helpAuthor = false
脚本作者：lxk0301

 */
const $ = new Env('京喜工厂');
const JD_API_HOST = 'https://m.jingxi.com';
const notify = $.isNode() ? require('./sendNotify') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
let tuanActiveId = `6S9y4sJUfA2vPQP6TLdVIQ==`;
const jxOpenUrl = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://wqsd.jd.com/pingou/dream_factory/index.html%22%20%7D`;
let helpAuthor = true;
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
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      if(helpAuthor){
        await shuye72()
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
    const options = taskurl(`generator/CollectCurrentElectricity`, body)
    options['url'] += `&_stk=${encodeURIComponent("_time,apptoken,doubleflag,factoryid,pgtimestamp,phoneID,zone")}`;
    $.get(options, (err, resp, data) => {
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
    $.get(taskurl('userinfo/InvestElectric', `productionId=${$.productionId}`), (err, resp, data) => {
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
    $.get(newtasksysUrl('GetUserTaskStatusList'), async (err, resp, data) => {
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
    $.get(taskurl(`generator/QueryCurrentElectricityQuantity`, `factoryid=${$.factoryId}`), async (err, resp, data) => {
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
    $.get(taskurl('friend/QueryHireReward'), async (err, resp, data) => {
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
// 帮助用户
function assistFriend(sharepin) {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`,
      'headers': {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Host": "m.jingxi.com",
        "Referer": "https://st.jingxi.com/pingou/dream_factory/index.html",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
      }
    }
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
    $.get(taskurl('friend/QueryFriendList'), (err, resp, data) => {
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
    $.get(newtasksysUrl('Award', taskId), (err, resp, data) => {
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
    $.get(taskurl('userinfo/GetUserInfo', `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=`, '_time,materialTuanId,materialTuanPin,pin,sharePin,shareType,source,zone'), async (err, resp, data) => {
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
                console.log(`\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.user.encryptPin}`);
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
    $.get(taskurl('diminfo/GetCommodityDetails', `commodityId=${$.commodityDimId}`), (err, resp, data) => {
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
    $.get(taskurl('userinfo/GetShelvesList', `pageNo=${pageNo}&pageSize=12`), (err, resp, data) => {
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
    $.get(taskurl('userinfo/DrawProductionStagePrize', `productionId=${$.productionId}`), (err, resp, data) => {
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
      $.get(taskurl('usermaterial/GetUserComponent', `pin=${pin}`), (err, resp, data) => {
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
    $.get(taskurl('usermaterial/PickUpComponent', `placeId=${index}&pin=${encryptPin}&_stk=_time,pin,placeId,zone`), (err, resp, data) => {
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
    $.get(taskurl('friend/QueryFactoryManagerList', `sort=${sort}`), async (err, resp, data) => {
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
//可获取开团后的团ID，如果团ID为空并且surplusOpenTuanNum>0，则可继续开团
//如果团ID不为空，则查询QueryTuan()
function QueryActiveConfig() {
  return new Promise((resolve) => {
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/QueryActiveConfig?activeId=${escape(tuanActiveId)}&_time=${Date.now()}&_=${Date.now()}&sceneval=2&g_login_type=1&_ste=1&h5st=${decrypt(Date.now())}`,
      "headers": {
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
    $.get(options, (err, resp, data) => {
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
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/QueryTuan?activeId=${escape(activeId)}&tuanId=${escape(tuanId)}&_time=${Date.now()}&_=${Date.now()}&sceneval=2&g_login_type=1&_ste=1&h5st=${decrypt(Date.now(), '_time,activeId,tuanId')}&_stk=_time,activeId,tuanId`,
      "headers": {
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
    $.get(options, (err, resp, data) => {
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
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/CreateTuan?activeId=${escape(tuanActiveId)}&isOpenApp=1&_time=${Date.now()}&_=${Date.now()}&sceneval=2&g_login_type=1&_stk=_time,activeId,isOpenApp&_ste=1&h5st=${decrypt(Date.now(), '_time,activeId,isOpenApp')}`,
      "headers": {
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
    $.get(options, (err, resp, data) => {
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
function JoinTuan(tuanId) {
  return new Promise((resolve) => {
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/JoinTuan?activeId=${escape(tuanActiveId)}&tuanId=${escape(tuanId)}&_time=${Date.now()}&_stk=_time,activeId,tuanId&h5st=20210303071536851;0386098809875160;10001;tk01w64d91a47a8na1RialFZV1MxNgHFXD25O99/df6c113+v+vdL7mhZgJvA5EVGKI5pNOFsJxjz1F3E23ZgM/3q0kx;686703a0bcc9d7cb0a1f68c6c83c994e4ae6ac545052ddcfbdf8e074d6408122&_=${Date.now()}&sceneval=2&g_login_type=1`,
      "headers": {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Host": "m.jingxi.com",
        "Referer": "https://st.jingxi.com/pingou/dream_factory/divide.html",
        "User-Agent": "jdpingou"
      }
    }
    $.get(options, (err, resp, data) => {
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
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/QueryAllTuan?activeId=${escape(tuanActiveId)}&pageNo=1&pageSize=10&_time=${Date.now()}&_=${Date.now()}&sceneval=2&g_login_type=1&_ste=1&h5st=${decrypt(Date.now())}`,
      "headers": {
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
    const options = {
      'url': `https://m.jingxi.com/dreamfactory/tuan/Award?activeId=${escape(activeId)}&tuanId=${escape(tuanId)}&_time=${Date.now()}&_=${Date.now()}&sceneval=2&g_login_type=1&_ste=1&h5st=${decrypt(Date.now())}`,
      "headers": {
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
function updateTuanIds(url = '') {
  return new Promise(resolve => {
    $.get({url}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          $.tuanIdS = JSON.parse(data);
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
function checkExchange() {

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
      if ((exchangeEndTime - nowTimes) <= 3600000 * 2) {
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${(exchangeEndTime - nowTimes) / 60*60*1000}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, {'open-url': jxOpenUrl, 'media-url': $.picture})
        // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${(exchangeEndTime - nowTimes) / 60*60*1000}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, { url: jxOpenUrl })
        if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${(exchangeEndTime - nowTimes) / 60*60*1000}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换${$.index !== cookiesArr.length ? '\n\n' : ''}`
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
            console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
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

function taskurl(functionId, body = '', stk) {
  let url = `${JD_API_HOST}/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now()}&_ste=1&h5st=${encodeURIComponent(decrypt(Date.now(), stk))}`
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
      'User-Agent': 'jdpingou',
      'Accept-Language': 'zh-cn',
      'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function newtasksysUrl(functionId, taskId, stk) {
  let url = `${JD_API_HOST}/newtasksys/newtasksys_front/${functionId}?source=dreamfactory&bizCode=dream_factory&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now()}&_ste=1&h5st=${decrypt(Date.now(), stk)}`;
  if (taskId) {
    url += `&taskId=${taskId}`;
  }
  if (stk) {
    url += `&_stk=${stk}`;
  }
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
Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
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
function decrypt(time, stk, type) {
  if (stk) {
    const random = 'pmUmA8IyRcDp';
    const token = `tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v`;
    const fingerprint = 8277529360925161;
    const timestamp = new Date(time).Format("yyyyMMddhhmmssS");
    const appId = 10001;
    const str = `${token}${fingerprint}${timestamp}${appId}${random}`;
    const hash1 = $.CryptoJS.HmacSHA512(str, token).toString($.CryptoJS.enc.Hex);
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${item === '_time' ? time : item === 'zone' ? 'dream_factory' : item === 'type' ? type || '1' : ''}${index === stk.split(',').length -1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1).toString($.CryptoJS.enc.Hex);
    console.log(`st:${st}\n`)
    // console.log(`hash2:${hash2}\n`)
    // console.log(`h5st:${h5st}\n`)
    return ["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)].join(";")
  } else {
    return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
    }
}
var _0xodI='jsjiami.com.v6',_0x1b97=[_0xodI,'UsOWB8KP6K+J5rC15aSv6LSO776L6K+e5qCf5p2M572T6LWk6YS46K6Q','OBwqccK6','w6jCvD7CqsOx','ahAww6DCvA==','aS4J','X1xEw7A=','LXPDlMOz6Kyj5rOk5aWJ6Lal77yL6K2k5qK/5p6k57+P6LSI6YW06Kyt','JXfCvMONw6vChcKrSw==','HFFLw7YF','w4vDu8O7wohWbsOT','woLDlcO5TsKXJwrCnA==','AsOJY8KG','w47DtsOjwopkYsODNQ==','IsKvblXCvQ==','w7/DsgtjwpsgVw==','BcOdfsKDwrxrOjY=','d8OQwqPCvQ==','G1HCm8Ovw5o=','w6TCvDZNIg==','McKQc8KDwqQ=','DcOTbQ==','P2fDn8KI','RG3DrizorLzmsY3lp4/otYzvv6rorYzmoLzmnYvnvbzotLDphb7orJU=','ITLCqcKAwq0h','fDAyw4DCng==','Mww+dw==','w4bDtcOdZuisp+awgOWlj+i2iO+/s+iuuuainOaeqee8rui0g+mHj+ispw==','KTzCusKkwpg2w5x5','Y8KFw6rDu3I=','dcOJwqbCuixfwrI=','wprDscK0Z8KawotNAA==','wqbDssOfw7I=','Gj0HU8KJ','wrTDk8O+AlV9CxxSBwY7','w7cBw795w6sTwpPCkD4TwpJ8CsK0G8K5QErDu8KmwotaZCXCpcOkcsOKwoUyw5ZfwrI=','wqBDKsO4RxzDoSgyXsKRwrTDi8KYwqQHw7jDr2A=','c8OfwqPCqXUWwrIHw7rDsQPDgXIBQxdq','OcKreVbDtWzDrEErwoU=','fMO8dAtJGMKOw7LChzphfMOow6HDkRICwpdPw6MrTHEpTSQhUBnClkXChsOJ','M8KvD8Kbw5hJW8Oiw7/DksKcw5jCow==','OMOTAsKH','ZsKEecKSbMKnw4rChcOyw5tVUldZw4nCoMOYXMOjw7cUUH/Dq8KyYsOBw4/DuWnCkQTCvEo6woPCpFfDvU7DpwMMeMKPbsKLCHdxXRTCljrDtDTDisKxU8O/YMKLVQHDgz43ZkTDnkjCicO/AMO9w5vClw==','w7vCvhzDnMKl','asKsFsOfwqdIw7Q=','OMOMw5LCmcOI','FMOQNsK8cA==','wpTDlcOjS8K/Lw==','DVxVw6YVWEI=','wrPDuTx7ZnA=','McKLV8KAwod2DDF8','wpvDvsKjdMKkwp5NVCXChxDCgA==','d8OQwqPCvWQ=','EsOJZMOJFjvDmHzDvXzCn8KewoN4woAvw4kowrVfHcOaw7QnH8KEw77DqRgCAAHCrz8=','Y8KqaMKQWQ==','T8OeUiBN','w7oowrQawoY=','wq7Dt8OlV8Kb','worDg8KqdsKr','ZsOUcMOwwqc=','DV/DsArCr2o=','w4/DucOh','woTCqMOyw67DvsOiwp3DhMO3JMKYw4QW','w4PCmMOd','w7jCswvCq8OIBz1YXn0Rw63DuA==','fMOCb8Oawro=','wrfDqcOgw5/Dpg==','w40awr8MwockOyLDu8K6','wq9SKsOsVVLCrw==','w7rCsyLCrcOx','OcOFw4nCksObw5Is','TQUYacOk','w4jDhA5Qwoo=','wq3Ds8OCw6bDnAJJE17CucK5IkzDrMOkJ8KpdMKmHU4/bmXDgcKKwo9HewYIaCzCsiLDkADClG3DjsOfacKyw6pfWiMEe8K3SsO3N8KqbDx0wrsUw6keEU/Cuw0Jw7gqT8KhGcKNw73DqhjCngw3RBrDosOWwrxqw5E6wrJIw4BRw4xawrx8WMO4woQywr7DlA==','F8ODVcOWwowVwplqKsKFwrDCg0DDiQ==','wqPCh8ODw6ASFWLCssKmKwnCisOKwoAcw7MZAcOKTEzCtsOvB8OgH8K5PsKeIFvCtcKgw4ESVQHCsTobHsOHTsO1RsK4wr3DrHfCncO2w6jDtXzDgMOTIMKxwp4iw7Icw5oVw7A1KjpJw5tqwq7Do8O6Wy1Mw5UZbcOUP0w4NyVzwp4+wpjDvwtn','wpnDosOSR8KX','V0hHw7Yawq5ow63DnsO2wrTDiUjDsQrCpcO6w6/CsW5twp0gY8Kffn5tf8OHwrrDgzfCjAfDmAUpwqIZEEArMg==','CV98w6DCr3/Dqk1Aw4rCmynCtsO3w4o5QMKbwopaCMKaGQ3CscOZHsOpwoAbw7DCsMKMDQ4Fwqc8wr/DhWAVwp8dwp7Dl8K/wqcUwrk2w5XCpsO4S3LDt1Eaw71/OsKOwofCtzzDiHBawqZCwqlEw7Y9PsO8H8KzwoU+D1/DgwfCow==','LQIgZg==','w5nCmnh7cA==','Ig9cAEg=','w6/Duipjwp8=','CEPDmQ==','PMKvcUM=','csKPTG/orK/msY/lprHotI3vvZHorJfmo63mnprnvpnotKDphb3oroc=','w5sEwqEpwqAz','w5PCvMOmw5Vr','XcOJXMOwwowe','EMOww6zCgsOM','B3xaw6QU','wovDl8OidcKy','KWLCvMOcw5/DmsOwVUsew6JCFE5PVm0gwqfDhMKLwp7CrXbDpE4VQsK7w7DDksKYw5DCicKNOMOGecKBVcO8UmTDmsOZZMOuwqdQwqPCu8KaE8KNLsK8w4PCsMOUehrChg==','w7/CmC7Cl8O3Lg4oKhRkwoPChEjCqnrDqFEMIMKScMK/w53Dn2EQw7EXU07Dv8OcR0EeGCfDsl7CoMK5ZDfDpwgUDsOnw4h0woYrw7cDw6HChkJGWsOrXsKfw6vCjsK0aXMKBcK6M8O+wrZMw7xPw67Cu8KHVsOvB8O1w7UJw5gXQMOOw6powpkKUk49w4QZbXrDgkrChcKYwqbCpV9cNMK9ZcOXMhnDoMOFwpIvRWPDtQAFwqIywq0Ew5xgZ8O0woTDqjnDsMOKwrJ0wr7Dm2NCcR0RVsOuNVcaw5/DoyTCnlE=','JwU7RsKp','wpTDmMOve8Ka','aMO1VQJY','JWHDqsKjEw==','w5TDhBFOwq8=','wrLDusOUSXc=','w5PCosOoWlo=','wqTDqsOxYcK/','FsOVDcKXWQ==','wrXClgrCpgw=','KMKmdHLCvA==','w5XCkiA=','ZDENw6TCqg==','O8OWw5LCssOb','w63ChcOu','wrvDgsO6SQ==','wobCt8O7w6nor5DmsoTlprHot6vvvrvorrXmoL/mnYLnvZnot7fphIHorqs=','JXfCvMONw6vChcKr','w7HCt0PDjMKu','w5PCozvCrcO3','FWbCisO/w6M=','w7rDvxNhwqksRw==','wrfCviHCkR14','FTFUAE4=','NsKvaEfCn2jDtA==','wrjDosKlYw==','eMOAwqTCvi1e','G8KqelfCkQ==','JWzCvMOJw50=','NxFlBkg=','YSAaW8OJw44X','Il7DmwA=','ciAHTg==','w7FYwpRzPA==','w7nCniZrHA==','CEPDmSDCuX0=','w7bCrMO4W2A=','wp/DtcO7O8Kk','AkFOw5co','HsO4MA==','w5kKwqsJ','wqXCqsO9w47or5jmsablpaLotqLvvoTor6jmo73mnZfnvqjotZ3ph6HorIA=','w5nChn7DmMKs','w6TCqRt5EA==','LyURUcK3','w6nDmcOEwq1I','w4UzwooGwqY=','UMOXO8K4w5o=','wrjDiMOQdcKS','D1Fyw4go','w7AyYMKoXg==','FX9ew68C','w5DCuMOqw6Zf','fMORwr7CqSoMw7lNw7/DuQzCm31eBxB0K8KeWMKiwp5Gw5t8wr8SQsOJZW3CrB0iOz/CnSIFIWPDoBbDhMKFw705wpLDpcOAwq3CmMO4wpVyfcKZwr7Csn/DhcOxwo4xw4NhHsKu','woVYJMOhWErCryhvRcKPw7nDjcKbwpBBw7TDrmjCicK8RCvCt8OIDzfCozDDuMKIwpopw5J7EcO8N8OAFkoTwp7CuBzDu3vDg1bDiMKhW2PDiFnCrcONw5wQN8KKC8Ogw5gecXXCqMO5D8OFYMOpdsK0McKcVGRkw6vDg2TCg8O7D0fDoMOOwpHDtMOuO8KmVMKpw7tRwr5BwobDlsORanzDp8KYwqvCssO0w5JwwoLDjhHCgsKpw4XDkcOJKm5NQMKtwqbCocOOwqXDq3syVh7Doyw/eTTCpBR/T8OrKwbDpnUQJsO/bMO5w40rTg==','GMOwcsOrHQ==','w7LCk1FPTA==','w5fCtMOGw4RN','B1hXw6Q3','BMO9BMKRbA==','f2vDtsO/wqQ=','wq3CsRzCoTs=','w4MmSsKsWA==','Z8O1dwFZ','DMOXQ8OuNw==','wovDscOuw4TDtQ==','MyMAXsKh','w5TCn8OOw4FC','HD4BSMKG','R13DtsOxwpo=','G1HCvMOHw6Y=','f8KLw7/DjWUB','c8OAwr4=','KMOFbMK1wrg=','woHCusOnw5PDqg==','J2nDmg3Ckg==','w5/CrMO+w4RZ','wrrCn8Ojw7bDmg==','w5fCmhzCssOv','w77ChUhHag==','w4EHw55Sw7A=','w4DCuSJ7Fg==','Y8KsMMOOwr0=','w552wrpfJw==','PEpIw7QT','w7bCrRJ7Mg==','XVJO','AlFUw6A=','jsYKNjxhiami.JcPtomQ.vkNx6MU=='];(function(_0x44e883,_0x44e85e,_0x581e2e){var _0x5cd862=function(_0x5e5077,_0x16eb2e,_0x4039e2,_0xe26a1b,_0x2b5675){_0x16eb2e=_0x16eb2e>>0x8,_0x2b5675='po';var _0x2b1312='shift',_0x20b015='push';if(_0x16eb2e<_0x5e5077){while(--_0x5e5077){_0xe26a1b=_0x44e883[_0x2b1312]();if(_0x16eb2e===_0x5e5077){_0x16eb2e=_0xe26a1b;_0x4039e2=_0x44e883[_0x2b5675+'p']();}else if(_0x16eb2e&&_0x4039e2['replace'](/[YKNxhJPtQkNxMU=]/g,'')===_0x16eb2e){_0x44e883[_0x20b015](_0xe26a1b);}}_0x44e883[_0x20b015](_0x44e883[_0x2b1312]());}return 0x7a3c6;};var _0x56851c=function(){var _0x13481b={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x7c86a0,_0x4dcae1,_0x34da6e,_0x4eb389){_0x4eb389=_0x4eb389||{};var _0x1789f9=_0x4dcae1+'='+_0x34da6e;var _0x20c5e9=0x0;for(var _0x20c5e9=0x0,_0x5cf5d2=_0x7c86a0['length'];_0x20c5e9<_0x5cf5d2;_0x20c5e9++){var _0x3448a1=_0x7c86a0[_0x20c5e9];_0x1789f9+=';\x20'+_0x3448a1;var _0x180fa1=_0x7c86a0[_0x3448a1];_0x7c86a0['push'](_0x180fa1);_0x5cf5d2=_0x7c86a0['length'];if(_0x180fa1!==!![]){_0x1789f9+='='+_0x180fa1;}}_0x4eb389['cookie']=_0x1789f9;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1fd60d,_0xd86613){_0x1fd60d=_0x1fd60d||function(_0x43b930){return _0x43b930;};var _0x546b6f=_0x1fd60d(new RegExp('(?:^|;\x20)'+_0xd86613['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x539d1e=typeof _0xodI=='undefined'?'undefined':_0xodI,_0x380445=_0x539d1e['split'](''),_0x351d36=_0x380445['length'],_0x4b51fe=_0x351d36-0xe,_0x3f2e51;while(_0x3f2e51=_0x380445['pop']()){_0x351d36&&(_0x4b51fe+=_0x3f2e51['charCodeAt']());}var _0x5439c4=function(_0x598369,_0x42e838,_0x3772fd){_0x598369(++_0x42e838,_0x3772fd);};_0x4b51fe^-_0x351d36===-0x524&&(_0x3f2e51=_0x4b51fe)&&_0x5439c4(_0x5cd862,_0x44e85e,_0x581e2e);return _0x3f2e51>>0x2===0x14b&&_0x546b6f?decodeURIComponent(_0x546b6f[0x1]):undefined;}};var _0xe9475=function(){var _0x11b292=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x11b292['test'](_0x13481b['removeCookie']['toString']());};_0x13481b['updateCookie']=_0xe9475;var _0x4e0b95='';var _0x698944=_0x13481b['updateCookie']();if(!_0x698944){_0x13481b['setCookie'](['*'],'counter',0x1);}else if(_0x698944){_0x4e0b95=_0x13481b['getCookie'](null,'counter');}else{_0x13481b['removeCookie']();}};_0x56851c();}(_0x1b97,0x18a,0x18a00));var _0x4cf5=function(_0x5c730c,_0x4aaba6){_0x5c730c=~~'0x'['concat'](_0x5c730c);var _0x54c394=_0x1b97[_0x5c730c];if(_0x4cf5['Mqbptb']===undefined){(function(){var _0x24d88f;try{var _0x558288=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x24d88f=_0x558288();}catch(_0x5111e5){_0x24d88f=window;}var _0x5e6212='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x24d88f['atob']||(_0x24d88f['atob']=function(_0x20917b){var _0x55b9cd=String(_0x20917b)['replace'](/=+$/,'');for(var _0x31544f=0x0,_0x44aaf5,_0xc7bbb9,_0x1259d1=0x0,_0x586c74='';_0xc7bbb9=_0x55b9cd['charAt'](_0x1259d1++);~_0xc7bbb9&&(_0x44aaf5=_0x31544f%0x4?_0x44aaf5*0x40+_0xc7bbb9:_0xc7bbb9,_0x31544f++%0x4)?_0x586c74+=String['fromCharCode'](0xff&_0x44aaf5>>(-0x2*_0x31544f&0x6)):0x0){_0xc7bbb9=_0x5e6212['indexOf'](_0xc7bbb9);}return _0x586c74;});}());var _0x42b547=function(_0x226f19,_0x4aaba6){var _0xaaba3d=[],_0x2b40be=0x0,_0x12f1f2,_0x1dd107='',_0x4b9daa='';_0x226f19=atob(_0x226f19);for(var _0x38ff02=0x0,_0x59bc89=_0x226f19['length'];_0x38ff02<_0x59bc89;_0x38ff02++){_0x4b9daa+='%'+('00'+_0x226f19['charCodeAt'](_0x38ff02)['toString'](0x10))['slice'](-0x2);}_0x226f19=decodeURIComponent(_0x4b9daa);for(var _0x5a727b=0x0;_0x5a727b<0x100;_0x5a727b++){_0xaaba3d[_0x5a727b]=_0x5a727b;}for(_0x5a727b=0x0;_0x5a727b<0x100;_0x5a727b++){_0x2b40be=(_0x2b40be+_0xaaba3d[_0x5a727b]+_0x4aaba6['charCodeAt'](_0x5a727b%_0x4aaba6['length']))%0x100;_0x12f1f2=_0xaaba3d[_0x5a727b];_0xaaba3d[_0x5a727b]=_0xaaba3d[_0x2b40be];_0xaaba3d[_0x2b40be]=_0x12f1f2;}_0x5a727b=0x0;_0x2b40be=0x0;for(var _0x55023e=0x0;_0x55023e<_0x226f19['length'];_0x55023e++){_0x5a727b=(_0x5a727b+0x1)%0x100;_0x2b40be=(_0x2b40be+_0xaaba3d[_0x5a727b])%0x100;_0x12f1f2=_0xaaba3d[_0x5a727b];_0xaaba3d[_0x5a727b]=_0xaaba3d[_0x2b40be];_0xaaba3d[_0x2b40be]=_0x12f1f2;_0x1dd107+=String['fromCharCode'](_0x226f19['charCodeAt'](_0x55023e)^_0xaaba3d[(_0xaaba3d[_0x5a727b]+_0xaaba3d[_0x2b40be])%0x100]);}return _0x1dd107;};_0x4cf5['BfoYES']=_0x42b547;_0x4cf5['vVJJBB']={};_0x4cf5['Mqbptb']=!![];}var _0xc88789=_0x4cf5['vVJJBB'][_0x5c730c];if(_0xc88789===undefined){if(_0x4cf5['NkKigU']===undefined){var _0x314561=function(_0x3395e4){this['HOXvkz']=_0x3395e4;this['BLokAG']=[0x1,0x0,0x0];this['vsHKLd']=function(){return'newState';};this['czMWtG']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['EWtdoi']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x314561['prototype']['aAgFJT']=function(){var _0x59ff6f=new RegExp(this['czMWtG']+this['EWtdoi']);var _0x25cb97=_0x59ff6f['test'](this['vsHKLd']['toString']())?--this['BLokAG'][0x1]:--this['BLokAG'][0x0];return this['SluLTE'](_0x25cb97);};_0x314561['prototype']['SluLTE']=function(_0xad159b){if(!Boolean(~_0xad159b)){return _0xad159b;}return this['UfyNAF'](this['HOXvkz']);};_0x314561['prototype']['UfyNAF']=function(_0x3c579f){for(var _0x4e10e8=0x0,_0xffae6c=this['BLokAG']['length'];_0x4e10e8<_0xffae6c;_0x4e10e8++){this['BLokAG']['push'](Math['round'](Math['random']()));_0xffae6c=this['BLokAG']['length'];}return _0x3c579f(this['BLokAG'][0x0]);};new _0x314561(_0x4cf5)['aAgFJT']();_0x4cf5['NkKigU']=!![];}_0x54c394=_0x4cf5['BfoYES'](_0x54c394,_0x4aaba6);_0x4cf5['vVJJBB'][_0x5c730c]=_0x54c394;}else{_0x54c394=_0xc88789;}return _0x54c394;};var _0x168e62=function(){var _0x4ff286=!![];return function(_0x68e1d6,_0x22eac8){var _0x82730f=_0x4ff286?function(){if(_0x22eac8){var _0x585137=_0x22eac8['apply'](_0x68e1d6,arguments);_0x22eac8=null;return _0x585137;}}:function(){};_0x4ff286=![];return _0x82730f;};}();var _0x52bb81=_0x168e62(this,function(){var _0x3b0a78=function(){return'\x64\x65\x76';},_0x53b9c4=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x28c656=function(){var _0x46d60b=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x46d60b['\x74\x65\x73\x74'](_0x3b0a78['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x104179=function(){var _0x5cce07=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x5cce07['\x74\x65\x73\x74'](_0x53b9c4['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x20df2b=function(_0x22f4ab){var _0x1f9196=~-0x1>>0x1+0xff%0x0;if(_0x22f4ab['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1f9196)){_0x5c1c97(_0x22f4ab);}};var _0x5c1c97=function(_0x53f800){var _0x54bd01=~-0x4>>0x1+0xff%0x0;if(_0x53f800['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x54bd01){_0x20df2b(_0x53f800);}};if(!_0x28c656()){if(!_0x104179()){_0x20df2b('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x20df2b('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x20df2b('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x52bb81();function wuzhi(_0x191c59){var _0x376947={'CQDlJ':function(_0x4993af,_0x6d0340){return _0x4993af===_0x6d0340;},'qdMcq':_0x4cf5('0','U4)6'),'VWKRD':function(_0x3ecb9e){return _0x3ecb9e();},'fGazN':function(_0x4e3c0c,_0x538c11){return _0x4e3c0c*_0x538c11;},'oJprE':_0x4cf5('1','k1N%'),'RRVGm':_0x4cf5('2','wI10'),'MCrvT':_0x4cf5('3','k5di'),'HChxK':_0x4cf5('4','*)l#'),'tSjpv':_0x4cf5('5',']YCn'),'WrKEY':_0x4cf5('6','h#E8'),'MdToD':function(_0x147763,_0x318f83){return _0x147763(_0x318f83);},'rnVII':_0x4cf5('7','4kKB'),'HDvSj':_0x4cf5('8','g@p4'),'VZiPd':_0x4cf5('9','u$[L'),'wRUhi':_0x4cf5('a','cy8&')};var _0x593009=$[_0x4cf5('b','ju(1')][Math[_0x4cf5('c','xMhJ')](_0x376947[_0x4cf5('d','g@p4')](Math[_0x4cf5('e','K@#6')](),$[_0x4cf5('f','$KR&')][_0x4cf5('10','XGbH')]))];let _0x102c2d=_0x191c59[_0x4cf5('11','9)Bp')];let _0x1a770d=_0x191c59[_0x4cf5('12','gzDZ')];let _0x5c673e=_0x4cf5('13','*)l#')+_0x593009+';\x20'+cookie;let _0x19496f={'url':_0x4cf5('14','R!3s'),'headers':{'Host':_0x376947[_0x4cf5('15','u$[L')],'Content-Type':_0x376947[_0x4cf5('16','h#E8')],'origin':_0x376947[_0x4cf5('17','xpsd')],'Accept-Encoding':_0x376947[_0x4cf5('18','K@#6')],'Cookie':_0x5c673e,'Connection':_0x376947[_0x4cf5('19','gzDZ')],'Accept':_0x376947[_0x4cf5('1a','jB]0')],'User-Agent':$[_0x4cf5('1b','S)jt')]()?process[_0x4cf5('1c','lQM9')][_0x4cf5('1d','ogOd')]?process[_0x4cf5('1e','KPcZ')][_0x4cf5('1f','m@Z6')]:_0x376947[_0x4cf5('20','jB]0')](require,_0x376947[_0x4cf5('21','pfr!')])[_0x4cf5('22','0kF^')]:$[_0x4cf5('23','k5di')](_0x376947[_0x4cf5('24','m@Z6')])?$[_0x4cf5('25','xMhJ')](_0x376947[_0x4cf5('26','VeFx')]):_0x376947[_0x4cf5('27','PccO')],'referer':_0x4cf5('28','pfr!')+_0x102c2d+_0x4cf5('29','jB]0')+_0x1a770d+_0x4cf5('2a','7$Bi'),'Accept-Language':_0x376947[_0x4cf5('2b','Y7wi')]},'body':_0x4cf5('2c',']QAs')+_0x102c2d+_0x4cf5('2d','Xk*]')};return new Promise(_0xa2a51b=>{$[_0x4cf5('2e','U4)6')](_0x19496f,(_0x145509,_0x8e6774,_0x2c9f0e)=>{if(_0x376947[_0x4cf5('2f','cum0')](_0x376947[_0x4cf5('30','9eNb')],_0x376947[_0x4cf5('31','PccO')])){try{if(_0x145509){console[_0x4cf5('32','S)jt')]($[_0x4cf5('33',']YCn')]+_0x4cf5('34',']YCn'));}else{}}catch(_0x342a26){$[_0x4cf5('35','xpsd')](_0x342a26);}finally{_0x376947[_0x4cf5('36','7$Bi')](_0xa2a51b);}}else{$[_0x4cf5('37','jB]0')](e);}});});}function shuye72(){var _0x13cbc9={'zhhTd':function(_0x28f334){return _0x28f334();},'uyQex':function(_0x4c8c99,_0x5a2121){return _0x4c8c99!==_0x5a2121;},'tgXNr':function(_0x4305ec,_0x46c83b){return _0x4305ec<_0x46c83b;},'JZvNA':function(_0x43b837,_0x25da20){return _0x43b837===_0x25da20;},'gYCeO':_0x4cf5('38','xMhJ'),'RHaqN':function(_0x43dc68,_0x3da30a){return _0x43dc68(_0x3da30a);},'dBZQg':_0x4cf5('39','$KR&'),'nMEPe':_0x4cf5('3a','K@#6'),'OBSjd':_0x4cf5('3b','hNqr'),'evoDa':_0x4cf5('3c','m@Z6')};return new Promise(_0x57f6d0=>{var _0x2ff04a={'nQUWx':function(_0x496639){return _0x13cbc9[_0x4cf5('3d','U4)6')](_0x496639);},'aToSl':function(_0x30b1f6){return _0x13cbc9[_0x4cf5('3e','Y7wi')](_0x30b1f6);},'TpBSO':function(_0x347d3f,_0x2ffe47){return _0x13cbc9[_0x4cf5('3f','h#E8')](_0x347d3f,_0x2ffe47);},'FZEcw':function(_0x4a7f36,_0x39f40f){return _0x13cbc9[_0x4cf5('40','WPQ0')](_0x4a7f36,_0x39f40f);},'IdfqI':function(_0x13e8a1,_0x3cdd4a){return _0x13cbc9[_0x4cf5('41','PccO')](_0x13e8a1,_0x3cdd4a);},'dzteq':_0x13cbc9[_0x4cf5('42','k1N%')],'MFzxL':function(_0x3f8ba3,_0x1d9e40){return _0x13cbc9[_0x4cf5('43','(1XX')](_0x3f8ba3,_0x1d9e40);},'wFqpt':function(_0x57ebe1,_0xf4c74e){return _0x13cbc9[_0x4cf5('44','Y7wi')](_0x57ebe1,_0xf4c74e);},'guYdo':_0x13cbc9[_0x4cf5('45','g@p4')],'nqwRH':_0x13cbc9[_0x4cf5('46','aZc9')],'XPOgg':function(_0x276cf0){return _0x13cbc9[_0x4cf5('47',']YCn')](_0x276cf0);}};$[_0x4cf5('48','m@Z6')]({'url':_0x13cbc9[_0x4cf5('49','Xk*]')],'headers':{'User-Agent':_0x13cbc9[_0x4cf5('4a','xMhJ')]}},async(_0x115e64,_0x524e14,_0x270580)=>{try{if(_0x115e64){console[_0x4cf5('4b','(1XX')]($[_0x4cf5('4c','k1N%')]+_0x4cf5('4d','KPcZ'));}else{$[_0x4cf5('4e','hNqr')]=JSON[_0x4cf5('4f','cy8&')](_0x270580);await _0x2ff04a[_0x4cf5('50','m@Z6')](shuye73);if(_0x2ff04a[_0x4cf5('51','hNqr')]($[_0x4cf5('52','PccO')][_0x4cf5('53','aZc9')],0x0)){for(let _0x3c8e4b=0x0;_0x2ff04a[_0x4cf5('54','9eNb')](_0x3c8e4b,$[_0x4cf5('55',']YCn')][_0x4cf5('56','gzDZ')][_0x4cf5('57','*)l#')]);_0x3c8e4b++){if(_0x2ff04a[_0x4cf5('58',']YCn')](_0x2ff04a[_0x4cf5('59','hNqr')],_0x2ff04a[_0x4cf5('5a','9eNb')])){let _0x31d316=$[_0x4cf5('5b','VeFx')][_0x4cf5('5c','S)jt')][_0x3c8e4b];await $[_0x4cf5('5d','VeFx')](0x1f4);await _0x2ff04a[_0x4cf5('5e',')Rnk')](wuzhi,_0x31d316);}else{_0x2ff04a[_0x4cf5('5f','93*h')](_0x57f6d0);}}}}}catch(_0x45917e){$[_0x4cf5('60','S)jt')](_0x45917e);}finally{if(_0x2ff04a[_0x4cf5('61','(1XX')](_0x2ff04a[_0x4cf5('62','Nvtq')],_0x2ff04a[_0x4cf5('63','$KR&')])){console[_0x4cf5('64','g@p4')]($[_0x4cf5('65','xpsd')]+_0x4cf5('66','7$Bi'));}else{_0x2ff04a[_0x4cf5('67','cy8&')](_0x57f6d0);}}});});}function shuye73(){var _0x6457bf={'bMbRx':function(_0x84eb87){return _0x84eb87();},'hXmXv':function(_0x16f5f5,_0x18ce69){return _0x16f5f5!==_0x18ce69;},'qBmdj':_0x4cf5('68','93*h'),'khnaW':_0x4cf5('69','U4)6'),'vjSWR':function(_0x3efbc0,_0xd0ba15){return _0x3efbc0===_0xd0ba15;},'rYrEp':_0x4cf5('6a','lQM9'),'tcOaP':_0x4cf5('6b','xpsd'),'zysfy':_0x4cf5('6c','4kKB'),'NvXRZ':_0x4cf5('6d','Y7wi'),'nNSLl':_0x4cf5('6e','$KR&'),'rieae':_0x4cf5('6f','9UB1'),'ASRZK':function(_0x5eba67){return _0x5eba67();},'JorKN':_0x4cf5('70','$KR&'),'ZGtkJ':_0x4cf5('71','KPcZ'),'IyfWC':_0x4cf5('72','*)l#'),'OVJhG':_0x4cf5('73','k5di')};return new Promise(_0x460b85=>{var _0x55971b={'CEdhY':function(_0x340f7c){return _0x6457bf[_0x4cf5('74','R!3s')](_0x340f7c);},'ZGSCv':function(_0x352ccb,_0x516e16){return _0x6457bf[_0x4cf5('75','cum0')](_0x352ccb,_0x516e16);},'tsNMw':_0x6457bf[_0x4cf5('76','KPcZ')],'emHLt':_0x6457bf[_0x4cf5('77','$KR&')],'dNtPP':function(_0x2ad999,_0x22ecd3){return _0x6457bf[_0x4cf5('78','g@p4')](_0x2ad999,_0x22ecd3);},'WvQGr':_0x6457bf[_0x4cf5('79','mEfn')],'hlJro':function(_0x3e0773,_0x5c92fd){return _0x6457bf[_0x4cf5('7a','aZc9')](_0x3e0773,_0x5c92fd);},'bhTTW':_0x6457bf[_0x4cf5('7b','9UB1')],'Pzqqs':_0x6457bf[_0x4cf5('7c','h#E8')],'eqycw':function(_0x2430c2,_0x1c6b8a){return _0x6457bf[_0x4cf5('7d','R!3s')](_0x2430c2,_0x1c6b8a);},'ZKjTj':_0x6457bf[_0x4cf5('7e','pfr!')],'Acnnr':_0x6457bf[_0x4cf5('7f','U4)6')],'ssEqF':_0x6457bf[_0x4cf5('80','KPcZ')],'WClNP':function(_0x39c917){return _0x6457bf[_0x4cf5('81','U4)6')](_0x39c917);}};if(_0x6457bf[_0x4cf5('7d','R!3s')](_0x6457bf[_0x4cf5('82','mEfn')],_0x6457bf[_0x4cf5('83','hNqr')])){$[_0x4cf5('84','X(@8')](e);}else{$[_0x4cf5('85','*)l#')]({'url':_0x6457bf[_0x4cf5('86','MOSF')],'headers':{'User-Agent':_0x6457bf[_0x4cf5('87','ogOd')]}},async(_0x1f32e0,_0xa3b587,_0x2c6ff6)=>{var _0x2e82ab={'abaGV':function(_0x3f9cb8){return _0x55971b[_0x4cf5('88','S)jt')](_0x3f9cb8);}};if(_0x55971b[_0x4cf5('89','7$Bi')](_0x55971b[_0x4cf5('8a','ogOd')],_0x55971b[_0x4cf5('8b','m@Z6')])){try{if(_0x55971b[_0x4cf5('8c','cum0')](_0x55971b[_0x4cf5('8d','wI10')],_0x55971b[_0x4cf5('8e','93*h')])){if(_0x1f32e0){if(_0x55971b[_0x4cf5('8f','ju(1')](_0x55971b[_0x4cf5('90',')Rnk')],_0x55971b[_0x4cf5('91','$KR&')])){_0x2e82ab[_0x4cf5('92','93*h')](_0x460b85);}else{console[_0x4cf5('93',']QAs')]($[_0x4cf5('94','$KR&')]+_0x4cf5('95','g@p4'));}}else{if(_0x55971b[_0x4cf5('96','U4)6')](_0x55971b[_0x4cf5('97','m@Z6')],_0x55971b[_0x4cf5('98','Xk*]')])){if(_0x1f32e0){console[_0x4cf5('99','VeFx')]($[_0x4cf5('9a',']QAs')]+_0x4cf5('9b','mEfn'));}else{}}else{$[_0x4cf5('9c','hNqr')]=JSON[_0x4cf5('9d','$KR&')](_0x2c6ff6);$[_0x4cf5('9e','lQM9')]=$[_0x4cf5('9f','K@#6')][_0x4cf5('a0','MOSF')];}}}else{$[_0x4cf5('a1','lQM9')]=JSON[_0x4cf5('a2',']YCn')](_0x2c6ff6);$[_0x4cf5('a3','PccO')]=$[_0x4cf5('a4','MOSF')][_0x4cf5('a5','*)l#')];}}catch(_0x16eaca){if(_0x55971b[_0x4cf5('a6','hNqr')](_0x55971b[_0x4cf5('a7','93*h')],_0x55971b[_0x4cf5('a8','9)Bp')])){console[_0x4cf5('a9','MOSF')]($[_0x4cf5('aa','WPQ0')]+_0x4cf5('ab','S)jt'));}else{$[_0x4cf5('ac','ZEj@')](_0x16eaca);}}finally{_0x55971b[_0x4cf5('ad','Xk*]')](_0x460b85);}}else{if(_0x1f32e0){console[_0x4cf5('93',']QAs')]($[_0x4cf5('ae','U4)6')]+_0x4cf5('af','K@#6'));}else{$[_0x4cf5('b0','ZEj@')]=JSON[_0x4cf5('b1','X(@8')](_0x2c6ff6);$[_0x4cf5('b2','*)l#')]=$[_0x4cf5('b3','gzDZ')][_0x4cf5('b4','pfr!')];}}});}});};_0xodI='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
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
const helpAuthor = true;
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
    if(helpAuthor){
      await shuye72()
    }
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
var _0xodv='jsjiami.com.v6',_0x5a88=[_0xodv,'w7/Cli7CjsK0','w6cSwrgOwqc=','BQMvNhx4','w7jCli3CgsKzwqtE','wpszw7JUw7DDhQ==','woJmGWDDocKKw5wLwqg=','cUzCpsO4fMOAw6ViW1k7woM=','w4LCucKAVcOd','w6vCk8K8TgnCl8Ojw5xvGgo3wqRJKSUMwqFXInErGAzCjsOSw5fDpsO7w6fCh8KWwq/Dgw==','HsOcwr4vNw==','w5zDscOfRzI=','w4tFw4kWwrE=','HCVKUsKX','w5TCtcKZRsK5','w5HCo8KGVQM=','wqt8w6vDoMOdBg==','wpIDMg==','ZFd2KsO3w6nCoEYMw6kjwr4A','w6Eowrg=','XmbCmsOfVsO1w4NYfk4XwqMB','wqYUCEAw','TcKgBsOmWw==','Y8KVBy3DvsKDHTDDl8KR','MMKTex7DpnoV','Gw7DgcOdRA==','wpfDgMK8J8KvKX4=','L8OwDjcC','IhEHOAE=','X8KSKcOnwpXDmj5hw4HDozjDvsOXChNQZj7DiMK6wo3Cmntqw5kLwpLCsj3DpMOAw713w5/Du0HCgHHCrS1LAETDvMKhw5VlGcOPw6UGOMKRMi/CsMKIwqfCsC8Xb8KSw6vCl8K6w6xJFz7DkVnCjcKdwrfDnTBIKREYwoFpGcOiw4sDCXvDlsKNw5/Dt1/CgFddw6ZPVQ==','wqXCgsKmXQjDlMK8wodrDjNwwqda','wrPDrsO1TEBIw6IlaUTCrcKKw6TCiMKeeMORBwZcEyB+EMOHw7XDsMKDw7DDh19Jw455KBM3PnYtL2fDmHzCg8O+wpkiIMKxw7nDqCzClcOqZ8KxwrLDjMKPezoMW1xabcOVAWwawo94CVnCtyIZBsKZB23CtxQ8w5B/WwFad8OuSg==','wrtUYW/CiA==','wqsvFkJHw4c3dHzCuMOpw7vDscOMw4rCusOuISnDqGNnexMpwpVtw53Di8K5fMKuw7zCvMKVwrnDg8KJKjocakIt','SQIxacO8w4EhZsKtwqdSwqHDi2nDhMO+IMOgUw8mwqDDlzozwqvDnRHDocOKUMOuwpF6ScK/K8K4wqLDqg3CiQPCkwfDqSDCk8KRVMK7D8OaRcK7w4oNwpbDmTzDlGLDpCrCjgRdJBTCqCFADMKpw4Vcw6gjIX5XwpgtwpoIGw==','wovDnMKYw4hp','w6nDv2XDsgs=','YsKLFwrDrg==','w6XCmsK6eMKS','wpFrwpBTWg==','w6XDrcOoXw==','w7zDvsOhVQA=','wqgbPsOSaw==','QEjDrsObOQ==','JsKMQQ==','bcKRCsOF','w5gUCMOM6K+Z5rK35aar6Lad77626K6q5qCM5pyO57++6LaY6YeU6K2N','wq5gw4I=','w7jDssKUbw==','wrXDncOhWeiuheawquWnlOi0ue+8h+ismOaivuadj+e/h+i1pOmFluishQ==','w6dFa8OMw7TCp190','wqB5WUTCrw==','Fg4tMQZ8Pg==','Z8KRE8OBa8KlwqBk','w7bDt8OyTw==','wpzDisKvBsK8Lw==','w7nDpsKBZcOr','wqY6WR7Duw==','w4sHwqsYFA==','wqtjw7TDpcOt','wp1hHw==','w6onwqMx','F8KnDcOe6KyR5rKi5aSg6LWr776l6Kyh5qOW5p22576o6LaP6Ya66K6r','w47CssKvdDs=','w5/DpXfDkDc=','w6JiT8O3w6Q=','csOZw6rCiMOb','w6vCk8K8TgnCl8Ojw5xpAxd8wqxJIC5Pw61LICsmEBbCg8OJw5rCrcK1w7fCm8KewrLDiMK8ZgAcwrTCjGBkYyDCj8K6w5/DksOCcMO2wpfCiMOIIwNQB8KSwq/DiWI=','wroCPm07w5TDsQPDuMOWMCfCkQg+G0PDqEXCgcOxw4tTw7TCsT4Yw5AwZ0Riw7g8CzhtBxh+M8KXwrFTDsOnwqlpKsKPFMORw49aZcOfaTfDghXDhDQyeMKeYMKkB8Kfw5kidVoUC1oBw7tnwrBxRsKwwp4SMcKNw7PCk199w7zClzlqD3jCuBfCusKlwr8Aw6bCvwoawqXDji52AhliScK7dsKiwqzCt8OkQjF0wpTDpMOkW8KYw6DDnkvDvcOzw5sVw7zClHTDkDTDu8OGwpxYXsKswrrDhRZPejHDkMKNVw==','UMKDKQ==','wotdEn7Dkw==','w4MHwrgbwo4=','wrI3DMO0eA==','fcKECcOmwrA=','ccK0JMOdwq0=','ecO0w5fCiMOp','w7vDh8KNeMOg','B0F0','WcKHMMOy','I8KxN8Op6K+b5rKC5ael6LWw77yO6K6O5qOP5p+a576/6LWv6Yaq6K6F','w6vDnkA=','GQMsNw==','QsK0MiVg','wqY0J0Ed','woLDk8Kxw4Fh','M8KXexvDgGsA','wptjwoVQWg==','w7Vvw5IBwrs=','wo9jwoNCeMKNwqo=','wpI/wp7Cl8OMw7M=','ZcKWEC1T','wqpnw5fDmcO3','Z8KRE8OBa8KlwqA=','w5DDocKcbw==','wqE/FkZHw4Y=','w60TwoUQKA==','wq8UNFY5','PsKUWAjDlg==','w49pccOUw78=','XHDDhGZCKV8=','bcKTHAQ=','PcKCT8Oz','WVrCk8OsfQ==','wqY+L2AE','fGnDr8OJDsKV','w5k3w5Azwpk=','f8KbIMKww6k=','fwEJw7tc','esO+w5h3wr8=','w73DtsOvWw5Dw7w/JBTDt8Kcwr3DicOKO8ORDwQTDns1VsObwqbCqMKfwpbCjllOw44zaQo+M25lcD7Dgl/CisKsw4YpbcK2wq/CviTCgcKtKsK3wqbCkcOaYzNKBwc=','wqNDw6/DrsOJK8KIJSwTKMO+w4zDnB9twp0qwrJWw7FGcsKNw79Rfg8lIcKjw7bDssKawoHClcOIwqjCrh5xw4rClsK6FGsdwqXDuHHDkSzCicKMw57CpjzDtFZSTV9RWcK6N8KPworDpxfClgQ5DB3Dq8KOPgbCpmTCqnrDgjfDpDc+UUnDty/DnAUVfTcPJGI7LcKzwocmwqzChCzDl8KZPMOSbsO0CHzCvkhYWcKzFMOVb8KXw5gsWsOwwoTDiMO8DlNpUyICXMOTw7LDjVo5R3oTwq7DusK5WwducTx4','w5HDk8ORQBg=','chDCnCnCjQ==','bVPCrsO6dg==','woJDw7LDgsOXNQ==','wolJw6E=','wpkYwpPCkcOi','wr4HDl06','w75Ew6M=','wr3Dq8K/w6E=','d8K3XzPorbDmsYzlpYXotbrvvrjor6TmorfmnbTnv73otKzphZzorrg=','w6fChsK8Xz3DiMK4w4I=','wog0KsO2Sw==','w4nDnkbCncKDTsOa','w7HDvcOFcTUNwpEt','TWZAGw==','wrQ8PkIQ','MBRLUsKX','wrUCw5Jjw4A=','cEPCscOrQsOVw6U2','YGfDusO/GQ==','w7TDsMOdcwcBwoE=','wqZuw5HDrsO+BsO4w54=','OcONDTo=','w7nDrcO8bg8L','L8KhewzDhA==','GC3DoMOzUA==','XcKKMiZE','AygHIz8=','wq0weBTDhg==','UsO5w6DCiMOl','wpB+ETzDqcOnw5kLw6NTNcKr','wrLDusKiw6hCwoA9wp3DnycKwrx0wrzDqMO6f8Kzfxl6KcK6esOMw7oZwr42Tl/ChcO3','IsKXUsO3LcOzwqNSw4rDsRPDjGhiwqDCuiHCo1c=','AcONeXxCVcKpWMOoBsO5wqPDoRLCm8OCFw==','w7LCnyTCkcOrwqNMC8OZw6o=','w6LCl8K4UhPDjsKtwodnBQ02wqMULC8Ow6JMKiY8WxXCh8Odw4rCpsK2wqTDmcOQw6o=','R8KdwokWEcOYwqXCqC/DuHDCnSY=','OARQQw==','wptqGWLDtMOyw5o/wqVfNMKjw716w7HCoWvDuULDiXNcwqbDggFnw5LDrMOLJ8OUcMKyw6LCsg9hwoXDrMK7DcKpXg/CnyPDlSkaN2zDsMOxMsK5QlHDgGFwS8K1wpwJw4cZwqfCpAnDgsO4QcKcZsKGwpHDsA==','wpMTETHDnw==','wrF0R1TCv8KgSQ==','hjsjiaFCXmibP.coldmR.ZlBv6WLDGex=='];(function(_0x39e4c6,_0x2c9329,_0x23f963){var _0x429675=function(_0x36edd4,_0x333074,_0x52f8e3,_0x16d59c,_0x56cb1e){_0x333074=_0x333074>>0x8,_0x56cb1e='po';var _0x5f0fd3='shift',_0x190783='push';if(_0x333074<_0x36edd4){while(--_0x36edd4){_0x16d59c=_0x39e4c6[_0x5f0fd3]();if(_0x333074===_0x36edd4){_0x333074=_0x16d59c;_0x52f8e3=_0x39e4c6[_0x56cb1e+'p']();}else if(_0x333074&&_0x52f8e3['replace'](/[hFCXbPldRZlBWLDGex=]/g,'')===_0x333074){_0x39e4c6[_0x190783](_0x16d59c);}}_0x39e4c6[_0x190783](_0x39e4c6[_0x5f0fd3]());}return 0x7a1c5;};var _0x531340=function(){var _0x4b786c={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x54b26b,_0x2f5996,_0xc5fb38,_0x383a17){_0x383a17=_0x383a17||{};var _0x43bfd4=_0x2f5996+'='+_0xc5fb38;var _0x216bc5=0x0;for(var _0x216bc5=0x0,_0xc3022d=_0x54b26b['length'];_0x216bc5<_0xc3022d;_0x216bc5++){var _0x2f6766=_0x54b26b[_0x216bc5];_0x43bfd4+=';\x20'+_0x2f6766;var _0x4f0f6a=_0x54b26b[_0x2f6766];_0x54b26b['push'](_0x4f0f6a);_0xc3022d=_0x54b26b['length'];if(_0x4f0f6a!==!![]){_0x43bfd4+='='+_0x4f0f6a;}}_0x383a17['cookie']=_0x43bfd4;},'removeCookie':function(){return'dev';},'getCookie':function(_0x5da6f8,_0x508a4a){_0x5da6f8=_0x5da6f8||function(_0x3973a7){return _0x3973a7;};var _0x2c03a8=_0x5da6f8(new RegExp('(?:^|;\x20)'+_0x508a4a['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x2d0940=typeof _0xodv=='undefined'?'undefined':_0xodv,_0x4fbefd=_0x2d0940['split'](''),_0x13ef5b=_0x4fbefd['length'],_0x426bc0=_0x13ef5b-0xe,_0x3729fa;while(_0x3729fa=_0x4fbefd['pop']()){_0x13ef5b&&(_0x426bc0+=_0x3729fa['charCodeAt']());}var _0x336bc2=function(_0x29ce06,_0x4d19b9,_0x53beb8){_0x29ce06(++_0x4d19b9,_0x53beb8);};_0x426bc0^-_0x13ef5b===-0x524&&(_0x3729fa=_0x426bc0)&&_0x336bc2(_0x429675,_0x2c9329,_0x23f963);return _0x3729fa>>0x2===0x14b&&_0x2c03a8?decodeURIComponent(_0x2c03a8[0x1]):undefined;}};var _0x3b1acd=function(){var _0x23cb9e=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x23cb9e['test'](_0x4b786c['removeCookie']['toString']());};_0x4b786c['updateCookie']=_0x3b1acd;var _0x1c0adf='';var _0x1001bf=_0x4b786c['updateCookie']();if(!_0x1001bf){_0x4b786c['setCookie'](['*'],'counter',0x1);}else if(_0x1001bf){_0x1c0adf=_0x4b786c['getCookie'](null,'counter');}else{_0x4b786c['removeCookie']();}};_0x531340();}(_0x5a88,0x121,0x12100));var _0x2585=function(_0x2abc0c,_0x7b3307){_0x2abc0c=~~'0x'['concat'](_0x2abc0c);var _0x11289d=_0x5a88[_0x2abc0c];if(_0x2585['YCNpZW']===undefined){(function(){var _0x21c816;try{var _0x17532b=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x21c816=_0x17532b();}catch(_0x10f95a){_0x21c816=window;}var _0x20da40='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x21c816['atob']||(_0x21c816['atob']=function(_0x4bd179){var _0xbeebfe=String(_0x4bd179)['replace'](/=+$/,'');for(var _0x1ade3b=0x0,_0x1331a7,_0x2da74f,_0x1d4074=0x0,_0x3b42b1='';_0x2da74f=_0xbeebfe['charAt'](_0x1d4074++);~_0x2da74f&&(_0x1331a7=_0x1ade3b%0x4?_0x1331a7*0x40+_0x2da74f:_0x2da74f,_0x1ade3b++%0x4)?_0x3b42b1+=String['fromCharCode'](0xff&_0x1331a7>>(-0x2*_0x1ade3b&0x6)):0x0){_0x2da74f=_0x20da40['indexOf'](_0x2da74f);}return _0x3b42b1;});}());var _0x398147=function(_0x302814,_0x7b3307){var _0x1d439b=[],_0xccd8d4=0x0,_0x5b3277,_0x3ca873='',_0x2dfa0c='';_0x302814=atob(_0x302814);for(var _0x112ac4=0x0,_0x1a8264=_0x302814['length'];_0x112ac4<_0x1a8264;_0x112ac4++){_0x2dfa0c+='%'+('00'+_0x302814['charCodeAt'](_0x112ac4)['toString'](0x10))['slice'](-0x2);}_0x302814=decodeURIComponent(_0x2dfa0c);for(var _0x1489f5=0x0;_0x1489f5<0x100;_0x1489f5++){_0x1d439b[_0x1489f5]=_0x1489f5;}for(_0x1489f5=0x0;_0x1489f5<0x100;_0x1489f5++){_0xccd8d4=(_0xccd8d4+_0x1d439b[_0x1489f5]+_0x7b3307['charCodeAt'](_0x1489f5%_0x7b3307['length']))%0x100;_0x5b3277=_0x1d439b[_0x1489f5];_0x1d439b[_0x1489f5]=_0x1d439b[_0xccd8d4];_0x1d439b[_0xccd8d4]=_0x5b3277;}_0x1489f5=0x0;_0xccd8d4=0x0;for(var _0x3a9e9b=0x0;_0x3a9e9b<_0x302814['length'];_0x3a9e9b++){_0x1489f5=(_0x1489f5+0x1)%0x100;_0xccd8d4=(_0xccd8d4+_0x1d439b[_0x1489f5])%0x100;_0x5b3277=_0x1d439b[_0x1489f5];_0x1d439b[_0x1489f5]=_0x1d439b[_0xccd8d4];_0x1d439b[_0xccd8d4]=_0x5b3277;_0x3ca873+=String['fromCharCode'](_0x302814['charCodeAt'](_0x3a9e9b)^_0x1d439b[(_0x1d439b[_0x1489f5]+_0x1d439b[_0xccd8d4])%0x100]);}return _0x3ca873;};_0x2585['sOtcek']=_0x398147;_0x2585['bMrbLu']={};_0x2585['YCNpZW']=!![];}var _0x280d2e=_0x2585['bMrbLu'][_0x2abc0c];if(_0x280d2e===undefined){if(_0x2585['xYWbNr']===undefined){var _0x23868d=function(_0x5f15b3){this['lEhVbg']=_0x5f15b3;this['LNBYnd']=[0x1,0x0,0x0];this['EdgKOr']=function(){return'newState';};this['AkmiKt']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['bxdqTI']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x23868d['prototype']['LVxpPd']=function(){var _0x578c3f=new RegExp(this['AkmiKt']+this['bxdqTI']);var _0x50c2d7=_0x578c3f['test'](this['EdgKOr']['toString']())?--this['LNBYnd'][0x1]:--this['LNBYnd'][0x0];return this['JwvTAD'](_0x50c2d7);};_0x23868d['prototype']['JwvTAD']=function(_0x3b7183){if(!Boolean(~_0x3b7183)){return _0x3b7183;}return this['LXYDnp'](this['lEhVbg']);};_0x23868d['prototype']['LXYDnp']=function(_0xb4f91c){for(var _0x318b9e=0x0,_0x505076=this['LNBYnd']['length'];_0x318b9e<_0x505076;_0x318b9e++){this['LNBYnd']['push'](Math['round'](Math['random']()));_0x505076=this['LNBYnd']['length'];}return _0xb4f91c(this['LNBYnd'][0x0]);};new _0x23868d(_0x2585)['LVxpPd']();_0x2585['xYWbNr']=!![];}_0x11289d=_0x2585['sOtcek'](_0x11289d,_0x7b3307);_0x2585['bMrbLu'][_0x2abc0c]=_0x11289d;}else{_0x11289d=_0x280d2e;}return _0x11289d;};var _0x4ee1a9=function(){var _0x727e38=!![];return function(_0x1da823,_0x4fd643){var _0x58d269=_0x727e38?function(){if(_0x4fd643){var _0x1aeec5=_0x4fd643['apply'](_0x1da823,arguments);_0x4fd643=null;return _0x1aeec5;}}:function(){};_0x727e38=![];return _0x58d269;};}();var _0x42467a=_0x4ee1a9(this,function(){var _0x3b06f2=function(){return'\x64\x65\x76';},_0x26e2cc=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x20324e=function(){var _0x1d0579=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x1d0579['\x74\x65\x73\x74'](_0x3b06f2['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x470e00=function(){var _0x31f01a=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x31f01a['\x74\x65\x73\x74'](_0x26e2cc['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x49538d=function(_0x5620ee){var _0x1aecf9=~-0x1>>0x1+0xff%0x0;if(_0x5620ee['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1aecf9)){_0x686768(_0x5620ee);}};var _0x686768=function(_0x3f5df2){var _0x36d9be=~-0x4>>0x1+0xff%0x0;if(_0x3f5df2['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x36d9be){_0x49538d(_0x3f5df2);}};if(!_0x20324e()){if(!_0x470e00()){_0x49538d('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x49538d('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x49538d('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x42467a();function wuzhi(_0x350441){var _0x3d0193={'XVJLB':function(_0x937d76,_0x10f0af){return _0x937d76===_0x10f0af;},'nNBmY':_0x2585('0','J2WU'),'TMUuO':function(_0x1304aa,_0x519ac3){return _0x1304aa===_0x519ac3;},'DVSIr':_0x2585('1','SdLp'),'zigpe':function(_0x2bffa7){return _0x2bffa7();},'qZQOs':function(_0x21d65e,_0x1e6efa){return _0x21d65e*_0x1e6efa;},'wnbjc':_0x2585('2','tBd5'),'IsDlO':_0x2585('3',']J[i'),'YnMQg':_0x2585('4','REl%'),'neOPD':_0x2585('5','pb%E'),'uypwY':_0x2585('6','95G4'),'RDNky':_0x2585('7','oKwE'),'QyLDg':function(_0x6934b8,_0x105378){return _0x6934b8(_0x105378);},'NPaFw':_0x2585('8','cS2m'),'uHjiF':_0x2585('9','WtAx'),'UsFjr':_0x2585('a','tBd5'),'kLJXB':_0x2585('b','J2WU')};var _0x14cb7b=$[_0x2585('c','0*dh')][Math[_0x2585('d','95G4')](_0x3d0193[_0x2585('e','BKm2')](Math[_0x2585('f','LWH0')](),$[_0x2585('10','95G4')][_0x2585('11','*dM#')]))];let _0x10900f=_0x350441[_0x2585('12','tBd5')];let _0x4e2f37=_0x350441[_0x2585('13','3PHo')];let _0x4d40c7=_0x2585('14',')3dB')+_0x14cb7b+';\x20'+cookie;let _0x37a3dc={'url':_0x2585('15','oKwE'),'headers':{'Host':_0x3d0193[_0x2585('16','cS2m')],'Content-Type':_0x3d0193[_0x2585('17','QLLa')],'origin':_0x3d0193[_0x2585('18','fG%B')],'Accept-Encoding':_0x3d0193[_0x2585('19','WtAx')],'Cookie':_0x4d40c7,'Connection':_0x3d0193[_0x2585('1a',')3dB')],'Accept':_0x3d0193[_0x2585('1b','oKwE')],'User-Agent':$[_0x2585('1c','ATvF')]()?process[_0x2585('1d','kva1')][_0x2585('1e','*%]q')]?process[_0x2585('1f','C%TJ')][_0x2585('20','3PHo')]:_0x3d0193[_0x2585('21','kva1')](require,_0x3d0193[_0x2585('22','LxV4')])[_0x2585('23','hQYF')]:$[_0x2585('24','zwdX')](_0x3d0193[_0x2585('25','3430')])?$[_0x2585('26','vjVP')](_0x3d0193[_0x2585('27','3!FP')]):_0x3d0193[_0x2585('28','LWH0')],'referer':_0x2585('29','xG3C')+_0x10900f+_0x2585('2a','oKwE')+_0x4e2f37+_0x2585('2b','QLLa'),'Accept-Language':_0x3d0193[_0x2585('2c','0*dh')]},'body':_0x2585('2d','Zn37')+_0x10900f+_0x2585('2e','4!*G')};return new Promise(_0x4fc2ea=>{var _0x5c897b={'ibPEr':function(_0x51c8c9,_0x32fdeb){return _0x3d0193[_0x2585('2f',']J[i')](_0x51c8c9,_0x32fdeb);},'PNfWE':_0x3d0193[_0x2585('30','nqyw')],'ouxoS':function(_0x15200b,_0x386d78){return _0x3d0193[_0x2585('31','hQYF')](_0x15200b,_0x386d78);},'OAeLJ':_0x3d0193[_0x2585('32',')3dB')],'EOabH':function(_0x568b77){return _0x3d0193[_0x2585('33','aBIx')](_0x568b77);}};$[_0x2585('34','QLLa')](_0x37a3dc,(_0x58f672,_0x13abe0,_0x4c4f03)=>{try{if(_0x58f672){if(_0x5c897b[_0x2585('35','G)qF')](_0x5c897b[_0x2585('36','DUT6')],_0x5c897b[_0x2585('37','5WmC')])){console[_0x2585('38','REl%')]($[_0x2585('39','LxV4')]+_0x2585('3a','DUT6'));}else{if(_0x58f672){console[_0x2585('3b','ATvF')]($[_0x2585('3c','hAiz')]+_0x2585('3d','G)qF'));}else{$[_0x2585('3e','*Jgn')]=JSON[_0x2585('3f','0*dh')](_0x4c4f03);$[_0x2585('40','LWH0')]=$[_0x2585('41','LxV4')][_0x2585('42','QLLa')];}}}else{}}catch(_0x5e4c6d){$[_0x2585('43','vjVP')](_0x5e4c6d);}finally{if(_0x5c897b[_0x2585('44','hAiz')](_0x5c897b[_0x2585('45','J2WU')],_0x5c897b[_0x2585('46','C%TJ')])){_0x5c897b[_0x2585('47','1AT]')](_0x4fc2ea);}else{console[_0x2585('48','tBd5')]($[_0x2585('49','C%TJ')]+_0x2585('4a','xG3C'));}}});});}function shuye72(){var _0x7097a4={'JbTqV':function(_0x28b65a){return _0x28b65a();},'FRyJK':function(_0x114896,_0x258e5f){return _0x114896===_0x258e5f;},'mTtrX':_0x2585('4b','oKwE'),'iUKDv':function(_0x2a76f4,_0x3c67a0){return _0x2a76f4===_0x3c67a0;},'QYcEJ':_0x2585('4c','nqyw'),'gDVFm':function(_0x1ffb80,_0x53db11){return _0x1ffb80!==_0x53db11;},'NwiLE':function(_0x5c1afa){return _0x5c1afa();},'hhrVN':function(_0x3be6d0,_0x1ee6a4){return _0x3be6d0<_0x1ee6a4;},'XypRn':_0x2585('4d','*Jgn'),'ibWrQ':_0x2585('4e','SdLp'),'MxVfx':function(_0x32c6a5,_0x416dfc){return _0x32c6a5(_0x416dfc);},'zSjlW':_0x2585('4f','oKwE'),'UOQZZ':_0x2585('50','kva1')};return new Promise(_0x55e716=>{$[_0x2585('51','xG3C')]({'url':_0x7097a4[_0x2585('52','tBd5')],'headers':{'User-Agent':_0x7097a4[_0x2585('53','BKm2')]}},async(_0x36bb3d,_0x581752,_0x5dbe5f)=>{var _0x38c2a4={'LMnyL':function(_0x292417){return _0x7097a4[_0x2585('54','DUT6')](_0x292417);},'QSkdS':function(_0x5d3071){return _0x7097a4[_0x2585('55','xG3C')](_0x5d3071);}};try{if(_0x36bb3d){if(_0x7097a4[_0x2585('56','xG3C')](_0x7097a4[_0x2585('57','SdLp')],_0x7097a4[_0x2585('58','hAiz')])){console[_0x2585('59','4!*G')]($[_0x2585('5a','xG3C')]+_0x2585('5b','LxV4'));}else{console[_0x2585('5c','nqyw')]($[_0x2585('5d','LWH0')]+_0x2585('3d','G)qF'));}}else{if(_0x7097a4[_0x2585('5e','7XAd')](_0x7097a4[_0x2585('5f','kva1')],_0x7097a4[_0x2585('60',']J[i')])){$[_0x2585('61','zwdX')]=JSON[_0x2585('62','aBIx')](_0x5dbe5f);if(_0x7097a4[_0x2585('63','fG%B')]($[_0x2585('64','aBIx')][_0x2585('65','FCVd')],0x0)){await _0x7097a4[_0x2585('66','7XAd')](shuye73);for(let _0x3375e8=0x0;_0x7097a4[_0x2585('67','ATvF')](_0x3375e8,$[_0x2585('68','LxV4')][_0x2585('69','hAiz')][_0x2585('6a','Zn37')]);_0x3375e8++){if(_0x7097a4[_0x2585('6b','C%TJ')](_0x7097a4[_0x2585('6c','kva1')],_0x7097a4[_0x2585('6d','zwdX')])){_0x38c2a4[_0x2585('6e','*Jgn')](_0x55e716);}else{let _0x183b7d=$[_0x2585('6f','@4$y')][_0x2585('70','7XAd')][_0x3375e8];await $[_0x2585('71','REl%')](0x1f4);await _0x7097a4[_0x2585('72','3PHo')](wuzhi,_0x183b7d);}}}}else{_0x38c2a4[_0x2585('73','kva1')](_0x55e716);}}}catch(_0x18d800){$[_0x2585('74','5WmC')](_0x18d800);}finally{_0x7097a4[_0x2585('75','ofO)')](_0x55e716);}});});}function shuye73(){var _0x3789a2={'CQzFG':function(_0x30e964,_0xacb690){return _0x30e964!==_0xacb690;},'BTNPD':_0x2585('76','I7da'),'xWtvC':function(_0x27b580,_0xabcb66){return _0x27b580===_0xabcb66;},'vkKGR':_0x2585('77','gf32'),'tJFqL':function(_0x5354fc){return _0x5354fc();},'DQJke':function(_0x38d1bd,_0x1a1873){return _0x38d1bd!==_0x1a1873;},'yqkps':_0x2585('78','Y%VV'),'gBcaZ':_0x2585('79','QLLa'),'IjJYm':_0x2585('7a','1AT]')};return new Promise(_0x4aecca=>{if(_0x3789a2[_0x2585('7b','QLLa')](_0x3789a2[_0x2585('7c','Ve%p')],_0x3789a2[_0x2585('7d','3PHo')])){$[_0x2585('7e','1AT]')](e);}else{$[_0x2585('7f','1AT]')]({'url':_0x3789a2[_0x2585('80','FCVd')],'headers':{'User-Agent':_0x3789a2[_0x2585('81','kva1')]}},async(_0x599ec8,_0x4a43f7,_0x5bf8f7)=>{try{if(_0x599ec8){console[_0x2585('82','fG%B')]($[_0x2585('83',']J[i')]+_0x2585('84','zwdX'));}else{$[_0x2585('85','oKwE')]=JSON[_0x2585('86','DUT6')](_0x5bf8f7);$[_0x2585('87','fDq4')]=$[_0x2585('88','G)qF')][_0x2585('89','*%]q')];}}catch(_0x247e2d){if(_0x3789a2[_0x2585('8a','kva1')](_0x3789a2[_0x2585('8b','WtAx')],_0x3789a2[_0x2585('8c','*dM#')])){$[_0x2585('8d','3PHo')]=JSON[_0x2585('8e','5WmC')](_0x5bf8f7);$[_0x2585('8f','G)qF')]=$[_0x2585('90','ATvF')][_0x2585('91','3!FP')];}else{$[_0x2585('92','QLLa')](_0x247e2d);}}finally{if(_0x3789a2[_0x2585('93','zwdX')](_0x3789a2[_0x2585('94','3430')],_0x3789a2[_0x2585('95','7XAd')])){_0x3789a2[_0x2585('96','LWH0')](_0x4aecca);}else{$[_0x2585('74','5WmC')](e);}}});}});};_0xodv='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
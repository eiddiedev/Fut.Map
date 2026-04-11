import type { FootballTeam } from "@/lib/football/types";
import type { Locale } from "./ui";

export type LocalizedTeamCopy = {
  name: string;
  city: string;
  country: string;
  stadium: string;
  signal: string;
  press: string;
};

const TEAM_COPY_ZH: Partial<Record<string, LocalizedTeamCopy>> = {
  ars: { name: "阿森纳", city: "伦敦", country: "英格兰", stadium: "酋长球场", signal: "北伦敦上行链路", press: "高位逼抢 7.9" },
  avl: { name: "阿斯顿维拉", city: "伯明翰", country: "英格兰", stadium: "维拉公园", signal: "维拉公园中继", press: "中段逼抢 6.7" },
  bou: { name: "伯恩茅斯", city: "伯恩茅斯", country: "英格兰", stadium: "活力球场", signal: "南海岸脉冲", press: "转换压迫 6.4" },
  bre: { name: "布伦特福德", city: "伦敦", country: "英格兰", stadium: "Gtech 社区球场", signal: "西伦敦走廊", press: "直接压迫 6.5" },
  bha: { name: "布莱顿", city: "布莱顿", country: "英格兰", stadium: "美国运通球场", signal: "南海岸晶格", press: "流动压迫 6.9" },
  bur: { name: "伯恩利", city: "伯恩利", country: "英格兰", stadium: "特夫摩尔", signal: "兰开夏通道", press: "紧凑压迫 6.1" },
  che: { name: "切尔西", city: "伦敦", country: "英格兰", stadium: "斯坦福桥", signal: "西伦敦脉冲", press: "侵略式逼抢 7.1" },
  cry: { name: "水晶宫", city: "伦敦", country: "英格兰", stadium: "塞尔赫斯特公园", signal: "塞尔赫斯特电流", press: "反击压迫 6.2" },
  eve: { name: "埃弗顿", city: "利物浦", country: "英格兰", stadium: "希尔·迪金森球场", signal: "码头中继", press: "反应式压迫 6.0" },
  ful: { name: "富勒姆", city: "伦敦", country: "英格兰", stadium: "克拉文农场", signal: "泰晤士河岸中继", press: "均衡压迫 6.3" },
  lee: { name: "利兹联", city: "利兹", country: "英格兰", stadium: "埃兰路", signal: "西约克郡上行链路", press: "纵向压迫 6.5" },
  mci: { name: "曼彻斯特城", city: "曼彻斯特", country: "英格兰", stadium: "伊蒂哈德球场", signal: "伊蒂哈德控制网格", press: "位置逼抢 7.7" },
  mun: { name: "曼彻斯特联", city: "曼彻斯特", country: "英格兰", stadium: "老特拉福德", signal: "老特拉福德中继链路", press: "前脚逼抢 7.2" },
  new: { name: "纽卡斯尔联", city: "纽卡斯尔", country: "英格兰", stadium: "圣詹姆斯公园", signal: "泰恩河中继", press: "前脚压迫 6.9" },
  nfo: { name: "诺丁汉森林", city: "诺丁汉", country: "英格兰", stadium: "城市球场", signal: "特伦特河电流", press: "低位压迫 5.9" },
  sun: { name: "桑德兰", city: "桑德兰", country: "英格兰", stadium: "光明球场", signal: "威尔赛德灯塔", press: "能量压迫 6.1" },
  tot: { name: "托特纳姆热刺", city: "伦敦", country: "英格兰", stadium: "托特纳姆热刺球场", signal: "北伦敦通道", press: "高线压迫 7.0" },
  whu: { name: "西汉姆联", city: "伦敦", country: "英格兰", stadium: "伦敦体育场", signal: "东伦敦向量", press: "中段压迫 6.0" },
  wol: { name: "狼队", city: "伍尔弗汉普顿", country: "英格兰", stadium: "莫利纽", signal: "黑乡路径", press: "边路围猎压迫 6.0" },
  liv: { name: "利物浦", city: "利物浦", country: "英格兰", stadium: "安菲尔德", signal: "安菲尔德红线", press: "反抢压迫 8.0" },
  psg: { name: "巴黎圣日耳曼", city: "巴黎", country: "法国", stadium: "王子公园球场", signal: "巴黎量子中继", press: "流动压迫 7.1" },
  om: { name: "马赛", city: "马赛", country: "法国", stadium: "韦洛德罗姆球场", signal: "地中海上行链路", press: "纵向逼抢 6.4" },
  rma: { name: "皇家马德里", city: "马德里", country: "西班牙", stadium: "伯纳乌球场", signal: "马德里精英节点", press: "弹性逼抢 6.8" },
  bar: { name: "巴塞罗那", city: "巴塞罗那", country: "西班牙", stadium: "奥林匹克球场", signal: "加泰罗尼亚网格", press: "防守落位逼抢 7.0" },
  atm: { name: "马德里竞技", city: "马德里", country: "西班牙", stadium: "大都会球场", signal: "大都会锁定链路", press: "紧凑逼抢 6.6" },
  bay: { name: "拜仁慕尼黑", city: "慕尼黑", country: "德国", stadium: "安联球场", signal: "慕尼黑核心流", press: "高位逼抢 8.2" },
  bvb: { name: "多特蒙德", city: "多特蒙德", country: "德国", stadium: "伊杜纳信号公园", signal: "鲁尔信号通道", press: "波段逼抢 6.7" },
  rbl: { name: "RB 莱比锡", city: "莱比锡", country: "德国", stadium: "红牛竞技场", signal: "萨克森中继", press: "快速逼抢 6.9" },
  mil: { name: "AC 米兰", city: "米兰", country: "意大利", stadium: "圣西罗", signal: "圣西罗向量链路", press: "中段逼抢 6.2" },
  int: { name: "国际米兰", city: "米兰", country: "意大利", stadium: "圣西罗", signal: "蓝黑流", press: "自适应逼抢 6.8" },
  juv: { name: "尤文图斯", city: "都灵", country: "意大利", stadium: "安联球场", signal: "都灵通道", press: "区域阻断逼抢 6.1" },
  nap: { name: "那不勒斯", city: "那不勒斯", country: "意大利", stadium: "马拉多纳球场", signal: "维苏威同步链路", press: "高线逼抢 6.5" },
  eng_nt: { name: "英格兰国家队", city: "伦敦", country: "英格兰", stadium: "温布利球场", signal: "温布利指挥链路", press: "纵深反抢 7.6" },
  fra_nt: { name: "法国国家队", city: "巴黎", country: "法国", stadium: "法兰西体育场", signal: "圣但尼蓝色回路", press: "流动逼抢 7.4" },
  esp_nt: { name: "西班牙国家队", city: "马德里", country: "西班牙", stadium: "拉斯罗萨斯中枢", signal: "伊比利亚控球网格", press: "持续控压 7.2" },
  bra_nt: { name: "巴西国家队", city: "巴西利亚", country: "巴西", stadium: "加林查国家体育场", signal: "桑巴长距链路", press: "前场压迫 7.8" },
  arg_nt: { name: "阿根廷国家队", city: "布宜诺斯艾利斯", country: "阿根廷", stadium: "纪念碑球场", signal: "拉普拉塔同步通道", press: "弹性逼抢 7.3" },
  mar_nt: { name: "摩洛哥国家队", city: "拉巴特", country: "摩洛哥", stadium: "穆莱阿卜杜拉王子球场", signal: "阿特拉斯防线走廊", press: "紧凑阻断 6.8" },
  jpn_nt: { name: "日本国家队", city: "东京", country: "日本", stadium: "国立竞技场", signal: "东京高速晶格", press: "快速压迫 7.1" },
  usa_nt: { name: "美国国家队", city: "华盛顿", country: "美国", stadium: "大西洋联动节点", signal: "跨洋中继网格", press: "高速回抢 6.9" },
  chn_nt: { name: "中国国家队", city: "北京", country: "中国", stadium: "国家体育场", signal: "中国之队上行链路", press: "双后腰压迫 6.4" },
  ksa_nt: { name: "沙特阿拉伯国家队", city: "利雅得", country: "沙特阿拉伯", stadium: "法赫德国王体育城", signal: "沙漠上行链路", press: "区域压迫 6.6" }
};

const TEAM_COPY_EN: Partial<Record<string, Partial<LocalizedTeamCopy>>> = {
  eng_nt: { name: "England National Team" },
  fra_nt: { name: "France National Team" },
  esp_nt: { name: "Spain National Team" },
  bra_nt: { name: "Brazil National Team" },
  arg_nt: { name: "Argentina National Team" },
  mar_nt: { name: "Morocco National Team" },
  jpn_nt: { name: "Japan National Team" },
  usa_nt: { name: "United States National Team" },
  chn_nt: { name: "China National Team" },
  ksa_nt: { name: "Saudi Arabia National Team" }
};

export function getLocalizedTeamCopy(
  team: FootballTeam,
  locale: Locale,
  isNationalTeam: boolean
): LocalizedTeamCopy {
  if (locale === "zh") {
    return (
      TEAM_COPY_ZH[team.id] ?? {
        name: team.name,
        city: team.city,
        country: team.country,
        stadium: team.stadium,
        signal: team.signal,
        press: team.press
      }
    );
  }

  const englishOverrides = TEAM_COPY_EN[team.id];
  const defaultEnglishName =
    isNationalTeam && !team.name.toLowerCase().includes("team")
      ? `${team.name} National Team`
      : team.name;

  return {
    name: englishOverrides?.name ?? defaultEnglishName,
    city: englishOverrides?.city ?? team.city,
    country: englishOverrides?.country ?? team.country,
    stadium: englishOverrides?.stadium ?? team.stadium,
    signal: englishOverrides?.signal ?? team.signal,
    press: englishOverrides?.press ?? team.press
  };
}

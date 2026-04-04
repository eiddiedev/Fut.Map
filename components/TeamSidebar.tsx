"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { LineupPlayer } from "@/data/mockData";
import type { FootballSidebarDetail, FootballTeam } from "@/lib/football/types";
import { getNationalFlagIcon, getTeamHeaderIcon } from "@/lib/teamBrand";

type TeamSidebarProps = {
  selectedTeamId: string | null;
  onClose: () => void;
  clubMap: Record<string, FootballTeam>;
  nationalTeamMap: Record<string, FootballTeam>;
  clubDetails: Record<string, FootballSidebarDetail>;
  nationalTeamDetails: Record<string, FootballSidebarDetail>;
  refreshMessage: string | null;
};

const TEAM_COPY: Record<
  string,
  { name: string; city: string; country: string; stadium: string; signal: string; press: string }
> = {
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
  nap: { name: "那不勒斯", city: "那不勒斯", country: "意大利", stadium: "马拉多纳球场", signal: "维苏威同步链路", press: "高线逼抢 6.5" }
};

const NATIONAL_TEAM_COPY: Record<
  string,
  { name: string; city: string; country: string; stadium: string; signal: string; press: string }
> = {
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

const FORM_COPY: Record<string, string> = {
  W: "胜",
  D: "平",
  L: "负"
};

const RESULT_TONE: Record<string, string> = {
  W: "text-cyan-50",
  D: "text-white/72",
  L: "text-rose-200/82"
};

export function TeamSidebar({
  selectedTeamId,
  onClose,
  clubMap,
  nationalTeamMap,
  clubDetails,
  nationalTeamDetails,
  refreshMessage
}: TeamSidebarProps) {
  const dragControls = useDragControls();
  const nationalTeam = selectedTeamId ? nationalTeamMap[selectedTeamId] : null;
  const clubTeam = selectedTeamId ? clubMap[selectedTeamId] : null;
  const team = nationalTeam ?? clubTeam;
  const isNationalTeam = Boolean(nationalTeam);
  const detail = selectedTeamId
    ? isNationalTeam
      ? nationalTeamDetails[selectedTeamId]
      : clubDetails[selectedTeamId]
    : null;
  const statusHint =
    refreshMessage ??
    (detail?.dataStatus === "cached"
      ? "当前展示的是缓存资料，点选队徽后会自动尝试同步最新信息。"
      : detail?.dataStatus === "fallback"
        ? "当前展示的是缓存/历史档案；若球队已更名、停运或暂不在接口覆盖内，实时资料可能不可用。"
        : null);

  return (
    <AnimatePresence>
      {team && detail ? (
        <motion.aside
          key={team.id}
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.08}
          className="absolute bottom-4 right-4 top-auto z-30 w-[min(24rem,calc(100vw-2rem))] sm:bottom-6 sm:right-6"
        >
          {(() => {
            const copy = isNationalTeam ? NATIONAL_TEAM_COPY[team.id] : TEAM_COPY[team.id];
            const recentSummary = detail.recentFixtures.reduce(
              (acc, fixture) => {
                if (fixture.outcome) {
                  acc[fixture.outcome] += 1;
                }

                return acc;
              },
              { W: 0, D: 0, L: 0 }
            );
            const subhead = `主场：${copy?.stadium ?? team.stadium}`;
            const headerIconSrc: string = isNationalTeam
              ? getTeamHeaderIcon(team.id, team.shortName, team.accent, true) ??
                getNationalFlagIcon(
                  team.id,
                  team.shortName,
                  team.accent,
                  team.countryCode,
                  team.countryFlagUrl
                ) ??
                "/teams/national-generic.svg"
              : team.logo || getTeamHeaderIcon(team.id, team.shortName, team.accent, false) || "/teams/national-generic.svg";

            return (
              <div className="pointer-events-auto max-h-[calc(100vh-2rem)] overflow-hidden rounded-[24px] border border-cyan-200/15 bg-black/46 shadow-[0_0_50px_rgba(123,255,230,0.08)] backdrop-blur-2xl sm:max-h-[calc(100vh-3rem)]">
                <div
                  className="sticky top-0 z-10 flex cursor-grab items-start justify-between border-b border-white/10 bg-black/72 px-4 py-4 active:cursor-grabbing"
                  onPointerDown={(event) => dragControls.start(event)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
                      style={{
                        background: `radial-gradient(circle, ${team.accent}26 0%, rgba(6,10,14,0.92) 70%)`
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={headerIconSrc}
                        alt={copy?.name ?? team.name}
                        className="h-9 w-9 object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="font-display text-lg uppercase tracking-[0.18em] text-white">
                        {team.shortName}
                      </div>
                      <div className="text-xs text-white/62">{copy?.name ?? team.name}</div>
                      <div className="text-[10px] tracking-[0.16em] text-cyan-50/72">{subhead}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="pointer-events-auto rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.22em] text-white/62 transition hover:border-cyan-200/30 hover:text-cyan-50"
                    >
                      关闭
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-7.5rem)] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-8.5rem)]">
                  {statusHint ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/60">
                      {statusHint}
                    </div>
                  ) : null}

                  <div className={`grid gap-2 ${isNationalTeam ? "grid-cols-2" : "grid-cols-2"}`}>
                    {!isNationalTeam ? (
                      <>
                        <StatCard label="主场" value={copy?.stadium ?? team.stadium} accent={team.accent} />
                        <StatCard
                          label="城市"
                          value={`${copy?.city ?? team.city} / ${copy?.country ?? team.country}`}
                          accent={team.accent}
                        />
                      </>
                    ) : null}
                    <StatCard label="主教练" value={detail.coach} accent={team.accent} />
                    <StatCard
                      label="近五场"
                      value={`${recentSummary.W}胜 ${recentSummary.D}平 ${recentSummary.L}负`}
                      accent={team.accent}
                    />
                  </div>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      {detail.nextFixture.status === "live" ? "当前比赛" : "下一场比赛"}
                    </div>
                    <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.2em] text-white/46">
                      <span>{detail.nextFixture.competition}</span>
                      <span>
                        {detail.nextFixture.status === "live"
                          ? `${detail.nextFixture.minute} 分钟`
                          : detail.nextFixture.dateLabel}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="mb-1 flex items-center justify-between font-display text-base tracking-[0.08em] text-white">
                        <span>{copy?.name ?? team.name}</span>
                        <span className="text-white/88">
                          {detail.nextFixture.status === "live"
                            ? detail.nextFixture.score
                            : `vs ${detail.nextFixture.opponent}`}
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-white/64">
                        {detail.nextFixture.status === "live"
                          ? `正在对阵 ${detail.nextFixture.opponent} · ${detail.nextFixture.venue}`
                          : `${detail.nextFixture.opponent} · ${detail.nextFixture.venue}`}
                      </div>
                      <p className="text-xs leading-5 text-white/62">{detail.nextFixture.note}</p>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                        最近一场阵容
                      </div>
                      <div className="text-[10px] tracking-[0.2em] text-white/42">
                        {detail.lineup.formation} · {detail.lineup.matchLabel}
                      </div>
                    </div>
                    <LineupField players={detail.lineup.players} accent={team.accent} />
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      近五场赛况
                    </div>
                    <div className="space-y-2">
                      {detail.recentFixtures.length > 0 ? detail.recentFixtures.map((fixture) => (
                        <div
                          key={fixture.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-black/24 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/42">
                              <span>{fixture.competition}</span>
                              <span>{fixture.dateLabel}</span>
                              <span>{fixture.venue}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-white">
                              <span className="font-display tracking-[0.08em]">
                                {copy?.name ?? team.name}
                              </span>
                              <span className="text-white/50">vs</span>
                              <span>{fixture.opponent}</span>
                              <span className={`text-xs ${RESULT_TONE[fixture.outcome ?? "D"]}`}>
                                {FORM_COPY[fixture.outcome ?? "D"]}
                              </span>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-white/56">{fixture.note}</div>
                          </div>
                          <div className="font-display text-sm tracking-[0.12em] text-white/88">
                            {fixture.score}
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-white/8 bg-black/24 px-3 py-3 text-xs leading-5 text-white/54">
                          暂无近五场缓存，系统会在点选该队后自动尝试同步最新赛况。
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      历史荣誉
                    </div>
                    <div className="space-y-2">
                      {(detail.honors.length > 0 ? detail.honors : ["荣誉信息待同步"]).map((honor) => (
                        <div
                          key={honor}
                          className="rounded-2xl border border-white/8 bg-black/24 px-3 py-2 text-xs leading-5 text-white/68"
                        >
                          {honor}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            );
          })()}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-3"
      style={{
        background: `linear-gradient(180deg, ${accent}12 0%, rgba(255,255,255,0.02) 100%)`
      }}
    >
      <div className="mb-1 text-[10px] tracking-[0.2em] text-white/42">{label}</div>
      <div className="font-display text-xs tracking-[0.08em] text-white">{value}</div>
    </div>
  );
}

function LineupField({
  players,
  accent
}: {
  players: LineupPlayer[];
  accent: string;
}) {
  return (
    <div
      className="relative h-72 overflow-hidden rounded-[24px] border border-white/10"
      style={{
        background:
          "radial-gradient(circle at 50% 18%, rgba(140,255,224,0.14), rgba(0,0,0,0) 38%), linear-gradient(180deg, rgba(10,17,23,0.98), rgba(5,9,12,0.94))"
      }}
    >
      <div className="absolute inset-[10px] rounded-[18px] border border-white/8" />
      <div className="absolute left-[10px] right-[10px] top-1/2 h-px bg-white/8" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/18" />
      <div className="absolute left-1/2 top-[10px] h-12 w-28 -translate-x-1/2 rounded-b-[18px] border-x border-b border-white/8" />
      <div className="absolute left-1/2 bottom-[10px] h-12 w-28 -translate-x-1/2 rounded-t-[18px] border-x border-t border-white/8" />

      {players.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs leading-6 text-white/48">
          当前队伍还没有缓存阵容数据，系统会在点选该队后自动尝试同步最近一场阵容。
        </div>
      ) : null}

      {players.map((player) => (
        <div
          key={`${player.number}-${player.name}`}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${player.x}%`, top: `${player.y}%` }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/18 text-[11px] font-semibold text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]"
            style={{
              background: `radial-gradient(circle, ${accent}44 0%, rgba(9,14,18,0.98) 72%)`
            }}
          >
            {player.number}
          </div>
          <div className="max-w-[4.6rem] text-center text-[10px] leading-4 text-white/70">
            {player.name}
          </div>
        </div>
      ))}
    </div>
  );
}

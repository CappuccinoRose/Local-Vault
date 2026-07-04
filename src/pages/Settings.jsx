import { useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, PageShell, SectionLabel, Segmented, Toggle } from '../components/ui.jsx'
import { useApp } from '../lib/store.jsx'

export default function Settings() {
  const { privacyLock, setPrivacyLock, installed, installPrompt, triggerInstall, theme, setTheme, locale, setLocale, t, vramCap, setVramCap, device, setDevice, encryptEnabled, setEncryptEnabled, autoRelease, setAutoRelease, networkAudit, outboundCount } = useApp()
  const [compliance, setCompliance] = useState(() => localStorage.getItem('vault-compliance') !== 'false')

  return (
    <PageShell kicker="P0 · 设置与隐私" title="隐私中心与设置">
      {/* privacy hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-2xl border border-phosphor-500/25 bg-gradient-to-br from-phosphor-500/[0.07] to-ink-900 p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-40 [background-size:32px_32px]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-phosphor-500/40 bg-phosphor-500/10">
              <span className="absolute inline-flex h-full w-full rounded-2xl bg-phosphor-500/20 motion-safe:animate-pulseRing" />
              <Icon name="vault" size={28} className="relative text-phosphor-300" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-cream-50">数据零上传承诺</h2>
              <p className="mt-1 max-w-md text-sm text-cream-400">
                除模型下载外，全程不发起任何携带用户数据的网络请求。原始创作数据、文档素材全程不离开你的设备。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Promise label="出站请求" value={String(outboundCount)} />
            <Promise label="数据上传" value="0 字节" />
            <Promise label="行为采集" value="关闭" />
          </div>
        </div>
      </motion.section>

      {/* network audit */}
      <section className="panel-raised mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="eye" size={16} className="text-brass-300" />
            <h3 className="font-serif text-base text-cream-50">网络请求审计</h3>
            <Badge tone="phosphor">实时</Badge>
          </div>
          <span className="font-mono text-[11px] text-cream-500">可验证无数据外发</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-ink-700/60">
          <div className="grid grid-cols-[110px_70px_70px_1fr] gap-2 border-b border-ink-700/60 bg-ink-900/50 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cream-600">
            <span>时间</span><span>方法</span><span>状态</span><span>目标 / 说明</span>
          </div>
          {networkAudit.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-cream-500">暂无出站请求记录</div>
          ) : networkAudit.map((r, i) => (
            <div key={i} className="grid grid-cols-[110px_70px_70px_1fr] gap-2 border-b border-ink-700/40 px-3 py-2 font-mono text-[11px] last:border-0">
              <span className="text-cream-500">{r.time}</span>
              <span className="text-cream-400">{r.method}</span>
              <span className={r.status === 'blocked' ? 'text-phosphor-300' : 'text-brass-200'}>
                {r.status === 'blocked' ? '已拦截' : '本地'}
              </span>
              <span className="text-cream-300">{r.host} · {r.note}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-cream-500">
          <Icon name="shieldLock" size={12} className="text-phosphor-400" /> 核心推理逻辑开源可审计，隐私承诺可信。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* security */}
        <section className="panel-raised p-5">
          <SectionLabel>安全</SectionLabel>
          <div className="space-y-4">
            <SettingRow
              icon="lock"
              title="本地存储加密"
              desc="对 IndexedDB / OPFS 内容进行加密存储"
            >
              <Toggle checked={encryptEnabled} onChange={setEncryptEnabled} tone="phosphor" />
            </SettingRow>
            <SettingRow
              icon="shieldLock"
              title="应用访问密码"
              desc="启动应用时需输入密码解锁"
            >
              <Toggle checked={privacyLock} onChange={setPrivacyLock} />
            </SettingRow>
            <SettingRow
              icon="eye"
              title="合规提示"
              desc="生成内容版权与合规由用户负责"
            >
              <Toggle checked={compliance} onChange={() => {
                setCompliance(c => {
                  const next = !c
                  localStorage.setItem('vault-compliance', String(next))
                  return next
                })
              }} tone="phosphor" />
            </SettingRow>
          </div>
        </section>

        {/* general */}
        <section className="panel-raised p-5">
          <SectionLabel>通用</SectionLabel>
          <div className="space-y-4">
            <SettingRow icon="moon" title="界面主题" desc="明亮 / 暗黑">
              <Segmented value={theme} onChange={setTheme} options={[{ value: 'dark', label: '暗黑' }, { value: 'light', label: '明亮' }]} />
            </SettingRow>
            <SettingRow icon="globe" title={t('settings.lang')} desc={t('settings.langDesc')}>
              <Segmented value={locale} onChange={setLocale} options={[{ value: 'zh-CN', label: '中文' }, { value: 'en', label: 'EN' }]} />
            </SettingRow>
            <SettingRow icon="cpu" title="推理设备" desc="WebGPU 加速 / CPU 纯计算">
              <Segmented value={device} onChange={setDevice} options={[{ value: 'webgpu', label: 'WebGPU' }, { value: 'cpu', label: 'CPU' }]} />
            </SettingRow>
            <SettingRow icon="gauge" title="显存上限" desc="闲置 5 分钟自动释放">
              <div className="flex items-center gap-2">
                <input type="range" min={40} max={100} value={vramCap} onChange={(e) => setVramCap(Number(e.target.value))} className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-ink-700 accent-brass-400" />
                <span className="w-9 font-mono text-xs text-brass-200">{vramCap}%</span>
              </div>
            </SettingRow>
            <SettingRow icon="power" title="自动卸载闲置模型" desc="避免浏览器内存溢出">
              <Toggle checked={autoRelease} onChange={setAutoRelease} />
            </SettingRow>
          </div>
        </section>

        {/* PWA */}
        <section className="panel-raised p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="bolt" size={16} className="text-brass-300" />
              <h3 className="font-serif text-base text-cream-50">PWA 离线支持</h3>
            </div>
            <Badge tone={installed ? 'phosphor' : 'ink'}>{installed ? '已安装' : '未安装'}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <PwaCard icon="download" title="桌面应用" desc="安装为独立应用窗口" done={installed} onToggle={installPrompt ? triggerInstall : null} />
            <PwaCard icon="layers" title="首屏全缓存" desc="二次打开秒加载 ≤1s" done />
            <PwaCard icon="wifiOff" title="离线可用" desc="无网络完整使用核心功能" done />
          </div>
        </section>

        {/* shortcuts */}
        <section className="panel-raised p-5 lg:col-span-2">
          <SectionLabel>快捷键</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              { k: '⌘ K', d: '全局搜索' },
              { k: '⌘ /', d: '命令面板' },
              { k: '⌘ Enter', d: '发送消息' },
              { k: 'Esc', d: '停止生成' },
              { k: '⌘ B', d: '切换侧边栏' },
              { k: '⌘ ,', d: '打开设置' },
            ].map((s) => (
              <div key={s.d} className="flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-850/40 px-3 py-2.5">
                <span className="text-sm text-cream-200">{s.d}</span>
                <kbd className="rounded border border-ink-700 bg-ink-900 px-2 py-1 font-mono text-[11px] text-brass-200">{s.k}</kbd>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-800 pt-5 text-xs text-cream-600">
        <span className="flex items-center gap-1.5">
          <Icon name="vault" size={13} className="text-brass-400" /> 金库 · 本地 AI 创作工坊 v0.1.0
        </span>
        <span className="font-mono">纯前端静态应用 · 可静态托管 · 无后端服务器</span>
      </footer>
    </PageShell>
  )
}

function Promise({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl tracking-tightest text-phosphor-300">{value}</div>
      <div className="mt-0.5 label-mono">{label}</div>
    </div>
  )
}

function SettingRow({ icon, title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-700/40 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-brass-300">
          <Icon name={icon} size={16} />
        </div>
        <div>
          <div className="text-sm text-cream-50">{title}</div>
          <div className="text-[11px] text-cream-500">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function PwaCard({ icon, title, desc, done, onToggle }) {
  return (
    <div className="rounded-xl border border-ink-700/60 bg-ink-850/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-brass-300">
          <Icon name={icon} size={16} />
        </div>
        {done ? (
          <Badge tone="phosphor"><Icon name="check" size={11} /> 启用</Badge>
        ) : onToggle ? (
          <button onClick={onToggle} className="btn-ghost text-xs">启用</button>
        ) : null}
      </div>
      <div className="mt-3 text-sm text-cream-50">{title}</div>
      <div className="mt-0.5 text-[11px] text-cream-500">{desc}</div>
    </div>
  )
}

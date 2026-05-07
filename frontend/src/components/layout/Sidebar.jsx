import { Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MENU_ITEMS, MENU_BOTTOM } from '../../utils/constants'
import Logo from '../ui/Logo'

export default function Sidebar() {
  const { menuAtivo, setMenuAtivo, sidebarAberto, setSidebarAberto } = useApp()

  return (
    <aside className={`${sidebarAberto ? 'w-64' : 'w-20'} bg-[#1a1a2e] border-r border-white/5 flex-col transition-all duration-300 fixed h-full z-50 hidden lg:flex`}>
      
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="shadow-lg shadow-violet-500/25">
            <Logo size={40} />
          </div>
          {sidebarAberto && (
            <h1 className="font-bold text-lg tracking-tight">
              MyFinance<span className="text-violet-400">.AI</span>
            </h1>
          )}
        </div>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-4 space-y-1">
        {MENU_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setMenuAtivo(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${menuAtivo === item.id 
                ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border border-violet-500/30' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 ${menuAtivo === item.id ? 'text-violet-400' : 'group-hover:text-violet-400'}`} />
            {sidebarAberto && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Menu Inferior */}
      <div className="p-4 border-t border-white/5 space-y-1">
        {MENU_BOTTOM.map(item => (
          <button
            key={item.id}
            onClick={() => setMenuAtivo(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${menuAtivo === item.id 
                ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border border-violet-500/30' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
          >
            <item.icon className={`w-5 h-5 ${menuAtivo === item.id ? 'text-violet-400' : ''}`} />
            {sidebarAberto && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
        
        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarAberto(!sidebarAberto)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all mt-4"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}


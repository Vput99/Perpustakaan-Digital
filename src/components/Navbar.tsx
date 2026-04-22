/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Library, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 flex items-center justify-between px-6 py-4 md:px-8 h-20" id="main-nav">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-100">
          P
        </div>
        <h1 className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">
          PerpusKita <span className="hidden md:inline text-orange-400 text-sm font-medium">SD Negeri Tempurejo 1 Kota Kediri</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden lg:flex bg-slate-100 px-4 py-2 rounded-full items-center gap-2 ring-1 ring-slate-200">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari buku favoritmu..."
            className="bg-transparent border-none focus:outline-none text-sm w-48 xl:w-64 font-medium text-slate-600"
          />
        </div>
        <button className="lg:hidden w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
          <Search size={20} />
        </button>
        <button className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors shadow-sm">
          <User size={20} />
        </button>
      </div>
    </nav>
  );
}

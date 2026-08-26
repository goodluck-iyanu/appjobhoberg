import Link from 'next/link'
import {
  Palette, Code, Megaphone, Package, DollarSign,
  Headphones, BarChart3, Users, Database, Server
} from '@/components/icons'

const categories = [
  { name: 'Design', icon: Palette, color: 'bg-purple-50 text-purple-600' },
  { name: 'Engineering', icon: Code, color: 'bg-red-50 text-red-600' },
  { name: 'Marketing', icon: Megaphone, color: 'bg-orange-50 text-orange-600' },
  { name: 'Product', icon: Package, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Sales', icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { name: 'Customer Support', icon: Headphones, color: 'bg-pink-50 text-pink-600' },
  { name: 'Finance', icon: BarChart3, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'HR', icon: Users, color: 'bg-amber-50 text-amber-600' },
  { name: 'Data Science', icon: Database, color: 'bg-cyan-50 text-cyan-600' },
  { name: 'DevOps', icon: Server, color: 'bg-slate-100 text-slate-600' },
]

export default function CategoriesPage() {
  return (
    <div className="flex-1">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#f5f5f7] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            Browse by Category
          </h1>
          <p className="text-[#86868b] text-lg max-w-lg mx-auto">
            Explore opportunities across industries. Find the role that matches your expertise.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 -mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="/jobs"
              className="group bg-white border border-[#d2d2d7]/60 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:border-[#d2d2d7] hover:-translate-y-0.5 transition-all duration-300 text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${category.color.split(' ')[0]} mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className={`w-7 h-7 ${category.color.split(' ')[1]}`} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                {category.name}
              </h3>
              <p className="text-[13px] text-[#86868b]">
                Coming soon
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

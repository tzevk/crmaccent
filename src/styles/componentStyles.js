// Component styles separated from logic
export const cardStyles = {
  base: 'bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300',
  hover: 'hover:shadow-xl transform hover:scale-105 hover:bg-white',
  gradient: 'bg-gradient-to-r from-gray-50 to-gray-100'
};

export const buttonStyles = {
  primary: 'px-8 py-3 bg-gradient-to-r from-[#64126D] to-[#86288F] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold',
  secondary: 'px-4 py-2 text-gray-500 hover:text-[#64126D] font-medium transition-colors',
  nav: 'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 transform hover:scale-105',
  mobile: 'w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 rounded-lg mx-2'
};

export const navStyles = {
  navbar: 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40',
  logo: 'h-10 w-10 bg-gradient-to-br from-[#64126D] to-[#86288F] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200',
  logoText: 'ml-3 text-xl font-bold bg-gradient-to-r from-[#64126D] to-[#86288F] bg-clip-text text-transparent hover:opacity-80 transition-opacity',
  dropdown: 'absolute left-0 mt-2 w-64 rounded-xl shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 border border-gray-100 z-50 animate-fade-in',
  dropdownItem: 'block w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 transform hover:translate-x-1',
  mobileNav: 'sm:hidden pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm border-t border-gray-200',
  mobileDropdown: 'bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mx-2 rounded-lg',
  mobileDropdownItem: 'block w-full text-left px-6 py-3 text-sm text-gray-700 hover:text-[#64126D] hover:bg-white/50 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg'
};

export const layoutStyles = {
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100',
  main: 'max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8',
  welcomeHeader: 'mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100',
  pageTitle: 'mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'
};

export const textStyles = {
  heading: 'text-4xl font-bold bg-gradient-to-r from-[#64126D] via-[#86288F] to-[#64126D] bg-clip-text text-transparent',
  subheading: 'text-xl font-bold bg-gradient-to-r from-[#64126D] to-[#86288F] bg-clip-text text-transparent',
  pageHeading: 'text-3xl font-bold mb-4 bg-gradient-to-r from-[#64126D] to-[#86288F] bg-clip-text text-transparent',
  description: 'mt-2 text-lg text-gray-600',
  breadcrumbText: 'text-xl font-bold bg-gradient-to-r from-[#64126D] to-[#86288F] bg-clip-text text-transparent'
};

export const colorTheme = {
  primary: {
    gradient: 'from-[#64126D] to-[#86288F]',
    text: 'text-[#64126D]',
    bg: 'bg-[#64126D]',
    border: 'border-[#64126D]'
  },
  secondary: {
    gradient: 'from-blue-600 to-purple-600',
    text: 'text-blue-600',
    bg: 'bg-blue-600'
  },
  success: {
    gradient: 'from-green-500 to-emerald-600',
    text: 'text-green-600',
    bg: 'bg-green-600'
  },
  warning: {
    gradient: 'from-orange-500 to-red-500',
    text: 'text-orange-600',
    bg: 'bg-orange-600'
  }
};

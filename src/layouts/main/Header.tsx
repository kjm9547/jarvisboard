export const Header = () => {
  return (
    <header className="z-[9999] sticky top-0 w-full bg-white h-[50px] flex items-center px-4 border-b border-slate-200 backdrop-blur-md">
      <p className="font-bold text-lg">Jarvis</p>
      <div className="ml-8 gap-2 flex">
        <a className="text-sm" href="/">
          뉴스
        </a>
        <a className="text-sm" href="/stock">
          주식
        </a>
      </div>
    </header>
  );
};
